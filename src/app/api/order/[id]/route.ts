import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/db";
import { getOrderStatus as getSmmStatus } from "@/lib/bulkfollows";

interface SmmOrder {
  service: string;
  qty: number;
  bulkfollows_order_id?: number;
  charge?: number;
  error?: string;
}

// Map BulkFollows status to a simpler status for the frontend
function mapBfStatus(s: string | undefined): string {
  if (!s) return "pending";
  const lower = s.toLowerCase();
  if (lower === "completed") return "delivered";
  if (lower === "partial") return "delivered";
  if (lower === "in progress" || lower === "inprogress") return "processing";
  if (lower === "processing") return "processing";
  if (lower === "pending") return "paid";
  if (lower === "canceled" || lower === "cancelled") return "cancelled";
  return "processing";
}

// Determine aggregate status from all sub-orders
function aggregateStatus(statuses: string[]): string {
  if (statuses.length === 0) return "paid";
  if (statuses.every((s) => s === "delivered")) return "delivered";
  if (statuses.some((s) => s === "cancelled")) return "processing"; // partial issue
  if (statuses.some((s) => s === "processing")) return "processing";
  return "paid";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = Number(id);
  if (!orderId || isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Fetch live BulkFollows statuses for each sub-order
  const smmOrders: SmmOrder[] = Array.isArray(order.smm_orders) ? order.smm_orders : [];
  const smmStatuses: { service: string; qty: number; status: string; remains?: number }[] = [];

  if (smmOrders.length > 0 && process.env.BULKFOLLOWS_API_KEY) {
    await Promise.all(
      smmOrders.map(async (so) => {
        if (!so.bulkfollows_order_id) {
          smmStatuses.push({ service: so.service, qty: so.qty, status: so.error ? "error" : "pending" });
          return;
        }
        try {
          const st = await getSmmStatus(so.bulkfollows_order_id);
          smmStatuses.push({
            service: so.service,
            qty: so.qty,
            status: mapBfStatus(st.status),
            remains: st.remains ? parseInt(st.remains, 10) : undefined,
          });
        } catch {
          smmStatuses.push({ service: so.service, qty: so.qty, status: "pending" });
        }
      })
    );
  }

  // Use BulkFollows aggregate status if available, otherwise fallback to DB status
  const liveStatus = smmStatuses.length > 0
    ? aggregateStatus(smmStatuses.map((s) => s.status))
    : order.status;

  return NextResponse.json({
    id: order.id,
    username: order.username,
    platform: order.platform,
    cart: order.cart,
    totalCents: order.total_cents,
    status: liveStatus,
    smmStatuses: smmStatuses.length > 0 ? smmStatuses : undefined,
    followersBefore: order.followers_before || 0,
    createdAt: order.created_at,
    deliveredAt: order.delivered_at,
    currency: order.currency || "eur",
  });
}
