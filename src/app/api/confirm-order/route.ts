import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createOrder, getOrderByPaymentIntent, addLoyaltyPoints, sql } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendDiscordOrderNotification } from "@/lib/discord";
import { placeOrder as placeSmmOrder, getOrderStatus as getSmmStatus } from "@/lib/bulkfollows";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
    }

    // Verify with Stripe that payment actually succeeded
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (pi.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 });
    }

    // Parse order data from metadata (compact format from Stripe 500-char limit)
    const meta = pi.metadata;
    const username = meta.username || "";
    const platform = meta.platform || "";
    const email = meta.email || pi.receipt_email;

    // Cart: compact {s,l,q,p} → full {service,label,qty,price}
    const piCurrency = meta.currency || (pi.currency === "usd" ? "usd" : "eur");
    const lang = (["en","es","pt","de"].includes(meta.lang)) ? meta.lang as "en"|"es"|"pt"|"de" : "fr" as const;

    const rawCart = meta.cart ? JSON.parse(meta.cart) : [];
    const cart = rawCart.map((c: { s?: string; l?: string; q?: number; p?: number; pu?: number; ls?: string; service?: string; label?: string; qty?: number; price?: number; priceUsd?: number; liveStartAt?: string }) =>
      c.service ? c : { service: c.s, label: c.l, qty: c.q, price: c.p, priceUsd: c.pu || c.p, ...(c.ls ? { liveStartAt: c.ls } : {}) }
    );

    // PostAssignments: compact {id,l,v} → full {postId,postUrl,imageUrl,likes,views}
    function buildPostUrl(plat: string, user: string, postId: string): string {
      if (plat === "tiktok") return `https://www.tiktok.com/@${user}/video/${postId}`;
      if (plat === "instagram") return `https://www.instagram.com/p/${postId}/`;
      return "";
    }
    const rawPosts = meta.postAssignments ? JSON.parse(meta.postAssignments) : null;
    const postAssignments = rawPosts ? rawPosts.map((pa: { id?: string; l?: number; v?: number; postId?: string; likes?: boolean; views?: boolean }) =>
      pa.postId ? pa : { postId: pa.id, postUrl: buildPostUrl(platform, username, pa.id || ""), imageUrl: "", likes: !!pa.l, views: !!pa.v }
    ) : null;

    // Check if order already exists (idempotency — prevent duplicates on retry)
    let orderId: number | null = null;
    try {
      const existing = await getOrderByPaymentIntent(pi.id);
      if (existing) {
        // Order already created for this payment — return it
        return NextResponse.json({ success: true, orderId: existing.id });
      }
    } catch {}

    // Create order in DB now that payment is confirmed
    try {
      orderId = await createOrder({
        stripePaymentIntentId: pi.id,
        email: email || "",
        username,
        platform,
        cart,
        postAssignments,
        totalCents: pi.amount,
        status: "paid",
        followersBefore: Number(meta.followersBefore) || 0,
        currency: piCurrency,
      });
    } catch (dbErr) {
      console.error("DB order creation error:", dbErr);
    }

    // Send confirmation email
    if (email) {
      try {
        await sendOrderConfirmationEmail({
          to: email,
          username,
          platform: platform || "tiktok",
          cart,
          totalCents: pi.amount,
          orderId: orderId || undefined,
          lang,
        });
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
      }
    }

    // Send Discord notification
    try {
      await sendDiscordOrderNotification({
        username,
        platform: platform || "tiktok",
        email: email || "",
        cart,
        totalCents: pi.amount,
        currency: piCurrency,
      });
    } catch (discordErr) {
      console.error("Failed to send Discord notification:", discordErr);
    }

    // Credit loyalty points (1€ = 10 pts, so cents / 10)
    if (email) {
      try {
        const pts = Math.floor(pi.amount / 10);
        if (pts > 0) await addLoyaltyPoints(email, pts);
      } catch (loyaltyErr) {
        console.error("Failed to credit loyalty points:", loyaltyErr);
      }
    }

    // Auto-place BulkFollows SMM orders
    if (orderId) {
      try {
        const globalToggle = await sql`SELECT value FROM smm_settings WHERE key = 'auto_order_enabled'`;
        const autoEnabled = globalToggle[0]?.value === "true";

        if (autoEnabled && process.env.BULKFOLLOWS_API_KEY) {
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

          // Build post URL map for likes/views: service -> array of post URLs
          const postUrlsMap: Record<string, string[]> = {};
          if (Array.isArray(postAssignments)) {
            for (const pa of postAssignments as { postId: string; postUrl?: string; likes?: boolean; views?: boolean }[]) {
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
          }

          const smmResults: { service: string; qty: number; bulkfollows_order_id?: number; charge?: number; error?: string; link?: string }[] = [];
          let totalCostUsd = 0;

          for (const item of cart as { service: string; qty: number }[]) {
            // Skip services that are handled manually (e.g., Twitch live viewers)
            if (item.service === "tw_live_viewers") continue;
            const svcId = configMap[`${plat}:${item.service}`];
            if (!svcId) continue;

            const needsPostUrl = ["likes", "views", "yt_likes", "yt_views", "x_likes", "x_retweets"].includes(item.service);

            // Collect all links to send orders to
            let links: { url: string; qty: number }[] = [];

            if (needsPostUrl) {
              // For YouTube, post assignments contain the video URL
              if (plat === "youtube" && Array.isArray(postAssignments) && postAssignments.length > 0) {
                const ytUrls = (postAssignments as { postUrl?: string }[])
                  .filter((pa) => pa.postUrl)
                  .map((pa) => pa.postUrl!);
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

            // Fallback: profile link with full qty (for followers/subscribers)
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
                  } catch { /* ignore status fetch error */ }
                }
                smmResults.push({
                  service: item.service,
                  qty,
                  bulkfollows_order_id: result.order,
                  charge,
                  error: result.error,
                  link,
                });
              } catch (smmErr) {
                console.error(`SMM order failed for ${item.service} (${link}):`, smmErr);
                smmResults.push({ service: item.service, qty, error: String(smmErr), link });
              }
            }
          }

          // Store SMM order IDs + cost on the order
          if (smmResults.length > 0) {
            const costCents = Math.round(totalCostUsd * 100);
            await sql`UPDATE orders SET smm_orders = ${JSON.stringify(smmResults)}::jsonb, cost_cents = ${costCents} WHERE id = ${orderId}`;
          }
        }
      } catch (smmErr) {
        console.error("BulkFollows auto-order error:", smmErr);
      }
    }

    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    console.error("Confirm order error:", err);
    return NextResponse.json({ error: "Failed to confirm order" }, { status: 500 });
  }
}
