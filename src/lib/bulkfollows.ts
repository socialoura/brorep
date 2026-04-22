const API_URL = "https://bulkfollows.com/api/v2";

function getKey(): string {
  const key = process.env.BULKFOLLOWS_API_KEY;
  if (!key) throw new Error("BULKFOLLOWS_API_KEY not set");
  return key;
}

async function apiCall(params: Record<string, string | number>): Promise<unknown> {
  const body = new URLSearchParams();
  body.append("key", getKey());
  for (const [k, v] of Object.entries(params)) {
    body.append(k, String(v));
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();
  return data;
}

export interface SmmOrderResult {
  order?: number;
  error?: string;
}

export async function placeOrder(serviceId: number, link: string, quantity: number): Promise<SmmOrderResult> {
  const data = await apiCall({
    action: "add",
    service: serviceId,
    link,
    quantity,
  });
  return data as SmmOrderResult;
}

export interface SmmStatusResult {
  charge?: string;
  start_count?: string;
  status?: string;
  remains?: string;
  currency?: string;
  error?: string;
}

export async function getOrderStatus(orderId: number): Promise<SmmStatusResult> {
  const data = await apiCall({ action: "status", order: orderId });
  return data as SmmStatusResult;
}

export interface SmmBalance {
  balance?: string;
  currency?: string;
  error?: string;
}

export async function getBalance(): Promise<SmmBalance> {
  const data = await apiCall({ action: "balance" });
  return data as SmmBalance;
}

export async function getServices(): Promise<unknown[]> {
  const data = await apiCall({ action: "services" });
  return data as unknown[];
}
