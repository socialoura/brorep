"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";
import type { ScanResult } from "@/components/ScanLoading";
import { useTranslation, fmtPrice } from "@/lib/i18n";

type ServiceType = "followers" | "likes" | "views" | "yt_subscribers" | "yt_likes" | "yt_views";

interface Pack {
  qty: number;
  price: number;
  priceUsd: number;
  popular?: boolean;
}

export interface CartItem {
  service: ServiceType;
  label: string;
  qty: number;
  price: number;
  priceUsd: number;
}

const DEFAULT_SERVICES: Partial<Record<ServiceType, { label: string; icon: React.ReactNode; packs: Pack[] }>> = {
  followers: {
    label: "Followers",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    packs: [
      { qty: 100, price: 2.99, priceUsd: 2.99 },
      { qty: 250, price: 5.99, priceUsd: 5.99 },
      { qty: 500, price: 9.99, priceUsd: 9.99, popular: true },
      { qty: 1000, price: 16.99, priceUsd: 16.99 },
      { qty: 2500, price: 34.99, priceUsd: 34.99 },
      { qty: 5000, price: 59.99, priceUsd: 59.99 },
      { qty: 10000, price: 99.99, priceUsd: 99.99 },
      { qty: 25000, price: 199.99, priceUsd: 199.99 },
    ],
  },
  likes: {
    label: "Likes",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
    packs: [
      { qty: 100, price: 1.99, priceUsd: 1.99 },
      { qty: 250, price: 3.99, priceUsd: 3.99 },
      { qty: 500, price: 6.99, priceUsd: 6.99, popular: true },
      { qty: 1000, price: 11.99, priceUsd: 11.99 },
      { qty: 2500, price: 24.99, priceUsd: 24.99 },
      { qty: 5000, price: 44.99, priceUsd: 44.99 },
      { qty: 10000, price: 79.99, priceUsd: 79.99 },
      { qty: 25000, price: 149.99, priceUsd: 149.99 },
    ],
  },
  views: {
    label: "Vues",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    packs: [
      { qty: 500, price: 1.99, priceUsd: 1.99 },
      { qty: 1000, price: 3.49, priceUsd: 3.49 },
      { qty: 2500, price: 7.99, priceUsd: 7.99 },
      { qty: 5000, price: 12.99, priceUsd: 12.99, popular: true },
      { qty: 10000, price: 22.99, priceUsd: 22.99 },
      { qty: 25000, price: 49.99, priceUsd: 49.99 },
      { qty: 50000, price: 89.99, priceUsd: 89.99 },
      { qty: 100000, price: 149.99, priceUsd: 149.99 },
    ],
  },
  yt_subscribers: {
    label: "Abonnés",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    packs: [
      { qty: 100, price: 3.99, priceUsd: 3.99 },
      { qty: 250, price: 7.99, priceUsd: 7.99 },
      { qty: 500, price: 13.99, priceUsd: 13.99, popular: true },
      { qty: 1000, price: 24.99, priceUsd: 24.99 },
      { qty: 2500, price: 49.99, priceUsd: 49.99 },
      { qty: 5000, price: 89.99, priceUsd: 89.99 },
    ],
  },
  yt_likes: {
    label: "Likes",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
      </svg>
    ),
    packs: [
      { qty: 100, price: 2.49, priceUsd: 2.49 },
      { qty: 250, price: 4.99, priceUsd: 4.99 },
      { qty: 500, price: 8.99, priceUsd: 8.99, popular: true },
      { qty: 1000, price: 14.99, priceUsd: 14.99 },
      { qty: 2500, price: 29.99, priceUsd: 29.99 },
      { qty: 5000, price: 54.99, priceUsd: 54.99 },
    ],
  },
  yt_views: {
    label: "Vues",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    packs: [
      { qty: 500, price: 2.49, priceUsd: 2.49 },
      { qty: 1000, price: 4.49, priceUsd: 4.49 },
      { qty: 2500, price: 9.99, priceUsd: 9.99 },
      { qty: 5000, price: 16.99, priceUsd: 16.99, popular: true },
      { qty: 10000, price: 29.99, priceUsd: 29.99 },
      { qty: 25000, price: 59.99, priceUsd: 59.99 },
      { qty: 50000, price: 99.99, priceUsd: 99.99 },
    ],
  },
};

