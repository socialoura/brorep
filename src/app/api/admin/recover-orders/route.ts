import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createOrder, getOrderByPaymentIntent, addLoyaltyPoints, sql } from "@/lib/db";
import { sendDiscordOrderNotification } from "@/lib/discord";
import { placeOrder as placeSmmOrder, getOrderStatus as getSmmStatus } from "@/lib/bulkfollows";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

interface RecoveredOrder {
  paymentIntentId: string;
  amount: number;
  email: string;
  orderId?: number;
  status: "recovered" | "skipped" | "failed";
  reason?: string;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const hoursBack = Number(body.hoursBack) || 48;
  const dryRun = body.dryRun === true;
  const placeSmm = body.placeSmm === true;

  const since = Math.floor(Date.now() / 1000) - hoursBack * 3600;
  const recovered: RecoveredOrder[] = [];

  try {
    let hasMore = true;
    let startingAfter: string | undefined = undefined;
    const maxIterations = 10;
    let iteration = 0;

    while (hasMore && iteration < maxIterations) {
      iteration++;
      const list: Stripe.ApiList<Stripe.PaymentIntent> = await stripe.paymentIntents.list({
        limit: 100,
        created: { gte: since },
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });

      for (const pi of list.data) {
        if (pi.status !== "succeeded") {
          continue;
        }

        const existing = await getOrderByPaymentIntent(pi.id).catch(() => null);
        if (existing) {
          recovered.push({
            paymentIntentId: pi.id,
            amount: pi.amount,
            email: pi.receipt_email || pi.metadata.email || "",
            orderId: existing.id,
            status: "skipped",
            reason: "already in DB",
          });
          continue;
        }

        const meta = pi.metadata || {};
        const username = meta.username || "";
        const platform = meta.platform || "";
        const email = meta.email || pi.receipt_email || "";

        if (!meta.cart) {
          recovered.push({
            paymentIntentId: pi.id,
            amount: pi.amount,
            email,
            status: "failed",
            reason: "no cart in metadata (probably not a Fanovaly order)",
          });
          continue;
        }

        const piCurrency = meta.currency || (pi.currency === "usd" ? "usd" : "eur");
        const country = meta.country || "";
        const lang = (["fr", "es", "pt", "de"].includes(meta.lang)) ? meta.lang as "fr" | "es" | "pt" | "de" : "en" as const;
        const variant = (meta.variant === "A" || meta.variant === "B") ? meta.variant : null;

        let cart: { service: string; label: string; qty: number; price: number; priceUsd?: number; liveStartAt?: string }[] = [];
        try {
          const rawCart = JSON.parse(meta.cart);
          cart = rawCart.map((c: { s?: string; l?: string; q?: number; p?: number; pu?: number; ls?: string; service?: string; label?: string; qty?: number; price?: number; priceUsd?: number; liveStartAt?: string }) =>
            c.service ? c : { service: c.s, label: c.l, qty: c.q, price: c.p, priceUsd: c.pu || c.p, ...(c.ls ? { liveStartAt: c.ls } : {}) }
          );
        } catch {
          recovered.push({ paymentIntentId: pi.id, amount: pi.amount, email, status: "failed", reason: "cart JSON parse error" });
          continue;
        }

        function buildPostUrl(plat: string, user: string, postId: string): string {
          if (plat === "tiktok") return `https://www.tiktok.com/@${user}/video/${postId}`;
          if (plat === "instagram") return `https://www.instagram.com/p/${postId}/`;
          if (plat === "youtube") return `https://www.youtube.com/watch?v=${postId}`;
          return "";
        }

        const rawPostsJson = meta.postAssignments ? JSON.parse(meta.postAssignments) : null;
        let rawPosts: { id?: string; l?: number; v?: number; postId?: string; likes?: boolean; views?: boolean }[] | null = null;
        if (rawPostsJson) {
          if (Array.isArray(rawPostsJson)) {
            rawPosts = rawPostsJson;
          } else if (rawPostsJson.s && Array.isArray(rawPostsJson.p)) {
            rawPosts = rawPostsJson.p.map((p: { id: string; l: number; v: number }) => ({ id: `${p.id}${rawPostsJson.s}`, l: p.l, v: p.v }));
          }
        }
        const postAssignments = rawPosts ? rawPosts.map((pa) =>
          pa.postId ? pa : { postId: pa.id, postUrl: buildPostUrl(platform, username, pa.id || ""), imageUrl: "", likes: !!pa.l, views: !!pa.v }
        ) : null;

        if (dryRun) {
          recovered.push({
            paymentIntentId: pi.id,
            amount: pi.amount,
            email,
            status: "recovered",
            reason: "dry run — would have been created",
          });
          continue;
        }

        let orderId: number | null = null;
        try {
          orderId = await createOrder({
            stripePaymentIntentId: pi.id,
            email,
            username,
            platform,
            cart,
            postAssignments,
            totalCents: pi.amount,
            status: "paid",
            followersBefore: Number(meta.followersBefore) || 0,
            currency: piCurrency,
            country: country || undefined,
            lang,
            variant: variant || undefined,
          });
        } catch (dbErr) {
          recovered.push({
            paymentIntentId: pi.id,
            amount: pi.amount,
            email,
            status: "failed",
            reason: `DB error: ${String(dbErr)}`,
          });
          continue;
        }

        // Discord notification (in case it failed before)
        try {
          await sendDiscordOrderNotification({
            username,
            platform: platform || "tiktok",
            email: email || "",
            cart,
            totalCents: pi.amount,
            currency: piCurrency,
          });
        } catch {}

        // Loyalty points
        if (email) {
          try {
            const pts = Math.floor(pi.amount / 10);
            if (pts > 0) await addLoyaltyPoints(email, pts);
          } catch {}
        }

        // Optionally place SMM orders for recovered orders
        if (placeSmm && orderId && process.env.BULKFOLLOWS_API_KEY) {
          try {
            const smmConfig = await sql`SELECT * FROM smm_config WHERE enabled = true`;
            const configMap: Record<string, number> = {};
            for (const c of smmConfig) {
              configMap[`${c.platform}:${c.service}`] = Number(c.bulkfollows_service_id);
            }

            const plat = platform || "tiktok";
            const profileLink = plat === "youtube"
              ? `https://www.youtube.com/@${username}`
              : plat === "x"
                ? `https://x.com/${username}`
                : plat === "twitch"
                  ? `https://www.twitch.tv/${username}`
                  : plat === "instagram"
                    ? `https://www.instagram.com/${username}`
                    : `https://www.tiktok.com/@${username}`;

            const postUrlsMap: Record<string, string[]> = {};
            if (Array.isArray(postAssignments)) {
              for (const pa of postAssignments as { postId: string; postUrl?: string; likes?: boolean; views?: boolean }[]) {
                if (pa.postUrl) {
                  if (pa.likes) {
                    if (!postUrlsMap["likes"]) postUrlsMap["likes"] = [];
                    postUrlsMap["likes"].push(pa.postUrl);
                  }
                  if (pa.views) {
                    if (!postUrlsMap["views"]) postUrlsMap["views"] = [];
                    postUrlsMap["views"].push(pa.postUrl);
                  }
                }
              }
            }

            const smmResults: { service: string; qty: number; bulkfollows_order_id?: number; charge?: number; error?: string; link?: string }[] = [];
            let totalCostUsd = 0;

            for (const item of cart) {
              if (item.service === "tw_live_viewers") continue;
              const svcId = configMap[`${plat}:${item.service}`];
              if (!svcId) continue;

              const needsPostUrl = ["likes", "views", "yt_likes", "yt_views", "x_likes", "x_retweets"].includes(item.service);
              let links: { url: string; qty: number }[] = [];

              if (needsPostUrl) {
                if (plat === "youtube" && Array.isArray(postAssignments) && postAssignments.length > 0) {
                  const ytUrls = (postAssignments as { postUrl?: string }[]).filter((pa) => pa.postUrl).map((pa) => pa.postUrl!);
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
                  const result = await placeSmmOrder(svcId, link, qty);
                  let charge: number | undefined;
                  if (result.order) {
                    try {
                      await new Promise((r) => setTimeout(r, 1000));
                      const status = await getSmmStatus(result.order);
                      if (status.charge) {
                        charge = parseFloat(status.charge);
                        totalCostUsd += charge;
                      }
                    } catch {}
                  }
                  smmResults.push({ service: item.service, qty, bulkfollows_order_id: result.order, charge, error: result.error, link });
                } catch (smmErr) {
                  smmResults.push({ service: item.service, qty, error: String(smmErr), link });
                }
              }
            }

            if (smmResults.length > 0) {
              const costCents = Math.round(totalCostUsd * 100);
              await sql`UPDATE orders SET smm_orders = ${JSON.stringify(smmResults)}::jsonb, cost_cents = ${costCents} WHERE id = ${orderId}`;
            }
          } catch (smmErr) {
            console.error("SMM auto-order error during recovery:", smmErr);
          }
        }

        recovered.push({
          paymentIntentId: pi.id,
          amount: pi.amount,
          email,
          orderId: orderId || undefined,
          status: "recovered",
        });
      }

      hasMore = list.has_more;
      if (hasMore && list.data.length > 0) {
        startingAfter = list.data[list.data.length - 1].id;
      }
    }

    const summary = {
      recoveredCount: recovered.filter((r) => r.status === "recovered").length,
      skippedCount: recovered.filter((r) => r.status === "skipped").length,
      failedCount: recovered.filter((r) => r.status === "failed").length,
      totalScanned: recovered.length,
      hoursBack,
      dryRun,
      placeSmm,
      details: recovered,
    };

    return NextResponse.json(summary);
  } catch (err) {
    console.error("Recover orders error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
