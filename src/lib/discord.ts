const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

interface OrderNotifParams {
  orderId?: string;
  username: string;
  platform: string;
  email: string;
  cart: { label: string; qty: number; price: number }[];
  totalCents: number;
}

function fmtQty(n: number): string {
  if (n >= 1000) return (n / 1000) + "K";
  return String(n);
}

export async function sendDiscordOrderNotification(params: OrderNotifParams) {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn("DISCORD_WEBHOOK_URL not set, skipping notification");
    return;
  }

  const { username, platform, email, cart, totalCents } = params;
  const total = (totalCents / 100).toFixed(2);
  const platformLabel = platform === "tiktok" ? "TikTok" : "Instagram";

  const cartLines = cart
    .map((item) => `> ${fmtQty(item.qty)} ${item.label} — ${item.price.toFixed(2)}€`)
    .join("\n");

  const embed = {
    title: "💰 Nouvelle commande !",
    color: 0x00ff4c,
    fields: [
      { name: "👤 Utilisateur", value: `@${username}`, inline: true },
      { name: "📱 Plateforme", value: platformLabel, inline: true },
      { name: "💵 Total", value: `**${total}€**`, inline: true },
      { name: "📧 Email", value: email || "Non renseigné", inline: false },
      { name: "🛒 Panier", value: cartLines, inline: false },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "Fanovaly" },
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (err) {
    console.error("Discord webhook error:", err);
  }
}
