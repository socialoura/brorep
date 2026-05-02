"use client";

import { useState, useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";
import FanovalyLogo from "@/components/FanovalyLogo";
import SocialProof from "@/components/SocialProof";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import LiveOrderCounter from "@/components/LiveOrderCounter";
import ServiceSelect from "@/components/ServiceSelect";
import type { CartItem } from "@/components/ServiceSelect";
import PostPicker from "@/components/PostPicker";
import type { PostAssignment } from "@/components/PostPicker";
import CheckoutForm from "@/components/CheckoutForm";
import SuccessPage from "@/components/SuccessPage";
import type { ScanResult } from "@/components/ScanLoading";
import AnimatedBackground from "@/components/AnimatedBackground";
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

  const pink = "#E1306C";
  const pinkDim = "#C1358C";
  const progressPercent = (currentIndex / (PROGRESS_STEPS.length - 1)) * 100;

  return (
    <div style={{ width: "100%", maxWidth: "360px", marginBottom: "28px" }}>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
        <div style={{ position: "absolute", top: "11px", left: "20px", right: "20px", height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "1px" }} />
        <div style={{ position: "absolute", top: "11px", left: "20px", height: "2px", background: pink, borderRadius: "1px", width: `calc(${progressPercent}% - 40px * ${progressPercent / 100})`, transition: "width 0.4s ease" }} />

        {PROGRESS_STEPS.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={s.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%",
                background: done ? pink : active ? "rgba(225,48,108,0.15)" : "rgba(255,255,255,0.06)",
                border: active ? `2px solid ${pink}` : done ? `2px solid ${pink}` : "2px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: active ? "0 0 10px rgba(225,48,108,0.25)" : "none",
                transition: "all 0.3s",
              }}>
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span style={{ fontSize: "10px", fontWeight: 800, color: active ? pink : "rgb(107,117,111)" }}>{i + 1}</span>
                )}
              </div>
              <span style={{ marginTop: "6px", fontSize: "10px", fontWeight: 600, color: active ? pink : done ? pinkDim : "rgb(107,117,111)", whiteSpace: "nowrap" }}>
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

