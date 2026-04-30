import type { Metadata } from "next";
import InstagramHomePage from "@/components/InstagramHomePage";

export const metadata: Metadata = {
  title: "Booster votre compte Instagram — Followers, Likes & Vues",
  description: "Développez votre compte Instagram avec une croissance rapide et naturelle. Boostez vos followers, likes et vues. Paiement sécurisé par Stripe, résultats visibles en 24h.",
  keywords: [
    "boost instagram", "croissance instagram", "augmenter followers instagram",
    "développer compte instagram", "acheter followers instagram",
    "plus de likes instagram", "fanovaly instagram",
  ],
  alternates: {
    canonical: "https://fanovaly.com/instagram",
  },
  openGraph: {
    title: "Booster votre compte Instagram — Fanovaly",
    description: "Développez votre compte Instagram avec une croissance rapide et naturelle. Paiement sécurisé.",
    url: "https://fanovaly.com/instagram",
    siteName: "Fanovaly",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Booster votre compte Instagram — Fanovaly",
    description: "Développez votre compte Instagram avec une croissance rapide et naturelle.",
  },
};

export default function InstagramPage() {
  return <InstagramHomePage />;
}
