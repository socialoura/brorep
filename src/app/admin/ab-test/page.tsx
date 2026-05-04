"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface VariantStats {
  variant: "A" | "B";
  visitors: number;
  orders: number;
  totalRevenueCents: number;
  conversionRate: number;
  avgOrderValueCents: number;
  revenuePerVisitorCents: number;
}

interface AbTestData {
  stats: VariantStats[];
  lifts: {
    conversionRate: number;
    avgOrderValue: number;
    revenuePerVisitor: number;
  };
  significance: {
    zScore: number;
    pValue: number;
    significant95: boolean;
    winner: "A" | "B" | null;
  };
  daily: { date: string; variant: string; orders: number; revenue_cents: number }[];
  countries: { country: string; variant: string; count: number }[];
  testStartedAt: string | null;
}

function fmtMoney(cents: number): string {
  return `${(cents / 100).toFixed(2)}€`;
}

function fmtPct(v: number): string {
  return `${(v * 100).toFixed(2)}%`;
}

function fmtLift(v: number): { text: string; color: string } {
  const pct = v * 100;
  if (Math.abs(pct) < 0.5) return { text: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`, color: "rgb(150,150,150)" };
  return {
    text: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`,
    color: pct >= 0 ? "#22c55e" : "#ef4444",
  };
}

