import { existsSync, readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";

const csvFiles = [
  "data/account/ledger.csv",
  "data/account/positions.csv",
  "data/account/equity_curve.csv",
  "data/market/company_metrics.csv",
  "data/market/price_history.csv",
  "data/market/security_master.csv",
  "data/market/technical_snapshots.csv",
  "data/market/watchlist_prices.csv",
  "research/buy-zones.csv",
  "research/discovery/candidates.csv",
  "research/freshness/events.csv",
  "research/valuation-states.csv",
  "research/watchlist-cycle-reviews.csv",
  "research/watchlist-transitions.csv",
  "research/watchlist.csv",
];

const yamlFiles = [
  "data/account/plan.yml",
  "data/account/state.yml",
  "research/company-analysis.yml",
  "research/discovery/candidate-readiness.yml",
  "research/discovery/lanes.yml",
  "research/quality-metrics.yml",
  "research/sources.yml",
];

const markdownFiles = [
  "CONSTITUTION.md",
];

const companyAnalysisFile = "research/company-analysis.yml";
const companyMetricsFile = "data/market/company_metrics.csv";
const constitutionFile = "CONSTITUTION.md";
const discoveryFile = "research/discovery/candidates.csv";
const candidateReadinessFile = "research/discovery/candidate-readiness.yml";
const discoveryLanesFile = "research/discovery/lanes.yml";
const freshnessFile = "research/freshness/events.csv";
const buyZonesFile = "research/buy-zones.csv";
const priceHistoryFile = "data/market/price_history.csv";
const qualityMetricsFile = "research/quality-metrics.yml";
const securityMasterFile = "data/market/security_master.csv";
const sourcesFile = "research/sources.yml";
const technicalSnapshotsFile = "data/market/technical_snapshots.csv";
const valuationStatesFile = "research/valuation-states.csv";
const watchlistCycleReviewsFile = "research/watchlist-cycle-reviews.csv";
const watchlistTransitionsFile = "research/watchlist-transitions.csv";
const watchlistFile = "research/watchlist.csv";
const watchlistPricesFile = "data/market/watchlist_prices.csv";

const requiredCsvHeaders = new Map([
  [
    companyMetricsFile,
    [
      "symbol",
      "as_of",
      "source_published_at",
      "retrieved_at",
      "currency",
      "market_cap",
      "enterprise_value",
      "ttm_revenue",
      "revenue_growth_yoy",
      "gross_margin_ttm",
      "operating_margin_ttm",
      "net_income_ttm",
      "cash_and_equivalents",
      "total_debt",
      "shares_outstanding",
      "price_to_sales",
      "enterprise_value_to_sales",
      "pe_ratio",
      "source",
      "notes",
    ],
  ],
  [
    discoveryFile,
    [
      "symbol",
      "name",
      "exchange",
      "asset_type",
      "discovered_at",
      "discovery_source",
      "source_url",
      "source_published_at",
      "retrieved_at",
      "first_seen_at",
      "theme",
      "why_it_might_matter",
      "status",
      "next_action",
      "notes",
    ],
  ],
  [
    freshnessFile,
    [
      "event_id",
      "symbol",
      "event_date",
      "event_type",
      "source_type",
      "source_url",
      "source_published_at",
      "retrieved_at",
      "first_seen_at",
      "severity",
      "status",
      "required_action",
      "reviewed_at",
      "review_path",
      "immaterial_reason",
      "notes",
    ],
  ],
  [
    buyZonesFile,
    [
      "symbol",
      "as_of",
      "buy_zone_status",
      "entry_trigger",
      "max_staged_entry_price",
      "stale_if_price_moves_pct",
      "position_role",
      "sizing_tier",
      "source_path",
      "source_ids",
      "notes",
    ],
  ],
  [
    priceHistoryFile,
    [
      "symbol",
      "date",
      "open",
      "high",
      "low",
      "close",
      "adj_close",
      "volume",
      "currency",
      "source",
      "retrieved_at",
    ],
  ],
  [
    watchlistPricesFile,
    [
      "symbol",
      "price",
      "currency",
      "price_as_of",
      "source",
      "retrieved_at",
      "notes",
    ],
  ],
  [
    securityMasterFile,
    [
      "symbol",
      "name",
      "exchange",
      "asset_type",
      "tradability",
      "market_data_symbol",
      "sec_cik",
      "tradingview_symbol",
      "tradingview_url",
      "stockanalysis_url",
      "notes",
    ],
  ],
  [
    technicalSnapshotsFile,
    [
      "symbol",
      "as_of",
      "close",
      "one_day_return_pct",
      "one_month_return_pct",
      "three_month_return_pct",
      "ytd_return_pct",
      "one_year_return_pct",
      "fifty_two_week_high",
      "fifty_two_week_low",
      "position_in_52w_range_pct",
      "sma_50",
      "sma_200",
      "rsi_14",
      "volume",
      "average_volume_30d",
      "source",
      "retrieved_at",
      "notes",
    ],
  ],
  [
    valuationStatesFile,
    [
      "symbol",
      "as_of",
      "price",
      "market_cap",
      "enterprise_value",
      "currency",
      "valuation_state",
      "price_attractiveness",
      "thesis_state",
      "risk_state",
      "expected_return_setup",
      "scenario_path",
      "next_review_trigger",
      "source_ids",
      "notes",
    ],
  ],
  [
    watchlistFile,
    [
      "symbol",
      "name",
      "theme",
      "priority",
      "status",
      "initial_role",
      "latest_baseline_date",
      "next_review_trigger",
      "notes",
    ],
  ],
  [
    watchlistCycleReviewsFile,
    [
      "review_id",
      "symbol",
      "reviewed_at",
      "cycle_id",
      "request_type",
      "status_before",
      "status_after",
      "priority_before",
      "priority_after",
      "thesis_delta",
      "entry_delta",
      "priority_delta",
      "status_delta",
      "buy_zone_delta",
      "action_required",
      "next_review_trigger",
      "source_path",
      "source_ids",
      "reviewer_roles",
      "notes",
    ],
  ],
  [
    watchlistTransitionsFile,
    [
      "transition_id",
      "symbol",
      "decided_at",
      "from_status",
      "to_status",
      "from_priority",
      "to_priority",
      "trigger_type",
      "source_path",
      "subagent_review_path",
      "xhigh_roles_completed",
      "unresolved_conflicts",
      "mission_gate",
      "evidence_gate",
      "entry_gate",
      "survival_gate",
      "opportunity_cost_gate",
      "thesis_delta",
      "entry_delta",
      "priority_delta",
      "opportunity_cost_delta",
      "buy_zone_status",
      "same_lane_comparison",
      "ranking_vs_current_core",
      "decision_reason",
      "next_review_trigger",
    ],
  ],
]);

const buyEligibleWatchlistStatuses = new Set([
  "active_core_candidate",
  "active_candidate",
]);
const activeWatchlistStatuses = new Set([
  ...buyEligibleWatchlistStatuses,
  "watch",
]);
const allowedWatchlistStatuses = new Set([
  ...activeWatchlistStatuses,
  "research_only",
  "not_tradable",
  "probation",
  "frozen",
  "removed",
]);
const allowedDiscoveryStatuses = new Set([
  "new",
  "incubating",
  "promoted",
  "rejected",
  "archived",
]);
const allowedCandidateReadinessStatuses = new Set([
  "not_started",
  "in_progress",
  "completed",
  "incubated_after_review",
  "rejected_after_review",
  "archived_after_review",
  "not_material_current_allocation",
  "external_blocked",
  "not_tradable",
]);
const allocationReadyCandidateReadinessStatuses = new Set([
  "completed",
  "incubated_after_review",
  "rejected_after_review",
  "archived_after_review",
  "not_material_current_allocation",
  "external_blocked",
  "not_tradable",
]);
const allowedDashboardSurfaceStatuses = new Set([
  "complete",
  "not_required_rejected",
  "not_required_archived",
  "not_required_not_material",
  "not_required_external",
  "not_required_not_tradable",
]);
const allowedReadinessSprintClassifications = new Set([
  "promote",
  "incubate",
  "reject",
  "archive",
  "not_material",
  "not_tradable",
  "external_blocked",
]);
const allowedBuyZoneStatuses = new Set([
  "in_buy_zone",
  "not_in_buy_zone",
  "trigger_only",
  "no_buy_until_new_evidence",
]);
const allowedWatchlistCycleActions = new Set([
  "no_change",
  "update_watchlist",
  "promotion_review_required",
  "demotion_review_required",
  "freeze_required",
  "remove_required",
  "refresh_evidence",
  "not_tradable_monitor",
]);
const requiredPromotionXhighRoles = [
  "evidence_freshness",
  "valuation_entry",
  "bear_case",
  "opportunity_cost_allocation",
];
const corePromotionXhighRoles = [
  ...requiredPromotionXhighRoles,
  "bull_case",
];
const requiredWatchlistCycleReviewerRoles = [
  "main_agent_cycle_review",
];
const allowedCandidateBlockerTypes = new Set([
  "none",
  "evidence_based",
  "not_material_current_allocation",
  "external_unavailable",
  "user_only_broker_fact",
  "market_closed_or_missing_quote",
  "legal_access_limit",
  "policy_blocker",
  "repo_work_remaining",
]);
const externalCandidateBlockerTypes = new Set([
  "external_unavailable",
  "user_only_broker_fact",
  "market_closed_or_missing_quote",
  "legal_access_limit",
]);
const allowedSubagentSkipReasons = new Set([
  "tool_unavailable",
  "not_material_to_request",
  "already_resolved_by_primary_evidence",
]);
const requiredFirstLayerQuestionKeys = [
  "what_could_become_scarce",
  "who_controls_or_removes_scarcity",
  "who_can_monetize_into_shareholder_value",
  "public_security_expression",
  "early_small_misunderstood_or_newly_public",
];
const requiredDiscoveryRunSubagentFields = [
  "inputs_used",
  "sources_checked",
  "facts_verified",
  "stale_or_missing_evidence",
  "confidence",
];
const requiredCompleteDiscoverySourceFamilyIds = [
  "primary_filings_regulatory",
  "issuer_material",
  "market_data",
  "current_world_context",
];
const requiredReadinessSections = [
  "## Bottleneck Fit",
  "## Evidence Gathered",
  "## Analysis",
  "## Decision",
];
const requiredReadinessPhrases = [
  "what_could_become_scarce",
  "who_controls_or_removes_scarcity",
  "who_can_monetize_into_shareholder_value",
  "public_security_expression",
  "early_small_misunderstood_or_newly_public",
  "security_metadata",
  "market_data",
  "filings_and_reports",
  "same_lane_peers",
  "reachable_evidence_remaining",
  "final_classification",
  "dashboard_surface_status",
  "company_analysis_entry",
];
const allowedDiscoveryLaneStatuses = new Set([
  "active",
  "emerging",
  "incubating",
  "dormant",
  "retired",
]);
const openEventStatuses = new Set(["new", "stale"]);
const allowedEventSeverities = new Set(["low", "medium", "high", "critical"]);
const allowedEventStatuses = new Set([
  ...openEventStatuses,
  "reviewed",
  "superseded",
  "ignored_with_reason",
]);
const allowedValuationStates = new Set([
  "broken_thesis",
  "too_expensive",
  "fair",
  "attractive",
  "dislocated",
  "too_uncertain",
]);
const allowedReadinessStatuses = new Set(["ready"]);
const requiredCompanyAnalysisFields = [
  "id",
  "symbol",
  "analyzed_at",
  "analysis_type",
  "policy_version",
  "title",
  "stance",
  "summary",
  "upside_path",
  "risk_watch",
  "next_check",
  "source_path",
];

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === "\"") {
      if (quoted && next === "\"") {
        field += "\"";
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.trim() !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

const parsedCsvFiles = new Map();
const parsedYamlFiles = new Map();

for (const file of markdownFiles) {
  if (!existsSync(file)) {
    throw new Error(`${file} is missing`);
  }
  console.log(`ok ${file}`);
}

for (const file of csvFiles) {
  const rows = parseCsv(readFileSync(file, "utf8"));
  parsedCsvFiles.set(file, rows);
  if (rows.length === 0) {
    throw new Error(`${file} has no header row`);
  }
  const headerWidth = rows[0].length;
  rows.slice(1).forEach((row, index) => {
    if (row.length !== headerWidth) {
      throw new Error(`${file} row ${index + 2} has ${row.length} columns, expected ${headerWidth}`);
    }
  });
  validateHeader(file, rows[0]);
  console.log(`ok ${file}`);
}

for (const file of yamlFiles) {
  parsedYamlFiles.set(file, parseYaml(readFileSync(file, "utf8")));
  console.log(`ok ${file}`);
}

validateSources();
validateConstitution();
validateWatchlist();
validateMarketDataFiles();
validateDiscoveryLanes();
validateDiscoveryCandidates();
validateCandidateReadiness();
validateFreshnessEvents();
validateValuationStates();
validateCompanyAnalysis();
validateWatchlistCycleReviews();
validatePromotionData();
validateQualityMetrics();

function validateHeader(file, actualHeader) {
  const expectedHeader = requiredCsvHeaders.get(file);
  if (expectedHeader === undefined) {
    return;
  }
  const actual = actualHeader.join(",");
  const expected = expectedHeader.join(",");
  if (actual !== expected) {
    throw new Error(`${file} header mismatch. Expected ${expected}`);
  }
}

function csvRecords(file) {
  const rows = parsedCsvFiles.get(file) ?? [];
  const header = rows[0] ?? [];
  return rows.slice(1).map((row) =>
    Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""])),
  );
}

