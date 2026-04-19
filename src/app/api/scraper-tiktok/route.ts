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
  // Evict oldest if at limit
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { data, ts: Date.now() });
}

// --- Fetch with timeout ---
async function fetchWithTimeout(url: string, headers: Record<string, string>, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// --- Main handler ---
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

  // Check cache
  const cached = getCached(username);
  if (cached) {
    return Response.json(cached);
  }

  const headers = {
    "x-rapidapi-host": "tiktok-api23.p.rapidapi.com",
    "x-rapidapi-key": apiKey,
    "Content-Type": "application/json",
  };

  try {
    // ---- Step 1: Get user profile ----
    const profileUrl = `https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=${encodeURIComponent(username)}`;
    console.log("[scraper-tiktok] Fetching profile:", profileUrl);

    const profileRes = await fetchWithTimeout(profileUrl, headers);

    if (!profileRes.ok) {
      const errBody = await profileRes.text().catch(() => "");
      console.error("[scraper-tiktok] Profile API error:", profileRes.status, errBody);
      return Response.json(
        { error: `TikTok profile API returned ${profileRes.status}`, detail: errBody },
        { status: 502 }
      );
    }

    const profileData = await profileRes.json();
    console.log("[scraper-tiktok] Profile data keys:", Object.keys(profileData));

    // tiktok-api23 returns { userInfo: { user, stats } }
    const user = profileData.userInfo?.user ?? profileData.user;
    const stats = profileData.userInfo?.stats ?? profileData.stats;

    if (!user) {
      return Response.json(
        { error: "User not found on TikTok" },
        { status: 404 }
      );
    }

    const avatarUrl =
      user.avatarMedium ||
      user.avatarLarger ||
      user.avatarThumb ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&size=200`;

    const secUid = user.secUid;
    const userId = user.id;
    const fullName = user.nickname || username;
    const followersCount = stats?.followerCount ?? 0;
    const followingCount = stats?.followingCount ?? 0;
    const likesCount = stats?.heartCount ?? stats?.heart ?? 0;
    const videoCount = stats?.videoCount ?? 0;
    const bio = user.signature || "";
    const verified = user.verified ?? false;

    // ---- Step 2: Get 12 latest posts (best effort) ----
    let posts: Array<{
      id: string;
      imageUrl: string;
      caption: string;
      likesCount: number;
      commentsCount: number;
      viewsCount: number;
      isVideo: boolean;
    }> = [];

    if (secUid) {
      try {
        const postsRes = await fetchWithTimeout(
          `https://tiktok-api23.p.rapidapi.com/api/user/posts?secUid=${encodeURIComponent(secUid)}&count=12&cursor=0`,
          headers
        );

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          console.log("[scraper-tiktok] Posts data keys:", Object.keys(postsData));
          // tiktok-api23 returns { data: { itemList: [...] } }
          const rawPosts = Array.isArray(postsData.data?.itemList)
            ? postsData.data.itemList
            : Array.isArray(postsData.itemList)
              ? postsData.itemList
              : [];

          posts = rawPosts.slice(0, 12).map(
            (post: {
              id?: string;
              video?: { cover?: string; dynamicCover?: string; originCover?: string };
              desc?: string;
              stats?: { diggCount?: number; commentCount?: number; playCount?: number; collectCount?: number; shareCount?: number };
            }) => {
              const cover = post.video?.cover || post.video?.dynamicCover || post.video?.originCover || "";
              return {
                id: post.id || "",
                imageUrl: cover,
                caption: (post.desc || "").slice(0, 100),
                likesCount: post.stats?.diggCount ?? 0,
                commentsCount: post.stats?.commentCount ?? 0,
                viewsCount: post.stats?.playCount ?? 0,
                isVideo: true,
              };
            }
          );
        }
      } catch {
        // Best effort — posts stay empty
      }
    }

    // ---- Build response ----
    const result = {
      username,
      fullName,
      avatarUrl,
      followersCount,
      followingCount,
      likesCount,
      videoCount,
      bio,
      verified,
      posts,
    };

    setCache(username, result);
    return Response.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "TikTok API request timed out"
        : "Failed to fetch TikTok data";
    return Response.json({ error: message }, { status: 502 });
  }
}
