import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Generate a unique promo code: FANO-XXXXX (15% off, expires in 48h, single use)
export async function generatePromoCode(): Promise<{
  code: string;
  percent: number;
  expiresAt: number;
} | null> {
  try {
    const percent = 15;
    const expiresAt = Math.floor(Date.now() / 1000) + 48 * 60 * 60; // 48h from now

    // Create a one-time coupon
    const coupon = await stripe.coupons.create({
      percent_off: percent,
      duration: "once",
      redeem_by: expiresAt,
      max_redemptions: 1,
    });

    // Generate a human-readable promo code
    const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = `FANO-${suffix}`;

    await stripe.promotionCodes.create({
      promotion: { type: "coupon", coupon: coupon.id },
      code,
      max_redemptions: 1,
      expires_at: expiresAt,
    });

    return { code, percent, expiresAt };
  } catch (err) {
    console.error("Failed to generate promo code:", err);
    return null;
  }
}

// Validate and retrieve a promo code
export async function validatePromoCode(code: string): Promise<{
  valid: boolean;
  percentOff?: number;
  promotionCodeId?: string;
}> {
  try {
    const promoCodes = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
    });

    if (promoCodes.data.length === 0) {
      return { valid: false };
    }

    const promo = promoCodes.data[0];
    const coupon = typeof promo.promotion === "object" && promo.promotion?.coupon
      ? (typeof promo.promotion.coupon === "object" ? promo.promotion.coupon : null)
      : null;

    if (!coupon || !coupon.valid) return { valid: false };
    if (promo.expires_at && promo.expires_at < Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }

    return {
      valid: true,
      percentOff: coupon.percent_off ?? undefined,
      promotionCodeId: promo.id,
    };
  } catch {
    return { valid: false };
  }
}
