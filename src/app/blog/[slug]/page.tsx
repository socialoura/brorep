import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ARTICLES, getArticleBySlug } from "@/lib/blog";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article non trouvé" };
  return {
    title: `${article.title} | Fanovaly`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
    },
    alternates: { canonical: `https://fanovaly.com/blog/${article.slug}` },
  };
}

function renderBody(body: string) {
  // Simple markdown-like rendering: **bold**, \n for line breaks
  const parts = body.split("\n\n");
  return parts.map((paragraph, i) => {
    // Handle bullet points
    if (paragraph.includes("\n•") || paragraph.startsWith("•")) {
      const lines = paragraph.split("\n");
      return (
        <div key={i} style={{ marginBottom: "16px" }}>
          {lines.map((line, j) => {
            if (line.startsWith("•")) {
              const content = line.slice(2);
              return (
                <p key={j} style={{ margin: "6px 0", paddingLeft: "16px", fontSize: "15px", color: "rgb(200,210,204)", lineHeight: 1.7 }}>
                  <span style={{ color: "#E1306C", marginLeft: "-16px", marginRight: "8px" }}>•</span>
                  <span dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff">$1</strong>') }} />
                </p>
              );
            }
            // Numbered list
            if (/^\d+\.\s/.test(line)) {
              return (
                <p key={j} style={{ margin: "6px 0", paddingLeft: "16px", fontSize: "15px", color: "rgb(200,210,204)", lineHeight: 1.7 }}>
                  <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff">$1</strong>') }} />
                </p>
              );
            }
            return (
              <p key={j} style={{ margin: "6px 0", fontSize: "15px", color: "rgb(200,210,204)", lineHeight: 1.7 }}>
                <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff">$1</strong>') }} />
              </p>
            );
          })}
        </div>
      );
    }
    return (
      <p key={i} style={{ margin: "0 0 16px", fontSize: "15px", color: "rgb(200,210,204)", lineHeight: 1.7 }}>
        <span dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff">$1</strong>') }} />
      </p>
    );
  });
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    author: { "@type": "Organization", name: "Fanovaly" },
    publisher: { "@type": "Organization", name: "Fanovaly", url: "https://fanovaly.com" },
    mainEntityOfPage: `https://fanovaly.com/blog/${article.slug}`,
  };

  // Table of contents from sections
  const toc = article.sections.map((s, i) => ({ id: `section-${i}`, title: s.heading }));

  return (
    <div style={{ minHeight: "100vh", background: "#050505", fontFamily: "inherit" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px", fontSize: "12px" }}>
          <Link href="/" style={{ color: "rgb(107,117,111)", textDecoration: "none" }}>Fanovaly</Link>
          <span style={{ color: "rgb(60,60,60)" }}>/</span>
          <Link href="/blog" style={{ color: "rgb(107,117,111)", textDecoration: "none" }}>Blog</Link>
          <span style={{ color: "rgb(60,60,60)" }}>/</span>
          <span style={{ color: "rgb(169,181,174)" }}>{article.title.slice(0, 40)}…</span>
        </div>

        {/* Article header */}
        <header style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {article.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: "10px", padding: "3px 10px", borderRadius: "999px",
                background: "rgba(225,48,108,0.1)", color: "#E1306C", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                {tag}
              </span>
            ))}
          </div>
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
            {article.emoji} {article.title}
          </h1>
          <p style={{ margin: "16px 0 0", fontSize: "15px", color: "rgb(169,181,174)", lineHeight: 1.5 }}>
            {article.description}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "16px" }}>
            <span style={{ fontSize: "12px", color: "rgb(107,117,111)" }}>
              {new Date(article.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span style={{ fontSize: "12px", color: "rgb(60,60,60)" }}>·</span>
            <span style={{ fontSize: "12px", color: "rgb(107,117,111)" }}>{article.readMin} min de lecture</span>
          </div>
        </header>

        {/* Table of contents */}
        <nav style={{
          marginBottom: "40px", padding: "20px",
          borderRadius: "14px", border: "1px solid rgba(225,48,108,0.12)",
          background: "rgba(225,48,108,0.02)",
        }}>
          <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: 700, color: "#E1306C", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Sommaire
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {toc.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                style={{ fontSize: "13px", color: "rgb(169,181,174)", textDecoration: "none", lineHeight: 1.4 }}
              >
                {i + 1}. {item.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Article body */}
        <div>
          {article.sections.map((section, i) => (
            <section key={i} id={`section-${i}`} style={{ marginBottom: "40px" }}>
              <h2 style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                {section.heading}
              </h2>
              {renderBody(section.body)}
            </section>
          ))}
        </div>

        {/* CTA card */}
        <div style={{
          marginTop: "48px", padding: "32px 24px", borderRadius: "16px",
          border: "1px solid rgba(225,48,108,0.2)",
          background: "linear-gradient(135deg, rgba(225,48,108,0.06), rgba(131,58,180,0.03))",
          textAlign: "center",
        }}>
          <p style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 800, color: "#fff" }}>
            Prêt à booster ton Instagram ?
          </p>
          <p style={{ margin: "0 0 20px", fontSize: "14px", color: "rgb(169,181,174)" }}>
            Rejoins les milliers de créateurs qui font confiance à Fanovaly
          </p>
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
            🚀 Lancer ma croissance →
          </Link>
        </div>

        {/* Back to blog */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link href="/blog" style={{ fontSize: "13px", color: "rgb(169,181,174)", textDecoration: "underline" }}>
            ← Retour au blog
          </Link>
        </div>
      </div>

      {/* Schema.org Article structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
    </div>
  );
}
