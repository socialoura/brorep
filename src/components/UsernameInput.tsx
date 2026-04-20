"use client";

import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { useTranslation } from "@/lib/i18n";

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "16px", height: "16px", color: "rgb(0, 210, 106)" }}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.18 8.18 0 004.77 1.52V6.84a4.84 4.84 0 01-1-.15z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "16px", height: "16px", color: "rgb(0, 210, 106)" }}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "16px", height: "16px", color: "rgb(0, 210, 106)" }}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function UsernameInput({ platform = "tiktok", onSubmit }: { platform?: string; onSubmit?: (username: string) => void }) {
  const [username, setUsername] = useState("");
  const [focused, setFocused] = useState(false);
  const posthog = usePostHog();

  const { t } = useTranslation();
  const isTikTok = platform === "tiktok";
  const isYouTube = platform === "youtube";
  const platformName = isTikTok ? "TikTok" : isYouTube ? "YouTube" : "Instagram";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
        textAlign: "center",
      }}
    >
      {/* Platform icon box */}
      <div
        style={{
          marginBottom: "20px",
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0, 210, 106, 0.06)",
          border: "1px solid rgba(0, 210, 106, 0.18)",
        }}
      >
        {isTikTok ? <TikTokIcon /> : isYouTube ? <YouTubeIcon /> : <InstagramIcon />}
      </div>

      {/* Title */}
      <h2
        style={{
          fontSize: "clamp(20px, 4vw, 24px)",
          fontWeight: 700,
          color: "rgb(255, 255, 255)",
          marginBottom: "8px",
        }}
      >
        {t("username.title1")}{" "}
        <span
          style={{
            color: "rgb(0, 255, 76)",
            textShadow: "0 0 20px rgba(0, 255, 76, 0.3)",
          }}
        >
          @username
        </span>
      </h2>

      {/* Subtitle */}
      <p
        style={{
          fontSize: "14px",
          color: "rgb(169, 181, 174)",
          marginBottom: "24px",
          maxWidth: "320px",
        }}
      >
        {isYouTube ? t("username.subtitle.channel") : t("username.subtitle.profile")} {platformName}
      </p>

      {/* Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); if (username.trim()) { posthog?.capture("username_submitted", { platform }); onSubmit?.(username.trim()); } }}
        style={{
          width: "100%",
          maxWidth: "384px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 16px",
            borderRadius: "12px",
            backgroundColor: "rgb(14, 21, 18)",
            border: `1px solid ${focused ? "rgba(0, 255, 76, 0.4)" : "rgba(0, 255, 76, 0.12)"}`,
            transition: "border-color 0.3s",
          }}
        >
          <span style={{ fontSize: "14px", color: "rgb(107, 117, 111)" }}>@</span>
          <input
            type="text"
            placeholder={t("username.placeholder")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              flex: 1,
              background: "transparent",
              outline: "none",
              border: "none",
              fontSize: "14px",
              color: "rgb(255, 255, 255)",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: "12px",
            border: "none",
            fontWeight: 700,
            fontSize: "14px",
            color: "rgb(0, 0, 0)",
            background: "linear-gradient(135deg, rgb(0, 180, 53), rgb(0, 255, 76))",
            boxShadow: "0 8px 30px rgba(0, 255, 76, 0.25)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontFamily: "inherit",
            transition: "transform 0.15s",
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          {t("username.submit")}
          <ArrowRightIcon />
        </button>
      </form>

      {/* Privacy note */}
      <p
        style={{
          fontSize: "10px",
          color: "rgba(255, 255, 255, 0.15)",
          marginTop: "32px",
        }}
      >
        {t("username.privacy")}
      </p>
    </div>
  );
}
