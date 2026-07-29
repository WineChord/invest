import { existsSync, readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import {
  articleOneRepositoryInvariantPaths,
  calendarDayDifference,
  missionAccountabilityStatus,
  validateArticleOneRepositoryInvariant,
  validateMissionReviewParameters,
  validateNoActionAccountability,
} from "./article-one-mission-lib.mjs";

const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};
const mode = option("--mode") ?? "ci";
const jsonOutput = args.includes("--json");
const supportedModes = new Set(["ci", "sentinel", "decision"]);
const today = new Date().toISOString().slice(0, 10);
const asOf = option("--as-of") ?? today;

const blockingErrors = [];
const reasonCodes = [];

if (!supportedModes.has(mode)) {
  blockingErrors.push(`unsupported mode ${mode}`);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf) || !Number.isFinite(Date.parse(`${asOf}T00:00:00Z`))) {
  blockingErrors.push(`invalid --as-of date ${asOf}`);
}

const surfaces = Object.fromEntries(
  articleOneRepositoryInvariantPaths.map((path) => [
    path,
    existsSync(path) ? readFileSync(path, "utf8") : undefined,
  ]),
);
blockingErrors.push(...validateArticleOneRepositoryInvariant(surfaces));

let mission;
try {
  const qualityMetrics = parseYaml(readFileSync("research/quality-metrics.yml", "utf8"));
  mission = qualityMetrics?.mission_accountability ?? {};
  if (mission.policy_version !== "v1.3") {
    blockingErrors.push("mission_accountability.policy_version must be v1.3");
  }
  [
    "latest_confirmed_return_seeking_buy_date",
    "latest_mission_relevant_deployment_date",
    "next_required_review_at",
    "next_evidence_deadline",
  ].forEach((field) => {
    const value = mission[field];
    if (
      typeof value !== "string"
      || !/^\d{4}-\d{2}-\d{2}$/.test(value)
      || !Number.isFinite(Date.parse(`${value}T00:00:00Z`))
    ) {
      blockingErrors.push(`mission_accountability.${field} must be a valid YYYY-MM-DD date`);
    }
  });
  [
    "liquidity_option_weight_pct",
    "high_liquidity_option_threshold_pct",
    "pressure_review_after_days",
    "opportunity_set_reset_after_days",
    "strategy_review_after_days",
  ].forEach((field) => {
    if (!Number.isFinite(mission[field])) {
      blockingErrors.push(`mission_accountability.${field} must be numeric`);
    }
  });
  [
    ["no_action_is_default_target", false],
    ["repository_health_is_allocation_veto", false],
    ["target_readiness_controls_action", true],
    ["opportunity_set_sufficiency_required", true],
  ].forEach(([field, expected]) => {
    if (mission[field] !== expected) {
      blockingErrors.push(`mission_accountability.${field} must be ${expected}`);
    }
  });
  blockingErrors.push(...validateMissionReviewParameters({
    policyVersion: mission.policy_version,
    status: mission.status,
    highLiquidityOptionThresholdPct: mission.high_liquidity_option_threshold_pct,
    pressureReviewAfterDays: mission.pressure_review_after_days,
    opportunitySetResetAfterDays: mission.opportunity_set_reset_after_days,
    strategyReviewAfterDays: mission.strategy_review_after_days,
  }));
  blockingErrors.push(...validateNoActionAccountability(mission));
} catch (error) {
  blockingErrors.push(`cannot read Article 1 mission accountability: ${error.message}`);
}

if (
  blockingErrors.length === 0
  && mission
  && (mode === "sentinel" || mode === "decision")
) {
  try {
    const elapsedDays = calendarDayDifference(mission.latest_mission_relevant_deployment_date, asOf);
    const expectedStatus = missionAccountabilityStatus({
      liquidityOptionWeightPct: mission.liquidity_option_weight_pct,
      highLiquidityOptionThresholdPct: mission.high_liquidity_option_threshold_pct,
      daysSinceMissionRelevantDeployment: elapsedDays,
      pressureReviewAfterDays: mission.pressure_review_after_days,
      opportunitySetResetAfterDays: mission.opportunity_set_reset_after_days,
      strategyReviewAfterDays: mission.strategy_review_after_days,
    });
    if (expectedStatus !== mission.status) {
      reasonCodes.push("mission_status_transition_due");
    }
    if (mission.next_required_review_at <= asOf) {
      reasonCodes.push("mission_review_due");
    }
    if (mission.next_evidence_deadline <= asOf) {
      reasonCodes.push("evidence_deadline_due");
    }
  } catch (error) {
    blockingErrors.push(`cannot derive Article 1 sentinel state: ${error.message}`);
  }
}

const decisionBlocked = mode === "decision" && reasonCodes.length > 0;
const level = blockingErrors.length > 0 || decisionBlocked
  ? "BLOCK"
  : reasonCodes.length > 0
    ? "WARN"
    : "PASS";
const result = {
  ok: level !== "BLOCK",
  level,
  mode,
  as_of: asOf,
  escalation_required: reasonCodes.length > 0,
  reason_codes: reasonCodes,
  errors: blockingErrors,
};

if (jsonOutput) {
  console.log(JSON.stringify(result));
} else if (level === "PASS") {
  console.log(`PASS Article 1 continuous guard (${articleOneRepositoryInvariantPaths.length} protected surfaces)`);
} else {
  console.log(`${level} Article 1 continuous guard`);
  reasonCodes.forEach((reason) => console.log(`- ${reason}`));
  blockingErrors.forEach((error) => console.log(`- ${error}`));
}

if (blockingErrors.length > 0) {
  process.exitCode = 1;
} else if (decisionBlocked) {
  process.exitCode = 2;
}
