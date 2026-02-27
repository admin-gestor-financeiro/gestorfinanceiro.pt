// Portugal IMT (Imposto Municipal sobre Transmissões Onerosas de Imóveis)
// + Imposto de Selo calculator
//
// 2026 tables: OE 2026 — 2% uplift on 2025 thresholds (Lei n.º 45-A/2024 base,
//              adjusted per Orçamento do Estado 2026). Rates unchanged.
// IMT Jovem:   Decreto-Lei n.º 48-A/2024 (effective 1 August 2024)
// Formula (marginal brackets): IMT = Value × Rate − Parcela a Abater
// Formula (flat brackets 6% / 7.5%): IMT = Value × Rate  (full value, no parcel)
// Parcels derived from bracket boundary continuity: parcel_n = upTo_{n-1} × (rate_n − rate_{n-1}) + parcel_{n-1}

// ─── Types ────────────────────────────────────────────────────────────────────

export type PropertyType =
  | "hpp"             // Habitação própria e permanente
  | "secondary"       // Habitação secundária / arrendamento
  | "rustico"         // Prédio rústico — 5% flat
  | "outros_urbanos"  // Outros imóveis urbanos — 6.5% flat
  | "offshore";       // Entidade offshore — 10% flat (legal persons only)

export type ImtRegion = "continente" | "acores_madeira";

/**
 * IMT Jovem eligibility status for the transaction.
 *  none  → Not applicable (not HPP, buyer > 35, or conditions not met)
 *  full  → Single buyer qualifies, or both buyers in a joint purchase qualify
 *  half  → Joint purchase: only one of two buyers qualifies → 50% of benefit
 */
export type ImtJovemStatus = "none" | "full" | "half";

export type ImtInput = {
  transactionValue: number;
  propertyType: PropertyType;
  region: ImtRegion;
  imtJovemStatus?: ImtJovemStatus;
};

export type BracketBreakdown = {
  rangeFrom: number;
  rangeTo: number | null; // null = above last threshold (Infinity)
  rate: number;
  taxableAmount: number;
  taxAmount: number;
  flat: boolean;
  exempt: boolean;
};

export type ImtResult = {
  transactionValue: number;
  propertyType: PropertyType;
  region: ImtRegion;
  // IMT
  imtAmount: number;
  imtExempt: boolean;
  bracketBreakdown: BracketBreakdown[];
  // Imposto de Selo
  impostoSeloRate: number;
  impostoSeloAmount: number;
  impostoSeloExempt: boolean;
  // Totals
  totalTax: number;
  effectiveRate: number;
  // IMT Jovem
  imtJovemStatus: ImtJovemStatus;
};

// ─── Internal bracket type ────────────────────────────────────────────────────

type ImtBracket = {
  upTo: number;
  rate: number;
  parcel: number;
  /** When true, rate applies to the full transaction value with no parcel deduction */
  flat?: boolean;
};

// ─── 2026 Tax tables — Continente ─────────────────────────────────────────────
// Thresholds = 2025 values × 1.02 (Math.round). Rates unchanged.

const HPP_CONTINENTE: ImtBracket[] = [
  { upTo: 106_346,   rate: 0,      parcel: 0          },
  { upTo: 145_470,   rate: 0.02,   parcel: 2_126.92   },
  { upTo: 198_347,   rate: 0.05,   parcel: 6_491.02   },
  { upTo: 330_539,   rate: 0.07,   parcel: 10_457.96  },
  { upTo: 660_982,   rate: 0.08,   parcel: 13_763.35  },
  { upTo: 1_150_853, rate: 0.06,   parcel: 0, flat: true },
  { upTo: Infinity,  rate: 0.075,  parcel: 0, flat: true },
];

const SECONDARY_CONTINENTE: ImtBracket[] = [
  { upTo: 106_346,   rate: 0.01,   parcel: 0          },
  { upTo: 145_470,   rate: 0.02,   parcel: 1_063.46   },
  { upTo: 198_347,   rate: 0.05,   parcel: 5_427.56   },
  { upTo: 330_539,   rate: 0.07,   parcel: 9_394.50   },
  { upTo: 633_931,   rate: 0.08,   parcel: 12_699.89  },
  { upTo: 1_150_853, rate: 0.06,   parcel: 0, flat: true },
  { upTo: Infinity,  rate: 0.075,  parcel: 0, flat: true },
];

const IMT_JOVEM_CONTINENTE: ImtBracket[] = [
  { upTo: 330_539,   rate: 0,      parcel: 0          },
  { upTo: 660_982,   rate: 0.08,   parcel: 26_443.12  },
  { upTo: 1_150_853, rate: 0.06,   parcel: 0, flat: true },
  { upTo: Infinity,  rate: 0.075,  parcel: 0, flat: true },
];

// ─── 2026 Tax tables — Regiões Autónomas (Açores e Madeira) ──────────────────
// Thresholds = 2026 Continente × 1.25 (Math.round). Rates identical.

