# Decision: IRS 2026 — Adopt AT Monthly Withholding Tables

**Date:** 2026-02-26
**Status:** Implemented

## Research

[Research notes](../research/irs-2026-at-tables.md)

---

## Problem

The original `net-salary.ts` used an annual bracket approach (Art. 68.º CIRS):
1. Multiply monthly gross by 12 to get annual equivalent
2. Subtract specific deduction (annual SS or 4 228€ floor)
3. Apply annual CIRS brackets
4. Divide result by 12 for monthly IRS

This methodology systematically diverged from AT's published monthly withholding tables because:
- AT pre-computes segment-specific `(Rate, Parcel)` pairs that produce a flat-line monthly value within each salary band
- The annual equivalent approach creates a different curve that does not match AT's output for most salary levels
- AT tables also have a zero-withholding threshold (e.g. ≤ 920€/month) that the bracket approach didn't implement

---

## Decision

**Use AT's official monthly coefficient tables for 2026.**

### Why

- Officially published by AT in Portaria 2026 — legally authoritative
- Verified against 38 stable CSV reference cases (all within ±0.5€)
- Simpler runtime formula: one segment lookup + arithmetic
- Accurately reflects the zero-withholding threshold

### Formula

```
Monthly IRS = max(0, Gross × Rate − Parcel − depParcel × nDeps)
```

Where `(Rate, Parcel)` come from the matching segment in Tables I, II, or III depending on marital status and dependents count.

### Table routing

| Marital status   | Deps | Table | depParcel |
|------------------|------|-------|-----------|
| `married_single` | any  | III   | 42.86     |
| `single`         | 0    | I     | 21.43     |
| `single`         | 1+   | II    | 34.29     |
| `married_dual`   | any  | I     | 21.43     |

---

## What stays the same for 2025

Year 2025 continues to use the annual bracket methodology (Art. 68.º CIRS) because:
- The 2025 AT monthly tables were not provided and are no longer trivially obtainable
- The annual bracket approach is still a reasonable approximation for 2025
- The UI always shows the year prominently so users understand which year's rules apply

---

## Not in scope (deferred)

- **Disability tables (IV–VII):** Separate AT tables for workers with disability. Not yet needed; input field can be added later.
- **RAM tables:** Madeira withholding tables extracted and documented in the research file. Will be implemented when a `location` field is added to the calculator UI.
- **Azores (RAA):** Tables not yet obtained.
- **3rd+ dependent credit:** The CSV reference suggests a higher credit for the 3rd+ dependent (e.g. 36–52€/dep vs the official 21.43€/dep). This may be due to an additional Art. 78-A credit applied separately by some tools. Requires further investigation before changing the formula.

---

## Files changed

| File | Change |
|------|--------|
| `lib/calculators/net-salary.ts` | Replaced annual bracket IRS with AT table lookup for year=2026; added `DebugInfo` discriminated union; exported `IRS_BRACKETS_2026` as reference-only |
| `lib/calculators/net-salary.test.ts` | Rewrote Section 3 (AT table tests), Section 7 (dep credits), Section 8 (year selection); added 32 stable CSV IRS assertions; 138 tests all passing |
