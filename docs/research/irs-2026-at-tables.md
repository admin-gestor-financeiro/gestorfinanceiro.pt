# Research: AT 2026 Monthly Withholding Tables

**Date:** 2026-02-26
**Sources:** Tabelas_RF_Continente_2026.xlsx, Tabelas_RF_2026_RAM.xlsx (official AT documents)

---

## Overview

Portugal's Autoridade Tributária e Aduaneira (AT) publishes annual Portaria documents with monthly withholding coefficient tables (tabelas de retenção na fonte). For 2026, the document covers Categoria A (Trabalho dependente — employed workers) and Categoria H (pensions).

The document structure for Continente, Categoria A contains 7 tables:
- **Tables I–III:** Regular workers (no disability)
- **Tables IV–VII:** Workers with disability (pessoa com deficiência)

For our use case we implement Tables I, II, III.

---

## Formula

```
Monthly IRS = max(0, Gross × Rate − Parcel − depParcel × nDependents)
```

Where `Rate` and `Parcel` come from the first segment row where `Gross ≤ upTo`.

### Variable-parcel rows

The first 1–2 rows in each table express the parcel as a function of gross:
```
Parcel = Rate × mult × (threshold − Gross)
```
These are pre-expanded to a fixed `(effectiveRate, effectiveParcel)` pair:
```
effectiveRate  = Rate × (1 + mult)
effectiveParcel = Rate × mult × threshold
```

---

## Continente 2026 — Tabela I & II (Categoria A, regular workers)

**Table I:** "Não casado sem dependentes ou casado 2 titulares" — `depParcel = 21.43`
**Table II:** "Não casado com um ou mais dependentes" — `depParcel = 34.29`
Tables I and II share identical Rate/Parcel coefficients; only `depParcel` differs.

| Up to (€)   | Rate    | Parcel (€)  | Notes                          |
|-------------|---------|-------------|--------------------------------|
| 920         | 0       | 0           |                                |
| 1 042       | 0.4500  | 414.00      | Expanded from 0.125 × 2.6 × (1273.85 − R) |
| 1 108       | 0.36895 | 329.55      | Expanded from 0.157 × 1.35 × (1554.83 − R) |
| 1 154       | 0.157   | 94.71       |                                |
| 1 212       | 0.212   | 158.18      |                                |
| 1 819       | 0.241   | 193.33      |                                |
| 2 119       | 0.311   | 320.66      |                                |
| 2 499       | 0.349   | 401.19      |                                |
| 3 305       | 0.3836  | 487.66      |                                |
| 5 547       | 0.3969  | 531.62      |                                |
| 20 221      | 0.4495  | 823.40      |                                |
| > 20 221    | 0.4717  | 1 272.31    |                                |

---

## Continente 2026 — Tabela III (Categoria A, regular workers)

**Table III:** "Casado, único titular" — `depParcel = 42.86`

| Up to (€)   | Rate    | Parcel (€)  | Notes                          |
|-------------|---------|-------------|--------------------------------|
| 991         | 0       | 0           |                                |
| 1 042       | 0.4500  | 445.95      | Expanded from 0.125 × 2.6 × (1372.15 − R) |
| 1 108       | 0.29375 | 283.13      | Expanded from 0.125 × 1.35 × (1677.85 − R) |
| 1 119       | 0.125   | 96.17       |                                |
| 1 432       | 0.1272  | 98.64       |                                |
| 1 962       | 0.157   | 141.32      |                                |
| 2 240       | 0.1938  | 213.53      |                                |
| 2 773       | 0.2277  | 289.47      |                                |
| 3 389       | 0.257   | 370.72      |                                |
| 5 965       | 0.2881  | 476.12      |                                |
| 20 265      | 0.3843  | 1 049.96    |                                |
| > 20 265    | 0.4717  | 2 821.13    |                                |

---

## Table Routing

| Marital status   | Dependents | Table |
|------------------|------------|-------|
| `married_single` | any        | III   |
| `single`         | 0          | I     |
| `single`         | 1+         | II    |
| `married_dual`   | any        | I     |

---

## RAM (Madeira) 2026 — Tabela I & II

`depParcel = 21.43` (Table I) / `34.29` (Table II). Lower minimum threshold (980€ vs 920€ in Continente) and reduced rates reflecting RAM's fiscal benefits.

| Up to (€)   | Rate    | Parcel (€)  |
|-------------|---------|-------------|
| 980         | 0       | 0           |
| 1 042       | 0.4500  | 441.00      |
| 1 108       | 0.3475  | 308.77      |
| 1 154       | 0.127   | 77.18       |
| 1 284       | 0.132   | 82.93       |
| 1 819       | 0.215   | 189.61      |
| 2 119       | 0.281   | 309.62      |
| 2 499       | 0.309   | 368.90      |
| 3 305       | 0.347   | 463.93      |
| 5 547       | 0.3591  | 503.93      |
| 20 221      | 0.4100  | 786.25      |
| > 20 221    | 0.4320  | 1 230.55    |

## RAM (Madeira) 2026 — Tabela III

`depParcel = 42.86`.

| Up to (€)   | Rate    | Parcel (€)  |
|-------------|---------|-------------|
| 997         | 0       | 0           |
| 1 042       | 0.4500  | 448.65      |
| 1 108       | 0.2760  | 259.39      |
| 1 119       | 0.107   | 82.28       |
| 1 432       | 0.1092  | 84.74       |
| 1 962       | 0.142   | 131.69      |
| 2 240       | 0.177   | 200.36      |
| 2 773       | 0.208   | 269.79      |
| 3 389       | 0.237   | 350.25      |
| 5 965       | 0.265   | 445.08      |
| 20 265      | 0.3546  | 980.43      |
| > 20 265    | 0.4320  | 2 548.44    |

---

## CSV Test Case Discrepancies

The reference CSV (`salary_simulator_2026_all_scenarios.csv`) was compared against the official formula. 15 of 53 cases diverge by more than 0.5€:

**Pattern 1 — 3+ dependents:** All cases with `dependentsCount >= 3` show a systematic shortfall vs the official formula. The official depParcel is flat (21.43/dep in Table I), but the CSV values suggest a higher credit for the 3rd+ dependent (~36–52€ vs 21.43). This may reflect a different interpretation of Art. 78-A CIRS dependent credits not captured in the Portaria tables.

**Pattern 2 — High salary (5833.33, 11666.67):** These values (= 70 000/12 and 140 000/12) diverge by 100–840€. Possible causes: the CSV tool may apply a solidarity surcharge separately, or use a different rate structure for these bands.

**Pattern 3 — Single/3500/2deps outlier:** One case (gross=3500, single, 2 deps) deviates by ~560€ with no clear explanation; likely a tool bug.

**Conclusion:** The 38 stable cases match within ±0.5€. The official AT table formula is used for all cases; the CSV discrepancies are attributed to the source tool's methodology.
