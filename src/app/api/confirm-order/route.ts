import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createOrder, getOrderByPaymentIntent, addLoyaltyPoints } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendDiscordOrderNotification } from "@/lib/discord";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
    }

    // Verify with Stripe that payment actually succeeded
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (pi.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 });
    }

    // Parse order data from metadata
    const meta = pi.metadata;
    const cart = meta.cart ? JSON.parse(meta.cart) : [];
    const postAssignments = meta.postAssignments ? JSON.parse(meta.postAssignments) : null;
    const email = meta.email || pi.receipt_email;

    // Check if order already exists (idempotency — prevent duplicates on retry)
    let orderId: number | null = null;
    try {
      const existing = await getOrderByPaymentIntent(pi.id);
      if (existing) {
        // Order already created for this payment — return it
        return NextResponse.json({ success: true, orderId: existing.id });
      }
    } catch {}

    // Create order in DB now that payment is confirmed
    try {
      orderId = await createOrder({
        stripePaymentIntentId: pi.id,
        email: email || "",
        username: meta.username || "",
        platform: meta.platform || "",
        cart,
        postAssignments,
        totalCents: pi.amount,
        status: "paid",
        followersBefore: Number(meta.followersBefore) || 0,
      });
    } catch (dbErr) {
      console.error("DB order creation error:", dbErr);
    }

    // Send confirmation email
    if (email) {
      try {
        await sendOrderConfirmationEmail({
          to: email,
          username: meta.username || "",
          platform: meta.platform || "tiktok",
          cart,
          totalCents: pi.amount,
          orderId: orderId || undefined,
        });
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
      }
    }

    // Send Discord notification
    try {
      await sendDiscordOrderNotification({
        username: meta.username || "",
        platform: meta.platform || "tiktok",
        email: email || "",
        cart,
        totalCents: pi.amount,
      });
    } catch (discordErr) {
      console.error("Failed to send Discord notification:", discordErr);
    }

    // Credit loyalty points (1€ = 10 pts, so cents / 10)
    if (email) {
      try {
        const pts = Math.floor(pi.amount / 10);
        if (pts > 0) await addLoyaltyPoints(email, pts);
      } catch (loyaltyErr) {
        console.error("Failed to credit loyalty points:", loyaltyErr);
      }
    }

    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    console.error("Confirm order error:", err);
    return NextResponse.json({ error: "Failed to confirm order" }, { status: 500 });
  }
}
