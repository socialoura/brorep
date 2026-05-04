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
  tiktok: {
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
    canonical: "https://fanovaly.com/tiktok",
  },
  instagram: {
    title: {
      fr: "Fanovaly — Accélérez votre croissance Instagram avec l'IA",
      en: "Fanovaly — Accelerate your Instagram growth with AI",
      es: "Fanovaly — Acelera tu crecimiento en Instagram con IA",
      pt: "Fanovaly — Acelere seu crescimento no Instagram com IA",
      de: "Fanovaly — Beschleunige dein Instagram-Wachstum mit KI",
    },
    description: {
      fr: "Notre IA analyse votre profil Instagram et crée une stratégie de croissance personnalisée. Croissance rapide et naturelle, paiement sécurisé par Stripe, support 24/7.",
      en: "Our AI analyzes your Instagram profile and creates a personalized growth strategy. Fast and natural growth, secure Stripe payment, 24/7 support.",
      es: "Nuestra IA analiza tu perfil de Instagram y crea una estrategia de crecimiento personalizada. Crecimiento rápido y natural, pago seguro con Stripe, soporte 24/7.",
      pt: "Nossa IA analisa seu perfil do Instagram e cria uma estratégia de crescimento personalizada. Crescimento rápido e natural, pagamento seguro via Stripe, suporte 24/7.",
      de: "Unsere KI analysiert dein Instagram-Profil und erstellt eine personalisierte Wachstumsstrategie. Schnelles und natürliches Wachstum, sichere Zahlung via Stripe, 24/7-Support.",
    },
    keywords: {
      fr: ["croissance instagram", "stratégie instagram IA", "développer audience instagram", "visibilité instagram", "fanovaly instagram"],
      en: ["instagram growth", "instagram AI strategy", "grow instagram audience", "instagram visibility", "fanovaly instagram"],
      es: ["crecimiento instagram", "estrategia instagram IA", "crecer audiencia instagram", "visibilidad instagram", "fanovaly instagram"],
      pt: ["crescimento instagram", "estratégia instagram IA", "aumentar audiência instagram", "visibilidade instagram", "fanovaly instagram"],
      de: ["instagram wachstum", "instagram KI strategie", "instagram reichweite steigern", "instagram sichtbarkeit", "fanovaly instagram"],
    },
    ogTitle: {
      fr: "Fanovaly — Croissance Instagram propulsée par l'IA",
      en: "Fanovaly — AI-powered Instagram growth",
      es: "Fanovaly — Crecimiento en Instagram impulsado por IA",
      pt: "Fanovaly — Crescimento no Instagram impulsionado por IA",
      de: "Fanovaly — KI-gestütztes Instagram-Wachstum",
    },
    ogDescription: {
      fr: "Notre IA analyse votre profil et crée une stratégie de croissance Instagram personnalisée. Paiement sécurisé.",
      en: "Our AI analyzes your profile and creates a personalized Instagram growth strategy. Secure payment.",
      es: "Nuestra IA analiza tu perfil y crea una estrategia de crecimiento personalizada para Instagram. Pago seguro.",
      pt: "Nossa IA analisa seu perfil e cria uma estratégia de crescimento personalizada para Instagram. Pagamento seguro.",
      de: "Unsere KI analysiert dein Profil und erstellt eine personalisierte Instagram-Wachstumsstrategie. Sichere Zahlung.",
    },
    twitterTitle: {
      fr: "Fanovaly — Croissance Instagram propulsée par l'IA",
      en: "Fanovaly — AI-powered Instagram growth",
      es: "Fanovaly — Crecimiento en Instagram impulsado por IA",
      pt: "Fanovaly — Crescimento no Instagram impulsionado por IA",
      de: "Fanovaly — KI-gestütztes Instagram-Wachstum",
    },
    twitterDescription: {
      fr: "Notre IA analyse votre profil et crée une stratégie de croissance Instagram personnalisée.",
      en: "Our AI analyzes your profile and creates a personalized Instagram growth strategy.",
      es: "Nuestra IA analiza tu perfil y crea una estrategia de crecimiento personalizada para Instagram.",
      pt: "Nossa IA analisa seu perfil e cria uma estratégia de crescimento personalizada para Instagram.",
      de: "Unsere KI analysiert dein Profil und erstellt eine personalisierte Instagram-Wachstumsstrategie.",
    },
    canonical: "https://fanovaly.com",
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
      fr: "Promotion musicale Spotify — Vrais auditeurs, croissance organique",
      en: "Spotify music promotion — Real listeners, organic growth",
      es: "Promoción musical Spotify — Oyentes reales, crecimiento orgánico",
      pt: "Promoção musical Spotify — Ouvintes reais, crescimento orgânico",
      de: "Spotify-Musikpromotion — Echte Hörer, organisches Wachstum",
    },
    description: {
      fr: "Faites découvrir votre morceau Spotify à de vrais auditeurs ciblés. Campagnes progressives et naturelles, paiement sécurisé Stripe, premiers résultats en 24-48h.",
      en: "Get your Spotify track in front of real, targeted listeners. Progressive and natural promotion campaigns. Secure Stripe payment, first results in 24-48h.",
      es: "Lleva tu tema de Spotify a oyentes reales y dirigidos. Campañas de promoción progresivas y naturales. Pago seguro con Stripe, primeros resultados en 24-48h.",
      pt: "Leve sua música do Spotify a ouvintes reais e direcionados. Campanhas de promoção progressivas e naturais. Pagamento seguro via Stripe, primeiros resultados em 24-48h.",
      de: "Bring deinen Spotify-Track vor echte, gezielte Hörer. Progressive und natürliche Promotion-Kampagnen. Sichere Zahlung via Stripe, erste Ergebnisse in 24-48h.",
    },
    keywords: {
      fr: ["promotion spotify", "promotion musicale spotify", "campagne spotify", "marketing spotify artiste", "développer audience spotify", "fanovaly spotify"],
      en: ["spotify promotion", "spotify music promotion", "spotify marketing", "music promotion service", "grow spotify audience", "fanovaly spotify"],
      es: ["promoción spotify", "promoción musical spotify", "marketing spotify", "campaña spotify", "crecer audiencia spotify", "fanovaly spotify"],
      pt: ["promoção spotify", "promoção musical spotify", "marketing spotify", "campanha spotify", "crescer audiência spotify", "fanovaly spotify"],
      de: ["spotify promotion", "spotify musikpromotion", "spotify marketing", "spotify kampagne", "spotify reichweite aufbauen", "fanovaly spotify"],
    },
    ogTitle: {
      fr: "Promotion musicale Spotify — Fanovaly",
      en: "Spotify music promotion — Fanovaly",
      es: "Promoción musical Spotify — Fanovaly",
      pt: "Promoção musical Spotify — Fanovaly",
      de: "Spotify-Musikpromotion — Fanovaly",
    },
    ogDescription: {
      fr: "Faites découvrir votre morceau à de vrais auditeurs Spotify ciblés. Campagnes progressives et naturelles.",
      en: "Get your track discovered by real, targeted Spotify listeners. Progressive and natural campaigns.",
      es: "Haz que oyentes reales y dirigidos de Spotify descubran tu tema. Campañas progresivas y naturales.",
      pt: "Faça ouvintes reais e direcionados do Spotify descobrirem sua música. Campanhas progressivas e naturais.",
      de: "Lass echte, gezielte Spotify-Hörer deinen Track entdecken. Progressive und natürliche Kampagnen.",
    },
    twitterTitle: {
      fr: "Promotion musicale Spotify — Fanovaly",
      en: "Spotify music promotion — Fanovaly",
      es: "Promoción musical Spotify — Fanovaly",
      pt: "Promoção musical Spotify — Fanovaly",
      de: "Spotify-Musikpromotion — Fanovaly",
    },
    twitterDescription: {
      fr: "Faites découvrir votre morceau à de vrais auditeurs Spotify ciblés. Campagnes progressives et naturelles.",
      en: "Get your track discovered by real, targeted Spotify listeners. Progressive and natural campaigns.",
      es: "Haz que oyentes reales y dirigidos de Spotify descubran tu tema. Campañas progresivas y naturales.",
      pt: "Faça ouvintes reais e direcionados do Spotify descobrirem sua música. Campanhas progressivas e naturais.",
      de: "Lass echte, gezielte Spotify-Hörer deinen Track entdecken. Progressive und natürliche Kampagnen.",
    },
    canonical: "https://fanovaly.com/spotify-en",
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
