// Portugal IMI (Imposto Municipal sobre Imóveis) calculator
//
// Legal basis:
//   • Art. 112 CIMI — IMI rates (0.3%–0.45% urban, 0.8% rural)
//   • Art. 112-A CIMI — IMI Familiar deductions
//   • Art. 120 CIMI — Payment installment schedule
//   • Arts. 135-A to 135-M CIMI — AIMI
//   • Art. 11-A CIMI — Permanent exemption (low income)
//   • Art. 46 EBF — Temporary exemption (new HPP acquisition)
//   • Lei n.º 73-A/2025 (OE 2026) — IAS €537.13, Vc €712.50
//
// 2026 data confirmed: Portaria 471/2025/1 (Vc), Aviso 18/2026/2 (juros mora)

import { getMunicipio } from "@/lib/data/imi-municipalities";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ImiPropertyType =
  | "urbano"             // Urban property (apartment, house)
  | "rustico"            // Rural property — fixed 0.8% rate
  | "terreno_construcao"; // Construction land — treated as urban for rate purposes

export type ImiPropertyPurpose =
  | "hpp"       // Habitação própria permanente
  | "secondary" // Habitação secundária
  | "rental"    // Arrendamento
  | "vacant";   // Devoluto

export type ImiFilingStatus = "individual" | "couple" | "company";

export type ImiInput = {
  vpt: number;
  municipioId: string;
  propertyType: ImiPropertyType;
  propertyPurpose: ImiPropertyPurpose;
  /** 0–2 for individuals; 3 means "3 or more" */
  dependents: 0 | 1 | 2 | 3;
  /**
   * Per-parish rate override — use when the municipality has different rates by
   * parish (e.g. Espinho, Gondomar) and the user selects a specific parish.
   * When set, this takes precedence over the municipality's default rate.
   */
  overrideRate?: number;
};

export type AimiInput = {
  /** Sum of VPT of all owned residential urban properties + construction land */
  totalResidentialVpt: number;
  filingStatus: ImiFilingStatus;
  /** When true, deduction is excluded for any property classified as devoluto/ruins */
  includesVacantOrRuins: boolean;
};

export type ExemptionInput = {
  vpt: number;
  municipioId: string;
  isHpp: boolean;
  /** Household gross annual income (rendimento bruto agregado) */
  householdGrossIncome: number;
  /** Total VPT of all properties owned by the household */
  totalFamilyVpt: number;
  /** Calendar year the property was acquired (for temporary exemption check) */
  acquisitionYear: number;
  /** How many times this taxpayer has already used the temporary exemption (lifetime limit 2) */
  previousExemptionsUsed: 0 | 1 | 2;
};

export type PaymentInstallment = {
  label: string;
  labelEn: string;
  amount: number;
  dueDate: string; // ISO date "YYYY-MM-DD"
};

export type ImiFamiliarStatus =
  | "applied"                 // Deduction applied
  | "not_participant"         // Municipality does not participate (minDeps=0)
  | "not_hpp"                 // Property is not HPP
  | "no_dependents"           // HPP + participant but 0 dependents
  | "insufficient_dependents"; // Has dependents but below municipality's minimum tier

export type ImiResult = {
  grossImi: number;               // VPT × rate, before deductions
  imiFamiliarDeduction: number;   // 0 | 30 | 70 | 140
  netImi: number;                 // Final IMI owed (may be 0 but never negative)
  appliedRate: number;            // Effective rate used
  municipioName: string;
  imiFamiliarStatus: ImiFamiliarStatus;
  monthlyEquivalent: number;
  installments: PaymentInstallment[];
  vacantSurchargeMultiplier: number; // 1 (normal) | 3 (devoluto standard)
};

export type AimiBand = {
  rangeFrom: number;
  rangeTo: number | null; // null = no upper limit
  rate: number;
  tax: number;
};

