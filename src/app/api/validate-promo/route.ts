import { NextRequest, NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/promo";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false });
    }

    const result = await validatePromoCode(code.trim().toUpperCase());
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ valid: false });
  }
}
