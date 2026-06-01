import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
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
  "PUBLICATION_POLICY.md",
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
const publicationPolicyFile = "PUBLICATION_POLICY.md";
const securityMasterFile = "data/market/security_master.csv";
const sourcesFile = "research/sources.yml";
const technicalSnapshotsFile = "data/market/technical_snapshots.csv";
const valuationStatesFile = "research/valuation-states.csv";
const watchlistCycleReviewsFile = "research/watchlist-cycle-reviews.csv";
const watchlistTransitionsFile = "research/watchlist-transitions.csv";
const watchlistFile = "research/watchlist.csv";
const watchlistPricesFile = "data/market/watchlist_prices.csv";
const secCompanyTickersExchangeUrl = "https://www.sec.gov/files/company_tickers_exchange.json";
const defaultDiscoveryScope = "active_emerging_incubating";
const noProfileSemanticCoverageStatus = "absent_name_ticker_only";

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
const allowedSemanticReasoningLevels = new Set(["low", "medium", "high", "xhigh"]);
const allowedSemanticEscalations = new Set([
  "none",
  "reject_or_archive",
  "medium_lane_compare",
  "xhigh_readiness_candidate",
]);
const allowedSemanticBottleneckExposure = new Set(["none", "weak", "possible", "strong"]);
const allowedSemanticDirectness = new Set(["none", "weak_proxy", "indirect", "direct", "unknown"]);
const allowedSemanticCompanyStage = new Set(["too_large_mature", "mature", "growth", "early", "newly_public", "unknown"]);
const allowedSemanticExtremeUpsideFit = new Set(["unlikely", "possible", "strong", "unknown"]);
const allowedSemanticConfidence = new Set(["low", "medium", "high"]);
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
  "new_listings_ipo_spinoff_transactions",
  "lane_evolution_current_world_search",
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
validatePublicationPolicy();
validatePublicDisclaimerSurfaces();
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
validateDiscoveryRunJsonArtifacts();
validateNoTrackedIgnoredCacheArtifacts();
validateDurableDiscoveryArtifactPortability();

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

