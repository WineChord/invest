import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  fileSha256,
  readJson,
  requireNextArg,
  strictDate,
} from "./semantic-discovery-lib.mjs";
import {
  defaultCommunityCacheDir,
} from "./community-source-lib.mjs";

export const communityTriageSchemaVersion = 1;
export const communityTriageSource = "public_no_token_community_lead_triage";
export const defaultTriageTopCount = 30;
export const defaultHighPriorityScore = 55;
export const defaultMediumPriorityScore = 25;

const activeRepoStatuses = new Set(["active_candidate", "active_core_candidate"]);
const monitoredRepoStatuses = new Set([
  "incubating",
  "promoted",
  "research_only",
  "watch",
]);
const ambiguousTickerSymbols = new Set([
  "AI",
  "ARE",
  "BE",
  "CAN",
  "FOR",
  "GO",
  "HAS",
  "IT",
  "NOW",
  "ON",
  "OPEN",
  "PL",
  "POST",
  "REAL",
  "SO",
  "SPOT",
  "STEM",
  "TRUE",
  "UP",
]);
const broadMarketOrMegaCapSymbols = new Set([
  "AAPL",
  "AMD",
  "AMZN",
  "AVGO",
  "DIA",
  "GOOG",
  "GOOGL",
  "INTC",
  "META",
  "MSFT",
  "NVDA",
  "QQQ",
  "SMH",
  "SPY",
  "TSLA",
  "VOO",
]);
const sourceQualityWeights = [
  { match: (sourceId) => sourceId === "reddit_securityanalysis_new", weight: 12 },
  { match: (sourceId) => sourceId === "reddit_spaceinvestorsdaily_new", weight: 10 },
  { match: (sourceId) => sourceId === "reddit_stocks_top_week", weight: 8 },
  { match: (sourceId) => sourceId === "reddit_investing_new", weight: 7 },
  { match: (sourceId) => sourceId === "reddit_stocks_new", weight: 6 },
  { match: (sourceId) => sourceId === "stocktwits_trending_symbols", weight: 8 },
  { match: (sourceId) => sourceId.startsWith("hn_"), weight: 5 },
  { match: (sourceId) => sourceId.startsWith("stocktwits_symbol_"), weight: 5 },
  { match: (sourceId) => sourceId === "hacker_news_front_page", weight: 4 },
  { match: (sourceId) => sourceId.startsWith("reddit_wallstreetbets"), weight: 3 },
];

export function parseCommunityTriageArgs(args) {
  const parsed = {
    asOf: undefined,
    cacheDir: defaultCommunityCacheDir,
    highScore: defaultHighPriorityScore,
    json: false,
    mediumScore: defaultMediumPriorityScore,
    previousScan: undefined,
    scan: undefined,
    top: defaultTriageTopCount,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
      index += 1;
    } else if (arg === "--cache-dir") {
      parsed.cacheDir = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--high-score") {
      parsed.highScore = nonNegativeNumber(requireNextArg(args, index, arg), "--high-score");
      index += 1;
    } else if (arg === "--json") {
      parsed.json = true;
    } else if (arg === "--medium-score") {
      parsed.mediumScore = nonNegativeNumber(requireNextArg(args, index, arg), "--medium-score");
      index += 1;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--previous-scan") {
      parsed.previousScan = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--scan") {
      parsed.scan = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--top") {
      parsed.top = positiveInteger(requireNextArg(args, index, arg), "--top");
      index += 1;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }

  return parsed;
}

export function defaultCommunityScanPath(asOf, cacheDir = defaultCommunityCacheDir) {
  const date = strictDate(asOf, "asOf");
  return path.join(cacheDir, date, `${date}-public-community-scan.json`);
}

export function defaultCommunityTriagePath(asOf, cacheDir = defaultCommunityCacheDir) {
  const date = strictDate(asOf, "asOf");
  return path.join(cacheDir, date, `${date}-community-triage.json`);
}

