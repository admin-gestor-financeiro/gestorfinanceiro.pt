import Link from "next/link";
import { cn } from "@/lib/utils";

type SiteFooterProps = {
  locale?: "pt" | "en";
  className?: string;
};

const LINKS = {
  pt: {
    calculators: "/calculadoras",
    netSalary: "/calculadoras/salario-liquido",
    imtSimulator: "/calculadoras/simulador-imt",
    mortgageCalculator: "/calculadoras/credito-habitacao",
    about: "/sobre",
    contact: "/contacto",
  },
  en: {
    calculators: "/en/calculators",
    netSalary: "/en/calculators/net-salary",
    imtSimulator: "/en/calculators/imt-simulator",
    mortgageCalculator: "/en/calculators/mortgage-calculator",
    about: "/en/about",
    contact: "/en/contact",
  },
} as const;

export function SiteFooter({ locale = "pt", className }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const links = LINKS[locale];

  const copy =
    locale === "en"
      ? {
          tagline: "Free financial calculators in Portugal.",
          calculators: "Calculators",
          netSalary: "Net Salary Calculator",
          imtSimulator: "IMT & Stamp Duty Simulator",
          mortgageCalculator: "Mortgage Calculator",
          company: "Company",
          about: "About",
          contact: "Contact",
          disclaimer:
            "The values shown are estimates. Always verify with official sources.",
          rights: `© ${year} Gestor Financeiro. All rights reserved.`,
        }
      : {
          tagline: "Calculadoras financeiras gratuitas em Portugal.",
          calculators: "Calculadoras",
          netSalary: "Calculadora de Salário Líquido",
          imtSimulator: "Simulador de IMT e Imposto de Selo",
          mortgageCalculator: "Calculadora de Crédito Habitação",
          company: "Empresa",
          about: "Sobre nós",
          contact: "Contacto",
          disclaimer:
            "Os valores apresentados são estimativas. Verifique sempre com fontes oficiais.",
          rights: `© ${year} Gestor Financeiro. Todos os direitos reservados.`,
        };

  return (
    <footer className={cn("border-t border-neutral-200 bg-white mt-auto", className)}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-sm font-bold text-white">
                GF
              </span>
              <span className="font-semibold text-neutral-800">Gestor Financeiro</span>
            </div>
            <p className="text-sm text-neutral-500">{copy.tagline}</p>
          </div>

          {/* Calculators */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {copy.calculators}
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href={links.netSalary}
                  className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  {copy.netSalary}
                </Link>
              </li>
              <li>
                <Link
                  href={links.imtSimulator}
                  className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  {copy.imtSimulator}
                </Link>
              </li>
              <li>
                <Link
                  href={links.mortgageCalculator}
                  className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  {copy.mortgageCalculator}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {copy.company}
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href={links.about}
                  className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  {copy.about}
                </Link>
              </li>
              <li>
                <Link
                  href={links.contact}
                  className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  {copy.contact}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-100 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-neutral-400">{copy.disclaimer}</p>
          <p className="text-xs text-neutral-400 shrink-0">{copy.rights}</p>
        </div>
      </div>
    </footer>
  );
}
