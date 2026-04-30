"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import { useTranslation, fmtPrice } from "@/lib/i18n";
import type { Currency } from "@/lib/i18n";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";
import posthog from "posthog-js";
import type { CartItem } from "@/components/ServiceSelect";
import RecentDeliveries from "@/components/RecentDeliveries";
import type { PostAssignment } from "@/components/PostPicker";

function priceFor(item: CartItem, c: Currency): number {
  let v: number;
  switch (c) {
    case "usd": v = item.priceUsd || item.price; break;
    case "gbp": v = item.priceGbp || item.price; break;
    case "cad": v = item.priceCad || item.price; break;
    case "nzd": v = item.priceNzd || item.price; break;
    case "aud": v = item.priceAud || item.price; break;
    case "chf": v = item.priceChf || item.price; break;
    default: v = item.price;
  }
  return Number(v) || 0;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function themeFor(platform?: string) {
  if (platform === "spotify") return {
    accent: "rgb(29,185,84)", accentMid: "rgb(30,215,96)", accentDark: "rgb(22,140,63)",
    bg: "rgba(29,185,84,0.06)", border: "rgba(29,185,84,0.15)", borderStrong: "rgba(29,185,84,0.4)",
    glow: "rgba(29,185,84,0.25)", stripeBg: "#0e1512", stripeText: "#e8f7ed",
    gradient: "linear-gradient(135deg, #1DB954, #1ed760)", btnText: "#000",
    inputBorder: "1px solid rgba(29,185,84,0.15)", inputBorderFocus: "1px solid rgba(29,185,84,0.4)",
    inputBg: "rgba(29,185,84,0.04)", inputFocusShadow: "0 0 8px rgba(29,185,84,0.1)",
    tabBorder: "1px solid rgba(29,185,84,0.12)", tabSelectedBorder: "1px solid rgba(29,185,84,0.4)",
    tabSelectedBg: "rgba(29,185,84,0.08)",
  };
  if (platform === "youtube") return {
    accent: "rgb(255,0,0)", accentMid: "rgb(204,0,0)", accentDark: "rgb(153,0,0)",
    bg: "rgba(255,0,0,0.06)", border: "rgba(255,0,0,0.15)", borderStrong: "rgba(255,0,0,0.4)",
    glow: "rgba(255,0,0,0.25)", stripeBg: "#1a0a0a", stripeText: "#f7e8e8",
    gradient: "linear-gradient(135deg, rgb(153,0,0), rgb(255,0,0))", btnText: "#fff",
    inputBorder: "1px solid rgba(255,0,0,0.15)", inputBorderFocus: "1px solid rgba(255,0,0,0.4)",
    inputBg: "rgba(255,0,0,0.04)", inputFocusShadow: "0 0 8px rgba(255,0,0,0.1)",
    tabBorder: "1px solid rgba(255,0,0,0.12)", tabSelectedBorder: "1px solid rgba(255,0,0,0.4)",
    tabSelectedBg: "rgba(255,0,0,0.08)",
  };
  if (platform === "x") return {
    accent: "rgb(29,155,240)", accentMid: "rgb(29,155,240)", accentDark: "rgb(20,120,200)",
    bg: "rgba(29,155,240,0.06)", border: "rgba(29,155,240,0.15)", borderStrong: "rgba(29,155,240,0.4)",
    glow: "rgba(29,155,240,0.25)", stripeBg: "#0a1520", stripeText: "#e0f0ff",
    gradient: "linear-gradient(135deg, rgb(20,120,200), rgb(29,155,240))", btnText: "#fff",
    inputBorder: "1px solid rgba(29,155,240,0.15)", inputBorderFocus: "1px solid rgba(29,155,240,0.4)",
    inputBg: "rgba(29,155,240,0.04)", inputFocusShadow: "0 0 8px rgba(29,155,240,0.1)",
    tabBorder: "1px solid rgba(29,155,240,0.12)", tabSelectedBorder: "1px solid rgba(29,155,240,0.4)",
    tabSelectedBg: "rgba(29,155,240,0.08)",
  };
  if (platform === "twitch") return {
    accent: "rgb(145,71,255)", accentMid: "rgb(145,71,255)", accentDark: "rgb(110,50,200)",
    bg: "rgba(145,71,255,0.06)", border: "rgba(145,71,255,0.15)", borderStrong: "rgba(145,71,255,0.4)",
    glow: "rgba(145,71,255,0.25)", stripeBg: "#150a20", stripeText: "#ede0ff",
    gradient: "linear-gradient(135deg, rgb(110,50,200), rgb(145,71,255))", btnText: "#fff",
    inputBorder: "1px solid rgba(145,71,255,0.15)", inputBorderFocus: "1px solid rgba(145,71,255,0.4)",
    inputBg: "rgba(145,71,255,0.04)", inputFocusShadow: "0 0 8px rgba(145,71,255,0.1)",
    tabBorder: "1px solid rgba(145,71,255,0.12)", tabSelectedBorder: "1px solid rgba(145,71,255,0.4)",
    tabSelectedBg: "rgba(145,71,255,0.08)",
  };
  // default: tiktok
  return {
    accent: "rgb(105,201,208)", accentMid: "rgb(105,201,208)", accentDark: "rgb(79,179,186)",
    bg: "rgba(79,179,186,0.06)", border: "rgba(105,201,208,0.15)", borderStrong: "rgba(105,201,208,0.4)",
    glow: "rgba(105,201,208,0.25)", stripeBg: "#0e1512", stripeText: "#e8f7ed",
    gradient: "linear-gradient(135deg, rgb(79,179,186), rgb(105,201,208))", btnText: "#000",
    inputBorder: "1px solid rgba(105,201,208,0.15)", inputBorderFocus: "1px solid rgba(105,201,208,0.4)",
    inputBg: "rgba(79,179,186,0.04)", inputFocusShadow: "0 0 8px rgba(105,201,208,0.1)",
    tabBorder: "1px solid rgba(105,201,208,0.12)", tabSelectedBorder: "1px solid rgba(105,201,208,0.4)",
    tabSelectedBg: "rgba(79,179,186,0.08)",
  };
}

function fmtQty(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000) + "K";
  return String(n);
}

