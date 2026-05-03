import type { Metadata } from "next";
import { ARTICLES } from "@/lib/blog";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog Instagram — Conseils & Stratégies de croissance | Fanovaly",
  description: "Découvre nos guides gratuits pour gagner des followers Instagram, optimiser tes posts et booster ta visibilité sur les réseaux sociaux.",
  openGraph: {
    title: "Blog Instagram — Conseils & Stratégies | Fanovaly",
    description: "Guides gratuits pour booster ta croissance Instagram.",
    type: "website",
  },
  alternates: { canonical: "https://fanovaly.com/blog" },
};

export default function BlogIndex() {
  return (
    <div style={{ minHeight: "100vh", background: "#050505", fontFamily: "inherit" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "60px 20px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 800, color: "#fff" }}>
              Fan<span style={{ color: "#E1306C" }}>ovaly</span>
            </h1>
          </Link>
          <p style={{ margin: "16px 0 0", fontSize: "28px", fontWeight: 800, color: "#fff" }}>Blog</p>
          <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgb(169,181,174)", lineHeight: 1.5, maxWidth: "460px", marginLeft: "auto", marginRight: "auto" }}>
            Guides gratuits pour booster ta croissance Instagram
          </p>
        </div>

        {/* Article cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              style={{ textDecoration: "none" }}
            >
              <article
                className="pack-card"
                style={{
                  padding: "24px",
                  borderRadius: "16px",
                  border: "1px solid rgba(225,48,108,0.12)",
                  background: "#0e1512",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "32px", flexShrink: 0, lineHeight: 1 }}>{article.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                      {article.title}
                    </h2>
                    <p style={{ margin: "8px 0 0", fontSize: "13px", color: "rgb(169,181,174)", lineHeight: 1.5 }}>
                      {article.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
                      <span style={{ fontSize: "11px", color: "rgb(107,117,111)" }}>
                        {new Date(article.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      <span style={{ fontSize: "11px", color: "rgb(107,117,111)" }}>·</span>
                      <span style={{ fontSize: "11px", color: "rgb(107,117,111)" }}>
                        {article.readMin} min de lecture
                      </span>
                      <span style={{ fontSize: "11px", color: "rgb(107,117,111)" }}>·</span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {article.tags.slice(0, 2).map((tag) => (
                          <span key={tag} style={{
                            fontSize: "10px", padding: "2px 8px", borderRadius: "999px",
                            background: "rgba(225,48,108,0.08)", color: "#E1306C", fontWeight: 600,
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <Link
            href="/instagram"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "14px 32px", borderRadius: "14px",
              fontWeight: 700, fontSize: "15px", fontFamily: "inherit",
              color: "#fff", textDecoration: "none",
              background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)",
              boxShadow: "0 10px 30px rgba(225,48,108,0.25)",
            }}
          >
            🚀 Lancer ma croissance Instagram →
          </Link>
        </div>
      </div>
    </div>
  );
}
