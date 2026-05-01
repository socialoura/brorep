"use client";

import { Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "fr", flag: "🇫🇷", label: "FR" },
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "es", flag: "🇪🇸", label: "ES" },
  { code: "pt", flag: "🇧🇷", label: "PT" },
  { code: "de", flag: "🇩🇪", label: "DE" },
];

function FooterInner() {
  const { t, href, lang } = useTranslation();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function langHref(code: Lang) {
    const sp = new URLSearchParams(searchParams.toString());
    if (code === "fr") {
      sp.delete("lang");
    } else {
      sp.set("lang", code);
    }
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <footer style={{ background: "#050505", borderTop: "1px solid rgba(255,255,255,0.04)", padding: "24px 20px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
        {LANGS.map((l) => (
          <a
            key={l.code}
            href={langHref(l.code)}
            style={{
              fontSize: "12px",
              padding: "4px 8px",
              borderRadius: "6px",
              textDecoration: "none",
              background: lang === l.code ? "rgba(255,255,255,0.1)" : "transparent",
              color: lang === l.code ? "#fff" : "rgb(107, 117, 111)",
              border: lang === l.code ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {l.flag} {l.label}
          </a>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginBottom: "8px" }}>
        <a href={href("/cgv")} style={{ fontSize: "11px", color: "rgb(107, 117, 111)", textDecoration: "none" }}>{t("footer.cgv")}</a>
        <a href={href("/confidentialite")} style={{ fontSize: "11px", color: "rgb(107, 117, 111)", textDecoration: "none" }}>{t("footer.privacy")}</a>
        <a href={href("/mentions-legales")} style={{ fontSize: "11px", color: "rgb(107, 117, 111)", textDecoration: "none" }}>{t("footer.legal")}</a>
        <a href={href("/remboursement")} style={{ fontSize: "11px", color: "rgb(107, 117, 111)", textDecoration: "none" }}>{t("footer.refund")}</a>
      </div>
      <p style={{ margin: 0, fontSize: "10px", color: "rgb(80, 80, 80)" }}>© {new Date().getFullYear()} Fanovaly — {t("footer.rights")}</p>
    </footer>
  );
}

export default function Footer() {
  return (
    <Suspense>
      <FooterInner />
    </Suspense>
  );
}
