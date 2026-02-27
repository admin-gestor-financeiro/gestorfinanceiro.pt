import type { Metadata } from "next";
import {
  buildWebPageSchema,
  buildBreadcrumbSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const PAGE_URL = "https://gestorfinanceiro.pt/calculadoras";

export const metadata: Metadata = {
  title: "Calculadoras Financeiras — Gestor Financeiro",
  description:
    "Todas as calculadoras financeiras gratuitas em Portugal: salário líquido, IRS, Segurança Social e muito mais.",
  alternates: {
    canonical: "/calculadoras",
    languages: { "pt-PT": "/calculadoras", en: "/en/calculators" },
  },
  openGraph: {
    title: "Calculadoras Financeiras — Gestor Financeiro",
    description:
      "Todas as calculadoras financeiras gratuitas em Portugal: salário líquido, IRS, Segurança Social e muito mais.",
    url: PAGE_URL,
    siteName: "Gestor Financeiro",
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Calculadoras Financeiras — Gestor Financeiro",
    description:
      "Todas as calculadoras financeiras gratuitas em Portugal: salário líquido, IRS, Segurança Social e muito mais.",
  },
};

export const structuredData = buildGraphSchema([
  buildWebPageSchema({
    type: "CollectionPage",
    name: "Calculadoras Financeiras",
    description:
      "Todas as calculadoras financeiras gratuitas do Gestor Financeiro: salário líquido, IRS, Segurança Social e muito mais.",
    url: PAGE_URL,
    inLanguage: "pt-PT",
  }),
  buildBreadcrumbSchema([
    { name: "Início", url: "https://gestorfinanceiro.pt" },
    { name: "Calculadoras", url: PAGE_URL },
  ]),
]);
