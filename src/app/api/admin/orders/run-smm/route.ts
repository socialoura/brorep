import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { placeOrder, getOrderStatus, getServices } from "@/lib/bulkfollows";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

interface SmmEntry {
  service: string;
  qty: number;
  bulkfollows_order_id?: number;
  charge?: number;
  error?: string;
  link?: string;
}

interface PostAssignment {
  postId?: string;
  postUrl?: string;
  likes?: boolean;
  views?: boolean;
}

function buildProfileLink(platform: string, username: string): string {
  if (platform === "youtube") return `https://www.youtube.com/@${username}`;
  if (platform === "x") return `https://x.com/${username}`;
  if (platform === "twitch") return `https://www.twitch.tv/${username}`;
  if (platform === "instagram") return `https://www.instagram.com/${username}`;
  return `https://www.tiktok.com/@${username}`;
}

async function refreshRatesIfNeeded(): Promise<void> {
  try { await sql`ALTER TABLE smm_config ADD COLUMN IF NOT EXISTS rate_per_1000 NUMERIC DEFAULT 0`; } catch {}

  const missing = await sql`SELECT COUNT(*) as cnt FROM smm_config WHERE enabled = true AND bulkfollows_service_id > 0 AND (rate_per_1000 IS NULL OR rate_per_1000 = 0)`;
  if (Number(missing[0]?.cnt || 0) === 0) return;

  try {
    const services = (await getServices()) as { service?: number | string; rate?: string | number }[];
    for (const s of services) {
      const sid = Number(s.service);
      const rate = parseFloat(String(s.rate ?? 0));
      if (sid > 0 && Number.isFinite(rate)) {
        await sql`UPDATE smm_config SET rate_per_1000 = ${rate} WHERE bulkfollows_service_id = ${sid}`;
      }
    }
  } catch (e) {
    console.error("Failed to refresh BulkFollows rates:", e);
  }
}

async function computeTotalCostCents(platform: string, smmOrders: SmmEntry[]): Promise<number> {
  let totalCents = 0;
  for (const entry of smmOrders) {
    if (entry.charge && entry.charge > 0) {
      totalCents += Math.round(entry.charge * 100);
      continue;
    }
    const cfg = await sql`SELECT rate_per_1000 FROM smm_config WHERE platform = ${platform} AND service = ${entry.service}`;
    const rate = Number(cfg[0]?.rate_per_1000 || 0);
    if (rate > 0 && entry.qty > 0) {
      totalCents += Math.round((rate * entry.qty) / 1000 * 100);
    }
  }
  return totalCents;
}

