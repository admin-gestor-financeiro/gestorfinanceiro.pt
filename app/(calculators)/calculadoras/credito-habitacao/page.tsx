import { MortgageCalculator } from "@/components/calculators/mortgage-calculator";
import { JsonLd } from "@/components/ui/json-ld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { structuredData } from "./metadata";

export { metadata } from "./metadata";

export default function CreditoHabitacaoPage() {
  return (
    <>
      <JsonLd schema={structuredData} />
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Início", href: "/" },
            { label: "Calculadoras", href: "/calculadoras" },
            { label: "Calculadora de Crédito Habitação" },
          ]}
        />
      </div>
      <MortgageCalculator locale="pt" />
    </>
  );
}