function requireNonNegativeInteger(value, context) {
  requireNumber(value, context);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${context} must be a non-negative integer`);
  }
}

function requirePositiveNumber(value, context) {
  requireNumber(value, context);
  if (value <= 0) {
    throw new Error(`${context} must be positive`);
  }
}

function requireIsoTimestamp(value, context) {
  requireString(value, context);
  const text = value.trim();
  const match = text.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/);
  if (match === null) {
    throw new Error(`${context} must be an ISO timestamp with timezone`);
  }
  parseDate(match[1], `${context} date`);
  const [, , hour, minute, second] = match;
  if (Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) {
    throw new Error(`${context} must contain a valid time`);
  }
  if (Number.isNaN(Date.parse(text))) {
    throw new Error(`${context} must be a valid ISO timestamp`);
  }
}

function requireSha256String(value, context) {
  requireString(value, context);
  const text = value.trim();
  if (!/^[a-f0-9]{64}$/.test(text)) {
    throw new Error(`${context} must be a SHA-256 hex string`);
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

function requireNonEmptyStringArray(value, context) {
  requireStringArray(value, context);
  if (value.length === 0) {
    throw new Error(`${context} must contain at least one entry`);
  }
}

function validateDurableDiscoveryArtifactPortability() {
  [
    "research/discovery/runs",
    "research/process",
  ].forEach((directory) => {
    portableArtifactFiles(directory).forEach((file) => {
      const content = readFileSync(file, "utf8");
      localOnlyPathPatterns().forEach((pattern) => {
        if (pattern.test(content)) {
          throw new Error(`${file} contains local-only filesystem path material matching ${pattern}`);
        }
      });
    });
  });
  console.log("ok durable discovery artifact portability checks");
}

function validateNoTrackedIgnoredCacheArtifacts() {
  if (!isInsideGitWorkTree()) {
    console.log("ok ignored cache/download tracking check skipped outside git worktree");
    return;
  }
  const output = execFileSync("git", ["ls-files", "research/cache", "research/downloads"], {
    encoding: "utf8",
  }).trim();
  if (output !== "") {
    throw new Error(`Ignored cache/download artifacts must not be tracked:\n${output}`);
  }
  console.log("ok ignored cache/download files are untracked");
}

function isInsideGitWorkTree() {
  try {
    return execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim() === "true";
  } catch {
    return false;
  }
}

function portableArtifactFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      return portableArtifactFiles(file);
    }
    return /\.(csv|json|md|ya?ml)$/.test(entry.name) ? [file] : [];
  });
}

function localOnlyPathPatterns() {
  return [
    /\/Users\//,
    /\/private\/var\//,
    /\/var\/folders\//,
    /\/tmp\//,
    /\\\\Users\\\\/,
  ];
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
  const text = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error(`${context} must use YYYY-MM-DD`);
  }
  const timestamp = Date.parse(`${text}T00:00:00.000Z`);
  if (Number.isNaN(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== text) {
    throw new Error(`${context} must be a valid YYYY-MM-DD calendar date`);
  }
  return timestamp;
}

function isStrictDateLike(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? "").trim());
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

function sourcesById() {
  const parsed = parsedYamlFiles.get(sourcesFile);
  const entries = Array.isArray(parsed?.sources) ? parsed.sources : [];
  return new Map(entries.map((source) => [source?.id, source]).filter(([id]) => Boolean(id)));
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
    parseDate(source.retrieved_at, `${context} retrieved_at`);
    parseDate(source.first_seen_at, `${context} first_seen_at`);
    if (isStrictDateLike(source.source_published_at)) {
      parseDate(source.source_published_at, `${context} source_published_at`);
    }
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
    "Public Release Safety",
    "The repository may recommend. It must never execute trades.",
  ].forEach((phrase) => {
    if (!content.includes(phrase)) {
      throw new Error(`${constitutionFile} is missing required phrase: ${phrase}`);
    }
  });
  console.log(`ok ${constitutionFile} semantic checks`);
}

function validatePublicationPolicy() {
  const content = readFileSync(publicationPolicyFile, "utf8");
  [
    "Not investment advice",
    "public release embargo",
    "raw broker documents",
    "no compensation",
    "regular market close",
    "sensitive-field review",
    "buy, sell, hold, or size",
  ].forEach((phrase) => {
    if (!content.includes(phrase)) {
      throw new Error(`${publicationPolicyFile} is missing required phrase: ${phrase}`);
    }
  });
  console.log(`ok ${publicationPolicyFile} semantic checks`);
}

function validatePublicDisclaimerSurfaces() {
  [
    "README.md",
    "src/components/InvestDashboard.tsx",
    "src/components/ResearchStockPage.tsx",
  ].forEach((file) => {
    if (!existsSync(file)) {
      return;
    }
    const content = readFileSync(file, "utf8");
    [
      "Not investment advice",
      "buy, sell, hold",
    ].forEach((phrase) => {
      if (!content.includes(phrase)) {
        throw new Error(`${file} is missing public disclaimer phrase: ${phrase}`);
      }
    });
  });
  console.log("ok public disclaimer surfaces");
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
    if (lane.private_or_future_proxies !== undefined) {
      requireStringArray(lane.private_or_future_proxies, `${context} private_or_future_proxies`);
    }
    lane.current_public_proxies.forEach((symbol) => {
      if (!watchlistSymbols.has(symbol)) {
        throw new Error(`${context} current_public_proxies references unknown watchlist symbol ${symbol}`);
      }
    });
    (lane.private_or_future_proxies ?? []).forEach((symbol) => {
      if (!watchlistSymbols.has(symbol)) {
        throw new Error(`${context} private_or_future_proxies references unknown watchlist symbol ${symbol}`);
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
    if (row.readiness_path !== undefined && row.readiness_path !== "") {
      validateReadinessSprintNote(row.readiness_path, row.symbol, row);
    }
  });

  openCandidateSymbols.forEach((symbol) => {
    if (!seen.has(symbol)) {
      throw new Error(`${candidateReadinessFile} is missing open candidate ${symbol}`);
    }
  });

  console.log(`ok ${candidateReadinessFile} semantic checks`);
}

function validateReadinessSprintNote(file, symbol, readinessRecord) {
  const content = readFileSync(file, "utf8");
  if (!content.includes(`symbol: ${symbol}`)) {
    throw new Error(`${file} must identify symbol ${symbol}`);
  }
  const metadata = firstYamlBlock(content, file);
  [
    "symbol",
    "review_date",
    "readiness_status",
    "blocker_type",
    "classification",
    "dashboard_surface_status",
    "readiness_index_record",
  ].forEach((field) => requireString(metadata?.[field], `${file} readiness metadata.${field}`));
  if (metadata.symbol !== symbol) {
    throw new Error(`${file} readiness metadata.symbol must be ${symbol}`);
  }
  if (metadata.readiness_status !== readinessRecord.readiness_status) {
    throw new Error(`${file} readiness metadata.readiness_status must match ${candidateReadinessFile}`);
  }
  if (metadata.blocker_type !== readinessRecord.blocker_type) {
    throw new Error(`${file} readiness metadata.blocker_type must match ${candidateReadinessFile}`);
  }
  if (metadata.dashboard_surface_status !== readinessRecord.dashboard_surface_status) {
    throw new Error(`${file} readiness metadata.dashboard_surface_status must match ${candidateReadinessFile}`);
  }
  if (metadata.readiness_index_record !== candidateReadinessFile) {
    throw new Error(`${file} readiness metadata.readiness_index_record must be ${candidateReadinessFile}`);
  }
  requireNonEmptyStringArray(metadata.source_ids, `${file} readiness metadata.source_ids`);
  const knownSourceIds = sourceIds();
  metadata.source_ids.forEach((sourceId) => {
    if (!knownSourceIds.has(sourceId)) {
      throw new Error(`${file} readiness metadata.source_ids references unknown source id ${sourceId}`);
    }
  });
  parseDate(metadata.review_date, `${file} readiness metadata.review_date`);
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

function firstYamlBlock(content, file) {
  const match = content.match(/```yaml\n([\s\S]*?)\n```/);
  if (match === null) {
    throw new Error(`${file} must contain a YAML metadata block`);
  }
  const parsed = parseYaml(match[1]);
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${file} YAML metadata block must be an object`);
  }
  return parsed;
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
  [
    "first_layer_questions_status",
    "broad_source_search_status",
    "independent_xhigh_subagents_status",
  ].forEach((field) => {
    if (discoveryProcess[field] !== "complete") {
      throw new Error(`${qualityMetricsFile} discovery_process.${field} must be complete`);
    }
  });
  const completedDiscoveryRoles = new Set(discoveryProcess.completed_xhigh_roles);
  const skippedDiscoveryRoles = new Set(discoveryProcess.skipped_xhigh_roles);
  completedDiscoveryRoles.forEach((role) => {
    if (skippedDiscoveryRoles.has(role)) {
      throw new Error(`${qualityMetricsFile} discovery_process role ${role} must not be both completed and skipped`);
    }
  });
  discoveryProcess.required_xhigh_roles.forEach((role) => {
    if (!completedDiscoveryRoles.has(role) && !skippedDiscoveryRoles.has(role)) {
      throw new Error(`${qualityMetricsFile} discovery_process.resolved_xhigh_roles is missing required role ${role}`);
    }
  });
  if (readiness.can_recommend_buys) {
    discoveryProcess.required_xhigh_roles.forEach((role) => {
      if (!completedDiscoveryRoles.has(role)) {
        throw new Error(`${qualityMetricsFile} buy-capable discovery_process.completed_xhigh_roles is missing required role ${role}`);
      }
    });
    if (discoveryProcess.skipped_xhigh_roles.length > 0) {
      throw new Error(`${qualityMetricsFile} buy-capable discovery_process must not skip required xhigh roles`);
    }
  }
  const laneIds = discoveryLaneIds();
  discoveryProcess.allocation_relevant_lanes.forEach((laneId) => {
    if (!laneIds.has(laneId)) {
      throw new Error(`${qualityMetricsFile} discovery_process.allocation_relevant_lanes references unknown lane ${laneId}`);
    }
  });
  const derivedAllocationRelevantLanes = derivedAllocationRelevantLaneIds(parsed, discoveryProcess);
  derivedAllocationRelevantLanes.forEach((laneId) => {
    if (!discoveryProcess.allocation_relevant_lanes.includes(laneId)) {
      throw new Error(`${qualityMetricsFile} discovery_process.allocation_relevant_lanes is missing derived allocation-relevant lane ${laneId}`);
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
  validateDiscoveryProcessUniverseScanFreshness(discoveryProcess, coverage.universe_scan_as_of);
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
  const activeSymbolsWithLatestFilingReview = currentFilingReviewSymbolSet(activeSymbols, asOfTimestamp, gates.watchlist_cycle_review_max_age_days);
  if (coverage.active_symbols_with_latest_filing_review !== activeSymbolsWithLatestFilingReview.size) {
    throw new Error(
      `${qualityMetricsFile} active_symbols_with_latest_filing_review is ${coverage.active_symbols_with_latest_filing_review}, expected ${activeSymbolsWithLatestFilingReview.size}`,
    );
  }
  const missingFilingReviews = activeSymbols.length - activeSymbolsWithLatestFilingReview.size;
  if (coverage.active_symbols_missing_latest_filing_review !== missingFilingReviews) {
    throw new Error(
      `${qualityMetricsFile} active_symbols_missing_latest_filing_review is ${coverage.active_symbols_missing_latest_filing_review}, expected ${missingFilingReviews}`,
    );
  }

  const openDiscoveryCount = csvRecords(discoveryFile)
    .filter((row) => row.status === "new" || row.status === "incubating")
    .length;
  if (coverage.raw_discovery_candidates_open !== openDiscoveryCount) {
    throw new Error(`${qualityMetricsFile} raw_discovery_candidates_open is ${coverage.raw_discovery_candidates_open}, expected ${openDiscoveryCount}`);
  }
  const readinessStats = candidateReadinessStats();
  validateAllocationRelevantCandidateMateriality([
    ...new Set([
      ...discoveryProcess.allocation_relevant_lanes,
      ...derivedAllocationRelevantLanes,
    ]),
  ]);
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
      || missingFilingReviews > 0
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

function derivedAllocationRelevantLaneIds(parsed, discoveryProcess) {
  const lanes = parsedYamlFiles.get(discoveryLanesFile)?.lanes ?? [];
  const laneIds = discoveryLaneIds();
  const candidateRowsBySymbol = new Map(csvRecords(discoveryFile).map((row) => [row.symbol, row]));
  const derived = new Set();

  openDiscoveryCandidates().forEach((candidate) => {
    if (laneIds.has(candidate.theme)) {
      derived.add(candidate.theme);
    }
  });

  const agenticPath = discoveryProcess.latest_agentic_discovery_path;
  if (typeof agenticPath === "string" && agenticPath !== "" && existsSync(agenticPath)) {
    const agenticRun = parseYaml(readFileSync(agenticPath, "utf8"));
    discoveryRunCandidateScopeSymbols(agenticRun).forEach((symbol) => {
      const candidate = candidateRowsBySymbol.get(symbol);
      if (candidate !== undefined && laneIds.has(candidate.theme)) {
        derived.add(candidate.theme);
      }
    });
  }

  const currentBuyZoneSymbols = csvRecords(buyZonesFile)
    .filter((row) => row.as_of === parsed.as_of && row.buy_zone_status === "in_buy_zone")
    .map((row) => row.symbol);
  currentBuyZoneSymbols.forEach((symbol) => {
    let foundLane = false;
    lanes
      .filter((lane) => Array.isArray(lane.current_public_proxies) && lane.current_public_proxies.includes(symbol))
      .forEach((lane) => {
        foundLane = true;
        if (laneIds.has(lane.id)) {
          derived.add(lane.id);
        }
      });
    if (!foundLane) {
      throw new Error(`${qualityMetricsFile} current in-buy-zone symbol ${symbol} is missing from discovery lane current_public_proxies`);
    }
  });

  return [...derived].sort();
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
  const knownSourcesById = sourcesById();
  const knownSourceIds = new Set(knownSourcesById.keys());
  const sourceFamilyIds = new Set();
  const qualityMetrics = parsedYamlFiles.get(qualityMetricsFile);
  const sourceMaxAgeDays = qualityMetrics.quality_gates?.discovery_scan_max_age_days ?? 31;
  sourceFamilies.forEach((family, index) => {
    const context = `${file} source_families_checked[${index}]`;
    ["family_id", "family", "retrieved_at", "material_findings"].forEach((field) =>
      requireString(family?.[field], `${context} ${field}`),
    );
    sourceFamilyIds.add(family.family_id);
    parseDate(family.retrieved_at, `${context} retrieved_at`);
    requireNonEmptyStringArray(family.sources_or_queries, `${context} sources_or_queries`);
    requireNonEmptyStringArray(family.source_ids, `${context} source_ids`);
    family.source_ids.forEach((sourceId) => {
      const source = knownSourcesById.get(sourceId);
      if (source === undefined) {
        throw new Error(`${context} references unknown source id ${sourceId}`);
      }
      validateDiscoverySourceFreshness(source, family.retrieved_at, sourceMaxAgeDays, `${context} source_id ${sourceId}`);
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
    validateDeterministicCommandOutput(command, context);
  });

  validateUnknownFutureReview(file, parsed);
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
  const sprintSymbols = new Set(parsed.readiness_sprints.map((sprint) => sprint.symbol).filter(Boolean));
  const scopedCandidateSymbols = discoveryRunCandidateScopeSymbols(parsed);
  readinessBySymbol.forEach((record, symbol) => {
    if (scopedCandidateSymbols.has(symbol) && record.material_to_current_allocation && !sprintSymbols.has(symbol)) {
      throw new Error(`${file} readiness_sprints is missing material scoped readiness symbol ${symbol}`);
    }
  });
}

function validateDiscoverySourceFreshness(source, familyRetrievedAt, maxAgeDays, context) {
  const familyRetrievedTimestamp = parseDate(familyRetrievedAt, `${context} family retrieved_at`);
  const sourceRetrievedTimestamp = parseDate(source.retrieved_at, `${context} ${sourcesFile} retrieved_at`);
  if (sourceRetrievedTimestamp > familyRetrievedTimestamp) {
    throw new Error(`${context} ${sourcesFile} retrieved_at is after source family retrieved_at`);
  }
  if (daysBetween(sourceRetrievedTimestamp, familyRetrievedTimestamp) > maxAgeDays) {
    throw new Error(`${context} ${sourcesFile} retrieved_at is older than discovery_scan_max_age_days for the run`);
  }
  if (isStrictDateLike(source.source_published_at)) {
    const publishedTimestamp = parseDate(source.source_published_at, `${context} ${sourcesFile} source_published_at`);
    if (publishedTimestamp > familyRetrievedTimestamp) {
      throw new Error(`${context} ${sourcesFile} source_published_at is after source family retrieved_at`);
    }
  }
}

function validateUnknownFutureReview(file, parsed) {
  const deterministicOutputs = (parsed.source_coverage?.deterministic_commands ?? [])
    .map((command) => loadDeterministicCommandJsonOutput(command)?.parsed)
    .filter((output) => output !== undefined && Number(output.exploratory_match_count ?? 0) > 0);
  if (deterministicOutputs.length === 0) {
    return;
  }
  const review = parsed.unknown_future_review ?? {};
  const expectedCount = Math.max(...deterministicOutputs.map((output) => Number(output.exploratory_match_count ?? 0)));
  requireNumber(review.exploratory_match_count, `${file} unknown_future_review.exploratory_match_count`);
  if (review.exploratory_match_count !== expectedCount) {
    throw new Error(`${file} unknown_future_review.exploratory_match_count must match deterministic exploratory matches`);
  }
  [
    "top_clusters",
    "sampled_symbols",
    "false_positive_patterns",
    "lane_decisions",
  ].forEach((field) => requireNonEmptyStringArray(review[field], `${file} unknown_future_review.${field}`));
  requireString(review.disposition, `${file} unknown_future_review.disposition`);
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
    "active_watchlist_scope",
  ].forEach((field) => requireString(parsed[field], `${file} ${field}`));
  parseDate(parsed.current_date, `${file} current_date`);
  validateEvidencePacketChronology(file, parsed);
  [
    "quality_metrics_as_of",
    "universe_scan_as_of",
    "discovery_lane_map_as_of",
    "latest_research_engine_run_as_of",
  ].forEach((field) => {
    requireScalar(parsed.freshness_window?.[field], `${file} freshness_window.${field}`);
  });
  validateEvidencePacketQualityMetrics(file, parsed);
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
    const canonical = sourcesById().get(source.id);
    [
      "source_type",
      "source_published_at",
      "retrieved_at",
      "summary",
    ].forEach((field) => {
      if (JSON.stringify(source[field] ?? null) !== JSON.stringify(canonical[field] ?? null)) {
        throw new Error(`${context} ${field} does not match ${sourcesFile}`);
      }
    });
    requireMatchingStringArray(
      source.related_symbols ?? [],
      canonical.related_symbols ?? [],
      `${context} related_symbols`,
    );
  });
  validateEvidencePacketCanonicalArrays(file, parsed);
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
  validateEvidencePacketDeterministicOutputs(file, parsed);
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
  const packetReadinessSymbols = new Set(parsed.candidate_readiness.map((record) => record.symbol).filter(Boolean));
  const packetCandidateSymbols = new Set(parsed.candidate_set.map((record) => record.symbol).filter(Boolean));
  readinessBySymbol.forEach((_record, symbol) => {
    if (packetCandidateSymbols.has(symbol) && !packetReadinessSymbols.has(symbol)) {
      throw new Error(`${file} candidate_readiness is missing scoped readiness symbol ${symbol}`);
    }
  });
  validateEvidencePacketCandidateSetScope(file, parsed);
  validateEvidencePacketWatchlistScope(file, parsed);
}

function validateEvidencePacketChronology(file, parsed) {
  requireIsoTimestamp(parsed.generated_at, `${file} generated_at`);
  const qualityMetricsAsOf = yamlDateString(parsedYamlFiles.get(qualityMetricsFile)?.as_of);
  if (parsed.current_date !== qualityMetricsAsOf) {
    throw new Error(`${file} current_date must match ${qualityMetricsFile} as_of`);
  }
  const match = file.match(/(?:^|\/)(\d{4}-\d{2}-\d{2})-subagent-evidence-packet\.ya?ml$/);
  if (match === null) {
    throw new Error(`${file} filename must include the evidence packet date`);
  }
  if (parsed.current_date !== match[1]) {
    throw new Error(`${file} current_date must match filename date ${match[1]}`);
  }
}

function validateEvidencePacketCanonicalArrays(file, parsed) {
  requireMatchingJson(
    parsed.fresh_sources,
    expectedEvidencePacketFreshSources(),
    `${file} fresh_sources must contain exactly ${sourcesFile} sources`,
  );
  requireMatchingJson(
    parsed.open_freshness_events,
    csvRecords(freshnessFile).filter((row) => row.status === "new" || row.status === "stale"),
    `${file} open_freshness_events must match ${freshnessFile}`,
  );
  requireMatchingJson(
    parsed.valuation_states,
    expectedEvidencePacketValuationStates(),
    `${file} valuation_states must match ${valuationStatesFile}`,
  );
  requireMatchingJson(
    parsed.discovery_lane_summary,
    expectedEvidencePacketDiscoveryLaneSummary(),
    `${file} discovery_lane_summary must match ${discoveryLanesFile}`,
  );
}

function expectedEvidencePacketFreshSources() {
  const parsed = parsedYamlFiles.get(sourcesFile);
  return (parsed.sources ?? []).map((source) => ({
    id: source.id,
    source_type: source.source_type,
    source_published_at: source.source_published_at,
    retrieved_at: source.retrieved_at,
    related_symbols: source.related_symbols,
    summary: source.summary,
  }));
}

function expectedEvidencePacketValuationStates() {
  return csvRecords(valuationStatesFile).map((row) => ({
    symbol: row.symbol,
    as_of: row.as_of,
    price: row.price,
    valuation_state: row.valuation_state,
    price_attractiveness: row.price_attractiveness,
    thesis_state: row.thesis_state,
    risk_state: row.risk_state,
    source_ids: row.source_ids,
  }));
}

function expectedEvidencePacketDiscoveryLaneSummary() {
  const parsed = parsedYamlFiles.get(discoveryLanesFile);
  return (parsed.lanes ?? []).map((lane) => ({
    id: lane.id,
    name: lane.name,
    status: lane.status,
    bottleneck_thesis: lane.bottleneck_thesis,
    current_public_proxies: lane.current_public_proxies,
  }));
}

function yamlDateString(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value ?? "");
}

function validateEvidencePacketQualityMetrics(file, parsed) {
  const qualityMetrics = parsedYamlFiles.get(qualityMetricsFile);
  const expectedFreshnessWindow = {
    quality_metrics_as_of: qualityMetrics.as_of,
    universe_scan_as_of: qualityMetrics.coverage?.universe_scan_as_of,
    discovery_lane_map_as_of: qualityMetrics.coverage?.discovery_lane_map_as_of,
    latest_research_engine_run_as_of: qualityMetrics.last_research_engine_run?.as_of,
  };
  Object.entries(expectedFreshnessWindow).forEach(([field, expected]) => {
    if (parsed.freshness_window?.[field] !== expected) {
      throw new Error(`${file} freshness_window.${field} does not match ${qualityMetricsFile}`);
    }
  });
  [
    "coverage",
    "decision_readiness",
    "discovery_process",
    "freshness",
  ].forEach((field) => {
    requireMatchingJson(parsed.quality_metrics?.[field] ?? {}, qualityMetrics[field] ?? {}, `${file} quality_metrics.${field}`);
  });
}

function validateEvidencePacketCandidateSetScope(file, parsed) {
  const packetRowsBySymbol = new Map(parsed.candidate_set.map((row) => [row?.symbol, row]));
  const canonicalOpenCandidates = openDiscoveryCandidates();
  if (packetRowsBySymbol.size !== parsed.candidate_set.length) {
    throw new Error(`${file} candidate_set must not contain duplicate symbols`);
  }
  if (packetRowsBySymbol.size !== canonicalOpenCandidates.length) {
    throw new Error(`${file} candidate_set must contain exactly the open discovery candidates`);
  }
  const packetReadinessSymbols = new Set(parsed.candidate_readiness.map((record) => record.symbol).filter(Boolean));
  canonicalOpenCandidates.forEach((row) => {
    const context = `${file} candidate_set ${row.symbol}`;
    const packetRow = packetRowsBySymbol.get(row.symbol);
    if (packetRow === undefined) {
      throw new Error(`${context} is missing open discovery candidate`);
    }
    [
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
    ].forEach((field) => {
      if (packetRow[field] !== row[field]) {
        throw new Error(`${context} ${field} does not match ${discoveryFile}`);
      }
    });
    if (!packetReadinessSymbols.has(row.symbol)) {
      throw new Error(`${file} candidate_readiness is missing scoped readiness symbol ${row.symbol}`);
    }
  });
}

function validateEvidencePacketWatchlistScope(file, parsed) {
  const packetRowsBySymbol = new Map(parsed.active_watchlist.map((row) => [row?.symbol, row]));
  csvRecords(watchlistFile)
    .filter((row) => row.status !== "removed")
    .forEach((row) => {
      const context = `${file} active_watchlist ${row.symbol}`;
      const packetRow = packetRowsBySymbol.get(row.symbol);
      if (packetRow === undefined) {
        throw new Error(`${context} is missing non-removed watchlist symbol`);
      }
      ["name", "theme", "status", "priority", "initial_role", "next_review_trigger", "notes"].forEach((field) => {
        if (packetRow[field] !== row[field]) {
          throw new Error(`${context} ${field} does not match ${watchlistFile}`);
        }
      });
    });
}

function validateDiscoveryProcessUniverseScanFreshness(discoveryProcess, expectedAsOf) {
  const file = discoveryProcess.latest_agentic_discovery_path;
  const parsed = parseYaml(readFileSync(file, "utf8"));
  const commands = parsed?.source_coverage?.deterministic_commands ?? [];
  let sawSavedJsonOutput = false;
  let sawMatchingBroadAsOf = false;
  commands.forEach((command, index) => {
    const output = loadDeterministicCommandJsonOutput(command);
    if (output === undefined) {
      return;
    }
    sawSavedJsonOutput = true;
    if (typeof output.parsed.as_of === "string") {
      parseDate(output.parsed.as_of, `${file} deterministic_commands[${index}] output as_of`);
      if (
        output.parsed.as_of === expectedAsOf &&
        supportsBroadUniverseFreshness(output.parsed)
      ) {
        sawMatchingBroadAsOf = true;
      }
    }
  });
  if (!sawSavedJsonOutput) {
    throw new Error(`${qualityMetricsFile} discovery_process.latest_agentic_discovery_path must reference at least one saved deterministic JSON output`);
  }
  if (!sawMatchingBroadAsOf) {
    throw new Error(`${qualityMetricsFile} coverage.universe_scan_as_of ${expectedAsOf} has no matching broad deterministic command output as_of in ${file}`);
  }
}

function discoveryRunCandidateScopeSymbols(parsed) {
  const delta = parsed.candidate_delta ?? {};
  return new Set([
    ...stringArrayOrEmpty(delta.candidates_added),
    ...stringArrayOrEmpty(delta.candidates_rejected_or_archived),
    ...stringArrayOrEmpty(delta.candidates_promoted),
    ...stringArrayOrEmpty(delta.candidates_incubated),
  ].map((symbol) => symbol.toUpperCase()));
}

function stringArrayOrEmpty(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item) => typeof item === "string" && item.trim() !== "")
    .map((item) => item.trim());
}

