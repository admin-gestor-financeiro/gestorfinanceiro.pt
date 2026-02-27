// Portugal net salary calculator
// 2026: AT official monthly withholding tables (Portaria 2026, Categoria A)
//       Supports Continente, Açores and Madeira. Disability tables included.
//       Formula: IRS = max(0, Base × Rate - Parcel - depParcel × nDeps)
//       IRS Jovem: exemption applied to withholdingBase before table lookup
//       Duodécimos: gross multiplied before table lookup
// 2025: annual bracket methodology (Art. 68.º CIRS) — official monthly tables not available

import { getRegionTables } from "@/data/withholding-tables";
import type { Region, WithholdingBracket } from "@/data/withholding-tables.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type { Region };
export type TaxYear = 2025 | 2026;
export type MaritalStatus = "single" | "married_single" | "married_dual";
export type MealAllowanceType = "none" | "cash" | "card";

/**
 * Duodécimos options — how holiday/christmas subsidies are paid.
 * The option determines the gross multiplier used for the withholding base.
 *
 * none        → subsidies paid separately in July/Dec; multiplier = 1      (12/12)
 * both_full   → both subsidies in duodécimos;          multiplier = 14/12
 * half_one    → 50% of one subsidy in duodécimos;       multiplier = 12.5/12
 * half_two_or_one_full → 50% of two or one full subsidy; multiplier = 13/12
 */
export type DuodecimosOption =
  | "none"
  | "both_full"
  | "half_one"
  | "half_two_or_one_full";

export type IrsJovemInput = {
  active: boolean;
  /** Career year 1–10 (determines exemption %) */
  careerYear: number;
};

export type NetSalaryInput = {
  grossSalary: number;
  maritalStatus: MaritalStatus;
  dependentsCount: number;
  mealAllowanceDaily: number;
  mealAllowanceType: MealAllowanceType;
  region?: Region;
  disability?: boolean;
  duodecimos?: DuodecimosOption;
  irsJovem?: IrsJovemInput;
  year?: TaxYear;
};

type WithholdingTableId = "I" | "II" | "III" | "IV" | "V" | "VI" | "VII";

export type DebugInfo =
  | {
      method: "at_table";
      withholdingTable: WithholdingTableId;
      withholdingRate: number;
      withholdingParcel: number;
      depParcelApplied: number;
      rawIrs: number;
      /** Gross before duodécimos and IRS Jovem adjustments */
      grossSalary: number;
      /** Gross after duodécimos multiplier */
      duodecimosBase: number;
      /** Gross after IRS Jovem exemption (= final table lookup base) */
      withholdingBase: number;
      irsJovemExemptAmount: number;
    }
  | {
      method: "annual_brackets";
      annualEquivalentIncome: number;
      specificDeduction: number;
      taxableIncome: number;
      grossAnnualTax: number;
      dependentDeductionAnnual: number;
      netAnnualTax: number;
    };

export type NetSalaryResult = {
  /** Base monthly gross salary (the input, before duodécimos addition) */
  grossSalary: number;
  /**
   * Monthly amount added from duodécimos (holiday + Christmas subsidy fractions).
   * Zero when duodécimos = "none". Shown as a separate positive line in the payslip.
   */
  duodecimosMonthlyAmount: number;
  /** grossSalary + duodecimosMonthlyAmount — the actual monthly income received */
  effectiveMonthlyGross: number;
  socialSecurity: number;
  irsWithholding: number;
  mealAllowanceExempt: number;
  netSalary: number;
  effectiveIrsRate: number;
  totalDeductionRate: number;
  employerSocialSecurity: number;
  totalEmployerCost: number;
  annualGross: number;
  annualNet: number;
  /**
   * Number of monthly payments that make up the annual figures.
   * 12 when duodécimos are active (subsidies already embedded in monthly income).
   * 14 when duodécimos = "none" (standard approximation: 12 + holiday + xmas).
   */
  annualPaymentsCount: number;
  year: TaxYear;
  region: Region;
  disability: boolean;
  duodecimos: DuodecimosOption;
  irsJovemActive: boolean;
  irsJovemExemptionRate: number;
  debug: DebugInfo;
};

type IrsBracket = { upTo: number; rate: number; parcel: number };

// ─── Constants ────────────────────────────────────────────────────────────────

