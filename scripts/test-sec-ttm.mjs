import assert from "node:assert/strict";
import {
  selectPreferredInstantFact,
  selectTrailingTwelveMonthPeriod,
  trailingTwelveMonthPeriod,
} from "./sec-ttm-lib.mjs";

function fact({ end, filed = "2026-06-15", fp, start, value }) {
  return { end, filed, fp, start, value };
}

const annualWithoutStandaloneQ4 = [
  fact({ start: "2025-05-04", end: "2026-05-02", fp: "FY", value: 1_335_116_000 }),
  fact({ start: "2025-05-04", end: "2025-08-02", fp: "Q1", value: 223_060_000 }),
  fact({ start: "2025-08-03", end: "2025-11-01", fp: "Q2", value: 268_033_000 }),
  fact({ start: "2025-11-02", end: "2026-01-31", fp: "Q3", value: 404_423_000 }),
  fact({ start: "2024-11-03", end: "2025-02-01", fp: "Q3", value: 135_002_000 }),
];
assert.equal(
  trailingTwelveMonthPeriod(annualWithoutStandaloneQ4).value,
  1_335_116_000,
  "latest annual fact must beat four non-contiguous quarter frames",
);

const annualPlusQuarter = [
  fact({ start: "2025-01-01", end: "2025-12-31", fp: "FY", value: 852_525_000 }),
  fact({ start: "2025-01-01", end: "2025-03-31", fp: "Q1", value: 159_442_000 }),
  fact({ start: "2026-01-01", end: "2026-03-31", fp: "Q1", value: 308_361_000 }),
];
assert.equal(
  trailingTwelveMonthPeriod(annualPlusQuarter).value,
  1_001_444_000,
  "TTM must roll the latest annual fact forward with the current quarter",
);

const quarterOnly = [
  fact({ start: "2025-04-01", end: "2025-06-30", fp: "Q2", value: 10 }),
  fact({ start: "2025-07-01", end: "2025-09-30", fp: "Q3", value: 20 }),
  fact({ start: "2025-10-01", end: "2025-12-31", fp: "Q4", value: 30 }),
  fact({ start: "2026-01-01", end: "2026-03-31", fp: "Q1", value: 40 }),
];
assert.equal(
  trailingTwelveMonthPeriod(quarterOnly).value,
  100,
  "four contiguous quarter facts should still produce a TTM value",
);

const mixedRevenueTags = [
  { ...fact({ start: "2025-01-01", end: "2025-12-31", fp: "FY", value: 109_820_000 }), tag: "OtherRevenue" },
  { ...fact({ start: "2025-01-01", end: "2025-03-31", fp: "Q1", value: 20_662_000 }), tag: "OtherRevenue" },
  { ...fact({ start: "2026-01-01", end: "2026-03-31", fp: "Q1", value: 41_625_000 }), tag: "OtherRevenue" },
  { ...fact({ start: "2025-01-01", end: "2025-12-31", fp: "FY", value: 2_746_642_000 }), tag: "TotalRevenue" },
  { ...fact({ start: "2025-01-01", end: "2025-03-31", fp: "Q1", value: 578_573_000 }), tag: "TotalRevenue" },
  { ...fact({ start: "2026-01-01", end: "2026-03-31", fp: "Q1", value: 694_133_000 }), tag: "TotalRevenue" },
];
assert.equal(
  selectTrailingTwelveMonthPeriod(mixedRevenueTags, { preferLargest: true }).value,
  2_862_202_000,
  "revenue selection must not mix total and subset taxonomy tags",
);

const sameDateCashFacts = [
  { end: "2026-03-31", filed: "2026-05-11", start: "", tag: "CorporateCash", value: 1_517_264_000 },
  { end: "2026-03-31", filed: "2026-05-11", start: "", tag: "CashPlusRestricted", value: 79_206_407_000 },
];
assert.equal(
  selectPreferredInstantFact(
    sameDateCashFacts,
    ["CorporateCash", "CashPlusRestricted"],
  ).value,
  1_517_264_000,
  "same-date instant facts must preserve semantic candidate priority",
);

console.log("SEC TTM calculation tests passed");
