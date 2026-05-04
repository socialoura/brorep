import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

let tableEnsured = false;

async function ensureTables() {
  if (tableEnsured) return;
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
  try { await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant VARCHAR(1) DEFAULT NULL`; } catch {}
  tableEnsured = true;
}

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

interface VariantStats {
  variant: "A" | "B";
  visitors: number;
  orders: number;
  totalRevenueCents: number;
  conversionRate: number;
  avgOrderValueCents: number;
  revenuePerVisitorCents: number;
}

/**
 * Compute Z-score for two-proportion test (conversion rate comparison).
 * Returns the Z-score and p-value approximation.
 */
function computeZTest(
  successesA: number,
  trialsA: number,
  successesB: number,
  trialsB: number
): { zScore: number; pValue: number; significant95: boolean } {
  if (trialsA === 0 || trialsB === 0) {
    return { zScore: 0, pValue: 1, significant95: false };
  }

  const pA = successesA / trialsA;
  const pB = successesB / trialsB;
  const pPool = (successesA + successesB) / (trialsA + trialsB);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / trialsA + 1 / trialsB));

  if (se === 0) {
    return { zScore: 0, pValue: 1, significant95: false };
  }

  const zScore = (pB - pA) / se;
  // Approximation of two-tailed p-value from Z (using complementary error function)
  // For p-value, |z| > 1.96 means 95% confidence (two-tailed)
  const absZ = Math.abs(zScore);
  // Approximate p-value using a simple polynomial approximation
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.3989423 * Math.exp(-absZ * absZ / 2);
  const pValue = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  const twoTailedP = Math.min(1, 2 * pValue);

  return {
    zScore,
    pValue: twoTailedP,
    significant95: absZ > 1.96,
  };
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureTables();

    // Fetch visitor counts per variant
    const visitorRows = await sql`
      SELECT variant, COUNT(*)::int as count
      FROM ab_visitors
      GROUP BY variant
    `;
    const visitors = { A: 0, B: 0 };
    for (const r of visitorRows) {
      if (r.variant === "A" || r.variant === "B") {
        visitors[r.variant as "A" | "B"] = Number(r.count);
      }
    }

    // Fetch order stats per variant (only paid/processing/delivered orders count as conversions)
    const orderRows = await sql`
      SELECT
        variant,
        COUNT(*)::int as count,
        COALESCE(SUM(total_cents), 0)::bigint as total_revenue_cents
      FROM orders
      WHERE variant IN ('A', 'B')
        AND status NOT IN ('refunded', 'cancelled', 'failed')
      GROUP BY variant
    `;
    const orderStats = {
      A: { count: 0, revenue: 0 },
      B: { count: 0, revenue: 0 },
    };
    for (const r of orderRows) {
      if (r.variant === "A" || r.variant === "B") {
        orderStats[r.variant as "A" | "B"] = {
          count: Number(r.count),
          revenue: Number(r.total_revenue_cents),
        };
      }
    }

    // Build stats per variant
    const stats: VariantStats[] = (["A", "B"] as const).map((v) => {
      const vis = visitors[v];
      const ord = orderStats[v].count;
      const rev = orderStats[v].revenue;
      return {
        variant: v,
        visitors: vis,
        orders: ord,
        totalRevenueCents: rev,
        conversionRate: vis > 0 ? ord / vis : 0,
        avgOrderValueCents: ord > 0 ? rev / ord : 0,
        revenuePerVisitorCents: vis > 0 ? rev / vis : 0,
      };
    });

    const a = stats[0];
    const b = stats[1];

    // Statistical significance for conversion rate (Z-test)
    const convZTest = computeZTest(a.orders, a.visitors, b.orders, b.visitors);

    // Compute lifts
    const conversionLift = a.conversionRate > 0
      ? (b.conversionRate - a.conversionRate) / a.conversionRate
      : 0;
    const aovLift = a.avgOrderValueCents > 0
      ? (b.avgOrderValueCents - a.avgOrderValueCents) / a.avgOrderValueCents
      : 0;
    const revPerVisitorLift = a.revenuePerVisitorCents > 0
      ? (b.revenuePerVisitorCents - a.revenuePerVisitorCents) / a.revenuePerVisitorCents
      : 0;

    // Daily breakdown (last 30 days)
    const dailyRows = await sql`
      SELECT
        DATE(created_at) as date,
        variant,
        COUNT(*)::int as orders,
        COALESCE(SUM(total_cents), 0)::bigint as revenue_cents
      FROM orders
      WHERE variant IN ('A', 'B')
        AND created_at >= NOW() - INTERVAL '30 days'
        AND status NOT IN ('refunded', 'cancelled', 'failed')
      GROUP BY DATE(created_at), variant
      ORDER BY date DESC
    `;

    // Visitors by country breakdown
    const countryRows = await sql`
      SELECT country, variant, COUNT(*)::int as count
      FROM ab_visitors
      WHERE country IS NOT NULL
      GROUP BY country, variant
      ORDER BY count DESC
      LIMIT 50
    `;

    // Test start date (earliest visitor)
    const startRow = await sql`SELECT MIN(first_seen) as start FROM ab_visitors`;
    const testStartedAt = startRow[0]?.start || null;

    return NextResponse.json({
      stats,
      lifts: {
        conversionRate: conversionLift,
        avgOrderValue: aovLift,
        revenuePerVisitor: revPerVisitorLift,
      },
      significance: {
        zScore: convZTest.zScore,
        pValue: convZTest.pValue,
        significant95: convZTest.significant95,
        winner: convZTest.significant95
          ? (b.revenuePerVisitorCents > a.revenuePerVisitorCents ? "B" : "A")
          : null,
      },
      daily: dailyRows,
      countries: countryRows,
      testStartedAt,
    });
  } catch (err) {
    console.error("AB test stats error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
