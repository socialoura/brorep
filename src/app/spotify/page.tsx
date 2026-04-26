import type { Metadata } from "next";
import SpotifyPage from "@/components/SpotifyPage";

export const metadata: Metadata = {
  title: "Booster vos streams Spotify — Croissance rapide & naturelle",
  description: "Boostez vos streams Spotify avec une croissance progressive et naturelle. Paiement sécurisé par Stripe, résultats visibles en 24-48h.",
  keywords: [
    "boost streams spotify", "croissance spotify", "augmenter streams spotify",
    "promotion musicale spotify", "plus d'écoutes spotify",
    "développer audience spotify", "fanovaly spotify",
  ],
  alternates: {
    canonical: "https://fanovaly.com/spotify",
  },
  openGraph: {
    title: "Booster vos streams Spotify — Fanovaly",
    description: "Boostez vos streams Spotify avec une croissance progressive et naturelle.",
    url: "https://fanovaly.com/spotify",
    siteName: "Fanovaly",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Booster vos streams Spotify — Fanovaly",
    description: "Boostez vos streams Spotify avec une croissance progressive et naturelle.",
  },
};

export default function SpotifyRoutePage() {
  return <SpotifyPage />;
}
