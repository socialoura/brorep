import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import PostHogProviderWrapper from "@/components/PostHogProvider";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Fanovaly — Boostez votre croissance sur TikTok, YouTube & Spotify",
    template: "%s | Fanovaly",
  },
  description: "Développez votre audience sur TikTok, YouTube et Spotify. Croissance rapide et naturelle, paiement sécurisé par Stripe, support 24/7.",
  keywords: [
    "croissance tiktok", "boost tiktok", "développer audience tiktok",
    "croissance youtube", "boost youtube",
    "boost streams spotify", "croissance réseaux sociaux",
    "fanovaly", "stratégie réseaux sociaux", "promotion musicale spotify",
  ],
  authors: [{ name: "Fanovaly", url: "https://fanovaly.com" }],
  creator: "Fanovaly",
  publisher: "Fanovaly",
  icons: {
    icon: "/favicon.jpg",
  },
  metadataBase: new URL("https://fanovaly.com"),
  alternates: {
    canonical: "https://fanovaly.com",
  },
  openGraph: {
    title: "Fanovaly — Boostez votre croissance sur TikTok, YouTube & Spotify",
    description: "Développez votre audience sur TikTok, YouTube et Spotify. Croissance rapide et naturelle, paiement sécurisé.",
    url: "https://fanovaly.com",
    siteName: "Fanovaly",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fanovaly — Boostez votre croissance sur TikTok, YouTube & Spotify",
    description: "Développez votre audience sur TikTok, YouTube et Spotify. Croissance rapide et naturelle, paiement sécurisé.",
    site: "@fanovaly",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://fanovaly.com/#organization",
      name: "Fanovaly",
      url: "https://fanovaly.com",
      logo: "https://fanovaly.com/favicon.jpg",
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["French", "English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://fanovaly.com/#website",
      url: "https://fanovaly.com",
      name: "Fanovaly",
      publisher: { "@id": "https://fanovaly.com/#organization" },
      inLanguage: "fr-FR",
    },
    {
      "@type": "WebPage",
      "@id": "https://fanovaly.com/#webpage",
      url: "https://fanovaly.com",
      name: "Fanovaly — Boostez votre croissance sur TikTok, YouTube & Spotify",
      isPartOf: { "@id": "https://fanovaly.com/#website" },
      about: { "@id": "https://fanovaly.com/#organization" },
      inLanguage: "fr-FR",
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
          <main style={{ flex: 1 }}>{children}</main>
        </PostHogProviderWrapper>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
