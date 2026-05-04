import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailParams {
  to: string;
  username: string;
  platform: string;
  cart: { label: string; qty: number; price: number }[];
  totalCents: number;
  promoCode?: string;
  promoPercent?: number;
  promoExpiresAt?: number;
  orderId?: number;
  lang?: "fr" | "en" | "es" | "pt" | "de";
}

function fmtQty(n: number): string {
  if (n >= 1000) return (n / 1000) + "K";
  return String(n);
}

const platformLabel = (p: string) => {
  const map: Record<string, string> = { tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube", spotify: "Spotify", x: "X", twitch: "Twitch" };
  return map[p] || p;
};

interface PlatformStyle {
  color: string;
  bg: string;
  border: string;
  icon: string;
  profileUrl: (u: string) => string;
}

const platformStyles: Record<string, PlatformStyle> = {
  tiktok: {
    color: "#00f2ea",
    bg: "rgba(0,242,234,0.08)",
    border: "rgba(0,242,234,0.2)",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 12a3.5 3.5 0 1 0 3.5 3.5V4.5A5.5 5.5 0 0 0 17 6.5v0a5.5 5.5 0 0 0 2.5.5" stroke="#00f2ea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    profileUrl: (u) => `https://www.tiktok.com/@${u}`,
  },
  instagram: {
    color: "#E1306C",
    bg: "rgba(225,48,108,0.08)",
    border: "rgba(225,48,108,0.2)",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="#E1306C" stroke-width="2"/><circle cx="12" cy="12" r="5" stroke="#E1306C" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="#E1306C"/></svg>`,
    profileUrl: (u) => `https://www.instagram.com/${u}`,
  },
  youtube: {
    color: "#FF0000",
    bg: "rgba(255,0,0,0.08)",
    border: "rgba(255,0,0,0.2)",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="4" stroke="#FF0000" stroke-width="2"/><polygon points="10,8.5 16,12 10,15.5" fill="#FF0000"/></svg>`,
    profileUrl: (u) => `https://www.youtube.com/@${u}`,
  },
  spotify: {
    color: "#1DB954",
    bg: "rgba(29,185,84,0.08)",
    border: "rgba(29,185,84,0.2)",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#1DB954" stroke-width="2"/><path d="M8 15c2.5-1 5.5-1 8 0M7 12c3-1.5 7-1.5 10 0M6.5 9c3.5-2 8.5-2 11 0" stroke="#1DB954" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    profileUrl: (u) => `https://open.spotify.com/artist/${u}`,
  },
  x: {
    color: "#ffffff",
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.15)",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 4l6.5 8L4 20h2l5.5-6.5L16 20h4l-7-8.5L19.5 4H18l-5 6L9 4H4z" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    profileUrl: (u) => `https://x.com/${u}`,
  },
  twitch: {
    color: "#9146FF",
    bg: "rgba(145,70,255,0.08)",
    border: "rgba(145,70,255,0.2)",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 3v15h5v3l3-3h4l5-5V3H4z" stroke="#9146FF" stroke-width="2" stroke-linejoin="round"/><line x1="11" y1="8" x2="11" y2="12" stroke="#9146FF" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="8" x2="15" y2="12" stroke="#9146FF" stroke-width="2" stroke-linecap="round"/></svg>`,
    profileUrl: (u) => `https://www.twitch.tv/${u}`,
  },
};

const defaultPlatformStyle: PlatformStyle = {
  color: "#00ff4c",
  bg: "rgba(0,255,76,0.08)",
  border: "rgba(0,210,106,0.15)",
  icon: "",
  profileUrl: (u) => `https://www.tiktok.com/@${u}`,
};

