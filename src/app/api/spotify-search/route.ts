import type { NextRequest } from "next/server";

// --- Simple in-memory cache (max 200 entries, 5 min TTL) ---
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_MAX = 200;

function getCached(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown) {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { data, ts: Date.now() });
}

async function fetchWithTimeout(url: string, headers: Record<string, string>, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { headers, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * GET /api/spotify-search?mode=search&q=Home+mdnr
 * GET /api/spotify-search?mode=track&trackId=5l4hdSllSDtQwr6ymWBQki
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const mode = searchParams.get("mode") ?? "search";
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  const headers = {
    "x-rapidapi-host": "spotify-scraper.p.rapidapi.com",
    "x-rapidapi-key": apiKey,
    "Content-Type": "application/json",
  };

  try {
    if (mode === "track") {
      // --- Lookup by track ID ---
      const trackId = searchParams.get("trackId")?.trim();
      if (!trackId) return Response.json({ error: "trackId required" }, { status: 400 });

      const cacheKey = `track:${trackId}`;
      const cached = getCached(cacheKey);
      if (cached) return Response.json(cached);

      const res = await fetchWithTimeout(
        `https://spotify-scraper.p.rapidapi.com/v1/track/metadata?trackId=${encodeURIComponent(trackId)}`,
        headers
      );

      if (!res.ok) {
        return Response.json({ error: `Spotify API returned ${res.status}` }, { status: 502 });
      }

      const raw = await res.json();
      if (!raw.status || !raw.id) {
        return Response.json({ error: "Track not found" }, { status: 404 });
      }

      const result = {
        id: raw.id,
        name: raw.name,
        shareUrl: raw.shareUrl,
        durationText: raw.durationText,
        playCount: raw.playCount ?? null,
        artists: (raw.artists || []).map((a: { name?: string; id?: string }) => ({
          name: a.name,
          id: a.id,
        })),
        cover: raw.album?.cover?.[raw.album.cover.length - 1]?.url || null,
        albumName: raw.album?.name || null,
      };

      setCache(cacheKey, result);
      return Response.json(result);
    }

    // --- Search by name ---
    const q = searchParams.get("q")?.trim();
    if (!q) return Response.json({ error: "q required" }, { status: 400 });

    const cacheKey = `search:${q.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) return Response.json(cached);

    const res = await fetchWithTimeout(
      `https://spotify-scraper.p.rapidapi.com/v1/track/search?name=${encodeURIComponent(q)}`,
      headers
    );

    if (!res.ok) {
      return Response.json({ error: `Spotify API returned ${res.status}` }, { status: 502 });
    }

    const raw = await res.json();
    if (!raw.status || !raw.id) {
      return Response.json({ error: "No track found" }, { status: 404 });
    }

    const result = {
      id: raw.id,
      name: raw.name,
      shareUrl: raw.shareUrl,
      durationText: raw.durationText,
      artists: (raw.artists || []).map((a: { name?: string; id?: string }) => ({
        name: a.name,
        id: a.id,
      })),
      cover: raw.album?.cover?.[raw.album.cover.length - 1]?.url || null,
      albumName: raw.album?.name || null,
    };

    setCache(cacheKey, result);
    return Response.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "Spotify API request timed out"
        : "Failed to fetch Spotify data";
    return Response.json({ error: message }, { status: 502 });
  }
}
