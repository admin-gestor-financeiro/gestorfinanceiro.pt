import type { Metadata } from "next";
import Link from "next/link";
import { SiteLayout } from "@/components/ui/site-layout";

export const metadata: Metadata = {
  title: "Gestor Financeiro — Calculadoras Financeiras para Portugueses",
  description:
    "Ferramentas e calculadoras financeiras gratuitas para portugueses: simulador de salário líquido, IRS, Segurança Social e muito mais.",
  alternates: {
    canonical: "/",
    languages: { "pt-PT": "/", en: "/en" },
  },
};

const CALCULATORS = [
  {
    href: "/calculadoras/salario-liquido",
    emoji: "💶",
    title: "Calculadora de Salário Líquido",
    description:
      "Calcule o seu salário líquido a partir do bruto. Inclui IRS 2026 e Segurança Social para Portugal Continental, Madeira e Açores.",
  },
];

export default function HomePage() {
  return (
    <SiteLayout locale="pt">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16 px-4 sm:px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Calculadoras financeiras{" "}
            <span className="text-primary-600">para portugueses</span>
          </h1>
          <p className="mt-4 text-lg text-neutral-500">
            Ferramentas gratuitas e atualizadas para calcular o seu salário líquido, impostos e muito mais.
          </p>
          <Link
            href="/calculadoras"
            className="mt-8 inline-block rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
          >
            Ver todas as calculadoras
          </Link>
        </div>
      </section>

      {/* Calculators grid */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <h2 className="text-xl font-semibold text-neutral-800 mb-6">
          Calculadoras disponíveis
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
                Calcular →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
