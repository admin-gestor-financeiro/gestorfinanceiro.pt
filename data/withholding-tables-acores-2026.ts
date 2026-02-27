/**
 * IRS Withholding Tables — Região Autónoma dos Açores — 2026
 *
 * Source: Despacho n.º 1179/2026
 * Published: Diário da República n.º 23/2026, Série II, 2026-02-03
 * Effective: 1 January 2026
 * Revokes: Despacho n.º 8464-A/2025, de 22 de julho
 *
 * Formula (Tables I–III regular, Tables IV–VII disability):
 *   Withholding = max(0, R × rate − parcel − depParcel × nDeps)
 *
 * Variable-parcel rows are pre-expanded to fixed (rate, parcel) form.
 *
 * Special rules (informational — not yet implemented):
 *   - Disabled dependents (≥60% disability): extra parcel added, capped at 3× (single/sole) or 6× (dual)
 *   - Married sole earner: withholding from Table III increased by 50% of Table III withholding
 *   - Civil unions (união de facto): treated as married
 */

import type { WithholdingRegionTables } from "./withholding-tables.types";

export const ACORES_2026: WithholdingRegionTables = {
  region: "acores",
  year: 2026,
  incomeType: "work",

  depParcel: {
    I:   21.43,
    II:  34.29,
    III: 42.86,
  },

  // ─── Table I — Não casado sem dependentes / Casado dois titulares ────────
  tableI: [
    { upTo: 966,      rate: 0,        parcel: 0 },
    // Variable rows expanded: rate_outer=0.0875, mult=2.60, threshold=1337.54
    // → fixedRate = 0.0875×3.60 = 0.315; fixedParcel = 0.0875×2.60×1337.54 = 304.54
    { upTo: 1042,     rate: 0.3150,   parcel: 304.54 },
    // Variable rows expanded: rate_outer=0.1099, mult=1.35, threshold=1652.49
    // → fixedRate = 0.1099×2.35 = 0.25827; fixedParcel = 0.1099×1.35×1652.49 = 245.07
    { upTo: 1108,     rate: 0.25827,  parcel: 245.07 },
    { upTo: 1154,     rate: 0.1099,   parcel: 80.79 },
    { upTo: 1212,     rate: 0.1484,   parcel: 125.22 },
    { upTo: 1819,     rate: 0.1687,   parcel: 149.83 },
    { upTo: 2119,     rate: 0.2177,   parcel: 238.97 },
    { upTo: 2499,     rate: 0.2443,   parcel: 295.34 },
    { upTo: 3305,     rate: 0.2685,   parcel: 355.82 },
    { upTo: 5547,     rate: 0.2779,   parcel: 386.89 },
    { upTo: 20221,    rate: 0.3146,   parcel: 590.47 },
    { upTo: Infinity, rate: 0.3302,   parcel: 905.92 },
  ],

  // ─── Table II — Não casado com um ou mais dependentes ───────────────────
  // Identical brackets/rates to Table I; depParcel = 34.29
  tableII: [
    { upTo: 966,      rate: 0,        parcel: 0 },
    { upTo: 1042,     rate: 0.3150,   parcel: 304.54 },
    { upTo: 1108,     rate: 0.25827,  parcel: 245.07 },
    { upTo: 1154,     rate: 0.1099,   parcel: 80.79 },
    { upTo: 1212,     rate: 0.1484,   parcel: 125.22 },
    { upTo: 1819,     rate: 0.1687,   parcel: 149.83 },
    { upTo: 2119,     rate: 0.2177,   parcel: 238.97 },
    { upTo: 2499,     rate: 0.2443,   parcel: 295.34 },
    { upTo: 3305,     rate: 0.2685,   parcel: 355.82 },
    { upTo: 5547,     rate: 0.2779,   parcel: 386.89 },
    { upTo: 20221,    rate: 0.3146,   parcel: 590.47 },
    { upTo: Infinity, rate: 0.3302,   parcel: 905.92 },
  ],

  // ─── Table III — Casado, único titular ──────────────────────────────────
  tableIII: [
    { upTo: 1226,     rate: 0,        parcel: 0 },
    { upTo: 1267,     rate: 0.0728,   parcel: 89.26 },
    { upTo: 1602,     rate: 0.0964,   parcel: 119.17 },
    { upTo: 1962,     rate: 0.1099,   parcel: 140.80 },
    { upTo: 2240,     rate: 0.1357,   parcel: 191.42 },
    { upTo: 2900,     rate: 0.1594,   parcel: 244.51 },
    { upTo: 3389,     rate: 0.1799,   parcel: 303.96 },
    { upTo: 5965,     rate: 0.2017,   parcel: 377.85 },
    { upTo: 20265,    rate: 0.2710,   parcel: 791.23 },
    { upTo: Infinity, rate: 0.3302,   parcel: 1990.92 },
  ],

  // ─── Table IV — Não casado / Casado dois titulares sem dependentes — Deficiência ──
  tableIV: [
    { upTo: 2119,     rate: 0,        parcel: 0 },
    { upTo: 2492,     rate: 0.2177,   parcel: 464.51 },
    { upTo: 2748,     rate: 0.2443,   parcel: 530.80 },
    { upTo: 3012,     rate: 0.2685,   parcel: 597.31 },
    { upTo: 4883,     rate: 0.2779,   parcel: 625.63 },
    { upTo: 20468,    rate: 0.3102,   parcel: 783.36 },
    { upTo: Infinity, rate: 0.3255,   parcel: 1096.53 },
  ],

  // ─── Table V — Não casado com 1+ dependentes — Deficiência ──────────────
  tableV: [
    { upTo: 2339,     rate: 0,        parcel: 0,      depParcel: 42.86 },
    { upTo: 2488,     rate: 0.2177,   parcel: 511.64, depParcel: 42.86 },
    { upTo: 3479,     rate: 0.2443,   parcel: 577.83, depParcel: 42.86 },
    { upTo: 3728,     rate: 0.2685,   parcel: 662.03, depParcel: 42.86 },
    { upTo: 6687,     rate: 0.2779,   parcel: 697.08, depParcel: 42.86 },
    { upTo: 20468,    rate: 0.3102,   parcel: 913.08, depParcel: 42.86 },
    { upTo: Infinity, rate: 0.3255,   parcel: 1226.25, depParcel: 42.86 },
  ],

  // ─── Table VI — Casado dois titulares com 1+ dependentes — Deficiência ──
  tableVI: [
    { upTo: 2143,     rate: 0,        parcel: 0,      depParcel: 21.43 },
    { upTo: 2790,     rate: 0.1687,   parcel: 363.67, depParcel: 21.43 },
    { upTo: 3215,     rate: 0.2177,   parcel: 500.38, depParcel: 21.43 },
    { upTo: 3479,     rate: 0.2443,   parcel: 585.90, depParcel: 21.43 },
    { upTo: 5915,     rate: 0.2685,   parcel: 670.10, depParcel: 21.43 },
    { upTo: 6687,     rate: 0.2779,   parcel: 725.71, depParcel: 21.43 },
    { upTo: 20468,    rate: 0.3102,   parcel: 941.71, depParcel: 21.43 },
    { upTo: Infinity, rate: 0.3255,   parcel: 1254.88, depParcel: 21.43 },
  ],

  // ─── Table VII — Casado único titular — Deficiência ─────────────────────
  tableVII: [
    { upTo: 2897,     rate: 0,        parcel: 0,      depParcel: 42.86 },
    { upTo: 4503,     rate: 0.1594,   parcel: 461.79, depParcel: 42.86 },
    { upTo: 6818,     rate: 0.1799,   parcel: 554.11, depParcel: 42.86 },
    { upTo: 6916,     rate: 0.2017,   parcel: 702.75, depParcel: 42.86 },
    { upTo: 20468,    rate: 0.2926,   parcel: 1331.42, depParcel: 42.86 },
    { upTo: Infinity, rate: 0.3255,   parcel: 2004.82, depParcel: 42.86 },
  ],
};
