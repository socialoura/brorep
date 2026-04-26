import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    country: req.headers.get("x-vercel-ip-country") || null,
    region: req.headers.get("x-vercel-ip-country-region") || null,
    city: req.headers.get("x-vercel-ip-city") || null,
    ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
    cookies: {
      currency: req.cookies.get("currency")?.value || null,
    },
    allHeaders: Object.fromEntries(req.headers.entries()),
  });
}
