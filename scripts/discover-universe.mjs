import { createHash } from "node:crypto";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { fetchSecTextWithRetry } from "./sec-fetch-lib.mjs";

const candidatesFile = "research/discovery/candidates.csv";
const discoveryLanesFile = "research/discovery/lanes.yml";
const secCompanyTickersExchangeUrl = "https://www.sec.gov/files/company_tickers_exchange.json";
const securityMasterFile = "data/market/security_master.csv";
const watchlistFile = "research/watchlist.csv";
const defaultLimit = 50;
const allowedDiscoveryExchanges = new Set(["Nasdaq", "NYSE", "NYSE American"]);
const defaultDiscoveryScope = "active_emerging_incubating";
const exploratoryLaneIds = new Set(["unknown_future_bottlenecks"]);
const highPriorityThreshold = 75;
const mediumPriorityThreshold = 45;
const maxProfileTextLength = 4000;
const minProfileOnlyHighSignalKeywordsForHighPriority = 2;
const tickerOnlyMatchScoreCap = mediumPriorityThreshold - 1;
const noProfileSemanticCoverageStatus = "absent_name_ticker_only";
const allowedProfilePurposes = new Set([
  "repo_research_recall_calibration",
  "issuer_universe_discovery",
]);
const highSignalKeywords = new Set([
  "ai cloud",
  "cxl",
  "direct-to-device",
  "foundation model",
  "gpu",
  "haleu",
  "hbm",
  "inference",
  "launch",
  "liquid cooling",
  "mobile satellite",
  "nuclear",
  "optical",
  "orbital",
  "post-quantum",
  "quantum",
  "qubit",
  "retimer",
  "satellite",
  "spacecraft",
  "stablecoin",
  "training cluster",
  "usdc",
]);
const lowSignalKeywords = new Set([
  "artificial intelligence",
  "compute",
  "connectivity",
  "grid",
  "infrastructure",
  "mission critical",
  "network",
  "platform",
  "spectrum",
]);
const lowSignalNamePatterns = [
  {
    id: "fund_or_etf",
    pattern: /\b(fund|etf|portfolio|closed[- ]end|income fund|opportunities fund)\b/i,
    penalty: 130,
  },
  {
    id: "blank_check_or_spac",
    pattern: /\b(acquisition corp|acquisition corporation|blank check|spac)\b/i,
    penalty: 35,
  },
  {
    id: "brand_keyword_collision",
    pattern: /\bbrands? holdings?\b/i,
    penalty: 30,
  },
  {
    id: "royalty_or_commodity_proxy",
    pattern: /\broyalty\b/i,
    penalty: 20,
  },
  {
    id: "broad_index_or_holdings_vehicle",
    pattern: /\b(index|holdings fund|trust plc)\b/i,
    penalty: 25,
  },
  {
    id: "partnership_or_unit_security",
    pattern: /\b(l\.p\.|limited partnership|common units|unit trust|partnership units)\b/i,
    penalty: 45,
  },
];

const candidateColumns = [
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
];

const options = parseArgs(process.argv.slice(2));
const discoveryDate = options.asOf ?? currentDate();
const laneMap = loadDiscoveryLanes(options);
const discoveryLanes = laneMap.lanes;
const knownSymbolSources = buildKnownSymbolSources();
const knownSymbols = new Set(knownSymbolSources.keys());
const companyList = await loadCompanyList(options);
const companies = companyList.companies;
const companyProfiles = loadCompanyProfiles(options, companies);
const scan = scanCompanies({
  companies,
  companyProfiles,
  discoveryLanes,
  knownSymbolSources,
});
const candidates = scan.candidates.slice(0, options.limit);
const result = buildResult({
  allCandidates: scan.candidates,
  candidates,
  companyProfiles,
  discoveryDate,
  discoveryLanes,
  knownSymbols,
  laneMap,
  options,
  recallDiagnostics: buildRecallDiagnostics({
    companies,
    companyProfiles,
    discoveryLanes,
  }),
  secInputEligibleUniverseCount: companies.filter(isEligibleDiscoveryCompany).length,
  secInputMetadata: companyList.metadata,
  suppressedMatches: scan.suppressedMatches,
  exploratoryMatches: scan.exploratoryMatches,
});

if (options.json) {
  const output = `${JSON.stringify(result, null, 2)}\n`;
  if (options.output === undefined) {
    process.stdout.write(output);
  } else {
    writeFileSync(options.output, output);
    console.log(`Wrote discovery audit output to ${options.output}.`);
  }
} else {
  console.log("Bottleneck-map-first dry run. Results are raw leads, not buy recommendations.");

  if (candidates.length === 0) {
    console.log("No new keyword-matched discovery candidates found.");
  } else {
    console.log(formatCandidates(candidates));
  }

  console.log(`Discovery scope: ${result.discovery_scope}.`);
}

if (options.write && candidates.length > 0) {
  appendCandidates(candidates, discoveryDate);
  logStatus(`Appended ${candidates.length} candidates to ${candidatesFile}.`);
} else {
  logStatus("Dry run only. Pass --write to append candidates after reviewing the output.");
}

function logStatus(message) {
  if (options.json && options.output === undefined) {
    console.error(message);
    return;
  }
  console.log(message);
}

