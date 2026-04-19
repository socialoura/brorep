import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Fanovaly",
};

export default function MentionsLegales() {
  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#e8f7ed", fontFamily: "inherit" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "60px 20px" }}>
        <a href="/" style={{ fontSize: "13px", color: "rgb(0, 210, 106)", textDecoration: "none", marginBottom: "24px", display: "inline-block" }}>← Retour à l'accueil</a>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: "0 0 32px 0" }}>Mentions légales</h1>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>Éditeur du site</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Le site <strong style={{ color: "#fff" }}>fanovaly.com</strong> est édité par Fanovaly.<br />
            Email : <a href="mailto:support@fanovaly.com" style={{ color: "rgb(0, 210, 106)" }}>support@fanovaly.com</a><br />
            Directeur de la publication : Fanovaly.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>Hébergeur</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Vercel Inc.<br />
            440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
            Site : <a href="https://vercel.com" style={{ color: "rgb(0, 210, 106)" }} target="_blank" rel="noopener noreferrer">vercel.com</a>
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>Propriété intellectuelle</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            L'ensemble du contenu du site (textes, images, logo, code) est la propriété exclusive de Fanovaly ou de ses partenaires. Toute reproduction, représentation ou diffusion, en tout ou partie, sans autorisation écrite préalable est interdite.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>Responsabilité</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Fanovaly s'efforce de fournir des informations exactes et à jour. Cependant, nous ne pouvons garantir l'exactitude, la complétude ou l'actualité des informations diffusées. L'utilisation du site se fait sous la responsabilité de l'utilisateur.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>Contact</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Pour toute question, contactez-nous à <a href="mailto:support@fanovaly.com" style={{ color: "rgb(0, 210, 106)" }}>support@fanovaly.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