export function findPreviousCommunityScan({
  asOf,
  cacheDir = defaultCommunityCacheDir,
  scanPath,
}) {
  const date = strictDate(asOf, "asOf");
  if (!existsSync(cacheDir)) {
    return undefined;
  }
  const candidates = readdirSync(cacheDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name) && entry.name < date)
    .map((entry) => defaultCommunityScanPath(entry.name, cacheDir))
    .filter((candidate) => existsSync(candidate) && path.resolve(candidate) !== path.resolve(scanPath ?? ""));
  return candidates.sort().at(-1);
}

export function loadCommunityScanForTriage(file) {
  const scan = readJson(file);
  if (scan?.source !== "public_no_token_community_scan") {
    throw new Error(`${file} is not a public no-token community scan`);
  }
  if (!Array.isArray(scan.symbol_signals)) {
    throw new Error(`${file} must include symbol_signals`);
  }
  return {
    file,
    scan,
    sha256: fileSha256(file),
  };
}

export function runCommunityLeadTriage({
  asOf,
  generatedAt = new Date().toISOString(),
  highScore = defaultHighPriorityScore,
  mediumScore = defaultMediumPriorityScore,
  previousScan,
  previousScanPath = "",
  previousScanSha256 = "",
  scan,
  scanPath,
  scanSha256,
  top = defaultTriageTopCount,
}) {
  const normalizedAsOf = strictDate(asOf ?? scan.as_of, "--as-of");
  const previousBySymbol = new Map(
    (previousScan?.symbol_signals ?? []).map((row) => [row.symbol, row]),
  );
  const leads = scan.symbol_signals
    .map((row) => triageSymbol(row, previousBySymbol.get(row.symbol), {
      highScore,
      mediumScore,
      scanAsOf: normalizedAsOf,
    }))
    .sort(compareLeadPriority);
  const topLeads = leads.slice(0, top);
  const analysisQueueLeads = leads.filter((lead) => lead.analysis_priority_bucket !== "low");
  const sourceTypeRankings = summarizeSourceTypeRankings(scan.source_type_symbol_rankings ?? [], top);
  const sourceRankings = summarizeSourceRankings(scan.source_symbol_rankings ?? [], top);
  const transitionSummary = summarizeTransitions(leads);

  return {
    schema_version: communityTriageSchemaVersion,
    source: communityTriageSource,
    generated_at: generatedAt,
    as_of: normalizedAsOf,
    scan_path: scanPath,
    scan_sha256: scanSha256,
    previous_scan_path: previousScanPath,
    previous_scan_sha256: previousScanSha256,
    previous_scan_status: previousScan === undefined ? "not_available" : "loaded",
    retrieval_boundary: scan.retrieval_boundary,
    policy_boundary: {
      community_signal_use: "analysis_priority_only",
      creates_buy_eligibility: false,
      creates_promotion_eligibility: false,
      creates_security_metadata: false,
      required_before_candidate_record:
        "security_type_confirmation_and_primary_source_skim",
      required_before_active_or_buy_zone:
        "discovery_readiness_and_fresh_promotion_review",
    },
    scoring_policy: {
      high_priority_score: highScore,
      medium_priority_score: mediumScore,
      components:
        "mention_count, source_diversity, source_quality, source_recency_decay, cross_scan_persistence, reason_keyword_fit, trend_delta, stocktwits_trending_score, novelty, and penalties for ambiguous or broad-market symbols",
    },
    source_status_counts: scan.source_status_counts ?? {},
    source_counts_by_type: scan.source_counts_by_type ?? {},
    lead_count: leads.length,
    high_priority_leads: leads.filter((lead) => lead.analysis_priority_bucket === "high").length,
    medium_priority_leads: leads.filter((lead) => lead.analysis_priority_bucket === "medium").length,
    transition_summary: transitionSummary,
    top_leads: topLeads,
    existing_symbol_priority_boosts: analysisQueueLeads.filter((lead) =>
      lead.triage_class === "existing_active_monitor"
      || lead.triage_class === "existing_research_priority_boost",
    ),
    new_symbol_primary_source_queue: analysisQueueLeads.filter((lead) =>
      lead.triage_class === "new_symbol_primary_source_skim",
    ),
    identity_confirmation_queue: leads.filter((lead) =>
      lead.triage_class === "symbol_identity_confirmation",
    ),
    broad_market_context_queue: analysisQueueLeads.filter((lead) =>
      lead.triage_class === "broad_market_context_only",
    ),
    source_type_leaderboards: sourceTypeRankings,
    source_leaderboards: sourceRankings,
    caveats: [
      "Community triage raises analysis priority only; it does not create buy eligibility.",
      "Unknown symbols require ticker identity, security type, exchange, and primary-source confirmation before any durable candidate record.",
      "Existing watchlist symbols still require current freshness, valuation, watchlist-cycle, readiness, and promotion gates before active or buy-zone changes.",
      "Stocktwits symbol streams are seeded from current watchlist and lane proxies, so their leaderboards are useful for attention monitoring but biased toward already-known symbols.",
    ],
  };
}

