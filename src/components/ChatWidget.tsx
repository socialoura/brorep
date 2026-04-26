"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

type WidgetStep = "idle" | "email" | "message" | "sending" | "done";

function getTheme(pathname: string) {
  if (pathname.startsWith("/spotify")) return {
    accent: "#1DB954", bg: "rgba(29,185,84,0.08)", border: "rgba(29,185,84,0.25)",
    gradient: "linear-gradient(135deg, #1DB954, #1ed760)", text: "#000",
    glow: "0 4px 20px rgba(29,185,84,0.3)",
  };
  if (pathname.startsWith("/x")) return {
    accent: "rgb(29,155,240)", bg: "rgba(29,155,240,0.08)", border: "rgba(29,155,240,0.25)",
    gradient: "linear-gradient(135deg, rgb(20,120,200), rgb(29,155,240))", text: "#fff",
    glow: "0 4px 20px rgba(29,155,240,0.3)",
  };
  if (pathname.startsWith("/twitch")) return {
    accent: "rgb(145,71,255)", bg: "rgba(145,71,255,0.08)", border: "rgba(145,71,255,0.25)",
    gradient: "linear-gradient(135deg, rgb(110,50,200), rgb(145,71,255))", text: "#fff",
    glow: "0 4px 20px rgba(145,71,255,0.3)",
  };
  if (pathname === "/" || pathname.startsWith("/tiktok")) return {
    accent: "rgb(105,201,208)", bg: "rgba(79,179,186,0.08)", border: "rgba(105,201,208,0.25)",
    gradient: "linear-gradient(135deg, rgb(79,179,186), rgb(105,201,208))", text: "#000",
    glow: "0 4px 20px rgba(105,201,208,0.3)",
  };
  // youtube or other
  return {
    accent: "rgb(105,201,208)", bg: "rgba(79,179,186,0.08)", border: "rgba(105,201,208,0.25)",
    gradient: "linear-gradient(135deg, rgb(79,179,186), rgb(105,201,208))", text: "#000",
    glow: "0 4px 20px rgba(105,201,208,0.3)",
  };
}

export default function ChatWidget() {
  const pathname = usePathname();
  const theme = getTheme(pathname);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  // Watch for data-hide-chat attribute on <body>
  const checkHidden = useCallback(() => {
    setHidden(document.body.hasAttribute("data-hide-chat"));
  }, []);

  useEffect(() => {
    checkHidden();
    const observer = new MutationObserver(checkHidden);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-hide-chat"] });
    return () => observer.disconnect();
  }, [checkHidden]);
  const [step, setStep] = useState<WidgetStep>("idle");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && step === "email") inputRef.current?.focus();
    if (open && step === "message") textareaRef.current?.focus();
  }, [open, step]);

  // Never show on admin pages
  if (pathname.startsWith("/admin")) return null;

  function handleOpen() {
    setOpen(true);
    if (step === "idle") setStep("email");
  }

  function handleClose() {
    setOpen(false);
  }

  function submitEmail() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email invalide");
      return;
    }
    setError("");
    setStep("message");
  }

  async function submitMessage() {
    if (!message.trim()) {
      setError("Écris un message");
      return;
    }
    setError("");
    setStep("sending");
    try {
      const res = await fetch("/api/chat-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message: message.trim() }),
      });
      if (!res.ok) throw new Error();
      setStep("done");
      setTimeout(() => {
        setOpen(false);
        setStep("idle");
        setEmail("");
        setMessage("");
      }, 2500);
    } catch {
      setError("Erreur, réessaie.");
      setStep("message");
    }
  }

  // FAB button
  const fab = (
    <button
      onClick={handleOpen}
      aria-label="Chat"
      style={{
        position: "fixed", bottom: "20px", right: "20px", zIndex: 9999,
        width: "40px", height: "40px", borderRadius: "50%", border: "none",
        background: theme.gradient, color: theme.text,
        boxShadow: theme.glow, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );

  if (hidden) return null;
  if (!open) return fab;

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        onClick={handleClose}
        style={{ position: "fixed", inset: 0, zIndex: 9998, background: "transparent" }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed", bottom: "20px", right: "20px", zIndex: 9999,
          width: "260px", maxHeight: "320px",
          borderRadius: "16px", overflow: "hidden",
          border: `1px solid ${theme.border}`,
          backgroundColor: "rgb(14,21,18)",
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), ${theme.glow}`,
          display: "flex", flexDirection: "column",
          animation: "chat-pop-in 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
          background: theme.gradient,
        }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: theme.text }}>💬 Fanovaly Chat</span>
          <button
            onClick={handleClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, fontSize: "16px", lineHeight: 1, padding: 0, fontFamily: "inherit" }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>

          {step === "email" && (
            <>
              <p style={{ margin: 0, fontSize: "13px", color: "rgb(169,181,174)", lineHeight: 1.5 }}>
                Salut ! Quel est ton email pour qu&apos;on puisse te répondre ?
              </p>
              <input
                ref={inputRef}
                type="email"
                placeholder="ton@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") submitEmail(); }}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: "10px",
                  border: error ? "1px solid #ef4444" : `1px solid ${theme.border}`,
                  backgroundColor: theme.bg, color: "rgb(232,247,237)",
                  fontSize: "13px", fontFamily: "inherit", outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {error && <p style={{ margin: 0, fontSize: "11px", color: "#ef4444" }}>{error}</p>}
              <button
                onClick={submitEmail}
                style={{
                  padding: "10px 0", borderRadius: "10px", border: "none",
                  background: theme.gradient, color: theme.text,
                  fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Continuer →
              </button>
            </>
          )}

          {step === "message" && (
            <>
              <p style={{ margin: 0, fontSize: "13px", color: "rgb(169,181,174)", lineHeight: 1.5 }}>
                Comment peut-on t&apos;aider ?
              </p>
              <textarea
                ref={textareaRef}
                placeholder="Ton message..."
                value={message}
                onChange={(e) => { setMessage(e.target.value); setError(""); }}
                rows={3}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: "10px",
                  border: error ? "1px solid #ef4444" : `1px solid ${theme.border}`,
                  backgroundColor: theme.bg, color: "rgb(232,247,237)",
                  fontSize: "13px", fontFamily: "inherit", outline: "none",
                  resize: "none", boxSizing: "border-box",
                }}
              />
              {error && <p style={{ margin: 0, fontSize: "11px", color: "#ef4444" }}>{error}</p>}
              <button
                onClick={submitMessage}
                style={{
                  padding: "10px 0", borderRadius: "10px", border: "none",
                  background: theme.gradient, color: theme.text,
                  fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Envoyer
              </button>
            </>
          )}

          {step === "sending" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0", gap: "8px" }}>
              <div style={{
                width: "18px", height: "18px", borderRadius: "50%",
                border: `2px solid ${theme.border}`, borderTopColor: theme.accent,
                animation: "spin 0.8s linear infinite",
              }} />
              <span style={{ fontSize: "13px", color: "rgb(169,181,174)" }}>Envoi en cours...</span>
            </div>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <p style={{ margin: 0, fontSize: "22px" }}>✅</p>
              <p style={{ margin: "8px 0 0", fontSize: "13px", color: theme.accent, fontWeight: 600 }}>
                Message envoyé !
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "11px", color: "rgb(107,117,111)" }}>
                On te répond très vite par email.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
