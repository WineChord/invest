const reviewStatuses = new Set([
  "aligned",
  "high_liquidity_monitoring",
  "pressure_review_due",
  "opportunity_set_reset_due",
  "strategy_review_due",
]);

const zeroExposureReasonCodes = new Set([
  "legacy_v1.1_completed_no_action",
  "mission_gate_failed",
  "evidence_gate_failed",
  "entry_gate_failed",
  "survival_gate_failed",
  "portfolio_impact_failed",
  "opportunity_cost_failed",
  "policy_ineligible",
  "decision_critical_economics_gap",
  "no_qualified_candidate",
  "other_documented",
]);

export const articleOneV13MissionAccountabilityPolicy = Object.freeze({
  highLiquidityOptionThresholdPct: 60,
  pressureReviewAfterDays: 45,
  opportunitySetResetAfterDays: 90,
  strategyReviewAfterDays: 180,
});

export const articleOneRepositoryInvariantContracts = Object.freeze({
  "CONSTITUTION.md": Object.freeze([
    Object.freeze({
      id: "supreme_mission",
      any: Object.freeze([/\barticle\s+1\s*-\s*supreme\s+mission\b/]),
    }),
    Object.freeze({
      id: "lower_levels_are_instruments",
      any: Object.freeze([/\bevery\s+later\s+article\b.{0,200}\bevery\s+lower-level\b.{0,200}\binstrument\s+of\s+this\s+mission\b/]),
    }),
    Object.freeze({
      id: "lower_levels_must_yield",
      any: Object.freeze([/\bconflicts\s+with\s+this\s+article\s+and\s+must\s+be\s+revised\b/]),
    }),
    Object.freeze({
      id: "anti_inactivity",
      any: Object.freeze([/\boptimizes?\s+for\s+inactivity\b/]),
    }),
    Object.freeze({
      id: "zero_exposure_burden",
      any: Object.freeze([/\bzero-exposure\s+decision\b.{0,180}\bsmallest\s+mission-consistent\s+staged\s+exposure\b/]),
    }),
    Object.freeze({
      id: "no_forced_investment",
      any: Object.freeze([/\bnothing\s+in\s+this\s+rule\s+compels\s+investment\b/]),
    }),
  ]),
  "AGENTS.md": Object.freeze([
    Object.freeze({
      id: "article_one_controls",
      any: Object.freeze([/\barticle\s+1\s+is\s+controlling\b/]),
    }),
    Object.freeze({
      id: "every_interaction_preflight",
      any: Object.freeze([/\brun\s+the\s+article\s+1\s+preflight\s+for\s+every\s+repository\s+interaction\b/]),
    }),
    Object.freeze({
      id: "every_interaction_postflight",
      any: Object.freeze([/\brun\s+the\s+article\s+1\s+postflight\s+before\s+every\s+final\s+conclusion\b/]),
    }),
    Object.freeze({
      id: "lower_level_yields",
      any: Object.freeze([/\brevise\s+the\s+conflicting\s+lower-level\s+artifact\b/]),
    }),
  ]),
  ".agents/skills/invest-operating-cycle/SKILL.md": Object.freeze([
    Object.freeze({
      id: "article_one_controls",
      any: Object.freeze([/\broot\s+objective\b.{0,160}\barticle\s+1\s+is\s+controlling\b/]),
    }),
    Object.freeze({
      id: "preflight_router",
      any: Object.freeze([/\brun\s+an\s+article\s+1\s+preflight\s+at\s+the\s+start\s+of\s+every\s+repository\s+interaction\b/]),
    }),
    Object.freeze({
      id: "postflight_router",
      any: Object.freeze([/\brun\s+an\s+article\s+1\s+postflight\s+before\s+finishing\b/]),
    }),
    Object.freeze({
      id: "lower_level_yields",
      any: Object.freeze([/\blower-level\s+artifact\s+conflicts\b.{0,100}\brevise\s+that\s+artifact\b/]),
    }),
  ]),
  "SPEC.md": Object.freeze([
    Object.freeze({
      id: "controlling_design_constraint",
      any: Object.freeze([/\barticle\s+1\s+is\s+the\s+controlling\s+design\s+constraint\b/]),
    }),
    Object.freeze({
      id: "preflight_and_postflight",
      any: Object.freeze([/\bevery\s+activated\s+workflow\b.{0,160}\barticle\s+1\s+preflight\b.{0,160}\barticle\s+1\s+postflight\b/]),
    }),
    Object.freeze({
      id: "lower_level_yields",
      any: Object.freeze([/\blower-level\s+artifact\s+that\s+conflicts\s+with\s+article\s+1\s+must\s+be\s+revised\b/]),
    }),
    Object.freeze({
      id: "deterministic_drift_control",
      any: Object.freeze([/\bdeterministic\s+validation\b.{0,240}\barticle\s+1\s+precedence\b/]),
    }),
  ]),
  "data/policy/policy-v1.3.md": Object.freeze([
    Object.freeze({
      id: "policy_subordination",
      any: Object.freeze([/\barticle\s+1\s+of\s+constitution\.md\s+controls\s+every\s+lower-level\s+rule\b/]),
    }),
    Object.freeze({
      id: "tools_not_objectives",
      any: Object.freeze([/\bthey\s+are\s+not\s+independent\s+objectives\b/]),
    }),
    Object.freeze({
      id: "preflight_and_postflight",
      any: Object.freeze([/\bevery\s+application\s+of\s+this\s+policy\b.{0,120}\barticle\s+1\s+preflight\b.{0,120}\barticle\s+1\s+postflight\b/]),
    }),
    Object.freeze({
      id: "lower_level_yields",
      any: Object.freeze([/\bconflicting\s+lower-level\s+artifact\s+must\s+yield\s+and\s+be\s+revised\b/]),
    }),
  ]),
  "templates/full-operating-cycle.md": Object.freeze([
    Object.freeze({ id: "preflight_field", any: Object.freeze([/\barticle1_preflight:/]) }),
    Object.freeze({ id: "lower_level_revision_field", any: Object.freeze([/\blower_level_artifacts_revised:/]) }),
    Object.freeze({ id: "postflight_field", any: Object.freeze([/\barticle1_postflight:/]) }),
  ]),
  "templates/monthly-decision.md": Object.freeze([
    Object.freeze({ id: "preflight_field", any: Object.freeze([/\barticle1_preflight:/]) }),
    Object.freeze({ id: "lower_level_revision_field", any: Object.freeze([/\blower_level_artifacts_revised:/]) }),
    Object.freeze({ id: "postflight_field", any: Object.freeze([/\barticle1_postflight:/]) }),
  ]),
  "templates/meta-self-improvement.md": Object.freeze([
    Object.freeze({ id: "preflight_field", any: Object.freeze([/\barticle1_preflight:/]) }),
    Object.freeze({ id: "lower_level_revision_field", any: Object.freeze([/\blower_level_artifacts_revised:/]) }),
    Object.freeze({ id: "postflight_field", any: Object.freeze([/\barticle1_postflight:/]) }),
  ]),
  "package.json": Object.freeze([
    Object.freeze({
      id: "quick_guard_command",
      any: Object.freeze([/"check:article-one"\s*:\s*"node scripts\/check-article-one\.mjs"/]),
    }),
    Object.freeze({
      id: "guard_runs_before_verify",
      any: Object.freeze([/"verify"\s*:\s*"npm run check:article-one && npm run check:data/]),
    }),
    Object.freeze({
      id: "guard_regression_tests",
      any: Object.freeze([/"test:article-one-gates"\s*:\s*"node scripts\/test-article-one-gates\.mjs"/]),
    }),
  ]),
  "scripts/check-article-one.mjs": Object.freeze([
    Object.freeze({
      id: "canonical_surface_validation",
      any: Object.freeze([/\bvalidatearticleonerepositoryinvariant\b/]),
    }),
    Object.freeze({
      id: "blocking_exit",
      any: Object.freeze([/\bprocess\.exitcode\s*=\s*1\b/]),
    }),
    Object.freeze({
      id: "sentinel_mode",
      any: Object.freeze([/\bmode\s*===\s*"sentinel"/]),
    }),
    Object.freeze({
      id: "decision_mode",
      any: Object.freeze([/\bmode\s*===\s*"decision"/]),
    }),
  ]),
  ".github/workflows/pages.yml": Object.freeze([
    Object.freeze({
      id: "direct_article_one_guard",
      any: Object.freeze([/\brun:\s*npm run check:article-one\b/]),
    }),
    Object.freeze({
      id: "full_verify",
      any: Object.freeze([/\brun:\s*npm run verify\b/]),
    }),
  ]),
  ".github/workflows/daily-market-data.yml": Object.freeze([
    Object.freeze({
      id: "direct_article_one_guard",
      any: Object.freeze([/\brun:\s*npm run check:article-one\b/]),
    }),
    Object.freeze({
      id: "full_verify",
      any: Object.freeze([/\brun:\s*npm run verify\b/]),
    }),
  ]),
});

export const articleOneRepositoryInvariantPaths = Object.freeze(
  Object.keys(articleOneRepositoryInvariantContracts),
);

function normalizeArticleOneSurface(content) {
  return content
    .normalize("NFKC")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*~]/g, "")
    .replace(/[—–]/g, "-")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

const protectedNarrativePaths = new Set([
  "CONSTITUTION.md",
  "AGENTS.md",
  ".agents/skills/invest-operating-cycle/SKILL.md",
  "SPEC.md",
  "data/policy/policy-v1.3.md",
]);

const contradictionPatterns = Object.freeze([
  Object.freeze({
    id: "article_one_subordinated",
    pattern: /\barticle\s+1\s+(?:is|should\s+be|must\s+be)\s+(?:secondary|optional|subordinate)\b/,
  }),
  Object.freeze({
    id: "forced_no_action",
    pattern: /\bno[- ]action\s+(?:is|must\s+be)\s+(?:always\s+)?(?:mandatory|required|the\s+default)\b/,
  }),
  Object.freeze({
    id: "repository_health_allocation_veto",
    pattern: /\brepository\s+(?:health|completeness)\s+(?:is|must\s+be)\s+(?:an?\s+)?(?:allocation|portfolio-wide)\s+veto\b/,
  }),
  Object.freeze({
    id: "capital_preservation_supreme",
    pattern: /\bcapital\s+preservation\s+(?:is|must\s+be)\s+the\s+(?:highest|supreme)\s+(?:objective|priority)\b/,
  }),
  Object.freeze({
    id: "automatic_trading_allowed",
    pattern: /\bautomatic\s+trade\s+execution\s+(?:is|must\s+be)\s+(?:allowed|required)\b/,
  }),
]);

export function validateArticleOneRepositoryInvariant(surfaces) {
  const errors = [];
  articleOneRepositoryInvariantPaths.forEach((path) => {
    const content = surfaces?.[path];
    if (typeof content !== "string") {
      errors.push(`missing Article 1 canonical surface ${path}`);
      return;
    }
    const normalized = normalizeArticleOneSurface(content);
    articleOneRepositoryInvariantContracts[path].forEach((contract) => {
      if (!contract.any.some((pattern) => pattern.test(normalized))) {
        errors.push(`${path} is missing Article 1 invariant contract: ${contract.id}`);
      }
    });
    if (protectedNarrativePaths.has(path)) {
      contradictionPatterns.forEach(({ id, pattern }) => {
        if (pattern.test(normalized)) {
          errors.push(`${path} contains Article 1 contradiction: ${id}`);
        }
      });
    }
  });
  return errors;
}

export function calendarDayDifference(startDate, endDate) {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    throw new Error(`invalid calendar-day range ${startDate}..${endDate}`);
  }
  return Math.floor((end - start) / 86_400_000);
}

