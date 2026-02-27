import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/ui/json-ld";
import {
  buildWebPageSchema,
  buildBreadcrumbSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const PAGE_URL = "https://gestorfinanceiro.pt/calculadoras";

export const metadata: Metadata = {
  title: "Calculadoras Financeiras — Gestor Financeiro",
  description:
    "Todas as calculadoras financeiras gratuitas em Portugal: salário líquido, IRS, Segurança Social e muito mais.",
  alternates: {
    canonical: "/calculadoras",
    languages: { "pt-PT": "/calculadoras", en: "/en/calculators" },
  },
  openGraph: {
    title: "Calculadoras Financeiras — Gestor Financeiro",
    description:
      "Todas as calculadoras financeiras gratuitas em Portugal: salário líquido, IRS, Segurança Social e muito mais.",
    url: PAGE_URL,
    siteName: "Gestor Financeiro",
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Calculadoras Financeiras — Gestor Financeiro",
    description:
      "Todas as calculadoras financeiras gratuitas em Portugal: salário líquido, IRS, Segurança Social e muito mais.",
  },
};

const structuredData = buildGraphSchema([
  buildWebPageSchema({
    type: "CollectionPage",
    name: "Calculadoras Financeiras",
    description:
      "Todas as calculadoras financeiras gratuitas do Gestor Financeiro: salário líquido, IRS, Segurança Social e muito mais.",
    url: PAGE_URL,
    inLanguage: "pt-PT",
  }),
  buildBreadcrumbSchema([
    { name: "Início", url: "https://gestorfinanceiro.pt" },
    { name: "Calculadoras", url: PAGE_URL },
  ]),
]);

const CALCULATORS = [
  {
    href: "/calculadoras/salario-liquido",
    emoji: "💶",
    title: "Calculadora de Salário Líquido",
    description:
      "Calcule o seu salário líquido a partir do salário bruto. Inclui retenção na fonte IRS 2026 e Segurança Social para Portugal Continental, Madeira e Açores.",
    badge: "Atualizado 2026",
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
