import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import PostHogProviderWrapper from "@/components/PostHogProvider";
import Footer from "@/components/Footer";
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
  title: "Fanovaly — IA d'analyse & croissance pour TikTok et Instagram",
  description: "Notre IA analyse ton profil TikTok ou Instagram en 30 secondes. Stratégie de croissance personnalisée, résultats rapides.",
  keywords: ["ia analyse profil", "croissance tiktok", "croissance instagram", "audit ia réseaux sociaux", "fanovaly", "intelligence artificielle social media"],
  authors: [{ name: "Fanovaly" }],
  icons: {
    icon: "/favicon.jpg",
  },
  metadataBase: new URL("https://fanovaly.com"),
  openGraph: {
    title: "Fanovaly — IA d'analyse & croissance pour TikTok et Instagram",
    description: "Notre IA analyse ton profil en 30s et te propose une stratégie de croissance personnalisée.",
    url: "https://fanovaly.com",
    siteName: "Fanovaly",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fanovaly — IA d'analyse & croissance pour TikTok et Instagram",
    description: "Notre IA analyse ton profil en 30s et te propose une stratégie de croissance personnalisée.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
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
        <Footer />
      </body>
    </html>
  );
}
