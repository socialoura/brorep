import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    return NextResponse.json({ success: true, message: "Database initialized and pricing seeded" });
  } catch (err) {
    console.error("DB init error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "DB init failed" },
      { status: 500 }
    );
  }
}
