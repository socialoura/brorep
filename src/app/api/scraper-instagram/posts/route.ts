import { NextRequest, NextResponse } from "next/server";
import { postsStore } from "@/lib/instagram-posts-store";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.trim().toLowerCase().replace(/^@/, "");

  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  const entry = postsStore.get(username);

  if (!entry) {
    // No fetch was started for this user
    return NextResponse.json({ status: "not_found", posts: [] });
  }

  if (entry.status === "pending") {
    return NextResponse.json({ status: "pending", posts: [] });
  }

  if (entry.status === "error") {
    return NextResponse.json({ status: "error", posts: [] });
  }

  // Done
  return NextResponse.json({ status: "done", posts: entry.posts });
}
