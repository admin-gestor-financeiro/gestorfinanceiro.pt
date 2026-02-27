import type { Metadata } from "next";
import { SiteLayout } from "@/components/ui/site-layout";

export const metadata: Metadata = {
  title: "GestorFinanceiro — Free Financial Calculators for Portuguese Users",
  description:
    "Free financial tools and calculators: net salary simulator, IRS, VAT and more.",
};

export default function EnglishHomePage() {
  return (
    <SiteLayout locale="en">
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold text-primary-700">GestorFinanceiro</h1>
        <p className="mt-4 text-lg text-neutral-500">
          Financial calculators for Portuguese users.
        </p>
      </div>
    </SiteLayout>
  );
}