export const TAX_YEARS: TaxYear[] = [2026, 2025];
export const DEFAULT_TAX_YEAR: TaxYear = 2026;
export const DEFAULT_REGION: Region = "continente";

export const REGIONS: { value: Region; labelPt: string; labelEn: string }[] = [
  { value: "continente", labelPt: "Continente", labelEn: "Mainland" },
  { value: "acores",     labelPt: "Açores",     labelEn: "Azores"   },
  { value: "madeira",    labelPt: "Madeira",    labelEn: "Madeira"  },
];

export const MEAL_ALLOWANCE_EXEMPT_DAILY: Record<TaxYear, Record<Exclude<MealAllowanceType, "none">, number>> = {
  2026: { cash: 6.15, card: 10.46 },
  2025: { cash: 6.00, card: 9.60  },
};

// ─── IRS Jovem ────────────────────────────────────────────────────────────────
// Regime 2025/2026 — Art. 2.º-B CIRS
// IAS 2026 = €537.13; cap = 55 × IAS
export const IAS_2026 = 537.13;
export const IRS_JOVEM_MONTHLY_CAP = Math.round((55 * IAS_2026) / 12 * 100) / 100; // ≈ 2,461.43 €/month

/**
 * Exemption rate by career year (1-indexed).
 * Year 1: 100%, Years 2-4: 75%, Years 5-7: 50%, Years 8-10: 25%
 */
export const IRS_JOVEM_EXEMPTION_RATE: Record<number, number> = {
  1: 1.00,
  2: 0.75, 3: 0.75, 4: 0.75,
  5: 0.50, 6: 0.50, 7: 0.50,
  8: 0.25, 9: 0.25, 10: 0.25,
};

// ─── Duodécimos ───────────────────────────────────────────────────────────────
// Multiplier applied to grossSalary to compute the withholding base.
// The AT rule: when subsidies are paid in duodécimos, the monthly gross used
// for withholding already includes a fraction of the holiday/xmas subsidy,
// so the table is looked up on gross × multiplier.
export const DUODECIMOS_MULTIPLIER: Record<DuodecimosOption, number> = {
  none:                  1,          // 12/12 — subsidies paid separately
  both_full:             14 / 12,    // holiday + xmas both in duodécimos
  half_one:              12.5 / 12,  // 50% of one subsidy in duodécimos
  half_two_or_one_full:  13 / 12,    // 50% of two, or one full subsidy in duodécimos
};

export const DUODECIMOS_OPTIONS: {
  value: DuodecimosOption;
  labelPt: string;
  labelEn: string;
}[] = [
  { value: "none",                 labelPt: "Não recebo subsídios em duodécimos",                      labelEn: "No subsidies in monthly instalments"              },
  { value: "both_full",            labelPt: "Recebo os dois subsídios em duodécimos",                  labelEn: "Both subsidies paid monthly"                      },
  { value: "half_one",             labelPt: "Recebo 50% de um subsídio em duodécimos",                 labelEn: "50% of one subsidy paid monthly"                  },
  { value: "half_two_or_one_full", labelPt: "Recebo 50% de dois subsídios ou um completo em duodécimos", labelEn: "50% of two subsidies or one full subsidy monthly" },
];

const SS_EMPLOYEE_RATE  = 0.11;
const SS_EMPLOYER_RATE  = 0.2375;
const WORKING_DAYS_PER_MONTH = 22;

// ─── IRS annual brackets (used only for 2025 methodology) ────────────────────

export const IRS_BRACKETS_2025: IrsBracket[] = [
  { upTo: 7_703,    rate: 0.130, parcel: 0         },
  { upTo: 11_623,   rate: 0.180, parcel: 385.15    },
  { upTo: 16_472,   rate: 0.230, parcel: 966.30    },
  { upTo: 21_321,   rate: 0.260, parcel: 1_460.46  },
  { upTo: 27_146,   rate: 0.325, parcel: 2_846.33  },
  { upTo: 39_791,   rate: 0.370, parcel: 4_067.89  },
  { upTo: 51_997,   rate: 0.435, parcel: 6_664.31  },
  { upTo: 81_199,   rate: 0.450, parcel: 7_434.26  },
  { upTo: Infinity, rate: 0.480, parcel: 9_870.23  },
];

