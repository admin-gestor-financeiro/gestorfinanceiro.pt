import type { Metadata } from "next";
import {
  buildWebPageSchema,
  buildBreadcrumbSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const PAGE_URL = "https://gestorfinanceiro.pt/en/calculators";

export const metadata: Metadata = {
  title: "Financial Calculators — Gestor Financeiro",
  description:
    "Free financial calculators for Portugal: net salary, IRS withholding, Social Security and more.",
  alternates: {
    canonical: "/en/calculators",
    languages: { en: "/en/calculators", "pt-PT": "/calculadoras" },
  },
  openGraph: {
    title: "Financial Calculators — Gestor Financeiro",
    description:
      "Free financial calculators for Portugal: net salary, IRS withholding, Social Security and more.",
    url: PAGE_URL,
    siteName: "Gestor Financeiro",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Financial Calculators — Gestor Financeiro",
    description:
      "Free financial calculators for Portugal: net salary, IRS withholding, Social Security and more.",
  },
};

export const structuredData = buildGraphSchema([
  buildWebPageSchema({
    type: "CollectionPage",
    name: "Financial Calculators",
    description:
      "All free financial calculators from Gestor Financeiro: net salary, IRS withholding, Social Security and more.",
    url: PAGE_URL,
    inLanguage: "en",
  }),
  buildBreadcrumbSchema([
    { name: "Home", url: "https://gestorfinanceiro.pt/en" },
    { name: "Calculators", url: PAGE_URL },
  ]),
]);
