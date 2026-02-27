"use client";

import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import type { NetSalaryResult } from "@/lib/calculators/net-salary";

// ─── Types ────────────────────────────────────────────────────────────────────

type Locale = "pt" | "en";

type DiffStrings = {
  title: string;
  subtitle: string;
  netSalaryLabel: string;
  netSalaryTooltip: string;
  netSalaryMonthly: string;
  netSalaryAnnual: string;
  irsLabel: string;
  irsTooltip: string;
  ssLabel: string;
  ssTooltip: string;
  totalDeductionLabel: string;
  totalDeductionTooltip: string;
  effectiveIrsRateLabel: string;
  effectiveIrsRateTooltip: string;
  employerCostLabel: string;
  employerCostTooltip: string;
  noResultsNote: string;
  scenarioA: string;
  scenarioB: string;
  betterFor: (who: "a" | "b") => string;
  equalLabel: string;
};

// ─── Locale strings ───────────────────────────────────────────────────────────

const PT: DiffStrings = {
  title: "Diferença entre Cenários",
  subtitle: "Valores mensais (B − A). Verde = melhor para o trabalhador, vermelho = pior.",
  netSalaryLabel: "Salário Líquido",
  netSalaryTooltip: "Diferença no valor mensal líquido recebido.",
  netSalaryMonthly: "Mensal",
  netSalaryAnnual: "Anual",
  irsLabel: "Retenção IRS",
  irsTooltip: "Diferença na retenção mensal de IRS. Menos IRS = mais líquido.",
  ssLabel: "Segurança Social",
  ssTooltip: "Diferença na contribuição mensal para a Segurança Social. Menos SS = mais líquido.",
  totalDeductionLabel: "Taxa de Desconto Total",
  totalDeductionTooltip: "Diferença na taxa combinada SS + IRS (em pontos percentuais).",
  effectiveIrsRateLabel: "Taxa Efetiva IRS",
  effectiveIrsRateTooltip: "Diferença na taxa efetiva de retenção IRS (em pontos percentuais).",
  employerCostLabel: "Custo para a Empresa",
  employerCostTooltip: "Diferença no custo total mensal para a entidade patronal.",
  noResultsNote: "Preencha o salário bruto nos dois cenários para ver as diferenças.",
  scenarioA: "Cenário A",
  scenarioB: "Cenário B",
  betterFor: (who) => (who === "b" ? "Cenário B melhor" : "Cenário A melhor"),
  equalLabel: "Igual",
};

