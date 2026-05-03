import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Join upsells with pricing to get the price for each upsell offer
    const rows = await sql`
      SELECT u.id, u.service, u.qty, u.label, u.label_en,
        p.price, COALESCE(p.price_usd, 0) as price_usd
      FROM upsells u
      LEFT JOIN pricing p ON p.service = u.service AND p.qty = u.qty AND p.active = true
      WHERE u.active = true
      ORDER BY u.sort_order, u.id
    `;
    return NextResponse.json({ upsells: rows }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } });
  } catch (err) {
    console.error("Upsells API error:", err);
    return NextResponse.json({ upsells: [] });
  }
}
