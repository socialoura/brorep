import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { validatePromoCode } from "@/lib/promo";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const country = req.headers.get("x-vercel-ip-country") || "";
    const body = await req.json();
    const { cart, username, platform, postAssignments, email, promoCode, followersBefore, loyaltyDiscountCents, currency: reqCurrency, lang: reqLang } = body;
    const lang = (["fr","es","pt","de"].includes(reqLang)) ? reqLang : "en";
    const validCurrencies = ["eur", "usd", "gbp", "cad", "nzd", "aud", "chf"];
    const currency = validCurrencies.includes(reqCurrency) ? reqCurrency : "eur";

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate total in cents based on currency
    const currencyFieldMap: Record<string, string> = { eur: "price", usd: "priceUsd", gbp: "priceGbp", cad: "priceCad", nzd: "priceNzd", aud: "priceAud", chf: "priceChf" };
    const field = currencyFieldMap[currency] || "price";
    let totalCents = Math.round(
      cart.reduce((sum: number, item: Record<string, number>) => sum + (item[field] || item.price || 0), 0) * 100
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
      return NextResponse.json({ error: currency === "usd" ? "Minimum order is $0.50" : "Minimum order is 0.50\u20AC" }, { status: 400 });
    }

    // Build description
    const description = cart
      .map((item: { qty: number; label: string }) => `${item.qty} ${item.label}`)
      .join(" + ");

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency,
      automatic_payment_methods: { enabled: true },
      ...(email ? { receipt_email: email } : {}),
      metadata: {
        username: username || "",
        platform: platform || "",
        email: email || "",
        cart: JSON.stringify(cart.map((c: { service: string; label: string; qty: number; price: number; priceUsd?: number; liveStartAt?: string }) => ({ s: c.service, l: c.label, q: c.qty, p: c.price, pu: c.priceUsd || c.price, ...(c.liveStartAt ? { ls: c.liveStartAt } : {}) }))),
        currency,
        postAssignments: (() => {
          if (!postAssignments || postAssignments.length === 0) return "[]";
          const compact = postAssignments.map((pa: { postId: string; likes: boolean; views: boolean }) => ({ id: pa.postId, l: pa.likes ? 1 : 0, v: pa.views ? 1 : 0 }));
          // Extract common suffix (Instagram IDs: "mediaId_userId") to save space
          const ids = compact.map((p: { id: string }) => p.id);
          const parts = ids[0]?.split("_");
          const suffix = parts?.length === 2 ? `_${parts[1]}` : "";
          const allShareSuffix = suffix && ids.every((id: string) => id.endsWith(suffix));
          let result: string;
          if (allShareSuffix) {
            const short = compact.map((p: { id: string; l: number; v: number }) => ({ id: p.id.replace(suffix, ""), l: p.l, v: p.v }));
            result = JSON.stringify({ s: suffix, p: short });
          } else {
            result = JSON.stringify(compact);
          }
          // Truncate posts from the end if still over 500 chars
          while (result.length > 500) {
            compact.pop();
            if (allShareSuffix) {
              const short = compact.map((p: { id: string; l: number; v: number }) => ({ id: p.id.replace(suffix, ""), l: p.l, v: p.v }));
              result = JSON.stringify({ s: suffix, p: short });
            } else {
              result = JSON.stringify(compact);
            }
            if (compact.length === 0) break;
          }
          return result;
        })(),
        postsCount: postAssignments ? String(postAssignments.length) : "0",
        promoCode: appliedPromo,
        followersBefore: String(followersBefore || 0),
        lang,
        country,
      },
      description: `Fanovaly: ${description} ${currency === "usd" ? "for" : "pour"} @${username}`,
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
