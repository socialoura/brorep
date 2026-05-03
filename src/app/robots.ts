import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/tiktok", "/youtube", "/spotify", "/x", "/twitch", "/cgv", "/confidentialite", "/mentions-legales", "/remboursement"],
        disallow: ["/api/", "/admin", "/order/", "/orders"],
      },
    ],
    sitemap: "https://fanovaly.com/sitemap.xml",
  };
}
