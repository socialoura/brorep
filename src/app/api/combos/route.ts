import { NextResponse } from "next/server";
import { getActiveCombos } from "@/lib/db";

export async function GET() {
  const combos = await getActiveCombos();
  return NextResponse.json({ combos });
}
