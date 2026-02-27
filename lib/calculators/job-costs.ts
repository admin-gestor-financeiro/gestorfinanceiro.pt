// Job costs calculator
// Computes the "effective" net salary after accounting for commute,
// food, and time costs associated with a job.

const WORKING_HOURS_PER_DAY = 8;

// ─── Types ────────────────────────────────────────────────────────────────────

/** All monetary fields are strings so they can be used directly as form inputs. */
export type JobCosts = {
  /** Monthly transport cost (passes, fuel, etc.) */
  transport: string;
  /** Monthly parking cost */
  parking: string;
  /** Monthly tolls cost */
  tolls: string;
  /** Other monthly commute costs (e.g. ride-sharing) */
  otherCommute: string;
  /** Extra monthly food cost vs not having this job (e.g. no canteen) */
  food: string;
  /** One-way commute time in minutes */
  commuteMinutes: string;
  /** Working days per month used for time-cost calculation (default 22) */
  workingDays: string;
  /**
   * Optional override for the hourly rate used in time-cost calculation.
   * Empty string = auto-derive from net salary ÷ (workingDays × 8h).
   */
  hourlyRateOverride: string;
};

export type JobDeductions = {
  /** Sum of transport + parking + tolls + otherCommute */
  totalCommute: number;
  /** Extra food cost */
  foodCost: number;
  /** Hourly rate used for time valuation (auto or overridden) */
  effectiveHourlyRate: number;
  /** Total hours of commute per month (one-way × 2 × workingDays / 60) */
  commuteHoursPerMonth: number;
  /** Monetary value of time lost: commuteHoursPerMonth × effectiveHourlyRate */
  timeCost: number;
  /** totalCommute + foodCost + timeCost */
  totalDeduction: number;
  /** netSalary − totalDeduction */
  adjustedNetSalary: number;
  /** adjustedNetSalary ÷ (workingDays × 8) */
  adjustedHourlyRate: number;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_JOB_COSTS: JobCosts = {
  transport: "",
  parking: "",
  tolls: "",
  otherCommute: "",
  food: "",
  commuteMinutes: "",
  workingDays: "22",
  hourlyRateOverride: "",
};

// ─── Calculation ──────────────────────────────────────────────────────────────

export function calculateJobDeductions(
  netSalary: number,
  costs: JobCosts,
): JobDeductions {
  const transport = parseFloat(costs.transport) || 0;
  const parking = parseFloat(costs.parking) || 0;
  const tolls = parseFloat(costs.tolls) || 0;
  const otherCommute = parseFloat(costs.otherCommute) || 0;
  const food = parseFloat(costs.food) || 0;
  const commuteMinutes = parseFloat(costs.commuteMinutes) || 0;
  const workingDays = parseFloat(costs.workingDays) || 22;

  const totalCommute = transport + parking + tolls + otherCommute;
  const workingHoursPerMonth = workingDays * WORKING_HOURS_PER_DAY;

  const autoHourlyRate =
    workingHoursPerMonth > 0 ? netSalary / workingHoursPerMonth : 0;

  const effectiveHourlyRate = costs.hourlyRateOverride
    ? parseFloat(costs.hourlyRateOverride) || autoHourlyRate
    : autoHourlyRate;

  // Round-trip commute hours per month
  const commuteHoursPerMonth = (commuteMinutes * 2 * workingDays) / 60;
  const timeCost = commuteHoursPerMonth * effectiveHourlyRate;

  const totalDeduction = totalCommute + food + timeCost;
  const adjustedNetSalary = netSalary - totalDeduction;
  const adjustedHourlyRate =
    workingHoursPerMonth > 0 ? adjustedNetSalary / workingHoursPerMonth : 0;

  return {
    totalCommute,
    foodCost: food,
    effectiveHourlyRate,
    commuteHoursPerMonth,
    timeCost,
    totalDeduction,
    adjustedNetSalary,
    adjustedHourlyRate,
  };
}
