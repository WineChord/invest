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
  "research/discovery/candidates.csv",
  "research/freshness/events.csv",
  "research/valuation-states.csv",
  "research/watchlist.csv",
];

const yamlFiles = [
  "data/account/plan.yml",
  "data/account/state.yml",
  "research/company-analysis.yml",
  "research/discovery/lanes.yml",
  "research/quality-metrics.yml",
  "research/sources.yml",
];

const companyAnalysisFile = "research/company-analysis.yml";
const companyMetricsFile = "data/market/company_metrics.csv";
const discoveryFile = "research/discovery/candidates.csv";
const discoveryLanesFile = "research/discovery/lanes.yml";
const freshnessFile = "research/freshness/events.csv";
const priceHistoryFile = "data/market/price_history.csv";
const qualityMetricsFile = "research/quality-metrics.yml";
const securityMasterFile = "data/market/security_master.csv";
const sourcesFile = "research/sources.yml";
const technicalSnapshotsFile = "data/market/technical_snapshots.csv";
const valuationStatesFile = "research/valuation-states.csv";
const watchlistFile = "research/watchlist.csv";

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
]);

const activeWatchlistStatuses = new Set([
  "active_core_candidate",
  "active_candidate",
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
const allowedReadinessStatuses = new Set(["ready", "not_ready"]);
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
validateWatchlist();
validateMarketDataFiles();
validateDiscoveryLanes();
validateDiscoveryCandidates();
validateFreshnessEvents();
validateValuationStates();
validateCompanyAnalysis();
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

function activeWatchlistSymbols() {
  return csvRecords(watchlistFile)
    .filter((row) => activeWatchlistStatuses.has(row.status))
    .map((row) => row.symbol);
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

function validateWatchlist() {
  csvRecords(watchlistFile).forEach((row, index) => {
    const context = `${watchlistFile} row ${index + 2}`;
    requireString(row.symbol, `${context} symbol`);
    requireAllowed(row.status, allowedWatchlistStatuses, `${context} status`);
    requireString(row.latest_baseline_date, `${context} latest_baseline_date`);
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
  console.log(`ok ${discoveryLanesFile} semantic checks`);
}

function validateDiscoveryCandidates() {
  csvRecords(discoveryFile).forEach((row, index) => {
    const context = `${discoveryFile} row ${index + 2}`;
    ["symbol", "discovered_at", "source_url", "source_published_at", "retrieved_at", "first_seen_at"].forEach(
      (field) => requireString(row[field], `${context} ${field}`),
    );
    requireAllowed(row.status, allowedDiscoveryStatuses, `${context} status`);
  });
  console.log(`ok ${discoveryFile} semantic checks`);
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

function validateQualityMetrics() {
  const parsed = parsedYamlFiles.get(qualityMetricsFile);
  if (parsed?.schema_version !== 1) {
    throw new Error(`${qualityMetricsFile} schema_version must be 1`);
  }

  const readiness = parsed.decision_readiness ?? {};
  requireAllowed(readiness.status, allowedReadinessStatuses, `${qualityMetricsFile} decision_readiness.status`);
  if (typeof readiness.can_recommend_buys !== "boolean") {
    throw new Error(`${qualityMetricsFile} decision_readiness.can_recommend_buys must be boolean`);
  }
  if (readiness.status === "ready" && readiness.can_recommend_buys !== true) {
    throw new Error(`${qualityMetricsFile} ready status must set can_recommend_buys true`);
  }
  if (readiness.status === "not_ready") {
    requireString(readiness.reason, `${qualityMetricsFile} decision_readiness.reason`);
  }

  const coverage = parsed.coverage ?? {};
  const freshness = parsed.freshness ?? {};
  const gates = parsed.quality_gates ?? {};
  [
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
  ].forEach((field) => requireNumber(gates[field], `${qualityMetricsFile} quality_gates.${field}`));

  const activeSymbols = activeWatchlistSymbols();
  if (coverage.active_watchlist_symbols !== activeSymbols.length) {
    throw new Error(
      `${qualityMetricsFile} active_watchlist_symbols is ${coverage.active_watchlist_symbols}, expected ${activeSymbols.length}`,
    );
  }

  const asOfTimestamp = parseDate(parsed.as_of, `${qualityMetricsFile} as_of`);
  parseDate(coverage.universe_scan_as_of, `${qualityMetricsFile} coverage.universe_scan_as_of`);
  parseDate(coverage.discovery_lane_map_as_of, `${qualityMetricsFile} coverage.discovery_lane_map_as_of`);

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
    if (openCriticalEvents > 0 || missingValuations > 0 || coverage.active_symbols_missing_latest_filing_review > 0) {
      throw new Error(`${qualityMetricsFile} cannot be ready with open critical events or missing active-symbol coverage`);
    }
  }
  console.log(`ok ${qualityMetricsFile} semantic checks`);
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
