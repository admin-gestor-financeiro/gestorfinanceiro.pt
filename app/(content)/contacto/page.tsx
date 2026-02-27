import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contacto — Gestor Financeiro",
  description:
    "Entre em contacto com a equipa do Gestor Financeiro para dúvidas, sugestões ou parcerias.",
  alternates: {
    canonical: "/contacto",
    languages: { "pt-PT": "/contacto", en: "/en/contact" },
  },
};

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14">
      <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-400">
        <Link href="/" className="hover:text-neutral-600 transition-colors">
          Início
        </Link>
        <span>/</span>
        <span className="text-neutral-600">Contacto</span>
      </nav>

      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Contacto</h1>

      <div className="space-y-5 text-neutral-600 leading-relaxed">
        <p>
          Tem dúvidas sobre os cálculos, encontrou um erro ou quer sugerir uma nova calculadora? Estamos disponíveis para ajudar.
        </p>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-neutral-400 mb-2">
            Email
          </p>
          <a
            href="mailto:info@gestorfinanceiro.pt"
            className="text-lg font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            info@gestorfinanceiro.pt
          </a>
          <p className="mt-3 text-sm text-neutral-500">
            Respondemos habitualmente em 1–3 dias úteis.
          </p>
        </div>

        <p className="text-sm text-neutral-500">
          Para questões fiscais específicas, recomendamos a consulta de um contabilista certificado ou a{" "}
          <a
            href="https://www.portaldasfinancas.gov.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            Autoridade Tributária
          </a>
          .
        </p>
      </div>
    </div>
  );
}
