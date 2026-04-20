"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

export interface YouTubeVideoInfo {
  videoId: string;
  title: string;
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  channelName: string;
  channelId: string;
  channelAvatar: string;
  subscriberCount: number;
  duration: number;
  publishDate: string;
  videoUrl: string;
}

export default function YouTubeUrlInput({
  onResult,
}: {
  onResult: (data: YouTubeVideoInfo) => void;
}) {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError(t("ytUrl.errorEmpty"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/youtube-video-info?url=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || t("ytUrl.errorNotFound"));
      } else {
        onResult(data as YouTubeVideoInfo);
      }
    } catch {
      setError(t("ytUrl.errorServer"));
    } finally {
      setLoading(false);
    }
  }

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
      {/* YouTube icon */}
      <div
        style={{
          marginBottom: "20px",
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255, 0, 0, 0.06)",
          border: "1px solid rgba(255, 0, 0, 0.18)",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
            fill="#FF0000"
          />
        </svg>
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
        {t("ytUrl.title1")}{" "}
        <span style={{ color: "#FF0000", textShadow: "0 0 20px rgba(255, 0, 0, 0.3)" }}>
          {t("ytUrl.title2")}
        </span>
      </h2>

      {/* Subtitle */}
      <p
        style={{
          fontSize: "14px",
          color: "rgb(169, 181, 174)",
          marginBottom: "24px",
          maxWidth: "360px",
        }}
      >
        {t("ytUrl.subtitle")}
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "420px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px",
            borderRadius: "14px",
            border: "1px solid rgba(255, 0, 0, 0.15)",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
          }}
        >
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: "16px",
              fontFamily: "inherit",
              padding: "10px 12px",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              cursor: loading ? "wait" : "pointer",
              fontWeight: 700,
              fontSize: "13px",
              fontFamily: "inherit",
              color: "#fff",
              background: "linear-gradient(135deg, #c00, #f00)",
              boxShadow: "0 4px 20px rgba(255, 0, 0, 0.2)",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  style={{ animation: "spin 1s linear infinite" }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="31.4"
                    strokeLinecap="round"
                  />
                </svg>
                {t("ytUrl.loading")}
              </span>
            ) : (
              t("ytUrl.analyze")
            )}
          </button>
        </div>

        {error && (
          <p style={{ fontSize: "13px", color: "#ef4444", margin: "4px 0 0 0", textAlign: "center" }}>
            {error}
          </p>
        )}
      </form>

      {/* Accepted formats */}
      <p
        style={{
          fontSize: "11px",
          color: "rgb(107, 117, 111)",
          marginTop: "16px",
          maxWidth: "360px",
        }}
      >
        {t("ytUrl.formats")}
      </p>
    </div>
  );
}
