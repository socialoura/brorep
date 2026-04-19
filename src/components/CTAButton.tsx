"use client";

import { useState } from "react";

export default function CTAButton({ onClick }: { onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 32px",
        borderRadius: "16px",
        border: "none",
        cursor: "pointer",
        background: "linear-gradient(135deg, rgb(0, 180, 53), rgb(0, 255, 76))",
        color: "rgb(0, 0, 0)",
        fontSize: "18px",
        fontWeight: 700,
        fontFamily: "inherit",
        boxShadow: hovered
          ? "0 14px 50px rgba(0, 255, 76, 0.4)"
          : "0 10px 40px rgba(0, 255, 76, 0.25)",
        transform: hovered ? "scale(1.04)" : "scale(1)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* Shine sweep */}
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "40%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
            animation: "cta-shine-move 3s ease-in-out infinite",
          }}
        />
      </span>

      <span style={{ position: "relative", zIndex: 1 }}>
        Lancer l&apos;IA →
      </span>

      <style>{`
        @keyframes cta-shine-move {
          0% { transform: translateX(-150%); }
          50% { transform: translateX(350%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </button>
  );
}