/* ===== Sub-component: Cart Recap ===== */
function CartRecap({ cart, discount, promoPercent, finalTotal, platform, currency }: {
  cart: CartItem[];
  discount: number;
  promoPercent?: number;
  finalTotal: number;
  platform?: string;
  currency: Currency;
}) {
  const { t } = useTranslation();
  const th = themeFor(platform);
  return (
    <div style={{ padding: "12px 16px", borderRadius: "12px", backgroundColor: th.bg, border: `1px solid ${th.border}`, marginBottom: "24px" }}>
      <p style={{ margin: "0 0 8px 0", fontSize: "11px", fontWeight: 600, color: "rgb(169, 181, 174)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("checkout.summary")}</p>
      {cart.map((item, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
          <span style={{ fontSize: "13px", color: "rgb(232, 247, 237)" }}>{/^\d/.test(item.label) ? item.label : `${fmtQty(item.qty)} ${item.label}`}</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: th.accentMid }}>{fmtPrice(priceFor(item, currency), currency)}</span>
        </div>
      ))}
      {discount > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${th.border}`, marginTop: "8px", paddingTop: "8px" }}>
          <span style={{ fontSize: "13px", color: "rgb(169, 181, 174)" }}>{t("checkout.discount")} (-{promoPercent}%)</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffb800" }}>-{fmtPrice(discount, currency)}</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: discount > 0 ? "none" : `1px solid ${th.border}`, marginTop: discount > 0 ? "4px" : "8px", paddingTop: discount > 0 ? "4px" : "8px" }}>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{t("service.total")}</span>
        <span style={{ fontSize: "16px", fontWeight: 700, color: th.accent }}>{fmtPrice(finalTotal, currency)}</span>
      </div>
    </div>
  );
}

/* ===== Sub-component: Promo Code Input ===== */
function PromoCodeInput({ onValidated }: { onValidated: (code: string, percentOff: number) => void }) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; percentOff?: number } | null>(null);

  async function validate() {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/validate-promo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: input.trim() }) });
      const data = await res.json();
      setResult(data);
      if (data.valid && data.percentOff) onValidated(input.trim().toUpperCase(), data.percentOff);
    } catch { setResult({ valid: false }); }
    setLoading(false);
  }

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "rgb(169, 181, 174)", marginBottom: "6px" }}>{t("checkout.promoLabel")}</label>
      <div className="promo-row">
        <input type="text" placeholder="FANO-XXXXX" value={input} onChange={(e) => { setInput(e.target.value.toUpperCase()); setResult(null); }} disabled={result?.valid === true}
          style={{ flex: 1, padding: "10px 14px", borderRadius: "12px", border: result === null ? "1px solid rgba(105, 201, 208, 0.15)" : result.valid ? "1px solid rgba(105, 201, 208, 0.4)" : "1px solid #ef4444", backgroundColor: "rgba(79, 179, 186, 0.04)", color: "rgb(232, 247, 237)", fontSize: "14px", fontFamily: "monospace", letterSpacing: "1px", outline: "none", boxSizing: "border-box" }} />
        {result?.valid ? (
          <span style={{ display: "flex", alignItems: "center", padding: "0 12px", fontSize: "13px", color: "rgb(105, 201, 208)", fontWeight: 600 }}>✓</span>
        ) : (
          <button type="button" onClick={validate} disabled={loading || !input.trim()}
            style={{ padding: "10px 16px", borderRadius: "12px", border: "1px solid rgba(105, 201, 208, 0.2)", backgroundColor: "rgba(79, 179, 186, 0.08)", color: "rgb(105, 201, 208)", fontSize: "13px", fontWeight: 600, cursor: loading ? "wait" : "pointer", fontFamily: "inherit", opacity: !input.trim() ? 0.4 : 1, whiteSpace: "nowrap" }}>
            {loading ? "..." : t("checkout.apply")}
          </button>
        )}
      </div>
      {result && !result.valid && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>{t("checkout.invalidCode")}</p>}
      {result?.valid && <p style={{ fontSize: "11px", color: "rgb(105, 201, 208)", marginTop: "4px" }}>-{result.percentOff}% {t("checkout.applied")}</p>}
    </div>
  );
}

/* ===== Sub-component: Loyalty Banner ===== */
function LoyaltyBanner({ email, onRedeemed }: { email: string; onRedeemed: (cents: number) => void }) {
  const { t } = useTranslation();
  const [points, setPoints] = useState<number | null>(null);
  const [used, setUsed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setPoints(null); setUsed(false); return; }
    fetch("/api/loyalty", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })
      .then((r) => r.json()).then((d) => setPoints(d.points ?? 0)).catch(() => setPoints(0));
  }, [email]);

  if (points === null || points <= 0) return null;

  async function redeem() {
    setLoading(true);
    try {
      const res = await fetch("/api/loyalty", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, redeem: true }) });
      const data = await res.json();
      if (data.redeemed) { setUsed(true); setPoints(data.points); onRedeemed(500); }
    } catch {}
    setLoading(false);
  }

  return (
    <div style={{ marginBottom: "16px", padding: "14px 16px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(255, 184, 0, 0.08), rgba(255, 184, 0, 0.03))", border: "1px solid rgba(255, 184, 0, 0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
      <div>
        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#ffb800" }}>🏆 {points} BroPoints</p>
        {points >= 500 && !used && <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "rgb(169, 181, 174)" }}>{t("checkout.loyaltyUsePoints")}</p>}
        {used && <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "rgb(105, 201, 208)" }}>{t("checkout.loyaltyApplied")} ({points} {t("checkout.loyaltyRemaining")})</p>}
      </div>
      {points >= 500 && !used && (
        <button type="button" disabled={loading} onClick={redeem}
          style={{ padding: "8px 14px", borderRadius: "10px", border: "1px solid rgba(255, 184, 0, 0.3)", backgroundColor: "rgba(255, 184, 0, 0.1)", color: "#ffb800", fontSize: "12px", fontWeight: 700, cursor: loading ? "wait" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
          {loading ? "..." : t("checkout.loyaltyUse")}
        </button>
      )}
    </div>
  );
}

/* ===== Sub-component: Email Input ===== */
function EmailInput({ value, onChange, inputRef, highlight }: { value: string; onChange: (v: string) => void; inputRef?: React.RefObject<HTMLDivElement | null>; highlight?: boolean }) {
  const { t } = useTranslation();
  const [touched, setTouched] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const showError = (touched && !valid) || highlight;
  return (
    <div ref={inputRef} style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "rgb(169, 181, 174)", marginBottom: "6px" }}>{t("checkout.emailLabel")}</label>
      <input type="email" placeholder="ton@email.com" value={value}
        onChange={(e) => { onChange(e.target.value); setTouched(true); }}
        onBlur={(e) => { e.currentTarget.style.borderColor = touched && !valid ? "#ef4444" : "rgba(105, 201, 208, 0.15)"; }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(105, 201, 208, 0.4)"; }}
        className={highlight ? "shake" : ""}
        style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: showError ? "1px solid #ef4444" : "1px solid rgba(105, 201, 208, 0.15)", backgroundColor: "rgba(79, 179, 186, 0.04)", color: "rgb(232, 247, 237)", fontSize: "14px", fontFamily: "inherit", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }} />
      {showError && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>{highlight && !touched ? t("checkout.emailRequired") : t("checkout.emailInvalid")}</p>}
    </div>
  );
}

/* ----- Express Checkout (Apple Pay / Google Pay native button) ----- */
function ExpressCheckout({ email, onSuccess }: { email: string; onSuccess: (orderId?: number) => void }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [expressError, setExpressError] = useState<string | null>(null);

  async function handleConfirm(event: StripeExpressCheckoutElementConfirmEvent) {
    if (!stripe || !elements) return;
    setExpressError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + "?payment=success", receipt_email: email },
      redirect: "if_required",
    });

    if (error) {
      const msg = error.message || t("checkout.paymentError");
      posthog.capture("payment_failed", { error_message: msg, method: "express" });
      setExpressError(msg);
      return;
    }

    if (paymentIntent?.id) {
      try {
        const res = await fetch("/api/confirm-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentIntentId: paymentIntent.id }) });
        const data = await res.json();
        onSuccess(data.orderId || undefined);
      } catch { onSuccess(); }
    } else { onSuccess(); }
  }

  return (
    <div style={{ marginBottom: "16px" }}>
      <ExpressCheckoutElement
        onConfirm={handleConfirm}
        options={{
          buttonHeight: 50,
          buttonType: { applePay: "buy", googlePay: "buy" },
        }}
      />
      {expressError && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "8px", textAlign: "center" }}>{expressError}</p>}
    </div>
  );
}

/* ----- Sub-component: Trust Badges ----- */
function TrustBadges() {
  return (
    <div style={{ marginBottom: "20px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/badges_paiement.png" alt="Visa, Mastercard, American Express, PayPal" style={{ display: "block", margin: "0 auto", maxWidth: "240px", width: "100%", opacity: 0.7 }} />
    </div>
  );
}

/* ----- Sub-component: Upsell Suggestions ----- */
function UpsellSuggestions({ cart, platform, onAdd }: {
  cart: CartItem[];
  platform?: string;
  onAdd: (item: CartItem) => void;
}) {
  const { t, lang, currency } = useTranslation();
  const th = themeFor(platform);
  const [offers, setOffers] = useState<{ id: number; service: string; qty: number; label: string; label_en: string; price: number; price_usd: number; price_gbp?: number; price_cad?: number; price_nzd?: number; price_aud?: number; price_chf?: number }[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [added, setAdded] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/upsells")
      .then((r) => r.json())
      .then((data) => { if (data.upsells) setOffers(data.upsells); })
      .catch(() => {});
  }, []);

  // Filter: only show upsells for services NOT already in cart
  const cartServices = new Set(cart.map((c) => c.service as string));
  const visible = offers.filter((o) => !cartServices.has(o.service) && !dismissed.has(o.id) && !added.has(o.id) && o.price);

  if (visible.length === 0) return null;

  return (
    <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      {visible.slice(0, 2).map((offer) => {
        const priceMap: Record<string, number> = { eur: offer.price, usd: offer.price_usd, gbp: offer.price_gbp || offer.price, cad: offer.price_cad || offer.price, nzd: offer.price_nzd || offer.price, aud: offer.price_aud || offer.price, chf: offer.price_chf || offer.price };
        const price = Number(priceMap[currency] ?? offer.price) || 0;
        const label = lang === "en" ? (offer.label_en || offer.label || `${offer.qty} ${offer.service}`) : (offer.label || `${offer.qty} ${offer.service}`);
        return (
          <div key={offer.id} style={{
            padding: "12px 14px", borderRadius: "12px",
            border: `1px dashed ${th.border}`,
            backgroundColor: th.bg,
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <span style={{ fontSize: "18px" }}>⚡</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#fff" }}>
                {t("upsell.add")} {label}
              </p>
              <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "rgb(169,181,174)" }}>
                {t("upsell.onlyFor")} <strong style={{ color: th.accent }}>{fmtPrice(price, currency)}</strong>
              </p>
            </div>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => {
                  onAdd({
                    service: offer.service as CartItem["service"],
                    label: label,
                    qty: offer.qty,
                    price: Number(offer.price) || 0,
                    priceUsd: Number(offer.price_usd || offer.price) || 0,
                    priceGbp: Number(offer.price_gbp || offer.price) || 0,
                    priceCad: Number(offer.price_cad || offer.price) || 0,
                    priceNzd: Number(offer.price_nzd || offer.price) || 0,
                    priceAud: Number(offer.price_aud || offer.price) || 0,
                    priceChf: Number(offer.price_chf || offer.price) || 0,
                  });
                  setAdded((prev) => new Set(prev).add(offer.id));
                }}
                style={{
                  padding: "6px 14px", borderRadius: "8px", border: "none",
                  background: th.gradient,
                  color: th.btnText, fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {t("upsell.addBtn")}
              </button>
              <button
                type="button"
                onClick={() => setDismissed((prev) => new Set(prev).add(offer.id))}
                style={{ padding: "6px 8px", borderRadius: "8px", border: "none", background: "transparent", color: "rgb(107,117,111)", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ----- Sub-component: Urgency Timer ----- */
function UrgencyTimer({ platform }: { platform?: string }) {
  const { t } = useTranslation();
  const th = themeFor(platform);
  const [seconds, setSeconds] = useState(() => {
    if (typeof window === "undefined") return 900;
    const stored = sessionStorage.getItem("checkout_timer_end");
    if (stored) {
      const remaining = Math.max(0, Math.floor((Number(stored) - Date.now()) / 1000));
      return remaining > 0 ? remaining : 900;
    }
    const end = Date.now() + 900 * 1000;
    sessionStorage.setItem("checkout_timer_end", String(end));
    return 900;
  });

  useEffect(() => {
    const iv = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px 16px", borderRadius: "10px", marginBottom: "20px", background: `linear-gradient(135deg, ${th.bg}, transparent)`, border: `1px solid ${th.border}` }}>
      <span style={{ fontSize: "14px" }}>{"\u{23F0}"}</span>
      <span style={{ fontSize: "12px", fontWeight: 600, color: th.accent }}>
        {t("checkout.urgencyOffer")} {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
    </div>
  );
}

/* ----- Inner form (inside Elements provider) ----- */
function PayForm({
  cart,
  total,
  onSuccess,
  onBack,
  onPromoApplied,
  onLoyaltyRedeemed,
  onAddToCart,
  platform,
}: {
  cart: CartItem[];
  total: number;
  onSuccess: (orderId?: number) => void;
  onBack: () => void;
  onPromoApplied: (code: string) => void;
  onLoyaltyRedeemed: (cents: number) => void;
  onAddToCart?: (item: CartItem) => void;
  platform?: string;
}) {
  const { t, currency } = useTranslation();
  const th = themeFor(platform);
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    try { return localStorage.getItem("fanovaly_email") || ""; } catch { return ""; }
  });
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // Persist email locally once valid, for returning customers
  useEffect(() => {
    if (emailValid) {
      try { localStorage.setItem("fanovaly_email", email); } catch { /* ignore */ }
    }
  }, [email, emailValid]);
  const emailRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [emailShake, setEmailShake] = useState(false);
  const [promoPercent, setPromoPercent] = useState(0);
  const [loyaltyDiscountCents, setLoyaltyDiscountCents] = useState(0);
  const [showPromo, setShowPromo] = useState(false);

  const discount = promoPercent > 0 ? total * (promoPercent / 100) : 0;
  const finalTotal = Math.max(0.50, total - discount - loyaltyDiscountCents / 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!emailValid) {
      setEmailShake(true);
      emailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = emailRef.current?.querySelector("input");
      if (input) input.focus();
      setTimeout(() => setEmailShake(false), 600);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await stripe.confirmPayment({ elements, confirmParams: { return_url: window.location.origin + "?payment=success", receipt_email: email }, redirect: "if_required" });
    if (result.error) { const msg = result.error.message || t("checkout.paymentError"); posthog.capture("payment_failed", { error_message: msg }); setError(msg); setLoading(false); }
    else {
      const piId = result.paymentIntent?.id;
      if (piId) {
        try {
          const confirmRes = await fetch("/api/confirm-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentIntentId: piId }) });
          const confirmData = await confirmRes.json();
          onSuccess(confirmData.orderId || undefined);
        } catch { onSuccess(); }
      } else { onSuccess(); }
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ width: "100%" }}>
      {/* Recent deliveries ticker — social proof above email */}
      <RecentDeliveries platform={platform} />

      {/* 1. Email first */}
      <EmailInput value={email} onChange={setEmail} inputRef={emailRef} highlight={emailShake} />

      {/* 2. Cart recap */}
      <CartRecap cart={cart} discount={discount} promoPercent={promoPercent} finalTotal={finalTotal} platform={platform} currency={currency} />

      {/* 3. Upsell suggestions */}
      {onAddToCart && <UpsellSuggestions cart={cart} platform={platform} onAdd={onAddToCart} />}

      {/* 4. Payment methods — only visible when email is valid */}
      {emailValid ? (
        <>
          {/* Express checkout (Apple/Google Pay) */}
          <ExpressCheckout email={email} onSuccess={onSuccess} />

          {/* Separator */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 0 16px 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: "11px", color: "rgb(107, 117, 111)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{t("checkout.orPayByCard")}</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Trust signals — reassurance right before the form */}
          <TrustBadges />

          {/* Card payment form */}
          <div style={{ marginBottom: "20px" }}><PaymentElement options={{ layout: "tabs", wallets: { applePay: "never", googlePay: "never" } }} /></div>

          {error && <p style={{ fontSize: "13px", color: "#ef4444", margin: "0 0 16px 0", textAlign: "center" }}>{error}</p>}

          {/* Pay button */}
          <button type="submit" disabled={!stripe || loading}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "16px 0", borderRadius: "14px", border: "none", cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "16px", fontFamily: "inherit", color: th.btnText, background: th.gradient, boxShadow: `0 10px 30px ${th.glow}`, opacity: loading ? 0.6 : 1, transition: "all 0.2s" }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeLinecap="round" /></svg>
                {t("checkout.processing")}
              </span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                {t("checkout.pay")} {fmtPrice(finalTotal, currency)}
              </>
            )}
          </button>
        </>
      ) : (
        <p style={{ fontSize: "12px", color: "rgb(107,117,111)", textAlign: "center", margin: "16px 0", lineHeight: 1.5 }}>
          {t("checkout.emailToUnlock")}
        </p>
      )}

      {/* 9. Promo code — collapsed by default to reduce noise */}
      <div style={{ marginTop: "16px" }}>
        {!showPromo && promoPercent === 0 ? (
          <button type="button" onClick={() => setShowPromo(true)}
            style={{ width: "100%", fontSize: "12px", color: "rgb(107, 117, 111)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
            {t("checkout.promoLabel")}
          </button>
        ) : (
          <PromoCodeInput onValidated={(code, pct) => { setPromoPercent(pct); posthog.capture("promo_code_applied", { promo_code: code, discount_percent: pct }); onPromoApplied(code); }} />
        )}
      </div>

      {/* 10. Loyalty banner */}
      <LoyaltyBanner email={email} onRedeemed={(cents) => { setLoyaltyDiscountCents(cents); posthog.capture("loyalty_redeemed", { points_used: cents, discount_cents: cents }); onLoyaltyRedeemed(cents); }} />

      {/* 11. Back link */}
      <button type="button" onClick={onBack}
        style={{ width: "100%", marginTop: "12px", fontSize: "12px", color: "rgb(107, 117, 111)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}>
        {t("checkout.back")}
      </button>

      {/* Spacer so sticky bottom bar never overlaps content on mobile */}
      <div className="checkout-sticky-spacer" style={{ height: "76px" }} />

      {/* Sticky mobile pay bar — mobile only, always shows live total */}
      {typeof window !== "undefined" && ReactDOM.createPortal(
        <div
          className="checkout-sticky-bar"
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "10px 14px calc(10px + env(safe-area-inset-bottom))",
            background: "rgba(3, 8, 6, 0.94)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderTop: `1px solid ${th.border}`,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 9999,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgb(107,117,111)", fontWeight: 600 }}>{t("service.total")}</span>
            <span style={{ fontSize: "17px", fontWeight: 800, color: th.accent, lineHeight: 1.1 }}>{fmtPrice(finalTotal, currency)}</span>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (!emailValid) {
                setEmailShake(true);
                emailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                const input = emailRef.current?.querySelector("input");
                if (input) input.focus();
                setTimeout(() => setEmailShake(false), 600);
                return;
              }
              formRef.current?.requestSubmit();
            }}
            style={{
              flex: 1,
              padding: "13px 18px",
              borderRadius: "12px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: "15px",
              fontFamily: "inherit",
              color: th.btnText,
              background: th.gradient,
              boxShadow: `0 6px 20px ${th.glow}`,
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {loading ? t("checkout.processing") : `${t("checkout.pay")} →`}
          </button>
          <style>{`
            @media (min-width: 641px) {
              .checkout-sticky-bar { display: none !important; }
              .checkout-sticky-spacer { display: none !important; }
            }
          `}</style>
        </div>,
        document.body
      )}
    </form>
  );
}

/* ----- Outer wrapper: fetches clientSecret then mounts Elements ----- */
export default function CheckoutForm({
  cart,
  username,
  platform,
  postAssignments,
  followersBefore,
  onSuccess,
  onBack,
  onAddToCart,
}: {
  cart: CartItem[];
  username: string;
  platform: string;
  postAssignments?: PostAssignment[];
  followersBefore?: number;
  onSuccess: (orderId?: number) => void;
  onBack: () => void;
  onAddToCart?: (item: CartItem) => void;
}) {
  const { t, lang, currency } = useTranslation();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<string>("");
  const [loyaltyDiscountCents, setLoyaltyDiscountCents] = useState(0);
  const total = cart.reduce((sum, item) => sum + priceFor(item, currency), 0);

  const [intentKey, setIntentKey] = useState(0);

  const createIntent = useCallback(async (promoCode = "", loyaltyCents = 0) => {
    setClientSecret(null);
    setError(null);
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, username, platform, postAssignments, email: "", promoCode, followersBefore: followersBefore || 0, loyaltyDiscountCents: loyaltyCents, currency, lang }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setClientSecret(data.clientSecret);
      }
    } catch {
      setError(t("checkout.serverError"));
    }
  }, [cart, username, platform, postAssignments, followersBefore]);

  useEffect(() => {
    setIntentKey((k) => k + 1);
    createIntent();
  }, [createIntent]);

  function handlePromoApplied(code: string) {
    setAppliedPromo(code);
    setIntentKey((k) => k + 1);
    createIntent(code, loyaltyDiscountCents);
  }

  function handleLoyaltyRedeemed(cents: number) {
    setLoyaltyDiscountCents(cents);
    setIntentKey((k) => k + 1);
    createIntent(appliedPromo, cents);
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px", maxWidth: "440px", width: "100%" }}>
        <p style={{ fontSize: "14px", color: "#ef4444", marginBottom: "16px", textAlign: "center" }}>{error}</p>
        <button
          onClick={onBack}
          style={{ fontSize: "13px", color: "rgb(169, 181, 174)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}
        >
          {t("checkout.back")}
        </button>
      </div>
    );
  }

  const th = themeFor(platform);

  if (!clientSecret) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "40px 0" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            border: `3px solid ${th.border}`,
            borderTopColor: th.accent,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ fontSize: "14px", color: "rgb(169, 181, 174)" }}>{t("checkout.preparingPayment")}</p>
      </div>
    );
  }

  return (
    <div className="checkout-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
        <span style={{ color: th.accent, textShadow: `0 0 20px ${th.glow}` }}>{t("checkout.paymentSecure")}</span> {t("checkout.secureLabel")}
      </h2>
      <Elements
        key={intentKey}
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "night",
            variables: {
              colorPrimary: th.accent,
              colorBackground: th.stripeBg,
              colorText: th.stripeText,
              colorDanger: "#ef4444",
              fontFamily: "inherit",
              borderRadius: "12px",
              spacingUnit: "4px",
            },
            rules: {
              ".Input": {
                border: th.inputBorder,
                backgroundColor: th.inputBg,
                boxShadow: "none",
              },
              ".Input:focus": {
                border: th.inputBorderFocus,
                boxShadow: th.inputFocusShadow,
              },
              ".Tab": {
                border: th.tabBorder,
                backgroundColor: "rgba(255, 255, 255, 0.02)",
              },
              ".Tab--selected": {
                border: th.tabSelectedBorder,
                backgroundColor: th.tabSelectedBg,
              },
              ".Label": {
                color: "rgb(169, 181, 174)",
              },
            },
          },
        }}
      >
        <PayForm cart={cart} total={total} onSuccess={onSuccess} onBack={onBack} onPromoApplied={handlePromoApplied} onLoyaltyRedeemed={handleLoyaltyRedeemed} onAddToCart={onAddToCart} platform={platform} />
      </Elements>
    </div>
  );
}
