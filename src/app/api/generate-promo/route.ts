import { NextResponse } from "next/server";
import { generatePromoCode } from "@/lib/promo";

export async function POST() {
  const promo = await generatePromoCode();
  if (!promo) {
    return NextResponse.json({ error: "Failed to generate promo" }, { status: 500 });
  }
  return NextResponse.json(promo);
}
