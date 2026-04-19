import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import PostHogProviderWrapper from "@/components/PostHogProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fanovaly — Analyse & croissance pour TikTok et Instagram",
  description: "Analyse ton profil TikTok ou Instagram en 30 secondes. Découvre ton potentiel de croissance et obtiens des recommandations personnalisées.",
  keywords: ["analyse profil", "croissance tiktok", "croissance instagram", "audit réseaux sociaux", "fanovaly"],
  authors: [{ name: "Fanovaly" }],
  icons: {
    icon: "/favicon.jpg",
  },
  metadataBase: new URL("https://fanovaly.com"),
  openGraph: {
    title: "Fanovaly — Analyse & croissance pour TikTok et Instagram",
    description: "Analyse gratuite de ton profil en 30 secondes. Découvre ton potentiel de croissance.",
    url: "https://fanovaly.com",
    siteName: "Fanovaly",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fanovaly — Analyse & croissance pour TikTok et Instagram",
    description: "Analyse gratuite de ton profil en 30 secondes. Découvre ton potentiel de croissance.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');
              `}
            </Script>
          </>
        )}
        <PostHogProviderWrapper>
          <div style={{ flex: 1 }}>{children}</div>
        </PostHogProviderWrapper>
        <footer style={{ background: "#050505", borderTop: "1px solid rgba(255,255,255,0.04)", padding: "24px 20px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginBottom: "8px" }}>
            <a href="/cgv" style={{ fontSize: "11px", color: "rgb(107, 117, 111)", textDecoration: "none" }}>CGV</a>
            <a href="/confidentialite" style={{ fontSize: "11px", color: "rgb(107, 117, 111)", textDecoration: "none" }}>Confidentialité</a>
            <a href="/mentions-legales" style={{ fontSize: "11px", color: "rgb(107, 117, 111)", textDecoration: "none" }}>Mentions légales</a>
            <a href="/remboursement" style={{ fontSize: "11px", color: "rgb(107, 117, 111)", textDecoration: "none" }}>Remboursement</a>
          </div>
          <p style={{ margin: 0, fontSize: "10px", color: "rgb(80, 80, 80)" }}>© {new Date().getFullYear()} Fanovaly — Tous droits réservés</p>
        </footer>
      </body>
    </html>
  );
}
