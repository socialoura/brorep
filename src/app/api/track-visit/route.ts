import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const country = req.headers.get("x-vercel-ip-country")?.toUpperCase() || "";
    if (!country || country.length !== 2) {
      return NextResponse.json({ ok: true });
    }

    await sql`
      INSERT INTO visits_by_country (country, date, count)
      VALUES (${country}, CURRENT_DATE, 1)
      ON CONFLICT (country, date)
      DO UPDATE SET count = visits_by_country.count + 1
    `;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
