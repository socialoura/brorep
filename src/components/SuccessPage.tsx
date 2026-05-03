"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation, fmtPrice, type Currency } from "@/lib/i18n";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface UpsellItem {
  service: string;
  labelKey: string;
  icon: string;
  pitchKey: string;
}

const INSTAGRAM_UPSELLS: UpsellItem[] = [
  { service: "followers", labelKey: "upsell.followers", icon: "👥", pitchKey: "upsell.pitch.followers" },
  { service: "likes", labelKey: "upsell.likes", icon: "❤️", pitchKey: "upsell.pitch.likes" },
  { service: "views", labelKey: "upsell.views", icon: "👁️", pitchKey: "upsell.pitch.views" },
];

const TIKTOK_UPSELLS: UpsellItem[] = [
  { service: "followers", labelKey: "upsell.followers", icon: "👥", pitchKey: "upsell.pitch.followers" },
  { service: "likes", labelKey: "upsell.likes", icon: "❤️", pitchKey: "upsell.pitch.likes" },
  { service: "views", labelKey: "upsell.views", icon: "👁️", pitchKey: "upsell.pitch.views" },
];

const YOUTUBE_UPSELLS: UpsellItem[] = [
  { service: "yt_subscribers", labelKey: "upsell.subscribers", icon: "👥", pitchKey: "upsell.pitch.subscribers" },
  { service: "yt_likes", labelKey: "upsell.likes", icon: "👍", pitchKey: "upsell.pitch.ytLikes" },
  { service: "yt_views", labelKey: "upsell.views", icon: "👁️", pitchKey: "upsell.pitch.ytViews" },
];

const X_UPSELLS: UpsellItem[] = [
  { service: "x_followers", labelKey: "upsell.followers", icon: "👥", pitchKey: "upsell.pitch.followers" },
  { service: "x_likes", labelKey: "upsell.likes", icon: "❤️", pitchKey: "upsell.pitch.likes" },
  { service: "x_retweets", labelKey: "upsell.retweets", icon: "🔁", pitchKey: "upsell.pitch.retweets" },
];

const TWITCH_UPSELLS: UpsellItem[] = [
  { service: "tw_followers", labelKey: "upsell.followers", icon: "👥", pitchKey: "upsell.pitch.followers" },
  { service: "tw_live_viewers", labelKey: "upsell.viewers", icon: "👁️", pitchKey: "upsell.pitch.viewers" },
];

const PLATFORM_UPSELLS: Record<string, UpsellItem[]> = {
  instagram: INSTAGRAM_UPSELLS,
  tiktok: TIKTOK_UPSELLS,
  youtube: YOUTUBE_UPSELLS,
  x: X_UPSELLS,
  twitch: TWITCH_UPSELLS,
};

interface Props {
  username: string;
  orderId?: number;
  cart?: { service?: string; price: number }[];
  onReset: () => void;
  platform?: string;
  onUpsellClick?: (service: string) => void;
}

