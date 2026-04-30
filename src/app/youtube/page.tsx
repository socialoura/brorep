import type { Metadata } from "next";
import YouTubeHomePage from "@/components/YouTubeHomePage";
import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  return generatePageMetadata("youtube", await searchParams);
}

export default function YouTubePage() {
  return <YouTubeHomePage />;
}
