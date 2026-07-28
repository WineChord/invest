import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const accountPlanFile = "data/account/plan.yml";
const accountStateFile = "data/account/state.yml";
const candidatesFile = "research/discovery/candidates.csv";
const candidateReadinessFile = "research/discovery/candidate-readiness.yml";
const discoveryLanesFile = "research/discovery/lanes.yml";
const freshnessFile = "research/freshness/events.csv";
const policyFile = "data/policy/policy-v1.2.md";
const positionsFile = "data/account/positions.csv";
const positionConstructionFile = "research/position-construction.yml";
const qualityMetricsFile = "research/quality-metrics.yml";
const sourcesFile = "research/sources.yml";
const universeScanFile = "research/discovery/runs/2026-05-31-universe-scan.json";
const valuationStatesFile = "research/valuation-states.csv";
const watchlistFile = "research/watchlist.csv";
const watchlistPricesFile = "data/market/watchlist_prices.csv";

const defaultQuestion = "Review discovery lanes, raw candidates, freshness, valuation, and opportunity cost for the current repository-public decision state.";
const firstLayerDiscoveryQuestions = [
  "What could become scarce or strategically constrained over the next decade?",
  "Who controls, owns, enables, or can remove that scarcity?",
  "Who can convert the scarcity into pricing power, reinvestment paths, and shareholder value?",
  "Is there a public security that directly expresses that exposure under the current policy?",
  "Is the public company early, small, misunderstood, newly listed, awkward, or underfollowed enough to support extreme asymmetric upside?",
];
const defaultRoles = [
  "discovery_lane_candidate_triage",
  "freshness_filing_review",
  "bull_case",
  "bear_case",
  "valuation_entry",
  "allocation_risk",
];
const safetyBoundaries = [
  "Do not execute trades.",
  "Do not mutate broker-confirmed account files.",
  "Use repository files and fresh public sources as evidence; separate facts from inferences.",
  "Treat deterministic discovery as scaffolding, not buy eligibility.",
  "Classify gaps as target-critical, opportunity-set-critical, bounded discovery debt, or repository-health debt.",
  "Compare zero with the smallest mission-consistent staged exposure before finalizing no action with deployable liquidity.",
  "R1 and R2 candidates may remain open under dated service levels; R3 carries promotion-grade and dashboard-equivalent requirements.",
];

const options = parseArgs(process.argv.slice(2));
const packet = buildPacket(options);
const output = `${stringifyYaml(packet).trimEnd()}\n`;

if (options.output === undefined) {
  process.stdout.write(output);
} else {
  writeFileSync(options.output, output);
  console.log(`Wrote subagent evidence packet to ${options.output}.`);
}

function parseArgs(args) {
  const parsed = {
    asOf: currentDate(),
    deterministicOutputPaths: [],
    requestType: "monthly_decision_full_cycle",
    roles: defaultRoles,
    specificQuestion: defaultQuestion,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--as-of") {
      parsed.asOf = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--request-type") {
      parsed.requestType = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--specific-question") {
      parsed.specificQuestion = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--role") {
      parsed.roles = requireNextArg(args, index, arg).split(",").map((role) => role.trim()).filter(Boolean);
      index += 1;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--deterministic-output") {
      parsed.deterministicOutputPaths.push(requireNextArg(args, index, arg));
      index += 1;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }

  if (parsed.roles.length === 0) {
    throw new Error("--role must contain at least one role when provided");
  }
  return parsed;
}

