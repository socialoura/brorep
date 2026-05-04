/**
 * A/B Test pricing overrides.
 *
 * VARIANT A = current pricing (read from `pricing` table as-is).
 * VARIANT B = "Smart Hybrid" — Instagram followers only.
 *   - Small packs (50, 250) made dissuasive (high €/1k) to push users to bigger packs.
 *   - Big packs slightly increased to capture more margin.
 *   - Popular pack: 5000 followers @ 24,99€.
 *
 * If you want to add overrides for other services (likes, views, etc.), add them here.
 */

export interface PricingRow {
  service: string;
  qty: number;
  price: string | number;
  price_usd: string | number;
  price_gbp: string | number;
  price_cad: string | number;
  price_nzd: string | number;
  price_aud: string | number;
  price_chf: string | number;
  popular: boolean;
}

interface VariantBPack {
  qty: number;
  price: number;
  popular?: boolean;
}

// Variant B overrides (Smart Hybrid for Instagram followers)
const VARIANT_B_OVERRIDES: Record<string, VariantBPack[]> = {
  followers: [
    { qty: 50, price: 1.99 },
    { qty: 250, price: 3.99 },
    { qty: 500, price: 5.99 },
    { qty: 1000, price: 8.99 },
    { qty: 2500, price: 15.99 },
    { qty: 5000, price: 24.99, popular: true },
    { qty: 10000, price: 44.99 },
    { qty: 25000, price: 89.99 },
  ],
};

/**
 * Apply variant B overrides to a pricing array.
 * Services not in VARIANT_B_OVERRIDES are returned unchanged (Variant A).
 */
export function applyVariantBOverrides(rows: PricingRow[]): PricingRow[] {
  const result: PricingRow[] = [];
  const overriddenServices = new Set(Object.keys(VARIANT_B_OVERRIDES));

  // Keep all rows from services NOT being overridden
  for (const row of rows) {
    if (!overriddenServices.has(row.service)) {
      result.push(row);
    }
  }

  // Add overridden rows for each service
  for (const [service, packs] of Object.entries(VARIANT_B_OVERRIDES)) {
    for (const p of packs) {
      // Use same price for all currencies (USD/GBP/EUR equivalent)
      // For more realistic multi-currency, you could apply forex multipliers here
      const priceStr = p.price.toFixed(2);
      result.push({
        service,
        qty: p.qty,
        price: priceStr,
        price_usd: priceStr,
        price_gbp: priceStr,
        price_cad: priceStr,
        price_nzd: priceStr,
        price_aud: priceStr,
        price_chf: priceStr,
        popular: !!p.popular,
      });
    }
  }

  // Sort by service then qty
  result.sort((a, b) => {
    if (a.service !== b.service) return a.service.localeCompare(b.service);
    return a.qty - b.qty;
  });

  return result;
}
