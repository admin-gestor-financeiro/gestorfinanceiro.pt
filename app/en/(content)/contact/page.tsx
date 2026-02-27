import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact — Gestor Financeiro",
  description:
    "Get in touch with the Gestor Financeiro team for questions, suggestions or partnerships.",
  alternates: {
    canonical: "/en/contact",
    languages: { en: "/en/contact", "pt-PT": "/contacto" },
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14">
      <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-400">
        <Link href="/en" className="hover:text-neutral-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-600">Contact</span>
      </nav>

      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Contact</h1>

      <div className="space-y-5 text-neutral-600 leading-relaxed">
        <p>
          Have a question about the calculations, spotted an error, or want to suggest a new calculator? We would love to hear from you.
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
            We typically reply within 1–3 business days.
          </p>
        </div>

        <p className="text-sm text-neutral-500">
          For specific tax questions, we recommend consulting a certified accountant or the{" "}
          <a
            href="https://www.portaldasfinancas.gov.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            Portuguese Tax Authority
          </a>
          .
        </p>
      </div>
    </div>
  );
}