export function calculateLiquidityOptionWeight({
  confirmedCash,
  confirmedLiquidityReserveValue,
  researchNav,
}) {
  if (![confirmedCash, confirmedLiquidityReserveValue, researchNav].every(Number.isFinite)) {
    throw new Error("liquidity-option inputs must be finite numbers");
  }
  if (confirmedCash < 0 || confirmedLiquidityReserveValue < 0 || researchNav <= 0) {
    throw new Error("liquidity-option inputs must be non-negative and research NAV must be positive");
  }
  return ((confirmedCash + confirmedLiquidityReserveValue) / researchNav) * 100;
}

export function missionAccountabilityStatus({
  liquidityOptionWeightPct,
  highLiquidityOptionThresholdPct,
  daysSinceMissionRelevantDeployment,
  pressureReviewAfterDays,
  opportunitySetResetAfterDays,
  strategyReviewAfterDays,
}) {
  if (liquidityOptionWeightPct < highLiquidityOptionThresholdPct) {
    return "aligned";
  }
  if (daysSinceMissionRelevantDeployment < pressureReviewAfterDays) {
    return "high_liquidity_monitoring";
  }
  if (daysSinceMissionRelevantDeployment < opportunitySetResetAfterDays) {
    return "pressure_review_due";
  }
  if (daysSinceMissionRelevantDeployment < strategyReviewAfterDays) {
    return "opportunity_set_reset_due";
  }
  return "strategy_review_due";
}