export type AimiResult = {
  totalVpt: number;
  deduction: number;
  taxableBase: number;
  aimi: number;
  bands: AimiBand[];
  /** Month when AIMI is due, e.g. "setembro 2026" */
  paymentMonth: string;
  paymentMonthEn: string;
};

export type ExemptionResult = {
  permanentExemption: {
    eligible: boolean;
    /** Human-readable reasons why conditions failed (empty when eligible) */
    failedConditionsPt: string[];
    failedConditionsEn: string[];
  };
  temporaryExemption: {
    eligible: boolean;
    /** 3 years standard; 5 years in municipalities that opted in under Lei 56/2023 */
    durationYears: 3 | 5 | null;
    failedConditionsPt: string[];
    failedConditionsEn: string[];
  };
};

// ─── Constants ────────────────────────────────────────────────────────────────

/** IMI Familiar fixed deductions — Art. 112-A CIMI (unchanged) */
export const IMI_FAMILIAR_DEDUCTIONS: Record<1 | 2 | 3, number> = {
  1: 30,
  2: 70,
  3: 140,
};

/** Rural properties — Art. 112(1)(b) CIMI — fixed nationally, not per municipality */
export const RUSTICO_RATE = 0.008;

/** AIMI deductions per filing status — Arts. 135-C CIMI (unchanged since 2017) */
export const AIMI_DEDUCTION_INDIVIDUAL = 600_000;
export const AIMI_DEDUCTION_COUPLE     = 1_200_000;
export const AIMI_RATE_COMPANY         = 0.004; // flat rate, no deduction

/** AIMI marginal bands for individuals (applies equally to couples with doubled thresholds) */
export const AIMI_BANDS_INDIVIDUAL: { upTo: number; rate: number }[] = [
  { upTo: 400_000,   rate: 0.007 }, // VPT €600k–€1M (taxable €0–€400k)
  { upTo: 1_400_000, rate: 0.010 }, // VPT €1M–€2M   (taxable €400k–€1.4M)
  { upTo: Infinity,  rate: 0.015 }, // VPT >€2M       (taxable >€1.4M)
];

/** Permanent exemption thresholds — Art. 11-A CIMI, IAS €537.13 (OE 2026) */
export const PERMANENT_EXEMPTION_INCOME_MAX = 17_303.39; // 2.3 × 14 × 537.13
export const PERMANENT_EXEMPTION_VPT_MAX    = 75_198.20; // 10 × 14 × 537.13

/** Temporary exemption thresholds — Art. 46 EBF (frozen since 2012) */
export const TEMPORARY_EXEMPTION_VPT_MAX    = 125_000;
export const TEMPORARY_EXEMPTION_INCOME_MAX = 153_300;

/** Payment installment thresholds — Art. 120 CIMI */
export const PAYMENT_THRESHOLD_SINGLE = 100;  // ≤€100 → 1 installment
export const PAYMENT_THRESHOLD_TWO    = 500;  // €100–€500 → 2 installments
                                               // >€500 → 3 installments

/** 2026 payment deadlines (Art. 120 CIMI) */
export const PAYMENT_DATES_2026 = {
  first:  "2026-05-31",
  second: "2026-08-31",
  third:  "2026-11-30",
} as const;

/** Devoluto surcharge multipliers — Art. 112-B CIMI */
export const VACANT_SURCHARGE_STANDARD      = 3;
export const VACANT_SURCHARGE_PRESSURE_ZONE = 6;

/** Late payment interest rate 2026 — Aviso n.º 18/2026/2, IGCP */
export const LATE_PAYMENT_RATE_2026 = 0.07221;

// ─── Options for UI ───────────────────────────────────────────────────────────

export const PROPERTY_TYPE_OPTIONS: { value: ImiPropertyType; labelPt: string; labelEn: string }[] = [
  { value: "urbano",             labelPt: "Apartamento / Moradia",    labelEn: "Apartment / House"         },
  { value: "terreno_construcao", labelPt: "Terreno para construção",  labelEn: "Construction land"         },
  { value: "rustico",            labelPt: "Prédio rústico",           labelEn: "Rural property"            },
];

