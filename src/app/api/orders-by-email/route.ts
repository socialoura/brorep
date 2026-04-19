import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const orders = await sql`
      SELECT id, username, platform, cart, total_cents, status, followers_before, created_at, delivered_at
      FROM orders
      WHERE LOWER(email) = ${email.toLowerCase().trim()}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Orders by email error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