export function validateMissionReviewParameters({
  policyVersion,
  status,
  highLiquidityOptionThresholdPct,
  pressureReviewAfterDays,
  opportunitySetResetAfterDays,
  strategyReviewAfterDays,
}) {
  const errors = [];
  if (!reviewStatuses.has(status)) {
    errors.push(`unsupported mission-accountability status ${status}`);
  }
  if (!(highLiquidityOptionThresholdPct > 0 && highLiquidityOptionThresholdPct < 100)) {
    errors.push("high-liquidity threshold must be between 0 and 100");
  }
  if (
    !(pressureReviewAfterDays > 0
      && opportunitySetResetAfterDays > pressureReviewAfterDays
      && strategyReviewAfterDays > opportunitySetResetAfterDays)
  ) {
    errors.push("mission-review periods must be positive and strictly increasing");
  }
  if (policyVersion === "v1.2" || policyVersion === "v1.3") {
    const expected = articleOneV13MissionAccountabilityPolicy;
    if (highLiquidityOptionThresholdPct !== expected.highLiquidityOptionThresholdPct) {
      errors.push(`policy ${policyVersion} high-liquidity threshold must be ${expected.highLiquidityOptionThresholdPct}`);
    }
    if (pressureReviewAfterDays !== expected.pressureReviewAfterDays) {
      errors.push(`policy ${policyVersion} pressure review must be ${expected.pressureReviewAfterDays} days`);
    }
    if (opportunitySetResetAfterDays !== expected.opportunitySetResetAfterDays) {
      errors.push(`policy ${policyVersion} opportunity-set reset must be ${expected.opportunitySetResetAfterDays} days`);
    }
    if (strategyReviewAfterDays !== expected.strategyReviewAfterDays) {
      errors.push(`policy ${policyVersion} strategy review must be ${expected.strategyReviewAfterDays} days`);
    }
  }
  return errors;
}

