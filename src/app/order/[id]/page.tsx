"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useTranslation, fmtPrice } from "@/lib/i18n";
import type { Currency } from "@/lib/i18n";

interface SmmStatus {
  service: string;
  qty: number;
  status: string;
  remains?: number;
}

interface OrderData {
  id: number;
  username: string;
  platform: string;
  cart: { service: string; label: string; qty: number; price: number; liveStartAt?: string }[];
  totalCents: number;
  status: string;
  smmStatuses?: SmmStatus[];
  followersBefore: number;
  createdAt: string;
  deliveredAt: string | null;
  currency?: string;
}

function fmtQty(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000) + "K";
  return String(n);
}

function OrderPageInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, lang, href } = useTranslation();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [followersNow, setFollowersNow] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const STATUS_STEPS = [
    { key: "pending", label: t("orderStatus.pending") },
    { key: "paid", label: t("orderStatus.paid") },
    { key: "processing", label: t("orderStatus.processing") },
    { key: "delivered", label: t("orderStatus.delivered") },
  ];

  function getStepIndex(status: string): number {
    const idx = STATUS_STEPS.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 1;
  }

  // Fetch order
  useEffect(() => {
    fetch(`/api/order/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrder(data);
      })
      .catch(() => setError(t("orderDetail.loadError")));
  }, [id]);

  // Live re-scan followers
  useEffect(() => {
    if (!order) return;
    setScanning(true);
    const endpoint = order.platform === "instagram"
      ? `/api/scraper-instagram?username=${encodeURIComponent(order.username)}`
      : `/api/scraper-tiktok?username=${encodeURIComponent(order.username)}`;

    fetch(endpoint)
      .then((r) => r.json())
      .then((data) => {
        if (data.followersCount !== undefined) {
          setFollowersNow(data.followersCount);
        }
      })
      .catch(() => {})
      .finally(() => setScanning(false));
  }, [order]);

  const green = "rgb(105, 201, 208)";
  const greenDim = "rgb(79, 179, 186)";

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "32px" }}>
          <p style={{ fontSize: "40px", marginBottom: "16px" }}>😕</p>
          <p style={{ fontSize: "16px", color: "#ef4444", fontWeight: 600 }}>{error}</p>
          <a href={href("/")} style={{ display: "inline-block", marginTop: "16px", fontSize: "13px", color: greenDim, textDecoration: "underline" }}>{t("orders.backHome")}</a>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid rgba(105,201,208,0.2)", borderTopColor: greenDim, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const stepIndex = getStepIndex(order.status);
  const gain = followersNow !== null && order.followersBefore > 0
    ? followersNow - order.followersBefore
    : null;
  const gainPercent = gain !== null && order.followersBefore > 0
    ? ((gain / order.followersBefore) * 100).toFixed(1)
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#050505", fontFamily: "inherit", color: "#e8f7ed" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "40px 20px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: 800, color: "#fff" }}>
            Fan<span style={{ color: green }}>ovaly</span>
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "rgb(107,117,111)" }}>{t("orderDetail.tracking")} #{order.id}</p>
        </div>

        {/* Status bar */}
        <div style={{ background: "#0e1512", border: "1px solid rgba(105,201,208,0.15)", borderRadius: "16px", padding: "24px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginBottom: "16px" }}>
            {/* Progress line */}
            <div style={{ position: "absolute", top: "14px", left: "16px", right: "16px", height: "2px", background: "rgba(255,255,255,0.06)" }} />
            <div style={{ position: "absolute", top: "14px", left: "16px", height: "2px", background: green, width: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%`, transition: "width 0.6s ease" }} />

            {STATUS_STEPS.map((step, i) => {
              const active = i <= stepIndex;
              const current = i === stepIndex;
              return (
                <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1, flex: 1 }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: active ? green : "rgba(255,255,255,0.06)",
                    border: current ? `2px solid ${green}` : "2px solid transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: current ? `0 0 12px rgba(105,201,208,0.3)` : "none",
                    transition: "all 0.3s",
                  }}>
                    {active && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span style={{ marginTop: "8px", fontSize: "10px", fontWeight: 600, color: active ? green : "rgb(107,117,111)", textAlign: "center", whiteSpace: "nowrap" }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status text */}
          <div style={{ textAlign: "center", padding: "8px 0 0 0" }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#fff" }}>
              {order.status === "delivered" ? t("orderDetail.statusDelivered") :
               order.status === "processing" ? t("orderDetail.statusProcessing") :
               order.status === "paid" ? t("orderDetail.statusPaid") :
               t("orderDetail.statusPending")}
            </p>
            {order.deliveredAt && (
              <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "rgb(107,117,111)" }}>
                {t("orderDetail.deliveredOn")} {new Date(order.deliveredAt).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
        </div>

        {/* Before/After card */}
        {order.followersBefore > 0 && (
          <div style={{ background: "#0e1512", border: "1px solid rgba(105,201,208,0.15)", borderRadius: "16px", padding: "24px", marginBottom: "16px" }}>
            <p style={{ margin: "0 0 16px 0", fontSize: "12px", fontWeight: 600, color: "rgb(169,181,174)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>
              📊 {t("orderDetail.evolution")} @{order.username}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Before */}
              <div style={{ flex: 1, textAlign: "center" }}>
                <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "rgb(107,117,111)", textTransform: "uppercase" }}>{t("orderDetail.before")}</p>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "rgb(169,181,174)" }}>
                  {fmtQty(order.followersBefore)}
                </p>
                <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "rgb(107,117,111)" }}>followers</p>
              </div>

              {/* Arrow */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </div>

              {/* After */}
              <div style={{ flex: 1, textAlign: "center" }}>
                <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "rgb(107,117,111)", textTransform: "uppercase" }}>{t("orderDetail.now")}</p>
                {scanning ? (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ width: "20px", height: "20px", border: "2px solid rgba(105,201,208,0.2)", borderTopColor: greenDim, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  </div>
                ) : followersNow !== null ? (
                  <>
                    <p style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: green }}>
                      {fmtQty(followersNow)}
                    </p>
                    <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "rgb(107,117,111)" }}>followers</p>
                  </>
                ) : (
                  <p style={{ margin: 0, fontSize: "14px", color: "rgb(107,117,111)" }}>—</p>
                )}
              </div>
            </div>

            {/* Gain bar */}
            {gain !== null && gain > 0 && (
              <div style={{ marginTop: "16px", padding: "12px", background: "rgba(105,201,208,0.06)", borderRadius: "10px", textAlign: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: green }}>+{fmtQty(gain)} {t("orderDetail.followers")}</span>
                <span style={{ fontSize: "12px", color: "rgb(169,181,174)", marginLeft: "8px" }}>(+{gainPercent}%)</span>
              </div>
            )}
          </div>
        )}

        {/* Per-service live status */}
        {order.smmStatuses && order.smmStatuses.length > 0 && (
          <div style={{ background: "#0e1512", border: "1px solid rgba(105,201,208,0.15)", borderRadius: "16px", padding: "24px", marginBottom: "16px" }}>
            <p style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: 600, color: "rgb(169,181,174)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("orderDetail.serviceStatus")}
            </p>
            {order.smmStatuses.map((ss, i) => {
              const statusColor = ss.status === "delivered" ? "#22c55e" : ss.status === "processing" ? "#f59e0b" : ss.status === "error" || ss.status === "cancelled" ? "#ef4444" : green;
              const statusLabel = ss.status === "delivered" ? t("orderStatus.delivered") : ss.status === "processing" ? t("orderStatus.processing") : ss.status === "error" || ss.status === "cancelled" ? t("orderStatus.error") : t("orderStatus.paid");
              const delivered = ss.remains !== undefined ? ss.qty - ss.remains : (ss.status === "delivered" ? ss.qty : 0);
              const pct = ss.qty > 0 ? Math.min(100, Math.round((delivered / ss.qty) * 100)) : 0;
              return (
                <div key={i} style={{ marginBottom: i < order.smmStatuses!.length - 1 ? "14px" : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{fmtQty(ss.qty)} {ss.service}</span>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: statusColor, textTransform: "uppercase" }}>{statusLabel}</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.06)" }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: "3px", background: statusColor, transition: "width 0.6s ease" }} />
                  </div>
                  <p style={{ margin: "4px 0 0 0", fontSize: "10px", color: "rgb(107,117,111)" }}>{delivered}/{fmtQty(ss.qty)} ({pct}%)</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Cart recap */}
        <div style={{ background: "#0e1512", border: "1px solid rgba(105,201,208,0.15)", borderRadius: "16px", padding: "24px", marginBottom: "16px" }}>
          <p style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: 600, color: "rgb(169,181,174)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("orderDetail.orderDetail")}
          </p>
          {Array.isArray(order.cart) && order.cart.map((item, i) => (
            <div key={i} style={{ padding: "6px 0", borderBottom: i < order.cart.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "#e8f7ed" }}>{fmtQty(item.qty)} {item.label}</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: greenDim }}>{fmtPrice(item.price, (order.currency || "eur") as Currency)}</span>
              </div>
              {item.liveStartAt && (
                <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "rgb(145,71,255)", fontWeight: 600 }}>
                  🔴 {lang === "en" ? "Live starts" : "Début du live"}: {new Date(item.liveStartAt).toLocaleString(lang === "en" ? "en-US" : "fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(105,201,208,0.1)" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{t("service.total")}</span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: green }}>{fmtPrice(order.totalCents / 100, (order.currency || "eur") as Currency)}</span>
          </div>
          <p style={{ margin: "8px 0 0 0", fontSize: "11px", color: "rgb(107,117,111)" }}>
            {t("orderDetail.orderedOn")} {new Date(order.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <a
            href={href("/?reset=1")}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "14px 32px", borderRadius: "14px", border: "none",
              fontWeight: 700, fontSize: "15px", fontFamily: "inherit",
              color: "#000", textDecoration: "none",
              background: "linear-gradient(135deg, rgb(79,179,186), rgb(105,201,208))",
              boxShadow: "0 10px 30px rgba(105,201,208,0.25)",
            }}
          >
            🚀 {t("orderDetail.relaunchBoost")}
          </a>
          <a
            href={href("/orders")}
            style={{ fontSize: "12px", color: "rgb(169,181,174)", textDecoration: "underline" }}
          >
            {t("success.viewAllOrders")}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <OrderPageInner params={params} />
    </Suspense>
  );
}
