"use client";

import { useState, useMemo } from "react";
import { Info } from "lucide-react";
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
} from "@/lib/calculators/imt";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PillToggle } from "@/components/ui/pill-toggle";
import { Collapsible } from "@/components/ui/collapsible";

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
    imtJovemEnable: "Aplicar benefício IMT Jovem",
    imtJovemBuyersLabel: "Compradores elegíveis",
    imtJovemFull: "Comprador único ou ambos elegíveis",
    imtJovemHalf: "Apenas 1 de 2 compradores elegível (50% do benefício)",
    imtJovemConditions: "Condições: ≤ 35 anos · primeira habitação · sem imóvel nos últimos 3 anos · não dependente fiscal · imóvel já construído.",
    resultsTitle: "Impostos a pagar",
    imtLabel: "IMT",
    isLabel: "Imposto de Selo",
    isRate: "Taxa: 0,8%",
    totalLabel: "Total",
    effectiveRateLabel: "Taxa efetiva",
    effectiveRateHint: "Total de impostos sobre o valor de aquisição",
    exemptBadge: "Isento",
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
    imtJovemEnable: "Apply IMT Jovem benefit",
    imtJovemBuyersLabel: "Eligible buyers",
    imtJovemFull: "Single buyer or both buyers eligible",
    imtJovemHalf: "Only 1 of 2 buyers eligible (50% of benefit)",
    imtJovemConditions: "Conditions: ≤ 35 years old · first home · no property owned in last 3 years · not a fiscal dependent · property already built.",
    resultsTitle: "Taxes payable",
    imtLabel: "IMT",
    isLabel: "Stamp Duty",
    isRate: "Rate: 0.8%",
    totalLabel: "Total",
    effectiveRateLabel: "Effective rate",
    effectiveRateHint: "Total taxes as a percentage of purchase value",
    exemptBadge: "Exempt",
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
  },
} as const;

type Locale = keyof typeof STRINGS;

// ─── Props ────────────────────────────────────────────────────────────────────

