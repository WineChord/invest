import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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
  policyVersion: "v1.3",
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
  conjunctive_evidence_and_price_trigger: "contract economics plus a reviewed price below the valuation cap",
  next_evidence_deadline: "2026-08-05",
  no_action_streak: 3,
  article1_red_team_status: "complete",
};
assert.deepEqual(validateNoActionAccountability(completeNoAction), []);
assert.ok(validateNoActionAccountability({}).length >= 10);
assert.ok(
  validateNoActionAccountability({
    ...completeNoAction,
    zero_exposure_reason_code: "unsupported_reason",
  }).includes("unsupported zero_exposure_reason_code unsupported_reason"),
);
assert.ok(
  validateNoActionAccountability(
    Object.fromEntries(Object.keys(completeNoAction).map((key) => [
      key,
      key === "no_action_streak" ? 0 : "N/A",
    ])),
  ).some((error) => error.includes("must not be a placeholder")),
);
assert.ok(
  validateMissionReviewParameters({
    ...base,
    status: "high_liquidity_monitoring",
    highLiquidityOptionThresholdPct: 99.9,
    pressureReviewAfterDays: 9999,
    opportunitySetResetAfterDays: 10000,
    strategyReviewAfterDays: 10001,
  }).length >= 4,
);
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
const contradictorySurfaces = {
  ...canonicalSurfaces,
  "CONSTITUTION.md": `${canonicalSurfaces["CONSTITUTION.md"]}\nArticle 1 is secondary.\n`,
};
assert.ok(
  validateArticleOneRepositoryInvariant(contradictorySurfaces).includes(
    "CONSTITUTION.md contains Article 1 contradiction: article_one_subordinated",
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
    path: "data/policy/policy-v1.3.md",
    remove: "Every application of this policy begins with an Article 1 preflight",
    contract: "preflight_and_postflight",
  },
  {
    path: "templates/monthly-decision.md",
    remove: "article1_preflight:",
    contract: "preflight_field",
  },
  {
    path: "package.json",
    remove: "\"check:article-one\": \"node scripts/check-article-one.mjs\",",
    contract: "quick_guard_command",
  },
  {
    path: "scripts/check-article-one.mjs",
    remove: "process.exitCode = 1",
    contract: "blocking_exit",
  },
  {
    path: ".github/workflows/pages.yml",
    remove: "- run: npm run check:article-one",
    contract: "direct_article_one_guard",
  },
  {
    path: ".github/workflows/daily-market-data.yml",
    remove: "- run: npm run check:article-one",
    contract: "direct_article_one_guard",
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

const ciGuard = spawnSync(
  process.execPath,
  ["scripts/check-article-one.mjs", "--mode", "ci", "--json"],
  { encoding: "utf8" },
);
assert.equal(ciGuard.status, 0, ciGuard.stderr);
assert.equal(JSON.parse(ciGuard.stdout).level, "PASS");

const sentinelGuard = spawnSync(
  process.execPath,
  [
    "scripts/check-article-one.mjs",
    "--mode",
    "sentinel",
    "--as-of",
    "2026-08-05",
    "--json",
  ],
  { encoding: "utf8" },
);
assert.equal(sentinelGuard.status, 0, sentinelGuard.stderr);
assert.equal(JSON.parse(sentinelGuard.stdout).level, "WARN");
assert.ok(JSON.parse(sentinelGuard.stdout).reason_codes.includes("evidence_deadline_due"));

const decisionGuard = spawnSync(
  process.execPath,
  [
    "scripts/check-article-one.mjs",
    "--mode",
    "decision",
    "--as-of",
    "2026-08-05",
    "--json",
  ],
  { encoding: "utf8" },
);
assert.equal(decisionGuard.status, 2, decisionGuard.stderr);
assert.equal(JSON.parse(decisionGuard.stdout).level, "BLOCK");

console.log("article-one mission regression checks passed");
