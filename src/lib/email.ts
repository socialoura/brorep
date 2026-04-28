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
  lang?: "fr" | "en";
}

function fmtQty(n: number): string {
  if (n >= 1000) return (n / 1000) + "K";
  return String(n);
}

const platformLabel = (p: string) => {
  const map: Record<string, string> = { tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube", spotify: "Spotify", x: "X", twitch: "Twitch" };
  return map[p] || p;
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
    footer1: "Fanovaly — Boost your account safely",
    footer2: "If you didn't place this order, please ignore this email.",
    textRegistered: (username: string, platform: string) => `Your order for @${username} on ${platformLabel(platform)} has been registered.`,
    textDetail: "Details:",
    textNextSteps: "Next steps:",
    textPromo: (code: string, pct: number) => `🎁 Promo code: ${code}\n-${pct}% off your next order (expires in 48h)`,
    textTrack: (id: number) => `📦 Track your order: https://fanovaly.com/order/${id}`,
  },
};

export async function sendOrderConfirmationEmail(params: OrderEmailParams) {
  const { to, username, platform, cart, totalCents, promoCode, promoPercent, promoExpiresAt, orderId, lang = "fr" } = params;
  const t = i18nEmail[lang];
  const total = (totalCents / 100).toFixed(2);
  const locale = lang === "en" ? "en-GB" : "fr-FR";

  const cartLines = cart
    .map((item) => `• ${fmtQty(item.qty)} ${item.label} — ${item.price.toFixed(2)}€`)
    .join("\n");

  const cartHtml = cart
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #1a2e22;color:#e8f7ed;">${fmtQty(item.qty)} ${item.label}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #1a2e22;text-align:right;color:#00d26a;font-weight:600;">${item.price.toFixed(2)}€</td>
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
<body style="margin:0;padding:0;background:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff;">
        Fan<span style="color:#00ff4c;">ovaly</span>
      </h1>
    </div>

    <!-- Main card -->
    <div style="background:#0e1512;border:1px solid rgba(0,210,106,0.15);border-radius:16px;padding:32px 24px;">
      <!-- Check icon -->
      <div style="text-align:center;margin-bottom:20px;">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:rgba(0,255,76,0.1);border:2px solid rgba(0,255,76,0.3);">
          <span style="font-size:24px;">✓</span>
        </div>
      </div>

      <h2 style="text-align:center;font-size:20px;font-weight:700;color:#fff;margin:0 0 8px 0;">
        ${t.thanks}
      </h2>
      <p style="text-align:center;font-size:14px;color:#a9b5ae;margin:0 0 24px 0;">
        ${t.orderRegistered(username, platform)}
      </p>

      <!-- Order details -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr>
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b756f;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #1a2e22;">${t.service}</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b756f;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #1a2e22;">${t.price}</th>
          </tr>
        </thead>
        <tbody>
          ${cartHtml}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding:12px 12px 8px;font-size:14px;font-weight:700;color:#fff;">Total</td>
            <td style="padding:12px 12px 8px;text-align:right;font-size:16px;font-weight:700;color:#00ff4c;">${total}€</td>
          </tr>
        </tfoot>
      </table>

      <!-- Timeline -->
      <div style="background:rgba(0,180,53,0.04);border:1px solid rgba(0,210,106,0.1);border-radius:10px;padding:16px;">
        <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#a9b5ae;text-transform:uppercase;letter-spacing:0.05em;">${t.nextSteps}</p>
        <p style="margin:0;font-size:13px;color:#a9b5ae;line-height:1.6;">
          1. ${t.step1}<br>
          2. ${t.step2}<br>
          3. ${t.step3}
        </p>
      </div>

      ${promoCode ? `
      <!-- Promo code -->
      <div style="margin-top:20px;background:linear-gradient(135deg,rgba(0,180,53,0.08),rgba(0,255,76,0.04));border:1px dashed rgba(0,255,76,0.3);border-radius:10px;padding:20px;text-align:center;">
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#a9b5ae;text-transform:uppercase;letter-spacing:0.05em;">${t.promoGift}</p>
        <p style="margin:0 0 8px 0;font-size:28px;font-weight:800;color:#00ff4c;letter-spacing:3px;">${promoCode}</p>
        <p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#fff;">${t.promoOff(promoPercent || 0)}</p>
        <p style="margin:0;font-size:11px;color:#6b756f;">${t.promoExpires} — ${promoExpiresAt ? new Date(promoExpiresAt * 1000).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</p>
      </div>
      ` : ""}

      ${orderId ? `
      <!-- Tracking link -->
      <div style="margin-top:20px;text-align:center;">
        <a href="https://fanovaly.com/order/${orderId}" style="display:inline-block;padding:14px 32px;border-radius:14px;background:linear-gradient(135deg,rgb(0,180,53),rgb(0,255,76));color:#000;font-weight:700;font-size:15px;text-decoration:none;">${t.trackOrder}</a>
      </div>
      ` : ""}
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:11px;color:#6b756f;margin:0;">
        ${t.footer1}
      </p>
      <p style="font-size:11px;color:#4a524e;margin:8px 0 0 0;">
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
1. ${t.step1}
2. ${t.step2}
3. ${t.step3}

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
