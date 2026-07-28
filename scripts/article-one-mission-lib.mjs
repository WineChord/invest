const reviewStatuses = new Set([
  "aligned",
  "high_liquidity_monitoring",
  "pressure_review_due",
  "opportunity_set_reset_due",
  "strategy_review_due",
]);

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
    "next_evidence_deadline",
    "article1_red_team_status",
  ];
  const errors = required
    .filter((field) => typeof record?.[field] !== "string" || record[field].trim() === "")
    .map((field) => `missing ${field}`);
  if (!Number.isInteger(record?.no_action_streak) || record.no_action_streak < 0) {
    errors.push("no_action_streak must be a non-negative integer");
  }
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
