# Portuguese mortgage calculator market: a complete blueprint

**The Portuguese crédito habitação calculator market is fragmented, feature-incomplete, and ripe for disruption.** Across 14 banks and 10+ independent platforms, no single tool integrates all the components borrowers need — IMT calculation, insurance costs, stress testing, affordability assessment, and amortization schedules live in separate silos. This report delivers a comprehensive, actionable blueprint covering the competitive landscape, required features, exact formulas, regulatory data, and reference tables needed to build a best-in-class Portuguese mortgage calculator.

---

## 1. The competitive landscape: 20+ tools, none complete

The Portuguese market comprises three tiers of mortgage calculators: bank-owned simulators, aggregator/intermediary platforms, and independent tools. Each serves a different purpose but all share significant gaps.

### Bank simulators: product-focused, not user-focused

All major Portuguese banks offer online simulators, but these are designed as **lead-generation funnels** rather than comprehensive planning tools. They calculate monthly payments, TAN, TAEG, and MTIC, but none provides integrated upfront cost calculations, stress testing, or exportable amortization tables.

| Bank | Spread (bonified) | Key differentiator | Notable limitation |
|---|---|---|---|
| **CGD** | From ~0.80% | FINE generation online; Crédito Jovem integration; market leader | Dated interface; heavy cross-selling dependency |
| **Millennium BCP** | From ~0.80% | Most digital end-to-end process; app-based signing | Requires Ageas insurance + multiple products for best spread |
| **Novo Banco** | From 0.80% | Highest age limit (80 years at maturity); full online process | Spread requires Conta Pacote + GamaLife insurance |
| **Santander** | From 0.80% | "Banco Cinco Estrelas 2026" distinction; 40-year terms for under-30s | Full conditions require product subscriptions |
| **BPI** | From ~0.85% | 6 rate modalities including "Prestação Crescente" (graduated payments); digital pre-approval | Max 85% LTV (lower than competitors) |
| **Bankinter** | From 1.05% (0.65% via DECO) | Most transparent bonification structure; DECO PROteste partnership | Limited physical branch network |
| **ActivoBank** | 0% first 2 years | Fastest process (48h analysis); most modern UX | Spread rises sharply after promotional period |
| **Crédito Agrícola** | From 0.80% | Green energy incentive (-0.175% for A+ rated homes) | Less polished digital experience |
| **Montepio** | From 0.80% | Widest fixed-rate options (2–15 years); unique leasing product; signal credit | Less intuitive ITSCredit platform |
| **Banco CTT** | From ~1.30% | 100% digital with App Casa BCTT | Newer market entrant |

**Common pattern across all bank simulators**: they collect finality, amount, term, rate type, borrower age, and cross-selling product selections. They output monthly payment, TAN, TAEG, MTIC, spread (base and bonified), and estimated insurance costs. **None offers** integrated IMT calculation, amortization table export, stress testing, or early repayment simulation within the main calculator flow.

### Aggregators and intermediaries: comparison-focused but shallow on calculations

Three major platforms dominate the comparison space, all operating as Banco de Portugal-registered credit intermediaries:

**ComparaJá** is the market leader for multi-bank comparison, covering 9+ partner banks (ABANCA, Novo Banco, Millennium BCP, CGD, BPI, Bankinter, Crédito Agrícola, Banco CTT, UCI). It delivers personalized proposals within 48 hours and claims average savings of **€1,000/year**. It also offers separate IMT, Euribor impact, and IRS simulators — but these are disconnected from the main mortgage tool. Its weakness is that the generic simulator uses market averages rather than live bank-specific rates.

**Doutor Finanças** has the broadest tool ecosystem in Portugal — separate calculators for mortgage payments, IMT, IMI, taxa de esforço, early repayment impact, property value estimation, and more. However, the mortgage calculator itself is basic (requires the user to input the TAN manually) and functions as a gateway to its intermediation service. The tools are **never integrated into a single flow**.

