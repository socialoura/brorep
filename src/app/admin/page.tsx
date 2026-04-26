"use client";

import React, { useState, useEffect, useCallback } from "react";

type Tab = "analytics" | "orders" | "pricing" | "combos" | "upsells" | "smm";

interface SmmConfigItem {
  id: number;
  platform: string;
  service: string;
  bulkfollows_service_id: number;
  enabled: boolean;
}

interface SmmData {
  config: SmmConfigItem[];
  settings: Record<string, string>;
  balance: { balance?: string; currency?: string } | null;
}

const CURRENCY_SYMBOLS: Record<string, string> = { eur: "\u20AC", usd: "$", gbp: "\u00A3", cad: "C$", nzd: "NZ$", chf: "CHF" };

interface Order {
  id: number;
  stripe_payment_intent_id: string;
  email: string;
  username: string;
  platform: string;
  cart: { service: string; label: string; qty: number; price: number; liveStartAt?: string }[];
  post_assignments: unknown;
  total_cents: number;
  cost_cents: number;
  currency: string;
  email_order_num: number | null;
  email_order_total: number | null;
  smm_orders: { service: string; qty: number; bulkfollows_order_id?: number; error?: string }[];
  status: string;
  created_at: string;
}

interface PricingItem {
  id: number;
  service: string;
  qty: number;
  price: number;
  price_usd: number;
  price_gbp: number;
  price_cad: number;
  price_nzd: number;
  price_chf: number;
  active: boolean;
}

interface ComboItem {
  service: string;
  qty: number;
}

interface ComboPack {
  id: number;
  name: string;
  name_en?: string;
  items: ComboItem[];
  discount_percent: number;
  active: boolean;
}

interface Analytics {
  totalOrders: number;
  byStatus: { status: string; count: string }[];
  totalRevenueCents: number;
  totalCostCents: number;
  ordersToday: number;
  revenueTodayCents: number;
  costTodayCents: number;
  last7Days: { date: string; count: string; revenue: string }[];
  topServices: { service: string; count: string; revenue_cents: string }[];
  platforms: { platform: string; count: string }[];
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("analytics");
  const [loading, setLoading] = useState(false);

