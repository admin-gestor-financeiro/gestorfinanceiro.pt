import Link from "next/link";
import { JsonLd } from "@/components/ui/json-ld";
import { structuredData } from "./metadata";

export { metadata } from "./metadata";

const CALCULATORS = [
  {
    href: "/calculadoras/salario-liquido",
    emoji: "💶",
    title: "Calculadora de Salário Líquido",
    description:
      "Calcule o seu salário líquido a partir do salário bruto. Inclui retenção na fonte IRS 2026 e Segurança Social para Portugal Continental, Madeira e Açores.",
    badge: "Atualizado 2026",
  },
  {
    href: "/calculadoras/simulador-imt",
    emoji: "🏠",
    title: "Simulador de IMT e Imposto de Selo",
    description:
      "Calcule o IMT e Imposto de Selo na compra de imóvel em Portugal. Habitação própria permanente, secundária e outros imóveis.",
    badge: null,
  },
  {
    href: "/calculadoras/credito-habitacao",
    emoji: "🏦",
    title: "Calculadora de Crédito Habitação",
    description:
      "Simule a prestação mensal do seu crédito habitação, calcule IMT, Imposto de Selo e todos os custos de aquisição. Inclui taxa de esforço e análise de sensibilidade ao Euribor.",
    badge: null,
  },
];

export default function CalculadorasPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <JsonLd schema={structuredData} />

      {/* Page header */}
      <div className="mb-10">
        <nav className="mb-4 flex items-center gap-2 text-sm text-neutral-400">
          <Link href="/" className="hover:text-neutral-600 transition-colors">
            Início
          </Link>
          <span>/</span>
          <span className="text-neutral-600">Calculadoras</span>
        </nav>
        <h1 className="text-3xl font-bold text-neutral-900">Calculadoras</h1>
        <p className="mt-2 text-neutral-500">
          Ferramentas gratuitas e atualizadas para a sua vida financeira.
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
              Calcular →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
