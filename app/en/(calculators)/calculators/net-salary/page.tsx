import type { Metadata } from "next";
import { NetSalaryCalculator } from "@/components/calculators/net-salary-calculator";
import { JsonLd } from "@/components/ui/json-ld";
import {
  buildWebApplicationSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const PAGE_URL = "https://gestorfinanceiro.pt/en/calculators/net-salary";

export const metadata: Metadata = {
  title: "Net Salary Calculator 2025 — Portugal",
  description:
    "Calculate your Portuguese net take-home salary from gross. Includes Social Security (11%) and IRS withholding 2025 for Continental Portugal. Free and up to date.",
  alternates: {
    canonical: "/en/calculators/net-salary",
    languages: {
      en: "/en/calculators/net-salary",
      "pt-PT": "/calculadoras/salario-liquido",
    },
  },
  openGraph: {
    title: "Net Salary Calculator 2025 — Portugal",
    description:
      "Calculate your Portuguese net salary instantly. Includes IRS, Social Security and meal allowance.",
    url: PAGE_URL,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Net Salary Calculator 2025 — Portugal",
    description:
      "Calculate your Portuguese net salary instantly. Includes IRS, Social Security and meal allowance.",
  },
};

const structuredData = buildGraphSchema([
  buildWebApplicationSchema({
    name: "Portugal Net Salary Calculator 2025",
    description:
      "Free net salary calculator for Portugal. Computes IRS and Social Security deductions based on 2025 tax brackets.",
    url: PAGE_URL,
  }),
  buildBreadcrumbSchema([
    { name: "Home", url: "https://gestorfinanceiro.pt/en" },
    { name: "Calculators", url: "https://gestorfinanceiro.pt/en/calculators" },
    { name: "Net Salary Calculator", url: PAGE_URL },
  ]),
  buildFaqSchema([
    {
      question: "How is net salary calculated in Portugal?",
      answer:
        "Net salary is gross salary minus mandatory deductions: Social Security (11% employee rate) and IRS withholding (variable based on income bracket, marital status, and number of dependants).",
    },
    {
      question: "What is the Social Security rate for employees in Portugal in 2025?",
      answer:
        "The employee Social Security contribution rate for salaried workers (trabalhadores por conta de outrem) is 11% of gross salary in 2025.",
    },
    {
      question: "Is meal allowance subject to tax in Portugal?",
      answer:
        "Meal allowance paid in cash is exempt from IRS up to €6.00/day. If paid by card or meal voucher, the exemption rises to €9.60/day. Any amount above these limits is taxed as income.",
    },
    {
      question: "What is the conjugal quotient in Portuguese tax?",
      answer:
        'For married couples where only one spouse has income ("único titular"), the taxable income is divided by 2 before applying IRS brackets, and the resulting tax is multiplied by 2. This generally results in lower monthly withholding.',
    },
  ]),
]);

export default function NetSalaryEnPage() {
  return (
    <>
      <JsonLd schema={structuredData} />
      <NetSalaryCalculator locale="en" />
    </>
  );
}
