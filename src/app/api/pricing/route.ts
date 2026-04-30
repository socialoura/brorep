import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Ensure popular column exists
    try { await sql`ALTER TABLE pricing ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false`; } catch {}

    let rows;
    try {
      rows = await sql`SELECT service, qty, price, COALESCE(price_usd,0) as price_usd, COALESCE(price_gbp,0) as price_gbp, COALESCE(price_cad,0) as price_cad, COALESCE(price_nzd,0) as price_nzd, COALESCE(price_aud,0) as price_aud, COALESCE(price_chf,0) as price_chf, COALESCE(popular,false) as popular FROM pricing WHERE active = true ORDER BY service, qty`;
    } catch {
      rows = await sql`SELECT service, qty, price, 0 as price_usd, 0 as price_gbp, 0 as price_cad, 0 as price_nzd, 0 as price_aud, 0 as price_chf, false as popular FROM pricing WHERE active = true ORDER BY service, qty`;
    }
    return NextResponse.json({ pricing: rows });
  } catch (err) {
    console.error("Pricing API error:", err);
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
  }
}
