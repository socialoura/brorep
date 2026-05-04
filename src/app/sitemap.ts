import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://fanovaly.com";
  const now = new Date().toISOString();

  const blogPages: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: a.date,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/tiktok`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/youtube`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/spotify-en`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/x`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/twitch`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/instagram`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/calculateur`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...blogPages,
    { url: `${base}/cgv`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/confidentialite`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/remboursement`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
