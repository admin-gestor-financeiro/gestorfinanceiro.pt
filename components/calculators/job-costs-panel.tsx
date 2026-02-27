"use client";

import { useState } from "react";
import { Car, ChevronDown, Clock, Utensils } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import {
  calculateJobDeductions,
  type JobCosts,
} from "@/lib/calculators/job-costs";

// ─── Types ────────────────────────────────────────────────────────────────────

type Locale = "pt" | "en";

type Strings = {
  title: string;
  commuteSection: string;
  transport: string;
  transportHint: string;
  parking: string;
  tolls: string;
  otherCommute: string;
  foodSection: string;
  food: string;
  foodHint: string;
  timeSection: string;
  commuteMinutes: string;
  commuteMinutesHint: string;
  workingDays: string;
  hourlyRate: string;
  hourlyRateHint: (auto: string) => string;
  netSalaryLabel: string;
  commuteLabel: string;
  foodLabel: string;
  timeCostLabel: (hours: string, rate: string) => string;
  totalDeductionLabel: string;
  adjustedNetLabel: string;
  adjustedHourlyLabel: string;
  costsChip: (total: string) => string;
  noSalaryHint: string;
};

// ─── Locale strings ───────────────────────────────────────────────────────────

const PT: Strings = {
  title: "Custos do Emprego",
  commuteSection: "Deslocação (mensal)",
  transport: "Transportes",
  transportHint: "Passes, gasolina, etc.",
  parking: "Estacionamento",
  tolls: "Portagens",
  otherCommute: "Outros",
  foodSection: "Alimentação (mensal)",
  food: "Custo extra de alimentação",
  foodHint: "Custo mensal com alimentação",
  timeSection: "Tempo",
  commuteMinutes: "Deslocação (só ida)",
  commuteMinutesHint: "Em minutos",
  workingDays: "Dias úteis/mês",
  hourlyRate: "Valor da hora (€/h)",
  hourlyRateHint: (auto) =>
    `Deixe em branco para calcular automaticamente (${auto}/h baseado no salário líquido)`,
  netSalaryLabel: "Salário Líquido",
  commuteLabel: "Deslocação",
  foodLabel: "Alimentação",
  timeCostLabel: (hours, rate) => `Tempo (${hours}h × ${rate}/h)`,
  totalDeductionLabel: "Total Custos",
  adjustedNetLabel: "Salário Efetivo",
  adjustedHourlyLabel: "Taxa horária efetiva",
  costsChip: (total) => `−${total}/mês`,
  noSalaryHint: "Introduza o salário bruto para calcular o salário efetivo.",
};

const EN: Strings = {
  title: "Job Costs",
  commuteSection: "Commute (monthly)",
  transport: "Transport",
  transportHint: "Monthly passes, fuel, etc.",
  parking: "Parking",
  tolls: "Tolls",
  otherCommute: "Other",
  foodSection: "Food (monthly)",
  food: "Extra food cost",
  foodHint: "Monthly food cost",
  timeSection: "Time",
  commuteMinutes: "Commute (one way)",
  commuteMinutesHint: "In minutes",
  workingDays: "Working days/month",
  hourlyRate: "Hourly rate (€/h)",
  hourlyRateHint: (auto) =>
    `Leave blank to auto-calculate (${auto}/h derived from net salary)`,
  netSalaryLabel: "Net Salary",
  commuteLabel: "Commute",
  foodLabel: "Food",
  timeCostLabel: (hours, rate) => `Time (${hours}h × ${rate}/h)`,
  totalDeductionLabel: "Total Costs",
  adjustedNetLabel: "Effective Salary",
  adjustedHourlyLabel: "Effective hourly rate",
  costsChip: (total) => `−${total}/month`,
  noSalaryHint: "Enter your gross salary to see the effective salary.",
};

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  costs: JobCosts;
  setCosts: (c: JobCosts) => void;
  locale?: Locale;
  /** Pass the calculated net salary so time cost can be auto-derived. */
  netSalary: number | null;
};

