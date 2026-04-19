import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/youtube", "/cgv", "/confidentialite", "/mentions-legales", "/remboursement"],
        disallow: ["/api/", "/admin", "/order/"],
      },
    ],
    sitemap: "https://fanovaly.com/sitemap.xml",
  };
}
