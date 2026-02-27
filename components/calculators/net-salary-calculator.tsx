"use client";

import { useMemo, useRef, useState } from "react";
import { Briefcase, Check, GitCompareArrows, LayoutList, Share2 } from "lucide-react";
import {
  calculateNetSalary,
  TAX_YEARS,
  REGIONS,
  MEAL_ALLOWANCE_EXEMPT_DAILY,
  DUODECIMOS_OPTIONS,
  IRS_JOVEM_MONTHLY_CAP,
  IRS_JOVEM_EXEMPTION_RATE,
  type MaritalStatus,
  type MealAllowanceType,
  type DuodecimosOption,
  type NetSalaryInput,
  type NetSalaryResult,
  type TaxYear,
  type Region,
} from "@/lib/calculators/net-salary";
import {
  useSalaryParams,
  DEFAULT_SALARY_STATE,
  type SalaryFormState,
  type GrossPeriod,
} from "@/lib/hooks/use-salary-params";
import { cn, formatCurrency } from "@/lib/utils";
import {
  calculateJobDeductions,
  DEFAULT_JOB_COSTS,
  type JobCosts,
} from "@/lib/calculators/job-costs";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PillToggle } from "@/components/ui/pill-toggle";
import { Collapsible } from "@/components/ui/collapsible";
import { FloatingBar } from "@/components/ui/floating-bar";
import { SalaryPayslip } from "@/components/calculators/salary-payslip";
import { JobCostsPanel } from "@/components/calculators/job-costs-panel";

// ─── Types ────────────────────────────────────────────────────────────────────

type Locale = "pt" | "en";

type Strings = {
  title: string;
  subtitle: (year: TaxYear) => string;
  yearLabel: string;
  regionLabel: string;
  formSection: string;
  grossSalary: string;
  grossSalaryHint: string;
  grossSalaryAnnualHint: string;
  grossPeriodMonthly: string;
  grossPeriodAnnual: string;
  maritalStatus: string;
  dependents: string;
  disability: string;
  disabilityHint: string;
  mealAllowance: string;
  mealAllowanceDaily: string;
  advancedToggle: string;
  duodecimosLabel: string;
  duodecimosHint: string;
  irsJovemLabel: string;
  irsJovemHint: string;
  irsJovemCareerYearLabel: string;
  irsJovemCapNote: string;
  netSalaryFloating: string;
  shareLabel: string;
  shareCopied: string;
  singleLabel: string;
  compareLabel: string;
  exitCompare: string;
  scenarioA: string;
  scenarioB: string;
  newJobLabel: string;
  currentJobLabel: string;
  newJobPanelLabel: string;
  newJobDiff: string;
  maritalOptions: { value: MaritalStatus; label: string }[];
  dependentOptions: { value: string; label: string }[];
  mealTypeOptions: { value: MealAllowanceType; label: string }[];
  cashLimitNote: (year: TaxYear) => string;
  cardLimitNote: (year: TaxYear) => string;
};

// ─── Locale strings ───────────────────────────────────────────────────────────

