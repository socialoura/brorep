"use client";

import { useTranslation } from "@/lib/i18n";

interface Badge {
  iconPath: string;
  labelKey: string;
}

const BADGES: Badge[] = [
  {
    iconPath: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    labelKey: "guarantee.fast",
  },
  {
    iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    labelKey: "guarantee.secure",
  },
  {
    iconPath: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    labelKey: "guarantee.support",
  },
];

export default function GuaranteeBadges({
  accent = "#E1306C",
}: {
  accent?: string;
}) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "8px",
        width: "100%",
      }}
    >
      {BADGES.map((badge) => (
        <div
          key={badge.labelKey}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "999px",
            background: `${accent}0A`,
            border: `1px solid ${accent}22`,
            fontSize: "11px",
            fontWeight: 600,
            color: "rgb(169,181,174)",
            whiteSpace: "nowrap",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <path d={badge.iconPath} />
          </svg>
          {t(badge.labelKey)}
        </div>
      ))}
    </div>
  );
}
