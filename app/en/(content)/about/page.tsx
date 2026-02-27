import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Gestor Financeiro",
  description:
    "Learn about Gestor Financeiro: free and up-to-date financial calculators for Portugal.",
  alternates: {
    canonical: "/en/about",
    languages: { en: "/en/about", "pt-PT": "/sobre" },
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14">
      <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-400">
        <Link href="/en" className="hover:text-neutral-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-600">About</span>
      </nav>

      <h1 className="text-3xl font-bold text-neutral-900 mb-6">About us</h1>

      <div className="prose prose-neutral max-w-none space-y-5 text-neutral-600 leading-relaxed">
        <p>
          <strong className="text-neutral-800">Gestor Financeiro</strong> is an independent project providing free financial calculators for people living and working in Portugal. Our goal is to make tax and payroll information more accessible to everyone.
        </p>

        <p>
          All tools are built against current Portuguese legislation and updated regularly to reflect the withholding tables, Social Security rates and other fiscal parameters published by the Portuguese Tax and Customs Authority (AT) and the Government.
        </p>

        <h2 className="text-xl font-semibold text-neutral-800 pt-2">What we offer</h2>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Net salary calculator with IRS 2026 withholding tables</li>
          <li>Support for Continental Portugal, Madeira and Azores</li>
          <li>Calculations for single, married and various dependent scenarios</li>
          <li>Meal allowance and duodécimos (holiday/Christmas pay) simulation</li>
        </ul>

        <h2 className="text-xl font-semibold text-neutral-800 pt-2">Legal notice</h2>
        <p>
          The values shown are estimates based on known fiscal parameters. They do not constitute tax or legal advice. For specific situations, always consult a certified accountant or the Tax Authority.
        </p>

        <p>
          Questions or suggestions?{" "}
          <Link href="/en/contact" className="text-primary-600 hover:underline">
            Get in touch.
          </Link>
        </p>
      </div>
    </div>
  );
}
