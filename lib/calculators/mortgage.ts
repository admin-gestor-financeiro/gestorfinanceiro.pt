// Portuguese Crédito Habitação (mortgage) calculator
//
// Formulas source: research/mortgage-calculator-research.md
// French amortisation (prestação constante) — standard for all PT banks
// IMT is delegated to lib/calculators/imt.ts (2026 tables already there)

import {
  calculateImt,
  type ImtRegion,
  type ImtJovemStatus,
} from "@/lib/calculators/imt";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Property purpose — subset of IMT PropertyType relevant to mortgages */
export type MortgagePurpose = "hpp" | "secondary";

export type EuriborTenor = "3m" | "6m" | "12m";

export type MortgageInput = {
  // Property
  purchasePrice: number;
  vpt?: number; // Valor Patrimonial Tributário — uses purchasePrice if omitted
  purpose: MortgagePurpose;
  region: ImtRegion;

  // Loan
  loanAmount: number;
  termYears: number;

  // Rate (variable only in Phase 1)
  euriborRate: number;   // decimal, e.g. 0.0225 for 2.25%
  spread: number;        // decimal, e.g. 0.01 for 1%

  // IMT Jovem
  imtJovemStatus?: ImtJovemStatus;

  // Affordability (optional)
  netMonthlyIncome?: number;
  existingMonthlyDebt?: number;

  // Fee overrides (€) — if omitted, midpoint estimates are used
  feeRegistrationNotary?: number;
  feeBankValuation?: number;
  feeBankProcessing?: number;
};

export type AmortizationRow = {
  year: number;
  // Annual aggregates
  annualPayment: number;
  annualPrincipal: number;
  annualInterest: number;
  // Balance at year end
  balance: number;
  // Monthly rows (populated lazily — only when requested)
  months?: MonthlyRow[];
};

