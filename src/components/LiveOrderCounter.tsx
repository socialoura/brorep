"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";

/**
 * Pseudo-live order counter. Shows "X orders today" with a small live dot.
 * Number is deterministic-per-day so it doesn't reset on reload, then
 * grows slowly while the page is open. Anchors the social-proof claim
 * without faking server data.
 */
export default function LiveOrderCounter({
  platform = "tiktok",
  accent,
}: {
  platform?: string;
  accent?: string;
}) {
  const { lang } = useTranslation();
  const accentColor = accent ?? defaultAccent(platform);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Deterministic seed per day + platform to keep number consistent across reloads
    const today = new Date();
    const dayKey = `${today.getUTCFullYear()}-${today.getUTCMonth()}-${today.getUTCDate()}`;
    const seed = hashString(`${platform}-${dayKey}`);
    // Time-of-day factor: ramp from ~30% at 00h to 100% at 23h
    const hour = today.getHours() + today.getMinutes() / 60;
    const ramp = 0.3 + 0.7 * Math.min(1, hour / 22);
    const baseFloor = baseRange(platform).min;
    const baseCeil = baseRange(platform).max;
    const range = baseCeil - baseFloor;
    const initial = Math.floor(baseFloor + range * ramp * (0.85 + 0.3 * pseudoRandom(seed)));
    setCount(initial);

    // Slowly increment while user is on the page (every 25–55s, +1)
    const tick = () => {
      const delay = 25_000 + Math.random() * 30_000;
      const id = window.setTimeout(() => {
        setCount((c) => (c == null ? c : c + 1));
        tick();
      }, delay);
      return id;
    };
    const timeoutId = tick();
    return () => window.clearTimeout(timeoutId);
  }, [platform]);

  if (count == null) return null;

  const label = lang === "fr" ? "commandes aujourd'hui" : "orders today";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "999px",
        border: `1px solid ${accentColor}33`,
        background: `${accentColor}14`,
        fontSize: "12px",
        fontWeight: 600,
        color: "rgb(232, 247, 237)",
      }}
    >
      <span
        className="animate-pulse-dot"
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: accentColor,
          flexShrink: 0,
          boxShadow: `0 0 8px ${accentColor}`,
        }}
      />
      <span style={{ color: accentColor, fontWeight: 800 }}>{count.toLocaleString(lang === "fr" ? "fr-FR" : "en-US")}</span>
      <span style={{ color: "rgb(169, 181, 174)", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pseudoRandom(seed: number): number {
  // 0..1 deterministic from seed
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function baseRange(platform: string): { min: number; max: number } {
  switch (platform) {
    case "tiktok":
      return { min: 80, max: 240 };
    case "instagram":
      return { min: 60, max: 180 };
    case "youtube":
      return { min: 40, max: 120 };
    case "spotify":
      return { min: 30, max: 90 };
    case "x":
      return { min: 25, max: 75 };
    case "twitch":
      return { min: 20, max: 70 };
    default:
      return { min: 40, max: 140 };
  }
}

function defaultAccent(platform: string): string {
  switch (platform) {
    case "tiktok": return "#69C9D0";
    case "instagram": return "#E1306C";
    case "youtube": return "#ff3232";
    case "spotify": return "#1DB954";
    case "x": return "#1DA1F2";
    case "twitch": return "rgb(145,71,255)";
    default: return "#69C9D0";
  }
}
