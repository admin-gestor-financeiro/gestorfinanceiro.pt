"use client";

import { useState, useMemo, useRef } from "react";
import { Info, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateImt,
  PROPERTY_TYPE_OPTIONS,
  REGION_OPTIONS,
  IMPOSTO_SELO_RATE,
  type ImtInput,
  type ImtRegion,
  type PropertyType,
  type ImtJovemStatus,
  type ImtResult,
  IMT_JOVEM_IS_THRESHOLD,
} from "@/lib/calculators/imt";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PillToggle } from "@/components/ui/pill-toggle";
import { Collapsible } from "@/components/ui/collapsible";
import { Select } from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

type Locale = "pt" | "en";
type Mode = "single" | "compare";

type ImtFormState = {
  id: string;
  label: string;
  rawValue: string;
  propertyType: PropertyType;
  region: ImtRegion;
  jovemEnabled: boolean;
  jovemBuyers: "full" | "half";
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SCENARIO_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;
const MAX_SCENARIOS = 10;

// ─── Strings ──────────────────────────────────────────────────────────────────

const STRINGS = {
  pt: {
    title: "Simulador de IMT e Imposto de Selo",
    subtitle: "Calcule os impostos de aquisição de imóvel em Portugal · Tabelas 2026",
    formSection: "Dados do Imóvel",
    valueLabel: "Valor de Aquisição (€)",
    valueHint: "Introduza o maior entre o valor de escritura e o VPT",
    valuePlaceholder: "0",
    propertyTypeLabel: "Tipo de Imóvel",
    regionLabel: "Região",
    offshoreNote: "Aplica-se apenas a pessoas coletivas (empresas) domiciliadas em jurisdições com regime fiscal mais favorável.",
    imtJovemSection: "IMT Jovem",
    imtJovemDescription: "Isenção para compradores com ≤ 35 anos na primeira habitação própria e permanente (D.L. n.º 48-A/2024).",
    imtJovemBuyersLabel: "Compradores elegíveis",
    imtJovemFull: "Comprador único ou ambos elegíveis",
    imtJovemHalf: "Apenas 1 de 2 compradores elegível (50% do benefício)",
    imtJovemFullShort: "Todos elegíveis",
    imtJovemHalfShort: "1 de 2 elegível",
    imtJovemConditions: "Condições: ≤ 35 anos · primeira habitação · sem imóvel nos últimos 3 anos · não dependente fiscal · imóvel já construído.",
    imtJovemThresholdHint: (amount: string) => `Isenção total de IMT e IS até ${amount}`,
    resultsTitle: "Impostos a pagar",
    imtLabel: "IMT",
    isLabel: "Imposto de Selo",
    totalLabel: "Total",
    effectiveRateLabel: "Taxa efetiva",
    effectiveRateHint: "Total de impostos sobre o valor de aquisição",
    bracketTitle: "Detalhe por escalão",
    bracketColBracket: "Escalão",
    bracketColRate: "Taxa",
    bracketColBase: "Base",
    bracketColImt: "IMT",
    bracketRangeLabel: (from: string, to: string | null) =>
      to ? `${from} – ${to}` : `Acima de ${from}`,
    bracketFlatLabel: "Taxa fixa sobre valor total",
    bracketExemptLabel: "Isento",
    emptyState: "Introduza o valor de aquisição para calcular os impostos.",
    disclaimer:
      "Simulação de carácter informativo baseada nas tabelas de IMT 2026 (OE 2026 — atualização de 2% sobre os escalões de 2025). Consulte sempre um profissional antes de tomar decisões.",
    jovemHalfNote: "Redução de 50% aplicada ao benefício IMT Jovem (apenas 1 de 2 compradores elegível).",
    singleMode: "Simples",
    compareMode: "Comparar",
    addScenario: "Adicionar Imóvel",
    removeScenario: "Remover cenário",
    scenarioLabel: (letter: string) => `Imóvel ${letter}`,
    comparisonTitle: "Comparação de Cenários",
    comparisonColScenario: "Cenário",
    comparisonColValue: "Valor",
    comparisonColTotal: "Total Impostos",
    bestLabel: "Melhor",
    worstLabel: "Pior",
  },
  en: {
    title: "IMT & Stamp Duty Simulator",
    subtitle: "Calculate property acquisition taxes in Portugal · 2026 tables",
    formSection: "Property Details",
    valueLabel: "Purchase Value (€)",
    valueHint: "Enter the higher of the deed value and the VPT (tax value)",
    valuePlaceholder: "0",
    propertyTypeLabel: "Property Type",
    regionLabel: "Region",
    offshoreNote: "Applies only to legal persons (companies) domiciled in jurisdictions with a preferential tax regime.",
    imtJovemSection: "IMT Jovem (Youth Exemption)",
    imtJovemDescription: "Exemption for buyers aged ≤ 35 purchasing their first primary residence (D.L. n.º 48-A/2024).",
    imtJovemBuyersLabel: "Eligible buyers",
    imtJovemFull: "Single buyer or both buyers eligible",
    imtJovemHalf: "Only 1 of 2 buyers eligible (50% of benefit)",
    imtJovemFullShort: "All eligible",
    imtJovemHalfShort: "1 of 2 eligible",
    imtJovemConditions: "Conditions: ≤ 35 years old · first home · no property owned in last 3 years · not a fiscal dependent · property already built.",
    imtJovemThresholdHint: (amount: string) => `Full IMT & Stamp Duty exemption up to ${amount}`,
    resultsTitle: "Taxes payable",
    imtLabel: "IMT",
    isLabel: "Stamp Duty",
    totalLabel: "Total",
    effectiveRateLabel: "Effective rate",
    effectiveRateHint: "Total taxes as a percentage of purchase value",
    bracketTitle: "Bracket breakdown",
    bracketColBracket: "Bracket",
    bracketColRate: "Rate",
    bracketColBase: "Base",
    bracketColImt: "IMT",
    bracketRangeLabel: (from: string, to: string | null) =>
      to ? `${from} – ${to}` : `Above ${from}`,
    bracketFlatLabel: "Flat rate on full value",
    bracketExemptLabel: "Exempt",
    emptyState: "Enter the purchase value to calculate the applicable taxes.",
    disclaimer:
      "For informational purposes only, based on 2026 IMT tables (OE 2026 — 2% uplift on 2025 thresholds). Always consult a professional before making decisions.",
    jovemHalfNote: "50% reduction applied to the IMT Jovem benefit (only 1 of 2 buyers eligible).",
    singleMode: "Single",
    compareMode: "Compare",
    addScenario: "Add Property",
    removeScenario: "Remove scenario",
    scenarioLabel: (letter: string) => `Property ${letter}`,
    comparisonTitle: "Scenario Comparison",
    comparisonColScenario: "Scenario",
    comparisonColValue: "Value",
    comparisonColTotal: "Total Taxes",
    bestLabel: "Best",
    worstLabel: "Worst",
  },
} as const;

// ─── Module-level helpers ─────────────────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID();
}

