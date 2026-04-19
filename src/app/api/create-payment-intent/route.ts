import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { validatePromoCode } from "@/lib/promo";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cart, username, platform, postAssignments, email, promoCode, followersBefore, loyaltyDiscountCents } = body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate total in cents
    let totalCents = Math.round(
      cart.reduce((sum: number, item: { price: number }) => sum + item.price, 0) * 100
    );

    // Apply promo code discount
    let appliedPromo = "";
    if (promoCode && typeof promoCode === "string") {
      const promo = await validatePromoCode(promoCode.trim().toUpperCase());
      if (promo.valid && promo.percentOff) {
        totalCents = Math.round(totalCents * (1 - promo.percentOff / 100));
        appliedPromo = promoCode.trim().toUpperCase();
      }
    }

    // Apply loyalty points discount
    if (loyaltyDiscountCents && typeof loyaltyDiscountCents === "number" && loyaltyDiscountCents > 0) {
      totalCents = Math.max(50, totalCents - loyaltyDiscountCents);
    }

    if (totalCents < 50) {
      return NextResponse.json({ error: "Minimum order is 0.50€" }, { status: 400 });
    }

    // Build description
    const description = cart
      .map((item: { qty: number; label: string }) => `${item.qty} ${item.label}`)
      .join(" + ");

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      ...(email ? { receipt_email: email } : {}),
      metadata: {
        username: username || "",
        platform: platform || "",
        email: email || "",
        cart: JSON.stringify(cart.map((c: { service: string; label: string; qty: number; price: number }) => ({ s: c.service, l: c.label, q: c.qty, p: c.price }))),
        postAssignments: postAssignments ? JSON.stringify(postAssignments.map((pa: { postId: string; likes: boolean; views: boolean }) => ({ id: pa.postId, l: pa.likes ? 1 : 0, v: pa.views ? 1 : 0 }))) : "[]",
        postsCount: postAssignments ? String(postAssignments.length) : "0",
        promoCode: appliedPromo,
        followersBefore: String(followersBefore || 0),
      },
      description: `Fanovaly: ${description} pour @${username}`,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment failed" },
      { status: 500 }
    );
  }
}
