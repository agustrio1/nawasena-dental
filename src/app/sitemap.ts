import type { MetadataRoute } from "next";

import { getArticles, getServices } from "@/lib/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, articles] = await Promise.all([
    getServices(),
    getArticles(),
  ]);

  const staticPaths: Array<"" | "/layanan" | "/tentang" | "/dokter" | "/artikel" | "/kontak"> = [
    "",
    "/layanan",
    "/tentang",
    "/dokter",
    "/artikel",
    "/kontak",
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  for (const service of services) {
    entries.push({
      url: `${siteUrl}/layanan/${service.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const article of articles) {
    entries.push({
      url: `${siteUrl}/artikel/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "yearly",
      priority: 0.5,
    });
  }

  return entries;
}
