"use client";

import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";
import posthog from "posthog-js";
import type { CartItem } from "@/components/ServiceSelect";
import type { PostAssignment } from "@/components/PostPicker";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function fmtQty(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000) + "K";
  return String(n);
}

/* ===== Sub-component: Cart Recap ===== */
function CartRecap({ cart, discount, promoPercent, finalTotal }: {
  cart: CartItem[];
  discount: number;
  promoPercent?: number;
  finalTotal: number;
}) {
  return (
    <div style={{ padding: "12px 16px", borderRadius: "12px", backgroundColor: "rgba(0, 180, 53, 0.06)", border: "1px solid rgba(0, 210, 106, 0.15)", marginBottom: "24px" }}>
      <p style={{ margin: "0 0 8px 0", fontSize: "11px", fontWeight: 600, color: "rgb(169, 181, 174)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Récapitulatif</p>
      {cart.map((item, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
          <span style={{ fontSize: "13px", color: "rgb(232, 247, 237)" }}>{fmtQty(item.qty)} {item.label}</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "rgb(0, 210, 106)" }}>{item.price.toFixed(2)}&euro;</span>
        </div>
      ))}
      {discount > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(0, 210, 106, 0.1)", marginTop: "8px", paddingTop: "8px" }}>
          <span style={{ fontSize: "13px", color: "rgb(169, 181, 174)" }}>Réduction (-{promoPercent}%)</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffb800" }}>-{discount.toFixed(2)}&euro;</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: discount > 0 ? "none" : "1px solid rgba(0, 210, 106, 0.1)", marginTop: discount > 0 ? "4px" : "8px", paddingTop: discount > 0 ? "4px" : "8px" }}>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Total</span>
        <span style={{ fontSize: "16px", fontWeight: 700, color: "rgb(0, 255, 76)" }}>{finalTotal.toFixed(2)}&euro;</span>
      </div>
    </div>
  );
}

/* ===== Sub-component: Promo Code Input ===== */
function PromoCodeInput({ onValidated }: { onValidated: (code: string, percentOff: number) => void }) {
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
      <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "rgb(169, 181, 174)", marginBottom: "6px" }}>Code promo (optionnel)</label>
      <div className="promo-row">
        <input type="text" placeholder="FANO-XXXXX" value={input} onChange={(e) => { setInput(e.target.value.toUpperCase()); setResult(null); }} disabled={result?.valid === true}
          style={{ flex: 1, padding: "10px 14px", borderRadius: "12px", border: result === null ? "1px solid rgba(0, 210, 106, 0.15)" : result.valid ? "1px solid rgba(0, 255, 76, 0.4)" : "1px solid #ef4444", backgroundColor: "rgba(0, 180, 53, 0.04)", color: "rgb(232, 247, 237)", fontSize: "14px", fontFamily: "monospace", letterSpacing: "1px", outline: "none", boxSizing: "border-box" }} />
        {result?.valid ? (
          <span style={{ display: "flex", alignItems: "center", padding: "0 12px", fontSize: "13px", color: "rgb(0, 255, 76)", fontWeight: 600 }}>✓</span>
        ) : (
          <button type="button" onClick={validate} disabled={loading || !input.trim()}
            style={{ padding: "10px 16px", borderRadius: "12px", border: "1px solid rgba(0, 210, 106, 0.2)", backgroundColor: "rgba(0, 180, 53, 0.08)", color: "rgb(0, 255, 76)", fontSize: "13px", fontWeight: 600, cursor: loading ? "wait" : "pointer", fontFamily: "inherit", opacity: !input.trim() ? 0.4 : 1, whiteSpace: "nowrap" }}>
            {loading ? "..." : "Appliquer"}
          </button>
        )}
      </div>
      {result && !result.valid && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>Code invalide ou expiré</p>}
      {result?.valid && <p style={{ fontSize: "11px", color: "rgb(0, 255, 76)", marginTop: "4px" }}>-{result.percentOff}% appliqué !</p>}
    </div>
  );
}

