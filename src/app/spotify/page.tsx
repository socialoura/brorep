import type { Metadata } from "next";
import SpotifyPage from "@/components/SpotifyPage";

export const metadata: Metadata = {
  title: "Fanovaly — Acheter des streams Spotify",
  description: "Booste tes streams Spotify avec une livraison progressive et naturelle. Paiement sécurisé par Stripe.",
  keywords: ["acheter streams spotify", "boost spotify", "streams spotify", "fanovaly spotify"],
  openGraph: {
    title: "Fanovaly — Acheter des streams Spotify",
    description: "Booste tes streams Spotify avec une livraison progressive et naturelle.",
    url: "https://fanovaly.com/spotify",
    siteName: "Fanovaly",
    type: "website",
  },
};

export default function SpotifyRoutePage() {
  return <SpotifyPage />;
}
