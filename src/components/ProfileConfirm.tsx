"use client";

import type { ScanResult } from "@/components/ScanLoading";
import { useTranslation } from "@/lib/i18n";

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export default function ProfileConfirm({
  data,
  platform = "tiktok",
  onConfirm,
  onBack,
}: {
  data: ScanResult;
  platform?: string;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const platformName = platform === "tiktok" ? "TikTok" : platform === "youtube" ? "YouTube" : "Instagram";
  const green = "rgb(105, 201, 208)";

  const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    borderRadius: "16px",
    border: "1px solid rgba(105, 201, 208, 0.15)",
    backgroundColor: "rgba(79, 179, 186, 0.05)",
  };

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
      {/* Glow behind avatar */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <div
          style={{
            position: "absolute",
            inset: "-20px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(79, 179, 186, 0.15), transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <img
          src={data.avatarUrl}
          alt={data.username}
          style={{
            position: "relative",
            width: "88px",
            height: "88px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid rgba(105, 201, 208, 0.3)",
            boxShadow: "0 0 40px rgba(79, 179, 186, 0.2)",
          }}
        />
      </div>

      {/* Name */}
      <h2
        style={{
          fontSize: "22px",
          fontWeight: 700,
          color: "#fff",
          margin: "0 0 2px 0",
          lineHeight: 1.3,
        }}
      >
        {data.fullName}
      </h2>

      {/* Handle */}
      <p style={{ fontSize: "13px", color: "rgb(169, 181, 174)", margin: "0 0 4px 0" }}>
        @{data.username}
      </p>

      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 12px",
          borderRadius: "9999px",
          backgroundColor: "rgba(79, 179, 186, 0.1)",
          border: "1px solid rgba(105, 201, 208, 0.2)",
          marginBottom: "28px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: green,
            boxShadow: `0 0 6px ${green}`,
          }}
        />
        <span style={{ fontSize: "11px", fontWeight: 500, color: "rgb(169, 181, 174)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {t("profile.detected", { platform: platformName })}
        </span>
      </div>

      {/* Bio (if exists) */}
      {data.bio && (
        <p
          style={{
            fontSize: "13px",
            color: "rgb(140, 150, 145)",
            margin: "0 0 24px 0",
            maxWidth: "320px",
            lineHeight: 1.5,
          }}
        >
          {data.bio.length > 80 ? data.bio.slice(0, 80) + "..." : data.bio}
        </p>
      )}

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-card" style={cardStyle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "rgb(232, 247, 237)" }}>{fmt(data.followersCount)}</span>
          <span style={{ fontSize: "10px", color: "rgb(107, 117, 111)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("profile.followers")}</span>
        </div>

        <div className="stat-card" style={cardStyle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" /><rect x="2" y="6" width="14" height="12" rx="2" />
          </svg>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "rgb(232, 247, 237)" }}>{fmt(data.videoCount)}</span>
          <span style={{ fontSize: "10px", color: "rgb(107, 117, 111)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("profile.videos")}</span>
        </div>
      </div>

      {/* Question */}
      <p style={{ fontSize: "15px", color: "rgb(169, 181, 174)", margin: "0 0 20px 0" }}>
        {t("profile.isThisYou")}
      </p>

      {/* CTA */}
      <button
        onClick={onConfirm}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "14px 32px",
          borderRadius: "14px",
          border: "none",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "14px",
          fontFamily: "inherit",
          color: "#000",
          background: "linear-gradient(135deg, rgb(79, 179, 186), rgb(105, 201, 208))",
          boxShadow: "0 10px 30px rgba(105, 201, 208, 0.25)",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" />
        </svg>
        {t("profile.confirm")}
      </button>

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          marginTop: "12px",
          fontSize: "12px",
          color: "rgb(107, 117, 111)",
          background: "none",
          border: "none",
          cursor: "pointer",
          textDecoration: "underline",
          fontFamily: "inherit",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(169, 181, 174)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(107, 117, 111)"; }}
      >
        {t("profile.goBack")}
      </button>
    </div>
  );
}
