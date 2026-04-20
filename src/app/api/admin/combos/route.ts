import { NextRequest, NextResponse } from "next/server";
import { getAllCombos, createCombo, updateCombo, deleteCombo } from "@/lib/db";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const combos = await getAllCombos();
  return NextResponse.json({ combos });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, nameEn, items, discountPercent } = await req.json();
  if (!name || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const id = await createCombo({ name, nameEn: nameEn || '', items, discountPercent: discountPercent || 20 });
  return NextResponse.json({ id });
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...params } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await updateCombo(id, params);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await deleteCombo(id);
  return NextResponse.json({ success: true });
}
