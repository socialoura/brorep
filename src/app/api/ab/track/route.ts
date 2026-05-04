import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { visitorId, variant } = await req.json();

    if (!visitorId || (variant !== "A" && variant !== "B")) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    // Truncate visitor_id to 64 chars
    const id = String(visitorId).slice(0, 64);

    // Detect country from Vercel headers
    const country = req.headers.get("x-vercel-ip-country") || null;

    // Detect lang from referer
    const referer = req.headers.get("referer") || "";
    const langMatch = referer.match(/[?&]lang=(en|es|pt|de)/);
    const lang = langMatch ? langMatch[1] : "fr";

    // Upsert: insert if new, update last_seen + visits if exists
    await sql`
      INSERT INTO ab_visitors (visitor_id, variant, country, lang, first_seen, last_seen, visits)
      VALUES (${id}, ${variant}, ${country}, ${lang}, NOW(), NOW(), 1)
      ON CONFLICT (visitor_id) DO UPDATE
      SET last_seen = NOW(),
          visits = ab_visitors.visits + 1
    `;

    return NextResponse.json({ success: true, variant });
  } catch (err) {
    console.error("AB track error:", err);
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}
