import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  return generatePageMetadata("tiktok", await searchParams);
}

export default function TikTokPage() {
  return <HomePage />;
}
