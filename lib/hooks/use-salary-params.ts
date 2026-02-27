"use client";

/**
 * useSalaryParams — URL search params + localStorage sync for the salary calculator.
 *
 * Priority on mount: URL params > localStorage > hardcoded defaults.
 * After mount: every state change is persisted to localStorage immediately and
 * debounced to the URL via replaceState (no history entry per keystroke).
 *
 * Cloudflare Workers note: this hook runs entirely client-side. No server state.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_TAX_YEAR,
  DEFAULT_REGION,
  type MaritalStatus,
  type MealAllowanceType,
  type DuodecimosOption,
  type TaxYear,
  type Region,
} from "@/lib/calculators/net-salary";

// ─── State shape ──────────────────────────────────────────────────────────────

export type GrossPeriod = "monthly" | "annual";

export type SalaryFormState = {
  year: TaxYear;
  region: Region;
  grossInput: string;
  /** Whether grossInput is a monthly or annual figure. Annual is divided by 14 for calculations. */
  grossPeriod: GrossPeriod;
  maritalStatus: MaritalStatus;
  dependentsCount: number;
  disability: boolean;
  mealType: MealAllowanceType;
  mealAmountInput: string;
  duodecimos: DuodecimosOption;
  irsJovemActive: boolean;
  irsJovemYear: number;
};

export const DEFAULT_SALARY_STATE: SalaryFormState = {
  year:            DEFAULT_TAX_YEAR,
  region:          DEFAULT_REGION,
  grossInput:      "",
  grossPeriod:     "monthly",
  maritalStatus:   "single",
  dependentsCount: 0,
  disability:      false,
  mealType:        "none",
  mealAmountInput: "",
  duodecimos:      "none",
  irsJovemActive:  false,
  irsJovemYear:    1,
};

// ─── URL encoding ─────────────────────────────────────────────────────────────
// Short param keys to keep shared URLs compact.

const P = {
  year:         "y",
  region:       "r",
  gross:        "g",
  grossPeriod:  "gp",
  marital:      "m",
  dependents:   "d",
  disability:   "dis",
  mealType:     "mt",
  mealAmount:   "ma",
  duodecimos:   "duo",
  irsJovem:     "ij",
  irsJovemYear: "ijy",
} as const;

function encodeState(s: SalaryFormState): URLSearchParams {
  const p = new URLSearchParams();
  if (s.grossInput)                           p.set(P.gross,        s.grossInput);
  if (s.grossPeriod === "annual")             p.set(P.grossPeriod,  "a");
  if (s.year       !== DEFAULT_TAX_YEAR)      p.set(P.year,         String(s.year));
  if (s.region     !== DEFAULT_REGION)        p.set(P.region,       s.region);
  if (s.maritalStatus !== "single")           p.set(P.marital,      s.maritalStatus);
  if (s.dependentsCount > 0)                  p.set(P.dependents,   String(s.dependentsCount));
  if (s.disability)                           p.set(P.disability,   "1");
  if (s.mealType   !== "none")                p.set(P.mealType,     s.mealType);
  if (s.mealAmountInput)                      p.set(P.mealAmount,   s.mealAmountInput);
  if (s.duodecimos !== "none")                p.set(P.duodecimos,   s.duodecimos);
  if (s.irsJovemActive) {
    p.set(P.irsJovem,     "1");
    p.set(P.irsJovemYear, String(s.irsJovemYear));
  }
  return p;
}

function decodeParams(search: string): Partial<SalaryFormState> {
  const p   = new URLSearchParams(search);
  const out: Partial<SalaryFormState> = {};

  const gross = p.get(P.gross);
  if (gross) out.grossInput = gross;

  if (p.get(P.grossPeriod) === "a") out.grossPeriod = "annual";

  const year = p.get(P.year);
  if (year === "2025" || year === "2026") out.year = Number(year) as TaxYear;

  const region = p.get(P.region);
  if (region === "continente" || region === "acores" || region === "madeira") {
    out.region = region as Region;
  }

  const marital = p.get(P.marital);
  if (marital === "single" || marital === "married_single" || marital === "married_dual") {
    out.maritalStatus = marital as MaritalStatus;
  }

  const deps = p.get(P.dependents);
  if (deps !== null) out.dependentsCount = Math.min(5, Math.max(0, parseInt(deps, 10) || 0));

  if (p.get(P.disability) === "1") out.disability = true;

  const mt = p.get(P.mealType);
  if (mt === "cash" || mt === "card") out.mealType = mt as MealAllowanceType;

  const ma = p.get(P.mealAmount);
  if (ma) out.mealAmountInput = ma;

  const duo = p.get(P.duodecimos);
  if (
    duo === "both_full" ||
    duo === "half_one"  ||
    duo === "half_two_or_one_full"
  ) out.duodecimos = duo as DuodecimosOption;

  if (p.get(P.irsJovem) === "1") {
    out.irsJovemActive = true;
    const ijy = p.get(P.irsJovemYear);
    if (ijy !== null) out.irsJovemYear = Math.min(10, Math.max(1, parseInt(ijy, 10) || 1));
  }

  return out;
}

// ─── localStorage ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "gf_salary_v1";

function readStorage(): Partial<SalaryFormState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<SalaryFormState>;
  } catch {
    return {};
  }
}

function writeStorage(s: SalaryFormState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // Private browsing or quota exceeded — silent failure
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns `[state, setState]`.
 *
 * - On mount: initialises from URL params (if present) then falls back to localStorage.
 * - On every state change: persists to localStorage immediately; debounces URL
 *   update via `window.history.replaceState` so typing doesn't flood history.
 */
export function useSalaryParams(): [SalaryFormState, (s: SalaryFormState) => void] {
  const [state, setStateRaw] = useState<SalaryFormState>(DEFAULT_SALARY_STATE);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const initialised = useRef(false);

  // One-time mount: read URL first, then localStorage
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    const urlOverrides = decodeParams(window.location.search);
    if (Object.keys(urlOverrides).length > 0) {
      setStateRaw((prev) => ({ ...prev, ...urlOverrides }));
      return;
    }

    const stored = readStorage();
    if (Object.keys(stored).length > 0) {
      setStateRaw((prev) => ({ ...prev, ...stored }));
    }
  }, []);

  const setState = useCallback((newState: SalaryFormState) => {
    setStateRaw(newState);
    writeStorage(newState);

    // Debounce URL so fast typing doesn't push many history entries
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = encodeState(newState);
      const search = params.toString();
      const next   = search ? `?${search}` : window.location.pathname;
      window.history.replaceState(null, "", next);
    }, 600);
  }, []);

  return [state, setState];
}
