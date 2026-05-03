import { NextRequest, NextResponse } from "next/server";

// In-memory cache: url hash → { buffer, contentType, ts }
const cache = new Map<string, { buffer: ArrayBuffer; contentType: string; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_SIZE = 200;

// 1x1 transparent PNG fallback
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIHWNgAAIABQABNjN9GwAAAABJRU5ErkJggg==",
  "base64"
);

function evictOldEntries() {
  if (cache.size <= MAX_CACHE_SIZE) return;
  const entries = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts);
  const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
  for (const [key] of toRemove) cache.delete(key);
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Check cache
  const cached = cache.get(url);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return new NextResponse(cached.buffer, {
      status: 200,
      headers: {
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "Access-Control-Allow-Origin": "*",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const decoded = decodeURIComponent(url);
    const res = await fetch(decoded, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
        Referer: "https://www.instagram.com/",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      // Return transparent pixel instead of error to avoid broken images in UI
      return new NextResponse(PIXEL, {
        status: 200,
        headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=60", "Access-Control-Allow-Origin": "*" },
      });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    // Store in cache
    cache.set(url, { buffer, contentType, ts: Date.now() });
    evictOldEntries();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "Access-Control-Allow-Origin": "*",
        "X-Cache": "MISS",
      },
    });
  } catch {
    // Return transparent pixel on timeout/network error
    return new NextResponse(PIXEL, {
      status: 200,
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=60", "Access-Control-Allow-Origin": "*" },
    });
  }
}
