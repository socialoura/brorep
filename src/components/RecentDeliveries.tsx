"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n";

type Theme = {
  bg: string;
  border: string;
  accent: string;
  ringSoft: string;
  textStrong: string;
  textSoft: string;
};

function themeFor(platform?: string): Theme {
  switch (platform) {
    case "youtube":
      return {
        bg: "linear-gradient(180deg, rgba(255,0,0,0.08), rgba(255,0,0,0.04))",
        border: "rgba(255,0,0,0.18)",
        accent: "rgb(255,80,80)",
        ringSoft: "rgba(255,80,80,0.55)",
        textStrong: "rgb(255,220,220)",
        textSoft: "rgb(220,180,180)",
      };
    case "x":
      return {
        bg: "linear-gradient(180deg, rgba(29,155,240,0.08), rgba(29,155,240,0.04))",
        border: "rgba(29,155,240,0.18)",
        accent: "rgb(29,155,240)",
        ringSoft: "rgba(29,155,240,0.55)",
        textStrong: "rgb(220,236,255)",
        textSoft: "rgb(170,200,230)",
      };
    case "twitch":
      return {
        bg: "linear-gradient(180deg, rgba(145,71,255,0.08), rgba(145,71,255,0.04))",
        border: "rgba(145,71,255,0.18)",
        accent: "rgb(165,100,255)",
        ringSoft: "rgba(165,100,255,0.55)",
        textStrong: "rgb(232,220,255)",
        textSoft: "rgb(190,170,220)",
      };
    case "spotify":
      return {
        bg: "linear-gradient(180deg, rgba(29,185,84,0.10), rgba(29,185,84,0.04))",
        border: "rgba(29,185,84,0.20)",
        accent: "rgb(30,215,96)",
        ringSoft: "rgba(30,215,96,0.55)",
        textStrong: "rgb(216,247,224)",
        textSoft: "rgb(170,210,180)",
      };
    case "instagram":
      return {
        bg: "linear-gradient(180deg, rgba(225,48,108,0.08), rgba(225,48,108,0.04))",
        border: "rgba(225,48,108,0.18)",
        accent: "rgb(240,90,140)",
        ringSoft: "rgba(240,90,140,0.55)",
        textStrong: "rgb(255,220,232)",
        textSoft: "rgb(220,170,195)",
      };
    default:
      // tiktok
      return {
        bg: "linear-gradient(180deg, rgba(105,201,208,0.10), rgba(105,201,208,0.04))",
        border: "rgba(105,201,208,0.20)",
        accent: "rgb(105,201,208)",
        ringSoft: "rgba(105,201,208,0.55)",
        textStrong: "rgb(220,247,250)",
        textSoft: "rgb(170,210,213)",
      };
  }
}

type Entry = { qty: number; serviceLabel: string };

function entriesFor(platform?: string, lang: string = "fr"): Entry[] {
  const fr = lang === "fr";
  switch (platform) {
    case "youtube":
      return [
        { qty: 100, serviceLabel: fr ? "abonnés" : "subscribers" },
        { qty: 1000, serviceLabel: fr ? "vues" : "views" },
        { qty: 250, serviceLabel: fr ? "likes" : "likes" },
        { qty: 500, serviceLabel: fr ? "abonnés" : "subscribers" },
        { qty: 5000, serviceLabel: fr ? "vues" : "views" },
        { qty: 1000, serviceLabel: fr ? "abonnés" : "subscribers" },
      ];
    case "x":
      return [
        { qty: 100, serviceLabel: fr ? "followers" : "followers" },
        { qty: 250, serviceLabel: fr ? "likes" : "likes" },
        { qty: 50, serviceLabel: fr ? "retweets" : "retweets" },
        { qty: 1000, serviceLabel: fr ? "followers" : "followers" },
        { qty: 500, serviceLabel: fr ? "likes" : "likes" },
      ];
    case "twitch":
      return [
        { qty: 100, serviceLabel: fr ? "followers" : "followers" },
        { qty: 250, serviceLabel: fr ? "followers" : "followers" },
        { qty: 500, serviceLabel: fr ? "followers" : "followers" },
        { qty: 1000, serviceLabel: fr ? "followers" : "followers" },
        { qty: 2500, serviceLabel: fr ? "followers" : "followers" },
      ];
    case "spotify":
      return [
        { qty: 1000, serviceLabel: fr ? "streams" : "streams" },
        { qty: 5000, serviceLabel: fr ? "streams" : "streams" },
        { qty: 10000, serviceLabel: fr ? "streams" : "streams" },
        { qty: 25000, serviceLabel: fr ? "streams" : "streams" },
      ];
    case "instagram":
      return [
        { qty: 250, serviceLabel: fr ? "likes" : "likes" },
        { qty: 100, serviceLabel: fr ? "followers" : "followers" },
        { qty: 5000, serviceLabel: fr ? "vues" : "views" },
        { qty: 500, serviceLabel: fr ? "followers" : "followers" },
        { qty: 1000, serviceLabel: fr ? "likes" : "likes" },
        { qty: 1000, serviceLabel: fr ? "followers" : "followers" },
      ];
    default:
      // tiktok
      return [
        { qty: 250, serviceLabel: fr ? "likes" : "likes" },
        { qty: 100, serviceLabel: fr ? "followers" : "followers" },
        { qty: 5000, serviceLabel: fr ? "vues" : "views" },
        { qty: 300, serviceLabel: fr ? "followers" : "followers" },
        { qty: 1000, serviceLabel: fr ? "likes" : "likes" },
        { qty: 5000, serviceLabel: fr ? "followers" : "followers" },
        { qty: 500, serviceLabel: fr ? "followers" : "followers" },
        { qty: 1000, serviceLabel: fr ? "followers" : "followers" },
      ];
  }
}

