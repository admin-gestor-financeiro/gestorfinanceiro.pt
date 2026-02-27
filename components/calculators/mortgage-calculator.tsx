"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Info, ChevronDown, ChevronRight, Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateMortgage,
  monthlyPayment,
  maxTermYears,
  dstiStatus,
  EURIBOR_FALLBACK,
  EURIBOR_TENOR_OPTIONS,
  PURPOSE_OPTIONS,
  FEE_DEFAULTS,
  type MortgagePurpose,
  type EuriborTenor,
  type MortgageResult,
  type AmortizationRow,
  type StressScenario,
  type UpfrontCosts,
} from "@/lib/calculators/mortgage";
import { REGION_OPTIONS, type ImtRegion, type ImtJovemStatus } from "@/lib/calculators/imt";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PillToggle } from "@/components/ui/pill-toggle";
import { Select } from "@/components/ui/select";
import { Collapsible } from "@/components/ui/collapsible";
import type { EuriborRatesResponse } from "@/app/api/euribor/route";

// ─── Types ────────────────────────────────────────────────────────────────────

type Locale = "pt" | "en";
type LoanMode = "amount" | "ltv";
type CalcMode = "calculator" | "compare";

type FormState = {
  purchasePrice: string;
  loanMode: LoanMode;
  loanAmount: string;
  ltvPercent: string;
  termYears: number;
  euriborTenor: EuriborTenor;
  euriborRate: string;
  spread: string;
  purpose: MortgagePurpose;
  region: ImtRegion;
  // IMT Jovem
  jovemEnabled: boolean;
  jovemBuyers: "full" | "half";
  // Affordability
  netIncome: string;
  existingDebt: string;
  // Advanced: VPT
  vptEnabled: boolean;
  vpt: string;
  // Advanced: fee overrides
  feesOverrideEnabled: boolean;
  feeRegistrationNotary: string;
  feeBankValuation: string;
  feeBankProcessing: string;
};

type ComparisonItem = {
  id: string;
  label: string;
  purchasePrice: string;
  ltvPercent: string;
  euriborRate: string;
  spread: string;
  termYears: number;
  purpose: MortgagePurpose;
  region: ImtRegion;
  jovemEnabled: boolean;
  existingDebt: string;
};

// ─── Strings ──────────────────────────────────────────────────────────────────

