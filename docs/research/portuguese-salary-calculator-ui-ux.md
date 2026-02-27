# Portuguese salary calculators: a complete UI/UX competitive analysis

**Ten Portuguese net salary calculators share a remarkably consistent input structure but diverge sharply on output quality, layout sophistication, and user experience.** The best tools combine real-time calculation, progressive disclosure, and rich payslip-style breakdowns — while most underperform on data visualization and mobile interaction. This analysis examines every major competitor and distills precise recommendations for gestorfinanceiro.pt to build a best-in-class calculator.

The Portuguese market already has mature offerings from fintech companies (Coverflex, Doutor Finanças), banks (Santander, Montepio), credit companies (Cofidis/ComparaJá), and independent creators (Literacia Financeira, Bora Falar de Guito). Yet no single calculator combines all best practices. GestorFinanceiro.pt has a clear opportunity to synthesize the best elements into a differentiated tool.

---

## How ten calculators handle inputs

Across all ten calculators analyzed, a **universal core set of 8–10 inputs** appears on virtually every tool. Beyond this core, differentiating "advanced" inputs separate basic tools from comprehensive ones.

**Universal inputs (present on 90%+ of calculators):**

Every tool asks for gross salary (salário bruto), region (Continente/Açores/Madeira), marital/tax status (solteiro, casado 1 titular, casado 2 titulares), number of dependents, meal allowance type (cash vs. card/vouchers), meal allowance daily value and working days, and subsidy payment method (duodécimos). These form the irreducible minimum for any Portuguese salary calculator.

**Common but not universal inputs (present on 50–70%):**

IRS Jovem (the youth tax benefit introduced in recent years) appears on **6 of 10 calculators**, with implementations ranging from a simple yes/no toggle (ComparaJá) to year-specific selection of benefit years 1–10 (Bora Falar de Guito, Coverflex). Disability status (incapacidade ≥60%) appears on 8 of 10 tools. "Other income" fields — split into income subject to IRS+SS, income subject only to IRS, and income exempt from both — appear on **7 of 10 calculators** and are critical for accuracy.

**Advanced/rare inputs (present on fewer than 30%):**

Only **4 calculators** (Literacia Financeira, Bora Falar de Guito, CalcularSalarioLiquido.com, Santander) allow editing the Social Security rate from the default **11%**, which matters for specific professions. **ADSE** (public sector health subsidy at 3.5%) appears on just 4 tools. The most sophisticated calculator — Bora Falar de Guito — uniquely includes sick leave simulation, custom net salary deductions, and voluntary higher withholding rate selection. Coverflex alone adds **12 specific benefit categories** tied to its flexible compensation product.

| Input category | Frequency | Key examples |
|---|---|---|
| Core salary + personal data | 10/10 | Gross salary, region, marital status, dependents |
| Meal allowance (3 sub-fields) | 10/10 | Type, daily value, days per month |
| Duodécimos configuration | 10/10 | 3–7 options depending on calculator |
| Disability status | 8/10 | Binary toggle or dropdown |
| IRS Jovem | 6/10 | Year ranges (1st, 2–4th, 5–7th, 8–10th) |
| Other income (3 categories) | 7/10 | Taxable, partially taxable, exempt |
| Editable SS rate | 4/10 | Default 11%, user-modifiable |
| ADSE toggle | 4/10 | Public sector employees |
| Sick leave / custom deductions | 1/10 | Bora Falar de Guito only |

---

## Output quality varies dramatically across tools

The gap between the weakest and strongest output presentations is enormous. **DataLABOR** shows just four lines (net salary, taxable income, IRS, SS) in a plain HTML table. By contrast, **Literacia Financeira** renders a full simulated payslip ("folha de vencimento") with 11 line items, a visual bar chart, employer cost, annual projections, and a downloadable chart.

**Best output practices observed:**

Coverflex and Santander both offer a **monthly/annual toggle** that recalculates all values, solving the common user confusion about annual compensation. ComparaJá goes further with **five time granularities** — annual, monthly, weekly, daily, and hourly — a genuinely useful feature for comparing job offers. ComparaJá also provides the only **donut chart** showing the salary composition split between net pay and deductions, while Literacia Financeira uses a **horizontal bar chart** for the same purpose.

