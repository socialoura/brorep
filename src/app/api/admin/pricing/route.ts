import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

// GET all pricing
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pricing = await sql`SELECT * FROM pricing ORDER BY service, qty`;
  return NextResponse.json({ pricing });
}

// PUT update a price
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, price, active } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (price !== undefined) {
    await sql`UPDATE pricing SET price = ${price} WHERE id = ${id}`;
  }

  if (active !== undefined) {
    await sql`UPDATE pricing SET active = ${active} WHERE id = ${id}`;
  }

  return NextResponse.json({ success: true });
}
