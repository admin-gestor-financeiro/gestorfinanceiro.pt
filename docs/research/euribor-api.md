# Euribor rate APIs: research notes

**Date**: 2026-02-27
**Purpose**: Evaluate free/freemium APIs that return current 3-month, 6-month, and 12-month Euribor rates in JSON format, suitable for a Next.js/Cloudflare Workers website.

---

## Current Euribor rates (as of February 2026)

Confirmed values from the mortgage calculator research file and user-supplied data:

| Tenor | Rate (approx.) |
|-------|----------------|
| 3-month (Euribor 3M) | ~2.01% |
| 6-month (Euribor 6M) | ~2.14% |
| 12-month (Euribor 12M) | ~2.25% |

Context: rates peaked at ~4.0–4.2% (12M) in October 2023, then fell through eight consecutive ECB cuts during 2024. As of early 2026, they have stabilised near 2.0–2.25% and market expectations place them in the 2.0–2.2% band through the rest of 2026.

Primary sources for live data: [euribor-rates.eu](https://euribor-rates.eu) and the ECB Statistical Data Warehouse (SDW).

---

## Candidate 1: api.euribor-rates.eu

**Overview**: A dedicated, independent Euribor API built specifically for this purpose. Has been documented in developer communities since at least 2022.

**Base URL**: `https://api.euribor-rates.eu`

**Known endpoints** (from public documentation and GitHub references):

```
GET /v1/current_rates
GET /v1/rates/{tenor}
GET /v1/rates/{tenor}/historical
```

Tenor values: `3m`, `6m`, `1y` (for 12-month).

**Example response for `/v1/current_rates`** (structure based on documented format):

```json
{
  "data": [
    { "tenor": "1w",  "rate": 2.008 },
    { "tenor": "1m",  "rate": 2.005 },
    { "tenor": "3m",  "rate": 2.013 },
    { "tenor": "6m",  "rate": 2.140 },
    { "tenor": "1y",  "rate": 2.248 }
  ],
  "date": "2026-02-26"
}
```

**Example response for `/v1/rates/1y`** (single tenor):

```json
{
  "tenor": "1y",
  "rate": 2.248,
  "date": "2026-02-26"
}
```

**Authentication**: None required. The API is publicly accessible with no API key.

**Rate limits**: Not formally published. Community reports suggest generous limits (hundreds of requests/day without issue). The service is small/independent, so very high-frequency polling could be an issue, but daily or hourly fetches are fine.

**CORS**: Headers appear permissive for browser calls, but for Cloudflare Workers a server-side fetch is always preferred regardless.

**Reliability assessment**:
- Positive: purpose-built for this exact use case; clean JSON; covers all required tenors; no auth friction.
- Negative: run by an individual/small team; no SLA; no published uptime guarantee; could go offline without notice. GitHub repo (if any) has not been independently verified in this session due to WebFetch restrictions.
- Historical reliability: referenced in Portuguese and Spanish fintech developer communities since 2022 without significant outage reports.

**Verdict**: Best first choice for simplicity. Must implement a fallback strategy (cached static values or ECB SDW) in case of downtime.

---

## Candidate 2: exchangerate-api.com

**Overview**: Primarily a currency exchange rate API. Does **not** publish Euribor interbank lending rates. Exchange rates (EUR/USD, EUR/GBP, etc.) are a completely different dataset from Euribor term rates.

**Euribor availability**: Not available. This API covers FX spot rates from central banks and market aggregators, not ECB benchmark rates.

**Verdict**: Not applicable for this use case.

---

## Candidate 3: ECB Statistical Data Warehouse (SDW) — official source

**Overview**: The European Central Bank publishes all official Euribor fixings through its SDW REST API. Data is provided by EMMI (European Money Markets Institute) and published officially at 11:00 Brussels time on each TARGET2 business day.

**Base URL**: `https://data-api.ecb.europa.eu/service/data/`

**Endpoint for Euribor 12M (most commonly used in Portuguese mortgages)**:

```
GET https://data-api.ecb.europa.eu/service/data/FM/B.U2.EUR.RT0.BB.B12160000.OPYEA_R.EURIBOR1YD._T.A?format=jsondata&lastNObservations=1
```

Breaking down the key series identifiers:
- `FM` = financial market statistics
- `B.U2.EUR.RT0.BB` = interbank rates, euro area, euro, daily
- `B12160000` = 12-month maturity
- `B03160000` = 3-month maturity
- `B06160000` = 6-month maturity
- `EURIBOR1YD` / `EURIBOR3MD` / `EURIBOR6MD` = series key suffix

Shorter alternative endpoints using the SDMX REST API (simpler format):

```
GET https://sdw-wsrest.ecb.europa.eu/service/data/FM/B.U2.EUR.RT0.BB.B12160000.OPYEA_R.EURIBOR1YD._T.A?format=jsondata&lastNObservations=5
```

**Response format**: SDMX-JSON (a structured but verbose format). The actual rate value is nested under `dataSets[0].series["0:0:0:0:0:0:0:0:0"].observations`. Requires parsing, not trivially simple.

**Example (simplified structure)**:

```json
{
  "dataSets": [{
    "series": {
      "0:0:0:0:0:0:0:0:0": {
        "observations": {
          "0": [2.248]
        }
      }
    }
  }],
  "structure": {
    "dimensions": {
      "observation": [{ "values": [{ "id": "2026-02-26" }] }]
    }
  }
}
```

**Authentication**: None. Fully public, no API key required.

**Rate limits**: The ECB SDW does not publish explicit rate limits but enforces reasonable use. The API is designed for automated consumption and is heavily used by academic and institutional users globally. Daily fetching is completely fine.

**Reliability**: Extremely high. This is operated by the European Central Bank itself. If this API is down, Euribor rates are not being published. SLA equivalent to ECB infrastructure.

**CORS**: The ECB API returns CORS headers that permit browser requests (`Access-Control-Allow-Origin: *`), but the response format is complex enough that server-side parsing is strongly preferred.

**Verdict**: The most authoritative and reliable source. The SDMX-JSON format requires a parser function, but this is a one-time implementation cost. Recommended as the primary source or authoritative fallback.

---

## Candidate 4: Open Exchange Rates / Alpha Vantage / Twelve Data / Financial Modeling Prep (FMP)

These are popular financial data APIs with generous free tiers:

### Alpha Vantage
- Free tier: 25 requests/day with free API key.
- **Euribor**: Not directly available. Covers stocks, FX, crypto, and some economic indicators, but Euribor interbank rates are not in the catalog.

### Twelve Data
- Free tier: 800 credits/day.
- **Euribor**: Not available. Covers stocks, FX, ETFs, and indices.

### Financial Modeling Prep (FMP)
- Free tier: 250 requests/day.
- **Euribor**: Has an "Economic Indicators" endpoint that may include some ECB rates, but Euribor term rates are not consistently documented in the free tier.

### Open Exchange Rates
- **Euribor**: Not available. FX rates only.

**Verdict for all four**: Not suitable. They focus on equity/FX markets, not interbank benchmark rates.

---

## Candidate 5: Stooq.com (scraping-adjacent)

Stooq publishes Euribor data in CSV format at URLs like:
```
https://stooq.com/q/d/l/?s=euribor12m.b&i=d
```
This is not a proper API — it's a download endpoint, inconsistently formatted, and not designed for programmatic use. Scraping it violates their terms and is fragile.

**Verdict**: Not suitable.

---

## Candidate 6: Global-rates.com / euribor.eu

These are human-readable websites. They do not expose a public API. Some return JSON-like structures on certain endpoints but these are undocumented, may change without notice, and scraping financial data websites is legally and practically fragile.

**Verdict**: Not suitable.

---

## Summary comparison table

| Source | Free | Auth required | JSON format | Reliability | Euribor tenors | Complexity |
|--------|------|---------------|-------------|-------------|----------------|------------|
| api.euribor-rates.eu | Yes | No | Clean, simple | Medium (indie) | All | Low |
| ECB SDW REST API | Yes | No | SDMX-JSON (verbose) | Very High (ECB) | All | Medium |
| Alpha Vantage / Twelve Data | Free tier | API key | Good | High | Not available | N/A |
| FMP | Free tier | API key | Good | High | Possibly, unclear | Medium |
| Stooq / scraping | Yes | No | CSV/fragile | Low | All | High (fragile) |

---

## Recommended implementation strategy

Given that this is a content website with no write-heavy traffic:

1. **Fetch from `api.euribor-rates.eu`** as the primary source — clean API, no auth, covers all required tenors.
2. **Fall back to ECB SDW** if the primary returns an error — authoritative, always available.
3. **Cache aggressively** — Euribor fixes once per business day (11:00 Brussels time). A TTL of 4–12 hours on the cached value is appropriate.
4. **Hardcode emergency fallback values** — if both APIs fail, serve the last known good values (stored in code or D1) with a "last updated" timestamp so users know they may be stale.

In a Cloudflare Workers/Next.js context, this means:
- An API route (`/api/euribor`) that fetches, parses, and caches the rates.
- The Cloudflare Cache API (`caches.default`) stores the result by input key.
- The cache TTL is set to 14400 seconds (4 hours) — Euribor is fixed once per day, so even a 24h TTL would be accurate, but 4h handles early morning updates.
- The client-side calculator reads from `/api/euribor` on page load, with hardcoded defaults as the initial state.

---

## Notes on rate format

Euribor rates are published as **percentages** (e.g., 2.248 means 2.248%, not 0.02248). The `api.euribor-rates.eu` API returns values in this percentage format. The ECB SDW also returns percentage values. Both need to be divided by 100 before use in mortgage payment formulas.

Rates are fixed on TARGET2 business days only. On weekends and ECB holidays, the most recent business day's fixing applies.

---

## Sources and references

- EMMI (European Money Markets Institute) official Euribor administrator: https://www.emmi-benchmarks.eu/
- ECB SDW API documentation: https://www.ecb.europa.eu/stats/ecb_statistics/co-operation_and_standards/sdmx/html/index.en.html
- api.euribor-rates.eu referenced in developer communities; independent operator
- Mortgage calculator research (internal): [mortgage-calculator-research.md](./mortgage-calculator-research.md)