The most informative outputs include: net monthly salary (the headline number), IRS withholding amount and rate, Social Security contribution amount and rate, meal allowance (showing any taxable excess), duodécimos amounts if applicable, gross-to-net difference, employer total cost (custo empresa, including the 23.75% employer SS contribution), and annual totals. Only **Literacia Financeira** presents this as a proper payslip simulation, which users find highly intuitive because it mirrors the actual document they receive from employers.

**Coverflex** uniquely shows a separate line for "Benefícios Coverflex" with its percentage contribution to total compensation — a product-marketing integration that also serves as genuine utility by quantifying tax savings from flexible benefits.

---

## Layout patterns reveal three dominant approaches

The calculators cluster into three distinct layout strategies, each with clear trade-offs.

**Single-page side-by-side (best for desktop power users).** Coverflex and Literacia Financeira place inputs in a left column with a sticky results panel on the right. Results update in real-time as users modify inputs. This pattern maximizes immediacy — users see the impact of every change instantly — and works beautifully on desktop. Coverflex enhances this with progressive disclosure: the Coverflex benefits section is collapsible, and meal allowance sub-fields appear conditionally.

**Single-page stacked with sections (most common pattern).** Santander, ComparaJá, Doutor Finanças, DataLABOR, and CalcularSalarioLiquido.com all use vertically stacked inputs followed by results below. Santander numbers its six sections (1. Rendimento base, 2. Subsídio de alimentação, etc.), which provides clear visual structure. Some require a "Calcular" button (Santander, Literacia Financeira), while others calculate in real-time (ComparaJá, DataLABOR, Doutor Finanças). CalcularSalarioLiquido.com uses a smart "Mostrar Opções Avançadas" toggle to hide advanced income fields behind progressive disclosure.

**Multi-step wizard (best for beginners).** Montepio uses a **3-step wizard** (Agregado familiar → Rendimentos → Resultado) and Cofidis/Contas Connosco uses a **2-step wizard** (Rendimento → Outras informações). This pattern reduces cognitive load by presenting fewer fields at once but adds friction through extra clicks. Montepio's approach works well for its target audience — banking customers who may not be financially sophisticated — but feels slow for repeat users.

---

## Visual design and interaction patterns worth noting

**Color and brand integration.** Each calculator reflects its parent brand: Coverflex's distinctive **peach/coral** against white, Doutor Finanças' trustworthy **blue** (with a medical metaphor throughout), Santander's **red** accents, Cofidis' **navy + orange**, and Literacia Financeira's **purple/violet**. The highest-quality designs (Coverflex, Literacia Financeira, ComparaJá) use generous whitespace, card-based layouts, and subtle shadows. The weakest (DataLABOR, CalcularSalarioLiquido.com) use minimal styling with basic form elements.

**Real-time vs. button-triggered calculation.** The majority (**7 of 10**) use real-time calculation with no submit button — this is the clear industry standard and user expectation. Santander and Literacia Financeira require a "Calcular" button, which adds a friction step but allows validation before computing. **Recommendation: real-time calculation is strongly preferred**, with inline validation rather than form submission.

**Tooltips and help systems.** The best implementations come from Coverflex (ⓘ icons on nearly every field with 2–3 sentence explanations), Santander (tooltips citing specific Portuguese tax code articles), and Literacia Financeira (detailed glossary below the calculator). Doutor Finanças takes a different approach — no inline tooltips but an extensive "Como funciona" tutorial section and an FAQ accordion with 9 questions below the calculator. **The most effective pattern combines brief inline tooltips with a comprehensive FAQ section.**

**Unique UX features worth highlighting:**

- ComparaJá's **multi-salary comparison** (add a second salary tab to compare two scenarios side-by-side) is the single most differentiated feature across all calculators
- Coverflex's **"Partilhar simulador" with copy-link** functionality enables users to share their exact simulation parameters
- Cofidis' **account-based saving** lets registered users save and compare simulations over time
- Literacia Financeira's **downloadable chart** exports the salary breakdown visualization
- Coverflex's **monthly/annual toggle** on output and ComparaJá's **5-level time granularity** both address a genuine user need
- Bora Falar de Guito's **version changelog** showing exactly what changed with each update builds trust and transparency

