/**
 * IRS Withholding Tables — Região Autónoma da Madeira — 2026
 *
 * Source: Declaração de Retificação n.º 10/2026 (corrects Despacho n.º 19/2026)
 * Published: JORAM II Série, n.º 16, 3.º Suplemento, 2026-01-23
 * Effective: 1 January 2026
 *
 * This file uses the authoritative corrected tables (pages 4–8 of the Retificação).
 * Tables I, II and IX were specifically corrected from the original Despacho n.º 19/2026.
 *
 * Formula (Tables I–III regular, Tables IV–VII disability):
 *   Withholding = max(0, R × rate − parcel − depParcel × nDeps)
 *
 * Variable-parcel rows are pre-expanded to fixed (rate, parcel) form.
 */

import type { WithholdingRegionTables } from "./withholding-tables.types";

export const MADEIRA_2026: WithholdingRegionTables = {
  region: "madeira",
  year: 2026,
  incomeType: "work",

  depParcel: {
    I:   21.43,
    II:  34.29,
    III: 42.86,
  },

  // ─── Table I — Não casado sem dependentes / Casado dois titulares ────────
  // Note: corrected by Declaração de Retificação n.º 10/2026
  tableI: [
    { upTo: 980,      rate: 0,        parcel: 0 },
    // Variable rows expanded: rate_outer=0.0872, mult=2.60, threshold=1356.92
    // → fixedRate = 0.0872×3.60 = 0.31392; fixedParcel = 0.0872×2.60×1356.92 = 307.58
    { upTo: 1028,     rate: 0.31392,  parcel: 307.58 },
    // Variable rows expanded: rate_outer=0.1204, mult=1.35, threshold=1696.78
    // → fixedRate = 0.1204×2.35 = 0.28294; fixedParcel = 0.1204×1.35×1696.78 = 275.77
    { upTo: 1099,     rate: 0.28294,  parcel: 275.77 },
    { upTo: 1201,     rate: 0.1204,   parcel: 97.17 },
    { upTo: 1623,     rate: 0.1763,   parcel: 164.31 },
    { upTo: 2332,     rate: 0.2230,   parcel: 240.11 },
    { upTo: 3203,     rate: 0.2242,   parcel: 242.91 },
    { upTo: 3614,     rate: 0.2727,   parcel: 398.26 },
    { upTo: 6585,     rate: 0.2778,   parcel: 416.70 },
    { upTo: 6954,     rate: 0.2802,   parcel: 432.51 },
    { upTo: 21411,    rate: 0.2924,   parcel: 517.35 },
    { upTo: Infinity, rate: 0.3278,   parcel: 1275.30 },
  ],

  // ─── Table II — Não casado com um ou mais dependentes ───────────────────
  // Note: corrected by Declaração de Retificação n.º 10/2026
  // Identical brackets/rates to Table I; depParcel = 34.29
  tableII: [
    { upTo: 980,      rate: 0,        parcel: 0 },
    { upTo: 1028,     rate: 0.31392,  parcel: 307.58 },
    { upTo: 1099,     rate: 0.28294,  parcel: 275.77 },
    { upTo: 1201,     rate: 0.1204,   parcel: 97.17 },
    { upTo: 1623,     rate: 0.1763,   parcel: 164.31 },
    { upTo: 2332,     rate: 0.2230,   parcel: 240.11 },
    { upTo: 3203,     rate: 0.2242,   parcel: 242.91 },
    { upTo: 3614,     rate: 0.2727,   parcel: 398.26 },
    { upTo: 6585,     rate: 0.2778,   parcel: 416.70 },
    { upTo: 6954,     rate: 0.2802,   parcel: 432.51 },
    { upTo: 21411,    rate: 0.2924,   parcel: 517.35 },
    { upTo: Infinity, rate: 0.3278,   parcel: 1275.30 },
  ],

  // ─── Table III — Casado, único titular ──────────────────────────────────
  tableIII: [
    { upTo: 997,      rate: 0,        parcel: 0 },
    // Variable rows expanded: rate_outer=0.0872, mult=1.35, threshold=1819.64
    // → fixedRate = 0.0872×2.35 = 0.20492; fixedParcel = 0.0872×1.35×1819.64 = 214.28
    { upTo: 1099,     rate: 0.20492,  parcel: 214.28 },
    { upTo: 1141,     rate: 0.0872,   parcel: 84.84 },
    { upTo: 1857,     rate: 0.1033,   parcel: 103.22 },
    { upTo: 2485,     rate: 0.1091,   parcel: 114.00 },
    { upTo: 3331,     rate: 0.1236,   parcel: 150.04 },
    { upTo: 3895,     rate: 0.1404,   parcel: 206.01 },
    { upTo: 6673,     rate: 0.1595,   parcel: 280.41 },
    { upTo: 6878,     rate: 0.2213,   parcel: 692.81 },
    { upTo: 21411,    rate: 0.2493,   parcel: 885.40 },
    { upTo: Infinity, rate: 0.3278,   parcel: 2566.17 },
  ],

  // ─── Table IV — Não casado / Casado dois titulares sem dependentes — Deficiência ──
  tableIV: [
    { upTo: 2053,     rate: 0,        parcel: 0 },
    { upTo: 2591,     rate: 0.1490,   parcel: 305.90 },
    { upTo: 3622,     rate: 0.1863,   parcel: 402.55 },
    { upTo: 4668,     rate: 0.2289,   parcel: 556.85 },
    { upTo: 7066,     rate: 0.2616,   parcel: 709.50 },
    { upTo: 7168,     rate: 0.2752,   parcel: 805.60 },
    { upTo: 21625,    rate: 0.3058,   parcel: 1024.95 },
    { upTo: Infinity, rate: 0.3278,   parcel: 1500.70 },
  ],

  // ─── Table V — Não casado com 1+ dependentes — Deficiência ──────────────
  tableV: [
    { upTo: 2345,     rate: 0,        parcel: 0,      depParcel: 42.86 },
    { upTo: 2591,     rate: 0.1382,   parcel: 324.08, depParcel: 42.86 },
    { upTo: 3622,     rate: 0.1863,   parcel: 448.71, depParcel: 42.86 },
    { upTo: 4668,     rate: 0.2289,   parcel: 603.01, depParcel: 42.86 },
    { upTo: 7066,     rate: 0.2616,   parcel: 755.66, depParcel: 42.86 },
    { upTo: 7168,     rate: 0.2752,   parcel: 851.76, depParcel: 42.86 },
    { upTo: 21625,    rate: 0.3058,   parcel: 1071.11, depParcel: 42.86 },
    { upTo: Infinity, rate: 0.3278,   parcel: 1546.86, depParcel: 42.86 },
  ],

  // ─── Table VI — Casado dois titulares com 1+ dependentes — Deficiência ──
  tableVI: [
    { upTo: 2019,     rate: 0,        parcel: 0,      depParcel: 21.43 },
    { upTo: 2528,     rate: 0.1566,   parcel: 316.18, depParcel: 21.43 },
    { upTo: 3049,     rate: 0.1768,   parcel: 367.25, depParcel: 21.43 },
    { upTo: 4272,     rate: 0.1781,   parcel: 371.22, depParcel: 21.43 },
    { upTo: 5734,     rate: 0.2280,   parcel: 584.40, depParcel: 21.43 },
    { upTo: 7066,     rate: 0.2595,   parcel: 765.03, depParcel: 21.43 },
    { upTo: 7550,     rate: 0.2752,   parcel: 875.97, depParcel: 21.43 },
    { upTo: 21625,    rate: 0.3058,   parcel: 1107.00, depParcel: 21.43 },
    { upTo: Infinity, rate: 0.3278,   parcel: 1582.75, depParcel: 21.43 },
  ],

  // ─── Table VII — Casado único titular — Deficiência ─────────────────────
  tableVII: [
    { upTo: 3061,     rate: 0,        parcel: 0,      depParcel: 42.86 },
    { upTo: 4668,     rate: 0.0883,   parcel: 270.29, depParcel: 42.86 },
    { upTo: 7066,     rate: 0.1334,   parcel: 480.82, depParcel: 42.86 },
    { upTo: 7168,     rate: 0.2503,   parcel: 1306.84, depParcel: 42.86 },
    { upTo: 21625,    rate: 0.2810,   parcel: 1526.90, depParcel: 42.86 },
    { upTo: Infinity, rate: 0.3278,   parcel: 2538.95, depParcel: 42.86 },
  ],
};
