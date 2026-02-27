/**
 * IRS Withholding Tables — Continente — 2026
 *
 * Source: Portaria n.º 13-A/2026 (AT official monthly withholding tables)
 * Effective: 1 January 2026
 * Income type: Trabalho dependente (Categoria A)
 *
 * Formula (Tables I–III regular, Tables IV–VII disability):
 *   Withholding = max(0, R × rate − parcel − depParcel × nDeps)
 *
 * Variable-parcel rows (where parcel is expressed as rate × mult × (threshold − R))
 * are pre-expanded to fixed (rate, parcel) form using the identity:
 *   fixedRate  = rateOuter × (1 + mult)
 *   fixedParcel = rateOuter × mult × threshold
 * so the formula always reduces to: R × fixedRate − fixedParcel
 *
 * Pension tables (VIII–XI) are in docs/static-data/Tabelas_RF_Continente_2026.csv
 * but are NOT used by the salary calculator (Category A income only).
 */

import type { WithholdingRegionTables } from "./withholding-tables.types";

export const CONTINENTE_2026: WithholdingRegionTables = {
  region: "continente",
  year: 2026,
  incomeType: "work",

  // ─── Monthly dep deduction (€/dependent) ────────────────────────────────
  depParcel: {
    I:   21.43,
    II:  34.29,
    III: 42.86,
  },

  // ─── Table I — Não casado sem dependentes / Casado dois titulares ────────
  tableI: [
    { upTo: 920,      rate: 0,        parcel: 0 },
    // Variable row: 12,50% x 2,60 x (1 273,85 − R)
    // fixedRate = 0.125 × (1 + 2.60) = 0.45; fixedParcel = 0.125 × 2.60 × 1273.85 = 414.00
    { upTo: 1042,     rate: 0.4500,   parcel: 414.00 },
    // Variable row: 15,70% x 1,35 x (1 554,83 − R)
    // fixedRate = 0.157 × (1 + 1.35) = 0.36895; fixedParcel = 0.157 × 1.35 × 1554.83 = 329.55
    { upTo: 1108,     rate: 0.36895,  parcel: 329.55 },
    { upTo: 1154,     rate: 0.1570,   parcel: 94.71 },
    { upTo: 1212,     rate: 0.2120,   parcel: 158.18 },
    { upTo: 1819,     rate: 0.2410,   parcel: 193.33 },
    { upTo: 2119,     rate: 0.3110,   parcel: 320.66 },
    { upTo: 2499,     rate: 0.3490,   parcel: 401.19 },
    { upTo: 3305,     rate: 0.3836,   parcel: 487.66 },
    { upTo: 5547,     rate: 0.3969,   parcel: 531.62 },
    { upTo: 20221,    rate: 0.4495,   parcel: 823.40 },
    { upTo: Infinity, rate: 0.4717,   parcel: 1272.31 },
  ],

  // ─── Table II — Não casado com um ou mais dependentes ───────────────────
  // Same rate/parcel coefficients as Table I; depParcel differs (34.29 vs 21.43)
  tableII: [
    { upTo: 920,      rate: 0,        parcel: 0 },
    { upTo: 1042,     rate: 0.4500,   parcel: 414.00 },
    { upTo: 1108,     rate: 0.36895,  parcel: 329.55 },
    { upTo: 1154,     rate: 0.1570,   parcel: 94.71 },
    { upTo: 1212,     rate: 0.2120,   parcel: 158.18 },
    { upTo: 1819,     rate: 0.2410,   parcel: 193.33 },
    { upTo: 2119,     rate: 0.3110,   parcel: 320.66 },
    { upTo: 2499,     rate: 0.3490,   parcel: 401.19 },
    { upTo: 3305,     rate: 0.3836,   parcel: 487.66 },
    { upTo: 5547,     rate: 0.3969,   parcel: 531.62 },
    { upTo: 20221,    rate: 0.4495,   parcel: 823.40 },
    { upTo: Infinity, rate: 0.4717,   parcel: 1272.31 },
  ],

  // ─── Table III — Casado, único titular ──────────────────────────────────
  tableIII: [
    { upTo: 991,      rate: 0,        parcel: 0 },
    // Variable row: 12,50% x 2,6 x (1 372,15 − R)
    // fixedRate = 0.125 × 3.6 = 0.45; fixedParcel = 0.125 × 2.6 × 1372.15 = 445.95
    { upTo: 1042,     rate: 0.4500,   parcel: 445.95 },
    // Variable row: 12,50% x 1,35 x (1 677,85 − R)
    // fixedRate = 0.125 × 2.35 = 0.29375; fixedParcel = 0.125 × 1.35 × 1677.85 = 283.13
    { upTo: 1108,     rate: 0.29375,  parcel: 283.13 },
    { upTo: 1119,     rate: 0.1250,   parcel: 96.17 },
    { upTo: 1432,     rate: 0.1272,   parcel: 98.64 },
    { upTo: 1962,     rate: 0.1570,   parcel: 141.32 },
    { upTo: 2240,     rate: 0.1938,   parcel: 213.53 },
    { upTo: 2773,     rate: 0.2277,   parcel: 289.47 },
    { upTo: 3389,     rate: 0.2570,   parcel: 370.72 },
    { upTo: 5965,     rate: 0.2881,   parcel: 476.12 },
    { upTo: 20265,    rate: 0.3843,   parcel: 1049.96 },
    { upTo: Infinity, rate: 0.4717,   parcel: 2821.13 },
  ],

  // ─── Table IV — Não casado / Casado dois titulares sem dependentes — Deficiência ──
  // Formula: R × rate − parcel (no depParcel)
  tableIV: [
    { upTo: 1694,     rate: 0,        parcel: 0 },
    { upTo: 2063,     rate: 0.2120,   parcel: 359.13 },
    { upTo: 2492,     rate: 0.3110,   parcel: 563.37 },
    { upTo: 4487,     rate: 0.3490,   parcel: 658.07 },
    { upTo: 4753,     rate: 0.3836,   parcel: 813.33 },
    { upTo: 6687,     rate: 0.3969,   parcel: 876.55 },
    { upTo: 20468,    rate: 0.4495,   parcel: 1228.29 },
    { upTo: Infinity, rate: 0.4717,   parcel: 1682.68 },
  ],

  // ─── Table V — Não casado com 1+ dependentes — Deficiência ──────────────
  tableV: [
    { upTo: 1938,     rate: 0,        parcel: 0,       depParcel: 42.86 },
    { upTo: 2063,     rate: 0.2132,   parcel: 413.19,  depParcel: 42.86 },
    { upTo: 2854,     rate: 0.3110,   parcel: 614.96,  depParcel: 42.86 },
    { upTo: 4504,     rate: 0.3490,   parcel: 723.42,  depParcel: 42.86 },
    { upTo: 6826,     rate: 0.3836,   parcel: 879.26,  depParcel: 42.86 },
    { upTo: 7048,     rate: 0.3969,   parcel: 970.05,  depParcel: 42.86 },
    { upTo: 20468,    rate: 0.4495,   parcel: 1340.78, depParcel: 42.86 },
    { upTo: Infinity, rate: 0.4717,   parcel: 1795.17, depParcel: 42.86 },
  ],

  // ─── Table VI — Casado dois titulares com 1+ dependentes — Deficiência ──
  tableVI: [
    { upTo: 1668,     rate: 0,        parcel: 0,       depParcel: 21.43 },
    { upTo: 2068,     rate: 0.2049,   parcel: 341.78,  depParcel: 21.43 },
    { upTo: 2497,     rate: 0.2410,   parcel: 416.44,  depParcel: 21.43 },
    { upTo: 3107,     rate: 0.3110,   parcel: 591.23,  depParcel: 21.43 },
    { upTo: 4504,     rate: 0.3490,   parcel: 709.30,  depParcel: 21.43 },
    { upTo: 6826,     rate: 0.3836,   parcel: 865.14,  depParcel: 21.43 },
    { upTo: 7048,     rate: 0.3969,   parcel: 955.93,  depParcel: 21.43 },
    { upTo: 20468,    rate: 0.4495,   parcel: 1326.66, depParcel: 21.43 },
    { upTo: Infinity, rate: 0.4717,   parcel: 1781.05, depParcel: 21.43 },
  ],

  // ─── Table VII — Casado único titular — Deficiência ─────────────────────
  tableVII: [
    { upTo: 2325,     rate: 0,        parcel: 0,       depParcel: 42.86 },
    { upTo: 3494,     rate: 0.2277,   parcel: 529.41,  depParcel: 42.86 },
    { upTo: 3761,     rate: 0.2570,   parcel: 631.79,  depParcel: 42.86 },
    { upTo: 6687,     rate: 0.2881,   parcel: 748.76,  depParcel: 42.86 },
    { upTo: 20468,    rate: 0.4244,   parcel: 1660.20, depParcel: 42.86 },
    { upTo: Infinity, rate: 0.4717,   parcel: 2628.34, depParcel: 42.86 },
  ],
};