---

## Where every existing calculator falls short

Despite the maturity of this market, clear gaps persist across all tools. **No single calculator combines** comprehensive inputs, rich visual outputs, multi-scenario comparison, and modern mobile interaction.

**Visualization is universally weak.** Only 2 of 10 calculators include any chart. None offer interactive visualizations, Sankey-style flow diagrams showing money flowing from gross to net through deductions, or year-over-year trend analysis. Portuguese workers received mid-year withholding table changes in both 2024 and 2025 — a timeline visualization showing how net salary changed through the year would be genuinely valuable.

**Multi-scenario comparison barely exists.** Only ComparaJá offers a second salary tab, and even that is limited. No calculator lets users compare: "What if I negotiate €200 more gross — how much net do I actually gain?" or "How does getting married change my take-home pay?" or "What's the difference between receiving meal allowance in cash vs. card?" These scenario comparisons are the questions users actually have.

**Mobile experience is an afterthought.** Every calculator uses responsive design (stacking columns on mobile), but none offer mobile-native interaction patterns like swipeable result cards, bottom-sheet inputs, or haptic feedback on sliders. Given that **over 60% of Portuguese web traffic is mobile**, this is a significant missed opportunity.

**No personalization or saving (except Cofidis).** Users must re-enter all their data every time they visit. A simple local-storage persistence or optional account system would dramatically improve repeat usage.

**Independent worker support is siloed.** Doutor Finanças has a separate "recibos verdes" calculator, and some others mention it, but no tool offers a unified experience for workers who may have both dependent employment and freelance income — an increasingly common scenario in Portugal.

---

## Recommended specification for gestorfinanceiro.pt

Based on this competitive analysis, here is the complete specification for a best-in-class Portuguese salary calculator.

### Recommended input fields (17 core + 5 advanced)

**Core inputs (always visible):**

1. **Salário bruto mensal** — Number input with € formatting, placeholder "ex: 1 500"
2. **Região fiscal** — Dropdown: Continente / Açores / Madeira (default: Continente)
3. **Situação fiscal** — Dropdown: Não casado / Casado, 2 titulares / Casado, 1 titular
4. **Número de dependentes** — Stepper (0–10, default 0)
5. **Incapacidade ≥60%** — Toggle (default: off), with tooltip explaining the 60% threshold
6. **Dependentes com incapacidade** — Conditional stepper (appears when dependents > 0)
7. **IRS Jovem** — Dropdown: Não aplicável / 1º ano / 2º–4º ano / 5º–7º ano / 8º–10º ano, with tooltip explaining eligibility
8. **Subsídio de alimentação — tipo** — Dropdown: Não tenho / Cartão ou vales / Dinheiro
9. **Subsídio de alimentação — valor diário** — Number input (conditional, with current exempt limits shown: €6.15 cash / €10.46 card)
10. **Subsídio de alimentação — dias por mês** — Number input (default: 22)
11. **Subsídios em duodécimos** — Dropdown with 5 options matching the most common implementations
12. **Ano fiscal / tabelas de retenção** — Dropdown defaulting to current year, with sub-period selection where applicable

**Advanced inputs (behind "Mostrar opções avançadas" toggle):**

13. **Taxa de Segurança Social** — Number input (default: 11%, editable)
14. **Beneficiário ADSE** — Toggle (default: off, with tooltip explaining public sector applicability)
15. **Isenção de horário** — Toggle with percentage input (default: off)
16. **Outros rendimentos sujeitos a IRS e SS** — Number input
17. **Outros rendimentos sujeitos apenas a IRS** — Number input
18. **Outros rendimentos isentos** — Number input
19. **Remuneração suplementar** — Number input
20. **Valor da baixa médica** — Number input with days field (innovative, borrowed from Bora Falar de Guito)
21. **Taxa de retenção voluntária superior** — Optional override
22. **Dedução adicional ao líquido** — Number input for recurring deductions (union dues, garnishments, etc.)

### Recommended output fields

**Primary headline:** Salário líquido mensal (large, prominent, with animated counter on change)

**Salary breakdown (payslip-style, borrowing from Literacia Financeira):**

