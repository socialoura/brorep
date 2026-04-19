"use client";

import { useState } from "react";

interface OrderItem {
  id: number;
  username: string;
  platform: string;
  cart: { service: string; label: string; qty: number; price: number }[];
  total_cents: number;
  status: string;
  followers_before: number;
  created_at: string;
  delivered_at: string | null;
}

function fmtQty(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000) + "K";
  return String(n);
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "rgb(169,181,174)" },
  paid: { label: "Confirmée", color: "#ffb800" },
  processing: { label: "En cours", color: "rgb(0,210,106)" },
  delivered: { label: "Livrée", color: "rgb(0,255,76)" },
};

export default function OrdersPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<OrderItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const green = "rgb(0, 255, 76)";
  const greenDim = "rgb(0, 210, 106)";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid) return;
    setLoading(true);
    setError(null);
    setOrders(null);
    try {
      const res = await fetch("/api/orders-by-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setOrders(data.orders);
      }
    } catch {
      setError("Impossible de contacter le serveur");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050505", fontFamily: "inherit", color: "#e8f7ed" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "40px 20px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <h1 style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: 800, color: "#fff" }}>
              Fan<span style={{ color: green }}>ovaly</span>
            </h1>
          </a>
          <p style={{ margin: 0, fontSize: "13px", color: "rgb(107,117,111)" }}>Suivi de tes commandes</p>
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: "32px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "rgb(169,181,174)", marginBottom: "8px" }}>
            Entre ton adresse e-mail pour retrouver tes commandes
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(0,210,106,0.15)",
                backgroundColor: "rgba(0,180,53,0.04)",
                color: "#e8f7ed",
                fontSize: "14px",
                fontFamily: "inherit",
                outline: "none",
                minWidth: 0,
              }}
            />
            <button
              type="submit"
              disabled={!emailValid || loading}
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                border: "none",
                background: emailValid ? "linear-gradient(135deg, rgb(0,180,53), rgb(0,255,76))" : "rgba(255,255,255,0.06)",
                color: emailValid ? "#000" : "rgb(107,117,111)",
                fontWeight: 700,
                fontSize: "14px",
                fontFamily: "inherit",
                cursor: emailValid && !loading ? "pointer" : "not-allowed",
                opacity: loading ? 0.7 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "..." : "Rechercher"}
            </button>
          </div>
          {error && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "8px" }}>{error}</p>}
        </form>

        {/* Results */}
        {orders !== null && orders.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: "40px", marginBottom: "12px" }}>📭</p>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#fff" }}>Aucune commande trouvée</p>
            <p style={{ fontSize: "13px", color: "rgb(107,117,111)", marginTop: "4px" }}>
              Vérifie que c&apos;est bien l&apos;email utilisé lors du paiement.
            </p>
          </div>
        )}

        {orders !== null && orders.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "rgb(169,181,174)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px 0" }}>
              {orders.length} commande{orders.length > 1 ? "s" : ""} trouvée{orders.length > 1 ? "s" : ""}
            </p>

            {orders.map((order) => {
              const st = STATUS_MAP[order.status] || { label: order.status, color: "rgb(169,181,174)" };
              return (
                <a
                  key={order.id}
                  href={`/order/${order.id}`}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    background: "#0e1512",
                    border: "1px solid rgba(0,210,106,0.15)",
                    borderRadius: "16px",
                    padding: "20px",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,76,0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,210,106,0.15)"; }}
                >
                  {/* Top row: user + status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>@{order.username}</span>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 700,
                        backgroundColor: order.platform === "tiktok" ? "rgba(0,0,0,0.3)" : "rgba(225,48,108,0.1)",
                        color: order.platform === "tiktok" ? "#e8f7ed" : "rgb(225,48,108)",
                        border: order.platform === "tiktok" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(225,48,108,0.2)",
                        textTransform: "uppercase",
                      }}>
                        {order.platform}
                      </span>
                    </div>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: st.color,
                      backgroundColor: `${st.color}15`,
                      border: `1px solid ${st.color}30`,
                    }}>
                      {st.label}
                    </span>
                  </div>

                  {/* Cart items */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                    {Array.isArray(order.cart) && order.cart.map((item, i) => (
                      <span key={i} style={{
                        padding: "3px 10px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: "rgba(255,255,255,0.04)",
                        color: "rgb(169,181,174)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}>
                        {fmtQty(item.qty)} {item.label}
                      </span>
                    ))}
                  </div>

                  {/* Bottom row: total + date */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: green }}>
                      {(order.total_cents / 100).toFixed(2)}€
                    </span>
                    <span style={{ fontSize: "11px", color: "rgb(107,117,111)" }}>
                      {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <a href="/" style={{ fontSize: "13px", color: greenDim, textDecoration: "underline" }}>
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    </div>
  );
}
