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
  const emailSearch = (req.nextUrl.searchParams.get("email") || "").trim();
  const limit = 20;
  const offset = (page - 1) * limit;

  let orders;
  let total: number;

  if (emailSearch) {
    const pattern = `%${emailSearch.toLowerCase()}%`;
    orders = await sql`
      SELECT o.*, ranked.email_order_num, ranked.email_order_total
      FROM (
        SELECT id,
          ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(email)) ORDER BY created_at ASC) as email_order_num,
          COUNT(*) OVER (PARTITION BY LOWER(TRIM(email))) as email_order_total
        FROM orders WHERE email IS NOT NULL AND email != ''
      ) ranked
      RIGHT JOIN orders o ON o.id = ranked.id
      WHERE LOWER(o.email) LIKE ${pattern}
      ORDER BY o.created_at DESC LIMIT ${limit} OFFSET ${offset}
    `;
    const countResult = await sql`SELECT COUNT(*) as total FROM orders WHERE LOWER(email) LIKE ${pattern}`;
    total = Number(countResult[0].total);
  } else {
    orders = await sql`
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
    total = Number(countResult[0].total);
  }

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

  const body = await req.json();
  const { id, cost_cents, smm_orders } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (cost_cents !== undefined) {
    await sql`UPDATE orders SET cost_cents = ${Number(cost_cents)} WHERE id = ${id}`;
  }

  if (smm_orders !== undefined) {
    if (!Array.isArray(smm_orders)) {
      return NextResponse.json({ error: "smm_orders must be an array" }, { status: 400 });
    }
    // Sanitize: keep only known fields
    const cleaned = smm_orders.map((s: Record<string, unknown>) => ({
      service: String(s.service || ""),
      qty: Number(s.qty || 0),
      ...(s.bulkfollows_order_id ? { bulkfollows_order_id: Number(s.bulkfollows_order_id) } : {}),
      ...(s.charge !== undefined ? { charge: Number(s.charge) } : {}),
      ...(s.error ? { error: String(s.error) } : {}),
      ...(s.link ? { link: String(s.link) } : {}),
    }));
    await sql`UPDATE orders SET smm_orders = ${JSON.stringify(cleaned)}::jsonb WHERE id = ${id}`;
  }

  if (cost_cents === undefined && smm_orders === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
