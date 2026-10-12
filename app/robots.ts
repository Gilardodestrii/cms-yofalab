import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/** robots.txt: izinkan publik, larang area admin dan API. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}