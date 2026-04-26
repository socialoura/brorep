"use client";

import { useState, useEffect, Suspense } from "react";
import FanovalyLogo from "@/components/FanovalyLogo";
import SocialProof from "@/components/SocialProof";
import StatusBadge from "@/components/StatusBadge";
import AnimatedBackground from "@/components/AnimatedBackground";
import ServiceSelect from "@/components/ServiceSelect";
import type { CartItem } from "@/components/ServiceSelect";
import type { PostAssignment } from "@/components/PostPicker";
import CheckoutForm from "@/components/CheckoutForm";
import SuccessPage from "@/components/SuccessPage";
import YouTubeUrlInput from "@/components/YouTubeUrlInput";
import type { YouTubeVideoInfo } from "@/components/YouTubeUrlInput";
import YouTubeVideoPreview from "@/components/YouTubeVideoPreview";
import type { ScanResult } from "@/components/ScanLoading";
import { useTranslation } from "@/lib/i18n";

type Step = "hero" | "videoUrl" | "videoPreview" | "shop" | "payment" | "success";

function loadSession<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function saveSession(key: string, value: unknown) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

// Build a minimal ScanResult-compatible object from video info (for ServiceSelect)
function videoToScanResult(video: YouTubeVideoInfo): ScanResult {
  return {
    username: video.channelName,
    fullName: video.channelName,
    avatarUrl: video.channelAvatar || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
    followersCount: video.subscriberCount,
    followingCount: 0,
    likesCount: video.likeCount,
    videoCount: 1,
    bio: "",
    verified: false,
    posts: [{
      id: video.videoId,
      imageUrl: video.thumbnail,
      caption: video.title,
      likesCount: video.likeCount,
      commentsCount: video.commentCount,
      viewsCount: video.viewCount,
      isVideo: true,
    }],
  };
}

