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
}

function fmtQty(n: number): string {
  if (n >= 1000) return (n / 1000) + "K";
  return String(n);
}

export async function sendOrderConfirmationEmail(params: OrderEmailParams) {
  const { to, username, platform, cart, totalCents, promoCode, promoPercent, promoExpiresAt, orderId } = params;
  const total = (totalCents / 100).toFixed(2);

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
<html>
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
        Merci pour ta commande !
      </h2>
      <p style="text-align:center;font-size:14px;color:#a9b5ae;margin:0 0 24px 0;">
        Ta commande pour <strong style="color:#00ff4c;">@${username}</strong> sur ${platform === "tiktok" ? "TikTok" : "Instagram"} a bien été enregistrée.
      </p>

      <!-- Order details -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr>
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b756f;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #1a2e22;">Service</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b756f;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #1a2e22;">Prix</th>
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
        <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#a9b5ae;text-transform:uppercase;letter-spacing:0.05em;">Prochaines étapes</p>
        <p style="margin:0;font-size:13px;color:#a9b5ae;line-height:1.6;">
          1. Nous traitons ta commande (généralement sous 5 à 30 min)<br>
          2. Les résultats arrivent progressivement sur ton profil<br>
          3. C'est tout ! Profite de ton boost 🚀
        </p>
      </div>

      ${promoCode ? `
      <!-- Promo code -->
      <div style="margin-top:20px;background:linear-gradient(135deg,rgba(0,180,53,0.08),rgba(0,255,76,0.04));border:1px dashed rgba(0,255,76,0.3);border-radius:10px;padding:20px;text-align:center;">
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#a9b5ae;text-transform:uppercase;letter-spacing:0.05em;">🎁 Cadeau pour ta prochaine commande</p>
        <p style="margin:0 0 8px 0;font-size:28px;font-weight:800;color:#00ff4c;letter-spacing:3px;">${promoCode}</p>
        <p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#fff;">-${promoPercent}% sur ta prochaine commande</p>
        <p style="margin:0;font-size:11px;color:#6b756f;">Expire dans 48h — ${promoExpiresAt ? new Date(promoExpiresAt * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</p>
      </div>
      ` : ""}

      ${orderId ? `
      <!-- Tracking link -->
      <div style="margin-top:20px;text-align:center;">
        <a href="https://fanovaly.com/order/${orderId}" style="display:inline-block;padding:14px 32px;border-radius:14px;background:linear-gradient(135deg,rgb(0,180,53),rgb(0,255,76));color:#000;font-weight:700;font-size:15px;text-decoration:none;">📦 Suivre ma commande</a>
      </div>
      ` : ""}
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:11px;color:#6b756f;margin:0;">
        Fanovaly — Boost ton compte en toute sécurité
      </p>
      <p style="font-size:11px;color:#4a524e;margin:8px 0 0 0;">
        Si tu n'as pas effectué cette commande, ignore cet e-mail.
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = `Merci pour ta commande !

Ta commande pour @${username} sur ${platform === "tiktok" ? "TikTok" : "Instagram"} a bien été enregistrée.

Détail :
${cartLines}

Total : ${total}€

Prochaines étapes :
1. Nous traitons ta commande (généralement sous 5 à 30 min)
2. Les résultats arrivent progressivement sur ton profil
3. C'est tout ! Profite de ton boost

${promoCode ? `
🎁 Code promo : ${promoCode}
-${promoPercent}% sur ta prochaine commande (expire dans 48h)
` : ""}
${orderId ? `📦 Suivre ta commande : https://fanovaly.com/order/${orderId}
` : ""}
— Fanovaly`;

  try {
    const { error } = await resend.emails.send({
      from: "Fanovaly <support@fanovaly.com>",
      to: [to],
      subject: `✅ Commande confirmée — ${cart.map((c) => `${fmtQty(c.qty)} ${c.label}`).join(" + ")}`,
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
