import { NetSalaryCalculator } from "@/components/calculators/net-salary-calculator";
import { JsonLd } from "@/components/ui/json-ld";
import { structuredData } from "./metadata";

export { metadata } from "./metadata";

export default function NetSalaryEnPage() {
  return (
    <>
      <JsonLd schema={structuredData} />
      <NetSalaryCalculator locale="en" />
    </>
  );
}
