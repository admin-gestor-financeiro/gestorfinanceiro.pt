import type { Metadata } from "next";
import {
  buildWebSiteSchema,
  buildOrganizationSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const BASE_URL = "https://gestorfinanceiro.pt";

export const metadata: Metadata = {
  title: "Gestor Financeiro — Calculadoras Financeiras em Portugal",
  description:
    "Ferramentas e calculadoras financeiras gratuitas em Portugal: simulador de salário líquido, IRS, Segurança Social e muito mais.",
  alternates: {
    canonical: "/",
    languages: { "pt-PT": "/", en: "/en" },
  },
  openGraph: {
    title: "Gestor Financeiro — Calculadoras Financeiras em Portugal",
    description:
      "Ferramentas e calculadoras financeiras gratuitas em Portugal: simulador de salário líquido, IRS, Segurança Social e muito mais.",
    url: BASE_URL,
    siteName: "Gestor Financeiro",
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Gestor Financeiro — Calculadoras Financeiras em Portugal",
    description:
      "Ferramentas e calculadoras financeiras gratuitas em Portugal: simulador de salário líquido, IRS, Segurança Social e muito mais.",
  },
};

export const structuredData = buildGraphSchema([
  buildWebSiteSchema(),
  buildOrganizationSchema(),
]);
