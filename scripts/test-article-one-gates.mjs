import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  articleOneRepositoryInvariantPaths,
  articleOneRepositoryInvariantContracts,
  calculateLiquidityOptionWeight,
  calendarDayDifference,
  containsEmbargoedPositionField,
  missionAccountabilityStatus,
  validateArticleOneRepositoryInvariant,
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

const canonicalSurfaces = Object.fromEntries(
  articleOneRepositoryInvariantPaths.map((path) => [path, readFileSync(path, "utf8")]),
);
assert.deepEqual(validateArticleOneRepositoryInvariant(canonicalSurfaces), []);
articleOneRepositoryInvariantPaths.forEach((path) => {
  const placeholderSurfaces = {
    ...canonicalSurfaces,
    [path]: "# Placeholder\n",
  };
  articleOneRepositoryInvariantContracts[path].forEach((contract) => {
    assert.ok(
      validateArticleOneRepositoryInvariant(placeholderSurfaces).some(
        (error) => error === `${path} is missing Article 1 invariant contract: ${contract.id}`,
      ),
      `${path} placeholder must fail the ${contract.id} contract`,
    );
  });
});
const missingSurface = { ...canonicalSurfaces };
delete missingSurface["CONSTITUTION.md"];
assert.ok(
  validateArticleOneRepositoryInvariant(missingSurface).some(
    (error) => error === "missing Article 1 canonical surface CONSTITUTION.md",
  ),
);

[
  {
    path: "AGENTS.md",
    remove: "Article 1 is controlling, not one consideration among many.",
    contract: "article_one_controls",
  },
  {
    path: ".agents/skills/invest-operating-cycle/SKILL.md",
    remove: "Run an Article 1 preflight at the start of every repository interaction",
    contract: "preflight_router",
  },
  {
    path: "SPEC.md",
    remove: "Every activated workflow must run an Article 1 preflight",
    contract: "preflight_and_postflight",
  },
  {
    path: "data/policy/policy-v1.2.md",
    remove: "Every application of this policy begins with an Article 1 preflight",
    contract: "preflight_and_postflight",
  },
  {
    path: "templates/monthly-decision.md",
    remove: "article1_preflight:",
    contract: "preflight_field",
  },
].forEach(({ path, remove, contract }) => {
  const driftedSurfaces = {
    ...canonicalSurfaces,
    [path]: canonicalSurfaces[path].replaceAll(remove, ""),
  };
  assert.ok(
    validateArticleOneRepositoryInvariant(driftedSurfaces).includes(
      `${path} is missing Article 1 invariant contract: ${contract}`,
    ),
    `${path} must reject targeted drift of ${contract}`,
  );
});

console.log("article-one mission regression checks passed");
