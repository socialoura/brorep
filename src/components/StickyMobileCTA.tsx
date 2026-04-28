"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";

type Theme = {
  gradient: string;
  shadow: string;
  textColor: string;
};

const THEMES: Record<string, Theme> = {
  tiktok: {
    gradient: "linear-gradient(135deg, #69C9D0, #8DDFE5)",
    shadow: "0 -2px 20px rgba(105, 201, 208, 0.35)",
    textColor: "#000",
  },
  instagram: {
    gradient: "linear-gradient(135deg, #E1306C, #F77737)",
    shadow: "0 -2px 20px rgba(225, 48, 108, 0.35)",
    textColor: "#fff",
  },
  youtube: {
    gradient: "linear-gradient(135deg, #ff3232, #ff5050)",
    shadow: "0 -2px 20px rgba(255, 50, 50, 0.35)",
    textColor: "#fff",
  },
  spotify: {
    gradient: "linear-gradient(135deg, #1DB954, #1ed760)",
    shadow: "0 -2px 20px rgba(29, 185, 84, 0.35)",
    textColor: "#000",
  },
  x: {
    gradient: "linear-gradient(135deg, #000, #1a1a1a)",
    shadow: "0 -2px 20px rgba(0, 0, 0, 0.5)",
    textColor: "#fff",
  },
  twitch: {
    gradient: "linear-gradient(135deg, rgb(110,50,200), rgb(145,71,255))",
    shadow: "0 -2px 20px rgba(145, 71, 255, 0.35)",
    textColor: "#fff",
  },
};

/**
 * Sticky mobile CTA bar. Appears once the user has scrolled past the hero CTA
 * (default: 60% of viewport height). Mobile-only (<=640px).
 */
export default function StickyMobileCTA({
  onClick,
  platform = "tiktok",
  label,
  threshold = 0.6,
}: {
  onClick: () => void;
  platform?: string;
  label?: string;
  threshold?: number;
}) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      if (window.innerWidth > 640) {
        setVisible(false);
        return;
      }
      const trigger = window.innerHeight * threshold;
      setVisible(window.scrollY > trigger);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [threshold]);

  const theme = THEMES[platform] ?? THEMES.tiktok;
  const text = label ?? t("cta.launch");

  return (
    <div
      aria-hidden={!visible}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "10px 14px calc(10px + env(safe-area-inset-bottom))",
        background: "rgba(3, 8, 6, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        zIndex: 50,
        transform: visible ? "translateY(0)" : "translateY(100%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s ease, opacity 0.3s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
      className="sticky-mobile-cta"
    >
      <button
        onClick={onClick}
        style={{
          width: "100%",
          padding: "14px 20px",
          borderRadius: "14px",
          border: "none",
          cursor: "pointer",
          background: theme.gradient,
          color: theme.textColor,
          fontSize: "16px",
          fontWeight: 700,
          fontFamily: "inherit",
          boxShadow: theme.shadow,
        }}
      >
        {text}
      </button>
      <style>{`
        @media (min-width: 641px) {
          .sticky-mobile-cta { display: none !important; }
        }
      `}</style>
    </div>
  );
}
