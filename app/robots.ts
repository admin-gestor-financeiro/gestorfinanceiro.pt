import type { MetadataRoute } from "next";

/**
 * Next.js App Router robots — automatically served at /robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://gestorfinanceiro.pt/sitemap.xml",
  };
}