function triageSymbol(row, previous, {
  highScore,
  mediumScore,
  scanAsOf,
}) {
  const scoreComponents = scoreSymbol(row, previous, scanAsOf);
  const analysisPriorityScore = scoreComponents.total_score;
  return {
    symbol: row.symbol,
    name: row.name ?? "",
    analysis_priority_score: analysisPriorityScore,
    analysis_priority_bucket: priorityBucket(analysisPriorityScore, highScore, mediumScore),
    triage_class: triageClass(row, scoreComponents),
    recommended_next_action: recommendedNextAction(row, scoreComponents),
    buy_eligibility_effect: "none_community_signal_only",
    promotion_eligibility_effect: "none_requires_fresh_promotion_review",
    community_signal_score: row.community_signal_score ?? null,
    mention_count: row.mention_count ?? 0,
    source_count: row.source_count ?? 0,
    source_ids: row.source_ids ?? [],
    source_types: row.source_types ?? [],
    signal_types: row.signal_types ?? [],
    reason_keywords: row.reason_keywords ?? [],
    sample_urls: row.sample_urls ?? [],
    latest_source_published_at: row.latest_source_published_at ?? "",
    known_repo_symbol: row.known_repo_symbol === true,
    security_metadata_status: row.security_metadata_status ?? "",
    repo_status: row.repo_status ?? "",
    repo_tradability: row.repo_tradability ?? "",
    exchanges: row.exchanges ?? [],
    instrument_classes: row.instrument_classes ?? [],
    stocktwits_watchlist_count: row.stocktwits_watchlist_count ?? null,
    stocktwits_trending_score: row.stocktwits_trending_score ?? null,
    stocktwits_best_rank: row.stocktwits_best_rank ?? null,
    previous_scan: {
      present: previous !== undefined,
      mention_count: previous?.mention_count ?? null,
      community_signal_score: previous?.community_signal_score ?? null,
      mention_delta: previous === undefined ? null : Number(row.mention_count ?? 0) - Number(previous.mention_count ?? 0),
      community_signal_score_delta:
        previous === undefined
          ? null
          : Number((Number(row.community_signal_score ?? 0) - Number(previous.community_signal_score ?? 0)).toFixed(3)),
      new_in_scan: previous === undefined,
    },
    score_components: scoreComponents,
  };
}