function requireNextArg(args, index, flag) {
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

function buildPacket({
  asOf,
  deterministicOutputPaths,
  requestType,
  roles,
  specificQuestion,
}) {
  const accountPlan = readYaml(accountPlanFile);
  const accountState = readYaml(accountStateFile);
  const qualityMetrics = readYaml(qualityMetricsFile);
  const sources = readYaml(sourcesFile);
  const readiness = readYaml(candidateReadinessFile);
  const discoveryLanes = readYaml(discoveryLanesFile);
  const positionConstruction = readYaml(positionConstructionFile);
  const effectiveDeterministicOutputPaths = deterministicOutputPaths.length === 0
    ? deterministicOutputPathsFromQualityMetrics(qualityMetrics)
    : deterministicOutputPaths;
  const deterministicOutputs = effectiveDeterministicOutputPaths.map(deterministicOutputRecord);
  const watchlistRows = csvRecords(watchlistFile);
  const valuationRows = csvRecords(valuationStatesFile);
  const candidateRows = csvRecords(candidatesFile);
  const freshnessRows = csvRecords(freshnessFile);
  const positionRows = csvRecords(positionsFile);
  const watchlistPriceRows = csvRecords(watchlistPricesFile);
  const policyVersion = readPolicyVersion(policyFile);
  const pricesBySymbol = new Map(watchlistPriceRows.map((row) => [row.symbol, row]));
  const researchNav = Number(qualityMetrics.mission_accountability?.latest_research_nav);
  const currentPositions = positionRows.map((row) => {
    const priceRecord = pricesBySymbol.get(row.symbol);
    const quantity = Number(row.quantity);
    const price = Number(priceRecord?.price);
    const marketValue = Number.isFinite(quantity) && Number.isFinite(price)
      ? quantity * price
      : null;
    return {
      ...row,
      latest_completed_close: Number.isFinite(price) ? price : null,
      price_as_of: priceRecord?.price_as_of ?? null,
      market_value: marketValue,
      nav_weight_pct: marketValue !== null && Number.isFinite(researchNav) && researchNav > 0
        ? (marketValue / researchNav) * 100
        : null,
    };
  });

  const activeWatchlist = watchlistRows
    .filter((row) => row.status !== "removed")
    .map((row) => ({
      symbol: row.symbol,
      name: row.name,
      theme: row.theme,
      status: row.status,
      priority: row.priority,
      initial_role: row.initial_role,
      next_review_trigger: row.next_review_trigger,
      notes: row.notes,
    }));
  const candidateSet = candidateRows
    .filter((row) => row.status === "new" || row.status === "incubating")
    .map((row) => ({
      symbol: row.symbol,
      name: row.name,
      exchange: row.exchange,
      asset_type: row.asset_type,
      discovered_at: row.discovered_at,
      discovery_source: row.discovery_source,
      source_url: row.source_url,
      source_published_at: row.source_published_at,
      retrieved_at: row.retrieved_at,
      first_seen_at: row.first_seen_at,
      theme: row.theme,
      why_it_might_matter: row.why_it_might_matter,
      status: row.status,
      next_action: row.next_action,
      notes: row.notes,
    }));
  const readinessRecords = (readiness.records ?? []).map((record) => ({
    symbol: record.symbol,
    material_to_current_allocation: record.material_to_current_allocation,
    affected_lanes: record.affected_lanes ?? [],
    readiness_status: record.readiness_status,
    dashboard_surface_status: record.dashboard_surface_status,
    blocker_type: record.blocker_type,
    reachable_evidence_remaining: record.reachable_evidence_remaining,
    conclusion: record.conclusion,
  }));
  const freshSources = (sources.sources ?? []).map((source) => ({
    id: source.id,
    source_type: source.source_type,
    source_published_at: source.source_published_at,
    retrieved_at: source.retrieved_at,
    related_symbols: source.related_symbols,
    summary: source.summary,
  }));

  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    current_date: asOf,
    request_type: requestType,
    mission: "multi-decade asymmetric compounding with avoidable-ruin controls",
    policy_version: policyVersion,
    freshness_window: {
      quality_metrics_as_of: qualityMetrics.as_of,
      universe_scan_as_of: qualityMetrics.coverage?.universe_scan_as_of,
      discovery_lane_map_as_of: qualityMetrics.coverage?.discovery_lane_map_as_of,
      latest_research_engine_run_as_of: qualityMetrics.last_research_engine_run?.as_of,
    },
    confirmed_account_facts: {
      account_state_path: accountStateFile,
      status: accountState.status,
      confirmed_cash: accountState.confirmed_cash,
      settled_cash: accountState.settled_cash,
      buying_power: accountState.buying_power,
      positions_count: accountState.positions_count,
      last_confirmed_ledger_event_id: accountState.last_confirmed_ledger_event_id,
    },
    planned_but_unconfirmed_cash: accountPlan.monthly_contribution ?? null,
    current_positions: currentPositions,
    portfolio_snapshot: {
      research_nav: Number.isFinite(researchNav) ? researchNav : null,
      mission_accountability: qualityMetrics.mission_accountability ?? null,
      position_construction: positionConstruction,
    },
    liquidity_reserve_status: "No confirmed liquidity reserve position is recorded.",
    allowed_assets_and_exclusions: {
      policy_file: policyFile,
      allowed_return_seeking_assets: "U.S.-listed common stocks and ADRs with public disclosures and normal retail liquidity.",
      exclusions: "No leverage, margin, options, shorts, crypto tokens, private-share orders, OTC orders, or non-US-listed account actions under policy v1.2.",
    },
    candidate_set: candidateSet,
    candidate_readiness: readinessRecords,
    active_watchlist_scope: "all non-removed research/watchlist.csv rows, including active, watch, research_only, and not_tradable rows",
    active_watchlist: activeWatchlist,
    relevant_files: [
      "CONSTITUTION.md",
      "AGENTS.md",
      "SPEC.md",
      policyFile,
      discoveryLanesFile,
      candidatesFile,
      candidateReadinessFile,
      positionConstructionFile,
      qualityMetricsFile,
      freshnessFile,
      valuationStatesFile,
      watchlistFile,
      sourcesFile,
      ...effectiveDeterministicOutputPaths,
    ],
    fresh_sources: freshSources,
    deterministic_outputs: [
      ...deterministicOutputs,
      {
        command: "npm run check:data",
        result: "must pass before final synthesis",
      },
    ],
    open_freshness_events: freshnessRows.filter((row) => row.status === "new" || row.status === "stale"),
    valuation_states: valuationRows.map((row) => ({
      symbol: row.symbol,
      as_of: row.as_of,
      price: row.price,
      valuation_state: row.valuation_state,
      price_attractiveness: row.price_attractiveness,
      thesis_state: row.thesis_state,
      risk_state: row.risk_state,
      source_ids: row.source_ids,
    })),
    quality_metrics: {
      path: qualityMetricsFile,
      decision_readiness: qualityMetrics.decision_readiness,
      mission_accountability: qualityMetrics.mission_accountability,
      coverage: qualityMetrics.coverage,
      discovery_process: qualityMetrics.discovery_process,
      freshness: qualityMetrics.freshness,
    },
    discovery_lane_summary: (discoveryLanes.lanes ?? []).map((lane) => ({
      id: lane.id,
      name: lane.name,
      status: lane.status,
      bottleneck_thesis: lane.bottleneck_thesis,
      current_public_proxies: lane.current_public_proxies,
    })),
    subagent_defaults: {
      reasoning_level: "xhigh",
      independent_context: true,
      roles,
      do_not_fork_full_history_unless_needed: true,
    },
    first_layer_discovery_questions: firstLayerDiscoveryQuestions,
    specific_question: specificQuestion,
    safety_boundaries: safetyBoundaries,
    expected_output_schema: {
      role: "",
      scope: "",
      reasoning_level: "xhigh",
      inputs_used: [],
      sources_checked: [],
      facts_verified: [],
      stale_or_missing_evidence: [],
      primary_source_conflicts: [],
      key_findings: [],
      thesis_delta: "",
      entry_delta: "",
      priority_or_lane_delta: "",
      mission_contribution: "",
      uncertainty_classification: {
        decision_critical: [],
        sizing: [],
        process_debt: [],
      },
      portfolio_impact: {
        zero_exposure: "",
        smallest_mission_consistent_exposure: "",
        fully_underwritten_range: "",
        maximum_nav_permanent_impairment: "",
        downside_base_upside_exceptional_results: [],
      },
      path_to_scale_or_exit: [],
      policy_or_safety_blockers: [],
      buy_or_no_buy_implication: "",
      confidence: "",
      unresolved_questions: [],
    },
  };
}

