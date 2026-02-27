# Changelog

## [Unreleased]

### Step 6b — Scenario comparison mode
- `components/calculators/net-salary-calculator.tsx`:
  - `ScenarioPanel` inner component extracted — renders the full form + payslip for one scenario; self-contained (computes its own `NetSalaryResult` from its `state` prop)
  - `NetSalaryCalculator` becomes a thin orchestrator: manages `compareMode` boolean and `activeTab` ("a" | "b") for mobile tabs
  - Scenario A state: `useSalaryParams()` (URL + localStorage, unchanged)
  - Scenario B state: `useState` initialised as a copy of Scenario A when compare activates (ephemeral — no URL sync needed for the secondary panel)
  - **Compare button** in the page header, teal-tinted; replaces itself with an "×" exit button while active
  - **Desktop layout**: 2-col CSS grid — each column shows Form + Bar chart + Payslip stacked; `stacked` prop removes the inner `lg:flex-row` so forms fill their column
  - **Mobile layout**: `PillToggle` tab switcher; inactive column hidden with `hidden lg:block`
  - Floating bar suppressed in compare mode (both payslips visible via tabs)
  - Checkbox and IRS Jovem `id` attributes made unique per scenario to avoid duplicate HTML IDs

### Step 6a — Shareable URLs + localStorage persistence
- `lib/hooks/use-salary-params.ts` — new `useSalaryParams` hook:
  - Reads initial state from URL search params on mount; falls back to localStorage; falls back to hardcoded defaults
  - Every state change persisted to localStorage immediately (`gf_salary_v1` key)
  - URL updated via `window.history.replaceState` with a 600 ms debounce (no history spam while typing)
  - Compact URL encoding — short param keys (`g`, `m`, `d`, `r`, `y`, `dis`, `mt`, `ma`, `duo`, `ij`, `ijy`); default values omitted to keep URLs short
  - `SalaryFormState` and `DEFAULT_SALARY_STATE` exported for reuse in step 6b (comparison mode)
- `components/calculators/net-salary-calculator.tsx`:
  - Individual `useState` calls replaced by `useSalaryParams()` — single synced source of truth
  - Unified `set(key, value)` helper replaces individual field setters
  - **Share button** added to the form card header: uses Web Share API on mobile; clipboard copy fallback on desktop; shows "Link copiado!" / "Link copied!" confirmation with a check icon for 2.5 s

### Step 5 — Bar chart visualization
- `components/ui/salary-bar.tsx` — new reusable `SalaryBar` component:
  - Horizontal stacked SVG bar with zero runtime dependencies
  - Segments rendered proportionally (net / SS / IRS) with rounded outer corners
  - Accessible: `role="img"`, `<title>`, `<desc>` per segment, `aria-hidden` legend
  - Legend with colour swatches and amounts rendered below the bar
- `components/calculators/salary-payslip.tsx`:
  - `SalaryBar` inserted between hero card and payslip breakdown
  - Bar amounts scale with the active period toggle (monthly → annual → weekly…)
  - New locale strings: `barAriaLabel`, `barNetLabel`, `barSSLabel`, `barIrsLabel`

### Step 4 — Output & payslip
- `components/calculators/salary-payslip.tsx` — bilingual payslip panel:
  - Period toggle: Monthly / Annual / Weekly / Daily / Hourly; all amounts scale
  - Hero card: net salary in large type, gradient background, IRS Jovem badge when active
  - Payslip breakdown: Gross → SS (11%) → IRS withholding → Meal allowance (conditional) → Net
  - Effective rates panel: effective IRS rate, total deduction rate, employer cost ratio
  - Employer cost card: Gross + SS patronal (23.75%) = Total employer cost
  - "Como é calculado" collapsible: AT table formula with actual rate/parcel, duodécimos base and IRS Jovem exempt amount when they differ from gross
  - Annual note (14 months) shown when annual period is active
- `components/calculators/net-salary-calculator.tsx`:
  - `disabilityFallback` flag corrected: continente 2026 disability tables (IV–VII) are fully available; stale warning removed

### Step 3b — IRS Jovem + Duodécimos + advanced options UI
- `lib/calculators/net-salary.ts`:
  - Added `DuodecimosOption` type and `DUODECIMOS_MULTIPLIER` map (4 options: none / both_full / half_one / half_two_or_one_full)
  - Added `IrsJovemInput` type, `IRS_JOVEM_EXEMPTION_RATE` map, `IRS_JOVEM_MONTHLY_CAP` (55 × IAS 2026 / 12 ≈ €2,461.43), `getIrsJovemExemptionRate()` helper
  - Duodécimos multiplier applied to gross before table lookup (SS always stays on actual gross)
  - IRS Jovem exemption applied to duodécimos-adjusted base, capped at monthly limit; income above cap is fully taxable
  - Both adjustments tracked in `at_table` debug: `duodecimosBase`, `withholdingBase`, `irsJovemExemptAmount`
  - Result now includes `duodecimos`, `irsJovemActive`, `irsJovemExemptionRate`
  - Exported `DUODECIMOS_OPTIONS` constant for UI