export const IRS_BRACKETS_2026: IrsBracket[] = [
  { upTo: 8_000,    rate: 0.130, parcel: 0        },
  { upTo: 12_000,   rate: 0.180, parcel: 400      },
  { upTo: 17_000,   rate: 0.230, parcel: 1_000    },
  { upTo: 22_000,   rate: 0.260, parcel: 1_510    },
  { upTo: 28_000,   rate: 0.325, parcel: 2_940    },
  { upTo: 41_000,   rate: 0.370, parcel: 4_200    },
  { upTo: 54_000,   rate: 0.435, parcel: 6_865    },
  { upTo: 84_000,   rate: 0.450, parcel: 7_676    },
  { upTo: Infinity, rate: 0.480, parcel: 10_196   },
];

const SPECIFIC_DEDUCTION_MIN: Record<TaxYear, number> = {
  2025: 4_104,
  2026: 4_228,
};

// ─── IRS Jovem helpers ────────────────────────────────────────────────────────

/**
 * Returns the effective exemption rate for a given career year (clamped 1–10).
 * Returns 0 if irsJovem is inactive or year is out of range.
 */
export function getIrsJovemExemptionRate(irsJovem: IrsJovemInput | undefined): number {
  if (!irsJovem?.active) return 0;
  const y = Math.max(1, Math.min(10, irsJovem.careerYear));
  return IRS_JOVEM_EXEMPTION_RATE[y] ?? 0;
}

/**
 * Applies IRS Jovem exemption to a monthly gross base.
 *
 * The exemption covers income up to the monthly cap (55 × IAS / 12).
 * Income above the cap is fully taxable.
 *
 * Returns { withholdingBase, exemptAmount }
 */
function applyIrsJovem(
  base: number,
  exemptionRate: number
): { withholdingBase: number; exemptAmount: number } {
  if (exemptionRate === 0) return { withholdingBase: base, exemptAmount: 0 };
  const capThisMonth = IRS_JOVEM_MONTHLY_CAP;
  const exemptPortion = Math.min(base, capThisMonth);
  const exemptAmount  = Math.round(exemptPortion * exemptionRate * 100) / 100;
  const withholdingBase = Math.max(0, base - exemptAmount);
  return { withholdingBase, exemptAmount };
}

// ─── Table routing ────────────────────────────────────────────────────────────

function selectTableId(
  maritalStatus: MaritalStatus,
  dependentsCount: number,
  disability: boolean
): WithholdingTableId {
  if (!disability) {
    if (maritalStatus === "married_single") return "III";
    if (maritalStatus === "single" && dependentsCount > 0) return "II";
    return "I";
  }
  if (maritalStatus === "married_single") return "VII";
  if (dependentsCount > 0) return maritalStatus === "married_dual" ? "VI" : "V";
  return "IV";
}

function getTableBrackets(
  tableId: WithholdingTableId,
  region: Region,
  year: number
): WithholdingBracket[] | null {
  const tables = getRegionTables(region, year);
  const map: Record<WithholdingTableId, WithholdingBracket[] | null> = {
    I:   tables.tableI,
    II:  tables.tableII,
    III: tables.tableIII,
    IV:  tables.tableIV,
    V:   tables.tableV,
    VI:  tables.tableVI,
    VII: tables.tableVII,
  };
  return map[tableId];
}

function getDepParcel(
  tableId: WithholdingTableId,
  region: Region,
  year: number,
  bracket: WithholdingBracket
): number {
  if (bracket.depParcel !== undefined) return bracket.depParcel;
  const tables = getRegionTables(region, year);
  const map: Partial<Record<WithholdingTableId, number>> = {
    I:   tables.depParcel.I,
    II:  tables.depParcel.II,
    III: tables.depParcel.III,
  };
  return map[tableId] ?? 0;
}

// ─── AT table IRS computation ────────────────────────────────────────────────

