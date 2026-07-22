import assert from "node:assert/strict";
import { preserveRowsForUnrefreshedSymbols } from "./market-data-merge-lib.mjs";

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

console.log("market data merge regression test passed");
