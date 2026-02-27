import type { Metadata } from "next";
import {
  buildWebSiteSchema,
  buildOrganizationSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const BASE_URL = "https://gestorfinanceiro.pt";

export const metadata: Metadata = {
  title: "Gestor Financeiro — Free Financial Calculators for Portugal",
  description:
    "Free and up-to-date financial calculators for Portugal: net salary simulator, IRS withholding, Social Security and more.",
  alternates: {
    canonical: "/en",
    languages: { en: "/en", "pt-PT": "/" },
  },
  openGraph: {
    title: "Gestor Financeiro — Free Financial Calculators for Portugal",
    description:
      "Free and up-to-date financial calculators for Portugal: net salary simulator, IRS withholding, Social Security and more.",
    url: `${BASE_URL}/en`,
    siteName: "Gestor Financeiro",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Gestor Financeiro — Free Financial Calculators for Portugal",
    description:
      "Free and up-to-date financial calculators for Portugal: net salary simulator, IRS withholding, Social Security and more.",
  },
};

export const structuredData = buildGraphSchema([
  buildWebSiteSchema(),
  buildOrganizationSchema(),
]);
