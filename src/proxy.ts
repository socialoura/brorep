import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ISO-3166-1 alpha-2 country code → currency
const COUNTRY_TO_CURRENCY: Record<string, "eur" | "usd" | "gbp" | "cad" | "nzd" | "chf"> = {
  // GBP
  GB: "gbp", IM: "gbp", JE: "gbp", GG: "gbp",
  // USD (US + countries that use USD)
  US: "usd", PR: "usd", VI: "usd", AS: "usd", GU: "usd", MP: "usd",
  EC: "usd", SV: "usd", PA: "usd", TL: "usd", FM: "usd", MH: "usd", PW: "usd",
  // CAD
  CA: "cad",
  // NZD (NZ + AU which we treat as NZD bucket since no AUD)
  NZ: "nzd", AU: "nzd",
  // CHF
  CH: "chf", LI: "chf",
  // EUR (Eurozone)
  AT: "eur", BE: "eur", CY: "eur", DE: "eur", EE: "eur", ES: "eur", FI: "eur",
  FR: "eur", GR: "eur", HR: "eur", IE: "eur", IT: "eur", LT: "eur", LU: "eur",
  LV: "eur", MT: "eur", NL: "eur", PT: "eur", SI: "eur", SK: "eur",
  // Other European countries that aren't in eurozone but commonly accept EUR for online purchases
  AD: "eur", MC: "eur", SM: "eur", VA: "eur", ME: "eur", XK: "eur",
};

const VALID_CURRENCIES = new Set(["eur", "usd", "gbp", "cad", "nzd", "chf"]);

export function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // If currency is already explicitly in the URL, sync it to the cookie and continue.
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

  // No currency in URL. Try cookie first.
  const cookieCurrency = request.cookies.get("currency")?.value;
  if (cookieCurrency && VALID_CURRENCIES.has(cookieCurrency)) {
    // Default eur shouldn't pollute the URL; only rewrite for non-default currencies
    if (cookieCurrency !== "eur") {
      const newUrl = url.clone();
      newUrl.searchParams.set("currency", cookieCurrency);
      return NextResponse.rewrite(newUrl);
    }
    return NextResponse.next();
  }

  // First visit, no cookie: detect from Vercel geo IP header.
  const country = (request.headers.get("x-vercel-ip-country") || "").toUpperCase();
  const detected = COUNTRY_TO_CURRENCY[country] || "eur";

  // Persist the detected currency in a cookie so subsequent requests skip detection.
  const response = detected !== "eur"
    ? NextResponse.rewrite((() => { const u = url.clone(); u.searchParams.set("currency", detected); return u; })())
    : NextResponse.next();

  response.cookies.set("currency", detected, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  // Match all paths except APIs, _next assets, static files, and metadata routes
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|sitemap.xml|robots.txt|opengraph-image).*)",
  ],
};
