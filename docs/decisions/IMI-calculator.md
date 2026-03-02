# IMI Calculator — Decision Record

## Research
[Research](../research/IMI-research.md)

---

## Decision summary

Build a **comprehensive IMI calculator** in two sequential implementation tasks:

- **Task 1 — Core engine**: Basic IMI calculation, AIMI, exemption eligibility checker, payment schedule
- **Task 2 — Advanced features**: VPT reassessment simulator, multi-property portfolio support

---

## What we decided

### Scope (Task 1)
- IMI = VPT × municipal rate − IMI Familiar deduction
- All 308 municipalities with their 2026 rates and IMI Familiar participation status, stored as a typed TypeScript constant in `lib/data/imi-municipalities.ts`
- AIMI for individuals/couples/companies (thresholds unchanged since 2017)
- Exemption eligibility screening: permanent (Art. 11-A CIMI) and temporary (Art. 46 EBF)
- Payment schedule with exact 2026 deadlines (May 31 / Aug 31 / Nov 30)
- Devoluto surcharge (3× standard, 6× in urban pressure zones)

### Scope (Task 2)
- VPT reassessment simulator: user enters caderneta predial data → recalculate VPT using 2026 Vc (€712.50) → compare with current VPT → recommend reassessment or warn of increase
- Multi-property portfolio: up to 10 properties, aggregate IMI + AIMI

### Municipality data storage
Hardcoded in `lib/data/imi-municipalities.ts` as a typed array — zero runtime cost, suitable for a static calculator. Annual update needed each December/January when Portal das Finanças publishes new rates.

### Routing
| Page | URL |
|---|---|
| Portuguese | `/calculadoras/simulador-imi-2026` |
| English | `/en/calculators/imi-calculator` |

Slug `simulador-imi-2026` differentiates from any potential future `/simulador-imt` conflicts and is more SEO-relevant (year in slug).

### UI structure
Single-page progressive disclosure:
1. **Core section** (always visible): VPT, distrito → município cascade, property type, property purpose, dependents
2. **Exemption checker** (collapsible): household income, total family VPT, acquisition year
3. **AIMI** (collapsible, shown when VPT ≥ €600k or user opens it manually): total residential VPT, filing status
4. **VPT Reassessment** (collapsible, Task 2): caderneta predial coefficient inputs
5. **Multi-property portfolio** (tab, Task 2): add up to 10 properties

Results column shows primary IMI, payment schedule, conditional AIMI, conditional exemption assessment.

---

## Why this approach

**Hardcoded municipality data over D1**: The calculator is entirely client-side. A D1 round-trip would add latency for no benefit since rates change once a year and are managed by developers, not admins.

**Full comprehensive over phased-lite**: Research shows no competitor offers the full stack. The VPT reassessment angle (1.1M DECO users, MaisTax model) and AIMI gap are the strongest differentiators. Splitting into 2 tasks preserves context window limits while still shipping the complete product.

**Progressive disclosure UX over tabs**: Exemptions and AIMI are relevant to a minority of users. Collapsible sections avoid cluttering the primary flow while keeping all features accessible on one URL (no navigation required, better for SEO).

**`simulador-imi-2026` slug**: Avoids collision with the existing `simulador-imt` (IMT tax calculator), is distinct in search results, and the year suffix is a known SEO pattern for Portuguese tax calculators (competitors use "IMI 2026" in titles).

---

## Data sources used
- Portal das Finanças — municipal rate lookup and VPT formula (Art. 38 CIMI)
- Portaria 471/2025/1 — Vc = €712.50 for 2026
- Aviso n.º 18/2026/2 — juros de mora 7.221% for 2026
- Lei n.º 73-A/2025 (OE 2026) — IAS = €537.13, exemption thresholds
- APFN apfn.com.pt/IMI2026.php — IMI Familiar municipality adherence list
- Arts. 135-A to 135-M CIMI — AIMI rates and thresholds (unchanged since 2017)
- Art. 46 EBF — temporary exemption conditions
- Art. 11-A CIMI — permanent exemption conditions
