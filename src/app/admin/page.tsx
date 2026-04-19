"use client";

import { useState, useEffect, useCallback } from "react";

type Tab = "analytics" | "orders" | "pricing" | "combos";

interface Order {
  id: number;
  stripe_payment_intent_id: string;
  email: string;
  username: string;
  platform: string;
  cart: { service: string; label: string; qty: number; price: number }[];
  post_assignments: unknown;
  total_cents: number;
  status: string;
  created_at: string;
}

interface PricingItem {
  id: number;
  service: string;
  qty: number;
  price: number;
  active: boolean;
}

interface ComboItem {
  service: string;
  qty: number;
}

interface ComboPack {
  id: number;
  name: string;
  items: ComboItem[];
  discount_percent: number;
  active: boolean;
}

interface Analytics {
  totalOrders: number;
  byStatus: { status: string; count: string }[];
  totalRevenueCents: number;
  ordersToday: number;
  revenueTodayCents: number;
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
  const [combos, setCombos] = useState<ComboPack[]>([]);
  const [newCombo, setNewCombo] = useState({ name: "", discount: "20", items: [{ service: "followers", qty: "500" }, { service: "likes", qty: "500" }, { service: "views", qty: "5000" }] });

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
  }, [tab, authed, fetchAnalytics, fetchOrders, fetchPricing, fetchCombos]);

  const updatePrice = async (id: number, newPrice: number) => {
    await fetch("/api/admin/pricing", {
      method: "PUT",
      headers,
      body: JSON.stringify({ id, price: newPrice }),
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
          {(["analytics", "orders", "pricing", "combos"] as Tab[]).map((t) => (
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
              {t === "analytics" ? "Analytics" : t === "orders" ? "Commandes" : t === "pricing" ? "Prix" : "Combos"}
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
            <KpiCard label="Commandes aujourd'hui" value={String(analytics.ordersToday)} />
            <KpiCard label="Revenu aujourd'hui" value={`${(analytics.revenueTodayCents / 100).toFixed(2)}€`} />
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
                  <th style={{ padding: "8px", textAlign: "center", color: "rgb(107,117,111)" }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "8px", color: "rgb(107,117,111)" }}>#{o.id}</td>
                    <td style={{ padding: "8px" }}>{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                    <td style={{ padding: "8px", fontWeight: 600 }}>@{o.username}</td>
                    <td style={{ padding: "8px", color: "rgb(169,181,174)" }}>{o.email || "—"}</td>
                    <td style={{ padding: "8px" }}>{o.platform}</td>
                    <td style={{ padding: "8px", color: "rgb(169,181,174)" }}>
                      {Array.isArray(o.cart) ? o.cart.map((c) => `${c.qty} ${c.label}`).join(", ") : "—"}
                    </td>
                    <td style={{ padding: "8px", textAlign: "right", fontWeight: 600, color: green }}>{(o.total_cents / 100).toFixed(2)}€</td>
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
                            style={{ padding: "2px 4px", borderRadius: "4px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "10px", fontFamily: "inherit", cursor: "pointer" }}
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
                        <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                          <input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            style={{ width: "70px", padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(0,210,106,0.3)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "13px", outline: "none", fontFamily: "inherit" }}
                          />
                          <button
                            onClick={() => updatePrice(item.id, Number(editPrice))}
                            style={{ padding: "4px 8px", borderRadius: "6px", border: "none", backgroundColor: green, color: "#000", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => { setEditingId(item.id); setEditPrice(String(item.price)); }}
                          style={{ fontSize: "14px", fontWeight: 600, color: green, cursor: "pointer", marginBottom: "8px" }}
                        >
                          {Number(item.price).toFixed(2)}€
                        </div>
                      )}

                      <button
                        onClick={() => toggleActive(item.id, item.active)}
                        style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "transparent", color: "rgb(107,117,111)", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        {item.active ? "Désactiver" : "Activer"}
                      </button>
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
                placeholder="Nom (ex: Pack Croissance)"
                value={newCombo.name}
                onChange={(e) => setNewCombo({ ...newCombo, name: e.target.value })}
                style={{ flex: 1, minWidth: "160px", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
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
                  style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid rgba(0,210,106,0.2)", backgroundColor: "rgba(0,180,53,0.04)", color: "#e8f7ed", fontSize: "12px", fontFamily: "inherit" }}
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
                    body: JSON.stringify({ name: newCombo.name, items, discountPercent: Number(newCombo.discount) || 20 }),
                  });
                  setNewCombo({ name: "", discount: "20", items: [{ service: "followers", qty: "500" }, { service: "likes", qty: "500" }, { service: "views", qty: "5000" }] });
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
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#fff" }}>{combo.name}</p>
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