function parseArgs(args) {
  const parsed = {
    allowLocalProfileEvidence: false,
    includeEmerging: true,
    json: false,
    limit: defaultLimit,
    write: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--write") {
      parsed.write = true;
    } else if (arg === "--dry-run") {
      parsed.write = false;
    } else if (arg === "--include-emerging") {
      parsed.includeEmerging = true;
    } else if (arg === "--active-only") {
      parsed.includeEmerging = false;
    } else if (arg === "--json") {
      parsed.json = true;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--input") {
      parsed.input = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--profile-input") {
      parsed.profileInput = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--allow-local-profile-evidence") {
      parsed.allowLocalProfileEvidence = true;
    } else if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
      index += 1;
    } else if (arg === "--limit") {
      parsed.limit = Number(requireNextArg(args, index, arg));
      if (!Number.isInteger(parsed.limit) || parsed.limit <= 0) {
        throw new Error("--limit must be a positive integer");
      }
      index += 1;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }

  if (parsed.json && parsed.output !== undefined && parsed.asOf === undefined) {
    throw new Error("--as-of is required when writing a durable --json --output discovery artifact");
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

function strictDate(value, context) {
  const text = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error(`${context} must use YYYY-MM-DD`);
  }
  const parsed = new Date(`${text}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
    throw new Error(`${context} must be a valid calendar date`);
  }
  return text;
}

function loadDiscoveryLanes({ includeEmerging }) {
  const content = readFileSync(discoveryLanesFile, "utf8");
  const parsed = parseYaml(content);
  const lanes = Array.isArray(parsed?.lanes) ? parsed.lanes : [];
  lanes.forEach(validateDiscoveryLaneKeywords);
  return {
    asOf: requiredProfileString(parsed?.as_of, `${discoveryLanesFile} as_of`),
    hash: sha256(content),
    lanes: lanes.filter((lane) => {
      if (lane.status === "active") {
        return true;
      }
      return includeEmerging && ["emerging", "incubating"].includes(lane.status);
    }),
    path: discoveryLanesFile,
  };
}

function validateDiscoveryLaneKeywords(lane, index) {
  const context = `${discoveryLanesFile} lanes[${index}] ${lane?.id ?? "unknown"}`;
  const seen = new Map();
  validateKeywordArray({
    context,
    field: "screen_keywords",
    keywords: lane?.screen_keywords,
    seen,
  });
  validateKeywordArray({
    context,
    field: "profile_keywords",
    keywords: lane?.profile_keywords,
    seen,
  });
}

function validateKeywordArray({
  context,
  field,
  keywords,
  seen,
}) {
  if (keywords === undefined) {
    return;
  }
  if (!Array.isArray(keywords)) {
    throw new Error(`${context}.${field} must be an array when present`);
  }
  keywords.forEach((keyword, index) => {
    if (typeof keyword !== "string" || keyword.trim() === "") {
      throw new Error(`${context}.${field}[${index}] must be a non-empty string`);
    }
    const normalized = normalizeSearchText(keyword);
    if (normalized === "") {
      throw new Error(`${context}.${field}[${index}] must contain searchable text`);
    }
    const prior = seen.get(normalized);
    if (prior !== undefined) {
      throw new Error(`${context} duplicates normalized keyword "${normalized}" in ${field}[${index}], already present in ${prior}`);
    }
    seen.set(normalized, `${field}[${index}]`);
  });
}

function buildResult({
  allCandidates,
  candidates,
  companyProfiles,
  discoveryDate,
  discoveryLanes,
  knownSymbols,
  laneMap,
  options,
  recallDiagnostics,
  secInputEligibleUniverseCount,
  secInputMetadata,
  suppressedMatches,
  exploratoryMatches,
}) {
  const omittedCandidates = allCandidates.slice(candidates.length);
  const profileCoverage = summarizeProfileCoverage(companyProfiles);
  const semanticProfileCoverage = summarizeSemanticProfileCoverage({
    companyProfiles,
    profileCoverage,
    secInputEligibleUniverseCount,
  });
  const inScopeRecallDiagnostics = recallDiagnostics.filter((diagnostic) =>
    diagnostic.recall_scope === "sec_listed_public_proxy",
  );
  const recallMissCount = inScopeRecallDiagnostics
    .filter((diagnostic) => diagnostic.status !== "matched_expected_lane")
    .length;
  const organicRecallMissCount = inScopeRecallDiagnostics
    .filter((diagnostic) => !diagnostic.organic_matched_any_expected_lane)
    .length;
  const organicRecallCount = inScopeRecallDiagnostics.length - organicRecallMissCount;
  const tickerOnlyExpectedProxyCount = inScopeRecallDiagnostics
    .filter((diagnostic) => diagnostic.status === "matched_expected_lane")
    .filter((diagnostic) => !diagnostic.organic_matched_any_expected_lane)
    .length;
  const tickerOnlyExpectedProxySymbols = inScopeRecallDiagnostics
    .filter((diagnostic) => diagnostic.status === "matched_expected_lane")
    .filter((diagnostic) => !diagnostic.organic_matched_any_expected_lane)
    .map((diagnostic) => diagnostic.symbol)
    .sort();
  const uniqueRecall = summarizeUniqueRecall(recallDiagnostics);
  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    as_of: discoveryDate,
    discovery_scope: options.includeEmerging
      ? defaultDiscoveryScope
      : "active_only",
    source_url: secCompanyTickersExchangeUrl,
    sec_input_source: secInputMetadata.source,
    sec_input_fetched_at: secInputMetadata.fetchedAt,
    sec_input_row_count: secInputMetadata.rowCount,
    sec_input_eligible_universe_count: secInputEligibleUniverseCount,
    sec_input_sha256: secInputMetadata.sha256,
    input_path: options.input ?? "",
    lane_map_path: laneMap.path,
    lane_map_as_of: laneMap.asOf,
    lane_map_sha256: laneMap.hash,
    profile_input_path: options.profileInput ?? "",
    profile_input_sha256: companyProfiles.profileInputSha256 ?? "",
    profile_purpose: companyProfiles.profilePurpose ?? "",
    profile_source: companyProfiles.profileSource ?? "",
    profile_generated_at: companyProfiles.profileGeneratedAt ?? "",
    profile_source_files: companyProfiles.profileSourceFiles ?? [],
    profile_text_fields: companyProfiles.profileTextFields ?? [],
    profile_coverage_strategy: companyProfiles.profileCoverageStrategy ?? "",
    profile_coverage_scope: companyProfiles.profileCoverageScope ?? "",
    profile_requested_symbols: companyProfiles.profileRequestedSymbols ?? [],
    profile_missing_requested_symbols: companyProfiles.profileMissingRequestedSymbols ?? [],
    profile_selected_symbol_count: companyProfiles.profileSelectedSymbolCount ?? 0,
    profile_eligible_universe_count: companyProfiles.profileEligibleUniverseCount ?? 0,
    profile_coverage_limit: companyProfiles.profileCoverageLimit ?? 0,
    profile_audited_symbol_count: companyProfiles.profileAuditedSymbolCount ?? 0,
    profile_skipped_symbol_count: companyProfiles.profileSkippedSymbolCount ?? 0,
    profile_coverage_gap_count: profileCoverage.gapCount,
    profile_coverage_ratio: profileCoverage.ratio,
    profile_coverage_status: profileCoverage.status,
    issuer_profile_coverage_status: semanticProfileCoverage.status,
    issuer_profile_semantic_gap_count: semanticProfileCoverage.gapCount,
    issuer_profile_semantic_coverage_ratio: semanticProfileCoverage.ratio,
    profile_sampling_note: companyProfiles.profileSamplingNote ?? "",
    profile_declared_count: companyProfiles.profileDeclaredCount ?? 0,
    profile_symbol_count: companyProfiles.size,
    deterministic_limit: options.limit,
    known_symbol_count: knownSymbols.size,
    lanes_scanned: discoveryLanes.map((lane) => ({
      id: lane.id,
      name: lane.name,
      status: lane.status,
    })),
    ranking_method: [
      "score high-signal lane keywords above generic keywords",
      "penalize likely funds, ETFs, blank-check vehicles, and brand-name collisions",
      "sort by deterministic priority before applying the limit",
    ],
    candidate_counts_by_priority: countBy(candidates, (candidate) => candidate.priority),
    candidate_counts_by_lane: countBy(candidates, (candidate) => candidate.laneId),
    false_positive_flag_counts: countFlags(candidates),
    all_candidate_counts_by_priority: countBy(allCandidates, (candidate) => candidate.priority),
    all_candidate_counts_by_lane: countBy(allCandidates, (candidate) => candidate.laneId),
    all_false_positive_flag_counts: countFlags(allCandidates),
    exploratory_match_counts_by_lane: countBy(exploratoryMatches, (candidate) => candidate.laneId),
    exploratory_false_positive_flag_counts: countFlags(exploratoryMatches),
    profile_enriched_candidate_count: allCandidates.filter((candidate) => candidate.profileEnriched).length,
    profile_enriched_returned_candidate_count: candidates.filter((candidate) => candidate.profileEnriched).length,
    profile_enriched_suppressed_match_count: suppressedMatches.filter((candidate) => candidate.profileEnriched).length,
    profile_enriched_exploratory_match_count: exploratoryMatches.filter((candidate) => candidate.profileEnriched).length,
    profile_known_symbol_count: [...companyProfiles.keys()].filter((symbol) => knownSymbols.has(symbol)).length,
    profile_unknown_symbol_count: [...companyProfiles.keys()].filter((symbol) => !knownSymbols.has(symbol)).length,
    total_match_count: allCandidates.length + suppressedMatches.length + exploratoryMatches.length,
    all_candidate_count: allCandidates.length,
    returned_candidate_count: candidates.length,
    omitted_candidate_count: omittedCandidates.length,
    exploratory_match_count: exploratoryMatches.length,
    truncated: omittedCandidates.length > 0,
    recall_expected_lane_count: inScopeRecallDiagnostics.length,
    recall_expected_lane_miss_count: recallMissCount,
    recall_counts_by_status: countBy(recallDiagnostics, (diagnostic) => diagnostic.status),
    recall_out_of_scope_proxy_count: recallDiagnostics.filter((diagnostic) =>
      diagnostic.recall_scope === "out_of_scope_private_or_future_proxy",
    ).length,
    recall_unique_expected_proxy_count: uniqueRecall.proxyCount,
    recall_unique_expected_proxy_miss_count: uniqueRecall.proxyMissCount,
    recall_expected_proxy_count: inScopeRecallDiagnostics.length,
    recall_expected_proxy_miss_count: recallMissCount,
    recall_organic_expected_proxy_count: organicRecallCount,
    recall_organic_expected_proxy_miss_count: organicRecallMissCount,
    recall_organic_expected_proxy_status: recallOrganicStatus({
      inScopeCount: inScopeRecallDiagnostics.length,
      organicRecallMissCount,
      tickerOnlyExpectedProxyCount,
    }),
    recall_ticker_only_expected_proxy_count: tickerOnlyExpectedProxyCount,
    recall_ticker_only_expected_proxy_symbols: tickerOnlyExpectedProxySymbols,
    candidate_count: candidates.length,
    candidates: candidates.map(candidateAuditRow),
    omitted_candidates: omittedCandidates.map(candidateAuditRow),
    top_omitted_candidates: omittedCandidates.slice(0, 10).map(candidateAuditRow),
    exploratory_matches: exploratoryMatches.map((candidate) => ({
      ...candidateAuditRow(candidate),
      exploratory_reason: "The open-ended unknown-future lane creates lane-review signals, not ordinary raw candidates, until evidence supports a concrete named lane.",
      required_next_step: "bottleneck_lane_review_before_candidate_append",
    })),
    suppressed_known_matches: suppressedMatches.map((candidate) => ({
      ...candidateAuditRow(candidate),
      known_sources: candidate.knownSources,
      recheck_reason: "Known repo symbol still matched current lane scan; review only if stale, newly stronger, or price-dislocated.",
    })),
    suppressed_known_match_count: suppressedMatches.length,
    recall_diagnostics: recallDiagnostics,
    caveats: [
      "Deterministic keyword matches are raw leads, not recommendations.",
      "This scan checks SEC listed issuer reference names and symbols plus optional caller-supplied profile text.",
      "Serious discovery still requires independent agentic bottleneck research and source-backed readiness work.",
    ],
  };
}

function candidateAuditRow(candidate) {
  return {
    symbol: candidate.symbol,
    name: candidate.name,
    cik: candidate.cik,
    exchange: candidate.exchange,
    primary_lane_id: candidate.laneId,
    lane_id: candidate.laneId,
    lane_name: candidate.laneName,
    lane_status: candidate.laneStatus,
    lane_matches: candidate.laneMatches,
    secondary_lane_ids: candidate.laneMatches
      .slice(1)
      .map((laneMatch) => laneMatch.lane_id),
    matched_keywords: candidate.keywords,
    matched_keyword_scopes: candidate.matchedKeywordScopes,
    matched_keyword_variants: candidate.matchedKeywordVariants,
    matched_fields: candidate.matchedFields,
    matched_keyword_fields: candidate.matchedKeywordFields,
    matched_profile_snippets: candidate.matchedProfileSnippets,
    match_sources: candidate.matchSources,
    security_form: candidate.securityForm,
    security_form_confidence: candidate.securityFormConfidence,
    requires_security_type_confirmation: candidate.requiresSecurityTypeConfirmation,
    keyword_signal: candidate.keywordSignal,
    triage_score: candidate.score,
    deterministic_priority: candidate.priority,
    recommended_review_depth: candidate.reviewDepth,
    false_positive_flags: candidate.falsePositiveFlags,
    profile_enriched: candidate.profileEnriched,
    profile_metadata: candidate.profileMetadata,
    profile_sources: candidate.profileSources,
    profile_text_fields: candidate.profileTextFields,
    profile_text_truncated: candidate.profileTextTruncated,
    deterministic_only: true,
    required_next_step: "primary_source_skim_and_readiness_triage",
  };
}

function summarizeProfileCoverage(companyProfiles) {
  const purpose = companyProfiles.profilePurpose ?? "";
  if (purpose !== "issuer_universe_discovery") {
    return {
      gapCount: 0,
      ratio: 0,
      status: purpose === "" ? "not_applicable_no_profile_input" : "not_applicable_recall_calibration",
    };
  }
  const loaded = companyProfiles.profileLoadedCount ?? companyProfiles.profileDeclaredCount ?? 0;
  const eligible = companyProfiles.profileEligibleUniverseCount ?? 0;
  const audited = companyProfiles.profileAuditedSymbolCount ?? loaded;
  const gapCount = Math.max(eligible - audited, 0);
  const missingRequestedCount = (companyProfiles.profileMissingRequestedSymbols ?? []).length;
  const ratio = eligible === 0 ? 0 : Number((audited / eligible).toFixed(6));
  return {
    gapCount,
    ratio,
    status: profileCoverageStatus({
      gapCount,
      missingRequestedCount,
      scope: companyProfiles.profileCoverageScope ?? "",
      strategy: companyProfiles.profileCoverageStrategy ?? "",
    }),
  };
}

function summarizeSemanticProfileCoverage({
  companyProfiles,
  profileCoverage,
  secInputEligibleUniverseCount,
}) {
  const purpose = companyProfiles.profilePurpose ?? "";
  if (purpose === "issuer_universe_discovery") {
    const loaded = companyProfiles.profileLoadedCount ?? companyProfiles.profileDeclaredCount ?? 0;
    const eligible = companyProfiles.profileEligibleUniverseCount ?? 0;
    const gapCount = Math.max(eligible - loaded, 0);
    const ratio = eligible === 0 ? 0 : Number((loaded / eligible).toFixed(6));
    return {
      gapCount,
      ratio,
      status: semanticProfileCoverageStatus({
        gapCount,
        profileCoverage,
        skippedSymbolCount: companyProfiles.profileSkippedSymbolCount ?? 0,
      }),
    };
  }
  if (purpose === "") {
    return {
      gapCount: secInputEligibleUniverseCount,
      ratio: 0,
      status: noProfileSemanticCoverageStatus,
    };
  }
  return {
    gapCount: 0,
    ratio: 0,
    status: "not_applicable_recall_calibration",
  };
}

function profileCoverageStatus({
  gapCount,
  missingRequestedCount,
  scope,
  strategy,
}) {
  if (scope === "complete_sec_universe" && gapCount === 0) {
    return "complete";
  }
  if (scope === "complete_sec_universe") {
    return "complete_scope_incomplete_profiles";
  }
  if (strategy === "requested_symbols") {
    if (missingRequestedCount > 0) {
      return "targeted_partial_incomplete_profiles";
    }
    return "targeted_partial";
  }
  if (strategy === "first_n_sec_rows_smoke_test") {
    return "smoke_test_partial";
  }
  if (strategy === "manual_profile_input_csv") {
    return "manual_partial";
  }
  if (strategy === "manifest_rows_without_sampling_metadata") {
    return "manifest_partial";
  }
  if (scope.startsWith("partial_")) {
    return "partial_unknown_strategy";
  }
  return "unknown";
}

function semanticProfileCoverageStatus({
  gapCount,
  profileCoverage,
  skippedSymbolCount,
}) {
  if (gapCount === 0) {
    return "complete";
  }
  if (profileCoverage.status === "complete" && skippedSymbolCount > 0) {
    return "complete_scope_with_profile_skips";
  }
  return profileCoverage.status;
}

function loadCompanyProfiles({ profileInput }, companies) {
  if (profileInput === undefined) {
    const profilesBySymbol = new Map();
    profilesBySymbol.profileDeclaredCount = 0;
    profilesBySymbol.profileGeneratedAt = "";
    profilesBySymbol.profilePurpose = "";
    profilesBySymbol.profileSource = "";
    profilesBySymbol.profileSourceFiles = [];
    profilesBySymbol.profileTextFields = [];
    profilesBySymbol.profileCoverageStrategy = "";
    profilesBySymbol.profileCoverageScope = "";
    profilesBySymbol.profileRequestedSymbols = [];
    profilesBySymbol.profileSelectedSymbolCount = 0;
    profilesBySymbol.profileEligibleUniverseCount = 0;
    profilesBySymbol.profileCoverageLimit = 0;
    profilesBySymbol.profileAuditedSymbolCount = 0;
    profilesBySymbol.profileLoadedCount = 0;
    profilesBySymbol.profileMissingRequestedSymbols = [];
    profilesBySymbol.profileSamplingNote = "";
    profilesBySymbol.profileSkippedSymbolCount = 0;
    profilesBySymbol.profileInputSha256 = "";
    return profilesBySymbol;
  }
  const profileInputContent = readFileSync(profileInput, "utf8");
  const parsed = JSON.parse(profileInputContent);
  if (parsed?.schema_version !== 1) {
    throw new Error("Profile input schema_version must be 1");
  }
  const profiles = parsed.profiles;
  if (!Array.isArray(profiles)) {
    throw new Error("Profile input must contain a profiles array");
  }
  const profilePurpose = requiredProfileString(parsed.profile_purpose, "Profile input profile_purpose");
  if (!allowedProfilePurposes.has(profilePurpose)) {
    throw new Error(`Profile input profile_purpose must be one of: ${[...allowedProfilePurposes].join(", ")}`);
  }
  const currentEligibleUniverseCount = companies.filter(isEligibleDiscoveryCompany).length;
  const eligibleSymbols = new Set(
    companies
      .filter(isEligibleDiscoveryCompany)
      .map((company) => String(company.ticker ?? "").toUpperCase()),
  );
  const profileCoverage = validateProfileInputMetadata({
    currentEligibleUniverseCount,
    parsed,
    profilePurpose,
    profiles,
  });
  const skippedProfileSymbols = skippedProfileSymbolsFrom(parsed);
  const rootTextFields = optionalProfileTextFields(parsed.profile_text_fields, "Profile input profile_text_fields");
  const companiesBySymbol = new Map(
    companies.map((company) => [String(company.ticker ?? "").toUpperCase(), company]),
  );
  const companiesByCik = new Map(
    companies.map((company) => [normalizeCik(company.cik), company]),
  );
  const profilesBySymbol = new Map();
  const seenCiks = new Set();
  profiles.forEach((profile, index) => {
    const context = `profile input profiles[${index}]`;
    const symbol = requiredProfileString(profile?.symbol, `${context}.symbol`).toUpperCase();
    const cik = normalizeCik(requiredProfileString(profile?.cik, `${context}.cik`));
    const text = requiredProfileString(profile?.text ?? profile?.profile_text, `${context}.text`);
    const textFields = optionalProfileTextFields(profile?.profile_text_fields ?? rootTextFields, `${context}.profile_text_fields`);
    const fieldTexts = optionalProfileFieldTexts(profile?.profile_field_texts, `${context}.profile_field_texts`);
    validateProfileFieldTexts({
      context,
      fieldTexts,
      profilePurpose,
      text,
      textFields,
      textTruncated: profile.profile_text_truncated === true,
    });
    const sourceUrl = requiredProfileString(profile?.source_url, `${context}.source_url`);
    if (
      profilePurpose === "issuer_universe_discovery" &&
      profile?.filing_content_cache_status === "local_path" &&
      !sourceUrl.startsWith("fixture://") &&
      !options.allowLocalProfileEvidence
    ) {
      throw new Error(`${context} local filing_path content is fixture-only and cannot be used as issuer_universe_discovery evidence for ${sourceUrl}`);
    }
    const sourcePublishedAt = requiredProfileString(profile?.source_published_at, `${context}.source_published_at`);
    const retrievedAt = requiredProfileString(profile?.retrieved_at, `${context}.retrieved_at`);
    if (!companiesBySymbol.has(symbol)) {
      throw new Error(`${context}.symbol ${symbol} is not present in SEC company input`);
    }
    if (!companiesByCik.has(cik)) {
      throw new Error(`${context}.cik ${cik} is not present in SEC company input`);
    }
    const company = companiesBySymbol.get(symbol);
    if (normalizeCik(company.cik) !== cik) {
      throw new Error(`${context} symbol ${symbol} does not match CIK ${cik}`);
    }
    if (profilePurpose === "issuer_universe_discovery" && !isEligibleDiscoveryCompany(company)) {
      throw new Error(`${context}.symbol ${symbol} is not an eligible SEC discovery issuer`);
    }
    if (profilesBySymbol.has(symbol) || seenCiks.has(cik)) {
      throw new Error(`${context} duplicates profile symbol or CIK ${symbol}/${cik}`);
    }
    profilesBySymbol.set(symbol, {
      text: text.slice(0, maxProfileTextLength),
      text_fields: textFields,
      field_texts: fieldTexts,
      profile_metadata: profileProfileMetadata(profile),
      text_truncated: text.length > maxProfileTextLength || profile.profile_text_truncated === true,
      sources: [{
        source_url: sourceUrl,
        source_name: typeof profile.source_name === "string" ? profile.source_name : "",
        source_published_at: sourcePublishedAt,
        retrieved_at: retrievedAt,
        profile_metadata: profileProfileMetadata(profile),
      }],
    });
    seenCiks.add(cik);
  });
  if (profileCoverage.scope === "complete_sec_universe") {
    const missingEligibleSymbols = [...eligibleSymbols].filter((symbol) =>
      !profilesBySymbol.has(symbol) && !skippedProfileSymbols.has(symbol),
    );
    if (missingEligibleSymbols.length > 0) {
      throw new Error(`Profile input complete_sec_universe is missing eligible SEC symbols: ${missingEligibleSymbols.slice(0, 20).join(", ")}`);
    }
  }
  const missingRequestedSymbols = profileCoverage.requestedSymbols
    .map((symbol) => symbol.toUpperCase())
    .filter((symbol) => !profilesBySymbol.has(symbol) && !skippedProfileSymbols.has(symbol));
  profilesBySymbol.profilePurpose = profilePurpose;
  profilesBySymbol.profileSource = requiredProfileString(parsed.source, "Profile input source");
  profilesBySymbol.profileGeneratedAt = requiredProfileString(parsed.generated_at, "Profile input generated_at");
  profilesBySymbol.profileDeclaredCount = parsed.profile_count;
  profilesBySymbol.profileSourceFiles = parsed.source_files;
  profilesBySymbol.profileTextFields = rootTextFields;
  profilesBySymbol.profileCoverageStrategy = profileCoverage.strategy;
  profilesBySymbol.profileCoverageScope = profileCoverage.scope;
  profilesBySymbol.profileRequestedSymbols = profileCoverage.requestedSymbols;
  profilesBySymbol.profileSelectedSymbolCount = profileCoverage.selectedSymbolCount;
  profilesBySymbol.profileEligibleUniverseCount = profileCoverage.eligibleUniverseCount;
  profilesBySymbol.profileCoverageLimit = profileCoverage.coverageLimit;
  profilesBySymbol.profileAuditedSymbolCount = profilesBySymbol.size + skippedProfileSymbols.size;
  profilesBySymbol.profileLoadedCount = profilesBySymbol.size;
  profilesBySymbol.profileMissingRequestedSymbols = missingRequestedSymbols;
  profilesBySymbol.profileSamplingNote = profileCoverage.samplingNote;
  profilesBySymbol.profileSkippedSymbolCount = skippedProfileSymbols.size;
  profilesBySymbol.profileInputSha256 = sha256(profileInputContent);
  return profilesBySymbol;
}

function skippedProfileSymbolsFrom(parsed) {
  if (parsed.skipped_symbols === undefined) {
    return new Set();
  }
  if (!Array.isArray(parsed.skipped_symbols)) {
    throw new Error("Profile input skipped_symbols must be an array when present");
  }
  return new Set(parsed.skipped_symbols.map((entry, index) =>
    requiredProfileString(entry?.symbol, `Profile input skipped_symbols[${index}].symbol`).toUpperCase(),
  ));
}

function validateProfileInputMetadata({
  currentEligibleUniverseCount,
  parsed,
  profilePurpose,
  profiles,
}) {
  requiredProfileString(parsed.generated_at, "Profile input generated_at");
  requiredProfileString(parsed.source, "Profile input source");
  if (!Number.isInteger(parsed.profile_count)) {
    throw new Error("Profile input profile_count must be an integer");
  }
  if (parsed.profile_count !== profiles.length) {
    throw new Error(`Profile input profile_count ${parsed.profile_count} does not match profiles length ${profiles.length}`);
  }
  if (!Array.isArray(parsed.source_files) || parsed.source_files.length === 0) {
    throw new Error("Profile input source_files must be a non-empty array");
  }
  parsed.source_files.forEach((sourceFile, index) => {
    requiredProfileString(sourceFile, `Profile input source_files[${index}]`);
  });
  return profileCoverageMetadata({
    currentEligibleUniverseCount,
    parsed,
    profilePurpose,
  });
}

function profileCoverageMetadata({
  currentEligibleUniverseCount,
  parsed,
  profilePurpose,
}) {
  if (profilePurpose !== "issuer_universe_discovery") {
    return {
      coverageLimit: 0,
      eligibleUniverseCount: 0,
      requestedSymbols: [],
      samplingNote: "",
      scope: "",
      selectedSymbolCount: 0,
      strategy: "",
    };
  }
  const strategy = requiredProfileString(
    parsed.profile_coverage_strategy ?? parsed.selection_strategy,
    "Profile input profile_coverage_strategy",
  );
  const scope = requiredProfileString(parsed.coverage_scope, "Profile input coverage_scope");
  const requestedSymbols = requiredProfileStringArray(parsed.requested_symbols, "Profile input requested_symbols");
  const selectedSymbolCount = requiredProfileInteger(parsed.selected_symbol_count, "Profile input selected_symbol_count");
  const eligibleUniverseCount = requiredProfileInteger(parsed.eligible_universe_count, "Profile input eligible_universe_count");
  const coverageLimit = requiredProfileInteger(parsed.coverage_limit, "Profile input coverage_limit");
  const samplingNote = requiredProfileString(parsed.sampling_note, "Profile input sampling_note");
  validateCoverageStrategy({
    coverageLimit,
    currentEligibleUniverseCount,
    eligibleUniverseCount,
    requestedSymbols,
    scope,
    selectedSymbolCount,
    strategy,
  });
  return {
    coverageLimit,
    eligibleUniverseCount,
    requestedSymbols,
    samplingNote,
    scope,
    selectedSymbolCount,
    strategy,
  };
}

function validateCoverageStrategy({
  coverageLimit,
  currentEligibleUniverseCount,
  eligibleUniverseCount,
  requestedSymbols,
  scope,
  selectedSymbolCount,
  strategy,
}) {
  const expectedScopes = new Map([
    ["requested_symbols", "partial_requested_symbols"],
    ["first_n_sec_rows_smoke_test", "partial_first_n_smoke_test"],
    ["manual_profile_input_csv", "partial_manual_profile_input"],
    ["manifest_rows_without_sampling_metadata", "partial_manifest_rows_only"],
    ["complete_sec_universe", "complete_sec_universe"],
  ]);
  const expectedScope = expectedScopes.get(strategy);
  if (expectedScope !== undefined && scope !== expectedScope) {
    throw new Error(`Profile input coverage_scope ${scope} does not match ${strategy}; expected ${expectedScope}`);
  }
  if (eligibleUniverseCount !== currentEligibleUniverseCount) {
    throw new Error(`Profile input eligible_universe_count ${eligibleUniverseCount} does not match current SEC input eligible universe count ${currentEligibleUniverseCount}`);
  }
  if (strategy === "requested_symbols" && requestedSymbols.length === 0) {
    throw new Error("Profile input requested_symbols must be non-empty for requested_symbols coverage");
  }
  if (strategy === "complete_sec_universe" && selectedSymbolCount !== eligibleUniverseCount) {
    throw new Error("Profile input complete_sec_universe selected_symbol_count must equal eligible_universe_count");
  }
  if (strategy === "complete_sec_universe" && coverageLimit !== eligibleUniverseCount) {
    throw new Error("Profile input complete_sec_universe coverage_limit must equal eligible_universe_count");
  }
  if (!scope.startsWith("partial_") && scope !== "complete_sec_universe") {
    throw new Error("Profile input coverage_scope must be explicit about partial or complete coverage");
  }
}

function requiredProfileInteger(value, context) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${context} must be a non-negative integer`);
  }
  return value;
}

