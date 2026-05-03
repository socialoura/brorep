import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Fanovaly — Analyse & croissance Instagram avec IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #050505 0%, #0a1a10 50%, #050505 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(0, 210, 106, 0.12)",
            filter: "blur(100px)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            fontSize: "72px",
            fontWeight: 900,
            color: "#fff",
            marginBottom: "24px",
            letterSpacing: "-2px",
          }}
        >
          Fan
          <span style={{ color: "rgb(0, 255, 76)" }}>ovaly</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: "28px",
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.7)",
            marginBottom: "40px",
            textAlign: "center",
          }}
        >
          Accélérez votre croissance Instagram avec l'IA
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: "16px" }}>
          {["Analyse gratuite", "Résultats rapides", "Paiement sécurisé"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "12px 28px",
                borderRadius: "40px",
                border: "1px solid rgba(0, 255, 76, 0.2)",
                background: "rgba(0, 255, 76, 0.06)",
                fontSize: "18px",
                fontWeight: 600,
                color: "rgb(0, 255, 76)",
              }}
            >
              {t}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "16px",
            color: "rgba(255, 255, 255, 0.25)",
            fontWeight: 500,
          }}
        >
          fanovaly.com
        </div>
      </div>
    ),
    { ...size }
  );
}
