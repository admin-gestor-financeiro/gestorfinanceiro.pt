/**
 * Shared types for IRS withholding table data files.
 *
 * All three regions (Continente, Açores, Madeira) follow the same table structure
 * for Trabalho dependente (Category A). Pension tables (Category H) are out of
 * scope for the salary calculator and are not typed here.
 */

export type Region = "continente" | "acores" | "madeira";

/**
 * A single income bracket in a withholding table.
 *
 * Formula: max(0, R × rate − parcel − (rowDepParcel ?? tableDepParcel) × nDeps)
 *
 * - `upTo`: upper bound of the bracket (Infinity for the last row)
 * - `rate`: marginal rate (decimal, e.g. 0.241 = 24.1%)
 * - `parcel`: fixed deduction amount (€) — already pre-expanded for variable-parcel rows
 * - `depParcel`: per-dependent deduction for disability tables (V, VI, VII) where
 *   the value differs per row. For regular Tables I–III the per-table depParcel
 *   from `WithholdingRegionTables.depParcel` is used instead.
 */
export type WithholdingBracket = {
  upTo: number;
  rate: number;
  parcel: number;
  /** Only present on disability table rows (Tables V, VI, VII) */
  depParcel?: number;
};

/**
 * All withholding tables for a single region and year.
 *
 * Tables I–III: regular work dependent income
 *   - tableI:   single (no deps) / married dual earners
 *   - tableII:  single with 1+ dependents
 *   - tableIII: married sole earner
 *
 * Tables IV–VII: work dependent + disability (pessoa com deficiência)
 *   - tableIV:  single / married dual, no deps — disability
 *   - tableV:   single with deps — disability
 *   - tableVI:  married dual with deps — disability
 *   - tableVII: married sole earner — disability
 *
 * null means the table is not yet available for that region.
 */
export type WithholdingRegionTables = {
  region: Region;
  year: number;
  incomeType: "work";

  /** Per-table depParcel values for regular tables I–III */
  depParcel: {
    I:   number;
    II:  number;
    III: number;
  };

  tableI:    WithholdingBracket[];
  tableII:   WithholdingBracket[];
  tableIII:  WithholdingBracket[];
  tableIV:   WithholdingBracket[] | null;
  tableV:    WithholdingBracket[] | null;
  tableVI:   WithholdingBracket[] | null;
  tableVII:  WithholdingBracket[] | null;
};
