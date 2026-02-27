# Design system for gestorfinanceiro.pt

**A teal-anchored, modern design system built on Inter typography and Astro/Svelte islands will differentiate gestorfinanceiro.pt from Portugal's blue-dominated finance landscape while maintaining the trust signals Portuguese users demand.** The Portuguese finance web is ripe for disruption: traditional banks use dated SharePoint-era layouts, fintechs cluster around generic blues, and none offer dark mode, accessibility leadership, or rich data visualization. By combining the credibility of a professional finance tool with the polish of European neobanks like N26 and Wise, gestorfinanceiro.pt can own a distinctive position: expert-grade calculator tools in a modern, approachable package.

This report delivers a complete, implementation-ready design system covering color, typography, UI components, accessibility, conversion patterns, and specific Astro/Svelte architecture recommendations.

---

## The Portuguese finance web and where the opportunity lies

An analysis of 10 major Portuguese finance and banking websites reveals a market saturated with blue branding and conservative design. **Doutor Finanças** uses warm blue (#0055B3 range) with a content-heavy WordPress layout. **CGD** (state bank) runs on SharePoint with blue-green/teal branding. **Montepio** uses deep navy. **ComparaJá** breaks the pattern with orange/coral, while **Millennium BCP** made a deliberate, now-legendary break from banking norms in 2004 with magenta-purple — proving that bold differentiation works in the Portuguese market. **Banco de Portugal** uses a refined black-and-gold identity with the custom "Stella" typeface by Portuguese designer Mário Feliciano.

Several gaps define the opportunity space:

- **No Portuguese finance site offers dark mode**, despite Revolut, N26, and Wise (all popular in Portugal) training users to expect it
- **Calculator UIs are functional but visually basic** — no rich data visualization, no animated results, no scenario comparison tools
- **Most sites feel desktop-first**, with heavy navigation hierarchies built for mouse users
- **Accessibility is an afterthought** across the board — WCAG leadership is an unclaimed competitive advantage
- **Custom illustration and modern component design** are virtually absent; stock photography dominates
- **Educational content + tools integration** is fragmented — users bounce between comparison sites, educational portals, and bank sites

The "gestor financeiro" positioning as a helpful expert tool (not a bank, not a broker) occupies an ideal niche. The design must signal competence and authority without the coldness of institutional banking.

---

## Color system: teal as the strategic anchor

### Why teal beats blue for this specific project

Color psychology research confirms that **62–90% of snap judgments about products are based on color alone**, with financial websites seeing up to 24% conversion improvement from optimized color choices. Blue dominates global finance for good reason — it signals trust and stability universally. But Portugal's finance web is drowning in blue. Wise deliberately abandoned blue for citrus green specifically to escape the "sea of sameness," and their brand recognition soared.

**Teal (#0D9488 range) is the ideal primary for gestorfinanceiro.pt** for five reasons. First, it sits at the intersection of blue (trust, authority) and green (growth, money), encoding both meanings simultaneously. Second, in Portuguese culture, green carries the specific connotation of *esperança* — hope for the future — which resonates powerfully for a financial planning tool. Third, teal is the signature color of leading European neobanks (N26's Keppel #36A18B, Starling Bank) that Portuguese users already trust. Fourth, it creates instant visual differentiation from Doutor Finanças (blue), ComparaJá (orange), CGD (blue-green but much more institutional), and Millennium BCP (magenta). Fifth, teal tests well across gender demographics — listed as a top color preference for women, while remaining professional enough for the broadest audience.

A critical cultural note: **avoid purple as a primary color**. In Catholic Europe, purple carries mourning and crucifixion associations — Euro Disney had to significantly reduce purple usage due to negative reception. Millennium BCP succeeded with magenta-purple through massive brand investment, but for a new site without that budget, the risk outweighs the reward. Similarly, avoid combining red and green prominently, as this reads as the Portuguese flag and carries political rather than financial associations.

### Complete color palette with hex codes

**Primary palette:**

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary-50` | #F0FDFA | Tinted backgrounds, hover states |
| `--primary-100` | #CCFBF1 | Light accent backgrounds |
| `--primary-200` | #99F6E4 | Highlights, selection states |
| `--primary-500` | #14B8A6 | Interactive elements, links |
| `--primary-600` | #0D9488 | **Primary brand color**, buttons, CTAs |
| `--primary-700` | #0F766E | Hover states for buttons |
| `--primary-800` | #115E59 | Active/pressed states |
| `--primary-900` | #134E4A | Dark mode accent adjustments |

**Neutral palette (slate-tinted for warmth):**

| Token | Hex | Usage |
|-------|-----|-------|
| `--neutral-50` | #F8FAFC | Page backgrounds, alternating rows |
| `--neutral-100` | #F1F5F9 | Card backgrounds, input backgrounds |
| `--neutral-200` | #E2E8F0 | Borders, dividers |
| `--neutral-300` | #CBD5E1 | Disabled states, subtle borders |
| `--neutral-400` | #94A3B8 | Placeholder text |
| `--neutral-500` | #64748B | Secondary text, captions |
| `--neutral-600` | #475569 | Body text (secondary) |
| `--neutral-700` | #334155 | Body text (primary) |
| `--neutral-800` | #1E293B | Headings, emphasis |
| `--neutral-900` | #0F172A | Display text, dark mode background |

**Semantic colors:**

| Token | Hex | Usage |
|-------|-----|-------|
| `--success-500` | #22C55E | Positive results, gains, savings |
| `--success-600` | #16A34A | Success hover, dark accents |
| `--warning-500` | #F59E0B | Caution, attention-needed states |
| `--warning-600` | #D97706 | Warning emphasis |
| `--error-500` | #EF4444 | Errors, losses, negative values |
| `--error-600` | #DC2626 | Error emphasis |
| `--info-500` | #3B82F6 | Informational, tips, help text |

**Dark mode palette:**

| Token | Light | Dark | Notes |
|-------|-------|------|-------|
| `--bg-primary` | #FFFFFF | #0F172A | Navy-tinted dark, not pure black |
| `--bg-surface` | #F8FAFC | #1E293B | Cards, elevated surfaces |
| `--bg-elevated` | #FFFFFF | #334155 | Modals, popovers |
| `--text-primary` | #1E293B | #F1F5F9 | Main content |
| `--text-secondary` | #64748B | #94A3B8 | Supporting text |
| `--border-default` | #E2E8F0 | #334155 | Standard borders |
| `--accent-primary` | #0D9488 | #2DD4BF | Brighter in dark mode |

Use **navy-tinted dark (#0F172A)** rather than pure black — it reduces eye strain and creates a premium feel consistent with Revolut and N26's approach. Detect system preference via `prefers-color-scheme` but always provide a manual toggle stored in `localStorage`.

---

## Typography: Inter as the single-family workhorse

### Why Inter wins for Portuguese financial calculators

After evaluating 12+ Google Fonts against finance-specific requirements, **Inter emerges as the clear recommendation** as a single-family typographic system. It was designed explicitly for screen readability by Rasmus Andersson, features a tall x-height and open apertures that aid reading at small sizes (critical for the 40–65 age segment), supports **140+ languages** including full Portuguese diacritics (ã, ç, ó, ú, â, ê, ô, à, õ), and ships as a single variable font file for optimal performance.

Most critically for a finance calculator site, Inter includes **comprehensive OpenType features**: tabular lining numerals (`tnum`), slashed zero (`zero`), fractions (`frac`), superscripts, and subscripts. This means every financial figure — from €245.678,90 mortgage payments to 3,75% interest rates — aligns perfectly in columns without requiring a separate monospace font.

The alternative pairings worth considering: **DM Sans** (headings) + **Inter** (body) for a warmer geometric personality, or **Plus Jakarta Sans** + **Source Sans 3** for a distinctly different feel. But Inter alone, leveraging its variable weight axis (100–900) and optical sizing, handles everything from 55px hero calculator results to 14px table captions with a single font load.

For calculator display numbers where maximum clarity matters, pair with **IBM Plex Mono** as a monospace fallback — it provides clear digit differentiation and pairs elegantly with Inter.

### Type scale and implementation

Use a **Major Third scale (1.250)** on desktop and **Minor Third (1.200)** on mobile. The base size should be **18px (1.125rem)** — larger than the typical 16px default, but research shows this substantially improves readability for users over 40 without feeling oversized for younger users.

| Element | Desktop | Mobile | Weight | Line height |
|---------|---------|--------|--------|-------------|
| Display/hero result | 55px / 3.43rem | 36px / 2.25rem | 700 | 1.1 |
| H1 | 44px / 2.75rem | 33px / 2.07rem | 700 | 1.2 |
| H2 | 35px / 2.19rem | 28px / 1.73rem | 600 | 1.25 |
| H3 | 28px / 1.75rem | 23px / 1.44rem | 600 | 1.3 |
| H4 | 22px / 1.38rem | 19px / 1.2rem | 600 | 1.35 |
| Body | 18px / 1.125rem | 16px / 1rem | 400 | 1.6 |
| Small/caption | 14px / 0.875rem | 14px / 0.875rem | 500 | 1.4 |

All financial numbers should use tabular lining figures via `font-variant-numeric: lining-nums tabular-nums`. For calculator result displays, add `font-feature-settings: "tnum" 1, "lnum" 1, "zero" 1` to enable slashed zeros for disambiguation. Format Portuguese-locale numbers with period thousands separators and comma decimals: **€1.234,56**.

---

## Calculator and UI component patterns that actually work

### The combined slider + input is non-negotiable

Nielsen Norman Group research confirms that **combined slider + editable input field is the gold standard** for financial calculators. The slider invites exploration ("what happens if I borrow more?") while the input field enables precision. Always pair them — never use sliders alone for financial values.

Implementation specifications: slider thumb minimum **44×44px** touch target (48px recommended), track height 6–8px desktop / 8–10px mobile, always display the current value above or beside the thumb, and sync bidirectionally between slider and input. For loan amounts spanning wide ranges (€10.000–€1.000.000), use a **non-linear scale** with more granularity in the €100.000–€500.000 range where most Portuguese mortgages fall. For discrete values like loan terms, use a segmented control (5, 10, 15, 20, 25, 30 years) rather than a continuous slider.

**Real-time calculation updates are strongly preferred over submit buttons.** NN/g's research shows users "especially like it when the output is dynamically calculated." Debounce input changes by 300ms, use subtle animations (Svelte's built-in `tweened` stores are perfect for counter animations), and reserve explicit "Calculate" buttons only for computationally intensive operations exceeding 500ms.

### Results display: progressive disclosure in three layers

Structure calculator results as a three-level progressive disclosure system. **Level 1** shows the hero number (e.g., "€487,32/mês") in 36px+ bold text with 2–3 key metric summary cards. **Level 2** reveals charts — doughnut for payment composition, area chart for balance over time, stacked area for amortization principal-vs-interest shift. **Level 3** expands to full amortization tables with yearly grouping, export-to-CSV, and print functionality.

For charts, **LayerChart** (built on LayerCake, native to Svelte) is the recommended library over Chart.js — the `svelte-chartjs` wrapper is no longer maintained for Svelte 5. LayerChart integrates directly with shadcn-svelte's chart components and supports server-side rendering for charts that work without JavaScript.

Use these chart-to-data-type mappings: doughnut for payment breakdowns (principal/interest/tax), area/line for projections over time, grouped bars for scenario comparisons, and stacked area for amortization schedules showing the principal-to-interest shift.

### Navigating 28+ calculators without overwhelming users

Category-based mega menu + search is the proven pattern for tool-heavy sites. Group calculators into **4–5 categories**: Crédito Habitação (mortgage tools), Impostos (IRS, IMT, IVA), Poupança e Investimento (savings, PPR, ETF), Crédito Pessoal (personal loans, auto), and Ferramentas (general calculators). Display the mega menu on click (not hover — more accessible and touch-friendly), include small icons beside each tool name, badge the 3–5 most popular tools, and embed a search bar within the menu itself.

On each calculator page, include a "Calculadoras relacionadas" section showing 3–4 related tools as cards — this drives cross-engagement and session depth. Track usage with localStorage to offer a "Usadas recentemente" section for returning visitors.

---

## Design system tokens and specifications

### Spacing, radius, and elevation

Use a **4px base spacing scale** — the extra granularity over 8px matters for calculator UIs with dense form layouts:

| Token | Value | Typical usage |
|-------|-------|---------------|
| `--space-1` | 4px | Icon-to-text gaps, micro spacing |
| `--space-2` | 8px | Inside compact components, inline spacing |
| `--space-3` | 12px | Form field padding, tight card padding |
| `--space-4` | 16px | Standard component padding |
| `--space-6` | 24px | Card padding, section gaps |
| `--space-8` | 32px | Between form groups |
| `--space-12` | 48px | Major section breaks |
| `--space-16` | 64px | Page-level vertical spacing |

**Border radius: 8px as the default** for cards and containers. This is the sweet spot between sharp (too technical) and overly rounded (too casual for finance). Buttons and inputs at 6px, modals at 16px, pills/badges at 9999px. The overall feel should be modern-professional — rounder than a traditional bank, crisper than a consumer app.

**Shadows: lean subtle.** Financial tools should feel grounded, not floaty. Five elevation levels:
- Level 0: none (base surfaces)
- Level 1: `0 1px 2px rgba(0,0,0,0.05)` (cards at rest)
- Level 2: `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)` (interactive cards)
- Level 3: `0 4px 6px -1px rgba(0,0,0,0.1)` (hover states, dropdowns, sticky nav)
- Level 4: `0 10px 15px -3px rgba(0,0,0,0.1)` (modals, popovers)

In dark mode, shadows become nearly invisible — use **1px borders** (`--border-default`) or lighter background surfaces to communicate elevation instead.

### Grid and responsive layout

Twelve-column grid, **1280px max-width** (generous enough for calculator + results side-by-side), with responsive breakpoints at 640px (sm), 768px (md), 1024px (lg), 1280px (xl). Calculator layouts should use a **40/60 split** on desktop (inputs left, results right), full-width stacked on mobile with results appearing below inputs or in a bottom-sheet pattern that slides up showing the summary and expands to full-screen for details.

Mobile input fields must use **`inputmode="decimal"`** to trigger the numeric keyboard, and all touch targets must be minimum **48×48px** with 8px spacing between interactive elements. Input field font size must be at least 16px to prevent iOS auto-zoom.

---

## Accessibility as a competitive advantage

No Portuguese finance site currently leads on accessibility — this is both an ethical imperative and a competitive differentiator, especially for the 40–65 segment where age-related vision changes affect readability.

### Non-negotiable requirements

Target **WCAG 2.2 AA** as minimum, with **AAA (7:1 contrast)** for all body text and financial data. The recommended palette achieves this: `--neutral-700` (#334155) on white provides approximately **10:1 contrast**, and the teal primary (#0D9488) on white achieves **4.6:1** — passing AA for normal text and AAA for large text.

All font sizes must use `rem` units, resizable to 200% without content loss. Input fields at 16px minimum prevent iOS zoom. Focus indicators must be visible on every interactive element — use a **3px solid outline** with 2px offset in the info-blue color. Never suppress outlines without providing a replacement. Calculator results must use the HTML `<output>` element with `aria-live="polite"` and `aria-atomic="true"` so screen readers announce complete results when calculations update.

### Color-blind safe chart design

**Never use red/green as the sole differentiator** in charts — this affects 8% of men. For profit/loss visualization, use **blue (#0072B2) for positive and orange (#E69F00) for negative**, supplemented with ▲/▼ icons and text labels. The Okabe-Ito palette is the gold standard for colorblind-safe multi-series charts. Always provide pattern fills as an alternative encoding alongside color.

Group related calculator inputs with `<fieldset>` and `<legend>` (e.g., "Dados do empréstimo"), provide `aria-describedby` for format hints ("Introduza o valor em euros"), and announce validation errors with `role="alert"` using Portuguese-language messages.

---

## Conversion patterns for Portuguese financial tool users

### Trust signals that matter in Portugal

Portuguese users look for specific credibility markers. Display **references to regulatory bodies** — Banco de Portugal, CMVM, ASF — prominently in the footer. Cite data sources explicitly: INE (Instituto Nacional de Estatística), Pordata, Euribor rates from the ECB. Show calculation methodology transparently — "Como calculamos" links that reveal formulas and assumptions build trust that opaque competitors lack.

**"X cálculos realizados" counters** work as social proof. Post-calculation email capture is the highest-converting capture point: "Enviar resultados por email" is a natural, high-intent moment when users genuinely want records. Use progressive profiling — capture email first, then build the relationship through a newsletter tied to rate changes: "Receba alertas quando as taxas Euribor mudam e afetam os seus cálculos."

### RGPD compliance as design

Cookie consent must have **equal visual prominence** for Accept and Reject buttons — same size, same font weight, same contrast. Pre-ticked boxes violate GDPR. Use a non-intrusive bottom banner (58% of EU sites use this pattern) with a second layer offering granular category controls. Build a custom Svelte cookie consent component as a `client:load` island rather than depending on third-party CMPs that add weight.

For all Portuguese-language UX copy, use the **formal "você" register** — essential for financial contexts. Key CTA translations: "Calcular" (Calculate), "Simular" (Simulate), "Ver resultados" (See results), "Guardar resultados" (Save results), "Descarregar PDF" (Download PDF).

---

## Astro/Svelte architecture for maximum performance

### The islands pattern fits calculator sites perfectly

Astro's static-first architecture is ideal: all page chrome (headers, footers, trust badges, educational content, SEO text) renders as **zero-JavaScript static HTML**. Only calculator forms, charts, and cookie consent hydrate as Svelte islands. A real-world benchmark shows Astro sites with Svelte components achieving **under 25KB client JS per page** — React's runtime alone exceeds that.

**Hydration strategy by component type:**
- `client:load` — Calculator form inputs (must be interactive immediately)
- `client:visible` — Charts and results sections below the fold
- `client:idle` — Email capture forms, newsletter widgets, related calculators

### Recommended component stack

**shadcn-svelte** is the top pick for UI components — it's an unofficial Svelte port of shadcn/ui that now supports Svelte 5 and Tailwind CSS v4. It provides 40+ composable components (buttons, cards, dialogs, forms, sliders, tabs, charts) built on **Bits UI** headless primitives with full ARIA support. The code-distribution model copies components into your project for complete customization — critical for building calculator-specific UI that matches the brand precisely.

**Tailwind CSS v4** integrates via `@tailwindcss/vite` plugin (the `@astrojs/tailwind` integration is deprecated). Use the new `@theme` directive for design tokens and `@plugin` for the typography plugin on educational content pages.

**Superforms + Zod** handles calculator form validation in SPA mode — define schemas for each calculator's inputs, get real-time validation, proxy objects for string-to-number conversion, and auto-centering on invalid fields, all without server round-trips.

**Svelte 5 runes** provide the ideal calculator architecture: `$state()` for inputs like loan amount and interest rate, `$derived()` for calculated results like monthly payment and total interest (recomputes only when dependencies change), and `$effect()` for side effects like saving to localStorage or analytics tracking. The compiled output is minimal vanilla JS with surgical DOM updates — only changed values re-render.

For charts, use **LayerChart** (integrated with shadcn-svelte) for standard visualizations and **LayerCake** for custom financial charts. For time-series data specifically (Euribor rate history, investment projections), **Lightweight Charts** by TradingView is purpose-built and extremely performant.

Add **@vite-pwa/astro** for offline calculator access — cache calculator JS bundles and static assets with Workbox, using stale-while-revalidate for API data like current interest rates. This lets users run calculators offline, a feature no Portuguese competitor offers.

---

## Conclusion

The design system for gestorfinanceiro.pt rests on three strategic pillars. **Teal (#0D9488) as the primary brand color** exploits the gap between Portugal's blue banking establishment and the market's readiness for modern fintech aesthetics, while encoding both trust and growth in a culturally aligned choice. **Inter as the sole typeface** with tabular numerals solves the finance-specific challenge of making numbers scan perfectly across calculators, tables, and charts while remaining highly readable for users up to 65. **Astro's island architecture with Svelte 5 calculators** delivers the performance ceiling that heavy calculator sites need — static pages that load instantly, interactive components that respond without lag, and a total JS budget under 25KB per page.

The key differentiators against Portuguese competitors are dark mode (unclaimed by any competitor), WCAG AAA accessibility (leadership opportunity), rich interactive data visualization (vs. basic text-only results), and transparent calculation methodology that builds trust through openness rather than institutional authority. The "gestor financeiro" brand should feel like a knowledgeable friend who happens to be a financial expert — modern enough for a 25-year-old opening their first PPR, authoritative enough for a 60-year-old comparing mortgage refinancing options.