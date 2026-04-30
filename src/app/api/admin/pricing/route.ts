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

  // Ensure popular column exists
  try { await sql`ALTER TABLE pricing ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false`; } catch {}

  let pricing;
  try {
    pricing = await sql`SELECT id, service, qty, price, COALESCE(price_usd,0) as price_usd, COALESCE(price_gbp,0) as price_gbp, COALESCE(price_cad,0) as price_cad, COALESCE(price_nzd,0) as price_nzd, COALESCE(price_aud,0) as price_aud, COALESCE(price_chf,0) as price_chf, COALESCE(popular,false) as popular, active, created_at FROM pricing ORDER BY service, qty`;
  } catch {
    pricing = await sql`SELECT id, service, qty, price, 0 as price_usd, 0 as price_gbp, 0 as price_cad, 0 as price_nzd, 0 as price_aud, 0 as price_chf, false as popular, active, created_at FROM pricing ORDER BY service, qty`;
  }
  return NextResponse.json({ pricing });
}

// POST create a new pack
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { service, qty, price, price_usd, price_gbp, price_cad, price_nzd, price_aud, price_chf } = await req.json();
  if (!service || !qty || price === undefined) {
    return NextResponse.json({ error: "Missing fields (service, qty, price)" }, { status: 400 });
  }

  try {
    const result = await sql`
      INSERT INTO pricing (service, qty, price, price_usd, price_gbp, price_cad, price_nzd, price_aud, price_chf)
      VALUES (${service}, ${Number(qty)}, ${Number(price)}, ${Number(price_usd || 0)}, ${Number(price_gbp || 0)}, ${Number(price_cad || 0)}, ${Number(price_nzd || 0)}, ${Number(price_aud || 0)}, ${Number(price_chf || 0)})
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
  const { id, price, price_usd, price_gbp, price_cad, price_nzd, price_aud, price_chf, active, popular } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Ensure currency columns exist before updating
  try { await sql`ALTER TABLE pricing ADD COLUMN IF NOT EXISTS price_usd NUMERIC(8,2) DEFAULT 0`; } catch {}
  try { await sql`ALTER TABLE pricing ADD COLUMN IF NOT EXISTS price_gbp NUMERIC(8,2) DEFAULT 0`; } catch {}
  try { await sql`ALTER TABLE pricing ADD COLUMN IF NOT EXISTS price_cad NUMERIC(8,2) DEFAULT 0`; } catch {}
  try { await sql`ALTER TABLE pricing ADD COLUMN IF NOT EXISTS price_nzd NUMERIC(8,2) DEFAULT 0`; } catch {}
  try { await sql`ALTER TABLE pricing ADD COLUMN IF NOT EXISTS price_aud NUMERIC(8,2) DEFAULT 0`; } catch {}
  try { await sql`ALTER TABLE pricing ADD COLUMN IF NOT EXISTS price_chf NUMERIC(8,2) DEFAULT 0`; } catch {}

  try {
    if (price !== undefined && price_usd !== undefined) {
      await sql`UPDATE pricing SET price = ${Number(price)}, price_usd = ${Number(price_usd)}, price_gbp = ${Number(price_gbp)}, price_cad = ${Number(price_cad)}, price_nzd = ${Number(price_nzd)}, price_aud = ${Number(price_aud)}, price_chf = ${Number(price_chf)} WHERE id = ${id}`;
    } else if (price !== undefined) {
      await sql`UPDATE pricing SET price = ${Number(price)} WHERE id = ${id}`;
    }

    if (active !== undefined) {
      await sql`UPDATE pricing SET active = ${active} WHERE id = ${id}`;
    }

    if (popular !== undefined) {
      if (popular) {
        // Get the service of this pack to clear other popular flags for the same service
        const rows = await sql`SELECT service FROM pricing WHERE id = ${id}`;
        if (rows.length > 0) {
          await sql`UPDATE pricing SET popular = false WHERE service = ${rows[0].service}`;
        }
      }
      await sql`UPDATE pricing SET popular = ${popular} WHERE id = ${id}`;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Pricing update error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
