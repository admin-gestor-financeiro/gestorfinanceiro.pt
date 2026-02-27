# Decision: Calculadora de Crédito Habitação (Mortgage Calculator)

## Research

[Research](../research/mortgage-calculator-research.md)

---

## Context

The Portuguese mortgage calculator market is fragmented. No single tool integrates upfront cost calculation (IMT, stamp duty, fees), amortization scheduling, Euribor stress testing, affordability assessment, and insurance modeling in one flow. We will build a best-in-class integrated calculator for gestorfinanceiro.pt without pulling live bank data — users input rates manually.

---

## What we decided

### Feature scope (phased)

**Phase 1 — MVP (to build now)**

| Feature | Decision |
|---|---|
| French amortization (prestação constante) | ✅ Core calculation engine |
| Monthly payment breakdown (capital + interest) | ✅ |
| TAN display | ✅ |
| Amortization schedule (monthly table, collapsible) | ✅ |
| Upfront costs: IMT + stamp duty on purchase + stamp duty on mortgage | ✅ Highest-impact differentiator |
| IMT Jovem exemption (≤35, first primary residence) | ✅ Included per regulatory requirement |
| Registration/notary/bank fees (fixed estimates) | ✅ With visible disclaimer |
| Taxa de esforço / DSTI display | ✅ Traffic-light indicator |
| Euribor stress test table (+1pp / +2pp / +3pp scenarios) | ✅ |
| Rate type: Variable only (Euribor + spread) | ✅ Simplest first |

**Phase 2 — deferred (not in this build)**

| Feature | Reason deferred |
|---|---|
| TAEG calculation | Requires iterative Newton-Raphson, insurance cost inputs — adds complexity; add in Phase 2 |
| Fixed-rate and mixed-rate modes | Can add after variable works well |
| Early repayment simulation | Significant extra UI; Phase 2 |
| Insurance cost comparison (bank vs. external) | No data, user would need to input manually |
| Side-by-side rate type comparison | Phase 2 |
| Reverse calculator ("what can I afford?") | Phase 2 |
| PDF export | Phase 2 |
| Rent vs. buy | Phase 3 |

---

## Inputs (user-provided — no live bank data)

| Input | Type | Default | Notes |
|---|---|---|---|
| Purchase price (€) | Number | — | Required |
| Loan amount (€) or LTV % | Number | 90% LTV | Toggle between amount or % |
| Loan term (years) | Slider/number | 30 | 5–40 |
| Euribor reference | Select | 12 months | 3 / 6 / 12 months |
| Euribor rate (%) | Number (auto-fill) | Current rate (~2.25% for 12M) | Pre-filled with current value, editable |
| Spread (%) | Number | 1.00% | User types their spread |
| Property location | Select | Continental Portugal | Continental / Madeira / Açores |
| Property purpose | Select | Habitação própria permanente | HPP / Habitação secundária / Investimento |
| Borrower age | Number | — | Determines max term + IMT Jovem eligibility |
| First-time buyer ≤35? | Toggle | No | Triggers IMT Jovem exemption |
| Net monthly income (€) | Number | — | For taxa de esforço (optional section) |
| Existing monthly debt (€) | Number | 0 | For taxa de esforço |

---

## Outputs

### Above the fold
- Monthly payment (M) — prominent headline
- Breakdown: capital vs. interest (for month 1)
- TAN = Euribor + spread
- Taxa de esforço — traffic-light badge (green ≤35%, amber 36–50%, red >50%)
- Total cash needed upfront (deposit + all transaction costs)

### Upfront costs panel
| Cost | Formula |
|---|---|
| IMT | Progressive brackets (see formulas below) |
| Stamp duty — purchase | Purchase price × 0.8% |
| Stamp duty — mortgage | Loan amount × 0.6% |
| Registration/notary | Fixed estimate €700–€1,000 (show as range) |
| Bank valuation | Fixed estimate €230–€286 (show as range) |
| Bank processing fee | Fixed estimate €200–€725 (show as range) |
| **Total upfront** | Sum of above |

### Stress test table (variable-rate only)
| Scenario | Monthly payment | Taxa de esforço |
|---|---|---|
| Current Euribor | M | x% |
| +1pp | M+1 | x% |
| +2pp | M+2 | x% |
| +3pp | M+3 | x% |

### Amortization schedule
- Annual summary rows by default, expandable to monthly
- Columns: Year, Payment, Principal, Interest, Balance
- Graph: principal vs. interest area chart over time

---

## Calculation engine

### TAN
```
TAN = Euribor_selected + Spread
r = TAN / 12  (monthly rate)
```

### Monthly payment (French amortization)
```
M = P × [r × (1+r)^n] / [(1+r)^n − 1]
P = loan amount, n = term in months
```

### Balance at period k
```
B_k = P × [(1+r)^n − (1+r)^k] / [(1+r)^n − 1]
```

### IMT — continental Portugal, primary residence (2025 brackets)
| Bracket (€) | Rate | Abatement (€) |
|---|---|---|
| ≤ 104,261 | 0% | — |
| 104,261–142,618 | 2% | 2,085.22 |
| 142,618–194,458 | 5% | 6,363.76 |
| 194,458–324,058 | 7% | 10,252.92 |
| 324,058–648,022 | 8% | 13,493.50 |
| 648,022–1,128,287 | 6% flat | 0 |
| > 1,128,287 | 7.5% flat | 0 |

**IMT Jovem**: full exemption up to €324,058 (2025); partial above that up to €648,022.
**Secondary/investment**: first bracket taxed at 1% (not exempt); different abatement values.
**Madeira/Açores**: thresholds ~25% higher than continental.

```
IMT = max(purchase_price, VPT) × rate − abatement
// VPT is unknown at calculator time → use purchase_price, with user note
```

### Stamp duty
```
IS_compra  = purchase_price × 0.008
IS_hipoteca = loan_amount × 0.006
```

### Taxa de esforço (DSTI)
```
DSTI = (monthly_mortgage + existing_debt) / net_income × 100
// Stress-test DSTI uses M calculated at (Euribor + spread + 1.5pp)
```

---

## Static data to maintain

| Data | Update frequency | Source |
|---|---|---|
| Euribor default values | Weekly (manual or future cron) | euribor-rates.eu / ECB |
| IMT brackets | Annually (January, State Budget) | AT / OE |
| Stamp duty rates | On legislative change (rare) | Tax law |
| Registration/notary fee estimates | Annually | Market benchmark |

---

## URL structure

| Language | Path |
|---|---|
| Portuguese | `/calculadoras/credito-habitacao` |
| English | `/en/calculators/mortgage-calculator` |

---

## Architecture notes

- Pure client-side computation (`"use client"` component) — no API route needed for basic calculation
- All static reference data (IMT brackets, Euribor defaults) stored in `lib/calculators/mortgage-data.ts`
- Calculation logic in `lib/calculators/mortgage.ts` (unit-testable, framework-agnostic)
- Page components under `app/(calculators)/calculadoras/credito-habitacao/`
- English page at `app/(calculators)/en/calculators/mortgage-calculator/`

---

## Resolved decisions

| Question | Decision |
|---|---|
| Euribor data | Fetch from public API on page load; hardcoded fallback values if API fails |
| Fee display | Show midpoint estimates with user-editable override fields |
| VPT field | Optional advanced field (collapsed by default); use purchase price when not provided |
| Phase 1 scope | Core MVP as defined above |
