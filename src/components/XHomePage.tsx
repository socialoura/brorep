"use client";

import { useState, useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";
import FanovalyLogo from "@/components/FanovalyLogo";
import SocialProof from "@/components/SocialProof";
import AnimatedBackground from "@/components/AnimatedBackground";
import ServiceSelect from "@/components/ServiceSelect";
import type { CartItem } from "@/components/ServiceSelect";
import PostPicker from "@/components/PostPicker";
import type { PostAssignment } from "@/components/PostPicker";
import CheckoutForm from "@/components/CheckoutForm";
import SuccessPage from "@/components/SuccessPage";
import type { ScanResult } from "@/components/ScanLoading";
import { useTranslation, fmtPrice, LANG_LOCALE } from "@/lib/i18n";

type Step = "hero" | "shop" | "pickPosts" | "payment" | "success";

const STEP_TO_PROGRESS: Record<string, number> = {
  shop: 0,
  pickPosts: 0,
  payment: 1,
};

function StepProgress({ step, lang = "fr" }: { step: Step; lang?: string }) {
  const { t } = useTranslation();
  const PROGRESS_STEPS = [
    { key: "shop", label: t("progress.services") },
    { key: "payment", label: t("progress.payment") },
  ];
  const currentIndex = STEP_TO_PROGRESS[step];
  if (currentIndex === undefined) return null;

  const blue = "rgb(29, 155, 240)";
  const blueDim = "rgb(20, 120, 200)";
  const progressPercent = (currentIndex / (PROGRESS_STEPS.length - 1)) * 100;

  return (
    <div style={{ width: "100%", maxWidth: "360px", marginBottom: "28px" }}>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
        <div style={{ position: "absolute", top: "11px", left: "20px", right: "20px", height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "1px" }} />
        <div style={{ position: "absolute", top: "11px", left: "20px", height: "2px", background: blue, borderRadius: "1px", width: `calc(${progressPercent}% - 40px * ${progressPercent / 100})`, transition: "width 0.4s ease" }} />

        {PROGRESS_STEPS.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={s.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%",
                background: done ? blue : active ? "rgba(29,155,240,0.15)" : "rgba(255,255,255,0.06)",
                border: active ? `2px solid ${blue}` : done ? `2px solid ${blue}` : "2px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: active ? "0 0 10px rgba(29,155,240,0.25)" : "none",
                transition: "all 0.3s",
              }}>
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span style={{ fontSize: "10px", fontWeight: 800, color: active ? blue : "rgb(107,117,111)" }}>{i + 1}</span>
                )}
              </div>
              <span style={{ marginTop: "6px", fontSize: "10px", fontWeight: 600, color: active ? blue : done ? blueDim : "rgb(107,117,111)", whiteSpace: "nowrap" }}>
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

function XHomePageInner() {
  const [step, setStep] = useState<Step>("hero");
  const [username, setUsername] = useState<string>("");
  const [scanData, setScanData] = useState<ScanResult | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [postAssignments, setPostAssignments] = useState<PostAssignment[] | undefined>(undefined);
  const [orderId, setOrderId] = useState<number | undefined>();
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const posthog = usePostHog();
  const { t, lang, href, currency } = useTranslation();

  const platform = "x";

  // Compute minimum price
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [minPriceUsd, setMinPriceUsd] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (data.pricing && Array.isArray(data.pricing) && data.pricing.length > 0) {
          type PricingRow = { service: string; price: number; price_usd?: number };
          const xServices = (data.pricing as PricingRow[]).filter((r) => ["x_followers", "x_likes", "x_retweets"].includes(r.service));
          if (xServices.length > 0) {
            setMinPrice(Math.min(...xServices.map((r) => Number(r.price))));
            setMinPriceUsd(Math.min(...xServices.map((r) => Number(r.price_usd || r.price))));
          }
        }
      })
      .catch(() => {});
  }, []);

  // Restore from sessionStorage after hydration
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "1") {
      try { sessionStorage.clear(); } catch {}
      window.history.replaceState({}, "", "/x");
      setHydrated(true);
      return;
    }

    setStep(loadSession<Step>("x_step", "hero"));
    setUsername(loadSession("x_username", ""));
    setScanData(loadSession("x_scanData", null));
    setCart(loadSession("x_cart", []));
    setPostAssignments(loadSession("x_postAssignments", undefined));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveSession("x_step", step);
      window.scrollTo({ top: 0, behavior: "instant" });
      const vp = document.querySelector('meta[name="viewport"]');
      if (vp) vp.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover");
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      if (step !== "hero") document.body.setAttribute("data-hide-chat", "");
      else document.body.removeAttribute("data-hide-chat");
    }
  }, [step, hydrated]);
  useEffect(() => { if (hydrated) saveSession("x_username", username); }, [username, hydrated]);
  useEffect(() => { if (hydrated) saveSession("x_scanData", scanData); }, [scanData, hydrated]);
  useEffect(() => { if (hydrated) saveSession("x_cart", cart); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) saveSession("x_postAssignments", postAssignments); }, [postAssignments, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (step === "pickPosts" && cart.length === 0) setStep("shop");
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
                  {t("x.hero.title1")}
                  <br />
                  <span style={{ color: "#fff" }}>{t("x.hero.title2")}</span>
                  <span style={{ background: "linear-gradient(135deg, rgb(29,155,240), rgb(20,120,200))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    X
                    <svg width="0.65em" height="0.65em" viewBox="0 0 24 24" fill="rgb(29,155,240)" style={{ display: "inline", verticalAlign: "middle", marginLeft: "6px", filter: "drop-shadow(0 0 12px rgba(29,155,240,0.5))" }}>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </span>
                </h1>
              </div>

              <p style={{ fontSize: "15px", color: "rgb(169,181,174)", maxWidth: "380px", lineHeight: 1.5, margin: 0 }}>
                {<>{t("x.hero.subtitle1")}<br /><span style={{ color: "rgb(107,117,111)" }}>{t("x.hero.subtitle2")}</span></>}
              </p>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "rgb(169,181,174)" }}>
                  {minPrice !== null && <>{t("hero.startingAt")} <span style={{ fontSize: "28px", fontWeight: 900, color: "rgb(29,155,240)", marginLeft: "4px" }}>{fmtPrice(currency === "usd" ? (minPriceUsd ?? minPrice) : minPrice, currency)}</span></>}
                </p>
                <span style={{ fontSize: "11px", color: "rgb(107,117,111)" }}>
                  ⚡ {t("hero.delivery")}
                </span>
              </div>

              <SocialProof />

              <button
                onClick={() => { posthog?.capture("x_cta_clicked"); setStep("shop"); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  padding: "14px 32px", borderRadius: "14px", border: "none", cursor: "pointer",
                  fontSize: "15px", fontWeight: 700, fontFamily: "inherit",
                  background: "linear-gradient(135deg, rgb(20,120,200), rgb(29,155,240))",
                  color: "#fff", boxShadow: "0 4px 24px rgba(29,155,240,0.3)",
                  transition: "all 0.2s",
                }}
              >
                {t("x.hero.cta")}
              </button>

              <div className="flex items-center gap-1.5" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ backgroundColor: "rgb(29,155,240)", flexShrink: 0 }} />
                <span style={{ color: "rgb(29,155,240)", fontWeight: 600 }}>{t("hero.operational")}</span>
                <span className="text-gray-500">({new Date().toLocaleDateString(LANG_LOCALE[lang], { day: "numeric", month: "long", year: "numeric" })})</span>
              </div>

              <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", animation: "bounce 2s ease-in-out infinite" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(107,117,111)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div style={{ width: "100%", maxWidth: "540px", padding: "48px 24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
              <div style={{ width: "100%" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgb(29,155,240)", marginBottom: "16px", textAlign: "center" }}>{t("howItWorks.title")}</p>
                <div className="grid-steps">
                  {[
                    { num: "1", title: t("x.howItWorks.step1.title"), desc: t("x.howItWorks.step1.desc") },
                    { num: "2", title: t("x.howItWorks.step2.title"), desc: t("x.howItWorks.step2.desc") },
                    { num: "3", title: t("x.howItWorks.step3.title"), desc: t("x.howItWorks.step3.desc") },
                  ].map((s) => (
                    <div key={s.num} style={{ padding: "20px 14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)", backgroundColor: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(29,155,240,0.1)", border: "1px solid rgba(29,155,240,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px auto", fontSize: "13px", fontWeight: 800, color: "rgb(29,155,240)" }}>{s.num}</div>
                      <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 700, color: "#fff" }}>{s.title}</p>
                      <p style={{ margin: 0, fontSize: "11px", lineHeight: 1.5, color: "rgb(107, 117, 111)" }}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ width: "100%" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgb(29,155,240)", marginBottom: "16px", textAlign: "center" }}>{t("faq.title")}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { q: t("x.faq.q1"), a: t("x.faq.a1") },
                    { q: t("x.faq.q2"), a: t("x.faq.a2") },
                    { q: t("x.faq.q3"), a: t("x.faq.a3") },
                    { q: t("x.faq.q4"), a: t("x.faq.a4") },
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
                {t("x.linkToTikTok")}
                <a href={href("/")} style={{ color: "rgb(29,155,240)", textDecoration: "underline" }}>
                  {t("x.linkToTikTok.cta")}
                </a>
              </p>
            </div>
          </>
        );

      case "shop":
        return (
          <>
          {fetchingPosts && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(5,5,5,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", backdropFilter: "blur(6px)" }}>
              <div style={{ width: "36px", height: "36px", border: "3px solid rgba(29,155,240,0.2)", borderTopColor: "rgb(29,155,240)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <p style={{ fontSize: "14px", fontWeight: 600, color: "rgb(169,181,174)" }}>{t("posts.loading")}</p>
            </div>
          )}
          <ServiceSelect
            profile={scanData}
            platform={platform}
            username={username}
            onUsernameChange={setUsername}
            onCheckout={async (items) => {
              setCart(items);
              posthog?.capture("checkout_started", { platform, cart_total: items.reduce((s, i) => s + i.price, 0), cart_items_count: items.length });
              setPostAssignments(undefined);

              const needsPosts = items.some((i) => ["x_likes", "x_retweets"].includes(i.service));
              if (needsPosts && username) {
                if (scanData && scanData.posts && scanData.posts.length > 0 && scanData.username === username) {
                  setStep("pickPosts");
                  return;
                }

                setFetchingPosts(true);
                try {
                  const endpoint = `/api/scraper-x?username=${encodeURIComponent(username)}`;
                  const res = await fetch(endpoint);
                  const data = await res.json();
                  if (data.posts && data.posts.length > 0) {
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
                      posts: data.posts,
                    });
                    setFetchingPosts(false);
                    setStep("pickPosts");
                    return;
                  }
                } catch (err) {
                  console.error("Failed to fetch tweets for pickPosts:", err);
                }
                setFetchingPosts(false);
                // Posts fetch failed or empty — block payment to prevent paying for likes/retweets without post assignments
                alert(t("posts.fetchFailed"));
                return;
              }
              setStep("payment");
            }}
            onBack={() => { posthog?.capture("back_clicked", { from_step: "shop" }); setStep("hero"); }}
          />
          </>
        );

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
            onBack={() => { setStep("shop"); }}
            onAddToCart={(item) => {
              const needsPostPick = ["x_likes", "x_retweets"].includes(item.service);
              // If upsell needs posts but we don't have them, refuse and alert
              if (needsPostPick && (!scanData || !scanData.posts || scanData.posts.length === 0)) {
                alert(t("posts.fetchFailed"));
                return;
              }
              setCart((prev) => [...prev, item]);
              posthog?.capture("upsell_added", { service: item.service, qty: item.qty, price: item.price });
              if (needsPostPick) {
                setStep("pickPosts");
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
          className={`flex flex-col items-center min-h-screen px-4 sm:px-6 text-center ${step === "hero" ? "justify-start pt-6" : "justify-center py-12"}`}
          style={{ opacity: 1 }}
        >
          {step !== "hero" && step !== "success" && (
            <button
              onClick={() => { setStep("hero"); setScanData(null); setUsername(""); setCart([]); setPostAssignments(undefined); setOrderId(undefined); try { sessionStorage.clear(); } catch {} }}
              style={{ background: "none", border: "none", cursor: "pointer", marginBottom: "8px", opacity: 0.7, transition: "opacity 0.2s" }}
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

export default function XHomePage() {
  return (
    <Suspense>
      <XHomePageInner />
    </Suspense>
  );
}
