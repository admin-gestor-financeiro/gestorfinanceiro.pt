# Design System Decisions

**Source:** `docs/research/design-system-research.md`
**Date:** 2025-02-26
**Status:** Adopted — implement progressively

This document translates the design system research into binding decisions for this project.
Where the research recommends Astro/Svelte, decisions are adapted to our **Next.js 15 / React** stack.

---

## 1. Color system

**Decision: Replace the current generic `brand-*` tokens with the teal-anchored palette from the research.**

The research makes a strong case: Portugal's finance web is saturated with blue. Teal (#0D9488) is the
strategic differentiator, encoding trust (blue) + growth (green) while signalling modern fintech (N26, Wise).

### Primary (teal)

| Token | Hex | Usage |
|---|---|---|
| `--color-primary-50` | `#F0FDFA` | Tinted backgrounds, hover states |
| `--color-primary-100` | `#CCFBF1` | Light accent backgrounds |
| `--color-primary-200` | `#99F6E4` | Highlights, selection states |
| `--color-primary-500` | `#14B8A6` | Interactive elements, links |
| `--color-primary-600` | `#0D9488` | **Brand primary** — buttons, CTAs |
| `--color-primary-700` | `#0F766E` | Button hover states |
| `--color-primary-800` | `#115E59` | Active / pressed states |
| `--color-primary-900` | `#134E4A` | Dark mode accent adjustments |

### Neutral (slate-tinted, not pure grey)

| Token | Hex | Usage |
|---|---|---|
| `--color-neutral-50`  | `#F8FAFC` | Page backgrounds, alternating rows |
| `--color-neutral-100` | `#F1F5F9` | Card backgrounds, input backgrounds |
| `--color-neutral-200` | `#E2E8F0` | Borders, dividers |
| `--color-neutral-300` | `#CBD5E1` | Disabled states |
| `--color-neutral-400` | `#94A3B8` | Placeholder text |
| `--color-neutral-500` | `#64748B` | Secondary text, captions |
| `--color-neutral-600` | `#475569` | Body text (secondary) |
| `--color-neutral-700` | `#334155` | Body text (primary) |
| `--color-neutral-800` | `#1E293B` | Headings, emphasis |
| `--color-neutral-900` | `#0F172A` | Display text, dark mode background |

### Semantic colors

| Token | Hex | Usage |
|---|---|---|
| `--color-success-500` | `#22C55E` | Positive results, gains |
| `--color-success-600` | `#16A34A` | Success hover |
| `--color-warning-500` | `#F59E0B` | Caution states |
| `--color-error-500`   | `#EF4444` | Errors, losses, negative values |
| `--color-info-500`    | `#3B82F6` | Tips, help text |

### Dark mode tokens

| Token | Light | Dark |
|---|---|---|
| `--bg-primary`    | `#FFFFFF`  | `#0F172A` |
| `--bg-surface`    | `#F8FAFC`  | `#1E293B` |
| `--bg-elevated`   | `#FFFFFF`  | `#334155` |
| `--text-primary`  | `#1E293B`  | `#F1F5F9` |
| `--text-secondary`| `#64748B`  | `#94A3B8` |
| `--border-default`| `#E2E8F0`  | `#334155` |
| `--accent-primary`| `#0D9488`  | `#2DD4BF` |

**Implementation:** Update `app/globals.css` `@theme` block to replace current `brand-*` tokens.
Use `prefers-color-scheme` + manual toggle for dark mode (toggle state in localStorage, class on `<html>`).

**Cultural guardrails (do not violate):**
- Do **not** use purple as a primary — mourning associations in Catholic Portugal
- Do **not** combine red + green prominently — reads as the Portuguese flag
- Chart differentiators must never rely on red/green alone (color-blind safety)

---

## 2. Typography

**Decision: Inter as sole typeface. Replace the current `font-sans: "Inter", ...` with the full variable font setup with OpenType features.**

Inter is already in the stack. The research confirms it's optimal for finance: tabular lining numerals,
slashed zeros, full Portuguese diacritic support, and works as a variable font (single file load).

### Type scale

Base size: **18px (1.125rem)** — larger than typical 16px, better for 40–65 age segment.

| Element | Desktop | Mobile | Weight | Line height |
|---|---|---|---|---|
| Hero result (calc output) | 55px | 36px | 700 | 1.1 |
| H1 | 44px / 2.75rem | 33px | 700 | 1.2 |
| H2 | 35px / 2.19rem | 28px | 600 | 1.25 |
| H3 | 28px / 1.75rem | 23px | 600 | 1.3 |
| H4 | 22px / 1.38rem | 19px | 600 | 1.35 |
| Body | 18px / 1.125rem | 16px | 400 | 1.6 |
| Caption / small | 14px | 14px | 500 | 1.4 |

### Number formatting rules

All financial figures must use `font-variant-numeric: lining-nums tabular-nums`.
For calculator result displays add `font-feature-settings: "tnum" 1, "lnum" 1, "zero" 1`.

**Portuguese number locale:** Period as thousands separator, comma as decimal. Format: `€1.234,56`.
Use `Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" })` — already in `lib/utils.ts`.

---

## 3. Spacing and layout

**Decision: 4px base spacing scale, 1280px max-width, 40/60 calculator layout.**

| Token | Value |
|---|---|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |
| `space-16` | 64px |

