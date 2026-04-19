import { NextRequest, NextResponse } from "next/server";
import { postsStore } from "@/lib/instagram-posts-store";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const HOST = "instagram120.p.rapidapi.com";

/* ── In-memory cache ── */
interface CacheEntry {
  data: Record<string, unknown>;
  ts: number;
}
const profileCache = new Map<string, CacheEntry>();
const CACHE_TTL = 3 * 60 * 1000; // 3 min

function proxyUrl(url: string): string {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

/* ── Background posts fetcher ── */
async function fetchPostsInBackground(username: string) {
  postsStore.set(username, { posts: [], ts: Date.now(), status: "pending" });

  try {
    const res = await fetch(`https://${HOST}/api/instagram/posts`, {
      method: "POST",
      headers: {
        "x-rapidapi-host": HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, maxId: "" }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      console.error("Instagram posts API error:", res.status);
      postsStore.set(username, { posts: [], ts: Date.now(), status: "error" });
      return;
    }

    const json = await res.json();
    const raw = json?.result?.edges || json?.edges || [];

    const posts = raw.slice(0, 12).map((edge: Record<string, unknown>) => {
      const node = (edge as { node?: Record<string, unknown> }).node || edge;
      const n = node as Record<string, unknown>;

      // Image URL
      const candidates = (
        (n.image_versions2 as { candidates?: { url: string }[] })?.candidates
      );
      const imageRaw =
        candidates?.[0]?.url ||
        (n.display_url as string) ||
        "";

      const caption = n.caption as { text?: string } | null;

      return {
        id: String(n.id || n.code || ""),
        imageUrl: imageRaw ? proxyUrl(imageRaw) : "",
        caption: (caption?.text || "").slice(0, 150),
        likesCount: Number(n.like_count || 0),
        commentsCount: Number(n.comment_count || 0),
        viewsCount: Number(n.video_view_count || 0),
        isVideo: Boolean(n.is_video),
      };
    });

    postsStore.set(username, { posts, ts: Date.now(), status: "done" });
  } catch (err) {
    console.error("Instagram posts background fetch error:", err);
    postsStore.set(username, { posts: [], ts: Date.now(), status: "error" });
  }
}

/* ── GET handler: fetch profile ── */
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.trim().toLowerCase().replace(/^@/, "");

  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  // Check cache
  const cached = profileCache.get(username);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    // Fetch profile
    const profileRes = await fetch(`https://${HOST}/api/instagram/profile`, {
      method: "POST",
      headers: {
        "x-rapidapi-host": HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
      signal: AbortSignal.timeout(8000),
    });

    if (!profileRes.ok) {
      // Try search fallback on 404
      if (profileRes.status === 404) {
        const suggestion = await searchFallback(username);
        if (suggestion) {
          return NextResponse.json(
            { error: "not_found", suggestion },
            { status: 404 }
          );
        }
      }
      return NextResponse.json(
        { error: `Instagram API error: ${profileRes.status}` },
        { status: profileRes.status }
      );
    }

    const json = await profileRes.json();
    const r = json?.result || json;

    if (r.is_private) {
      return NextResponse.json({ error: "Ce compte est privé" }, { status: 403 });
    }

    // Avatar — proxy it
    const avatarRaw =
      r.profile_pic_url_hd ||
      r.profile_pic_url ||
      "";
    const avatarUrl = avatarRaw
      ? proxyUrl(avatarRaw)
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(r.full_name || username)}&background=0e1512&color=00ff4c&size=200`;

    const data = {
      username: r.username || username,
      fullName: r.full_name || username,
      avatarUrl,
      followersCount: Number(r.follower_count || r?.edge_followed_by?.count || 0),
      followingCount: Number(r.following_count || r?.edge_follow?.count || 0),
      likesCount: 0, // Instagram doesn't expose total likes
      videoCount: Number(r.media_count || r?.edge_owner_to_timeline_media?.count || 0),
      bio: String(r.biography || ""),
      verified: Boolean(r.is_verified),
      posts: [] as unknown[], // posts come via polling
    };

    profileCache.set(username, { data, ts: Date.now() });

    // Start background posts fetch
    fetchPostsInBackground(username);

    return NextResponse.json(data);
  } catch (err) {
    console.error("Instagram profile error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Instagram fetch failed" },
      { status: 500 }
    );
  }
}

/* ── Search fallback ── */
async function searchFallback(query: string): Promise<string | null> {
  try {
    const res = await fetch(`https://${HOST}/api/instagram/search`, {
      method: "POST",
      headers: {
        "x-rapidapi-host": HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const users = json?.result || json || [];
    if (Array.isArray(users) && users.length > 0) {
      return users[0].username || null;
    }
    return null;
  } catch {
    return null;
  }
}