export type MonthlyRow = {
  month: number;  // 1-based absolute month
  date: string;   // ISO YYYY-MM
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type StressScenario = {
  label: string;
  euriborDelta: number;  // added on top of base euriborRate
  tan: number;
  monthlyPayment: number;
  dsti: number | null;  // null if income not provided
};

export type UpfrontCosts = {
  imt: number;
  imtExempt: boolean;
  stampDutyPurchase: number;
  stampDutyMortgage: number;
  registrationNotary: number;
  bankValuation: number;
  bankProcessing: number;
  total: number;
};

export type MortgageResult = {
  // Loan basics
  loanAmount: number;
  termMonths: number;
  tan: number;       // decimal
  monthlyRate: number; // decimal = tan/12

  // Monthly payment (month 1)
  monthlyPayment: number;
  month1Principal: number;
  month1Interest: number;

  // Totals over life
  totalPaid: number;
  totalInterest: number;

  // Upfront costs
  upfrontCosts: UpfrontCosts;
  totalCashNeeded: number; // deposit + all upfront costs

  // Affordability
  dsti: number | null;        // null if income not provided
  dstiStress: number | null;  // DSTI at TAN + 1.5pp buffer

  // Stress test scenarios
  stressScenarios: StressScenario[];

  // Amortization
  schedule: AmortizationRow[];
};

// ─── Fee estimates (midpoints from research) ─────────────────────────────────

export const FEE_DEFAULTS = {
  registrationNotary: 850,  // range €700–€1,000
  bankValuation: 258,        // range €230–€286
  bankProcessing: 462,       // range €200–€725
} as const;

// ─── Stamp duty rates ─────────────────────────────────────────────────────────

const STAMP_DUTY_PURCHASE = 0.008;   // 0.8% on purchase
const STAMP_DUTY_MORTGAGE = 0.006;   // 0.6% on loan (term ≥ 5 years)
// Bank commissions stamp duty (4%) is not modelled here — no bank data in Phase 1

// ─── DSTI stress buffer (BdP Oct 2023 revision) ──────────────────────────────

function dstiStressBuffer(termYears: number): number {
  if (termYears <= 5) return 0.005;
  if (termYears <= 10) return 0.010;
  return 0.015; // > 10 years
}

// ─── Core formulas ────────────────────────────────────────────────────────────

/**
 * French amortization monthly payment.
 * M = P × [r × (1+r)^n] / [(1+r)^n − 1]
 * When r = 0 (zero interest), M = P / n
 */
export function monthlyPayment(principal: number, monthlyRate: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (monthlyRate === 0) return Math.round((principal / termMonths) * 100) / 100;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return Math.round((principal * (monthlyRate * factor) / (factor - 1)) * 100) / 100;
}

/**
 * Outstanding balance after k payments.
 * B_k = P × [(1+r)^n − (1+r)^k] / [(1+r)^n − 1]
 */
function balanceAfterK(principal: number, monthlyRate: number, termMonths: number, k: number): number {
  if (monthlyRate === 0) return Math.max(0, principal - (principal / termMonths) * k);
  const factor = Math.pow(1 + monthlyRate, termMonths);
  const factorK = Math.pow(1 + monthlyRate, k);
  return Math.max(0, Math.round((principal * (factor - factorK) / (factor - 1)) * 100) / 100);
}

// ─── Upfront costs ────────────────────────────────────────────────────────────

function computeUpfrontCosts(input: MortgageInput): UpfrontCosts {
  const taxBase = Math.max(input.purchasePrice, input.vpt ?? 0) || input.purchasePrice;

  const imtResult = calculateImt({
    transactionValue: taxBase,
    propertyType: input.purpose,
    region: input.region,
    imtJovemStatus: input.purpose === "hpp" ? (input.imtJovemStatus ?? "none") : "none",
  });

  const stampDutyPurchase = Math.round(taxBase * STAMP_DUTY_PURCHASE * 100) / 100;
  const stampDutyMortgage = Math.round(input.loanAmount * STAMP_DUTY_MORTGAGE * 100) / 100;

  const registrationNotary = input.feeRegistrationNotary ?? FEE_DEFAULTS.registrationNotary;
  const bankValuation = input.feeBankValuation ?? FEE_DEFAULTS.bankValuation;
  const bankProcessing = input.feeBankProcessing ?? FEE_DEFAULTS.bankProcessing;

  const total = Math.round(
    (imtResult.imtAmount + stampDutyPurchase + stampDutyMortgage + registrationNotary + bankValuation + bankProcessing) * 100
  ) / 100;

  return {
    imt: imtResult.imtAmount,
    imtExempt: imtResult.imtExempt,
    stampDutyPurchase,
    stampDutyMortgage,
    registrationNotary,
    bankValuation,
    bankProcessing,
    total,
  };
}

// ─── Amortization schedule ────────────────────────────────────────────────────

function buildSchedule(
  principal: number,
  monthlyRate: number,
  termMonths: number,
  payment: number,
  startYear: number = new Date().getFullYear(),
): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  let balance = principal;
  let month = 0;

  const totalYears = Math.ceil(termMonths / 12);

  for (let y = 0; y < totalYears; y++) {
    let annualPayment = 0;
    let annualPrincipal = 0;
    let annualInterest = 0;
    const monthlyRows: MonthlyRow[] = [];

    for (let m = 0; m < 12 && month < termMonths; m++) {
      month++;
      const interest = Math.round(balance * monthlyRate * 100) / 100;
      const isLastPayment = month === termMonths;
      // On the final payment, pay off exactly the remaining balance
      const pmt = isLastPayment ? balance + interest : payment;
      const principal_ = Math.min(Math.round((pmt - interest) * 100) / 100, balance);
      balance = Math.max(0, Math.round((balance - principal_) * 100) / 100);

      annualPayment += pmt;
      annualPrincipal += principal_;
      annualInterest += interest;

      const absMonth = y * 12 + m + 1;
      const date = new Date(startYear, m, 1);
      const isoMonth = `${(startYear + y).toString().padStart(4, "0")}-${String(date.getMonth() + m + 1).padStart(2, "0")}`;
      // Simpler date: year + absolute month offset from start
      const absDate = new Date(startYear, y * 12 + m);
      const isoDate = `${absDate.getFullYear()}-${String(absDate.getMonth() + 1).padStart(2, "0")}`;

      monthlyRows.push({
        month: absMonth,
        date: isoDate,
        payment: Math.round(pmt * 100) / 100,
        principal: principal_,
        interest,
        balance,
      });
    }

    rows.push({
      year: startYear + y,
      annualPayment: Math.round(annualPayment * 100) / 100,
      annualPrincipal: Math.round(annualPrincipal * 100) / 100,
      annualInterest: Math.round(annualInterest * 100) / 100,
      balance,
      months: monthlyRows,
    });
  }

  return rows;
}

// ─── DSTI ─────────────────────────────────────────────────────────────────────

function computeDsti(
  payment: number,
  existingDebt: number,
  netIncome: number | undefined,
): number | null {
  if (!netIncome || netIncome <= 0) return null;
  return Math.round(((payment + existingDebt) / netIncome) * 10000) / 100;
}

