# Decision: Euribor rate API strategy

**Date**: 2026-02-27
**Status**: Decided

## Research

[Research](../research/euribor-api.md)

---

## Decision

Use a **two-source strategy with aggressive caching**:

1. **Primary**: `api.euribor-rates.eu` — `GET https://api.euribor-rates.eu/v1/current_rates`
2. **Fallback**: ECB Statistical Data Warehouse REST API (three separate requests, one per tenor)
3. **Emergency static fallback**: hardcoded values (updated manually when rates shift materially) served with a "rates may be outdated" UI flag

All fetching happens server-side in a Next.js API route (`/api/euribor`). The Cloudflare Cache API caches the route response for **4 hours**. The calculator client reads from this route on load; hardcoded defaults (3M: 2.01%, 6M: 2.14%, 12M: 2.25%) are shown before the fetch resolves.

---

## Why these choices

### Why api.euribor-rates.eu as primary

- Purpose-built for this exact use case — returns all Euribor tenors in a single request.
- No API key or auth overhead; zero configuration.
- Clean, flat JSON that requires no parsing logic beyond `response.json()`.
- Community-validated in developer forums since 2022 with no major outage reports.
- Ideal for a content site with low fetch frequency (hourly at most).

### Why ECB SDW as fallback (not the other way around)

- The ECB API returns SDMX-JSON, a verbose format that requires a non-trivial parser function.
- Under normal operation this complexity is unnecessary; it is worth paying once as a fallback parser.
- The ECB API is authoritative and extremely reliable — if `api.euribor-rates.eu` goes down (possible for an indie project), the ECB will not.
- Making ECB the fallback preserves simplicity in the happy path while guaranteeing correctness when the primary is unavailable.

### Why NOT the other evaluated candidates

- **Alpha Vantage / Twelve Data / FMP**: do not include Euribor interbank rates in their free tiers; require API keys; add unnecessary dependency.
- **Stooq/scraping**: fragile, terms-of-service risk, not a proper API.
- **exchangerate-api.com**: covers FX spot rates only, completely unrelated to interbank benchmark rates.

### Why 4-hour cache TTL

Euribor is fixed **once per TARGET2 business day** at approximately 11:00 Brussels time (09:00 UTC). A 4-hour TTL means:
- Morning users (before 11:00) see the previous day's rate — accurate and expected.
- Users after ~13:00–15:00 UTC see the new day's rate — at most a few hours' delay.
- Cache is never stale by more than one business day.
- A 24-hour TTL would also be correct but 4 hours provides more responsive updates.

On weekends and ECB holidays the rate does not change, so stale cache serves correct values automatically.

---

## ECB SDW fallback endpoint details

Three separate GET requests (one per tenor), appended with `?format=jsondata&lastNObservations=1`:

```
# 3-month
https://sdw-wsrest.ecb.europa.eu/service/data/FM/B.U2.EUR.RT0.BB.B03160000.OPYEA_R.EURIBOR3MD._T.A?format=jsondata&lastNObservations=1

# 6-month
https://sdw-wsrest.ecb.europa.eu/service/data/FM/B.U2.EUR.RT0.BB.B06160000.OPYEA_R.EURIBOR6MD._T.A?format=jsondata&lastNObservations=1

# 12-month
https://sdw-wsrest.ecb.europa.eu/service/data/FM/B.U2.EUR.RT0.BB.B12160000.OPYEA_R.EURIBOR1YD._T.A?format=jsondata&lastNObservations=1
```

Parsing path into the SDMX-JSON response:
```typescript
const rate = body.dataSets[0].series["0:0:0:0:0:0:0:0:0"].observations["0"][0];
// Returns a number in percentage form, e.g. 2.248 (meaning 2.248%)
```

---

## API route skeleton (for implementation reference)

