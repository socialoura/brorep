"use client";

import { useTranslation } from "@/lib/i18n";

export default function StatusBadge({ variant = "green" }: { variant?: "green" | "red" }) {
  const { t } = useTranslation();
  const isRed = variant === "red";
  const borderColor = isRed ? "rgba(255, 50, 50, 0.3)" : "rgba(0, 255, 76, 0.3)";
  const bgColor = isRed ? "rgba(200, 0, 0, 0.12)" : "rgba(0, 180, 53, 0.12)";
  const shadowColor = isRed ? "rgba(200, 0, 0, 0.08)" : "rgba(0, 180, 53, 0.08)";
  const dotColor = isRed ? "rgb(220, 40, 40)" : "rgb(0, 180, 53)";
  const dotShadow = isRed ? "rgba(220, 40, 40, 0.5)" : "rgba(0, 180, 53, 0.5)";
  return (
    <div
      style={{
        marginBottom: "0px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 20px",
        borderRadius: "9999px",
        border: `1px solid ${borderColor}`,
        backgroundColor: bgColor,
        boxShadow: `0 0 12px ${shadowColor}`,
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
            backgroundColor: dotColor,
            boxShadow: `0 0 6px ${dotShadow}`,
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
