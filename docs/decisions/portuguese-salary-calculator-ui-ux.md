# Decision: Portuguese Salary Calculator UI/UX

**Date:** 2026-02-26  
**Status:** Accepted  
**Research:** [Research](../research/portuguese-salary-calculator-ui-ux.md)

---

## Summary

Based on a competitive analysis of ten Portuguese net salary calculators, this document defines the design and feature decisions for the salary calculator at gestorfinanceiro.pt. The goal is to combine the best elements from competitors while filling the gaps none of them address.

---

## Input Fields

### Core inputs (always visible)

These 12 inputs are always shown — they cover 90%+ of real user scenarios:

| # | Field | Type | Notes |
|---|---|---|---|
| 1 | Salário bruto mensal | Number (€) | Format with thousands separator |
| 2 | Região fiscal | Dropdown | Continente (default), Açores, Madeira |
| 3 | Situação fiscal | Dropdown | Não casado (default), Casado 2 titulares, Casado 1 titular |
| 4 | Número de dependentes | Stepper 0–10 | Default 0 |
| 5 | Incapacidade ≥60% | Toggle | Default off; tooltip explaining threshold |
| 6 | Dependentes com incapacidade | Stepper | Conditional: visible when dependents > 0 |
| 7 | IRS Jovem | Dropdown | Não aplicável (default), 1º ano, 2º–4º ano, 5º–7º ano, 8º–10º ano |
| 8 | Subsídio de alimentação — tipo | Dropdown | Não tenho (default), Cartão ou vales, Dinheiro |
| 9 | Subsídio de alimentação — valor diário | Number (€) | Conditional on type; show exempt limits inline (€6.15 cash / €10.46 card) |
| 10 | Subsídio de alimentação — dias por mês | Number | Conditional on type; default 22 |
| 11 | Subsídios em duodécimos | Dropdown | 5 options covering common arrangements |
| 12 | Ano fiscal | Dropdown | Default current year; sub-period where applicable |

### Advanced inputs (behind "Mostrar opções avançadas" toggle)

| # | Field | Type | Notes |
|---|---|---|---|
| 13 | Taxa de Segurança Social | Number % | Default 11%, editable |
| 14 | Beneficiário ADSE | Toggle | Default off; tooltip for public sector |
| 15 | Isenção de horário | Toggle + % | Default off |
| 16 | Outros rendimentos sujeitos a IRS e SS | Number (€) | |
| 17 | Outros rendimentos sujeitos apenas a IRS | Number (€) | |
| 18 | Outros rendimentos isentos | Number (€) | |
| 19 | Remuneração suplementar | Number (€) | |
| 20 | Baixa médica | Number (€) + days | Innovative: borrowed from Bora Falar de Guito |
| 21 | Taxa de retenção voluntária superior | Number % | Optional override |
| 22 | Dedução adicional ao líquido | Number (€) | Union dues, garnishments, etc. |

---

## Output Fields

### Headline
- **Salário líquido mensal** — large, prominent; animate value on recalculation

### Payslip-style breakdown
Modelled after Literacia Financeira's approach — mirrors the real document workers receive:

```
Rendimento bruto tributável              €X,XXX.XX
Remuneração suplementar (if any)         €XXX.XX
Duodécimos (if any)                      €XXX.XX
Subsídio de alimentação                  €XXX.XX
Outros rendimentos (if any)              €XXX.XX
─────────────────────────────────────────────────
Total bruto                              €X,XXX.XX
Retenção IRS                            –€XXX.XX (XX%)
Segurança Social                        –€XXX.XX (11%)
ADSE (if applicable)                    –€XXX.XX (3.5%)
Outras deduções (if any)                –€XXX.XX
─────────────────────────────────────────────────
Salário líquido                          €X,XXX.XX
```

### Additional outputs
- Custo total empresa (employer cost: gross + 23.75% TSU)
- Taxa de retenção na fonte (%)
- Annual gross and net totals
- Time toggle: Monthly / Annual (MVP); Weekly / Daily / Hourly (v2)

### Visualization
- **Horizontal stacked bar or Sankey diagram** showing the flow from gross to net through each deduction category
- This is the single biggest visual gap in the competitive landscape — only 2 of 10 competitors include any chart, none use Sankey

---

## Layout and Interaction