export function validateNoActionAccountability(record) {
  const required = [
    "strongest_counterfactual",
    "smallest_prudent_exposure_considered",
    "zero_vs_starter_result",
    "zero_exposure_reason_code",
    "decision_critical_missing_evidence",
    "why_risk_sizing_cannot_absorb_uncertainty",
    "cash_opportunity_cost",
    "conjunctive_evidence_and_price_trigger",
    "next_evidence_deadline",
    "article1_red_team_status",
  ];
  const errors = required
    .filter((field) => typeof record?.[field] !== "string" || record[field].trim() === "")
    .map((field) => `missing ${field}`);
  if (!Number.isInteger(record?.no_action_streak) || record.no_action_streak < 0) {
    errors.push("no_action_streak must be a non-negative integer");
  }
  if (
    typeof record?.zero_exposure_reason_code === "string"
    && !zeroExposureReasonCodes.has(record.zero_exposure_reason_code)
  ) {
    errors.push(`unsupported zero_exposure_reason_code ${record.zero_exposure_reason_code}`);
  }
  if (
    typeof record?.next_evidence_deadline === "string"
    && !Number.isFinite(Date.parse(`${record.next_evidence_deadline}T00:00:00Z`))
  ) {
    errors.push("next_evidence_deadline must be a valid YYYY-MM-DD date");
  }
  required.forEach((field) => {
    const value = record?.[field];
    if (typeof value === "string" && /^(?:n\/?a|none|unknown|tbd|pending)$/i.test(value.trim())) {
      errors.push(`${field} must not be a placeholder`);
    }
  });
  return errors;
}

export function containsEmbargoedPositionField(record) {
  const forbidden = new Set([
    "exact_share_count",
    "exact_target_weight_pct",
    "live_scale_ladder",
    "unexpired_portfolio_allocation",
  ]);
  return Object.keys(record ?? {}).some((key) => forbidden.has(key));
}