export default function AbTestPage() {
  const [password, setPassword] = useState<string>("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<AbTestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Restore password from sessionStorage (matches existing admin pattern)
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_password");
    if (stored) {
      setPassword(stored);
      setAuthed(true);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    if (!password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ab-test", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.status === 401) {
        setError("Mot de passe invalide");
        setAuthed(false);
        sessionStorage.removeItem("admin_password");
        return;
      }
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setData(json);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    if (authed) fetchStats();
  }, [authed, fetchStats]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem("admin_password", password);
    setAuthed(true);
  }

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <form onSubmit={handleLogin} style={{ background: "#1a1a1a", padding: "32px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", width: "100%", maxWidth: "360px" }}>
          <h1 style={{ color: "#fff", fontSize: "20px", margin: "0 0 20px" }}>Admin — A/B Test</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe admin"
            autoFocus
            style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: "14px", marginBottom: "12px" }}
          />
          <button type="submit" style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#fff", color: "#000", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
            Connexion
          </button>
          {error && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "12px" }}>{error}</p>}
        </form>
      </div>
    );
  }

  const a = data?.stats.find((s) => s.variant === "A");
  const b = data?.stats.find((s) => s.variant === "B");

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", padding: "20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <Link href="/admin" style={{ color: "rgb(150,150,150)", textDecoration: "none", fontSize: "13px" }}>← Admin</Link>
            <h1 style={{ fontSize: "24px", margin: "8px 0 0" }}>🧪 Test A/B Pricing</h1>
            {data?.testStartedAt && (
              <p style={{ color: "rgb(150,150,150)", fontSize: "13px", margin: "4px 0 0" }}>
                Démarré le {new Date(data.testStartedAt).toLocaleDateString("fr-FR", { dateStyle: "long" })}
              </p>
            )}
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            style={{ padding: "10px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", fontSize: "13px" }}
          >
            {loading ? "..." : "🔄 Actualiser"}
          </button>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", color: "#ef4444" }}>
            {error}
          </div>
        )}

        {data && a && b && (
          <>
            {/* Significance banner */}
            <div style={{
              background: data.significance.significant95 ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${data.significance.significant95 ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
              padding: "16px 20px",
              borderRadius: "12px",
              marginBottom: "24px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "13px", color: "rgb(150,150,150)", marginBottom: "4px" }}>Significance statistique</div>
                  <div style={{ fontSize: "18px", fontWeight: 600 }}>
                    {data.significance.significant95 ? "✅ Test significatif (95% confiance)" : "⏳ Pas encore significatif"}
                    {data.significance.winner && (
                      <span style={{ marginLeft: "12px", color: data.significance.winner === "B" ? "#22c55e" : "#3b82f6" }}>
                        Winner : Variant {data.significance.winner}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "rgb(150,150,150)" }}>
                  Z-score : {data.significance.zScore.toFixed(2)} | p-value : {data.significance.pValue.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Main metrics grid */}
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 1fr", gap: "8px", marginBottom: "24px" }}>
              {/* Header row */}
              <div></div>
              <div style={{ fontSize: "13px", color: "rgb(150,150,150)", padding: "12px", textAlign: "center", fontWeight: 600 }}>Variant A (control)</div>
              <div style={{ fontSize: "13px", color: "rgb(150,150,150)", padding: "12px", textAlign: "center", fontWeight: 600 }}>Variant B (test)</div>
              <div style={{ fontSize: "13px", color: "rgb(150,150,150)", padding: "12px", textAlign: "center", fontWeight: 600 }}>Δ Lift</div>

              {/* Visitors */}
              <div style={{ padding: "12px", fontSize: "13px", color: "rgb(180,180,180)" }}>Visiteurs</div>
              <Cell value={a.visitors.toLocaleString()} />
              <Cell value={b.visitors.toLocaleString()} highlight />
              <Cell value={a.visitors === 0 ? "—" : `${(((b.visitors - a.visitors) / a.visitors) * 100).toFixed(1)}%`} muted />

              {/* Orders */}
              <div style={{ padding: "12px", fontSize: "13px", color: "rgb(180,180,180)" }}>Commandes</div>
              <Cell value={a.orders.toLocaleString()} />
              <Cell value={b.orders.toLocaleString()} highlight />
              <Cell value="—" muted />

              {/* Conversion */}
              <div style={{ padding: "12px", fontSize: "13px", color: "rgb(180,180,180)" }}>Taux de conversion</div>
              <Cell value={fmtPct(a.conversionRate)} />
              <Cell value={fmtPct(b.conversionRate)} highlight />
              <LiftCell lift={data.lifts.conversionRate} />

              {/* AOV */}
              <div style={{ padding: "12px", fontSize: "13px", color: "rgb(180,180,180)" }}>Panier moyen (AOV)</div>
              <Cell value={fmtMoney(a.avgOrderValueCents)} />
              <Cell value={fmtMoney(b.avgOrderValueCents)} highlight />
              <LiftCell lift={data.lifts.avgOrderValue} />

              {/* Revenue */}
              <div style={{ padding: "12px", fontSize: "13px", color: "rgb(180,180,180)" }}>CA total</div>
              <Cell value={fmtMoney(a.totalRevenueCents)} />
              <Cell value={fmtMoney(b.totalRevenueCents)} highlight />
              <Cell value="—" muted />

              {/* Revenue per visitor */}
              <div style={{ padding: "12px", fontSize: "13px", color: "#fff", fontWeight: 600 }}>Revenue / visiteur ⭐</div>
              <Cell value={fmtMoney(a.revenuePerVisitorCents)} bold />
              <Cell value={fmtMoney(b.revenuePerVisitorCents)} highlight bold />
              <LiftCell lift={data.lifts.revenuePerVisitor} bold />
            </div>

            {/* Daily breakdown */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "16px", margin: "0 0 16px" }}>📊 Évolution journalière (30 derniers jours)</h3>
              {data.daily.length === 0 ? (
                <p style={{ color: "rgb(150,150,150)", fontSize: "13px" }}>Pas encore de données journalières</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", fontSize: "12px" }}>
                  <div style={{ color: "rgb(150,150,150)", padding: "8px" }}>Date</div>
                  <div style={{ color: "rgb(150,150,150)", padding: "8px" }}>Variant</div>
                  <div style={{ color: "rgb(150,150,150)", padding: "8px" }}>Commandes</div>
                  <div style={{ color: "rgb(150,150,150)", padding: "8px" }}>CA</div>
                  {data.daily.slice(0, 30).map((d, i) => (
                    <Daily key={`${d.date}-${d.variant}-${i}`} d={d} />
                  ))}
                </div>
              )}
            </div>

            {/* Top countries */}
            {data.countries.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px" }}>
                <h3 style={{ fontSize: "16px", margin: "0 0 16px" }}>🌍 Top pays par variant</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px" }}>
                  {data.countries.slice(0, 20).map((c, i) => (
                    <div key={`${c.country}-${c.variant}-${i}`} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "6px", fontSize: "13px" }}>
                      <span>{c.country} ({c.variant})</span>
                      <span style={{ color: "rgb(180,180,180)" }}>{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Volume warning */}
            {(a.visitors < 100 || b.visitors < 100) && (
              <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", padding: "12px 16px", borderRadius: "8px", marginTop: "16px", fontSize: "13px", color: "#f59e0b" }}>
                ⚠️ Volume insuffisant — Il faut au moins 100 visiteurs par variant pour des résultats fiables. Continue à observer encore quelques jours.
              </div>
            )}
          </>
        )}

        {!data && !error && !loading && authed && (
          <p style={{ color: "rgb(150,150,150)" }}>Chargement…</p>
        )}
      </div>
    </div>
  );
}

function Cell({ value, highlight, bold, muted }: { value: string; highlight?: boolean; bold?: boolean; muted?: boolean }) {
  return (
    <div style={{
      padding: "12px",
      textAlign: "center",
      background: highlight ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.02)",
      borderRadius: "8px",
      fontSize: bold ? "16px" : "14px",
      fontWeight: bold ? 700 : 500,
      color: muted ? "rgb(120,120,120)" : "#fff",
    }}>
      {value}
    </div>
  );
}

function LiftCell({ lift, bold }: { lift: number; bold?: boolean }) {
  const f = fmtLift(lift);
  return (
    <div style={{
      padding: "12px",
      textAlign: "center",
      background: "rgba(255,255,255,0.02)",
      borderRadius: "8px",
      fontSize: bold ? "16px" : "14px",
      fontWeight: bold ? 700 : 600,
      color: f.color,
    }}>
      {f.text}
    </div>
  );
}

function Daily({ d }: { d: { date: string; variant: string; orders: number; revenue_cents: number } }) {
  return (
    <>
      <div style={{ padding: "8px" }}>{new Date(d.date).toLocaleDateString("fr-FR", { dateStyle: "short" })}</div>
      <div style={{ padding: "8px", color: d.variant === "B" ? "#3b82f6" : "rgb(180,180,180)" }}>{d.variant}</div>
      <div style={{ padding: "8px" }}>{d.orders}</div>
      <div style={{ padding: "8px" }}>{fmtMoney(Number(d.revenue_cents))}</div>
    </>
  );
}
