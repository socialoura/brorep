import type { Metadata } from "next";
import YouTubeHomePage from "@/components/YouTubeHomePage";

export const metadata: Metadata = {
  title: "Fanovaly — Croissance YouTube | Abonnés, Likes & Vues",
  description: "Analyse ta chaîne YouTube et booste ta croissance. Abonnés, likes et vues — résultats rapides et sécurisés.",
  keywords: ["youtube abonnés", "croissance youtube", "vues youtube", "likes youtube", "fanovaly"],
  openGraph: {
    title: "Fanovaly — Croissance YouTube",
    description: "Analyse ta chaîne YouTube et booste ta croissance.",
    url: "https://fanovaly.com/youtube",
    siteName: "Fanovaly",
    type: "website",
  },
};

export default function YouTubePage() {
  return <YouTubeHomePage />;
}