function validateDiscoveryRunJsonArtifacts() {
  const artifactFiles = portableArtifactFiles("research/discovery/runs")
    .filter((file) => file.endsWith(".json") || file.endsWith(".csv"))
    .sort();
  artifactFiles.forEach(validateDiscoveryRunArtifactLocation);
  const jsonFiles = artifactFiles.filter((file) => file.endsWith(".json"));
  const csvFiles = artifactFiles.filter((file) => file.endsWith(".csv"));
  const hashAnchors = discoveryArtifactHashAnchors(jsonFiles);
  jsonFiles.forEach((file) => {
    const artifact = JSON.parse(readFileSync(file, "utf8"));
    if (artifact?.schema_version !== 1) {
      throw new Error(`${file} schema_version must be 1`);
    }
    if (artifact.source !== "discovery_artifact_index") {
      validateDiscoveryArtifactHashAnchor(file, hashAnchors);
    } else {
      validateDiscoveryArtifactIndexFileName(file);
    }
    if (typeof artifact.as_of === "string" && "candidate_count" in artifact) {
      validateDiscoveryScanOutput(artifact, file, {
        requireBroadFreshness: false,
      });
    }
    if (artifact.source === "sec_filing_discovery_index") {
      validateSecFilingDiscoveryIndexArtifact(artifact, file);
    }
    if (artifact.source === "sec_registration_transaction_candidates") {
      validateSecRegistrationTransactionCandidateArtifact(artifact, file);
    }
    if (artifact.source === "semantic_issuer_packets") {
      validateSemanticIssuerPacketsArtifact(artifact, file);
    }
    if (artifact.source === "semantic_discovery_batch_manifest") {
      validateSemanticBatchManifestArtifact(artifact, file);
    }
    if (artifact.source === "semantic_classification_import") {
      validateSemanticClassificationImportArtifact(artifact, file);
    }
    if (artifact.source === "semantic_discovery_run") {
      validateSemanticDiscoveryRunArtifact(artifact, file);
    }
    if (artifact.source === "semantic_review_packet") {
      validateSemanticReviewPacketArtifact(artifact, file);
    }
  });
  csvFiles.forEach((file) => {
    validateDiscoveryArtifactHashAnchor(file, hashAnchors);
  });
  console.log("ok discovery run artifact semantic checks");
}

function validateDiscoveryRunArtifactLocation(file) {
  if (!isCacheOnlyDiscoveryIntermediate(file)) {
    return;
  }
  throw new Error(`${file} is a cache-only discovery intermediate; write it under research/cache/discovery/ and commit only the durable summary, hash, and source metadata`);
}

function isCacheOnlyDiscoveryIntermediate(file) {
  const name = file.split("/").pop() ?? "";
  return name.endsWith("-semantic-packets.json")
    || name.endsWith("-semantic-batch-manifest.json")
    || name.endsWith("-full-sec-issuer-profiles.json")
    || name.includes("-semantic-smoke-")
    || name.includes("-semantic-validation-")
    || file.includes("-semantic-batches/");
}

function discoveryArtifactHashAnchors(jsonFiles) {
  const anchors = new Map();
  addQualityMetricDiscoveryHashAnchors(anchors);
  jsonFiles.forEach((file) => {
    const artifact = JSON.parse(readFileSync(file, "utf8"));
    if (artifact.source === "sec_filing_discovery_index") {
      addSecFilingIndexHashAnchors(anchors, artifact, file);
    }
    if (artifact.source === "discovery_artifact_index") {
      addDiscoveryArtifactIndexHashAnchors(anchors, artifact, file);
    }
  });
  return anchors;
}

function addQualityMetricDiscoveryHashAnchors(anchors) {
  const qualityMetrics = parsedYamlFiles.get(qualityMetricsFile);
  const discoveryProcess = qualityMetrics.discovery_process ?? {};
  [
    discoveryProcess.latest_agentic_discovery_path,
    discoveryProcess.latest_evidence_packet_path,
  ].forEach((file) => {
    if (typeof file !== "string" || file === "" || !existsSync(file)) {
      return;
    }
    const parsed = parseYaml(readFileSync(file, "utf8"));
    const commands = parsed?.source_coverage?.deterministic_commands ?? parsed?.deterministic_outputs ?? [];
    commands.forEach((entry, index) => {
      if (typeof entry?.output_path !== "string" || !entry.output_path.endsWith(".json")) {
        return;
      }
      addArtifactHashAnchor(anchors, {
        context: `${file} deterministic output ${index}`,
        path: entry.output_path,
        sha256Value: entry.output_sha256,
      });
    });
  });
}

function addSecFilingIndexHashAnchors(anchors, artifact, file) {
  [
    ["manifest_metadata_path", "manifest_metadata_sha256"],
    ["profile_path", "profile_sha256"],
    ["scan_path", "scan_sha256"],
  ].forEach(([pathField, hashField]) => {
    addArtifactHashAnchor(anchors, {
      context: `${file} ${pathField}`,
      path: artifact[pathField],
      sha256Value: artifact[hashField],
    });
  });
}

function addDiscoveryArtifactIndexHashAnchors(anchors, artifact, file) {
  const fileAsOf = validateDiscoveryArtifactIndexFileName(file);
  requireString(artifact.as_of, `${file} as_of`);
  parseDate(artifact.as_of, `${file} as_of`);
  if (artifact.as_of !== fileAsOf) {
    throw new Error(`${file} as_of must match filename date ${fileAsOf}`);
  }
  requireIsoTimestamp(artifact.generated_at, `${file} generated_at`);
  if (!Array.isArray(artifact.artifacts) || artifact.artifacts.length === 0) {
    throw new Error(`${file} artifacts must contain at least one entry`);
  }
  artifact.artifacts.forEach((entry, index) => {
    const context = `${file} artifacts[${index}]`;
    validateDiscoveryArtifactIndexEntryPath(entry?.path, artifact.as_of, context);
    requireAllowed(entry.role, discoveryArtifactIndexRoles(), `${context} role`);
    validateDiscoveryArtifactIndexEntryMetadata(entry, artifact.as_of, context);
    addArtifactHashAnchor(anchors, {
      context,
      path: entry?.path,
      sha256Value: entry?.sha256,
    });
  });
}