const platformSteps: Record<string, Record<string, { step1: string; step2: string; step3: string }>> = {
  fr: {
    tiktok: { step1: "Nous traitons ta commande (généralement sous 5 à 30 min)", step2: "Les résultats arrivent progressivement sur ton profil TikTok", step3: "C'est tout ! Regarde ton compte TikTok grandir 🚀" },
    instagram: { step1: "Nous traitons ta commande (généralement sous 5 à 30 min)", step2: "Les résultats apparaissent progressivement sur ton profil Instagram", step3: "C'est tout ! Profite de ton boost Instagram 📸" },
    youtube: { step1: "Nous traitons ta commande (généralement sous 5 à 60 min)", step2: "Les résultats arrivent progressivement sur ta chaîne YouTube", step3: "C'est tout ! Regarde ta chaîne décoller 🎬" },
    spotify: { step1: "Nous traitons ta commande (généralement sous 10 à 60 min)", step2: "Les résultats arrivent progressivement sur ton profil Spotify", step3: "C'est tout ! Profite de ta visibilité Spotify 🎵" },
    x: { step1: "Nous traitons ta commande (généralement sous 5 à 30 min)", step2: "Les résultats apparaissent progressivement sur ton profil X", step3: "C'est tout ! Profite de ton boost sur X 🐦" },
    twitch: { step1: "Nous traitons ta commande (généralement sous 10 à 60 min)", step2: "Les résultats arrivent progressivement sur ta chaîne Twitch", step3: "C'est tout ! Profite de ton boost Twitch 🎮" },
  },
  en: {
    tiktok: { step1: "We're processing your order (usually within 5 to 30 min)", step2: "Results will appear progressively on your TikTok profile", step3: "That's it! Watch your TikTok grow 🚀" },
    instagram: { step1: "We're processing your order (usually within 5 to 30 min)", step2: "Results will appear progressively on your Instagram profile", step3: "That's it! Enjoy your Instagram boost 📸" },
    youtube: { step1: "We're processing your order (usually within 5 to 60 min)", step2: "Results will appear progressively on your YouTube channel", step3: "That's it! Watch your channel take off 🎬" },
    spotify: { step1: "We're processing your order (usually within 10 to 60 min)", step2: "Results will appear progressively on your Spotify profile", step3: "That's it! Enjoy your Spotify visibility 🎵" },
    x: { step1: "We're processing your order (usually within 5 to 30 min)", step2: "Results will appear progressively on your X profile", step3: "That's it! Enjoy your X boost 🐦" },
    twitch: { step1: "We're processing your order (usually within 10 to 60 min)", step2: "Results will appear progressively on your Twitch channel", step3: "That's it! Enjoy your Twitch boost 🎮" },
  },
  es: {
    tiktok: { step1: "Estamos procesando tu pedido (generalmente de 5 a 30 min)", step2: "Los resultados aparecerán progresivamente en tu perfil TikTok", step3: "¡Eso es todo! Mira crecer tu TikTok 🚀" },
    instagram: { step1: "Estamos procesando tu pedido (generalmente de 5 a 30 min)", step2: "Los resultados aparecerán progresivamente en tu perfil Instagram", step3: "¡Eso es todo! Disfruta tu boost en Instagram 📸" },
    youtube: { step1: "Estamos procesando tu pedido (generalmente de 5 a 60 min)", step2: "Los resultados aparecerán progresivamente en tu canal YouTube", step3: "¡Eso es todo! Mira despegar tu canal 🎬" },
    spotify: { step1: "Estamos procesando tu pedido (generalmente de 10 a 60 min)", step2: "Los resultados aparecerán progresivamente en tu perfil Spotify", step3: "¡Eso es todo! Disfruta tu visibilidad en Spotify 🎵" },
    x: { step1: "Estamos procesando tu pedido (generalmente de 5 a 30 min)", step2: "Los resultados aparecerán progresivamente en tu perfil X", step3: "¡Eso es todo! Disfruta tu boost en X 🐦" },
    twitch: { step1: "Estamos procesando tu pedido (generalmente de 10 a 60 min)", step2: "Los resultados aparecerán progresivamente en tu canal Twitch", step3: "¡Eso es todo! Disfruta tu boost en Twitch 🎮" },
  },
  pt: {
    tiktok: { step1: "Estamos processando seu pedido (geralmente de 5 a 30 min)", step2: "Os resultados aparecerão progressivamente no seu perfil TikTok", step3: "É isso! Veja seu TikTok crescer 🚀" },
    instagram: { step1: "Estamos processando seu pedido (geralmente de 5 a 30 min)", step2: "Os resultados aparecerão progressivamente no seu perfil Instagram", step3: "É isso! Aproveite seu boost no Instagram 📸" },
    youtube: { step1: "Estamos processando seu pedido (geralmente de 5 a 60 min)", step2: "Os resultados aparecerão progressivamente no seu canal YouTube", step3: "É isso! Veja seu canal decolar 🎬" },
    spotify: { step1: "Estamos processando seu pedido (geralmente de 10 a 60 min)", step2: "Os resultados aparecerão progressivamente no seu perfil Spotify", step3: "É isso! Aproveite sua visibilidade no Spotify 🎵" },
    x: { step1: "Estamos processando seu pedido (geralmente de 5 a 30 min)", step2: "Os resultados aparecerão progressivamente no seu perfil X", step3: "É isso! Aproveite seu boost no X 🐦" },
    twitch: { step1: "Estamos processando seu pedido (geralmente de 10 a 60 min)", step2: "Os resultados aparecerão progressivamente no seu canal Twitch", step3: "É isso! Aproveite seu boost no Twitch 🎮" },
  },
  de: {
    tiktok: { step1: "Wir bearbeiten deine Bestellung (normalerweise in 5 bis 30 Min.)", step2: "Die Ergebnisse erscheinen schrittweise auf deinem TikTok-Profil", step3: "Das war's! Sieh zu, wie dein TikTok wächst 🚀" },
    instagram: { step1: "Wir bearbeiten deine Bestellung (normalerweise in 5 bis 30 Min.)", step2: "Die Ergebnisse erscheinen schrittweise auf deinem Instagram-Profil", step3: "Das war's! Genieße deinen Instagram-Boost 📸" },
    youtube: { step1: "Wir bearbeiten deine Bestellung (normalerweise in 5 bis 60 Min.)", step2: "Die Ergebnisse erscheinen schrittweise auf deinem YouTube-Kanal", step3: "Das war's! Sieh zu, wie dein Kanal abhebt 🎬" },
    spotify: { step1: "Wir bearbeiten deine Bestellung (normalerweise in 10 bis 60 Min.)", step2: "Die Ergebnisse erscheinen schrittweise auf deinem Spotify-Profil", step3: "Das war's! Genieße deine Spotify-Sichtbarkeit 🎵" },
    x: { step1: "Wir bearbeiten deine Bestellung (normalerweise in 5 bis 30 Min.)", step2: "Die Ergebnisse erscheinen schrittweise auf deinem X-Profil", step3: "Das war's! Genieße deinen X-Boost 🐦" },
    twitch: { step1: "Wir bearbeiten deine Bestellung (normalerweise in 10 bis 60 Min.)", step2: "Die Ergebnisse erscheinen schrittweise auf deinem Twitch-Kanal", step3: "Das war's! Genieße deinen Twitch-Boost 🎮" },
  },
};

