import { strict as assert } from "node:assert";
import { filterCompletedDailyBars } from "./market-session-lib.mjs";

const bars = [
  { date: "2026-07-10", close: 100 },
  { date: "2026-07-13", close: 101 },
];
const currentTradingPeriod = {
  regular: {
    end: Date.parse("2026-07-13T20:00:00Z") / 1000,
  },
};

assert.deepEqual(
  filterCompletedDailyBars(bars, {
    currentTradingPeriod,
    now: new Date("2026-07-13T14:00:00Z"),
  }),
  [bars[0]],
  "an in-progress New York trading-day bar must not be treated as a completed close",
);

assert.deepEqual(
  filterCompletedDailyBars(bars, {
    currentTradingPeriod,
    now: new Date("2026-07-13T20:01:00Z"),
  }),
  bars,
  "the current trading-day bar may be used after the provider's regular-session end",
);

assert.deepEqual(
  filterCompletedDailyBars(bars, {
    currentTradingPeriod: {},
    now: new Date("2026-07-13T21:00:00Z"),
  }),
  [bars[0]],
  "missing session metadata must conservatively exclude the current market date",
);

assert.deepEqual(
  filterCompletedDailyBars(
    [...bars, { date: "2026-07-14", close: 102 }],
    {
      currentTradingPeriod,
      now: new Date("2026-07-13T20:01:00Z"),
    },
  ),
  bars,
  "future-dated bars must never pass the completed-close filter",
);

console.log("Market session completion tests passed.");