function computeAtTableIrs(
  grossSalary: number,
  maritalStatus: MaritalStatus,
  dependentsCount: number,
  region: Region,
  disability: boolean,
  duodecimos: DuodecimosOption,
  irsJovem: IrsJovemInput | undefined,
  year: number
): { irs: number; debug: Extract<DebugInfo, { method: "at_table" }> } {
  const tableId = selectTableId(maritalStatus, dependentsCount, disability);

  // Step 1 — duodécimos: scale gross for withholding base
  const multiplier   = DUODECIMOS_MULTIPLIER[duodecimos];
  const duodecimosBase = Math.round(grossSalary * multiplier * 100) / 100;

  // Step 2 — IRS Jovem: exempt portion up to monthly cap
  const exemptionRate = getIrsJovemExemptionRate(irsJovem);
  const { withholdingBase, exemptAmount } = applyIrsJovem(duodecimosBase, exemptionRate);

  if (withholdingBase <= 0 || grossSalary <= 0) {
    return {
      irs: 0,
      debug: {
        method: "at_table",
        withholdingTable: tableId,
        withholdingRate: 0,
        withholdingParcel: 0,
        depParcelApplied: 0,
        rawIrs: 0,
        grossSalary,
        duodecimosBase,
        withholdingBase,
        irsJovemExemptAmount: exemptAmount,
      },
    };
  }

  // Step 3 — table lookup on withholdingBase
  const brackets = getTableBrackets(tableId, region, year);
  const effectiveTableId = brackets ? tableId : selectTableId(maritalStatus, dependentsCount, false);
  const effectiveBrackets = brackets ?? getTableBrackets(effectiveTableId, region, year)!;

  const bracket = effectiveBrackets.find((b) => withholdingBase <= b.upTo) ?? effectiveBrackets[effectiveBrackets.length - 1]!;
  const depParcelPerDep  = getDepParcel(effectiveTableId, region, year, bracket);
  const depParcelApplied = Math.round(depParcelPerDep * dependentsCount * 100) / 100;
  const rawIrs = withholdingBase * bracket.rate - bracket.parcel - depParcelApplied;
  const irs    = Math.round(Math.max(0, rawIrs) * 100) / 100;

  return {
    irs,
    debug: {
      method: "at_table",
      withholdingTable: effectiveTableId,
      withholdingRate: bracket.rate,
      withholdingParcel: bracket.parcel,
      depParcelApplied,
      rawIrs,
      grossSalary,
      duodecimosBase,
      withholdingBase,
      irsJovemExemptAmount: exemptAmount,
    },
  };
}

// ─── 2025 annual bracket helpers ─────────────────────────────────────────────

function applyAnnualBrackets(income: number, brackets: IrsBracket[]): number {
  if (income <= 0) return 0;
  const bracket = brackets.find((b) => income <= b.upTo);
  if (!bracket) return 0;
  return Math.max(0, income * bracket.rate - bracket.parcel);
}

function dependentMonthlyCredit(index: number): number {
  return index < 2 ? 50 : 87.5;
}

// ─── Main calculation ─────────────────────────────────────────────────────────

