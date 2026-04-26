import type { NextRequest } from "next/server";

// --- Simple in-memory cache (LRU-ish, max 100 entries, 3 min TTL) ---
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes
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
  const username = rawUsername.replace(/^@/, "").trim();

  if (!username) {
    return Response.json({ error: "Username is required" }, { status: 400 });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  // Check cache
  const cached = getCached(`x:${username}`);
  if (cached) {
    return Response.json(cached);
  }

  const headers = {
    "x-rapidapi-host": "twitter-api45.p.rapidapi.com",
    "x-rapidapi-key": apiKey,
    "Content-Type": "application/json",
  };

  try {
    const apiUrl = `https://twitter-api45.p.rapidapi.com/replies.php?screenname=${encodeURIComponent(username)}`;
    console.log("[scraper-x] Fetching timeline:", apiUrl);

    const res = await fetchWithTimeout(apiUrl, headers);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[scraper-x] API error:", res.status, errBody);
      return Response.json(
        { error: `X API returned ${res.status}`, detail: errBody },
        { status: 502 }
      );
    }

    const data = await res.json();

    // Extract user profile
    const user = data.user;
    if (!user) {
      return Response.json({ error: "User not found on X" }, { status: 404 });
    }

    const avatarUrl = user.avatar
      ? user.avatar.replace("_normal", "_400x400")
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&size=200`;

    const fullName = user.name || username;
    const followersCount = user.sub_count || user.friends || 0;
    const followingCount = user.friends || 0;
    const bio = user.desc || "";
    const verified = user.blue_verified || false;
    const tweetCount = user.statuses_count || 0;

    // Extract posts (tweets) — filter to only author's own tweets, skip pure RTs
    const timeline = Array.isArray(data.timeline) ? data.timeline : [];
    const posts = timeline
      .filter((tweet: { author?: { screen_name?: string }; text?: string }) => {
        // Only include tweets authored by this user
        if (tweet.author?.screen_name?.toLowerCase() !== username.toLowerCase()) return false;
        // Skip pure retweets (text starts with "RT @")
        if (tweet.text?.startsWith("RT @")) return false;
        return true;
      })
      .slice(0, 12)
      .map((tweet: {
        tweet_id?: string;
        text?: string;
        favorites?: number;
        views?: string | number;
        retweets?: number;
        bookmarks?: number;
        media?: { photo?: { media_url_https?: string }[]; video?: { media_url_https?: string }[] } | unknown[];
        quoted?: { text?: string; media?: { photo?: { media_url_https?: string }[]; video?: { media_url_https?: string }[] } };
      }) => {
        // Try to extract a thumbnail image
        let imageUrl = "";
        const media = tweet.media;
        if (media && !Array.isArray(media)) {
          if (media.photo?.[0]?.media_url_https) {
            imageUrl = media.photo[0].media_url_https;
          } else if (media.video?.[0]?.media_url_https) {
            imageUrl = media.video[0].media_url_https;
          }
        }
        // Fallback to quoted tweet media
        if (!imageUrl && tweet.quoted?.media) {
          const qm = tweet.quoted.media;
          if (qm && !Array.isArray(qm)) {
            if (qm.photo?.[0]?.media_url_https) {
              imageUrl = qm.photo[0].media_url_https;
            } else if (qm.video?.[0]?.media_url_https) {
              imageUrl = qm.video[0].media_url_https;
            }
          }
        }

        return {
          id: tweet.tweet_id || "",
          imageUrl,
          caption: (tweet.text || "").slice(0, 140),
          likesCount: tweet.favorites || 0,
          commentsCount: 0,
          viewsCount: typeof tweet.views === "string" ? parseInt(tweet.views, 10) || 0 : (tweet.views || 0),
          retweetsCount: tweet.retweets || 0,
          isVideo: false,
        };
      });

    const result = {
      username: user.id ? username : username,
      fullName,
      avatarUrl,
      followersCount,
      followingCount,
      likesCount: user.favourites_count || 0,
      videoCount: tweetCount,
      bio,
      verified,
      posts,
    };

    setCache(`x:${username}`, result);
    return Response.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "X API request timed out"
        : "Failed to fetch X data";
    return Response.json({ error: message }, { status: 502 });
  }
}