export const PROPERTY_PURPOSE_OPTIONS: { value: ImiPropertyPurpose; labelPt: string; labelEn: string }[] = [
  { value: "hpp",       labelPt: "Habitação própria permanente", labelEn: "Primary permanent residence" },
  { value: "secondary", labelPt: "Habitação secundária",         labelEn: "Secondary residence"         },
  { value: "rental",    labelPt: "Arrendamento",                 labelEn: "Rental property"             },
  { value: "vacant",    labelPt: "Devoluto",                     labelEn: "Vacant property"             },
];

export const FILING_STATUS_OPTIONS: { value: ImiFilingStatus; labelPt: string; labelEn: string }[] = [
  { value: "individual", labelPt: "Individual",       labelEn: "Individual"        },
  { value: "couple",     labelPt: "Casal (conjunto)", labelEn: "Couple (joint)"    },
  { value: "company",    labelPt: "Empresa",          labelEn: "Company"           },
];

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildInstallments(netImi: number): PaymentInstallment[] {
  if (netImi <= 0) return [];

  const rounded2 = (n: number) => Math.round(n * 100) / 100;

  if (netImi <= PAYMENT_THRESHOLD_SINGLE) {
    return [
      {
        label:   "1.ª prestação",
        labelEn: "1st instalment",
        amount:  rounded2(netImi),
        dueDate: PAYMENT_DATES_2026.first,
      },
    ];
  }

  if (netImi <= PAYMENT_THRESHOLD_TWO) {
    const half = rounded2(netImi / 2);
    const remainder = rounded2(netImi - half);
    return [
      { label: "1.ª prestação", labelEn: "1st instalment", amount: half,      dueDate: PAYMENT_DATES_2026.first },
      { label: "2.ª prestação", labelEn: "2nd instalment", amount: remainder, dueDate: PAYMENT_DATES_2026.third },
    ];
  }

  // >€500 — 3 installments: split into thirds, rounding last to absorb cent differences
  const third  = rounded2(netImi / 3);
  const second = third;
  const last   = rounded2(netImi - third * 2);
  return [
    { label: "1.ª prestação", labelEn: "1st instalment", amount: third,  dueDate: PAYMENT_DATES_2026.first  },
    { label: "2.ª prestação", labelEn: "2nd instalment", amount: second, dueDate: PAYMENT_DATES_2026.second },
    { label: "3.ª prestação", labelEn: "3rd instalment", amount: last,   dueDate: PAYMENT_DATES_2026.third  },
  ];
}

// ─── Main calculations ────────────────────────────────────────────────────────

/**
 * Calculate the annual IMI for a single property.
 * IMI = VPT × municipal rate − IMI Familiar deduction
 */
