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

// Refresh BulkFollows per-1000 rates in smm_config when any active mapping is missing one.
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

// Recompute total cost in cents (USD) for an order based on its sub-orders:
// - if a sub-order has an actual `charge`, use it
// - otherwise estimate from cached `rate_per_1000` × qty / 1000
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

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BULKFOLLOWS_API_KEY) {
    return NextResponse.json({ error: "BULKFOLLOWS_API_KEY not set" }, { status: 500 });
  }

  const { orderId, index } = await req.json();
  if (!orderId || index === undefined || index === null) {
    return NextResponse.json({ error: "Missing orderId or index" }, { status: 400 });
  }

  const rows = await sql`SELECT id, platform, username, smm_orders, post_assignments, cost_cents FROM orders WHERE id = ${Number(orderId)}`;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  const order = rows[0];
  const smmOrders: SmmEntry[] = Array.isArray(order.smm_orders) ? [...order.smm_orders] : [];
  if (index < 0 || index >= smmOrders.length) {
    return NextResponse.json({ error: "Invalid index" }, { status: 400 });
  }

  const entry = smmOrders[index];
  if (entry.bulkfollows_order_id) {
    return NextResponse.json({ error: "Cette sous-commande a déjà un ID BulkFollows" }, { status: 400 });
  }

  // Look up service ID from smm_config
  const cfg = await sql`SELECT bulkfollows_service_id FROM smm_config WHERE platform = ${order.platform} AND service = ${entry.service}`;
  if (cfg.length === 0 || !cfg[0].bulkfollows_service_id) {
    return NextResponse.json({ error: `Aucun mapping BulkFollows pour ${order.platform}:${entry.service}` }, { status: 400 });
  }
  const svcId = Number(cfg[0].bulkfollows_service_id);

  // Determine the link
  let link = entry.link;
  if (!link) {
    const needsPostUrl = ["likes", "views", "yt_likes", "yt_views", "x_likes", "x_retweets"].includes(entry.service);
    if (needsPostUrl) {
      // Use first matching post URL from post_assignments
      const pas: PostAssignment[] = Array.isArray(order.post_assignments) ? order.post_assignments : [];
      const wantsLikes = ["likes", "yt_likes", "x_likes"].includes(entry.service);
      const wantsViews = ["views", "yt_views", "x_retweets"].includes(entry.service);
      const match = pas.find((pa) => pa.postUrl && ((wantsLikes && pa.likes) || (wantsViews && pa.views)));
      link = match?.postUrl;
    }
    if (!link && order.username) {
      link = buildProfileLink(order.platform || "tiktok", order.username);
    }
  }

  if (!link) {
    return NextResponse.json({ error: "Impossible de déterminer le lien (pas de link, post_assignments ou username)" }, { status: 400 });
  }

  // Ensure we have BulkFollows rates cached so cost can be estimated even when a sub-order fails.
  await refreshRatesIfNeeded();

  // Place the BulkFollows order
  let placeError: string | null = null;
  try {
    const result = await placeOrder(svcId, link, entry.qty);

    if (result.order) {
      // Success: fetch charge
      let charge: number | undefined;
      try {
        await new Promise((r) => setTimeout(r, 1000));
        const status = await getOrderStatus(result.order);
        if (status.charge) charge = parseFloat(status.charge);
      } catch { /* ignore */ }

      smmOrders[index] = {
        service: entry.service,
        qty: entry.qty,
        bulkfollows_order_id: result.order,
        ...(charge !== undefined ? { charge } : {}),
        link,
      };
    } else {
      // BulkFollows didn't return an order id
      placeError = result.error || "BulkFollows n'a pas retourné d'order ID";
      smmOrders[index] = { ...entry, link, error: placeError };
    }
  } catch (err) {
    placeError = String(err);
    smmOrders[index] = { ...entry, link, error: placeError };
  }

  // Always recompute total cost from all sub-orders (uses charge when available,
  // falls back to cached BulkFollows rate × qty / 1000 otherwise).
  const totalCostCents = await computeTotalCostCents(order.platform || "", smmOrders);
  await sql`UPDATE orders SET smm_orders = ${JSON.stringify(smmOrders)}::jsonb, cost_cents = ${totalCostCents} WHERE id = ${order.id}`;

  if (placeError) {
    return NextResponse.json({ success: false, error: placeError, entry: smmOrders[index], cost_cents: totalCostCents });
  }
  return NextResponse.json({ success: true, entry: smmOrders[index], cost_cents: totalCostCents });
}
