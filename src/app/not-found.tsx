export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
      <div style={{ textAlign: "center", padding: "32px 20px", maxWidth: "400px" }}>
        <p style={{ fontSize: "64px", fontWeight: 900, color: "rgb(0, 255, 76)", margin: "0 0 8px 0", lineHeight: 1 }}>404</p>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", margin: "0 0 8px 0" }}>Page introuvable</h1>
        <p style={{ fontSize: "14px", color: "rgb(107, 117, 111)", margin: "0 0 24px 0", lineHeight: 1.5 }}>
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 28px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, rgb(0, 180, 53), rgb(0, 255, 76))",
            color: "#000",
            fontSize: "14px",
            fontWeight: 700,
            textDecoration: "none",
            fontFamily: "inherit",
            boxShadow: "0 8px 24px rgba(0, 255, 76, 0.25)",
          }}
        >
          Retour à l&apos;accueil
        </a>
      </div>
    </div>
  );
}