export function calculateImi(input: ImiInput): ImiResult {
  const { vpt, municipioId, propertyType, propertyPurpose, dependents, overrideRate } = input;

  const municipio = getMunicipio(municipioId);
  const municipioName = municipio?.name ?? municipioId;

  // Determine applicable rate
  let appliedRate: number;
  let vacantSurchargeMultiplier = 1;

  if (propertyType === "rustico") {
    appliedRate = RUSTICO_RATE;
  } else {
    // overrideRate takes precedence for municipalities with per-parish rates
    const baseRate = overrideRate ?? municipio?.rate ?? 0.003;

    if (propertyPurpose === "vacant") {
      vacantSurchargeMultiplier = VACANT_SURCHARGE_STANDARD;
      appliedRate = baseRate * VACANT_SURCHARGE_STANDARD;
    } else {
      appliedRate = baseRate;
    }
  }

  const grossImi = Math.round(vpt * appliedRate * 100) / 100;

  // IMI Familiar deduction
  let imiFamiliarDeduction = 0;
  let imiFamiliarStatus: ImiFamiliarStatus;

  const minDeps = municipio?.imiFamiliarMinDeps ?? 1;

  if (propertyType === "rustico") {
    // Rural properties are not eligible for IMI Familiar
    imiFamiliarStatus = "not_hpp";
  } else if (propertyPurpose !== "hpp") {
    imiFamiliarStatus = "not_hpp";
  } else if (minDeps === 0) {
    imiFamiliarStatus = "not_participant";
  } else if (dependents === 0) {
    imiFamiliarStatus = "no_dependents";
  } else if (dependents < minDeps) {
    // Municipality requires more dependents than the household has
    imiFamiliarStatus = "insufficient_dependents";
  } else {
    // dependents >= minDeps → lookup deduction based on actual dependents
    const dep = dependents as 1 | 2 | 3;
    imiFamiliarDeduction = IMI_FAMILIAR_DEDUCTIONS[dep];
    imiFamiliarStatus = "applied";
  }

  const netImi = Math.max(0, Math.round((grossImi - imiFamiliarDeduction) * 100) / 100);
  const monthlyEquivalent = Math.round((netImi / 12) * 100) / 100;
  const installments = buildInstallments(netImi);

  return {
    grossImi,
    imiFamiliarDeduction,
    netImi,
    appliedRate,
    municipioName,
    imiFamiliarStatus,
    monthlyEquivalent,
    installments,
    vacantSurchargeMultiplier,
  };
}

/**
 * Calculate AIMI (Adicional ao IMI) for a property portfolio.
 * Applies to individuals/couples with total residential VPT > €600k / €1.2M.
 * Companies pay 0.4% flat on the full amount with no deduction.
 */
export function calculateAimi(input: AimiInput): AimiResult {
  const { totalResidentialVpt, filingStatus, includesVacantOrRuins } = input;

  const paymentMonth   = "setembro 2026";
  const paymentMonthEn = "September 2026";

  if (filingStatus === "company") {
    const aimi = Math.round(totalResidentialVpt * AIMI_RATE_COMPANY * 100) / 100;
    return {
      totalVpt: totalResidentialVpt,
      deduction: 0,
      taxableBase: totalResidentialVpt,
      aimi,
      bands: [
        {
          rangeFrom: 0,
          rangeTo:   null,
          rate:      AIMI_RATE_COMPANY,
          tax:       aimi,
        },
      ],
      paymentMonth,
      paymentMonthEn,
    };
  }

  // Individual / couple
  let deduction =
    filingStatus === "couple" ? AIMI_DEDUCTION_COUPLE : AIMI_DEDUCTION_INDIVIDUAL;

  // Properties classified as devoluto/ruins are excluded from the deduction
  if (includesVacantOrRuins) {
    deduction = 0;
  }

  const taxableBase = Math.max(0, totalResidentialVpt - deduction);

  if (taxableBase <= 0) {
    return {
      totalVpt: totalResidentialVpt,
      deduction,
      taxableBase: 0,
      aimi: 0,
      bands: [],
      paymentMonth,
      paymentMonthEn,
    };
  }

  // Apply marginal bands — double thresholds for couples
  const multiplier  = filingStatus === "couple" ? 2 : 1;
  let remaining     = taxableBase;
  let aimi          = 0;
  let prevCeiling   = 0;
  const bands: AimiBand[] = [];

  for (const band of AIMI_BANDS_INDIVIDUAL) {
    if (remaining <= 0) break;
    const bandCeiling   = band.upTo * multiplier;
    const bandSize      = bandCeiling - prevCeiling;
    const taxableInBand = Math.min(remaining, bandSize);
    const taxInBand     = Math.round(taxableInBand * band.rate * 100) / 100;

    bands.push({
      rangeFrom: prevCeiling,
      rangeTo:   band.upTo === Infinity ? null : bandCeiling,
      rate:      band.rate,
      tax:       taxInBand,
    });

    aimi      += taxInBand;
    remaining -= taxableInBand;
    prevCeiling = bandCeiling;
  }

  return {
    totalVpt: totalResidentialVpt,
    deduction,
    taxableBase,
    aimi: Math.round(aimi * 100) / 100,
    bands,
    paymentMonth,
    paymentMonthEn,
  };
}

