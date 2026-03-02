"use client";

/**
 * useImiParams — URL search params + localStorage sync for the IMI calculator.
 *
 * Priority on mount: URL params > localStorage > hardcoded defaults.
 * After mount: every state change is persisted to localStorage immediately and
 * debounced to the URL via replaceState (no history entry per keystroke).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ImiPropertyType, ImiPropertyPurpose, ImiFilingStatus } from "@/lib/calculators/imi";

// ─── State shape ──────────────────────────────────────────────────────────────

export type PortfolioPropertyState = {
  id: string;
  vptInput: string;
  distrito: string;
  municipioId: string;
  propertyType: ImiPropertyType;
  propertyPurpose: ImiPropertyPurpose;
  dependents: 0 | 1 | 2 | 3;
};

export type ImiFormState = {
  // Core
  vptInput: string;
  distrito: string;
  municipioId: string;
  /** Parish ID — only relevant for municipalities with per-parish rates (Espinho, Gondomar) */
  frequesiaId: string;
  propertyType: ImiPropertyType;
  propertyPurpose: ImiPropertyPurpose;
  dependents: 0 | 1 | 2 | 3;
  // Exemption checker
  showExemptionSection: boolean;
  householdIncomeInput: string;
  totalFamilyVptInput: string;
  acquisitionYear: number;
  previousExemptionsUsed: 0 | 1 | 2;
  // AIMI
  showAimiSection: boolean;
  aimiTotalVptInput: string;
  aimiFilingStatus: ImiFilingStatus;
  aimiIncludesVacant: boolean;
  // VPT Reassessment
  showVptSection: boolean;
  vptLastEvalYear: number;
  vptClInput: string;
  vptAaInput: string;
  vptAbInput: string;
  vptConstructionYear: number;
  vptPool: boolean;
  vptGarage: boolean;
  vptAc: boolean;
  vptGated: boolean;
  vptSingleFamily: boolean;
  // Portfolio (localStorage-only — not URL encoded due to complexity)
  showPortfolioSection: boolean;
  portfolioProperties: PortfolioPropertyState[];
};

export const DEFAULT_IMI_STATE: ImiFormState = {
  vptInput:               "",
  distrito:               "",
  municipioId:            "",
  frequesiaId:            "",
  propertyType:           "urbano",
  propertyPurpose:        "hpp",
  dependents:             0,
  showExemptionSection:   false,
  householdIncomeInput:   "",
  totalFamilyVptInput:    "",
  acquisitionYear:        2024,
  previousExemptionsUsed: 0,
  showAimiSection:        false,
  aimiTotalVptInput:      "",
  aimiFilingStatus:       "individual",
  aimiIncludesVacant:     false,
  showVptSection:         false,
  vptLastEvalYear:        2020,
  vptClInput:             "",
  vptAaInput:             "",
  vptAbInput:             "",
  vptConstructionYear:    2000,
  vptPool:                false,
  vptGarage:              false,
  vptAc:                  false,
  vptGated:               false,
  vptSingleFamily:        false,
  showPortfolioSection:   false,
  portfolioProperties:    [],
};

// ─── URL encoding — short param keys to keep shared URLs compact ──────────────

const P = {
  vpt:              "v",
  distrito:         "di",
  municipio:        "m",
  freguesia:        "fr",
  propertyType:     "pt",
  propertyPurpose:  "pp",
  dependents:       "d",
  showExemption:    "ex",
  income:           "inc",
  familyVpt:        "fv",
  acqYear:          "ay",
  prevEx:           "pe",
  showAimi:         "ai",
  aimiVpt:          "av",
  aimiStatus:       "as",
  aimiVacant:       "ava",
  // VPT reassessment params
  showVpt:          "rv",
  vptEval:          "re",
  vptCl:            "rcl",
  vptAa:            "raa",
  vptAb:            "rab",
  vptYear:          "ry",
  vptAmens:         "ra", // bitmask: pool=1, garage=2, ac=4, gated=8, single=16
} as const;

const VALID_PROPERTY_TYPES: ImiPropertyType[] = ["urbano", "rustico", "terreno_construcao"];
const VALID_PURPOSES: ImiPropertyPurpose[] = ["hpp", "secondary", "rental", "vacant"];
const VALID_FILING: ImiFilingStatus[] = ["individual", "couple", "company"];