function requiredProfileStringArray(value, context) {
  if (!Array.isArray(value)) {
    throw new Error(`${context} must be an array`);
  }
  return value.map((item, index) => requiredProfileString(item, `${context}[${index}]`));
}

function optionalProfileTextFields(value, context) {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error(`${context} must be an array when present`);
  }
  return value.map((field, index) => requiredProfileString(field, `${context}[${index}]`));
}

function optionalProfileFieldTexts(value, context) {
  if (value === undefined) {
    return {};
  }
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    throw new Error(`${context} must be an object when present`);
  }
  return Object.fromEntries(Object.entries(value).map(([field, text]) => [
    requiredProfileString(field, `${context} key`),
    requiredProfileString(text, `${context}.${field}`),
  ]));
}

function profileProfileMetadata(profile) {
  const metadataFields = [
    "filing_accession_or_document_id",
    "filing_accession_number",
    "filing_acceptance_datetime",
    "filing_content_sha256",
    "filing_content_cache_status",
    "filing_content_request_attempt_count",
    "filing_content_request_statuses",
    "filing_primary_document",
    "filing_report_date",
    "filing_sec_form_original",
    "filing_business_prospectus_424b_candidate_count",
    "filing_foundational_candidate_count",
    "filing_lower_tier_newer_filing_forms",
    "filing_newer_supported_filing_displaced_count",
    "filing_newer_supported_filing_forms",
    "filing_selected_sec_form_base",
    "filing_selection_family",
    "filing_selection_policy",
    "filing_selection_reason",
    "filing_selection_tier",
    "filing_selection_warnings",
    "filing_submission_url",
    "filing_supplement_424b_candidate_count",
    "filing_unknown_424b_candidate_count",
    "extraction_method",
    "extraction_start_marker",
    "extraction_start_pattern",
    "extraction_start_pattern_label",
    "extraction_end_marker",
    "extraction_start_offset",
    "extraction_end_offset",
    "extraction_section_length",
    "extraction_warnings",
    "filing_type",
  ];
  return Object.fromEntries(metadataFields
    .filter((field) => profile?.[field] !== undefined)
    .map((field) => [field, profile[field]]));
}

