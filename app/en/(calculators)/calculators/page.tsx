import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/ui/json-ld";
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

const structuredData = buildGraphSchema([
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

const CALCULATORS = [
  {
    href: "/en/calculators/net-salary",
    emoji: "💶",
    title: "Net Salary Calculator",
    description:
      "Calculate your Portuguese net take-home pay from gross salary. Includes IRS 2026 withholding and Social Security for Continental Portugal, Madeira and Azores.",
    badge: "Updated 2026",
  },
  {
    href: "/en/calculators/imt-simulator",
    emoji: "🏠",
    title: "IMT & Stamp Duty Simulator",
    description:
      "Calculate IMT (Property Transfer Tax) and Stamp Duty when buying property in Portugal. Covers primary residence, secondary home and other urban property.",
    badge: null,
  },
];

export default function CalculatorsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <JsonLd schema={structuredData} />

      {/* Page header */}
      <div className="mb-10">
        <nav className="mb-4 flex items-center gap-2 text-sm text-neutral-400">
          <Link href="/en" className="hover:text-neutral-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-neutral-600">Calculators</span>
        </nav>
        <h1 className="text-3xl font-bold text-neutral-900">Calculators</h1>
        <p className="mt-2 text-neutral-500">
          Free and up-to-date tools for your financial life in Portugal.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map((calc) => (
          <Link
            key={calc.href}
            href={calc.href}
            className="group flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-3xl">{calc.emoji}</span>
              {calc.badge && (
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                  {calc.badge}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors">
                {calc.title}
              </p>
              <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
                {calc.description}
              </p>
            </div>
            <span className="mt-auto text-xs font-medium text-primary-600">
              Calculate →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
