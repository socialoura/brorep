import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json({ error: "Email and message required" }, { status: 400 });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const embed = {
      title: "💬 Nouveau message client",
      color: 0x1db954,
      fields: [
        { name: "📧 Email", value: email, inline: false },
        { name: "💬 Message", value: message, inline: false },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: "Fanovaly Chat Widget" },
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