function readYaml(file) {
  return parseYaml(readFileSync(file, "utf8"));
}

function readJsonIfExists(file) {
  if (!existsSync(file)) {
    return null;
  }
  return JSON.parse(readFileSync(file, "utf8"));
}

function deterministicOutputRecord(file) {
  const output = readJsonIfExists(file);
  if (output === null) {
    throw new Error(`Deterministic output does not exist: ${file}`);
  }
  return {
    command: "caller-supplied deterministic discovery output",
    output_path: file,
    output_sha256: sha256(readFileSync(file, "utf8")),
    schema_version: output.schema_version,
    as_of: output.as_of,
    discovery_scope: output.discovery_scope,
    candidate_count: output.candidate_count,
    total_match_count: output.total_match_count,
    profile_purpose: output.profile_purpose,
    profile_coverage_scope: output.profile_coverage_scope,
    profile_coverage_status: output.profile_coverage_status,
    profile_requested_symbols: output.profile_requested_symbols ?? [],
    profile_coverage_gap_count: output.profile_coverage_gap_count,
    profile_coverage_ratio: output.profile_coverage_ratio,
    scan_payload_summary: scanPayloadSummary(output),
    caveats: output.caveats ?? [],
  };
}

function scanPayloadSummary(output) {
  if (!("candidate_count" in output)) {
    return null;
  }
  return {
    truncated: output.truncated,
    returned_candidate_count: output.returned_candidate_count,
    omitted_candidate_count: output.omitted_candidate_count,
    total_match_count: output.total_match_count,
    exploratory_match_count: output.exploratory_match_count,
    suppressed_known_match_count: output.suppressed_known_match_count,
    recall_expected_lane_miss_count: output.recall_expected_lane_miss_count,
    recall_expected_proxy_miss_count: output.recall_expected_proxy_miss_count,
    recall_organic_expected_proxy_count: output.recall_organic_expected_proxy_count,
    recall_organic_expected_proxy_miss_count: output.recall_organic_expected_proxy_miss_count,
    recall_organic_expected_proxy_status: output.recall_organic_expected_proxy_status,
    recall_ticker_only_expected_proxy_count: output.recall_ticker_only_expected_proxy_count,
    recall_ticker_only_expected_proxy_symbols: output.recall_ticker_only_expected_proxy_symbols ?? [],
    candidate_counts_by_priority: output.candidate_counts_by_priority ?? {},
    candidate_counts_by_lane: output.candidate_counts_by_lane ?? {},
    false_positive_flag_counts: output.false_positive_flag_counts ?? {},
    exploratory_match_counts_by_lane: output.exploratory_match_counts_by_lane ?? {},
    returned_candidates: scanCandidateSummaries(output.candidates ?? []),
    omitted_candidates: scanCandidateSummaries(output.omitted_candidates ?? []),
    exploratory_unknown_lane_matches: scanCandidateSummaries(output.exploratory_matches ?? []),
    suppressed_known_matches: scanCandidateSummaries(output.suppressed_known_matches ?? []),
    recall_diagnostics: recallDiagnosticSummaries(output.recall_diagnostics ?? []),
  };
}

