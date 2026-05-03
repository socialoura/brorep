"use client";

import { useState, useMemo, Suspense } from "react";
import { useTranslation, fmtPrice } from "@/lib/i18n";
import type { Currency } from "@/lib/i18n";
import AnimatedBackground from "@/components/AnimatedBackground";

/* ── Follower packs (mirrored from ServiceSelect defaults) ── */
const PACKS = [
  { qty: 100, price: 2.99, priceUsd: 2.99 },
  { qty: 250, price: 5.99, priceUsd: 5.99 },
  { qty: 500, price: 9.99, priceUsd: 9.99 },
  { qty: 1000, price: 16.99, priceUsd: 16.99 },
  { qty: 2500, price: 34.99, priceUsd: 34.99 },
  { qty: 5000, price: 59.99, priceUsd: 59.99 },
  { qty: 10000, price: 99.99, priceUsd: 99.99 },
  { qty: 25000, price: 199.99, priceUsd: 199.99 },
];

function findBestPack(needed: number) {
  // Find the smallest pack that covers the needed amount
  for (const pack of PACKS) {
    if (pack.qty >= needed) return pack;
  }
  return PACKS[PACKS.length - 1]; // biggest if needed > max
}

function fmtQty(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

/* ── Slider stops for target followers ── */
const TARGET_STOPS = [500, 1000, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 50000];

function CalculatorInner() {
  const { t, href, currency } = useTranslation();
  const accent = "#E1306C";

  const [currentFollowers, setCurrentFollowers] = useState(500);
  const [targetIdx, setTargetIdx] = useState(4); // default: 5000
  const target = TARGET_STOPS[targetIdx];
  const needed = Math.max(0, target - currentFollowers);

  const organicGrowth30d = Math.round(currentFollowers * 0.02); // ~2% organic growth in 30 days
  const perDay = Math.round(needed / 30);
  const growthPercent = currentFollowers > 0 ? ((needed / currentFollowers) * 100).toFixed(0) : "∞";

  const pack = useMemo(() => findBestPack(needed), [needed]);
  const packPrice = currency === "usd" ? pack.priceUsd : pack.price;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Comment fonctionne le calculateur de croissance Instagram ?",
        acceptedAnswer: { "@type": "Answer", text: "Entrez votre nombre de followers actuels et votre objectif. Le calculateur vous recommande le pack idéal et compare la croissance organique vs boostée." },
      },
      {
        "@type": "Question",
        name: "Est-ce que le calculateur est gratuit ?",
        acceptedAnswer: { "@type": "Answer", text: "Oui, le calculateur de croissance Instagram est 100% gratuit et sans inscription." },
      },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050505", fontFamily: "inherit", position: "relative", overflow: "hidden" }}>
      <AnimatedBackground />
      <div style={{ position: "relative", zIndex: 1, maxWidth: "560px", margin: "0 auto", padding: "60px 20px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span style={{
            display: "inline-block", padding: "4px 12px", borderRadius: "999px",
            background: "rgba(225,48,108,0.1)", border: "1px solid rgba(225,48,108,0.25)",
            fontSize: "11px", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.06em",
            marginBottom: "16px",
          }}>
            {t("calc.freeToolTitle")}
          </span>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
            {t("calc.title")}
          </h1>
          <p style={{ margin: "12px 0 0", fontSize: "15px", color: "rgb(169,181,174)", lineHeight: 1.5 }}>
            {t("calc.subtitle")}
          </p>
        </div>

        {/* Current followers input */}
        <div style={{ marginBottom: "32px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgb(169,181,174)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("calc.currentFollowers")}
          </label>
          <input
            type="number"
            min={0}
            max={1000000}
            value={currentFollowers}
            onChange={(e) => setCurrentFollowers(Math.max(0, Number(e.target.value)))}
            style={{
              width: "100%", padding: "14px 16px", borderRadius: "12px",
              border: "1px solid rgba(225,48,108,0.2)", backgroundColor: "rgba(225,48,108,0.04)",
              color: "#fff", fontSize: "18px", fontWeight: 700, fontFamily: "inherit",
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Target slider */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "rgb(169,181,174)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("calc.targetFollowers")}
            </label>
            <span style={{ fontSize: "24px", fontWeight: 800, color: accent }}>{fmtQty(target)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={TARGET_STOPS.length - 1}
            value={targetIdx}
            onChange={(e) => setTargetIdx(Number(e.target.value))}
            style={{
              width: "100%", height: "6px", appearance: "none", borderRadius: "3px",
              background: `linear-gradient(to right, ${accent} ${(targetIdx / (TARGET_STOPS.length - 1)) * 100}%, rgba(255,255,255,0.08) ${(targetIdx / (TARGET_STOPS.length - 1)) * 100}%)`,
              outline: "none", cursor: "pointer",
              accentColor: accent,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
            <span style={{ fontSize: "10px", color: "rgb(107,117,111)" }}>{fmtQty(TARGET_STOPS[0])}</span>
            <span style={{ fontSize: "10px", color: "rgb(107,117,111)" }}>{fmtQty(TARGET_STOPS[TARGET_STOPS.length - 1])}</span>
          </div>
        </div>

        {/* Results cards */}
        {needed > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div style={{ padding: "16px 12px", borderRadius: "14px", border: "1px solid rgba(225,48,108,0.15)", background: "rgba(225,48,108,0.04)", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: accent }}>{fmtQty(needed)}</p>
                <p style={{ margin: "4px 0 0", fontSize: "10px", color: "rgb(169,181,174)", textTransform: "uppercase" }}>{t("calc.followersNeeded")}</p>
              </div>
              <div style={{ padding: "16px 12px", borderRadius: "14px", border: "1px solid rgba(225,48,108,0.15)", background: "rgba(225,48,108,0.04)", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#fff" }}>+{fmtQty(perDay)}</p>
                <p style={{ margin: "4px 0 0", fontSize: "10px", color: "rgb(169,181,174)", textTransform: "uppercase" }}>{t("calc.perDay")}</p>
              </div>
              <div style={{ padding: "16px 12px", borderRadius: "14px", border: "1px solid rgba(225,48,108,0.15)", background: "rgba(225,48,108,0.04)", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#fff" }}>+{growthPercent}%</p>
                <p style={{ margin: "4px 0 0", fontSize: "10px", color: "rgb(169,181,174)", textTransform: "uppercase" }}>{t("calc.growthRate")}</p>
              </div>
            </div>

            {/* Organic vs Boosted comparison */}
            <div style={{ padding: "20px", borderRadius: "14px", border: "1px solid rgba(225,48,108,0.15)", background: "#0e1512" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                {/* Organic */}
                <div style={{ flex: 1, textAlign: "center" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "10px", fontWeight: 600, color: "rgb(107,117,111)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("calc.organic")}
                  </p>
                  <p style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "rgb(169,181,174)" }}>
                    {fmtQty(currentFollowers + organicGrowth30d)}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "11px", color: "rgb(107,117,111)" }}>
                    +{fmtQty(organicGrowth30d)} {t("calc.in30days")}
                  </p>
                </div>

                {/* Divider */}
                <div style={{ width: "1px", background: "rgba(225,48,108,0.15)" }} />

                {/* Boosted */}
                <div style={{ flex: 1, textAlign: "center" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "10px", fontWeight: 600, color: accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("calc.boosted")}
                  </p>
                  <p style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: accent }}>
                    {fmtQty(currentFollowers + needed)}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "11px", color: "rgb(169,181,174)" }}>
                    +{fmtQty(needed)} {t("calc.in30days")}
                  </p>
                </div>
              </div>

              {/* Visual bar comparison */}
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "9px", color: "rgb(107,117,111)", width: "60px", textAlign: "right" }}>{t("calc.organic")}</span>
                  <div style={{ flex: 1, height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.06)" }}>
                    <div style={{
                      width: `${Math.min(100, (organicGrowth30d / needed) * 100)}%`,
                      height: "100%", borderRadius: "3px", background: "rgb(107,117,111)", transition: "width 0.4s",
                    }} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "9px", color: accent, width: "60px", textAlign: "right" }}>Fanovaly</span>
                  <div style={{ flex: 1, height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.06)" }}>
                    <div style={{
                      width: "100%",
                      height: "100%", borderRadius: "3px",
                      background: "linear-gradient(90deg, #833AB4, #E1306C, #F77737)",
                      transition: "width 0.4s",
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended pack */}
            <div style={{
              padding: "20px", borderRadius: "14px",
              border: "1px solid rgba(225,48,108,0.3)",
              background: "linear-gradient(135deg, rgba(225,48,108,0.08), rgba(131,58,180,0.04))",
            }}>
              <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {t("calc.recommendedPack")}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#fff" }}>
                    {fmtQty(pack.qty)} Followers
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "rgb(169,181,174)" }}>
                    {(packPrice / pack.qty * 1000).toFixed(2)}€ / 1K followers
                  </p>
                </div>
                <span style={{ fontSize: "24px", fontWeight: 800, color: accent }}>
                  {fmtPrice(packPrice, currency as Currency)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <a
            href={href("/instagram")}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "16px 36px", borderRadius: "14px", border: "none",
              fontWeight: 700, fontSize: "16px", fontFamily: "inherit",
              color: "#fff", textDecoration: "none",
              background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)",
              boxShadow: "0 10px 30px rgba(225,48,108,0.25)",
              transition: "transform 0.2s",
            }}
          >
            🚀 {t("calc.startNow")}
          </a>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <a href={href("/")} style={{ fontSize: "12px", color: "rgb(169,181,174)", textDecoration: "underline" }}>
            ← Fanovaly
          </a>
        </div>
      </div>

      {/* Schema.org FAQ structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Custom slider thumb styling */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #E1306C;
          cursor: pointer;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(225,48,108,0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #E1306C;
          cursor: pointer;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(225,48,108,0.4);
        }
      `}</style>
    </div>
  );
}

export default function CalculateurPage() {
  return (
    <Suspense>
      <CalculatorInner />
    </Suspense>
  );
}
