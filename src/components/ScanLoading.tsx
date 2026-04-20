"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import posthog from "posthog-js";
import { useTranslation } from "@/lib/i18n";

function TikTokLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 256 290" fill="none">
      <path d="M189.72 104.42c18.68 13.39 41.58 21.27 66.28 21.27V78.06c-4.69 0-9.36-.49-13.93-1.46v37.46c-24.7 0-47.59-7.88-66.28-21.27v97.27c0 48.64-39.44 88.08-88.08 88.08-18.16 0-35.05-5.5-49.08-14.92C52.63 279.55 74.33 290 98.21 290c48.64 0 88.08-39.44 88.08-88.08v-97.5h3.43zm17.16-47.64c-9.53-10.41-15.78-23.72-17.16-38.42v-6.06h-13.18c3.32 18.86 14.48 35.06 30.34 44.48zM71.08 229.58c-5.56-7.28-8.57-16.2-8.57-25.38 0-23.14 18.76-41.9 41.91-41.9 4.32 0 8.58.66 12.67 1.95v-49.3c-4.62-.63-9.29-.88-13.94-.73v38.34c-4.09-1.29-8.35-1.94-12.67-1.94-23.15 0-41.91 18.76-41.91 41.9 0 16.38 9.39 30.57 23.08 37.5l-.57-.44z" fill="#FF004F" />
      <path d="M175.79 92.73c18.69 13.39 41.58 21.27 66.28 21.27V76.54c-13.81-2.95-26.08-10.17-35.35-20.47-15.86-9.41-27.02-25.62-30.34-44.48H142.1v190.3c-.09 23.07-18.82 41.75-41.91 41.75-13.59 0-25.67-6.49-33.33-16.55-13.69-6.93-23.08-21.12-23.08-37.5 0-23.14 18.76-41.9 41.91-41.9 4.44 0 8.72.69 12.73 1.96v-38.35c-47.83.98-86.27 40-86.27 88.07 0 24.02 9.61 45.8 25.19 61.69 14.03 9.42 30.92 14.92 49.08 14.92 48.64 0 88.08-39.44 88.08-88.08V92.73h3.29z" fill="#FFFFFF" />
      <path d="M242.07 76.54V66.3c-12.49.02-24.72-3.45-35.35-10.02 9.55 10.46 22.13 17.62 35.35 20.26zM176.38 11.59c-.32-1.83-.56-3.68-.72-5.53V0h-47.49v190.3c-.09 23.06-18.82 41.74-41.91 41.74-6.78 0-13.2-1.62-18.89-4.49 7.66 10.07 19.74 16.55 33.33 16.55 23.08 0 41.82-18.68 41.91-41.75V12.05l33.77-.46zM103.24 130.57V119.7c-4.29-.59-8.63-.89-12.97-.89C41.63 118.81 2.19 158.25 2.19 206.89c0 30.45 15.45 57.28 38.94 73.12-15.58-15.89-25.19-37.67-25.19-61.69 0-48.07 38.44-87.09 86.27-88.07l1.03.32z" fill="#00F2EA" />
    </svg>
  );
}

function InstagramLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-grad" x1="0" y1="24" x2="24" y2="0">
          <stop offset="0%" stopColor="#feda75" />
          <stop offset="25%" stopColor="#fa7e1e" />
          <stop offset="50%" stopColor="#d62976" />
          <stop offset="75%" stopColor="#962fbf" />
          <stop offset="100%" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="url(#ig-grad)" />
    </svg>
  );
}

function YouTubeLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000" />
    </svg>
  );
}

const steps = [
  {
    label: "L'IA se connecte au profil",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgb(0, 255, 76)" }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    ),
    iconDone: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgb(0, 255, 76)" }}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
  },
  {
    label: "Récupération des données",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5V19A9 3 0 0 0 21 19V5" />
        <path d="M3 12A9 3 0 0 0 21 12" />
      </svg>
    ),
  },
  {
    label: "L'IA analyse l'engagement",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
    ),
  },
  {
    label: "Calcul du potentiel viral",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
      </svg>
    ),
  },
];

export interface ScanResult {
  username: string;
  fullName: string;
  avatarUrl: string;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  videoCount: number;
  bio: string;
  verified: boolean;
  posts: Array<{
    id: string;
    imageUrl: string;
    caption: string;
    likesCount: number;
    commentsCount: number;
    viewsCount: number;
    isVideo: boolean;
  }>;
}