```typescript
// app/api/euribor/route.ts
// No "use client" — this is a server-side route handler.

import { z } from "zod";

const PRIMARY_URL = "https://api.euribor-rates.eu/v1/current_rates";

const STATIC_FALLBACK = {
  "3m": 2.01,
  "6m": 2.14,
  "1y": 2.25,
  source: "static-fallback",
  date: "2026-02-27",
};

const PrimaryResponseSchema = z.object({
  data: z.array(
    z.object({
      tenor: z.string(),
      rate: z.number(),
    })
  ),
  date: z.string(),
});

export async function GET(req: Request) {
  const cacheKey = new Request("https://cache.internal/euribor-rates-v1");
  const cache = caches.default;

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  let rates = await fetchPrimary();
  if (!rates) {
    rates = await fetchEcbFallback();
  }
  if (!rates) {
    rates = STATIC_FALLBACK;
  }

  const response = Response.json(rates, {
    headers: { "Cache-Control": "public, max-age=14400" }, // 4 hours
  });

  // Non-blocking cache write — Cloudflare Workers pattern
  const ctx = await import("@opennextjs/cloudflare").then((m) =>
    m.getCloudflareContext()
  );
  ctx.ctx.waitUntil(cache.put(cacheKey, response.clone()));

  return response;
}

async function fetchPrimary() {
  try {
    const res = await fetch(PRIMARY_URL, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const parsed = PrimaryResponseSchema.safeParse(await res.json());
    if (!parsed.success) return null;

    const tenors = ["3m", "6m", "1y"];
    const result: Record<string, number | string> = { source: "euribor-rates-eu", date: parsed.data.date };
    for (const item of parsed.data.data) {
      if (tenors.includes(item.tenor)) {
        result[item.tenor] = item.rate;
      }
    }
    return result;
  } catch {
    return null;
  }
}

async function fetchEcbFallback() {
  // Parallel fetch for all three tenors
  const ECB_SERIES: Record<string, string> = {
    "3m": "B.U2.EUR.RT0.BB.B03160000.OPYEA_R.EURIBOR3MD._T.A",
    "6m": "B.U2.EUR.RT0.BB.B06160000.OPYEA_R.EURIBOR6MD._T.A",
    "1y": "B.U2.EUR.RT0.BB.B12160000.OPYEA_R.EURIBOR1YD._T.A",
  };
  const BASE = "https://sdw-wsrest.ecb.europa.eu/service/data/FM/";

  try {
    const entries = await Promise.all(
      Object.entries(ECB_SERIES).map(async ([tenor, series]) => {
        const res = await fetch(
          `${BASE}${series}?format=jsondata&lastNObservations=1`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (!res.ok) return [tenor, null] as const;
        const body = await res.json();
        const rate =
          body?.dataSets?.[0]?.series?.["0:0:0:0:0:0:0:0:0"]
            ?.observations?.["0"]?.[0];
        return [tenor, typeof rate === "number" ? rate : null] as const;
      })
    );

    if (entries.some(([, v]) => v === null)) return null;

    const result: Record<string, number | string> = {
      source: "ecb-sdw",
      date: new Date().toISOString().slice(0, 10),
    };
    for (const [tenor, rate] of entries) {
      result[tenor] = rate as number;
    }
    return result;
  } catch {
    return null;
  }
}
```

---

## Response shape (final API contract)

```typescript
type EuriborRatesResponse = {
  "3m": number;   // e.g. 2.013 (percentage, NOT decimal)
  "6m": number;   // e.g. 2.140
  "1y": number;   // e.g. 2.248
  source: "euribor-rates-eu" | "ecb-sdw" | "static-fallback";
  date: string;   // ISO date string, e.g. "2026-02-26"
};
```

Note: all rate values are **percentages** (e.g. `2.248`). Divide by 100 before use in mortgage formulas.

---

## What was NOT chosen and why

| Option | Rejected because |
|--------|-----------------|
| Alpha Vantage | Requires API key; Euribor not in catalog |
| Twelve Data | Requires API key; Euribor not in catalog |
| Financial Modeling Prep | Requires API key; Euribor not reliably in free tier |
| exchangerate-api.com | FX rates only, unrelated to Euribor |
| Stooq CSV download | Not a proper API; fragile; no terms for automated use |
| Direct ECB SDW as primary | SDMX-JSON is verbose; parser complexity unjustified as primary path |