### Desktop
- **Side-by-side layout**: inputs in left column, sticky results panel on right (Coverflex / Literacia Financeira pattern)
- Results update in real-time as any input changes

### Mobile
- Inputs stacked top; results below
- **Floating bottom bar** always showing current net salary — expands to full results sheet on tap
- Keeps the key number visible while scrolling inputs

### Calculation trigger
- **Real-time, no submit button** — industry standard (7/10 competitors do this)
- Subtle counter animation on changed output values

### Progressive disclosure
- Core inputs always visible
- Advanced section expandable with smooth animation
- Conditional fields (meal allowance sub-fields, ADSE, disability dependents) appear with animation when triggered

### Help system
- **Inline ⓘ tooltips** on every non-obvious field (Coverflex pattern)
- **FAQ accordion** below the calculator (Doutor Finanças pattern)
- **"Como é calculado"** expandable section showing the actual formula with legal references (Santander pattern)

---

## Differentiating Features

These features address gaps that no competitor currently fills well:

### 1. Scenario comparison mode (high priority)
- "Comparar cenários" button duplicates the calculator side-by-side (desktop) or as tabs (mobile)
- Use cases: current salary vs. job offer, single vs. married, cash vs. card meal allowance
- Only ComparaJá offers anything similar, and it's limited

### 2. Shareable simulation URLs (high priority)
- Encode all parameters in the URL as query string or hash
- Users can bookmark or share their exact simulation
- Add Open Graph meta tags so shared links show a preview card with the net salary

### 3. Local storage persistence (high priority)
- Auto-save last simulation in `localStorage`
- Returning visitors see their previous inputs immediately
- No account required
- **Note:** localStorage is not available in artifacts but is valid in the actual Next.js app

### 4. Salary evolution timeline (medium priority)
- Line chart showing how the same gross would have netted differently across 2023–2026 withholding tables
- High editorial value during tax table change periods; strong SEO signal

### 5. "Quanto ganha realmente" annual view (medium priority)
- Complete annual compensation map: 14 months of salary (or 12 + bonuses), meal allowance total, true annual net
- Accounts for meal allowance only being paid 11 months and subsidy withholding differences

### 6. Independent worker mode (future)
- Architecture must accommodate a "Recibos verdes" mode from day one even if it ships later
- Inputs needed: CAE category, simplified vs. organized accounting, quarterly SS, IRS at source (25% base)

---

## Component Architecture Notes

These are implications for how we build the calculator in the Next.js / Cloudflare stack:

- **Calculator UI**: `"use client"` component — all inputs, state, and real-time calculation run client-side. No API call needed for the basic calculation.
- **Calculation logic**: pure TypeScript functions in `lib/calculators/salary.ts` — no browser dependencies, easily unit-testable
- **URL state**: use `nuqs` or manual `URLSearchParams` to sync inputs to the URL for shareable links
- **localStorage**: use a custom hook `useLocalStoragePersistence` that reads/writes the full input state on change
- **Visualization**: evaluate `recharts` (already available in the stack) for the bar chart; Sankey may need a lighter custom SVG implementation to stay within the 10 MiB bundle limit
- **Scenario comparison**: render two instances of the calculator component with independent state; consider a `useReducer` approach for each scenario
- **Rendering strategy**: page is SSG (static) — calculator is pure client-side; no D1 or R2 needed for MVP

---

## What We Are NOT Doing (and Why)

| Rejected idea | Reason |
|---|---|
| Multi-step wizard layout | Adds friction for repeat users; better for onboarding flows, not a power tool |
| Account-based saving | Over-engineered for MVP; localStorage covers 90% of the use case |
| Coverflex-style product marketing integration | We don't have a benefits product to promote |
| Requiring a "Calcular" button | Industry has moved to real-time; button is friction |
| Showing only 4 output lines (DataLABOR approach) | Insufficient for users trying to understand their payslip |

---

## Conclusion

The winning formula for gestorfinanceiro.pt is:

> **Real-time side-by-side layout + progressive disclosure inputs + payslip-style output + Sankey/bar visualization + scenario comparison + shareable URLs + localStorage persistence**

No competitor currently combines all of these. Coverflex leads on polish, Literacia Financeira on output depth, Bora Falar de Guito on input completeness, ComparaJá on comparison. We target the intersection of all four.
