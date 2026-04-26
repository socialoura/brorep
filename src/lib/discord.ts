const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

interface OrderNotifParams {
  orderId?: string;
  username: string;
  platform: string;
  email: string;
  cart: { label: string; qty: number; price: number; service?: string; liveStartAt?: string }[];
  totalCents: number;
  currency?: string;
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

  const { username, platform, email, cart, totalCents, currency } = params;
  const sym = currency === "usd" ? "$" : "€";
  const total = (totalCents / 100).toFixed(2);
  const platformLabel = platform === "youtube" ? "YouTube"
    : platform === "tiktok" ? "TikTok"
    : platform === "instagram" ? "Instagram"
    : platform === "spotify" ? "Spotify"
    : platform === "x" ? "X (Twitter)"
    : platform === "twitch" ? "Twitch"
    : platform;

  const cartLines = cart
    .map((item) => {
      const liveSuffix = item.liveStartAt
        ? ` ⏰ ${new Date(item.liveStartAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`
        : "";
      return `> ${fmtQty(item.qty)} ${item.label} — ${item.price.toFixed(2)}${sym}${liveSuffix}`;
    })
    .join("\n");

  const liveItem = cart.find((c) => c.liveStartAt);

  const embed = {
    title: "💰 Nouvelle commande !",
    color: 0x00ff4c,
    fields: [
      { name: "👤 Utilisateur", value: `@${username}`, inline: true },
      { name: "📱 Plateforme", value: platformLabel, inline: true },
      { name: "💵 Total", value: `**${total}${sym}**`, inline: true },
      { name: "📧 Email", value: email || "Non renseigné", inline: false },
      { name: "🛒 Panier", value: cartLines, inline: false },
      ...(liveItem?.liveStartAt ? [{ name: "🔴 Début du live", value: new Date(liveItem.liveStartAt).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }), inline: false }] : []),
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