/**
 * Check exemption eligibility for a property.
 * Does not consider the AIMI exemption for arrendamento moderado (pending OE 2026 specifics).
 */
export function checkExemptions(input: ExemptionInput): ExemptionResult {
  const {
    vpt,
    isHpp,
    householdGrossIncome,
    totalFamilyVpt,
    acquisitionYear,
    previousExemptionsUsed,
  } = input;

  const currentYear = 2026;

  // ── Permanent exemption — Art. 11-A CIMI ──────────────────────────────────
  const permanentFailedPt: string[] = [];
  const permanentFailedEn: string[] = [];

  if (!isHpp) {
    permanentFailedPt.push("Imóvel não é habitação própria permanente");
    permanentFailedEn.push("Property is not a primary permanent residence");
  }
  if (householdGrossIncome > PERMANENT_EXEMPTION_INCOME_MAX) {
    permanentFailedPt.push(
      `Rendimento bruto do agregado (${householdGrossIncome.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}) excede o limite de ${PERMANENT_EXEMPTION_INCOME_MAX.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}`,
    );
    permanentFailedEn.push(
      `Household income exceeds the limit of €${PERMANENT_EXEMPTION_INCOME_MAX.toLocaleString("en")}`,
    );
  }
  if (totalFamilyVpt > PERMANENT_EXEMPTION_VPT_MAX) {
    permanentFailedPt.push(
      `VPT total do agregado (${totalFamilyVpt.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}) excede o limite de ${PERMANENT_EXEMPTION_VPT_MAX.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}`,
    );
    permanentFailedEn.push(
      `Total family VPT exceeds the limit of €${PERMANENT_EXEMPTION_VPT_MAX.toLocaleString("en")}`,
    );
  }

  // ── Temporary exemption — Art. 46 EBF ────────────────────────────────────
  const temporaryFailedPt: string[] = [];
  const temporaryFailedEn: string[] = [];

  if (!isHpp) {
    temporaryFailedPt.push("Imóvel não é habitação própria permanente");
    temporaryFailedEn.push("Property is not a primary permanent residence");
  }
  if (vpt > TEMPORARY_EXEMPTION_VPT_MAX) {
    temporaryFailedPt.push(
      `VPT (${vpt.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}) excede o limite de €125.000`,
    );
    temporaryFailedEn.push(`VPT exceeds the €125,000 limit`);
  }
  if (householdGrossIncome > TEMPORARY_EXEMPTION_INCOME_MAX) {
    temporaryFailedPt.push(
      `Rendimento bruto do agregado excede o limite de €153.300`,
    );
    temporaryFailedEn.push(`Household income exceeds the €153,300 limit`);
  }

  // Temporary exemption window: acquisition year must be within the last 3 years
  const yearsOwned = currentYear - acquisitionYear;
  if (yearsOwned > 3) {
    temporaryFailedPt.push(
      `Prazo de 3 anos após aquisição já expirou (adquirido em ${acquisitionYear})`,
    );
    temporaryFailedEn.push(
      `The 3-year window after acquisition has expired (acquired in ${acquisitionYear})`,
    );
  }
  if (previousExemptionsUsed >= 2) {
    temporaryFailedPt.push("Limite de 2 isenções temporárias ao longo da vida já atingido");
    temporaryFailedEn.push("Lifetime limit of 2 temporary exemptions already reached");
  }

  const temporaryEligible = temporaryFailedPt.length === 0;
  // Duration: 3 years standard; municipalities that opted into Lei 56/2023 extend to 5 years.
  // We conservatively show 3 years here — user should check with their municipality.
  const durationYears = temporaryEligible ? 3 : null;

  return {
    permanentExemption: {
      eligible: permanentFailedPt.length === 0,
      failedConditionsPt: permanentFailedPt,
      failedConditionsEn: permanentFailedEn,
    },
    temporaryExemption: {
      eligible: temporaryEligible,
      durationYears,
      failedConditionsPt: temporaryFailedPt,
      failedConditionsEn: temporaryFailedEn,
    },
  };
}