- `components/calculators/net-salary-calculator.tsx`:
  - "Mostrar opções avançadas" collapsible section with duodécimos select + IRS Jovem toggle
  - IRS Jovem career year selector appears when toggle is active, with primary-tinted sub-card and cap note
  - IRS Jovem badge shown on net salary hero card when active
  - Detailed calculation section shows duodécimos base, IRS Jovem exempt amount and withholding base when they differ from gross
- `lib/calculators/net-salary.test.ts`:
  - Section 10: Duodécimos — 7 tests covering multipliers, SS invariant, debug output
  - Section 11: IRS Jovem — 9 tests covering exemption rates, cap logic, SS invariant, combined with duodécimos

### Step 3a — Region support, disability tables, meal allowance limits
- `data/` folder with static withholding table files:
  - `withholding-tables.types.ts` — shared types (`Region`, `WithholdingBracket`, `WithholdingRegionTables`)
  - `withholding-tables-continente-2026.ts` — Tables I–VII (Portaria 2026)
  - `withholding-tables-acores-2026.ts` — Tables I–VII (Despacho n.º 1179/2026)
  - `withholding-tables-madeira-2026.ts` — Tables I–VII (Declaração de Retificação n.º 10/2026)
  - `withholding-tables.ts` — barrel export + `getRegionTables()` helper
- `lib/calculators/net-salary.ts`:
  - Added `region` and `disability` to `NetSalaryInput` and `NetSalaryResult`
  - Calculation engine now uses `getRegionTables()` instead of hardcoded Continente segments
  - Full disability table routing (Tables IV–VII) for Açores and Madeira
  - Continente disability falls back to standard table (Tables IV–VII not yet published by AT)
  - Meal allowance exempt limits updated: 2026 = €6.15 cash / €10.46 card; 2025 = €6.00 / €9.60
  - Exported `REGIONS` constant and `DEFAULT_REGION`
- `components/calculators/net-salary-calculator.tsx`:
  - Region selector (Continente / Açores / Madeira) via PillToggle
  - Disability checkbox with inline hint
  - Meal allowance limits now year-aware
  - Amber notice shown when disability + Continente (tables not yet available)
- `lib/calculators/net-salary.test.ts` — updated meal allowance tests for new per-year limits
- `vitest.config.mts` — added `@/` path alias so tests resolve data imports


### Added
- Documentation folder (`docs/`)
  - `docs/research/design-system-research.md` — full design system research (color, type, components, accessibility, conversion)
  - `docs/decisions/design-system.md` — binding decisions distilled from research (teal palette, Inter type scale, spacing, shadows, calculator patterns, accessibility targets, trust signals, Next.js architecture mapping)
- English-only code rule added to `CLAUDE.md`
- Renamed code files to English (URL path dirs unchanged):
  - `lib/calculators/salario-liquido.ts` → `lib/calculators/net-salary.ts`
  - `components/calculators/salario-liquido-calculator.tsx` → `components/calculators/net-salary-calculator.tsx`
  - All exported types/functions renamed: `EstadoCivil` → `MaritalStatus`, `calcularSalarioLiquido` → `calculateNetSalary`, etc.
- Structured data (JSON-LD) infrastructure
  - `lib/seo/structured-data.ts` — builders for WebApplication, BreadcrumbList, FAQPage, Organization, @graph
  - `components/ui/json-ld.tsx` — server-side JSON-LD injector
  - Calculator pages now include WebApplication + BreadcrumbList + FAQPage schemas
- SEO improvements: OpenGraph, Twitter cards, and hreflang on both calculator pages
- `app/sitemap.ts` — Next.js auto-generated `/sitemap.xml`
- `app/robots.ts` — Next.js auto-generated `/robots.txt`

- Calculadora de Salário Líquido (Net Salary Calculator)
  - `lib/calculators/salario-liquido.ts` — pure calculation logic
    - 2025 IRS annual brackets (OE2025, Art. 68.º CIRS)
    - Employee SS 11%, Employer SS 23.75%
    - Deduções específicas (4,104 €/year minimum)
    - Quociente conjugal for "casado único titular"
    - Dependent tax credits (50 €/month per dependent)
    - Meal allowance exempt limits (cash: 6 €/day, card: 9.60 €/day)
  - `components/calculators/salario-liquido-calculator.tsx` — bilingual client component (PT/EN)
    - Inputs: gross salary, marital status, dependents, meal allowance type/value
    - Results: net salary, SS, IRS withholding, effective rates, employer cost
    - Expandable detailed calculation breakdown
  - PT page: `/calculadoras/salario-liquido`
  - EN page: `/en/calculators/net-salary`
  - Full metadata + hreflang alternates on both pages

- Initial project boilerplate
  - Next.js 15 (App Router) + @opennextjs/cloudflare setup
  - TypeScript strict mode
  - Tailwind CSS v4 with custom brand colour tokens
  - Drizzle ORM + D1 schema skeleton (`articles` table)
  - `getDb()` per-request helper (Workers-safe, uses `cache()`)
  - `lib/utils.ts`: `cn()`, `formatCurrency()`, `formatPercent()`, `round()`, `hashInputs()`
  - Route groups: `(calculators)` and `(content)` for PT; `/en/` subtree for EN
  - Base UI components: `Button`, `Input`, `Select`, `Card`
  - `public/_headers` for static asset caching
  - `wrangler.jsonc`, `open-next.config.ts`, `drizzle.config.ts`
  - `.dev.vars.example`, `.gitignore`
