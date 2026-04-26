"use client";

import { useState, useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";
import AnimatedBackground from "@/components/AnimatedBackground";
import CheckoutForm from "@/components/CheckoutForm";
import SuccessPage from "@/components/SuccessPage";
import type { CartItem } from "@/components/ServiceSelect";
import { useTranslation, fmtPrice, type Currency } from "@/lib/i18n";

/* ---- helpers ---- */
interface Pack {
  qty: number;
  price: number;
  priceUsd: number;
  priceGbp: number;
  priceCad: number;
  priceNzd: number;
  priceChf: number;
  popular?: boolean;
}

function fmtQty(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000) + "K";
  return String(n);
}

function priceFor(p: Pack, c: Currency): number {
  switch (c) {
    case "usd": return p.priceUsd || p.price;
    case "gbp": return p.priceGbp || p.price;
    case "cad": return p.priceCad || p.price;
    case "nzd": return p.priceNzd || p.price;
    case "chf": return p.priceChf || p.price;
    default: return p.price;
  }
}

const G = "#1DB954";
const GD = "#1ed760";

const avatars = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face",
];

interface TrackInfo {
  id: string;
  name: string;
  shareUrl: string;
  durationText?: string;
  playCount?: number | null;
  artists: { name: string; id: string }[];
  cover: string | null;
  albumName: string | null;
}

type Step = "hero" | "shop" | "payment" | "success";
type InputMode = "search" | "link";

