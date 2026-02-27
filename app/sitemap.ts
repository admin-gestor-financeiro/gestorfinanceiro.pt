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
      lastModified: new Date("2026-02-27"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date("2026-02-27"),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    // ── Calculator listings ──────────────────────────────────────────────────
    {
      url: `${BASE_URL}/calculadoras`,
      lastModified: new Date("2026-02-27"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/calculators`,
      lastModified: new Date("2026-02-27"),
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // ── Calculator detail pages ──────────────────────────────────────────────
    {
      url: `${BASE_URL}/calculadoras/salario-liquido`,
      lastModified: new Date("2026-02-27"),
      changeFrequency: "yearly", // Tax tables update once a year
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en/calculators/net-salary`,
      lastModified: new Date("2026-02-27"),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/calculadoras/simulador-imt`,
      lastModified: new Date("2026-02-27"),
      changeFrequency: "yearly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en/calculators/imt-simulator`,
      lastModified: new Date("2026-02-27"),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/calculadoras/credito-habitacao`,
      lastModified: new Date("2026-02-27"),
      changeFrequency: "yearly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en/calculators/mortgage-calculator`,
      lastModified: new Date("2026-02-27"),
      changeFrequency: "yearly",
      priority: 0.8,
    },

    // ── Content pages ────────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/sobre`,
      lastModified: new Date("2026-02-27"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/en/about`,
      lastModified: new Date("2026-02-27"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contacto`,
      lastModified: new Date("2026-02-27"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/en/contact`,
      lastModified: new Date("2026-02-27"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
