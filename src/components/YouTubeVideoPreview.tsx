"use client";

import type { YouTubeVideoInfo } from "@/components/YouTubeUrlInput";
import { useTranslation } from "@/lib/i18n";

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export default function YouTubeVideoPreview({
  video,
  onConfirm,
  onBack,
}: {
  video: YouTubeVideoInfo;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const red = "rgb(255, 0, 0)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "480px",
        padding: "0 16px",
      }}
    >
      {/* Video thumbnail */}
      <div style={{ position: "relative", marginBottom: "20px", width: "100%", maxWidth: "400px" }}>
        <div
          style={{
            position: "absolute",
            inset: "-20px",
            borderRadius: "20px",
            background: "radial-gradient(circle, rgba(255, 0, 0, 0.1), transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <img
          src={video.thumbnail}
          alt={video.title}
          style={{
            position: "relative",
            width: "100%",
            borderRadius: "14px",
            objectFit: "cover",
            border: "2px solid rgba(255, 0, 0, 0.2)",
            boxShadow: "0 0 40px rgba(255, 0, 0, 0.15)",
          }}
        />
        {/* Play icon overlay */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 0, 0, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </div>
      </div>

      {/* Video title */}
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#fff",
          margin: "0 0 4px 0",
          lineHeight: 1.3,
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        {video.title}
      </h2>

      {/* Channel name */}
      <p
        style={{
          fontSize: "13px",
          color: "rgb(169, 181, 174)",
          margin: "0 0 16px 0",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {video.channelAvatar && (
          <img
            src={video.channelAvatar}
            alt={video.channelName}
            style={{ width: "20px", height: "20px", borderRadius: "50%" }}
          />
        )}
        {video.channelName}
      </p>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        {[
          { label: t("ytPreview.views"), value: fmt(video.viewCount), icon: "👁" },
          ...(video.likeCount > 0
            ? [{ label: t("ytPreview.likes"), value: fmt(video.likeCount), icon: "♥" }]
            : []),
          ...(video.subscriberCount > 0
            ? [{ label: t("ytPreview.subscribers"), value: fmt(video.subscriberCount), icon: "👤" }]
            : [{ label: t("ytPreview.comments"), value: fmt(video.commentCount), icon: "💬" }]),
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 0, 0, 0.12)",
              backgroundColor: "rgba(255, 0, 0, 0.04)",
              textAlign: "center",
              minWidth: "80px",
            }}
          >
            <div style={{ fontSize: "11px", color: "rgb(107, 117, 111)", marginBottom: "2px" }}>
              {stat.icon} {stat.label}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: red }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation question */}
      <p style={{ fontSize: "14px", color: "rgb(169, 181, 174)", margin: "0 0 16px 0" }}>
        {t("ytPreview.isThisVideo")}
      </p>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "10px", width: "100%", maxWidth: "320px" }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: "12px 0",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            color: "rgb(169, 181, 174)",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {t("ytPreview.noChange")}
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1,
            padding: "12px 0",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #c00, #f00)",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
            boxShadow: "0 6px 25px rgba(255, 0, 0, 0.25)",
            transition: "all 0.2s",
          }}
        >
          {t("ytPreview.yesContinue")}
        </button>
      </div>
    </div>
  );
}