function validateProfileFieldTexts({
  context,
  fieldTexts,
  profilePurpose,
  text,
  textFields,
  textTruncated,
}) {
  const fieldTextKeys = Object.keys(fieldTexts);
  if (fieldTextKeys.length > 0 && textFields.length === 0) {
    throw new Error(`${context}.profile_field_texts requires profile_text_fields`);
  }
  if (profilePurpose === "issuer_universe_discovery" && textFields.length === 0) {
    throw new Error(`${context}.profile_text_fields is required for issuer_universe_discovery profiles`);
  }
  if (profilePurpose === "issuer_universe_discovery" && fieldTextKeys.length === 0) {
    throw new Error(`${context}.profile_field_texts is required for issuer_universe_discovery profiles`);
  }
  if (textFields.length === 0 && fieldTextKeys.length === 0) {
    return;
  }
  const allowedFields = new Set(textFields);
  for (const field of fieldTextKeys) {
    if (!allowedFields.has(field)) {
      throw new Error(`${context}.profile_field_texts.${field} is not listed in profile_text_fields`);
    }
  }
  for (const field of textFields) {
    if (!(field in fieldTexts)) {
      throw new Error(`${context}.profile_field_texts.${field} is required by profile_text_fields`);
    }
  }
  for (const [field, fieldText] of Object.entries(fieldTexts)) {
    const normalizedText = normalizeSearchText(text);
    const normalizedFieldText = normalizeSearchText(fieldText);
    const represented = textTruncated
      ? normalizedFieldText.startsWith(normalizedText) || normalizedText.includes(normalizedFieldText)
      : normalizedText.includes(normalizedFieldText);
    if (!represented) {
      throw new Error(`${context}.profile_field_texts.${field} is not represented in profile text`);
    }
  }
}

