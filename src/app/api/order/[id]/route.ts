import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/db";

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

  // Don't expose sensitive fields
  return NextResponse.json({
    id: order.id,
    username: order.username,
    platform: order.platform,
    cart: order.cart,
    totalCents: order.total_cents,
    status: order.status,
    followersBefore: order.followers_before || 0,
    createdAt: order.created_at,
    deliveredAt: order.delivered_at,
    currency: order.currency || "eur",
  });
}