**Idealista Portugal** leverages its position as the country's largest property portal to offer mortgage comparison alongside property listings. This integration — see a house, simulate a mortgage — is its unique strength. **Comparamais** covers the widest bank range with **14 institutions** compared simultaneously. **DECO PROteste**, the consumer association, occupies a trusted position with exclusive Bankinter partnership terms (spread from 0.65%, waived commissions).

**The critical gap**: no existing Portuguese calculator combines multi-bank comparison, full upfront cost breakdown (IMT + stamp duty + registration), amortization schedules, stress testing, affordability assessment, and insurance cost integration in a single tool. Doutor Finanças comes closest with its ecosystem, but the tools are fragmented across separate pages.

---

## 2. Standard features every calculator must include

Analysis of 12+ Portuguese calculators reveals a clear baseline that users expect:

**Universal inputs** (found in virtually all calculators): loan amount (€10k–€2M slider or field), loan term (5–40 years), rate type selection (fixed/variable/mixed), and borrower age. More complete bank simulators also collect property purpose (primary/secondary/investment), number of co-borrowers, and cross-selling product selections.

**Universal outputs**: monthly payment using French amortization, TAN (Taxa Anual Nominal), **TAEG** (required by Bank of Portugal regulation in all formal simulations), and **MTIC** (total cost over loan life). Bank simulators also show spread conditions and estimated insurance premiums.

Features present in **70–90%** of calculators include Euribor reference period selection (3/6/12 months), spread display, property purpose selection, and insurance cost indication. Features present in fewer than **50%** include amortization table display, affordability assessment, IMT calculation, stress testing, and early repayment simulation — representing the biggest opportunities for differentiation.

---

## 3. Features that would set a new calculator apart

Based on gap analysis of the Portuguese market and best practices from UK, French, and Spanish mortgage calculators, these features are ranked by **differentiation potential** (high user value combined with low current availability):

### Tier 1: Highest impact differentiators

**Integrated upfront costs calculator** — IMT, stamp duty on purchase (0.8%), stamp duty on mortgage (0.6%), registration/notary fees, bank valuation, and processing fees, all calculated within the main mortgage flow rather than as separate tools. This alone would address the most common complaint from Portuguese first-time buyers: being blindsided by thousands in unexpected costs. A €200,000 primary residence purchase with €160,000 financing generates approximately **€7,300–€8,300** in upfront costs beyond the deposit.

**Euribor stress testing** — showing monthly payment and taxa de esforço under scenarios of Euribor at current rate, +1pp, +2pp, and +3pp. After the 2022–2023 Euribor shock (12-month Euribor rose from negative territory to ~4.2%), Portuguese borrowers viscerally understand rate risk. Only 1–2 existing calculators offer this, and none integrates it with affordability assessment.

**Full early repayment simulation** — allowing users to model partial or total early repayment at any point in the loan, showing savings in total interest and time. Early repayment surged in Portugal after penalties on variable-rate mortgages were temporarily suspended (2022–2025). Doutor Finanças offers this as a separate tool, but no calculator integrates it into the amortization schedule.

**Side-by-side fixed/variable/mixed comparison** — presenting all three rate types simultaneously with identical inputs. Currently, most bank simulators require choosing one type and re-running the simulation manually. Bankinter is a partial exception.

**Reverse calculator ("What house can I afford?")** — given income, existing debts, and desired payment, calculate the maximum property value. This inverts the standard calculator logic and is extremely valuable for early-stage buyers. The French platform La Centrale de Financement offers an elegant three-mode approach: calculate payment from loan, calculate max loan from payment, or optimize term.

### Tier 2: High impact with moderate competition

**Affordability verdict with Bank of Portugal criteria** — a clear pass/fail/warning assessment based on the **50% DSTI limit**, LTV constraints, and age-based term limits. Doutor Finanças and Bankinter partially offer this.

**Insurance cost comparison (bank vs. external)** — showing how bank insurance with spread reduction compares to cheaper external insurance without the reduction. External insurance can be **50–60% cheaper** than bank-offered policies, but the spread reduction partially offsets this. No current calculator models both scenarios.