/**
 * Calculate late payment interest (juros de mora).
 * Rate: 7.221%/year (Aviso n.º 18/2026/2).
 * Formula: capital × (rate / 365) × days
 */
export function calculateLatePaymentInterest(
  capital: number,
  daysLate: number,
): number {
  return Math.round(capital * (LATE_PAYMENT_RATE_2026 / 365) * daysLate * 100) / 100;
}

// ─── VPT Reassessment (Art. 38 CIMI) ─────────────────────────────────────────
//
// Simplified formula for residential habitação:
//   VPT = Vc × A × Ca × Cl × Cq × Cv   (rounded to nearest €10)
//
//   Vc  = €712.50 (Portaria 471/2025/1 — 2026 value, up from €665 in 2023–2025)
//   A   = Aa + Ab × 0.30  (simplified: no terrain areas Ac/Ad)
//   Ca  = 1.0 for habitação (Art. 41 CIMI)
//   Cl  = location coefficient 0.4–3.5, from caderneta predial (CNAPU zonamento)
//   Cq  = quality/comfort coefficient (Art. 43 CIMI), base 1.0 ± amenity adjustments
//   Cv  = vetustez (age depreciation) per Art. 44 CIMI

/** Valor base per m² for 2026 (Portaria 471/2025/1) */
export const VC_2026 = 712.50;
/** Previous Vc (2023–2025) — Portaria 7-A/2023 */
export const VC_PREVIOUS = 665;

export type VptAmenities = {
  pool: boolean;
  individualGarage: boolean;
  centralAc: boolean;
  gatedCommunity: boolean;
  /** Moradia/single-family house (as opposed to apartment block) */
  singleFamilyHouse: boolean;
};

export type VptInput = {
  /** VPT currently shown on caderneta predial */
  currentVpt: number;
  /** Calendar year when VPT was last evaluated (must be ≥3 years ago to request new one) */
  lastEvalYear: number;
  /** Coeficiente de localização — from caderneta predial, range 0.4–3.5 */
  cl: number;
  /** Área bruta privativa in m² */
  aa: number;
  /** Área bruta dependente (garages, storage) in m² */
  ab: number;
  /** Year of construction/licence — drives Cv (vetustez) coefficient */
  constructionYear: number;
  amenities: VptAmenities;
  /** Optional: for accurate IMI change estimate using municipality's actual rate */
  municipioRate?: number;
};

export type VptResult = {
  recalculatedVpt: number;
  currentVpt: number;
  /** Positive = VPT would increase; negative = VPT would decrease (saving) */
  difference: number;
  /** Estimated change in annual IMI (positive = more, negative = less) */
  annualImiChange: number;
  /** Coefficients used in calculation */
  vc: number;
  area: number;
  ca: number;
  cl: number;
  cq: number;
  cv: number;
  /** False when last evaluation was less than 3 years ago — can't yet request reassessment */
  canRequestReassessment: boolean;
  recommendation: "request" | "caution" | "not_eligible";
  /** True when recalculated VPT might be inflated because Vc jumped 7.14% in 2026 */
  warningVcIncrease: boolean;
};

// ─── Cv table — Art. 44 CIMI ──────────────────────────────────────────────────

function getCv(constructionYear: number): number {
  const age = 2026 - constructionYear;
  if (age < 2)  return 1.00;
  if (age <= 8)  return 0.90;
  if (age <= 15) return 0.85;
  if (age <= 25) return 0.80;
  if (age <= 40) return 0.75;
  if (age <= 50) return 0.65;
  if (age <= 60) return 0.55;
  return 0.40;
}

// ─── Cq table — Art. 43 CIMI ─────────────────────────────────────────────────

