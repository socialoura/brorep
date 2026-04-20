"use client";

import { useState, useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";
import FanovalyLogo from "@/components/FanovalyLogo";
import SocialProof from "@/components/SocialProof";
import CTAButton from "@/components/CTAButton";
import StatusBadge from "@/components/StatusBadge";
import PlatformSelect from "@/components/PlatformSelect";
import UsernameInput from "@/components/UsernameInput";
import ScanLoading from "@/components/ScanLoading";
import type { ScanResult } from "@/components/ScanLoading";
import AnimatedBackground from "@/components/AnimatedBackground";
import ProfileConfirm from "@/components/ProfileConfirm";
import ServiceSelect from "@/components/ServiceSelect";
import type { CartItem } from "@/components/ServiceSelect";
import PostPicker from "@/components/PostPicker";
import type { PostAssignment } from "@/components/PostPicker";
import CheckoutForm from "@/components/CheckoutForm";
import SuccessPage from "@/components/SuccessPage";
import { useTranslation } from "@/lib/i18n";

type Step = "hero" | "platform" | "username" | "scanning" | "results" | "shop" | "pickPosts" | "payment" | "success";

const PROGRESS_STEPS_FR = [
  { key: "platform", label: "Plateforme" },
  { key: "username", label: "Profil" },
  { key: "shop", label: "Services" },
  { key: "payment", label: "Paiement" },
] as const;

const PROGRESS_STEPS_EN = [
  { key: "platform", label: "Platform" },
  { key: "username", label: "Profile" },
  { key: "shop", label: "Services" },
  { key: "payment", label: "Payment" },
] as const;

const STEP_TO_PROGRESS: Record<string, number> = {
  platform: 0,
  username: 1,
  scanning: 1,
  results: 1,
  shop: 2,
  pickPosts: 2,
  payment: 3,
};

function StepProgress({ step, lang = "fr" }: { step: Step; lang?: string }) {
  const PROGRESS_STEPS = lang === "en" ? PROGRESS_STEPS_EN : PROGRESS_STEPS_FR;
  const currentIndex = STEP_TO_PROGRESS[step];
  if (currentIndex === undefined) return null;

  const green = "rgb(0, 255, 76)";
  const greenDim = "rgb(0, 210, 106)";
  const progressPercent = (currentIndex / (PROGRESS_STEPS.length - 1)) * 100;

  return (
    <div style={{ width: "100%", maxWidth: "360px", marginBottom: "28px" }}>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
        {/* Background line */}
        <div style={{ position: "absolute", top: "11px", left: "20px", right: "20px", height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "1px" }} />
        {/* Progress line */}
        <div style={{ position: "absolute", top: "11px", left: "20px", height: "2px", background: green, borderRadius: "1px", width: `calc(${progressPercent}% - 40px * ${progressPercent / 100})`, transition: "width 0.4s ease" }} />

        {PROGRESS_STEPS.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={s.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%",
                background: done ? green : active ? "rgba(0,255,76,0.15)" : "rgba(255,255,255,0.06)",
                border: active ? `2px solid ${green}` : done ? `2px solid ${green}` : "2px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: active ? "0 0 10px rgba(0,255,76,0.25)" : "none",
                transition: "all 0.3s",
              }}>
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span style={{ fontSize: "10px", fontWeight: 800, color: active ? green : "rgb(107,117,111)" }}>{i + 1}</span>
                )}
              </div>
              <span style={{ marginTop: "6px", fontSize: "10px", fontWeight: 600, color: active ? green : done ? greenDim : "rgb(107,117,111)", whiteSpace: "nowrap" }}>
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

function HomePageInner() {
  const [step, setStep] = useState<Step>("hero");
  const [platform, setPlatform] = useState<string>("tiktok");
  const [username, setUsername] = useState<string>("");
  const [scanData, setScanData] = useState<ScanResult | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [postAssignments, setPostAssignments] = useState<PostAssignment[] | undefined>(undefined);
  const [orderId, setOrderId] = useState<number | undefined>();
  const [hydrated, setHydrated] = useState(false);
  const posthog = usePostHog();
  const { t, lang } = useTranslation();

  // Restore from sessionStorage after hydration (client-only)
  useEffect(() => {
    // If ?reset=1 is in the URL, clear session and start fresh
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "1") {
      try { sessionStorage.clear(); } catch {}
      window.history.replaceState({}, "", "/");
      setHydrated(true);
      return;
    }

    setStep(loadSession<Step>("br_step", "hero"));
    setPlatform(loadSession("br_platform", "tiktok"));
    setUsername(loadSession("br_username", ""));
    setScanData(loadSession("br_scanData", null));
    setCart(loadSession("br_cart", []));
    setPostAssignments(loadSession("br_postAssignments", undefined));
    setHydrated(true);
  }, []);

  // Persist state changes to sessionStorage (only after hydration)
  useEffect(() => {
    if (hydrated) {
      saveSession("br_step", step);
      window.scrollTo({ top: 0, behavior: "instant" });
      // Reset mobile zoom (iOS auto-zooms on small font inputs)
      const vp = document.querySelector('meta[name="viewport"]');
      if (vp) {
        vp.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover");
      }
      // Blur any focused input to dismiss keyboard & zoom
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    }
  }, [step, hydrated]);
  useEffect(() => { if (hydrated) saveSession("br_platform", platform); }, [platform, hydrated]);
  useEffect(() => { if (hydrated) saveSession("br_username", username); }, [username, hydrated]);
  useEffect(() => { if (hydrated) saveSession("br_scanData", scanData); }, [scanData, hydrated]);
  useEffect(() => { if (hydrated) saveSession("br_cart", cart); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) saveSession("br_postAssignments", postAssignments); }, [postAssignments, hydrated]);

  // If restored to scanning step but no data yet, go back to username
  useEffect(() => {
    if (!hydrated) return;
    if (step === "scanning" && !username) setStep("username");
    if (step === "results" && !scanData) setStep("hero");
    if (step === "shop" && !scanData) setStep("hero");
    if (step === "pickPosts" && cart.length === 0) setStep("shop");
    if (step === "payment" && cart.length === 0) setStep("hero");
    if (step === "success" && !orderId && cart.length === 0) setStep("hero");
  }, [hydrated]);

  function renderContent() {
    switch (step) {
      case "hero":
        return (
          <div className="flex flex-col items-center gap-8 px-6 w-full max-w-2xl text-center">
            <FanovalyLogo />
            <StatusBadge />
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white uppercase">
                {t("hero.title1")}
              </h1>
              <h2
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] uppercase"
                style={{ color: "#22c55e", textShadow: "0 0 40px rgba(34,197,94,0.35)" }}
              >
                {t("hero.title2")}
              </h2>
            </div>
            <p className="text-base sm:text-lg text-gray-400 max-w-md leading-relaxed">
              {t("hero.subtitle1")}
              <br />
              <span className="text-gray-500">{t("hero.subtitle2")}</span>
            </p>
            <div className="mt-2">
              <CTAButton onClick={() => { posthog?.capture("cta_clicked"); setStep("platform"); }} />
            </div>
            <div className="mt-4 flex flex-col items-center gap-3">
              <SocialProof />
              <div className="flex items-center gap-1.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
                <span className="text-green-400 font-semibold">{t("hero.morePercent")}</span>
                <span className="text-gray-500">{t("hero.moreProfiles")}</span>
              </div>
            </div>

            {/* Comment ça marche */}
            <div style={{ width: "100%", maxWidth: "540px", marginTop: "48px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgb(0, 210, 106)", marginBottom: "16px" }}>{t("howItWorks.title")}</p>
              <div className="grid-steps">
                {[
                  { num: "1", title: t("howItWorks.step1.title"), desc: t("howItWorks.step1.desc") },
                  { num: "2", title: t("howItWorks.step2.title"), desc: t("howItWorks.step2.desc") },
                  { num: "3", title: t("howItWorks.step3.title"), desc: t("howItWorks.step3.desc") },
                ].map((s) => (
                  <div key={s.num} style={{ padding: "20px 14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)", backgroundColor: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0, 210, 106, 0.1)", border: "1px solid rgba(0, 210, 106, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px auto", fontSize: "13px", fontWeight: 800, color: "rgb(0, 210, 106)" }}>{s.num}</div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 700, color: "#fff" }}>{s.title}</p>
                    <p style={{ margin: 0, fontSize: "11px", lineHeight: 1.5, color: "rgb(107, 117, 111)" }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div style={{ width: "100%", maxWidth: "540px", marginTop: "40px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgb(0, 210, 106)", marginBottom: "16px" }}>{t("faq.title")}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { q: t("faq.q1"), a: t("faq.a1") },
                  { q: t("faq.q2"), a: t("faq.a2") },
                  { q: t("faq.q3"), a: t("faq.a3") },
                  { q: t("faq.q4"), a: t("faq.a4") },
                ].map((faq) => (
                  <details key={faq.q} onClick={() => posthog?.capture("faq_opened", { question: faq.q })} style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)", backgroundColor: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
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

          </div>
        );

      case "platform":
        return (
          <PlatformSelect onSelect={(p) => { posthog?.capture("platform_selected", { platform: p }); setPlatform(p); setStep("username"); }} />
        );

      case "username":
        return (
          <UsernameInput platform={platform} onSubmit={(u) => { setUsername(u); setStep("scanning"); }} />
        );

      case "scanning":
        return username ? (
          <ScanLoading
            username={username}
            platform={platform}
            onComplete={(data) => { setScanData(data); setStep("results"); }}
            onError={() => setStep("username")}
          />
        ) : null;

      case "results":
        return scanData ? (
          <ProfileConfirm
            data={scanData}
            platform={platform}
            onConfirm={() => { posthog?.capture("profile_confirmed", { platform, followers_count: scanData?.followersCount }); setStep("shop"); }}
            onBack={() => { posthog?.capture("back_clicked", { from_step: "results" }); setScanData(null); setUsername(""); setStep("username"); }}
          />
        ) : null;

      case "shop":
        return scanData ? (
          <ServiceSelect
            profile={scanData}
            onCheckout={(items) => {
              setCart(items);
              posthog?.capture("checkout_started", { platform, cart_total: items.reduce((s, i) => s + i.price, 0), cart_items_count: items.length });
              const needsPosts = items.some((c) => c.service === "likes" || c.service === "views");
              if (needsPosts && scanData.posts.length > 0) {
                setStep("pickPosts");
              } else {
                setPostAssignments(undefined);
                setStep("payment");
              }
            }}
            onBack={() => { posthog?.capture("back_clicked", { from_step: "shop" }); setStep("results"); }}
          />
        ) : null;

      case "pickPosts":
        return scanData ? (
          <PostPicker
            profile={scanData}
            platform={platform}
            cart={cart}
            onConfirm={(assignments) => {
              setPostAssignments(assignments);
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
            postAssignments={postAssignments}
            followersBefore={scanData?.followersCount || 0}
            onSuccess={(id) => { posthog?.capture("payment_completed", { platform, total: cart.reduce((s, i) => s + i.price, 0), order_id: id }); setOrderId(id); setStep("success"); }}
            onBack={() => {
              const needsPosts = cart.some((c) => c.service === "likes" || c.service === "views");
              setStep(needsPosts && scanData?.posts.length ? "pickPosts" : "shop");
            }}
          />
        );

      case "success":
        return (
          <SuccessPage
            username={username}
            orderId={orderId}
            cart={cart}
            onReset={() => { setStep("hero"); setScanData(null); setUsername(""); setCart([]); setPostAssignments(undefined); setOrderId(undefined); try { sessionStorage.clear(); } catch {} }}
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
          className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 text-center py-12"
          style={{ opacity: 1 }}
        >
          <div key={step} className="step-fade-in" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <StepProgress step={step} lang={lang} />
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageInner />
    </Suspense>
  );
}