**Cross-selling impact simulator** — toggling products on/off (salary domiciliation, life insurance, multi-risk insurance, credit card) and instantly seeing the spread and payment change. Bankinter does this best currently, showing specific reductions: life insurance **−0.20pp**, multi-risk **−0.05pp**, salary domiciliation **−0.10pp**.

### Tier 3: Innovative and unique

**Rent vs. buy comparison** — completely absent from the Portuguese market but standard in France (Meilleurtaux). **PDF/Excel report export** — available in the Bank of Spain's simulator but essentially nonexistent in Portugal. **Green mortgage benefits** for energy-efficient properties — Crédito Agrícola offers A+ bonification but no calculator models this. **Historical Euribor visualization** — showing past rate trends to contextualize current rates and stress scenarios.

---

## 4. Comprehensive input specification

A best-in-class calculator should collect data in progressive layers, starting with essential fields and revealing advanced options on demand.

### Essential inputs (minimum viable calculator)

**Property data**: purchase price (€), location (continental Portugal vs. Madeira vs. Açores, for IMT bracket selection), and purpose (primary residence / secondary / investment). **Loan data**: loan amount or deposit percentage, term in years, rate type (fixed/variable/mixed), and for variable rates the Euribor reference period (3/6/12 months). **Borrower data**: age of oldest borrower (determines maximum term), and whether the buyer is ≤35 years old and a first-time buyer (triggers IMT Jovem exemption and Crédito Jovem eligibility).

### Affordability inputs (for taxa de esforço assessment)

Net monthly household income, existing monthly debt obligations (other loans, credit cards), number of co-borrowers, and ages of all borrowers. Employment type (permanent/fixed-term/self-employed) is relevant for bank assessment but not strictly needed for the calculator.

### Advanced inputs (for comprehensive simulation)

Spread (with smart default of ~1.0% for bonified rate), fixed-rate period length (for mixed mortgages), cross-selling product toggles (salary domiciliation, bank life insurance, bank multi-risk insurance, credit card), insurance preference (bank vs. external), property area in m² (for multi-risk insurance estimation), and early repayment amount and timing (for amortization simulation). Smart defaults should minimize friction: **continental Portugal, primary residence, variable rate (Euribor 12M), 30-year term, 90% LTV**.

---

## 5. Output specification: what the calculator should display

### Primary display (above the fold)

The **monthly payment** headline figure with breakdown into principal, interest, and insurance components. **TAEG** and **TAN** side by side. **Total cash needed upfront** — deposit plus all transaction costs — which is the single most actionable number for buyers. A **traffic-light affordability indicator** (green/amber/red) based on taxa de esforço.

### Detailed cost breakdown panel

**Upfront costs table**: IMT (with Jovem exemption if applicable), stamp duty on purchase (0.8%), stamp duty on mortgage (0.6%), registration and notary (~€700–€1,000), bank valuation (~€230–€286), bank processing fee (~€200–€725), and stamp duty on commissions (4%). **Recurring costs**: monthly insurance premiums (life + multi-risk), and account maintenance if applicable. **Lifetime totals**: MTIC, total interest paid, total insurance paid over loan life.

### Amortization schedule

A full monthly/annual table showing payment number, date, payment amount, principal portion, interest portion, and outstanding balance. Graphical visualization of the principal vs. interest crossover point. If early repayment is simulated, the schedule should show the **shortened timeline and interest savings** compared to the base scenario.

### Stress test results

A compact table showing monthly payment and taxa de esforço at current Euribor, +1pp, +2pp, and +3pp. For variable-rate mortgages, this is arguably the most important output after the monthly payment itself.

### Comparison view

If the user selects multiple rate types, display them in parallel columns with identical inputs, highlighting the total cost difference over 5, 10, 20, and 30 years.

---

## 6. Static and reference data to maintain

The calculator requires several data sets that must be updated periodically:

### Euribor rates (update daily or weekly)

As of late February 2026: **3-month Euribor ~2.01%**, **6-month ~2.14%**, **12-month ~2.25%**. These rates have stabilized after falling from the October 2023 peak of ~4.0–4.2% (12-month) through eight ECB rate cuts in 2024. Market expectations suggest Euribor hovering near **2.0–2.2%** through 2026. Source: euribor-rates.eu or ECB Statistical Data Warehouse.

