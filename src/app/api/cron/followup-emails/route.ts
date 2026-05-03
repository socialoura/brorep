import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getOrderStatus as getSmmStatus } from "@/lib/bulkfollows";
import { sendDay1FollowupEmail, sendDeliveredFollowupEmail } from "@/lib/email";

// Vercel Cron runs this every hour
// It handles two types of followup emails:
// 1. Day+1 emails: sent ~24h after order creation
// 2. Delivered emails: sent when BulkFollows reports all sub-orders as completed

function mapBfStatus(s: string | undefined): string {
  if (!s) return "pending";
  const lower = s.toLowerCase();
  if (lower === "completed" || lower === "partial") return "delivered";
  if (lower === "in progress" || lower === "inprogress" || lower === "processing") return "processing";
  if (lower === "pending") return "paid";
  return "processing";
}

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = { day1Sent: 0, day1Errors: 0, deliveredSent: 0, deliveredErrors: 0, deliveredStatusUpdated: 0 };

  // ═══════════════════════════════════════════════════════════
  // 1. DAY+1 FOLLOWUP: orders created >24h ago, not yet sent
  // ═══════════════════════════════════════════════════════════
  try {
    const day1Orders = await sql`
      SELECT id, email, username, platform, lang
      FROM orders
      WHERE followup_day1_sent = false
        AND email IS NOT NULL AND email != ''
        AND created_at < NOW() - INTERVAL '24 hours'
        AND created_at > NOW() - INTERVAL '7 days'
    `;

    for (const order of day1Orders) {
      try {
        const sent = await sendDay1FollowupEmail({
          to: order.email,
          username: order.username,
          platform: order.platform,
          orderId: order.id,
          lang: order.lang || "fr",
        });
        if (sent) {
          await sql`UPDATE orders SET followup_day1_sent = true WHERE id = ${order.id}`;
          results.day1Sent++;
        } else {
          results.day1Errors++;
        }
      } catch {
        results.day1Errors++;
      }
    }
  } catch (err) {
    console.error("Day1 followup query error:", err);
  }

  // ═══════════════════════════════════════════════════════════
  // 2. DELIVERED FOLLOWUP: check BulkFollows status, send when all delivered
  // ═══════════════════════════════════════════════════════════
  try {
    const pendingOrders = await sql`
      SELECT id, email, username, platform, lang, smm_orders, status
      FROM orders
      WHERE followup_delivered_sent = false
        AND email IS NOT NULL AND email != ''
        AND status != 'delivered'
        AND smm_orders IS NOT NULL AND smm_orders != '[]'::jsonb
        AND created_at > NOW() - INTERVAL '14 days'
    `;

    for (const order of pendingOrders) {
      const smmOrders = Array.isArray(order.smm_orders) ? order.smm_orders : [];
      if (smmOrders.length === 0) continue;

      // Check live status of each sub-order
      let allDelivered = true;
      let anyHasId = false;

      for (const so of smmOrders) {
        if (!so.bulkfollows_order_id) continue;
        anyHasId = true;
        try {
          const st = await getSmmStatus(so.bulkfollows_order_id);
          const mapped = mapBfStatus(st.status);
          if (mapped !== "delivered") {
            allDelivered = false;
            break;
          }
        } catch {
          allDelivered = false;
          break;
        }
      }

      if (!anyHasId) continue;

      if (allDelivered) {
        // Update order status to delivered
        try {
          await sql`UPDATE orders SET status = 'delivered', delivered_at = NOW() WHERE id = ${order.id} AND status != 'delivered'`;
          results.deliveredStatusUpdated++;
        } catch {}

        // Send delivered followup email
        try {
          const sent = await sendDeliveredFollowupEmail({
            to: order.email,
            username: order.username,
            platform: order.platform,
            orderId: order.id,
            lang: order.lang || "fr",
          });
          if (sent) {
            await sql`UPDATE orders SET followup_delivered_sent = true WHERE id = ${order.id}`;
            results.deliveredSent++;
          } else {
            results.deliveredErrors++;
          }
        } catch {
          results.deliveredErrors++;
        }
      }
    }
  } catch (err) {
    console.error("Delivered followup query error:", err);
  }

  console.log("Followup cron results:", results);
  return NextResponse.json({ ok: true, ...results });
}
