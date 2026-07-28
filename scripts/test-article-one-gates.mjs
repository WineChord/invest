import assert from "node:assert/strict";
import {
  calculateLiquidityOptionWeight,
  calendarDayDifference,
  containsEmbargoedPositionField,
  missionAccountabilityStatus,
  validateMissionReviewParameters,
  validateNoActionAccountability,
} from "./article-one-mission-lib.mjs";

assert.equal(calendarDayDifference("2026-07-08", "2026-07-28"), 20);
assert.equal(
  calculateLiquidityOptionWeight({
    confirmedCash: 5761.58,
    confirmedLiquidityReserveValue: 0,
    researchNav: 7539.91,
  }).toFixed(4),
  "76.4144",
);

const base = {
  liquidityOptionWeightPct: 76.4144,
  highLiquidityOptionThresholdPct: 60,
  pressureReviewAfterDays: 45,
  opportunitySetResetAfterDays: 90,
  strategyReviewAfterDays: 180,
};
assert.equal(missionAccountabilityStatus({ ...base, daysSinceMissionRelevantDeployment: 20 }), "high_liquidity_monitoring");
assert.equal(missionAccountabilityStatus({ ...base, daysSinceMissionRelevantDeployment: 45 }), "pressure_review_due");
assert.equal(missionAccountabilityStatus({ ...base, daysSinceMissionRelevantDeployment: 90 }), "opportunity_set_reset_due");
assert.equal(missionAccountabilityStatus({ ...base, daysSinceMissionRelevantDeployment: 180 }), "strategy_review_due");
assert.equal(
  missionAccountabilityStatus({
    ...base,
    liquidityOptionWeightPct: 59.9,
    daysSinceMissionRelevantDeployment: 400,
  }),
  "aligned",
);
assert.deepEqual(validateMissionReviewParameters({ ...base, status: "high_liquidity_monitoring" }), []);

const completeNoAction = {
  strongest_counterfactual: "LEU",
  smallest_prudent_exposure_considered: "one mission-consistent staged unit",
  zero_vs_starter_result: "zero wins",
  zero_exposure_reason_code: "decision_critical_economics_gap",
  decision_critical_missing_evidence: "contract economics",
  why_risk_sizing_cannot_absorb_uncertainty: "loss cannot be bounded from current facts",
  cash_opportunity_cost: "accepted until the dated evidence event",
  next_evidence_deadline: "2026-08-05",
  no_action_streak: 3,
  article1_red_team_status: "complete",
};
assert.deepEqual(validateNoActionAccountability(completeNoAction), []);
assert.ok(validateNoActionAccountability({}).length >= 10);
assert.equal(containsEmbargoedPositionField({ initial_weight_range_pct: [1, 2] }), false);
assert.equal(containsEmbargoedPositionField({ exact_target_weight_pct: 2.25 }), true);

console.log("article-one mission regression checks passed");