const PT: Strings = {
  title: "Calculadora de Salário Líquido",
  subtitle: (year) =>
    `Calcule o seu salário líquido a partir do salário bruto. Inclui Segurança Social e Retenção na Fonte IRS ${year} (Portugal).`,
  yearLabel: "Ano fiscal",
  regionLabel: "Região",
  formSection: "Os seus dados",
  grossSalary: "Salário Bruto",
  grossSalaryHint: "Salário base mensal — não inclua duodécimos nem subsídios",
  grossSalaryAnnualHint: "Valor anual (14 meses: 12 mensais + sub. férias + sub. natal)",
  grossPeriodMonthly: "Mensal",
  grossPeriodAnnual: "Anual",
  maritalStatus: "Estado Civil",
  dependents: "Número de Dependentes",
  disability: "Pessoa com deficiência",
  disabilityHint: "Grau de incapacidade permanente ≥ 60%",
  mealAllowance: "Subsídio de Alimentação",
  mealAllowanceDaily: "Valor diário (€/dia)",
  advancedToggle: "Mostrar opções avançadas",
  duodecimosLabel: "Subsídios em duodécimos",
  duodecimosHint: "Como recebe os subsídios de férias e Natal",
  irsJovemLabel: "IRS Jovem",
  irsJovemHint: "Regime para trabalhadores até 35 anos, anos 1–10 de carreira",
  irsJovemCareerYearLabel: "Ano de carreira",
  irsJovemCapNote: `Isenção aplicada até ${formatCurrency(IRS_JOVEM_MONTHLY_CAP)}/mês (55 × IAS 2026)`,
  netSalaryFloating: "Salário líquido",
  shareLabel: "Partilhar",
  shareCopied: "Link copiado!",
  singleLabel: "Simples",
  compareLabel: "Comparar",
  exitCompare: "Sair da comparação",
  scenarioA: "Cenário A",
  scenarioB: "Cenário B",
  newJobLabel: "Novo Emprego",
  currentJobLabel: "Emprego Atual",
  newJobPanelLabel: "Novo Emprego",
  newJobDiff: "diferença mensal",
  maritalOptions: [
    { value: "single",         label: "Solteiro/a, Divorciado/a ou Viúvo/a" },
    { value: "married_single", label: "Casado/a — Único Titular"             },
    { value: "married_dual",   label: "Casado/a — Dois Titulares"            },
  ],
  dependentOptions: Array.from({ length: 6 }, (_, i) => ({
    value: String(i),
    label: i === 0 ? "Sem dependentes" : i === 5 ? "5+ dependentes" : `${i} dependente${i > 1 ? "s" : ""}`,
  })),
  mealTypeOptions: [
    { value: "none", label: "Sem subsídio"           },
    { value: "cash", label: "Dinheiro"               },
    { value: "card", label: "Cartão / Vale Refeição" },
  ],
  cashLimitNote: (year) => `Isento até ${formatCurrency(MEAL_ALLOWANCE_EXEMPT_DAILY[year].cash)}/dia`,
  cardLimitNote: (year) => `Isento até ${formatCurrency(MEAL_ALLOWANCE_EXEMPT_DAILY[year].card)}/dia`,
};

const EN: Strings = {
  title: "Net Salary Calculator",
  subtitle: (year) =>
    `Calculate your net take-home pay from gross salary. Includes Social Security and IRS withholding ${year} (Portugal).`,
  yearLabel: "Tax year",
  regionLabel: "Region",
  formSection: "Your details",
  grossSalary: "Gross Salary",
  grossSalaryHint: "Monthly base salary before any deductions",
  grossSalaryAnnualHint: "Annual salary (14 months: 12 monthly + holiday + Christmas subsidy)",
  grossPeriodMonthly: "Monthly",
  grossPeriodAnnual: "Annual",
  maritalStatus: "Marital Status",
  dependents: "Number of Dependants",
  disability: "Person with disability",
  disabilityHint: "Permanent disability ≥ 60%",
  mealAllowance: "Meal Allowance",
  mealAllowanceDaily: "Daily amount (€/day)",
  advancedToggle: "Show advanced options",
  duodecimosLabel: "Holiday/Christmas subsidy payment",
  duodecimosHint: "How you receive your holiday and Christmas subsidies",
  irsJovemLabel: "IRS Jovem",
  irsJovemHint: "Regime for workers aged ≤35, career years 1–10",
  irsJovemCareerYearLabel: "Career year",
  irsJovemCapNote: `Exemption applied up to ${formatCurrency(IRS_JOVEM_MONTHLY_CAP)}/month (55 × IAS 2026)`,
  netSalaryFloating: "Net salary",
  shareLabel: "Share",
  shareCopied: "Link copied!",
  singleLabel: "Single",
  compareLabel: "Compare",
  exitCompare: "Exit comparison",
  scenarioA: "Scenario A",
  scenarioB: "Scenario B",
  newJobLabel: "New Job",
  currentJobLabel: "Current Job",
  newJobPanelLabel: "New Job",
  newJobDiff: "monthly difference",
  maritalOptions: [
    { value: "single",         label: "Single, Divorced or Widowed" },
    { value: "married_single", label: "Married — Single Earner"     },
    { value: "married_dual",   label: "Married — Dual Earners"      },
  ],
  dependentOptions: Array.from({ length: 6 }, (_, i) => ({
    value: String(i),
    label: i === 0 ? "No dependants" : i === 5 ? "5+ dependants" : `${i} dependant${i > 1 ? "s" : ""}`,
  })),
  mealTypeOptions: [
    { value: "none", label: "No allowance"        },
    { value: "cash", label: "Cash"                },
    { value: "card", label: "Card / Meal Voucher" },
  ],
  cashLimitNote: (year) => `Exempt up to ${formatCurrency(MEAL_ALLOWANCE_EXEMPT_DAILY[year].cash)}/day`,
  cardLimitNote: (year) => `Exempt up to ${formatCurrency(MEAL_ALLOWANCE_EXEMPT_DAILY[year].card)}/day`,
};

