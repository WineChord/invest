import assert from "node:assert/strict";
import {
  creditStressScoreForHyOas,
  formatCsv,
  macroSnapshotHeader,
  regimeLabelForSnapshot,
} from "./macro-regime-lib.mjs";

assert.equal(creditStressScoreForHyOas(null), null);
assert.equal(creditStressScoreForHyOas(250), 1);
assert.equal(creditStressScoreForHyOas(425), 2);
assert.equal(creditStressScoreForHyOas(650), 3);
assert.equal(creditStressScoreForHyOas(800), 4);
assert.equal(creditStressScoreForHyOas(1200), 5);

assert.equal(regimeLabelForSnapshot({
  breadthDeteriorationScore: 2,
  creditStressScore: 5,
  qqqReturnPct: 4,
  smhReturnPct: 6,
  valuationExcessScore: 4,
}), "credit_stress");

assert.equal(regimeLabelForSnapshot({
  breadthDeteriorationScore: 2,
  creditStressScore: 1,
  hasPublicTrendData: false,
  qqqReturnPct: null,
  smhReturnPct: null,
  valuationExcessScore: 5,
}), "macro_data_incomplete");

assert.equal(regimeLabelForSnapshot({
  breadthDeteriorationScore: 2,
  creditStressScore: 1,
  qqqReturnPct: -13,
  smhReturnPct: 2,
  valuationExcessScore: 3,
}), "early_downtrend");

assert.equal(regimeLabelForSnapshot({
  breadthDeteriorationScore: 2,
  creditStressScore: 1,
  qqqReturnPct: 12,
  smhReturnPct: 18,
  valuationExcessScore: 4,
}), "top_formation");

const csv = formatCsv(macroSnapshotHeader.slice(0, 3), [{
  as_of: "2026-06-07",
  retrieved_at: "2026-06-07T00:00:00.000Z",
  policy_version: "v1.1",
}]);
assert.equal(csv, "as_of,retrieved_at,policy_version\n2026-06-07,2026-06-07T00:00:00.000Z,v1.1\n");

console.log("macro regime tests passed");
