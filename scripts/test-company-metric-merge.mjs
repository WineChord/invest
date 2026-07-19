import assert from "node:assert/strict";
import { preserveSameDateCuratedCompanyMetrics } from "./company-metric-merge-lib.mjs";

const automatedSources = [
  "SEC EDGAR companyfacts",
  "SEC EDGAR companyfacts; Financial Modeling Prep stable API",
];

const generated = [
  { symbol: "NBIS", as_of: "2026-07-17", source: automatedSources[0], market_cap: "43" },
  { symbol: "RKLB", as_of: "2026-07-17", source: automatedSources[0], market_cap: "22" },
  { symbol: "STDN", as_of: "2026-07-18", source: automatedSources[0], market_cap: "18" },
];
const existing = [
  { symbol: "NBIS", as_of: "2026-07-17", source: "SEC filing reconciliation", market_cap: "45" },
  { symbol: "RKLB", as_of: "2026-07-17", source: automatedSources[0], market_cap: "21" },
  { symbol: "STDN", as_of: "2026-07-17", source: "SEC filing reconciliation", market_cap: "17" },
];

assert.deepEqual(
  preserveSameDateCuratedCompanyMetrics(generated, existing, automatedSources),
  [existing[0], generated[1], generated[2]],
);

console.log("company metric merge regression test passed");
