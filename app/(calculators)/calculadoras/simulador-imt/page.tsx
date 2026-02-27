import type { Metadata } from "next";
import { ImtCalculator } from "@/components/calculators/imt-calculator";
import { JsonLd } from "@/components/ui/json-ld";
import {
  buildWebApplicationSchema,
  buildBreadcrumbSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const PAGE_URL = "https://gestorfinanceiro.pt/calculadoras/simulador-imt";

export const metadata: Metadata = {
  title: "Simulador de IMT e Imposto de Selo 2024 — Portugal",
  description:
    "Calcule o IMT (Imposto Municipal sobre Transmissões) e Imposto de Selo na compra de imóvel em Portugal. Tabelas atualizadas para habitação própria permanente, secundária e outros imóveis.",
  alternates: {
    canonical: "/calculadoras/simulador-imt",
    languages: {
      "pt-PT": "/calculadoras/simulador-imt",
      en: "/en/calculators/imt-simulator",
    },
  },
  openGraph: {
    title: "Simulador de IMT e Imposto de Selo — Portugal",
    description:
      "Calcule o IMT e Imposto de Selo na compra de imóvel em Portugal. Gratuito e atualizado.",
    url: PAGE_URL,
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Simulador de IMT e Imposto de Selo — Portugal",
    description:
      "Calcule o IMT e Imposto de Selo na compra de imóvel em Portugal. Gratuito e atualizado.",
  },
};

const structuredData = buildGraphSchema([
  buildWebApplicationSchema({
    name: "Simulador de IMT e Imposto de Selo",
    description:
      "Simulador gratuito de IMT e Imposto de Selo para Portugal. Calcula os impostos de aquisição de imóvel com base no tipo de imóvel e região.",
    url: PAGE_URL,
  }),
  buildBreadcrumbSchema([
    { name: "Início", url: "https://gestorfinanceiro.pt" },
    { name: "Calculadoras", url: "https://gestorfinanceiro.pt/calculadoras" },
    { name: "Simulador de IMT e Imposto de Selo", url: PAGE_URL },
  ]),
]);

export default function SimuladorImtPage() {
  return (
    <>
      <JsonLd schema={structuredData} />
      <ImtCalculator locale="pt" />
    </>
  );
}