const STRINGS = {
  pt: {
    title: "Calculadora de Crédito Habitação",
    subtitle: "Simule a sua prestação, custos de aquisição e taxa de esforço · Dados 2026",
    // Mode toggle
    calculatorMode: "Calculadora",
    compareMode: "Comparar",
    // Form sections
    sectionProperty: "Dados do Imóvel",
    sectionLoan: "Dados do Empréstimo",
    sectionRate: "Taxa de Juro",
    sectionAffordability: "Taxa de Esforço (opcional)",
    sectionAdvanced: "Opções avançadas",
    // Property fields
    purchasePriceLabel: "Preço de compra (€)",
    purchasePricePlaceholder: "ex: 250 000",
    purposeLabel: "Finalidade",
    regionLabel: "Região",
    vptLabel: "VPT — Valor Patrimonial Tributário (€)",
    vptHint: "Se o VPT for superior ao preço de compra, é a base para o cálculo do IMT e IS. Deixe em branco para usar o preço de compra.",
    // Loan fields
    loanAmountLabel: "Montante do empréstimo (€)",
    ltvLabel: "Percentagem de financiamento (LTV %)",
    ltvHint: (ltv: string) => `${ltv}% do preço de compra`,
    termLabel: "Prazo (anos)",
    modeAmount: "Valor €",
    modeLtv: "% Financiamento",
    // Rate fields
    euriborTenorLabel: "Indexante",
    euriborRateLabel: "Taxa Euribor (%)",
    euriborLive: "Atualizado",
    euriborEcb: "Via BCE",
    euriborFallback: "Estimativa",
    euriborLoading: "A carregar Euribor…",
    spreadLabel: "Spread (%)",
    spreadHint: "Taxa acordada com o banco. Consulte a proposta do banco.",
    tanLabel: "TAN",
    // Affordability
    netIncomeLabel: "Rendimento líquido mensal do agregado (€)",
    netIncomePlaceholder: "ex: 2 500",
    existingDebtLabel: "Encargos mensais com outros créditos (€)",
    existingDebtPlaceholder: "0",
    // IMT Jovem
    imtJovemSection: "IMT Jovem (≤ 35 anos)",
    imtJovemDesc: "Isenção de IMT e IS na 1.ª habitação própria para compradores ≤ 35 anos (D.L. n.º 48-A/2024).",
    imtJovemBuyersLabel: "Compradores elegíveis",
    imtJovemFull: "Comprador único ou ambos elegíveis",
    imtJovemHalf: "Apenas 1 de 2 compradores elegível (50% do benefício)",
    imtJovemFullShort: "Todos elegíveis",
    imtJovemHalfShort: "1 de 2 elegível",
    // Fee overrides
    feesTitle: "Custos estimados (editáveis)",
    feeRegistrationNotary: "Registo e notário (€)",
    feeBankValuation: "Avaliação do imóvel (€)",
    feeBankProcessing: "Comissão de abertura / instrução (€)",
    feesNote: "Valores são estimativas de mercado. Peça orçamento ao banco e cartório antes de fechar negócio.",
    // Results
    emptyState: "Introduza os dados do imóvel e empréstimo para ver a simulação.",
    resultsTitle: "Simulação",
    monthlyPaymentLabel: "Prestação mensal",
    tanLabelResult: "TAN",
    depositLabel: "Entrada necessária",
    depositOfPrice: "do preço",
    totalCashLabel: "Liquidez total necessária",
    totalCashHint: "Entrada + todos os custos de aquisição",
    dstiLabel: "Taxa de esforço",
    dstiUnknown: "Indique o seu rendimento",
    dstiGood: "Dentro do limite BdP (≤ 50%)",
    dstiWarn: "Próximo do limite BdP (50%)",
    dstiBad: "Acima do limite BdP (50%)",
    dstiStressLabel: "Taxa de esforço (com buffer BdP +1,5 p.p.)",
    // Upfront costs
    upfrontTitle: "Custos de aquisição",
    imtLabel: "IMT",
    imtExempt: "Isento",
    stampDutyPurchaseLabel: "Imposto de Selo — compra (0,8%)",
    stampDutyMortgageLabel: "Imposto de Selo — hipoteca (0,6%)",
    registrationNotaryLabel: "Registo e notário",
    bankValuationLabel: "Avaliação bancária",
    bankProcessingLabel: "Comissão de instrução",
    upfrontTotalLabel: "Total custos de aquisição",
    feesEstimateNote: "* Valor estimado. Confirme com o banco e cartório.",
    // Stress test
    stressTitle: "Sensibilidade à subida do Euribor",
    stressColScenario: "Cenário",
    stressColTan: "TAN",
    stressColPayment: "Prestação",
    stressColDsti: "Taxa de esforço",
    stressDeltaHint: "Clique no valor para editar · ▼▲ para ajustar 0,1 p.p.",
    // Amortization
    scheduleTitle: "Plano de amortização",
    scheduleColYear: "Ano",
    scheduleColPayment: "Prestação anual",
    scheduleColPrincipal: "Capital amortizado",
    scheduleColInterest: "Juros pagos",
    scheduleColBalance: "Capital em dívida",
    scheduleMonthCol: "Mês",
    scheduleExpandHint: "Clique num ano para ver o detalhe mensal",
    scheduleTotalLabel: "Total",
    // Totals panel
    totalsTitle: "Totais do crédito",
    totalPaidLabel: "Total pago (capital + juros)",
    totalInterestLabel: "Total de juros pagos",
    // Disclaimer
    disclaimer: "Simulação de carácter informativo. Os valores apresentados são estimativas baseadas nos dados introduzidos. Consulte o seu banco e reveja a FINE (Ficha de Informação Normalizada Europeia) antes de tomar qualquer decisão.",
    // Compare mode
    addScenario: "Adicionar cenário",
    removeScenario: "Remover",
    compareNetIncomeLabel: "Rendimento mensal líquido (€) — para taxa de esforço",
    compareEmpty: "Adicione cenários para comparar simulações lado a lado.",
    scenarioDefault: (n: number) => `Cenário ${n}`,
  },
  en: {
    title: "Mortgage Calculator",
    subtitle: "Simulate your monthly payment, acquisition costs, and affordability · 2026 data",
    calculatorMode: "Calculator",
    compareMode: "Compare",
    sectionProperty: "Property Details",
    sectionLoan: "Loan Details",
    sectionRate: "Interest Rate",
    sectionAffordability: "Affordability (optional)",
    sectionAdvanced: "Advanced options",
    purchasePriceLabel: "Purchase price (€)",
    purchasePricePlaceholder: "e.g. 250,000",
    purposeLabel: "Purpose",
    regionLabel: "Region",
    vptLabel: "VPT — Tax Assessment Value (€)",
    vptHint: "If the VPT is higher than the purchase price, it is the IMT and stamp duty tax base. Leave blank to use the purchase price.",
    loanAmountLabel: "Loan amount (€)",
    ltvLabel: "Loan-to-value ratio (LTV %)",
    ltvHint: (ltv: string) => `${ltv}% of purchase price`,
    termLabel: "Term (years)",
    modeAmount: "Amount €",
    modeLtv: "% LTV",
    euriborTenorLabel: "Euribor index",
    euriborRateLabel: "Euribor rate (%)",
    euriborLive: "Live",
    euriborEcb: "Via ECB",
    euriborFallback: "Estimate",
    euriborLoading: "Loading Euribor…",
    spreadLabel: "Spread (%)",
    spreadHint: "Rate agreed with your bank. Check your bank's proposal.",
    tanLabel: "TAN",
    netIncomeLabel: "Net monthly household income (€)",
    netIncomePlaceholder: "e.g. 2,500",
    existingDebtLabel: "Existing monthly debt payments (€)",
    existingDebtPlaceholder: "0",
    imtJovemSection: "IMT Jovem (≤ 35 years)",
    imtJovemDesc: "IMT and stamp duty exemption on first primary residence for buyers ≤ 35 years old (D.L. n.º 48-A/2024).",
    imtJovemBuyersLabel: "Eligible buyers",
    imtJovemFull: "Single buyer or both buyers eligible",
    imtJovemHalf: "Only 1 of 2 buyers eligible (50% of benefit)",
    imtJovemFullShort: "All eligible",
    imtJovemHalfShort: "1 of 2 eligible",
    feesTitle: "Estimated costs (editable)",
    feeRegistrationNotary: "Registration and notary (€)",
    feeBankValuation: "Property valuation (€)",
    feeBankProcessing: "Bank processing fee (€)",
    feesNote: "Values are market estimates. Request quotes from your bank and notary before completing the purchase.",
    emptyState: "Enter property and loan details to see the simulation.",
    resultsTitle: "Simulation",
    monthlyPaymentLabel: "Monthly payment",
    tanLabelResult: "TAN",
    depositLabel: "Deposit required",
    depositOfPrice: "of price",
    totalCashLabel: "Total cash needed",
    totalCashHint: "Deposit + all acquisition costs",
    dstiLabel: "Effort rate (DSTI)",
    dstiUnknown: "Enter your income to calculate",
    dstiGood: "Within BdP limit (≤ 50%)",
    dstiWarn: "Near BdP limit (50%)",
    dstiBad: "Above BdP limit (50%)",
    dstiStressLabel: "Effort rate (with BdP +1.5 p.p. buffer)",
    upfrontTitle: "Acquisition costs",
    imtLabel: "IMT",
    imtExempt: "Exempt",
    stampDutyPurchaseLabel: "Stamp duty — purchase (0.8%)",
    stampDutyMortgageLabel: "Stamp duty — mortgage (0.6%)",
    registrationNotaryLabel: "Registration & notary",
    bankValuationLabel: "Bank valuation",
    bankProcessingLabel: "Processing fee",
    upfrontTotalLabel: "Total acquisition costs",
    feesEstimateNote: "* Estimated value. Confirm with your bank and notary.",
    stressTitle: "Euribor sensitivity analysis",
    stressColScenario: "Scenario",
    stressColTan: "TAN",
    stressColPayment: "Monthly payment",
    stressColDsti: "Effort rate",
    stressDeltaHint: "Click value to edit · ▼▲ to adjust by 0.1 p.p.",
    scheduleTitle: "Amortization schedule",
    scheduleColYear: "Year",
    scheduleColPayment: "Annual payment",
    scheduleColPrincipal: "Principal paid",
    scheduleColInterest: "Interest paid",
    scheduleColBalance: "Outstanding balance",
    scheduleMonthCol: "Month",
    scheduleExpandHint: "Click a year to see monthly breakdown",
    scheduleTotalLabel: "Total",
    totalsTitle: "Loan totals",
    totalPaidLabel: "Total paid (principal + interest)",
    totalInterestLabel: "Total interest paid",
    disclaimer: "For informational purposes only. Values are estimates based on inputs provided. Consult your bank and review the ESIS (European Standardised Information Sheet) before making any decision.",
    addScenario: "Add scenario",
    removeScenario: "Remove",
    compareNetIncomeLabel: "Net monthly income (€) — for affordability ratio",
    compareEmpty: "Add scenarios to compare simulations side by side.",
    scenarioDefault: (n: number) => `Scenario ${n}`,
  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatThousands(input: string, decSep: string): string {
  const stripped = input.replace(/\s/g, "").replace(new RegExp(`[^\\d${decSep}]`, "g"), "");
  const sepIdx = stripped.indexOf(decSep);
  const intPart = sepIdx >= 0 ? stripped.slice(0, sepIdx) : stripped;
  const decPart = sepIdx >= 0 ? stripped.slice(sepIdx) : "";
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0") + decPart;
}

function parseNum(raw: string): number {
  return parseFloat(raw.replace(/\u00a0|\s/g, "").replace(",", ".")) || 0;
}

function fmtCurrency(v: number, fmtLocale: string): string {
  return v.toLocaleString(fmtLocale, { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtCurrencyDec(v: number, fmtLocale: string): string {
  return v.toLocaleString(fmtLocale, { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(v: number, fmtLocale: string, decimals = 2): string {
  return (v * 100).toLocaleString(fmtLocale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + "%";
}

function fmtPctRaw(v: number, fmtLocale: string): string {
  return v.toLocaleString(fmtLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
}

/** Replicate computeDsti from mortgage.ts (returns percent value like 45.00, not 0.45) */
function computeDstiPct(payment: number, existingDebt: number, netIncome: number | undefined): number | null {
  if (!netIncome || netIncome <= 0) return null;
  return Math.round(((payment + existingDebt) / netIncome) * 10000) / 100;
}

// ─── Default form state ───────────────────────────────────────────────────────

function defaultForm(locale: Locale): FormState {
  const decSep = locale === "pt" ? "," : ".";
  return {
    purchasePrice: "",
    loanMode: "ltv",
    loanAmount: "",
    ltvPercent: "90",
    termYears: 30,
    euriborTenor: "12m",
    euriborRate: decSep === "," ? "2,25" : "2.25",
    spread: decSep === "," ? "1,00" : "1.00",
    purpose: "hpp",
    region: "continente",
    jovemEnabled: false,
    jovemBuyers: "full",
    netIncome: "",
    existingDebt: "",
    vptEnabled: false,
    vpt: "",
    feesOverrideEnabled: false,
    feeRegistrationNotary: FEE_DEFAULTS.registrationNotary.toString(),
    feeBankValuation: FEE_DEFAULTS.bankValuation.toString(),
    feeBankProcessing: FEE_DEFAULTS.bankProcessing.toString(),
  };
}

function defaultComparisonItem(n: number, locale: Locale, fromForm?: FormState): ComparisonItem {
  const decSep = locale === "pt" ? "," : ".";
  return {
    id: crypto.randomUUID(),
    label: STRINGS[locale].scenarioDefault(n),
    purchasePrice: fromForm?.purchasePrice ?? "",
    ltvPercent: fromForm?.ltvPercent ?? "90",
    euriborRate: fromForm?.euriborRate ?? (decSep === "," ? "2,25" : "2.25"),
    spread: fromForm?.spread ?? (decSep === "," ? "1,00" : "1.00"),
    termYears: fromForm?.termYears ?? 30,
    purpose: fromForm?.purpose ?? "hpp",
    region: fromForm?.region ?? "continente",
    jovemEnabled: fromForm?.jovemEnabled ?? false,
    existingDebt: fromForm?.existingDebt ?? "",
  };
}

// ─── DeltaStepper ─────────────────────────────────────────────────────────────

function DeltaStepper({
  delta,
  onChange,
  locale,
}: {
  delta: number;
  onChange: (v: number) => void;
  locale: Locale;
}) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const decSep = locale === "pt" ? "," : ".";

  // delta is decimal (e.g. 0.01 = 1 p.p.) → display as percentage
  const pct = Math.round(delta * 1000) / 10; // e.g. 0.01 → 1.0

  function step(dir: 1 | -1) {
    const next = Math.round((pct + dir * 0.1) * 10) / 10;
    if (next < 0.1 || next > 20) return;
    onChange(next / 100);
  }

  function startEdit() {
    setInputVal(pct.toFixed(1).replace(".", decSep));
    setEditing(true);
  }

  function commitEdit() {
    const parsed = parseFloat(inputVal.replace(",", "."));
    if (!isNaN(parsed) && parsed >= 0.1 && parsed <= 20) {
      onChange(Math.round(parsed * 10) / 10 / 100);
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-neutral-500 text-xs select-none">+</span>
        <input
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          type="text"
          inputMode="decimal"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="w-12 rounded border border-primary-400 px-1 py-0.5 text-center text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
        <span className="text-neutral-500 text-xs select-none">p.p.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={() => step(-1)}
        title="-0.1 p.p."
        className="flex h-5 w-5 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
      >
        {/* minus icon */}
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-2.5 w-2.5" aria-hidden>
          <path d="M3 7.5h10v1H3z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={startEdit}
        title="Click to edit"
        className="min-w-[5.5rem] rounded px-1.5 py-0.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors text-center tabular-nums"
      >
        +{pct.toFixed(1).replace(".", decSep)} p.p.
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        title="+0.1 p.p."
        className="flex h-5 w-5 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
      >
        {/* plus icon */}
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-2.5 w-2.5" aria-hidden>
          <path d="M8.5 3v4.5H13v1H8.5V13h-1V8.5H3v-1h4.5V3z" />
        </svg>
      </button>
    </div>
  );
}

// ─── SummaryCard ──────────────────────────────────────────────────────────────

function SummaryCard({
  label, value, sub, highlight = false, exempt = false,
}: {
  label: string; value: string; sub?: string; highlight?: boolean; exempt?: boolean;
}) {
  return (
    <div className={cn(
      "flex flex-col gap-1 rounded-xl border p-4",
      highlight ? "border-primary-200 bg-primary-50"
        : exempt ? "border-green-200 bg-green-50"
        : "border-neutral-200 bg-white"
    )}>
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      <span className={cn(
        "text-lg font-bold tabular-nums leading-tight",
        highlight ? "text-primary-700" : exempt ? "text-green-700" : "text-neutral-900"
      )}>
        {value}
      </span>
      {sub && <span className="text-xs leading-tight text-neutral-400">{sub}</span>}
    </div>
  );
}

// ─── DstiBadge ────────────────────────────────────────────────────────────────

function DstiBadge({ dsti, locale, t }: { dsti: number | null; locale: Locale; t: typeof STRINGS[Locale] }) {
  const fmtLocale = locale === "pt" ? "pt-PT" : "en-GB";
  const status = dstiStatus(dsti);
  const colors = {
    green:   "bg-green-50 border-green-200 text-green-800",
    amber:   "bg-amber-50 border-amber-200 text-amber-800",
    red:     "bg-red-50 border-red-200 text-red-800",
    unknown: "bg-neutral-50 border-neutral-200 text-neutral-500",
  };
  const labels = {
    green:   t.dstiGood,
    amber:   t.dstiWarn,
    red:     t.dstiBad,
    unknown: t.dstiUnknown,
  };
  return (
    <div className={cn("flex items-center justify-between rounded-xl border px-4 py-3", colors[status])}>
      <div>
        <p className="text-xs font-medium opacity-70">{t.dstiLabel}</p>
        <p className="mt-0.5 text-sm font-semibold">
          {dsti !== null ? fmtPctRaw(dsti, fmtLocale) : "—"}
        </p>
        <p className="mt-0.5 text-xs">{labels[status]}</p>
      </div>
      <div className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-base font-bold",
        status === "green" ? "bg-green-200 text-green-800"
          : status === "amber" ? "bg-amber-200 text-amber-800"
          : status === "red" ? "bg-red-200 text-red-800"
          : "bg-neutral-200 text-neutral-500"
      )}>
        {status === "green" ? "✓" : status === "amber" ? "!" : status === "red" ? "✗" : "?"}
      </div>
    </div>
  );
}

// ─── UpfrontCostsPanel ────────────────────────────────────────────────────────

function UpfrontCostsPanel({
  costs, t, fmtLocale,
}: {
  costs: UpfrontCosts; t: typeof STRINGS[Locale]; fmtLocale: string;
}) {
  function fmt(v: number, estimated = false) {
    return fmtCurrencyDec(v, fmtLocale) + (estimated ? " *" : "");
  }

  const rows: { label: string; value: string; highlight?: boolean; exempt?: boolean }[] = [
    { label: t.imtLabel, value: costs.imtExempt ? t.imtExempt : fmt(costs.imt), exempt: costs.imtExempt },
    { label: t.stampDutyPurchaseLabel, value: fmt(costs.stampDutyPurchase) },
    { label: t.stampDutyMortgageLabel, value: fmt(costs.stampDutyMortgage) },
    { label: t.registrationNotaryLabel, value: fmt(costs.registrationNotary, true) },
    { label: t.bankValuationLabel, value: fmt(costs.bankValuation, true) },
    { label: t.bankProcessingLabel, value: fmt(costs.bankProcessing, true) },
  ];

  return (
    <div className="rounded-xl border border-neutral-200 overflow-hidden">
      <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100">
        <h3 className="text-sm font-semibold text-neutral-800">{t.upfrontTitle}</h3>
      </div>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-neutral-100">
          {rows.map((row) => (
            <tr key={row.label} className={cn(row.exempt ? "bg-green-50" : "")}>
              <td className="px-4 py-2.5 text-neutral-600">{row.label}</td>
              <td className={cn(
                "px-4 py-2.5 text-right tabular-nums font-medium",
                row.exempt ? "text-green-700" : "text-neutral-800"
              )}>
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-neutral-200 bg-neutral-50">
            <td className="px-4 py-3 text-sm font-semibold text-neutral-900">{t.upfrontTotalLabel}</td>
            <td className="px-4 py-3 text-right tabular-nums text-sm font-bold text-neutral-900">
              {fmtCurrencyDec(costs.total, fmtLocale)}
            </td>
          </tr>
        </tfoot>
      </table>
      <p className="px-4 pb-3 text-xs text-neutral-400">{t.feesEstimateNote}</p>
    </div>
  );
}

// ─── StressTable ──────────────────────────────────────────────────────────────

function StressTable({
  loanAmount,
  termMonths,
  euriborRate,
  spread,
  netMonthlyIncome,
  existingMonthlyDebt,
  stressDeltas,
  onDeltaChange,
  hasIncome,
  t,
  fmtLocale,
  locale,
}: {
  loanAmount: number;
  termMonths: number;
  euriborRate: number;
  spread: number;
  netMonthlyIncome: number | undefined;
  existingMonthlyDebt: number;
  stressDeltas: number[];
  onDeltaChange: (index: number, delta: number) => void;
  hasIncome: boolean;
  t: typeof STRINGS[Locale];
  fmtLocale: string;
  locale: Locale;
}) {
  const allDeltas = [0, ...stressDeltas];

  const scenarios: StressScenario[] = allDeltas.map((delta) => {
    const tan = euriborRate + delta + spread;
    const pmt = monthlyPayment(loanAmount, tan / 12, termMonths);
    const dsti = computeDstiPct(pmt, existingMonthlyDebt, netMonthlyIncome);
    const deltaPct = (delta * 100).toFixed(1).replace(".", locale === "pt" ? "," : ".");
    const label = delta === 0
      ? (locale === "pt" ? "Euribor atual" : "Current Euribor")
      : `+${deltaPct} p.p.`;
    return { label, euriborDelta: delta, tan, monthlyPayment: pmt, dsti };
  });

  return (
    <div className="rounded-xl border border-neutral-200 overflow-hidden">
      <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-800">{t.stressTitle}</h3>
        <p className="text-xs text-neutral-400 hidden sm:block">{t.stressDeltaHint}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-xs text-neutral-500">
              <th className="px-4 py-2.5 text-left font-medium">{t.stressColScenario}</th>
              <th className="px-4 py-2.5 text-right font-medium">{t.stressColTan}</th>
              <th className="px-4 py-2.5 text-right font-medium">{t.stressColPayment}</th>
              {hasIncome && <th className="px-4 py-2.5 text-right font-medium">{t.stressColDsti}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {scenarios.map((s, i) => {
              const status = dstiStatus(s.dsti);
              const isBase = i === 0;
              return (
                <tr key={i} className={cn(isBase && "bg-neutral-50/60")}>
                  <td className={cn("px-4 py-2.5", isBase ? "font-medium text-neutral-800" : "text-neutral-600")}>
                    {isBase ? (
                      <span>
                        {s.label}
                        <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">base</span>
                      </span>
                    ) : (
                      <DeltaStepper
                        delta={stressDeltas[i - 1] ?? 0}
                        onChange={(v) => onDeltaChange(i - 1, v)}
                        locale={locale}
                      />
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-neutral-700">
                    {fmtPct(s.tan, fmtLocale)}
                  </td>
                  <td className={cn("px-4 py-2.5 text-right tabular-nums font-medium", isBase ? "text-neutral-900" : "text-neutral-700")}>
                    {fmtCurrencyDec(s.monthlyPayment, fmtLocale)}
                  </td>
                  {hasIncome && (
                    <td className={cn(
                      "px-4 py-2.5 text-right tabular-nums font-medium",
                      status === "green" ? "text-green-700"
                        : status === "amber" ? "text-amber-700"
                        : status === "red" ? "text-red-700"
                        : "text-neutral-400"
                    )}>
                      {s.dsti !== null ? fmtPctRaw(s.dsti, fmtLocale) : "—"}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ScheduleTable ────────────────────────────────────────────────────────────

function ScheduleTable({
  schedule, result, t, fmtLocale,
}: {
  schedule: AmortizationRow[]; result: MortgageResult; t: typeof STRINGS[Locale]; fmtLocale: string;
}) {
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  function toggleYear(year: number) {
    setExpandedYear((prev) => (prev === year ? null : year));
  }

  return (
    <div className="rounded-xl border border-neutral-200 overflow-hidden">
      <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-800">{t.scheduleTitle}</h3>
        <p className="text-xs text-neutral-400">{t.scheduleExpandHint}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/80 text-xs text-neutral-500">
              <th className="w-8 px-2 py-2.5" />
              <th className="px-4 py-2.5 text-left font-medium">{t.scheduleColYear}</th>
              <th className="px-4 py-2.5 text-right font-medium">{t.scheduleColPayment}</th>
              <th className="px-4 py-2.5 text-right font-medium">{t.scheduleColPrincipal}</th>
              <th className="px-4 py-2.5 text-right font-medium">{t.scheduleColInterest}</th>
              <th className="px-4 py-2.5 text-right font-medium">{t.scheduleColBalance}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {schedule.map((row) => (
              <>
                <tr
                  key={`year-${row.year}`}
                  onClick={() => toggleYear(row.year)}
                  className="cursor-pointer transition-colors hover:bg-neutral-50"
                >
                  <td className="px-2 py-2.5 text-center text-neutral-400">
                    {expandedYear === row.year
                      ? <ChevronDown className="h-3.5 w-3.5 inline" />
                      : <ChevronRight className="h-3.5 w-3.5 inline" />
                    }
                  </td>
                  <td className="px-4 py-2.5 font-medium text-neutral-800">{row.year}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-neutral-700">{fmtCurrencyDec(row.annualPayment, fmtLocale)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-neutral-700">{fmtCurrencyDec(row.annualPrincipal, fmtLocale)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-neutral-600">{fmtCurrencyDec(row.annualInterest, fmtLocale)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-neutral-800">{fmtCurrencyDec(row.balance, fmtLocale)}</td>
                </tr>
                {expandedYear === row.year && row.months?.map((m) => (
                  <tr key={`month-${m.month}`} className="bg-primary-50/40">
                    <td className="px-2 py-1.5" />
                    <td className="px-4 py-1.5 text-xs text-neutral-500 pl-8">{m.date}</td>
                    <td className="px-4 py-1.5 text-right tabular-nums text-xs text-neutral-600">{fmtCurrencyDec(m.payment, fmtLocale)}</td>
                    <td className="px-4 py-1.5 text-right tabular-nums text-xs text-neutral-600">{fmtCurrencyDec(m.principal, fmtLocale)}</td>
                    <td className="px-4 py-1.5 text-right tabular-nums text-xs text-neutral-500">{fmtCurrencyDec(m.interest, fmtLocale)}</td>
                    <td className="px-4 py-1.5 text-right tabular-nums text-xs text-neutral-600">{fmtCurrencyDec(m.balance, fmtLocale)}</td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-neutral-200 bg-neutral-50">
              <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-neutral-900">{t.scheduleTotalLabel}</td>
              <td className="px-4 py-3 text-right tabular-nums text-sm font-bold text-neutral-900">{fmtCurrencyDec(result.totalPaid, fmtLocale)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-sm font-semibold text-neutral-700">{fmtCurrencyDec(result.loanAmount, fmtLocale)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-sm font-semibold text-neutral-600">{fmtCurrencyDec(result.totalInterest, fmtLocale)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-sm font-semibold text-neutral-700">€0</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── CompareColumn ────────────────────────────────────────────────────────────

function CompareColumn({
  item,
  netMonthlyIncome,
  onUpdate,
  onRemove,
  canRemove,
  t,
  fmtLocale,
  locale,
}: {
  item: ComparisonItem;
  netMonthlyIncome: number | undefined;
  onUpdate: (updated: ComparisonItem) => void;
  onRemove: () => void;
  canRemove: boolean;
  t: typeof STRINGS[Locale];
  fmtLocale: string;
  locale: Locale;
}) {
  const decSep = locale === "pt" ? "," : ".";

  function set<K extends keyof ComparisonItem>(key: K, value: ComparisonItem[K]) {
    onUpdate({ ...item, [key]: value });
  }

  const purchasePrice = parseNum(item.purchasePrice);
  const ltv = parseNum(item.ltvPercent) || 90;
  const loanAmount = purchasePrice > 0 ? Math.round(purchasePrice * ltv / 100) : 0;
  const euriborRate = parseNum(item.euriborRate) / 100;
  const spread = parseNum(item.spread) / 100;
  const tan = euriborRate + spread;
  const existingDebt = parseNum(item.existingDebt) || 0;

  const result: MortgageResult | null = useMemo(() => {
    if (purchasePrice <= 0 || loanAmount <= 0 || loanAmount > purchasePrice) return null;
    if (item.termYears < 1 || tan <= 0) return null;
    const imtJovemStatus: ImtJovemStatus = item.purpose === "hpp" && item.jovemEnabled ? "full" : "none";
    return calculateMortgage({
      purchasePrice,
      purpose: item.purpose,
      region: item.region,
      loanAmount,
      termYears: item.termYears,
      euriborRate,
      spread,
      imtJovemStatus,
      netMonthlyIncome,
      existingMonthlyDebt: existingDebt,
    });
  }, [purchasePrice, loanAmount, item.termYears, euriborRate, spread, item.purpose, item.region,
      item.jovemEnabled, netMonthlyIncome, existingDebt, tan]);

  const deposit = purchasePrice > 0 && loanAmount > 0 ? purchasePrice - loanAmount : null;
  const dstiVal = result?.dsti ?? null;
  const dstiColor = dstiStatus(dstiVal);

  return (
    <div className="flex shrink-0 flex-col rounded-xl border border-neutral-200 bg-white w-72 sm:w-80 shadow-sm">

      {/* Column header */}
      <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-3 bg-neutral-50 rounded-t-xl">
        <input
          type="text"
          value={item.label}
          onChange={(e) => set("label", e.target.value)}
          maxLength={30}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-neutral-800 focus:outline-none placeholder:text-neutral-400"
        />
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded p-0.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title={t.removeScenario}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Form */}
      <div className="flex-1 space-y-3 p-4">

        {/* Purchase price */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-600">{t.purchasePriceLabel}</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-neutral-400 text-xs">€</span>
            <input
              type="text"
              inputMode="decimal"
              value={item.purchasePrice}
              onChange={(e) => set("purchasePrice", formatThousands(e.target.value, decSep))}
              placeholder={t.purchasePricePlaceholder}
              className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 pl-7 pr-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* LTV */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-neutral-600">LTV</label>
            <span className="text-xs font-bold text-primary-700">{item.ltvPercent}%</span>
          </div>
          <input
            type="range"
            min={10} max={100} step={1}
            value={parseNum(item.ltvPercent) || 90}
            onChange={(e) => set("ltvPercent", e.target.value)}
            className="w-full accent-primary-600"
          />
          {purchasePrice > 0 && loanAmount > 0 && (
            <p className="text-xs text-neutral-500 tabular-nums">{fmtCurrency(loanAmount, fmtLocale)}</p>
          )}
        </div>

        {/* Euribor + Spread side by side */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-600">Euribor</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={item.euriborRate}
                onChange={(e) => set("euriborRate", e.target.value.replace(/[^0-9,\.]/g, ""))}
                className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 pl-2 pr-6 text-xs text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-neutral-400 text-xs">%</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-600">Spread</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={item.spread}
                onChange={(e) => set("spread", e.target.value.replace(/[^0-9,\.]/g, ""))}
                className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 pl-2 pr-6 text-xs text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-neutral-400 text-xs">%</span>
            </div>
          </div>
        </div>

        {/* Term */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-neutral-600">{t.termLabel}</label>
            <span className="text-xs font-bold text-primary-700">{item.termYears}a</span>
          </div>
          <input
            type="range"
            min={5} max={40} step={1}
            value={item.termYears}
            onChange={(e) => set("termYears", parseInt(e.target.value, 10))}
            className="w-full accent-primary-600"
          />
          <div className="flex justify-between text-xs text-neutral-400">
            <span>5</span>
            <span>40</span>
          </div>
        </div>

        {/* Purpose */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-600">{t.purposeLabel}</label>
          <select
            value={item.purpose}
            onChange={(e) => {
              const p = e.target.value as MortgagePurpose;
              set("purpose", p);
              if (p !== "hpp") set("jovemEnabled", false);
            }}
            className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 px-2 text-xs text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {PURPOSE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {locale === "pt" ? o.labelPt : o.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-600">{t.regionLabel}</label>
          <select
            value={item.region}
            onChange={(e) => set("region", e.target.value as ImtRegion)}
            className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 px-2 text-xs text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {REGION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {locale === "pt" ? o.labelPt : o.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* IMT Jovem (only for hpp) */}
        {item.purpose === "hpp" && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={item.jovemEnabled}
              onChange={(e) => set("jovemEnabled", e.target.checked)}
              className="accent-primary-600"
            />
            <span className="text-xs text-neutral-700">{t.imtJovemSection}</span>
          </label>
        )}

        {/* TAN display */}
        {tan > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
            <span className="text-xs text-neutral-600">{t.tanLabel}</span>
            <span className="text-xs font-bold text-neutral-900 tabular-nums">{fmtPct(tan, fmtLocale)}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {result ? (
        <div className="border-t border-neutral-100 p-4 space-y-2">
          {/* Monthly payment */}
          <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3 text-center">
            <p className="text-xs font-medium text-primary-600">{t.monthlyPaymentLabel}</p>
            <p className="text-xl font-bold text-primary-800 tabular-nums">{fmtCurrencyDec(result.monthlyPayment, fmtLocale)}</p>
            <p className="text-xs text-primary-500 tabular-nums">{t.tanLabelResult} {fmtPct(result.tan, fmtLocale)}</p>
          </div>

          {/* Key metrics 2×2 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <p className="text-xs text-neutral-500">{t.depositLabel}</p>
              <p className="text-sm font-semibold text-neutral-800 tabular-nums">
                {deposit !== null ? fmtCurrency(deposit, fmtLocale) : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <p className="text-xs text-neutral-500">{t.upfrontTotalLabel}</p>
              <p className="text-sm font-semibold text-neutral-800 tabular-nums">{fmtCurrency(result.upfrontCosts.total, fmtLocale)}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <p className="text-xs text-neutral-500">{t.totalCashLabel}</p>
              <p className="text-sm font-semibold text-neutral-800 tabular-nums">{fmtCurrency(result.totalCashNeeded, fmtLocale)}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <p className="text-xs text-neutral-500">{t.totalInterestLabel}</p>
              <p className="text-sm font-semibold text-neutral-800 tabular-nums">{fmtCurrency(result.totalInterest, fmtLocale)}</p>
            </div>
          </div>

          {/* DSTI */}
          {netMonthlyIncome != null && dstiVal !== null && (
            <div className={cn(
              "rounded-lg border px-3 py-2",
              dstiColor === "green" ? "bg-green-50 border-green-200"
                : dstiColor === "amber" ? "bg-amber-50 border-amber-200"
                : "bg-red-50 border-red-200"
            )}>
              <p className="text-xs text-neutral-500">{t.dstiLabel}</p>
              <p className={cn(
                "text-sm font-semibold tabular-nums",
                dstiColor === "green" ? "text-green-800"
                  : dstiColor === "amber" ? "text-amber-800"
                  : "text-red-800"
              )}>
                {fmtPctRaw(dstiVal, fmtLocale)}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="border-t border-neutral-100 p-4 text-center text-xs text-neutral-400">
          {t.emptyState}
        </div>
      )}
    </div>
  );
}

// ─── ComparePanel ─────────────────────────────────────────────────────────────

function ComparePanel({
  comparisons,
  onAdd,
  onRemove,
  onUpdate,
  netIncome,
  onNetIncomeChange,
  t,
  fmtLocale,
  locale,
  decSep,
}: {
  comparisons: ComparisonItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updated: ComparisonItem) => void;
  netIncome: string;
  onNetIncomeChange: (v: string) => void;
  t: typeof STRINGS[Locale];
  fmtLocale: string;
  locale: Locale;
  decSep: string;
}) {
  const netMonthlyIncome = parseNum(netIncome) || undefined;
  const canAdd = comparisons.length < 6;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="space-y-1.5 w-full sm:max-w-xs">
          <label className="text-sm font-medium text-neutral-700">{t.compareNetIncomeLabel}</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400 text-sm">€</span>
            <input
              type="text"
              inputMode="decimal"
              value={netIncome}
              onChange={(e) => onNetIncomeChange(formatThousands(e.target.value, decSep))}
              placeholder="0"
              className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-8 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {canAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2 rounded-lg border border-primary-300 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            {t.addScenario}
            <span className="text-xs text-primary-500">({comparisons.length}/6)</span>
          </button>
        )}
      </div>

      {/* Columns */}
      {comparisons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 py-20 text-center text-sm text-neutral-400">
          {t.compareEmpty}
        </div>
      ) : (
        <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="flex gap-4 min-w-max">
            {comparisons.map((item) => (
              <CompareColumn
                key={item.id}
                item={item}
                netMonthlyIncome={netMonthlyIncome}
                onUpdate={(updated) => onUpdate(item.id, updated)}
                onRemove={() => onRemove(item.id)}
                canRemove={comparisons.length > 1}
                t={t}
                fmtLocale={fmtLocale}
                locale={locale}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MortgageCalculator ───────────────────────────────────────────────────────

export function MortgageCalculator({ locale = "pt" }: { locale?: Locale }) {
  const t = STRINGS[locale];
  const fmtLocale = locale === "pt" ? "pt-PT" : "en-GB";
  const decSep = locale === "pt" ? "," : ".";

  const [form, setForm] = useState<FormState>(() => defaultForm(locale));
  const [euriborSource, setEuriborSource] = useState<"live" | "ecb" | "fallback" | "loading">("loading");
  const [stressDeltas, setStressDeltas] = useState<number[]>([0.01, 0.02, 0.03]);
  const [calcMode, setCalcMode] = useState<CalcMode>("calculator");
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([]);
  const [compareNetIncome, setCompareNetIncome] = useState("");

  // ── Euribor auto-fetch ──────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    async function fetchRates() {
      try {
        const res = await fetch("/api/euribor");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json() as EuriborRatesResponse;
        if (cancelled) return;
        const rate = data.rates[form.euriborTenor];
        if (typeof rate === "number") {
          const rateStr = (rate * 100).toFixed(2).replace(".", decSep);
          setForm((prev) => ({ ...prev, euriborRate: rateStr }));
          setEuriborSource(data.source);
        }
      } catch {
        if (cancelled) return;
        const fallback = EURIBOR_FALLBACK[form.euriborTenor];
        const rateStr = (fallback * 100).toFixed(2).replace(".", decSep);
        setForm((prev) => ({ ...prev, euriborRate: rateStr }));
        setEuriborSource("fallback");
      }
    }
    void fetchRates();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetch once on mount

  // When tenor changes, update rate from fallback (or re-fetch)
  const handleTenorChange = useCallback((tenor: EuriborTenor) => {
    const fallback = EURIBOR_FALLBACK[tenor];
    const rateStr = (fallback * 100).toFixed(2).replace(".", decSep);
    setForm((prev) => ({ ...prev, euriborTenor: tenor, euriborRate: rateStr }));
    setEuriborSource("loading");
    fetch("/api/euribor")
      .then((r) => r.json() as Promise<EuriborRatesResponse>)
      .then((data) => {
        const rate = data.rates[tenor];
        if (typeof rate === "number") {
          setForm((prev) => ({ ...prev, euriborRate: (rate * 100).toFixed(2).replace(".", decSep) }));
          setEuriborSource(data.source);
        }
      })
      .catch(() => {
        setEuriborSource("fallback");
      });
  }, [decSep]);

  // ── Derived values ──────────────────────────────────────────────────────

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const purchasePrice = parseNum(form.purchasePrice);

  const loanAmount = useMemo(() => {
    if (form.loanMode === "amount") return parseNum(form.loanAmount);
    if (purchasePrice > 0) return Math.round(purchasePrice * (parseNum(form.ltvPercent) / 100));
    return 0;
  }, [form.loanMode, form.loanAmount, form.ltvPercent, purchasePrice]);

  function handleLoanModeChange(mode: LoanMode) {
    if (mode === "amount" && loanAmount > 0) {
      setForm((prev) => ({
        ...prev,
        loanMode: mode,
        loanAmount: formatThousands(Math.round(loanAmount).toString(), decSep),
      }));
    } else {
      setForm((prev) => ({ ...prev, loanMode: mode }));
    }
  }

  const euriborRate = parseNum(form.euriborRate) / 100;
  const spread = parseNum(form.spread) / 100;
  const tan = euriborRate + spread;

  const result: MortgageResult | null = useMemo(() => {
    if (purchasePrice <= 0 || loanAmount <= 0 || loanAmount > purchasePrice) return null;
    if (form.termYears < 1) return null;
    if (tan <= 0) return null;

    const imtJovemStatus: ImtJovemStatus =
      form.purpose === "hpp" && form.jovemEnabled ? form.jovemBuyers : "none";

    return calculateMortgage({
      purchasePrice,
      vpt: form.vptEnabled ? parseNum(form.vpt) : undefined,
      purpose: form.purpose,
      region: form.region,
      loanAmount,
      termYears: form.termYears,
      euriborRate,
      spread,
      imtJovemStatus,
      netMonthlyIncome: parseNum(form.netIncome) || undefined,
      existingMonthlyDebt: parseNum(form.existingDebt) || 0,
      feeRegistrationNotary: form.feesOverrideEnabled ? parseNum(form.feeRegistrationNotary) : undefined,
      feeBankValuation: form.feesOverrideEnabled ? parseNum(form.feeBankValuation) : undefined,
      feeBankProcessing: form.feesOverrideEnabled ? parseNum(form.feeBankProcessing) : undefined,
    });
  }, [purchasePrice, loanAmount, form.termYears, euriborRate, spread, form.purpose, form.region,
      form.jovemEnabled, form.jovemBuyers, form.netIncome, form.existingDebt,
      form.vptEnabled, form.vpt, form.feesOverrideEnabled, form.feeRegistrationNotary,
      form.feeBankValuation, form.feeBankProcessing]);

  const hasIncome = parseNum(form.netIncome) > 0;
  const maxTerm = maxTermYears(0);

  // ── Euribor source label ────────────────────────────────────────────────

  const euriborSourceLabel = {
    live: t.euriborLive,
    ecb: t.euriborEcb,
    fallback: t.euriborFallback,
    loading: t.euriborLoading,
  }[euriborSource];

  const sourceColor = {
    live: "text-green-600",
    ecb: "text-blue-600",
    fallback: "text-amber-600",
    loading: "text-neutral-400",
  }[euriborSource];

  // ── Stress delta handlers ───────────────────────────────────────────────

  function handleDeltaChange(index: number, delta: number) {
    setStressDeltas((prev) => {
      const next = [...prev];
      next[index] = delta;
      return next;
    });
  }

  // ── Compare mode handlers ───────────────────────────────────────────────

  function handleModeChange(newMode: CalcMode) {
    if (newMode === "compare" && comparisons.length === 0) {
      setComparisons([
        defaultComparisonItem(1, locale, form),
        defaultComparisonItem(2, locale, form),
      ]);
    }
    setCalcMode(newMode);
  }

  function addComparison() {
    if (comparisons.length >= 6) return;
    setComparisons((prev) => [...prev, defaultComparisonItem(prev.length + 1, locale, form)]);
  }

  function removeComparison(id: string) {
    setComparisons((prev) => prev.filter((c) => c.id !== id));
  }

  function updateComparison(id: string, updated: ComparisonItem) {
    setComparisons((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t.title}</h1>
          <p className="mt-2 text-sm text-neutral-500 sm:text-base">{t.subtitle}</p>
        </div>
        {/* Mode toggle */}
        <div className="flex overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 shrink-0">
          {(["calculator", "compare"] as const).map((m, i) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeChange(m)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2",
                i > 0 && "border-l border-neutral-200",
                calcMode === m
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {m === "calculator" ? t.calculatorMode : t.compareMode}
            </button>
          ))}
        </div>
      </div>

      {calcMode === "calculator" ? (
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">

          {/* ── LEFT: Form ────────────────────────────────────────────────── */}
          <div className="w-full xl:max-w-sm xl:shrink-0 space-y-4">

            {/* Property card */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-neutral-900">{t.sectionProperty}</h2>
              </CardHeader>
              <CardBody className="space-y-5">

                {/* Purchase price */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">{t.purchasePriceLabel}</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400 text-sm">€</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.purchasePrice}
                      onChange={(e) => set("purchasePrice", formatThousands(e.target.value, decSep))}
                      placeholder={t.purchasePricePlaceholder}
                      className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-8 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Select
                    label={t.purposeLabel}
                    options={PURPOSE_OPTIONS.map((o) => ({ value: o.value, label: locale === "pt" ? o.labelPt : o.labelEn }))}
                    value={form.purpose}
                    onChange={(e) => {
                      const updated: FormState = { ...form, purpose: e.target.value as MortgagePurpose };
                      if (e.target.value !== "hpp") updated.jovemEnabled = false;
                      setForm(updated);
                    }}
                  />
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">{t.regionLabel}</label>
                  <PillToggle
                    options={REGION_OPTIONS.map((o) => ({ value: o.value, label: locale === "pt" ? o.labelPt : o.labelEn }))}
                    value={form.region}
                    onChange={(v) => set("region", v as ImtRegion)}
                  />
                </div>

                {/* IMT Jovem */}
                {form.purpose === "hpp" && (
                  <div className="rounded-lg border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => set("jovemEnabled", !form.jovemEnabled)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-700">{t.imtJovemSection}</p>
                        <p className="mt-0.5 text-xs text-neutral-400">{t.imtJovemDesc}</p>
                      </div>
                      <div className={cn(
                        "ml-4 flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors duration-200",
                        form.jovemEnabled ? "border-primary-500 bg-primary-500" : "border-neutral-300 bg-neutral-200"
                      )}>
                        <span className={cn(
                          "block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                          form.jovemEnabled ? "translate-x-5" : "translate-x-0.5"
                        )} />
                      </div>
                    </button>
                    {form.jovemEnabled && (
                      <div className="flex gap-2 border-t border-neutral-100 px-4 pb-4 pt-3">
                        {(["full", "half"] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => set("jovemBuyers", opt)}
                            className={cn(
                              "flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors",
                              form.jovemBuyers === opt
                                ? "border-primary-600 bg-primary-600 text-white"
                                : "border-neutral-300 bg-white text-neutral-700 hover:border-primary-400"
                            )}
                          >
                            {opt === "full" ? t.imtJovemFullShort : t.imtJovemHalfShort}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </CardBody>
            </Card>

            {/* Loan card */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-neutral-900">{t.sectionLoan}</h2>
              </CardHeader>
              <CardBody className="space-y-5">

                {/* LTV / Amount toggle */}
                <div className="space-y-3">
                  <div className="flex overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                    {(["amount", "ltv"] as const).map((mode, i) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleLoanModeChange(mode)}
                        className={cn(
                          "flex-1 py-2 text-xs font-medium transition-colors",
                          i > 0 && "border-l border-neutral-200",
                          form.loanMode === mode
                            ? "bg-white text-primary-700 shadow-sm"
                            : "text-neutral-500 hover:text-neutral-700"
                        )}
                      >
                        {mode === "amount" ? t.modeAmount : t.modeLtv}
                      </button>
                    ))}
                  </div>

                  {form.loanMode === "amount" ? (
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400 text-sm">€</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={form.loanAmount}
                        onChange={(e) => set("loanAmount", formatThousands(e.target.value, decSep))}
                        placeholder="0"
                        className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-8 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={10}
                          max={100}
                          step={1}
                          value={parseNum(form.ltvPercent) || 90}
                          onChange={(e) => set("ltvPercent", e.target.value)}
                          className="flex-1 accent-primary-600"
                        />
                        <div className="relative w-20 shrink-0">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={form.ltvPercent}
                            onChange={(e) => set("ltvPercent", e.target.value.replace(/[^0-9]/g, ""))}
                            className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-2 pr-6 text-sm text-right text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-neutral-400 text-sm">%</span>
                        </div>
                      </div>
                      {purchasePrice > 0 && loanAmount > 0 && (
                        <p className="text-xs text-neutral-500">{t.ltvHint(fmtCurrency(loanAmount, fmtLocale))}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Term */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-700">{t.termLabel}</label>
                    <span className="text-sm font-bold text-primary-700">{form.termYears} anos</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={maxTerm}
                    step={1}
                    value={form.termYears}
                    onChange={(e) => set("termYears", parseInt(e.target.value, 10))}
                    className="w-full accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>5</span>
                    <span>{maxTerm}</span>
                  </div>
                </div>

              </CardBody>
            </Card>

            {/* Rate card */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-neutral-900">{t.sectionRate}</h2>
              </CardHeader>
              <CardBody className="space-y-5">

                {/* Euribor tenor */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">{t.euriborTenorLabel}</label>
                  <PillToggle
                    options={EURIBOR_TENOR_OPTIONS.map((o) => ({ value: o.value, label: locale === "pt" ? o.labelPt : o.labelEn }))}
                    value={form.euriborTenor}
                    onChange={(v) => handleTenorChange(v as EuriborTenor)}
                  />
                </div>

                {/* Euribor rate */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-700">{t.euriborRateLabel}</label>
                    <span className={cn("flex items-center gap-1 text-xs font-medium", sourceColor)}>
                      {euriborSource === "loading" && <Loader2 className="h-3 w-3 animate-spin" />}
                      {euriborSourceLabel}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.euriborRate}
                      onChange={(e) => set("euriborRate", e.target.value.replace(/[^0-9,\.]/g, ""))}
                      className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-3 pr-8 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-400 text-sm">%</span>
                  </div>
                </div>

                {/* Spread */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">{t.spreadLabel}</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.spread}
                      onChange={(e) => set("spread", e.target.value.replace(/[^0-9,\.]/g, ""))}
                      className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-3 pr-8 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-400 text-sm">%</span>
                  </div>
                  <p className="flex items-start gap-1.5 text-xs text-neutral-500">
                    <Info className="mt-0.5 h-3 w-3 shrink-0" />
                    {t.spreadHint}
                  </p>
                </div>

                {/* TAN display */}
                {tan > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3">
                    <span className="text-sm text-neutral-600">{t.tanLabel}</span>
                    <span className="font-bold text-neutral-900">{fmtPct(tan, fmtLocale)}</span>
                  </div>
                )}

              </CardBody>
            </Card>

            {/* Affordability card */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-neutral-900">{t.sectionAffordability}</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">{t.netIncomeLabel}</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400 text-sm">€</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.netIncome}
                      onChange={(e) => set("netIncome", formatThousands(e.target.value, decSep))}
                      placeholder={t.netIncomePlaceholder}
                      className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-8 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">{t.existingDebtLabel}</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400 text-sm">€</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.existingDebt}
                      onChange={(e) => set("existingDebt", formatThousands(e.target.value, decSep))}
                      placeholder={t.existingDebtPlaceholder}
                      className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-8 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Advanced options */}
            <Card>
              <Collapsible
                trigger={<span className="text-sm font-semibold text-neutral-800">{t.sectionAdvanced}</span>}
                triggerClassName="px-6 py-4"
                contentClassName="border-t border-neutral-100"
              >
                <div className="px-6 py-5 space-y-5">

                  {/* VPT */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="vpt-enabled"
                        checked={form.vptEnabled}
                        onChange={(e) => set("vptEnabled", e.target.checked)}
                        className="accent-primary-600"
                      />
                      <label htmlFor="vpt-enabled" className="text-sm font-medium text-neutral-700 cursor-pointer">
                        {t.vptLabel}
                      </label>
                    </div>
                    {form.vptEnabled && (
                      <div className="space-y-1.5">
                        <div className="relative">
                          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400 text-sm">€</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={form.vpt}
                            onChange={(e) => set("vpt", formatThousands(e.target.value, decSep))}
                            placeholder="0"
                            className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-8 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          />
                        </div>
                        <p className="flex items-start gap-1.5 text-xs text-neutral-500">
                          <Info className="mt-0.5 h-3 w-3 shrink-0" />
                          {t.vptHint}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Fee overrides */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="fees-override"
                        checked={form.feesOverrideEnabled}
                        onChange={(e) => set("feesOverrideEnabled", e.target.checked)}
                        className="accent-primary-600"
                      />
                      <label htmlFor="fees-override" className="text-sm font-medium text-neutral-700 cursor-pointer">
                        {t.feesTitle}
                      </label>
                    </div>
                    {form.feesOverrideEnabled && (
                      <div className="space-y-3 pl-5">
                        {([
                          { label: t.feeRegistrationNotary, key: "feeRegistrationNotary" as const },
                          { label: t.feeBankValuation,       key: "feeBankValuation" as const },
                          { label: t.feeBankProcessing,      key: "feeBankProcessing" as const },
                        ] as const).map(({ label, key }) => (
                          <div key={key} className="space-y-1">
                            <label className="text-xs font-medium text-neutral-600">{label}</label>
                            <div className="relative">
                              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400 text-xs">€</span>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={form[key]}
                                onChange={(e) => set(key, e.target.value.replace(/[^0-9]/g, ""))}
                                className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-7 pr-3 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                              />
                            </div>
                          </div>
                        ))}
                        <p className="text-xs text-neutral-400">{t.feesNote}</p>
                      </div>
                    )}
                  </div>

                </div>
              </Collapsible>
            </Card>

          </div>

          {/* ── RIGHT: Results ─────────────────────────────────────────────── */}
          <div className="w-full min-w-0 xl:sticky xl:top-20 space-y-4">
            {result ? (
              <>
                {/* Summary row */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <SummaryCard
                    label={t.monthlyPaymentLabel}
                    value={fmtCurrencyDec(result.monthlyPayment, fmtLocale)}
                    sub={`${t.tanLabelResult} ${fmtPct(result.tan, fmtLocale)}`}
                    highlight
                  />
                  <SummaryCard
                    label={t.depositLabel}
                    value={fmtCurrency(purchasePrice - result.loanAmount, fmtLocale)}
                    sub={`${Math.round(((purchasePrice - result.loanAmount) / purchasePrice) * 100)}% ${t.depositOfPrice}`}
                  />
                  <SummaryCard
                    label={t.totalCashLabel}
                    value={fmtCurrency(result.totalCashNeeded, fmtLocale)}
                    sub={t.totalCashHint}
                  />
                  <SummaryCard
                    label={t.totalsTitle}
                    value={fmtCurrency(result.totalInterest, fmtLocale)}
                    sub={t.totalInterestLabel}
                  />
                </div>

                {/* DSTI badge */}
                {hasIncome && (
                  <DstiBadge dsti={result.dsti} locale={locale} t={t} />
                )}

                {/* Upfront costs */}
                <UpfrontCostsPanel costs={result.upfrontCosts} t={t} fmtLocale={fmtLocale} />

                {/* Stress test — with editable deltas */}
                <StressTable
                  loanAmount={result.loanAmount}
                  termMonths={result.termMonths}
                  euriborRate={euriborRate}
                  spread={spread}
                  netMonthlyIncome={parseNum(form.netIncome) || undefined}
                  existingMonthlyDebt={parseNum(form.existingDebt) || 0}
                  stressDeltas={stressDeltas}
                  onDeltaChange={handleDeltaChange}
                  hasIncome={hasIncome}
                  t={t}
                  fmtLocale={fmtLocale}
                  locale={locale}
                />

                {/* Amortization */}
                <ScheduleTable schedule={result.schedule} result={result} t={t} fmtLocale={fmtLocale} />

                {/* Disclaimer */}
                <p className="text-center text-xs leading-relaxed text-neutral-400 px-2">
                  {t.disclaimer}
                </p>
              </>
            ) : (
              <Card className="border-dashed border-neutral-200">
                <CardBody className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 text-5xl">🏠</div>
                  <p className="text-sm text-neutral-400 max-w-xs">{t.emptyState}</p>
                </CardBody>
              </Card>
            )}
          </div>

        </div>
      ) : (
        <ComparePanel
          comparisons={comparisons}
          onAdd={addComparison}
          onRemove={removeComparison}
          onUpdate={updateComparison}
          netIncome={compareNetIncome}
          onNetIncomeChange={setCompareNetIncome}
          t={t}
          fmtLocale={fmtLocale}
          locale={locale}
          decSep={decSep}
        />
      )}

    </div>
  );
}
