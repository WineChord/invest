import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const accountPlanFile = "data/account/plan.yml";
const accountStateFile = "data/account/state.yml";
const candidatesFile = "research/discovery/candidates.csv";
const candidateReadinessFile = "research/discovery/candidate-readiness.yml";
const discoveryLanesFile = "research/discovery/lanes.yml";
const freshnessFile = "research/freshness/events.csv";
const policyFile = "data/policy/policy-v1.1.md";
const positionsFile = "data/account/positions.csv";
const qualityMetricsFile = "research/quality-metrics.yml";
const sourcesFile = "research/sources.yml";
const universeScanFile = "research/discovery/runs/2026-05-31-universe-scan.json";
const valuationStatesFile = "research/valuation-states.csv";
const watchlistFile = "research/watchlist.csv";

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
  "allocation_risk",
];
const safetyBoundaries = [
  "Do not execute trades.",
  "Do not mutate broker-confirmed account files.",
  "Use repository files and fresh public sources as evidence; separate facts from inferences.",
  "Treat deterministic discovery as scaffolding, not buy eligibility.",
  "Classify reachable evidence gaps before returning; do not leave repository-public readiness incomplete.",
  "Material completed or incubated candidates need the full research-only dashboard surface before the repository is ready.",
];

const options = parseArgs(process.argv.slice(2));
const packet = buildPacket(options);
const output = `${stringifyYaml(packet)}\n`;

if (options.output === undefined) {
  process.stdout.write(output);
} else {
  writeFileSync(options.output, output);
  console.log(`Wrote subagent evidence packet to ${options.output}.`);
}

function parseArgs(args) {
  const parsed = {
    asOf: currentDate(),
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

function buildPacket({ asOf, requestType, roles, specificQuestion }) {
  const accountPlan = readYaml(accountPlanFile);
  const accountState = readYaml(accountStateFile);
  const qualityMetrics = readYaml(qualityMetricsFile);
  const sources = readYaml(sourcesFile);
  const readiness = readYaml(candidateReadinessFile);
  const discoveryLanes = readYaml(discoveryLanesFile);
  const universeScan = readJsonIfExists(universeScanFile);
  const watchlistRows = csvRecords(watchlistFile);
  const valuationRows = csvRecords(valuationStatesFile);
  const candidateRows = csvRecords(candidatesFile);
  const freshnessRows = csvRecords(freshnessFile);
  const positionRows = csvRecords(positionsFile);
  const policyVersion = readPolicyVersion(policyFile);

  const activeWatchlist = watchlistRows
    .filter((row) => ["active_core_candidate", "active_candidate", "watch"].includes(row.status))
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
      theme: row.theme,
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
    current_positions: positionRows,
    liquidity_reserve_status: "No confirmed liquidity reserve position is recorded.",
    allowed_assets_and_exclusions: {
      policy_file: policyFile,
      allowed_return_seeking_assets: "U.S.-listed common stocks and ADRs with public disclosures and normal retail liquidity.",
      exclusions: "No leverage, margin, options, shorts, crypto tokens, private shares, OTC securities, or non-US-listed instruments under policy v1.1.",
    },
    candidate_set: candidateSet,
    candidate_readiness: readinessRecords,
    active_watchlist: activeWatchlist,
    relevant_files: [
      "CONSTITUTION.md",
      "AGENTS.md",
      "SPEC.md",
      policyFile,
      discoveryLanesFile,
      candidatesFile,
      candidateReadinessFile,
      qualityMetricsFile,
      freshnessFile,
      valuationStatesFile,
      watchlistFile,
      sourcesFile,
      universeScanFile,
    ],
    fresh_sources: freshSources,
    deterministic_outputs: [
      {
        command: "npm run discover:universe -- --dry-run --limit 20 --json --output research/discovery/runs/2026-05-31-universe-scan.json",
        output_path: universeScanFile,
        schema_version: universeScan?.schema_version,
        as_of: universeScan?.as_of,
        discovery_scope: universeScan?.discovery_scope,
        candidate_count: universeScan?.candidate_count,
        caveats: universeScan?.caveats ?? [],
      },
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
