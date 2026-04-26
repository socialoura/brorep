import type { NextRequest } from "next/server";

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 3 * 60 * 1000;
const CACHE_MAX = 100;

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
    const res = await fetch(url, { headers, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawUsername = searchParams.get("username") ?? "";
  const username = rawUsername.replace(/^@/, "").trim().toLowerCase();

  if (!username) {
    return Response.json({ error: "Username is required" }, { status: 400 });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  const cached = getCached(`tw:${username}`);
  if (cached) {
    return Response.json(cached);
  }

  const headers = {
    "x-rapidapi-host": "twitch-data-api2.p.rapidapi.com",
    "x-rapidapi-key": apiKey,
    "Content-Type": "application/json",
  };

  try {
    const apiUrl = `https://twitch-data-api2.p.rapidapi.com/channels/${encodeURIComponent(username)}`;
    console.log("[scraper-twitch] Fetching channel:", apiUrl);

    const res = await fetchWithTimeout(apiUrl, headers);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[scraper-twitch] API error:", res.status, errBody);
      return Response.json(
        { error: `Twitch API returned ${res.status}`, detail: errBody },
        { status: res.status === 404 ? 404 : 502 }
      );
    }

    const data = await res.json();

    if (!data || !data.id) {
      return Response.json({ error: "Channel not found on Twitch" }, { status: 404 });
    }

    const result = {
      username: data.login || username,
      fullName: data.displayName || data.login || username,
      avatarUrl: data.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&size=200`,
      followersCount: 0, // not provided by this endpoint
      followingCount: 0,
      likesCount: 0,
      videoCount: 0,
      bio: data.description || "",
      verified: data.isPartner || false,
      isAffiliate: data.isAffiliate || false,
      primaryColorHex: data.primaryColorHex || "9147FF",
      offlineImageUrl: data.offlineImageUrl || "",
      lastBroadcastTitle: data.lastBroadcast?.title || "",
      lastBroadcastAt: data.lastBroadcast?.startedAt || "",
      isLive: !!data.stream,
      posts: [],
    };

    setCache(`tw:${username}`, result);
    return Response.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "Twitch API request timed out"
        : "Failed to fetch Twitch data";
    return Response.json({ error: message }, { status: 502 });
  }
}
