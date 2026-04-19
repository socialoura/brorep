import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS pricing (
      id SERIAL PRIMARY KEY,
      service VARCHAR(20) NOT NULL,
      qty INTEGER NOT NULL,
      price NUMERIC(8,2) NOT NULL,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(service, qty)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      stripe_payment_intent_id VARCHAR(255),
      email VARCHAR(255),
      username VARCHAR(100) NOT NULL,
      platform VARCHAR(20) NOT NULL,
      cart JSONB NOT NULL,
      post_assignments JSONB,
      total_cents INTEGER NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      followers_before INTEGER DEFAULT 0,
      delivered_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Add columns if they don't exist (for existing DBs)
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS followers_before INTEGER DEFAULT 0`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ`;

  await sql`
    CREATE TABLE IF NOT EXISTS loyalty (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      points INTEGER DEFAULT 0,
      total_earned INTEGER DEFAULT 0,
      total_redeemed INTEGER DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS combo_packs (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      items JSONB NOT NULL,
      discount_percent INTEGER NOT NULL DEFAULT 20,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS scheduled_emails (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id),
      email VARCHAR(255) NOT NULL,
      username VARCHAR(100) NOT NULL,
      platform VARCHAR(20) NOT NULL,
      template VARCHAR(20) NOT NULL,
      send_at TIMESTAMPTZ NOT NULL,
      sent BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Seed pricing if empty
  const existing = await sql`SELECT COUNT(*) as cnt FROM pricing`;
  if (Number(existing[0].cnt) === 0) {
    const packs = [
      // Followers
      { service: "followers", qty: 100, price: 2.99 },
      { service: "followers", qty: 250, price: 5.99 },
      { service: "followers", qty: 500, price: 9.99 },
      { service: "followers", qty: 1000, price: 16.99 },
      { service: "followers", qty: 2500, price: 34.99 },
      { service: "followers", qty: 5000, price: 59.99 },
      { service: "followers", qty: 10000, price: 99.99 },
      { service: "followers", qty: 25000, price: 199.99 },
      // Likes
      { service: "likes", qty: 100, price: 1.99 },
      { service: "likes", qty: 250, price: 3.99 },
      { service: "likes", qty: 500, price: 6.99 },
      { service: "likes", qty: 1000, price: 11.99 },
      { service: "likes", qty: 2500, price: 24.99 },
      { service: "likes", qty: 5000, price: 44.99 },
      { service: "likes", qty: 10000, price: 79.99 },
      { service: "likes", qty: 25000, price: 149.99 },
      // Views
      { service: "views", qty: 500, price: 1.99 },
      { service: "views", qty: 1000, price: 3.49 },
      { service: "views", qty: 2500, price: 7.99 },
      { service: "views", qty: 5000, price: 12.99 },
      { service: "views", qty: 10000, price: 22.99 },
      { service: "views", qty: 25000, price: 49.99 },
      { service: "views", qty: 50000, price: 89.99 },
      { service: "views", qty: 100000, price: 149.99 },
      // YouTube Subscribers
      { service: "yt_subscribers", qty: 100, price: 3.99 },
      { service: "yt_subscribers", qty: 250, price: 7.99 },
      { service: "yt_subscribers", qty: 500, price: 13.99 },
      { service: "yt_subscribers", qty: 1000, price: 24.99 },
      { service: "yt_subscribers", qty: 2500, price: 49.99 },
      { service: "yt_subscribers", qty: 5000, price: 89.99 },
      // YouTube Likes
      { service: "yt_likes", qty: 100, price: 2.49 },
      { service: "yt_likes", qty: 250, price: 4.99 },
      { service: "yt_likes", qty: 500, price: 8.99 },
      { service: "yt_likes", qty: 1000, price: 14.99 },
      { service: "yt_likes", qty: 2500, price: 29.99 },
      { service: "yt_likes", qty: 5000, price: 54.99 },
      // YouTube Views
      { service: "yt_views", qty: 500, price: 2.49 },
      { service: "yt_views", qty: 1000, price: 4.49 },
      { service: "yt_views", qty: 2500, price: 9.99 },
      { service: "yt_views", qty: 5000, price: 16.99 },
      { service: "yt_views", qty: 10000, price: 29.99 },
      { service: "yt_views", qty: 25000, price: 59.99 },
      { service: "yt_views", qty: 50000, price: 99.99 },
    ];

    for (const p of packs) {
      await sql`INSERT INTO pricing (service, qty, price) VALUES (${p.service}, ${p.qty}, ${p.price}) ON CONFLICT DO NOTHING`;
    }
  }
}

export async function createOrder(params: {
  stripePaymentIntentId: string;
  email: string;
  username: string;
  platform: string;
  cart: unknown;
  postAssignments: unknown;
  totalCents: number;
  status?: string;
  followersBefore?: number;
}) {
  const result = await sql`
    INSERT INTO orders (stripe_payment_intent_id, email, username, platform, cart, post_assignments, total_cents, status, followers_before)
    VALUES (
      ${params.stripePaymentIntentId},
      ${params.email},
      ${params.username},
      ${params.platform},
      ${JSON.stringify(params.cart)},
      ${params.postAssignments ? JSON.stringify(params.postAssignments) : null},
      ${params.totalCents},
      ${params.status || "pending"},
      ${params.followersBefore || 0}
    )
    RETURNING id
  `;
  return result[0].id;
}

export async function updateOrderStatus(stripePaymentIntentId: string, status: string) {
  await sql`UPDATE orders SET status = ${status} WHERE stripe_payment_intent_id = ${stripePaymentIntentId}`;
}

export async function getOrderByPaymentIntent(piId: string) {
  const rows = await sql`SELECT * FROM orders WHERE stripe_payment_intent_id = ${piId} LIMIT 1`;
  return rows[0] || null;
}

export async function getOrderById(id: number) {
  const rows = await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
  return rows[0] || null;
}

export async function updateOrderStatusById(id: number, status: string) {
  if (status === "delivered") {
    await sql`UPDATE orders SET status = ${status}, delivered_at = NOW() WHERE id = ${id}`;
  } else {
    await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
  }
}

// ── Loyalty ──

export async function getLoyaltyPoints(email: string): Promise<number> {
  const rows = await sql`SELECT points FROM loyalty WHERE email = ${email.toLowerCase()} LIMIT 1`;
  return rows[0] ? Number(rows[0].points) : 0;
}

export async function addLoyaltyPoints(email: string, points: number) {
  await sql`
    INSERT INTO loyalty (email, points, total_earned)
    VALUES (${email.toLowerCase()}, ${points}, ${points})
    ON CONFLICT (email) DO UPDATE
    SET points = loyalty.points + ${points},
        total_earned = loyalty.total_earned + ${points},
        updated_at = NOW()
  `;
}

// ── Combo Packs ──

export async function getActiveCombos() {
  return await sql`SELECT * FROM combo_packs WHERE active = true ORDER BY created_at DESC`;
}

export async function getAllCombos() {
  return await sql`SELECT * FROM combo_packs ORDER BY created_at DESC`;
}

export async function createCombo(params: { name: string; items: unknown; discountPercent: number }) {
  const result = await sql`
    INSERT INTO combo_packs (name, items, discount_percent)
    VALUES (${params.name}, ${JSON.stringify(params.items)}, ${params.discountPercent})
    RETURNING id
  `;
  return result[0].id;
}

export async function updateCombo(id: number, params: { name?: string; items?: unknown; discountPercent?: number; active?: boolean }) {
  if (params.name !== undefined) await sql`UPDATE combo_packs SET name = ${params.name} WHERE id = ${id}`;
  if (params.items !== undefined) await sql`UPDATE combo_packs SET items = ${JSON.stringify(params.items)} WHERE id = ${id}`;
  if (params.discountPercent !== undefined) await sql`UPDATE combo_packs SET discount_percent = ${params.discountPercent} WHERE id = ${id}`;
  if (params.active !== undefined) await sql`UPDATE combo_packs SET active = ${params.active} WHERE id = ${id}`;
}

export async function deleteCombo(id: number) {
  await sql`DELETE FROM combo_packs WHERE id = ${id}`;
}

export async function redeemLoyaltyPoints(email: string, points: number): Promise<boolean> {
  const current = await getLoyaltyPoints(email);
  if (current < points) return false;
  await sql`
    UPDATE loyalty
    SET points = points - ${points},
        total_redeemed = total_redeemed + ${points},
        updated_at = NOW()
    WHERE email = ${email.toLowerCase()}
  `;
  return true;
}