/* ===== Sub-component: Loyalty Banner ===== */
function LoyaltyBanner({ email, onRedeemed }: { email: string; onRedeemed: (cents: number) => void }) {
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
        {points >= 500 && !used && <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "rgb(169, 181, 174)" }}>Utilise 500 pts pour -5€</p>}
        {used && <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "rgb(0, 255, 76)" }}>-5€ appliqué ! ({points} pts restants)</p>}
      </div>
      {points >= 500 && !used && (
        <button type="button" disabled={loading} onClick={redeem}
          style={{ padding: "8px 14px", borderRadius: "10px", border: "1px solid rgba(255, 184, 0, 0.3)", backgroundColor: "rgba(255, 184, 0, 0.1)", color: "#ffb800", fontSize: "12px", fontWeight: 700, cursor: loading ? "wait" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
          {loading ? "..." : "Utiliser"}
        </button>
      )}
    </div>
  );
}

/* ===== Sub-component: Email Input ===== */
function EmailInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [touched, setTouched] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "rgb(169, 181, 174)", marginBottom: "6px" }}>Adresse e-mail</label>
      <input type="email" placeholder="ton@email.com" value={value}
        onChange={(e) => { onChange(e.target.value); setTouched(true); }}
        onBlur={(e) => { e.currentTarget.style.borderColor = touched && !valid ? "#ef4444" : "rgba(0, 210, 106, 0.15)"; }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0, 255, 76, 0.4)"; }}
        style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: touched && !valid ? "1px solid #ef4444" : "1px solid rgba(0, 210, 106, 0.15)", backgroundColor: "rgba(0, 180, 53, 0.04)", color: "rgb(232, 247, 237)", fontSize: "14px", fontFamily: "inherit", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }} />
      {touched && !valid && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>Entre une adresse e-mail valide</p>}
    </div>
  );
}