function encodeState(s: ImiFormState): URLSearchParams {
  const p = new URLSearchParams();
  if (s.vptInput)                           p.set(P.vpt,             s.vptInput);
  if (s.distrito)                           p.set(P.distrito,        s.distrito);
  if (s.municipioId)                        p.set(P.municipio,       s.municipioId);
  if (s.frequesiaId)                        p.set(P.freguesia,       s.frequesiaId);
  if (s.propertyType !== "urbano")          p.set(P.propertyType,    s.propertyType);
  if (s.propertyPurpose !== "hpp")          p.set(P.propertyPurpose, s.propertyPurpose);
  if (s.dependents > 0)                     p.set(P.dependents,      String(s.dependents));
  if (s.showExemptionSection) {
    p.set(P.showExemption, "1");
    if (s.householdIncomeInput)             p.set(P.income,          s.householdIncomeInput);
    if (s.totalFamilyVptInput)              p.set(P.familyVpt,       s.totalFamilyVptInput);
    if (s.acquisitionYear !== 2024)         p.set(P.acqYear,         String(s.acquisitionYear));
    if (s.previousExemptionsUsed > 0)       p.set(P.prevEx,          String(s.previousExemptionsUsed));
  }
  if (s.showAimiSection) {
    p.set(P.showAimi, "1");
    if (s.aimiTotalVptInput)                p.set(P.aimiVpt,         s.aimiTotalVptInput);
    if (s.aimiFilingStatus !== "individual") p.set(P.aimiStatus,     s.aimiFilingStatus);
    if (s.aimiIncludesVacant)               p.set(P.aimiVacant,      "1");
  }
  if (s.showVptSection) {
    p.set(P.showVpt, "1");
    if (s.vptLastEvalYear !== 2020)         p.set(P.vptEval,         String(s.vptLastEvalYear));
    if (s.vptClInput)                       p.set(P.vptCl,           s.vptClInput);
    if (s.vptAaInput)                       p.set(P.vptAa,           s.vptAaInput);
    if (s.vptAbInput)                       p.set(P.vptAb,           s.vptAbInput);
    if (s.vptConstructionYear !== 2000)     p.set(P.vptYear,         String(s.vptConstructionYear));
    const amensBitmask =
      (s.vptPool         ? 1  : 0) |
      (s.vptGarage       ? 2  : 0) |
      (s.vptAc           ? 4  : 0) |
      (s.vptGated        ? 8  : 0) |
      (s.vptSingleFamily ? 16 : 0);
    if (amensBitmask > 0)                   p.set(P.vptAmens,        String(amensBitmask));
  }
  return p;
}

function decodeParams(search: string): Partial<ImiFormState> {
  const p = new URLSearchParams(search);
  const out: Partial<ImiFormState> = {};

  const vpt = p.get(P.vpt);
  if (vpt) out.vptInput = vpt;

  const distrito = p.get(P.distrito);
  if (distrito) out.distrito = distrito;

  const municipio = p.get(P.municipio);
  if (municipio) out.municipioId = municipio;

  const freguesia = p.get(P.freguesia);
  if (freguesia) out.frequesiaId = freguesia;

  const pt = p.get(P.propertyType);
  if (pt && VALID_PROPERTY_TYPES.includes(pt as ImiPropertyType)) {
    out.propertyType = pt as ImiPropertyType;
  }

  const pp = p.get(P.propertyPurpose);
  if (pp && VALID_PURPOSES.includes(pp as ImiPropertyPurpose)) {
    out.propertyPurpose = pp as ImiPropertyPurpose;
  }

  const deps = p.get(P.dependents);
  if (deps !== null) {
    const n = parseInt(deps, 10);
    if (n >= 0 && n <= 3) out.dependents = n as 0 | 1 | 2 | 3;
  }

  if (p.get(P.showExemption) === "1") {
    out.showExemptionSection = true;
    const income = p.get(P.income);
    if (income) out.householdIncomeInput = income;
    const fv = p.get(P.familyVpt);
    if (fv) out.totalFamilyVptInput = fv;
    const ay = p.get(P.acqYear);
    if (ay !== null) {
      const year = parseInt(ay, 10);
      if (year >= 2000 && year <= 2026) out.acquisitionYear = year;
    }
    const pe = p.get(P.prevEx);
    if (pe === "1") out.previousExemptionsUsed = 1;
    if (pe === "2") out.previousExemptionsUsed = 2;
  }

  if (p.get(P.showAimi) === "1") {
    out.showAimiSection = true;
    const av = p.get(P.aimiVpt);
    if (av) out.aimiTotalVptInput = av;
    const as_ = p.get(P.aimiStatus);
    if (as_ && VALID_FILING.includes(as_ as ImiFilingStatus)) {
      out.aimiFilingStatus = as_ as ImiFilingStatus;
    }
    if (p.get(P.aimiVacant) === "1") out.aimiIncludesVacant = true;
  }

  if (p.get(P.showVpt) === "1") {
    out.showVptSection = true;
    const re = p.get(P.vptEval);
    if (re !== null) {
      const year = parseInt(re, 10);
      if (year >= 2000 && year <= 2026) out.vptLastEvalYear = year;
    }
    const rcl = p.get(P.vptCl);
    if (rcl) out.vptClInput = rcl;
    const raa = p.get(P.vptAa);
    if (raa) out.vptAaInput = raa;
    const rab = p.get(P.vptAb);
    if (rab) out.vptAbInput = rab;
    const ry = p.get(P.vptYear);
    if (ry !== null) {
      const year = parseInt(ry, 10);
      if (year >= 1900 && year <= 2026) out.vptConstructionYear = year;
    }
    const ra = p.get(P.vptAmens);
    if (ra !== null) {
      const mask = parseInt(ra, 10);
      if (!isNaN(mask)) {
        out.vptPool         = (mask & 1)  > 0;
        out.vptGarage       = (mask & 2)  > 0;
        out.vptAc           = (mask & 4)  > 0;
        out.vptGated        = (mask & 8)  > 0;
        out.vptSingleFamily = (mask & 16) > 0;
      }
    }
  }

  return out;
}

// ─── localStorage ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "gf_imi_v1";

function readStorage(): Partial<ImiFormState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<ImiFormState>;
  } catch {
    return {};
  }
}

function writeStorage(s: ImiFormState): void {
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
export function useImiParams(): [ImiFormState, (s: ImiFormState) => void] {
  const [state, setStateRaw] = useState<ImiFormState>(DEFAULT_IMI_STATE);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const initialised = useRef(false);

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

  const setState = useCallback((newState: ImiFormState) => {
    setStateRaw(newState);
    writeStorage(newState);

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
