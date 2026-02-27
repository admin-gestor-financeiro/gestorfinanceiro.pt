import type { Metadata } from "next";
import {
  buildWebApplicationSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const PAGE_URL = "https://gestorfinanceiro.pt/en/calculators/mortgage-calculator";

export const metadata: Metadata = {
  title: "Mortgage Calculator 2026 — Monthly Payment, IMT & Acquisition Costs Portugal",
  description:
    "Simulate your monthly mortgage payment, calculate IMT, Stamp Duty and all acquisition costs in Portugal. Includes debt service-to-income ratio (DSTI), Euribor sensitivity analysis and amortisation schedule. Free and updated for 2026.",
  alternates: {
    canonical: "/en/calculators/mortgage-calculator",
    languages: {
      en: "/en/calculators/mortgage-calculator",
      "pt-PT": "/calculadoras/credito-habitacao",
    },
  },
  openGraph: {
    title: "Mortgage Calculator 2026 — Payment, IMT & Acquisition Costs Portugal",
    description:
      "Calculate your monthly mortgage payment, IMT, Stamp Duty and affordability ratio in one tool. Includes Euribor sensitivity analysis and amortisation schedule.",
    url: PAGE_URL,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mortgage Calculator 2026 — Portugal",
    description:
      "Simulate payment, IMT, acquisition costs and debt-to-income ratio for your Portuguese mortgage. Free.",
  },
};

export const structuredData = buildGraphSchema([
  buildWebApplicationSchema({
    name: "Portugal Mortgage Calculator 2026",
    description:
      "Free mortgage calculator for Portugal. Computes monthly payment (French amortisation), IMT, Stamp Duty, acquisition costs, debt service-to-income ratio (DSTI) and Euribor sensitivity scenarios. Data updated for 2026.",
    url: PAGE_URL,
  }),
  buildBreadcrumbSchema([
    { name: "Home", url: "https://gestorfinanceiro.pt/en" },
    { name: "Calculators", url: "https://gestorfinanceiro.pt/en/calculators" },
    { name: "Mortgage Calculator", url: PAGE_URL },
  ]),
  buildFaqSchema([
    {
      question: "How is the monthly mortgage payment calculated in Portugal?",
      answer:
        "The monthly payment uses the French amortisation formula: M = P × [r × (1+r)^n] / [(1+r)^n − 1], where P is the loan amount, r is the monthly rate (TAN ÷ 12) and n is the total number of instalments. The TAN (nominal annual rate) is the sum of the Euribor index and the bank's spread.",
    },
    {
      question: "What are the acquisition costs when buying property in Portugal?",
      answer:
        "The main costs are: IMT (Property Transfer Tax), Stamp Duty on the purchase (0.8%), Stamp Duty on the mortgage (0.6%), notary and land registry fees (approx. €700–€1,000), bank valuation (approx. €230–€286) and bank processing fee (approx. €200–€725).",
    },
    {
      question: "What is the IMT Jovem exemption?",
      answer:
        "IMT Jovem is an IMT and Stamp Duty exemption for buyers aged 35 or under purchasing their first permanent residence, introduced by Decree-Law 48-A/2024. In 2026, full exemption applies to properties up to €330,539 on the Mainland.",
    },
    {
      question: "What is the debt service-to-income ratio (DSTI)?",
      answer:
        "The DSTI measures the percentage of net monthly income committed to loan repayments. The Banco de Portugal recommends a maximum of 50%, with a stress buffer of +1.5 percentage points for loans with a term exceeding 10 years.",
    },
    {
      question: "How does Euribor indexation work?",
      answer:
        "For variable-rate mortgages, the TAN is composed of the Euribor (benchmark rate) plus the bank's spread. The Euribor resets periodically (3, 6 or 12 months), changing the monthly payment. This calculator includes sensitivity scenarios for rises of 1, 2 and 3 percentage points.",
    },
  ]),
]);
