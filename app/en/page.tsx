import Link from "next/link";
import { SiteLayout } from "@/components/ui/site-layout";
import { JsonLd } from "@/components/ui/json-ld";
import { structuredData } from "./metadata";

export { metadata } from "./metadata";

const CALCULATORS = [
  {
    href: "/en/calculators/net-salary",
    emoji: "💶",
    title: "Net Salary Calculator",
    description:
      "Calculate your Portuguese net take-home pay from gross. Includes IRS 2026 and Social Security for Continental Portugal, Madeira and Azores.",
  },
  {
    href: "/en/calculators/imt-simulator",
    emoji: "🏠",
    title: "IMT & Stamp Duty Simulator",
    description:
      "Calculate IMT and Stamp Duty when buying property in Portugal. Includes IMT Jovem youth exemption and 2025 tables for Mainland and Autonomous Regions.",
  },
  {
    href: "/en/calculators/mortgage-calculator",
    emoji: "🏦",
    title: "Mortgage Calculator",
    description:
      "Simulate your monthly mortgage payment, calculate IMT, Stamp Duty and all acquisition costs. Includes affordability ratio and Euribor sensitivity analysis.",
  },
];

export default function EnglishHomePage() {
  return (
    <SiteLayout locale="en">
      <JsonLd schema={structuredData} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16 px-4 sm:px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Financial calculators{" "}
            <span className="text-primary-600">for Portugal</span>
          </h1>
          <p className="mt-4 text-lg text-neutral-500">
            Free, accurate and up-to-date tools to calculate your net salary, taxes and more.
          </p>
          <Link
            href="/en/calculators"
            className="mt-8 inline-block rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
          >
            Browse all calculators
          </Link>
        </div>
      </section>

      {/* Calculators grid */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <h2 className="text-xl font-semibold text-neutral-800 mb-6">
          Available calculators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULATORS.map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              className="group flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition-all"
            >
              <span className="text-3xl">{calc.emoji}</span>
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
      </section>
    </SiteLayout>
  );
}