function YouTubeHomePageInner() {
  const [step, setStep] = useState<Step>("hero");
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [postAssignments, setPostAssignments] = useState<PostAssignment[] | undefined>(undefined);
  const [orderId, setOrderId] = useState<number | undefined>();
  const [hydrated, setHydrated] = useState(false);

  const { t, href } = useTranslation();
  const platform = "youtube";

  useEffect(() => {
    setStep(loadSession<Step>("yt_step", "hero"));
    setVideoInfo(loadSession("yt_videoInfo", null));
    setCart(loadSession("yt_cart", []));
    setPostAssignments(loadSession("yt_postAssignments", undefined));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveSession("yt_step", step);
      window.scrollTo({ top: 0, behavior: "instant" });
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      if (step !== "hero") document.body.setAttribute("data-hide-chat", "");
      else document.body.removeAttribute("data-hide-chat");
    }
  }, [step, hydrated]);
  useEffect(() => { if (hydrated) saveSession("yt_videoInfo", videoInfo); }, [videoInfo, hydrated]);
  useEffect(() => { if (hydrated) saveSession("yt_cart", cart); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) saveSession("yt_postAssignments", postAssignments); }, [postAssignments, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (step === "videoPreview" && !videoInfo) setStep("videoUrl");
    if (step === "shop" && !videoInfo) setStep("hero");
    if (step === "payment" && cart.length === 0) setStep("hero");
  }, [hydrated, step, videoInfo, cart.length]);

  // Username for order = channelName or videoId
  const username = videoInfo?.channelName || videoInfo?.videoId || "";

  function renderContent() {
    switch (step) {
      case "hero":
        return (
          <div className="flex flex-col items-center gap-8 px-6 w-full max-w-2xl text-center">
            <FanovalyLogo variant="red" />
            <StatusBadge variant="red" />
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white uppercase">
                {t("yt.hero.title1")}
              </h1>
              <h2
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] uppercase"
                style={{ color: "#FF0000", textShadow: "0 0 40px rgba(255,0,0,0.25)" }}
              >
                {t("yt.hero.title2")}
              </h2>
            </div>
            <p className="text-base sm:text-lg text-gray-400 max-w-md leading-relaxed">
              {t("yt.hero.subtitle1")}
              <br />
              <span className="text-gray-500">{t("yt.hero.subtitle2")}</span>
            </p>
            <div className="mt-2">
              <button
                onClick={() => setStep("videoUrl")}
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
                  background: "linear-gradient(135deg, #c00, #f00)",
                  boxShadow: "0 10px 40px rgba(255, 0, 0, 0.25)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                {t("yt.hero.cta")}
              </button>
            </div>
            <div className="mt-4 flex flex-col items-center gap-3">
              <SocialProof variant="youtube" />
              <div className="flex items-center gap-1.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-dot" />
                <span className="text-red-400 font-semibold">{t("yt.hero.morePercent")}</span>
                <span className="text-gray-500">{t("yt.hero.moreProfiles")}</span>
              </div>
            </div>

            {/* Comment ça marche */}
            <div style={{ width: "100%", maxWidth: "540px", marginTop: "48px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#FF0000", marginBottom: "16px" }}>{t("howItWorks.title")}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {[
                  { num: "1", title: t("yt.howItWorks.step1.title"), desc: t("yt.howItWorks.step1.desc") },
                  { num: "2", title: t("yt.howItWorks.step2.title"), desc: t("yt.howItWorks.step2.desc") },
                  { num: "3", title: t("yt.howItWorks.step3.title"), desc: t("yt.howItWorks.step3.desc") },
                ].map((s) => (
                  <div key={s.num} style={{ padding: "20px 14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)", backgroundColor: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255, 0, 0, 0.1)", border: "1px solid rgba(255, 0, 0, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px auto", fontSize: "13px", fontWeight: 800, color: "#FF0000" }}>{s.num}</div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 700, color: "#fff" }}>{s.title}</p>
                    <p style={{ margin: 0, fontSize: "11px", lineHeight: 1.5, color: "rgb(107, 117, 111)" }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div style={{ width: "100%", maxWidth: "540px", marginTop: "40px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#FF0000", marginBottom: "16px" }}>{t("faq.title")}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { q: t("yt.faq.q1"), a: t("yt.faq.a1") },
                  { q: t("yt.faq.q2"), a: t("yt.faq.a2") },
                  { q: t("yt.faq.q3"), a: t("yt.faq.a3") },
                  { q: t("yt.faq.q4"), a: t("yt.faq.a4") },
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

            {/* Link to TikTok/Instagram */}
            <div style={{ marginTop: "32px" }}>
              <a href={href("/")} style={{ fontSize: "12px", color: "rgb(107, 117, 111)", textDecoration: "underline" }}>
                {t("yt.linkToTikTok")}
              </a>
            </div>
          </div>
        );

      case "videoUrl":
        return (
          <YouTubeUrlInput
            onResult={(data) => {
              setVideoInfo(data);
              setStep("videoPreview");
            }}
          />
        );

      case "videoPreview":
        return videoInfo ? (
          <YouTubeVideoPreview
            video={videoInfo}
            onConfirm={() => setStep("shop")}
            onBack={() => { setVideoInfo(null); setStep("videoUrl"); }}
          />
        ) : null;

      case "shop":
        return videoInfo ? (
          <ServiceSelect
            profile={videoToScanResult(videoInfo)}
            platform={platform}
            onCheckout={(items) => {
              setCart(items);
              // Auto-assign the video for likes/views
              const needsVideo = items.some((c) => c.service === "yt_likes" || c.service === "yt_views");
              if (needsVideo) {
                setPostAssignments([{
                  postId: videoInfo.videoId,
                  postUrl: videoInfo.videoUrl,
                  imageUrl: videoInfo.thumbnail,
                  likes: items.some((c) => c.service === "yt_likes"),
                  views: items.some((c) => c.service === "yt_views"),
                }]);
              } else {
                setPostAssignments(undefined);
              }
              setStep("payment");
            }}
            onBack={() => setStep("videoPreview")}
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
            onSuccess={(id) => { setOrderId(id); setStep("success"); }}
            onBack={() => setStep("shop")}
          />
        );

      case "success":
        return (
          <SuccessPage
            username={username}
            orderId={orderId}
            cart={cart}
            platform={platform}
            onReset={() => { setStep("hero"); setVideoInfo(null); setCart([]); setPostAssignments(undefined); setOrderId(undefined); try { sessionStorage.clear(); } catch {} }}
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
          className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 text-center"
          style={{ opacity: 1 }}
        >
          <div key={step} className="step-fade-in" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function YouTubeHomePage() {
  return (
    <Suspense>
      <YouTubeHomePageInner />
    </Suspense>
  );
}
