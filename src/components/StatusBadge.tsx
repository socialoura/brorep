"use client";

import { useTranslation } from "@/lib/i18n";

export default function StatusBadge() {
  const { t } = useTranslation();
  return (
    <div
      style={{
        marginBottom: "0px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 20px",
        borderRadius: "9999px",
        border: "1px solid rgba(0, 255, 76, 0.3)",
        backgroundColor: "rgba(0, 180, 53, 0.12)",
        boxShadow: "0 0 12px rgba(0, 180, 53, 0.08)",
        position: "relative",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Subtle shine overlay */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
          animation: "badge-shine 4s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Dot + label */}
      <span
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "9999px",
            backgroundColor: "rgb(0, 180, 53)",
            boxShadow: "0 0 6px rgba(0, 180, 53, 0.5)",
            animation: "badge-dot-pulse 2s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgb(169, 181, 174)",
          }}
        >
          {t("status.aiRunning")}
        </span>
      </span>

      <style>{`
        @keyframes badge-shine {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes badge-dot-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
