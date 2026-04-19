import type { NextRequest } from "next/server";

// --- Simple in-memory cache (LRU-ish, max 100 entries, 3 min TTL) ---
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 3 * 60 * 1000;
const CACHE_MAX = 100;

function getCached(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawInput = searchParams.get("username") ?? "";
  // Accept @handle, channel URL slug, or plain handle
  const handle = rawInput.replace(/^@/, "").trim();

  if (!handle) {
    return Response.json({ error: "Username or channel handle is required" }, { status: 400 });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  // Check cache
  const cached = getCached(handle);
  if (cached) return Response.json(cached);

  const headers = {
    "x-rapidapi-host": "youtube-v2.p.rapidapi.com",
    "x-rapidapi-key": apiKey,
    "Content-Type": "application/json",
  };

  try {
    // ---- Step 1: Search for channel by handle ----
    const searchUrl = `https://youtube-v2.p.rapidapi.com/search/?query=${encodeURIComponent("@" + handle)}&lang=fr&order_by=relevance&country=fr`;
    console.log("[scraper-youtube] Searching channel:", searchUrl);

    const searchRes = await fetchWithTimeout(searchUrl, headers);
    if (!searchRes.ok) {
      const errBody = await searchRes.text().catch(() => "");
      console.error("[scraper-youtube] Search API error:", searchRes.status, errBody);
      return Response.json({ error: `YouTube search API returned ${searchRes.status}` }, { status: 502 });
    }

    const searchData = await searchRes.json();
    // Find the channel in results
    const channels = searchData.channels || searchData.results?.filter((r: { type?: string }) => r.type === "channel") || [];
    const channel = channels[0];

    if (!channel) {
      // Try direct channel info as fallback
      return Response.json({ error: "Chaîne YouTube introuvable" }, { status: 404 });
    }

    const channelId = channel.channel_id || channel.channelId || channel.id;

    if (!channelId) {
      return Response.json({ error: "Chaîne YouTube introuvable" }, { status: 404 });
    }

    // ---- Step 2: Get channel details ----
    const channelUrl = `https://youtube-v2.p.rapidapi.com/channel/details?channel_id=${encodeURIComponent(channelId)}`;
    console.log("[scraper-youtube] Fetching channel details:", channelUrl);

    const channelRes = await fetchWithTimeout(channelUrl, headers);
    if (!channelRes.ok) {
      const errBody = await channelRes.text().catch(() => "");
      console.error("[scraper-youtube] Channel API error:", channelRes.status, errBody);
      return Response.json({ error: `YouTube channel API returned ${channelRes.status}` }, { status: 502 });
    }

    const channelData = await channelRes.json();
    const info = channelData;

    const username = info.handle || info.custom_url || handle;
    const fullName = info.title || info.name || handle;
    const avatarUrl = info.avatar?.[0]?.url || info.thumbnail || info.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(handle)}&background=random&size=200`;
    const subscriberCount = info.subscriber_count || info.subscriberCount || 0;
    const videoCount = info.video_count || info.videoCount || 0;
    const viewCount = info.view_count || info.viewCount || 0;
    const bio = info.description || "";
    const verified = info.is_verified ?? false;

    // ---- Step 3: Get latest videos (best effort) ----
    let posts: Array<{
      id: string;
      imageUrl: string;
      caption: string;
      likesCount: number;
      commentsCount: number;
      viewsCount: number;
      isVideo: boolean;
    }> = [];

    try {
      const videosUrl = `https://youtube-v2.p.rapidapi.com/channel/videos?channel_id=${encodeURIComponent(channelId)}`;
      const videosRes = await fetchWithTimeout(videosUrl, headers);
      if (videosRes.ok) {
        const videosData = await videosRes.json();
        const rawVideos = videosData.videos || videosData.items || [];
        posts = rawVideos.slice(0, 12).map((v: Record<string, unknown>) => ({
          id: (v.video_id || v.videoId || v.id || "") as string,
          imageUrl: ((v.thumbnail as Record<string, unknown>[])?.[0]?.url || v.thumbnailUrl || v.thumbnail || "") as string,
          caption: ((v.title || "") as string).slice(0, 100),
          likesCount: (v.like_count || v.likeCount || 0) as number,
          commentsCount: (v.comment_count || v.commentCount || 0) as number,
          viewsCount: (v.view_count || v.viewCount || 0) as number,
          isVideo: true,
        }));
      }
    } catch {
      // Best effort — posts stay empty
    }

    // ---- Build response ----
    const result = {
      username: (username as string).replace(/^@/, ""),
      fullName,
      avatarUrl,
      followersCount: subscriberCount,
      followingCount: 0,
      likesCount: viewCount,
      videoCount,
      bio,
      verified,
      posts,
    };

    setCache(handle, result);
    return Response.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error && err.name === "AbortError"
      ? "YouTube API request timed out"
      : "Failed to fetch YouTube data";
    return Response.json({ error: message }, { status: 502 });
  }
}
