"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface Props {
  username: string;
  orderId?: number;
  cart?: { price: number }[];
  onReset: () => void;
  platform?: string;
}

export default function SuccessPage({ username, orderId, cart, onReset, platform }: Props) {
  const { t, href } = useTranslation();
  const yt = platform === "youtube";
  const accent = yt ? "rgb(255, 0, 0)" : "rgb(105, 201, 208)";
  const accentMid = yt ? "rgb(204, 0, 0)" : "rgb(105, 201, 208)";
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
      <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: yt ? "rgba(255,0,0,0.1)" : "rgba(105, 201, 208, 0.1)", border: yt ? "2px solid rgba(255,0,0,0.3)" : "2px solid rgba(105, 201, 208, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
            background: yt ? "linear-gradient(135deg, rgba(255,0,0,0.08), rgba(255,0,0,0.03))" : "linear-gradient(135deg, rgba(79, 179, 186, 0.08), rgba(105, 201, 208, 0.03))",
            border: yt ? "1px dashed rgba(255,0,0,0.3)" : "1px dashed rgba(105, 201, 208, 0.3)",
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
              border: yt ? "1px solid rgba(255,0,0,0.3)" : "1px solid rgba(105, 201, 208, 0.3)",
              backgroundColor: yt ? "rgba(255,0,0,0.06)" : "rgba(105, 201, 208, 0.06)",
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
              border: yt ? "2px solid rgba(255,0,0,0.2)" : "2px solid rgba(105, 201, 208, 0.2)",
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
            background: yt ? "linear-gradient(135deg, rgb(153,0,0), rgb(255,0,0))" : "linear-gradient(135deg, rgb(79, 179, 186), rgb(105, 201, 208))",
            color: yt ? "#fff" : "#000",
            fontSize: "14px",
            fontWeight: 700,
            textDecoration: "none",
            fontFamily: "inherit",
            boxShadow: yt ? "0 8px 24px rgba(255,0,0,0.25)" : "0 8px 24px rgba(105, 201, 208, 0.25)",
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

      {/* New analysis button */}
      <button
        onClick={onReset}
        style={{
          marginTop: "4px",
          padding: "12px 28px",
          borderRadius: "12px",
          border: yt ? "1px solid rgba(255,0,0,0.2)" : "1px solid rgba(105, 201, 208, 0.2)",
          backgroundColor: yt ? "rgba(255,0,0,0.08)" : "rgba(79, 179, 186, 0.08)",
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
