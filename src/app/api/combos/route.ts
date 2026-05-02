import { NextRequest, NextResponse } from "next/server";
import { getActiveCombos } from "@/lib/db";

export async function GET(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get("platform") || undefined;
  const combos = await getActiveCombos(platform);
  return NextResponse.json({ combos });
}