// ─── Static option arrays ─────────────────────────────────────────────────────

const CAREER_YEAR_OPTIONS_PT = Array.from({ length: 10 }, (_, i) => {
  const y = i + 1;
  const pct = Math.round((IRS_JOVEM_EXEMPTION_RATE[y] ?? 0) * 100);
  return { value: String(y), label: `${y}º ano (${pct}% isento)` };
});

const CAREER_YEAR_OPTIONS_EN = Array.from({ length: 10 }, (_, i) => {
  const y = i + 1;
  const pct = Math.round((IRS_JOVEM_EXEMPTION_RATE[y] ?? 0) * 100);
  return { value: String(y), label: `Year ${y} (${pct}% exempt)` };
});

// ─── Checkbox ─────────────────────────────────────────────────────────────────

function Checkbox({ id, checked, onChange, label, hint }: {
  id: string; checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 px-4 py-3">
      <input
        id={id} type="checkbox" checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
      />
      <div>
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-neutral-700">{label}</label>
        {hint && <p className="mt-0.5 text-xs text-neutral-400">{hint}</p>}
      </div>
    </div>
  );
}

// ─── ShareButton ──────────────────────────────────────────────────────────────

function ShareButton({ label, copiedLabel }: { label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ url }); return; } catch { /* fall through */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      clearTimeout(timer.current);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 2500);
    } catch { /* clipboard unavailable */ }
  }

  return (
    <button
      onClick={handleShare}
      aria-label={label}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      {copied ? (
        <><Check className="h-3.5 w-3.5 text-success-600" /><span className="text-success-600">{copiedLabel}</span></>
      ) : (
        <><Share2 className="h-3.5 w-3.5" /><span>{label}</span></>
      )}
    </button>
  );
}

// ─── ScenarioPanel ────────────────────────────────────────────────────────────
// Renders the input form + payslip for a single scenario.
// Self-contained: computes its own result from the passed state.

type ScenarioPanelProps = {
  state: SalaryFormState;
  setState: (s: SalaryFormState) => void;
  locale: Locale;
  /** When set, shown as the card header label instead of the default "Os seus dados" */
  scenarioLabel?: string;
  /** Extra controls to render in the card header (e.g. Share button) */
  headerActions?: React.ReactNode;
  /** Ref forwarded to the payslip wrapper for scroll-into-view on mobile */
  resultsRef?: React.RefObject<HTMLDivElement | null>;
  /** Whether to use the side-by-side (lg) layout within this panel (compare mode) */
  stacked?: boolean;
  /** When provided, the payslip renders inline B − A delta chips for each row. */
  comparisonResult?: NetSalaryResult | null;
  /** Controlled period for the payslip period toggle (compare mode sync). */
  period?: import("@/components/calculators/salary-payslip").Period;
  onPeriodChange?: (p: import("@/components/calculators/salary-payslip").Period) => void;
};