const EN: DiffStrings = {
  title: "Scenario Comparison",
  subtitle: "Monthly figures (B − A). Green = better for the worker, red = worse.",
  netSalaryLabel: "Net Salary",
  netSalaryTooltip: "Difference in monthly take-home pay.",
  netSalaryMonthly: "Monthly",
  netSalaryAnnual: "Annual",
  irsLabel: "IRS Withholding",
  irsTooltip: "Difference in monthly IRS withholding. Less IRS = more take-home.",
  ssLabel: "Social Security",
  ssTooltip: "Difference in monthly Social Security contribution. Less SS = more take-home.",
  totalDeductionLabel: "Total Deduction Rate",
  totalDeductionTooltip: "Difference in combined SS + IRS rate (percentage points).",
  effectiveIrsRateLabel: "Effective IRS Rate",
  effectiveIrsRateTooltip: "Difference in the effective IRS withholding rate (percentage points).",
  employerCostLabel: "Employer Cost",
  employerCostTooltip: "Difference in total monthly employer cost.",
  noResultsNote: "Fill in gross salary for both scenarios to see the differences.",
  scenarioA: "Scenario A",
  scenarioB: "Scenario B",
  betterFor: (who) => (who === "b" ? "Scenario B is better" : "Scenario A is better"),
  equalLabel: "Equal",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the sign-aware direction of a delta.
 * higherIsBetter: positive delta → "positive" (green), negative → "negative" (red).
 * lowerIsBetter:  positive delta → "negative" (red),  negative → "positive" (green).
 */
function getDirection(
  delta: number,
  higherIsBetter: boolean,
): "positive" | "negative" | "neutral" {
  if (Math.abs(delta) < 0.005) return "neutral";
  if (higherIsBetter) return delta > 0 ? "positive" : "negative";
  return delta > 0 ? "negative" : "positive";
}

function DeltaCell({
  delta,
  format,
  higherIsBetter,
}: {
  delta: number;
  format: "currency" | "percent_absolute" | "percent_points";
  higherIsBetter: boolean;
}) {
  const direction = getDirection(delta, higherIsBetter);
  const abs = Math.abs(delta);

  const formatted =
    format === "currency"
      ? formatCurrency(abs)
      : format === "percent_absolute"
      ? formatPercent(abs)
      : `${delta >= 0 ? "+" : "−"}${formatPercent(abs)} pp`;

  const prefix =
    format !== "percent_points"
      ? delta > 0.005
        ? "+"
        : delta < -0.005
        ? "−"
        : ""
      : "";

  const Icon =
    direction === "positive"
      ? TrendingUp
      : direction === "negative"
      ? TrendingDown
      : Minus;

  return (
    <div
      className={cn(
        "flex items-center justify-end gap-1.5 tabular-nums text-sm font-medium",
        direction === "positive" && "text-success-600",
        direction === "negative" && "text-error-600",
        direction === "neutral" && "text-neutral-400",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>
        {format !== "percent_points"
          ? `${prefix}${formatted}`
          : formatted}
      </span>
    </div>
  );
}

function DiffRow({
  label,
  tooltip,
  delta,
  format,
  higherIsBetter,
  isTotal = false,
}: {
  label: string;
  tooltip?: string;
  delta: number;
  format: "currency" | "percent_absolute" | "percent_points";
  higherIsBetter: boolean;
  isTotal?: boolean;
}) {
  return (
    <tr>
      <td
        className={cn(
          "py-2.5 pr-4 text-sm",
          isTotal ? "font-semibold text-neutral-900" : "text-neutral-600",
        )}
      >
        <span className="flex items-center gap-1.5">
          {label}
          {tooltip && <Tooltip content={tooltip} />}
        </span>
      </td>
      <td className="py-2.5 text-right">
        <DeltaCell delta={delta} format={format} higherIsBetter={higherIsBetter} />
      </td>
    </tr>
  );
}

// ─── NetSalaryHero ─────────────────────────────────────────────────────────────
// Large hero showing the net salary difference with monthly + annual split.

function NetSalaryHero({
  deltaMonthly,
  deltaAnnual,
  t,
}: {
  deltaMonthly: number;
  deltaAnnual: number;
  t: DiffStrings;
}) {
  const direction = getDirection(deltaMonthly, true);
  const abs = Math.abs(deltaMonthly);
  const absAnnual = Math.abs(deltaAnnual);

  const sign = deltaMonthly > 0.005 ? "+" : deltaMonthly < -0.005 ? "−" : "";

  return (
    <div
      className={cn(
        "rounded-xl px-6 py-5 text-center",
        direction === "positive" && "bg-success-50 border border-success-200",
        direction === "negative" && "bg-error-50 border border-error-200",
        direction === "neutral" && "bg-neutral-50 border border-neutral-200",
      )}
    >
      <p
        className={cn(
          "text-xs font-medium uppercase tracking-widest",
          direction === "positive" && "text-success-600",
          direction === "negative" && "text-error-600",
          direction === "neutral" && "text-neutral-400",
        )}
      >
        {t.netSalaryLabel} (B − A)
      </p>

      <p
        className={cn(
          "mt-1 text-4xl font-bold tabular-nums sm:text-5xl",
          direction === "positive" && "text-success-700",
          direction === "negative" && "text-error-700",
          direction === "neutral" && "text-neutral-400",
        )}
      >
        {sign}
        {formatCurrency(abs)}
      </p>

      <p
        className={cn(
          "mt-2 text-sm",
          direction === "positive" && "text-success-600",
          direction === "negative" && "text-error-600",
          direction === "neutral" && "text-neutral-400",
        )}
      >
        {t.netSalaryAnnual}:{" "}
        <span className="font-semibold">
          {sign}
          {formatCurrency(absAnnual)}
        </span>
      </p>
    </div>
  );
}

// ─── ScenarioValueColumn ──────────────────────────────────────────────────────
// Shows the raw values for A and B side by side (small caption rows).

function ScenarioValues({
  labelA,
  labelB,
  valueA,
  valueB,
  format,
}: {
  labelA: string;
  labelB: string;
  valueA: number;
  valueB: number;
  format: "currency" | "percent_absolute";
}) {
  const fmt = format === "currency" ? formatCurrency : formatPercent;
  return (
    <div className="mt-1 flex justify-end gap-4 text-xs text-neutral-400">
      <span>
        {labelA}: <span className="tabular-nums text-neutral-500">{fmt(valueA)}</span>
      </span>
      <span>
        {labelB}: <span className="tabular-nums text-neutral-500">{fmt(valueB)}</span>
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Props = {
  resultA: NetSalaryResult | null;
  resultB: NetSalaryResult | null;
  locale?: Locale;
};

export function SalaryDiff({ resultA, resultB, locale = "pt" }: Props) {
  const t = locale === "en" ? EN : PT;

  if (!resultA || !resultB) {
    return (
      <Card className="border-dashed">
        <CardBody className="py-10 text-center">
          <p className="text-sm text-neutral-400">{t.noResultsNote}</p>
        </CardBody>
      </Card>
    );
  }

  // All deltas: B − A
  const deltaNet          = resultB.netSalary - resultA.netSalary;
  const deltaNetAnnual    = resultB.annualNet  - resultA.annualNet;
  const deltaIrs          = resultB.irsWithholding - resultA.irsWithholding;
  const deltaSS           = resultB.socialSecurity - resultA.socialSecurity;
  const deltaIrsRate      = resultB.effectiveIrsRate - resultA.effectiveIrsRate;
  const deltaTotalRate    = resultB.totalDeductionRate - resultA.totalDeductionRate;
  const deltaEmployerCost = resultB.totalEmployerCost - resultA.totalEmployerCost;

  return (
    <Card>
      <CardHeader className="border-b border-neutral-100">
        <div>
          <h2 className="font-semibold text-neutral-900">{t.title}</h2>
          <p className="mt-0.5 text-xs text-neutral-400">{t.subtitle}</p>
        </div>
      </CardHeader>

      <CardBody className="space-y-6">

        {/* ── Net salary hero ── */}
        <NetSalaryHero
          deltaMonthly={deltaNet}
          deltaAnnual={deltaNetAnnual}
          t={t}
        />

        {/* ── Deduction breakdown ── */}
        <table className="w-full">
          <tbody>

            {/* IRS */}
            <tr>
              <td className="py-2.5 pr-4 text-sm text-neutral-600">
                <span className="flex items-center gap-1.5">
                  {t.irsLabel}
                  <Tooltip content={t.irsTooltip} />
                </span>
              </td>
              <td className="py-2.5 text-right">
                <DeltaCell
                  delta={deltaIrs}
                  format="currency"
                  higherIsBetter={false}
                />
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="pb-2 pt-0">
                <ScenarioValues
                  labelA={t.scenarioA}
                  labelB={t.scenarioB}
                  valueA={resultA.irsWithholding}
                  valueB={resultB.irsWithholding}
                  format="currency"
                />
              </td>
            </tr>

            {/* SS */}
            <tr>
              <td className="py-2.5 pr-4 text-sm text-neutral-600">
                <span className="flex items-center gap-1.5">
                  {t.ssLabel}
                  <Tooltip content={t.ssTooltip} />
                </span>
              </td>
              <td className="py-2.5 text-right">
                <DeltaCell
                  delta={deltaSS}
                  format="currency"
                  higherIsBetter={false}
                />
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="pb-2 pt-0">
                <ScenarioValues
                  labelA={t.scenarioA}
                  labelB={t.scenarioB}
                  valueA={resultA.socialSecurity}
                  valueB={resultB.socialSecurity}
                  format="currency"
                />
              </td>
            </tr>

            {/* Separator */}
            <tr>
              <td colSpan={2} className="py-1">
                <div className="border-t border-neutral-100" />
              </td>
            </tr>

            {/* Effective IRS Rate */}
            <DiffRow
              label={t.effectiveIrsRateLabel}
              tooltip={t.effectiveIrsRateTooltip}
              delta={deltaIrsRate}
              format="percent_points"
              higherIsBetter={false}
            />

            {/* Total Deduction Rate */}
            <DiffRow
              label={t.totalDeductionLabel}
              tooltip={t.totalDeductionTooltip}
              delta={deltaTotalRate}
              format="percent_points"
              higherIsBetter={false}
            />

            {/* Separator */}
            <tr>
              <td colSpan={2} className="py-1">
                <div className="border-t border-neutral-100" />
              </td>
            </tr>

            {/* Employer cost */}
            <DiffRow
              label={t.employerCostLabel}
              tooltip={t.employerCostTooltip}
              delta={deltaEmployerCost}
              format="currency"
              higherIsBetter={false}
              isTotal
            />
            <tr>
              <td colSpan={2} className="pb-1 pt-0">
                <ScenarioValues
                  labelA={t.scenarioA}
                  labelB={t.scenarioB}
                  valueA={resultA.totalEmployerCost}
                  valueB={resultB.totalEmployerCost}
                  format="currency"
                />
              </td>
            </tr>

          </tbody>
        </table>

      </CardBody>
    </Card>
  );
}
