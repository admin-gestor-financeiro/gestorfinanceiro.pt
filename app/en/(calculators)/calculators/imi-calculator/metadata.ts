import type { Metadata } from "next";
import {
  buildWebApplicationSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const PAGE_URL = "https://gestorfinanceiro.pt/en/calculators/imi-calculator";

export const metadata: Metadata = {
  title: "IMI Calculator 2026 — Portugal Property Tax",
  description:
    "Calculate IMI (Portuguese property tax) for 2026. Covers all 308 municipalities, AIMI surcharge, permanent and temporary exemption eligibility, and payment schedule. Free, updated for 2026.",
  alternates: {
    canonical: "/en/calculators/imi-calculator",
    languages: {
      "pt-PT": "/calculadoras/simulador-imi-2026",
      en: "/en/calculators/imi-calculator",
    },
  },
  openGraph: {
    title: "IMI Calculator 2026 — Portugal Property Tax",
    description:
      "Free Portugal IMI property tax calculator for 2026. All 308 municipalities, AIMI, exemption checker, and payment schedule.",
    url: PAGE_URL,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "IMI Calculator 2026 — Portugal Property Tax",
    description:
      "Free Portugal IMI property tax calculator for 2026. All 308 municipalities, AIMI, exemption checker.",
  },
};

export const structuredData = buildGraphSchema([
  buildWebApplicationSchema({
    name: "IMI Calculator 2026 — Portugal",
    description:
      "Free Portugal IMI property tax calculator covering all 308 municipalities, AIMI surcharge, permanent and temporary exemption eligibility, payment schedule, and vacant property surcharge. Updated for 2026.",
    url: PAGE_URL,
  }),
  buildBreadcrumbSchema([
    { name: "Home", url: "https://gestorfinanceiro.pt/en" },
    { name: "Calculators", url: "https://gestorfinanceiro.pt/en/calculators" },
    { name: "IMI Calculator 2026", url: PAGE_URL },
  ]),
  buildFaqSchema([
    {
      question: "How is IMI calculated in Portugal?",
      answer:
        "IMI (Imposto Municipal sobre Imóveis) is calculated by multiplying the property's VPT (tax rateable value) by the applicable municipal rate. For urban properties the rate ranges from 0.3% to 0.45% (set by each municipality). Rural properties are taxed at a fixed 0.8%. For primary permanent residences, an IMI Familiar deduction of €30, €70, or €140 may apply depending on the number of dependants.",
    },
    {
      question: "Where do I find my property's VPT?",
      answer:
        "The VPT (Valor Patrimonial Tributário) is shown on the property's caderneta predial, available at Portal das Finanças (portaldasfinancas.gov.pt) under Consultar → Património. It also appears on the annual IMI liquidation notice sent by the AT (Portuguese Tax Authority).",
    },
    {
      question: "When is IMI paid in 2026?",
      answer:
        "IMI 2026 payment depends on the annual amount: up to €100, one instalment in May; €100.01–€500, two instalments (May and November); above €500, three instalments (May, August, November). The exact deadlines in 2026 are 31 May, 31 August, and 30 November.",
    },
    {
      question: "What is AIMI and who pays it?",
      answer:
        "AIMI (Adicional ao IMI) is an additional property tax levied on the total VPT of all residential urban properties and construction land owned. Individuals pay AIMI when the total VPT exceeds €600,000 (or €1,200,000 for couples filing jointly), at progressive rates of 0.7% to 1.5%. Companies pay a flat 0.4% with no deduction. AIMI is paid annually in September.",
    },
    {
      question: "Can I get an IMI exemption in Portugal?",
      answer:
        "Yes. There are two types: a permanent exemption (Art. 11-A CIMI) for households with gross income ≤ €17,303 and total VPT ≤ €75,198 in a primary residence; and a temporary exemption (Art. 46 EBF) for primary residences with VPT ≤ €125,000 and household income ≤ €153,300, valid for 3 years (up to 5 in some municipalities). The temporary exemption is not automatic — you must apply at Portal das Finanças within 60 days of acquisition.",
    },
  ]),
]);