const i18nEmail = {
  fr: {
    subject: (cart: { qty: number; label: string }[]) => `✅ Commande confirmée — ${cart.map((c) => `${fmtQty(c.qty)} ${c.label}`).join(" + ")}`,
    thanks: "Merci pour ta commande !",
    orderRegistered: (username: string, platform: string) => `Ta commande pour <strong style="color:#00ff4c;">@${username}</strong> sur ${platformLabel(platform)} a bien été enregistrée.`,
    service: "Service",
    price: "Prix",
    nextSteps: "Prochaines étapes",
    step1: "Nous traitons ta commande (généralement sous 5 à 30 min)",
    step2: "Les résultats arrivent progressivement sur ton profil",
    step3: "C'est tout ! Profite de ton boost 🚀",
    promoGift: "🎁 Cadeau pour ta prochaine commande",
    promoOff: (pct: number) => `-${pct}% sur ta prochaine commande`,
    promoExpires: "Expire dans 48h",
    trackOrder: "📦 Suivre ma commande",
    reorder: "🔄 Commander à nouveau",
    footer1: "Fanovaly — Boost ton compte en toute sécurité",
    footer2: "Si tu n'as pas effectué cette commande, ignore cet e-mail.",
    textRegistered: (username: string, platform: string) => `Ta commande pour @${username} sur ${platformLabel(platform)} a bien été enregistrée.`,
    textDetail: "Détail :",
    textNextSteps: "Prochaines étapes :",
    textPromo: (code: string, pct: number) => `🎁 Code promo : ${code}\n-${pct}% sur ta prochaine commande (expire dans 48h)`,
    textTrack: (id: number) => `📦 Suivre ta commande : https://fanovaly.com/order/${id}`,
  },
  en: {
    subject: (cart: { qty: number; label: string }[]) => `✅ Order confirmed — ${cart.map((c) => `${fmtQty(c.qty)} ${c.label}`).join(" + ")}`,
    thanks: "Thanks for your order!",
    orderRegistered: (username: string, platform: string) => `Your order for <strong style="color:#00ff4c;">@${username}</strong> on ${platformLabel(platform)} has been registered.`,
    service: "Service",
    price: "Price",
    nextSteps: "Next steps",
    step1: "We're processing your order (usually within 5 to 30 min)",
    step2: "Results will appear progressively on your profile",
    step3: "That's it! Enjoy your boost 🚀",
    promoGift: "🎁 Gift for your next order",
    promoOff: (pct: number) => `-${pct}% off your next order`,
    promoExpires: "Expires in 48h",
    trackOrder: "📦 Track my order",
    reorder: "🔄 Order again",
    footer1: "Fanovaly — Boost your account safely",
    footer2: "If you didn't place this order, please ignore this email.",
    textRegistered: (username: string, platform: string) => `Your order for @${username} on ${platformLabel(platform)} has been registered.`,
    textDetail: "Details:",
    textNextSteps: "Next steps:",
    textPromo: (code: string, pct: number) => `🎁 Promo code: ${code}\n-${pct}% off your next order (expires in 48h)`,
    textTrack: (id: number) => `📦 Track your order: https://fanovaly.com/order/${id}`,
  },
  es: {
    subject: (cart: { qty: number; label: string }[]) => `✅ Pedido confirmado — ${cart.map((c) => `${fmtQty(c.qty)} ${c.label}`).join(" + ")}`,
    thanks: "¡Gracias por tu pedido!",
    orderRegistered: (username: string, platform: string) => `Tu pedido para <strong style="color:#00ff4c;">@${username}</strong> en ${platformLabel(platform)} ha sido registrado.`,
    service: "Servicio",
    price: "Precio",
    nextSteps: "Próximos pasos",
    step1: "Estamos procesando tu pedido (generalmente de 5 a 30 min)",
    step2: "Los resultados aparecerán progresivamente en tu perfil",
    step3: "¡Eso es todo! Disfruta tu boost 🚀",
    promoGift: "🎁 Regalo para tu próximo pedido",
    promoOff: (pct: number) => `-${pct}% en tu próximo pedido`,
    promoExpires: "Expira en 48h",
    trackOrder: "📦 Seguir mi pedido",
    reorder: "🔄 Pedir de nuevo",
    footer1: "Fanovaly — Impulsa tu cuenta de forma segura",
    footer2: "Si no realizaste este pedido, ignora este correo.",
    textRegistered: (username: string, platform: string) => `Tu pedido para @${username} en ${platformLabel(platform)} ha sido registrado.`,
    textDetail: "Detalle:",
    textNextSteps: "Próximos pasos:",
    textPromo: (code: string, pct: number) => `🎁 Código promo: ${code}\n-${pct}% en tu próximo pedido (expira en 48h)`,
    textTrack: (id: number) => `📦 Seguir tu pedido: https://fanovaly.com/order/${id}`,
  },
  pt: {
    subject: (cart: { qty: number; label: string }[]) => `✅ Pedido confirmado — ${cart.map((c) => `${fmtQty(c.qty)} ${c.label}`).join(" + ")}`,
    thanks: "Obrigado pelo seu pedido!",
    orderRegistered: (username: string, platform: string) => `Seu pedido para <strong style="color:#00ff4c;">@${username}</strong> no ${platformLabel(platform)} foi registrado.`,
    service: "Serviço",
    price: "Preço",
    nextSteps: "Próximos passos",
    step1: "Estamos processando seu pedido (geralmente de 5 a 30 min)",
    step2: "Os resultados aparecerão progressivamente no seu perfil",
    step3: "É isso! Aproveite seu boost 🚀",
    promoGift: "🎁 Presente para seu próximo pedido",
    promoOff: (pct: number) => `-${pct}% no seu próximo pedido`,
    promoExpires: "Expira em 48h",
    trackOrder: "📦 Acompanhar meu pedido",
    reorder: "🔄 Pedir novamente",
    footer1: "Fanovaly — Impulsione sua conta com segurança",
    footer2: "Se você não fez este pedido, ignore este e-mail.",
    textRegistered: (username: string, platform: string) => `Seu pedido para @${username} no ${platformLabel(platform)} foi registrado.`,
    textDetail: "Detalhe:",
    textNextSteps: "Próximos passos:",
    textPromo: (code: string, pct: number) => `🎁 Código promo: ${code}\n-${pct}% no seu próximo pedido (expira em 48h)`,
    textTrack: (id: number) => `📦 Acompanhar seu pedido: https://fanovaly.com/order/${id}`,
  },
  de: {
    subject: (cart: { qty: number; label: string }[]) => `✅ Bestellung bestätigt — ${cart.map((c) => `${fmtQty(c.qty)} ${c.label}`).join(" + ")}`,
    thanks: "Danke für deine Bestellung!",
    orderRegistered: (username: string, platform: string) => `Deine Bestellung für <strong style="color:#00ff4c;">@${username}</strong> auf ${platformLabel(platform)} wurde registriert.`,
    service: "Dienst",
    price: "Preis",
    nextSteps: "Nächste Schritte",
    step1: "Wir bearbeiten deine Bestellung (normalerweise in 5 bis 30 Min.)",
    step2: "Die Ergebnisse erscheinen schrittweise auf deinem Profil",
    step3: "Das war's! Genieße deinen Boost 🚀",
    promoGift: "🎁 Geschenk für deine nächste Bestellung",
    promoOff: (pct: number) => `-${pct}% auf deine nächste Bestellung`,
    promoExpires: "Gültig für 48h",
    trackOrder: "📦 Meine Bestellung verfolgen",
    reorder: "🔄 Erneut bestellen",
    footer1: "Fanovaly — Booste dein Konto sicher",
    footer2: "Falls du diese Bestellung nicht aufgegeben hast, ignoriere diese E-Mail.",
    textRegistered: (username: string, platform: string) => `Deine Bestellung für @${username} auf ${platformLabel(platform)} wurde registriert.`,
    textDetail: "Details:",
    textNextSteps: "Nächste Schritte:",
    textPromo: (code: string, pct: number) => `🎁 Promo-Code: ${code}\n-${pct}% auf deine nächste Bestellung (gültig für 48h)`,
    textTrack: (id: number) => `📦 Bestellung verfolgen: https://fanovaly.com/order/${id}`,
  },
};