export default function SuccessPage({ username, orderId, cart, onReset, platform, onUpsellClick }: Props) {
  const { t, href } = useTranslation();
  const colors: Record<string, { accent: string; mid: string; bg: string; border: string; gradient: string; textOnGrad: string }> = {
    youtube:   { accent: "rgb(255,0,0)",     mid: "rgb(204,0,0)",     bg: "rgba(255,0,0,0.1)",       border: "rgba(255,0,0,0.3)",       gradient: "linear-gradient(135deg, rgb(153,0,0), rgb(255,0,0))",             textOnGrad: "#fff" },
    instagram: { accent: "#E1306C",          mid: "#C1358C",          bg: "rgba(225,48,108,0.1)",     border: "rgba(225,48,108,0.3)",     gradient: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)",              textOnGrad: "#fff" },
    tiktok:    { accent: "rgb(105,201,208)", mid: "rgb(105,201,208)", bg: "rgba(105,201,208,0.1)",    border: "rgba(105,201,208,0.3)",    gradient: "linear-gradient(135deg, rgb(79,179,186), rgb(105,201,208))",      textOnGrad: "#000" },
    x:         { accent: "#1D9BF0",          mid: "#1A8CD8",          bg: "rgba(29,155,240,0.1)",     border: "rgba(29,155,240,0.3)",     gradient: "linear-gradient(135deg, #1A8CD8, #1D9BF0)",                      textOnGrad: "#fff" },
    twitch:    { accent: "rgb(145,71,255)",  mid: "rgb(110,50,200)",  bg: "rgba(145,71,255,0.1)",     border: "rgba(145,71,255,0.3)",     gradient: "linear-gradient(135deg, rgb(110,50,200), rgb(145,71,255))",       textOnGrad: "#fff" },
    spotify:   { accent: "rgb(29,185,84)",   mid: "rgb(30,215,96)",   bg: "rgba(29,185,84,0.1)",      border: "rgba(29,185,84,0.3)",      gradient: "linear-gradient(135deg, rgb(22,140,63), rgb(30,215,96))",         textOnGrad: "#000" },
  };
  const c = colors[platform || "tiktok"] || colors.tiktok;
  const accent = c.accent;
  const accentMid = c.mid;
  const [promo, setPromo] = useState<{ code: string; percent: number; expiresAt: number } | null>(null);
  const [countdown, setCountdown] = useState("");
  const [copied, setCopied] = useState(false);
  const fetched = useRef(false);

  // Fire Google Ads conversion once
  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag && process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL) {
      const value = cart ? cart.reduce((s, i) => s + i.price, 0) : 0;
      window.gtag("event", "conversion", {
        send_to: `${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}/${process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL}`,
        value,
        currency: "EUR",
        transaction_id: orderId ? String(orderId) : undefined,
      });
    }
  }, []);

  // Fetch promo code once (only if we have a valid order)
  useEffect(() => {
    if (fetched.current || !orderId) return;
    fetched.current = true;
    fetch("/api/generate-promo", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.code) setPromo(data);
      })
      .catch(() => {});
  }, [orderId]);

  // Countdown timer
  useEffect(() => {
    if (!promo) return;
    const update = () => {
      const diff = promo.expiresAt * 1000 - Date.now();
      if (diff <= 0) {
        setCountdown(t("success.expired"));
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [promo]);

  function copyCode() {
    if (!promo) return;
    navigator.clipboard.writeText(promo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const green = accent;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "0 16px", maxWidth: "440px", width: "100%" }}>
      {/* Check icon */}
      <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: c.bg, border: `2px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: 0 }}>{t("success.title")}</h2>
      <p style={{ fontSize: "14px", color: "rgb(169, 181, 174)", margin: 0, maxWidth: "320px", lineHeight: 1.5 }}>
        {t("success.orderRegistered")} <span style={{ color: green, fontWeight: 600 }}>@{username}</span> {t("success.orderRegistered2")}
      </p>

      {/* Promo code block */}
      {promo && (
        <div
          style={{
            marginTop: "8px",
            width: "100%",
            background: `linear-gradient(135deg, ${c.bg}, transparent)`,
            border: `1px dashed ${c.border}`,
            borderRadius: "16px",
            padding: "24px 20px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 4px 0", fontSize: "11px", fontWeight: 600, color: "rgb(169, 181, 174)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🎁 {t("success.giftTitle")}
          </p>

          {/* Code */}
          <button
            onClick={copyCode}
            style={{
              margin: "12px 0",
              padding: "12px 24px",
              borderRadius: "12px",
              border: `1px solid ${c.border}`,
              backgroundColor: c.bg,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <span className="promo-code-text" style={{ fontWeight: 800, color: green, fontFamily: "monospace" }}>
              {promo.code}
            </span>
          </button>

          <p style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 600, color: "#fff" }}>
            -{promo.percent}% {t("success.offNextOrder")}
          </p>

          {/* Countdown */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "8px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(169, 181, 174)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span style={{ fontSize: "13px", color: "rgb(169, 181, 174)" }}>
              {t("success.expiresIn")} <strong style={{ color: "#ffb800" }}>{countdown}</strong>
            </span>
          </div>

          {/* Copy feedback */}
          <p style={{ margin: "8px 0 0 0", fontSize: "11px", color: copied ? green : "rgb(107, 117, 111)", transition: "color 0.2s" }}>
            {copied ? `✓ ${t("success.codeCopied")}` : t("success.clickToCopy")}
          </p>
        </div>
      )}

      {/* Loading state for promo */}
      {!promo && (
        <div style={{ marginTop: "8px", padding: "16px", textAlign: "center" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              border: `2px solid ${c.border}`,
              borderTopColor: accentMid,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 8px auto",
            }}
          />
          <p style={{ fontSize: "12px", color: "rgb(107, 117, 111)", margin: 0 }}>{t("success.generatingPromo")}</p>
        </div>
      )}

      {/* Order tracking link */}
      {orderId && (
        <a
          href={href(`/order/${orderId}`)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "8px",
            padding: "12px 28px",
            borderRadius: "12px",
            border: "none",
            background: c.gradient,
            color: c.textOnGrad,
            fontSize: "14px",
            fontWeight: 700,
            textDecoration: "none",
            fontFamily: "inherit",
            boxShadow: `0 8px 24px ${c.border}`,
          }}
        >
          📦 {t("success.trackOrder")}
        </a>
      )}

      {/* All orders link */}
      <a
        href={href("/orders")}
        style={{
          marginTop: "4px",
          fontSize: "12px",
          color: "rgb(169, 181, 174)",
          textDecoration: "underline",
        }}
      >
        {t("success.viewAllOrders")}
      </a>

      {/* Post-purchase upsell */}
      {(() => {
        const allUpsells = PLATFORM_UPSELLS[platform || "tiktok"] || [];
        const boughtServices = new Set((cart || []).map((i) => i.service).filter(Boolean));
        const suggestions = allUpsells.filter((u) => !boughtServices.has(u.service));
        if (suggestions.length === 0) return null;
        return (
          <div style={{
            marginTop: "12px", width: "100%", padding: "16px",
            borderRadius: "14px", border: `1px solid ${c.border}`,
            background: `linear-gradient(135deg, ${c.bg}, transparent)`,
          }}>
            <p style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>
              {t("upsell.title")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {suggestions.map((item) => (
                <button
                  key={item.service}
                  onClick={() => onUpsellClick?.(item.service)}
                  className="pack-card"
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "12px 14px", borderRadius: "12px",
                    border: `1px solid ${c.border}`, backgroundColor: "rgba(255,255,255,0.02)",
                    cursor: "pointer", fontFamily: "inherit", width: "100%",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                      {t(item.labelKey)}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgb(169,181,174)", lineHeight: 1.4 }}>
                      {t(item.pitchKey)}
                    </p>
                  </div>
                  <span style={{
                    padding: "6px 12px", borderRadius: "8px",
                    background: c.gradient, color: c.textOnGrad,
                    fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    + {t("upsell.addBtn")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* New analysis button */}
      <button
        onClick={onReset}
        style={{
          marginTop: "4px",
          padding: "12px 28px",
          borderRadius: "12px",
          border: `1px solid ${c.border}`,
          backgroundColor: c.bg,
          color: accent,
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {t("success.newAnalysis")}
      </button>
    </div>
  );
}
