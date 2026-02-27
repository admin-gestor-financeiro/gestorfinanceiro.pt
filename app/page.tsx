import type { Metadata } from "next";
import { SiteLayout } from "@/components/ui/site-layout";

export const metadata: Metadata = {
  title: "Gestor Financeiro — Calculadoras Financeiras para Portugueses",
  description:
    "Ferramentas e calculadoras financeiras gratuitas: simulador de salário líquido, IRS, IVA e muito mais.",
};

export default function HomePage() {
  return (
    <SiteLayout locale="pt">
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold text-primary-700">Gestor Financeiro</h1>
        <p className="mt-4 text-lg text-neutral-500">
          Calculadoras financeiras para portugueses.
        </p>
      </div>
    </SiteLayout>
  );
}
