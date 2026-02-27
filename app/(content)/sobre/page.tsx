import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/ui/json-ld";
import {
  buildWebPageSchema,
  buildBreadcrumbSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const PAGE_URL = "https://gestorfinanceiro.pt/sobre";

export const metadata: Metadata = {
  title: "Sobre Nós — Gestor Financeiro",
  description:
    "Conheça o Gestor Financeiro: calculadoras financeiras gratuitas e atualizadas em Portugal.",
  alternates: {
    canonical: "/sobre",
    languages: { "pt-PT": "/sobre", en: "/en/about" },
  },
  openGraph: {
    title: "Sobre Nós — Gestor Financeiro",
    description:
      "Conheça o Gestor Financeiro: calculadoras financeiras gratuitas e atualizadas em Portugal.",
    url: PAGE_URL,
    siteName: "Gestor Financeiro",
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sobre Nós — Gestor Financeiro",
    description:
      "Conheça o Gestor Financeiro: calculadoras financeiras gratuitas e atualizadas em Portugal.",
  },
  robots: { index: false, follow: true },
};

const structuredData = buildGraphSchema([
  buildWebPageSchema({
    type: "AboutPage",
    name: "Sobre Nós — Gestor Financeiro",
    description:
      "Projeto independente que disponibiliza calculadoras financeiras gratuitas em Portugal, com foco na transparência fiscal e laboral.",
    url: PAGE_URL,
    inLanguage: "pt-PT",
  }),
  buildBreadcrumbSchema([
    { name: "Início", url: "https://gestorfinanceiro.pt" },
    { name: "Sobre nós", url: PAGE_URL },
  ]),
]);

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14">
      <JsonLd schema={structuredData} />

      <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-400">
        <Link href="/" className="hover:text-neutral-600 transition-colors">
          Início
        </Link>
        <span>/</span>
        <span className="text-neutral-600">Sobre nós</span>
      </nav>

      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Sobre nós</h1>

      <div className="prose prose-neutral max-w-none space-y-5 text-neutral-600 leading-relaxed">
        <p>
          O <strong className="text-neutral-800">Gestor Financeiro</strong> é um projeto independente que disponibiliza calculadoras financeiras gratuitas em Portugal. O nosso objetivo é tornar a informação fiscal e laboral mais acessível a todos.
        </p>

        <p>
          Todas as ferramentas são desenvolvidas com base na legislação portuguesa em vigor e atualizadas regularmente para refletir as tabelas de retenção na fonte, taxas de Segurança Social e demais parâmetros fiscais publicados pela Autoridade Tributária e Aduaneira (AT) e pelo Governo.
        </p>

        <h2 className="text-xl font-semibold text-neutral-800 pt-2">O que oferecemos</h2>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Calculadora de salário líquido com tabelas IRS 2026</li>
          <li>Suporte para Portugal Continental, Madeira e Açores</li>
          <li>Cálculo de retenção na fonte para solteiros, casados e diversos dependentes</li>
          <li>Simulação de subsídio de alimentação e duodécimos</li>
        </ul>

        <h2 className="text-xl font-semibold text-neutral-800 pt-2">Aviso legal</h2>
        <p>
          Os valores apresentados são estimativas calculadas com base em parâmetros fiscais conhecidos. Não constituem aconselhamento fiscal ou jurídico. Para situações específicas, consulte sempre um contabilista certificado ou a Autoridade Tributária.
        </p>

        <p>
          Tem dúvidas ou sugestões?{" "}
          <Link href="/contacto" className="text-primary-600 hover:underline">
            Fale connosco.
          </Link>
        </p>
      </div>
    </div>
  );
}
