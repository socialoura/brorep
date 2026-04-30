import type { Metadata } from "next";

type Lang = "fr" | "en" | "es" | "pt" | "de";

function getLang(searchParams: Record<string, string | string[] | undefined>): Lang {
  const l = typeof searchParams.lang === "string" ? searchParams.lang : undefined;
  if (l === "en" || l === "es" || l === "pt" || l === "de") return l;
  return "fr";
}

const LOCALE_MAP: Record<Lang, string> = {
  fr: "fr_FR", en: "en_US", es: "es_ES", pt: "pt_BR", de: "de_DE",
};

// ──────── Page metadata translations ────────

interface PageMeta {
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  keywords: Record<Lang, string[]>;
  ogTitle: Record<Lang, string>;
  ogDescription: Record<Lang, string>;
  twitterTitle: Record<Lang, string>;
  twitterDescription: Record<Lang, string>;
  canonical: string;
}

const pages: Record<string, PageMeta> = {
  home: {
    title: {
      fr: "Fanovaly — Boostez votre croissance TikTok & YouTube",
      en: "Fanovaly — Boost your TikTok, YouTube & Spotify growth",
      es: "Fanovaly — Impulsa tu crecimiento en TikTok y YouTube",
      pt: "Fanovaly — Impulsione seu crescimento no TikTok",
      de: "Fanovaly — TikTok, YouTube & Spotify Wachstum boosten",
    },
    description: {
      fr: "Développez votre audience sur TikTok, YouTube et Spotify. Croissance rapide et naturelle, paiement sécurisé par Stripe, support 24/7.",
      en: "Grow your audience on TikTok, YouTube and Spotify. Fast and natural growth, secure Stripe payment, 24/7 support.",
      es: "Haz crecer tu audiencia en TikTok, YouTube y Spotify. Crecimiento rápido y natural, pago seguro con Stripe, soporte 24/7.",
      pt: "Aumente sua audiência no TikTok, YouTube e Spotify. Crescimento rápido e natural, pagamento seguro via Stripe, suporte 24/7.",
      de: "Steigere deine Reichweite auf TikTok, YouTube und Spotify. Schnelles und natürliches Wachstum, sichere Zahlung via Stripe, 24/7-Support.",
    },
    keywords: {
      fr: ["croissance tiktok", "boost tiktok", "développer audience tiktok", "croissance youtube", "boost youtube", "boost streams spotify", "fanovaly"],
      en: ["tiktok growth", "boost tiktok", "grow tiktok audience", "youtube growth", "boost youtube", "spotify streams boost", "fanovaly"],
      es: ["crecimiento tiktok", "impulsar tiktok", "crecer audiencia tiktok", "crecimiento youtube", "impulsar youtube", "streams spotify", "fanovaly"],
      pt: ["crescimento tiktok", "impulsionar tiktok", "aumentar audiência tiktok", "crescimento youtube", "impulsionar youtube", "streams spotify", "fanovaly"],
      de: ["tiktok wachstum", "tiktok boosten", "tiktok reichweite", "youtube wachstum", "youtube boosten", "spotify streams boosten", "fanovaly"],
    },
    ogTitle: {
      fr: "Fanovaly — Boostez votre croissance TikTok & YouTube",
      en: "Fanovaly — Boost your TikTok, YouTube & Spotify growth",
      es: "Fanovaly — Impulsa tu crecimiento en TikTok y YouTube",
      pt: "Fanovaly — Impulsione seu crescimento no TikTok",
      de: "Fanovaly — TikTok, YouTube & Spotify Wachstum boosten",
    },
    ogDescription: {
      fr: "Développez votre audience sur TikTok, YouTube et Spotify. Croissance rapide et naturelle, paiement sécurisé.",
      en: "Grow your audience on TikTok, YouTube and Spotify. Fast and natural growth, secure payment.",
      es: "Haz crecer tu audiencia en TikTok, YouTube y Spotify. Crecimiento rápido y natural, pago seguro.",
      pt: "Aumente sua audiência no TikTok, YouTube e Spotify. Crescimento rápido e natural, pagamento seguro.",
      de: "Steigere deine Reichweite auf TikTok, YouTube und Spotify. Schnelles Wachstum, sichere Zahlung.",
    },
    twitterTitle: {
      fr: "Fanovaly — Boostez votre croissance TikTok & YouTube",
      en: "Fanovaly — Boost your TikTok, YouTube & Spotify growth",
      es: "Fanovaly — Impulsa tu crecimiento en TikTok y YouTube",
      pt: "Fanovaly — Impulsione seu crescimento no TikTok",
      de: "Fanovaly — TikTok, YouTube & Spotify Wachstum boosten",
    },
    twitterDescription: {
      fr: "Développez votre audience sur TikTok, YouTube et Spotify. Croissance rapide et naturelle, paiement sécurisé.",
      en: "Grow your audience on TikTok, YouTube and Spotify. Fast and natural growth, secure payment.",
      es: "Haz crecer tu audiencia en TikTok, YouTube y Spotify. Crecimiento rápido y natural, pago seguro.",
      pt: "Aumente sua audiência no TikTok, YouTube e Spotify. Crescimento rápido e natural, pagamento seguro.",
      de: "Steigere deine Reichweite auf TikTok, YouTube und Spotify. Schnelles Wachstum, sichere Zahlung.",
    },
    canonical: "https://fanovaly.com",
  },
  instagram: {
    title: {
      fr: "Booster votre compte Instagram — Followers, Likes & Vues",
      en: "Boost your Instagram account — Followers, Likes & Views",
      es: "Impulsa tu cuenta de Instagram — Seguidores, Likes y Vistas",
      pt: "Impulsione sua conta Instagram — Seguidores e Likes",
      de: "Booste dein Instagram-Konto — Follower, Likes & Aufrufe",
    },
    description: {
      fr: "Développez votre compte Instagram avec une croissance rapide et naturelle. Followers, likes et vues. Paiement sécurisé Stripe, résultats en 24h.",
      en: "Grow your Instagram account with fast and natural growth. Boost your followers, likes and views. Secure Stripe payment, results visible in 24h.",
      es: "Haz crecer tu cuenta de Instagram con crecimiento rápido y natural. Seguidores, likes y vistas. Pago seguro con Stripe, resultados en 24h.",
      pt: "Aumente sua conta Instagram com crescimento rápido e natural. Seguidores, likes e views. Pagamento seguro Stripe, resultados em 24h.",
      de: "Steigere dein Instagram-Konto mit schnellem und natürlichem Wachstum. Booste Follower, Likes und Aufrufe. Sichere Zahlung via Stripe, Ergebnisse in 24h.",
    },
    keywords: {
      fr: ["boost instagram", "croissance instagram", "augmenter followers instagram", "développer compte instagram", "fanovaly instagram"],
      en: ["boost instagram", "instagram growth", "increase instagram followers", "grow instagram account", "fanovaly instagram"],
      es: ["impulsar instagram", "crecimiento instagram", "aumentar seguidores instagram", "crecer cuenta instagram", "fanovaly instagram"],
      pt: ["impulsionar instagram", "crescimento instagram", "aumentar seguidores instagram", "crescer conta instagram", "fanovaly instagram"],
      de: ["instagram boosten", "instagram wachstum", "instagram follower steigern", "instagram konto ausbauen", "fanovaly instagram"],
    },
    ogTitle: {
      fr: "Booster votre compte Instagram — Fanovaly",
      en: "Boost your Instagram account — Fanovaly",
      es: "Impulsa tu cuenta de Instagram — Fanovaly",
      pt: "Impulsione sua conta do Instagram — Fanovaly",
      de: "Booste dein Instagram-Konto — Fanovaly",
    },
    ogDescription: {
      fr: "Développez votre compte Instagram avec une croissance rapide et naturelle. Paiement sécurisé.",
      en: "Grow your Instagram account with fast and natural growth. Secure payment.",
      es: "Haz crecer tu cuenta de Instagram con un crecimiento rápido y natural. Pago seguro.",
      pt: "Aumente sua conta do Instagram com crescimento rápido e natural. Pagamento seguro.",
      de: "Steigere dein Instagram-Konto mit schnellem und natürlichem Wachstum. Sichere Zahlung.",
    },
    twitterTitle: {
      fr: "Booster votre compte Instagram — Fanovaly",
      en: "Boost your Instagram account — Fanovaly",
      es: "Impulsa tu cuenta de Instagram — Fanovaly",
      pt: "Impulsione sua conta do Instagram — Fanovaly",
      de: "Booste dein Instagram-Konto — Fanovaly",
    },
    twitterDescription: {
      fr: "Développez votre compte Instagram avec une croissance rapide et naturelle.",
      en: "Grow your Instagram account with fast and natural growth.",
      es: "Haz crecer tu cuenta de Instagram con un crecimiento rápido y natural.",
      pt: "Aumente sua conta do Instagram com crescimento rápido e natural.",
      de: "Steigere dein Instagram-Konto mit schnellem und natürlichem Wachstum.",
    },
    canonical: "https://fanovaly.com/instagram",
  },
  youtube: {
    title: {
      fr: "Booster votre chaîne YouTube — Croissance rapide & naturelle",
      en: "Boost your YouTube channel — Fast & natural growth",
      es: "Impulsa tu canal de YouTube — Crecimiento rápido y natural",
      pt: "Impulsione seu canal YouTube — Crescimento rápido",
      de: "Booste deinen YouTube-Kanal — Schnelles Wachstum",
    },
    description: {
      fr: "Développez votre chaîne YouTube avec une croissance rapide et naturelle. Vues, likes et abonnés. Paiement sécurisé Stripe, résultats en 24h.",
      en: "Grow your YouTube channel with fast and natural growth. Boost your views, likes and subscribers. Secure Stripe payment, results visible in 24h.",
      es: "Haz crecer tu canal YouTube con crecimiento rápido y natural. Vistas, likes y suscriptores. Pago seguro con Stripe, resultados en 24h.",
      pt: "Aumente seu canal YouTube com crescimento rápido e natural. Views, likes e inscritos. Pagamento seguro Stripe, resultados em 24h.",
      de: "Steigere deinen YouTube-Kanal mit schnellem und natürlichem Wachstum. Booste Aufrufe, Likes und Abonnenten. Sichere Zahlung via Stripe, Ergebnisse in 24h.",
    },
    keywords: {
      fr: ["boost youtube", "croissance youtube", "augmenter vues youtube", "développer chaîne youtube", "fanovaly youtube"],
      en: ["boost youtube", "youtube growth", "increase youtube views", "grow youtube channel", "fanovaly youtube"],
      es: ["impulsar youtube", "crecimiento youtube", "aumentar vistas youtube", "crecer canal youtube", "fanovaly youtube"],
      pt: ["impulsionar youtube", "crescimento youtube", "aumentar views youtube", "crescer canal youtube", "fanovaly youtube"],
      de: ["youtube boosten", "youtube wachstum", "youtube aufrufe steigern", "youtube kanal ausbauen", "fanovaly youtube"],
    },
    ogTitle: {
      fr: "Booster votre chaîne YouTube — Fanovaly",
      en: "Boost your YouTube channel — Fanovaly",
      es: "Impulsa tu canal de YouTube — Fanovaly",
      pt: "Impulsione seu canal do YouTube — Fanovaly",
      de: "Booste deinen YouTube-Kanal — Fanovaly",
    },
    ogDescription: {
      fr: "Développez votre chaîne YouTube avec une croissance rapide et naturelle. Paiement sécurisé.",
      en: "Grow your YouTube channel with fast and natural growth. Secure payment.",
      es: "Haz crecer tu canal de YouTube con un crecimiento rápido y natural. Pago seguro.",
      pt: "Aumente seu canal do YouTube com crescimento rápido e natural. Pagamento seguro.",
      de: "Steigere deinen YouTube-Kanal mit schnellem und natürlichem Wachstum. Sichere Zahlung.",
    },
    twitterTitle: {
      fr: "Booster votre chaîne YouTube — Fanovaly",
      en: "Boost your YouTube channel — Fanovaly",
      es: "Impulsa tu canal de YouTube — Fanovaly",
      pt: "Impulsione seu canal do YouTube — Fanovaly",
      de: "Booste deinen YouTube-Kanal — Fanovaly",
    },
    twitterDescription: {
      fr: "Développez votre chaîne YouTube avec une croissance rapide et naturelle.",
      en: "Grow your YouTube channel with fast and natural growth.",
      es: "Haz crecer tu canal de YouTube con un crecimiento rápido y natural.",
      pt: "Aumente seu canal do YouTube com crescimento rápido e natural.",
      de: "Steigere deinen YouTube-Kanal mit schnellem und natürlichem Wachstum.",
    },
    canonical: "https://fanovaly.com/youtube",
  },
  x: {
    title: {
      fr: "Booster votre compte X (Twitter) — Croissance rapide",
      en: "Boost your X (Twitter) account — Fast & natural growth",
      es: "Impulsa tu cuenta X (Twitter) — Crecimiento rápido",
      pt: "Impulsione sua conta X (Twitter) — Crescimento rápido",
      de: "Booste dein X-Konto (Twitter) — Schnelles Wachstum",
    },
    description: {
      fr: "Développez votre compte X avec une croissance rapide et naturelle. Followers, likes et retweets. Paiement sécurisé Stripe, résultats en 24h.",
      en: "Grow your X account with fast and natural growth. Boost your followers, likes and retweets. Secure Stripe payment, results visible in 24h.",
      es: "Haz crecer tu cuenta de X con un crecimiento rápido y natural. Impulsa tus seguidores, likes y retweets. Pago seguro con Stripe, resultados visibles en 24h.",
      pt: "Aumente sua conta do X com crescimento rápido e natural. Impulsione seus seguidores, likes e retweets. Pagamento seguro via Stripe, resultados visíveis em 24h.",
      de: "Steigere dein X-Konto mit schnellem und natürlichem Wachstum. Booste Follower, Likes und Retweets. Sichere Zahlung via Stripe, Ergebnisse in 24h.",
    },
    keywords: {
      fr: ["boost x", "boost twitter", "croissance x", "augmenter followers x", "fanovaly x"],
      en: ["boost x", "boost twitter", "x growth", "increase x followers", "fanovaly x"],
      es: ["impulsar x", "impulsar twitter", "crecimiento x", "aumentar seguidores x", "fanovaly x"],
      pt: ["impulsionar x", "impulsionar twitter", "crescimento x", "aumentar seguidores x", "fanovaly x"],
      de: ["x boosten", "twitter boosten", "x wachstum", "x follower steigern", "fanovaly x"],
    },
    ogTitle: {
      fr: "Booster votre compte X (Twitter) — Fanovaly",
      en: "Boost your X (Twitter) account — Fanovaly",
      es: "Impulsa tu cuenta de X (Twitter) — Fanovaly",
      pt: "Impulsione sua conta do X (Twitter) — Fanovaly",
      de: "Booste dein X (Twitter)-Konto — Fanovaly",
    },
    ogDescription: {
      fr: "Développez votre compte X avec une croissance rapide et naturelle. Paiement sécurisé.",
      en: "Grow your X account with fast and natural growth. Secure payment.",
      es: "Haz crecer tu cuenta de X con un crecimiento rápido y natural. Pago seguro.",
      pt: "Aumente sua conta do X com crescimento rápido e natural. Pagamento seguro.",
      de: "Steigere dein X-Konto mit schnellem und natürlichem Wachstum. Sichere Zahlung.",
    },
    twitterTitle: {
      fr: "Booster votre compte X (Twitter) — Fanovaly",
      en: "Boost your X (Twitter) account — Fanovaly",
      es: "Impulsa tu cuenta de X (Twitter) — Fanovaly",
      pt: "Impulsione sua conta do X (Twitter) — Fanovaly",
      de: "Booste dein X (Twitter)-Konto — Fanovaly",
    },
    twitterDescription: {
      fr: "Développez votre compte X avec une croissance rapide et naturelle.",
      en: "Grow your X account with fast and natural growth.",
      es: "Haz crecer tu cuenta de X con un crecimiento rápido y natural.",
      pt: "Aumente sua conta do X com crescimento rápido e natural.",
      de: "Steigere dein X-Konto mit schnellem und natürlichem Wachstum.",
    },
    canonical: "https://fanovaly.com/x",
  },
  twitch: {
    title: {
      fr: "Booster votre chaîne Twitch — Followers et viewers live",
      en: "Boost your Twitch channel — Followers and live viewers",
      es: "Impulsa tu canal Twitch — Seguidores y viewers en vivo",
      pt: "Impulsione seu canal Twitch — Seguidores e viewers ao vivo",
      de: "Booste deinen Twitch-Kanal — Follower und Live-Zuschauer",
    },
    description: {
      fr: "Développez votre chaîne Twitch avec plus de followers et de viewers live. Programmez votre stream, on s'occupe du reste. Paiement sécurisé Stripe.",
      en: "Grow your Twitch channel with more followers and live viewers. Schedule your stream, we'll handle the rest. Secure Stripe payment.",
      es: "Haz crecer tu canal de Twitch con más seguidores y espectadores en vivo. Programa tu stream, nosotros nos encargamos del resto. Pago seguro con Stripe.",
      pt: "Aumente seu canal da Twitch com mais seguidores e espectadores ao vivo. Programe sua stream, nós cuidamos do resto. Pagamento seguro via Stripe.",
      de: "Steigere deinen Twitch-Kanal mit mehr Followern und Live-Zuschauern. Plane deinen Stream, wir kümmern uns um den Rest. Sichere Zahlung via Stripe.",
    },
    keywords: {
      fr: ["boost twitch", "viewers twitch", "followers twitch", "augmenter viewers live", "fanovaly twitch"],
      en: ["boost twitch", "twitch viewers", "twitch followers", "increase live viewers", "fanovaly twitch"],
      es: ["impulsar twitch", "espectadores twitch", "seguidores twitch", "aumentar espectadores en vivo", "fanovaly twitch"],
      pt: ["impulsionar twitch", "espectadores twitch", "seguidores twitch", "aumentar espectadores ao vivo", "fanovaly twitch"],
      de: ["twitch boosten", "twitch zuschauer", "twitch follower", "live zuschauer steigern", "fanovaly twitch"],
    },
    ogTitle: {
      fr: "Booster votre chaîne Twitch — Fanovaly",
      en: "Boost your Twitch channel — Fanovaly",
      es: "Impulsa tu canal de Twitch — Fanovaly",
      pt: "Impulsione seu canal da Twitch — Fanovaly",
      de: "Booste deinen Twitch-Kanal — Fanovaly",
    },
    ogDescription: {
      fr: "Plus de followers et de viewers live sur ton stream Twitch. Paiement sécurisé.",
      en: "More followers and live viewers on your Twitch stream. Secure payment.",
      es: "Más seguidores y espectadores en vivo en tu stream de Twitch. Pago seguro.",
      pt: "Mais seguidores e espectadores ao vivo na sua stream da Twitch. Pagamento seguro.",
      de: "Mehr Follower und Live-Zuschauer auf deinem Twitch-Stream. Sichere Zahlung.",
    },
    twitterTitle: {
      fr: "Booster votre chaîne Twitch — Fanovaly",
      en: "Boost your Twitch channel — Fanovaly",
      es: "Impulsa tu canal de Twitch — Fanovaly",
      pt: "Impulsione seu canal da Twitch — Fanovaly",
      de: "Booste deinen Twitch-Kanal — Fanovaly",
    },
    twitterDescription: {
      fr: "Plus de followers et de viewers live sur ton stream Twitch.",
      en: "More followers and live viewers on your Twitch stream.",
      es: "Más seguidores y espectadores en vivo en tu stream de Twitch.",
      pt: "Mais seguidores e espectadores ao vivo na sua stream da Twitch.",
      de: "Mehr Follower und Live-Zuschauer auf deinem Twitch-Stream.",
    },
    canonical: "https://fanovaly.com/twitch",
  },
  spotify: {
    title: {
      fr: "Booster vos streams Spotify — Croissance rapide & naturelle",
      en: "Boost your Spotify streams — Fast & natural growth",
      es: "Impulsa tus streams Spotify — Crecimiento rápido y natural",
      pt: "Impulsione seus streams Spotify — Crescimento rápido",
      de: "Booste deine Spotify-Streams — Schnelles Wachstum",
    },
    description: {
      fr: "Boostez vos streams Spotify avec une croissance progressive et naturelle. Paiement sécurisé par Stripe, résultats visibles en 24-48h.",
      en: "Boost your Spotify streams with progressive and natural growth. Secure Stripe payment, results visible in 24-48h.",
      es: "Impulsa tus streams de Spotify con un crecimiento progresivo y natural. Pago seguro con Stripe, resultados visibles en 24-48h.",
      pt: "Impulsione seus streams no Spotify com crescimento progressivo e natural. Pagamento seguro via Stripe, resultados visíveis em 24-48h.",
      de: "Booste deine Spotify-Streams mit progressivem und natürlichem Wachstum. Sichere Zahlung via Stripe, Ergebnisse in 24-48h.",
    },
    keywords: {
      fr: ["boost streams spotify", "croissance spotify", "augmenter streams spotify", "fanovaly spotify"],
      en: ["boost spotify streams", "spotify growth", "increase spotify streams", "fanovaly spotify"],
      es: ["impulsar streams spotify", "crecimiento spotify", "aumentar streams spotify", "fanovaly spotify"],
      pt: ["impulsionar streams spotify", "crescimento spotify", "aumentar streams spotify", "fanovaly spotify"],
      de: ["spotify streams boosten", "spotify wachstum", "spotify streams steigern", "fanovaly spotify"],
    },
    ogTitle: {
      fr: "Booster vos streams Spotify — Fanovaly",
      en: "Boost your Spotify streams — Fanovaly",
      es: "Impulsa tus streams de Spotify — Fanovaly",
      pt: "Impulsione seus streams no Spotify — Fanovaly",
      de: "Booste deine Spotify-Streams — Fanovaly",
    },
    ogDescription: {
      fr: "Boostez vos streams Spotify avec une croissance progressive et naturelle.",
      en: "Boost your Spotify streams with progressive and natural growth.",
      es: "Impulsa tus streams de Spotify con un crecimiento progresivo y natural.",
      pt: "Impulsione seus streams no Spotify com crescimento progressivo e natural.",
      de: "Booste deine Spotify-Streams mit progressivem und natürlichem Wachstum.",
    },
    twitterTitle: {
      fr: "Booster vos streams Spotify — Fanovaly",
      en: "Boost your Spotify streams — Fanovaly",
      es: "Impulsa tus streams de Spotify — Fanovaly",
      pt: "Impulsione seus streams no Spotify — Fanovaly",
      de: "Booste deine Spotify-Streams — Fanovaly",
    },
    twitterDescription: {
      fr: "Boostez vos streams Spotify avec une croissance progressive et naturelle.",
      en: "Boost your Spotify streams with progressive and natural growth.",
      es: "Impulsa tus streams de Spotify con un crecimiento progresivo y natural.",
      pt: "Impulsione seus streams no Spotify com crescimento progressivo e natural.",
      de: "Booste deine Spotify-Streams mit progressivem und natürlichem Wachstum.",
    },
    canonical: "https://fanovaly.com/spotify",
  },
};

export function generatePageMetadata(
  page: keyof typeof pages,
  searchParams: Record<string, string | string[] | undefined>,
): Metadata {
  const lang = getLang(searchParams);
  const p = pages[page];
  return {
    title: p.title[lang],
    description: p.description[lang],
    keywords: p.keywords[lang],
    alternates: { canonical: p.canonical },
    openGraph: {
      title: p.ogTitle[lang],
      description: p.ogDescription[lang],
      url: p.canonical,
      siteName: "Fanovaly",
      locale: LOCALE_MAP[lang],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: p.twitterTitle[lang],
      description: p.twitterDescription[lang],
    },
  };
}
