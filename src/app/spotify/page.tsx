import type { Metadata } from "next";
import SpotifyPage from "@/components/SpotifyPage";
import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  return generatePageMetadata("spotify", await searchParams);
}

export default function SpotifyRoutePage() {
  return <SpotifyPage />;
}
