"use client";

import { useTranslation } from "@/lib/i18n";

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "100%", height: "100%" }}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.18 8.18 0 004.77 1.52V6.84a4.84 4.84 0 01-1-.15z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "100%", height: "100%" }}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "rgb(105, 201, 208)" }}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

export default function PlatformSelect({ onSelect }: { onSelect?: (platform: string) => void }) {
  const { t } = useTranslation();
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
      {/* Icon */}
      <div
        style={{
          marginBottom: "20px",
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(105, 201, 208, 0.06)",
          border: "1px solid rgba(105, 201, 208, 0.18)",
          boxShadow: "0 0 24px rgba(79, 179, 186, 0.1)",
        }}
      >
        <TrendingUpIcon />
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
        {t("platform.title1")}{" "}
        <span
          style={{
            color: "rgb(105, 201, 208)",
            textShadow: "0 0 20px rgba(105, 201, 208, 0.3)",
          }}
        >
          {t("platform.title2")}
        </span>{" "}
        ?
      </h2>

      {/* Subtitle */}
      <p
        style={{
          fontSize: "14px",
          color: "rgb(169, 181, 174)",
          marginBottom: "40px",
          maxWidth: "320px",
        }}
      >
        {t("platform.subtitle")}
      </p>

      {/* Platform cards */}
      <div className="platform-cards">
        {/* TikTok card */}
        <PlatformCard
          name="TikTok"
          icon={<TikTokIcon />}
          popular
          popularLabel={t("platform.popular")}
          iconColor="rgb(232, 247, 237)"
          borderColor="rgba(105, 201, 208, 0.25)"
          glowShadow="0 0 20px rgba(79, 179, 186, 0.08)"
          onClick={() => onSelect?.("tiktok")}
        />

        {/* Instagram card */}
        <PlatformCard
          name="Instagram"
          icon={<InstagramIcon />}
          iconColor="rgb(169, 181, 174)"
          borderColor="rgba(105, 201, 208, 0.12)"
          glowShadow="none"
          onClick={() => onSelect?.("instagram")}
        />
      </div>

      {/* Footer text */}
      <p
        style={{
          fontSize: "11px",
          color: "rgba(255, 255, 255, 0.2)",
          marginTop: "32px",
        }}
      >
        {t("platform.footer")}
      </p>
    </div>
  );
}

function PlatformCard({
  name,
  icon,
  popular,
  popularLabel,
  iconColor,
  borderColor,
  glowShadow,
  onClick,
}: {
  name: string;
  icon: React.ReactNode;
  popular?: boolean;
  popularLabel?: string;
  iconColor: string;
  borderColor: string;
  glowShadow: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="platform-card"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        borderRadius: "16px",
        border: `1px solid ${borderColor}`,
        backgroundColor: "rgb(14, 21, 18)",
        boxShadow: glowShadow,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "0.3s",
        color: "inherit",
        fontFamily: "inherit",
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "rgba(105, 201, 208, 0.4)";
        el.style.boxShadow =
          "rgba(105, 201, 208, 0.4) 0px 0px 0px 1px inset, rgba(105, 201, 208, 0.15) 0px 0px 30px";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = borderColor;
        el.style.boxShadow = glowShadow;
      }}
    >
      {/* Popular badge */}
      {popular && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            padding: "2px 8px",
            borderRadius: "9999px",
            fontSize: "9px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            background: "rgba(105, 201, 208, 0.12)",
            color: "rgb(105, 201, 208)",
            border: "1px solid rgba(105, 201, 208, 0.2)",
          }}
        >
          {popularLabel || "Popular"}
        </div>
      )}

      {/* Icon */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "relative",
            zIndex: 10,
            color: iconColor,
            filter: popular
              ? "drop-shadow(0 0 8px rgba(105, 201, 208, 0.15))"
              : "none",
            transition: "0.3s",
            width: "56px",
            height: "56px",
          }}
        >
          {icon}
        </div>
        {popular && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              filter: "blur(20px)",
              opacity: 0.3,
              background: "rgba(105, 201, 208, 0.3)",
            }}
          />
        )}
      </div>

      {/* Name */}
      <span
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "rgb(255, 255, 255)",
          position: "relative",
          zIndex: 10,
          transition: "color 0.3s",
        }}
      >
        {name}
      </span>
    </button>
  );
}