| Line item | Display |
|---|---|
| Rendimento bruto tributável | € amount |
| Remuneração suplementar | € amount (if applicable) |
| Duodécimos (férias + Natal) | € amount (if applicable) |
| Subsídio de alimentação | € amount |
| Outros rendimentos | € amount (if applicable) |
| **Total bruto** | **€ subtotal** |
| Retenção IRS | –€ amount (rate %) |
| Segurança Social | –€ amount (rate %) |
| ADSE | –€ amount (if applicable) |
| Outras deduções | –€ amount (if applicable) |
| **Salário líquido** | **€ final** |

**Additional outputs:** Custo total empresa (employer cost including 23.75% TSU), taxa de retenção na fonte (withholding rate), annual gross and net totals.

**Time toggle:** Monthly / Annual (at minimum), ideally also Weekly / Daily / Hourly (like ComparaJá).

**Visualization:** A **horizontal stacked bar or Sankey diagram** showing the flow from gross to net, making deductions visually proportional. This is the single biggest visual gap in the market.

### Recommended layout and interaction pattern

**Desktop:** Side-by-side layout (inputs left, sticky results right) following the Coverflex/Literacia Financeira pattern. This is the optimal desktop experience because users see changes instantly.

**Mobile:** Stack inputs above results, but use a **floating bottom bar** showing the current net salary that expands into a full results sheet on tap. This keeps the key number always visible even while scrolling through inputs.

**Calculation:** Real-time with no submit button. Every input change triggers immediate recalculation with a subtle animation on changed values.

**Progressive disclosure:** Core inputs always visible; advanced inputs behind a clearly labeled expandable section. Conditional fields (meal allowance sub-fields, ADSE, disability dependents) appear with smooth animation when relevant toggles are activated.

**Help system:** Inline ⓘ tooltips on every non-obvious field (borrowing from Coverflex), plus a comprehensive FAQ accordion below the calculator (borrowing from Doutor Finanças), plus a "Como é calculado" expandable section showing the actual formula applied (borrowing from Santander's legal references).

### Differentiating features for gestorfinanceiro.pt

**Scenario comparison mode.** Add a "Comparar cenários" button that duplicates the calculator side-by-side (or as tabs on mobile), letting users compare two configurations — "current salary vs. offer," "single vs. married," "cash vs. card meal allowance." This is the most requested implicit feature that almost no competitor offers well.

**Salary evolution timeline.** Show how the same gross salary would have netted differently across 2023, 2024, 2025, and 2026 withholding tables, with a simple line chart. This provides unique editorial value during tax table change periods.

**Shareable simulation URLs.** Encode all parameters in the URL (like Coverflex) so users can bookmark or share their exact simulation. Add Open Graph meta tags so shared links show a preview card with the net salary result.

**Local storage persistence.** Auto-save the user's last simulation in localStorage so returning visitors see their previous calculation immediately. No account required.

**"Quanto ganha realmente" (what you really earn) annual view.** Beyond monthly, show a complete annual compensation map including: 14 months of salary (or 12 + bonuses), holiday and Christmas subsidies, meal allowance total, and the true annual net — accounting for the fact that meal allowance is only paid 11 months and subsidies may have different withholding rates.

**Future expansion to independent workers.** Build the architecture to support a "Trabalhador independente / Recibos verdes" mode from launch, even if it ships later. This means designing the input framework to accommodate: activity category (CAE), simplified regime vs. organized accounting, quarterly SS contributions, and IRS withholding at source (currently 25% base rate with exemptions).

---

## Conclusion

The Portuguese net salary calculator market is mature but stagnant in design innovation. Every competitor nails the basic calculation, but **the winning formula is: real-time side-by-side layout + progressive disclosure + payslip-style output + scenario comparison + one strong visualization**. Coverflex leads on polish and product integration. Literacia Financeira leads on output comprehensiveness. Bora Falar de Guito leads on input depth. ComparaJá leads on comparison features. No tool combines all four strengths. GestorFinanceiro.pt should target the intersection: a visually refined tool with comprehensive-but-progressive inputs, rich payslip-style outputs with a Sankey or bar visualization, built-in scenario comparison, and mobile-first interaction — all wrapped in trustworthy educational content that drives organic search traffic year after year.