function scanCandidateSummaries(candidates) {
  if (!Array.isArray(candidates)) {
    return [];
  }
  return candidates.map((candidate) => ({
    symbol: candidate.symbol,
    name: candidate.name,
    exchange: candidate.exchange,
    primary_lane_id: candidate.primary_lane_id ?? candidate.lane_id,
    secondary_lane_ids: candidate.secondary_lane_ids ?? [],
    deterministic_priority: candidate.deterministic_priority,
    triage_score: candidate.triage_score,
    recommended_review_depth: candidate.recommended_review_depth,
    keyword_signal: candidate.keyword_signal,
    matched_fields: candidate.matched_fields ?? [],
    matched_keyword_fields: candidate.matched_keyword_fields ?? {},
    matched_keyword_variants: candidate.matched_keyword_variants ?? {},
    matched_profile_snippets: candidate.matched_profile_snippets ?? [],
    matched_keywords: candidate.matched_keywords ?? [],
    match_sources: candidate.match_sources ?? [],
    false_positive_flags: candidate.false_positive_flags ?? [],
    profile_enriched: candidate.profile_enriched,
    security_form: candidate.security_form,
    security_form_confidence: candidate.security_form_confidence,
    requires_security_type_confirmation: candidate.requires_security_type_confirmation,
    known_sources: candidate.known_sources ?? [],
    required_next_step: candidate.required_next_step,
    exploratory_reason: candidate.exploratory_reason ?? "",
    recheck_reason: candidate.recheck_reason ?? "",
  }));
}

function recallDiagnosticSummaries(diagnostics) {
  if (!Array.isArray(diagnostics)) {
    return [];
  }
  return diagnostics.map((diagnostic) => ({
    symbol: diagnostic.symbol,
    expected_lane_id: diagnostic.expected_lane_id,
    status: diagnostic.status,
    recall_scope: diagnostic.recall_scope,
    missed_reason: diagnostic.missed_reason,
    suggested_review: diagnostic.suggested_review,
    matched_expected_lane_ids: diagnostic.matched_expected_lane_ids ?? [],
    organic_matched_any_expected_lane: diagnostic.organic_matched_any_expected_lane,
    organic_matched_expected_lane_ids: diagnostic.organic_matched_expected_lane_ids ?? [],
    ticker_only_expected_lane_recall: diagnostic.ticker_only_expected_lane_recall,
    matched_lane_ids: diagnostic.matched_lane_ids ?? [],
    match_sources: diagnostic.match_sources ?? [],
  }));
}

function deterministicOutputPathsFromQualityMetrics(qualityMetrics) {
  const latestAgenticDiscoveryPath = qualityMetrics.discovery_process?.latest_agentic_discovery_path;
  if (typeof latestAgenticDiscoveryPath === "string" && latestAgenticDiscoveryPath !== "" && existsSync(latestAgenticDiscoveryPath)) {
    const agenticRun = readYaml(latestAgenticDiscoveryPath);
    const paths = (agenticRun.source_coverage?.deterministic_commands ?? [])
      .map((command) => typeof command?.output_path === "string" ? command.output_path : "")
      .filter((file) => file.endsWith(".json"));
    if (paths.length > 0) {
      return [...new Set(paths)];
    }
  }
  return [universeScanFile];
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function readPolicyVersion(file) {
  const content = readFileSync(file, "utf8");
  const match = content.match(/^# Policy ([^\n]+)$/m);
  return match?.[1] ?? "unknown";
}

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

function csvRecords(file) {
  const rows = parseCsv(readFileSync(file, "utf8"));
  const header = rows[0] ?? [];
  return rows.slice(1).map((row) =>
    Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""])),
  );
}
