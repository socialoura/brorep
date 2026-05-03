import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  return auth.replace("Bearer ", "") === process.env.ADMIN_PASSWORD;
}

// GET: list ad costs (last 90 days by default)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await sql`
    SELECT id, date, cost_cents, note
    FROM ad_costs
    ORDER BY date DESC
    LIMIT 90
  `;
  return NextResponse.json(rows);
}

// POST: upsert ad cost for a date
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date, cost, note } = await req.json();
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const costCents = Math.round((Number(cost) || 0) * 100);

  await sql`
    INSERT INTO ad_costs (date, cost_cents, note)
    VALUES (${date}, ${costCents}, ${note || ''})
    ON CONFLICT (date)
    DO UPDATE SET cost_cents = ${costCents}, note = COALESCE(${note || ''}, ad_costs.note)
  `;

  return NextResponse.json({ ok: true });
}

// DELETE: remove ad cost entry
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await sql`DELETE FROM ad_costs WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