export function JobCostsPanel({
  costs,
  setCosts,
  locale = "pt",
  netSalary,
}: Props) {
  const t = locale === "en" ? EN : PT;
  const [open, setOpen] = useState(false);

  function set(key: keyof JobCosts, value: string) {
    setCosts({ ...costs, [key]: value });
  }

  const deductions =
    netSalary !== null && netSalary > 0
      ? calculateJobDeductions(netSalary, costs)
      : null;

  const autoHourlyRateStr = deductions
    ? formatCurrency(deductions.effectiveHourlyRate)
    : "—";

  const hasDeductions = deductions && deductions.totalDeduction > 0.01;

  return (
    <div className="space-y-3">

      {/* ── Form card ── */}
      <Card>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl px-5 py-4 text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-neutral-400" />
            <span className="font-semibold text-neutral-900">{t.title}</span>
            {hasDeductions && (
              <span className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-700">
                {t.costsChip(formatCurrency(deductions.totalDeduction))}
              </span>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <div className="space-y-6 px-5 pb-5">

            {/* Commute section */}
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                <Car className="h-3.5 w-3.5" />
                {t.commuteSection}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t.transport}
                  hint={t.transportHint}
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={costs.transport}
                  onChange={(e) => set("transport", e.target.value)}
                />
                <Input
                  label={t.parking}
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={costs.parking}
                  onChange={(e) => set("parking", e.target.value)}
                />
                <Input
                  label={t.tolls}
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={costs.tolls}
                  onChange={(e) => set("tolls", e.target.value)}
                />
                <Input
                  label={t.otherCommute}
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={costs.otherCommute}
                  onChange={(e) => set("otherCommute", e.target.value)}
                />
              </div>
            </div>

            {/* Food section */}
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                <Utensils className="h-3.5 w-3.5" />
                {t.foodSection}
              </p>
              <Input
                label={t.food}
                hint={t.foodHint}
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={costs.food}
                onChange={(e) => set("food", e.target.value)}
              />
            </div>

            {/* Time section */}
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                <Clock className="h-3.5 w-3.5" />
                {t.timeSection}
              </p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={t.commuteMinutes}
                    hint={t.commuteMinutesHint}
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={costs.commuteMinutes}
                    onChange={(e) => set("commuteMinutes", e.target.value)}
                  />
                  <Input
                    label={t.workingDays}
                    type="text"
                    inputMode="decimal"
                    placeholder="22"
                    value={costs.workingDays}
                    onChange={(e) => set("workingDays", e.target.value)}
                  />
                </div>
                <Input
                  label={t.hourlyRate}
                  hint={t.hourlyRateHint(autoHourlyRateStr)}
                  type="text"
                  inputMode="decimal"
                  placeholder={autoHourlyRateStr}
                  value={costs.hourlyRateOverride}
                  onChange={(e) => set("hourlyRateOverride", e.target.value)}
                />
              </div>
            </div>

          </div>
        )}
      </Card>

      {/* ── Adjusted salary summary ── */}
      {netSalary !== null && netSalary > 0 ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardBody className="py-4">
            <table className="w-full">
              <tbody>
                {/* Net salary baseline */}
                <tr>
                  <td className="py-1 text-sm text-neutral-600">
                    {t.netSalaryLabel}
                  </td>
                  <td className="py-1 text-right text-sm tabular-nums text-neutral-700">
                    {formatCurrency(netSalary)}
                  </td>
                </tr>

                {/* Commute deduction */}
                {deductions && deductions.totalCommute > 0.01 && (
                  <tr>
                    <td className="py-1 text-sm text-neutral-500">
                      − {t.commuteLabel}
                    </td>
                    <td className="py-1 text-right text-sm tabular-nums text-error-600">
                      −{formatCurrency(deductions.totalCommute)}
                    </td>
                  </tr>
                )}

                {/* Food deduction */}
                {deductions && deductions.foodCost > 0.01 && (
                  <tr>
                    <td className="py-1 text-sm text-neutral-500">
                      − {t.foodLabel}
                    </td>
                    <td className="py-1 text-right text-sm tabular-nums text-error-600">
                      −{formatCurrency(deductions.foodCost)}
                    </td>
                  </tr>
                )}

                {/* Time deduction */}
                {deductions && deductions.timeCost > 0.01 && (
                  <tr>
                    <td className="py-1 text-sm text-neutral-500">
                      −{" "}
                      {t.timeCostLabel(
                        deductions.commuteHoursPerMonth.toFixed(1),
                        formatCurrency(deductions.effectiveHourlyRate),
                      )}
                    </td>
                    <td className="py-1 text-right text-sm tabular-nums text-error-600">
                      −{formatCurrency(deductions.timeCost)}
                    </td>
                  </tr>
                )}

                {/* Separator */}
                <tr>
                  <td colSpan={2} className="py-1">
                    <div className="border-t border-amber-200" />
                  </td>
                </tr>

                {/* Adjusted net */}
                <tr>
                  <td className="py-1.5 text-sm font-semibold text-neutral-900">
                    {t.adjustedNetLabel}
                  </td>
                  <td className="py-1.5 text-right text-xl font-bold tabular-nums text-neutral-900">
                    {deductions
                      ? formatCurrency(deductions.adjustedNetSalary)
                      : formatCurrency(netSalary)}
                  </td>
                </tr>

                {/* Effective hourly rate */}
                <tr>
                  <td className="pt-0.5 text-xs text-neutral-400">
                    {t.adjustedHourlyLabel}
                  </td>
                  <td className="pt-0.5 text-right text-xs tabular-nums text-neutral-400">
                    {deductions
                      ? `${formatCurrency(deductions.adjustedHourlyRate)}/h`
                      : `${autoHourlyRateStr}/h`}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardBody>
        </Card>
      ) : (
        <p className="px-1 text-xs text-neutral-400">{t.noSalaryHint}</p>
      )}

    </div>
  );
}
