import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site";

/** Sitemap dinamis: rute statis + produk published + artikel published. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes = ["/", "/product", "/blog", "/about", "/contact"];

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const [products, posts] = await Promise.all([
      db.product.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      db.post.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
    ]);
    productEntries = products.map((p) => ({
      url: `${siteConfig.url}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    postEntries = posts.map((p) => ({
      url: `${siteConfig.url}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // Database belum siap (mis. saat build CI): kembalikan rute statis saja.
  }

  return [...staticEntries, ...productEntries, ...postEntries];
}
