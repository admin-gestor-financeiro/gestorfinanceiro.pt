import { ImiCalculator } from "@/components/calculators/imi-calculator";
import { JsonLd } from "@/components/ui/json-ld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { structuredData } from "./metadata";

export { metadata } from "./metadata";

export default function SimuladorImi2026Page() {
  return (
    <>
      <JsonLd schema={structuredData} />
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Início", href: "/" },
            { label: "Calculadoras", href: "/calculadoras" },
            { label: "Simulador de IMI 2026" },
          ]}
        />
      </div>
      <ImiCalculator locale="pt" />
    </>
  );
}
