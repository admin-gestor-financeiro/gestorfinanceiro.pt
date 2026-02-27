// Euribor rates API route
//
// Strategy (from docs/decisions/euribor-api.md):
//   1. Try api.euribor-rates.eu (clean JSON, no auth)
//   2. Fallback: ECB SDW (three parallel requests, SDMX-JSON)
//   3. Emergency: hardcoded static values + stale flag
//
// Cloudflare Cache API stores result for 4 hours (Euribor fixes once/business day).
// No global instances — cache is accessed per-request per Workers rules.

import { EURIBOR_FALLBACK, type EuriborTenor } from "@/lib/calculators/mortgage";

export type EuriborRatesResponse = {
  rates: Record<EuriborTenor, number>;
  source: "live" | "ecb" | "fallback";
  asOf: string; // ISO date string
};

const CACHE_TTL_SECONDS = 4 * 60 * 60; // 4 hours

// ─── Euribor-rates.eu primary ─────────────────────────────────────────────────

async function fetchFromEuriborRatesEu(): Promise<Record<EuriborTenor, number>> {
  const res = await fetch("https://api.euribor-rates.eu/v1/current_rates", {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(4_000),
  });
  if (!res.ok) throw new Error(`euribor-rates.eu HTTP ${res.status}`);

  // Expected shape: { data: [{ tenor: "3m"|"6m"|"1y", rate: 2.25 }], date: "..." }
  const body = await res.json() as { data?: { tenor: string; rate: number }[] };
  const list = body?.data;
  if (!Array.isArray(list)) throw new Error("euribor-rates.eu: unexpected shape");

  const map: Partial<Record<EuriborTenor, number>> = {};
  for (const item of list) {
    if (typeof item.rate !== "number") continue;
    const rateDecimal = item.rate / 100; // API returns percentage form
    if (item.tenor === "3m")  map["3m"]  = rateDecimal;
    if (item.tenor === "6m")  map["6m"]  = rateDecimal;
    if (item.tenor === "1y")  map["12m"] = rateDecimal;
  }

  if (map["3m"] === undefined || map["6m"] === undefined || map["12m"] === undefined) {
    throw new Error("euribor-rates.eu: missing tenors");
  }

  return map as Record<EuriborTenor, number>;
}

// ─── ECB SDW fallback ─────────────────────────────────────────────────────────

type EcbTenorKey = "3m" | "6m" | "12m";

const ECB_URLS: Record<EcbTenorKey, string> = {
  "3m":  "https://sdw-wsrest.ecb.europa.eu/service/data/FM/B.U2.EUR.RT0.BB.B03160000.OPYEA_R.EURIBOR3MD._T.A?format=jsondata&lastNObservations=1",
  "6m":  "https://sdw-wsrest.ecb.europa.eu/service/data/FM/B.U2.EUR.RT0.BB.B06160000.OPYEA_R.EURIBOR6MD._T.A?format=jsondata&lastNObservations=1",
  "12m": "https://sdw-wsrest.ecb.europa.eu/service/data/FM/B.U2.EUR.RT0.BB.B12160000.OPYEA_R.EURIBOR1YD._T.A?format=jsondata&lastNObservations=1",
};

async function fetchSingleEcbTenor(tenor: EcbTenorKey): Promise<number> {
  const res = await fetch(ECB_URLS[tenor], {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(6_000),
  });
  if (!res.ok) throw new Error(`ECB HTTP ${res.status} for ${tenor}`);

  // SDMX-JSON: rate is at dataSets[0].series["0:0:0:0:0:0:0:0:0"].observations["0"][0]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = await res.json() as any;
  const seriesKey = Object.keys(body?.dataSets?.[0]?.series ?? {})[0];
  if (!seriesKey) throw new Error(`ECB: no series for ${tenor}`);
  const observations = body.dataSets[0].series[seriesKey].observations as Record<string, number[]>;
  const obsKey = Object.keys(observations)[0];
  if (!obsKey) throw new Error(`ECB: no observation for ${tenor}`);
  const value = observations[obsKey]?.[0];
  if (typeof value !== "number") throw new Error(`ECB: non-numeric value for ${tenor}`);
  // ECB returns percentage form (e.g. 2.25), convert to decimal
  return value / 100;
}

async function fetchFromEcb(): Promise<Record<EuriborTenor, number>> {
  const [r3m, r6m, r12m] = await Promise.all([
    fetchSingleEcbTenor("3m"),
    fetchSingleEcbTenor("6m"),
    fetchSingleEcbTenor("12m"),
  ]);
  return { "3m": r3m, "6m": r6m, "12m": r12m };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: Request): Promise<Response> {
  const cache = caches.default;
  const cacheKey = new Request("https://internal.cache/euribor-rates-v1");

  // 1. Check Cloudflare cache
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  // 2. Try primary source
  let rates: Record<EuriborTenor, number> | null = null;
  let source: EuriborRatesResponse["source"] = "fallback";

  try {
    rates = await fetchFromEuriborRatesEu();
    source = "live";
  } catch {
    // Primary failed — try ECB
    try {
      rates = await fetchFromEcb();
      source = "ecb";
    } catch {
      // Both failed — use hardcoded fallback
      rates = { ...EURIBOR_FALLBACK };
      source = "fallback";
    }
  }

  const body: EuriborRatesResponse = {
    rates,
    source,
    asOf: new Date().toISOString().slice(0, 10),
  };

  const ttl = source === "fallback" ? 300 : CACHE_TTL_SECONDS; // shorter TTL for stale fallback
  const response = Response.json(body, {
    headers: {
      "Cache-Control": `public, max-age=${ttl}`,
      "Access-Control-Allow-Origin": "*",
    },
  });

  // Non-blocking cache write (Cloudflare Workers pattern)
  // context.waitUntil not available here without the CF context, but cache.put is fire-and-forget
  void cache.put(cacheKey, response.clone());

  return response;
}
