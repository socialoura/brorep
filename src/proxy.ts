import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ISO-3166-1 alpha-2 country code → currency
const COUNTRY_TO_CURRENCY: Record<string, "eur" | "usd" | "gbp" | "cad" | "nzd" | "chf"> = {
  GB: "gbp", IM: "gbp", JE: "gbp", GG: "gbp",
  US: "usd", PR: "usd", VI: "usd", AS: "usd", GU: "usd", MP: "usd",
  EC: "usd", SV: "usd", PA: "usd", TL: "usd", FM: "usd", MH: "usd", PW: "usd",
  CA: "cad",
  NZ: "nzd", AU: "nzd",
  CH: "chf", LI: "chf",
  AT: "eur", BE: "eur", CY: "eur", DE: "eur", EE: "eur", ES: "eur", FI: "eur",
  FR: "eur", GR: "eur", HR: "eur", IE: "eur", IT: "eur", LT: "eur", LU: "eur",
  LV: "eur", MT: "eur", NL: "eur", PT: "eur", SI: "eur", SK: "eur",
  AD: "eur", MC: "eur", SM: "eur", VA: "eur", ME: "eur", XK: "eur",
};

const VALID_CURRENCIES = new Set(["eur", "usd", "gbp", "cad", "nzd", "chf"]);

export function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // If user explicitly chose a currency via URL param, persist it as cookie.
  const urlCurrency = url.searchParams.get("currency");
  if (urlCurrency && VALID_CURRENCIES.has(urlCurrency)) {
    const cookieCurrency = request.cookies.get("currency")?.value;
    if (cookieCurrency !== urlCurrency) {
      const response = NextResponse.next();
      response.cookies.set("currency", urlCurrency, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
      return response;
    }
    return NextResponse.next();
  }

  // If cookie already exists, do nothing.
  if (request.cookies.has("currency")) {
    return NextResponse.next();
  }

  // First visit: persist detected currency from geo header so subsequent requests have it.
  // The layout reads x-vercel-ip-country directly for instant first-visit detection.
  const country = (request.headers.get("x-vercel-ip-country") || "").toUpperCase();
  const detected = COUNTRY_TO_CURRENCY[country] || "eur";

  const response = NextResponse.next();
  response.cookies.set("currency", detected, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|sitemap.xml|robots.txt|opengraph-image).*)",
  ],
};
