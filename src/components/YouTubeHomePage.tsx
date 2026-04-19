"use client";

import { useState, useEffect } from "react";
import FanovalyLogo from "@/components/FanovalyLogo";
import SocialProof from "@/components/SocialProof";
import StatusBadge from "@/components/StatusBadge";
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

type Step = "hero" | "username" | "scanning" | "results" | "shop" | "pickPosts" | "payment" | "success";

function loadSession<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function saveSession(key: string, value: unknown) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

export default function YouTubeHomePage() {
  const [step, setStep] = useState<Step>("hero");
  const [username, setUsername] = useState<string>("");
  const [scanData, setScanData] = useState<ScanResult | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [postAssignments, setPostAssignments] = useState<PostAssignment[] | undefined>(undefined);
  const [orderId, setOrderId] = useState<number | undefined>();
  const [hydrated, setHydrated] = useState(false);

  const platform = "youtube";

  useEffect(() => {
    setStep(loadSession<Step>("yt_step", "hero"));
    setUsername(loadSession("yt_username", ""));
    setScanData(loadSession("yt_scanData", null));
    setCart(loadSession("yt_cart", []));
    setPostAssignments(loadSession("yt_postAssignments", undefined));
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) saveSession("yt_step", step); }, [step, hydrated]);
  useEffect(() => { if (hydrated) saveSession("yt_username", username); }, [username, hydrated]);
  useEffect(() => { if (hydrated) saveSession("yt_scanData", scanData); }, [scanData, hydrated]);
  useEffect(() => { if (hydrated) saveSession("yt_cart", cart); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) saveSession("yt_postAssignments", postAssignments); }, [postAssignments, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (step === "scanning" && !username) setStep("username");
    if (step === "results" && !scanData) setStep("hero");
    if (step === "shop" && !scanData) setStep("hero");
    if (step === "pickPosts" && cart.length === 0) setStep("shop");
    if (step === "payment" && cart.length === 0) setStep("hero");
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
                Boost ta chaîne
              </h1>
              <h2
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] uppercase"
                style={{ color: "#FF0000", textShadow: "0 0 40px rgba(255,0,0,0.25)" }}
              >
                YouTube
              </h2>
            </div>
            <p className="text-base sm:text-lg text-gray-400 max-w-md leading-relaxed">
              Abonnés, likes et vues pour ta chaîne YouTube
              <br />
              <span className="text-gray-500">Résultats visibles rapidement</span>
            </p>
            <div className="mt-2">
              <button
                onClick={() => setStep("username")}
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
                Analyser ma chaîne
              </button>
            </div>
            <div className="mt-4 flex flex-col items-center gap-3">
              <SocialProof />
            </div>

            {/* Comment ça marche */}
            <div style={{ width: "100%", maxWidth: "540px", marginTop: "48px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#FF0000", marginBottom: "16px" }}>Comment ça marche</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {[
                  { num: "1", title: "Entre ton @", desc: "Le nom de ta chaîne YouTube." },
                  { num: "2", title: "Choisis ton pack", desc: "Abonnés, likes ou vues — à toi de choisir." },
                  { num: "3", title: "Vois les résultats", desc: "Croissance visible directement sur ta chaîne." },
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
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#FF0000", marginBottom: "16px" }}>Questions fréquentes</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { q: "Est-ce que c'est sûr pour ma chaîne ?", a: "Oui. Notre méthode respecte les guidelines YouTube. Aucun mot de passe requis, aucun accès à ton compte Google." },
                  { q: "En combien de temps je vois des résultats ?", a: "Les premiers résultats sont visibles en quelques heures. Selon le pack choisi, tout est finalisé sous 24-72h." },
                  { q: "Et si je ne suis pas satisfait ?", a: "Notre équipe est joignable à support@fanovaly.com pour toute question ou ajustement." },
                  { q: "Les abonnés sont-ils durables ?", a: "On mise sur une croissance progressive et stable. En cas de variation, on compense gratuitement pendant 30 jours." },
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
              <a href="/" style={{ fontSize: "12px", color: "rgb(107, 117, 111)", textDecoration: "underline" }}>
                Tu cherches TikTok ou Instagram ? C&apos;est par ici
              </a>
            </div>
          </div>
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
            onConfirm={() => { setStep("shop"); }}
            onBack={() => { setScanData(null); setUsername(""); setStep("username"); }}
          />
        ) : null;

      case "shop":
        return scanData ? (
          <ServiceSelect
            profile={scanData}
            platform={platform}
            onCheckout={(items) => {
              setCart(items);
              const needsPosts = items.some((c) => c.service === "yt_likes" || c.service === "yt_views");
              if (needsPosts && scanData.posts.length > 0) {
                setStep("pickPosts");
              } else {
                setPostAssignments(undefined);
                setStep("payment");
              }
            }}
            onBack={() => { setStep("results"); }}
          />
        ) : null;

      case "pickPosts":
        return scanData ? (
          <PostPicker
            profile={scanData}
            platform="youtube"
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
            onSuccess={(id) => { setOrderId(id); setStep("success"); }}
            onBack={() => {
              const needsPosts = cart.some((c) => c.service === "yt_likes" || c.service === "yt_views");
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
