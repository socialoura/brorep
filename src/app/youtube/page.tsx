import type { Metadata } from "next";
import YouTubeHomePage from "@/components/YouTubeHomePage";

export const metadata: Metadata = {
  title: "Fanovaly — Analyse IA & stratégie de croissance YouTube",
  description: "Notre IA analyse ta vidéo YouTube en 30 secondes et te recommande un plan de croissance personnalisé pour développer ta chaîne et ton audience.",
  keywords: ["analyse vidéo youtube ia", "stratégie youtube", "développer chaîne youtube", "optimisation contenu youtube", "croissance audience youtube", "fanovaly"],
  openGraph: {
    title: "Fanovaly — Analyse IA & stratégie de croissance YouTube",
    description: "Notre IA analyse ta vidéo en 30s et crée un plan de croissance sur mesure pour ta chaîne YouTube.",
    url: "https://fanovaly.com/youtube",
    siteName: "Fanovaly",
    type: "website",
  },
};

export default function YouTubePage() {
  return <YouTubeHomePage />;
}
