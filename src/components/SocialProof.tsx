"use client";

import { useState, useEffect } from "react";
import { useTranslation, LANG_LOCALE } from "@/lib/i18n";

const avatars = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face",
];

const avatarStyle: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "9999px",
  border: "2px solid rgb(3, 8, 6)",
  objectFit: "cover",
  boxShadow: "0 0 8px rgba(0, 0, 0, 0.5)",
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pseudoRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function SocialProof({ variant = "default" }: { variant?: "default" | "youtube" }) {
  const { t, lang } = useTranslation();
  const isYt = variant === "youtube";

  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    const dayKey = `social-${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
    const seed = hashStr(dayKey);
    const hour = now.getHours() + now.getMinutes() / 60;
    const ramp = 0.3 + 0.7 * Math.min(1, hour / 22);
    const base = 11000 + Math.floor(3000 * ramp * (0.85 + 0.3 * pseudoRand(seed)));
    setCount(base);
  }, []);

  const formatted = count !== null ? `+${count.toLocaleString(LANG_LOCALE[lang])}` : "+12 000";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 20px",
        borderRadius: "16px",
        border: isYt ? "1px solid rgba(255, 50, 50, 0.2)" : "1px solid rgba(105, 201, 208, 0.2)",
        backgroundColor: "rgba(14, 21, 18, 0.9)",
      }}
    >
      {/* Avatar stack */}
      <div style={{ display: "flex" }}>
        {avatars.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            loading="lazy"
            style={{
              ...avatarStyle,
              marginLeft: i === 0 ? 0 : "-10px",
              zIndex: avatars.length - i,
              position: "relative",
            }}
          />
        ))}
      </div>

      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "rgb(232, 247, 237)",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {formatted}{" "}
          <span style={{ fontWeight: 400, color: "rgb(169, 181, 174)" }}>
            {isYt ? t("social.videosAnalyzed") : t("social.profilesAnalyzed")}
          </span>
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "rgb(169, 181, 174)",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {t("social.thisMonth")}
        </p>
      </div>
    </div>
  );
}
