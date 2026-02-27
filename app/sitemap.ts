import type { MetadataRoute } from "next";

const BASE_URL = "https://gestorfinanceiro.pt";

/**
 * Next.js App Router sitemap — automatically served at /sitemap.xml
 * Add new pages here whenever a new route is created.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Home pages ──────────────────────────────────────────────────────────
    {
      url: BASE_URL,
      lastModified: new Date("2025-02-26"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date("2025-02-26"),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    // ── Calculators ─────────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/calculadoras/salario-liquido`,
      lastModified: new Date("2025-02-26"),
      changeFrequency: "yearly",   // Tax tables update once a year
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en/calculators/net-salary`,
      lastModified: new Date("2025-02-26"),
      changeFrequency: "yearly",
      priority: 0.8,
    },
  ];
}
