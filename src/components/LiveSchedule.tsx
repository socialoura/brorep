"use client";

import { useState, useMemo } from "react";
import type { CartItem } from "@/components/ServiceSelect";
import type { ScanResult } from "@/components/ScanLoading";
import { useTranslation } from "@/lib/i18n";

function pad(n: number) { return n.toString().padStart(2, "0"); }

function nowPlusOneHour(): { date: string; time: string } {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 2);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export default function LiveSchedule({
  profile,
  cart,
  onConfirm,
  onBack,
}: {
  profile: ScanResult;
  cart: CartItem[];
  onConfirm: (liveStartAt: string) => void;
  onBack: () => void;
}) {
  const { t, lang } = useTranslation();
  const initial = useMemo(() => nowPlusOneHour(), []);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [error, setError] = useState<string | null>(null);

  const accent = "rgb(145, 71, 255)";
  const accentBg = "rgba(145, 71, 255, 0.05)";
  const accentBorder = "rgba(145, 71, 255, 0.18)";
  const accentBorderStrong = "rgba(145, 71, 255, 0.4)";
  const gradient = "linear-gradient(135deg, rgb(110, 50, 200), rgb(145, 71, 255))";

  // Min date = today
  const today = new Date();
  const minDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const viewersItem = cart.find((c) => c.service === "tw_live_viewers");

  function handleConfirm() {
    if (!date || !time) {
      setError(lang === "fr" ? "Sélectionne une date et une heure" : "Pick a date and time");
      return;
    }
    const iso = new Date(`${date}T${time}:00`);
    if (isNaN(iso.getTime())) {
      setError(lang === "fr" ? "Date/heure invalide" : "Invalid date/time");
      return;
    }
    if (iso.getTime() < Date.now() - 5 * 60 * 1000) {
      setError(lang === "fr" ? "La date doit être dans le futur" : "Date must be in the future");
      return;
    }
    setError(null);
    onConfirm(iso.toISOString());
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "440px", padding: "0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px", borderRadius: "12px", backgroundColor: accentBg, border: `1px solid ${accentBorder}`, marginBottom: "20px" }}>
        {profile.avatarUrl && (
          <img src={profile.avatarUrl} alt={profile.username} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${accentBorderStrong}` }} />
        )}
        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#fff" }}>@{profile.username}</p>
      </div>

      <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: "0 0 4px 0", textAlign: "center" }}>
        {lang === "fr" ? "Quand commence ton " : "When does your "}
        <span style={{ color: accent, textShadow: `0 0 20px rgba(145,71,255,0.3)` }}>live</span>
        {lang === "fr" ? " ?" : " start?"}
      </h2>
      <p style={{ fontSize: "13px", color: "rgb(169, 181, 174)", margin: "0 0 6px 0", textAlign: "center" }}>
        {lang === "fr"
          ? "Indique précisément quand tu lances ton stream"
          : "Tell us exactly when you start streaming"}
      </p>
      {viewersItem && (
        <p style={{ fontSize: "12px", color: "rgb(107, 117, 111)", margin: "0 0 24px 0", textAlign: "center" }}>
          {lang === "fr"
            ? `${viewersItem.qty} viewers seront livrés progressivement dès le début`
            : `${viewersItem.qty} viewers will be delivered progressively from the start`}
        </p>
      )}

      {/* Date & time inputs */}
      <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgb(169,181,174)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {lang === "fr" ? "Date" : "Date"}
          </label>
          <input
            type="date"
            value={date}
            min={minDate}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: "12px",
              border: `1px solid ${accentBorder}`, backgroundColor: accentBg,
              color: "#fff", fontSize: "14px", fontFamily: "inherit",
              outline: "none", colorScheme: "dark",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgb(169,181,174)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {lang === "fr" ? "Heure" : "Time"}
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: "12px",
              border: `1px solid ${accentBorder}`, backgroundColor: accentBg,
              color: "#fff", fontSize: "14px", fontFamily: "inherit",
              outline: "none", colorScheme: "dark",
            }}
          />
        </div>
      </div>

      {/* Live preview */}
      <div style={{
        width: "100%", padding: "12px 16px", borderRadius: "12px",
        background: "rgba(145,71,255,0.06)", border: `1px solid ${accentBorder}`,
        marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px",
      }}>
        <span style={{ fontSize: "18px" }}>📅</span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: "11px", color: "rgb(169,181,174)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
            {lang === "fr" ? "Début du live" : "Live starts"}
          </p>
          <p style={{ margin: "2px 0 0 0", fontSize: "13px", fontWeight: 600, color: "#fff" }}>
            {date && time ? new Date(`${date}T${time}:00`).toLocaleString(lang === "fr" ? "fr-FR" : "en-US", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            }) : "—"}
          </p>
        </div>
      </div>

      {error && (
        <p style={{ fontSize: "12px", color: "#ef4444", margin: "0 0 12px 0" }}>{error}</p>
      )}

      <button
        onClick={handleConfirm}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
          padding: "14px 32px", borderRadius: "14px", border: "none", cursor: "pointer",
          fontWeight: 700, fontSize: "14px", fontFamily: "inherit", color: "#fff",
          background: gradient, boxShadow: "0 10px 30px rgba(145,71,255,0.25)",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {lang === "fr" ? "Continuer vers le paiement" : "Continue to payment"}
      </button>

      <button
        onClick={onBack}
        style={{
          marginTop: "14px", fontSize: "12px", color: "rgb(107, 117, 111)",
          background: "none", border: "none", cursor: "pointer",
          textDecoration: "underline", fontFamily: "inherit",
        }}
      >
        {lang === "fr" ? "Modifier mon panier" : "Edit my cart"}
      </button>
    </div>
  );
}
