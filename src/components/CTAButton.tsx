"use client";

import { useState, useEffect } from "react";
import { useTranslation, fmtPrice } from "@/lib/i18n";

export default function CTAButton({ onClick }: { onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const { t, currency } = useTranslation();
  const [minPrice, setMinPrice] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (!data.pricing) return;
        const key = currency === "usd" ? "price_usd" : currency === "gbp" ? "price_gbp" : currency === "cad" ? "price_cad" : currency === "nzd" ? "price_nzd" : currency === "aud" ? "price_aud" : currency === "chf" ? "price_chf" : "price";
        const prices = data.pricing.map((p: Record<string, number>) => Number(p[key]) || Number(p.price)).filter((v: number) => v > 0);
        if (prices.length > 0) setMinPrice(Math.min(...prices));
      })
      .catch(() => {});
  }, [currency]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 32px",
        borderRadius: "16px",
        border: "none",
        cursor: "pointer",
        background: "linear-gradient(135deg, #69C9D0, #8DDFE5)",
        color: "#000",
        fontSize: "18px",
        fontWeight: 700,
        fontFamily: "inherit",
        boxShadow: hovered
          ? "0 14px 50px rgba(105, 201, 208, 0.4)"
          : "0 10px 40px rgba(105, 201, 208, 0.25)",
        transform: hovered ? "scale(1.04)" : "scale(1)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* Shine sweep */}
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "40%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
            animation: "cta-shine-move 3s ease-in-out infinite",
          }}
        />
      </span>

      <span style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
        <span>{t("cta.launch")}</span>
        {minPrice !== null && <span style={{ fontSize: "12px", fontWeight: 600, opacity: 0.75 }}>{t("cta.from")} {fmtPrice(minPrice, currency)}</span>}
      </span>

      <style>{`
        @keyframes cta-shine-move {
          0% { transform: translateX(-150%); }
          50% { transform: translateX(350%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </button>
  );
}
