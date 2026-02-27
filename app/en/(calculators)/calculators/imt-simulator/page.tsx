import type { Metadata } from "next";
import { ImtCalculator } from "@/components/calculators/imt-calculator";
import { JsonLd } from "@/components/ui/json-ld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  buildWebApplicationSchema,
  buildBreadcrumbSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const PAGE_URL = "https://gestorfinanceiro.pt/en/calculators/imt-simulator";

export const metadata: Metadata = {
  title: "IMT & Stamp Duty Calculator 2026 — Portugal",
  description:
    "Calculate IMT (Property Transfer Tax) and Stamp Duty when buying property in Portugal. 2026 tables for primary residence, secondary home and other urban property. Includes IMT Jovem youth exemption.",
  alternates: {
    canonical: "/en/calculators/imt-simulator",
    languages: {
      en: "/en/calculators/imt-simulator",
      "pt-PT": "/calculadoras/simulador-imt",
    },
  },
  openGraph: {
    title: "IMT & Stamp Duty Calculator 2026 — Portugal",
    description:
      "Calculate IMT and Stamp Duty when buying property in Portugal. Free, updated for 2026. Includes IMT Jovem youth exemption.",
    url: PAGE_URL,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "IMT & Stamp Duty Calculator 2026 — Portugal",
    description:
      "Calculate IMT and Stamp Duty when buying property in Portugal. Free, updated for 2026. Includes IMT Jovem youth exemption.",
  },
};

const structuredData = buildGraphSchema([
  buildWebApplicationSchema({
    name: "IMT & Stamp Duty Simulator 2026",
    description:
      "Free IMT and Stamp Duty simulator for Portugal. 2026 tables with IMT Jovem support (exemption for buyers aged ≤ 35), scenario comparison mode and bracket-level breakdown.",
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
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/en" },
            { label: "Calculators", href: "/en/calculators" },
            { label: "IMT & Stamp Duty Simulator" },
          ]}
        />
      </div>
      <ImtCalculator locale="en" />
    </>
  );
}