type ImtCalculatorProps = {
  locale?: Locale;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ImtCalculator({ locale = "pt" }: ImtCalculatorProps) {
  const t = STRINGS[locale];

  const [rawValue, setRawValue]           = useState("");
  const [propertyType, setPropertyType]   = useState<PropertyType>("hpp");
  const [region, setRegion]               = useState<ImtRegion>("continente");
  const [jovemEnabled, setJovemEnabled]   = useState(false);
  const [jovemBuyers, setJovemBuyers]     = useState<"full" | "half">("full");

  const propertyTypeOptions = PROPERTY_TYPE_OPTIONS.map((o) => ({
    value: o.value,
    label: locale === "pt" ? o.labelPt : o.labelEn,
  }));
  const regionOptions = REGION_OPTIONS.map((o) => ({
    value: o.value,
    label: locale === "pt" ? o.labelPt : o.labelEn,
  }));

  const decSep = locale === "pt" ? "," : ".";

  function formatThousands(input: string): string {
    const stripped = input
      .replace(/\s/g, "")
      .replace(new RegExp(`[^\\d${decSep}]`, "g"), "");

    const sepIdx = stripped.indexOf(decSep);
    const intPart = sepIdx >= 0 ? stripped.slice(0, sepIdx) : stripped;
    const decPart = sepIdx >= 0 ? stripped.slice(sepIdx) : "";

    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
    return formattedInt + decPart;
  }

  const transactionValue = parseFloat(
    rawValue.replace(/\u00a0|\s/g, "").replace(",", ".")
  ) || 0;

  const imtJovemStatus: ImtJovemStatus =
    propertyType === "hpp" && jovemEnabled ? jovemBuyers : "none";

  const result: ImtResult | null = useMemo(() => {
    if (transactionValue <= 0) return null;
    const input: ImtInput = { transactionValue, propertyType, region, imtJovemStatus };
    return calculateImt(input);
  }, [transactionValue, propertyType, region, imtJovemStatus]);

  const fmtLocale = locale === "pt" ? "pt-PT" : "en-GB";

  function fmt(value: number) {
    return value.toLocaleString(fmtLocale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    });
  }

  function fmtPct(value: number) {
    return (value * 100).toLocaleString(fmtLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "%";
  }

  function fmtNum(value: number) {
    return value.toLocaleString(fmtLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t.title}</h1>
        <p className="mt-2 text-sm text-neutral-500 sm:text-base">{t.subtitle}</p>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

        {/* ── Left: Form ─────────────────────────────────────────────────────── */}
        <div className="w-full lg:max-w-md lg:shrink-0">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-neutral-900">{t.formSection}</h2>
            </CardHeader>
            <CardBody className="space-y-6">

              {/* Property value */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">
                  {t.valueLabel}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400 text-sm">
                    €
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={rawValue}
                    onChange={(e) => setRawValue(formatThousands(e.target.value))}
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
                  value={region}
                  onChange={(v) => setRegion(v as ImtRegion)}
                />
              </div>

              {/* Property type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">{t.propertyTypeLabel}</label>
                <div className="grid grid-cols-2 gap-2">
                  {propertyTypeOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => {
                        setPropertyType(o.value as PropertyType);
                        if (o.value !== "hpp") setJovemEnabled(false);
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors",
                        propertyType === o.value
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-neutral-300 bg-white text-neutral-700 hover:border-primary-400 hover:text-primary-700"
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>

                {propertyType === "offshore" && (
                  <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    <Info className="mt-0.5 h-3 w-3 shrink-0" />
                    {t.offshoreNote}
                  </p>
                )}
              </div>

              {/* IMT Jovem — only for HPP */}
              {propertyType === "hpp" && (
                <div className="rounded-lg border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setJovemEnabled((v) => !v)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-700">{t.imtJovemSection}</p>
                      <p className="mt-0.5 text-xs text-neutral-400">{t.imtJovemDescription}</p>
                    </div>
                    <div className={cn(
                      "ml-4 flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors duration-200",
                      jovemEnabled ? "border-primary-500 bg-primary-500" : "border-neutral-300 bg-neutral-200"
                    )}>
                      <span className={cn(
                        "block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                        jovemEnabled ? "translate-x-5" : "translate-x-0.5"
                      )} />
                    </div>
                  </button>

                  {jovemEnabled && (
                    <div className="space-y-3 border-t border-neutral-100 px-4 pb-4 pt-3">
                      <p className="text-sm font-medium text-neutral-700">{t.imtJovemBuyersLabel}</p>
                      <div className="space-y-2">
                        {(["full", "half"] as const).map((opt) => (
                          <label
                            key={opt}
                            className={cn(
                              "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition",
                              jovemBuyers === opt
                                ? "border-primary-300 bg-primary-50"
                                : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
                            )}
                          >
                            <input
                              type="radio"
                              name="jovem-buyers"
                              value={opt}
                              checked={jovemBuyers === opt}
                              onChange={() => setJovemBuyers(opt)}
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

        {/* ── Right: Results ──────────────────────────────────────────────────── */}
        <div className="w-full lg:sticky lg:top-20 lg:min-w-0">
          {result ? (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-neutral-900">{t.resultsTitle}</h2>
              </CardHeader>
              <CardBody className="space-y-4">

                {/* Summary grid */}
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

                {/* IMT Jovem half-benefit note */}
                {result.imtJovemStatus === "half" && (
                  <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {t.jovemHalfNote}
                  </p>
                )}

                {/* Bracket breakdown */}
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
                                b.exempt
                                  ? "bg-green-50 text-neutral-500"
                                  : "text-neutral-700 hover:bg-neutral-50"
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
                            <td colSpan={3} className="px-4 py-3 text-sm">
                              {t.imtLabel}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums">
                              {fmt(result.imtAmount)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Collapsible>
                  </div>
                )}

                {/* Disclaimer */}
                <p className="text-xs text-neutral-400 text-center leading-relaxed">
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
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
          highlight
            ? "text-primary-700"
            : exempt
              ? "text-green-700"
              : "text-neutral-900"
        )}
      >
        {value}
      </span>
      {sub && (
        <span className="text-xs text-neutral-400 leading-tight">{sub}</span>
      )}
    </div>
  );
}