export default function ScanLoading({
  username,
  platform = "tiktok",
  onComplete,
  onError,
}: {
  username: string;
  platform?: string;
  onComplete?: (data: ScanResult) => void;
  onError?: () => void;
}) {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const apiDoneRef = useRef(false);
  const apiErrorRef = useRef(false);
  const resultRef = useRef<ScanResult | null>(null);

  const isTikTok = platform === "tiktok";
  const isYouTube = platform === "youtube";
  const platformName = isTikTok ? "TikTok" : isYouTube ? "YouTube" : "Instagram";

  const localSteps = [
    { label: t("scan.step1"), icon: steps[0].icon, iconDone: steps[0].iconDone },
    { label: t("scan.step2"), icon: steps[1].icon },
    { label: t("scan.step3"), icon: steps[2].icon },
    { label: t("scan.step4"), icon: steps[3].icon },
  ];

  // Poll Instagram posts (up to 6 attempts, 1s apart — faster)
  const pollInstagramPosts = useCallback(async (profileData: ScanResult) => {
    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        const res = await fetch(`/api/scraper-instagram/posts?username=${encodeURIComponent(username)}`);
        const body = await res.json();
        if (body.status === "done" && Array.isArray(body.posts) && body.posts.length > 0) {
          return { ...profileData, posts: body.posts } as ScanResult;
        }
        if (body.status === "error") break;
      } catch { /* retry */ }
    }
    return profileData;
  }, [username]);

  // Fetch API — no artificial minimum delay
  const doFetch = useCallback(async () => {
    setScanError(null);
    apiErrorRef.current = false;
    posthog.capture("scan_started", { platform, username });

    if (isTikTok || isYouTube) {
      const endpoint = isTikTok
        ? `/api/scraper-tiktok?username=${encodeURIComponent(username)}`
        : `/api/scraper-youtube?username=${encodeURIComponent(username)}`;
      try {
        const res = await fetch(endpoint, { signal: AbortSignal.timeout(15000) });
        const body = await res.json();
        if (res.ok) {
          resultRef.current = body as ScanResult;
          apiDoneRef.current = true;
          posthog.capture("scan_completed", { platform, username, followers_count: (body as ScanResult).followersCount });
        } else {
          apiErrorRef.current = true;
          const notFound = body.error === "User not found on TikTok" || body.error === "Chaîne YouTube introuvable";
          const reason = notFound ? t("scan.profileNotFound") : t("scan.scanError");
          posthog.capture("scan_failed", { platform, error_reason: reason });
          setScanError(reason);
        }
      } catch (err) {
        apiErrorRef.current = true;
        const reason = err instanceof Error && err.name === "TimeoutError" ? t("scan.timeout") : t("scan.serverError");
        posthog.capture("scan_failed", { platform, error_reason: reason });
        setScanError(reason);
      }
    } else {
      const endpoint = `/api/scraper-instagram?username=${encodeURIComponent(username)}`;
      try {
        const res = await fetch(endpoint, { signal: AbortSignal.timeout(15000) });
        const body = await res.json();
        if (res.ok) {
          const withPosts = await pollInstagramPosts(body as ScanResult);
          resultRef.current = withPosts;
          apiDoneRef.current = true;
          posthog.capture("scan_completed", { platform, username, followers_count: withPosts.followersCount });
        } else {
          apiErrorRef.current = true;
          const msg = body.error === "Ce compte est privé" ? t("scan.privateAccount") : body.error === "not_found" ? t("scan.profileNotFound") : t("scan.scanError");
          posthog.capture("scan_failed", { platform, error_reason: msg });
          setScanError(msg);
        }
      } catch (err) {
        apiErrorRef.current = true;
        const reason = err instanceof Error && err.name === "TimeoutError" ? t("scan.timeout") : t("scan.serverError");
        posthog.capture("scan_failed", { platform, error_reason: reason });
        setScanError(reason);
      }
    }
  }, [username, platform, isTikTok, isYouTube, pollInstagramPosts]);

  function handleRetry() {
    setScanError(null);
    apiDoneRef.current = false;
    apiErrorRef.current = false;
    resultRef.current = null;
    setActiveStep(0);
    setProgress(0);
    hasFetched.current = false;
  }

  useEffect(() => {
    if (hasFetched.current || !username) return;
    hasFetched.current = true;
    doFetch();
  }, [doFetch, username, scanError]);

  // Animate steps — fast when API done, normal pace otherwise
  useEffect(() => {
    if (scanError) return;
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, apiDoneRef.current ? 300 : 800);
    return () => clearInterval(stepInterval);
  }, [scanError]);

  // Progress bar — accelerate once API responds, then fire onComplete
  useEffect(() => {
    if (scanError) return;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (apiErrorRef.current) {
          clearInterval(progressInterval);
          return prev;
        }
        const done = apiDoneRef.current;
        const increment = done ? 8 : 2;
        const next = Math.min(prev + increment, done ? 100 : 85);
        if (next >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            if (resultRef.current) onCompleteRef.current?.(resultRef.current);
          }, 200);
          return 100;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(progressInterval);
  }, [scanError]);

  // Global timeout — if no result after 20s, show error
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!apiDoneRef.current && !apiErrorRef.current) {
        apiErrorRef.current = true;
        setScanError(t("scan.timeout"));
      }
    }, 20000);
    return () => clearTimeout(timeout);
  }, [scanError]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "380px",
          padding: "0 20px",
        }}
      >
        {/* Avatar with glow */}
        <div style={{ position: "relative", marginBottom: "32px" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "9999px",
              filter: "blur(24px)",
              background: "rgba(0, 180, 53, 0.35)",
              transform: "scale(1.8)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "-10px",
              borderRadius: "9999px",
              border: "1px solid rgba(0, 255, 76, 0.15)",
            }}
          />
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              zIndex: 10,
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              border: "1.5px solid rgba(0, 255, 76, 0.15)",
              backdropFilter: "blur(8px)",
            }}
          >
            {isTikTok ? <TikTokLogo /> : isYouTube ? <YouTubeLogo /> : <InstagramLogo />}
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "rgb(255, 255, 255)",
            }}
          >
            {t("scan.title")}{" "}
            <span style={{ color: "rgb(0, 255, 76)" }}>@{username}</span>
          </h2>
          <p
            style={{
              fontSize: "12px",
              color: "rgb(107, 117, 111)",
              marginTop: "4px",
            }}
          >
            {t("scan.subtitle", { platform: platformName })}
          </p>
        </div>

        {/* Steps card */}
        <div
          style={{
            width: "100%",
            borderRadius: "16px",
            overflow: "hidden",
            marginBottom: "24px",
            background:
              "linear-gradient(rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {localSteps.map((step, i) => {
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            const isPending = i > activeStep;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 20px",
                  borderBottom:
                    i < steps.length - 1
                      ? "1px solid rgba(255, 255, 255, 0.04)"
                      : "none",
                  background: isActive
                    ? "rgba(0, 255, 76, 0.08)"
                    : "transparent",
                  opacity: isPending ? 0.35 : 1,
                  transition: "all 0.5s ease",
                }}
              >
                {/* Icon box */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: isActive || isDone
                      ? "rgba(0, 255, 76, 0.08)"
                      : "rgba(255, 255, 255, 0.03)",
                    border: isActive || isDone
                      ? "1px solid rgba(0, 255, 76, 0.15)"
                      : "1px solid rgba(255, 255, 255, 0.06)",
                    transition: "all 0.5s ease",
                  }}
                >
                  <span
                    style={{
                      color:
                        isActive || isDone
                          ? "rgb(0, 255, 76)"
                          : "rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      animation: isActive ? "spin 1s linear infinite" : "none",
                    }}
                  >
                    {isDone ? step.iconDone || step.icon : step.icon}
                  </span>
                </div>

                {/* Label */}
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    flex: 1,
                    color:
                      isActive || isDone
                        ? "rgb(255, 255, 255)"
                        : "rgba(255, 255, 255, 0.2)",
                    transition: "color 0.5s ease",
                  }}
                >
                  {step.label}
                </span>

                {/* Dots for active step */}
                {isActive && (
                  <div style={{ display: "flex", gap: "3px" }}>
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "9999px",
                          background: "rgb(0, 255, 76)",
                          animation: `dot-bounce 1.2s ease-in-out ${d * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Checkmark for done */}
                {isDone && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgb(0, 255, 76)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{ width: "100%", marginBottom: "32px" }}>
          <div
            style={{
              width: "100%",
              height: "4px",
              borderRadius: "9999px",
              overflow: "hidden",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: "9999px",
                background:
                  "linear-gradient(90deg, rgb(0, 180, 53), rgb(0, 255, 76))",
                width: `${progress}%`,
                transition: "width 0.1s linear",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "8px",
            }}
          >
            <span style={{ fontSize: "10px", color: "rgb(107, 117, 111)" }}>
              {progress}% {t("scan.completed")}
            </span>
            <span
              style={{
                fontSize: "10px",
                color: "rgb(107, 117, 111)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {t("scan.secure")}
            </span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {scanError && (
        <div style={{ textAlign: "center", marginTop: "8px", maxWidth: "340px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "2px solid rgba(239, 68, 68, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 700, color: "#fff" }}>{scanError}</p>
          <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "rgb(107, 117, 111)" }}>{t("scan.errorCheck")}</p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            <button
              onClick={handleRetry}
              style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, rgb(0, 180, 53), rgb(0, 255, 76))", color: "#000", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              {t("scan.retry")}
            </button>
            {onError && (
              <button
                onClick={onError}
                style={{ padding: "10px 24px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgb(169, 181, 174)", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                {t("scan.changeUsername")}
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes dot-bounce {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