function scoreSymbol(row, previous, scanAsOf) {
  const mentionCount = Number(row.mention_count ?? 0);
  const sourceCount = Number(row.source_count ?? 0);
  const reasonMentionCount = (row.reason_keywords ?? [])
    .reduce((sum, reason) => sum + Number(reason.mention_count ?? 0), 0);
  const sourceQualityScore = sourceQuality(row.source_ids ?? []);
  const sourceRecencyScore = sourceRecency(row.latest_source_published_at, scanAsOf);
  const persistenceScore = previous !== undefined && Number(previous.mention_count ?? 0) > 0 ? 5 : 0;
  const trendDelta = previous === undefined
    ? 0
    : Math.max(0, mentionCount - Number(previous.mention_count ?? 0));
  const isNewInScan = previous === undefined;
  const stocktwitsTrendingScore = Number(row.stocktwits_trending_score ?? 0);
  const ambiguityPenalty = isAmbiguousUnknownSymbol(row) ? 12 : 0;
  const broadMarketPenalty =
    broadMarketOrMegaCapSymbols.has(row.symbol) && row.known_repo_symbol !== true ? 10 : 0;
  const noReasonPenalty = reasonMentionCount === 0 ? 5 : 0;
  const unknownSecurityPenalty =
    row.known_repo_symbol !== true && row.security_metadata_status !== "stocktwits_us_stock" ? 5 : 0;
  const total = Math.max(0,
    Math.min(35, mentionCount * 0.75)
    + Math.min(20, sourceCount * 2)
    + sourceQualityScore
    + sourceRecencyScore
    + persistenceScore
    + Math.min(20, reasonMentionCount * 1.25)
    + Math.min(15, trendDelta * 1.5)
    + Math.min(15, stocktwitsTrendingScore * 2)
    + (isNewInScan ? 4 : 0)
    - ambiguityPenalty
    - broadMarketPenalty
    - noReasonPenalty
    - unknownSecurityPenalty,
  );
  return {
    mention_component: Number(Math.min(35, mentionCount * 0.75).toFixed(3)),
    source_diversity_component: Math.min(20, sourceCount * 2),
    source_quality_component: sourceQualityScore,
    source_recency_decay_component: sourceRecencyScore,
    cross_scan_persistence_component: persistenceScore,
    reason_keyword_component: Number(Math.min(20, reasonMentionCount * 1.25).toFixed(3)),
    trend_delta_component: Number(Math.min(15, trendDelta * 1.5).toFixed(3)),
    stocktwits_trending_component: Number(Math.min(15, stocktwitsTrendingScore * 2).toFixed(3)),
    novelty_component: isNewInScan ? 4 : 0,
    ambiguity_penalty: ambiguityPenalty,
    broad_market_or_mega_cap_penalty: broadMarketPenalty,
    no_reason_keyword_penalty: noReasonPenalty,
    unknown_security_penalty: unknownSecurityPenalty,
    total_score: Number(total.toFixed(3)),
  };
}

function sourceQuality(sourceIds) {
  const score = sourceIds.reduce((sum, sourceId) => {
    const match = sourceQualityWeights.find((entry) => entry.match(String(sourceId)));
    return sum + (match?.weight ?? 3);
  }, 0);
  return Math.min(20, score);
}

function sourceRecency(sourcePublishedAt, scanAsOf) {
  const published = strictDateOrUndefined(sourcePublishedAt);
  const asOf = strictDateOrUndefined(scanAsOf);
  if (published === undefined || asOf === undefined || published > asOf) {
    return 0;
  }
  const ageDays = daysBetween(published, asOf);
  if (ageDays <= 1) {
    return 8;
  }
  if (ageDays <= 3) {
    return 5;
  }
  if (ageDays <= 7) {
    return 2;
  }
  return 0;
}

