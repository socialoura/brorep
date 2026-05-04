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
    ), 0) as total FROM orders WHERE status IN ('paid', 'processing', 'delivered')`;

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
    ), 0) as total FROM orders WHERE status IN ('paid', 'processing', 'delivered') AND created_at >= CURRENT_DATE`;

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
    WHERE o.status IN ('paid', 'processing', 'delivered')
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

  // Per-customer analytics (paid orders only, grouped by email, all currencies → EUR)
  const customerStats = await sql`
    WITH paid_in_eur AS (
      SELECT
        LOWER(TRIM(email)) AS email_norm,
        CASE
          WHEN currency = 'usd' THEN ROUND(total_cents * ${rUsd}::numeric)
          WHEN currency = 'gbp' THEN ROUND(total_cents * ${rGbp}::numeric)
          WHEN currency = 'cad' THEN ROUND(total_cents * ${rCad}::numeric)
          WHEN currency = 'nzd' THEN ROUND(total_cents * ${rNzd}::numeric)
          WHEN currency = 'chf' THEN ROUND(total_cents * ${rChf}::numeric)
          ELSE total_cents
        END AS eur_cents
      FROM orders
      WHERE status IN ('paid', 'processing', 'delivered') AND email IS NOT NULL AND TRIM(email) <> ''
    ),
    per_customer AS (
      SELECT email_norm, SUM(eur_cents) AS total_eur_cents, COUNT(*) AS order_count
      FROM paid_in_eur
      GROUP BY email_norm
    )
    SELECT
      (SELECT COUNT(*) FROM per_customer) AS unique_customers,
      (SELECT COALESCE(AVG(total_eur_cents), 0) FROM per_customer) AS avg_per_customer_cents,
      (SELECT COALESCE(AVG(eur_cents), 0) FROM paid_in_eur) AS avg_order_value_cents,
      (SELECT COALESCE(AVG(order_count), 0) FROM per_customer) AS avg_orders_per_customer
  `;

  // Top 10 spenders
  const topSpenders = await sql`
    SELECT
      LOWER(TRIM(email)) AS email,
      COUNT(*) AS order_count,
      SUM(
        CASE
          WHEN currency = 'usd' THEN ROUND(total_cents * ${rUsd}::numeric)
          WHEN currency = 'gbp' THEN ROUND(total_cents * ${rGbp}::numeric)
          WHEN currency = 'cad' THEN ROUND(total_cents * ${rCad}::numeric)
          WHEN currency = 'nzd' THEN ROUND(total_cents * ${rNzd}::numeric)
          WHEN currency = 'chf' THEN ROUND(total_cents * ${rChf}::numeric)
          ELSE total_cents
        END
      ) AS total_eur_cents
    FROM orders
    WHERE status IN ('paid', 'processing', 'delivered') AND email IS NOT NULL AND TRIM(email) <> ''
    GROUP BY LOWER(TRIM(email))
    ORDER BY total_eur_cents DESC
    LIMIT 10
  `;

  // ── Top countries: orders, revenue, avg cart ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let topCountries: Record<string, any>[] = [];
  try {
    topCountries = await sql`
      SELECT
        COALESCE(country, '??') AS country,
        COUNT(*) AS order_count,
        SUM(
          CASE
            WHEN currency = 'usd' THEN ROUND(total_cents * ${rUsd}::numeric)
            WHEN currency = 'gbp' THEN ROUND(total_cents * ${rGbp}::numeric)
            WHEN currency = 'cad' THEN ROUND(total_cents * ${rCad}::numeric)
            WHEN currency = 'nzd' THEN ROUND(total_cents * ${rNzd}::numeric)
            WHEN currency = 'chf' THEN ROUND(total_cents * ${rChf}::numeric)
            ELSE total_cents
          END
        ) AS revenue_eur_cents,
        ROUND(AVG(
          CASE
            WHEN currency = 'usd' THEN total_cents * ${rUsd}::numeric
            WHEN currency = 'gbp' THEN total_cents * ${rGbp}::numeric
            WHEN currency = 'cad' THEN total_cents * ${rCad}::numeric
            WHEN currency = 'nzd' THEN total_cents * ${rNzd}::numeric
            WHEN currency = 'chf' THEN total_cents * ${rChf}::numeric
            ELSE total_cents
          END
        )) AS avg_cart_eur_cents
      FROM orders
      WHERE status IN ('paid', 'processing', 'delivered')
      GROUP BY COALESCE(country, '??')
      ORDER BY revenue_eur_cents DESC
      LIMIT 20
    `;
  } catch { /* country column may not exist yet */ }

  // ── Revenue by currency ──
  const revenueByCurrency = await sql`
    SELECT
      COALESCE(currency, 'eur') AS currency,
      COUNT(*) AS order_count,
      SUM(total_cents) AS total_cents
    FROM orders
    WHERE status IN ('paid', 'processing', 'delivered')
    GROUP BY COALESCE(currency, 'eur')
    ORDER BY total_cents DESC
  `;

  // ── Last 30 days trend (with ad costs) ──
  const last30Days = await sql`
    WITH order_days AS (
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
        ), 0) as revenue,
        COALESCE(SUM(ROUND(cost_cents * ${rUsd}::numeric)), 0) as smm_cost
      FROM orders
      WHERE status IN ('paid', 'processing', 'delivered') AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
    ),
    ad_days AS (
      SELECT date, cost_cents AS ad_cost
      FROM ad_costs
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    )
    SELECT
      COALESCE(o.date, a.date) AS date,
      COALESCE(o.count, 0) AS count,
      COALESCE(o.revenue, 0) AS revenue,
      COALESCE(o.smm_cost, 0) + COALESCE(a.ad_cost, 0) AS cost,
      COALESCE(o.smm_cost, 0) AS smm_cost,
      COALESCE(a.ad_cost, 0) AS ad_cost
    FROM order_days o
    FULL OUTER JOIN ad_days a ON o.date = a.date
    ORDER BY date
  `;

  // ── Recurrence rate ──
  const recurrence = await sql`
    WITH customer_orders AS (
      SELECT LOWER(TRIM(email)) AS email_norm, COUNT(*) AS cnt
      FROM orders
      WHERE status IN ('paid', 'processing', 'delivered') AND email IS NOT NULL AND TRIM(email) <> ''
      GROUP BY LOWER(TRIM(email))
    )
    SELECT
      COUNT(*) AS total_customers,
      COUNT(*) FILTER (WHERE cnt > 1) AS returning_customers,
      ROUND(COUNT(*) FILTER (WHERE cnt > 1)::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS recurrence_pct
    FROM customer_orders
  `;

  // ── Revenue by platform ──
  const revenueByPlatform = await sql`
    SELECT
      platform,
      COUNT(*) AS order_count,
      SUM(
        CASE
          WHEN currency = 'usd' THEN ROUND(total_cents * ${rUsd}::numeric)
          WHEN currency = 'gbp' THEN ROUND(total_cents * ${rGbp}::numeric)
          WHEN currency = 'cad' THEN ROUND(total_cents * ${rCad}::numeric)
          WHEN currency = 'nzd' THEN ROUND(total_cents * ${rNzd}::numeric)
          WHEN currency = 'chf' THEN ROUND(total_cents * ${rChf}::numeric)
          ELSE total_cents
        END
      ) AS revenue_eur_cents,
      ROUND(AVG(
        CASE
          WHEN currency = 'usd' THEN total_cents * ${rUsd}::numeric
          WHEN currency = 'gbp' THEN total_cents * ${rGbp}::numeric
          WHEN currency = 'cad' THEN total_cents * ${rCad}::numeric
          WHEN currency = 'nzd' THEN total_cents * ${rNzd}::numeric
          WHEN currency = 'chf' THEN total_cents * ${rChf}::numeric
          ELSE total_cents
        END
      )) AS avg_cart_eur_cents
    FROM orders
    WHERE status IN ('paid', 'processing', 'delivered')
    GROUP BY platform
    ORDER BY revenue_eur_cents DESC
  `;

  // ── Peak hours (UTC) ──
  const peakHours = await sql`
    SELECT EXTRACT(HOUR FROM created_at)::int AS hour, COUNT(*) AS count
    FROM orders
    WHERE status IN ('paid', 'processing', 'delivered')
    GROUP BY EXTRACT(HOUR FROM created_at)::int
    ORDER BY hour
  `;

  // ── Best service by revenue per client & recurrence ──
  const servicePerformance = await sql`
    WITH svc AS (
      SELECT
        item->>'service' AS service,
        LOWER(TRIM(o.email)) AS email_norm,
        CASE
          WHEN o.currency = 'usd' THEN ROUND((item->>'price')::numeric * 100 * ${rUsd}::numeric)
          WHEN o.currency = 'gbp' THEN ROUND((item->>'price')::numeric * 100 * ${rGbp}::numeric)
          WHEN o.currency = 'cad' THEN ROUND((item->>'price')::numeric * 100 * ${rCad}::numeric)
          WHEN o.currency = 'nzd' THEN ROUND((item->>'price')::numeric * 100 * ${rNzd}::numeric)
          WHEN o.currency = 'chf' THEN ROUND((item->>'price')::numeric * 100 * ${rChf}::numeric)
          ELSE (item->>'price')::numeric * 100
        END AS eur_cents
      FROM orders o, jsonb_array_elements(o.cart) AS item
      WHERE o.status IN ('paid', 'processing', 'delivered') AND o.email IS NOT NULL AND TRIM(o.email) <> ''
    )
    SELECT
      service,
      COUNT(*) AS total_purchases,
      COUNT(DISTINCT email_norm) AS unique_customers,
      ROUND(SUM(eur_cents)::numeric / NULLIF(COUNT(DISTINCT email_norm), 0)) AS revenue_per_customer_cents,
      ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT email_norm), 0), 2) AS purchases_per_customer
    FROM svc
    GROUP BY service
    ORDER BY revenue_per_customer_cents DESC
  `;

  // ── Country conversion: visits vs orders ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let countryConversion: Record<string, any>[] = [];
  try {
    countryConversion = await sql`
      SELECT
        v.country,
        v.visit_count AS visits,
        COALESCE(o.order_count, 0) AS orders,
        CASE WHEN v.visit_count > 0
          THEN ROUND(COALESCE(o.order_count, 0)::numeric / v.visit_count * 100, 2)
          ELSE 0
        END AS conversion_pct
      FROM (
        SELECT country, SUM(count) AS visit_count
        FROM visits_by_country
        GROUP BY country
      ) v
      LEFT JOIN (
        SELECT COALESCE(country, '??') AS country, COUNT(*) AS order_count
        FROM orders WHERE status IN ('paid', 'processing', 'delivered')
        GROUP BY COALESCE(country, '??')
      ) o ON o.country = v.country
      ORDER BY conversion_pct DESC
      LIMIT 20
    `;
  } catch { /* visits_by_country table may not exist yet */ }

  // ── Ad costs (Google Ads etc.) ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let adCostTotal: Record<string, any>[] = [{ total: 0 }];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let adCostToday: Record<string, any>[] = [{ total: 0 }];
  try {
    adCostTotal = await sql`SELECT COALESCE(SUM(cost_cents), 0) AS total FROM ad_costs`;
    adCostToday = await sql`SELECT COALESCE(SUM(cost_cents), 0) AS total FROM ad_costs WHERE date = CURRENT_DATE`;
  } catch { /* table may not exist yet */ }

  // Compute margin % (SMM cost + ad costs)
  const totalRevCents = Number(revenue[0].total);
  const totalSmmCostCents = Number(totalCost[0].total);
  const totalAdCostCents = Number(adCostTotal[0].total);
  const totalCostCents = totalSmmCostCents + totalAdCostCents;
  const marginPct = totalRevCents > 0 ? Math.round((totalRevCents - totalCostCents) / totalRevCents * 10000) / 100 : 0;

  return NextResponse.json({
    totalOrders: Number(totalOrders[0].count),
    byStatus,
    totalRevenueCents: totalRevCents,
    ordersToday: Number(today[0].count),
    revenueTodayCents: Number(revenueToday[0].total),
    totalCostCents,
    totalSmmCostCents,
    totalAdCostCents,
    costTodayCents: Number(costToday[0].total) + Number(adCostToday[0].total),
    marginPct,
    last7Days,
    last30Days,
    topServices,
    servicePerformance,
    platforms,
    revenueByPlatform,
    revenueByCurrency,
    topCountries,
    countryConversion,
    peakHours,
    recurrence: {
      totalCustomers: Number(recurrence[0].total_customers),
      returningCustomers: Number(recurrence[0].returning_customers),
      recurrencePct: Number(recurrence[0].recurrence_pct),
    },
    uniqueCustomers: Number(customerStats[0].unique_customers),
    avgPerCustomerCents: Number(customerStats[0].avg_per_customer_cents),
    avgOrderValueCents: Number(customerStats[0].avg_order_value_cents),
    avgOrdersPerCustomer: Number(customerStats[0].avg_orders_per_customer),
    topSpenders,
  });
}
