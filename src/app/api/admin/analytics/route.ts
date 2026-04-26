import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

// Conversion rates to EUR (update periodically)
const TO_EUR: Record<string, number> = {
  eur: 1,
  usd: 0.92,
  gbp: 1.16,
  cad: 0.68,
  nzd: 0.56,
  chf: 1.05,
};

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // SQL CASE expression to convert any currency → EUR cents
  const rUsd = TO_EUR.usd;
  const rGbp = TO_EUR.gbp;
  const rCad = TO_EUR.cad;
  const rNzd = TO_EUR.nzd;
  const rChf = TO_EUR.chf;

  // Total orders
  const totalOrders = await sql`SELECT COUNT(*) as count FROM orders`;

  // Orders by status
  const byStatus = await sql`SELECT status, COUNT(*) as count FROM orders GROUP BY status`;

  // Revenue (paid orders only) — convert all currencies to EUR
  const revenue = await sql`
    SELECT COALESCE(SUM(
      CASE
        WHEN currency = 'usd' THEN ROUND(total_cents * ${rUsd}::numeric)
        WHEN currency = 'gbp' THEN ROUND(total_cents * ${rGbp}::numeric)
        WHEN currency = 'cad' THEN ROUND(total_cents * ${rCad}::numeric)
        WHEN currency = 'nzd' THEN ROUND(total_cents * ${rNzd}::numeric)
        WHEN currency = 'chf' THEN ROUND(total_cents * ${rChf}::numeric)
        ELSE total_cents
      END
    ), 0) as total FROM orders WHERE status = 'paid'`;

  // Orders today
  const today = await sql`SELECT COUNT(*) as count FROM orders WHERE created_at >= CURRENT_DATE`;

  // Revenue today — convert all currencies to EUR
  const revenueToday = await sql`
    SELECT COALESCE(SUM(
      CASE
        WHEN currency = 'usd' THEN ROUND(total_cents * ${rUsd}::numeric)
        WHEN currency = 'gbp' THEN ROUND(total_cents * ${rGbp}::numeric)
        WHEN currency = 'cad' THEN ROUND(total_cents * ${rCad}::numeric)
        WHEN currency = 'nzd' THEN ROUND(total_cents * ${rNzd}::numeric)
        WHEN currency = 'chf' THEN ROUND(total_cents * ${rChf}::numeric)
        ELSE total_cents
      END
    ), 0) as total FROM orders WHERE status = 'paid' AND created_at >= CURRENT_DATE`;

  // Orders last 7 days (per day) — convert all currencies to EUR
  const last7Days = await sql`
    SELECT DATE(created_at) as date, COUNT(*) as count,
      COALESCE(SUM(
        CASE
          WHEN currency = 'usd' THEN ROUND(total_cents * ${rUsd}::numeric)
          WHEN currency = 'gbp' THEN ROUND(total_cents * ${rGbp}::numeric)
          WHEN currency = 'cad' THEN ROUND(total_cents * ${rCad}::numeric)
          WHEN currency = 'nzd' THEN ROUND(total_cents * ${rNzd}::numeric)
          WHEN currency = 'chf' THEN ROUND(total_cents * ${rChf}::numeric)
          ELSE total_cents
        END
      ), 0) as revenue
    FROM orders
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  // Top services — convert all currencies to EUR
  const topServices = await sql`
    SELECT 
      item->>'service' as service,
      COUNT(*) as count,
      SUM(
        CASE
          WHEN o.currency = 'usd' THEN ROUND((item->>'price')::numeric * 100 * ${rUsd}::numeric)
          WHEN o.currency = 'gbp' THEN ROUND((item->>'price')::numeric * 100 * ${rGbp}::numeric)
          WHEN o.currency = 'cad' THEN ROUND((item->>'price')::numeric * 100 * ${rCad}::numeric)
          WHEN o.currency = 'nzd' THEN ROUND((item->>'price')::numeric * 100 * ${rNzd}::numeric)
          WHEN o.currency = 'chf' THEN ROUND((item->>'price')::numeric * 100 * ${rChf}::numeric)
          ELSE (item->>'price')::numeric * 100
        END
      ) as revenue_cents
    FROM orders o, jsonb_array_elements(o.cart) as item
    WHERE o.status = 'paid'
    GROUP BY item->>'service'
    ORDER BY revenue_cents DESC
  `;

  // Platform split
  const platforms = await sql`SELECT platform, COUNT(*) as count FROM orders GROUP BY platform`;

  // Total cost (cost_cents is always in USD from SMM provider → convert to EUR)
  const totalCost = await sql`
    SELECT COALESCE(SUM(ROUND(cost_cents * ${rUsd}::numeric)), 0) as total
    FROM orders WHERE status IN ('paid', 'processing', 'delivered')`;

  // Cost today (same USD→EUR conversion)
  const costToday = await sql`
    SELECT COALESCE(SUM(ROUND(cost_cents * ${rUsd}::numeric)), 0) as total
    FROM orders WHERE status IN ('paid', 'processing', 'delivered') AND created_at >= CURRENT_DATE`;

  return NextResponse.json({
    totalOrders: Number(totalOrders[0].count),
    byStatus,
    totalRevenueCents: Number(revenue[0].total),
    ordersToday: Number(today[0].count),
    revenueTodayCents: Number(revenueToday[0].total),
    totalCostCents: Number(totalCost[0].total),
    costTodayCents: Number(costToday[0].total),
    last7Days,
    topServices,
    platforms,
  });
}