Calculator layout: **40% inputs / 60% results** on desktop (`lg:grid-cols-[2fr_3fr]`).
Full-width stacked on mobile — results appear **below** inputs.

---

## 4. Border radius and shadows

**Decision: 8px default radius for cards, 6px for inputs/buttons, 16px for modals.**

The current rounded-lg (8px) on cards is correct. Verify buttons and inputs are on 6px.

**Shadow scale:**

| Level | Value | Usage |
|---|---|---|
| 0 | none | Base surfaces |
| 1 | `0 1px 2px rgba(0,0,0,0.05)` | Cards at rest |
| 2 | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)` | Interactive cards |
| 3 | `0 4px 6px -1px rgba(0,0,0,0.1)` | Hover states, dropdowns, sticky nav |
| 4 | `0 10px 15px -3px rgba(0,0,0,0.1)` | Modals, popovers |

In dark mode: use 1px borders instead of shadows for elevation.

---

## 5. Calculator UI patterns

**Decision: Combined slider + input field for all range inputs. Real-time results, no submit button.**

- Slider thumb minimum 44×44px touch target (48px ideal)
- Track height 6–8px desktop / 8–10px mobile
- Bidirectional sync between slider and input
- Debounce input changes: 300ms
- Results update in real-time — no "Calculate" button needed unless computation > 500ms
- Use `<output>` element with `aria-live="polite"` and `aria-atomic="true"` for screen reader support

**Progressive disclosure — 3 levels:**
1. Hero number + 2–3 summary cards
2. Charts (doughnut for breakdown, area for projections) — **below the fold, lazy loaded**
3. Full amortization/detail tables — collapsible, with CSV export

**Charts library:** Use **Recharts** (already available in project via React ecosystem).
Do not use Chart.js directly — prefer the React wrapper or Recharts.

---

## 6. Navigation and calculator discovery

**Decision: Category mega-menu + in-menu search for the main nav. 4–5 categories.**

Categories:
1. **Crédito Habitação** — mortgage calculators
2. **Impostos** — IRS, IMT, IVA, salary calculators
3. **Poupança e Investimento** — savings, PPR, ETF
4. **Crédito Pessoal** — personal loans, auto
5. **Ferramentas** — currency, inflation, general

Every calculator page must include a "Calculadoras relacionadas" section (3–4 cards).

---

## 7. Accessibility

**Decision: Target WCAG 2.2 AA minimum. AAA (7:1) for all body text and financial figures.**

- All font sizes in `rem`, resizable to 200% without content loss
- Input fields minimum 16px to prevent iOS zoom
- Focus indicators: 3px solid outline, 2px offset, using `--color-info-500`
- Never suppress outlines without a replacement
- All interactive elements minimum 48×48px touch target with 8px spacing between them
- Group related inputs with `<fieldset>` + `<legend>`
- Validation errors use `role="alert"` in Portuguese

**Colorblind-safe charts:**
- Positive: `#0072B2` (blue), Negative: `#E69F00` (orange) — never red/green alone
- Always supplement color with ▲/▼ icons and text labels
- Provide pattern fills as alternative encoding

---

## 8. Trust signals and conversion

**Decision: Show data sources explicitly. Methodology links on every calculator.**

- Footer must cite: Banco de Portugal, CMVM, INE, Pordata
- Calculator pages must have a "Como calculamos" expandable section (already partially done via debug accordion)
- Email capture after calculation: "Guardar e enviar resultados" — highest-intent moment
- "X cálculos realizados" counter as social proof (implement with KV store once live)
- RGPD cookie banner: equal visual weight for Accept/Reject buttons, no pre-ticked boxes, bottom banner pattern

**CTA copy (formal "você" register):**
- Calculate → "Calcular"
- Simulate → "Simular"
- See results → "Ver resultados"
- Save results → "Guardar resultados"
- Download PDF → "Descarregar PDF"

---

## 9. Architecture alignment (Next.js adaptation)

The research recommends Astro + Svelte islands. We use **Next.js 15 App Router + React**.
The principles map directly:

| Research recommendation | Our equivalent |
|---|---|
| Astro static pages | Next.js Server Components (SSG) |
| Svelte islands (`client:load`) | React `"use client"` components |
| `client:visible` hydration | `React.lazy` + `Suspense` or `next/dynamic` with `ssr: false` |
| `client:idle` widgets | `next/dynamic` with `{ loading: () => null }` |
| Svelte 5 `$derived()` | `useMemo()` |
| shadcn-svelte | Our custom `components/ui/` (same headless pattern) |
| LayerChart / LayerCake | Recharts (React-native, no wrapper issues) |
| Superforms + Zod | Zod + React controlled inputs (already in stack) |
| @vite-pwa/astro | `next-pwa` (future — add when site is closer to production) |

---

## 10. Deferred decisions

These items from the research are noted but not yet prioritised:

- **Dark mode toggle** — implement after design tokens are updated
- **PWA / offline support** — add `next-pwa` post-launch
- **Euribor rate API integration** — Lightweight Charts for time-series (TradingView library)
- **Email capture flow** — post-calculation, tied to rate-change alerts
- **"Calculadoras relacionadas" section** — implement once 3+ calculators exist
- **"X cálculos realizados" counter** — requires KV store (already in wrangler.jsonc binding)
- **Custom illustration** — out of scope for MVP; revisit for v2