### IMT brackets (update annually, typically January)

**2025 continental Portugal — primary residence**:

| Bracket (€) | Rate | Abatement (€) |
|---|---|---|
| Up to 104,261 | 0% (exempt) | — |
| 104,261–142,618 | 2% | 2,085.22 |
| 142,618–194,458 | 5% | 6,363.76 |
| 194,458–324,058 | 7% | 10,252.92 |
| 324,058–648,022 | 8% | 13,493.50 |
| 648,022–1,128,287 | 6% (flat) | 0 |
| Over 1,128,287 | 7.5% (flat) | 0 |

**2025 continental Portugal — secondary/investment residence**: first bracket taxed at **1%** (not exempt); abatement values differ slightly (e.g., second bracket abatement is €1,042.61). **Autonomous regions (Madeira/Açores)**: bracket thresholds are approximately **25% higher** (e.g., exemption threshold of ~€130,326 for primary residence). **IMT Jovem (≤35, first primary residence)**: full exemption up to **€324,058** (2025) / **€330,539** (2026); partial exemption up to €648,022/€660,982.

Brackets are updated annually by the State Budget law, typically reflecting CPI adjustments of 2–3%.

### Stamp duty rates (relatively stable)

Property acquisition: **0.8%** of the higher of purchase price or VPT. Mortgage contract (≥5 years): **0.6%** of loan amount. Bank commissions: **4%** on all commissions. These rates have been stable for years and change infrequently.

### Insurance benchmarks

Life insurance (seguro de vida): approximate monthly cost per €100,000 of coverage — ages 25–35: **€20–€40**, ages 35–45: **€40–€80**, ages 45–55: **€80–€150**, ages 55–65: **€150–€350**. Multi-risk insurance (seguro multirriscos): approximately **0.08%–0.25%** of reconstruction value annually. Reconstruction value per m²: Zone I (district capitals) **~€925/m²**, Zone II (other municipalities) **~€809/m²**, Zone III (remaining) **~€733/m²**.

### Bank of Portugal regulatory parameters

Maximum DSTI: **50%** (with exceptions: up to 20% of new lending at ≤60%, up to 5% exceeding 60%). DSTI stress buffer: **+1.5pp** for loans with maturity >10 years (revised down from the original +3pp in October 2023). Maximum LTV: **90%** primary residence, **80%** secondary/investment, **100%** bank-owned properties. Maximum term by age: **40 years** (≤30 years old), **37 years** (31–35), **35 years** (>35). Average maturity target per institution: **30 years**.

### IRS mortgage interest deduction

Only available for contracts signed **on or before 31 December 2011**. Deduction: **15%** of interest paid on primary residence mortgage, capped at **€296/year** (standard) or up to **€450/year** for household income ≤€7,703. Contracts from 2012 onward receive no deduction — this benefit was eliminated for new contracts and has not been reinstated despite parliamentary proposals.

---

## 7. Mathematical formulas: the calculation engine

### French amortization (prestação constante)

The standard formula used by all Portuguese banks:

**M = P × [r × (1+r)^n] / [(1+r)^n − 1]**

Where **M** = constant monthly payment, **P** = principal (loan amount), **r** = monthly interest rate (TAN ÷ 12), and **n** = total number of monthly payments. For a **€150,000 loan at 3.5% TAN over 30 years**: r = 0.035/12 = 0.002917, n = 360, M = €673.57/month.

Each payment decomposes into interest (I_k = B_{k-1} × r) and principal (A_k = M − I_k), where B_{k-1} is the outstanding balance before payment k. The outstanding balance at any point k is: **B_k = P × [(1+r)^n − (1+r)^k] / [(1+r)^n − 1]**.

For **variable-rate loans**, the payment recalculates at each Euribor reset (every 3, 6, or 12 months): the new rate r_new = (new Euribor + spread) / 12 is applied to the remaining balance for the remaining term, producing a new constant payment until the next reset. For **mixed-rate mortgages**, the fixed-rate payment applies during the initial period, then at the switch date the remaining balance and remaining term feed into the variable-rate formula.

