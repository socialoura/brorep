import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculateur de croissance Instagram gratuit | Fanovaly",
  description: "Calcule combien de followers tu peux gagner en 30 jours et découvre le pack idéal pour booster ton profil Instagram.",
  openGraph: {
    title: "Calculateur de croissance Instagram gratuit | Fanovaly",
    description: "Outil gratuit : calcule ta croissance Instagram et trouve le pack idéal.",
    type: "website",
  },
  alternates: {
    canonical: "https://fanovaly.com/calculateur",
  },
};

export default function CalculateurLayout({ children }: { children: React.ReactNode }) {
  return children;
}