  // Data
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPages, setOrdersPages] = useState(1);
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editPriceUsd, setEditPriceUsd] = useState("");
  const [editPriceGbp, setEditPriceGbp] = useState("");
  const [editPriceCad, setEditPriceCad] = useState("");
  const [editPriceNzd, setEditPriceNzd] = useState("");
  const [editPriceChf, setEditPriceChf] = useState("");
  const [newPack, setNewPack] = useState({ service: "followers", qty: "", price: "", priceUsd: "", priceGbp: "", priceCad: "", priceNzd: "", priceChf: "" });
  const [combos, setCombos] = useState<ComboPack[]>([]);
  const [newCombo, setNewCombo] = useState({ name: "", nameEn: "", discount: "20", items: [{ service: "followers", qty: "500" }, { service: "likes", qty: "500" }, { service: "views", qty: "5000" }] });
  const [smm, setSmm] = useState<SmmData | null>(null);
  const [upsells, setUpsells] = useState<{ id: number; service: string; qty: number; label: string; label_en: string; active: boolean; sort_order: number }[]>([]);
  const [newUpsell, setNewUpsell] = useState({ service: "followers", qty: "", label: "", labelEn: "" });

  const headers = { Authorization: `Bearer ${password}`, "Content-Type": "application/json" };

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${password}` } });
    if (res.ok) setAnalytics(await res.json());
    setLoading(false);
  }, [password]);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    const res = await fetch(`/api/admin/orders?page=${page}`, { headers: { Authorization: `Bearer ${password}` } });
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders);
      setOrdersPage(data.page);
      setOrdersPages(data.pages);
    }
    setLoading(false);
  }, [password]);

  const fetchCombos = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/combos", { headers: { Authorization: `Bearer ${password}` } });
    if (res.ok) {
      const data = await res.json();
      setCombos(data.combos);
    }
    setLoading(false);
  }, [password]);

  const fetchPricing = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/pricing", { headers: { Authorization: `Bearer ${password}` } });
    if (res.ok) {
      const data = await res.json();
      setPricing(data.pricing);
    }
    setLoading(false);
  }, [password]);

  const handleLogin = async () => {
    const res = await fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${password}` } });
    if (res.ok) {
      setAuthed(true);
      setAnalytics(await res.json());
    } else {
      alert("Mot de passe incorrect");
    }
  };

  useEffect(() => {
    if (!authed) return;
    if (tab === "analytics") fetchAnalytics();
    if (tab === "orders") fetchOrders(1);
    if (tab === "pricing") fetchPricing();
    if (tab === "combos") fetchCombos();
    if (tab === "upsells") fetchUpsells();
    if (tab === "smm") fetchSmm();
  }, [tab, authed, fetchAnalytics, fetchOrders, fetchPricing, fetchCombos]);

  const fetchUpsells = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/upsells", { headers: { Authorization: `Bearer ${password}` } });
    if (res.ok) { const data = await res.json(); setUpsells(data.upsells); }
    setLoading(false);
  }, [password]);

  const fetchSmm = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/smm", { headers: { Authorization: `Bearer ${password}` } });
    if (res.ok) setSmm(await res.json());
    setLoading(false);
  };

  const updatePrice = async (id: number) => {
    await fetch("/api/admin/pricing", {
      method: "PUT",
      headers,
      body: JSON.stringify({ id, price: Number(editPrice), price_usd: Number(editPriceUsd), price_gbp: Number(editPriceGbp), price_cad: Number(editPriceCad), price_nzd: Number(editPriceNzd), price_chf: Number(editPriceChf) }),
    });
    setEditingId(null);
    fetchPricing();
  };

  const toggleActive = async (id: number, active: boolean) => {
    await fetch("/api/admin/pricing", {
      method: "PUT",
      headers,
      body: JSON.stringify({ id, active: !active }),
    });
    fetchPricing();
  };

  const createPack = async () => {
    if (!newPack.qty || !newPack.price) return;
    await fetch("/api/admin/pricing", {
      method: "POST",
      headers,
      body: JSON.stringify({ service: newPack.service, qty: Number(newPack.qty), price: Number(newPack.price), price_usd: Number(newPack.priceUsd) || 0, price_gbp: Number(newPack.priceGbp) || 0, price_cad: Number(newPack.priceCad) || 0, price_nzd: Number(newPack.priceNzd) || 0, price_chf: Number(newPack.priceChf) || 0 }),
    });
    setNewPack({ service: newPack.service, qty: "", price: "", priceUsd: "", priceGbp: "", priceCad: "", priceNzd: "", priceChf: "" });
    fetchPricing();
  };

  const deletePack = async (id: number) => {
    if (!confirm("Supprimer ce pack ?")) return;
    await fetch("/api/admin/pricing", {
      method: "DELETE",
      headers,
      body: JSON.stringify({ id }),
    });
    fetchPricing();
  };

  // Login screen
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050505" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "32px", borderRadius: "16px", border: "1px solid rgba(0,210,106,0.15)", backgroundColor: "rgba(0,180,53,0.03)" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", margin: 0 }}>Admin Fanovaly</h1>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{ padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "14px", width: "260px", outline: "none", fontFamily: "inherit" }}
          />
          <button
            onClick={handleLogin}
            style={{ padding: "12px 28px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "14px", color: "#000", background: "linear-gradient(135deg, rgb(0,180,53), rgb(0,255,76))", fontFamily: "inherit" }}
          >
            Connexion
          </button>
        </div>
      </div>
    );
  }

  const green = "rgb(0, 210, 106)";

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#e8f7ed", fontFamily: "inherit", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
          Admin <span style={{ color: green }}>Fanovaly</span>
        </h1>
        <div style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {(["analytics", "orders", "pricing", "combos", "upsells", "smm"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 600,
                color: tab === t ? "#000" : "rgb(169,181,174)",
                background: tab === t ? "linear-gradient(135deg, rgb(0,180,53), rgb(0,255,76))" : "transparent",
              }}
            >
              {t === "analytics" ? "Analytics" : t === "orders" ? "Commandes" : t === "pricing" ? "Prix" : t === "combos" ? "Combos" : t === "upsells" ? "Upsells" : "SMM"}
            </button>
          ))}
        </div>
      </div>

      {loading && <p style={{ color: "rgb(169,181,174)", fontSize: "13px" }}>Chargement...</p>}

      {/* Analytics Tab */}
      {tab === "analytics" && analytics && (
        <div>
          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "28px" }}>
            <KpiCard label="Commandes totales" value={String(analytics.totalOrders)} />
            <KpiCard label="Revenu total" value={`${(analytics.totalRevenueCents / 100).toFixed(2)}€`} />
            <KpiCard label="Coût total" value={`${(analytics.totalCostCents / 100).toFixed(2)}€`} />
            <KpiCard label="Profit total" value={`${((analytics.totalRevenueCents - analytics.totalCostCents) / 100).toFixed(2)}€`} />
            <KpiCard label="Commandes aujourd'hui" value={String(analytics.ordersToday)} />
            <KpiCard label="Revenu aujourd'hui" value={`${(analytics.revenueTodayCents / 100).toFixed(2)}€`} />
            <KpiCard label="Coût aujourd'hui" value={`${(analytics.costTodayCents / 100).toFixed(2)}€`} />
            <KpiCard label="Profit aujourd'hui" value={`${((analytics.revenueTodayCents - analytics.costTodayCents) / 100).toFixed(2)}€`} />
          </div>

          {/* Status breakdown */}
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "10px", color: "rgb(169,181,174)" }}>Par statut</h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
            {analytics.byStatus.map((s) => (
              <span key={s.status} style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, backgroundColor: s.status === "paid" ? "rgba(0,180,53,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${s.status === "paid" ? "rgba(0,210,106,0.2)" : "rgba(255,255,255,0.08)"}`, color: s.status === "paid" ? green : "rgb(169,181,174)" }}>
                {s.status}: {s.count}
              </span>
            ))}
          </div>

          {/* Last 7 days */}
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "10px", color: "rgb(169,181,174)" }}>7 derniers jours</h3>
          <div style={{ overflowX: "auto", marginBottom: "24px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,210,106,0.1)" }}>
                  <th style={{ padding: "8px", textAlign: "left", color: "rgb(107,117,111)" }}>Date</th>
                  <th style={{ padding: "8px", textAlign: "right", color: "rgb(107,117,111)" }}>Commandes</th>
                  <th style={{ padding: "8px", textAlign: "right", color: "rgb(107,117,111)" }}>Revenu</th>
                </tr>
              </thead>
              <tbody>
                {analytics.last7Days.map((d) => (
                  <tr key={d.date} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "8px" }}>{d.date}</td>
                    <td style={{ padding: "8px", textAlign: "right" }}>{d.count}</td>
                    <td style={{ padding: "8px", textAlign: "right", color: green }}>{(Number(d.revenue) / 100).toFixed(2)}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top services */}
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "10px", color: "rgb(169,181,174)" }}>Services populaires</h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
            {analytics.topServices.map((s) => (
              <span key={s.service} style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, backgroundColor: "rgba(0,180,53,0.06)", border: "1px solid rgba(0,210,106,0.12)", color: "#e8f7ed" }}>
                {s.service}: {s.count} ventes — {(Number(s.revenue_cents) / 100).toFixed(2)}€
              </span>
            ))}
          </div>

          {/* Platforms */}
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "10px", color: "rgb(169,181,174)" }}>Plateformes</h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {analytics.platforms.map((p) => (
              <span key={p.platform} style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, backgroundColor: "rgba(0,180,53,0.06)", border: "1px solid rgba(0,210,106,0.12)", color: "#e8f7ed" }}>
                {p.platform}: {p.count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,210,106,0.1)" }}>
                  <th style={{ padding: "8px", textAlign: "left", color: "rgb(107,117,111)" }}>ID</th>
                  <th style={{ padding: "8px", textAlign: "left", color: "rgb(107,117,111)" }}>Date</th>
                  <th style={{ padding: "8px", textAlign: "left", color: "rgb(107,117,111)" }}>User</th>
                  <th style={{ padding: "8px", textAlign: "left", color: "rgb(107,117,111)" }}>Email</th>
                  <th style={{ padding: "8px", textAlign: "left", color: "rgb(107,117,111)" }}>Platform</th>
                  <th style={{ padding: "8px", textAlign: "left", color: "rgb(107,117,111)" }}>Panier</th>
                  <th style={{ padding: "8px", textAlign: "right", color: "rgb(107,117,111)" }}>Total</th>
                  <th style={{ padding: "8px", textAlign: "right", color: "rgb(107,117,111)" }}>Coût</th>
                  <th style={{ padding: "8px", textAlign: "left", color: "rgb(107,117,111)" }}>SMM</th>
                  <th style={{ padding: "8px", textAlign: "center", color: "rgb(107,117,111)" }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <React.Fragment key={o.id}>
                  <tr style={{ borderBottom: Array.isArray(o.post_assignments) && o.post_assignments.length > 0 ? "none" : "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "8px", color: "rgb(107,117,111)" }}>#{o.id}</td>
                    <td style={{ padding: "8px" }}>{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                    <td style={{ padding: "8px", fontWeight: 600 }}>
                      <a
                        href={o.platform === "youtube" ? `https://www.youtube.com/@${o.username}` : o.platform === "instagram" ? `https://www.instagram.com/${o.username}` : `https://www.tiktok.com/@${o.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#22c55e", textDecoration: "none" }}
                        onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
                      >
                        @{o.username}
                      </a>
                    </td>
                    <td style={{ padding: "8px", color: "rgb(169,181,174)" }}>
                      {o.email || "—"}
                      {o.email_order_num && o.email_order_total && o.email_order_total > 1 && (
                        <span style={{ marginLeft: "6px", padding: "1px 6px", borderRadius: "6px", fontSize: "9px", fontWeight: 700, backgroundColor: o.email_order_num === 1 ? "rgba(0,210,106,0.12)" : "rgba(255,184,0,0.15)", color: o.email_order_num === 1 ? "#00d26a" : "#ffb800" }}>
                          {o.email_order_num}/{o.email_order_total}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "8px" }}>{o.platform}</td>
                    <td style={{ padding: "8px", color: "rgb(169,181,174)" }}>
                      {Array.isArray(o.cart) ? o.cart.map((c) => `${c.qty} ${c.label}`).join(", ") : "—"}
                      {Array.isArray(o.cart) && o.cart.find((c) => c.liveStartAt) && (
                        <div style={{ marginTop: "4px", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 600, backgroundColor: "rgba(145,71,255,0.12)", color: "#c79dff", border: "1px solid rgba(145,71,255,0.25)", display: "inline-block" }}>
                          🔴 Live: {new Date(o.cart.find((c) => c.liveStartAt)!.liveStartAt!).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "8px", textAlign: "right", fontWeight: 600, color: green }}>{(o.total_cents / 100).toFixed(2)}{CURRENCY_SYMBOLS[o.currency] || "\u20AC"}</td>
                    <td style={{ padding: "8px", textAlign: "right" }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={o.cost_cents ? (o.cost_cents / 100).toFixed(2) : ""}
                        placeholder="0.00"
                        onBlur={async (e) => {
                          const val = parseFloat(e.target.value);
                          if (isNaN(val)) return;
                          const cents = Math.round(val * 100);
                          await fetch("/api/admin/orders", {
                            method: "PATCH",
                            headers,
                            body: JSON.stringify({ id: o.id, cost_cents: cents }),
                          });
                          fetchOrders(ordersPage);
                        }}
                        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                        style={{
                          width: "70px",
                          padding: "3px 6px",
                          borderRadius: "6px",
                          border: "1px solid rgba(0,210,106,0.15)",
                          backgroundColor: "rgba(0,180,53,0.04)",
                          color: o.cost_cents ? "#ffb800" : "rgb(107,117,111)",
                          fontSize: "11px",
                          fontFamily: "inherit",
                          textAlign: "right",
                        }}
                      />
                    </td>
                    <td style={{ padding: "8px" }}>
                      {Array.isArray(o.smm_orders) && o.smm_orders.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {o.smm_orders.map((s, i) => (
                            <span key={i} style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: s.error ? "rgba(239,68,68,0.08)" : "rgba(0,180,53,0.08)", color: s.error ? "#ef4444" : green, border: `1px solid ${s.error ? "rgba(239,68,68,0.15)" : "rgba(0,210,106,0.15)"}` }}>
                              {s.service} {s.qty} → {s.bulkfollows_order_id ? `#${s.bulkfollows_order_id}` : s.error || "—"}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: "rgb(107,117,111)", fontSize: "10px" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center", flexWrap: "wrap" }}>
                        <span style={{
                          padding: "3px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: o.status === "paid" ? "rgba(0,180,53,0.1)" : o.status === "delivered" ? "rgba(0,180,53,0.15)" : o.status === "processing" ? "rgba(255,184,0,0.1)" : o.status === "failed" ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)",
                          color: o.status === "paid" ? green : o.status === "delivered" ? green : o.status === "processing" ? "#ffb800" : o.status === "failed" ? "#ef4444" : "rgb(169,181,174)",
                          border: `1px solid ${o.status === "paid" ? "rgba(0,210,106,0.2)" : o.status === "delivered" ? "rgba(0,210,106,0.3)" : o.status === "processing" ? "rgba(255,184,0,0.2)" : o.status === "failed" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.08)"}`,
                        }}>
                          {o.status}
                        </span>
                        {o.status !== "delivered" && o.status !== "failed" && (
                          <select
                            defaultValue=""
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              if (!newStatus) return;
                              await fetch("/api/admin/orders", {
                                method: "PUT",
                                headers,
                                body: JSON.stringify({ id: o.id, status: newStatus }),
                              });
                              fetchOrders(ordersPage);
                            }}
                            style={{ padding: "2px 4px", borderRadius: "4px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "10px", fontFamily: "inherit", cursor: "pointer", colorScheme: "dark" }}
                          >
                            <option value="">→</option>
                            {o.status === "pending" && <option value="paid">paid</option>}
                            {(o.status === "paid" || o.status === "pending") && <option value="processing">processing</option>}
                            <option value="delivered">delivered</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                  {Array.isArray(o.post_assignments) && o.post_assignments.length > 0 && (
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td colSpan={10} style={{ padding: "4px 8px 10px 8px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: "rgb(107,117,111)", textTransform: "uppercase", marginRight: "4px" }}>Posts:</span>
                          {(o.post_assignments as { postId: string; postUrl?: string; imageUrl?: string; likes: boolean; views: boolean }[]).map((pa, i) => (
                            <a
                              key={i}
                              href={pa.postUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex", alignItems: "center", gap: "4px",
                                padding: "3px 8px", borderRadius: "6px",
                                fontSize: "10px", fontWeight: 600,
                                backgroundColor: "rgba(0,180,53,0.06)",
                                border: "1px solid rgba(0,210,106,0.15)",
                                color: pa.postUrl ? green : "rgb(169,181,174)",
                                textDecoration: "none",
                              }}
                            >
                              🔗 {pa.postId.slice(0, 12)}{pa.postId.length > 12 ? "…" : ""}
                              <span style={{ color: "rgb(107,117,111)" }}>
                                {[pa.likes && "♥", pa.views && "👁"].filter(Boolean).join("")}
                              </span>
                            </a>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
            <button
              disabled={ordersPage <= 1}
              onClick={() => fetchOrders(ordersPage - 1)}
              style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(0,210,106,0.15)", backgroundColor: "rgba(0,180,53,0.04)", color: "rgb(169,181,174)", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", opacity: ordersPage <= 1 ? 0.4 : 1 }}
            >
              ← Précédent
            </button>
            <span style={{ padding: "6px 14px", fontSize: "12px", color: "rgb(107,117,111)" }}>{ordersPage}/{ordersPages}</span>
            <button
              disabled={ordersPage >= ordersPages}
              onClick={() => fetchOrders(ordersPage + 1)}
              style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(0,210,106,0.15)", backgroundColor: "rgba(0,180,53,0.04)", color: "rgb(169,181,174)", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", opacity: ordersPage >= ordersPages ? 0.4 : 1 }}
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* Pricing Tab */}
      {tab === "pricing" && (
        <div>
          {/* Add new pack */}
          <div style={{ marginBottom: "24px", padding: "16px", borderRadius: "14px", border: "1px solid rgba(0,210,106,0.12)", backgroundColor: "rgba(0,180,53,0.03)" }}>
            <p style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: 600, color: "#fff" }}>Nouveau pack</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <select
                value={newPack.service}
                onChange={(e) => setNewPack({ ...newPack, service: e.target.value })}
                style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "12px", fontFamily: "inherit", colorScheme: "dark" }}
              >
                <option value="followers">Followers</option>
                <option value="likes">Likes</option>
                <option value="views">Views</option>
                <option value="yt_subscribers">Abonnés YT</option>
                <option value="yt_likes">Likes YT</option>
                <option value="yt_views">Vues YT</option>
                <option value="sp_streams">Streams Spotify</option>
                <option value="x_followers">Followers X (Twitter)</option>
                <option value="x_likes">Likes X (Twitter)</option>
                <option value="x_retweets">Retweets X</option>
                <option value="tw_followers">Followers Twitch</option>
                <option value="tw_live_viewers">Live Viewers Twitch</option>
              </select>
              <input
                type="number"
                placeholder="Quantité"
                value={newPack.qty}
                onChange={(e) => setNewPack({ ...newPack, qty: e.target.value })}
                style={{ width: "90px", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "12px", fontFamily: "inherit", outline: "none" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                <span style={{ fontSize: "11px", color: "rgb(107,117,111)" }}>€</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Prix EUR"
                  value={newPack.price}
                  onChange={(e) => setNewPack({ ...newPack, price: e.target.value })}
                  style={{ width: "80px", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "12px", fontFamily: "inherit", outline: "none" }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                <span style={{ fontSize: "11px", color: "rgb(107,117,111)" }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Prix USD"
                  value={newPack.priceUsd}
                  onChange={(e) => setNewPack({ ...newPack, priceUsd: e.target.value })}
                  style={{ width: "80px", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "12px", fontFamily: "inherit", outline: "none" }}
                />
              </div>
              <button
                onClick={createPack}
                style={{ padding: "8px 18px", borderRadius: "8px", border: "none", backgroundColor: green, color: "#000", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* TikTok / Instagram pricing */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: green }}>TikTok / Instagram</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(0,210,106,0.15)" }} />
          </div>

          {(["followers", "likes", "views"] as const).map((service) => {
            const items = pricing.filter((p) => p.service === service);
            return (
              <div key={service} style={{ marginBottom: "28px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "10px", textTransform: "capitalize" }}>
                  {service}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "8px" }}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        border: `1px solid ${item.active ? "rgba(0,210,106,0.15)" : "rgba(255,255,255,0.06)"}`,
                        backgroundColor: item.active ? "rgba(0,180,53,0.04)" : "rgba(255,255,255,0.02)",
                        opacity: item.active ? 1 : 0.5,
                      }}
                    >
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#e8f7ed", marginBottom: "4px" }}>
                        {item.qty >= 1000 ? `${item.qty / 1000}K` : item.qty}
                      </div>

                      {editingId === item.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginBottom: "8px" }}>
                          {[
                            { label: "€", val: editPrice, set: setEditPrice },
                            { label: "$", val: editPriceUsd, set: setEditPriceUsd },
                            { label: "£", val: editPriceGbp, set: setEditPriceGbp },
                            { label: "C$", val: editPriceCad, set: setEditPriceCad },
                            { label: "NZ$", val: editPriceNzd, set: setEditPriceNzd },
                            { label: "CHF", val: editPriceChf, set: setEditPriceChf },
                          ].map((c) => (
                            <div key={c.label} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                              <span style={{ fontSize: "9px", color: "rgb(107,117,111)", width: "22px", textAlign: "right" }}>{c.label}</span>
                              <input type="number" step="0.01" value={c.val} onChange={(e) => c.set(e.target.value)}
                                style={{ width: "65px", padding: "3px 6px", borderRadius: "6px", border: "1px solid rgba(0,210,106,0.3)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "12px", outline: "none", fontFamily: "inherit" }} />
                            </div>
                          ))}
                          <button
                            onClick={() => updatePrice(item.id)}
                            style={{ padding: "4px 8px", borderRadius: "6px", border: "none", backgroundColor: green, color: "#000", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: "2px" }}
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => { setEditingId(item.id); setEditPrice(String(item.price)); setEditPriceUsd(String(item.price_usd || 0)); setEditPriceGbp(String(item.price_gbp || 0)); setEditPriceCad(String(item.price_cad || 0)); setEditPriceNzd(String(item.price_nzd || 0)); setEditPriceChf(String(item.price_chf || 0)); }}
                          style={{ fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "8px" }}
                        >
                          <span style={{ color: green }}>{Number(item.price).toFixed(2)}€</span>
                          <span style={{ color: "rgb(107,117,111)", fontSize: "11px", marginLeft: "6px" }}>${Number(item.price_usd || 0).toFixed(2)}</span>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={() => toggleActive(item.id, item.active)}
                          style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", color: "rgb(107,117,111)", cursor: "pointer", fontFamily: "inherit" }}
                        >
                          {item.active ? "Désactiver" : "Activer"}
                        </button>
                        <button
                          onClick={() => deletePack(item.id)}
                          style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.15)", backgroundColor: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* YouTube pricing */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "32px 0 16px 0" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#FF0000" }}>YouTube</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,0,0,0.15)" }} />
          </div>

          {([["yt_subscribers", "Abonnés YT"], ["yt_likes", "Likes YT"], ["yt_views", "Vues YT"]] as const).map(([service, label]) => {
            const items = pricing.filter((p) => p.service === service);
            if (items.length === 0) return null;
            return (
              <div key={service} style={{ marginBottom: "28px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "10px" }}>
                  {label}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "8px" }}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        border: `1px solid ${item.active ? "rgba(255,0,0,0.15)" : "rgba(255,255,255,0.06)"}`,
                        backgroundColor: item.active ? "rgba(255,0,0,0.04)" : "rgba(255,255,255,0.02)",
                        opacity: item.active ? 1 : 0.5,
                      }}
                    >
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#e8f7ed", marginBottom: "4px" }}>
                        {item.qty >= 1000 ? `${item.qty / 1000}K` : item.qty}
                      </div>

                      {editingId === item.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginBottom: "8px" }}>
                          {[
                            { label: "€", val: editPrice, set: setEditPrice },
                            { label: "$", val: editPriceUsd, set: setEditPriceUsd },
                            { label: "£", val: editPriceGbp, set: setEditPriceGbp },
                            { label: "C$", val: editPriceCad, set: setEditPriceCad },
                            { label: "NZ$", val: editPriceNzd, set: setEditPriceNzd },
                            { label: "CHF", val: editPriceChf, set: setEditPriceChf },
                          ].map((c) => (
                            <div key={c.label} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                              <span style={{ fontSize: "9px", color: "rgb(107,117,111)", width: "22px", textAlign: "right" }}>{c.label}</span>
                              <input type="number" step="0.01" value={c.val} onChange={(e) => c.set(e.target.value)}
                                style={{ width: "65px", padding: "3px 6px", borderRadius: "6px", border: "1px solid rgba(255,0,0,0.3)", backgroundColor: "rgba(255,0,0,0.04)", color: "#e8f7ed", fontSize: "12px", outline: "none", fontFamily: "inherit" }} />
                            </div>
                          ))}
                          <button
                            onClick={() => updatePrice(item.id)}
                            style={{ padding: "4px 8px", borderRadius: "6px", border: "none", backgroundColor: "#FF0000", color: "#fff", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: "2px" }}
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => { setEditingId(item.id); setEditPrice(String(item.price)); setEditPriceUsd(String(item.price_usd || 0)); setEditPriceGbp(String(item.price_gbp || 0)); setEditPriceCad(String(item.price_cad || 0)); setEditPriceNzd(String(item.price_nzd || 0)); setEditPriceChf(String(item.price_chf || 0)); }}
                          style={{ fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "8px" }}
                        >
                          <span style={{ color: "#FF0000" }}>{Number(item.price).toFixed(2)}€</span>
                          <span style={{ color: "rgb(107,117,111)", fontSize: "11px", marginLeft: "6px" }}>${Number(item.price_usd || 0).toFixed(2)}</span>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={() => toggleActive(item.id, item.active)}
                          style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", color: "rgb(107,117,111)", cursor: "pointer", fontFamily: "inherit" }}
                        >
                          {item.active ? "Désactiver" : "Activer"}
                        </button>
                        <button
                          onClick={() => deletePack(item.id)}
                          style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.15)", backgroundColor: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Spotify Streams */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "32px 0 16px 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(29,185,84,0.15)" }} />
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#1DB954" }}>Spotify Streams</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(29,185,84,0.15)" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "10px" }}>
            {pricing.filter((p) => p.service === "sp_streams").map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "14px 10px", borderRadius: "12px", textAlign: "center",
                  border: `1px solid ${item.active ? "rgba(29,185,84,0.15)" : "rgba(255,255,255,0.06)"}`,
                  backgroundColor: item.active ? "rgba(29,185,84,0.04)" : "rgba(255,255,255,0.02)",
                  opacity: item.active ? 1 : 0.5,
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#e8f7ed", marginBottom: "4px" }}>
                  {item.qty >= 1000 ? `${item.qty / 1000}K` : item.qty}
                </div>

                {editingId === item.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginBottom: "8px" }}>
                    {[
                      { label: "\u20AC", val: editPrice, set: setEditPrice },
                      { label: "$", val: editPriceUsd, set: setEditPriceUsd },
                      { label: "\u00A3", val: editPriceGbp, set: setEditPriceGbp },
                      { label: "C$", val: editPriceCad, set: setEditPriceCad },
                      { label: "NZ$", val: editPriceNzd, set: setEditPriceNzd },
                      { label: "CHF", val: editPriceChf, set: setEditPriceChf },
                    ].map((c) => (
                      <div key={c.label} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <span style={{ fontSize: "9px", color: "rgb(107,117,111)", width: "22px", textAlign: "right" }}>{c.label}</span>
                        <input type="number" step="0.01" value={c.val} onChange={(e) => c.set(e.target.value)}
                          style={{ width: "65px", padding: "3px 6px", borderRadius: "6px", border: "1px solid rgba(29,185,84,0.3)", backgroundColor: "rgba(29,185,84,0.04)", color: "#e8f7ed", fontSize: "12px", outline: "none", fontFamily: "inherit" }} />
                      </div>
                    ))}
                    <button
                      onClick={() => updatePrice(item.id)}
                      style={{ padding: "4px 8px", borderRadius: "6px", border: "none", backgroundColor: "#1DB954", color: "#000", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: "2px" }}
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => { setEditingId(item.id); setEditPrice(String(item.price)); setEditPriceUsd(String(item.price_usd || 0)); setEditPriceGbp(String(item.price_gbp || 0)); setEditPriceCad(String(item.price_cad || 0)); setEditPriceNzd(String(item.price_nzd || 0)); setEditPriceChf(String(item.price_chf || 0)); }}
                    style={{ fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "8px" }}
                  >
                    <span style={{ color: "#1DB954" }}>{Number(item.price).toFixed(2)}{"\u20AC"}</span>
                    <span style={{ color: "rgb(107,117,111)", fontSize: "11px", marginLeft: "6px" }}>${Number(item.price_usd || 0).toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    onClick={() => toggleActive(item.id, item.active)}
                    style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", color: "rgb(107,117,111)", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {item.active ? "D\u00E9sactiver" : "Activer"}
                  </button>
                  <button
                    onClick={() => deletePack(item.id)}
                    style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.15)", backgroundColor: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {"\u2715"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* X (Twitter) pricing */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "32px 0 16px 0" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgb(29,155,240)" }}>X (Twitter)</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(29,155,240,0.15)" }} />
          </div>

          {([["x_followers", "Followers X"], ["x_likes", "Likes X"], ["x_retweets", "Retweets X"]] as const).map(([service, label]) => {
            const items = pricing.filter((p) => p.service === service);
            if (items.length === 0) return null;
            return (
              <div key={service} style={{ marginBottom: "28px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "10px" }}>{label}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "8px" }}>
                  {items.map((item) => (
                    <div key={item.id} style={{ padding: "14px", borderRadius: "12px", border: `1px solid ${item.active ? "rgba(29,155,240,0.15)" : "rgba(255,255,255,0.06)"}`, backgroundColor: item.active ? "rgba(29,155,240,0.04)" : "rgba(255,255,255,0.02)", opacity: item.active ? 1 : 0.5 }}>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#e8f7ed", marginBottom: "4px" }}>
                        {item.qty >= 1000 ? `${item.qty / 1000}K` : item.qty}
                      </div>
                      {editingId === item.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginBottom: "8px" }}>
                          {[
                            { label: "\u20AC", val: editPrice, set: setEditPrice },
                            { label: "$", val: editPriceUsd, set: setEditPriceUsd },
                            { label: "\u00A3", val: editPriceGbp, set: setEditPriceGbp },
                            { label: "C$", val: editPriceCad, set: setEditPriceCad },
                            { label: "NZ$", val: editPriceNzd, set: setEditPriceNzd },
                            { label: "CHF", val: editPriceChf, set: setEditPriceChf },
                          ].map((c) => (
                            <div key={c.label} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                              <span style={{ fontSize: "9px", color: "rgb(107,117,111)", width: "22px", textAlign: "right" }}>{c.label}</span>
                              <input type="number" step="0.01" value={c.val} onChange={(e) => c.set(e.target.value)}
                                style={{ width: "65px", padding: "3px 6px", borderRadius: "6px", border: "1px solid rgba(29,155,240,0.3)", backgroundColor: "rgba(29,155,240,0.04)", color: "#e8f7ed", fontSize: "12px", outline: "none", fontFamily: "inherit" }} />
                            </div>
                          ))}
                          <button onClick={() => updatePrice(item.id)} style={{ padding: "4px 8px", borderRadius: "6px", border: "none", backgroundColor: "rgb(29,155,240)", color: "#fff", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: "2px" }}>OK</button>
                        </div>
                      ) : (
                        <div onClick={() => { setEditingId(item.id); setEditPrice(String(item.price)); setEditPriceUsd(String(item.price_usd || 0)); setEditPriceGbp(String(item.price_gbp || 0)); setEditPriceCad(String(item.price_cad || 0)); setEditPriceNzd(String(item.price_nzd || 0)); setEditPriceChf(String(item.price_chf || 0)); }} style={{ fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "8px" }}>
                          <span style={{ color: "rgb(29,155,240)" }}>{Number(item.price).toFixed(2)}{"\u20AC"}</span>
                          <span style={{ color: "rgb(107,117,111)", fontSize: "11px", marginLeft: "6px" }}>${Number(item.price_usd || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button onClick={() => toggleActive(item.id, item.active)} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", color: "rgb(107,117,111)", cursor: "pointer", fontFamily: "inherit" }}>
                          {item.active ? "Désactiver" : "Activer"}
                        </button>
                        <button onClick={() => deletePack(item.id)} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.15)", backgroundColor: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>
                          {"\u2715"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Twitch pricing */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "32px 0 16px 0" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgb(145,71,255)" }}>Twitch</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(145,71,255,0.15)" }} />
          </div>

          {([["tw_followers", "Followers Twitch"], ["tw_live_viewers", "Live Viewers Twitch"]] as const).map(([service, label]) => {
            const items = pricing.filter((p) => p.service === service);
            if (items.length === 0) return null;
            return (
              <div key={service} style={{ marginBottom: "28px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "10px" }}>{label}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "8px" }}>
                  {items.map((item) => (
                    <div key={item.id} style={{ padding: "14px", borderRadius: "12px", border: `1px solid ${item.active ? "rgba(145,71,255,0.15)" : "rgba(255,255,255,0.06)"}`, backgroundColor: item.active ? "rgba(145,71,255,0.04)" : "rgba(255,255,255,0.02)", opacity: item.active ? 1 : 0.5 }}>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#e8f7ed", marginBottom: "4px" }}>
                        {item.qty >= 1000 ? `${item.qty / 1000}K` : item.qty}
                      </div>
                      {editingId === item.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginBottom: "8px" }}>
                          {[
                            { label: "\u20AC", val: editPrice, set: setEditPrice },
                            { label: "$", val: editPriceUsd, set: setEditPriceUsd },
                            { label: "\u00A3", val: editPriceGbp, set: setEditPriceGbp },
                            { label: "C$", val: editPriceCad, set: setEditPriceCad },
                            { label: "NZ$", val: editPriceNzd, set: setEditPriceNzd },
                            { label: "CHF", val: editPriceChf, set: setEditPriceChf },
                          ].map((c) => (
                            <div key={c.label} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                              <span style={{ fontSize: "9px", color: "rgb(107,117,111)", width: "22px", textAlign: "right" }}>{c.label}</span>
                              <input type="number" step="0.01" value={c.val} onChange={(e) => c.set(e.target.value)}
                                style={{ width: "65px", padding: "3px 6px", borderRadius: "6px", border: "1px solid rgba(145,71,255,0.3)", backgroundColor: "rgba(145,71,255,0.04)", color: "#e8f7ed", fontSize: "12px", outline: "none", fontFamily: "inherit" }} />
                            </div>
                          ))}
                          <button onClick={() => updatePrice(item.id)} style={{ padding: "4px 8px", borderRadius: "6px", border: "none", backgroundColor: "rgb(145,71,255)", color: "#fff", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: "2px" }}>OK</button>
                        </div>
                      ) : (
                        <div onClick={() => { setEditingId(item.id); setEditPrice(String(item.price)); setEditPriceUsd(String(item.price_usd || 0)); setEditPriceGbp(String(item.price_gbp || 0)); setEditPriceCad(String(item.price_cad || 0)); setEditPriceNzd(String(item.price_nzd || 0)); setEditPriceChf(String(item.price_chf || 0)); }} style={{ fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "8px" }}>
                          <span style={{ color: "rgb(145,71,255)" }}>{Number(item.price).toFixed(2)}{"\u20AC"}</span>
                          <span style={{ color: "rgb(107,117,111)", fontSize: "11px", marginLeft: "6px" }}>${Number(item.price_usd || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button onClick={() => toggleActive(item.id, item.active)} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", color: "rgb(107,117,111)", cursor: "pointer", fontFamily: "inherit" }}>
                          {item.active ? "Désactiver" : "Activer"}
                        </button>
                        <button onClick={() => deletePack(item.id)} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.15)", backgroundColor: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>
                          {"\u2715"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Combos Tab */}
      {tab === "combos" && (
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px", color: "rgb(169,181,174)" }}>Packs combo</h3>

          {/* Create new combo */}
          <div style={{ marginBottom: "24px", padding: "16px", borderRadius: "14px", border: "1px solid rgba(0,210,106,0.12)", backgroundColor: "rgba(0,180,53,0.03)" }}>
            <p style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: 600, color: "#fff" }}>Nouveau combo</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
              <input
                placeholder="Nom FR (ex: Pack Croissance)"
                value={newCombo.name}
                onChange={(e) => setNewCombo({ ...newCombo, name: e.target.value })}
                style={{ flex: 1, minWidth: "140px", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
              />
              <input
                placeholder="Name EN (ex: Growth Pack)"
                value={newCombo.nameEn}
                onChange={(e) => setNewCombo({ ...newCombo, nameEn: e.target.value })}
                style={{ flex: 1, minWidth: "140px", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "12px", color: "rgb(107,117,111)" }}>-</span>
                <input
                  type="number"
                  value={newCombo.discount}
                  onChange={(e) => setNewCombo({ ...newCombo, discount: e.target.value })}
                  style={{ width: "50px", padding: "8px", borderRadius: "8px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "13px", fontFamily: "inherit", outline: "none", textAlign: "center" }}
                />
                <span style={{ fontSize: "12px", color: "rgb(107,117,111)" }}>%</span>
              </div>
            </div>
            {newCombo.items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "center" }}>
                <select
                  value={item.service}
                  onChange={(e) => {
                    const items = [...newCombo.items];
                    items[i] = { ...items[i], service: e.target.value };
                    setNewCombo({ ...newCombo, items });
                  }}
                  style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "12px", fontFamily: "inherit", colorScheme: "dark" }}
                >
                  <option value="followers">Followers</option>
                  <option value="likes">Likes</option>
                  <option value="views">Views</option>
                </select>
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => {
                    const items = [...newCombo.items];
                    items[i] = { ...items[i], qty: e.target.value };
                    setNewCombo({ ...newCombo, items });
                  }}
                  style={{ width: "80px", padding: "6px 8px", borderRadius: "6px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "12px", fontFamily: "inherit", outline: "none" }}
                />
                {newCombo.items.length > 1 && (
                  <button
                    onClick={() => setNewCombo({ ...newCombo, items: newCombo.items.filter((_, j) => j !== i) })}
                    style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)", backgroundColor: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button
                onClick={() => setNewCombo({ ...newCombo, items: [...newCombo.items, { service: "followers", qty: "500" }] })}
                style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(0,210,106,0.15)", backgroundColor: "transparent", color: "rgb(169,181,174)", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}
              >
                + Ajouter service
              </button>
              <button
                onClick={async () => {
                  if (!newCombo.name.trim()) return;
                  const items = newCombo.items.map(it => ({ service: it.service, qty: Number(it.qty) })).filter(it => it.qty > 0);
                  if (items.length === 0) return;
                  await fetch("/api/admin/combos", {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ name: newCombo.name, nameEn: newCombo.nameEn, items, discountPercent: Number(newCombo.discount) || 20 }),
                  });
                  setNewCombo({ name: "", nameEn: "", discount: "20", items: [{ service: "followers", qty: "500" }, { service: "likes", qty: "500" }, { service: "views", qty: "5000" }] });
                  fetchCombos();
                }}
                style={{ padding: "6px 16px", borderRadius: "8px", border: "none", backgroundColor: green, color: "#000", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                Créer
              </button>
            </div>
          </div>

          {/* Existing combos */}
          {combos.length === 0 && <p style={{ fontSize: "13px", color: "rgb(107,117,111)" }}>Aucun combo créé</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
            {combos.map((combo) => (
              <div key={combo.id} style={{
                padding: "16px",
                borderRadius: "14px",
                border: `1px solid ${combo.active ? "rgba(0,210,106,0.15)" : "rgba(255,255,255,0.06)"}`,
                backgroundColor: combo.active ? "rgba(0,180,53,0.04)" : "rgba(255,255,255,0.02)",
                opacity: combo.active ? 1 : 0.5,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#fff" }}>{combo.name}</p>
                    {combo.name_en && <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "rgb(107,117,111)" }}>EN: {combo.name_en}</p>}
                  </div>
                  <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, backgroundColor: "rgba(0,255,76,0.1)", color: green, border: "1px solid rgba(0,255,76,0.2)" }}>-{combo.discount_percent}%</span>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  {Array.isArray(combo.items) && combo.items.map((item, i) => (
                    <p key={i} style={{ margin: "2px 0", fontSize: "12px", color: "rgb(169,181,174)" }}>
                      {item.qty >= 1000 ? `${item.qty / 1000}K` : item.qty} {item.service}
                    </p>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={async () => {
                      await fetch("/api/admin/combos", { method: "PUT", headers, body: JSON.stringify({ id: combo.id, active: !combo.active }) });
                      fetchCombos();
                    }}
                    style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", color: "rgb(107,117,111)", fontSize: "10px", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {combo.active ? "Désactiver" : "Activer"}
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm("Supprimer ce combo ?")) return;
                      await fetch("/api/admin/combos", { method: "DELETE", headers, body: JSON.stringify({ id: combo.id }) });
                      fetchCombos();
                    }}
                    style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.15)", backgroundColor: "transparent", color: "#ef4444", fontSize: "10px", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Upsells Tab */}
      {tab === "upsells" && (
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px", color: "rgb(169,181,174)" }}>Offres d&apos;upsell (page de paiement)</h3>

          {/* Add new upsell */}
          <div style={{ marginBottom: "24px", padding: "16px", borderRadius: "14px", border: "1px solid rgba(0,210,106,0.12)", backgroundColor: "rgba(0,180,53,0.03)" }}>
            <p style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: 600, color: "#fff" }}>Nouvel upsell</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <select
                value={newUpsell.service}
                onChange={(e) => setNewUpsell({ ...newUpsell, service: e.target.value })}
                style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "12px", fontFamily: "inherit", colorScheme: "dark" }}
              >
                <option value="followers">Followers</option>
                <option value="likes">Likes</option>
                <option value="views">Views</option>
              </select>
              <input
                type="number"
                placeholder="Quantité"
                value={newUpsell.qty}
                onChange={(e) => setNewUpsell({ ...newUpsell, qty: e.target.value })}
                style={{ width: "90px", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "12px", fontFamily: "inherit", outline: "none" }}
              />
              <input
                type="text"
                placeholder="Label FR (ex: 500 likes)"
                value={newUpsell.label}
                onChange={(e) => setNewUpsell({ ...newUpsell, label: e.target.value })}
                style={{ width: "160px", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "12px", fontFamily: "inherit", outline: "none" }}
              />
              <input
                type="text"
                placeholder="Label EN"
                value={newUpsell.labelEn}
                onChange={(e) => setNewUpsell({ ...newUpsell, labelEn: e.target.value })}
                style={{ width: "140px", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "12px", fontFamily: "inherit", outline: "none" }}
              />
              <button
                onClick={async () => {
                  if (!newUpsell.qty) return;
                  await fetch("/api/admin/upsells", { method: "POST", headers, body: JSON.stringify({ service: newUpsell.service, qty: Number(newUpsell.qty), label: newUpsell.label, label_en: newUpsell.labelEn }) });
                  setNewUpsell({ service: "followers", qty: "", label: "", labelEn: "" });
                  fetchUpsells();
                }}
                style={{ padding: "8px 18px", borderRadius: "8px", border: "none", backgroundColor: green, color: "#000", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                Ajouter
              </button>
            </div>
            <p style={{ margin: "8px 0 0 0", fontSize: "11px", color: "rgb(107,117,111)" }}>
              ⚠️ La quantité doit correspondre à un pack existant dans les Prix pour que le prix soit affiché.
            </p>
          </div>

          {/* List */}
          {upsells.length === 0 ? (
            <p style={{ fontSize: "13px", color: "rgb(107,117,111)" }}>Aucun upsell configuré.</p>
          ) : (
            <div style={{ display: "grid", gap: "8px" }}>
              {upsells.map((u) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", border: `1px solid ${u.active ? "rgba(0,210,106,0.15)" : "rgba(255,255,255,0.06)"}`, backgroundColor: u.active ? "rgba(0,180,53,0.04)" : "rgba(255,255,255,0.02)", opacity: u.active ? 1 : 0.5 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#fff" }}>
                      {u.qty >= 1000 ? `${u.qty / 1000}K` : u.qty} {u.service}
                    </p>
                    <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "rgb(107,117,111)" }}>
                      FR: {u.label || "—"} | EN: {u.label_en || "—"}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch("/api/admin/upsells", { method: "PUT", headers, body: JSON.stringify({ id: u.id, active: !u.active }) });
                      fetchUpsells();
                    }}
                    style={{ padding: "4px 12px", borderRadius: "6px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "transparent", color: u.active ? green : "rgb(107,117,111)", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {u.active ? "ON" : "OFF"}
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm("Supprimer cet upsell ?")) return;
                      await fetch("/api/admin/upsells", { method: "DELETE", headers, body: JSON.stringify({ id: u.id }) });
                      fetchUpsells();
                    }}
                    style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.15)", backgroundColor: "transparent", color: "#ef4444", fontSize: "10px", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* SMM Tab */}
      {tab === "smm" && smm && (
        <div>
          {/* Balance */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
            <KpiCard label="Solde BulkFollows" value={smm.balance ? `${Number(smm.balance.balance).toFixed(2)} ${smm.balance.currency || 'USD'}` : "—"} />
            <div style={{ padding: "16px 20px", borderRadius: "14px", border: "1px solid rgba(0,210,106,0.12)", backgroundColor: "rgba(0,180,53,0.04)", display: "flex", alignItems: "center", gap: "12px" }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "rgb(169,181,174)" }}>Auto-commande</p>
              <button
                onClick={async () => {
                  await fetch("/api/admin/smm", { method: "PUT", headers, body: JSON.stringify({ action: "toggle" }) });
                  fetchSmm();
                }}
                style={{
                  padding: "6px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontWeight: 700,
                  color: smm.settings.auto_order_enabled === "true" ? "#000" : "rgb(169,181,174)",
                  background: smm.settings.auto_order_enabled === "true" ? "linear-gradient(135deg, rgb(0,180,53), rgb(0,255,76))" : "rgba(255,255,255,0.06)",
                }}
              >
                {smm.settings.auto_order_enabled === "true" ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Service mapping */}
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "10px", color: "rgb(169,181,174)" }}>Mapping services → BulkFollows</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,210,106,0.1)" }}>
                  <th style={{ padding: "8px", textAlign: "left", color: "rgb(107,117,111)" }}>Plateforme</th>
                  <th style={{ padding: "8px", textAlign: "left", color: "rgb(107,117,111)" }}>Service</th>
                  <th style={{ padding: "8px", textAlign: "left", color: "rgb(107,117,111)" }}>ID BulkFollows</th>
                  <th style={{ padding: "8px", textAlign: "center", color: "rgb(107,117,111)" }}>Actif</th>
                </tr>
              </thead>
              <tbody>
                {smm.config.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "8px", fontWeight: 600 }}>{c.platform}</td>
                    <td style={{ padding: "8px" }}>{c.service}</td>
                    <td style={{ padding: "8px" }}>
                      <input
                        type="number"
                        defaultValue={c.bulkfollows_service_id}
                        onBlur={async (e) => {
                          const val = parseInt(e.target.value);
                          if (isNaN(val) || val === c.bulkfollows_service_id) return;
                          await fetch("/api/admin/smm", { method: "PUT", headers, body: JSON.stringify({ action: "update_service", id: c.id, bulkfollows_service_id: val }) });
                          fetchSmm();
                        }}
                        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                        style={{ width: "80px", padding: "3px 6px", borderRadius: "6px", border: "1px solid rgba(0,210,106,0.15)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "12px", fontFamily: "inherit" }}
                      />
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <button
                        onClick={async () => {
                          await fetch("/api/admin/smm", { method: "PUT", headers, body: JSON.stringify({ action: "update_service", id: c.id, enabled: !c.enabled }) });
                          fetchSmm();
                        }}
                        style={{
                          padding: "3px 12px", borderRadius: "6px", border: "1px solid", cursor: "pointer", fontFamily: "inherit", fontSize: "11px", fontWeight: 600,
                          borderColor: c.enabled ? "rgba(0,210,106,0.2)" : "rgba(239,68,68,0.2)",
                          backgroundColor: c.enabled ? "rgba(0,180,53,0.1)" : "rgba(239,68,68,0.06)",
                          color: c.enabled ? green : "#ef4444",
                        }}
                      >
                        {c.enabled ? "ON" : "OFF"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "16px 20px", borderRadius: "14px", border: "1px solid rgba(0,210,106,0.12)", backgroundColor: "rgba(0,180,53,0.04)" }}>
      <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "rgb(107,117,111)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "rgb(0, 255, 76)" }}>{value}</p>
    </div>
  );
}
