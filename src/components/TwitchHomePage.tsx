"use client";

import { useState, useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";
import FanovalyLogo from "@/components/FanovalyLogo";
import SocialProof from "@/components/SocialProof";
import AnimatedBackground from "@/components/AnimatedBackground";
import ServiceSelect from "@/components/ServiceSelect";
import type { CartItem } from "@/components/ServiceSelect";
import LiveSchedule from "@/components/LiveSchedule";
import CheckoutForm from "@/components/CheckoutForm";
import SuccessPage from "@/components/SuccessPage";
import type { ScanResult } from "@/components/ScanLoading";
import { useTranslation, fmtPrice } from "@/lib/i18n";

type Step = "hero" | "shop" | "liveSchedule" | "payment" | "success";

const PROGRESS_STEPS_FR = [
  { key: "shop", label: "Services" },
  { key: "payment", label: "Paiement" },
] as const;
const PROGRESS_STEPS_EN = [
  { key: "shop", label: "Services" },
  { key: "payment", label: "Payment" },
] as const;
const STEP_TO_PROGRESS: Record<string, number> = {
  shop: 0,
  liveSchedule: 0,
  payment: 1,
};

function StepProgress({ step, lang = "fr" }: { step: Step; lang?: string }) {
  const PROGRESS_STEPS = lang === "en" ? PROGRESS_STEPS_EN : PROGRESS_STEPS_FR;
  const currentIndex = STEP_TO_PROGRESS[step];
  if (currentIndex === undefined) return null;
  const purple = "rgb(145, 71, 255)";
  const purpleDim = "rgb(110, 50, 200)";
  const progressPercent = (currentIndex / (PROGRESS_STEPS.length - 1)) * 100;
  return (
    <div style={{ width: "100%", maxWidth: "360px", marginBottom: "28px" }}>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
        <div style={{ position: "absolute", top: "11px", left: "20px", right: "20px", height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "1px" }} />
        <div style={{ position: "absolute", top: "11px", left: "20px", height: "2px", background: purple, borderRadius: "1px", width: `calc(${progressPercent}% - 40px * ${progressPercent / 100})`, transition: "width 0.4s ease" }} />
        {PROGRESS_STEPS.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={s.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%",
                background: done ? purple : active ? "rgba(145,71,255,0.15)" : "rgba(255,255,255,0.06)",
                border: active ? `2px solid ${purple}` : done ? `2px solid ${purple}` : "2px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: active ? "0 0 10px rgba(145,71,255,0.25)" : "none",
                transition: "all 0.3s",
              }}>
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span style={{ fontSize: "10px", fontWeight: 800, color: active ? purple : "rgb(107,117,111)" }}>{i + 1}</span>
                )}
              </div>
              <span style={{ marginTop: "6px", fontSize: "10px", fontWeight: 600, color: active ? purple : done ? purpleDim : "rgb(107,117,111)", whiteSpace: "nowrap" }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function loadSession<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function saveSession(key: string, value: unknown) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

function TwitchHomePageInner() {
  const [step, setStep] = useState<Step>("hero");
  const [username, setUsername] = useState<string>("");
  const [scanData, setScanData] = useState<ScanResult | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<number | undefined>();
  const [hydrated, setHydrated] = useState(false);
  const posthog = usePostHog();
  const { lang, currency } = useTranslation();

  const platform = "twitch";

  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [minPriceUsd, setMinPriceUsd] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (data.pricing && Array.isArray(data.pricing) && data.pricing.length > 0) {
          type PricingRow = { service: string; price: number; price_usd?: number };
          const tw = (data.pricing as PricingRow[]).filter((r) => r.service === "tw_followers");
          if (tw.length > 0) {
            setMinPrice(Math.min(...tw.map((r) => Number(r.price))));
            setMinPriceUsd(Math.min(...tw.map((r) => Number(r.price_usd || r.price))));
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "1") {
      try { sessionStorage.clear(); } catch {}
      window.history.replaceState({}, "", "/twitch");
      setHydrated(true);
      return;
    }
    setStep(loadSession<Step>("tw_step", "hero"));
    setUsername(loadSession("tw_username", ""));
    setScanData(loadSession("tw_scanData", null));
    setCart(loadSession("tw_cart", []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveSession("tw_step", step);
      window.scrollTo({ top: 0, behavior: "instant" });
      const vp = document.querySelector('meta[name="viewport"]');
      if (vp) vp.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover");
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      if (step !== "hero") document.body.setAttribute("data-hide-chat", "");
      else document.body.removeAttribute("data-hide-chat");
    }
  }, [step, hydrated]);
  useEffect(() => { if (hydrated) saveSession("tw_username", username); }, [username, hydrated]);
  useEffect(() => { if (hydrated) saveSession("tw_scanData", scanData); }, [scanData, hydrated]);
  useEffect(() => { if (hydrated) saveSession("tw_cart", cart); }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (step === "liveSchedule" && cart.length === 0) setStep("shop");
    if (step === "payment" && cart.length === 0) setStep("hero");
    if (step === "success" && !orderId && cart.length === 0) setStep("hero");
  }, [hydrated]);

  function renderContent() {
    switch (step) {
      case "hero":
        return (
          <>
            <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "32px 24px 40px", width: "100%", maxWidth: "672px", textAlign: "center", position: "relative" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <FanovalyLogo />
                <h1 style={{ fontSize: "clamp(2.4rem, 9vw, 4.8rem)", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1, textTransform: "uppercase", margin: 0, color: "#fff" }}>
                  {lang === "fr" ? "Fais connaître ta" : "Promote your"}
                  <br />
                  <span style={{ color: "#fff" }}>{lang === "fr" ? "chaîne " : "channel "}</span>
                  <span style={{ background: "linear-gradient(135deg, rgb(145,71,255), rgb(110,50,200))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Twitch
                    <svg width="0.7em" height="0.7em" viewBox="0 0 24 24" fill="rgb(145,71,255)" style={{ display: "inline", verticalAlign: "middle", marginLeft: "6px", filter: "drop-shadow(0 0 12px rgba(145,71,255,0.5))" }}>
                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                    </svg>
                  </span>
                </h1>
              </div>

              <p style={{ fontSize: "15px", color: "rgb(169,181,174)", maxWidth: "380px", lineHeight: 1.5, margin: 0 }}>
                {lang === "fr"
                  ? <>Une visibilité accrue auprès d&apos;une audience<br /><span style={{ color: "rgb(107,117,111)" }}>passionnée de gaming et de streaming.</span></>
                  : <>Reach a wider audience of gaming<br /><span style={{ color: "rgb(107,117,111)" }}>and streaming enthusiasts.</span></>}
              </p>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "rgb(169,181,174)" }}>
                  {minPrice !== null && <>{lang === "fr" ? "À partir de" : "Starting at"} <span style={{ fontSize: "28px", fontWeight: 900, color: "rgb(145,71,255)", marginLeft: "4px" }}>{fmtPrice(currency === "usd" ? (minPriceUsd ?? minPrice) : minPrice, currency)}</span></>}
                </p>
                <span style={{ fontSize: "11px", color: "rgb(107,117,111)" }}>
                  ⚡ {lang === "fr" ? "Promotion de ta chaîne Twitch" : "Twitch channel promotion"}
                </span>
              </div>

              <SocialProof />

              <button
                onClick={() => { posthog?.capture("twitch_cta_clicked"); setStep("shop"); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  padding: "14px 32px", borderRadius: "14px", border: "none", cursor: "pointer",
                  fontSize: "15px", fontWeight: 700, fontFamily: "inherit",
                  background: "linear-gradient(135deg, rgb(110,50,200), rgb(145,71,255))",
                  color: "#fff", boxShadow: "0 4px 24px rgba(145,71,255,0.3)",
                }}
              >
                {lang === "fr" ? "Promouvoir ma chaîne →" : "Promote my channel →"}
              </button>

              <div className="flex items-center gap-1.5" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ backgroundColor: "rgb(145,71,255)", flexShrink: 0 }} />
                <span style={{ color: "rgb(145,71,255)", fontWeight: 600 }}>{lang === "fr" ? "Tous nos services sont opérationnels" : "All our services are operational"}</span>
                <span className="text-gray-500">({new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "long", year: "numeric" })})</span>
              </div>

              <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", animation: "bounce 2s ease-in-out infinite" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(107,117,111)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div style={{ width: "100%", maxWidth: "540px", padding: "48px 24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
              <div style={{ width: "100%" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgb(145,71,255)", marginBottom: "16px", textAlign: "center" }}>{lang === "fr" ? "Comment ça marche" : "How it works"}</p>
                <div className="grid-steps">
                  {[
                    { num: "1", title: lang === "fr" ? "Entre ton @" : "Enter your @", desc: lang === "fr" ? "Indique ta chaîne Twitch et choisis ta formule de promotion." : "Enter your Twitch channel and choose your promotion plan." },
                    { num: "2", title: lang === "fr" ? "Paie en sécurité" : "Pay securely", desc: lang === "fr" ? "Paiement sécurisé par Stripe, en quelques secondes." : "Secure Stripe payment, takes only seconds." },
                    { num: "3", title: lang === "fr" ? "Audience ciblée" : "Targeted audience", desc: lang === "fr" ? "Ta chaîne est mise en avant auprès de viewers intéressés par ton contenu." : "Your channel is showcased to viewers interested in your content." },
                  ].map((s) => (
                    <div key={s.num} style={{ padding: "20px 14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)", backgroundColor: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(145,71,255,0.1)", border: "1px solid rgba(145,71,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px auto", fontSize: "13px", fontWeight: 800, color: "rgb(145,71,255)" }}>{s.num}</div>
                      <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 700, color: "#fff" }}>{s.title}</p>
                      <p style={{ margin: 0, fontSize: "11px", lineHeight: 1.5, color: "rgb(107, 117, 111)" }}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ width: "100%" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgb(145,71,255)", marginBottom: "16px", textAlign: "center" }}>{lang === "fr" ? "Questions fréquentes" : "FAQ"}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { q: lang === "fr" ? "Comment fonctionnent les viewers live ?" : "How do live viewers work?", a: lang === "fr" ? "Tu nous indiques l'heure exacte de ton stream. Au début du live, les viewers se connectent progressivement et restent jusqu'à la fin." : "You tell us the exact time of your stream. At the start, viewers connect progressively and stay until the end." },
                    { q: lang === "fr" ? "Est-ce que c'est sûr pour mon compte ?" : "Is it safe for my account?", a: lang === "fr" ? "Oui. Aucun mot de passe requis, aucun accès à ton compte Twitch. On a juste besoin de ton pseudo." : "Yes. No password required, no access to your Twitch account. Just your username." },
                    { q: lang === "fr" ? "Que se passe-t-il si je décale mon live ?" : "What if I postpone my live?", a: lang === "fr" ? "Contacte-nous au plus vite via le chat — on reprogramme la livraison sans frais." : "Contact us via chat asap — we'll reschedule delivery for free." },
                    { q: lang === "fr" ? "Les followers sont-ils durables ?" : "Are followers long-lasting?", a: lang === "fr" ? "On vise une croissance progressive. Garantie 30 jours, on recharge gratuitement en cas de baisse." : "We aim for progressive growth. 30-day guarantee with free refill if any drop occurs." },
                  ].map((faq) => (
                    <details key={faq.q} style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)", backgroundColor: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
                      <summary style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 600, color: "#fff", cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        {faq.q}
                        <span style={{ fontSize: "16px", color: "rgb(107, 117, 111)", marginLeft: "8px", flexShrink: 0 }}>+</span>
                      </summary>
                      <div style={{ padding: "0 16px 14px 16px", fontSize: "12px", lineHeight: 1.6, color: "rgb(107, 117, 111)" }}>
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              <p style={{ fontSize: "12px", color: "rgb(107,117,111)", textAlign: "center", paddingBottom: "32px" }}>
                {lang === "fr" ? "Tu cherches TikTok ou Instagram ? " : "Looking for TikTok or Instagram? "}
                <a href={lang === "en" ? "/?lang=en" : "/"} style={{ color: "rgb(145,71,255)", textDecoration: "underline" }}>
                  {lang === "fr" ? "C'est par ici" : "Click here"}
                </a>
              </p>
            </div>
          </>
        );

      case "shop":
        return (
          <ServiceSelect
            profile={scanData}
            platform={platform}
            username={username}
            onUsernameChange={setUsername}
            onCheckout={async (items) => {
              setCart(items);
              posthog?.capture("checkout_started", { platform, cart_total: items.reduce((s, i) => s + i.price, 0), cart_items_count: items.length });

              const needsSchedule = items.some((i) => i.service === "tw_live_viewers");
              if (needsSchedule && username) {
                // Fetch profile if missing for the LiveSchedule preview
                if (!scanData || scanData.username !== username) {
                  try {
                    const res = await fetch(`/api/scraper-twitch?username=${encodeURIComponent(username)}`);
                    const data = await res.json();
                    if (data.username) {
                      setScanData({
                        username: data.username || username,
                        fullName: data.fullName || username,
                        avatarUrl: data.avatarUrl || "",
                        followersCount: data.followersCount || 0,
                        followingCount: data.followingCount || 0,
                        likesCount: data.likesCount || 0,
                        videoCount: data.videoCount || 0,
                        bio: data.bio || "",
                        verified: data.verified || false,
                        posts: [],
                      });
                    }
                  } catch (err) {
                    console.error("Twitch profile fetch failed:", err);
                  }
                }
                setStep("liveSchedule");
                return;
              }
              setStep("payment");
            }}
            onBack={() => { posthog?.capture("back_clicked", { from_step: "shop" }); setStep("hero"); }}
          />
        );

      case "liveSchedule":
        return scanData ? (
          <LiveSchedule
            profile={scanData}
            cart={cart}
            onConfirm={(liveStartAt) => {
              // Inject liveStartAt into the tw_live_viewers cart item
              setCart((prev) => prev.map((it) =>
                it.service === "tw_live_viewers" ? { ...it, liveStartAt } : it
              ));
              setStep("payment");
            }}
            onBack={() => { setStep("shop"); }}
          />
        ) : null;

      case "payment":
        return (
          <CheckoutForm
            cart={cart}
            username={username}
            platform={platform}
            followersBefore={scanData?.followersCount || 0}
            onSuccess={(id) => { posthog?.capture("payment_completed", { platform, total: cart.reduce((s, i) => s + i.price, 0), order_id: id }); setOrderId(id); setStep("success"); }}
            onBack={() => { setStep("shop"); }}
            onAddToCart={(item) => {
              setCart((prev) => [...prev, item]);
              posthog?.capture("upsell_added", { service: item.service, qty: item.qty, price: item.price });
              if (item.service === "tw_live_viewers") {
                setStep("liveSchedule");
              }
            }}
          />
        );

      case "success":
        return (
          <SuccessPage
            username={username}
            orderId={orderId}
            cart={cart}
            onReset={() => { setStep("hero"); setScanData(null); setUsername(""); setCart([]); setOrderId(undefined); try { sessionStorage.clear(); } catch {} }}
          />
        );

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-6 sm:pt-10">
      <AnimatedBackground />
      <div className="relative z-10">
        <div
          className={`flex flex-col items-center min-h-screen px-4 sm:px-6 text-center ${step === "hero" ? "justify-start pt-6" : "justify-center py-12"}`}
        >
          {step !== "hero" && step !== "success" && (
            <button
              onClick={() => { setStep("hero"); setScanData(null); setUsername(""); setCart([]); setOrderId(undefined); try { sessionStorage.clear(); } catch {} }}
              style={{ background: "none", border: "none", cursor: "pointer", marginBottom: "8px", opacity: 0.7 }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.7"; }}
              title="Retour à l'accueil"
            >
              <FanovalyLogo />
            </button>
          )}
          <div key={step} className="step-fade-in" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <StepProgress step={step} lang={lang} />
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TwitchHomePage() {
  return (
    <Suspense>
      <TwitchHomePageInner />
    </Suspense>
  );
}