function validateDiscoveryArtifactIndexEntryMetadata(entry, asOf, context) {
  requireString(entry?.path, `${context} path`);
  const expectedRole = discoveryArtifactRole(entry.path);
  if (entry.role !== expectedRole) {
    throw new Error(`${context} role must be ${expectedRole}`);
  }
  if (entry.path.endsWith(".json")) {
    const parsed = JSON.parse(readFileSync(entry.path, "utf8"));
    if (typeof parsed.as_of === "string" && parsed.as_of !== asOf) {
      throw new Error(`${context} JSON as_of must match index date ${asOf}`);
    }
    if (typeof parsed.retrieved_at === "string" && parsed.retrieved_at !== asOf) {
      throw new Error(`${context} JSON retrieved_at must match index date ${asOf}`);
    }
    if (Array.isArray(parsed.profiles)) {
      parsed.profiles.forEach((profile, profileIndex) => {
        if (typeof profile.retrieved_at === "string" && profile.retrieved_at !== asOf) {
          throw new Error(`${context} profiles[${profileIndex}] retrieved_at must match index date ${asOf}`);
        }
        if (Array.isArray(profile.sources)) {
          profile.sources.forEach((source, sourceIndex) => {
            if (typeof source.retrieved_at === "string" && source.retrieved_at !== asOf) {
              throw new Error(`${context} profiles[${profileIndex}].sources[${sourceIndex}] retrieved_at must match index date ${asOf}`);
            }
          });
        }
      });
    }
  }
  if (entry.path.endsWith(".csv")) {
    const rows = parseCsv(readFileSync(entry.path, "utf8"));
    const header = rows[0] ?? [];
    const retrievedAtIndex = header.indexOf("retrieved_at");
    if (retrievedAtIndex === -1) {
      return;
    }
    rows.slice(1).forEach((row, rowIndex) => {
      const retrievedAt = row[retrievedAtIndex] ?? "";
      if (retrievedAt !== "" && retrievedAt !== asOf) {
        throw new Error(`${context} CSV row ${rowIndex + 2} retrieved_at must match index date ${asOf}`);
      }
    });
  }
}

function discoveryArtifactRole(file) {
  const name = file.split("/").pop() ?? "";
  if (name.endsWith("-index.metadata.json")) {
    return "sec_filing_index_metadata";
  }
  if (name.endsWith(".metadata.json")) {
    return "metadata_artifact";
  }
  if (
    name.endsWith("-profile-input.json") ||
    name.endsWith("-profiles.json") ||
    name.endsWith("-profile-enriched-scan.json")
  ) {
    return "profile_or_profile_scan_artifact";
  }
  if (name.endsWith("-registration-transaction-candidates.json")) {
    return "sec_registration_transaction_candidate_artifact";
  }
  if (name.endsWith("-semantic-packets.json")) {
    return "semantic_issuer_packet_artifact";
  }
  if (name.endsWith("-semantic-batch-manifest.json")) {
    return "semantic_batch_manifest_artifact";
  }
  if (name.endsWith("-semantic-import.json")) {
    return "semantic_classification_import_artifact";
  }
  if (name.endsWith("-semantic-discovery-run.json")) {
    return "semantic_discovery_run_artifact";
  }
  if (name.endsWith("-semantic-review-packet.json")) {
    return "semantic_review_packet_artifact";
  }
  if (name.endsWith("-scan.json")) {
    return "deterministic_scan_artifact";
  }
  if (name.endsWith(".csv")) {
    return "generated_csv_artifact";
  }
  return "generated_discovery_artifact";
}

function discoveryArtifactIndexRoles() {
  return new Set([
    "deterministic_scan_artifact",
    "generated_csv_artifact",
    "generated_discovery_artifact",
    "metadata_artifact",
    "profile_or_profile_scan_artifact",
    "semantic_batch_manifest_artifact",
    "semantic_classification_import_artifact",
    "semantic_discovery_run_artifact",
    "semantic_review_packet_artifact",
    "semantic_issuer_packet_artifact",
    "sec_registration_transaction_candidate_artifact",
    "sec_filing_index_metadata",
  ]);
}

function validateDiscoveryArtifactIndexEntryPath(file, asOf, context) {
  requireString(file, `${context} path`);
  if (file.endsWith("-discovery-artifact-index.json")) {
    throw new Error(`${context} must not anchor discovery artifact index files`);
  }
  if (!file.startsWith(`research/discovery/runs/${asOf}-`)) {
    throw new Error(`${context} path must start with research/discovery/runs/${asOf}-`);
  }
  if (!/\.(csv|json)$/.test(file)) {
    throw new Error(`${context} path must be a discovery CSV or JSON artifact`);
  }
}

function addArtifactHashAnchor(anchors, {
  context,
  path,
  sha256Value,
}) {
  requireString(path, `${context} path`);
  requireSha256String(sha256Value, `${context} sha256`);
  if (path.endsWith("-discovery-artifact-index.json")) {
    throw new Error(`${context} must not anchor discovery artifact index files`);
  }
  if (!existsSync(path)) {
    throw new Error(`${context} path does not exist: ${path}`);
  }
  const current = anchors.get(path);
  if (current !== undefined && current !== sha256Value) {
    throw new Error(`${context} has conflicting hash anchor for ${path}`);
  }
  anchors.set(path, sha256Value);
}

function validateDiscoveryArtifactIndexFileName(file) {
  const match = file.match(/^research\/discovery\/runs\/(\d{4}-\d{2}-\d{2})-discovery-artifact-index\.json$/);
  if (match === null) {
    throw new Error(`${file} has source discovery_artifact_index but is not named YYYY-MM-DD-discovery-artifact-index.json`);
  }
  return match[1];
}

function validateDiscoveryArtifactHashAnchor(file, anchors) {
  const expected = anchors.get(file);
  if (expected === undefined) {
    throw new Error(`${file} is not hash-anchored by an agentic run, evidence packet, SEC filing index, or discovery artifact index`);
  }
  const actual = sha256(readFileSync(file, "utf8"));
  if (expected !== actual) {
    throw new Error(`${file} hash anchor does not match current artifact content`);
  }
}

function validateSecFilingDiscoveryIndexArtifact(artifact, file) {
  ["as_of", "source", "index_scope", "manifest_path", "manifest_metadata_path", "profile_path", "scan_path"].forEach((field) =>
    requireString(artifact[field], `${file} ${field}`),
  );
  [
    ["manifest_path", "manifest_sha256"],
    ["manifest_metadata_path", "manifest_metadata_sha256"],
    ["profile_path", "profile_sha256"],
    ["scan_path", "scan_sha256"],
  ].forEach(([pathField, hashField]) => {
    const targetPath = artifact[pathField];
    if (!existsSync(targetPath)) {
      throw new Error(`${file} ${pathField} does not exist: ${targetPath}`);
    }
    requireString(artifact[hashField], `${file} ${hashField}`);
    const actualHash = sha256(readFileSync(targetPath, "utf8"));
    if (artifact[hashField] !== actualHash) {
      throw new Error(`${file} ${hashField} does not match ${targetPath}`);
    }
  });
}

function validateSecRegistrationTransactionCandidateArtifact(artifact, file) {
  requireIsoTimestamp(artifact.generated_at, `${file} generated_at`);
  [
    "as_of",
    "retrieved_at",
    "source_published_at",
    "coverage_start",
    "coverage_end",
    "input_source",
  ].forEach((field) => {
    requireString(artifact[field], `${file} ${field}`);
    if (field !== "input_source") {
      parseDate(artifact[field], `${file} ${field}`);
    }
  });
  if (artifact.source !== "sec_registration_transaction_candidates") {
    throw new Error(`${file} source must be sec_registration_transaction_candidates`);
  }
  if (artifact.coverage_start > artifact.coverage_end) {
    throw new Error(`${file} coverage_start must be on or before coverage_end`);
  }
  requireBoolean(artifact.strict_date_coverage, `${file} strict_date_coverage`);
  requireStringArray(artifact.target_filing_families, `${file} target_filing_families`);
  requireStringArray(artifact.covered_dates, `${file} covered_dates`);
  requireStringArray(artifact.missing_or_unscanned_dates, `${file} missing_or_unscanned_dates`);
  requireStringArray(artifact.caveats, `${file} caveats`);
  validateRegistrationCandidateDates(artifact.covered_dates, artifact, `${file} covered_dates`);
  validateRegistrationCandidateDates(artifact.missing_or_unscanned_dates, artifact, `${file} missing_or_unscanned_dates`);
  requireNonNegativeInteger(artifact.source_row_count, `${file} source_row_count`);
  requireNonNegativeInteger(artifact.provisional_candidate_count, `${file} provisional_candidate_count`);
  if (!Array.isArray(artifact.daily_indices) || artifact.daily_indices.length === 0) {
    throw new Error(`${file} daily_indices must contain at least one entry`);
  }
  if (!Array.isArray(artifact.provisional_candidates)) {
    throw new Error(`${file} provisional_candidates must be an array`);
  }
  if (artifact.provisional_candidate_count !== artifact.provisional_candidates.length) {
    throw new Error(`${file} provisional_candidate_count must match provisional_candidates length`);
  }
  validateRegistrationCandidateArtifactDailyIndexScope(artifact, file);
  validateRegistrationCandidateCoverageScope(artifact, file);
  artifact.provisional_candidates.forEach((candidate, index) =>
    validateRegistrationTransactionCandidate(candidate, artifact, `${file} provisional_candidates[${index}]`),
  );
}

function validateRegistrationCandidateArtifactDailyIndexScope(artifact, file) {
  artifact.daily_indices.forEach((entry, index) => {
    const context = `${file} daily_indices[${index}]`;
    requireString(entry?.as_of, `${context} as_of`);
    parseDate(entry.as_of, `${context} as_of`);
    requireString(entry?.input_source, `${context} input_source`);
    requireSha256String(entry?.sha256, `${context} sha256`);
    requireNonNegativeInteger(entry?.row_count, `${context} row_count`);
    if (typeof entry.path !== "string") {
      throw new Error(`${context} path must be a string`);
    }
    if (entry.path.includes("/")) {
      throw new Error(`${context} path must be a basename, not a local path`);
    }
    if (typeof entry.url !== "string") {
      throw new Error(`${context} url must be a string`);
    }
  });
  if (artifact.daily_indices.length === 1) {
    requireSha256String(artifact.daily_index_sha256, `${file} daily_index_sha256`);
    if (artifact.daily_index_sha256 !== artifact.daily_indices[0].sha256) {
      throw new Error(`${file} daily_index_sha256 must match daily_indices[0].sha256`);
    }
    return;
  }
  if (typeof artifact.daily_index_sha256 !== "string" || artifact.daily_index_sha256 !== "") {
    throw new Error(`${file} daily_index_sha256 must be empty for range artifacts`);
  }
}

function validateRegistrationCandidateCoverageScope(artifact, file) {
  const expectedDates = datesBetween(artifact.coverage_start, artifact.coverage_end);
  const coveredDates = sortedUniqueDates(artifact.covered_dates, `${file} covered_dates`);
  const missingDates = sortedUniqueDates(artifact.missing_or_unscanned_dates, `${file} missing_or_unscanned_dates`);
  const dailyIndexDates = sortedUniqueDates(
    artifact.daily_indices.map((entry) => entry.as_of),
    `${file} daily_indices as_of values`,
  );
  if (JSON.stringify(coveredDates) !== JSON.stringify(dailyIndexDates)) {
    throw new Error(`${file} covered_dates must match daily_indices as_of values`);
  }
  const coveredDateSet = new Set(coveredDates);
  const expectedMissingDates = expectedDates.filter((date) => !coveredDateSet.has(date));
  if (JSON.stringify(missingDates) !== JSON.stringify(expectedMissingDates)) {
    throw new Error(`${file} missing_or_unscanned_dates must match coverage range minus covered_dates`);
  }
  if (artifact.strict_date_coverage && missingDates.length > 0) {
    throw new Error(`${file} strict_date_coverage cannot have missing_or_unscanned_dates`);
  }
}

function sortedUniqueDates(values, context) {
  const sorted = [...values].sort();
  if (JSON.stringify(values) !== JSON.stringify(sorted)) {
    throw new Error(`${context} must be sorted ascending`);
  }
  const unique = [...new Set(sorted)];
  if (unique.length !== sorted.length) {
    throw new Error(`${context} must not contain duplicate dates`);
  }
  return sorted;
}

