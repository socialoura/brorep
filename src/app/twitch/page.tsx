import type { Metadata } from "next";
import TwitchHomePage from "@/components/TwitchHomePage";
import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  return generatePageMetadata("twitch", await searchParams);
}

export default function TwitchPage() {
  return <TwitchHomePage />;
}