function requireString(value, context) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${context} is required`);
  }
}

function requireScalar(value, context) {
  if (typeof value === "string" && value.trim() !== "") {
    return;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return;
  }
  throw new Error(`${context} is required`);
}

function requireAllowed(value, allowed, context) {
  requireString(value, context);
  if (!allowed.has(value)) {
    throw new Error(`${context} has unsupported value ${value}`);
  }
}

function requireNumber(value, context) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${context} must be a finite number`);
  }
}

function requireBoolean(value, context) {
  if (typeof value !== "boolean") {
    throw new Error(`${context} must be boolean`);
  }
}

function requireStringArray(value, context) {
  if (!Array.isArray(value)) {
    throw new Error(`${context} must be an array`);
  }
  value.forEach((item, index) => {
    if (typeof item !== "string" || item.trim() === "") {
      throw new Error(`${context}[${index}] must be a non-empty string`);
    }
  });
}

function requirePositiveNumberString(value, context) {
  requireString(value, context);
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${context} must be a positive number`);
  }
}

function requireNonNegativeIntegerString(value, context) {
  requireString(value, context);
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${context} must be a non-negative integer`);
  }
}

function parseDate(value, context) {
  if (value instanceof Date) {
    return value.getTime();
  }
  requireString(value, context);
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(timestamp)) {
    throw new Error(`${context} must be a valid YYYY-MM-DD date`);
  }
  return timestamp;
}

function daysBetween(start, end) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((end - start) / millisecondsPerDay);
}

function sourceIds() {
  const parsed = parsedYamlFiles.get(sourcesFile);
  const entries = Array.isArray(parsed?.sources) ? parsed.sources : [];
  return new Set(entries.map((source) => source?.id).filter(Boolean));
}