function getCq(amenities: VptAmenities): number {
  let cq = 1.0;
  if (amenities.pool)              cq += 0.06;
  if (amenities.individualGarage)  cq += 0.04;
  if (amenities.centralAc)         cq += 0.03;
  if (amenities.gatedCommunity)    cq += 0.20;
  if (amenities.singleFamilyHouse) cq += 0.20;
  // Art. 43 CIMI clamps Cq to 0.5–1.7
  return Math.min(1.7, Math.max(0.5, cq));
}

/**
 * Estimate what the VPT would be if the property were evaluated under 2026 coefficients.
 * Uses the simplified formula (no terrain areas Ac/Ad; Ca = 1.0 for habitação).
 */
export function calculateVpt(input: VptInput): VptResult {
  const { currentVpt, lastEvalYear, cl, aa, ab, constructionYear, amenities, municipioRate } = input;

  const canRequestReassessment = 2026 - lastEvalYear >= 3;

  const vc   = VC_2026;
  const area = aa + ab * 0.30;
  const ca   = 1.0; // habitação
  const cv   = getCv(constructionYear);
  const cq   = getCq(amenities);

  const rawVpt = vc * area * ca * cl * cq * cv;
  // Round to nearest €10 as required by Art. 38 CIMI
  const recalculatedVpt = Math.round(rawVpt / 10) * 10;

  const difference      = recalculatedVpt - currentVpt;
  const rate            = municipioRate ?? 0.003;
  const annualImiChange = Math.round(difference * rate * 100) / 100;

  let recommendation: VptResult["recommendation"];
  if (!canRequestReassessment) {
    recommendation = "not_eligible";
  } else if (recalculatedVpt < currentVpt) {
    recommendation = "request";
  } else {
    recommendation = "caution";
  }

  // Warn whenever Vc jumped (i.e. always in 2026, since Vc went from €665 → €712.50)
  const warningVcIncrease = recalculatedVpt > currentVpt;

  return {
    recalculatedVpt,
    currentVpt,
    difference,
    annualImiChange,
    vc,
    area,
    ca,
    cl,
    cq,
    cv,
    canRequestReassessment,
    recommendation,
    warningVcIncrease,
  };
}

// ─── Multi-property portfolio ─────────────────────────────────────────────────

export type PortfolioProperty = {
  id: string;
  vpt: number;
  municipioId: string;
  propertyType: ImiPropertyType;
  propertyPurpose: ImiPropertyPurpose;
  dependents: 0 | 1 | 2 | 3;
};

export type PortfolioResult = {
  propertyResults: Array<{
    id: string;
    imiResult: ImiResult;
  }>;
  totalAnnualImi: number;
  totalMonthlyEquivalent: number;
  /** Combined VPT of all residential urban properties (for AIMI calculation) */
  totalResidentialVpt: number;
};

/**
 * Calculate IMI for each property in a portfolio and produce aggregate totals.
 * AIMI is not calculated here — pass totalResidentialVpt to calculateAimi separately.
 */
export function calculatePortfolio(properties: PortfolioProperty[]): PortfolioResult {
  const propertyResults = properties
    .filter((p) => p.vpt > 0 && p.municipioId !== "")
    .map((p) => ({
      id: p.id,
      imiResult: calculateImi({
        vpt:             p.vpt,
        municipioId:     p.municipioId,
        propertyType:    p.propertyType,
        propertyPurpose: p.propertyPurpose,
        dependents:      p.dependents,
      }),
    }));

  const totalAnnualImi = Math.round(
    propertyResults.reduce((sum, r) => sum + r.imiResult.netImi, 0) * 100,
  ) / 100;

  const totalMonthlyEquivalent = Math.round((totalAnnualImi / 12) * 100) / 100;

  // Sum residential VPT for AIMI: urbano + terreno_construcao (not rústico)
  const totalResidentialVpt = properties
    .filter((p) => p.propertyType !== "rustico")
    .reduce((sum, p) => sum + p.vpt, 0);

  return {
    propertyResults,
    totalAnnualImi,
    totalMonthlyEquivalent,
    totalResidentialVpt,
  };
}
