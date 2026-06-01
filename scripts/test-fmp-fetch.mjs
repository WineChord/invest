import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { createFmpClient, firstFmpRecord } from "./fmp-fetch-lib.mjs";

const fixtureRoot = mkdtempSync(path.join(tmpdir(), "invest-fmp-fetch-"));

let fetchCalls = 0;
const client = createFmpClient({
  apiKey: "fixture-key",
  asOfDate: "2026-06-01",
  cacheDir: path.join(fixtureRoot, "cache"),
  dailyCallBudget: 1,
  fetchImpl: async (url) => {
    fetchCalls += 1;
    assert(!url.toString().includes("fixture-key") || url.searchParams.get("apikey") === "fixture-key");
    return {
      ok: true,
      status: 200,
      async json() {
        return [{
          marketCap: 100,
          symbol: url.searchParams.get("symbol"),
        }];
      },
    };
  },
  maxCacheAgeDays: 7,
  retrievedAt: "2026-06-01T12:00:00.000Z",
});

const first = await client.getJson({
  endpoint: "key-metrics-ttm",
  params: { symbol: "ARCD" },
  symbol: "ARCD",
});
assert.equal(first.ok, true);
assert.equal(first.cache_status, "network_fetch");
assert.equal(firstFmpRecord(first.data).marketCap, 100);

const second = await client.getJson({
  endpoint: "key-metrics-ttm",
  params: { symbol: "ARCD" },
  symbol: "ARCD",
});
assert.equal(second.ok, true);
assert.equal(second.cache_status, "cache_hit");
assert.equal(fetchCalls, 1, "fresh cache should avoid a second FMP network call");

const budgeted = await client.getJson({
  endpoint: "ratios-ttm",
  params: { symbol: "BUDG" },
  symbol: "BUDG",
});
assert.equal(budgeted.ok, false);
assert.equal(budgeted.status, "daily_call_budget_exhausted");
assert.equal(fetchCalls, 1, "daily budget should block uncached calls");

const usage = readFileSync(path.join(fixtureRoot, "cache", "usage", "2026-06-01.jsonl"), "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line));
assert.equal(usage.length, 2);
assert.equal(usage.filter((row) => row.cache_status === "network_fetch").length, 1);
assert.equal(usage.filter((row) => row.cache_status === "cache_hit").length, 1);
assert(usage.every((row) => JSON.stringify(row).includes("fixture-key") === false), "usage log must not include API keys");

const missingKeyClient = createFmpClient({
  apiKey: "",
  asOfDate: "2026-06-01",
  cacheDir: path.join(fixtureRoot, "missing-key-cache"),
});
const missingKey = await missingKeyClient.getJson({
  endpoint: "quote",
  params: { symbol: "ARCD" },
  symbol: "ARCD",
});
assert.equal(missingKey.ok, false);
assert.equal(missingKey.status, "missing_api_key");

console.log("FMP fetch helper tests passed");
