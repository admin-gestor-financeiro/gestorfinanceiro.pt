"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Card, CardBody, CardHeader, CardFooter } from "@/components/ui/card";
import { Collapsible } from "@/components/ui/collapsible";
import { Tooltip } from "@/components/ui/tooltip";
import { PillToggle } from "@/components/ui/pill-toggle";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import type { NetSalaryResult, TaxYear } from "@/lib/calculators/net-salary";
import { SalaryBar } from "@/components/ui/salary-bar";

// ─── Period ───────────────────────────────────────────────────────────────────

export type Period = "monthly" | "annual" | "weekly" | "daily" | "hourly";

const WORKING_DAYS_PER_MONTH = 22;
const WORKING_HOURS_PER_DAY  = 8;
const WEEKS_PER_YEAR         = 52;

/**
 * Scales a monthly value to the selected period.
 * annualPaymentsCount: 14 when subsidies are paid separately (standard),
 *                      12 when subsidies are embedded in the monthly figure (duodécimos).
 */
function scaleValue(monthly: number, period: Period, annualPaymentsCount: number): number {
  switch (period) {
    case "monthly": return monthly;
    case "annual":  return monthly * annualPaymentsCount;
    case "weekly":  return (monthly * annualPaymentsCount) / WEEKS_PER_YEAR;
    case "daily":   return monthly / WORKING_DAYS_PER_MONTH;
    case "hourly":  return monthly / WORKING_DAYS_PER_MONTH / WORKING_HOURS_PER_DAY;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Locale = "pt" | "en";

type PayslipStrings = {
  netSalaryLabel: string;
  periodOptions: { value: Period; label: string }[];
  breakdownTitle: string;
  grossLabel: string;
  grossTooltip: string;
  mealExemptLabel: string;
  mealExemptTooltip: string;
  ssLabel: string;
  ssTooltip: string;
  irsLabel: string;
  irsTooltip: string;
  netLabel: string;
  netTooltip: string;
  ratesTitle: string;
  effectiveIrsLabel: string;
  effectiveIrsTooltip: string;
  totalDeductionLabel: string;
  totalDeductionTooltip: string;
  employerTitle: string;
  employerGrossLabel: string;
  employerSSLabel: string;
  employerSSTooltip: string;
  employerTotalLabel: string;
  employerRateLabel: string;
  employerRateTooltip: string;
  barAriaLabel: string;
  barNetLabel: string;
  barSSLabel: string;
  barIrsLabel: string;
  duodecimosLabel: string;
  duodecimosTooltip: string;
  formulaToggle: string;
  formulaAtTable: (table: string, rate: string, parcel: string) => string;
  formulaDuodecimos: string;
  formulaIrsJovem: (rate: string, cap: string) => string;
  formulaSS: string;
  formulaNet: string;
  formulaBrackets: string;
  irsJovemBadge: (rate: string) => string;
  disabilityFallbackNote: string;
  disclaimer: (year: TaxYear) => string;
  emptyState: string;
  annualNote: string;
  annualNoteWithDuodecimos: string;
};

const PT: PayslipStrings = {
  netSalaryLabel: "Salário Líquido",
  periodOptions: [
    { value: "monthly", label: "Mensal"   },
    { value: "annual",  label: "Anual"    },
    { value: "weekly",  label: "Semanal"  },
    { value: "daily",   label: "Diário"   },
    { value: "hourly",  label: "À hora"   },
  ],
  breakdownTitle: "Recibo de Vencimento",
  grossLabel: "Salário Bruto",
  grossTooltip: "Valor acordado no contrato antes de quaisquer descontos.",
  mealExemptLabel: "Subsídio de Alimentação",
  mealExemptTooltip: "Parcela isenta de IRS e Segurança Social. Valores acima do limite legal são tributados.",
  duodecimosLabel: "Duodécimos",
  duodecimosTooltip: "Fração mensal dos subsídios de férias e Natal pagos em duodécimos. Tributada de forma independente (SS + IRS calculados sobre esta parcela separadamente).",
  ssLabel: "Segurança Social (11%)",
  ssTooltip: "Desconto obrigatório para a Segurança Social. Calculado sobre a remuneração efetiva mensal (salário base + duodécimos, quando aplicável).",
  irsLabel: "Retenção na Fonte (IRS)",
  irsTooltip: "Retenção mensal calculada com base nas tabelas oficiais da AT. Pode diferir do IRS liquidado no final do ano.",
  netLabel: "Salário Líquido",
  netTooltip: "Valor que recebe na conta: Bruto − SS − IRS + Subsídio de Alimentação isento.",
  ratesTitle: "Taxas Efetivas",
  effectiveIrsLabel: "Taxa efetiva IRS",
  effectiveIrsTooltip: "IRS retido / Salário bruto. Inferior à taxa marginal porque as parcelas a abater reduzem o valor retido.",
  totalDeductionLabel: "Taxa total de desconto",
  totalDeductionTooltip: "Soma de SS + IRS como percentagem do salário bruto.",
  employerTitle: "Custo para a Empresa",
  employerGrossLabel: "Salário Bruto",
  employerSSLabel: "SS Entidade Patronal (23,75%)",
  employerSSTooltip: "Contribuição adicional da entidade patronal para a Segurança Social.",
  employerTotalLabel: "Custo Total",
  employerRateLabel: "Custo total / Salário bruto",
  employerRateTooltip: "Rácio entre o custo total para a empresa e o salário bruto do trabalhador.",
  barAriaLabel: "Distribuição do salário bruto: líquido, segurança social e IRS",
  barNetLabel: "Líquido",
  barSSLabel: "Seg. Social",
  barIrsLabel: "IRS retido",
  formulaToggle: "Como é calculado",
  formulaAtTable: (table, rate, parcel) =>
    `Retenção IRS = Base × ${rate} − ${parcel} (Tabela ${table} AT 2026)`,
  formulaDuodecimos:
    "Base duodécimos = Bruto × multiplicador (12,5/12, 13/12 ou 14/12 consoante a opção)",
  formulaIrsJovem: (rate, cap) =>
    `IRS Jovem: isento ${rate} do rendimento até ${cap}/mês (55 × IAS 2026)`,
  formulaSS: "Segurança Social = Remuneração efetiva × 11%  (base + duodécimos)",
  formulaNet: "Líquido = Remuneração efetiva − SS − IRS Retido + Subsídio Alimentação isento",
  formulaBrackets:
    "Método 2025: Escalões anuais Art. 68.º CIRS aplicados ao rendimento anual equivalente (Bruto × 12).",
  irsJovemBadge: (rate) => `IRS Jovem: ${rate} isento`,
  disabilityFallbackNote:
    "Tabelas de deficiência não disponíveis para o Continente — tabela padrão aplicada.",
  disclaimer: (year) =>
    `Cálculo baseado nas tabelas de retenção na fonte IRS ${year} publicadas pela AT. Verifique sempre com as tabelas oficiais.`,
  emptyState: "Introduza o salário bruto para ver o recibo.",
  annualNote: "Valores anuais calculados com base em 14 meses (12 + subsídio férias + subsídio natal).",
  annualNoteWithDuodecimos: "Valores anuais calculados com base em 12 meses — os subsídios já estão incluídos na remuneração mensal.",
};

const EN: PayslipStrings = {
  netSalaryLabel: "Net Salary",
  periodOptions: [
    { value: "monthly", label: "Monthly" },
    { value: "annual",  label: "Annual"  },
    { value: "weekly",  label: "Weekly"  },
    { value: "daily",   label: "Daily"   },
    { value: "hourly",  label: "Hourly"  },
  ],
  breakdownTitle: "Payslip",
  grossLabel: "Gross Salary",
  grossTooltip: "Agreed contract salary before any deductions.",
  mealExemptLabel: "Meal Allowance",
  mealExemptTooltip: "Portion exempt from IRS and Social Security. Amounts above the legal limit are taxable.",
  duodecimosLabel: "Duodécimos",
  duodecimosTooltip: "Monthly fraction of holiday and Christmas subsidies paid as monthly instalments. Taxed independently — SS and IRS calculated on this portion separately.",
  ssLabel: "Social Security (11%)",
  ssTooltip: "Mandatory Social Security contribution. Calculated on the effective monthly income (base salary + duodécimos fraction, where applicable).",
  irsLabel: "IRS Withholding",
  irsTooltip: "Monthly withholding calculated from official AT tables. May differ from the final IRS settled at year end.",
  netLabel: "Net Salary",
  netTooltip: "Amount received: Gross − SS − IRS + Exempt meal allowance.",
  ratesTitle: "Effective Rates",
  effectiveIrsLabel: "Effective IRS rate",
  effectiveIrsTooltip: "IRS withheld / Gross salary. Lower than the marginal rate because of the deduction parcel.",
  totalDeductionLabel: "Total deduction rate",
  totalDeductionTooltip: "SS + IRS as a percentage of gross salary.",
  employerTitle: "Employer Cost",
  employerGrossLabel: "Gross Salary",
  employerSSLabel: "Employer SS (23.75%)",
  employerSSTooltip: "Additional employer contribution to Social Security.",
  employerTotalLabel: "Total Cost",
  employerRateLabel: "Total cost / Gross salary",
  employerRateTooltip: "Ratio of total employer cost to employee gross salary.",
  barAriaLabel: "Gross salary split: take-home pay, social security and IRS withholding",
  barNetLabel: "Take-home",
  barSSLabel: "Soc. Security",
  barIrsLabel: "IRS withheld",
  formulaToggle: "How it's calculated",
  formulaAtTable: (table, rate, parcel) =>
    `IRS Withholding = Base × ${rate} − ${parcel} (AT 2026 Table ${table})`,
  formulaDuodecimos:
    "Duodécimos base = Gross × multiplier (12.5/12, 13/12 or 14/12 depending on option)",
  formulaIrsJovem: (rate, cap) =>
    `IRS Jovem: ${rate} exempt on income up to ${cap}/month (55 × IAS 2026)`,
  formulaSS: "Social Security = Effective monthly income × 11%  (base + duodécimos)",
  formulaNet: "Net = Effective monthly income − SS − IRS Withheld + Exempt meal allowance",
  formulaBrackets:
    "2025 method: Annual brackets per Art. 68.º CIRS applied to annual equivalent income (Gross × 12).",
  irsJovemBadge: (rate) => `IRS Jovem: ${rate} exempt`,
  disabilityFallbackNote:
    "Disability tables not available for Mainland — standard table applied.",
  disclaimer: (year) =>
    `Calculation based on the ${year} IRS withholding tables published by AT. Always verify against official tables.`,
  emptyState: "Enter your gross salary to see the payslip.",
  annualNote: "Annual figures calculated on 14 months (12 + holiday subsidy + Christmas subsidy).",
  annualNoteWithDuodecimos: "Annual figures calculated on 12 payments — subsidies are already included in the monthly amount.",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── DeltaChip ────────────────────────────────────────────────────────────────
// Small inline indicator of the B − A difference for a single metric.

type DeltaFormat = "currency" | "percent_points";

function DeltaChip({
  delta,
  higherIsBetter,
  format = "currency",
}: {
  delta: number;
  higherIsBetter: boolean;
  format?: DeltaFormat;
}) {
  const abs = Math.abs(delta);
  if (abs < 0.005) return <span className="text-xs text-neutral-400">—</span>;

  const isPositive = delta > 0;
  const isGood     = higherIsBetter ? isPositive : !isPositive;
  const sign       = isPositive ? "+" : "−";
  const formatted  =
    format === "currency"
      ? `${sign}${formatCurrency(abs)}`
      : `${sign}${formatPercent(abs)} pp`;

  return (
    <span
      className={cn(
        "text-xs font-medium tabular-nums",
        isGood ? "text-success-600" : "text-error-600",
      )}
    >
      {formatted}
    </span>
  );
}

function PayslipRow({
  label, value, tooltip,
  isTotal = false, isPositive = false, isNegative = false, isSeparator = false,
  delta, deltaHigherIsBetter = true, deltaFormat = "currency",
}: {
  label: string; value?: string; tooltip?: string;
  isTotal?: boolean; isPositive?: boolean; isNegative?: boolean; isSeparator?: boolean;
  delta?: number; deltaHigherIsBetter?: boolean; deltaFormat?: DeltaFormat;
}) {
  if (isSeparator) {
    return <tr><td colSpan={2} className="py-1"><div className="border-t border-neutral-200" /></td></tr>;
  }
  return (
    <tr>
      <td className={cn("py-2 pr-4 text-sm", isTotal ? "font-semibold text-neutral-900" : "text-neutral-600")}>
        <span className="flex items-center gap-1.5">
          {label}
          {tooltip && <Tooltip content={tooltip} />}
        </span>
      </td>
      <td className={cn(
        "py-2 text-right tabular-nums text-sm",
        isTotal    && "font-semibold text-neutral-900",
        isPositive && "text-success-600",
        isNegative && "text-error-600",
      )}>
        <div>{value}</div>
        {delta !== undefined && (
          <DeltaChip delta={delta} higherIsBetter={deltaHigherIsBetter} format={deltaFormat} />
        )}
      </td>
    </tr>
  );
}

function RateBadge({
  label, value, tooltip,
  delta, deltaHigherIsBetter = false,
}: {
  label: string; value: string; tooltip?: string;
  delta?: number; deltaHigherIsBetter?: boolean;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-neutral-50 px-3 py-3">
      <span className="flex items-center gap-1 text-xs text-neutral-500">
        {label}
        {tooltip && <Tooltip content={tooltip} />}
      </span>
      <span className="mt-1 text-xl font-bold tabular-nums text-neutral-800">{value}</span>
      {delta !== undefined && (
        <div className="mt-1">
          <DeltaChip delta={delta} higherIsBetter={deltaHigherIsBetter} format="percent_points" />
        </div>
      )}
    </div>
  );
}

function FormulaLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-600">{children}</p>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = {
  result: NetSalaryResult | null;
  locale?: Locale;
  disabilityFallback?: boolean;
  /** When provided (compare mode), renders B − A delta chips inline on each row. */
  comparisonResult?: NetSalaryResult | null;
  /** Controlled period — when provided the parent owns the period state. */
  period?: Period;
  onPeriodChange?: (p: Period) => void;
};

export function SalaryPayslip({
  result,
  locale = "pt",
  disabilityFallback = false,
  comparisonResult,
  period: periodProp,
  onPeriodChange,
}: Props) {
  const t = locale === "en" ? EN : PT;
  const [periodInternal, setPeriodInternal] = useState<Period>("monthly");

  // Use controlled period when provided, otherwise fall back to internal state.
  const period = periodProp ?? periodInternal;
  function setPeriod(p: Period) {
    if (onPeriodChange) onPeriodChange(p);
    else setPeriodInternal(p);
  }

  if (!result) {
    return (
      <Card className="border-dashed">
        <CardBody className="py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
            <Info className="h-6 w-6 text-primary-400" />
          </div>
          <p className="text-sm text-neutral-400">{t.emptyState}</p>
        </CardBody>
      </Card>
    );
  }

  const fmt  = (v: number) => formatCurrency(scaleValue(v, period, result.annualPaymentsCount));
  const fmtM = (v: number) => formatCurrency(v); // always monthly (for rates section)

  const employerRate = result.effectiveMonthlyGross > 0
    ? result.totalEmployerCost / result.effectiveMonthlyGross
    : 0;

  // ── Deltas (B − A, scaled to the current period) ──
  // Only computed when a comparison baseline is provided (Scenario A result).
  const cmp = comparisonResult ?? null;
  const d = cmp
    ? {
        net:          scaleValue(result.netSalary        - cmp.netSalary,        period, result.annualPaymentsCount),
        gross:        scaleValue(result.grossSalary      - cmp.grossSalary,      period, result.annualPaymentsCount),
        ss:           scaleValue(result.socialSecurity   - cmp.socialSecurity,   period, result.annualPaymentsCount),
        irs:          scaleValue(result.irsWithholding   - cmp.irsWithholding,   period, result.annualPaymentsCount),
        meal:         scaleValue(result.mealAllowanceExempt - cmp.mealAllowanceExempt, period, result.annualPaymentsCount),
        employer:     scaleValue(result.totalEmployerCost - cmp.totalEmployerCost, period, result.annualPaymentsCount),
        irsRate:      result.effectiveIrsRate    - cmp.effectiveIrsRate,
        totalRate:    result.totalDeductionRate  - cmp.totalDeductionRate,
        employerRate: (result.effectiveMonthlyGross > 0 ? result.totalEmployerCost / result.effectiveMonthlyGross : 0)
                    - (cmp.effectiveMonthlyGross   > 0 ? cmp.totalEmployerCost   / cmp.effectiveMonthlyGross   : 0),
      }
    : null;

  // Formula section values
  const atDebug   = result.debug.method === "at_table"      ? result.debug : null;
  const brackDebug = result.debug.method === "annual_brackets" ? result.debug : null;

  return (
    <div className="space-y-4">

      {/* ── Hero card ── */}
      <Card className="overflow-hidden border-primary-200">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-6">

          {/* IRS Jovem badge */}
          {result.irsJovemActive && result.irsJovemExemptionRate > 0 && (
            <div className="mb-3 flex justify-center">
              <span className="rounded-full bg-primary-500 px-3 py-1 text-xs font-medium text-white">
                {t.irsJovemBadge(formatPercent(result.irsJovemExemptionRate, 0))}
              </span>
            </div>
          )}

          {/* Net salary */}
          <p className="text-center text-xs font-medium uppercase tracking-widest text-primary-100">
            {t.netSalaryLabel}
          </p>
          <p className="mt-1 text-center text-5xl font-bold tabular-nums text-white">
            {fmt(result.netSalary)}
          </p>
          {d && (
            <p className="mt-1 text-center text-sm font-semibold tabular-nums">
              <span className={cn(
                "rounded-full px-2.5 py-0.5",
                d.net > 0.005  && "bg-success-500/30 text-success-100",
                d.net < -0.005 && "bg-error-500/30 text-red-200",
                Math.abs(d.net) <= 0.005 && "bg-white/10 text-primary-200",
              )}>
                {d.net > 0.005 ? "+" : d.net < -0.005 ? "−" : ""}
                {formatCurrency(Math.abs(d.net))}
              </span>
            </p>
          )}

          {/* Period toggle */}
          <div className="mt-4 flex justify-center">
            <PillToggle
              options={t.periodOptions}
              value={period}
              onChange={(v) => setPeriod(v as Period)}
              className="flex-wrap justify-center gap-1.5"
            />
          </div>

          {period === "annual" && (
            <p className="mt-2 text-center text-xs text-primary-200">
              {result.annualPaymentsCount === 12 ? t.annualNoteWithDuodecimos : t.annualNote}
            </p>
          )}
        </div>

        {/* Rates */}
        <CardBody>
          <div className="grid grid-cols-3 gap-3">
            <RateBadge
              label={t.effectiveIrsLabel}
              value={formatPercent(result.effectiveIrsRate)}
              tooltip={t.effectiveIrsTooltip}
              delta={d?.irsRate}
              deltaHigherIsBetter={false}
            />
            <RateBadge
              label={t.totalDeductionLabel}
              value={formatPercent(result.totalDeductionRate)}
              tooltip={t.totalDeductionTooltip}
              delta={d?.totalRate}
              deltaHigherIsBetter={false}
            />
            <RateBadge
              label={t.employerRateLabel}
              value={formatPercent(employerRate)}
              tooltip={t.employerRateTooltip}
              delta={d?.employerRate}
              deltaHigherIsBetter={false}
            />
          </div>
        </CardBody>
      </Card>

      {/* ── Stacked bar chart ── */}
      <Card>
        <CardBody className="py-4">
          <SalaryBar
            ariaLabel={t.barAriaLabel}
            segments={[
              {
                key: "net",
                label: `${t.barNetLabel} — ${fmt(result.netSalary)}`,
                value: result.netSalary,
                colorClass: "bg-primary-500",
                hex: "#14B8A6",
                positive: true,
              },
              {
                key: "ss",
                label: `${t.barSSLabel} — ${fmt(result.socialSecurity)}`,
                value: result.socialSecurity,
                colorClass: "bg-warning-500",
                hex: "#F59E0B",
              },
              {
                key: "irs",
                label: `${t.barIrsLabel} — ${fmt(result.irsWithholding)}`,
                value: result.irsWithholding,
                colorClass: "bg-error-500",
                hex: "#EF4444",
              },
            ]}
          />
        </CardBody>
      </Card>

      {/* Disability fallback notice */}
      {disabilityFallback && (
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <span>{t.disabilityFallbackNote}</span>
        </div>
      )}

      {/* ── Payslip breakdown ── */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-neutral-900">{t.breakdownTitle}</h2>
        </CardHeader>
        <CardBody>
          <table className="w-full">
            <tbody>
              <PayslipRow
                label={t.grossLabel}
                value={fmt(result.grossSalary)}
                tooltip={t.grossTooltip}
                delta={d?.gross}
                deltaHigherIsBetter
              />
              {result.duodecimosMonthlyAmount > 0 && (
                <PayslipRow
                  label={t.duodecimosLabel}
                  value={`+ ${fmt(result.duodecimosMonthlyAmount)}`}
                  tooltip={t.duodecimosTooltip}
                  isPositive
                />
              )}
              <PayslipRow
                label={t.ssLabel}
                value={`− ${fmt(result.socialSecurity)}`}
                tooltip={t.ssTooltip}
                isNegative
                delta={d?.ss}
                deltaHigherIsBetter={false}
              />
              <PayslipRow
                label={t.irsLabel}
                value={`− ${fmt(result.irsWithholding)}`}
                tooltip={t.irsTooltip}
                isNegative
                delta={d?.irs}
                deltaHigherIsBetter={false}
              />
              {result.mealAllowanceExempt > 0 && (
                <PayslipRow
                  label={t.mealExemptLabel}
                  value={`+ ${fmt(result.mealAllowanceExempt)}`}
                  tooltip={t.mealExemptTooltip}
                  isPositive
                  delta={d?.meal}
                  deltaHigherIsBetter
                />
              )}
              <PayslipRow isSeparator label="" />
              <PayslipRow
                label={t.netLabel}
                value={fmt(result.netSalary)}
                tooltip={t.netTooltip}
                isTotal
                delta={d?.net}
                deltaHigherIsBetter
              />
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* ── Employer cost ── */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-neutral-900">{t.employerTitle}</h2>
        </CardHeader>
        <CardBody>
          <table className="w-full">
            <tbody>
              <PayslipRow
                label={t.employerGrossLabel}
                value={fmt(result.effectiveMonthlyGross)}
              />
              <PayslipRow
                label={t.employerSSLabel}
                value={`+ ${fmt(result.employerSocialSecurity)}`}
                tooltip={t.employerSSTooltip}
                isNegative
              />
              <PayslipRow isSeparator label="" />
              <PayslipRow
                label={t.employerTotalLabel}
                value={fmt(result.totalEmployerCost)}
                isTotal
                delta={d?.employer}
                deltaHigherIsBetter={false}
              />
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* ── How it's calculated ── */}
      <Card>
        <Collapsible
          trigger={
            <span className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <Info className="h-4 w-4 text-neutral-400" />
              {t.formulaToggle}
            </span>
          }
          triggerClassName="px-6 py-4"
          contentClassName="space-y-2 px-6 pb-5"
        >
          {atDebug && (
            <>
              {atDebug.duodecimosBase !== atDebug.grossSalary && (
                <FormulaLine>{t.formulaDuodecimos}</FormulaLine>
              )}
              {atDebug.irsJovemExemptAmount > 0 && (
                <FormulaLine>
                  {t.formulaIrsJovem(
                    formatPercent(result.irsJovemExemptionRate, 0),
                    formatCurrency(atDebug.irsJovemExemptAmount / result.irsJovemExemptionRate)
                  )}
                </FormulaLine>
              )}
              <FormulaLine>
                {t.formulaAtTable(
                  atDebug.withholdingTable,
                  formatPercent(atDebug.withholdingRate),
                  formatCurrency(atDebug.withholdingParcel)
                )}
              </FormulaLine>
            </>
          )}
          {brackDebug && (
            <FormulaLine>{t.formulaBrackets}</FormulaLine>
          )}
          <FormulaLine>{t.formulaSS}</FormulaLine>
          <FormulaLine>{t.formulaNet}</FormulaLine>
        </Collapsible>
      </Card>

      {/* Disclaimer */}
      <p className="px-1 text-xs leading-relaxed text-neutral-400">
        {t.disclaimer(result.year)}
      </p>
    </div>
  );
}