// POST: Run SMM orders for all cart items of an order that don't already have SMM entries
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BULKFOLLOWS_API_KEY) {
    return NextResponse.json({ error: "BULKFOLLOWS_API_KEY not set" }, { status: 500 });
  }

  const { orderId } = await req.json();
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const rows = await sql`SELECT id, platform, username, cart, smm_orders, post_assignments, cost_cents FROM orders WHERE id = ${Number(orderId)}`;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  const order = rows[0];
  const cart: { service: string; qty: number }[] = Array.isArray(order.cart) ? order.cart : [];
  const existingSmm: SmmEntry[] = Array.isArray(order.smm_orders) ? [...order.smm_orders] : [];
  const postAssignments: PostAssignment[] = Array.isArray(order.post_assignments) ? order.post_assignments : [];

  if (cart.length === 0) {
    return NextResponse.json({ error: "Panier vide" }, { status: 400 });
  }

  // Load SMM config
  const smmConfig = await sql`SELECT * FROM smm_config WHERE enabled = true`;
  const configMap: Record<string, number> = {};
  for (const c of smmConfig) {
    configMap[`${c.platform}:${c.service}`] = Number(c.bulkfollows_service_id);
  }

  const plat = order.platform || "tiktok";
  const profileLink = buildProfileLink(plat, order.username || "");

  // Build post URL maps
  const postUrlsMap: Record<string, string[]> = {};
  for (const pa of postAssignments) {
    if (pa.postUrl) {
      if (pa.likes) {
        if (!postUrlsMap["likes"]) postUrlsMap["likes"] = [];
        postUrlsMap["likes"].push(pa.postUrl);
        if (!postUrlsMap["x_likes"]) postUrlsMap["x_likes"] = [];
        postUrlsMap["x_likes"].push(pa.postUrl);
      }
      if (pa.views) {
        if (!postUrlsMap["views"]) postUrlsMap["views"] = [];
        postUrlsMap["views"].push(pa.postUrl);
        if (!postUrlsMap["x_retweets"]) postUrlsMap["x_retweets"] = [];
        postUrlsMap["x_retweets"].push(pa.postUrl);
      }
    }
  }

  await refreshRatesIfNeeded();

  const smmResults: SmmEntry[] = [...existingSmm];
  let placed = 0;
  let errors = 0;

  for (const item of cart) {
    // Skip services handled manually
    if (item.service === "tw_live_viewers") continue;

    // Skip if already has a successful SMM entry
    const alreadyDone = existingSmm.some((s) => s.service === item.service && s.qty === item.qty && s.bulkfollows_order_id);
    if (alreadyDone) continue;

    // Remove any previous failed entry for this service+qty so we can replace it
    const failedIdx = smmResults.findIndex((s) => s.service === item.service && s.qty === item.qty && !s.bulkfollows_order_id);
    if (failedIdx !== -1) smmResults.splice(failedIdx, 1);

    const svcId = configMap[`${plat}:${item.service}`];
    if (!svcId) {
      smmResults.push({ service: item.service, qty: item.qty, error: `Pas de mapping pour ${plat}:${item.service}` });
      errors++;
      continue;
    }

    const needsPostUrl = ["likes", "views", "yt_likes", "yt_views", "x_likes", "x_retweets"].includes(item.service);

    let links: { url: string; qty: number }[] = [];

    if (needsPostUrl) {
      if (plat === "youtube" && postAssignments.length > 0) {
        const ytUrls = postAssignments.filter((pa) => pa.postUrl).map((pa) => pa.postUrl!);
        if (ytUrls.length > 0) {
          const perPost = Math.floor(item.qty / ytUrls.length);
          const remainder = item.qty % ytUrls.length;
          links = ytUrls.map((url, i) => ({ url, qty: perPost + (i === 0 ? remainder : 0) }));
        }
      } else if (postUrlsMap[item.service] && postUrlsMap[item.service].length > 0) {
        const urls = postUrlsMap[item.service];
        const perPost = Math.floor(item.qty / urls.length);
        const remainder = item.qty % urls.length;
        links = urls.map((url, i) => ({ url, qty: perPost + (i === 0 ? remainder : 0) }));
      }
    }

    if (links.length === 0) {
      links = [{ url: profileLink, qty: item.qty }];
    }

    for (const { url: link, qty } of links) {
      try {
        const result = await placeOrder(svcId, link, qty);
        let charge: number | undefined;
        if (result.order) {
          try {
            await new Promise((r) => setTimeout(r, 1000));
            const status = await getOrderStatus(result.order);
            if (status.charge) charge = parseFloat(status.charge);
          } catch { /* ignore */ }
          smmResults.push({ service: item.service, qty, bulkfollows_order_id: result.order, ...(charge !== undefined ? { charge } : {}), link });
          placed++;
        } else {
          smmResults.push({ service: item.service, qty, error: result.error || "Pas d'order ID retourné", link });
          errors++;
        }
      } catch (err) {
        smmResults.push({ service: item.service, qty, error: String(err), link });
        errors++;
      }
    }
  }

  // Compute total cost and update
  const totalCostCents = await computeTotalCostCents(plat, smmResults);
  await sql`UPDATE orders SET smm_orders = ${JSON.stringify(smmResults)}::jsonb, cost_cents = ${totalCostCents} WHERE id = ${order.id}`;

  return NextResponse.json({ success: true, placed, errors, cost_cents: totalCostCents });
}
