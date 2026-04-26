import type { Metadata } from "next";
import YouTubeHomePage from "@/components/YouTubeHomePage";

export const metadata: Metadata = {
  title: "Booster votre chaîne YouTube — Croissance rapide & naturelle",
  description: "Développez votre chaîne YouTube avec une croissance rapide et naturelle. Boostez vos vues, likes et abonnés. Paiement sécurisé par Stripe, résultats visibles en 24h.",
  keywords: [
    "boost youtube", "croissance youtube", "augmenter vues youtube",
    "développer chaîne youtube", "promotion vidéo youtube",
    "plus de vues youtube", "fanovaly youtube",
  ],
  alternates: {
    canonical: "https://fanovaly.com/youtube",
  },
  openGraph: {
    title: "Booster votre chaîne YouTube — Fanovaly",
    description: "Développez votre chaîne YouTube avec une croissance rapide et naturelle. Paiement sécurisé.",
    url: "https://fanovaly.com/youtube",
    siteName: "Fanovaly",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Booster votre chaîne YouTube — Fanovaly",
    description: "Développez votre chaîne YouTube avec une croissance rapide et naturelle.",
  },
};

export default function YouTubePage() {
  return <YouTubeHomePage />;
}
