import type { Metadata } from "next";
import InstagramHomePage from "@/components/InstagramHomePage";
import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  return generatePageMetadata("instagram", await searchParams);
}

export default function InstagramPage() {
  return <InstagramHomePage />;
}