function strictDateOrUndefined(value) {
  const text = String(value ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return undefined;
  }
  const parsed = new Date(`${text}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : text;
}

function daysBetween(startDate, endDate) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((Date.parse(`${endDate}T00:00:00.000Z`) - Date.parse(`${startDate}T00:00:00.000Z`)) / millisecondsPerDay);
}

function priorityBucket(score, highScore, mediumScore) {
  if (score >= highScore) {
    return "high";
  }
  if (score >= mediumScore) {
    return "medium";
  }
  return "low";
}

function triageClass(row, scoreComponents) {
  if (row.repo_tradability === "not_tradable") {
    return "not_tradable_reference_only";
  }
  if (isAmbiguousUnknownSymbol(row)) {
    return "symbol_identity_confirmation";
  }
  if (isBroadMarketOrMegaCapContext(row)) {
    return "broad_market_context_only";
  }
  if (activeRepoStatuses.has(row.repo_status)) {
    return "existing_active_monitor";
  }
  if (monitoredRepoStatuses.has(row.repo_status) || row.known_repo_symbol === true) {
    return "existing_research_priority_boost";
  }
  if (scoreComponents.total_score >= defaultMediumPriorityScore) {
    return "new_symbol_primary_source_skim";
  }
  return "low_signal_hold_for_persistence";
}

function recommendedNextAction(row, scoreComponents) {
  const classification = triageClass(row, scoreComponents);
  if (classification === "existing_active_monitor") {
    return "freshness_check_and_watchlist_cycle_priority_review";
  }
  if (classification === "existing_research_priority_boost") {
    return "watchlist_cycle_priority_boost_without_promotion";
  }
  if (classification === "new_symbol_primary_source_skim") {
    return "confirm_security_type_then_primary_source_skim_before_raw_candidate";
  }
  if (classification === "symbol_identity_confirmation") {
    return "confirm_ticker_identity_before_any_candidate_record";
  }
  if (classification === "broad_market_context_only") {
    return "treat_as_market_context_unless_it_reveals_a_new_direct_bottleneck_gap";
  }
  if (classification === "not_tradable_reference_only") {
    return "track_as_lane_context_only";
  }
  return "ignore_unless_signal_persists_or_primary_source_event_appears";
}

function compareLeadPriority(left, right) {
  return right.analysis_priority_score - left.analysis_priority_score
    || right.mention_count - left.mention_count
    || left.symbol.localeCompare(right.symbol);
}

function summarizeTransitions(leads) {
  return {
    existing_active_monitor: leads.filter((lead) => lead.triage_class === "existing_active_monitor").length,
    existing_research_priority_boost:
      leads.filter((lead) => lead.triage_class === "existing_research_priority_boost").length,
    new_symbol_primary_source_skim:
      leads.filter((lead) => lead.triage_class === "new_symbol_primary_source_skim").length,
    symbol_identity_confirmation:
      leads.filter((lead) => lead.triage_class === "symbol_identity_confirmation").length,
    broad_market_context_only:
      leads.filter((lead) => lead.triage_class === "broad_market_context_only").length,
    low_signal_hold_for_persistence:
      leads.filter((lead) => lead.triage_class === "low_signal_hold_for_persistence").length,
    not_tradable_reference_only:
      leads.filter((lead) => lead.triage_class === "not_tradable_reference_only").length,
  };
}

function summarizeSourceTypeRankings(rankings, top) {
  return rankings.map((ranking) => ({
    source_type: ranking.source_type,
    source_count: ranking.source_count,
    source_ids: ranking.source_ids ?? [],
    symbol_count: ranking.symbol_count,
    top_symbols: (ranking.symbols ?? []).slice(0, top).map(summarizeRankingSymbol),
  }));
}

function summarizeSourceRankings(rankings, top) {
  return rankings.map((ranking) => ({
    source_id: ranking.source_id,
    source_type: ranking.source_type,
    source_url: ranking.source_url,
    source_status: ranking.source_status,
    symbol_count: ranking.symbol_count,
    top_symbols: (ranking.symbols ?? []).slice(0, top).map(summarizeRankingSymbol),
  }));
}

function summarizeRankingSymbol(row) {
  return {
    symbol: row.symbol,
    name: row.name ?? "",
    mention_count: row.mention_count ?? 0,
    community_signal_score: row.community_signal_score ?? null,
    repo_status: row.repo_status ?? "",
    security_metadata_status: row.security_metadata_status ?? "",
    sample_urls: row.sample_urls ?? [],
  };
}

function isAmbiguousUnknownSymbol(row) {
  return row.known_repo_symbol !== true && ambiguousTickerSymbols.has(row.symbol);
}

function isBroadMarketOrMegaCapContext(row) {
  return row.known_repo_symbol !== true && broadMarketOrMegaCapSymbols.has(row.symbol);
}

function positiveInteger(value, context) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${context} must be a positive integer`);
  }
  return number;
}

function nonNegativeNumber(value, context) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${context} must be a non-negative number`);
  }
  return number;
}