const ROW_HEIGHT = 54;

/**
 * Recent deliveries ticker — rotating "X likes delivered, Y min ago" feed
 * to reassure customers right before payment. Adapted to platform colors.
 */
export default function RecentDeliveries({ platform = "tiktok" }: { platform?: string }) {
  const { lang } = useTranslation();
  const th = themeFor(platform);
  const entries = useMemo(() => entriesFor(platform, lang), [platform, lang]);
  // Stable random "X min ago" times for each entry, generated client-side
  const [times, setTimes] = useState<number[]>([]);
  useEffect(() => {
    setTimes(entries.map(() => 2 + Math.floor(Math.random() * 30)));
  }, [entries]);

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (entries.length === 0) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % entries.length), 3200);
    return () => window.clearInterval(id);
  }, [entries.length]);

  const minLabel = lang === "fr" ? "min" : "min";
  const agoLabel = lang === "fr" ? "il y a" : "";
  const agoSuffix = lang === "fr" ? "" : "ago";

  if (entries.length === 0) return null;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "360px",
        height: `${ROW_HEIGHT}px`,
        overflow: "hidden",
        borderRadius: "12px",
        padding: "0 14px",
        background: th.bg,
        border: `1px solid ${th.border}`,
        margin: "0 auto 16px auto",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "14px",
          right: "14px",
          top: 0,
          transform: `translateY(-${idx * ROW_HEIGHT}px)`,
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {entries.map((e, i) => (
          <Row
            key={i}
            qty={e.qty}
            serviceLabel={e.serviceLabel}
            minutes={times[i] ?? 5}
            theme={th}
            verbDelivered={lang === "fr" ? deliveredFr(e.serviceLabel) : "delivered"}
            agoLabel={agoLabel}
            agoSuffix={agoSuffix}
            minLabel={minLabel}
          />
        ))}
      </div>
    </div>
  );
}

function Row({
  qty,
  serviceLabel,
  minutes,
  theme,
  verbDelivered,
  agoLabel,
  agoSuffix,
  minLabel,
}: {
  qty: number;
  serviceLabel: string;
  minutes: number;
  theme: Theme;
  verbDelivered: string;
  agoLabel: string;
  agoSuffix: string;
  minLabel: string;
}) {
  return (
    <div
      style={{
        height: `${ROW_HEIGHT}px`,
        display: "flex",
        alignItems: "center",
        width: "100%",
        gap: "10px",
        fontSize: "13px",
      }}
    >
      {/* Pulsing dot with ping ring */}
      <span
        style={{
          position: "relative",
          display: "inline-flex",
          width: "10px",
          height: "10px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: theme.ringSoft,
            opacity: 0.75,
            animation: "rd-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite",
          }}
        />
        <span
          style={{
            position: "relative",
            display: "inline-flex",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: theme.accent,
          }}
        />
      </span>

      {/* Text + meta */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          minWidth: 0,
        }}
      >
        <div
          style={{
            color: theme.textStrong,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontWeight: 500,
          }}
        >
          <span style={{ fontWeight: 700 }}>
            {qty.toLocaleString()} {serviceLabel}
          </span>{" "}
          <span style={{ color: theme.textSoft }}>{verbDelivered}</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
            marginLeft: "10px",
            color: theme.textSoft,
            fontSize: "11px",
          }}
        >
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
              padding: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              stroke={theme.accent}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <span>
            {agoLabel ? agoLabel + " " : ""}
            {minutes} {minLabel}
            {agoSuffix ? " " + agoSuffix : ""}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes rd-ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function deliveredFr(label: string): string {
  // "livrées" for feminine plural (likes, vues) / "livrés" for masculine plural
  if (label === "likes" || label === "vues") return "livrées";
  return "livrés";
}
