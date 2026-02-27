import type { Metadata } from "next";
import {
  buildWebApplicationSchema,
  buildBreadcrumbSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const PAGE_URL = "https://gestorfinanceiro.pt/calculadoras/simulador-imt";

export const metadata: Metadata = {
  title: "Simulador de IMT e Imposto de Selo 2026 — Portugal",
  description:
    "Calcule o IMT e Imposto de Selo na compra de imóvel em Portugal. Tabelas 2026 para habitação própria permanente, secundária e outros imóveis. Inclui IMT Jovem para compradores com ≤ 35 anos.",
  alternates: {
    canonical: "/calculadoras/simulador-imt",
    languages: {
      "pt-PT": "/calculadoras/simulador-imt",
      en: "/en/calculators/imt-simulator",
    },
  },
  openGraph: {
    title: "Simulador de IMT e Imposto de Selo 2026 — Portugal",
    description:
      "Calcule o IMT e Imposto de Selo na compra de imóvel em Portugal. Gratuito, atualizado para 2026. Inclui IMT Jovem.",
    url: PAGE_URL,
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Simulador de IMT e Imposto de Selo 2026 — Portugal",
    description:
      "Calcule o IMT e Imposto de Selo na compra de imóvel em Portugal. Gratuito, atualizado para 2026. Inclui IMT Jovem.",
  },
};

export const structuredData = buildGraphSchema([
  buildWebApplicationSchema({
    name: "Simulador de IMT e Imposto de Selo 2026",
    description:
      "Simulador gratuito de IMT e Imposto de Selo para Portugal. Tabelas 2026 com suporte a IMT Jovem (isenção para compradores com ≤ 35 anos), modo de comparação entre imóveis e detalhe por escalão.",
    url: PAGE_URL,
  }),
  buildBreadcrumbSchema([
    { name: "Início", url: "https://gestorfinanceiro.pt" },
    { name: "Calculadoras", url: "https://gestorfinanceiro.pt/calculadoras" },
    { name: "Simulador de IMT e Imposto de Selo", url: PAGE_URL },
  ]),
]);