export async function sendOrderConfirmationEmail(params: OrderEmailParams) {
  const { to, username, platform, cart, totalCents, promoCode, promoPercent, promoExpiresAt, orderId, lang = "fr" } = params;
  const t = i18nEmail[lang];
  const total = (totalCents / 100).toFixed(2);
  const localeMap: Record<string, string> = { fr: "fr-FR", en: "en-GB", es: "es-ES", pt: "pt-BR", de: "de-DE" };
  const locale = localeMap[lang] || "fr-FR";

  const ps = platformStyles[platform] || defaultPlatformStyle;
  const steps = platformSteps[lang]?.[platform] || { step1: t.step1, step2: t.step2, step3: t.step3 };
  const profileLink = ps.profileUrl(username);

  const cartLines = cart
    .map((item) => `• ${fmtQty(item.qty)} ${item.label} — ${item.price.toFixed(2)}€`)
    .join("\n");

  const cartHtml = cart
    .map(
      (item) =>
        `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e8e8e8;color:#1a1a1a;font-size:14px;">${fmtQty(item.qty)} ${item.label}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e8e8e8;text-align:right;color:${ps.color};font-weight:700;font-size:14px;">${item.price.toFixed(2)}€</td>
        </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 16px;">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:26px;font-weight:800;color:#1a1a1a;">
        Fan<span style="color:#00b434;">ovaly</span>
      </h1>
    </div>

    <!-- Main card -->
    <div style="background:#ffffff;border:1px solid #e0e0e0;border-radius:16px;padding:32px 24px;position:relative;overflow:hidden;">
      <!-- Platform accent line -->
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${ps.color};"></div>

      <!-- Check icon -->
      <div style="text-align:center;margin-bottom:20px;">
        <div style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:50%;background:${ps.bg};border:2px solid ${ps.border};font-size:24px;text-align:center;">
          ✓
        </div>
      </div>

      <h2 style="text-align:center;font-size:20px;font-weight:700;color:#1a1a1a;margin:0 0 8px 0;">
        ${t.thanks}
      </h2>
      <p style="text-align:center;font-size:14px;color:#555;margin:0 0 8px 0;">
        ${t.orderRegistered(username, platform)}
      </p>
      <!-- Profile link -->
      <p style="text-align:center;margin:0 0 24px 0;">
        <a href="${profileLink}" style="font-size:12px;color:${ps.color};text-decoration:none;font-weight:600;">${profileLink.replace("https://www.", "").replace("https://", "")}</a>
      </p>

      <!-- Order details -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr>
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e0e0e0;">${t.service}</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e0e0e0;">${t.price}</th>
          </tr>
        </thead>
        <tbody>
          ${cartHtml}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding:12px 12px 8px;font-size:14px;font-weight:700;color:#1a1a1a;">Total</td>
            <td style="padding:12px 12px 8px;text-align:right;font-size:16px;font-weight:700;color:${ps.color};">${total}€</td>
          </tr>
        </tfoot>
      </table>

      <!-- Timeline -->
      <div style="background:#f9f9f9;border:1px solid #e8e8e8;border-radius:10px;padding:16px;">
        <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.05em;">${t.nextSteps}</p>
        <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">
          1. ${steps.step1}<br>
          2. ${steps.step2}<br>
          3. ${steps.step3}
        </p>
      </div>

      ${promoCode ? `
      <!-- Promo code -->
      <div style="margin-top:20px;background:#f9f9f9;border:1px dashed ${ps.border};border-radius:10px;padding:20px;text-align:center;">
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.05em;">${t.promoGift}</p>
        <p style="margin:0 0 8px 0;font-size:28px;font-weight:800;color:${ps.color};letter-spacing:3px;">${promoCode}</p>
        <p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${t.promoOff(promoPercent || 0)}</p>
        <p style="margin:0;font-size:11px;color:#888;">${t.promoExpires} — ${promoExpiresAt ? new Date(promoExpiresAt * 1000).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</p>
      </div>
      ` : ""}

      ${orderId ? `
      <!-- Tracking link -->
      <div style="margin-top:20px;text-align:center;">
        <a href="https://fanovaly.com/order/${orderId}" style="display:inline-block;padding:14px 32px;border-radius:14px;background:${ps.color};color:#fff;font-weight:700;font-size:15px;text-decoration:none;">${t.trackOrder}</a>
      </div>
      ` : ""}

      <!-- Reorder link -->
      <div style="margin-top:12px;text-align:center;">
        <a href="https://fanovaly.com/${platform === 'x' ? '' : platform}" style="display:inline-block;padding:12px 28px;border-radius:14px;border:1px solid #d0d0d0;background:transparent;color:${ps.color};font-weight:600;font-size:14px;text-decoration:none;">${t.reorder}</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:11px;color:#888;margin:0;">
        ${t.footer1}
      </p>
      <p style="font-size:11px;color:#aaa;margin:8px 0 0 0;">
        ${t.footer2}
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = `${t.thanks}

${t.textRegistered(username, platform)}

${t.textDetail}
${cartLines}

Total : ${total}€

${t.textNextSteps}
1. ${steps.step1}
2. ${steps.step2}
3. ${steps.step3}

${promoCode && promoPercent ? t.textPromo(promoCode, promoPercent) : ""}
${orderId ? t.textTrack(orderId) : ""}
— Fanovaly`;

  try {
    const { error } = await resend.emails.send({
      from: "Fanovaly <support@fanovaly.com>",
      to: [to],
      subject: t.subject(cart),
      html,
      text,
    });

    if (error) {
      console.error("Resend email error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Email send failed:", err);
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════════
   FOLLOWUP EMAILS — Day+1 and Delivered
   ═══════════════════════════════════════════════════════════════ */

interface FollowupEmailParams {
  to: string;
  username: string;
  platform: string;
  orderId: number;
  lang?: "fr" | "en" | "es" | "pt" | "de";
}

const i18nFollowupDay1: Record<string, {
  subject: string;
  title: string;
  body: (username: string, platform: string) => string;
  cta: string;
  trackCta: string;
  footer: string;
}> = {
  fr: {
    subject: "📈 Ta commande Fanovaly est en cours !",
    title: "Ta croissance est en route !",
    body: (u, p) => `Les résultats pour <strong style="color:#1a1a1a;">@${u}</strong> sur ${platformLabel(p)} sont en cours de livraison. Tu devrais déjà voir une différence sur ton profil !<br><br>Envie d'aller encore plus loin ? Ajoute un boost supplémentaire pour accélérer ta croissance.`,
    cta: "🚀 Commander à nouveau",
    trackCta: "📦 Suivre ma commande",
    footer: "Tu reçois cet email car tu as passé une commande sur Fanovaly.",
  },
  en: {
    subject: "📈 Your Fanovaly order is being delivered!",
    title: "Your growth is on the way!",
    body: (u, p) => `Results for <strong style="color:#1a1a1a;">@${u}</strong> on ${platformLabel(p)} are being delivered. You should already see a difference on your profile!<br><br>Want to go even further? Add an extra boost to accelerate your growth.`,
    cta: "🚀 Order again",
    trackCta: "📦 Track my order",
    footer: "You received this email because you placed an order on Fanovaly.",
  },
  es: {
    subject: "📈 ¡Tu pedido Fanovaly se está entregando!",
    title: "¡Tu crecimiento está en camino!",
    body: (u, p) => `Los resultados para <strong style="color:#1a1a1a;">@${u}</strong> en ${platformLabel(p)} se están entregando. ¡Ya deberías ver una diferencia en tu perfil!<br><br>¿Quieres ir más lejos? Añade un boost extra para acelerar tu crecimiento.`,
    cta: "🚀 Pedir de nuevo",
    trackCta: "📦 Seguir mi pedido",
    footer: "Recibiste este email porque realizaste un pedido en Fanovaly.",
  },
  pt: {
    subject: "📈 Seu pedido Fanovaly está sendo entregue!",
    title: "Seu crescimento está a caminho!",
    body: (u, p) => `Os resultados para <strong style="color:#1a1a1a;">@${u}</strong> no ${platformLabel(p)} estão sendo entregues. Você já deve ver uma diferença no seu perfil!<br><br>Quer ir mais longe? Adicione um boost extra para acelerar seu crescimento.`,
    cta: "🚀 Pedir novamente",
    trackCta: "📦 Acompanhar meu pedido",
    footer: "Você recebeu este email porque fez um pedido no Fanovaly.",
  },
  de: {
    subject: "📈 Deine Fanovaly-Bestellung wird geliefert!",
    title: "Dein Wachstum ist unterwegs!",
    body: (u, p) => `Die Ergebnisse für <strong style="color:#1a1a1a;">@${u}</strong> auf ${platformLabel(p)} werden gerade geliefert. Du solltest bereits einen Unterschied auf deinem Profil sehen!<br><br>Möchtest du noch weiter gehen? Füge einen extra Boost hinzu, um dein Wachstum zu beschleunigen.`,
    cta: "🚀 Erneut bestellen",
    trackCta: "📦 Bestellung verfolgen",
    footer: "Du hast diese E-Mail erhalten, weil du eine Bestellung bei Fanovaly aufgegeben hast.",
  },
};

const i18nFollowupDelivered: Record<string, {
  subject: string;
  title: string;
  body: (username: string, platform: string) => string;
  resultTitle: string;
  cta: string;
  trackCta: string;
  footer: string;
}> = {
  fr: {
    subject: "✅ Commande livrée — Tes résultats sont là !",
    title: "Ta commande est livrée ! 🎉",
    body: (u, p) => `Les résultats pour <strong style="color:#1a1a1a;">@${u}</strong> sur ${platformLabel(p)} ont été livrés avec succès.<br><br>Va checker ton profil — tu vas voir la différence ! Et si tu veux continuer à grandir, relance un boost maintenant.`,
    resultTitle: "Résultats",
    cta: "🚀 Relancer un boost",
    trackCta: "📊 Voir les détails",
    footer: "Tu reçois cet email car tu as passé une commande sur Fanovaly.",
  },
  en: {
    subject: "✅ Order delivered — Your results are here!",
    title: "Your order is delivered! 🎉",
    body: (u, p) => `Results for <strong style="color:#1a1a1a;">@${u}</strong> on ${platformLabel(p)} have been successfully delivered.<br><br>Go check your profile — you'll see the difference! And if you want to keep growing, launch another boost now.`,
    resultTitle: "Results",
    cta: "🚀 Boost again",
    trackCta: "📊 View details",
    footer: "You received this email because you placed an order on Fanovaly.",
  },
  es: {
    subject: "✅ Pedido entregado — ¡Tus resultados están aquí!",
    title: "¡Tu pedido ha sido entregado! 🎉",
    body: (u, p) => `Los resultados para <strong style="color:#1a1a1a;">@${u}</strong> en ${platformLabel(p)} han sido entregados con éxito.<br><br>¡Ve a revisar tu perfil — verás la diferencia! Y si quieres seguir creciendo, lanza otro boost ahora.`,
    resultTitle: "Resultados",
    cta: "🚀 Impulsar de nuevo",
    trackCta: "📊 Ver detalles",
    footer: "Recibiste este email porque realizaste un pedido en Fanovaly.",
  },
  pt: {
    subject: "✅ Pedido entregue — Seus resultados chegaram!",
    title: "Seu pedido foi entregue! 🎉",
    body: (u, p) => `Os resultados para <strong style="color:#1a1a1a;">@${u}</strong> no ${platformLabel(p)} foram entregues com sucesso.<br><br>Vá conferir seu perfil — você vai ver a diferença! E se quiser continuar crescendo, lance outro boost agora.`,
    resultTitle: "Resultados",
    cta: "🚀 Impulsionar novamente",
    trackCta: "📊 Ver detalhes",
    footer: "Você recebeu este email porque fez um pedido no Fanovaly.",
  },
  de: {
    subject: "✅ Bestellung geliefert — Deine Ergebnisse sind da!",
    title: "Deine Bestellung wurde geliefert! 🎉",
    body: (u, p) => `Die Ergebnisse für <strong style="color:#1a1a1a;">@${u}</strong> auf ${platformLabel(p)} wurden erfolgreich geliefert.<br><br>Schau dir dein Profil an — du wirst den Unterschied sehen! Und wenn du weiter wachsen möchtest, starte jetzt einen neuen Boost.`,
    resultTitle: "Ergebnisse",
    cta: "🚀 Erneut boosten",
    trackCta: "📊 Details ansehen",
    footer: "Du hast diese E-Mail erhalten, weil du eine Bestellung bei Fanovaly aufgegeben hast.",
  },
};

function followupShell(ps: PlatformStyle, title: string, bodyHtml: string, buttons: { label: string; href: string; primary?: boolean }[], footerText: string): string {
  const btnHtml = buttons.map((b) =>
    b.primary
      ? `<a href="${b.href}" style="display:inline-block;padding:14px 32px;border-radius:14px;background:${ps.color};color:#fff;font-weight:700;font-size:15px;text-decoration:none;margin:4px;">${b.label}</a>`
      : `<a href="${b.href}" style="display:inline-block;padding:12px 28px;border-radius:14px;border:1px solid #d0d0d0;background:transparent;color:${ps.color};font-weight:600;font-size:14px;text-decoration:none;margin:4px;">${b.label}</a>`
  ).join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:26px;font-weight:800;color:#1a1a1a;">Fan<span style="color:#00b434;">ovaly</span></h1>
    </div>
    <div style="background:#ffffff;border:1px solid #e0e0e0;border-radius:16px;padding:32px 24px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${ps.color};"></div>
      <div style="text-align:center;margin-bottom:20px;">
        <div style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:50%;background:${ps.bg};border:2px solid ${ps.border};font-size:24px;text-align:center;">
          📈
        </div>
      </div>
      <h2 style="text-align:center;font-size:20px;font-weight:700;color:#1a1a1a;margin:0 0 16px 0;">${title}</h2>
      <p style="text-align:center;font-size:14px;color:#555;margin:0 0 24px 0;line-height:1.6;">${bodyHtml}</p>
      <div style="text-align:center;">${btnHtml}</div>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:11px;color:#888;margin:0;">${footerText}</p>
    </div>
  </div>
</body></html>`;
}

export async function sendDay1FollowupEmail(params: FollowupEmailParams): Promise<boolean> {
  const { to, username, platform, orderId, lang = "fr" } = params;
  const t = i18nFollowupDay1[lang] || i18nFollowupDay1.fr;
  const ps = platformStyles[platform] || defaultPlatformStyle;
  const shopUrl = `https://fanovaly.com/${platform === "x" ? "" : platform}`;

  const html = followupShell(ps, t.title, t.body(username, platform), [
    { label: t.cta, href: shopUrl, primary: true },
    { label: t.trackCta, href: `https://fanovaly.com/order/${orderId}` },
  ], t.footer);

  try {
    const { error } = await resend.emails.send({
      from: "Fanovaly <support@fanovaly.com>",
      to: [to],
      subject: t.subject,
      html,
    });
    if (error) { console.error("Day1 followup email error:", error); return false; }
    return true;
  } catch (err) {
    console.error("Day1 followup email failed:", err);
    return false;
  }
}

export async function sendDeliveredFollowupEmail(params: FollowupEmailParams): Promise<boolean> {
  const { to, username, platform, orderId, lang = "fr" } = params;
  const t = i18nFollowupDelivered[lang] || i18nFollowupDelivered.fr;
  const ps = platformStyles[platform] || defaultPlatformStyle;
  const shopUrl = `https://fanovaly.com/${platform === "x" ? "" : platform}`;

  const html = followupShell(ps, t.title, t.body(username, platform), [
    { label: t.cta, href: shopUrl, primary: true },
    { label: t.trackCta, href: `https://fanovaly.com/order/${orderId}` },
  ], t.footer);

  try {
    const { error } = await resend.emails.send({
      from: "Fanovaly <support@fanovaly.com>",
      to: [to],
      subject: t.subject,
      html,
    });
    if (error) { console.error("Delivered followup email error:", error); return false; }
    return true;
  } catch (err) {
    console.error("Delivered followup email failed:", err);
    return false;
  }
}