function normalizeCik(value) {
  const raw = String(value ?? "").trim();
  const digits = raw.replace(/^0+/, "");
  return digits === "" ? "0" : digits;
}

function requiredProfileString(value, context) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${context} is required`);
  }
  return value.trim();
}

async function loadCompanyList({ input }) {
  if (input !== undefined) {
    const content = readFileSync(input, "utf8");
    const companies = parseSecCompanyList(JSON.parse(content));
    return {
      companies,
      metadata: {
        fetchedAt: statSync(input).mtime.toISOString(),
        rowCount: companies.length,
        sha256: sha256(content),
        source: input,
      },
    };
  }
  return fetchSecCompanyList();
}

async function fetchSecCompanyList() {
  const response = await fetchSecTextWithRetry({
    accept: "application/json,*/*",
    context: "SEC company ticker exchange request failed",
    sourceUrl: secCompanyTickersExchangeUrl,
  });
  const fetchedAt = new Date().toISOString();
  const content = response.content;
  const companies = parseSecCompanyList(JSON.parse(content));
  return {
    companies,
    metadata: {
      fetchedAt,
      rowCount: companies.length,
      sha256: sha256(content),
      source: secCompanyTickersExchangeUrl,
    },
  };
}

function parseSecCompanyList(body) {
  const fields = body.fields ?? [];
  if (!Array.isArray(fields) || !Array.isArray(body.data)) {
    throw new Error("SEC company list input must contain fields and data arrays");
  }
  ["cik", "name", "ticker", "exchange"].forEach((field) => {
    if (!fields.includes(field)) {
      throw new Error(`SEC company list input is missing required field ${field}`);
    }
  });
  return (body.data ?? []).map((row) =>
    Object.fromEntries(fields.map((field, index) => [field, row[index]])),
  );
}

function isEligibleDiscoveryCompany(company) {
  const exchange = String(company.exchange ?? "");
  const symbol = String(company.ticker ?? "").toUpperCase();
  const cik = normalizeCik(company.cik);
  return symbol !== "" && cik !== "0" && allowedDiscoveryExchanges.has(exchange);
}

function scanCompanies({
  companies,
  companyProfiles,
  discoveryLanes,
  knownSymbolSources,
}) {
  const candidates = [];
  const exploratoryMatches = [];
  const suppressedMatches = [];
  const secSymbols = new Set(
    companies.map((company) => String(company.ticker ?? "").toUpperCase()).filter(Boolean),
  );
  for (const company of companies) {
    const cik = String(company.cik ?? "");
    const symbol = String(company.ticker ?? "").toUpperCase();
    const name = String(company.name ?? "");
    const exchange = String(company.exchange ?? "");
    const securityForm = classifySecurityForm({
      name,
      secSymbols,
      symbol,
    });
    if (
      symbol === ""
      || name === ""
      || !allowedDiscoveryExchanges.has(exchange)
      || !securityForm.scanEligible
    ) {
      continue;
    }

    const profile = companyProfiles.get(symbol);
    const laneMatches = matchLanes({
      lanes: discoveryLanes,
      name,
      profile,
      symbol,
    });
    if (laneMatches.length === 0) {
      continue;
    }
    const primaryLaneMatch = laneMatches[0];
    const candidate = {
      cik,
      symbol,
      name,
      exchange,
      laneId: primaryLaneMatch.lane_id,
      laneName: primaryLaneMatch.lane_name,
      laneStatus: primaryLaneMatch.lane_status,
      keywords: primaryLaneMatch.matched_keywords,
      score: primaryLaneMatch.score,
      priority: primaryLaneMatch.priority,
      reviewDepth: primaryLaneMatch.review_depth,
      keywordSignal: primaryLaneMatch.keyword_signal,
      falsePositiveFlags: primaryLaneMatch.false_positive_flags,
      matchedFields: primaryLaneMatch.matched_fields,
      matchedKeywordScopes: primaryLaneMatch.matched_keyword_scopes,
      matchedKeywordVariants: primaryLaneMatch.matched_keyword_variants,
      matchedKeywordFields: primaryLaneMatch.matched_keyword_fields,
      matchedProfileSnippets: primaryLaneMatch.matched_profile_snippets,
      matchSources: primaryLaneMatch.match_sources,
      profileEnriched: primaryLaneMatch.profile_enriched,
      profileMetadata: primaryLaneMatch.profile_enriched ? profile?.profile_metadata ?? {} : {},
      profileSources: primaryLaneMatch.profile_enriched ? profile?.sources ?? [] : [],
      profileTextFields: primaryLaneMatch.profile_enriched ? profile?.text_fields ?? [] : [],
      profileTextTruncated: primaryLaneMatch.profile_enriched ? profile?.text_truncated ?? false : false,
      requiresSecurityTypeConfirmation: securityForm.requiresConfirmation,
      securityForm: securityForm.form,
      securityFormConfidence: securityForm.confidence,
      laneMatches,
    };
    if (isExploratoryLaneCandidate(candidate)) {
      exploratoryMatches.push(candidate);
      continue;
    }
    if (knownSymbolSources.has(symbol)) {
      suppressedMatches.push({
        ...candidate,
        knownSources: knownSymbolSources.get(symbol),
      });
      continue;
    }
    candidates.push(candidate);
  }

  return {
    candidates: sortCandidates(candidates),
    exploratoryMatches: sortCandidates(exploratoryMatches),
    suppressedMatches: sortCandidates(suppressedMatches),
  };
}

function isExploratoryLaneCandidate(candidate) {
  return exploratoryLaneIds.has(candidate.laneId);
}

function sortCandidates(candidates) {
  return candidates.sort((left, right) =>
    right.score - left.score
      || priorityRank(left.priority) - priorityRank(right.priority)
      || left.laneId.localeCompare(right.laneId)
      || left.symbol.localeCompare(right.symbol),
  );
}

function matchLanes({
  lanes,
  name,
  profile,
  symbol,
}) {
  const fields = companyMatchFields({
    name,
    profile,
    symbol,
  });
  return lanes
    .map((lane) => {
      const keywordEvidence = matchingKeywordEvidence(lane, fields);
      const keywords = keywordEvidence.map((match) => match.keyword);
      if (keywords.length === 0) {
        return undefined;
      }
      const scored = scoreCandidate({
        keywordEvidence,
        lane,
        keywords,
        name,
        symbol,
      });
      return {
        lane_id: lane.id,
        lane_name: lane.name,
        lane_status: lane.status,
        matched_keywords: keywords,
        matched_keyword_scopes: matchedKeywordScopes(keywordEvidence),
        matched_keyword_variants: matchedKeywordVariants(keywordEvidence),
        matched_fields: matchedFields(keywordEvidence),
        matched_keyword_fields: matchedKeywordFields(keywordEvidence),
        matched_profile_snippets: matchedProfileSnippets(keywordEvidence),
        match_sources: matchSources(keywordEvidence),
        profile_enriched: isProfileEnriched(keywordEvidence),
        score: scored.score,
        priority: scored.priority,
        review_depth: scored.reviewDepth,
        keyword_signal: scored.keywordSignal,
        false_positive_flags: scored.falsePositiveFlags,
      };
    })
    .filter((match) => match !== undefined)
    .sort((left, right) =>
      right.score - left.score
        || priorityRank(left.priority) - priorityRank(right.priority)
        || left.lane_id.localeCompare(right.lane_id),
    );
}

function scoreCandidate({
  keywordEvidence,
  lane,
  keywords,
  name,
  symbol,
}) {
  const normalizedKeywords = keywords.map((keyword) => keyword.toLowerCase());
  const highSignalEvidence = keywordEvidence.filter((match) =>
    highSignalKeywords.has(match.keyword.toLowerCase()),
  );
  const supportedHighSignals = highSignalEvidence.filter((match) => !isTickerOnlyKeywordMatch(match));
  const tickerOnlyHighSignals = highSignalEvidence.filter(isTickerOnlyKeywordMatch);
  const lowSignals = normalizedKeywords.filter((keyword) => lowSignalKeywords.has(keyword));
  const profileOnly = isProfileOnlyMatch(keywordEvidence);
  const tickerOnly = isTickerOnlyMatch(keywordEvidence);
  const falsePositiveFlags = lowSignalNamePatterns
    .filter(({ pattern }) => pattern.test(name))
    .map(({ id }) => id);
  if (tickerOnlyHighSignals.length > 0) {
    falsePositiveFlags.push("ticker_keyword_collision");
  }
  const falsePositivePenalty = lowSignalNamePatterns
    .filter(({ pattern }) => pattern.test(name))
    .reduce((total, { penalty }) => total + penalty, 0);
  const laneStatusBonus = lane.status === "active" ? 10 : 0;
  const keywordScore = Math.min(keywords.length * 10, 30);
  const highSignalScore = supportedHighSignals.length * 25;
  const lowSignalPenalty = lowSignals.length * 8;
  const symbolBonus = !tickerOnly && normalizedKeywords.some((keyword) =>
    keyword.length >= 3 && symbol.toLowerCase().includes(keyword.replaceAll("-", "")),
  )
    ? 5
    : 0;
  let score = Math.max(
    0,
    40
      + laneStatusBonus
      + keywordScore
      + highSignalScore
      + symbolBonus
      - lowSignalPenalty
      - falsePositivePenalty,
  );
  if (profileOnly && supportedHighSignals.length < minProfileOnlyHighSignalKeywordsForHighPriority) {
    score = Math.min(score, highPriorityThreshold - 1);
  }
  if (tickerOnly) {
    score = Math.min(score, tickerOnlyMatchScoreCap);
  }
  const priority = priorityForScore(score);
  return {
    score,
    priority,
    reviewDepth: reviewDepthForPriority(priority),
    keywordSignal: keywordSignal({
      supportedHighSignals,
      tickerOnlyHighSignals,
    }),
    falsePositiveFlags,
  };
}

function keywordSignal({
  supportedHighSignals,
  tickerOnlyHighSignals,
}) {
  if (supportedHighSignals.length > 0) {
    return "high_signal";
  }
  if (tickerOnlyHighSignals.length > 0) {
    return "ticker_only_signal";
  }
  return "generic_signal";
}

function priorityForScore(score) {
  if (score >= highPriorityThreshold) {
    return "high";
  }
  if (score >= mediumPriorityThreshold) {
    return "medium";
  }
  return "low";
}

function reviewDepthForPriority(priority) {
  if (priority === "high") {
    return "readiness_triage_priority";
  }
  if (priority === "medium") {
    return "primary_source_skim";
  }
  return "false_positive_filter_before_primary_skim";
}

function priorityRank(priority) {
  if (priority === "high") {
    return 0;
  }
  if (priority === "medium") {
    return 1;
  }
  return 2;
}

function countBy(items, keyFn) {
  return items.reduce((counts, item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function countFlags(candidates) {
  return candidates.reduce((counts, candidate) => {
    for (const flag of candidate.falsePositiveFlags) {
      counts[flag] = (counts[flag] ?? 0) + 1;
    }
    return counts;
  }, {});
}

function buildRecallDiagnostics({
  companies,
  companyProfiles,
  discoveryLanes,
}) {
  const companiesBySymbol = new Map(
    companies.map((company) => [String(company.ticker ?? "").toUpperCase(), company]),
  );
  const expectedRows = [];
  const expectedLaneIdsBySymbol = new Map();
  for (const lane of discoveryLanes) {
    for (const symbol of lane.current_public_proxies ?? []) {
      const normalizedSymbol = String(symbol).toUpperCase();
      const expectedLaneIds = expectedLaneIdsBySymbol.get(normalizedSymbol) ?? [];
      expectedLaneIds.push(lane.id);
      expectedLaneIdsBySymbol.set(normalizedSymbol, expectedLaneIds);
      expectedRows.push({
        symbol: normalizedSymbol,
        expectedLaneId: lane.id,
      });
    }
    for (const symbol of lane.private_or_future_proxies ?? []) {
      expectedRows.push({
        symbol: String(symbol).toUpperCase(),
        expectedLaneId: lane.id,
        recallScope: "out_of_scope_private_or_future_proxy",
      });
    }
  }
  return expectedRows.map(({ symbol, expectedLaneId, recallScope = "sec_listed_public_proxy" }) => {
    if (recallScope === "out_of_scope_private_or_future_proxy") {
      return {
        symbol,
        sec_name: "",
        expected_lane_id: expectedLaneId,
        expected_lane_ids_for_symbol: [expectedLaneId],
        status: "out_of_scope_private_or_future_proxy",
        recall_scope: recallScope,
        would_match_expected_lane: false,
        matched_any_expected_lane: false,
        matched_expected_lane_ids: [],
        matched_lane_ids: [],
        matched_fields: [],
        match_sources: [],
        profile_sources: companyProfiles.get(symbol)?.sources ?? [],
        missed_reason: "Proxy is intentionally outside the current SEC-listed public recall denominator.",
        suggested_review: "Move this symbol into current_public_proxies only after it becomes an eligible SEC-listed public security for deterministic recall.",
      };
    }
    const company = companiesBySymbol.get(symbol);
    if (company === undefined) {
      const expectedLaneIdsForSymbol = expectedLaneIdsBySymbol.get(symbol) ?? [expectedLaneId];
      return {
        symbol,
        sec_name: "",
        expected_lane_id: expectedLaneId,
        expected_lane_ids_for_symbol: expectedLaneIdsForSymbol,
        status: "missing_from_sec_input",
        recall_scope: recallScope,
        would_match_expected_lane: false,
        matched_any_expected_lane: false,
        matched_expected_lane_ids: [],
        matched_lane_ids: [],
        matched_fields: [],
        match_sources: [],
        profile_sources: companyProfiles.get(symbol)?.sources ?? [],
        missed_reason: "Expected lane proxy is not present in the SEC company input used for this scan.",
        suggested_review: "Check whether the symbol is delisted, renamed, private, excluded by the fixture, or missing from the SEC reference source.",
      };
    }
    const name = String(company.name ?? "");
    const profile = companyProfiles.get(symbol);
    const laneMatches = matchLanes({
      lanes: discoveryLanes,
      name,
      profile,
      symbol,
    });
    const matchedLaneIds = laneMatches.map((match) => match.lane_id);
    const expectedLaneIdsForSymbol = expectedLaneIdsBySymbol.get(symbol) ?? [expectedLaneId];
    const matchedExpectedLaneIds = matchedLaneIds
      .filter((laneId) => expectedLaneIdsForSymbol.includes(laneId));
    const organicMatchedExpectedLaneIds = laneMatches
      .filter((match) => expectedLaneIdsForSymbol.includes(match.lane_id))
      .filter((match) => hasOrganicKeywordMatch(match))
      .map((match) => match.lane_id);
    const wouldMatchExpectedLane = matchedLaneIds.includes(expectedLaneId);
    const status = recallDiagnosticStatus({
      matchedExpectedLaneIds,
      matchedLaneIds,
      wouldMatchExpectedLane,
    });
    return {
      symbol,
      sec_name: name,
      expected_lane_id: expectedLaneId,
      expected_lane_ids_for_symbol: expectedLaneIdsForSymbol,
      status,
      recall_scope: recallScope,
      would_match_expected_lane: wouldMatchExpectedLane,
      matched_any_expected_lane: matchedExpectedLaneIds.length > 0,
      matched_expected_lane_ids: matchedExpectedLaneIds,
      organic_matched_any_expected_lane: organicMatchedExpectedLaneIds.length > 0,
      organic_matched_expected_lane_ids: organicMatchedExpectedLaneIds,
      ticker_only_expected_lane_recall: matchedExpectedLaneIds.length > 0 && organicMatchedExpectedLaneIds.length === 0,
      matched_lane_ids: matchedLaneIds,
      matched_fields: matchedFieldsFromLaneMatches(laneMatches),
      match_sources: matchSourcesFromLaneMatches(laneMatches),
      profile_sources: profile?.sources ?? [],
      missed_reason: wouldMatchExpectedLane
        ? ""
        : "Expected lane proxy does not match current deterministic name, ticker, or profile keyword rules.",
      suggested_review: wouldMatchExpectedLane
        ? "No recall action from deterministic scanner."
        : "Add lane aliases, compound terms, or bounded filing-text enrichment if this proxy should be rediscoverable.",
    };
  });
}

function hasOrganicKeywordMatch(laneMatch) {
  return Object.values(laneMatch.matched_keyword_scopes ?? {})
    .some((scope) => scope !== "current_public_proxy_symbols");
}

function matchedFieldsFromLaneMatches(laneMatches) {
  return [...new Set(laneMatches.flatMap((match) => match.matched_fields ?? []))].sort();
}

function matchSourcesFromLaneMatches(laneMatches) {
  return [...new Set(laneMatches.flatMap((match) => match.match_sources ?? []))].sort();
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

function recallDiagnosticStatus({
  matchedExpectedLaneIds,
  matchedLaneIds,
  wouldMatchExpectedLane,
}) {
  if (wouldMatchExpectedLane) {
    return "matched_expected_lane";
  }
  if (matchedExpectedLaneIds.length > 0) {
    return "matched_other_expected_lane";
  }
  if (matchedLaneIds.length > 0) {
    return "matched_non_expected_lane_only";
  }
  return "missed_all_lanes";
}

function summarizeUniqueRecall(recallDiagnostics) {
  const diagnosticsBySymbol = new Map();
  for (const diagnostic of recallDiagnostics.filter((item) => item.recall_scope === "sec_listed_public_proxy")) {
    const current = diagnosticsBySymbol.get(diagnostic.symbol) ?? [];
    current.push(diagnostic);
    diagnosticsBySymbol.set(diagnostic.symbol, current);
  }
  const misses = [...diagnosticsBySymbol.values()].filter((diagnostics) =>
    diagnostics.every((diagnostic) => diagnostic.matched_expected_lane_ids.length === 0),
  );
  return {
    proxyCount: diagnosticsBySymbol.size,
    proxyMissCount: misses.length,
  };
}

function buildKnownSymbolSources() {
  const sourcesBySymbol = new Map();
  addKnownRows({
    rows: csvRecords(watchlistFile),
    sourceName: "watchlist",
    sourcesBySymbol,
    describe: (row) => row.status,
  });
  addKnownRows({
    rows: csvRecords(securityMasterFile),
    sourceName: "security_master",
    sourcesBySymbol,
    describe: (row) => row.tradability,
  });
  addKnownRows({
    rows: csvRecords(candidatesFile),
    sourceName: "discovery_candidates",
    sourcesBySymbol,
    describe: (row) => row.status,
  });
  return sourcesBySymbol;
}

function addKnownRows({
  rows,
  sourceName,
  sourcesBySymbol,
  describe,
}) {
  for (const row of rows) {
    const symbol = String(row.symbol ?? "").toUpperCase();
    if (symbol === "") {
      continue;
    }
    const current = sourcesBySymbol.get(symbol) ?? [];
    current.push(`${sourceName}:${describe(row) ?? "present"}`);
    sourcesBySymbol.set(symbol, current);
  }
}

function classifySecurityForm({
  name,
  secSymbols,
  symbol,
}) {
  const lowerName = name.toLowerCase();
  if (hasHyphenatedOrDottedSuffix(symbol, ["P", "PR"]) || /\b(preferred|preference|depositary share)\b/i.test(name)) {
    return securityFormResult({
      confidence: "high",
      form: "preferred_or_depositary_share",
      scanEligible: false,
    });
  }
  if (hasHyphenatedOrDottedSuffix(symbol, ["U", "UN", "UNIT"]) || /\b(units?|unit trust|partnership units|common units)\b/i.test(name)) {
    return securityFormResult({
      confidence: "high",
      form: "unit_or_partnership_security",
      scanEligible: false,
    });
  }
  if (/\bwarrants?\b/i.test(name) || derivativeSuffixBaseExists(symbol, secSymbols, ["W", "WS", "WT", "WW", "WWW", "AW", "BW", "CW"])) {
    return securityFormResult({
      confidence: "high",
      form: "warrant",
      scanEligible: false,
    });
  }
  if (/\brights?\b/i.test(name) || derivativeSuffixBaseExists(symbol, secSymbols, ["R", "RT"])) {
    return securityFormResult({
      confidence: "high",
      form: "right",
      scanEligible: false,
    });
  }
  if (/\b(fund|etf|closed[- ]end|opportunities fund|income fund|trust)\b/i.test(lowerName)) {
    return securityFormResult({
      confidence: "medium",
      form: "fund_or_trust_like_security",
      scanEligible: true,
    });
  }
  if (/\b(l\.p\.|limited partnership)\b/i.test(name)) {
    return securityFormResult({
      confidence: "medium",
      form: "partnership_security",
      scanEligible: true,
    });
  }
  return securityFormResult({
    confidence: "low",
    form: "unconfirmed_public_equity",
    scanEligible: true,
  });
}

function derivativeSuffixBaseExists(symbol, secSymbols, suffixes) {
  return suffixes.some((suffix) => {
    const bases = derivativeSuffixBaseSymbols(symbol, suffix);
    return bases.some((base) => secSymbols.has(base));
  });
}

function derivativeSuffixBaseSymbols(symbol, suffix) {
  const bases = [];
  if (symbol.endsWith(suffix) && symbol.length > suffix.length) {
    bases.push(symbol.slice(0, -suffix.length));
  }
  [`-${suffix}`, `.${suffix}`].forEach((decoratedSuffix) => {
    if (symbol.endsWith(decoratedSuffix) && symbol.length > decoratedSuffix.length) {
      bases.push(symbol.slice(0, -decoratedSuffix.length));
    }
  });
  return bases
    .map((base) => base.replace(/[-.]$/, ""))
    .filter((base) => base !== "");
}

function hasHyphenatedOrDottedSuffix(symbol, suffixes) {
  return suffixes.some((suffix) =>
    symbol.endsWith(`-${suffix}`)
    || symbol.endsWith(`.${suffix}`),
  );
}

function securityFormResult({
  confidence,
  form,
  scanEligible,
}) {
  return {
    confidence,
    form,
    requiresConfirmation: true,
    scanEligible,
  };
}

function companyMatchFields({
  name,
  profile,
  symbol,
}) {
  const fields = [
    {
      id: "issuer_name",
      source: "sec_issuer_reference",
      text: name,
    },
    {
      id: "ticker",
      source: "sec_issuer_reference",
      text: symbol,
    },
  ];
  if (profile !== undefined) {
    fields.push({
      id: "profile_text",
      profile_field_texts: profile.field_texts ?? {},
      source: "profile_input",
      text: profile.text,
    });
    Object.entries(profile.field_texts ?? {}).forEach(([fieldId, fieldText]) => {
      fields.push({
        id: "profile_text",
        profile_field_texts: {
          [fieldId]: fieldText,
        },
        source: "profile_input",
        text: fieldText,
      });
    });
  }
  return fields;
}

function matchingKeywordEvidence(lane, fields) {
  return [
    ...fieldScopedKeywordEvidence({
      keywordScope: "current_public_proxy_symbols",
      fields,
      keywords: lane.current_public_proxies ?? [],
      allowedFieldIds: new Set(["ticker"]),
      exactTickerOnly: true,
    }),
    ...fieldScopedKeywordEvidence({
      keywordScope: "screen_keywords",
      fields,
      keywords: lane.screen_keywords ?? [],
      allowedFieldIds: undefined,
      exactTickerOnly: false,
    }),
    ...fieldScopedKeywordEvidence({
      keywordScope: "profile_keywords",
      fields,
      keywords: lane.profile_keywords ?? [],
      allowedFieldIds: new Set(["profile_text"]),
      exactTickerOnly: false,
    }),
  ];
}

function fieldScopedKeywordEvidence({
  exactTickerOnly,
  keywordScope,
  fields,
  keywords,
  allowedFieldIds,
}) {
  return keywords
    .map((keyword) => String(keyword).trim())
    .filter((keyword) => keyword !== "")
    .map((keyword) => {
      const fieldMatches = fields
        .filter((field) => allowedFieldIds === undefined || allowedFieldIds.has(field.id))
        .map((field) => {
          const match = keywordMatchDetails(keyword, field.text, {
            exactTickerOnly: exactTickerOnly && field.id === "ticker",
          });
          return {
            field_id: field.id,
            matched_variant: match.matchedVariant,
            profile_text_field_ids: field.id === "profile_text"
              ? matchedProfileTextFields(field.profile_field_texts ?? {}, keyword)
              : [],
            source: field.source,
            snippet: field.id === "profile_text"
              ? profileSnippet(field.text, match.matchedVariant || keyword)
              : "",
            matched: match.matched,
          };
        })
        .filter((field) => field.matched)
        .map(({ field_id, matched_variant, profile_text_field_ids, source, snippet }) => ({
          field_id,
          matched_variant,
          profile_text_field_ids,
          source,
          snippet,
        }));
      return {
        keyword,
        keyword_scope: keywordScope,
        field_matches: fieldMatches,
      };
    })
    .filter((match) => match.field_matches.length > 0);
}

function keywordMatchesText(keyword, text) {
  return keywordMatchDetails(keyword, text).matched;
}

function keywordMatchDetails(keyword, text, {
  exactTickerOnly = false,
} = {}) {
  for (const variant of keywordSearchVariants(keyword, { exactTickerOnly })) {
    if (variantMatchesText(variant, text)) {
      return {
        matched: true,
        matchedVariant: variant,
      };
    }
  }
  return {
    matched: false,
    matchedVariant: "",
  };
}

function variantMatchesText(variant, text) {
  const escaped = escapeRegExp(normalizeSearchText(variant)).replaceAll(" ", "\\s+");
  const pattern = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
  return pattern.test(normalizeSearchText(text));
}

function keywordSearchVariants(keyword, {
  exactTickerOnly = false,
} = {}) {
  const normalized = normalizeSearchText(keyword);
  if (normalized === "") {
    return [];
  }
  if (exactTickerOnly) {
    return [normalized];
  }
  const parts = normalized.split(" ");
  const last = parts[parts.length - 1];
  const plural = pluralVariant(last);
  if (plural === last) {
    return [normalized];
  }
  return [...new Set([
    normalized,
    [...parts.slice(0, -1), plural].join(" "),
  ])];
}

function pluralVariant(value) {
  if (value.length <= 2 || value.endsWith("s")) {
    return value;
  }
  if (value.endsWith("y")) {
    return `${value.slice(0, -1)}ies`;
  }
  if (/(x|ch|sh)$/.test(value)) {
    return `${value}es`;
  }
  return `${value}s`;
}

function normalizeSearchText(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function matchedFields(keywordEvidence) {
  return [...new Set(
    keywordEvidence.flatMap((match) => match.field_matches.map((field) => field.field_id)),
  )].sort();
}

function matchedKeywordFields(keywordEvidence) {
  return Object.fromEntries(keywordEvidence.map((match) => [
    match.keyword,
    [...new Set(match.field_matches.map((field) => field.field_id))].sort(),
  ]));
}

function matchedKeywordScopes(keywordEvidence) {
  return Object.fromEntries(keywordEvidence.map((match) => [
    match.keyword,
    match.keyword_scope,
  ]));
}

function matchedKeywordVariants(keywordEvidence) {
  return Object.fromEntries(keywordEvidence.map((match) => [
    match.keyword,
    [...new Set(match.field_matches.map((field) => field.matched_variant).filter(Boolean))].sort(),
  ]));
}

function matchSources(keywordEvidence) {
  return [...new Set(
    keywordEvidence.flatMap((match) => match.field_matches.map((field) => field.source)),
  )].sort();
}

function matchedProfileSnippets(keywordEvidence) {
  return keywordEvidence
    .flatMap((match) =>
      match.field_matches
        .filter((field) => field.field_id === "profile_text" && field.snippet !== "")
        .map((field) => ({
          keyword: match.keyword,
          keyword_scope: match.keyword_scope,
          profile_text_field_ids: field.profile_text_field_ids,
          snippet: field.snippet,
        })),
    )
    .slice(0, 5);
}

function matchedProfileTextFields(fieldTexts, keyword) {
  return Object.entries(fieldTexts)
    .filter(([, text]) => keywordMatchesText(keyword, text))
    .map(([field]) => field)
    .sort();
}

function profileSnippet(text, keyword) {
  const normalizedKeyword = keyword.toLowerCase();
  const lowerText = text.toLowerCase();
  let index = lowerText.indexOf(normalizedKeyword);
  let matchLength = keyword.length;
  if (index < 0) {
    const fallbackToken = normalizeSearchText(keyword)
      .split(" ")
      .find((token) => token.length > 3 && lowerText.includes(token));
    if (fallbackToken !== undefined) {
      index = lowerText.indexOf(fallbackToken);
      matchLength = fallbackToken.length;
    }
  }
  if (index < 0) {
    return "";
  }
  const snippetRadius = 70;
  const start = Math.max(0, index - snippetRadius);
  const end = Math.min(text.length, index + matchLength + snippetRadius);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

function isProfileEnriched(keywordEvidence) {
  return keywordEvidence.some((match) =>
    match.field_matches.some((field) => field.field_id === "profile_text"),
  );
}

function isProfileOnlyMatch(keywordEvidence) {
  const fields = matchedFields(keywordEvidence);
  return fields.length === 1 && fields[0] === "profile_text";
}

function isTickerOnlyMatch(keywordEvidence) {
  const fields = matchedFields(keywordEvidence);
  return fields.length === 1 && fields[0] === "ticker";
}

function isTickerOnlyKeywordMatch(keywordMatch) {
  const fields = [...new Set(keywordMatch.field_matches.map((field) => field.field_id))];
  return fields.length === 1 && fields[0] === "ticker";
}

function formatCandidates(candidates) {
  const rows = candidates.map((candidate) =>
    `${candidate.symbol}\t${candidate.exchange}\t${candidate.laneId}\t${candidate.priority}\t${candidate.score}\t${candidate.securityForm}\t${candidate.keywords.join("; ")}\t${candidate.matchedFields.join("; ")}\t${candidate.falsePositiveFlags.join("; ") || "none"}\t${candidate.name}`,
  );
  return [
    "symbol\texchange\tlane\tpriority\tscore\tsecurity_form\tmatched_keywords\tmatched_fields\tfalse_positive_flags\tname",
    ...rows,
  ].join("\n");
}

function appendCandidates(candidates, discoveredAt) {
  const existing = readFileSync(candidatesFile, "utf8");
  const rows = candidates.map((candidate) => {
    const flags = candidate.falsePositiveFlags.length === 0
      ? "none"
      : candidate.falsePositiveFlags.join("; ");
    const profileSource = candidate.profileEnriched
      ? candidate.profileSources[0]?.source_url ?? "missing_profile_source"
      : "none";
    const why = `Matched ${candidate.laneName} lane keywords: ${candidate.keywords.join("; ")} from ${candidate.matchedFields.join("; ")}; deterministic priority ${candidate.priority} with ${candidate.keywordSignal}; profile source: ${profileSource}; security form: ${candidate.securityForm} (${candidate.securityFormConfidence} confidence); false-positive flags: ${flags}; requires primary-source skim before watchlist promotion.`;
    return csvLine({
      symbol: candidate.symbol,
      name: candidate.name,
      exchange: candidate.exchange,
      asset_type: candidate.securityForm === "unconfirmed_public_equity"
        ? "security_type_unconfirmed"
        : candidate.securityForm,
      discovered_at: discoveredAt,
      discovery_source: candidate.profileEnriched
        ? "SEC company_tickers_exchange plus profile lane keyword scan"
        : "SEC company_tickers_exchange lane keyword scan",
      source_url: candidate.profileEnriched
        ? candidate.profileSources[0]?.source_url ?? secCompanyTickersExchangeUrl
        : secCompanyTickersExchangeUrl,
      source_published_at: candidate.profileEnriched
        ? candidate.profileSources[0]?.source_published_at ?? "not listed on profile input"
        : "not listed on SEC reference file",
      retrieved_at: candidate.profileEnriched
        ? candidate.profileSources[0]?.retrieved_at ?? discoveredAt
        : discoveredAt,
      first_seen_at: discoveredAt,
      theme: candidate.laneId,
      why_it_might_matter: why,
      status: "new",
      next_action: candidate.reviewDepth,
      notes: `Deterministic discovery candidate only; triage_score=${candidate.score}; security_form_confidence=${candidate.securityFormConfidence}; not a buy recommendation.`,
    });
  });
  const separator = existing.endsWith("\n") ? "" : "\n";
  writeFileSync(candidatesFile, `${existing}${separator}${rows.join("\n")}\n`);
}

function csvLine(record) {
  return candidateColumns.map((column) => csvEscape(record[column] ?? "")).join(",");
}

function csvEscape(value) {
  const text = String(value);
  if (!/[",\n\r]/.test(text)) {
    return text;
  }
  return `"${text.replaceAll("\"", "\"\"")}"`;
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
