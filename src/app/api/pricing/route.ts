import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { applyVariantBOverrides, type PricingRow } from "@/lib/abPricing";

export async function GET(req: NextRequest) {
  try {
    // Ensure popular column exists
    try { await sql`ALTER TABLE pricing ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false`; } catch {}

    let rows;
    try {
      rows = await sql`SELECT service, qty, price, COALESCE(price_usd,0) as price_usd, COALESCE(price_gbp,0) as price_gbp, COALESCE(price_cad,0) as price_cad, COALESCE(price_nzd,0) as price_nzd, COALESCE(price_aud,0) as price_aud, COALESCE(price_chf,0) as price_chf, COALESCE(popular,false) as popular FROM pricing WHERE active = true ORDER BY service, qty`;
    } catch {
      rows = await sql`SELECT service, qty, price, 0 as price_usd, 0 as price_gbp, 0 as price_cad, 0 as price_nzd, 0 as price_aud, 0 as price_chf, false as popular FROM pricing WHERE active = true ORDER BY service, qty`;
    }

    // A/B test: apply variant B overrides if requested
    const variant = req.nextUrl.searchParams.get("variant");
    let pricing: PricingRow[] = rows as unknown as PricingRow[];
    if (variant === "B") {
      pricing = applyVariantBOverrides(pricing);
    }

    return NextResponse.json(
      { pricing, variant: variant === "B" ? "B" : "A" },
      // Cache must vary by variant — use private to avoid CDN cross-variant caching
      { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=600" } }
    );
  } catch (err) {
    console.error("Pricing API error:", err);
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
  }
}
