import type { Metadata } from "next";
import XHomePage from "@/components/XHomePage";

export const metadata: Metadata = {
  title: "Booster votre compte X (Twitter) — Croissance rapide & naturelle",
  description: "Développez votre compte X avec une croissance rapide et naturelle. Boostez vos followers, likes et retweets. Paiement sécurisé par Stripe, résultats visibles en 24h.",
  keywords: [
    "boost x", "boost twitter", "croissance x", "augmenter followers x",
    "développer compte twitter", "promotion x twitter",
    "plus de followers x", "fanovaly x", "acheter retweets",
  ],
  alternates: {
    canonical: "https://fanovaly.com/x",
  },
  openGraph: {
    title: "Booster votre compte X (Twitter) — Fanovaly",
    description: "Développez votre compte X avec une croissance rapide et naturelle. Paiement sécurisé.",
    url: "https://fanovaly.com/x",
    siteName: "Fanovaly",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Booster votre compte X (Twitter) — Fanovaly",
    description: "Développez votre compte X avec une croissance rapide et naturelle.",
  },
};

export default function XPage() {
  return <XHomePage />;
}
