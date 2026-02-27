/**
 * Static withholding table data — barrel export
 *
 * Usage:
 *   import { WITHHOLDING_TABLES, getRegionTables } from "@/data/withholding-tables";
 */

export type { Region, WithholdingBracket, WithholdingRegionTables } from "./withholding-tables.types";
export { CONTINENTE_2026 } from "./withholding-tables-continente-2026";
export { ACORES_2026 } from "./withholding-tables-acores-2026";
export { MADEIRA_2026 } from "./withholding-tables-madeira-2026";

import { CONTINENTE_2026 } from "./withholding-tables-continente-2026";
import { ACORES_2026 } from "./withholding-tables-acores-2026";
import { MADEIRA_2026 } from "./withholding-tables-madeira-2026";
import type { Region, WithholdingRegionTables } from "./withholding-tables.types";

export const WITHHOLDING_TABLES: Record<Region, Record<number, WithholdingRegionTables>> = {
  continente: { 2026: CONTINENTE_2026 },
  acores:     { 2026: ACORES_2026 },
  madeira:    { 2026: MADEIRA_2026 },
};

/**
 * Look up tables for a given region and year.
 * Falls back to Continente if the combination is not available.
 */
export function getRegionTables(region: Region, year: number): WithholdingRegionTables {
  return WITHHOLDING_TABLES[region]?.[year] ?? CONTINENTE_2026;
}