const HPP_RA: ImtBracket[] = [
  { upTo: 132_933,   rate: 0,      parcel: 0          },
  { upTo: 181_838,   rate: 0.02,   parcel: 2_658.66   },
  { upTo: 247_934,   rate: 0.05,   parcel: 8_113.80   },
  { upTo: 413_174,   rate: 0.07,   parcel: 13_072.48  },
  { upTo: 826_228,   rate: 0.08,   parcel: 17_204.22  },
  { upTo: 1_438_566, rate: 0.06,   parcel: 0, flat: true },
  { upTo: Infinity,  rate: 0.075,  parcel: 0, flat: true },
];

const SECONDARY_RA: ImtBracket[] = [
  { upTo: 132_933,   rate: 0.01,   parcel: 0          },
  { upTo: 181_838,   rate: 0.02,   parcel: 1_329.33   },
  { upTo: 247_934,   rate: 0.05,   parcel: 6_784.47   },
  { upTo: 413_174,   rate: 0.07,   parcel: 11_743.15  },
  { upTo: 792_414,   rate: 0.08,   parcel: 15_874.89  },
  { upTo: 1_438_566, rate: 0.06,   parcel: 0, flat: true },
  { upTo: Infinity,  rate: 0.075,  parcel: 0, flat: true },
];

const IMT_JOVEM_RA: ImtBracket[] = [
  { upTo: 413_174,   rate: 0,      parcel: 0          },
  { upTo: 826_228,   rate: 0.08,   parcel: 33_053.92  },
  { upTo: 1_438_566, rate: 0.06,   parcel: 0, flat: true },
  { upTo: Infinity,  rate: 0.075,  parcel: 0, flat: true },
];

// ─── Flat-rate constants ──────────────────────────────────────────────────────

const FLAT_RATE_RUSTICO        = 0.05;
const FLAT_RATE_OUTROS_URBANOS = 0.065;
const FLAT_RATE_OFFSHORE       = 0.10;

export const IMPOSTO_SELO_RATE = 0.008;

// IMT Jovem Imposto de Selo exemption ceiling (same as IMT full-exemption threshold)
const IMT_JOVEM_IS_THRESHOLD: Record<ImtRegion, number> = {
  continente:     330_539,
  acores_madeira: 413_174,
};

// ─── Options for UI ───────────────────────────────────────────────────────────

export const PROPERTY_TYPE_OPTIONS: {
  value: PropertyType;
  labelPt: string;
  labelEn: string;
}[] = [
  { value: "hpp",            labelPt: "Habitação própria e permanente",    labelEn: "Primary residence"           },
  { value: "secondary",      labelPt: "Habitação secundária / arrendamento", labelEn: "Secondary / rental property" },
  { value: "rustico",        labelPt: "Prédio rústico (5%)",               labelEn: "Rural property (5%)"         },
  { value: "outros_urbanos", labelPt: "Outros imóveis urbanos (6,5%)",     labelEn: "Other urban property (6.5%)" },
  { value: "offshore",       labelPt: "Entidade offshore (10%)",           labelEn: "Offshore entity (10%)"       },
];

export const REGION_OPTIONS: {
  value: ImtRegion;
  labelPt: string;
  labelEn: string;
}[] = [
  { value: "continente",     labelPt: "Continente",       labelEn: "Mainland"        },
  { value: "acores_madeira", labelPt: "Açores / Madeira", labelEn: "Azores / Madeira" },
];

// ─── Internal helpers ─────────────────────────────────────────────────────────

function computeImtFromTable(
  value: number,
  brackets: ImtBracket[],
): { imt: number; breakdown: BracketBreakdown[] } {
  if (value <= 0 || brackets.length === 0) return { imt: 0, breakdown: [] };

  const bracket =
    brackets.find((b) => value <= b.upTo) ?? brackets[brackets.length - 1]!;
  const isFlatBracket = bracket.flat === true;

  let imt: number;
  if (isFlatBracket) {
    imt = Math.round(value * bracket.rate * 100) / 100;
  } else {
    imt = Math.round(Math.max(0, value * bracket.rate - bracket.parcel) * 100) / 100;
  }

  const breakdown: BracketBreakdown[] = [];

  if (isFlatBracket) {
    // Flat bracket: single entry covering the full value
    breakdown.push({
      rangeFrom: 0,
      rangeTo: null,
      rate: bracket.rate,
      taxableAmount: value,
      taxAmount: imt,
      flat: true,
      exempt: bracket.rate === 0,
    });
  } else {
    // Marginal breakdown: one entry per bracket up to the applicable one
    let prevCeiling = 0;
    for (const b of brackets) {
      if (b.flat) break; // Do not include flat top brackets in marginal breakdown
      const isApplicable = value <= b.upTo;
      const bracketCeiling = isApplicable ? value : b.upTo;
      const taxableInBracket = Math.max(0, bracketCeiling - prevCeiling);
      const taxInBracket = Math.round(taxableInBracket * b.rate * 100) / 100;

      breakdown.push({
        rangeFrom: prevCeiling,
        rangeTo: b.upTo === Infinity ? null : b.upTo,
        rate: b.rate,
        taxableAmount: taxableInBracket,
        taxAmount: taxInBracket,
        flat: false,
        exempt: b.rate === 0,
      });

      prevCeiling = b.upTo;
      if (isApplicable) break;
    }
  }

  return { imt, breakdown };
}