/* ----- Express Checkout (Apple Pay / Google Pay native button) ----- */
function ExpressCheckout({ onSuccess }: { onSuccess: (orderId?: number) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [expressError, setExpressError] = useState<string | null>(null);

  async function handleConfirm(event: StripeExpressCheckoutElementConfirmEvent) {
    if (!stripe || !elements) return;
    setExpressError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + "?payment=success" },
      redirect: "if_required",
    });

    if (error) {
      const msg = error.message || "Erreur de paiement";
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

/* ----- Inner form (inside Elements provider) ----- */
function PayForm({
  cart,
  total,
  onSuccess,
  onBack,
  onPromoApplied,
  onLoyaltyRedeemed,
}: {
  cart: CartItem[];
  total: number;
  onSuccess: (orderId?: number) => void;
  onBack: () => void;
  onPromoApplied: (code: string) => void;
  onLoyaltyRedeemed: (cents: number) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const [promoPercent, setPromoPercent] = useState(0);
  const [loyaltyDiscountCents, setLoyaltyDiscountCents] = useState(0);

  const discount = promoPercent > 0 ? total * (promoPercent / 100) : 0;
  const finalTotal = Math.max(0.50, total - discount - loyaltyDiscountCents / 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || !emailValid) return;
    setLoading(true);
    setError(null);
    const result = await stripe.confirmPayment({ elements, confirmParams: { return_url: window.location.origin + "?payment=success", receipt_email: email }, redirect: "if_required" });
    if (result.error) { const msg = result.error.message || "Erreur de paiement"; posthog.capture("payment_failed", { error_message: msg }); setError(msg); setLoading(false); }
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
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <CartRecap cart={cart} discount={discount} promoPercent={promoPercent} finalTotal={finalTotal} />

      {/* Native Apple Pay / Google Pay button */}
      <ExpressCheckout onSuccess={onSuccess} />

      {/* Separator */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 0 16px 0" }}>
        <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />
        <span style={{ fontSize: "11px", color: "rgb(107, 117, 111)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>ou payer par carte</span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />
      </div>

      <PromoCodeInput onValidated={(code, pct) => { setPromoPercent(pct); posthog.capture("promo_code_applied", { promo_code: code, discount_percent: pct }); onPromoApplied(code); }} />
      <EmailInput value={email} onChange={setEmail} />
      <LoyaltyBanner email={email} onRedeemed={(cents) => { setLoyaltyDiscountCents(cents); posthog.capture("loyalty_redeemed", { points_used: cents, discount_cents: cents }); onLoyaltyRedeemed(cents); }} />

      <div style={{ marginBottom: "20px" }}><PaymentElement options={{ layout: "tabs", wallets: { applePay: "never", googlePay: "never" } }} /></div>

      {error && <p style={{ fontSize: "13px", color: "#ef4444", margin: "0 0 16px 0", textAlign: "center" }}>{error}</p>}

      <button type="submit" disabled={!stripe || loading}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 0", borderRadius: "14px", border: "none", cursor: loading ? "wait" : "pointer", fontWeight: 700, fontSize: "15px", fontFamily: "inherit", color: "#000", background: "linear-gradient(135deg, rgb(0, 180, 53), rgb(0, 255, 76))", boxShadow: "0 10px 30px rgba(0, 255, 76, 0.25)", opacity: loading ? 0.7 : 1, transition: "all 0.2s" }}>
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeLinecap="round" /></svg>
            Paiement en cours...
          </span>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
            Payer {finalTotal.toFixed(2)}&euro;
          </>
        )}
      </button>

      <button type="button" onClick={onBack}
        style={{ width: "100%", marginTop: "12px", fontSize: "12px", color: "rgb(107, 117, 111)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}>
        Retour
      </button>
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
}: {
  cart: CartItem[];
  username: string;
  platform: string;
  postAssignments?: PostAssignment[];
  followersBefore?: number;
  onSuccess: (orderId?: number) => void;
  onBack: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<string>("");
  const [loyaltyDiscountCents, setLoyaltyDiscountCents] = useState(0);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const [intentKey, setIntentKey] = useState(0);

  const createIntent = useCallback(async (promoCode = "", loyaltyCents = 0) => {
    setClientSecret(null);
    setError(null);
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, username, platform, postAssignments, email: "", promoCode, followersBefore: followersBefore || 0, loyaltyDiscountCents: loyaltyCents }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setClientSecret(data.clientSecret);
      }
    } catch {
      setError("Impossible de contacter le serveur de paiement.");
    }
  }, [cart, username, platform, postAssignments, followersBefore]);

  useEffect(() => {
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
          Retour
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "40px 0" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid rgba(0, 210, 106, 0.2)",
            borderTopColor: "rgb(0, 210, 106)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ fontSize: "14px", color: "rgb(169, 181, 174)" }}>Préparation du paiement...</p>
      </div>
    );
  }

  return (
    <div className="checkout-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
        <span style={{ color: "rgb(0, 255, 76)", textShadow: "0 0 20px rgba(0, 255, 76, 0.3)" }}>Paiement</span> sécurisé
      </h2>
      <p style={{ fontSize: "13px", color: "rgb(169, 181, 174)", margin: "0 0 24px 0" }}>
        Propulsé par Stripe — tes données sont chiffrées
      </p>

      <Elements
        key={intentKey}
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "night",
            variables: {
              colorPrimary: "#00ff4c",
              colorBackground: "#0e1512",
              colorText: "#e8f7ed",
              colorDanger: "#ef4444",
              fontFamily: "inherit",
              borderRadius: "12px",
              spacingUnit: "4px",
            },
            rules: {
              ".Input": {
                border: "1px solid rgba(0, 210, 106, 0.15)",
                backgroundColor: "rgba(0, 180, 53, 0.04)",
                boxShadow: "none",
              },
              ".Input:focus": {
                border: "1px solid rgba(0, 255, 76, 0.4)",
                boxShadow: "0 0 8px rgba(0, 255, 76, 0.1)",
              },
              ".Tab": {
                border: "1px solid rgba(0, 210, 106, 0.12)",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
              },
              ".Tab--selected": {
                border: "1px solid rgba(0, 255, 76, 0.4)",
                backgroundColor: "rgba(0, 180, 53, 0.08)",
              },
              ".Label": {
                color: "rgb(169, 181, 174)",
              },
            },
          },
        }}
      >
        <PayForm cart={cart} total={total} onSuccess={onSuccess} onBack={onBack} onPromoApplied={handlePromoApplied} onLoyaltyRedeemed={handleLoyaltyRedeemed} />
      </Elements>
    </div>
  );
}
