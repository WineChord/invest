import assert from "node:assert/strict";
import {
  detectHistoryDateRegression,
  preserveRowsForUnrefreshedSymbols,
} from "./market-data-merge-lib.mjs";

const nextRows = [
  { symbol: "ASTS", date: "2026-07-21", close: "63.34" },
  { symbol: "RKLB", date: "2026-07-21", close: "69.12" },
];
const existingRows = [
  { symbol: "ASTS", date: "2026-07-20", close: "57.42" },
  { symbol: "BE", date: "2026-07-20", close: "197.06" },
  { symbol: "BE", date: "2026-07-21", close: "226.26" },
];

assert.deepEqual(
  preserveRowsForUnrefreshedSymbols(
    nextRows,
    existingRows,
    new Set(["ASTS", "RKLB"]),
  ),
  [
    nextRows[0],
    existingRows[1],
    existingRows[2],
    nextRows[1],
  ],
  "provider failures must preserve committed rows for unrefreshed symbols without retaining superseded rows for refreshed symbols",
);

assert.deepEqual(
  detectHistoryDateRegression(
    [
      { date: "2026-07-22", close: 61.95 },
      { date: "2026-07-23", close: 59.18 },
    ],
    [
      { symbol: "ASTS", date: "2026-07-23", close: "59.18" },
      { symbol: "ASTS", date: "2026-07-24", close: "56.23" },
      { symbol: "RKLB", date: "2026-07-24", close: "63.90" },
    ],
    "ASTS",
  ),
  {
    existingLatestDate: "2026-07-24",
    nextLatestDate: "2026-07-23",
    regressed: true,
  },
  "a provider response that ends before the newest committed session must be rejected instead of erasing the newer row",
);

assert.deepEqual(
  detectHistoryDateRegression(
    [
      { date: "2026-07-23", close: 59.18 },
      { date: "2026-07-24", close: 56.20 },
    ],
    [
      { symbol: "ASTS", date: "2026-07-24", close: "56.23" },
    ],
    "ASTS",
  ),
  {
    existingLatestDate: "2026-07-24",
    nextLatestDate: "2026-07-24",
    regressed: false,
  },
  "a same-session refresh may replace a fallback row with a preferred provider row",
);

console.log("market data merge regression test passed");