function datesBetween(startDate, endDate) {
  const dates = [];
  let cursor = Date.parse(`${startDate}T00:00:00.000Z`);
  const end = Date.parse(`${endDate}T00:00:00.000Z`);
  while (cursor <= end) {
    dates.push(new Date(cursor).toISOString().slice(0, 10));
    cursor += 24 * 60 * 60 * 1000;
  }
  return dates;
}

function validateRegistrationCandidateDates(dates, artifact, context) {
  dates.forEach((date, index) => {
    parseDate(date, `${context}[${index}]`);
    if (date < artifact.coverage_start || date > artifact.coverage_end) {
      throw new Error(`${context}[${index}] must be within coverage_start and coverage_end`);
    }
  });
}

function validateRegistrationTransactionCandidate(candidate, artifact, context) {
  [
    "cik",
    "company_name",
    "filing_type",
    "filing_family",
    "filing_family_type",
    "filing_date",
    "source_published_at",
    "retrieved_at",
    "accession_or_document_id",
    "source_url",
    "candidate_status",
    "tradability_status",
    "security_metadata_dependency",
    "why_it_might_matter",
    "required_next_step",
    "policy_boundary",
  ].forEach((field) => requireString(candidate?.[field], `${context} ${field}`));
  if (!/^\d{10}$/.test(candidate.cik)) {
    throw new Error(`${context} cik must be a 10-digit SEC CIK`);
  }
  ["filing_date", "source_published_at", "retrieved_at"].forEach((field) =>
    parseDate(candidate[field], `${context} ${field}`),
  );
  if (candidate.source_published_at !== candidate.filing_date) {
    throw new Error(`${context} source_published_at must match filing_date`);
  }
  if (candidate.retrieved_at !== artifact.retrieved_at) {
    throw new Error(`${context} retrieved_at must match artifact retrieved_at`);
  }
  requireAllowed(candidate.filing_family_type, new Set(["registration", "transaction", "other"]), `${context} filing_family_type`);
  requireAllowed(candidate.candidate_status, new Set(["pre_listing_or_transaction_candidate"]), `${context} candidate_status`);
  requireAllowed(
    candidate.tradability_status,
    new Set(["not_tradable_until_security_metadata_confirms_policy_eligible_listing"]),
    `${context} tradability_status`,
  );
  requireAllowed(
    candidate.security_metadata_dependency,
    new Set(["requires_exchange_ticker_confirmation"]),
    `${context} security_metadata_dependency`,
  );
  if (!candidate.source_url.startsWith("https://www.sec.gov/Archives/")) {
    throw new Error(`${context} source_url must point to SEC Archives`);
  }
}

function validateSemanticIssuerPacketsArtifact(artifact, file) {
  requireIsoTimestamp(artifact.generated_at, `${file} generated_at`);
  parseDate(artifact.as_of, `${file} as_of`);
  if (artifact.packet_schema_version !== 1) {
    throw new Error(`${file} packet_schema_version must be 1`);
  }
  ["sec_input_source", "sec_input_sha256", "lane_map_path", "lane_map_sha256"].forEach((field) =>
    requireString(artifact[field], `${file} ${field}`),
  );
  requirePositiveNumber(artifact.sec_input_row_count, `${file} sec_input_row_count`);
  requirePositiveNumber(artifact.eligible_universe_count, `${file} eligible_universe_count`);
  requireNonNegativeInteger(artifact.selected_symbol_count, `${file} selected_symbol_count`);
  requireNonNegativeInteger(artifact.packet_count, `${file} packet_count`);
  requireSha256String(artifact.sec_input_sha256, `${file} sec_input_sha256`);
  requireSha256String(artifact.lane_map_sha256, `${file} lane_map_sha256`);
  if (existsSync(artifact.lane_map_path) && artifact.lane_map_sha256 !== sha256(readFileSync(artifact.lane_map_path, "utf8"))) {
    throw new Error(`${file} lane_map_sha256 does not match ${artifact.lane_map_path}`);
  }
  requireStringArray(artifact.cache_invalidation_policy ?? [], `${file} cache_invalidation_policy`);
  requireStringArray(artifact.lane_map_lane_ids ?? [], `${file} lane_map_lane_ids`);
  if (!Array.isArray(artifact.packets)) {
    throw new Error(`${file} packets must be an array`);
  }
  if (artifact.packet_count !== artifact.packets.length) {
    throw new Error(`${file} packet_count must match packets length`);
  }
  artifact.packets.forEach((packet, index) =>
    validateSemanticIssuerPacket(packet, artifact, `${file} packets[${index}]`),
  );
}

function validateSemanticIssuerPacket(packet, artifact, context) {
  [
    "symbol",
    "cik",
    "name",
    "exchange",
    "identity_hash",
    "issuer_packet_hash",
    "lane_map_sha256",
  ].forEach((field) => requireString(packet?.[field], `${context} ${field}`));
  if (!/^[A-Z0-9.\-]+$/.test(packet.symbol)) {
    throw new Error(`${context} symbol must be normalized uppercase ticker text`);
  }
  if (!/^\d{10}$/.test(packet.cik)) {
    throw new Error(`${context} cik must be a 10-digit SEC CIK`);
  }
  requireSha256String(packet.identity_hash, `${context} identity_hash`);
  requireSha256String(packet.issuer_packet_hash, `${context} issuer_packet_hash`);
  requireSha256String(packet.lane_map_sha256, `${context} lane_map_sha256`);
  if (packet.lane_map_sha256 !== artifact.lane_map_sha256) {
    throw new Error(`${context} lane_map_sha256 must match packet artifact`);
  }
  if (!Array.isArray(packet.source_blocks) || packet.source_blocks.length === 0) {
    throw new Error(`${context} source_blocks must contain at least one block`);
  }
  packet.source_blocks.forEach((block, index) => {
    const blockContext = `${context} source_blocks[${index}]`;
    ["block_id", "source_name", "source_published_at", "retrieved_at", "text", "text_sha256"].forEach((field) => {
      if (field === "retrieved_at" && block?.[field] === "") {
        return;
      }
      requireString(block?.[field], `${blockContext} ${field}`);
    });
    requireSha256String(block.text_sha256, `${blockContext} text_sha256`);
    if (stableSha256(block.text) !== block.text_sha256) {
      throw new Error(`${blockContext} text_sha256 does not match text`);
    }
  });
  requireStringArray(packet.invalidation_triggers ?? [], `${context} invalidation_triggers`);
  const packetBase = { ...packet };
  delete packetBase.issuer_packet_hash;
  delete packetBase.invalidation_triggers;
  if (stableSha256(packetBase) !== packet.issuer_packet_hash) {
    throw new Error(`${context} issuer_packet_hash does not match stable packet content`);
  }
}

function validateSemanticBatchManifestArtifact(artifact, file) {
  requireIsoTimestamp(artifact.generated_at, `${file} generated_at`);
  parseDate(artifact.as_of, `${file} as_of`);
  requireAllowed(artifact.reasoning_level, allowedSemanticReasoningLevels, `${file} reasoning_level`);
  if (artifact.classification_schema_version !== 1) {
    throw new Error(`${file} classification_schema_version must be 1`);
  }
  ["packet_artifact_path", "packet_artifact_sha256"].forEach((field) => requireString(artifact[field], `${file} ${field}`));
  requireSha256String(artifact.packet_artifact_sha256, `${file} packet_artifact_sha256`);
  if (existsSync(artifact.packet_artifact_path) && artifact.packet_artifact_sha256 !== sha256(readFileSync(artifact.packet_artifact_path, "utf8"))) {
    throw new Error(`${file} packet_artifact_sha256 does not match ${artifact.packet_artifact_path}`);
  }
  ["packet_count", "selected_packet_count", "skipped_current_cache_count", "stale_cache_count", "batch_size", "batch_count"].forEach((field) =>
    requireNonNegativeInteger(artifact[field], `${file} ${field}`),
  );
  if (!Array.isArray(artifact.batches)) {
    throw new Error(`${file} batches must be an array`);
  }
  if (artifact.batch_count !== artifact.batches.length) {
    throw new Error(`${file} batch_count must match batches length`);
  }
  artifact.batches.forEach((batch, index) => {
    const context = `${file} batches[${index}]`;
    ["batch_id", "batch_path", "batch_sha256", "prompt_path", "prompt_sha256"].forEach((field) =>
      requireString(batch?.[field], `${context} ${field}`),
    );
    requireSha256String(batch.batch_sha256, `${context} batch_sha256`);
    requireSha256String(batch.prompt_sha256, `${context} prompt_sha256`);
    requireStringArray(batch.symbols ?? [], `${context} symbols`);
    if (existsSync(batch.batch_path) && batch.batch_sha256 !== sha256(readFileSync(batch.batch_path, "utf8"))) {
      throw new Error(`${context} batch_sha256 does not match ${batch.batch_path}`);
    }
    if (existsSync(batch.prompt_path) && batch.prompt_sha256 !== sha256(readFileSync(batch.prompt_path, "utf8"))) {
      throw new Error(`${context} prompt_sha256 does not match ${batch.prompt_path}`);
    }
  });
}

function validateSemanticClassificationImportArtifact(artifact, file) {
  requireIsoTimestamp(artifact.generated_at, `${file} generated_at`);
  parseDate(artifact.as_of, `${file} as_of`);
  [
    "packet_artifact_path",
    "packet_artifact_sha256",
    "result_path",
    "result_sha256",
    "cache_output_path",
    "classifier_version",
  ].forEach((field) => requireString(artifact[field], `${file} ${field}`));
  ["packet_artifact_sha256", "result_sha256"].forEach((field) => requireSha256String(artifact[field], `${file} ${field}`));
  ["imported_count", "cache_record_count", "current_cache_count", "stale_cache_count"].forEach((field) =>
    requireNonNegativeInteger(artifact[field], `${file} ${field}`),
  );
  if (existsSync(artifact.packet_artifact_path) && artifact.packet_artifact_sha256 !== sha256(readFileSync(artifact.packet_artifact_path, "utf8"))) {
    throw new Error(`${file} packet_artifact_sha256 does not match ${artifact.packet_artifact_path}`);
  }
  if (existsSync(artifact.result_path) && artifact.result_sha256 !== sha256(readFileSync(artifact.result_path, "utf8"))) {
    throw new Error(`${file} result_sha256 does not match ${artifact.result_path}`);
  }
}

function validateSemanticDiscoveryRunArtifact(artifact, file) {
  requireIsoTimestamp(artifact.generated_at, `${file} generated_at`);
  parseDate(artifact.as_of, `${file} as_of`);
  [
    "packet_artifact_path",
    "packet_artifact_sha256",
    "cache_path",
    "cache_sha256",
    "classifier_version",
  ].forEach((field) => requireString(artifact[field], `${file} ${field}`));
  requireSha256String(artifact.packet_artifact_sha256, `${file} packet_artifact_sha256`);
  requireSha256String(artifact.cache_sha256, `${file} cache_sha256`);
  [
    "packet_count",
    "classified_current_count",
    "unclassified_count",
    "stale_cache_count",
  ].forEach((field) => requireNonNegativeInteger(artifact[field], `${file} ${field}`));
  requireNumber(artifact.classification_coverage_ratio, `${file} classification_coverage_ratio`);
  if (artifact.classification_coverage_ratio < 0 || artifact.classification_coverage_ratio > 1) {
    throw new Error(`${file} classification_coverage_ratio must be between 0 and 1`);
  }
  [
    "medium_lane_compare",
    "xhigh_readiness_candidates",
    "reject_or_archive",
    "no_escalation_sample",
  ].forEach((field) => {
    if (!Array.isArray(artifact[field])) {
      throw new Error(`${file} ${field} must be an array`);
    }
    artifact[field].forEach((record, index) =>
      validateSemanticCompactRecord(record, `${file} ${field}[${index}]`),
    );
  });
  requireStringArray(artifact.unclassified_symbols ?? [], `${file} unclassified_symbols`);
  requireStringArray(artifact.required_next_steps ?? [], `${file} required_next_steps`);
  requireStringArray(artifact.caveats ?? [], `${file} caveats`);
  if (existsSync(artifact.packet_artifact_path) && artifact.packet_artifact_sha256 !== sha256(readFileSync(artifact.packet_artifact_path, "utf8"))) {
    throw new Error(`${file} packet_artifact_sha256 does not match ${artifact.packet_artifact_path}`);
  }
  if (existsSync(artifact.cache_path) && artifact.cache_sha256 !== sha256(readFileSync(artifact.cache_path, "utf8"))) {
    throw new Error(`${file} cache_sha256 does not match ${artifact.cache_path}`);
  }
}

