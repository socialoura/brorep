import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import Script from "next/script";
import dynamic from "next/dynamic";
import PostHogProviderWrapper from "@/components/PostHogProvider";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import Footer from "@/components/Footer";
import type { Currency } from "@/lib/i18n";
import "./globals.css";

const ChatWidget = dynamic(() => import("@/components/ChatWidget"));
const VisitTracker = dynamic(() => import("@/components/VisitTracker"));

const VALID_CURRENCIES: Currency[] = ["eur", "usd", "gbp", "cad", "nzd", "aud", "chf"];

const COUNTRY_TO_LANG: Record<string, string> = {
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es",
  BR: "pt", PT: "pt",
  DE: "de", AT: "de",
};

const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  GB: "gbp", IM: "gbp", JE: "gbp", GG: "gbp",
  US: "usd", PR: "usd", VI: "usd", AS: "usd", GU: "usd", MP: "usd",
  EC: "usd", SV: "usd", PA: "usd", TL: "usd", FM: "usd", MH: "usd", PW: "usd",
  CA: "cad",
  NZ: "nzd",
  AU: "aud",
  CH: "chf", LI: "chf",
  AT: "eur", BE: "eur", CY: "eur", DE: "eur", EE: "eur", ES: "eur", FI: "eur",
  FR: "eur", GR: "eur", HR: "eur", IE: "eur", IT: "eur", LT: "eur", LU: "eur",
  LV: "eur", MT: "eur", NL: "eur", PT: "eur", SI: "eur", SK: "eur",
  AD: "eur", MC: "eur", SM: "eur", VA: "eur", ME: "eur", XK: "eur",
};

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
    default: "Fanovaly — Boostez votre croissance TikTok & YouTube",
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
    title: "Fanovaly — Boostez votre croissance TikTok & YouTube",
    description: "Développez votre audience sur TikTok, YouTube et Spotify. Croissance rapide et naturelle, paiement sécurisé.",
    url: "https://fanovaly.com",
    siteName: "Fanovaly",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fanovaly — Boostez votre croissance TikTok & YouTube",
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
        availableLanguage: ["French", "English", "Spanish", "Portuguese", "German"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const country = (headerStore.get("x-vercel-ip-country") || "").toUpperCase();

  const cookieCurrency = cookieStore.get("currency")?.value;
  let detectedCurrency: Currency | null = null;
  if (cookieCurrency && VALID_CURRENCIES.includes(cookieCurrency as Currency)) {
    detectedCurrency = cookieCurrency as Currency;
  } else {
    if (country && COUNTRY_TO_CURRENCY[country]) {
      detectedCurrency = COUNTRY_TO_CURRENCY[country];
    }
  }

  const detectedLang: string | null = country && COUNTRY_TO_LANG[country] ? COUNTRY_TO_LANG[country] : null;

  // Determine html lang from URL ?lang= param via referer header, fallback to detected or "fr"
  const referer = headerStore.get("referer") || "";
  const langMatch = referer.match(/[?&]lang=(en|es|pt|de)/);
  const htmlLang = langMatch ? langMatch[1] : (detectedLang || "fr");

  return (
    <html
      lang={htmlLang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-detected-lang={detectedLang || ""}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`}
              strategy="lazyOnload"
            />
            <Script id="gtag-init" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');
              `}
            </Script>
          </>
        )}
        {/* Auto-redirect first-time visitors to their detected language */}
        {detectedLang && (
          <Script id="lang-redirect" strategy="beforeInteractive">
            {`
              (function(){
                try {
                  if (sessionStorage.getItem('lang_redirected')) return;
                  var sp = new URLSearchParams(window.location.search);
                  if (sp.get('lang')) return;
                  sessionStorage.setItem('lang_redirected','1');
                  sp.set('lang','${detectedLang}');
                  window.location.replace(window.location.pathname + '?' + sp.toString() + window.location.hash);
                } catch(e){}
              })();
            `}
          </Script>
        )}
        <CurrencyProvider initial={detectedCurrency}>
          <PostHogProviderWrapper>
            <main style={{ flex: 1 }}>{children}</main>
          </PostHogProviderWrapper>
          <Footer />
          <ChatWidget />
          <VisitTracker />
        </CurrencyProvider>
      </body>
    </html>
  );
}
