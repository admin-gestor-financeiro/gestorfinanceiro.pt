import type { Metadata } from "next";
import { ImtCalculator } from "@/components/calculators/imt-calculator";
import { JsonLd } from "@/components/ui/json-ld";
import {
  buildWebApplicationSchema,
  buildBreadcrumbSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const PAGE_URL = "https://gestorfinanceiro.pt/en/calculators/imt-simulator";

export const metadata: Metadata = {
  title: "IMT & Stamp Duty Calculator 2024 — Portugal",
  description:
    "Calculate IMT (Property Transfer Tax) and Stamp Duty when buying property in Portugal. Updated tables for primary residence, secondary home and other urban property.",
  alternates: {
    canonical: "/en/calculators/imt-simulator",
    languages: {
      en: "/en/calculators/imt-simulator",
      "pt-PT": "/calculadoras/simulador-imt",
    },
  },
  openGraph: {
    title: "IMT & Stamp Duty Calculator — Portugal",
    description:
      "Calculate IMT and Stamp Duty when buying property in Portugal. Free and up to date.",
    url: PAGE_URL,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "IMT & Stamp Duty Calculator — Portugal",
    description:
      "Calculate IMT and Stamp Duty when buying property in Portugal. Free and up to date.",
  },
};

const structuredData = buildGraphSchema([
  buildWebApplicationSchema({
    name: "IMT & Stamp Duty Simulator",
    description:
      "Free IMT and Stamp Duty simulator for Portugal. Calculates property acquisition taxes based on property type and region.",
    url: PAGE_URL,
  }),
  buildBreadcrumbSchema([
    { name: "Home", url: "https://gestorfinanceiro.pt/en" },
    { name: "Calculators", url: "https://gestorfinanceiro.pt/en/calculators" },
    { name: "IMT & Stamp Duty Simulator", url: PAGE_URL },
  ]),
]);

export default function ImtSimulatorPage() {
  return (
    <>
      <JsonLd schema={structuredData} />
      <ImtCalculator locale="en" />
    </>
  );
}