function validateSemanticReviewPacketArtifact(artifact, file) {
  requireIsoTimestamp(artifact.generated_at, `${file} generated_at`);
  parseDate(artifact.as_of, `${file} as_of`);
  [
    "semantic_run_path",
    "semantic_run_sha256",
    "semantic_cache_path",
    "semantic_cache_sha256",
    "packet_artifact_path",
    "packet_artifact_sha256",
  ].forEach((field) => requireString(artifact[field], `${file} ${field}`));
  [
    "semantic_run_sha256",
    "semantic_cache_sha256",
    "packet_artifact_sha256",
  ].forEach((field) => requireSha256String(artifact[field], `${file} ${field}`));
  if (!existsSync(artifact.semantic_run_path)) {
    throw new Error(`${file} semantic_run_path does not exist: ${artifact.semantic_run_path}`);
  }
  if (artifact.semantic_run_sha256 !== sha256(readFileSync(artifact.semantic_run_path, "utf8"))) {
    throw new Error(`${file} semantic_run_sha256 does not match ${artifact.semantic_run_path}`);
  }
  const semanticRun = JSON.parse(readFileSync(artifact.semantic_run_path, "utf8"));
  if (semanticRun.source !== "semantic_discovery_run") {
    throw new Error(`${file} semantic_run_path must point to a semantic_discovery_run artifact`);
  }
  if (semanticRun.as_of !== artifact.as_of) {
    throw new Error(`${file} semantic run as_of must match review packet as_of`);
  }
  if (artifact.semantic_cache_path !== semanticRun.cache_path || artifact.semantic_cache_sha256 !== semanticRun.cache_sha256) {
    throw new Error(`${file} semantic cache path/hash must match semantic run`);
  }
  if (artifact.packet_artifact_path !== semanticRun.packet_artifact_path || artifact.packet_artifact_sha256 !== semanticRun.packet_artifact_sha256) {
    throw new Error(`${file} packet artifact path/hash must match semantic run`);
  }
  const summary = artifact.summary ?? {};
  [
    "packet_count",
    "classified_current_count",
    "unclassified_count",
    "stale_cache_count",
  ].forEach((field) => {
    requireNonNegativeInteger(summary[field], `${file} summary.${field}`);
    if (summary[field] !== semanticRun[field]) {
      throw new Error(`${file} summary.${field} must match semantic run ${field}`);
    }
  });
  requireNumber(summary.classification_coverage_ratio, `${file} summary.classification_coverage_ratio`);
  if (summary.classification_coverage_ratio !== semanticRun.classification_coverage_ratio) {
    throw new Error(`${file} summary.classification_coverage_ratio must match semantic run`);
  }
  requireString(summary.classifier_version, `${file} summary.classifier_version`);
  if (summary.classifier_version !== semanticRun.classifier_version) {
    throw new Error(`${file} summary.classifier_version must match semantic run`);
  }
  [
    ["xhigh_readiness_candidates", semanticRun.xhigh_readiness_candidates],
    ["medium_lane_compare", semanticRun.medium_lane_compare],
    ["reject_or_archive", semanticRun.reject_or_archive],
    ["none_sample", semanticRun.no_escalation_sample],
  ].forEach(([field, expected]) => {
    if (!Array.isArray(artifact[field])) {
      throw new Error(`${file} ${field} must be an array`);
    }
    if (artifact[field].length !== (expected ?? []).length) {
      throw new Error(`${file} ${field} length must match semantic run`);
    }
  });
  requireNonEmptyStringArray(artifact.review_questions ?? [], `${file} review_questions`);
}

function validateSemanticCompactRecord(record, context) {
  ["symbol", "name", "business_plain_english", "notes"].forEach((field) =>
    requireString(record?.[field], `${context} ${field}`),
  );
  requireAllowed(record.bottleneck_exposure, allowedSemanticBottleneckExposure, `${context} bottleneck_exposure`);
  requireAllowed(record.directness, allowedSemanticDirectness, `${context} directness`);
  requireAllowed(record.company_stage, allowedSemanticCompanyStage, `${context} company_stage`);
  requireAllowed(record.extreme_upside_fit, allowedSemanticExtremeUpsideFit, `${context} extreme_upside_fit`);
  requireAllowed(record.confidence, allowedSemanticConfidence, `${context} confidence`);
  requireStringArray(record.matched_lane_ids ?? [], `${context} matched_lane_ids`);
}

function validateDiscoveryScanOutput(output, context, {
  requireBroadFreshness,
}) {
  if (output.schema_version !== 1) {
    throw new Error(`${context} schema_version must be 1`);
  }
  requireString(output.as_of, `${context} as_of`);
  parseDate(output.as_of, `${context} as_of`);
  requireIsoTimestamp(output.generated_at, `${context} generated_at`);
  requireAllowed(output.discovery_scope, new Set([defaultDiscoveryScope, "active_only"]), `${context} discovery_scope`);
  requireString(output.source_url, `${context} source_url`);
  requireString(output.sec_input_source, `${context} sec_input_source`);
  requireIsoTimestamp(output.sec_input_fetched_at, `${context} sec_input_fetched_at`);
  requirePositiveNumber(output.sec_input_row_count, `${context} sec_input_row_count`);
  requirePositiveNumber(output.sec_input_eligible_universe_count, `${context} sec_input_eligible_universe_count`);
  requireSha256String(output.sec_input_sha256, `${context} sec_input_sha256`);
  requireString(output.lane_map_path, `${context} lane_map_path`);
  requireString(output.lane_map_as_of, `${context} lane_map_as_of`);
  requireSha256String(output.lane_map_sha256, `${context} lane_map_sha256`);
  [
    "profile_coverage_gap_count",
    "profile_coverage_ratio",
    "issuer_profile_semantic_gap_count",
    "issuer_profile_semantic_coverage_ratio",
    "recall_expected_lane_miss_count",
    "recall_expected_proxy_miss_count",
    "recall_organic_expected_proxy_count",
    "recall_organic_expected_proxy_miss_count",
    "recall_ticker_only_expected_proxy_count",
  ].forEach((field) => requireNumber(output[field], `${context} ${field}`));
  requireString(output.profile_coverage_status, `${context} profile_coverage_status`);
  requireString(output.issuer_profile_coverage_status, `${context} issuer_profile_coverage_status`);
  if (typeof output.profile_input_path === "string" && output.profile_input_path !== "") {
    requireSha256String(output.profile_input_sha256, `${context} profile_input_sha256`);
    if (existsSync(output.profile_input_path) && output.profile_input_sha256 !== sha256(readFileSync(output.profile_input_path, "utf8"))) {
      throw new Error(`${context} profile_input_sha256 does not match ${output.profile_input_path}`);
    }
  }
  requireString(output.recall_organic_expected_proxy_status, `${context} recall_organic_expected_proxy_status`);
  requireStringArray(output.recall_ticker_only_expected_proxy_symbols ?? [], `${context} recall_ticker_only_expected_proxy_symbols`);
  validateDiscoveryScanSemanticCoverage(output, context);
  validateDiscoveryScanRecallMetrics(output, context);
  if (!existsSync(output.lane_map_path)) {
    throw new Error(`${context} lane_map_path does not exist: ${output.lane_map_path}`);
  }
  const currentLaneMapHash = sha256(readFileSync(output.lane_map_path, "utf8"));
  if (output.lane_map_sha256 !== currentLaneMapHash) {
    throw new Error(`${context} lane_map_sha256 does not match ${output.lane_map_path}`);
  }
  requirePositiveNumber(output.deterministic_limit, `${context} deterministic_limit`);
  requireNumber(output.candidate_count, `${context} candidate_count`);
  requireNumber(output.returned_candidate_count, `${context} returned_candidate_count`);
  requireNumber(output.total_match_count, `${context} total_match_count`);
  requireNumber(output.omitted_candidate_count, `${context} omitted_candidate_count`);
  requireBoolean(output.truncated, `${context} truncated`);
  [
    "candidates",
    "omitted_candidates",
    "suppressed_known_matches",
    "exploratory_matches",
    "recall_diagnostics",
    "lanes_scanned",
  ].forEach((field) => {
    if (!Array.isArray(output[field])) {
      throw new Error(`${context} ${field} must be an array`);
    }
  });
  if (output.omitted_candidate_count !== output.omitted_candidates.length) {
    throw new Error(`${context} omitted_candidate_count must match omitted_candidates length`);
  }
  if (output.candidate_count !== output.candidates.length) {
    throw new Error(`${context} candidate_count must match candidates length`);
  }
  if (requireBroadFreshness) {
    if (output.profile_purpose === "issuer_universe_discovery") {
      throw new Error(`${context} issuer profile scan cannot use non-profile broad freshness validation`);
    }
    if (output.discovery_scope !== defaultDiscoveryScope) {
      throw new Error(`${context} broad universe freshness requires discovery_scope ${defaultDiscoveryScope}`);
    }
    if (output.input_path !== "") {
      throw new Error(`${context} broad universe freshness requires the default SEC universe input`);
    }
    if (output.source_url !== secCompanyTickersExchangeUrl || output.sec_input_source !== secCompanyTickersExchangeUrl) {
      throw new Error(`${context} broad universe freshness requires SEC company_tickers_exchange source`);
    }
    if (output.truncated) {
      throw new Error(`${context} broad universe freshness requires a non-truncated deterministic scan artifact`);
    }
    if (output.recall_expected_proxy_miss_count > 0) {
      throw new Error(`${context} broad universe freshness has known public proxy recall misses`);
    }
  }
}

function validateDiscoveryScanSemanticCoverage(output, context) {
  const profilePurpose = output.profile_purpose ?? "";
  if (profilePurpose === "") {
    if (output.issuer_profile_coverage_status !== noProfileSemanticCoverageStatus) {
      throw new Error(`${context} issuer_profile_coverage_status must be ${noProfileSemanticCoverageStatus} when profile_input_path is absent`);
    }
    if (output.issuer_profile_semantic_gap_count !== output.sec_input_eligible_universe_count) {
      throw new Error(`${context} issuer_profile_semantic_gap_count must equal sec_input_eligible_universe_count when no issuer profiles are supplied`);
    }
    if (output.issuer_profile_semantic_coverage_ratio !== 0) {
      throw new Error(`${context} issuer_profile_semantic_coverage_ratio must be 0 when no issuer profiles are supplied`);
    }
    return;
  }
  if (profilePurpose === "issuer_universe_discovery") {
    if (
      output.profile_coverage_status === "complete" &&
      output.issuer_profile_coverage_status === "complete_scope_with_profile_skips"
    ) {
      if (output.profile_coverage_gap_count !== 0) {
        throw new Error(`${context} complete profile coverage with skips must have zero audited coverage gap`);
      }
      if (output.issuer_profile_semantic_gap_count !== output.profile_skipped_symbol_count) {
        throw new Error(`${context} issuer_profile_semantic_gap_count must match profile_skipped_symbol_count for complete profile coverage with skips`);
      }
      return;
    }
    if (output.issuer_profile_coverage_status !== output.profile_coverage_status) {
      throw new Error(`${context} issuer_profile_coverage_status must match profile_coverage_status for issuer profile scans`);
    }
    if (output.issuer_profile_semantic_gap_count !== output.profile_coverage_gap_count) {
      throw new Error(`${context} issuer_profile_semantic_gap_count must match profile_coverage_gap_count for issuer profile scans`);
    }
    if (output.issuer_profile_semantic_coverage_ratio !== output.profile_coverage_ratio) {
      throw new Error(`${context} issuer_profile_semantic_coverage_ratio must match profile_coverage_ratio for issuer profile scans`);
    }
  }
}

