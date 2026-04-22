import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Total orders
  const totalOrders = await sql`SELECT COUNT(*) as count FROM orders`;

  // Orders by status
  const byStatus = await sql`SELECT status, COUNT(*) as count FROM orders GROUP BY status`;

  // Revenue (paid orders only)
  const revenue = await sql`SELECT COALESCE(SUM(total_cents), 0) as total FROM orders WHERE status = 'paid'`;

  // Orders today
  const today = await sql`SELECT COUNT(*) as count FROM orders WHERE created_at >= CURRENT_DATE`;

  // Revenue today
  const revenueToday = await sql`SELECT COALESCE(SUM(total_cents), 0) as total FROM orders WHERE status = 'paid' AND created_at >= CURRENT_DATE`;

  // Orders last 7 days (per day)
  const last7Days = await sql`
    SELECT DATE(created_at) as date, COUNT(*) as count, COALESCE(SUM(total_cents), 0) as revenue
    FROM orders
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  // Top services
  const topServices = await sql`
    SELECT 
      item->>'service' as service,
      COUNT(*) as count,
      SUM((item->>'price')::numeric * 100) as revenue_cents
    FROM orders, jsonb_array_elements(cart) as item
    WHERE status = 'paid'
    GROUP BY item->>'service'
    ORDER BY revenue_cents DESC
  `;

  // Platform split
  const platforms = await sql`SELECT platform, COUNT(*) as count FROM orders GROUP BY platform`;

  // Total cost
  const totalCost = await sql`SELECT COALESCE(SUM(cost_cents), 0) as total FROM orders WHERE status IN ('paid', 'processing', 'delivered')`;

  // Cost today
  const costToday = await sql`SELECT COALESCE(SUM(cost_cents), 0) as total FROM orders WHERE status IN ('paid', 'processing', 'delivered') AND created_at >= CURRENT_DATE`;

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
