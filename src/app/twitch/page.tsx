import type { Metadata } from "next";
import TwitchHomePage from "@/components/TwitchHomePage";

export const metadata: Metadata = {
  title: "Booster votre chaîne Twitch — Followers et viewers live",
  description: "Développez votre chaîne Twitch avec plus de followers et de viewers live. Programmez votre stream, on s'occupe du reste. Paiement sécurisé Stripe.",
  keywords: [
    "boost twitch", "viewers twitch", "followers twitch",
    "augmenter viewers live", "promotion twitch",
    "stream twitch boost", "fanovaly twitch",
  ],
  alternates: {
    canonical: "https://fanovaly.com/twitch",
  },
  openGraph: {
    title: "Booster votre chaîne Twitch — Fanovaly",
    description: "Plus de followers et de viewers live sur ton stream Twitch. Paiement sécurisé.",
    url: "https://fanovaly.com/twitch",
    siteName: "Fanovaly",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Booster votre chaîne Twitch — Fanovaly",
    description: "Plus de followers et de viewers live sur ton stream Twitch.",
  },
};

export default function TwitchPage() {
  return <TwitchHomePage />;
}