function InstagramHomePageInner() {
  const [step, setStep] = useState<Step>("hero");
  const [username, setUsername] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [postAssignments, setPostAssignments] = useState<PostAssignment[] | undefined>(undefined);
  const [orderId, setOrderId] = useState<number | undefined>();
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const posthog = usePostHog();
  const { t, lang, href, currency } = useTranslation();

  const platform = "instagram";

  // Track page view on mount
  useEffect(() => {
    posthog?.capture("page_viewed", { platform, lang, currency });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute minimum price across IG services (same as TikTok: followers, likes, views)
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [minPriceUsd, setMinPriceUsd] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (data.pricing && Array.isArray(data.pricing) && data.pricing.length > 0) {
          type PricingRow = { service: string; price: number; price_usd?: number };
          const igPacks = (data.pricing as PricingRow[]).filter((r) => ["followers", "likes", "views"].includes(r.service));
          if (igPacks.length > 0) {
            setMinPrice(Math.min(...igPacks.map((r) => Number(r.price))));
            setMinPriceUsd(Math.min(...igPacks.map((r) => Number(r.price_usd || r.price))));
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
      window.history.replaceState({}, "", "/instagram");
      setHydrated(true);
      return;
    }

    setStep(loadSession<Step>("ig_step", "hero"));
    setUsername(loadSession("ig_username", ""));
    setCart(loadSession("ig_cart", []));
    setPostAssignments(loadSession("ig_postAssignments", undefined));
    setHydrated(true);
  }, []);

  // Persist state changes
  useEffect(() => {
    if (hydrated) {
      saveSession("ig_step", step);
      window.scrollTo({ top: 0, behavior: "instant" });
      const vp = document.querySelector('meta[name="viewport"]');
      if (vp) {
        vp.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover");
      }
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      if (step === "shop") document.body.setAttribute("data-hide-chat", "");
      else document.body.removeAttribute("data-hide-chat");
      if (step === "pickPosts") posthog?.capture("posts_picker_shown", { platform });
    }
  }, [step, hydrated, posthog]);
  useEffect(() => { if (hydrated) saveSession("ig_username", username); }, [username, hydrated]);
  useEffect(() => { if (hydrated) saveSession("ig_cart", cart); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) saveSession("ig_postAssignments", postAssignments); }, [postAssignments, hydrated]);

  // If restored to a step with missing data, go back
  useEffect(() => {
    if (!hydrated) return;
    if (step === "pickPosts" && cart.length === 0) setStep("shop");
    if (step === "payment" && cart.length === 0) setStep("hero");
    if (step === "success" && !orderId && cart.length === 0) setStep("hero");
  }, [hydrated, step, cart.length, orderId]);

  function renderContent() {
    switch (step) {
      case "hero":
        return (
          <>
            {/* Fullscreen hero */}
            <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "32px 24px 40px", width: "100%", maxWidth: "672px", textAlign: "center", position: "relative" }}>
              {/* Logo + Title group */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <FanovalyLogo variant="red" />
                <h1 style={{ fontSize: "clamp(2.4rem, 9vw, 4.8rem)", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1, textTransform: "uppercase", margin: 0, color: "#fff" }}>
                  {t("ig.hero.title1")}
                  <br />
                  <span style={{ background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {t("ig.hero.title2")}
                    <svg width="0.65em" height="0.65em" viewBox="0 0 24 24" fill="url(#igGrad)" style={{ display: "inline", verticalAlign: "middle", marginLeft: "6px", filter: "drop-shadow(0 0 12px rgba(225,48,108,0.5))" }}>
                      <defs>
                        <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#F77737" />
                          <stop offset="50%" stopColor="#E1306C" />
                          <stop offset="100%" stopColor="#833AB4" />
                        </linearGradient>
                      </defs>
                      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                    </svg>
                  </span>
                </h1>
              </div>

              {/* Subtitle */}
              <p style={{ fontSize: "15px", color: "rgb(169,181,174)", maxWidth: "380px", lineHeight: 1.5, margin: 0 }}>
                {t("ig.hero.subtitle1")}
                <br />
                <span style={{ color: "rgb(107,117,111)" }}>{t("ig.hero.subtitle2")}</span>
              </p>

              {/* Price anchor + delivery */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "rgb(169,181,174)" }}>
                  {minPrice !== null && <>{t("hero.startingAt")} <span style={{ fontSize: "28px", fontWeight: 900, color: "#E1306C", marginLeft: "4px" }}>{fmtPrice(currency === "usd" ? (minPriceUsd ?? minPrice) : minPrice, currency)}</span></>}
                </p>
                <span style={{ fontSize: "11px", color: "rgb(107,117,111)" }}>
                  ⚡ {t("hero.delivery")}
                </span>
              </div>

              {/* Live order counter */}
              <LiveOrderCounter platform="instagram" />

              {/* Social proof */}
              <SocialProof />

              {/* CTA */}
              <button
                onClick={() => { posthog?.capture("cta_clicked", { platform: "instagram" }); setStep("shop"); }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "16px 36px",
                  borderRadius: "14px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "15px",
                  fontFamily: "inherit",
                  color: "#fff",
                  background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)",
                  boxShadow: "0 10px 40px rgba(225, 48, 108, 0.25)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                </svg>
                {t("ig.hero.cta")}
              </button>

              {/* Sticky mobile CTA */}
              <StickyMobileCTA
                platform="instagram"
                onClick={() => { posthog?.capture("cta_clicked", { source: "sticky_mobile", platform: "instagram" }); setStep("shop"); }}
              />

              {/* Operational status */}
              <div className="flex items-center gap-1.5" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ backgroundColor: "#E1306C", flexShrink: 0 }} />
                <span style={{ color: "#E1306C", fontWeight: 600 }}>{t("hero.operational")}</span>
                <span className="text-gray-500">({new Date().toLocaleDateString(LANG_LOCALE[lang], { day: "numeric", month: "long", year: "numeric" })})</span>
              </div>

              {/* Scroll hint arrow */}
              <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", animation: "bounce 2s ease-in-out infinite" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(107,117,111)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Below-the-fold */}
            <div style={{ width: "100%", maxWidth: "540px", padding: "48px 24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
              {/* How it works */}
              <div style={{ width: "100%" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#E1306C", marginBottom: "16px", textAlign: "center" }}>{t("howItWorks.title")}</p>
                <div className="grid-steps">
                  {[
                    { num: "1", title: t("ig.howItWorks.step1.title"), desc: t("ig.howItWorks.step1.desc") },
                    { num: "2", title: t("ig.howItWorks.step2.title"), desc: t("ig.howItWorks.step2.desc") },
                    { num: "3", title: t("ig.howItWorks.step3.title"), desc: t("ig.howItWorks.step3.desc") },
                  ].map((s) => (
                    <div key={s.num} style={{ padding: "20px 14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)", backgroundColor: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(225,48,108,0.1)", border: "1px solid rgba(225,48,108,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px auto", fontSize: "13px", fontWeight: 800, color: "#E1306C" }}>{s.num}</div>
                      <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 700, color: "#fff" }}>{s.title}</p>
                      <p style={{ margin: 0, fontSize: "11px", lineHeight: 1.5, color: "rgb(107, 117, 111)" }}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div style={{ width: "100%" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#E1306C", marginBottom: "16px", textAlign: "center" }}>{t("faq.title")}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { q: t("ig.faq.q1"), a: t("ig.faq.a1") },
                    { q: t("ig.faq.q2"), a: t("ig.faq.a2") },
                    { q: t("ig.faq.q3"), a: t("ig.faq.a3") },
                    { q: t("ig.faq.q4"), a: t("ig.faq.a4") },
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

              {/* Link to TikTok/YouTube */}
              <div style={{ marginTop: "32px" }}>
                <a href={href("/")} style={{ fontSize: "12px", color: "rgb(107, 117, 111)", textDecoration: "underline" }}>
                  {t("ig.linkToTikTok")}
                </a>
              </div>
            </div>
          </>
        );

      case "shop":
        return (
          <>
          {fetchingPosts && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(5,5,5,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", backdropFilter: "blur(6px)" }}>
              <div style={{ width: "36px", height: "36px", border: "3px solid rgba(225,48,108,0.2)", borderTopColor: "rgb(225,48,108)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <p style={{ fontSize: "14px", fontWeight: 600, color: "rgb(169,181,174)" }}>{t("posts.loading")}</p>
            </div>
          )}
          <ServiceSelect
            platform={platform}
            username={username}
            onUsernameChange={setUsername}
            onCheckout={async (items) => {
              setCart(items);
              posthog?.capture("checkout_started", { platform, cart_total: items.reduce((s, i) => s + i.price, 0), cart_items_count: items.length, has_combo: items.length > 1 });
              setPostAssignments(undefined);

              const needsPosts = items.some((i) => ["likes", "views"].includes(i.service));
              if (needsPosts && username) {
                // Posts are already being fetched in background since ServiceSelect called /api/scraper-instagram
                setFetchingPosts(true);
                try {
                  // Poll posts endpoint (already triggered by profile lookup) — fast poll, max ~6s
                  let posts: ScanResult["posts"] = [];
                  for (let i = 0; i < 12; i++) {
                    const pollRes = await fetch(`/api/scraper-instagram/posts?username=${encodeURIComponent(username)}`);
                    const pollData = await pollRes.json();
                    if (pollData.status === "done" && pollData.posts?.length > 0) {
                      posts = pollData.posts as ScanResult["posts"];
                      break;
                    }
                    if (pollData.status === "error") break;
                    await new Promise((r) => setTimeout(r, 500));
                  }

                  // If not found yet, trigger a fresh fetch and poll a bit more
                  if (posts.length === 0) {
                    await fetch(`/api/scraper-instagram?username=${encodeURIComponent(username)}`);
                    for (let i = 0; i < 10; i++) {
                      await new Promise((r) => setTimeout(r, 500));
                      const pollRes = await fetch(`/api/scraper-instagram/posts?username=${encodeURIComponent(username)}`);
                      const pollData = await pollRes.json();
                      if (pollData.status === "done" && pollData.posts?.length > 0) {
                        posts = pollData.posts as ScanResult["posts"];
                        break;
                      }
                      if (pollData.status === "error") break;
                    }
                  }

                  if (posts.length > 0) {
                    setFetchingPosts(false);
                    setStep("pickPosts");
                    setScanData({
                      username,
                      fullName: username,
                      avatarUrl: "",
                      followersCount: 0,
                      followingCount: 0,
                      likesCount: 0,
                      videoCount: 0,
                      bio: "",
                      verified: false,
                      posts,
                    });
                    return;
                  }
                } catch (err) {
                  console.error("Failed to fetch posts for pickPosts:", err);
                }
                setFetchingPosts(false);
                // Posts fetch failed or empty — block payment to prevent paying for likes/views without post assignments
                posthog?.capture("posts_fetch_failed", { platform, username });
                alert(t("posts.fetchFailed"));
                return;
              }
              setStep("payment");
            }}
            onBack={() => { posthog?.capture("back_clicked", { platform, from_step: "shop" }); setStep("hero"); }}
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
              posthog?.capture("posts_assigned", { platform, assignments_count: assignments.length });
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
            followersBefore={0}
            onSuccess={(id) => { posthog?.capture("payment_success", { platform, total: cart.reduce((s, i) => s + i.price, 0), order_id: id, currency, items: cart.map(i => ({ service: i.service, qty: i.qty })) }); setOrderId(id); setStep("success"); }}
            onBack={() => { posthog?.capture("back_to_packs_clicked", { platform }); setStep("shop"); }}
            onAddToCart={async (item) => {
              const needsPostPick = ["likes", "views"].includes(item.service);
              // Add to cart optimistically; we'll roll back if posts can't be fetched
              setCart((prev) => [...prev, item]);
              posthog?.capture("upsell_added", { service: item.service, qty: item.qty, price: item.price });
              if (!needsPostPick || !username) return;

              if (scanData && scanData.posts && scanData.posts.length > 0) {
                setStep("pickPosts");
                return;
              }

              setFetchingPosts(true);
              try {
                // Poll posts endpoint first (likely already cached from profile lookup)
                let posts: ScanResult["posts"] = [];
                for (let i = 0; i < 12; i++) {
                  const pollRes = await fetch(`/api/scraper-instagram/posts?username=${encodeURIComponent(username)}`);
                  const pollData = await pollRes.json();
                  if (pollData.status === "done" && pollData.posts?.length > 0) {
                    posts = pollData.posts as ScanResult["posts"];
                    break;
                  }
                  if (pollData.status === "error") break;
                  await new Promise((r) => setTimeout(r, 500));
                }

                // If not found, trigger a fresh fetch
                if (posts.length === 0) {
                  await fetch(`/api/scraper-instagram?username=${encodeURIComponent(username)}`);
                  for (let i = 0; i < 10; i++) {
                    await new Promise((r) => setTimeout(r, 500));
                    const pollRes = await fetch(`/api/scraper-instagram/posts?username=${encodeURIComponent(username)}`);
                    const pollData = await pollRes.json();
                    if (pollData.status === "done" && pollData.posts?.length > 0) {
                      posts = pollData.posts as ScanResult["posts"];
                      break;
                    }
                    if (pollData.status === "error") break;
                  }
                }

                if (posts.length > 0) {
                  setScanData({
                    username,
                    fullName: username,
                    avatarUrl: "",
                    followersCount: 0,
                    followingCount: 0,
                    likesCount: 0,
                    videoCount: 0,
                    bio: "",
                    verified: false,
                    posts,
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
            platform={platform}
            onReset={() => { setStep("hero"); setUsername(""); setCart([]); setPostAssignments(undefined); setScanData(null); setOrderId(undefined); try { sessionStorage.clear(); } catch {} }}
          />
        );

      default:
        return null;
    }
  }

  // scanData is needed for PostPicker — we store it as transient state
  const [scanData, setScanData] = useState<import("@/components/ScanLoading").ScanResult | null>(null);

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
              onClick={() => { setStep("hero"); setUsername(""); setCart([]); setPostAssignments(undefined); setScanData(null); setOrderId(undefined); try { sessionStorage.clear(); } catch {} }}
              style={{ background: "none", border: "none", cursor: "pointer", marginBottom: "8px", opacity: 0.7, transition: "opacity 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.7"; }}
              title="Retour à l'accueil"
            >
              <FanovalyLogo variant="red" />
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

export default function InstagramHomePage() {
  return (
    <Suspense>
      <InstagramHomePageInner />
    </Suspense>
  );
}