const TIKTOK_KEYS: ServiceType[] = ["followers", "likes", "views"];
const YOUTUBE_KEYS: ServiceType[] = ["yt_subscribers", "yt_likes", "yt_views"];
const SERVICE_KEYS: ServiceType[] = [...TIKTOK_KEYS, ...YOUTUBE_KEYS];

function fmtQty(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000) + "K";
  return String(n);
}

type Services = Partial<Record<ServiceType, { label: string; icon: React.ReactNode; packs: Pack[] }>>;

interface ComboItem {
  service: string;
  qty: number;
}

interface ComboPack {
  id: number;
  name: string;
  name_en?: string;
  items: ComboItem[];
  discount_percent: number;
}

function findClosestPack(service: ServiceType, qty: number, servicesData: Services = DEFAULT_SERVICES as Services): Pack | null {
  const packs = servicesData[service]?.packs;
  if (!packs) return null;
  // Find exact match or closest >= qty
  const exact = packs.find((p) => p.qty === qty);
  if (exact) return exact;
  const bigger = packs.filter((p) => p.qty >= qty).sort((a, b) => a.qty - b.qty);
  return bigger[0] || packs[packs.length - 1];
}

export default function ServiceSelect({
  profile,
  onCheckout,
  onBack,
  platform = "tiktok",
  username: externalUsername,
  onUsernameChange,
}: {
  profile?: ScanResult | null;
  onCheckout: (cart: CartItem[]) => void;
  onBack: () => void;
  platform?: string;
  username?: string;
  onUsernameChange?: (u: string) => void;
}) {
  const { t, lang, currency } = useTranslation();
  const isYouTube = platform === "youtube";
  // Theme colors
  const accent = isYouTube ? "rgb(255, 0, 0)" : "rgb(105, 201, 208)";
  const accentMid = isYouTube ? "rgb(204, 0, 0)" : "rgb(105, 201, 208)";
  const accentDark = isYouTube ? "rgb(153, 0, 0)" : "rgb(79, 179, 186)";
  const accentBg = isYouTube ? "rgba(255, 0, 0, 0.05)" : "rgba(79, 179, 186, 0.05)";
  const accentBorder = isYouTube ? "rgba(255, 0, 0, 0.12)" : "rgba(105, 201, 208, 0.12)";
  const accentBorderStrong = isYouTube ? "rgba(255, 0, 0, 0.2)" : "rgba(105, 201, 208, 0.2)";
  const accentGlow = isYouTube ? "rgba(255, 0, 0, 0.25)" : "rgba(105, 201, 208, 0.25)";
  const gradientBg = isYouTube ? "linear-gradient(135deg, rgb(153, 0, 0), rgb(255, 0, 0))" : "linear-gradient(135deg, rgb(79, 179, 186), rgb(105, 201, 208))";
  const activeKeys = isYouTube ? YOUTUBE_KEYS : TIKTOK_KEYS;
  const [activeTab, setActiveTab] = useState<ServiceType>(activeKeys[0]);
  // One selected pack index per service type
  const [selections, setSelections] = useState<Partial<Record<ServiceType, number>>>({}); 
  const [combos, setCombos] = useState<ComboPack[]>([]);
  const [combosLoading, setCombosLoading] = useState(true);
  const [selectedCombo, setSelectedCombo] = useState<{ id: number; items: CartItem[] } | null>(null);
  const [services, setServices] = useState<Services>(DEFAULT_SERVICES as Services);

  useEffect(() => {
    // Fetch combos + dynamic pricing in parallel
    fetch("/api/combos")
      .then((r) => r.json())
      .then((data) => { if (data.combos) setCombos(data.combos); })
      .catch(() => {})
      .finally(() => setCombosLoading(false));

    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (!data.pricing || !Array.isArray(data.pricing)) return;
        const grouped: Partial<Record<ServiceType, Pack[]>> = {};
        for (const row of data.pricing) {
          const svc = row.service as ServiceType;
          if (!SERVICE_KEYS.includes(svc)) continue;
          if (!grouped[svc]) grouped[svc] = [];
          grouped[svc]!.push({ qty: Number(row.qty), price: Number(row.price), priceUsd: Number(row.price_usd || 0) });
        }
        setServices((prev) => {
          const next = { ...prev };
          for (const key of activeKeys) {
            if (grouped[key] && grouped[key]!.length > 0) {
              const sorted = grouped[key]!.sort((a, b) => a.qty - b.qty);
              const popIdx = Math.floor(sorted.length / 2);
              sorted[popIdx] = { ...sorted[popIdx], popular: true };
              next[key] = { ...next[key]!, packs: sorted };
            }
          }
          return next;
        });
      })
      .catch(() => {});
  }, []);

  const service = services[activeTab]!;
  const selectedIdx = selections[activeTab] ?? null;

  function togglePack(idx: number) {
    setSelectedCombo(null); // clear combo when selecting individual packs
    setSelections((prev) => {
      const copy = { ...prev };
      if (copy[activeTab] === idx) {
        delete copy[activeTab];
      } else {
        copy[activeTab] = idx;
        const pack = service.packs[idx];
        if (pack) posthog.capture("service_selected", { platform, service: activeTab, qty: pack.qty, price: pack.price });
      }
      return copy;
    });
  }

  // Build cart from all selections OR from combo
  const cart: CartItem[] = selectedCombo
    ? selectedCombo.items
    : activeKeys
      .filter((k) => selections[k] !== undefined)
      .map((k) => {
        const pack = services[k]!.packs[selections[k]!];
        return { service: k, label: services[k]!.label, qty: pack.qty, price: pack.price, priceUsd: pack.priceUsd };
      });

  const total = cart.reduce((sum, item) => sum + (currency === "usd" ? item.priceUsd : item.price), 0);
  const currentUsername = profile?.username || externalUsername || "";
  const canCheckout = cart.length > 0 && currentUsername.trim().length >= 2;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "540px",
        padding: "0 16px",
      }}
    >
      {/* Username input or mini profile recap */}
      {profile ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 16px",
            borderRadius: "12px",
            backgroundColor: accentBg,
            border: `1px solid ${accentBorder}`,
            marginBottom: "20px",
            width: "100%",
            maxWidth: "360px",
          }}
        >
          <img
            src={profile.avatarUrl}
            alt={profile.username}
            style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${accentBorderStrong}` }}
          />
          <div style={{ textAlign: "left" }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#fff" }}>@{profile.username}</p>
          </div>
        </div>
      ) : null}

      {/* Title */}
      <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
        {t("service.composeTitle")} <span style={{ color: accent, textShadow: `0 0 20px ${isYouTube ? 'rgba(255,0,0,0.3)' : 'rgba(105,201,208,0.3)'}` }}>{t("service.pack")}</span>
      </h2>
      <p style={{ fontSize: "13px", color: "rgb(169, 181, 174)", margin: "0 0 20px 0" }}>
        {t("service.composeSubtitle")}
      </p>

      {/* Tabs */}
      <div className="service-tabs">
        {activeKeys.map((key) => {
          const isActive = activeTab === key;
          const hasSelection = selections[key] !== undefined;
          return (
            <button
              key={key}
              className="service-tab-btn"
              onClick={() => setActiveTab(key)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 600,
                color: isActive ? "#000" : "rgb(169, 181, 174)",
                background: isActive ? gradientBg : "transparent",
                boxShadow: isActive ? `0 4px 16px ${accentGlow}` : "none",
                transition: "all 0.2s",
              }}
            >
              <span style={{ display: "flex", opacity: isActive ? 1 : 0.6 }}>{DEFAULT_SERVICES[key]?.icon}</span>
              {services[key]?.label}
              {hasSelection && !isActive && (
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: accent,
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    boxShadow: `0 0 4px ${isYouTube ? 'rgba(255,0,0,0.5)' : 'rgba(105,201,208,0.5)'}`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Packs grid — 2 cols × 4 rows */}
      <div className="grid-packs" style={{ marginBottom: "20px" }}>
        {service.packs.map((pack, i) => {
          const isSelected = selectedIdx === i;
          return (
            <button
              key={i}
              onClick={() => togglePack(i)}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "14px 8px",
                borderRadius: "14px",
                cursor: "pointer",
                fontFamily: "inherit",
                border: isSelected ? `2px solid ${accent}` : `1px solid ${accentBorder}`,
                backgroundColor: isSelected ? (isYouTube ? "rgba(255, 0, 0, 0.1)" : "rgba(79, 179, 186, 0.1)") : "rgba(255, 255, 255, 0.02)",
                boxShadow: isSelected ? (isYouTube ? "0 0 20px rgba(255,0,0,0.1), inset 0 0 20px rgba(255,0,0,0.05)" : "0 0 20px rgba(105, 201, 208, 0.1), inset 0 0 20px rgba(79, 179, 186, 0.05)") : "none",
                transition: "all 0.2s",
              }}
            >
              {pack.popular && (
                <span
                  style={{
                    position: "absolute",
                    top: "-7px",
                    right: "-2px",
                    padding: "2px 7px",
                    borderRadius: "9999px",
                    fontSize: "8px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    background: isYouTube ? "rgba(255, 0, 0, 0.12)" : "rgba(105, 201, 208, 0.12)",
                    color: accent,
                    border: `1px solid ${accentBorderStrong}`,
                  }}
                >
                  {t("service.top")}
                </span>
              )}
              {isSelected && (
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isYouTube ? "#fff" : "#000"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
              <span style={{ fontSize: "18px", fontWeight: 700, color: "rgb(232, 247, 237)" }}>
                {fmtQty(pack.qty)}
              </span>
              <span style={{ fontSize: "10px", color: "rgb(107, 117, 111)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                {service.label}
              </span>
              <span
                style={{
                  marginTop: "2px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: isSelected ? accentMid : "rgb(169, 181, 174)",
                  transition: "color 0.2s",
                }}
              >
                {fmtPrice(currency === "usd" ? pack.priceUsd : pack.price, currency)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Username input — after packs */}
      {!profile && (
        <div style={{ width: "100%", maxWidth: "360px", marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgb(169,181,174)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("service.usernameLabel")}
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "0", borderRadius: "12px", border: `1px solid ${accentBorder}`, backgroundColor: accentBg, overflow: "hidden" }}>
            <span style={{ padding: "0 0 0 14px", fontSize: "14px", color: "rgb(107,117,111)", fontWeight: 600, userSelect: "none" }}>@</span>
            <input
              type="text"
              value={externalUsername || ""}
              onChange={(e) => onUsernameChange?.(e.target.value.replace(/^@/, "").replace(/\s/g, ""))}
              placeholder={t("service.usernamePlaceholder")}
              style={{ flex: 1, padding: "12px 14px 12px 4px", border: "none", background: "transparent", color: "#fff", fontSize: "14px", fontFamily: "inherit", outline: "none" }}
            />
          </div>
        </div>
      )}

      {/* Combo packs — below individual packs */}
      {combosLoading ? (
        <div style={{ width: "100%", marginBottom: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
            {[1, 2].map((i) => (
              <div key={i} style={{ padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ height: "14px", width: "60%", borderRadius: "6px", background: "rgba(255,255,255,0.05)", marginBottom: "10px", animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ height: "10px", width: "80%", borderRadius: "6px", background: "rgba(255,255,255,0.03)", marginBottom: "6px", animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ height: "10px", width: "40%", borderRadius: "6px", background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />
              </div>
            ))}
          </div>
        </div>
      ) : combos.length > 0 && (
        <div style={{ width: "100%", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 0 14px 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: "11px", color: "rgb(107, 117, 111)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("service.orCompose")}</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
            {combos.map((combo) => {
              const comboItems = combo.items
                .map((ci) => {
                  const svc = ci.service as ServiceType;
                  const pack = findClosestPack(svc, ci.qty, services);
                  if (!pack) return null;
                  return { service: svc, label: services[svc]?.label ?? svc, qty: pack.qty, price: pack.price, priceUsd: pack.priceUsd };
                })
                .filter(Boolean) as CartItem[];

              const originalTotal = comboItems.reduce((s, i) => s + (currency === "usd" ? i.priceUsd : i.price), 0);
              const discountedTotal = originalTotal * (1 - combo.discount_percent / 100);

              return (
                <button
                  key={combo.id}
                  onClick={() => {
                    if (selectedCombo?.id === combo.id) {
                      setSelectedCombo(null); // deselect
                    } else {
                      const discountedItems = comboItems.map((item) => ({
                        ...item,
                        price: Number((item.price * (1 - combo.discount_percent / 100)).toFixed(2)),
                        priceUsd: Number((item.priceUsd * (1 - combo.discount_percent / 100)).toFixed(2)),
                      }));
                      setSelections({}); // clear individual selections
                      setSelectedCombo({ id: combo.id, items: discountedItems });
                      posthog.capture("combo_selected", { combo_name: combo.name, discount_percent: combo.discount_percent, total: discountedItems.reduce((s, i) => s + i.price, 0) });
                    }
                  }}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    padding: "16px",
                    borderRadius: "14px",
                    border: selectedCombo?.id === combo.id ? `2px solid ${accent}` : `1px solid ${accentBorderStrong}`,
                    background: selectedCombo?.id === combo.id
                      ? (isYouTube ? "rgba(255, 0, 0, 0.12)" : "rgba(105, 201, 208, 0.12)")
                      : (isYouTube ? "linear-gradient(135deg, rgba(255, 0, 0, 0.08), rgba(255, 0, 0, 0.02))" : "linear-gradient(135deg, rgba(79, 179, 186, 0.08), rgba(105, 201, 208, 0.02))"),
                    boxShadow: selectedCombo?.id === combo.id ? `0 0 20px ${accentGlow}` : "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { if (selectedCombo?.id !== combo.id) { e.currentTarget.style.borderColor = isYouTube ? "rgba(255, 0, 0, 0.4)" : "rgba(105, 201, 208, 0.4)"; e.currentTarget.style.transform = "scale(1.02)"; } }}
                  onMouseLeave={(e) => { if (selectedCombo?.id !== combo.id) { e.currentTarget.style.borderColor = isYouTube ? "rgba(255, 0, 0, 0.2)" : "rgba(105, 201, 208, 0.2)"; e.currentTarget.style.transform = "scale(1)"; } }}
                >
                  <span style={{
                    position: "absolute", top: "-8px", right: "10px",
                    padding: "3px 10px", borderRadius: "9999px",
                    fontSize: "10px", fontWeight: 800,
                    background: gradientBg,
                    color: "#000", letterSpacing: "0.03em",
                  }}>
                    -{combo.discount_percent}%
                  </span>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#fff" }}>{lang === "en" && combo.name_en ? combo.name_en : combo.name}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {comboItems.map((item, i) => (
                      <span key={i} style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, backgroundColor: "rgba(255,255,255,0.04)", color: "rgb(169, 181, 174)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        {fmtQty(item.qty)} {item.label}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "rgb(107, 117, 111)", textDecoration: "line-through" }}>{fmtPrice(originalTotal, currency)}</span>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: accent }}>{fmtPrice(discountedTotal, currency)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cart summary */}
      {cart.length > 0 && (
        <div
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            backgroundColor: isYouTube ? "rgba(255, 0, 0, 0.06)" : "rgba(79, 179, 186, 0.06)",
            border: `1px solid ${isYouTube ? 'rgba(255,0,0,0.15)' : 'rgba(105,201,208,0.15)'}`,
            marginBottom: "20px",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontSize: "11px", fontWeight: 600, color: "rgb(169, 181, 174)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("service.yourCart")}
          </p>
          {cart.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "4px 0",
              }}
            >
              <span style={{ fontSize: "13px", color: "rgb(232, 247, 237)" }}>
                {fmtQty(item.qty)} {item.label}
              </span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: accentMid }}>
                {fmtPrice(currency === "usd" ? item.priceUsd : item.price, currency)}
              </span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: `1px solid ${isYouTube ? 'rgba(255,0,0,0.1)' : 'rgba(105,201,208,0.1)'}`,
              marginTop: "8px",
              paddingTop: "8px",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{t("service.total")}</span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: accent }}>{fmtPrice(total, currency)}</span>
          </div>
        </div>
      )}

      {/* Social proof */}
      {cart.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: isYouTube ? "rgb(255,0,0)" : "rgb(105,201,208)", display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "11px", color: "rgb(169,181,174)" }}>
            <strong style={{ color: isYouTube ? "rgb(255,100,100)" : "rgb(105,201,208)" }}>127+</strong> {t("service.ordersThisWeek")}
          </span>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => { if (canCheckout) onCheckout(cart); }}
        disabled={!canCheckout}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "16px 36px",
          borderRadius: "14px",
          border: "none",
          cursor: canCheckout ? "pointer" : "not-allowed",
          fontWeight: 700,
          fontSize: "16px",
          fontFamily: "inherit",
          color: canCheckout ? (isYouTube ? "#fff" : "#000") : "rgb(80, 80, 80)",
          background: canCheckout ? gradientBg : "rgba(255, 255, 255, 0.06)",
          boxShadow: canCheckout ? `0 10px 30px ${accentGlow}` : "none",
          transition: "all 0.2s",
          opacity: canCheckout ? 1 : 0.5,
        }}
        onMouseEnter={(e) => { if (canCheckout) e.currentTarget.style.transform = "scale(1.03)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
        </svg>
        {cart.length > 0
          ? `${t("service.checkout")} ${fmtPrice(total, currency)}`
          : t("service.selectAtLeast")
        }
      </button>

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          marginTop: "14px",
          marginBottom: "80px",
          fontSize: "12px",
          color: "rgb(107, 117, 111)",
          background: "none",
          border: "none",
          cursor: "pointer",
          textDecoration: "underline",
          fontFamily: "inherit",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(169, 181, 174)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(107, 117, 111)"; }}
      >
        {t("service.backToProfile")}
      </button>

      {/* Sticky mobile cart bar — always visible */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 16px",
          background: "linear-gradient(180deg, rgba(5,10,12,0.95), rgba(3,7,8,0.98))",
          borderTop: `1px solid ${accentBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 100,
          backdropFilter: "blur(12px)",
        }}
        className="sticky-cart-bar"
      >
        <div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{cart.length > 0 ? `${cart.length} ${cart.length > 1 ? "articles" : "article"}` : t("service.emptyCart")}</span>
          {cart.length > 0 && <span style={{ fontSize: "15px", fontWeight: 700, color: accent, marginLeft: "8px" }}>{fmtPrice(total, currency)}</span>}
        </div>
        <button
          onClick={() => { if (canCheckout) onCheckout(cart); }}
          disabled={!canCheckout}
          style={{
            padding: "10px 24px",
            borderRadius: "10px",
            border: "none",
            cursor: canCheckout ? "pointer" : "not-allowed",
            fontWeight: 700,
            fontSize: "13px",
            fontFamily: "inherit",
            color: isYouTube ? "#fff" : "#000",
            background: gradientBg,
            opacity: canCheckout ? 1 : 0.5,
          }}
        >
          {t("service.checkout")} &rarr;
        </button>
      </div>
    </div>
  );
}
