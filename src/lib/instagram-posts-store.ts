export interface PostsCacheEntry {
  posts: unknown[];
  ts: number;
  status: "pending" | "done" | "error";
}

// Shared in-memory store for Instagram posts (background fetch + polling)
export const postsStore = new Map<string, PostsCacheEntry>();
