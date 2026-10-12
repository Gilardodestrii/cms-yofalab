import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Sitemap dinamis. Pada Sprint 1 memuat rute statis; pada Sprint 8 akan
 * ditambah entri produk dan artikel dari database.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["/", "/product", "/blog", "/about", "/contact"];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}