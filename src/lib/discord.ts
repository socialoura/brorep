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
  const fmt = (amount: number): string => {
    switch (currency) {
      case "usd": return `$${amount.toFixed(2)}`;
      case "gbp": return `\u00A3${amount.toFixed(2)}`;
      case "cad": return `C$${amount.toFixed(2)}`;
      case "nzd": return `NZ$${amount.toFixed(2)}`;
      case "chf": return `CHF ${amount.toFixed(2)}`;
      default: return `${amount.toFixed(2)}\u20AC`;
    }
  };
  const total = fmt(totalCents / 100);
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
      return `> ${fmtQty(item.qty)} ${item.label} — ${fmt(item.price)}${liveSuffix}`;
    })
    .join("\n");

  const liveItem = cart.find((c) => c.liveStartAt);

  const embed = {
    title: "💰 Nouvelle commande !",
    color: 0x00ff4c,
    fields: [
      { name: "👤 Utilisateur", value: `@${username}`, inline: true },
      { name: "📱 Plateforme", value: platformLabel, inline: true },
      { name: "💵 Total", value: `**${total}**`, inline: true },
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

interface ManualActionNotifParams {
  orderId: number;
  username: string;
  platform: string;
  email: string;
  reason: string;
  affectedServices: { label: string; qty: number }[];
  adminUrl?: string;
}

export async function sendDiscordManualActionNotification(params: ManualActionNotifParams) {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn("DISCORD_WEBHOOK_URL not set, skipping manual-action notification");
    return;
  }

  const { orderId, username, platform, email, reason, affectedServices, adminUrl } = params;
  const platformLabel = platform === "youtube" ? "YouTube"
    : platform === "tiktok" ? "TikTok"
    : platform === "instagram" ? "Instagram"
    : platform === "spotify" ? "Spotify"
    : platform === "x" ? "X (Twitter)"
    : platform === "twitch" ? "Twitch"
    : platform;

  const servicesLines = affectedServices
    .map((s) => `> ${fmtQty(s.qty)} ${s.label}`)
    .join("\n");

  const embed = {
    title: "\u26A0\uFE0F Action manuelle requise",
    color: 0xffae00,
    fields: [
      { name: "#\uFE0F\u20E3 Commande", value: `#${orderId}`, inline: true },
      { name: "\uD83D\uDC64 Utilisateur", value: `@${username}`, inline: true },
      { name: "\uD83D\uDCF1 Plateforme", value: platformLabel, inline: true },
      { name: "\uD83D\uDCE7 Email", value: email || "Non renseigné", inline: false },
      { name: "\uD83D\uDEA8 Motif", value: reason, inline: false },
      { name: "\uD83D\uDD27 Services en attente (auto-SMM skipped)", value: servicesLines || "-", inline: false },
      ...(adminUrl ? [{ name: "\uD83D\uDD17 Admin", value: adminUrl, inline: false }] : []),
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "Fanovaly — nécessite intervention" },
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (err) {
    console.error("Discord manual-action webhook error:", err);
  }
}
