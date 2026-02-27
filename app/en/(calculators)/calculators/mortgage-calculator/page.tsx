import { MortgageCalculator } from "@/components/calculators/mortgage-calculator";
import { JsonLd } from "@/components/ui/json-ld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { structuredData } from "./metadata";

export { metadata } from "./metadata";

export default function MortgageCalculatorEnPage() {
  return (
    <>
      <JsonLd schema={structuredData} />
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/en" },
            { label: "Calculators", href: "/en/calculators" },
            { label: "Mortgage Calculator" },
          ]}
        />
      </div>
      <MortgageCalculator locale="en" />
    </>
  );
}
