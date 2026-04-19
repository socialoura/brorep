import { NextRequest, NextResponse } from "next/server";
import { getLoyaltyPoints, redeemLoyaltyPoints } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, redeem } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Redeem 500 points for 5€ discount
    if (redeem) {
      const success = await redeemLoyaltyPoints(normalizedEmail, 500);
      if (!success) {
        return NextResponse.json({ error: "Not enough points", redeemed: false }, { status: 400 });
      }
      const newPoints = await getLoyaltyPoints(normalizedEmail);
      return NextResponse.json({ redeemed: true, discountCents: 500, points: newPoints });
    }

    // Just check balance
    const points = await getLoyaltyPoints(normalizedEmail);
    return NextResponse.json({ points });
  } catch (err) {
    console.error("Loyalty API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
