"use client";

import { useState, useEffect } from "react";
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

type Step = "hero" | "platform" | "username" | "scanning" | "results" | "shop" | "pickPosts" | "payment" | "success";

function loadSession<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function saveSession(key: string, value: unknown) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

export default function HomePage() {
  const [step, setStep] = useState<Step>("hero");
  const [platform, setPlatform] = useState<string>("tiktok");
  const [username, setUsername] = useState<string>("");
  const [scanData, setScanData] = useState<ScanResult | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [postAssignments, setPostAssignments] = useState<PostAssignment[] | undefined>(undefined);
  const [orderId, setOrderId] = useState<number | undefined>();
  const [hydrated, setHydrated] = useState(false);
  const posthog = usePostHog();

  // Restore from sessionStorage after hydration (client-only)
  useEffect(() => {
    setStep(loadSession<Step>("br_step", "hero"));
    setPlatform(loadSession("br_platform", "tiktok"));
    setUsername(loadSession("br_username", ""));
    setScanData(loadSession("br_scanData", null));
    setCart(loadSession("br_cart", []));
    setPostAssignments(loadSession("br_postAssignments", undefined));
    setHydrated(true);
  }, []);

  // Persist state changes to sessionStorage (only after hydration)
  useEffect(() => { if (hydrated) saveSession("br_step", step); }, [step, hydrated]);
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
                Analyse ton profil
              </h1>
              <h2
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] uppercase"
                style={{ color: "#22c55e", textShadow: "0 0 40px rgba(34,197,94,0.35)" }}
              >
                en 30 secondes
              </h2>
            </div>
            <p className="text-base sm:text-lg text-gray-400 max-w-md leading-relaxed">
              Découvre pourquoi ton compte ne décolle pas
              <br />
              <span className="text-gray-500">(et comment le corriger)</span>
            </p>
            <div className="mt-2">
              <CTAButton onClick={() => { posthog?.capture("cta_clicked"); setStep("platform"); }} />
            </div>
            <div className="mt-4 flex flex-col items-center gap-3">
              <SocialProof />
              <div className="flex items-center gap-1.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
                <span className="text-green-400 font-semibold">20% plus</span>
                <span className="text-gray-500">de profils analysés qu&apos;hier</span>
              </div>
            </div>

            {/* Comment ça marche */}
            <div style={{ width: "100%", maxWidth: "540px", marginTop: "48px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgb(0, 210, 106)", marginBottom: "16px" }}>Comment ça marche</p>
              <div className="grid-steps">
                {[
                  { num: "1", title: "Scan ton profil", desc: "Entre ton @ et on analyse tout en 30 secondes." },
                  { num: "2", title: "Choisis ta stratégie", desc: "On te propose un plan adapté à ton profil." },
                  { num: "3", title: "Vois les résultats", desc: "Croissance visible, directement sur ton compte." },
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
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgb(0, 210, 106)", marginBottom: "16px" }}>Questions fréquentes</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { q: "Est-ce que c'est sûr pour mon compte ?", a: "Oui. Notre approche respecte les algorithmes des plateformes. Aucun mot de passe requis, aucun accès à ton compte." },
                  { q: "En combien de temps je vois des résultats ?", a: "Les premiers résultats sont visibles en quelques minutes. Selon la stratégie choisie, tout est finalisé sous 24h." },
                  { q: "Et si je ne suis pas satisfait ?", a: "On s'engage à t'accompagner. Notre équipe est joignable à support@fanovaly.com pour toute question." },
                  { q: "Les résultats sont-ils durables ?", a: "On mise sur une croissance progressive et stable. En cas de variation, on ajuste gratuitement pendant 30 jours." },
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

            {/* Link to YouTube */}
            <div style={{ marginTop: "32px" }}>
              <a href="/youtube" style={{ fontSize: "12px", color: "rgb(107, 117, 111)", textDecoration: "underline" }}>
                Tu cherches YouTube ? C&apos;est par ici
              </a>
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
