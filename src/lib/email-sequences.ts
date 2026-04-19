import { Resend } from "resend";
import { generatePromoCode } from "@/lib/promo";

const resend = new Resend(process.env.RESEND_API_KEY);

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff;">Fan<span style="color:#00ff4c;">ovaly</span></h1>
    </div>
    <div style="background:#0e1512;border:1px solid rgba(0,210,106,0.15);border-radius:16px;padding:32px 24px;">
      ${content}
    </div>
    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:11px;color:#6b756f;margin:0;">Fanovaly — Boost ton compte en toute sécurité</p>
      <p style="font-size:11px;color:#4a524e;margin:8px 0 0 0;">Tu reçois cet email suite à ta commande sur Fanovaly.</p>
    </div>
  </div>
</body>
</html>`;
}

const ctaButton = `<a href="https://fanovaly.com" style="display:inline-block;margin-top:20px;padding:14px 32px;border-radius:14px;background:linear-gradient(135deg,rgb(0,180,53),rgb(0,255,76));color:#000;font-weight:700;font-size:15px;text-decoration:none;">Booster mon profil</a>`;

// ── J+1 : Upsell ──
function day1Html(username: string, platform: string): string {
  const platformLabel = platform === "tiktok" ? "TikTok" : "Instagram";
  return wrap(`
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:40px;">📈</span>
    </div>
    <h2 style="text-align:center;font-size:20px;font-weight:700;color:#fff;margin:0 0 12px 0;">
      Tes résultats sont en cours !
    </h2>
    <p style="text-align:center;font-size:14px;color:#a9b5ae;margin:0 0 20px 0;line-height:1.6;">
      Salut <strong style="color:#00ff4c;">@${username}</strong> ! Ta commande ${platformLabel} est en cours de livraison. Les résultats arrivent progressivement sur ton profil.
    </p>
    <div style="background:rgba(0,180,53,0.06);border:1px solid rgba(0,210,106,0.15);border-radius:10px;padding:16px;margin-bottom:16px;">
      <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#ffb800;text-transform:uppercase;letter-spacing:0.05em;">💡 Le savais-tu ?</p>
      <p style="margin:0;font-size:14px;color:#e8f7ed;line-height:1.6;">
        Les comptes qui combinent <strong style="color:#00ff4c;">followers + likes</strong> boostent l'algorithme <strong style="color:#00ff4c;">3x plus efficacement</strong> qu'avec un seul service.
      </p>
    </div>
    <p style="text-align:center;font-size:13px;color:#a9b5ae;margin:0;">
      Maximise tes résultats en ajoutant un boost complémentaire 👇
    </p>
    <div style="text-align:center;">${ctaButton}</div>
  `);
}

function day1Text(username: string, platform: string): string {
  const platformLabel = platform === "tiktok" ? "TikTok" : "Instagram";
  return `Salut @${username} !

Ta commande ${platformLabel} est en cours de livraison.

💡 Le savais-tu ?
Les comptes qui combinent followers + likes boostent l'algorithme 3x plus efficacement.

Maximise tes résultats : https://fanovaly.com

— Fanovaly`;
}

// ── J+3 : Promo code ──
async function day3Html(username: string, promoCode: string, promoPercent: number): Promise<string> {
  return wrap(`
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:40px;">🎁</span>
    </div>
    <h2 style="text-align:center;font-size:20px;font-weight:700;color:#fff;margin:0 0 12px 0;">
      Ton profil a grandi !
    </h2>
    <p style="text-align:center;font-size:14px;color:#a9b5ae;margin:0 0 24px 0;line-height:1.6;">
      Hey <strong style="color:#00ff4c;">@${username}</strong>, tes résultats ont été livrés ! Pour continuer ta croissance, voici un code exclusif :
    </p>
    <div style="background:linear-gradient(135deg,rgba(0,180,53,0.08),rgba(0,255,76,0.04));border:1px dashed rgba(0,255,76,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:20px;">
      <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#a9b5ae;text-transform:uppercase;letter-spacing:0.05em;">Code exclusif</p>
      <p style="margin:0 0 8px 0;font-size:32px;font-weight:800;color:#00ff4c;letter-spacing:4px;font-family:monospace;">${promoCode}</p>
      <p style="margin:0 0 4px 0;font-size:16px;font-weight:600;color:#fff;">-${promoPercent}% sur ta prochaine commande</p>
      <p style="margin:0;font-size:11px;color:#6b756f;">Valable 48h — à utiliser vite !</p>
    </div>
    <div style="text-align:center;">${ctaButton}</div>
  `);
}

function day3Text(username: string, promoCode: string, promoPercent: number): string {
  return `Salut @${username} !

