import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://fanovaly.com";
  const now = new Date().toISOString();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/youtube`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/cgv`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/confidentialite`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/remboursement`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
