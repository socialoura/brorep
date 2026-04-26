import { NextRequest, NextResponse } from "next/server";
import { sql, updateOrderStatusById } from "@/lib/db";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = Number(req.nextUrl.searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const orders = await sql`
    SELECT o.*, ranked.email_order_num, ranked.email_order_total
    FROM (
      SELECT id,
        ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(email)) ORDER BY created_at ASC) as email_order_num,
        COUNT(*) OVER (PARTITION BY LOWER(TRIM(email))) as email_order_total
      FROM orders WHERE email IS NOT NULL AND email != ''
    ) ranked
    RIGHT JOIN orders o ON o.id = ranked.id
    ORDER BY o.created_at DESC LIMIT ${limit} OFFSET ${offset}
  `;

  const countResult = await sql`SELECT COUNT(*) as total FROM orders`;
  const total = Number(countResult[0].total);

  return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) });
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();
  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }

  const validStatuses = ["pending", "paid", "processing", "delivered", "failed"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await updateOrderStatusById(id, status);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, cost_cents } = await req.json();
  if (!id || cost_cents === undefined) {
    return NextResponse.json({ error: "Missing id or cost_cents" }, { status: 400 });
  }

  await sql`UPDATE orders SET cost_cents = ${Number(cost_cents)} WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
