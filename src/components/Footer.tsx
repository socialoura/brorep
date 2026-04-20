"use client";

import { Suspense } from "react";
import { useTranslation } from "@/lib/i18n";

function FooterInner() {
  const { t, href } = useTranslation();
  return (
    <footer style={{ background: "#050505", borderTop: "1px solid rgba(255,255,255,0.04)", padding: "24px 20px", textAlign: "center" }}>
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