function validateDiscoveryScanRecallMetrics(output, context) {
  const inScopeDiagnostics = output.recall_diagnostics.filter((diagnostic) =>
    diagnostic.recall_scope === "sec_listed_public_proxy",
  );
  const organicMissCount = inScopeDiagnostics.filter((diagnostic) =>
    diagnostic.organic_matched_any_expected_lane !== true,
  ).length;
  const organicCount = inScopeDiagnostics.length - organicMissCount;
  const tickerOnlySymbols = inScopeDiagnostics
    .filter((diagnostic) =>
      diagnostic.status === "matched_expected_lane"
      && diagnostic.organic_matched_any_expected_lane !== true,
    )
    .map((diagnostic) => diagnostic.symbol)
    .sort();
  if (output.recall_organic_expected_proxy_count !== organicCount) {
    throw new Error(`${context} recall_organic_expected_proxy_count must match recall_diagnostics`);
  }
  if (output.recall_organic_expected_proxy_miss_count !== organicMissCount) {
    throw new Error(`${context} recall_organic_expected_proxy_miss_count must match recall_diagnostics`);
  }
  requireMatchingStringArray(
    output.recall_ticker_only_expected_proxy_symbols ?? [],
    tickerOnlySymbols,
    `${context} recall_ticker_only_expected_proxy_symbols`,
  );
  const expectedStatus = recallOrganicStatus({
    inScopeCount: inScopeDiagnostics.length,
    organicRecallMissCount: organicMissCount,
    tickerOnlyExpectedProxyCount: tickerOnlySymbols.length,
  });
  if (output.recall_organic_expected_proxy_status !== expectedStatus) {
    throw new Error(`${context} recall_organic_expected_proxy_status must match recall_diagnostics`);
  }
}

function recallOrganicStatus({
  inScopeCount,
  organicRecallMissCount,
  tickerOnlyExpectedProxyCount,
}) {
  if (inScopeCount === 0) {
    return "not_applicable_no_expected_public_proxies";
  }
  if (organicRecallMissCount === 0) {
    return "organic_recall_complete";
  }
  if (tickerOnlyExpectedProxyCount === inScopeCount) {
    return "insufficient_all_expected_proxies_ticker_only";
  }
  return "partial_organic_recall_gap";
}

function expectedBroadUniverseScanBinding() {
  const qualityMetrics = parsedYamlFiles.get(qualityMetricsFile);
  const expectedAsOf = qualityMetrics?.coverage?.universe_scan_as_of;
  const agenticPath = qualityMetrics?.discovery_process?.latest_agentic_discovery_path;
  requireString(expectedAsOf, `${qualityMetricsFile} coverage.universe_scan_as_of`);
  requireString(agenticPath, `${qualityMetricsFile} discovery_process.latest_agentic_discovery_path`);
  const agenticRun = parseYaml(readFileSync(agenticPath, "utf8"));
  const commands = agenticRun?.source_coverage?.deterministic_commands ?? [];
  for (const command of commands) {
    const output = loadDeterministicCommandJsonOutput(command);
    if (output === undefined || output.parsed.profile_purpose === "issuer_universe_discovery") {
      continue;
    }
    if (output.parsed.as_of !== expectedAsOf) {
      continue;
    }
    validateDiscoveryScanOutput(output.parsed, `${agenticPath} broad universe SEC binding`, {
      requireBroadFreshness: true,
    });
    return {
      laneMapSha256: output.parsed.lane_map_sha256,
      secInputEligibleUniverseCount: output.parsed.sec_input_eligible_universe_count,
      secInputRowCount: output.parsed.sec_input_row_count,
      secInputSha256: output.parsed.sec_input_sha256,
    };
  }
  throw new Error(`${qualityMetricsFile} has no non-profile broad deterministic scan output to bind complete issuer-profile evidence`);
}

function validateDeterministicCommandOutput(command, context) {
  const loaded = loadDeterministicCommandJsonOutput(command);
  if (loaded === undefined) {
    return;
  }
  const output = loaded.parsed;
  requireString(command.output_sha256, `${context} output_sha256`);
  if (command.output_sha256 !== loaded.sha256) {
    throw new Error(`${context} output_sha256 does not match ${command.output_path}`);
  }
  if (typeof output.as_of === "string") {
    parseDate(output.as_of, `${context} output as_of`);
  }
  if (output.profile_purpose !== "issuer_universe_discovery") {
    validateDiscoveryScanOutput(output, context, {
      requireBroadFreshness: false,
    });
    return;
  }
  validateDiscoveryScanOutput(output, context, {
    requireBroadFreshness: false,
  });
  requireString(command.profile_coverage_scope, `${context} profile_coverage_scope`);
  requireString(command.profile_coverage_status, `${context} profile_coverage_status`);
  requireStringArray(command.profile_requested_symbols, `${context} profile_requested_symbols`);
  requireString(output.profile_coverage_status, `${context} output profile_coverage_status`);
  requireString(output.profile_coverage_scope, `${context} output profile_coverage_scope`);
  requireNumber(output.profile_coverage_gap_count, `${context} output profile_coverage_gap_count`);
  requireNumber(output.profile_coverage_ratio, `${context} output profile_coverage_ratio`);
  requireNumber(output.profile_selected_symbol_count, `${context} output profile_selected_symbol_count`);
  requireNumber(output.profile_eligible_universe_count, `${context} output profile_eligible_universe_count`);
  requireNumber(output.profile_symbol_count, `${context} output profile_symbol_count`);
  requireNumber(output.sec_input_eligible_universe_count, `${context} output sec_input_eligible_universe_count`);
  if (output.profile_eligible_universe_count !== output.sec_input_eligible_universe_count) {
    throw new Error(`${context} output profile_eligible_universe_count must match current SEC input eligible universe count`);
  }
  if (command.profile_coverage_scope !== output.profile_coverage_scope) {
    throw new Error(`${context} profile_coverage_scope must match deterministic output`);
  }
  if (command.profile_coverage_status !== output.profile_coverage_status) {
    throw new Error(`${context} profile_coverage_status must match deterministic output`);
  }
  const outputRequestedSymbols = stringArrayOrEmpty(output.profile_requested_symbols);
  if (normalizedJoin(command.profile_requested_symbols) !== normalizedJoin(outputRequestedSymbols)) {
    throw new Error(`${context} profile_requested_symbols must match deterministic output`);
  }
  if (output.profile_coverage_status === "complete") {
    validateCompleteIssuerProfileOutput(output, context);
    return;
  }
  requireBoolean(command.targeted_scope_acknowledged, `${context} targeted_scope_acknowledged`);
  if (command.targeted_scope_acknowledged !== true) {
    throw new Error(`${context} uses partial issuer-universe profile coverage without targeted_scope_acknowledged`);
  }
  requireString(command.targeted_scope_reason, `${context} targeted_scope_reason`);
  if (output.profile_coverage_scope === "complete_sec_universe") {
    throw new Error(`${context} non-complete issuer profile output must not claim complete_sec_universe coverage_scope`);
  }
}

function validateCompleteIssuerProfileOutput(output, context) {
  const binding = expectedBroadUniverseScanBinding();
  if (
    output.profile_coverage_scope !== "complete_sec_universe"
    || output.profile_coverage_gap_count !== 0
    || output.profile_coverage_ratio !== 1
    || output.profile_selected_symbol_count !== output.profile_eligible_universe_count
    || output.profile_symbol_count !== output.profile_eligible_universe_count
    || output.profile_eligible_universe_count !== output.sec_input_eligible_universe_count
  ) {
    throw new Error(`${context} complete issuer-universe profile coverage must have zero gap, full ratio, and matching selected/profile/eligible counts`);
  }
  if (
    output.sec_input_sha256 !== binding.secInputSha256
    || output.sec_input_row_count !== binding.secInputRowCount
    || output.sec_input_eligible_universe_count !== binding.secInputEligibleUniverseCount
  ) {
    throw new Error(`${context} complete issuer-universe profile coverage does not match broad universe SEC input binding`);
  }
  if (output.lane_map_sha256 !== binding.laneMapSha256) {
    throw new Error(`${context} complete issuer-universe profile coverage does not match current broad universe lane-map binding`);
  }
}

function supportsBroadUniverseFreshness(output) {
  if (output.profile_purpose !== "issuer_universe_discovery") {
    validateDiscoveryScanOutput(output, "broad universe freshness output", {
      requireBroadFreshness: true,
    });
    return true;
  }
  const complete = (
    output.profile_coverage_status === "complete" &&
    output.profile_coverage_scope === "complete_sec_universe" &&
    output.profile_coverage_gap_count === 0 &&
    output.profile_coverage_ratio === 1 &&
    output.profile_selected_symbol_count === output.profile_eligible_universe_count &&
    output.profile_symbol_count === output.profile_eligible_universe_count &&
    output.profile_eligible_universe_count === output.sec_input_eligible_universe_count
  );
  if (complete) {
    validateCompleteIssuerProfileOutput(output, "broad universe freshness issuer-profile output");
  }
  return complete;
}

function validateEvidencePacketDeterministicOutputs(file, parsed) {
  const expectedAsOf = parsed.quality_metrics?.coverage?.universe_scan_as_of;
  requireString(expectedAsOf, `${file} quality_metrics.coverage.universe_scan_as_of`);
  let sawMatchingBroadAsOf = false;
  parsed.deterministic_outputs.forEach((entry, index) => {
    const context = `${file} deterministic_outputs[${index}]`;
    const outputPath = entry?.output_path;
    if (typeof outputPath !== "string" || outputPath === "" || !outputPath.endsWith(".json")) {
      return;
    }
    if (!existsSync(outputPath)) {
      throw new Error(`${context} output_path does not exist: ${outputPath}`);
    }
    requireString(entry.output_sha256, `${context} output_sha256`);
    const content = readFileSync(outputPath, "utf8");
    if (entry.output_sha256 !== sha256(content)) {
      throw new Error(`${context} output_sha256 does not match ${outputPath}`);
    }
    const output = JSON.parse(content);
    if ("candidate_count" in output) {
      validateDiscoveryScanOutput(output, context, {
        requireBroadFreshness: false,
      });
      validateEvidencePacketScanPayloadSummary(entry, output, context);
    }
    if (typeof output.as_of === "string") {
      parseDate(output.as_of, `${context} output as_of`);
      if (output.as_of === expectedAsOf && supportsBroadUniverseFreshness(output)) {
        sawMatchingBroadAsOf = true;
      }
    }
    if (output.profile_purpose === "issuer_universe_discovery") {
      requireString(entry.profile_coverage_scope, `${context} profile_coverage_scope`);
      requireString(entry.profile_coverage_status, `${context} profile_coverage_status`);
      requireStringArray(entry.profile_requested_symbols, `${context} profile_requested_symbols`);
      if (entry.profile_coverage_scope !== output.profile_coverage_scope) {
        throw new Error(`${context} profile_coverage_scope must match deterministic output`);
      }
      if (entry.profile_coverage_status !== output.profile_coverage_status) {
        throw new Error(`${context} profile_coverage_status must match deterministic output`);
      }
      if (normalizedJoin(entry.profile_requested_symbols) !== normalizedJoin(stringArrayOrEmpty(output.profile_requested_symbols))) {
        throw new Error(`${context} profile_requested_symbols must match deterministic output`);
      }
    }
  });
  if (!sawMatchingBroadAsOf) {
    throw new Error(`${file} deterministic_outputs has no matching broad universe_scan_as_of ${expectedAsOf}`);
  }
}

