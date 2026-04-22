import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getBalance } from "@/lib/bulkfollows";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

// GET: return config + settings + balance
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await sql`SELECT * FROM smm_config ORDER BY platform, service`;
  const settings = await sql`SELECT * FROM smm_settings`;

  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }

  let balance = null;
  try {
    balance = await getBalance();
  } catch (e) {
    console.error("Failed to fetch BulkFollows balance:", e);
  }

  return NextResponse.json({ config, settings: settingsMap, balance });
}

// PUT: update config or settings
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Toggle global auto_order_enabled
  if (body.action === "toggle") {
    const current = await sql`SELECT value FROM smm_settings WHERE key = 'auto_order_enabled'`;
    const newVal = current[0]?.value === "true" ? "false" : "true";
    await sql`UPDATE smm_settings SET value = ${newVal} WHERE key = 'auto_order_enabled'`;
    return NextResponse.json({ success: true, enabled: newVal === "true" });
  }

  // Update a service mapping
  if (body.action === "update_service") {
    const { id, bulkfollows_service_id, enabled } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    if (bulkfollows_service_id !== undefined) {
      await sql`UPDATE smm_config SET bulkfollows_service_id = ${Number(bulkfollows_service_id)} WHERE id = ${id}`;
    }
    if (enabled !== undefined) {
      await sql`UPDATE smm_config SET enabled = ${Boolean(enabled)} WHERE id = ${id}`;
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