Tes résultats ont été livrés ! Pour continuer ta croissance :

🎁 Code promo : ${promoCode}
-${promoPercent}% sur ta prochaine commande (valable 48h)

Utilise-le ici : https://fanovaly.com

— Fanovaly`;
}

// ── J+7 : Rappel ──
function day7Html(username: string): string {
  return wrap(`
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:40px;">🚀</span>
    </div>
    <h2 style="text-align:center;font-size:20px;font-weight:700;color:#fff;margin:0 0 12px 0;">
      Continue ta croissance !
    </h2>
    <p style="text-align:center;font-size:14px;color:#a9b5ae;margin:0 0 20px 0;line-height:1.6;">
      Hey <strong style="color:#00ff4c;">@${username}</strong>, ça fait une semaine ! Les comptes qui commandent <strong style="color:#00ff4c;">régulièrement</strong> grandissent <strong style="color:#ffb800;">5x plus vite</strong> que les autres.
    </p>
    <div style="background:rgba(0,180,53,0.06);border:1px solid rgba(0,210,106,0.15);border-radius:10px;padding:16px;margin-bottom:20px;">
      <div style="display:flex;gap:12px;align-items:center;">
        <div style="text-align:center;flex:1;">
          <p style="margin:0;font-size:24px;font-weight:800;color:#00ff4c;">+89%</p>
          <p style="margin:4px 0 0 0;font-size:11px;color:#6b756f;">Engagement moyen</p>
        </div>
        <div style="width:1px;height:40px;background:rgba(0,210,106,0.15);"></div>
        <div style="text-align:center;flex:1;">
          <p style="margin:0;font-size:24px;font-weight:800;color:#00ff4c;">5x</p>
          <p style="margin:4px 0 0 0;font-size:11px;color:#6b756f;">Croissance plus rapide</p>
        </div>
      </div>
    </div>
    <p style="text-align:center;font-size:13px;color:#a9b5ae;margin:0 0 4px 0;">
      Ne laisse pas ton profil stagner — relance un boost maintenant !
    </p>
    <div style="text-align:center;">${ctaButton}</div>
  `);
}

function day7Text(username: string): string {
  return `Salut @${username} !

Ça fait une semaine ! Les comptes qui commandent régulièrement grandissent 5x plus vite.

Ne laisse pas ton profil stagner — relance un boost : https://fanovaly.com

— Fanovaly`;
}

// ── Dispatcher ──
export async function sendFollowUpEmail(params: {
  id: number;
  email: string;
  username: string;
  platform: string;
  template: string;
}): Promise<boolean> {
  const { email, username, platform, template } = params;

  let subject: string;
  let html: string;
  let text: string;

  switch (template) {
    case "day1":
      subject = `📈 @${username}, tes résultats sont en cours !`;
      html = day1Html(username, platform);
      text = day1Text(username, platform);
      break;

    case "day3": {
      const promo = await generatePromoCode();
      const code = promo?.code || "FANO-VIP15";
      const percent = promo?.percent || 15;
      subject = `🎁 @${username}, ton code -${percent}% t'attend !`;
      html = await day3Html(username, code, percent);
      text = day3Text(username, code, percent);
      break;
    }

    case "day7":
      subject = `🚀 @${username}, continue ta croissance !`;
      html = day7Html(username);
      text = day7Text(username);
      break;

    default:
      console.warn(`Unknown email template: ${template}`);
      return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: "Fanovaly <support@fanovaly.com>",
      to: [email],
      subject,
      html,
      text,
    });
    if (error) {
      console.error(`Follow-up email error (${template}):`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Follow-up email send failed (${template}):`, err);
    return false;
  }
}