function computeFlatImt(
  value: number,
  rate: number,
): { imt: number; breakdown: BracketBreakdown[] } {
  const imt = Math.round(value * rate * 100) / 100;
  return {
    imt,
    breakdown: [
      {
        rangeFrom: 0,
        rangeTo: null,
        rate,
        taxableAmount: value,
        taxAmount: imt,
        flat: true,
        exempt: false,
      },
    ],
  };
}

function computeImpostoSelo(
  value: number,
  jovemStatus: ImtJovemStatus,
  region: ImtRegion,
): { amount: number; exempt: boolean } {
  const standard = Math.round(value * IMPOSTO_SELO_RATE * 100) / 100;

  if (jovemStatus === "none") return { amount: standard, exempt: false };

  const threshold = IMT_JOVEM_IS_THRESHOLD[region];

  if (jovemStatus === "full") {
    if (value <= threshold) return { amount: 0, exempt: true };
    return {
      amount: Math.round((value - threshold) * IMPOSTO_SELO_RATE * 100) / 100,
      exempt: false,
    };
  }

  // half: 50% of the IS exemption benefit
  const jovemAmount =
    value <= threshold
      ? 0
      : Math.round((value - threshold) * IMPOSTO_SELO_RATE * 100) / 100;
  const benefit = standard - jovemAmount;
  return {
    amount: Math.round((standard - benefit * 0.5) * 100) / 100,
    exempt: false,
  };
}

// ─── Main calculation ─────────────────────────────────────────────────────────

export function calculateImt(input: ImtInput): ImtResult {
  const {
    transactionValue: value,
    propertyType,
    region,
    imtJovemStatus = "none",
  } = input;

  // IMT Jovem only applies to primary residence
  const jovemStatus: ImtJovemStatus =
    propertyType === "hpp" ? imtJovemStatus : "none";

  let imtAmount: number;
  let imtExempt = false;
  let breakdown: BracketBreakdown[] = [];

  if (propertyType === "rustico") {
    ({ imt: imtAmount, breakdown } = computeFlatImt(value, FLAT_RATE_RUSTICO));
  } else if (propertyType === "outros_urbanos") {
    ({ imt: imtAmount, breakdown } = computeFlatImt(value, FLAT_RATE_OUTROS_URBANOS));
  } else if (propertyType === "offshore") {
    ({ imt: imtAmount, breakdown } = computeFlatImt(value, FLAT_RATE_OFFSHORE));
  } else if (propertyType === "secondary") {
    const table = region === "continente" ? SECONDARY_CONTINENTE : SECONDARY_RA;
    ({ imt: imtAmount, breakdown } = computeImtFromTable(value, table));
  } else {
    // HPP
    if (jovemStatus === "full") {
      const table = region === "continente" ? IMT_JOVEM_CONTINENTE : IMT_JOVEM_RA;
      ({ imt: imtAmount, breakdown } = computeImtFromTable(value, table));
      imtExempt = imtAmount === 0;
    } else if (jovemStatus === "half") {
      const hppTable   = region === "continente" ? HPP_CONTINENTE       : HPP_RA;
      const jovemTable = region === "continente" ? IMT_JOVEM_CONTINENTE : IMT_JOVEM_RA;
      const hppResult   = computeImtFromTable(value, hppTable);
      const jovemResult = computeImtFromTable(value, jovemTable);
      const benefit = hppResult.imt - jovemResult.imt;
      imtAmount = Math.round(Math.max(0, hppResult.imt - benefit * 0.5) * 100) / 100;
      breakdown = hppResult.breakdown; // Show HPP table; reduction shown separately in UI
    } else {
      const table = region === "continente" ? HPP_CONTINENTE : HPP_RA;
      ({ imt: imtAmount, breakdown } = computeImtFromTable(value, table));
      imtExempt = imtAmount === 0;
    }
  }

  const { amount: impostoSeloAmount, exempt: impostoSeloExempt } =
    computeImpostoSelo(value, jovemStatus, region);

  const totalTax    = Math.round((imtAmount + impostoSeloAmount) * 100) / 100;
  const effectiveRate = value > 0 ? totalTax / value : 0;

  return {
    transactionValue: value,
    propertyType,
    region,
    imtAmount,
    imtExempt,
    bracketBreakdown: breakdown,
    impostoSeloRate: IMPOSTO_SELO_RATE,
    impostoSeloAmount,
    impostoSeloExempt,
    totalTax,
    effectiveRate,
    imtJovemStatus: jovemStatus,
  };
}
