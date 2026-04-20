import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql`SELECT service, qty, price, price_usd FROM pricing WHERE active = true ORDER BY service, qty`;
    return NextResponse.json({ pricing: rows });
  } catch (err) {
    console.error("Pricing API error:", err);
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
  }
}