export function calculateNetSalary(input: NetSalaryInput): NetSalaryResult {
  const {
    grossSalary,
    maritalStatus,
    dependentsCount,
    mealAllowanceDaily,
    mealAllowanceType,
    region     = DEFAULT_REGION,
    disability = false,
    duodecimos = "none",
    irsJovem,
    year       = DEFAULT_TAX_YEAR,
  } = input;

  // 1. Duodécimos — split into base net + duodécimos net so each portion is
  //    taxed independently (SS and IRS applied to each separately, then added).
  const duodecimosMultiplier     = DUODECIMOS_MULTIPLIER[duodecimos];
  const duodecimosMonthlyAmount  = Math.round(grossSalary * (duodecimosMultiplier - 1) * 100) / 100;
  const effectiveMonthlyGross    = Math.round((grossSalary + duodecimosMonthlyAmount) * 100) / 100;

  // 2. Social Security — on the full effective monthly income (base + duodécimos)
  const ssBase        = Math.round(grossSalary * SS_EMPLOYEE_RATE * 100) / 100;
  const ssDuodecimos  = Math.round(duodecimosMonthlyAmount * SS_EMPLOYEE_RATE * 100) / 100;
  const socialSecurity = ssBase + ssDuodecimos; // = effectiveMonthlyGross × 11%

  // 3. IRS withholding
  let irsWithholding: number;
  let debugInfo: DebugInfo;

  if (year === 2026) {
    // IRS on base salary component
    const { irs: irsBase, debug } = computeAtTableIrs(
      grossSalary, maritalStatus, dependentsCount,
      region, disability, "none", irsJovem, year
    );
    // IRS on duodécimos component (treated as independent income, no dependents parcel)
    const { irs: irsDuodecimos } = duodecimosMonthlyAmount > 0
      ? computeAtTableIrs(duodecimosMonthlyAmount, maritalStatus, 0, region, disability, "none", undefined, year)
      : { irs: 0 };

    irsWithholding = Math.round((irsBase + irsDuodecimos) * 100) / 100;
    debugInfo = {
      ...debug,
      // Preserve duodecimosBase in debug so the payslip formula section still works
      duodecimosBase: effectiveMonthlyGross,
    };
  } else {
    // 2025: annual bracket approach (duodécimos + IRS Jovem not modelled for 2025)
    const specificDeductionMin   = SPECIFIC_DEDUCTION_MIN[year];
    const annualEquivalentIncome = grossSalary * 12;
    const annualSS               = socialSecurity * 12;
    const specificDeduction      = Math.max(
      specificDeductionMin,
      Math.min(annualSS, 0.75 * annualEquivalentIncome)
    );
    const taxableIncome = Math.max(0, annualEquivalentIncome - specificDeduction);

    let grossAnnualTax: number;
    if (maritalStatus === "married_single") {
      grossAnnualTax = applyAnnualBrackets(taxableIncome / 2, IRS_BRACKETS_2025) * 2;
    } else {
      grossAnnualTax = applyAnnualBrackets(taxableIncome, IRS_BRACKETS_2025);
    }

    let dependentDeductionAnnual = 0;
    for (let i = 0; i < dependentsCount; i++) {
      dependentDeductionAnnual += dependentMonthlyCredit(i) * 12;
    }

    const netAnnualTax = Math.max(0, grossAnnualTax - dependentDeductionAnnual);
    irsWithholding = Math.round(netAnnualTax / 12);

    debugInfo = {
      method: "annual_brackets",
      annualEquivalentIncome,
      specificDeduction,
      taxableIncome,
      grossAnnualTax,
      dependentDeductionAnnual,
      netAnnualTax,
    };
  }

  // 3. Meal allowance exempt portion
  let mealAllowanceExempt = 0;
  if (mealAllowanceType !== "none" && mealAllowanceDaily > 0) {
    const limits = MEAL_ALLOWANCE_EXEMPT_DAILY[year];
    const dailyExempt = Math.min(mealAllowanceDaily, limits[mealAllowanceType]);
    mealAllowanceExempt = Math.round(dailyExempt * WORKING_DAYS_PER_MONTH * 100) / 100;
  }

  // 4. Net salary — from the full effective monthly income
  const netSalary =
    Math.round((effectiveMonthlyGross - socialSecurity - irsWithholding + mealAllowanceExempt) * 100) / 100;

  // Rates relative to the effective monthly gross
  const effectiveIrsRate   = effectiveMonthlyGross > 0 ? irsWithholding / effectiveMonthlyGross : 0;
  const totalDeductionRate = effectiveMonthlyGross > 0 ? (socialSecurity + irsWithholding) / effectiveMonthlyGross : 0;

  // Employer cost on the full effective monthly gross
  const employerSocialSecurity = Math.round(effectiveMonthlyGross * SS_EMPLOYER_RATE * 100) / 100;
  const totalEmployerCost      = Math.round((effectiveMonthlyGross + employerSocialSecurity) * 100) / 100;

  // Annual: 12 payments when duodécimos are active (subsidies already embedded in monthly)
  //         14 payments when "none" (standard approximation for lump-sum subsidy months)
  const annualPaymentsCount = duodecimos !== "none" ? 12 : 14;
  const annualGross         = Math.round(effectiveMonthlyGross * annualPaymentsCount * 100) / 100;
  const annualNet           = Math.round(netSalary * annualPaymentsCount * 100) / 100;

  const irsJovemExemptionRate  = getIrsJovemExemptionRate(irsJovem);

  return {
    grossSalary,
    duodecimosMonthlyAmount,
    effectiveMonthlyGross,
    socialSecurity,
    irsWithholding,
    mealAllowanceExempt,
    netSalary,
    effectiveIrsRate,
    totalDeductionRate,
    employerSocialSecurity,
    totalEmployerCost,
    annualGross,
    annualNet,
    annualPaymentsCount,
    year,
    region,
    disability,
    duodecimos,
    irsJovemActive: irsJovem?.active ?? false,
    irsJovemExemptionRate,
    debug: debugInfo,
  };
}
