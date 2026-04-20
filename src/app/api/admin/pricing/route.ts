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

  let pricing;
  try {
    pricing = await sql`SELECT id, service, qty, price, COALESCE(price_usd, 0) as price_usd, active, created_at FROM pricing ORDER BY service, qty`;
  } catch {
    pricing = await sql`SELECT id, service, qty, price, 0 as price_usd, active, created_at FROM pricing ORDER BY service, qty`;
  }
  return NextResponse.json({ pricing });
}

// POST create a new pack
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { service, qty, price, price_usd } = await req.json();
  if (!service || !qty || price === undefined) {
    return NextResponse.json({ error: "Missing fields (service, qty, price)" }, { status: 400 });
  }

  try {
    const result = await sql`
      INSERT INTO pricing (service, qty, price, price_usd)
      VALUES (${service}, ${Number(qty)}, ${Number(price)}, ${Number(price_usd || 0)})
      RETURNING id
    `;
    return NextResponse.json({ id: result[0].id });
  } catch (err) {
    console.error("Create pack error:", err);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}

// DELETE a pack
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    await sql`DELETE FROM pricing WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete pack error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

// PUT update a price
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, price, price_usd, active } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    if (price !== undefined) {
      await sql`UPDATE pricing SET price = ${price} WHERE id = ${id}`;
    }

    if (price_usd !== undefined) {
      try {
        await sql`UPDATE pricing SET price_usd = ${price_usd} WHERE id = ${id}`;
      } catch (e) {
        console.warn("price_usd column may not exist yet, run /api/init-db:", e);
      }
    }

    if (active !== undefined) {
      await sql`UPDATE pricing SET active = ${active} WHERE id = ${id}`;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Pricing update error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