function splitSemicolonList(value) {
  return String(value)
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function latestRowsBySymbol(rows, dateField) {
  const latest = new Map();
  rows.forEach((row) => {
    const current = latest.get(row.symbol);
    if (current === undefined || String(row[dateField]) >= String(current[dateField])) {
      latest.set(row.symbol, row);
    }
  });
  return latest;
}

function requireRoles(value, requiredRoles, context) {
  const roles = new Set(splitSemicolonList(value));
  requiredRoles.forEach((role) => {
    if (!roles.has(role)) {
      throw new Error(`${context} is missing required role ${role}`);
    }
  });
}

function discoveryLaneIds() {
  return new Set((parsedYamlFiles.get(discoveryLanesFile)?.lanes ?? []).map((lane) => lane.id).filter(Boolean));
}

function activeWatchlistSymbols() {
  return csvRecords(watchlistFile)
    .filter((row) => activeWatchlistStatuses.has(row.status))
    .map((row) => row.symbol);
}

function watchlistReviewSymbols() {
  return csvRecords(watchlistFile)
    .filter((row) => row.status !== "removed")
    .map((row) => row.symbol);
}

function openDiscoveryCandidates() {
  return csvRecords(discoveryFile)
    .filter((row) => row.status === "new" || row.status === "incubating");
}

function candidateReadinessRecordsBySymbol() {
  const parsed = parsedYamlFiles.get(candidateReadinessFile);
  const records = Array.isArray(parsed?.records) ? parsed.records : [];
  return new Map(records.map((record) => [record.symbol, record]));
}

function candidateReadinessBlocksAllocation(record) {
  if (!record.material_to_current_allocation) {
    return false;
  }
  if (!allocationReadyCandidateReadinessStatuses.has(record.readiness_status)) {
    return true;
  }
  return (
    hasReachableEvidenceRemaining(record.reachable_evidence_remaining)
    && !externalCandidateBlockerTypes.has(record.blocker_type)
  );
}

function candidateReadinessNeedsDashboardSurface(record) {
  return (
    record.readiness_status === "completed"
    || record.readiness_status === "incubated_after_review"
  );
}

function validateDashboardSurfaceForReadiness(record, context) {
  if (candidateReadinessNeedsDashboardSurface(record) && record.dashboard_surface_status !== "complete") {
    throw new Error(`${context} ${record.readiness_status} readiness must use dashboard_surface_status complete`);
  }
  if (record.readiness_status === "rejected_after_review" && record.dashboard_surface_status !== "not_required_rejected") {
    throw new Error(`${context} rejected_after_review readiness must use dashboard_surface_status not_required_rejected`);
  }
  if (record.readiness_status === "archived_after_review" && record.dashboard_surface_status !== "not_required_archived") {
    throw new Error(`${context} archived_after_review readiness must use dashboard_surface_status not_required_archived`);
  }
  if (
    record.readiness_status === "not_material_current_allocation"
    && record.dashboard_surface_status !== "not_required_not_material"
  ) {
    throw new Error(`${context} not_material_current_allocation readiness must use dashboard_surface_status not_required_not_material`);
  }
  if (record.readiness_status === "external_blocked" && record.dashboard_surface_status !== "not_required_external") {
    throw new Error(`${context} external_blocked readiness must use dashboard_surface_status not_required_external`);
  }
  if (record.readiness_status === "not_tradable" && record.dashboard_surface_status !== "not_required_not_tradable") {
    throw new Error(`${context} not_tradable readiness must use dashboard_surface_status not_required_not_tradable`);
  }
}

function candidateReadinessStats() {
  const recordsBySymbol = candidateReadinessRecordsBySymbol();
  const stats = {
    open: 0,
    withoutSprint: 0,
    material: 0,
    blocking: 0,
    completed: 0,
  };

  openDiscoveryCandidates().forEach((candidate) => {
    stats.open += 1;
    const record = recordsBySymbol.get(candidate.symbol);
    if (record === undefined) {
      stats.withoutSprint += 1;
      stats.blocking += 1;
      return;
    }
    if (record.material_to_current_allocation) {
      stats.material += 1;
    }
    if (allocationReadyCandidateReadinessStatuses.has(record.readiness_status)) {
      stats.completed += 1;
    }
    if (candidateReadinessBlocksAllocation(record)) {
      stats.blocking += 1;
    }
  });

  return stats;
}

function validateMaterialCandidateDashboardCoverage(asOfTimestamp, maxLatestPriceAgeDays) {
  const recordsBySymbol = candidateReadinessRecordsBySymbol();
  const watchlistBySymbol = new Map(csvRecords(watchlistFile).map((row) => [row.symbol, row]));
  const securityBySymbol = new Map(csvRecords(securityMasterFile).map((row) => [row.symbol, row]));
  const latestPriceBySymbol = new Map(csvRecords(watchlistPricesFile).map((row) => [row.symbol, row]));
  const priceHistorySymbols = new Set(csvRecords(priceHistoryFile).map((row) => row.symbol));
  const technicalSymbols = new Set(csvRecords(technicalSnapshotsFile).map((row) => row.symbol));
  const metricSymbols = new Set(csvRecords(companyMetricsFile).map((row) => row.symbol));
  const valuationSymbols = new Set(csvRecords(valuationStatesFile).map((row) => row.symbol));
  const analysisSymbols = new Set(
    (parsedYamlFiles.get(companyAnalysisFile)?.entries ?? [])
      .map((entry) => entry?.symbol)
      .filter(Boolean),
  );
  const reviewedFreshnessSymbols = new Set(
    csvRecords(freshnessFile)
      .filter((row) => row.status === "reviewed" && row.review_path !== "")
      .map((row) => row.symbol),
  );

  openDiscoveryCandidates().forEach((candidate) => {
    const record = recordsBySymbol.get(candidate.symbol);
    if (record === undefined || !candidateReadinessNeedsDashboardSurface(record)) {
      return;
    }

    const context = `${candidateReadinessFile} ${candidate.symbol} dashboard-facing readiness`;
    const watchlist = watchlistBySymbol.get(candidate.symbol);
    if (watchlist === undefined) {
      throw new Error(`${context} is missing ${watchlistFile} research universe row`);
    }
    if (watchlist.status === "removed") {
      throw new Error(`${context} must not use removed watchlist status`);
    }
    if (!securityBySymbol.has(candidate.symbol)) {
      throw new Error(`${context} is missing ${securityMasterFile} metadata`);
    }
    if (!valuationSymbols.has(candidate.symbol)) {
      throw new Error(`${context} is missing ${valuationStatesFile} valuation state`);
    }
    if (!analysisSymbols.has(candidate.symbol)) {
      throw new Error(`${context} is missing ${companyAnalysisFile} dashboard company-analysis entry`);
    }
    if (!reviewedFreshnessSymbols.has(candidate.symbol)) {
      throw new Error(`${context} is missing reviewed ${freshnessFile} filing or freshness event`);
    }

    const security = securityBySymbol.get(candidate.symbol);
    if (security?.tradability !== "tradable") {
      return;
    }
    [
      [priceHistorySymbols, priceHistoryFile, "price history"],
      [technicalSymbols, technicalSnapshotsFile, "technical snapshot"],
      [metricSymbols, companyMetricsFile, "company metrics"],
    ].forEach(([symbols, file, label]) => {
      if (!symbols.has(candidate.symbol)) {
        throw new Error(`${context} is missing ${label} in ${file}`);
      }
    });
    const latestPrice = latestPriceBySymbol.get(candidate.symbol);
    if (latestPrice === undefined) {
      throw new Error(`${context} is missing latest price in ${watchlistPricesFile}`);
    }
    const priceAsOfTimestamp = parseDate(latestPrice.price_as_of, `${context} latest price_as_of`);
    if (daysBetween(priceAsOfTimestamp, asOfTimestamp) > maxLatestPriceAgeDays) {
      throw new Error(`${context} latest price is older than discovery_scan_max_age_days`);
    }
  });
}

function hasReachableEvidenceRemaining(value) {
  if (value === undefined || value === null) {
    return false;
  }
  const text = String(value).trim().toLowerCase();
  return text !== "" && text !== "none" && text !== "n/a";
}

function validateSources() {
  const parsed = parsedYamlFiles.get(sourcesFile);
  const entries = Array.isArray(parsed?.sources) ? parsed.sources : null;
  if (entries === null) {
    throw new Error(`${sourcesFile} must contain a sources array`);
  }

  const ids = new Set();
  entries.forEach((source, index) => {
    const context = `${sourcesFile} source ${index + 1}`;
    ["id", "title", "source_type", "url", "retrieved_at", "first_seen_at", "summary"].forEach(
      (field) => requireString(source?.[field], `${context} ${field}`),
    );
    requireScalar(source?.source_published_at, `${context} source_published_at`);
    if (ids.has(source.id)) {
      throw new Error(`${sourcesFile} has duplicate id ${source.id}`);
    }
    ids.add(source.id);
    if (!Array.isArray(source.related_symbols)) {
      throw new Error(`${context} related_symbols must be an array`);
    }
  });
  console.log(`ok ${sourcesFile} semantic checks`);
}

function validateConstitution() {
  const content = readFileSync(constitutionFile, "utf8");
  [
    "multi-decade asymmetric compounding",
    "tens, hundreds, or thousands",
    "avoidable ruin",
    "Bottleneck-Map-First",
    "Self-Evolution",
    "Meta-Self-Evolution",
    "The repository may recommend. It must never execute trades.",
  ].forEach((phrase) => {
    if (!content.includes(phrase)) {
      throw new Error(`${constitutionFile} is missing required phrase: ${phrase}`);
    }
  });
  console.log(`ok ${constitutionFile} semantic checks`);
}

function validateWatchlist() {
  const symbols = new Set();
  csvRecords(watchlistFile).forEach((row, index) => {
    const context = `${watchlistFile} row ${index + 2}`;
    [
      "symbol",
      "name",
      "theme",
      "priority",
      "initial_role",
      "latest_baseline_date",
      "next_review_trigger",
      "notes",
    ].forEach((field) => requireString(row[field], `${context} ${field}`));
    if (symbols.has(row.symbol)) {
      throw new Error(`${watchlistFile} has duplicate symbol ${row.symbol}`);
    }
    symbols.add(row.symbol);
    requireAllowed(row.status, allowedWatchlistStatuses, `${context} status`);
    parseDate(row.latest_baseline_date, `${context} latest_baseline_date`);
  });
  console.log(`ok ${watchlistFile} semantic checks`);
}

function validateMarketDataFiles() {
  const watchlistSymbols = new Set(csvRecords(watchlistFile).map((row) => row.symbol));
  const securityBySymbol = new Map(
    csvRecords(securityMasterFile).map((row) => [row.symbol, row]),
  );
  const tradableSymbols = new Set(
    [...securityBySymbol.values()]
      .filter((row) => row.tradability === "tradable")
      .map((row) => row.symbol),
  );
  const latestPriceSymbols = new Set(csvRecords(watchlistPricesFile).map((row) => row.symbol));
  const priceHistorySymbols = new Set(csvRecords(priceHistoryFile).map((row) => row.symbol));
  const technicalSymbols = new Set(csvRecords(technicalSnapshotsFile).map((row) => row.symbol));
  const metricSymbols = new Set(csvRecords(companyMetricsFile).map((row) => row.symbol));

  csvRecords(watchlistFile).forEach((row, index) => {
    const context = `${watchlistFile} row ${index + 2}`;
    const security = securityBySymbol.get(row.symbol);
    if (security === undefined) {
      throw new Error(`${context} is missing ${securityMasterFile} metadata for ${row.symbol}`);
    }
    if (row.status === "not_tradable" && security.tradability !== "not_tradable") {
      throw new Error(`${context} is not_tradable but ${securityMasterFile} marks ${row.symbol} as ${security.tradability}`);
    }
    if (row.status !== "not_tradable" && security.tradability !== "tradable") {
      throw new Error(`${context} needs tradable ${securityMasterFile} metadata for ${row.symbol}`);
    }
  });

  [...securityBySymbol.values()].forEach((row, index) => {
    const context = `${securityMasterFile} row ${index + 2}`;
    requireString(row.symbol, `${context} symbol`);
    requireString(row.name, `${context} name`);
    requireString(row.tradability, `${context} tradability`);
    if (!watchlistSymbols.has(row.symbol)) {
      throw new Error(`${context} references unknown watchlist symbol ${row.symbol}`);
    }
    if (row.tradability === "tradable") {
      ["market_data_symbol", "sec_cik", "tradingview_symbol", "tradingview_url", "stockanalysis_url"].forEach(
        (field) => requireString(row[field], `${context} ${field}`),
      );
      if (!/^\d{10}$/.test(row.sec_cik)) {
        throw new Error(`${context} sec_cik must be a 10 digit CIK`);
      }
    }
  });

  csvRecords(priceHistoryFile).forEach((row, index) => {
    const context = `${priceHistoryFile} row ${index + 2}`;
    ["symbol", "date", "currency", "source", "retrieved_at"].forEach((field) =>
      requireString(row[field], `${context} ${field}`),
    );
    if (!tradableSymbols.has(row.symbol)) {
      throw new Error(`${context} references non-tradable or unknown symbol ${row.symbol}`);
    }
    parseDate(row.date, `${context} date`);
    ["open", "high", "low", "close"].forEach((field) =>
      requirePositiveNumberString(row[field], `${context} ${field}`),
    );
  });

  csvRecords(watchlistPricesFile).forEach((row, index) => {
    const context = `${watchlistPricesFile} row ${index + 2}`;
    ["symbol", "currency", "price_as_of", "source", "retrieved_at"].forEach((field) =>
      requireString(row[field], `${context} ${field}`),
    );
    if (!tradableSymbols.has(row.symbol)) {
      throw new Error(`${context} references non-tradable or unknown symbol ${row.symbol}`);
    }
    requirePositiveNumberString(row.price, `${context} price`);
    parseDate(row.price_as_of, `${context} price_as_of`);
  });

  csvRecords(technicalSnapshotsFile).forEach((row, index) => {
    const context = `${technicalSnapshotsFile} row ${index + 2}`;
    ["symbol", "as_of", "close", "source", "retrieved_at"].forEach((field) =>
      requireString(row[field], `${context} ${field}`),
    );
    if (!priceHistorySymbols.has(row.symbol)) {
      throw new Error(`${context} lacks supporting price history for ${row.symbol}`);
    }
    parseDate(row.as_of, `${context} as_of`);
    requirePositiveNumberString(row.close, `${context} close`);
  });

  csvRecords(companyMetricsFile).forEach((row, index) => {
    const context = `${companyMetricsFile} row ${index + 2}`;
    ["symbol", "as_of", "source_published_at", "retrieved_at", "currency", "source", "notes"].forEach(
      (field) => requireString(row[field], `${context} ${field}`),
    );
    if (!tradableSymbols.has(row.symbol)) {
      throw new Error(`${context} references non-tradable or unknown symbol ${row.symbol}`);
    }
    parseDate(row.as_of, `${context} as_of`);
    parseDate(row.source_published_at, `${context} source_published_at`);
  });

  for (const symbol of tradableSymbols) {
    if (!latestPriceSymbols.has(symbol)) {
      throw new Error(`${watchlistPricesFile} is missing tradable symbol ${symbol}`);
    }
    if (!priceHistorySymbols.has(symbol)) {
      throw new Error(`${priceHistoryFile} is missing tradable symbol ${symbol}`);
    }
    if (!technicalSymbols.has(symbol)) {
      throw new Error(`${technicalSnapshotsFile} is missing tradable symbol ${symbol}`);
    }
    if (!metricSymbols.has(symbol)) {
      throw new Error(`${companyMetricsFile} is missing tradable symbol ${symbol}`);
    }
  }

  console.log("ok market data semantic checks");
}

function validateDiscoveryLanes() {
  const parsed = parsedYamlFiles.get(discoveryLanesFile);
  if (parsed?.schema_version !== 1) {
    throw new Error(`${discoveryLanesFile} schema_version must be 1`);
  }
  requireString(parsed.as_of, `${discoveryLanesFile} as_of`);
  parseDate(parsed.as_of, `${discoveryLanesFile} as_of`);
  requireString(parsed.mission_anchor, `${discoveryLanesFile} mission_anchor`);
  requireString(parsed.review_cadence, `${discoveryLanesFile} review_cadence`);
  requireString(parsed.framework_name, `${discoveryLanesFile} framework_name`);
  requireStringArray(parsed.framework_questions, `${discoveryLanesFile} framework_questions`);
  if (parsed.framework_questions.length < 4) {
    throw new Error(`${discoveryLanesFile} framework_questions must contain at least four questions`);
  }
  requireStringArray(parsed.notes, `${discoveryLanesFile} notes`);
  if (!Array.isArray(parsed.lanes) || parsed.lanes.length === 0) {
    throw new Error(`${discoveryLanesFile} must contain at least one lane`);
  }

  const laneIds = new Set();
  const watchlistSymbols = new Set(csvRecords(watchlistFile).map((row) => row.symbol));
  parsed.lanes.forEach((lane, index) => {
    const context = `${discoveryLanesFile} lane ${index + 1}`;
    [
      "id",
      "name",
      "bottleneck_thesis",
      "why_asymmetric",
      "next_review_trigger",
      "invalidation_or_demote_signal",
    ].forEach((field) => requireString(lane?.[field], `${context} ${field}`));
    if (laneIds.has(lane.id)) {
      throw new Error(`${discoveryLanesFile} has duplicate lane id ${lane.id}`);
    }
    laneIds.add(lane.id);
    requireAllowed(lane.status, allowedDiscoveryLaneStatuses, `${context} status`);
    [
      "source_families",
      "screen_keywords",
      "current_public_proxies",
      "candidate_entry_points",
    ].forEach((field) => requireStringArray(lane?.[field], `${context} ${field}`));
    lane.current_public_proxies.forEach((symbol) => {
      if (!watchlistSymbols.has(symbol)) {
        throw new Error(`${context} current_public_proxies references unknown watchlist symbol ${symbol}`);
      }
    });
  });
  const unknownFutureLane = parsed.lanes.find((lane) => lane.id === "unknown_future_bottlenecks");
  if (unknownFutureLane === undefined) {
    throw new Error(`${discoveryLanesFile} must keep unknown_future_bottlenecks lane`);
  }
  if (unknownFutureLane.status === "retired" || unknownFutureLane.status === "dormant") {
    throw new Error(`${discoveryLanesFile} unknown_future_bottlenecks must stay active, emerging, or incubating`);
  }
  console.log(`ok ${discoveryLanesFile} semantic checks`);
}

function validateDiscoveryCandidates() {
  const laneIds = new Set((parsedYamlFiles.get(discoveryLanesFile)?.lanes ?? []).map((lane) => lane.id));
  const symbols = new Set();
  csvRecords(discoveryFile).forEach((row, index) => {
    const context = `${discoveryFile} row ${index + 2}`;
    [
      "symbol",
      "name",
      "exchange",
      "asset_type",
      "discovery_source",
      "source_url",
      "source_published_at",
      "retrieved_at",
      "first_seen_at",
      "theme",
      "why_it_might_matter",
      "next_action",
    ].forEach(
      (field) => requireString(row[field], `${context} ${field}`),
    );
    if (symbols.has(row.symbol)) {
      throw new Error(`${context} duplicates discovery candidate ${row.symbol}`);
    }
    symbols.add(row.symbol);
    if (row.symbol !== row.symbol.toUpperCase()) {
      throw new Error(`${context} symbol must be uppercase`);
    }
    ["discovered_at", "retrieved_at", "first_seen_at"].forEach((field) =>
      parseDate(row[field], `${context} ${field}`),
    );
    if (!laneIds.has(row.theme)) {
      throw new Error(`${context} theme references unknown lane ${row.theme}`);
    }
    requireAllowed(row.status, allowedDiscoveryStatuses, `${context} status`);
    if ((row.status === "rejected" || row.status === "archived") && row.notes.trim() === "") {
      throw new Error(`${context} ${row.status} candidates need notes`);
    }
  });
  console.log(`ok ${discoveryFile} semantic checks`);
}

function validateCandidateReadiness() {
  const parsed = parsedYamlFiles.get(candidateReadinessFile);
  if (parsed?.schema_version !== 1) {
    throw new Error(`${candidateReadinessFile} schema_version must be 1`);
  }
  parseDate(parsed.as_of, `${candidateReadinessFile} as_of`);
  if (!Array.isArray(parsed.records)) {
    throw new Error(`${candidateReadinessFile} must contain a records array`);
  }

  const candidateSymbols = new Set(csvRecords(discoveryFile).map((row) => row.symbol));
  const openCandidateSymbols = new Set(openDiscoveryCandidates().map((row) => row.symbol));
  const seen = new Set();
  parsed.records.forEach((record, index) => {
    const row = record ?? {};
    const context = `${candidateReadinessFile} record ${index + 1}`;
    [
      "symbol",
      "readiness_status",
      "dashboard_surface_status",
      "blocker_type",
      "blocker_reason",
      "last_readiness_reviewed_at",
      "next_action",
      "conclusion",
    ].forEach((field) => requireString(row[field], `${context} ${field}`));
    requireBoolean(row.material_to_current_allocation, `${context} material_to_current_allocation`);
    requireAllowed(row.readiness_status, allowedCandidateReadinessStatuses, `${context} readiness_status`);
    requireAllowed(row.dashboard_surface_status, allowedDashboardSurfaceStatuses, `${context} dashboard_surface_status`);
    requireAllowed(row.blocker_type, allowedCandidateBlockerTypes, `${context} blocker_type`);
    if (!allocationReadyCandidateReadinessStatuses.has(row.readiness_status)) {
      throw new Error(`${context} has transient readiness_status ${row.readiness_status}; current repository state must resolve readiness before validation passes`);
    }
    parseDate(row.last_readiness_reviewed_at, `${context} last_readiness_reviewed_at`);
    if (seen.has(row.symbol)) {
      throw new Error(`${candidateReadinessFile} has duplicate symbol ${row.symbol}`);
    }
    seen.add(row.symbol);
    if (!candidateSymbols.has(row.symbol)) {
      throw new Error(`${context} references unknown discovery candidate ${row.symbol}`);
    }
    if (row.readiness_path !== undefined && row.readiness_path !== "" && !existsSync(row.readiness_path)) {
      throw new Error(`${context} readiness_path does not exist: ${row.readiness_path}`);
    }
    if (row.readiness_path !== undefined && row.readiness_path !== "") {
      validateReadinessSprintNote(row.readiness_path, row.symbol);
    }
    if (row.material_to_current_allocation && row.readiness_path === "") {
      throw new Error(`${context} material candidate needs readiness_path`);
    }
    if (row.material_to_current_allocation) {
      requireString(row.materiality_reason, `${context} materiality_reason`);
      requireString(row.blocking_scope, `${context} blocking_scope`);
      requireStringArray(row.affected_lanes, `${context} affected_lanes`);
      const laneIds = discoveryLaneIds();
      row.affected_lanes.forEach((laneId) => {
        if (!laneIds.has(laneId)) {
          throw new Error(`${context} affected_lanes references unknown lane ${laneId}`);
        }
      });
    }
    if (row.blocker_type === "none" && row.readiness_status !== "completed") {
      throw new Error(`${context} blocker_type none is only valid with completed readiness`);
    }
    if (row.readiness_status === "completed" && row.blocker_type !== "none") {
      throw new Error(`${context} completed readiness must use blocker_type none`);
    }
    if (
      (
        row.readiness_status === "incubated_after_review"
        || row.readiness_status === "rejected_after_review"
        || row.readiness_status === "archived_after_review"
      )
      && row.blocker_type !== "evidence_based"
    ) {
      throw new Error(`${context} ${row.readiness_status} must use blocker_type evidence_based`);
    }
    if (
      row.readiness_status === "not_material_current_allocation"
      && row.blocker_type !== "not_material_current_allocation"
    ) {
      throw new Error(`${context} not_material_current_allocation readiness must use blocker_type not_material_current_allocation`);
    }
    if (row.readiness_status === "external_blocked" && !externalCandidateBlockerTypes.has(row.blocker_type)) {
      throw new Error(`${context} external_blocked needs an external blocker_type`);
    }
    validateDashboardSurfaceForReadiness(row, context);
    if (
      allocationReadyCandidateReadinessStatuses.has(row.readiness_status)
      && row.blocker_type === "repo_work_remaining"
    ) {
      throw new Error(`${context} terminal readiness must not use repo_work_remaining`);
    }
    if (
      allocationReadyCandidateReadinessStatuses.has(row.readiness_status)
      && hasReachableEvidenceRemaining(row.reachable_evidence_remaining)
      && !externalCandidateBlockerTypes.has(row.blocker_type)
    ) {
      throw new Error(`${context} still has reachable evidence remaining after terminal readiness triage`);
    }
  });

  openCandidateSymbols.forEach((symbol) => {
    if (!seen.has(symbol)) {
      throw new Error(`${candidateReadinessFile} is missing open candidate ${symbol}`);
    }
  });

  console.log(`ok ${candidateReadinessFile} semantic checks`);
}

function validateReadinessSprintNote(file, symbol) {
  const content = readFileSync(file, "utf8");
  if (!content.includes(`symbol: ${symbol}`)) {
    throw new Error(`${file} must identify symbol ${symbol}`);
  }
  requiredReadinessSections.forEach((section) => {
    if (!content.includes(section)) {
      throw new Error(`${file} is missing ${section}`);
    }
  });
  requiredReadinessPhrases.forEach((phrase) => {
    if (!content.includes(phrase)) {
      throw new Error(`${file} is missing ${phrase}`);
    }
  });
}

function validateFreshnessEvents() {
  csvRecords(freshnessFile).forEach((row, index) => {
    const context = `${freshnessFile} row ${index + 2}`;
    [
      "event_id",
      "symbol",
      "event_date",
      "source_url",
      "source_published_at",
      "retrieved_at",
      "first_seen_at",
      "required_action",
    ].forEach((field) => requireString(row[field], `${context} ${field}`));
    requireAllowed(row.severity, allowedEventSeverities, `${context} severity`);
    requireAllowed(row.status, allowedEventStatuses, `${context} status`);

    if (row.status === "reviewed") {
      requireString(row.reviewed_at, `${context} reviewed_at`);
      if (row.review_path === "" && row.immaterial_reason === "") {
        throw new Error(`${context} reviewed events need review_path or immaterial_reason`);
      }
    }
    if (row.status === "ignored_with_reason") {
      requireString(row.immaterial_reason, `${context} immaterial_reason`);
    }
    if (row.review_path !== "" && !existsSync(row.review_path)) {
      throw new Error(`${context} review_path does not exist: ${row.review_path}`);
    }
  });
  console.log(`ok ${freshnessFile} semantic checks`);
}

function validateValuationStates() {
  const knownSourceIds = sourceIds();
  const knownWatchlistSymbols = new Set(csvRecords(watchlistFile).map((row) => row.symbol));
  csvRecords(valuationStatesFile).forEach((row, index) => {
    const context = `${valuationStatesFile} row ${index + 2}`;
    ["symbol", "as_of", "currency", "expected_return_setup", "next_review_trigger", "source_ids"].forEach(
      (field) => requireString(row[field], `${context} ${field}`),
    );
    if (!knownWatchlistSymbols.has(row.symbol)) {
      throw new Error(`${context} references unknown watchlist symbol ${row.symbol}`);
    }
    requireAllowed(row.valuation_state, allowedValuationStates, `${context} valuation_state`);
    requireAllowed(row.price_attractiveness, allowedValuationStates, `${context} price_attractiveness`);
    row.source_ids.split(";").forEach((rawSourceId) => {
      const sourceId = rawSourceId.trim();
      if (!knownSourceIds.has(sourceId)) {
        throw new Error(`${context} references unknown source id ${sourceId}`);
      }
    });
    if (row.scenario_path !== "" && !existsSync(row.scenario_path)) {
      throw new Error(`${context} scenario_path does not exist: ${row.scenario_path}`);
    }
  });
  console.log(`ok ${valuationStatesFile} semantic checks`);
}

function validateCompanyAnalysis() {
  const watchlistSymbols = new Set(csvRecords(watchlistFile).map((row) => row.symbol));
  const parsed = parsedYamlFiles.get(companyAnalysisFile);
  const entries = Array.isArray(parsed?.entries) ? parsed.entries : null;
  if (entries === null) {
    throw new Error(`${companyAnalysisFile} must contain an entries array`);
  }

  const ids = new Set();
  entries.forEach((entry, index) => {
    const row = entry ?? {};
    requiredCompanyAnalysisFields.forEach((field) => {
      if (typeof row[field] !== "string" || row[field].trim() === "") {
        throw new Error(
          `${companyAnalysisFile} entry ${index + 1} is missing ${field}`,
        );
      }
    });

    if (ids.has(row.id)) {
      throw new Error(`${companyAnalysisFile} has duplicate id ${row.id}`);
    }
    ids.add(row.id);

    if (!watchlistSymbols.has(row.symbol)) {
      throw new Error(
        `${companyAnalysisFile} entry ${row.id} references unknown symbol ${row.symbol}`,
      );
    }

    if (!existsSync(row.source_path)) {
      throw new Error(
        `${companyAnalysisFile} entry ${row.id} references missing source ${row.source_path}`,
      );
    }
  });
  console.log(`ok ${companyAnalysisFile} semantic checks`);
}

function validateWatchlistCycleReviews() {
  const knownSourceIds = sourceIds();
  const watchlistRows = csvRecords(watchlistFile);
  const watchlistBySymbol = new Map(watchlistRows.map((row) => [row.symbol, row]));
  const reviewRows = csvRecords(watchlistCycleReviewsFile);
  const latestReviewBySymbol = latestRowsBySymbol(reviewRows, "reviewed_at");
  const reviewIds = new Set();

  reviewRows.forEach((row, index) => {
    const context = `${watchlistCycleReviewsFile} row ${index + 2}`;
    [
      "review_id",
      "symbol",
      "reviewed_at",
      "cycle_id",
      "request_type",
      "status_before",
      "status_after",
      "priority_before",
      "priority_after",
      "thesis_delta",
      "entry_delta",
      "priority_delta",
      "status_delta",
      "buy_zone_delta",
      "action_required",
      "next_review_trigger",
      "source_path",
      "source_ids",
      "reviewer_roles",
      "notes",
    ].forEach((field) => requireString(row[field], `${context} ${field}`));
    if (reviewIds.has(row.review_id)) {
      throw new Error(`${context} duplicate review_id ${row.review_id}`);
    }
    reviewIds.add(row.review_id);
    if (!watchlistBySymbol.has(row.symbol)) {
      throw new Error(`${context} references unknown watchlist symbol ${row.symbol}`);
    }
    requireAllowed(row.status_before, allowedWatchlistStatuses, `${context} status_before`);
    requireAllowed(row.status_after, allowedWatchlistStatuses, `${context} status_after`);
    requireAllowed(row.action_required, allowedWatchlistCycleActions, `${context} action_required`);
    parseDate(row.reviewed_at, `${context} reviewed_at`);
    if (!existsSync(row.source_path)) {
      throw new Error(`${context} source_path does not exist: ${row.source_path}`);
    }
    splitSemicolonList(row.source_ids).forEach((sourceId) => {
      if (!knownSourceIds.has(sourceId)) {
        throw new Error(`${context} references unknown source id ${sourceId}`);
      }
    });
    requireRoles(row.reviewer_roles, requiredWatchlistCycleReviewerRoles, `${context} reviewer_roles`);
  });

  watchlistRows
    .filter((row) => row.status !== "removed")
    .forEach((watchlistRow) => {
      const review = latestReviewBySymbol.get(watchlistRow.symbol);
      if (review === undefined) {
        throw new Error(`${watchlistCycleReviewsFile} is missing current cycle review for ${watchlistRow.symbol}`);
      }
      if (review.status_after !== watchlistRow.status) {
        throw new Error(`${watchlistCycleReviewsFile} latest review for ${watchlistRow.symbol} does not match ${watchlistFile} status ${watchlistRow.status}`);
      }
      if (review.priority_after !== watchlistRow.priority) {
        throw new Error(`${watchlistCycleReviewsFile} latest review for ${watchlistRow.symbol} does not match ${watchlistFile} priority ${watchlistRow.priority}`);
      }
      if (review.next_review_trigger !== watchlistRow.next_review_trigger) {
        throw new Error(`${watchlistCycleReviewsFile} latest review for ${watchlistRow.symbol} does not match ${watchlistFile} next_review_trigger`);
      }
    });

  console.log(`ok ${watchlistCycleReviewsFile} semantic checks`);
}

function validatePromotionData() {
  const knownSourceIds = sourceIds();
  const watchlistRows = csvRecords(watchlistFile);
  const watchlistBySymbol = new Map(watchlistRows.map((row) => [row.symbol, row]));
  const transitionRows = csvRecords(watchlistTransitionsFile);
  const buyZoneRows = csvRecords(buyZonesFile);
  const latestTransitionBySymbol = latestRowsBySymbol(transitionRows, "decided_at");
  const buyZoneBySymbol = new Map(buyZoneRows.map((row) => [row.symbol, row]));

  transitionRows.forEach((row, index) => {
    const context = `${watchlistTransitionsFile} row ${index + 2}`;
    [
      "transition_id",
      "symbol",
      "decided_at",
      "from_status",
      "to_status",
      "from_priority",
      "to_priority",
      "trigger_type",
      "source_path",
      "subagent_review_path",
      "xhigh_roles_completed",
      "mission_gate",
      "evidence_gate",
      "entry_gate",
      "survival_gate",
      "opportunity_cost_gate",
      "thesis_delta",
      "entry_delta",
      "priority_delta",
      "opportunity_cost_delta",
      "buy_zone_status",
      "same_lane_comparison",
      "ranking_vs_current_core",
      "decision_reason",
      "next_review_trigger",
    ].forEach((field) => requireString(row[field], `${context} ${field}`));
    if (!watchlistBySymbol.has(row.symbol)) {
      throw new Error(`${context} references unknown watchlist symbol ${row.symbol}`);
    }
    requireAllowed(row.from_status, allowedWatchlistStatuses, `${context} from_status`);
    requireAllowed(row.to_status, allowedWatchlistStatuses, `${context} to_status`);
    requireAllowed(row.buy_zone_status, allowedBuyZoneStatuses, `${context} buy_zone_status`);
    requireNonNegativeIntegerString(row.unresolved_conflicts, `${context} unresolved_conflicts`);
    if (Number(row.unresolved_conflicts) !== 0) {
      throw new Error(`${context} unresolved_conflicts must be 0 for a current promotion record`);
    }
    parseDate(row.decided_at, `${context} decided_at`);
    if (!existsSync(row.source_path)) {
      throw new Error(`${context} source_path does not exist: ${row.source_path}`);
    }
    if (!existsSync(row.subagent_review_path)) {
      throw new Error(`${context} subagent_review_path does not exist: ${row.subagent_review_path}`);
    }
    const requiredRoles = row.to_status === "active_core_candidate"
      || row.buy_zone_status === "in_buy_zone"
      ? corePromotionXhighRoles
      : requiredPromotionXhighRoles;
    requireRoles(row.xhigh_roles_completed, requiredRoles, `${context} xhigh_roles_completed`);
  });

  buyZoneRows.forEach((row, index) => {
    const context = `${buyZonesFile} row ${index + 2}`;
    ["symbol", "as_of", "buy_zone_status", "entry_trigger", "position_role", "sizing_tier", "source_path", "source_ids", "notes"].forEach(
      (field) => requireString(row[field], `${context} ${field}`),
    );
    if (!watchlistBySymbol.has(row.symbol)) {
      throw new Error(`${context} references unknown watchlist symbol ${row.symbol}`);
    }
    requireAllowed(row.buy_zone_status, allowedBuyZoneStatuses, `${context} buy_zone_status`);
    parseDate(row.as_of, `${context} as_of`);
    if (!existsSync(row.source_path)) {
      throw new Error(`${context} source_path does not exist: ${row.source_path}`);
    }
    splitSemicolonList(row.source_ids).forEach((sourceId) => {
      if (!knownSourceIds.has(sourceId)) {
        throw new Error(`${context} references unknown source id ${sourceId}`);
      }
    });
    if (row.stale_if_price_moves_pct !== "") {
      requirePositiveNumberString(row.stale_if_price_moves_pct, `${context} stale_if_price_moves_pct`);
    }
    if (row.buy_zone_status === "in_buy_zone") {
      requirePositiveNumberString(row.max_staged_entry_price, `${context} max_staged_entry_price`);
      const openBlockingEvents = csvRecords(freshnessFile)
        .filter((event) => event.symbol === row.symbol)
        .filter((event) => openEventStatuses.has(event.status))
        .filter((event) => event.severity === "high" || event.severity === "critical");
      if (openBlockingEvents.length > 0) {
        throw new Error(`${context} cannot be in_buy_zone with open high or critical freshness events`);
      }
    }
  });

  watchlistRows.forEach((row) => {
    if (!buyEligibleWatchlistStatuses.has(row.status)) {
      return;
    }
    const transition = latestTransitionBySymbol.get(row.symbol);
    if (transition === undefined) {
      throw new Error(`${watchlistTransitionsFile} is missing current transition for active symbol ${row.symbol}`);
    }
    if (transition.to_status !== row.status) {
      throw new Error(`${watchlistTransitionsFile} latest transition for ${row.symbol} does not match watchlist status ${row.status}`);
    }
    if (transition.to_priority !== row.priority) {
      throw new Error(`${watchlistTransitionsFile} latest transition for ${row.symbol} does not match watchlist priority ${row.priority}`);
    }
    if (!buyZoneBySymbol.has(row.symbol)) {
      throw new Error(`${buyZonesFile} is missing buy-zone row for active symbol ${row.symbol}`);
    }
  });

  console.log("ok promotion and buy-zone semantic checks");
}

function validateQualityMetrics() {
  const parsed = parsedYamlFiles.get(qualityMetricsFile);
  if (parsed?.schema_version !== 1) {
    throw new Error(`${qualityMetricsFile} schema_version must be 1`);
  }

  const readiness = parsed.decision_readiness ?? {};
  requireAllowed(readiness.status, allowedReadinessStatuses, `${qualityMetricsFile} decision_readiness.status`);
  requireString(readiness.scope, `${qualityMetricsFile} decision_readiness.scope`);
  if (readiness.scope !== "repository_and_public_observable_information") {
    throw new Error(`${qualityMetricsFile} decision_readiness.scope must be repository_and_public_observable_information`);
  }
  requireStringArray(readiness.user_only_execution_prerequisites, `${qualityMetricsFile} decision_readiness.user_only_execution_prerequisites`);
  if (typeof readiness.can_recommend_buys !== "boolean") {
    throw new Error(`${qualityMetricsFile} decision_readiness.can_recommend_buys must be boolean`);
  }
  if (readiness.can_recommend_buys !== true) {
    throw new Error(`${qualityMetricsFile} ready repository-public state must set can_recommend_buys true`);
  }
  requireString(readiness.reason, `${qualityMetricsFile} decision_readiness.reason`);

  const coverage = parsed.coverage ?? {};
  const discoveryProcess = parsed.discovery_process ?? {};
  const watchlistProcess = parsed.watchlist_process ?? {};
  const freshness = parsed.freshness ?? {};
  const gates = parsed.quality_gates ?? {};
  [
    "watchlist_symbols",
    "watchlist_symbols_with_current_cycle_review",
    "watchlist_symbols_missing_current_cycle_review",
    "active_watchlist_symbols",
    "active_symbols_with_current_valuation_state",
    "active_symbols_missing_valuation_state",
    "active_symbols_with_latest_filing_review",
    "active_symbols_missing_latest_filing_review",
    "raw_discovery_candidates_open",
    "active_discovery_lanes",
    "emerging_discovery_lanes",
  ].forEach((field) => requireNumber(coverage[field], `${qualityMetricsFile} coverage.${field}`));
  [
    "open_critical_events",
    "open_high_events",
    "stale_valuation_states_over_45_days",
    "stale_theses_over_90_days",
  ].forEach((field) => requireNumber(freshness[field], `${qualityMetricsFile} freshness.${field}`));
  [
    "critical_event_review_target_hours",
    "high_event_review_target_days",
    "valuation_state_max_age_days",
    "thesis_review_max_age_days",
    "discovery_scan_max_age_days",
    "watchlist_cycle_review_max_age_days",
  ].forEach((field) => requireNumber(gates[field], `${qualityMetricsFile} quality_gates.${field}`));
  [
    "latest_cycle_review_path",
    "full_watchlist_review_status",
    "priority_status_refresh_status",
    "buy_zone_refresh_status",
    "independent_xhigh_reprioritization_status",
  ].forEach((field) => requireString(watchlistProcess[field], `${qualityMetricsFile} watchlist_process.${field}`));
  [
    "unresolved_watchlist_review_conflicts",
  ].forEach((field) => requireNumber(watchlistProcess[field], `${qualityMetricsFile} watchlist_process.${field}`));
  [
    "required_xhigh_roles",
    "completed_xhigh_roles",
    "skipped_xhigh_roles",
  ].forEach((field) => requireStringArray(watchlistProcess[field], `${qualityMetricsFile} watchlist_process.${field}`));
  if (!existsSync(watchlistProcess.latest_cycle_review_path)) {
    throw new Error(`${qualityMetricsFile} watchlist_process.latest_cycle_review_path does not exist: ${watchlistProcess.latest_cycle_review_path}`);
  }
  if (watchlistProcess.latest_cycle_review_path !== watchlistCycleReviewsFile) {
    throw new Error(`${qualityMetricsFile} watchlist_process.latest_cycle_review_path must be ${watchlistCycleReviewsFile}`);
  }
  [
    "full_watchlist_review_status",
    "priority_status_refresh_status",
    "buy_zone_refresh_status",
    "independent_xhigh_reprioritization_status",
  ].forEach((field) => {
    if (watchlistProcess[field] !== "complete") {
      throw new Error(`${qualityMetricsFile} watchlist_process.${field} must be complete`);
    }
  });
  watchlistProcess.required_xhigh_roles.forEach((role) => {
    if (!watchlistProcess.completed_xhigh_roles.includes(role)) {
      throw new Error(`${qualityMetricsFile} watchlist_process.completed_xhigh_roles is missing required role ${role}`);
    }
  });
  [
    "latest_discovery_run_path",
    "latest_bottleneck_review_path",
    "latest_agentic_discovery_path",
    "latest_evidence_packet_path",
    "first_layer_questions_status",
    "broad_source_search_status",
    "independent_xhigh_subagents_status",
  ].forEach((field) => requireString(discoveryProcess[field], `${qualityMetricsFile} discovery_process.${field}`));
  [
    "open_candidates_without_readiness_sprint",
    "material_open_candidates",
    "material_open_candidates_blocking_allocation",
    "open_candidate_readiness_completed",
    "unresolved_subagent_conflicts",
  ].forEach((field) => requireNumber(discoveryProcess[field], `${qualityMetricsFile} discovery_process.${field}`));
  [
    "required_xhigh_roles",
    "completed_xhigh_roles",
    "skipped_xhigh_roles",
    "allocation_relevant_lanes",
  ].forEach((field) => requireStringArray(discoveryProcess[field], `${qualityMetricsFile} discovery_process.${field}`));
  const laneIds = discoveryLaneIds();
  discoveryProcess.allocation_relevant_lanes.forEach((laneId) => {
    if (!laneIds.has(laneId)) {
      throw new Error(`${qualityMetricsFile} discovery_process.allocation_relevant_lanes references unknown lane ${laneId}`);
    }
  });
  [
    "latest_discovery_run_path",
    "latest_bottleneck_review_path",
    "latest_agentic_discovery_path",
    "latest_evidence_packet_path",
  ].forEach((field) => {
    if (!existsSync(discoveryProcess[field])) {
      throw new Error(`${qualityMetricsFile} discovery_process.${field} does not exist: ${discoveryProcess[field]}`);
    }
  });
  validateDiscoveryRunArtifacts(discoveryProcess);
  validateSubagentEvidencePacket(discoveryProcess.latest_evidence_packet_path, discoveryProcess);

  const activeSymbols = activeWatchlistSymbols();
  const watchlistSymbols = watchlistReviewSymbols();
  if (coverage.watchlist_symbols !== watchlistSymbols.length) {
    throw new Error(
      `${qualityMetricsFile} watchlist_symbols is ${coverage.watchlist_symbols}, expected ${watchlistSymbols.length}`,
    );
  }
  if (coverage.active_watchlist_symbols !== activeSymbols.length) {
    throw new Error(
      `${qualityMetricsFile} active_watchlist_symbols is ${coverage.active_watchlist_symbols}, expected ${activeSymbols.length}`,
    );
  }

  const asOfTimestamp = parseDate(parsed.as_of, `${qualityMetricsFile} as_of`);
  const universeScanTimestamp = parseDate(coverage.universe_scan_as_of, `${qualityMetricsFile} coverage.universe_scan_as_of`);
  const laneMapTimestamp = parseDate(coverage.discovery_lane_map_as_of, `${qualityMetricsFile} coverage.discovery_lane_map_as_of`);
  if (daysBetween(universeScanTimestamp, asOfTimestamp) > gates.discovery_scan_max_age_days) {
    throw new Error(`${qualityMetricsFile} universe_scan_as_of is older than discovery_scan_max_age_days`);
  }
  if (daysBetween(laneMapTimestamp, asOfTimestamp) > gates.discovery_scan_max_age_days) {
    throw new Error(`${qualityMetricsFile} discovery_lane_map_as_of is older than discovery_scan_max_age_days`);
  }
  const currentCycleReviewSymbols = currentWatchlistCycleReviewSymbolSet(watchlistSymbols, asOfTimestamp, gates.watchlist_cycle_review_max_age_days);
  if (coverage.watchlist_symbols_with_current_cycle_review !== currentCycleReviewSymbols.size) {
    throw new Error(
      `${qualityMetricsFile} watchlist_symbols_with_current_cycle_review is ${coverage.watchlist_symbols_with_current_cycle_review}, expected ${currentCycleReviewSymbols.size}`,
    );
  }
  const missingCycleReviews = watchlistSymbols.length - currentCycleReviewSymbols.size;
  if (coverage.watchlist_symbols_missing_current_cycle_review !== missingCycleReviews) {
    throw new Error(
      `${qualityMetricsFile} watchlist_symbols_missing_current_cycle_review is ${coverage.watchlist_symbols_missing_current_cycle_review}, expected ${missingCycleReviews}`,
    );
  }
  validateCurrentBuyZoneRows(parsed.as_of);

  const discoveryLanes = parsedYamlFiles.get(discoveryLanesFile)?.lanes ?? [];
  const activeDiscoveryLaneCount = discoveryLanes.filter((lane) => lane.status === "active").length;
  const emergingDiscoveryLaneCount = discoveryLanes.filter((lane) => lane.status === "emerging").length;
  if (coverage.active_discovery_lanes !== activeDiscoveryLaneCount) {
    throw new Error(`${qualityMetricsFile} active_discovery_lanes is ${coverage.active_discovery_lanes}, expected ${activeDiscoveryLaneCount}`);
  }
  if (coverage.emerging_discovery_lanes !== emergingDiscoveryLaneCount) {
    throw new Error(`${qualityMetricsFile} emerging_discovery_lanes is ${coverage.emerging_discovery_lanes}, expected ${emergingDiscoveryLaneCount}`);
  }

  const currentValuationSymbols = currentValuationSymbolSet(activeSymbols, asOfTimestamp, gates.valuation_state_max_age_days);
  if (coverage.active_symbols_with_current_valuation_state !== currentValuationSymbols.size) {
    throw new Error(
      `${qualityMetricsFile} active_symbols_with_current_valuation_state is ${coverage.active_symbols_with_current_valuation_state}, expected ${currentValuationSymbols.size}`,
    );
  }
  const missingValuations = activeSymbols.length - currentValuationSymbols.size;
  if (coverage.active_symbols_missing_valuation_state !== missingValuations) {
    throw new Error(
      `${qualityMetricsFile} active_symbols_missing_valuation_state is ${coverage.active_symbols_missing_valuation_state}, expected ${missingValuations}`,
    );
  }
  if (
    coverage.active_symbols_with_latest_filing_review
      + coverage.active_symbols_missing_latest_filing_review
    !== activeSymbols.length
  ) {
    throw new Error(`${qualityMetricsFile} filing review coverage must equal active_watchlist_symbols`);
  }

  const openDiscoveryCount = csvRecords(discoveryFile)
    .filter((row) => row.status === "new" || row.status === "incubating")
    .length;
  if (coverage.raw_discovery_candidates_open !== openDiscoveryCount) {
    throw new Error(`${qualityMetricsFile} raw_discovery_candidates_open is ${coverage.raw_discovery_candidates_open}, expected ${openDiscoveryCount}`);
  }
  const readinessStats = candidateReadinessStats();
  validateAllocationRelevantCandidateMateriality(discoveryProcess.allocation_relevant_lanes);
  validateMaterialCandidateDashboardCoverage(asOfTimestamp, gates.discovery_scan_max_age_days);
  if (discoveryProcess.open_candidates_without_readiness_sprint !== readinessStats.withoutSprint) {
    throw new Error(`${qualityMetricsFile} open_candidates_without_readiness_sprint is ${discoveryProcess.open_candidates_without_readiness_sprint}, expected ${readinessStats.withoutSprint}`);
  }
  if (discoveryProcess.material_open_candidates !== readinessStats.material) {
    throw new Error(`${qualityMetricsFile} material_open_candidates is ${discoveryProcess.material_open_candidates}, expected ${readinessStats.material}`);
  }
  if (discoveryProcess.material_open_candidates_blocking_allocation !== readinessStats.blocking) {
    throw new Error(`${qualityMetricsFile} material_open_candidates_blocking_allocation is ${discoveryProcess.material_open_candidates_blocking_allocation}, expected ${readinessStats.blocking}`);
  }
  if (discoveryProcess.open_candidate_readiness_completed !== readinessStats.completed) {
    throw new Error(`${qualityMetricsFile} open_candidate_readiness_completed is ${discoveryProcess.open_candidate_readiness_completed}, expected ${readinessStats.completed}`);
  }

  const openEvents = csvRecords(freshnessFile).filter((row) => openEventStatuses.has(row.status));
  const openCriticalEvents = openEvents.filter((row) => row.severity === "critical").length;
  const openHighEvents = openEvents.filter((row) => row.severity === "high").length;
  if (freshness.open_critical_events !== openCriticalEvents) {
    throw new Error(`${qualityMetricsFile} open_critical_events is ${freshness.open_critical_events}, expected ${openCriticalEvents}`);
  }
  if (freshness.open_high_events !== openHighEvents) {
    throw new Error(`${qualityMetricsFile} open_high_events is ${freshness.open_high_events}, expected ${openHighEvents}`);
  }
  validateOldestOpenEventDate(freshness, openEvents);
  validateStaleThesisCount(freshness, asOfTimestamp, gates.thesis_review_max_age_days);
  validateStaleValuationCount(freshness, activeSymbols, asOfTimestamp, gates.valuation_state_max_age_days);

  if (readiness.status === "ready") {
    if (
      openCriticalEvents > 0
      || openHighEvents > 0
      || missingValuations > 0
      || coverage.active_symbols_missing_latest_filing_review > 0
      || missingCycleReviews > 0
      || freshness.stale_theses_over_90_days > 0
      || freshness.stale_valuation_states_over_45_days > 0
      || discoveryProcess.unresolved_subagent_conflicts > 0
      || watchlistProcess.unresolved_watchlist_review_conflicts > 0
      || discoveryProcess.open_candidates_without_readiness_sprint > 0
      || discoveryProcess.material_open_candidates_blocking_allocation > 0
    ) {
      throw new Error(`${qualityMetricsFile} cannot be ready with open high or critical events, missing active-symbol coverage, missing current watchlist-cycle reviews, stale active theses or valuations, unresolved subagent conflicts, or material candidate readiness blockers`);
    }
  }
  console.log(`ok ${qualityMetricsFile} semantic checks`);
}

function validateAllocationRelevantCandidateMateriality(allocationRelevantLanes) {
  const relevantLaneIds = new Set(allocationRelevantLanes);
  if (relevantLaneIds.size === 0) {
    return;
  }
  const recordsBySymbol = candidateReadinessRecordsBySymbol();
  openDiscoveryCandidates().forEach((candidate) => {
    if (!relevantLaneIds.has(candidate.theme)) {
      return;
    }
    const record = recordsBySymbol.get(candidate.symbol);
    if (record === undefined) {
      throw new Error(`${candidateReadinessFile} is missing same-lane allocation-relevant candidate ${candidate.symbol}`);
    }
    const context = `${candidateReadinessFile} ${candidate.symbol} allocation-relevant materiality`;
    requireString(record.materiality_reason, `${context} materiality_reason`);
    requireString(record.blocking_scope, `${context} blocking_scope`);
    requireStringArray(record.affected_lanes, `${context} affected_lanes`);
    if (!record.affected_lanes.includes(candidate.theme)) {
      throw new Error(`${context} affected_lanes must include candidate theme ${candidate.theme}`);
    }
    if (
      !record.material_to_current_allocation
      && record.readiness_status !== "not_material_current_allocation"
    ) {
      throw new Error(`${candidateReadinessFile} ${candidate.symbol} is in allocation-relevant lane ${candidate.theme} but is not material and not explicitly classified not_material_current_allocation`);
    }
    if (!record.material_to_current_allocation) {
      requireString(record.readiness_path, `${context} readiness_path`);
      if (!existsSync(record.readiness_path)) {
        throw new Error(`${context} readiness_path does not exist: ${record.readiness_path}`);
      }
    }
  });
}

function validateDiscoveryRunArtifacts(discoveryProcess) {
  const files = new Set([
    discoveryProcess.latest_discovery_run_path,
    discoveryProcess.latest_bottleneck_review_path,
    discoveryProcess.latest_agentic_discovery_path,
  ]);
  files.forEach((file) => validateDiscoveryRunArtifact(file, discoveryProcess));
}

function validateDiscoveryRunArtifact(file, discoveryProcess) {
  const parsed = parseYaml(readFileSync(file, "utf8"));
  if (parsed?.schema_version !== 1) {
    throw new Error(`${file} schema_version must be 1`);
  }
  ["run_id", "run_date", "request_type", "policy_version", "mission_anchor"].forEach((field) =>
    requireString(parsed[field], `${file} ${field}`),
  );
  requireString(parsed.subagent_evidence_packet_path, `${file} subagent_evidence_packet_path`);
  if (parsed.subagent_evidence_packet_path !== discoveryProcess.latest_evidence_packet_path) {
    throw new Error(`${file} subagent_evidence_packet_path must match ${qualityMetricsFile} discovery_process.latest_evidence_packet_path`);
  }
  parseDate(parsed.run_date, `${file} run_date`);

  const sourceCoverage = parsed.source_coverage ?? {};
  if (!Array.isArray(sourceCoverage.deterministic_commands) || sourceCoverage.deterministic_commands.length === 0) {
    throw new Error(`${file} source_coverage.deterministic_commands must contain at least one command`);
  }
  const sourceFamilies = sourceCoverage.source_families_checked;
  if (!Array.isArray(sourceFamilies) || sourceFamilies.length === 0) {
    throw new Error(`${file} source_coverage.source_families_checked must contain at least one family`);
  }
  const knownSourceIds = sourceIds();
  const sourceFamilyIds = new Set();
  sourceFamilies.forEach((family, index) => {
    const context = `${file} source_families_checked[${index}]`;
    ["family_id", "family", "retrieved_at", "material_findings"].forEach((field) =>
      requireString(family?.[field], `${context} ${field}`),
    );
    sourceFamilyIds.add(family.family_id);
    parseDate(family.retrieved_at, `${context} retrieved_at`);
    requireStringArray(family.sources_or_queries, `${context} sources_or_queries`);
    requireStringArray(family.source_ids, `${context} source_ids`);
    family.source_ids.forEach((sourceId) => {
      if (!knownSourceIds.has(sourceId)) {
        throw new Error(`${context} references unknown source id ${sourceId}`);
      }
    });
  });
  const broadSearch = sourceCoverage.broad_current_world_search ?? {};
  ["status", "retrieval_window", "notes"].forEach((field) =>
    requireString(broadSearch[field], `${file} broad_current_world_search.${field}`),
  );
  parseDate(broadSearch.retrieval_window, `${file} broad_current_world_search.retrieval_window`);
  if (discoveryProcess.broad_source_search_status === "complete" && broadSearch.status !== "complete") {
    throw new Error(`${file} broad_current_world_search.status must be complete`);
  }
  if (broadSearch.status === "complete") {
    requiredCompleteDiscoverySourceFamilyIds.forEach((familyId) => {
      if (!sourceFamilyIds.has(familyId)) {
        throw new Error(`${file} complete broad_current_world_search must include source family ${familyId}`);
      }
    });
  }
  sourceCoverage.deterministic_commands.forEach((command, index) => {
    const context = `${file} deterministic_commands[${index}]`;
    ["command", "retrieved_at", "result_summary"].forEach((field) =>
      requireString(command?.[field], `${context} ${field}`),
    );
    requireBoolean(command?.dry_run, `${context} dry_run`);
    parseDate(command.retrieved_at, `${context} retrieved_at`);
    if (command.output_path !== undefined && command.output_path !== "" && command.output_path !== "not_saved_for_original_run" && !existsSync(command.output_path)) {
      throw new Error(`${context} output_path does not exist: ${command.output_path}`);
    }
  });

  validateFirstLayerQuestions(file, parsed.first_layer_bottleneck_questions);
  validateDiscoveryRunSubagents(file, parsed.subagents, discoveryProcess);

  if (!Array.isArray(parsed.readiness_sprints)) {
    throw new Error(`${file} readiness_sprints must be an array`);
  }
  const readinessBySymbol = candidateReadinessRecordsBySymbol();
  parsed.readiness_sprints.forEach((sprint, index) => {
    const context = `${file} readiness_sprints[${index}]`;
    [
      "symbol",
      "readiness_status",
      "dashboard_surface_status",
      "readiness_index_record",
      "blocker_type",
      "reachable_evidence_remaining",
      "final_classification",
    ].forEach((field) =>
      requireString(sprint?.[field], `${context} ${field}`),
    );
    requireBoolean(sprint?.material_to_current_allocation, `${context} material_to_current_allocation`);
    requireAllowed(sprint.readiness_status, allowedCandidateReadinessStatuses, `${context} readiness_status`);
    requireAllowed(sprint.dashboard_surface_status, allowedDashboardSurfaceStatuses, `${context} dashboard_surface_status`);
    requireAllowed(sprint.final_classification, allowedReadinessSprintClassifications, `${context} final_classification`);
    validateDashboardSurfaceForReadiness(sprint, context);
    if (sprint.material_to_current_allocation) {
      requireString(sprint.readiness_path, `${context} readiness_path`);
      if (!existsSync(sprint.readiness_path)) {
        throw new Error(`${context} readiness_path does not exist: ${sprint.readiness_path}`);
      }
    }
    if (sprint.readiness_index_record !== `${candidateReadinessFile}#${sprint.symbol}`) {
      throw new Error(`${context} readiness_index_record must be ${candidateReadinessFile}#${sprint.symbol}`);
    }
    const canonical = readinessBySymbol.get(sprint.symbol);
    if (canonical === undefined) {
      throw new Error(`${context} references missing canonical readiness record for ${sprint.symbol}`);
    }
    [
      "material_to_current_allocation",
      "readiness_status",
      "dashboard_surface_status",
      "readiness_path",
      "blocker_type",
      "reachable_evidence_remaining",
    ].forEach((field) => {
      if (sprint[field] !== canonical[field]) {
        throw new Error(`${context} ${field} does not match ${candidateReadinessFile}`);
      }
    });
  });
}

function validateSubagentEvidencePacket(file, discoveryProcess) {
  const parsed = parseYaml(readFileSync(file, "utf8"));
  if (parsed?.schema_version !== 1) {
    throw new Error(`${file} schema_version must be 1`);
  }
  [
    "current_date",
    "request_type",
    "mission",
    "policy_version",
    "specific_question",
  ].forEach((field) => requireString(parsed[field], `${file} ${field}`));
  parseDate(parsed.current_date, `${file} current_date`);
  [
    "quality_metrics_as_of",
    "universe_scan_as_of",
    "discovery_lane_map_as_of",
    "latest_research_engine_run_as_of",
  ].forEach((field) => {
    requireScalar(parsed.freshness_window?.[field], `${file} freshness_window.${field}`);
  });
  [
    "account_state_path",
    "status",
    "last_confirmed_ledger_event_id",
  ].forEach((field) => requireString(parsed.confirmed_account_facts?.[field], `${file} confirmed_account_facts.${field}`));
  [
    "confirmed_cash",
    "settled_cash",
    "buying_power",
    "positions_count",
  ].forEach((field) => requireNumber(parsed.confirmed_account_facts?.[field], `${file} confirmed_account_facts.${field}`));
  [
    "current_positions",
    "candidate_set",
    "candidate_readiness",
    "active_watchlist",
    "relevant_files",
    "fresh_sources",
    "deterministic_outputs",
    "open_freshness_events",
    "valuation_states",
    "discovery_lane_summary",
    "first_layer_discovery_questions",
    "safety_boundaries",
  ].forEach((field) => {
    if (!Array.isArray(parsed[field])) {
      throw new Error(`${file} ${field} must be an array`);
    }
  });
  if (parsed.first_layer_discovery_questions.length < requiredFirstLayerQuestionKeys.length) {
    throw new Error(`${file} first_layer_discovery_questions must include the mandatory discovery questions`);
  }
  parsed.relevant_files.forEach((relevantFile) => {
    if (typeof relevantFile !== "string" || relevantFile.trim() === "") {
      throw new Error(`${file} relevant_files entries must be non-empty strings`);
    }
    if (!existsSync(relevantFile)) {
      throw new Error(`${file} relevant_files references missing path ${relevantFile}`);
    }
  });
  const knownSourceIds = sourceIds();
  parsed.fresh_sources.forEach((source, index) => {
    const context = `${file} fresh_sources[${index}]`;
    requireString(source?.id, `${context} id`);
    if (!knownSourceIds.has(source.id)) {
      throw new Error(`${context} references unknown source id ${source.id}`);
    }
  });
  requireString(parsed.quality_metrics?.path, `${file} quality_metrics.path`);
  if (parsed.quality_metrics.path !== qualityMetricsFile) {
    throw new Error(`${file} quality_metrics.path must be ${qualityMetricsFile}`);
  }
  const readiness = parsed.quality_metrics?.decision_readiness ?? {};
  if (readiness.status !== "ready") {
    throw new Error(`${file} quality_metrics.decision_readiness.status must be ready`);
  }
  if (readiness.scope !== "repository_and_public_observable_information") {
    throw new Error(`${file} quality_metrics.decision_readiness.scope must be repository_and_public_observable_information`);
  }
  if (readiness.can_recommend_buys !== true) {
    throw new Error(`${file} quality_metrics.decision_readiness.can_recommend_buys must be true`);
  }
  requireStringArray(readiness.user_only_execution_prerequisites, `${file} quality_metrics.decision_readiness.user_only_execution_prerequisites`);
  const defaults = parsed.subagent_defaults ?? {};
  if (defaults.reasoning_level !== "xhigh") {
    throw new Error(`${file} subagent_defaults.reasoning_level must be xhigh`);
  }
  requireBoolean(defaults.independent_context, `${file} subagent_defaults.independent_context`);
  if (!defaults.independent_context) {
    throw new Error(`${file} subagent_defaults.independent_context must be true`);
  }
  requireStringArray(defaults.roles, `${file} subagent_defaults.roles`);
  discoveryProcess.required_xhigh_roles.forEach((role) => {
    if (!defaults.roles.includes(role)) {
      throw new Error(`${file} subagent_defaults.roles is missing required role ${role}`);
    }
  });
  const readinessBySymbol = candidateReadinessRecordsBySymbol();
  parsed.candidate_readiness.forEach((record, index) => {
    const context = `${file} candidate_readiness[${index}]`;
    requireString(record?.symbol, `${context} symbol`);
    const canonical = readinessBySymbol.get(record.symbol);
    if (canonical === undefined) {
      throw new Error(`${context} references unknown candidate readiness symbol ${record.symbol}`);
    }
    [
      "material_to_current_allocation",
      "readiness_status",
      "dashboard_surface_status",
      "blocker_type",
      "reachable_evidence_remaining",
      "conclusion",
    ].forEach((field) => {
      if (record[field] !== canonical[field]) {
        throw new Error(`${context} ${field} does not match ${candidateReadinessFile}`);
      }
    });
    const expectedAffectedLanes = JSON.stringify(canonical.affected_lanes ?? []);
    if (JSON.stringify(record.affected_lanes ?? []) !== expectedAffectedLanes) {
      throw new Error(`${context} affected_lanes does not match ${candidateReadinessFile}`);
    }
  });
}

function validateFirstLayerQuestions(file, questions) {
  const knownSourceIds = sourceIds();
  requiredFirstLayerQuestionKeys.forEach((key) => {
    const question = questions?.[key];
    const context = `${file} first_layer_bottleneck_questions.${key}`;
    ["facts", "inferences", "disconfirming_evidence", "investment_implication"].forEach((field) =>
      requireString(question?.[field], `${context} ${field}`),
    );
    requireStringArray(question?.source_ids, `${context} source_ids`);
    question.source_ids.forEach((sourceId) => {
      if (!knownSourceIds.has(sourceId)) {
        throw new Error(`${context} references unknown source id ${sourceId}`);
      }
    });
  });
}

function validateDiscoveryRunSubagents(file, subagents, discoveryProcess) {
  const roles = subagents?.required_roles;
  if (!Array.isArray(roles) || roles.length === 0) {
    throw new Error(`${file} subagents.required_roles must contain at least one role`);
  }
  const completedRoles = new Set();
  roles.forEach((role, index) => {
    const context = `${file} subagents.required_roles[${index}]`;
    ["role", "reasoning_level", "key_findings"].forEach((field) =>
      requireString(role?.[field], `${context} ${field}`),
    );
    requiredDiscoveryRunSubagentFields.forEach((field) => {
      if (Array.isArray(role?.[field])) {
        requireStringArray(role[field], `${context} ${field}`);
      } else {
        requireString(role?.[field], `${context} ${field}`);
      }
    });
    if (role.reasoning_level !== "xhigh") {
      throw new Error(`${context} reasoning_level must be xhigh`);
    }
    requireBoolean(role.independent_context, `${context} independent_context`);
    if (!role.independent_context) {
      throw new Error(`${context} must use independent context unless explicitly justified outside the run artifact`);
    }
    requireBoolean(role.completed, `${context} completed`);
    if (role.completed) {
      completedRoles.add(role.role);
    } else {
      requireAllowed(role.skip_reason, allowedSubagentSkipReasons, `${context} skip_reason`);
    }
  });

  discoveryProcess.completed_xhigh_roles.forEach((role) => {
    if (!completedRoles.has(role)) {
      throw new Error(`${qualityMetricsFile} completed_xhigh_roles includes ${role}, but ${file} does not mark it completed`);
    }
  });
  requireNumber(subagents.unresolved_conflicts, `${file} subagents.unresolved_conflicts`);
  if (subagents.unresolved_conflicts !== discoveryProcess.unresolved_subagent_conflicts) {
    throw new Error(`${file} unresolved_conflicts is ${subagents.unresolved_conflicts}, expected ${discoveryProcess.unresolved_subagent_conflicts}`);
  }
}

function validateOldestOpenEventDate(freshness, openEvents) {
  const expected = openEvents
    .map((row) => row.event_date)
    .sort()[0] ?? null;
  if (expected === null && freshness.oldest_open_event_date != null) {
    throw new Error(`${qualityMetricsFile} oldest_open_event_date should be empty when there are no open events`);
  }
  if (expected !== null && freshness.oldest_open_event_date !== expected) {
    throw new Error(`${qualityMetricsFile} oldest_open_event_date is ${freshness.oldest_open_event_date}, expected ${expected}`);
  }
}

function validateStaleThesisCount(freshness, asOfTimestamp, maxAgeDays) {
  const staleCount = csvRecords(watchlistFile)
    .filter((row) => activeWatchlistStatuses.has(row.status))
    .filter((row) => daysBetween(parseDate(row.latest_baseline_date, `${watchlistFile} ${row.symbol} latest_baseline_date`), asOfTimestamp) > maxAgeDays)
    .length;
  if (freshness.stale_theses_over_90_days !== staleCount) {
    throw new Error(`${qualityMetricsFile} stale_theses_over_90_days is ${freshness.stale_theses_over_90_days}, expected ${staleCount}`);
  }
}

function validateStaleValuationCount(freshness, activeSymbols, asOfTimestamp, maxAgeDays) {
  const activeSet = new Set(activeSymbols);
  const staleSymbols = new Set();
  csvRecords(valuationStatesFile).forEach((row, index) => {
    if (!activeSet.has(row.symbol)) {
      return;
    }
    const timestamp = parseDate(row.as_of, `${valuationStatesFile} row ${index + 2} as_of`);
    if (daysBetween(timestamp, asOfTimestamp) > maxAgeDays) {
      staleSymbols.add(row.symbol);
    }
  });
  if (freshness.stale_valuation_states_over_45_days !== staleSymbols.size) {
    throw new Error(`${qualityMetricsFile} stale_valuation_states_over_45_days is ${freshness.stale_valuation_states_over_45_days}, expected ${staleSymbols.size}`);
  }
}

function validateCurrentBuyZoneRows(asOfDate) {
  const buyZoneBySymbol = new Map(csvRecords(buyZonesFile).map((row) => [row.symbol, row]));
  csvRecords(watchlistFile)
    .filter((row) => buyEligibleWatchlistStatuses.has(row.status))
    .forEach((row) => {
      const buyZone = buyZoneBySymbol.get(row.symbol);
      if (buyZone === undefined) {
        throw new Error(`${buyZonesFile} is missing buy-zone row for active symbol ${row.symbol}`);
      }
      if (buyZone.as_of !== asOfDate) {
        throw new Error(`${buyZonesFile} buy-zone row is not current for active symbol ${row.symbol}`);
      }
    });
}

function currentValuationSymbolSet(activeSymbols, asOfTimestamp, maxAgeDays) {
  const activeSet = new Set(activeSymbols);
  const currentSymbols = new Set();
  csvRecords(valuationStatesFile).forEach((row, index) => {
    if (!activeSet.has(row.symbol)) {
      return;
    }
    const timestamp = parseDate(row.as_of, `${valuationStatesFile} row ${index + 2} as_of`);
    if (daysBetween(timestamp, asOfTimestamp) <= maxAgeDays) {
      currentSymbols.add(row.symbol);
    }
  });
  return currentSymbols;
}

function currentWatchlistCycleReviewSymbolSet(watchlistSymbols, asOfTimestamp, maxAgeDays) {
  const watchlistSet = new Set(watchlistSymbols);
  const currentSymbols = new Set();
  const asOfDate = new Date(asOfTimestamp).toISOString().slice(0, 10);
  latestRowsBySymbol(csvRecords(watchlistCycleReviewsFile), "reviewed_at").forEach((row) => {
    if (!watchlistSet.has(row.symbol)) {
      return;
    }
    const timestamp = parseDate(row.reviewed_at, `${watchlistCycleReviewsFile} ${row.symbol} reviewed_at`);
    if (row.reviewed_at === asOfDate && daysBetween(timestamp, asOfTimestamp) <= maxAgeDays) {
      currentSymbols.add(row.symbol);
    }
  });
  return currentSymbols;
}
