import type { Metadata } from "next";
import XHomePage from "@/components/XHomePage";
import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  return generatePageMetadata("x", await searchParams);
}

export default function XPage() {
  return <XHomePage />;
}
