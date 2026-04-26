import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

// GET all upsells
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await sql`SELECT * FROM upsells ORDER BY sort_order, id`;
  return NextResponse.json({ upsells: rows });
}

// POST create a new upsell
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { service, qty, label, label_en } = await req.json();
  if (!service || !qty) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const result = await sql`
    INSERT INTO upsells (service, qty, label, label_en)
    VALUES (${service}, ${Number(qty)}, ${label || ""}, ${label_en || ""})
    RETURNING id
  `;
  return NextResponse.json({ id: result[0].id });
}

// PUT update an upsell
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, active, label, label_en, sort_order } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (active !== undefined) await sql`UPDATE upsells SET active = ${active} WHERE id = ${id}`;
  if (label !== undefined) await sql`UPDATE upsells SET label = ${label} WHERE id = ${id}`;
  if (label_en !== undefined) await sql`UPDATE upsells SET label_en = ${label_en} WHERE id = ${id}`;
  if (sort_order !== undefined) await sql`UPDATE upsells SET sort_order = ${Number(sort_order)} WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}

// DELETE an upsell
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await sql`DELETE FROM upsells WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