function validateEvidencePacketScanPayloadSummary(entry, output, context) {
  const summary = entry.scan_payload_summary;
  if (summary === null || typeof summary !== "object" || Array.isArray(summary)) {
    throw new Error(`${context} scan_payload_summary is required for discovery scan outputs`);
  }
  [
    "returned_candidate_count",
    "omitted_candidate_count",
    "total_match_count",
    "exploratory_match_count",
    "suppressed_known_match_count",
    "recall_expected_lane_miss_count",
    "recall_expected_proxy_miss_count",
    "recall_organic_expected_proxy_count",
    "recall_organic_expected_proxy_miss_count",
    "recall_ticker_only_expected_proxy_count",
  ].forEach((field) => {
    requireNumber(summary[field], `${context} scan_payload_summary.${field}`);
    if (summary[field] !== output[field]) {
      throw new Error(`${context} scan_payload_summary.${field} must match deterministic output`);
    }
  });
  requireBoolean(summary.truncated, `${context} scan_payload_summary.truncated`);
  if (summary.truncated !== output.truncated) {
    throw new Error(`${context} scan_payload_summary.truncated must match deterministic output`);
  }
  requireString(summary.recall_organic_expected_proxy_status, `${context} scan_payload_summary.recall_organic_expected_proxy_status`);
  if (summary.recall_organic_expected_proxy_status !== output.recall_organic_expected_proxy_status) {
    throw new Error(`${context} scan_payload_summary.recall_organic_expected_proxy_status must match deterministic output`);
  }
  requireMatchingStringArray(
    summary.recall_ticker_only_expected_proxy_symbols ?? [],
    output.recall_ticker_only_expected_proxy_symbols ?? [],
    `${context} scan_payload_summary.recall_ticker_only_expected_proxy_symbols`,
  );
  [
    "candidate_counts_by_priority",
    "candidate_counts_by_lane",
    "false_positive_flag_counts",
    "exploratory_match_counts_by_lane",
  ].forEach((field) => {
    requireMatchingJson(summary[field] ?? {}, output[field] ?? {}, `${context} scan_payload_summary.${field}`);
  });
  [
    ["returned_candidates", output.candidates ?? []],
    ["omitted_candidates", output.omitted_candidates ?? []],
    ["exploratory_unknown_lane_matches", output.exploratory_matches ?? []],
    ["suppressed_known_matches", output.suppressed_known_matches ?? []],
  ].forEach(([field, expected]) => {
    validateEvidencePacketCandidateSummaries(summary[field], expected, `${context} scan_payload_summary.${field}`);
  });
  validateEvidencePacketRecallSummaries(
    summary.recall_diagnostics,
    output.recall_diagnostics ?? [],
    `${context} scan_payload_summary.recall_diagnostics`,
  );
}

function validateEvidencePacketCandidateSummaries(actual, expected, context) {
  if (!Array.isArray(actual)) {
    throw new Error(`${context} must be an array`);
  }
  if (actual.length !== expected.length) {
    throw new Error(`${context} length must match deterministic output`);
  }
  actual.forEach((candidate, index) => {
    const expectedCandidate = expected[index];
    const itemContext = `${context}[${index}]`;
    ["symbol", "name", "primary_lane_id", "deterministic_priority", "recommended_review_depth"].forEach((field) => {
      requireString(candidate?.[field], `${itemContext} ${field}`);
    });
    if (candidate.symbol !== expectedCandidate.symbol) {
      throw new Error(`${itemContext} symbol must match deterministic output`);
    }
    [
      "name",
      "exchange",
      "deterministic_priority",
      "recommended_review_depth",
      "keyword_signal",
      "security_form",
      "security_form_confidence",
      "required_next_step",
    ].forEach((field) => {
      if ((candidate[field] ?? "") !== (expectedCandidate[field] ?? "")) {
        throw new Error(`${itemContext} ${field} must match deterministic output`);
      }
    });
    if ((candidate.requires_security_type_confirmation ?? false) !== (expectedCandidate.requires_security_type_confirmation ?? false)) {
      throw new Error(`${itemContext} requires_security_type_confirmation must match deterministic output`);
    }
    if ((candidate.triage_score ?? null) !== (expectedCandidate.triage_score ?? null)) {
      throw new Error(`${itemContext} triage_score must match deterministic output`);
    }
    if ((candidate.profile_enriched ?? false) !== (expectedCandidate.profile_enriched ?? false)) {
      throw new Error(`${itemContext} profile_enriched must match deterministic output`);
    }
    if ((candidate.primary_lane_id ?? "") !== (expectedCandidate.primary_lane_id ?? expectedCandidate.lane_id ?? "")) {
      throw new Error(`${itemContext} primary_lane_id must match deterministic output`);
    }
    [
      "secondary_lane_ids",
      "matched_fields",
      "matched_keywords",
      "match_sources",
      "false_positive_flags",
      "known_sources",
    ].forEach((field) => {
      requireStringArray(candidate[field] ?? [], `${itemContext} ${field}`);
      requireMatchingStringArray(
        candidate[field] ?? [],
        expectedCandidate[field] ?? [],
        `${itemContext} ${field}`,
      );
    });
    requireMatchingJson(
      candidate.matched_keyword_fields ?? {},
      expectedCandidate.matched_keyword_fields ?? {},
      `${itemContext} matched_keyword_fields`,
    );
    requireMatchingJson(
      candidate.matched_keyword_variants ?? {},
      expectedCandidate.matched_keyword_variants ?? {},
      `${itemContext} matched_keyword_variants`,
    );
    requireMatchingJson(
      candidate.matched_profile_snippets ?? [],
      expectedCandidate.matched_profile_snippets ?? [],
      `${itemContext} matched_profile_snippets`,
    );
    ["exploratory_reason", "recheck_reason"].forEach((field) => {
      if ((candidate[field] ?? "") !== (expectedCandidate[field] ?? "")) {
        throw new Error(`${itemContext} ${field} must match deterministic output`);
      }
    });
  });
}

function validateEvidencePacketRecallSummaries(actual, expected, context) {
  if (!Array.isArray(actual)) {
    throw new Error(`${context} must be an array`);
  }
  if (actual.length !== expected.length) {
    throw new Error(`${context} length must match deterministic output`);
  }
  actual.forEach((diagnostic, index) => {
    const expectedDiagnostic = expected[index];
    const itemContext = `${context}[${index}]`;
    requireString(diagnostic?.symbol, `${itemContext} symbol`);
    requireString(diagnostic?.status, `${itemContext} status`);
    if (diagnostic.symbol !== expectedDiagnostic.symbol) {
      throw new Error(`${itemContext} symbol must match deterministic output`);
    }
    [
      "expected_lane_id",
      "status",
      "recall_scope",
      "missed_reason",
      "suggested_review",
    ].forEach((field) => {
      if ((diagnostic[field] ?? "") !== (expectedDiagnostic[field] ?? "")) {
        throw new Error(`${itemContext} ${field} must match deterministic output`);
      }
    });
    [
      "matched_expected_lane_ids",
      "organic_matched_expected_lane_ids",
      "matched_lane_ids",
      "match_sources",
    ].forEach((field) => {
      requireStringArray(diagnostic[field] ?? [], `${itemContext} ${field}`);
      requireMatchingStringArray(
        diagnostic[field] ?? [],
        expectedDiagnostic[field] ?? [],
        `${itemContext} ${field}`,
      );
    });
    [
      "organic_matched_any_expected_lane",
      "ticker_only_expected_lane_recall",
    ].forEach((field) => {
      if ((diagnostic[field] ?? false) !== (expectedDiagnostic[field] ?? false)) {
        throw new Error(`${itemContext} ${field} must match deterministic output`);
      }
    });
  });
}

function requireMatchingStringArray(actual, expected, context) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${context} must match deterministic output`);
  }
}

function requireMatchingJson(actual, expected, context) {
  if (JSON.stringify(actual ?? {}) !== JSON.stringify(expected ?? {})) {
    throw new Error(`${context} must match deterministic output`);
  }
}

function loadDeterministicCommandJsonOutput(command) {
  if (
    command.output_path === undefined ||
    command.output_path === "" ||
    command.output_path === "not_saved_for_original_run" ||
    !command.output_path.endsWith(".json")
  ) {
    return undefined;
  }
  const content = readFileSync(command.output_path, "utf8");
  return {
    parsed: JSON.parse(content),
    sha256: sha256(content),
  };
}

function normalizedJoin(values) {
  return values.map((value) => value.toUpperCase()).sort().join(",");
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function stableSha256(value) {
  return sha256(JSON.stringify(sortForStableStringify(value)));
}

function sortForStableStringify(value) {
  if (Array.isArray(value)) {
    return value.map(sortForStableStringify);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, sortForStableStringify(item)]),
    );
  }
  return value;
}

function validateFirstLayerQuestions(file, questions) {
  const knownSourceIds = sourceIds();
  requiredFirstLayerQuestionKeys.forEach((key) => {
    const question = questions?.[key];
    const context = `${file} first_layer_bottleneck_questions.${key}`;
    ["facts", "inferences", "disconfirming_evidence", "investment_implication"].forEach((field) =>
      requireString(question?.[field], `${context} ${field}`),
    );
    requireNonEmptyStringArray(question?.source_ids, `${context} source_ids`);
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
  const knownSourceIds = sourceIds();
  const completedRoles = new Set();
  roles.forEach((role, index) => {
    const context = `${file} subagents.required_roles[${index}]`;
    ["role", "reasoning_level", "key_findings"].forEach((field) =>
      requireString(role?.[field], `${context} ${field}`),
    );
    requiredDiscoveryRunSubagentFields.forEach((field) => {
      if (Array.isArray(role?.[field])) {
        requireNonEmptyStringArray(role[field], `${context} ${field}`);
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
    role.sources_checked.forEach((sourceId) => {
      if (!knownSourceIds.has(sourceId)) {
        throw new Error(`${context} sources_checked references unknown source id ${sourceId}`);
      }
    });
  });

  discoveryProcess.completed_xhigh_roles.forEach((role) => {
    if (!completedRoles.has(role)) {
      throw new Error(`${qualityMetricsFile} completed_xhigh_roles includes ${role}, but ${file} does not mark it completed`);
    }
  });
  discoveryProcess.skipped_xhigh_roles.forEach((role) => {
    const matchingRole = roles.find((entry) => entry?.role === role);
    if (matchingRole === undefined || matchingRole.completed) {
      throw new Error(`${qualityMetricsFile} skipped_xhigh_roles includes ${role}, but ${file} does not mark it skipped`);
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

function currentFilingReviewSymbolSet(activeSymbols, asOfTimestamp, maxAgeDays) {
  const activeSet = new Set(activeSymbols);
  const currentSymbols = new Set();
  const latestFilingRows = new Map();
  csvRecords(freshnessFile)
    .filter((row) =>
      activeSet.has(row.symbol)
        && row.source_type === "sec_filing",
    )
    .forEach((row) => {
      const sourcePublishedAt = parseDate(row.source_published_at, `${freshnessFile} ${row.event_id} source_published_at`);
      if (sourcePublishedAt > asOfTimestamp) {
        return;
      }
      const current = latestFilingRows.get(row.symbol);
      if (current === undefined || compareSecFilingEventRows(row, current) > 0) {
        latestFilingRows.set(row.symbol, row);
      }
    });
  latestFilingRows.forEach((row) => {
    if (isReviewedLatestSecFiling(row, asOfTimestamp, maxAgeDays)) {
      currentSymbols.add(row.symbol);
    }
  });
  return currentSymbols;
}

function compareSecFilingEventRows(left, right) {
  return compareString(left.source_published_at, right.source_published_at)
    || compareString(left.event_date, right.event_date)
    || compareString(left.event_id, right.event_id);
}

function compareString(left, right) {
  if (left > right) {
    return 1;
  }
  if (left < right) {
    return -1;
  }
  return 0;
}

function isReviewedLatestSecFiling(row, asOfTimestamp, maxAgeDays) {
  if (row.status === "reviewed") {
    const reviewedAt = parseDate(row.reviewed_at, `${freshnessFile} ${row.event_id} reviewed_at`);
    if (daysBetween(reviewedAt, asOfTimestamp) > maxAgeDays) {
      return false;
    }
    return (row.review_path !== "" && existsSync(row.review_path))
      || row.immaterial_reason !== "";
  }
  if (row.status === "ignored_with_reason" && row.immaterial_reason !== "") {
    const retrievedAt = parseDate(row.retrieved_at, `${freshnessFile} ${row.event_id} retrieved_at`);
    return daysBetween(retrievedAt, asOfTimestamp) <= maxAgeDays;
  }
  return false;
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
