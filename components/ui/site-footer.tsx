import Link from "next/link";
import { cn } from "@/lib/utils";

type SiteFooterProps = {
  locale?: "pt" | "en";
  className?: string;
};

export function SiteFooter({ locale = "pt", className }: SiteFooterProps) {
  const year = new Date().getFullYear();

  const copy =
    locale === "en"
      ? {
          tagline: "Free financial calculators for Portuguese users.",
          calculators: "Calculators",
          netSalary: "Net Salary Calculator",
          disclaimer:
            "The values shown are estimates. Always verify with official sources.",
          rights: `© ${year} Gestor Financeiro. All rights reserved.`,
        }
      : {
          tagline: "Calculadoras financeiras gratuitas para portugueses.",
          calculators: "Calculadoras",
          netSalary: "Calculadora de Salário Líquido",
          disclaimer:
            "Os valores apresentados são estimativas. Verifique sempre com fontes oficiais.",
          rights: `© ${year} Gestor Financeiro. Todos os direitos reservados.`,
        };

  const base = locale === "en" ? "/en" : "";

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

          {/* Links */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {copy.calculators}
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`${base}/calculadoras/salario-liquido`.replace("/en/calculadoras", "/en/calculators/net-salary")}
                  className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  {copy.netSalary}
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
