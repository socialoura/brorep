"use client";

import { useState, useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";
import FanovalyLogo from "@/components/FanovalyLogo";
import SocialProof from "@/components/SocialProof";
import CTAButton from "@/components/CTAButton";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import LiveOrderCounter from "@/components/LiveOrderCounter";
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
import { useTranslation, fmtPrice, LANG_LOCALE } from "@/lib/i18n";

type Step = "hero" | "platform" | "username" | "scanning" | "results" | "shop" | "pickPosts" | "payment" | "success";

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

  const green = "#69C9D0";
  const greenDim = "#4fb3ba";
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
                background: done ? green : active ? "rgba(105,201,208,0.15)" : "rgba(255,255,255,0.06)",
                border: active ? `2px solid ${green}` : done ? `2px solid ${green}` : "2px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: active ? "0 0 10px rgba(105,201,208,0.25)" : "none",
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
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const posthog = usePostHog();
  const { t, lang, currency } = useTranslation();

  // Compute minimum price across all TikTok/IG services
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [minPriceUsd, setMinPriceUsd] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (data.pricing && Array.isArray(data.pricing) && data.pricing.length > 0) {
          type PricingRow = { service: string; price: number; price_usd?: number };
          const tiktokIg = (data.pricing as PricingRow[]).filter((r) => ["followers", "likes", "views"].includes(r.service));
          if (tiktokIg.length > 0) {
            setMinPrice(Math.min(...tiktokIg.map((r) => Number(r.price))));
            setMinPriceUsd(Math.min(...tiktokIg.map((r) => Number(r.price_usd || r.price))));
          }
        }
      })
      .catch(() => {});
  }, []);

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
      // Hide chat widget only during pack selection
      if (step === "shop") document.body.setAttribute("data-hide-chat", "");
      else document.body.removeAttribute("data-hide-chat");
    }
  }, [step, hydrated]);
  useEffect(() => { if (hydrated) saveSession("br_platform", platform); }, [platform, hydrated]);
  useEffect(() => { if (hydrated) saveSession("br_username", username); }, [username, hydrated]);
  useEffect(() => { if (hydrated) saveSession("br_scanData", scanData); }, [scanData, hydrated]);
  useEffect(() => { if (hydrated) saveSession("br_cart", cart); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) saveSession("br_postAssignments", postAssignments); }, [postAssignments, hydrated]);

  // If restored to a step with missing data, go back
  useEffect(() => {
    if (!hydrated) return;
    if (step === "scanning" && !username) setStep("shop");
    if (step === "results" && !scanData) setStep("shop");
    if (step === "pickPosts" && cart.length === 0) setStep("shop");
    if (step === "payment" && cart.length === 0) setStep("hero");
    if (step === "success" && !orderId && cart.length === 0) setStep("hero");
  }, [hydrated]);

  function renderContent() {
    switch (step) {
      case "hero":
        return (
          <>
            {/* Fullscreen hero — fills the viewport */}
            <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "32px 24px 40px", width: "100%", maxWidth: "672px", textAlign: "center", position: "relative" }}>
              {/* Logo + Title group */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <FanovalyLogo />
                <h1 style={{ fontSize: "clamp(2.4rem, 9vw, 4.8rem)", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1, textTransform: "uppercase", margin: 0, color: "#fff" }}>
                  {t("hero.title1")}
                  <br />
                  <span style={{ background: "linear-gradient(135deg, #69C9D0, #4FB3BA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    TikTok
                    <svg width="0.7em" height="0.7em" viewBox="0 0 24 24" fill="#69C9D0" style={{ display: "inline", verticalAlign: "middle", marginLeft: "4px", filter: "drop-shadow(0 0 12px rgba(105,201,208,0.5))" }}>
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.16 8.16 0 0 0 4.76 1.52V6.83a4.85 4.85 0 0 1-1-.14Z" />
                    </svg>
                  </span>
                </h1>
              </div>

              {/* Subtitle */}
              <p style={{ fontSize: "15px", color: "rgb(169,181,174)", maxWidth: "380px", lineHeight: 1.5, margin: 0 }}>
                {t("hero.subtitle1")}
                <br />
                <span style={{ color: "rgb(107,117,111)" }}>{t("hero.subtitle2")}</span>
              </p>

              {/* Price anchor + delivery */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "rgb(169,181,174)" }}>
                  {minPrice !== null && <>{t("hero.startingAt")} <span style={{ fontSize: "28px", fontWeight: 900, color: "#69C9D0", marginLeft: "4px" }}>{fmtPrice(currency === "usd" ? (minPriceUsd ?? minPrice) : minPrice, currency)}</span></>}
                </p>
                <span style={{ fontSize: "11px", color: "rgb(107,117,111)" }}>
                  ⚡ {t("hero.delivery")}
                </span>
              </div>

              {/* Live order counter (social proof booster) */}
              <LiveOrderCounter platform="tiktok" />

              {/* Social proof ABOVE CTA */}
              <SocialProof />

              {/* CTA */}
              <CTAButton onClick={() => { posthog?.capture("cta_clicked"); setPlatform("tiktok"); setStep("shop"); }} />

              {/* Sticky mobile CTA — visible after scroll, mobile only */}
              <StickyMobileCTA
                platform="tiktok"
                onClick={() => { posthog?.capture("cta_clicked", { source: "sticky_mobile" }); setPlatform("tiktok"); setStep("shop"); }}
              />

              {/* Operational status */}
              <div className="flex items-center gap-1.5" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ backgroundColor: "#69C9D0", flexShrink: 0 }} />
                <span style={{ color: "#69C9D0", fontWeight: 600 }}>{t("hero.operational")}</span>
                <span className="text-gray-500">({new Date().toLocaleDateString(LANG_LOCALE[lang], { day: "numeric", month: "long", year: "numeric" })})</span>
              </div>

              {/* Scroll hint arrow */}
              <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", animation: "bounce 2s ease-in-out infinite" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(107,117,111)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Below-the-fold — scroll to see */}
            <div style={{ width: "100%", maxWidth: "540px", padding: "48px 24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
              {/* How it works */}
              <div style={{ width: "100%" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#69C9D0", marginBottom: "16px", textAlign: "center" }}>{t("howItWorks.title")}</p>
                <div className="grid-steps">
                  {[
                    { num: "1", title: t("howItWorks.step1.title"), desc: t("howItWorks.step1.desc") },
                    { num: "2", title: t("howItWorks.step2.title"), desc: t("howItWorks.step2.desc") },
                    { num: "3", title: t("howItWorks.step3.title"), desc: t("howItWorks.step3.desc") },
                  ].map((s) => (
                    <div key={s.num} style={{ padding: "20px 14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)", backgroundColor: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(105,201,208,0.1)", border: "1px solid rgba(105,201,208,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px auto", fontSize: "13px", fontWeight: 800, color: "#69C9D0" }}>{s.num}</div>
                      <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 700, color: "#fff" }}>{s.title}</p>
                      <p style={{ margin: 0, fontSize: "11px", lineHeight: 1.5, color: "rgb(107, 117, 111)" }}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div style={{ width: "100%" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#69C9D0", marginBottom: "16px", textAlign: "center" }}>{t("faq.title")}</p>
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
          </>
        );

      case "platform":
        return (
          <PlatformSelect onSelect={(p) => { posthog?.capture("platform_selected", { platform: p }); setPlatform(p); setStep("shop"); }} />
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
        return (
          <>
          {fetchingPosts && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(5,5,5,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", backdropFilter: "blur(6px)" }}>
              <div style={{ width: "36px", height: "36px", border: "3px solid rgba(105,201,208,0.2)", borderTopColor: "rgb(105,201,208)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
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

              const needsPosts = items.some((i) => ["likes", "views"].includes(i.service));
              if (needsPosts && username) {
                // If we already have posts for this user, go straight to pickPosts
                if (scanData && scanData.posts && scanData.posts.length > 0 && scanData.username === username) {
                  setStep("pickPosts");
                  return;
                }

                // Fetch posts to let user pick which ones to boost
                setFetchingPosts(true);
                try {
                  const endpoint = platform === "instagram"
                    ? `/api/scraper-instagram?username=${encodeURIComponent(username)}`
                    : `/api/scraper-tiktok?username=${encodeURIComponent(username)}`;
                  const res = await fetch(endpoint);
                  const data = await res.json();

                  let fetchedPosts = data.posts && data.posts.length > 0 ? data.posts : null;

                  // Instagram returns posts asynchronously — poll until ready
                  if (!fetchedPosts && platform === "instagram") {
                    for (let i = 0; i < 15; i++) {
                      await new Promise((r) => setTimeout(r, 1000));
                      const pollRes = await fetch(`/api/scraper-instagram/posts?username=${encodeURIComponent(username)}`);
                      const pollData = await pollRes.json();
                      if (pollData.status === "done" && pollData.posts?.length > 0) {
                        fetchedPosts = pollData.posts;
                        break;
                      }
                      if (pollData.status === "error") break;
                    }
                  }

                  if (fetchedPosts && fetchedPosts.length > 0) {
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
                      posts: fetchedPosts,
                    });
                    setFetchingPosts(false);
                    setStep("pickPosts");
                    return;
                  }
                } catch (err) {
                  console.error("Failed to fetch posts for pickPosts:", err);
                }
                setFetchingPosts(false);
                // Posts fetch failed or empty — cannot proceed to payment without post assignments
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
            onAddToCart={async (item) => {
              const needsPostPick = ["likes", "views"].includes(item.service);
              // Add to cart optimistically; we'll roll back if posts can't be fetched
              setCart((prev) => [...prev, item]);
              posthog?.capture("upsell_added", { service: item.service, qty: item.qty, price: item.price });
              if (!needsPostPick || !username) return;

              // Already have posts → go straight to picker
              if (scanData && scanData.posts && scanData.posts.length > 0) {
                setStep("pickPosts");
                return;
              }

              // Fetch posts first
              setFetchingPosts(true);
              try {
                const endpoint = platform === "instagram"
                  ? `/api/scraper-instagram?username=${encodeURIComponent(username)}`
                  : `/api/scraper-tiktok?username=${encodeURIComponent(username)}`;
                const res = await fetch(endpoint);
                const data = await res.json();

                let fetchedPosts = data.posts && data.posts.length > 0 ? data.posts : null;

                // Instagram returns posts asynchronously — poll until ready
                if (!fetchedPosts && platform === "instagram") {
                  for (let i = 0; i < 15; i++) {
                    await new Promise((r) => setTimeout(r, 1000));
                    const pollRes = await fetch(`/api/scraper-instagram/posts?username=${encodeURIComponent(username)}`);
                    const pollData = await pollRes.json();
                    if (pollData.status === "done" && pollData.posts?.length > 0) {
                      fetchedPosts = pollData.posts;
                      break;
                    }
                    if (pollData.status === "error") break;
                  }
                }

                if (fetchedPosts && fetchedPosts.length > 0) {
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
                    posts: fetchedPosts,
                  });
                  setFetchingPosts(false);
                  setStep("pickPosts");
                  return;
                }
              } catch (err) {
                console.error("Failed to fetch posts for upsell pickPosts:", err);
              }
              setFetchingPosts(false);
              // Posts fetch failed — roll back cart addition and alert
              setCart((prev) => {
                const idx = prev.findIndex((c) => c.service === item.service && c.qty === item.qty && c.price === item.price);
                if (idx === -1) return prev;
                const copy = [...prev];
                copy.splice(idx, 1);
                return copy;
              });
              alert(t("posts.fetchFailed"));
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
          {/* Back-to-home logo on non-hero steps */}
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

export default function HomePage() {
  return (
    <Suspense>
      <HomePageInner />
    </Suspense>
  );
}
