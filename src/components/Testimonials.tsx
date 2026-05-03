"use client";

import { useTranslation } from "@/lib/i18n";

interface Testimonial {
  name: string;
  handle: string;
  avatar: string;
  textKey: string;
  rating: number;
  followers: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Léa M.",
    handle: "@lea.fitness",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face",
    textKey: "testimonials.t1",
    rating: 5,
    followers: "+2.4k",
  },
  {
    name: "Thomas D.",
    handle: "@thomas.photo",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    textKey: "testimonials.t2",
    rating: 5,
    followers: "+5.1k",
  },
  {
    name: "Sofia R.",
    handle: "@sofia.beauty",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face",
    textKey: "testimonials.t3",
    rating: 5,
    followers: "+1.8k",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < count ? "#FFB800" : "rgba(255,255,255,0.1)"}
          stroke="none"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials({
  accent = "#E1306C",
}: {
  accent?: string;
}) {
  const { t } = useTranslation();

  return (
    <div style={{ width: "100%" }}>
      <p
        style={{
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: accent,
          marginBottom: "16px",
          textAlign: "center",
        }}
      >
        {t("testimonials.title")}
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {TESTIMONIALS.map((item) => (
          <div
            key={item.handle}
            style={{
              padding: "16px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.04)",
              backgroundColor: "rgba(255,255,255,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {/* Header: avatar + name + stars */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <img
                src={item.avatar}
                alt=""
                loading="lazy"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `2px solid ${accent}33`,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {item.name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    color: "rgb(107,117,111)",
                  }}
                >
                  {item.handle}
                </p>
              </div>
              <Stars count={item.rating} />
            </div>

            {/* Quote */}
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                lineHeight: 1.6,
                color: "rgb(169,181,174)",
                fontStyle: "italic",
              }}
            >
              &ldquo;{t(item.textKey)}&rdquo;
            </p>

            {/* Result badge */}
            <div
              style={{
                display: "inline-flex",
                alignSelf: "flex-start",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "999px",
                background: `${accent}14`,
                border: `1px solid ${accent}33`,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke={accent}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: accent,
                }}
              >
                {item.followers} followers
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