function SpotifyPageInner() {
  const { t, lang, currency } = useTranslation();
  const posthog = usePostHog();
  const [step, setStep] = useState<Step>("hero");
  const [trackLink, setTrackLink] = useState("");
  const [trackError, setTrackError] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<number | undefined>();
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [packs, setPacks] = useState<Pack[]>([]);

  // Track search states
  const [inputMode, setInputMode] = useState<InputMode>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Fetch pricing from API
  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (!data.pricing || !Array.isArray(data.pricing)) return;
        const spPacks: Pack[] = [];
        for (const row of data.pricing) {
          if (row.service !== "sp_streams") continue;
          spPacks.push({
            qty: Number(row.qty),
            price: Number(row.price),
            priceUsd: Number(row.price_usd || 0),
            priceGbp: Number(row.price_gbp || 0),
            priceCad: Number(row.price_cad || 0),
            priceNzd: Number(row.price_nzd || 0),
            priceChf: Number(row.price_chf || 0),
          });
        }
        if (spPacks.length > 0) {
          const sorted = spPacks.sort((a, b) => a.qty - b.qty);
          const popIdx = Math.floor(sorted.length / 2);
          sorted[popIdx] = { ...sorted[popIdx], popular: true };
          setPacks(sorted);
          setMinPrice(priceFor(sorted[0], currency));
        }
      })
      .catch(() => {});
  }, [currency]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (step !== "hero") document.body.setAttribute("data-hide-chat", "");
    else document.body.removeAttribute("data-hide-chat");
  }, [step]);

  // Extract track ID from a Spotify URL
  function extractTrackId(url: string): string | null {
    const m = url.match(/track\/([a-zA-Z0-9]+)/);
    return m ? m[1] : null;
  }

  // Search by name
  async function handleSearch() {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchError("");
    setTrackInfo(null);
    try {
      const res = await fetch(`/api/spotify-search?mode=search&q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        setSearchError(t("spotify.trackNotFound"));
        return;
      }
      const data: TrackInfo = await res.json();
      setTrackInfo(data);
      setTrackLink(data.shareUrl);
    } catch {
      setSearchError(t("spotify.trackNotFound"));
    } finally {
      setSearching(false);
    }
  }

  // Lookup by link
  async function handleLinkLookup() {
    const id = extractTrackId(trackLink);
    if (!id) {
      setTrackError(true);
      setTimeout(() => setTrackError(false), 2000);
      return;
    }
    setSearching(true);
    setSearchError("");
    setTrackInfo(null);
    try {
      const res = await fetch(`/api/spotify-search?mode=track&trackId=${encodeURIComponent(id)}`);
      if (!res.ok) {
        setSearchError(t("spotify.trackNotFound"));
        return;
      }
      const data: TrackInfo = await res.json();
      setTrackInfo(data);
      setTrackLink(data.shareUrl);
    } catch {
      setSearchError(t("spotify.trackNotFound"));
    } finally {
      setSearching(false);
    }
  }

  function handleCheckout() {
    if (!trackInfo) {
      setTrackError(true);
      setTimeout(() => setTrackError(false), 2000);
      return;
    }
    if (selectedIdx === null) return;

    const pack = packs[selectedIdx];
    const item: CartItem = {
      service: "sp_streams" as CartItem["service"],
      label: "Streams Spotify",
      qty: pack.qty,
      price: pack.price,
      priceUsd: pack.priceUsd || pack.price,
      priceGbp: pack.priceGbp || pack.price,
      priceCad: pack.priceCad || pack.price,
      priceNzd: pack.priceNzd || pack.price,
      priceChf: pack.priceChf || pack.price,
    };
    setCart([item]);
    posthog?.capture("spotify_checkout", { qty: pack.qty, price: priceFor(pack, currency) });
    setStep("payment");
  }

  /* ===== Wrapper ===== */
  const shell = (content: React.ReactNode, justify = "center", pt = "py-12") => (
    <div className="min-h-screen bg-background relative overflow-hidden pt-6 sm:pt-10">
      <AnimatedBackground />
      <div className="relative z-10">
        <div className={`flex flex-col items-center min-h-screen px-4 sm:px-6 text-center justify-${justify} ${pt}`} style={{ opacity: 1 }}>
          {step !== "hero" && step !== "success" && (
            <button
              onClick={() => { setStep("hero"); setCart([]); setSelectedIdx(null); setTrackLink(""); setOrderId(undefined); setTrackInfo(null); setSearchQuery(""); setSearchError(""); }}
              style={{ background: "none", border: "none", cursor: "pointer", marginBottom: "8px", opacity: 0.7, transition: "opacity 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.7"; }}
              title="Retour"
            >
              <img src="/logo-green.png" alt="Fanovaly" style={{ height: "48px", objectFit: "contain" }} />
            </button>
          )}
          <div key={step} className="step-fade-in" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {content}
          </div>
        </div>
      </div>
    </div>
  );

  /* ===== PAYMENT ===== */
  if (step === "payment") {
    return shell(
      <CheckoutForm
        cart={cart}
        username={trackLink}
        platform="spotify"
        onSuccess={(id) => {
          posthog?.capture("spotify_payment_completed", { total: cart.reduce((s, i) => s + i.price, 0), order_id: id });
          setOrderId(id);
          setStep("success");
        }}
        onBack={() => setStep("shop")}
        onAddToCart={(item) => setCart((prev) => [...prev, item])}
      />
    );
  }

  /* ===== SUCCESS ===== */
  if (step === "success") {
    return shell(
      <SuccessPage
        username={trackLink}
        orderId={orderId}
        cart={cart}
        onReset={() => { setStep("hero"); setCart([]); setSelectedIdx(null); setTrackLink(""); setOrderId(undefined); setTrackInfo(null); setSearchQuery(""); setSearchError(""); }}
      />
    );
  }

  /* ===== SHOP ===== */
  if (step === "shop") {
    const inputStyle: React.CSSProperties = {
      width: "100%", padding: "14px 16px 14px 40px", borderRadius: "12px",
      border: trackError ? "1px solid #ef4444" : "1px solid rgba(29,185,84,0.15)",
      backgroundColor: "rgba(29,185,84,0.04)", color: "rgb(232,247,237)",
      fontSize: "14px", fontFamily: "inherit", outline: "none",
      transition: "border-color 0.2s", boxSizing: "border-box" as const,
    };

    return shell(
      <div className="sp-shop">

        {/* Left column: track input */}
        <div className="sp-shop-left">
          {/* Mode toggle */}
          <div style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", alignSelf: "center" }}>
            {(["search", "link"] as InputMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setInputMode(m); setTrackInfo(null); setSearchError(""); setTrackError(false); }}
                style={{
                  padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: "13px", fontWeight: 600,
                  background: inputMode === m ? `linear-gradient(135deg, ${G}, ${GD})` : "transparent",
                  color: inputMode === m ? "#000" : "rgb(169,181,174)",
                  transition: "all 0.2s",
                }}
              >
                {m === "search" ? t("spotify.modeSearch") : t("spotify.modeLink")}
              </button>
            ))}
          </div>

          {/* Track input — only show if no track confirmed yet */}
          {!trackInfo ? (
            <div style={{ width: "100%", maxWidth: "360px", alignSelf: "center" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgb(169,181,174)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {inputMode === "search" ? t("spotify.modeSearch") : t("spotify.trackLabel")}
              </label>

              {inputMode === "search" ? (
                /* Search mode */
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", opacity: 0.6 }}>
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                      type="text"
                      placeholder={t("spotify.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setSearchError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                      style={inputStyle}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={searching || !searchQuery.trim()}
                    style={{
                      padding: "0 20px", borderRadius: "12px", border: "none", cursor: searching ? "wait" : "pointer",
                      background: `linear-gradient(135deg, ${G}, ${GD})`, color: "#000",
                      fontSize: "14px", fontWeight: 700, fontFamily: "inherit", flexShrink: 0,
                      opacity: searching || !searchQuery.trim() ? 0.5 : 1,
                    }}
                  >
                    {searching ? "..." : "OK"}
                  </button>
                </div>
              ) : (
                /* Link mode */
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={G} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", opacity: 0.6 }}>
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381C8.64 5.801 15.54 6.06 20.1 8.82c.541.3.719 1.02.42 1.56-.299.421-1.02.599-1.439.3z" />
                    </svg>
                    <input
                      type="url"
                      placeholder={t("spotify.trackPlaceholder")}
                      value={trackLink}
                      onChange={(e) => { setTrackLink(e.target.value); setTrackError(false); setSearchError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleLinkLookup(); }}
                      style={inputStyle}
                    />
                  </div>
                  <button
                    onClick={handleLinkLookup}
                    disabled={searching || !trackLink.trim()}
                    style={{
                      padding: "0 20px", borderRadius: "12px", border: "none", cursor: searching ? "wait" : "pointer",
                      background: `linear-gradient(135deg, ${G}, ${GD})`, color: "#000",
                      fontSize: "14px", fontWeight: 700, fontFamily: "inherit", flexShrink: 0,
                      opacity: searching || !trackLink.trim() ? 0.5 : 1,
                    }}
                  >
                    {searching ? "..." : "OK"}
                  </button>
                </div>
              )}

              {trackError && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>{t("spotify.trackRequired")}</p>}
              {searchError && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>{searchError}</p>}
              {searching && <p style={{ fontSize: "12px", color: G, marginTop: "4px" }}>{t("spotify.searching")}</p>}
            </div>
          ) : (
            /* Track preview card */
            <div style={{
              width: "100%", maxWidth: "360px", display: "flex", alignItems: "center", gap: "14px",
              padding: "12px 16px", borderRadius: "14px", alignSelf: "center",
              border: `1px solid rgba(29,185,84,0.2)`, backgroundColor: "rgba(29,185,84,0.04)",
            }}>
              {trackInfo.cover && (
                <img src={trackInfo.cover} alt="" style={{ width: "56px", height: "56px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {trackInfo.name}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "rgb(169,181,174)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {trackInfo.artists.map((a) => a.name).join(", ")}
                </p>
                {trackInfo.albumName && (
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgb(107,117,111)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {trackInfo.albumName}
                  </p>
                )}
              </div>
              <button
                onClick={() => { setTrackInfo(null); setSearchQuery(""); setTrackLink(""); }}
                style={{
                  padding: "6px 12px", borderRadius: "8px", border: `1px solid rgba(29,185,84,0.2)`,
                  backgroundColor: "transparent", color: "rgb(169,181,174)", fontSize: "11px",
                  fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                }}
              >
                {t("spotify.trackChange")}
              </button>
            </div>
          )}
        </div>

        {/* Right column: packs + checkout */}
        <div className="sp-shop-right">
          {/* Packs title */}
          <p style={{ fontSize: "13px", fontWeight: 600, color: "rgb(169,181,174)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>
            {t("spotify.pickPack")}
          </p>

          {/* Packs grid */}
          <div className="sp-packs-grid">
            {(() => {
              const basePPU = packs.length > 0 ? priceFor(packs[0], currency) / packs[0].qty : 0;
              return packs.map((pack, i) => {
                const isSelected = selectedIdx === i;
                const ppu = priceFor(pack, currency) / pack.qty;
                const savePct = basePPU > 0 ? Math.round((1 - ppu / basePPU) * 100) : 0;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedIdx(isSelected ? null : i)}
                    style={{
                      position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      padding: "18px 10px", borderRadius: "14px", cursor: "pointer", fontFamily: "inherit",
                      border: isSelected ? `2px solid ${G}` : `1px solid rgba(29,185,84,0.1)`,
                      backgroundColor: isSelected ? "rgba(29,185,84,0.08)" : "rgba(29,185,84,0.02)",
                      boxShadow: isSelected ? "0 0 20px rgba(29,185,84,0.15)" : "none",
                      transition: "all 0.2s", gap: "4px",
                    }}
                  >
                    {pack.popular && (
                      <span style={{
                        position: "absolute", top: "-8px", left: "50%", transform: "translateX(-50%)",
                        padding: "2px 8px", borderRadius: "6px", fontSize: "9px", fontWeight: 700,
                        background: `linear-gradient(135deg, ${G}, ${GD})`,
                        color: "#000", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap",
                      }}>
                        Top
                      </span>
                    )}
                    <span style={{ fontSize: "15px", fontWeight: 800, color: isSelected ? "#fff" : "rgb(232,247,237)" }}>
                      {fmtQty(pack.qty)}
                    </span>
                    <span style={{ fontSize: "11px", color: isSelected ? "rgb(169,181,174)" : "rgb(107,117,111)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                      streams
                    </span>
                    <span style={{ marginTop: "2px", fontSize: "14px", fontWeight: 700, color: isSelected ? G : "rgb(169,181,174)", transition: "color 0.2s" }}>
                      {fmtPrice(priceFor(pack, currency), currency)}
                    </span>
                    {savePct > 0 && (
                      <span style={{
                        marginTop: "2px", fontSize: "10px", fontWeight: 700,
                        color: "#00d26a", backgroundColor: "rgba(0,210,106,0.1)",
                        padding: "1px 6px", borderRadius: "6px",
                      }}>
                        -{savePct}%
                      </span>
                    )}
                  </button>
                );
              });
            })()}
          </div>

          {/* Checkout button */}
          <button
            onClick={handleCheckout}
            disabled={!trackInfo || selectedIdx === null}
            style={{
              width: "100%", padding: "16px 0", borderRadius: "14px", border: "none",
              cursor: trackInfo && selectedIdx !== null ? "pointer" : "not-allowed",
              fontWeight: 700, fontSize: "16px", fontFamily: "inherit", color: "#000",
              background: `linear-gradient(135deg, ${G}, ${GD})`,
              boxShadow: "0 10px 30px rgba(29,185,84,0.25)",
              opacity: trackInfo && selectedIdx !== null ? 1 : 0.5,
              transition: "all 0.2s",
            }}
          >
            {selectedIdx !== null
              ? `${t("service.checkout")} — ${fmtPrice(priceFor(packs[selectedIdx], currency), currency)}`
              : t("spotify.pickPack")
            }
          </button>
        </div>
      </div>,
      "center",
      "py-12"
    );
  }

  /* ===== HERO ===== */
  return shell(
    <>
      {/* Fullscreen hero */}
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px 40px", width: "100%", position: "relative" }}>

        <div className="sp-hero">
          {/* Left: text content */}
          <div className="sp-hero-text">
            <h1 className="sp-hero-title" style={{ fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1, textTransform: "uppercase", margin: 0, color: "#fff" }}>
              {t("spotify.heroTitle1")}
              <br />
              <span style={{ color: "#fff" }}>{t("spotify.heroTitle2")} </span>
              <span style={{ background: `linear-gradient(135deg, ${G}, ${GD})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {t("spotify.heroHighlight")}
                <svg width="0.7em" height="0.7em" viewBox="0 0 24 24" fill={G} style={{ display: "inline", verticalAlign: "middle", marginLeft: "4px", filter: "drop-shadow(0 0 12px rgba(29,185,84,0.5))" }}>
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381C8.64 5.801 15.54 6.06 20.1 8.82c.541.3.719 1.02.42 1.56-.299.421-1.02.599-1.439.3z" />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{ fontSize: "15px", color: "rgb(169,181,174)", maxWidth: "380px", lineHeight: 1.5, margin: 0 }}>
              {t("spotify.subtitle1")}
              <br />
              <span style={{ color: "rgb(107,117,111)" }}>{t("spotify.subtitle2")}</span>
            </p>

            {/* Price anchor */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "rgb(169,181,174)" }}>
                {minPrice !== null && <>{t("spotify.startingAt")} <span style={{ fontSize: "28px", fontWeight: 900, color: G, marginLeft: "4px" }}>{fmtPrice(minPrice, currency)}</span></>}
              </p>
              <span style={{ fontSize: "11px", color: "rgb(107,117,111)" }}>
                {t("spotify.delivery")}
              </span>
            </div>

            {/* CTA */}
            <button
              onClick={() => { posthog?.capture("spotify_cta_clicked"); setStep("shop"); }}
              style={{
                position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center",
                padding: "16px 32px", borderRadius: "16px", border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${G}, ${GD})`, color: "#000",
                fontSize: "18px", fontWeight: 700, fontFamily: "inherit",
                boxShadow: "0 10px 40px rgba(29,185,84,0.25)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease", overflow: "hidden",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 14px 50px rgba(29,185,84,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 10px 40px rgba(29,185,84,0.25)"; }}
            >
              <span style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none" }}>
                <span style={{ position: "absolute", top: 0, left: 0, width: "40%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)", animation: "cta-shine-move 3s ease-in-out infinite" }} />
              </span>
              <span style={{ position: "relative", zIndex: 1 }}>{t("spotify.cta")}</span>
            </button>

            {/* Status badge */}
            <div className="flex items-center gap-1.5" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ backgroundColor: G, flexShrink: 0 }} />
              <span style={{ color: G, fontWeight: 600 }}>{t("hero.operational")}</span>
              <span className="text-gray-500">({new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "long", year: "numeric" })})</span>
            </div>
          </div>

          {/* Right: visual */}
          <div className="sp-hero-visual">
            <img src="/logo-green.png" alt="Fanovaly" className="sp-hero-logo" />

            {/* Social proof */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px", padding: "10px 20px", borderRadius: "16px",
              border: "1px solid rgba(29,185,84,0.2)", backgroundColor: "rgba(14, 21, 18, 0.9)",
            }}>
              <div style={{ display: "flex" }}>
                {avatars.map((src, i) => (
                  <img key={i} src={src} alt="" loading="lazy" style={{
                    width: "32px", height: "32px", borderRadius: "9999px", border: "2px solid rgb(3,8,6)",
                    objectFit: "cover", boxShadow: "0 0 8px rgba(0,0,0,0.5)",
                    marginLeft: i === 0 ? 0 : "-10px", zIndex: avatars.length - i, position: "relative",
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "rgb(232,247,237)", margin: 0, lineHeight: 1.4 }}>
                  +8 420 <span style={{ fontWeight: 400, color: "rgb(169,181,174)" }}>{t("spotify.social")}</span>
                </p>
                <p style={{ fontSize: "12px", color: "rgb(169,181,174)", margin: 0, lineHeight: 1.4 }}>{t("social.thisMonth")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", animation: "bounce 2s ease-in-out infinite" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(107,117,111)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Below fold — How it works + FAQ */}
      <div className="sp-below-fold">

        {/* How it works */}
        <div style={{ width: "100%" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: G, marginBottom: "16px", textAlign: "center" }}>{t("howItWorks.title")}</p>
          <div className="grid-steps">
            {[
              { num: "1", title: t("spotify.howItWorks.step1.title"), desc: t("spotify.howItWorks.step1.desc") },
              { num: "2", title: t("spotify.howItWorks.step2.title"), desc: t("spotify.howItWorks.step2.desc") },
              { num: "3", title: t("spotify.howItWorks.step3.title"), desc: t("spotify.howItWorks.step3.desc") },
            ].map((s) => (
              <div key={s.num} style={{ padding: "20px 14px", borderRadius: "14px", border: "1px solid rgba(29,185,84,0.08)", backgroundColor: "rgba(29,185,84,0.02)", textAlign: "center" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(29,185,84,0.1)", border: "1px solid rgba(29,185,84,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px auto", fontSize: "13px", fontWeight: 800, color: G }}>{s.num}</div>
                <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 700, color: "#fff" }}>{s.title}</p>
                <p style={{ margin: 0, fontSize: "11px", lineHeight: 1.5, color: "rgb(107,117,111)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ width: "100%" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: G, marginBottom: "16px", textAlign: "center" }}>{t("faq.title")}</p>
          <div className="sp-faq-grid">
            {[
              { q: t("spotify.faq.q1"), a: t("spotify.faq.a1") },
              { q: t("spotify.faq.q2"), a: t("spotify.faq.a2") },
              { q: t("spotify.faq.q3"), a: t("spotify.faq.a3") },
              { q: t("spotify.faq.q4"), a: t("spotify.faq.a4") },
            ].map((faq) => (
              <details key={faq.q} onClick={() => posthog?.capture("spotify_faq_opened", { question: faq.q })} style={{ borderRadius: "12px", border: "1px solid rgba(29,185,84,0.08)", backgroundColor: "rgba(29,185,84,0.02)", overflow: "hidden" }}>
                <summary style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 600, color: "#fff", cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {faq.q}
                  <span style={{ fontSize: "16px", color: "rgb(107,117,111)", marginLeft: "8px", flexShrink: 0 }}>+</span>
                </summary>
                <div style={{ padding: "0 16px 14px 16px", fontSize: "12px", lineHeight: 1.6, color: "rgb(107,117,111)" }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </>,
    "start",
    "pt-6"
  );
}

export default function SpotifyPage() {
  return (
    <Suspense>
      <SpotifyPageInner />
    </Suspense>
  );
}