// ─── Stress test ─────────────────────────────────────────────────────────────

function buildStressScenarios(
  input: MortgageInput,
  termMonths: number,
): StressScenario[] {
  const existingDebt = input.existingMonthlyDebt ?? 0;

  const scenarios: { label: string; delta: number }[] = [
    { label: "Euribor atual", delta: 0 },
    { label: "+1 p.p.", delta: 0.01 },
    { label: "+2 p.p.", delta: 0.02 },
    { label: "+3 p.p.", delta: 0.03 },
  ];

  return scenarios.map(({ label, delta }) => {
    const tan = input.euriborRate + delta + input.spread;
    const r = tan / 12;
    const pmt = monthlyPayment(input.loanAmount, r, termMonths);
    const dsti = computeDsti(pmt, existingDebt, input.netMonthlyIncome);
    return { label, euriborDelta: delta, tan, monthlyPayment: pmt, dsti };
  });
}

// ─── Main calculation ─────────────────────────────────────────────────────────

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const termMonths = input.termYears * 12;
  const tan = input.euriborRate + input.spread;
  const monthlyRate = tan / 12;

  const payment = monthlyPayment(input.loanAmount, monthlyRate, termMonths);

  // Month 1 breakdown
  const month1Interest = Math.round(input.loanAmount * monthlyRate * 100) / 100;
  const month1Principal = Math.round((payment - month1Interest) * 100) / 100;

  // Totals
  const totalPaid = Math.round(payment * termMonths * 100) / 100;
  const totalInterest = Math.round((totalPaid - input.loanAmount) * 100) / 100;

  // Upfront costs
  const upfrontCosts = computeUpfrontCosts(input);
  const deposit = input.purchasePrice - input.loanAmount;
  const totalCashNeeded = Math.round((deposit + upfrontCosts.total) * 100) / 100;

  // DSTI
  const existingDebt = input.existingMonthlyDebt ?? 0;
  const dsti = computeDsti(payment, existingDebt, input.netMonthlyIncome);

  // DSTI stress (BdP buffer)
  const buffer = dstiStressBuffer(input.termYears);
  const stressTan = tan + buffer;
  const stressPayment = monthlyPayment(input.loanAmount, stressTan / 12, termMonths);
  const dstiStress = computeDsti(stressPayment, existingDebt, input.netMonthlyIncome);

  // Stress scenarios
  const stressScenarios = buildStressScenarios(input, termMonths);

  // Amortization schedule
  const schedule = buildSchedule(input.loanAmount, monthlyRate, termMonths, payment);

  return {
    loanAmount: input.loanAmount,
    termMonths,
    tan,
    monthlyRate,
    monthlyPayment: payment,
    month1Principal,
    month1Interest,
    totalPaid,
    totalInterest,
    upfrontCosts,
    totalCashNeeded,
    dsti,
    dstiStress,
    stressScenarios,
    schedule,
  };
}

// ─── Helpers for UI ───────────────────────────────────────────────────────────

/** BdP max term by borrower age */
export function maxTermYears(age: number): number {
  if (age <= 30) return 40;
  if (age <= 35) return 37;
  return 35;
}

/** Default Euribor fallback values (late February 2026) */
export const EURIBOR_FALLBACK: Record<EuriborTenor, number> = {
  "3m":  0.0201,
  "6m":  0.0214,
  "12m": 0.0225,
};

/** Tenor labels for UI */
export const EURIBOR_TENOR_OPTIONS: { value: EuriborTenor; labelPt: string; labelEn: string }[] = [
  { value: "3m",  labelPt: "Euribor 3M",  labelEn: "Euribor 3M"  },
  { value: "6m",  labelPt: "Euribor 6M",  labelEn: "Euribor 6M"  },
  { value: "12m", labelPt: "Euribor 12M", labelEn: "Euribor 12M" },
];

export const PURPOSE_OPTIONS: { value: MortgagePurpose; labelPt: string; labelEn: string }[] = [
  { value: "hpp",       labelPt: "Habitação própria e permanente",     labelEn: "Primary residence"           },
  { value: "secondary", labelPt: "Habitação secundária / investimento", labelEn: "Secondary / investment"      },
];

/** Traffic-light DSTI classification */
export function dstiStatus(dsti: number | null): "green" | "amber" | "red" | "unknown" {
  if (dsti === null) return "unknown";
  if (dsti <= 35) return "green";
  if (dsti <= 50) return "amber";
  return "red";
}