function ScenarioPanel({
  state, setState, locale, scenarioLabel, headerActions, resultsRef, stacked = false,
  comparisonResult, period, onPeriodChange,
}: ScenarioPanelProps) {
  const t = locale === "en" ? EN : PT;

  function set<K extends keyof SalaryFormState>(key: K, value: SalaryFormState[K]) {
    setState({ ...state, [key]: value });
  }

  const {
    year, region, grossInput, grossPeriod, maritalStatus, dependentsCount,
    disability, mealType, mealAmountInput, duodecimos,
    irsJovemActive, irsJovemYear,
  } = state;

  // When the user switches period, convert the current value so the monthly
  // figure stays consistent. E.g. "21 000 annual" → "1 500 monthly" (÷14).
  function handleGrossPeriodChange(newPeriod: GrossPeriod) {
    const raw = parseFloat(grossInput.replace(",", "."));
    if (raw > 0 && newPeriod !== grossPeriod) {
      const converted = grossPeriod === "monthly" ? raw * 14 : raw / 14;
      // Trim trailing zeros but keep up to 2 decimal places
      const formatted = converted % 1 === 0
        ? String(Math.round(converted))
        : converted.toFixed(2).replace(/\.?0+$/, "");
      setState({ ...state, grossInput: formatted, grossPeriod: newPeriod });
    } else {
      set("grossPeriod", newPeriod);
    }
  }

  // Always feed the calculation engine a monthly figure
  const grossValue = (() => {
    const raw = parseFloat(grossInput.replace(",", ".")) || 0;
    return grossPeriod === "annual" ? raw / 14 : raw;
  })();
  const mealAmount = parseFloat(mealAmountInput.replace(",", ".")) || 0;
  const hasResult  = grossValue > 0;

  const input: NetSalaryInput = useMemo(() => ({
    grossSalary: grossValue,
    maritalStatus,
    dependentsCount,
    mealAllowanceDaily: mealAmount,
    mealAllowanceType: mealType,
    region,
    disability,
    duodecimos,
    irsJovem: { active: irsJovemActive, careerYear: irsJovemYear },
    year,
  }), [grossValue, maritalStatus, dependentsCount, mealAmount, mealType, region, disability, duodecimos, irsJovemActive, irsJovemYear, year]);

  const result = useMemo(() => hasResult ? calculateNetSalary(input) : null, [input, hasResult]);

  const careerYearOptions = locale === "en" ? CAREER_YEAR_OPTIONS_EN : CAREER_YEAR_OPTIONS_PT;
  const yearOptions       = TAX_YEARS.map((y) => ({ value: String(y), label: String(y) }));
  const regionOptions     = REGIONS.map((r) => ({ value: r.value, label: locale === "en" ? r.labelEn : r.labelPt }));
  const duodecimosOptions = DUODECIMOS_OPTIONS.map((d) => ({ value: d.value, label: locale === "en" ? d.labelEn : d.labelPt }));

  const inner = (
    <div className={stacked ? "flex flex-col gap-4" : "flex flex-col gap-6 lg:flex-row lg:items-start"}>

      {/* Form */}
      <div className={stacked ? "w-full" : "w-full lg:max-w-md lg:shrink-0"}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold text-neutral-900">
              {scenarioLabel ?? t.formSection}
            </h2>
            {headerActions}
          </CardHeader>
          <CardBody className="space-y-6">

            {/* Year + Region */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">{t.yearLabel}</label>
                <div className="flex h-9 items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm font-medium text-neutral-700">
                  {year}
                </div>
              </div>
              <Select
                label={t.regionLabel}
                options={regionOptions}
                value={region}
                onChange={(e) => set("region", e.target.value as Region)}
              />
            </div>

            {/* Gross salary + period toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-neutral-700">{t.grossSalary}</label>
                <PillToggle
                  options={[
                    { value: "monthly", label: t.grossPeriodMonthly },
                    { value: "annual",  label: t.grossPeriodAnnual  },
                  ]}
                  value={grossPeriod}
                  onChange={(v) => handleGrossPeriodChange(v as GrossPeriod)}
                />
              </div>
              <Input
                type="text" inputMode="decimal"
                placeholder={grossPeriod === "annual" ? "Ex: 21 000" : "Ex: 1 500"}
                hint={grossPeriod === "annual" ? t.grossSalaryAnnualHint : t.grossSalaryHint}
                value={grossInput}
                onChange={(e) => set("grossInput", e.target.value)}
              />
            </div>

            {/* Marital status */}
            <Select
              label={t.maritalStatus} options={t.maritalOptions}
              value={maritalStatus} onChange={(e) => set("maritalStatus", e.target.value as MaritalStatus)}
            />

            {/* Dependents */}
            <Select
              label={t.dependents} options={t.dependentOptions}
              value={String(dependentsCount)} onChange={(e) => set("dependentsCount", parseInt(e.target.value, 10))}
            />

            {/* Disability */}
            <Checkbox
              id={`disability-${scenarioLabel ?? "main"}`}
              checked={disability} onChange={(v) => set("disability", v)}
              label={t.disability} hint={t.disabilityHint}
            />

            {/* Meal allowance */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-700">{t.mealAllowance}</label>
              <PillToggle options={t.mealTypeOptions} value={mealType} onChange={(v) => set("mealType", v as MealAllowanceType)} />
              {mealType !== "none" && (
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                  <Input
                    label={t.mealAllowanceDaily}
                    hint={mealType === "card" ? t.cardLimitNote(year) : t.cashLimitNote(year)}
                    type="text" inputMode="decimal" placeholder="Ex: 7.63"
                    value={mealAmountInput} onChange={(e) => set("mealAmountInput", e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Advanced options */}
            <div className="rounded-lg border border-neutral-200">
              <Collapsible
                trigger={<span className="text-sm font-medium text-primary-600">{t.advancedToggle}</span>}
                triggerClassName="px-4 py-3"
                contentClassName="space-y-5 border-t border-neutral-100 px-4 pb-4 pt-4"
              >
                {/* Duodécimos */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">{t.duodecimosLabel}</label>
                  <p className="text-xs text-neutral-400">{t.duodecimosHint}</p>
                  <Select
                    options={duodecimosOptions} value={duodecimos}
                    onChange={(e) => set("duodecimos", e.target.value as DuodecimosOption)}
                  />
                </div>

                {/* IRS Jovem */}
                <div className="space-y-3">
                  <Checkbox
                    id={`irs-jovem-${scenarioLabel ?? "main"}`}
                    checked={irsJovemActive} onChange={(v) => set("irsJovemActive", v)}
                    label={t.irsJovemLabel} hint={t.irsJovemHint}
                  />
                  {irsJovemActive && (
                    <div className="space-y-2 rounded-lg border border-primary-100 bg-primary-50 p-3">
                      <Select
                        label={t.irsJovemCareerYearLabel}
                        options={careerYearOptions}
                        value={String(irsJovemYear)}
                        onChange={(e) => set("irsJovemYear", parseInt(e.target.value, 10))}
                      />
                      <p className="text-xs text-primary-600">{t.irsJovemCapNote}</p>
                    </div>
                  )}
                </div>
              </Collapsible>
            </div>

          </CardBody>
        </Card>
      </div>

      {/* Payslip */}
      <div ref={resultsRef} className={stacked ? "w-full" : "w-full lg:sticky lg:top-20 lg:min-w-0"}>
        <SalaryPayslip
          result={result}
          locale={locale}
          disabilityFallback={false}
          comparisonResult={comparisonResult}
          period={period}
          onPeriodChange={onPeriodChange}
        />
      </div>

    </div>
  );

  return { inner, result, hasResult };
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = { locale?: Locale };

export function NetSalaryCalculator({ locale = "pt" }: Props) {
  const t = locale === "en" ? EN : PT;

  // ── Scenario A — URL + localStorage sync ──
  const [stateA, setStateA] = useSalaryParams();

  // ── Scenario B — local state only; initialised from A when a dual mode activates ──
  const [stateB, setStateB] = useState<SalaryFormState>(DEFAULT_SALARY_STATE);

  // ── Mode: single | compare | new_job ──
  const [mode, setMode] = useState<"single" | "compare" | "new_job">("single");
  const [activeTab, setActiveTab] = useState<"a" | "b">("a");
  // Shared period for both payslips in compare/new-job mode so toggling one syncs the other.
  const [comparePeriod, setComparePeriod] = useState<import("@/components/calculators/salary-payslip").Period>("monthly");

  // ── Job costs state for new job mode ──
  const [jobCostsA, setJobCostsA] = useState<JobCosts>(DEFAULT_JOB_COSTS);
  const [jobCostsB, setJobCostsB] = useState<JobCosts>(DEFAULT_JOB_COSTS);

  const resultsRefA = useRef<HTMLDivElement | null>(null);
  const resultsRefB = useRef<HTMLDivElement | null>(null);

  function handleModeChange(newMode: "single" | "compare" | "new_job") {
    if (newMode !== "single" && mode === "single") {
      setStateB({ ...stateA }); // Pre-fill B from current A on first activation
    }
    setActiveTab("a");
    setMode(newMode);
  }

  // ── Scenario panel props vary by mode ──
  const isDualMode = mode !== "single";

  const panelA = ScenarioPanel({
    state: stateA,
    setState: setStateA,
    locale,
    scenarioLabel:
      mode === "compare"
        ? t.scenarioA
        : mode === "new_job"
          ? t.currentJobLabel
          : undefined,
    headerActions:
      mode === "single" ? (
        <ShareButton label={t.shareLabel} copiedLabel={t.shareCopied} />
      ) : undefined,
    resultsRef: resultsRefA,
    stacked: isDualMode,
    period: isDualMode ? comparePeriod : undefined,
    onPeriodChange: isDualMode ? setComparePeriod : undefined,
    // null signals "in compare mode, panel A — reserve delta space but show no deltas"
    comparisonResult: mode === "compare" ? null : undefined,
  });

  const panelB = ScenarioPanel({
    state: stateB,
    setState: setStateB,
    locale,
    scenarioLabel:
      mode === "compare" ? t.scenarioB : t.newJobPanelLabel,
    resultsRef: resultsRefB,
    stacked: true,
    // Show delta chips only in compare mode, not new job mode
    comparisonResult: mode === "compare" ? panelA.result : undefined,
    period: comparePeriod,
    onPeriodChange: setComparePeriod,
  });

  const tabOptions =
    mode === "new_job"
      ? [
          { value: "a", label: t.currentJobLabel },
          { value: "b", label: t.newJobPanelLabel },
        ]
      : [
          { value: "a", label: t.scenarioA },
          { value: "b", label: t.scenarioB },
        ];

  // ── Job cost deductions (new job mode) ──
  const deductionsA =
    mode === "new_job" && panelA.result
      ? calculateJobDeductions(panelA.result.netSalary, jobCostsA)
      : null;
  const deductionsB =
    mode === "new_job" && panelB.result
      ? calculateJobDeductions(panelB.result.netSalary, jobCostsB)
      : null;

  const modeOptions = [
    { id: "single" as const, label: t.singleLabel, Icon: LayoutList },
    { id: "compare" as const, label: t.compareLabel, Icon: GitCompareArrows },
    { id: "new_job" as const, label: t.newJobLabel, Icon: Briefcase },
  ];

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">

        {/* Page header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t.title}</h1>
            <p className="mt-2 text-sm text-neutral-500 sm:text-base">{t.subtitle(stateA.year)}</p>
          </div>

          {/* Mode switcher */}
          <div className="flex overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 shrink-0">
            {modeOptions.map(({ id, label, Icon }, idx) => (
              <button
                key={id}
                onClick={() => handleModeChange(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500",
                  idx > 0 && "border-l border-neutral-200",
                  mode === id
                    ? "bg-white text-primary-700 shadow-sm"
                    : "text-neutral-500 hover:bg-white/70 hover:text-neutral-700",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Single mode ── */}
        {mode === "single" && panelA.inner}

        {/* ── Compare mode ── */}
        {mode === "compare" && (
          <div className="space-y-4">
            {/* Mobile tab switcher */}
            <div className="lg:hidden">
              <PillToggle
                options={tabOptions}
                value={activeTab}
                onChange={(v) => setActiveTab(v as "a" | "b")}
                className="w-full"
              />
            </div>
            {/* Two-column grid — desktop shows both; mobile shows only active tab */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className={activeTab === "a" ? undefined : "hidden lg:block"}>
                {panelA.inner}
              </div>
              <div className={activeTab === "b" ? undefined : "hidden lg:block"}>
                {panelB.inner}
              </div>
            </div>
          </div>
        )}

        {/* ── New job mode ── */}
        {mode === "new_job" && (
          <div className="space-y-4">

            {/* Comparison summary banner */}
            {deductionsA && deductionsB && (
              <Card className="border-primary-200 bg-primary-50">
                <CardBody className="flex items-center justify-around gap-4 py-4">
                  <div className="text-center">
                    <p className="text-xs font-medium text-neutral-500">{t.currentJobLabel}</p>
                    <p className="mt-0.5 text-2xl font-bold tabular-nums text-neutral-900">
                      {formatCurrency(deductionsA.adjustedNetSalary)}
                    </p>
                    <p className="text-xs text-neutral-400">{formatCurrency(deductionsA.adjustedHourlyRate)}/h</p>
                  </div>
                  <div className="text-center">
                    {(() => {
                      const diff = deductionsB.adjustedNetSalary - deductionsA.adjustedNetSalary;
                      const isPositive = diff > 0.005;
                      const isNegative = diff < -0.005;
                      return (
                        <>
                          <p className={cn(
                            "text-xl font-bold tabular-nums",
                            isPositive && "text-success-600",
                            isNegative && "text-error-600",
                            !isPositive && !isNegative && "text-neutral-400",
                          )}>
                            {isPositive ? "+" : isNegative ? "−" : ""}
                            {formatCurrency(Math.abs(diff))}
                          </p>
                          <p className="text-xs text-neutral-400">{t.newJobDiff}</p>
                        </>
                      );
                    })()}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-neutral-500">{t.newJobPanelLabel}</p>
                    <p className="mt-0.5 text-2xl font-bold tabular-nums text-neutral-900">
                      {formatCurrency(deductionsB.adjustedNetSalary)}
                    </p>
                    <p className="text-xs text-neutral-400">{formatCurrency(deductionsB.adjustedHourlyRate)}/h</p>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Mobile tab switcher */}
            <div className="lg:hidden">
              <PillToggle
                options={tabOptions}
                value={activeTab}
                onChange={(v) => setActiveTab(v as "a" | "b")}
                className="w-full"
              />
            </div>

            {/* Two-column grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className={activeTab === "a" ? undefined : "hidden lg:block"}>
                <div className="space-y-4">
                  {panelA.inner}
                  <JobCostsPanel
                    costs={jobCostsA}
                    setCosts={setJobCostsA}
                    locale={locale}
                    netSalary={panelA.result?.netSalary ?? null}
                  />
                </div>
              </div>
              <div className={activeTab === "b" ? undefined : "hidden lg:block"}>
                <div className="space-y-4">
                  {panelB.inner}
                  <JobCostsPanel
                    costs={jobCostsB}
                    setCosts={setJobCostsB}
                    locale={locale}
                    netSalary={panelB.result?.netSalary ?? null}
                  />
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Mobile floating bar — single mode only (dual modes use tabs so user sees the payslip) */}
      {mode === "single" && (
        <>
          <FloatingBar
            label={t.netSalaryFloating}
            value={panelA.result ? formatCurrency(panelA.result.netSalary) : "—"}
            visible={panelA.hasResult}
            onClick={() => resultsRefA.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          />
          {panelA.hasResult && <div className="h-16 lg:hidden" aria-hidden />}
        </>
      )}
    </>
  );
}