### TAEG (Annual Percentage Rate of Charge)

Defined by EU Directive 2014/17/EU Annex I and mandatory in Portugal, the TAEG is the rate **X** satisfying:

**P − F = Σ(l=1 to n) [M_l / (1+X)^(l/12)]**

Where **P** = loan principal, **F** = upfront costs deducted at origination, and **M_l** = total outflow in month l (mortgage payment + insurance premiums + monthly fees). This is an internal rate of return equation with no closed-form solution — it requires **iterative numerical methods** (Newton-Raphson or equivalent, as in Excel's IRR function).

Costs that **must** be included in TAEG: all interest, life insurance premiums, multi-risk insurance premiums, bank commissions (opening/study/evaluation/formalisation), stamp duty on commissions (4%), stamp duty on the loan (0.6%), mortgage registration fees, and mandatory account maintenance fees. Costs **excluded**: early repayment penalties, default interest, notarial deed fees, and property taxes (IMT, stamp duty on acquisition).

### IMT calculation

**IMT = max(Purchase Price, VPT) × Applicable Rate − Abatement Amount**

The tax base is the higher of the declared purchase price or the Valor Patrimonial Tributário (tax assessment value). The applicable rate and abatement depend on the bracket. For flat-rate brackets (6% and 7.5% for high-value properties), no abatement applies — simply multiply value by rate. **Worked example**: €200,000 primary residence in continental Portugal (2025) falls in the €194,458–€324,058 bracket → IMT = 200,000 × 7% − 10,252.92 = **€3,747.08**.

The abatement amounts are mathematically derived from the progressive bracket structure using: **Abatement_i = Abatement_{i-1} + Lower_Bound_i × (Rate_i − Rate_{i-1})**. This ensures the tax is continuous across bracket boundaries.

### Stamp duty calculations

Property acquisition: **IS = max(Purchase Price, VPT) × 0.8%**. Mortgage (≥5 years): **IS = Loan Amount × 0.6%**. Bank commissions: **IS = Commission × 4%**. Example for €200,000 property with €160,000 loan: property stamp duty = €1,600, mortgage stamp duty = €960, total = **€2,560** in stamp duty alone.

### Effort rate (taxa de esforço / DSTI)

**Taxa de Esforço = (Total Monthly Debt Obligations ÷ Net Monthly Income) × 100**

The numerator includes the proposed mortgage payment plus all existing loan payments, credit card minimums, and other debt service. The denominator is net household income after tax and social security contributions. **Bank of Portugal threshold: ≤50%**. The stress-test version substitutes the mortgage payment with one calculated at (current Euribor + spread + **1.5pp buffer**) for loans with maturity >10 years.

Banks are required to proactively renegotiate when DSTI exceeds 50%, or when DSTI has increased by ≥5pp and exceeds 36%, for loans with capital ≤€300,000.

### Early repayment penalty

**Penalty = Capital Repaid × Commission Rate**

For variable-rate contracts: maximum **0.5%**. For fixed-rate contracts: maximum **2.0%**. The fixed-rate penalty cannot exceed total interest that would have been paid from the repayment date to the end of the fixed period. After partial repayment, borrowers choose between: **(a) reduce monthly payment** (recalculate M_new with reduced balance and same remaining term) or **(b) reduce loan term** (solve for n_new = −ln(1 − B_new × r / M_old) / ln(1+r), keeping the same payment). Portuguese law requires **7 working days' notice** for partial repayment and **10 working days** for full repayment, coinciding with regular payment dates.

Note: the temporary suspension of early repayment fees on variable-rate primary residence mortgages (2022–2025) expired on **31 December 2025**. As of 2026, the standard 0.5% commission applies again.

### Insurance estimation

**Life insurance**: P_vida ≈ Outstanding Balance × Age-Based Rate Factor × Coverage Multiplier. The premium recalculates annually as the balance decreases (reducing premium) and the borrower ages (increasing premium). Coverage multipliers: death only = 1.0×, death + absolute disability (IAD) = ~1.1×, death + IAD + total permanent disability (ITP 65%) = ~1.3×. For co-borrowers, each insures their share (typically 50% each, or 100% each for full protection).

**Multi-risk insurance**: P_multirriscos ≈ Reconstruction Value × Annual Rate (0.08%–0.25%). Reconstruction value = property area (m²) × cost per m² by zone (€733–€925/m²).

---

## 8. Portuguese regulatory context: the rules that shape every calculation

### Bank of Portugal macroprudential framework

The macroprudential recommendation, in force since **1 July 2018**, operates on a "comply-or-explain" basis — technically non-binding but universally followed. The new BdP Governor (Álvaro Santos Pereira, from December 2025) has signaled intention to make these measures **legally binding**. As of Q3 2025, average new mortgage maturity was **31.9 years**, above the 30-year institutional target, and compliance with the 50% DSTI limit covered **92%** of new lending.

The framework constrains every mortgage through four simultaneous limits: **LTV ≤ 90%** (primary) or 80% (secondary), **DSTI ≤ 50%** (with stress buffer), **term ≤ 35–40 years** (age-dependent), and **regular amortization required** (no interest-only periods). The October 2023 revision reduced the DSTI stress buffer from +3pp to a maturity-graduated scale (+0.5pp for ≤5 years, +1.0pp for 5–10 years, **+1.5pp for >10 years**), responding to the Euribor spike that had made the original buffer excessively restrictive.

### Crédito Habitação Jovem: the 100% financing exception

Introduced by **Decreto-Lei 44/2024**, the state-guaranteed youth mortgage allows borrowers ≤35 years old to access **100% financing** (up to €450,000) with state guarantee covering the portion above 80% LTV. Combined with IMT Jovem (full tax exemption up to €324,058 in 2025), this represents a significant policy push to address Portugal's housing affordability crisis. All major banks now offer this product.

### Insurance: mandatory in practice, not always in law

Only **fire insurance** is legally mandatory (Art. 1429 Código Civil) for properties in horizontal property. However, **life insurance and multi-risk insurance are universally required by banks** as mortgage conditions. Under Decreto-Lei 222/2009 and EU Directive 2014/17/EU, borrowers have the **legal right to choose their own insurer** — banks cannot refuse equivalent external coverage. In practice, banks incentivize their own insurance through spread reductions of **0.15–0.25 percentage points**, creating a genuine trade-off that a calculator should model.

### Typical bank spread structure in 2025–2026

Base spreads (without cross-selling) range from **1.05% to 1.90%**. With full product bundling (salary domiciliation, life insurance, multi-risk insurance, credit/debit card usage), bonified spreads drop to **0.65%–1.05%**. The gap between base and bonified spread — typically **0.40–0.85 percentage points** — represents the implicit cost of cross-sold products, a calculation that no current Portuguese calculator transparently models for users.

---

## Conclusion: the opportunity is in integration

The Portuguese mortgage calculator market's defining weakness is **fragmentation**. Upfront cost calculation, affordability assessment, rate comparison, stress testing, amortization planning, and insurance modeling all exist as separate tools across different platforms. The borrower must visit 4–5 websites, re-enter data each time, and manually synthesize results.

A calculator that unifies these capabilities into a single flow — property price in, complete financial picture out — would occupy an uncontested position. The three highest-impact features to prioritize are: **(1)** integrated upfront costs within the main simulation (IMT + stamp duties + fees = total cash needed), **(2)** Euribor stress testing with real-time affordability impact, and **(3)** early repayment simulation embedded in the amortization schedule. These three features alone address the most common borrower anxieties (hidden costs, rate risk, and long-term flexibility) while being absent from virtually all existing tools.

The regulatory data is well-defined and publicly available, the formulas are standard, and the reference data (Euribor rates, IMT brackets, stamp duty rates) requires only periodic updates. The technical barrier to entry is low. The real differentiator will be **design execution** — presenting complex financial information with the clarity of a Doutor Finanças article, the comparison power of a ComparaJá, and the completeness that no current Portuguese tool achieves.