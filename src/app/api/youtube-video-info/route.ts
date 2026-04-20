import type { NextRequest } from "next/server";

// --- Simple in-memory cache ---
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;
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

/**
 * Extract YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
function extractVideoId(input: string): string | null {
  const trimmed = input.trim();

  // Direct video ID (11 chars, alphanumeric + _ -)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace("www.", "").replace("m.", "");

    if (host === "youtube.com") {
      // /watch?v=ID
      const v = url.searchParams.get("v");
      if (v) return v;
      // /shorts/ID or /embed/ID
      const match = url.pathname.match(/\/(shorts|embed)\/([a-zA-Z0-9_-]{11})/);
      if (match) return match[2];
    }

    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }
  } catch {
    // Not a valid URL
  }

  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawUrl = searchParams.get("url") ?? "";

  const videoId = extractVideoId(rawUrl);
  if (!videoId) {
    return Response.json({ error: "Lien YouTube invalide" }, { status: 400 });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  // Check cache
  const cached = getCached(videoId);
  if (cached) return Response.json(cached);

  const headers = {
    "x-rapidapi-host": "youtube138.p.rapidapi.com",
    "x-rapidapi-key": apiKey,
    "Content-Type": "application/json",
  };

  try {
    // youtube138 accepts full URL or video ID in the `id` param
    const res = await fetch(
      `https://youtube138.p.rapidapi.com/video/details/?id=${encodeURIComponent(videoId)}&hl=fr&gl=FR`,
      { headers, signal: AbortSignal.timeout(10000) }
    );

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[youtube-video-info] API error:", res.status, errBody);
      return Response.json({ error: "Vidéo introuvable" }, { status: 404 });
    }

    const data = await res.json();

    if (!data.videoId && !data.title) {
      return Response.json({ error: "Vidéo introuvable" }, { status: 404 });
    }

    const title = data.title || "";
    // Pick best thumbnail (last = highest res)
    const thumbnails = data.thumbnails || [];
    const thumbnail =
      thumbnails[thumbnails.length - 1]?.url ||
      thumbnails[0]?.url ||
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const viewCount = data.stats?.views ?? 0;
    const likeCount = data.stats?.likes ?? 0;
    const commentCount = data.stats?.comments ?? 0;
    const channelName = data.author?.title || "";
    const channelId = data.author?.channelId || "";
    // Pick best avatar (last = highest res)
    const avatars = data.author?.avatar || [];
    const channelAvatar = avatars[avatars.length - 1]?.url || avatars[0]?.url || "";
    const subscriberCount = data.author?.stats?.subscribers ?? 0;
    const duration = data.lengthSeconds || 0;
    const publishDate = data.publishedDate || "";

    const result = {
      videoId,
      title,
      thumbnail,
      viewCount: Number(viewCount),
      likeCount: Number(likeCount),
      commentCount: Number(commentCount),
      channelName,
      channelId,
      channelAvatar,
      subscriberCount: Number(subscriberCount),
      duration: Number(duration),
      publishDate,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };

    setCache(videoId, result);
    return Response.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "La requête YouTube a expiré"
        : "Impossible de récupérer les infos de la vidéo";
    return Response.json({ error: message }, { status: 502 });
  }
}
