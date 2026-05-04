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
  await sql`ALTER TABLE pricing ADD COLUMN IF NOT EXISTS price_usd NUMERIC(8,2) DEFAULT 0`;
  await sql`ALTER TABLE pricing ADD COLUMN IF NOT EXISTS price_gbp NUMERIC(8,2) DEFAULT 0`;
  await sql`ALTER TABLE pricing ADD COLUMN IF NOT EXISTS price_cad NUMERIC(8,2) DEFAULT 0`;
  await sql`ALTER TABLE pricing ADD COLUMN IF NOT EXISTS price_nzd NUMERIC(8,2) DEFAULT 0`;
  await sql`ALTER TABLE pricing ADD COLUMN IF NOT EXISTS price_aud NUMERIC(8,2) DEFAULT 0`;
  await sql`ALTER TABLE pricing ADD COLUMN IF NOT EXISTS price_chf NUMERIC(8,2) DEFAULT 0`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'eur'`;
  await sql`ALTER TABLE combo_packs ADD COLUMN IF NOT EXISTS name_en VARCHAR(100) DEFAULT ''`;
  await sql`ALTER TABLE combo_packs ADD COLUMN IF NOT EXISTS platform VARCHAR(20) DEFAULT 'tiktok'`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cost_cents INTEGER DEFAULT 0`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT NULL`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS smm_orders JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS lang VARCHAR(2) DEFAULT 'fr'`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS followup_day1_sent BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS followup_delivered_sent BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant VARCHAR(1) DEFAULT NULL`;

  // A/B test visitors tracking
  await sql`
    CREATE TABLE IF NOT EXISTS ab_visitors (
      visitor_id VARCHAR(64) PRIMARY KEY,
      variant VARCHAR(1) NOT NULL,
      first_seen TIMESTAMPTZ DEFAULT NOW(),
      last_seen TIMESTAMPTZ DEFAULT NOW(),
      country VARCHAR(2),
      lang VARCHAR(2),
      visits INTEGER DEFAULT 1
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_ab_visitors_variant ON ab_visitors(variant)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_ab_visitors_first_seen ON ab_visitors(first_seen)`;

  await sql`
    CREATE TABLE IF NOT EXISTS smm_config (
      id SERIAL PRIMARY KEY,
      platform VARCHAR(20) NOT NULL,
      service VARCHAR(30) NOT NULL,
      bulkfollows_service_id INTEGER NOT NULL,
      enabled BOOLEAN DEFAULT true,
      UNIQUE(platform, service)
    )
  `;

  // Global SMM toggle stored as a special row
  await sql`
    CREATE TABLE IF NOT EXISTS smm_settings (
      key VARCHAR(50) PRIMARY KEY,
      value VARCHAR(255) NOT NULL
    )
  `;
  // Seed global toggle if missing
  const smmToggle = await sql`SELECT key FROM smm_settings WHERE key = 'auto_order_enabled'`;
  if (smmToggle.length === 0) {
    await sql`INSERT INTO smm_settings (key, value) VALUES ('auto_order_enabled', 'true')`;
  }

  // Seed smm_config if empty
  const smmCount = await sql`SELECT COUNT(*) as cnt FROM smm_config`;
  if (Number(smmCount[0].cnt) === 0) {
    const mappings = [
      { platform: "tiktok", service: "followers", id: 14372 },
      { platform: "tiktok", service: "likes", id: 14256 },
      { platform: "tiktok", service: "views", id: 14563 },
      { platform: "instagram", service: "followers", id: 14565 },
      { platform: "instagram", service: "likes", id: 14517 },
      { platform: "instagram", service: "views", id: 4996 },
      { platform: "youtube", service: "yt_subscribers", id: 887 },
      { platform: "youtube", service: "yt_likes", id: 14547 },
      { platform: "youtube", service: "yt_views", id: 14370 },
    ];
    for (const m of mappings) {
      await sql`INSERT INTO smm_config (platform, service, bulkfollows_service_id) VALUES (${m.platform}, ${m.service}, ${m.id}) ON CONFLICT DO NOTHING`;
    }
  }

  // Ensure sp_streams exists in smm_config (migration for existing DBs)
  const spSmmCheck = await sql`SELECT COUNT(*) as cnt FROM smm_config WHERE service = 'sp_streams'`;
  if (Number(spSmmCheck[0].cnt) === 0) {
    await sql`INSERT INTO smm_config (platform, service, bulkfollows_service_id) VALUES ('spotify', 'sp_streams', 0)`;
  }

  // Ensure X (Twitter) services exist in smm_config (migration for existing DBs)
  const xSmmCheck = await sql`SELECT COUNT(*) as cnt FROM smm_config WHERE platform = 'x'`;
  if (Number(xSmmCheck[0].cnt) === 0) {
    const xMappings = [
      { service: "x_followers", id: 0 },
      { service: "x_likes", id: 0 },
      { service: "x_retweets", id: 0 },
    ];
    for (const m of xMappings) {
      await sql`INSERT INTO smm_config (platform, service, bulkfollows_service_id) VALUES ('x', ${m.service}, ${m.id}) ON CONFLICT DO NOTHING`;
    }
  }

  // Ensure Twitch services exist in smm_config (migration for existing DBs)
  const twSmmCheck = await sql`SELECT COUNT(*) as cnt FROM smm_config WHERE platform = 'twitch'`;
  if (Number(twSmmCheck[0].cnt) === 0) {
    const twMappings = [
      { service: "tw_followers", id: 0 },
      { service: "tw_live_viewers", id: 0 }, // manual handling, kept for visibility
    ];
    for (const m of twMappings) {
      await sql`INSERT INTO smm_config (platform, service, bulkfollows_service_id) VALUES ('twitch', ${m.service}, ${m.id}) ON CONFLICT DO NOTHING`;
    }
  }

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

  await sql`
    CREATE TABLE IF NOT EXISTS upsells (
      id SERIAL PRIMARY KEY,
      service VARCHAR(30) NOT NULL,
      qty INTEGER NOT NULL,
      label VARCHAR(100) NOT NULL DEFAULT '',
      label_en VARCHAR(100) NOT NULL DEFAULT '',
      active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Visits by country (for conversion rate analytics)
  await sql`
    CREATE TABLE IF NOT EXISTS visits_by_country (
      id SERIAL PRIMARY KEY,
      country VARCHAR(2) NOT NULL,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      count INTEGER NOT NULL DEFAULT 1,
      UNIQUE(country, date)
    )
  `;

  // Ad costs (Google Ads etc.) per day in EUR cents
  await sql`
    CREATE TABLE IF NOT EXISTS ad_costs (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL UNIQUE,
      cost_cents INTEGER NOT NULL DEFAULT 0,
      note VARCHAR(255) DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Seed pricing if empty
  const existing = await sql`SELECT COUNT(*) as cnt FROM pricing`;
  if (Number(existing[0].cnt) === 0) {
    const packs = [
      // Followers
      { service: "followers", qty: 100, price: 2.99, price_usd: 2.99 },
      { service: "followers", qty: 250, price: 5.99, price_usd: 5.99 },
      { service: "followers", qty: 500, price: 9.99, price_usd: 9.99 },
      { service: "followers", qty: 1000, price: 16.99, price_usd: 16.99 },
      { service: "followers", qty: 2500, price: 34.99, price_usd: 34.99 },
      { service: "followers", qty: 5000, price: 59.99, price_usd: 59.99 },
      { service: "followers", qty: 10000, price: 99.99, price_usd: 99.99 },
      { service: "followers", qty: 25000, price: 199.99, price_usd: 199.99 },
      // Likes
      { service: "likes", qty: 100, price: 1.99, price_usd: 1.99 },
      { service: "likes", qty: 250, price: 3.99, price_usd: 3.99 },
      { service: "likes", qty: 500, price: 6.99, price_usd: 6.99 },
      { service: "likes", qty: 1000, price: 11.99, price_usd: 11.99 },
      { service: "likes", qty: 2500, price: 24.99, price_usd: 24.99 },
      { service: "likes", qty: 5000, price: 44.99, price_usd: 44.99 },
      { service: "likes", qty: 10000, price: 79.99, price_usd: 79.99 },
      { service: "likes", qty: 25000, price: 149.99, price_usd: 149.99 },
      // Views
      { service: "views", qty: 500, price: 1.99, price_usd: 1.99 },
      { service: "views", qty: 1000, price: 3.49, price_usd: 3.49 },
      { service: "views", qty: 2500, price: 7.99, price_usd: 7.99 },
      { service: "views", qty: 5000, price: 12.99, price_usd: 12.99 },
      { service: "views", qty: 10000, price: 22.99, price_usd: 22.99 },
      { service: "views", qty: 25000, price: 49.99, price_usd: 49.99 },
      { service: "views", qty: 50000, price: 89.99, price_usd: 89.99 },
      { service: "views", qty: 100000, price: 149.99, price_usd: 149.99 },
      // YouTube Subscribers
      { service: "yt_subscribers", qty: 100, price: 3.99, price_usd: 3.99 },
      { service: "yt_subscribers", qty: 250, price: 7.99, price_usd: 7.99 },
      { service: "yt_subscribers", qty: 500, price: 13.99, price_usd: 13.99 },
      { service: "yt_subscribers", qty: 1000, price: 24.99, price_usd: 24.99 },
      { service: "yt_subscribers", qty: 2500, price: 49.99, price_usd: 49.99 },
      { service: "yt_subscribers", qty: 5000, price: 89.99, price_usd: 89.99 },
      // YouTube Likes
      { service: "yt_likes", qty: 100, price: 2.49, price_usd: 2.49 },
      { service: "yt_likes", qty: 250, price: 4.99, price_usd: 4.99 },
      { service: "yt_likes", qty: 500, price: 8.99, price_usd: 8.99 },
      { service: "yt_likes", qty: 1000, price: 14.99, price_usd: 14.99 },
      { service: "yt_likes", qty: 2500, price: 29.99, price_usd: 29.99 },
      { service: "yt_likes", qty: 5000, price: 54.99, price_usd: 54.99 },
      // YouTube Views
      { service: "yt_views", qty: 500, price: 2.49, price_usd: 2.49 },
      { service: "yt_views", qty: 1000, price: 4.49, price_usd: 4.49 },
      { service: "yt_views", qty: 2500, price: 9.99, price_usd: 9.99 },
      { service: "yt_views", qty: 5000, price: 16.99, price_usd: 16.99 },
      { service: "yt_views", qty: 10000, price: 29.99, price_usd: 29.99 },
      { service: "yt_views", qty: 25000, price: 59.99, price_usd: 59.99 },
      { service: "yt_views", qty: 50000, price: 99.99, price_usd: 99.99 },
    ];

    for (const p of packs) {
      await sql`INSERT INTO pricing (service, qty, price, price_usd) VALUES (${p.service}, ${p.qty}, ${p.price}, ${p.price_usd}) ON CONFLICT DO NOTHING`;
    }
  }

  // Seed YouTube packs if missing (for existing DBs that were created before YouTube support)
  const ytCount = await sql`SELECT COUNT(*) as cnt FROM pricing WHERE service LIKE 'yt_%'`;
  if (Number(ytCount[0].cnt) === 0) {
    const ytPacks = [
      { service: "yt_subscribers", qty: 100, price: 3.99, price_usd: 3.99 },
      { service: "yt_subscribers", qty: 250, price: 7.99, price_usd: 7.99 },
      { service: "yt_subscribers", qty: 500, price: 13.99, price_usd: 13.99 },
      { service: "yt_subscribers", qty: 1000, price: 24.99, price_usd: 24.99 },
      { service: "yt_subscribers", qty: 2500, price: 49.99, price_usd: 49.99 },
      { service: "yt_subscribers", qty: 5000, price: 89.99, price_usd: 89.99 },
      { service: "yt_likes", qty: 100, price: 2.49, price_usd: 2.49 },
      { service: "yt_likes", qty: 250, price: 4.99, price_usd: 4.99 },
      { service: "yt_likes", qty: 500, price: 8.99, price_usd: 8.99 },
      { service: "yt_likes", qty: 1000, price: 14.99, price_usd: 14.99 },
      { service: "yt_likes", qty: 2500, price: 29.99, price_usd: 29.99 },
      { service: "yt_likes", qty: 5000, price: 54.99, price_usd: 54.99 },
      { service: "yt_views", qty: 500, price: 2.49, price_usd: 2.49 },
      { service: "yt_views", qty: 1000, price: 4.49, price_usd: 4.49 },
      { service: "yt_views", qty: 2500, price: 9.99, price_usd: 9.99 },
      { service: "yt_views", qty: 5000, price: 16.99, price_usd: 16.99 },
      { service: "yt_views", qty: 10000, price: 29.99, price_usd: 29.99 },
      { service: "yt_views", qty: 25000, price: 59.99, price_usd: 59.99 },
      { service: "yt_views", qty: 50000, price: 99.99, price_usd: 99.99 },
    ];
    for (const p of ytPacks) {
      await sql`INSERT INTO pricing (service, qty, price, price_usd) VALUES (${p.service}, ${p.qty}, ${p.price}, ${p.price_usd}) ON CONFLICT DO NOTHING`;
    }
  }
  // Seed Spotify packs if missing
  const spCount = await sql`SELECT COUNT(*) as cnt FROM pricing WHERE service LIKE 'sp_%'`;
  if (Number(spCount[0].cnt) === 0) {
    const spPacks = [
      { service: "sp_streams", qty: 1000, price: 2.99, price_usd: 2.99 },
      { service: "sp_streams", qty: 2500, price: 6.49, price_usd: 6.49 },
      { service: "sp_streams", qty: 5000, price: 11.99, price_usd: 11.99 },
      { service: "sp_streams", qty: 10000, price: 21.99, price_usd: 21.99 },
      { service: "sp_streams", qty: 25000, price: 49.99, price_usd: 49.99 },
      { service: "sp_streams", qty: 50000, price: 89.99, price_usd: 89.99 },
      { service: "sp_streams", qty: 100000, price: 159.99, price_usd: 159.99 },
      { service: "sp_streams", qty: 250000, price: 349.99, price_usd: 349.99 },
    ];
    for (const p of spPacks) {
      await sql`INSERT INTO pricing (service, qty, price, price_usd) VALUES (${p.service}, ${p.qty}, ${p.price}, ${p.price_usd}) ON CONFLICT DO NOTHING`;
    }
  }

  // Seed X (Twitter) packs if missing
  const xCount = await sql`SELECT COUNT(*) as cnt FROM pricing WHERE service LIKE 'x_%'`;
  if (Number(xCount[0].cnt) === 0) {
    const xPacks = [
      // x_followers
      { service: "x_followers", qty: 100, price: 3.49, price_usd: 3.49 },
      { service: "x_followers", qty: 250, price: 6.99, price_usd: 6.99 },
      { service: "x_followers", qty: 500, price: 11.99, price_usd: 11.99 },
      { service: "x_followers", qty: 1000, price: 19.99, price_usd: 19.99 },
      { service: "x_followers", qty: 2500, price: 39.99, price_usd: 39.99 },
      { service: "x_followers", qty: 5000, price: 69.99, price_usd: 69.99 },
      // x_likes
      { service: "x_likes", qty: 100, price: 2.49, price_usd: 2.49 },
      { service: "x_likes", qty: 250, price: 4.99, price_usd: 4.99 },
      { service: "x_likes", qty: 500, price: 8.99, price_usd: 8.99 },
      { service: "x_likes", qty: 1000, price: 14.99, price_usd: 14.99 },
      { service: "x_likes", qty: 2500, price: 29.99, price_usd: 29.99 },
      { service: "x_likes", qty: 5000, price: 54.99, price_usd: 54.99 },
      // x_retweets
      { service: "x_retweets", qty: 100, price: 2.99, price_usd: 2.99 },
      { service: "x_retweets", qty: 250, price: 5.49, price_usd: 5.49 },
      { service: "x_retweets", qty: 500, price: 9.99, price_usd: 9.99 },
      { service: "x_retweets", qty: 1000, price: 17.99, price_usd: 17.99 },
      { service: "x_retweets", qty: 2500, price: 34.99, price_usd: 34.99 },
      { service: "x_retweets", qty: 5000, price: 59.99, price_usd: 59.99 },
    ];
    for (const p of xPacks) {
      await sql`INSERT INTO pricing (service, qty, price, price_usd) VALUES (${p.service}, ${p.qty}, ${p.price}, ${p.price_usd}) ON CONFLICT DO NOTHING`;
    }
  }

  // Seed Twitch packs if missing
  const twCount = await sql`SELECT COUNT(*) as cnt FROM pricing WHERE service LIKE 'tw_%'`;
  if (Number(twCount[0].cnt) === 0) {
    const twPacks = [
      // tw_followers (8 packs)
      { service: "tw_followers", qty: 100, price: 3.49, price_usd: 3.49 },
      { service: "tw_followers", qty: 250, price: 6.99, price_usd: 6.99 },
      { service: "tw_followers", qty: 500, price: 11.99, price_usd: 11.99 },
      { service: "tw_followers", qty: 1000, price: 19.99, price_usd: 19.99 },
      { service: "tw_followers", qty: 2500, price: 39.99, price_usd: 39.99 },
      { service: "tw_followers", qty: 5000, price: 69.99, price_usd: 69.99 },
      { service: "tw_followers", qty: 10000, price: 119.99, price_usd: 119.99 },
      { service: "tw_followers", qty: 25000, price: 249.99, price_usd: 249.99 },
      // tw_live_viewers (8 packs)
      { service: "tw_live_viewers", qty: 10, price: 4.99, price_usd: 4.99 },
      { service: "tw_live_viewers", qty: 25, price: 9.99, price_usd: 9.99 },
      { service: "tw_live_viewers", qty: 50, price: 17.99, price_usd: 17.99 },
      { service: "tw_live_viewers", qty: 100, price: 29.99, price_usd: 29.99 },
      { service: "tw_live_viewers", qty: 250, price: 64.99, price_usd: 64.99 },
      { service: "tw_live_viewers", qty: 500, price: 119.99, price_usd: 119.99 },
      { service: "tw_live_viewers", qty: 1000, price: 219.99, price_usd: 219.99 },
      { service: "tw_live_viewers", qty: 2500, price: 499.99, price_usd: 499.99 },
    ];
    for (const p of twPacks) {
      await sql`INSERT INTO pricing (service, qty, price, price_usd) VALUES (${p.service}, ${p.qty}, ${p.price}, ${p.price_usd}) ON CONFLICT DO NOTHING`;
    }
  }
}

let variantColumnEnsured = false;
async function ensureVariantColumn() {
  if (variantColumnEnsured) return;
  try {
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant VARCHAR(1) DEFAULT NULL`;
    variantColumnEnsured = true;
  } catch (e) {
    console.error("Failed to ensure variant column:", e);
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
  currency?: string;
  country?: string;
  lang?: string;
  variant?: string;
}) {
  await ensureVariantColumn();
  const result = await sql`
    INSERT INTO orders (stripe_payment_intent_id, email, username, platform, cart, post_assignments, total_cents, status, followers_before, currency, country, lang, variant)
    VALUES (
      ${params.stripePaymentIntentId},
      ${params.email},
      ${params.username},
      ${params.platform},
      ${JSON.stringify(params.cart)},
      ${params.postAssignments ? JSON.stringify(params.postAssignments) : null},
      ${params.totalCents},
      ${params.status || "pending"},
      ${params.followersBefore || 0},
      ${params.currency || "eur"},
      ${params.country || null},
      ${params.lang || "fr"},
      ${params.variant || null}
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

export async function getActiveCombos(platform?: string) {
  if (platform) {
    return await sql`SELECT * FROM combo_packs WHERE active = true AND platform = ${platform} ORDER BY created_at DESC`;
  }
  return await sql`SELECT * FROM combo_packs WHERE active = true ORDER BY created_at DESC`;
}

export async function getAllCombos() {
  return await sql`SELECT * FROM combo_packs ORDER BY created_at DESC`;
}

export async function createCombo(params: { name: string; nameEn?: string; items: unknown; discountPercent: number; platform?: string }) {
  const result = await sql`
    INSERT INTO combo_packs (name, name_en, items, discount_percent, platform)
    VALUES (${params.name}, ${params.nameEn || ''}, ${JSON.stringify(params.items)}, ${params.discountPercent}, ${params.platform || 'tiktok'})
    RETURNING id
  `;
  return result[0].id;
}

export async function updateCombo(id: number, params: { name?: string; nameEn?: string; items?: unknown; discountPercent?: number; active?: boolean; platform?: string }) {
  if (params.name !== undefined) await sql`UPDATE combo_packs SET name = ${params.name} WHERE id = ${id}`;
  if (params.nameEn !== undefined) await sql`UPDATE combo_packs SET name_en = ${params.nameEn} WHERE id = ${id}`;
  if (params.items !== undefined) await sql`UPDATE combo_packs SET items = ${JSON.stringify(params.items)} WHERE id = ${id}`;
  if (params.discountPercent !== undefined) await sql`UPDATE combo_packs SET discount_percent = ${params.discountPercent} WHERE id = ${id}`;
  if (params.active !== undefined) await sql`UPDATE combo_packs SET active = ${params.active} WHERE id = ${id}`;
  if (params.platform !== undefined) await sql`UPDATE combo_packs SET platform = ${params.platform} WHERE id = ${id}`;
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