function formatThousands(input: string, decSep: string): string {
  const stripped = input
    .replace(/\s/g, "")
    .replace(new RegExp(`[^\\d${decSep}]`, "g"), "");
  const sepIdx = stripped.indexOf(decSep);
  const intPart = sepIdx >= 0 ? stripped.slice(0, sepIdx) : stripped;
  const decPart = sepIdx >= 0 ? stripped.slice(sepIdx) : "";
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return formattedInt + decPart;
}

function parseValue(rawValue: string): number {
  return parseFloat(rawValue.replace(/\u00a0|\s/g, "").replace(",", ".")) || 0;
}

function computeResult(state: ImtFormState): ImtResult | null {
  const transactionValue = parseValue(state.rawValue);
  if (transactionValue <= 0) return null;
  const imtJovemStatus: ImtJovemStatus =
    state.propertyType === "hpp" && state.jovemEnabled ? state.jovemBuyers : "none";
  const input: ImtInput = {
    transactionValue,
    propertyType: state.propertyType,
    region: state.region,
    imtJovemStatus,
  };
  return calculateImt(input);
}

function fmtEur(v: number, fmtLocale: string): string {
  return v.toLocaleString(fmtLocale, { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function defaultScenario(letter: string, locale: Locale): ImtFormState {
  return {
    id: generateId(),
    label: STRINGS[locale].scenarioLabel(letter),
    rawValue: "",
    propertyType: "hpp",
    region: "continente",
    jovemEnabled: false,
    jovemBuyers: "full",
  };
}

// ─── ScenarioPanel (compare mode) ─────────────────────────────────────────────

type ScenarioPanelProps = {
  state: ImtFormState;
  setState: (s: ImtFormState) => void;
  locale: Locale;
  onRemove: () => void;
  canRemove: boolean;
};

function ScenarioPanel({ state, setState, locale, onRemove, canRemove }: ScenarioPanelProps) {
  const t = STRINGS[locale];
  const fmtLocale = locale === "pt" ? "pt-PT" : "en-GB";
  const decSep = locale === "pt" ? "," : ".";

  const propertyTypeOptions = PROPERTY_TYPE_OPTIONS.map((o) => ({
    value: o.value,
    label: locale === "pt" ? o.labelPt : o.labelEn,
  }));
  const regionOptions = REGION_OPTIONS.map((o) => ({
    value: o.value,
    label: locale === "pt" ? o.labelPt : o.labelEn,
  }));

  const result = useMemo(() => computeResult(state), [state]);

  function set<K extends keyof ImtFormState>(key: K, value: ImtFormState[K]) {
    setState({ ...state, [key]: value });
  }

  function fmt(v: number) {
    return v.toLocaleString(fmtLocale, { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
  }
  function fmtPct(v: number) {
    return (v * 100).toLocaleString(fmtLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <h3 className="font-semibold text-neutral-900">{state.label}</h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={t.removeScenario}
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </CardHeader>

      <CardBody className="space-y-4">

        {/* Value */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">{t.valueLabel}</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400 text-sm">
              €
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={state.rawValue}
              onChange={(e) => set("rawValue", formatThousands(e.target.value, decSep))}
              placeholder={t.valuePlaceholder}
              className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-8 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* Region */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">{t.regionLabel}</label>
          <PillToggle
            options={regionOptions}
            value={state.region}
            onChange={(v) => set("region", v as ImtRegion)}
          />
        </div>

        {/* Property type */}
        <Select
          label={t.propertyTypeLabel}
          options={propertyTypeOptions}
          value={state.propertyType}
          onChange={(e) => {
            const next: ImtFormState = { ...state, propertyType: e.target.value as PropertyType };
            if (e.target.value !== "hpp") next.jovemEnabled = false;
            setState(next);
          }}
        />

        {/* IMT Jovem toggle (compact) */}
        {state.propertyType === "hpp" && (
          <div className="rounded-lg border border-neutral-200">
            <button
              type="button"
              onClick={() => set("jovemEnabled", !state.jovemEnabled)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left"
            >
              <span className="text-xs font-medium text-neutral-700">{t.imtJovemSection}</span>
              <div className={cn(
                "ml-3 flex h-5 w-9 shrink-0 items-center rounded-full border-2 transition-colors duration-200",
                state.jovemEnabled ? "border-primary-500 bg-primary-500" : "border-neutral-300 bg-neutral-200"
              )}>
                <span className={cn(
                  "block h-3 w-3 rounded-full bg-white shadow transition-transform duration-200",
                  state.jovemEnabled ? "translate-x-4" : "translate-x-0.5"
                )} />
              </div>
            </button>
            <p className="flex items-center gap-1.5 border-t border-neutral-100 px-3 py-2 text-xs text-primary-600">
              <Info className="h-3 w-3 shrink-0" />
              {t.imtJovemThresholdHint(fmtEur(IMT_JOVEM_IS_THRESHOLD[state.region], fmtLocale))}
            </p>
            {state.jovemEnabled && (
              <div className="flex gap-2 border-t border-neutral-100 px-3 pb-3 pt-2">
                {(["full", "half"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set("jovemBuyers", opt)}
                    className={cn(
                      "flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors",
                      state.jovemBuyers === opt
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-neutral-300 bg-white text-neutral-700 hover:border-primary-400 hover:text-primary-700"
                    )}
                  >
                    {opt === "full" ? t.imtJovemFullShort : t.imtJovemHalfShort}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mini results */}
        {result && (
          <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 pt-4">
            <SummaryCard
              label={t.imtLabel}
              value={result.imtExempt ? (locale === "pt" ? "Isento" : "Exempt") : fmt(result.imtAmount)}
              exempt={result.imtExempt}
            />
            <SummaryCard
              label={t.isLabel}
              value={fmt(result.impostoSeloAmount)}
            />
            <SummaryCard
              label={t.totalLabel}
              value={fmt(result.totalTax)}
              highlight
            />
            <SummaryCard
              label={t.effectiveRateLabel}
              value={fmtPct(result.effectiveRate)}
            />
          </div>
        )}

      </CardBody>
    </Card>
  );
}

// ─── ComparisonTable ──────────────────────────────────────────────────────────

function ComparisonTable({ scenarios, locale }: { scenarios: ImtFormState[]; locale: Locale }) {
  const t = STRINGS[locale];
  const fmtLocale = locale === "pt" ? "pt-PT" : "en-GB";

  function fmt(v: number) {
    return v.toLocaleString(fmtLocale, { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
  }
  function fmtPct(v: number) {
    return (v * 100).toLocaleString(fmtLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
  }

  const rows = scenarios.map((s) => ({ state: s, result: computeResult(s) }));
  const computed = rows.filter((r) => r.result !== null);
  const totals = computed.map((r) => r.result!.totalTax);
  const minTotal = computed.length >= 2 ? Math.min(...totals) : null;
  const maxTotal = computed.length >= 2 ? Math.max(...totals) : null;

  function isBest(result: ImtResult | null): boolean {
    return minTotal !== null && result !== null && Math.abs(result.totalTax - minTotal) < 0.01;
  }
  function isWorst(result: ImtResult | null): boolean {
    return (
      maxTotal !== null &&
      minTotal !== null &&
      result !== null &&
      Math.abs(result.totalTax - maxTotal) < 0.01 &&
      Math.abs(maxTotal - minTotal) >= 0.01
    );
  }

  const exemptLabel = locale === "pt" ? "Isento" : "Exempt";

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-neutral-900">{t.comparisonTitle}</h2>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50 text-xs text-neutral-500">
              <th className="px-5 py-3 text-left font-medium">{t.comparisonColScenario}</th>
              <th className="px-5 py-3 text-right font-medium">{t.comparisonColValue}</th>
              <th className="px-5 py-3 text-right font-medium">{t.imtLabel}</th>
              <th className="px-5 py-3 text-right font-medium">{t.isLabel}</th>
              <th className="px-5 py-3 text-right font-medium">{t.comparisonColTotal}</th>
              <th className="px-5 py-3 text-right font-medium">{t.effectiveRateLabel}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map(({ state, result }) => {
              const best = isBest(result);
              const worst = isWorst(result);
              return (
                <tr
                  key={state.id}
                  className={cn(
                    "transition-colors",
                    best ? "bg-green-50" : worst ? "bg-red-50" : "hover:bg-neutral-50"
                  )}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-800">{state.label}</span>
                      {best && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          {t.bestLabel}
                        </span>
                      )}
                      {worst && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          {t.worstLabel}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-neutral-600">
                    {result ? fmt(parseValue(state.rawValue)) : <span className="text-neutral-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-neutral-700">
                    {result ? (
                      result.imtExempt ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          {exemptLabel}
                        </span>
                      ) : (
                        fmt(result.imtAmount)
                      )
                    ) : (
                      <span className="text-neutral-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-neutral-700">
                    {result ? fmt(result.impostoSeloAmount) : <span className="text-neutral-300">—</span>}
                  </td>
                  <td
                    className={cn(
                      "px-5 py-3 text-right tabular-nums font-semibold",
                      best ? "text-green-700" : worst ? "text-red-700" : "text-neutral-900"
                    )}
                  >
                    {result ? fmt(result.totalTax) : <span className="font-normal text-neutral-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-neutral-600">
                    {result ? fmtPct(result.effectiveRate) : <span className="text-neutral-300">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── ImtCalculator ────────────────────────────────────────────────────────────

type ImtCalculatorProps = { locale?: Locale };

export function ImtCalculator({ locale = "pt" }: ImtCalculatorProps) {
  const t = STRINGS[locale];
  const fmtLocale = locale === "pt" ? "pt-PT" : "en-GB";
  const decSep = locale === "pt" ? "," : ".";

  const [mode, setMode] = useState<Mode>("single");
  const [scenarios, setScenarios] = useState<ImtFormState[]>(() => [
    defaultScenario("A", locale),
  ]);

  // Tracks how many scenarios have ever been created so labels are always unique
  const scenarioCounter = useRef(0);

  const propertyTypeOptions = PROPERTY_TYPE_OPTIONS.map((o) => ({
    value: o.value,
    label: locale === "pt" ? o.labelPt : o.labelEn,
  }));
  const regionOptions = REGION_OPTIONS.map((o) => ({
    value: o.value,
    label: locale === "pt" ? o.labelPt : o.labelEn,
  }));

  // ── Scenario management ──────────────────────────────────────────────────

  function updateScenario(id: string, updated: ImtFormState) {
    setScenarios((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  function removeScenario(id: string) {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }

  function addScenario() {
    if (scenarios.length >= MAX_SCENARIOS) return;
    scenarioCounter.current += 1;
    const letter = SCENARIO_LETTERS[scenarioCounter.current] ?? String(scenarioCounter.current + 1);
    setScenarios((prev) => [...prev, defaultScenario(letter, locale)]);
  }

  function handleModeChange(newMode: Mode) {
    if (newMode === "compare" && scenarios.length === 1) {
      scenarioCounter.current = 1;
      setScenarios((prev) => [...prev, defaultScenario("B", locale)]);
    }
    setMode(newMode);
  }

  // ── Single mode: always driven from scenarios[0] ─────────────────────────

  const s0 = scenarios[0]!;

  function setS0(updated: ImtFormState) {
    setScenarios((prev) => [updated, ...prev.slice(1)]);
  }

  const transactionValue = parseValue(s0.rawValue);
  const imtJovemStatus: ImtJovemStatus =
    s0.propertyType === "hpp" && s0.jovemEnabled ? s0.jovemBuyers : "none";

  const result: ImtResult | null = useMemo(() => {
    if (transactionValue <= 0) return null;
    return calculateImt({
      transactionValue,
      propertyType: s0.propertyType,
      region: s0.region,
      imtJovemStatus,
    });
  }, [transactionValue, s0.propertyType, s0.region, imtJovemStatus]);

  function fmt(v: number) {
    return v.toLocaleString(fmtLocale, { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
  }
  function fmtPct(v: number) {
    return (v * 100).toLocaleString(fmtLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
  }
  function fmtNum(v: number) {
    return v.toLocaleString(fmtLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t.title}</h1>
          <p className="mt-2 text-sm text-neutral-500 sm:text-base">{t.subtitle}</p>
        </div>

        {/* Mode switcher */}
        <div className="flex shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
          {(["single", "compare"] as const).map((m, idx) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                idx > 0 && "border-l border-neutral-200",
                mode === m
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-neutral-500 hover:bg-white/70 hover:text-neutral-700"
              )}
            >
              {m === "single" ? t.singleMode : t.compareMode}
            </button>
          ))}
        </div>
      </div>

      {/* ── Single mode ─────────────────────────────────────────────────────── */}
      {mode === "single" && (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* Left: Form */}
          <div className="w-full lg:max-w-md lg:shrink-0">
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-neutral-900">{t.formSection}</h2>
              </CardHeader>
              <CardBody className="space-y-6">

                {/* Property value */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">{t.valueLabel}</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400 text-sm">
                      €
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={s0.rawValue}
                      onChange={(e) =>
                        setS0({ ...s0, rawValue: formatThousands(e.target.value, decSep) })
                      }
                      placeholder={t.valuePlaceholder}
                      className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-8 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <p className="flex items-start gap-1.5 text-xs text-neutral-500">
                    <Info className="mt-0.5 h-3 w-3 shrink-0" />
                    {t.valueHint}
                  </p>
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">{t.regionLabel}</label>
                  <PillToggle
                    options={regionOptions}
                    value={s0.region}
                    onChange={(v) => setS0({ ...s0, region: v as ImtRegion })}
                  />
                </div>

                {/* Property type */}
                <div className="space-y-2">
                  <Select
                    label={t.propertyTypeLabel}
                    options={propertyTypeOptions}
                    value={s0.propertyType}
                    onChange={(e) => {
                      const updated: ImtFormState = { ...s0, propertyType: e.target.value as PropertyType };
                      if (e.target.value !== "hpp") updated.jovemEnabled = false;
                      setS0(updated);
                    }}
                  />
                  {s0.propertyType === "offshore" && (
                    <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      <Info className="mt-0.5 h-3 w-3 shrink-0" />
                      {t.offshoreNote}
                    </p>
                  )}
                </div>

                {/* IMT Jovem */}
                {s0.propertyType === "hpp" && (
                  <div className="rounded-lg border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setS0({ ...s0, jovemEnabled: !s0.jovemEnabled })}
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-700">{t.imtJovemSection}</p>
                        <p className="mt-0.5 text-xs text-neutral-400">{t.imtJovemDescription}</p>
                      </div>
                      <div className={cn(
                        "ml-4 flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors duration-200",
                        s0.jovemEnabled ? "border-primary-500 bg-primary-500" : "border-neutral-300 bg-neutral-200"
                      )}>
                        <span className={cn(
                          "block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                          s0.jovemEnabled ? "translate-x-5" : "translate-x-0.5"
                        )} />
                      </div>
                    </button>

                    <p className="flex items-center gap-1.5 border-t border-neutral-100 px-4 py-2.5 text-xs text-primary-600">
                      <Info className="h-3 w-3 shrink-0" />
                      {t.imtJovemThresholdHint(fmtEur(IMT_JOVEM_IS_THRESHOLD[s0.region], fmtLocale))}
                    </p>

                    {s0.jovemEnabled && (
                      <div className="space-y-3 border-t border-neutral-100 px-4 pb-4 pt-3">
                        <p className="text-sm font-medium text-neutral-700">{t.imtJovemBuyersLabel}</p>
                        <div className="space-y-2">
                          {(["full", "half"] as const).map((opt) => (
                            <label
                              key={opt}
                              className={cn(
                                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition",
                                s0.jovemBuyers === opt
                                  ? "border-primary-300 bg-primary-50"
                                  : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
                              )}
                            >
                              <input
                                type="radio"
                                name="jovem-buyers"
                                value={opt}
                                checked={s0.jovemBuyers === opt}
                                onChange={() => setS0({ ...s0, jovemBuyers: opt })}
                                className="mt-0.5 accent-primary-600"
                              />
                              <span className="text-sm text-neutral-700">
                                {opt === "full" ? t.imtJovemFull : t.imtJovemHalf}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p className="flex items-start gap-1.5 text-xs text-neutral-500">
                          <Info className="mt-0.5 h-3 w-3 shrink-0" />
                          {t.imtJovemConditions}
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </CardBody>
            </Card>
          </div>

          {/* Right: Results */}
          <div className="w-full lg:sticky lg:top-20 lg:min-w-0">
            {result ? (
              <Card>
                <CardHeader>
                  <h2 className="font-semibold text-neutral-900">{t.resultsTitle}</h2>
                </CardHeader>
                <CardBody className="space-y-4">

                  <div className="grid grid-cols-2 gap-3">
                    <SummaryCard
                      label={t.imtLabel}
                      value={result.imtExempt ? (locale === "pt" ? "Isento" : "Exempt") : fmt(result.imtAmount)}
                      sub={result.imtJovemStatus !== "none" ? "IMT Jovem" : undefined}
                      exempt={result.imtExempt}
                    />
                    <SummaryCard
                      label={t.isLabel}
                      value={result.impostoSeloExempt ? (locale === "pt" ? "Isento" : "Exempt") : fmt(result.impostoSeloAmount)}
                      sub={fmtPct(IMPOSTO_SELO_RATE)}
                      exempt={result.impostoSeloExempt}
                    />
                    <SummaryCard
                      label={t.totalLabel}
                      value={fmt(result.totalTax)}
                      highlight
                    />
                    <SummaryCard
                      label={t.effectiveRateLabel}
                      value={fmtPct(result.effectiveRate)}
                      sub={t.effectiveRateHint}
                    />
                  </div>

                  {result.imtJovemStatus === "half" && (
                    <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {t.jovemHalfNote}
                    </p>
                  )}

                  {result.bracketBreakdown.length > 0 && (
                    <div className="rounded-lg border border-neutral-200">
                      <Collapsible
                        trigger={
                          <span className="text-sm font-medium text-primary-600">{t.bracketTitle}</span>
                        }
                        triggerClassName="px-4 py-3"
                        contentClassName="border-t border-neutral-100"
                      >
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50 text-xs text-neutral-500">
                              <th className="px-4 py-2.5 text-left font-medium">{t.bracketColBracket}</th>
                              <th className="px-4 py-2.5 text-right font-medium">{t.bracketColRate}</th>
                              <th className="px-4 py-2.5 text-right font-medium">{t.bracketColBase}</th>
                              <th className="px-4 py-2.5 text-right font-medium">{t.bracketColImt}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {result.bracketBreakdown.map((b, i) => (
                              <tr
                                key={i}
                                className={cn(
                                  "transition-colors",
                                  b.exempt ? "bg-green-50 text-neutral-500" : "text-neutral-700 hover:bg-neutral-50"
                                )}
                              >
                                <td className="px-4 py-3 text-xs">
                                  {b.flat
                                    ? t.bracketFlatLabel
                                    : t.bracketRangeLabel(
                                        `${fmtNum(b.rangeFrom)} €`,
                                        b.rangeTo !== null ? `${fmtNum(b.rangeTo)} €` : null
                                      )}
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums">
                                  {b.exempt ? (
                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                      {t.bracketExemptLabel}
                                    </span>
                                  ) : (
                                    fmtPct(b.rate)
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums text-xs">
                                  {fmt(b.taxableAmount)}
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums font-medium">
                                  {fmt(b.taxAmount)}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-neutral-50 font-semibold text-neutral-900">
                              <td colSpan={3} className="px-4 py-3 text-sm">{t.imtLabel}</td>
                              <td className="px-4 py-3 text-right tabular-nums">{fmt(result.imtAmount)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </Collapsible>
                    </div>
                  )}

                  <p className="text-center text-xs leading-relaxed text-neutral-400">
                    {t.disclaimer}
                  </p>

                </CardBody>
              </Card>
            ) : (
              <Card className="border-dashed border-neutral-200">
                <CardBody className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-3 text-4xl">🏠</div>
                  <p className="text-sm text-neutral-400">{t.emptyState}</p>
                </CardBody>
              </Card>
            )}
          </div>

        </div>
      )}

      {/* ── Compare mode ────────────────────────────────────────────────────── */}
      {mode === "compare" && (
        <div className="space-y-6">

          {/* Scenario grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((s) => (
              <ScenarioPanel
                key={s.id}
                state={s}
                setState={(updated) => updateScenario(s.id, updated)}
                locale={locale}
                onRemove={() => removeScenario(s.id)}
                canRemove={scenarios.length > 1}
              />
            ))}
          </div>

          {/* Add scenario button */}
          {scenarios.length < MAX_SCENARIOS && (
            <button
              type="button"
              onClick={addScenario}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 py-4 text-sm font-medium text-neutral-400 transition-colors hover:border-primary-300 hover:text-primary-600"
            >
              <Plus className="h-4 w-4" />
              {t.addScenario}
            </button>
          )}

          {/* Comparison summary table */}
          <ComparisonTable scenarios={scenarios} locale={locale} />

        </div>
      )}

    </div>
  );
}

// ─── SummaryCard ──────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  highlight = false,
  exempt = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  exempt?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border p-4",
        highlight
          ? "border-primary-200 bg-primary-50"
          : exempt
            ? "border-green-200 bg-green-50"
            : "border-neutral-200 bg-white"
      )}
    >
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      <span
        className={cn(
          "text-lg font-bold tabular-nums leading-tight",
          highlight ? "text-primary-700" : exempt ? "text-green-700" : "text-neutral-900"
        )}
      >
        {value}
      </span>
      {sub && <span className="text-xs leading-tight text-neutral-400">{sub}</span>}
    </div>
  );
}
