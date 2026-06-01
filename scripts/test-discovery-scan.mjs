import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = mkdtempSync(path.join(tmpdir(), "invest-discovery-scan-"));
const isolatedRepoRoot = path.join(fixtureRoot, "repo");
const fixturePath = path.join(fixtureRoot, "sec-company-tickers-exchange.json");
const completeCoverageFixturePath = path.join(fixtureRoot, "sec-complete-coverage-company-tickers-exchange.json");
const invalidFixturePath = path.join(fixtureRoot, "invalid-scan-output.json");
const profileFixturePath = path.join(fixtureRoot, "issuer-profiles.json");
const partialIssuerProfileFixturePath = path.join(fixtureRoot, "partial-issuer-profiles.json");
const incompleteCompleteIssuerProfileFixturePath = path.join(fixtureRoot, "incomplete-complete-issuer-profiles.json");
const invalidProfileFixturePath = path.join(fixtureRoot, "invalid-profiles.json");
const mismatchedProfileFixturePath = path.join(fixtureRoot, "mismatched-profiles.json");
const noPurposeProfileFixturePath = path.join(fixtureRoot, "no-purpose-profiles.json");
const unsupportedPurposeProfileFixturePath = path.join(fixtureRoot, "unsupported-purpose-profiles.json");
const badProfileCountFixturePath = path.join(fixtureRoot, "bad-profile-count.json");
const missingCoverageProfileFixturePath = path.join(fixtureRoot, "missing-coverage-profiles.json");
const missingIssuerFieldTextsFixturePath = path.join(fixtureRoot, "missing-issuer-field-texts.json");
const mismatchedFieldTextFixturePath = path.join(fixtureRoot, "mismatched-field-text.json");
const keywordVariantFixturePath = path.join(fixtureRoot, "keyword-variant-company-tickers-exchange.json");
const proxyCollisionFixturePath = path.join(fixtureRoot, "proxy-collision-company-tickers-exchange.json");
const truncatedFieldProfileFixturePath = path.join(fixtureRoot, "truncated-field-profiles.json");

writeIsolatedRepoFixture(isolatedRepoRoot);

writeFileSync(
  fixturePath,
  `${JSON.stringify({
    fields: ["cik", "name", "ticker", "exchange"],
    data: [
      [1001, "Orbital Launch Systems Inc.", "OLSI", "Nasdaq"],
      [1002, "Virtus Artificial Intelligence Opportunities Fund", "XAIO", "NYSE"],
      [1003, "Spectrum Brands Holdings Inc.", "XSPB", "NYSE"],
      [1004, "Quantum Networking Inc.", "XQNT", "Nasdaq"],
      [1005, "Mission Critical Platform Corp.", "XMCP", "NYSE American"],
      [1006, "Satellite Spectrum Connectivity Inc.", "XSSC", "Nasdaq"],
      [1819994, "Rocket Lab Corp", "RKLB", "Nasdaq"],
      [1780312, "AST SpaceMobile, Inc.", "ASTS", "Nasdaq"],
      [1007, "Generic Systems Inc.", "XGEN", "Nasdaq"],
      [1008, "Workspace Collaboration Inc.", "XWRK", "Nasdaq"],
      [1674101, "Vertiv Holdings Co", "VRT", "NYSE"],
      [1322422, "Hudbay Minerals Inc.", "HBM", "NYSE"],
      [2001, "Arcadia Systems Inc.", "ARCD", "Nasdaq"],
      [2002, "Communications Equipment Inc.", "XCEQ", "Nasdaq"],
      [2003, "Quantum Systems Warrants", "QSW", "Nasdaq"],
      [2004, "Quantum Acquisition Corp Units", "QAC-UN", "Nasdaq"],
      [2005, "Neutral Systems Inc.", "QSI", "Nasdaq"],
      [2006, "Quantum-Si Inc.", "QSIAW", "Nasdaq"],
    ],
  })}\n`,
);
writeFileSync(
  invalidFixturePath,
  `${JSON.stringify({ schema_version: 1, candidates: [] })}\n`,
);
writeFileSync(
  keywordVariantFixturePath,
  `${JSON.stringify({
    fields: ["cik", "name", "ticker", "exchange"],
    data: [
      [3001, "Orbital Satellites Inc.", "XSAT", "Nasdaq"],
    ],
  })}\n`,
);
writeFileSync(
  proxyCollisionFixturePath,
  `${JSON.stringify({
    fields: ["cik", "name", "ticker", "exchange"],
    data: [
      [4001, "Virtus Systems Inc.", "VRTS", "NYSE"],
      [4002, "IonQ Inc.", "IONQ", "NYSE"],
      [4003, "Quantum Systems Warrants", "IONQ-WT", "NYSE"],
    ],
  })}\n`,
);
writeFileSync(
  completeCoverageFixturePath,
  `${JSON.stringify({
    fields: ["cik", "name", "ticker", "exchange"],
    data: [
      [2001, "Arcadia Systems Inc.", "ARCD", "Nasdaq"],
      [2002, "Borealis Systems Inc.", "BRS", "Nasdaq"],
    ],
  })}\n`,
);
writeFileSync(
  profileFixturePath,
  `${JSON.stringify({
    schema_version: 1,
    generated_at: "2026-05-31T00:00:00.000Z",
    source: "profile_fixture",
    profile_purpose: "repo_research_recall_calibration",
    source_files: ["fixture://profiles"],
    profile_count: 8,
    profiles: [
      {
        symbol: "RKLB",
        cik: "0001819994",
        source_url: "fixture://profiles/rklb",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        profile_text_truncated: true,
        text: "Rocket Lab provides launch services, spacecraft, satellite buses, space systems, and orbital deployment.",
      },
      {
        symbol: "ASTS",
        cik: "0001780312",
        source_url: "fixture://profiles/asts",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        text: "AST SpaceMobile develops direct-to-device mobile satellite connectivity for ordinary phones.",
      },
      {
        symbol: "XAIO",
        cik: "1002",
        source_url: "fixture://profiles/xaio",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        text: "The fund markets artificial intelligence, GPU, inference, and AI cloud exposure.",
      },
      {
        symbol: "XSPB",
        cik: "1003",
        source_url: "fixture://profiles/xspb",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        text: "The brand profile mentions spectrum, mobile satellite, and connectivity words without owning that bottleneck.",
      },
      {
        symbol: "XGEN",
        cik: "1007",
        source_url: "fixture://profiles/xgen",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-28",
        text: "Generic systems describes a mission critical platform for infrastructure customers.",
      },
      {
        symbol: "XWRK",
        cik: "1008",
        source_url: "fixture://profiles/xwrk",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        text: "Workspace collaboration tools for office teams.",
      },
      {
        symbol: "VRT",
        cik: "0001674101",
        source_url: "fixture://profiles/vrt",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        text: "Vertiv compounds through AI data-center power, liquid-cooling, thermal, and service demand.",
      },
      {
        symbol: "ARCD",
        cik: "0000002001",
        source_url: "fixture://profiles/arcd",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        text: "Arcadia builds CXL memory pooling, retimer, and rack-scale interconnect systems for AI clusters.",
      },
    ],
  })}\n`,
);
writeFileSync(
  invalidProfileFixturePath,
  `${JSON.stringify({ schema_version: 1, candidates: [] })}\n`,
);
writeFileSync(
  partialIssuerProfileFixturePath,
  `${JSON.stringify({
    schema_version: 1,
    generated_at: "2026-05-31T00:00:00.000Z",
    source: "issuer_profile_fixture",
    profile_purpose: "issuer_universe_discovery",
    profile_text_fields: ["text"],
    source_files: ["fixture://issuer-profiles"],
    selection_strategy: "manual_profile_input_csv",
    profile_coverage_strategy: "manual_profile_input_csv",
    coverage_scope: "partial_manual_profile_input",
    requested_symbols: ["ARCD"],
    selected_symbol_count: 1,
    eligible_universe_count: 18,
    coverage_limit: 1,
    sampling_note: "Manual issuer profile fixture; coverage claims are limited to supplied rows.",
    profile_count: 1,
    profiles: [
      {
        symbol: "ARCD",
        cik: "0000002001",
        source_url: "fixture://profiles/arcd",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        profile_text_fields: ["text"],
        profile_field_texts: {
          text: "Arcadia builds CXL memory pooling and retimer systems.",
        },
        text: "Arcadia builds CXL memory pooling and retimer systems.",
      },
    ],
  })}\n`,
);
writeFileSync(
  incompleteCompleteIssuerProfileFixturePath,
  `${JSON.stringify({
    schema_version: 1,
    generated_at: "2026-05-31T00:00:00.000Z",
    source: "issuer_profile_fixture",
    profile_purpose: "issuer_universe_discovery",
    profile_text_fields: ["text"],
    source_files: ["fixture://issuer-profiles"],
    selection_strategy: "complete_sec_universe",
    profile_coverage_strategy: "complete_sec_universe",
    coverage_scope: "complete_sec_universe",
    requested_symbols: [],
    selected_symbol_count: 2,
    eligible_universe_count: 2,
    coverage_limit: 2,
    sampling_note: "Complete fixture with one skipped usable profile.",
    profile_count: 1,
    profiles: [
      {
        symbol: "ARCD",
        cik: "0000002001",
        source_url: "fixture://profiles/arcd",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        profile_text_fields: ["text"],
        profile_field_texts: {
          text: "Arcadia builds CXL memory pooling and retimer systems.",
        },
        text: "Arcadia builds CXL memory pooling and retimer systems.",
      },
    ],
  })}\n`,
);
writeFileSync(
  mismatchedProfileFixturePath,
  `${JSON.stringify({
    schema_version: 1,
    generated_at: "2026-05-31T00:00:00.000Z",
    source: "profile_fixture",
    profile_purpose: "repo_research_recall_calibration",
    source_files: ["fixture://profiles"],
    profile_count: 1,
    profiles: [
      {
        symbol: "RKLB",
        cik: "1001",
        source_url: "fixture://profiles/bad-rklb",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        text: "launch spacecraft orbital satellite",
      },
    ],
  })}\n`,
);
writeFileSync(
  noPurposeProfileFixturePath,
  `${JSON.stringify({
    schema_version: 1,
    profiles: [
      {
        symbol: "RKLB",
        cik: "0001819994",
        source_url: "fixture://profiles/rklb",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        text: "launch spacecraft orbital satellite",
      },
    ],
  })}\n`,
);
writeFileSync(
  unsupportedPurposeProfileFixturePath,
  `${JSON.stringify({
    schema_version: 1,
    profile_purpose: "ambiguous_profile_dump",
    profiles: [
      {
        symbol: "RKLB",
        cik: "0001819994",
        source_url: "fixture://profiles/rklb",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        text: "launch spacecraft orbital satellite",
      },
    ],
  })}\n`,
);
writeFileSync(
  badProfileCountFixturePath,
  `${JSON.stringify({
    schema_version: 1,
    generated_at: "2026-05-31T00:00:00.000Z",
    source: "profile_fixture",
    profile_purpose: "repo_research_recall_calibration",
    source_files: ["fixture://profiles"],
    profile_count: 2,
    profiles: [
      {
        symbol: "RKLB",
        cik: "0001819994",
        source_url: "fixture://profiles/rklb",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        text: "launch spacecraft orbital satellite",
      },
    ],
  })}\n`,
);
writeFileSync(
  missingCoverageProfileFixturePath,
  `${JSON.stringify({
    schema_version: 1,
    generated_at: "2026-05-31T00:00:00.000Z",
    source: "issuer_profile_fixture",
    profile_purpose: "issuer_universe_discovery",
    profile_text_fields: ["text"],
    source_files: ["fixture://issuer-profiles"],
    profile_count: 1,
    profiles: [
      {
        symbol: "ARCD",
        cik: "0000002001",
        source_url: "fixture://profiles/arcd",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        profile_field_texts: {
          text: "Arcadia builds CXL memory pooling and retimer systems.",
        },
        text: "Arcadia builds CXL memory pooling and retimer systems.",
      },
    ],
  })}\n`,
);
writeFileSync(
  missingIssuerFieldTextsFixturePath,
  `${JSON.stringify({
    schema_version: 1,
    generated_at: "2026-05-31T00:00:00.000Z",
    source: "issuer_profile_fixture",
    profile_purpose: "issuer_universe_discovery",
    profile_text_fields: ["text"],
    source_files: ["fixture://issuer-profiles"],
    selection_strategy: "manual_profile_input_csv",
    profile_coverage_strategy: "manual_profile_input_csv",
    coverage_scope: "partial_manual_profile_input",
    requested_symbols: ["ARCD"],
    selected_symbol_count: 1,
    eligible_universe_count: 18,
    coverage_limit: 1,
    sampling_note: "Manual profile input fixture.",
    profile_count: 1,
    profiles: [
      {
        symbol: "ARCD",
        cik: "0000002001",
        source_url: "fixture://profiles/arcd",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        text: "Arcadia builds CXL memory pooling and retimer systems.",
      },
    ],
  })}\n`,
);
writeFileSync(
  mismatchedFieldTextFixturePath,
  `${JSON.stringify({
    schema_version: 1,
    generated_at: "2026-05-31T00:00:00.000Z",
    source: "issuer_profile_fixture",
    profile_purpose: "issuer_universe_discovery",
    profile_text_fields: ["text"],
    source_files: ["fixture://issuer-profiles"],
    selection_strategy: "manual_profile_input_csv",
    profile_coverage_strategy: "manual_profile_input_csv",
    coverage_scope: "partial_manual_profile_input",
    requested_symbols: ["ARCD"],
    selected_symbol_count: 1,
    eligible_universe_count: 18,
    coverage_limit: 1,
    sampling_note: "Manual profile input fixture.",
    profile_count: 1,
    profiles: [
      {
        symbol: "ARCD",
        cik: "0000002001",
        source_url: "fixture://profiles/arcd",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        profile_text_truncated: true,
        profile_field_texts: {
          text: "unrelated profile field text",
        },
        text: "Arcadia builds CXL memory pooling and retimer systems.",
      },
    ],
  })}\n`,
);
const longNeutralProfileText = `${"ordinary issuer operations ".repeat(230)} CXL memory pooling retimer systems for AI clusters.`;
writeFileSync(
  truncatedFieldProfileFixturePath,
  `${JSON.stringify({
    schema_version: 1,
    generated_at: "2026-05-31T00:00:00.000Z",
    source: "issuer_profile_fixture",
    profile_purpose: "issuer_universe_discovery",
    profile_text_fields: ["business"],
    source_files: ["fixture://issuer-profiles"],
    selection_strategy: "manual_profile_input_csv",
    profile_coverage_strategy: "manual_profile_input_csv",
    coverage_scope: "partial_manual_profile_input",
    requested_symbols: ["ARCD"],
    selected_symbol_count: 1,
    eligible_universe_count: 18,
    coverage_limit: 1,
    sampling_note: "Manual issuer profile fixture with long source text.",
    profile_count: 1,
    profiles: [
      {
        symbol: "ARCD",
        cik: "0000002001",
        source_url: "fixture://profiles/arcd-long",
        source_published_at: "2026-05-01",
        retrieved_at: "2026-05-31",
        profile_text_truncated: true,
        profile_text_fields: ["business"],
        profile_field_texts: {
          business: longNeutralProfileText,
        },
        text: longNeutralProfileText,
      },
    ],
  })}\n`,
);

const fullScan = runDiscovery(["--dry-run", "--json", "--input", fixturePath, "--limit", "10"]);
assert(fullScan.candidate_count === 6, "fixture scan should keep six ordinary deterministic leads");
assert(fullScan.total_match_count === 10, "total match count should include ordinary, exploratory, and suppressed known proxy matches");
assert(fullScan.exploratory_match_count === 1, "generic unknown-future lane matches should be separated as exploratory signals");
assert(fullScan.exploratory_matches.some((item) => item.symbol === "XMCP" && item.primary_lane_id === "unknown_future_bottlenecks"), "unknown-future generic platform lead should be exploratory, not an ordinary candidate");
assert(
  !fullScan.candidates.some((item) => item.symbol === "XMCP") && !fullScan.omitted_candidates.some((item) => item.symbol === "XMCP"),
  "unknown-future generic platform lead should not enter ordinary candidate or omitted-candidate sequences",
);
assert(fullScan.suppressed_known_match_count === 3, "known public proxy ticker matches should be suppressed instead of rediscovered");
assert(fullScan.ranking_method.length > 0, "scan should describe deterministic ranking method");
assert(fullScan.sec_input_row_count === 18, "scan should record SEC input row count");
assert(fullScan.sec_input_sha256.length === 64, "scan should record SEC input content hash");
assert(fullScan.profile_coverage_status === "not_applicable_no_profile_input", "name/ticker scan should not claim profile coverage");
assert(fullScan.issuer_profile_coverage_status === "absent_name_ticker_only", "name/ticker-only scan should surface absent semantic issuer profile coverage");
assert(fullScan.issuer_profile_semantic_gap_count === 18, "name/ticker-only scan should report the eligible semantic profile gap");
assert(fullScan.issuer_profile_semantic_coverage_ratio === 0, "name/ticker-only scan should report zero semantic profile coverage");
assert(fullScan.lane_map_path === "research/discovery/lanes.yml", "scan should record lane map path");
assert(fullScan.lane_map_as_of === "2026-05-31", "scan should record lane map as-of date");
assert(fullScan.lane_map_sha256.length === 64, "scan should record lane map content hash");
assert(fullScan.candidate_counts_by_priority.high === 3, "three high-signal leads should be high priority");
assert(fullScan.candidate_counts_by_priority.low >= 1, "ticker-only acronym collision should be low priority");
assert(fullScan.false_positive_flag_counts.fund_or_etf === 1, "fund false-positive count should be surfaced");
assert(fullScan.false_positive_flag_counts.brand_keyword_collision === 1, "brand collision count should be surfaced");
assert(fullScan.false_positive_flag_counts.ticker_keyword_collision === 1, "ticker-only keyword collision count should be surfaced");
assert(fullScan.all_false_positive_flag_counts.fund_or_etf === 1, "full false-positive counts should be surfaced");
assert(fullScan.recall_expected_proxy_miss_count >= 1, "recall miss count should be surfaced");
assert(fullScan.recall_organic_expected_proxy_miss_count >= 1, "organic recall miss count should separate seeded ticker recall from semantic rediscovery");
assert(fullScan.recall_organic_expected_proxy_status !== "organic_recall_complete", "name/ticker-only recall should not claim organic recall completion");
assert(fullScan.recall_ticker_only_expected_proxy_symbols.includes("RKLB"), "ticker-only proxy symbols should be explicitly listed");
assert(fullScan.recall_unique_expected_proxy_miss_count >= 1, "unique recall miss count should be surfaced");
assert(fullScan.recall_out_of_scope_proxy_count >= 1, "private or future proxies should be counted outside the SEC recall denominator");
const privateProxyRecall = fullScan.recall_diagnostics.find((item) => item.symbol === "SPACEX");
assert(privateProxyRecall.status === "out_of_scope_private_or_future_proxy", "private or future lane proxies should receive an out-of-scope diagnostic");
assert(privateProxyRecall.recall_scope === "out_of_scope_private_or_future_proxy", "out-of-scope proxy should carry recall scope");
const missingProxyRecall = fullScan.recall_diagnostics.find((item) => item.symbol === "GONE");
assert(missingProxyRecall.status === "missing_from_sec_input", "missing lane proxy should be explicit in recall diagnostics");
assert(fullScan.recall_counts_by_status.missing_from_sec_input === 1, "recall status counts should include missing SEC proxies");

const keywordVariantScan = runDiscovery(["--dry-run", "--json", "--input", keywordVariantFixturePath, "--limit", "10"]);
const keywordVariantCandidate = candidate(keywordVariantScan, "XSAT");
assert(keywordVariantCandidate.primary_lane_id === "space_infrastructure", "plural keyword variants should match lane terms");
assert(
  keywordVariantCandidate.matched_keyword_variants.satellite.includes("satellites"),
  "scan output should audit the normalized keyword variant that matched",
);

const proxyCollisionScan = runDiscovery(["--dry-run", "--json", "--input", proxyCollisionFixturePath, "--limit", "10"]);
assert(
  !proxyCollisionScan.candidates.some((item) => item.symbol === "VRTS")
    && !proxyCollisionScan.omitted_candidates.some((item) => item.symbol === "VRTS"),
  "current public proxy ticker matching should not pluralize VRT into unrelated VRTS",
);
assert(
  !proxyCollisionScan.candidates.some((item) => item.symbol === "IONQ-WT")
    && !proxyCollisionScan.omitted_candidates.some((item) => item.symbol === "IONQ-WT"),
  "hyphenated warrant symbols should be filtered before candidate generation",
);

const limitedScan = runDiscovery(["--dry-run", "--json", "--input", fixturePath, "--limit", "2"]);
assert(limitedScan.omitted_candidate_count === limitedScan.all_candidate_count - 2, "limited scan should count every omitted candidate");
assert(limitedScan.omitted_candidates.length === limitedScan.omitted_candidate_count, "limited scan should retain all omitted candidates");
assert(Array.isArray(limitedScan.omitted_candidates[0].lane_matches), "omitted candidates should keep lane_matches");
assert(Array.isArray(limitedScan.omitted_candidates[0].false_positive_flags), "omitted candidates should keep false-positive flags");

const orbital = candidate(fullScan, "OLSI");
assert(orbital.deterministic_priority === "high", "orbital launch lead should be high priority");
assert(orbital.recommended_review_depth === "readiness_triage_priority", "high-priority lead should request readiness triage");
assert(orbital.keyword_signal === "high_signal", "orbital launch lead should record high keyword signal");
assert(orbital.security_form === "unconfirmed_public_equity", "SEC reference-only candidate should require security-form confirmation");
assert(orbital.security_form_confidence === "low", "SEC reference-only common-equity inference should stay low confidence");
assert(orbital.requires_security_type_confirmation === true, "SEC reference-only candidates should require security-type confirmation before append or promotion");
assert(
  !fullScan.candidates.some((item) => item.symbol === "QSW" || item.symbol === "QAC-UN" || item.symbol === "QSIAW")
  && !fullScan.omitted_candidates.some((item) => item.symbol === "QSW" || item.symbol === "QAC-UN" || item.symbol === "QSIAW"),
  "obvious warrants and units should be filtered out before candidate artifacts",
);

const fund = candidate(fullScan, "XAIO");
assert(fund.deterministic_priority === "low", "AI fund should be demoted to low priority");
assert(fund.false_positive_flags.includes("fund_or_etf"), "AI fund should carry fund_or_etf flag");
assert(fund.requires_security_type_confirmation === true, "fund-like candidates should require security-type confirmation");

const brand = candidate(fullScan, "XSPB");
assert(brand.false_positive_flags.includes("brand_keyword_collision"), "Spectrum Brands should carry brand collision flag");

const tickerCollision = candidate(fullScan, "HBM");
assert(tickerCollision.deterministic_priority === "low", "ticker-only HBM collision should not become high priority");
assert(tickerCollision.keyword_signal === "ticker_only_signal", "ticker-only HBM collision should carry ticker-only signal");
assert(tickerCollision.false_positive_flags.includes("ticker_keyword_collision"), "ticker-only HBM collision should carry collision flag");
assert(
  !fullScan.candidates.some((item) => item.symbol === "XCEQ") && !fullScan.omitted_candidates.some((item) => item.symbol === "XCEQ"),
  "profile-only lane keywords should not match issuer names without profile input",
);

const multiLane = candidate(fullScan, "XSSC");
assert(multiLane.lane_matches.length > 1, "satellite spectrum connectivity lead should retain all lane matches");
assert(multiLane.secondary_lane_ids.includes("direct_to_device_connectivity"), "secondary lane should keep D2D connectivity");

const rklbRecall = fullScan.recall_diagnostics.find((item) => item.symbol === "RKLB");
assert(rklbRecall !== undefined, "recall diagnostics should include RKLB from lane proxies");
assert(rklbRecall.would_match_expected_lane, "current public proxy ticker matching should recover RKLB without profile enrichment");
assert(rklbRecall.status === "matched_expected_lane", "RKLB recall diagnostic should classify recovered public proxy matches");

const activeOnlyScan = runDiscovery(["--dry-run", "--json", "--input", fixturePath, "--active-only", "--limit", "10"]);
assert(
  !activeOnlyScan.candidates.some((item) => item.symbol === "XMCP"),
  "active-only scan should exclude unknown-future generic platform lead",
);

const partialIssuerScan = runDiscovery([
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--profile-input",
  partialIssuerProfileFixturePath,
  "--limit",
  "20",
]);
assert(partialIssuerScan.profile_coverage_status === "manual_partial", "partial issuer profile scan should classify manual partial coverage");
assert(partialIssuerScan.profile_coverage_gap_count === 17, "partial issuer profile scan should record unprofiled eligible issuer count");
assert(partialIssuerScan.profile_coverage_ratio === 0.055556, "partial issuer profile scan should record selected-to-eligible coverage ratio");
assert(partialIssuerScan.profile_coverage_scope === "partial_manual_profile_input", "partial issuer profile scan should echo explicit partial coverage scope");
assert(partialIssuerScan.profile_enriched_candidate_count === 1, "partial issuer profile scan should still discover profile-enriched ordinary candidates");

const truncatedFieldScan = runDiscovery([
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--profile-input",
  truncatedFieldProfileFixturePath,
  "--limit",
  "20",
]);
const truncatedFieldCandidate = candidate(truncatedFieldScan, "ARCD");
assert(truncatedFieldCandidate.profile_enriched === true, "field-level profile text should remain searchable after bounded aggregate text truncation");
assert(
  truncatedFieldCandidate.matched_profile_snippets.some((snippet) => snippet.profile_text_field_ids.includes("business")),
  "field-level profile matches should preserve source field attribution",
);

const incompleteCompleteIssuerScanFailure = runDiscoveryFailure([
  "--dry-run",
  "--json",
  "--input",
  completeCoverageFixturePath,
  "--profile-input",
  incompleteCompleteIssuerProfileFixturePath,
  "--limit",
  "20",
]);
assert(
  incompleteCompleteIssuerScanFailure.includes("complete_sec_universe is missing eligible SEC symbols"),
  "complete-scope issuer profile scan should reject missing eligible issuer profiles",
);
const mismatchedCoverageProfile = runDiscoveryFailure([
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--profile-input",
  incompleteCompleteIssuerProfileFixturePath,
  "--limit",
  "20",
]);
assert(
  mismatchedCoverageProfile.includes("does not match current SEC input eligible universe count"),
  "issuer profile coverage should be bound to the SEC input being scanned",
);

const profileScan = runDiscovery([
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--profile-input",
  profileFixturePath,
  "--limit",
  "20",
]);
const enrichedRklb = profileScan.suppressed_known_matches.find((item) => item.symbol === "RKLB");
assert(enrichedRklb !== undefined, "profile enrichment should recover known RKLB as a suppressed match");
assert(enrichedRklb.primary_lane_id === "space_infrastructure", "profile-enriched RKLB should match space infrastructure");
assert(enrichedRklb.profile_enriched === true, "profile-enriched RKLB should carry profile_enriched");
assert(enrichedRklb.match_sources.includes("profile_input"), "profile-enriched RKLB should attribute profile input");
assert(enrichedRklb.profile_text_truncated === true, "scanner should preserve upstream profile truncation metadata");
assert(
  enrichedRklb.lane_matches[0].matched_keywords.some((keyword) => ["launch", "spacecraft", "satellite", "orbital"].includes(keyword)),
  "profile-enriched RKLB should match profile bottleneck terms",
);
const enrichedRklbRecall = profileScan.recall_diagnostics.find((item) => item.symbol === "RKLB");
assert(enrichedRklbRecall.status === "matched_expected_lane", "profile enrichment should fix RKLB recall status");
const enrichedAsts = profileScan.suppressed_known_matches.find((item) => item.symbol === "ASTS");
assert(enrichedAsts !== undefined, "profile enrichment should keep known ASTS suppressed");
assert(enrichedAsts.known_sources.some((source) => source.startsWith("watchlist:")), "suppressed profile match should explain known repo source");
const enrichedVrt = profileScan.suppressed_known_matches.find((item) => item.symbol === "VRT");
assert(enrichedVrt !== undefined, "profile enrichment should recover hyphenated data-center power profile text");
assert(enrichedVrt.primary_lane_id === "ai_power_and_cooling", "hyphenated data-center profile should match AI power lane");
assert(profileScan.profile_purpose === "repo_research_recall_calibration", "scan output should echo profile purpose");
assert(profileScan.profile_source === "profile_fixture", "scan output should echo profile artifact source");
assert(profileScan.profile_declared_count === 8, "scan output should echo profile artifact declared count");
assert(profileScan.profile_source_files.join(",") === "fixture://profiles", "scan output should echo profile source files");
assert(profileScan.profile_known_symbol_count === 3, "profile stats should count known profile symbols");
assert(profileScan.profile_unknown_symbol_count === 5, "profile stats should count unknown profile symbols");
assert(profileScan.profile_enriched_candidate_count === 3, "profile stats should count ordinary profile-enriched candidates");
assert(profileScan.profile_enriched_exploratory_match_count === 1, "profile stats should count exploratory profile-enriched matches separately");
assert(profileScan.profile_enriched_suppressed_match_count === 3, "profile stats should count suppressed profile matches");
const hiddenProfileCandidate = candidate(profileScan, "ARCD");
assert(hiddenProfileCandidate.profile_enriched === true, "unknown profile-only issuer should become a discovery candidate");
assert(hiddenProfileCandidate.primary_lane_id === "semiconductor_interconnect_and_memory", "unknown profile-only issuer should match semiconductor lane");
assert(hiddenProfileCandidate.matched_fields.join(",") === "profile_text", "unknown profile-only issuer should be discovered from profile text only");
assert(!("known_sources" in hiddenProfileCandidate), "unknown profile-only issuer should not carry known sources");
assert(
  profileScan.recall_diagnostics.every((item) => item.status !== "missed_all_lanes"),
  "profile fixture should recover all SEC-present expected proxies; remaining misses should be missing from the partial SEC input",
);
assert(profileScan.recall_expected_proxy_miss_count >= 1, "partial SEC fixture should still surface missing expected proxies");

const enrichedFund = candidate(profileScan, "XAIO");
assert(enrichedFund.false_positive_flags.includes("fund_or_etf"), "profile-enriched AI fund should keep fund flag");
assert(enrichedFund.deterministic_priority === "low", "profile-enriched AI fund should remain low priority");

const enrichedBrand = candidate(profileScan, "XSPB");
assert(enrichedBrand.false_positive_flags.includes("brand_keyword_collision"), "profile-enriched brand should keep brand flag");
assert(enrichedBrand.deterministic_priority !== "high", "profile-enriched brand collision should not become high priority");

const genericProfile = profileScan.exploratory_matches.find((item) => item.symbol === "XGEN");
assert(genericProfile !== undefined, "generic unknown-future profile words should become exploratory lane-review signals");
assert(genericProfile.deterministic_priority === "low", "generic profile words should not become high priority");
assert(genericProfile.required_next_step === "bottleneck_lane_review_before_candidate_append", "generic unknown-future profile words should require lane review before candidate append");
assert(
  !profileScan.candidates.some((item) => item.symbol === "XWRK"),
  "word-boundary matching should not treat workspace as space",
);

const writeRepoRoot = path.join(fixtureRoot, "write-repo");
writeIsolatedRepoFixture(writeRepoRoot);
const writeScan = runDiscoveryInRepo(writeRepoRoot, [
  "--write",
  "--json",
  "--input",
  fixturePath,
  "--profile-input",
  profileFixturePath,
  "--limit",
  "20",
]);
assert(writeScan.candidate_count > 0, "write scan should still emit JSON output");
const writtenCandidates = readCsvRecords(path.join(writeRepoRoot, "research/discovery/candidates.csv"));
const writtenOrbital = rowBySymbol(writtenCandidates, "OLSI");
assert(writtenOrbital.source_url === "https://www.sec.gov/files/company_tickers_exchange.json", "name-only appended candidate should keep SEC source");
assert(writtenOrbital.source_published_at === "not listed on SEC reference file", "name-only appended candidate should not use profile source date");
assert(writtenOrbital.discovery_source === "SEC company_tickers_exchange lane keyword scan", "name-only appended candidate should keep SEC discovery source");
assert(writtenOrbital.why_it_might_matter.includes("profile source: none"), "name-only appended candidate should not cite unused profile source");
assert(!writtenCandidates.some((row) => row.symbol === "XGEN"), "exploratory unknown-future matches should not be appended as raw candidates");
const writtenArcadia = rowBySymbol(writtenCandidates, "ARCD");
assert(writtenArcadia.source_url === "fixture://profiles/arcd", "profile-enriched appended candidate should use profile source");
assert(writtenArcadia.source_published_at === "2026-05-01", "profile-enriched appended candidate should use profile source date");
assert(writtenArcadia.retrieved_at === "2026-05-31", "profile-enriched appended candidate should use profile retrieved date");
assert(
  writtenArcadia.discovery_source === "SEC company_tickers_exchange plus profile lane keyword scan",
  "profile-enriched appended candidate should record combined discovery source",
);

const invalidInput = runDiscoveryFailure(["--dry-run", "--json", "--input", invalidFixturePath, "--limit", "1"]);
assert(
  invalidInput.includes("SEC company list input must contain fields and data arrays"),
  "invalid input should fail instead of silently scanning an empty universe",
);
const missingDurableAsOf = runDiscoveryFailure([
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--output",
  path.join(fixtureRoot, "missing-as-of-scan.json"),
  "--limit",
  "1",
]);
assert(
  missingDurableAsOf.includes("--as-of is required when writing a durable --json --output discovery artifact"),
  "durable JSON scan artifacts should require explicit as-of dates",
);
const invalidProfiles = runDiscoveryFailure([
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--profile-input",
  invalidProfileFixturePath,
  "--limit",
  "1",
]);
assert(
  invalidProfiles.includes("Profile input must contain a profiles array"),
  "invalid profile input should fail instead of being ignored",
);
const invalidAsOfShape = runDiscoveryFailure([
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--as-of",
  "not-a-date",
  "--limit",
  "1",
]);
assert(invalidAsOfShape.includes("--as-of must use YYYY-MM-DD"), "discovery scan should reject malformed as-of dates");
const invalidAsOfCalendar = runDiscoveryFailure([
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--as-of",
  "2026-99-99",
  "--limit",
  "1",
]);
assert(invalidAsOfCalendar.includes("--as-of must be a valid calendar date"), "discovery scan should reject impossible as-of calendar dates");
const mismatchedProfiles = runDiscoveryFailure([
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--profile-input",
  mismatchedProfileFixturePath,
  "--limit",
  "1",
]);
assert(
  mismatchedProfiles.includes("symbol RKLB does not match CIK 1001"),
  "profile input should fail on symbol and CIK mismatch",
);
const noPurposeProfiles = runDiscoveryFailure([
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--profile-input",
  noPurposeProfileFixturePath,
  "--limit",
  "1",
]);
assert(
  noPurposeProfiles.includes("Profile input profile_purpose is required"),
  "profile input should require an explicit purpose",
);
const unsupportedPurposeProfiles = runDiscoveryFailure([
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--profile-input",
  unsupportedPurposeProfileFixturePath,
  "--limit",
  "1",
]);
assert(
  unsupportedPurposeProfiles.includes("Profile input profile_purpose must be one of"),
  "profile input should reject ambiguous profile purposes",
);
const badProfileCount = runDiscoveryFailure([
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--profile-input",
  badProfileCountFixturePath,
  "--limit",
  "1",
]);
assert(
  badProfileCount.includes("Profile input profile_count 2 does not match profiles length 1"),
  "profile input should reject stale or inconsistent profile_count metadata",
);
const missingCoverageProfile = runDiscoveryFailure([
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--profile-input",
  missingCoverageProfileFixturePath,
  "--limit",
  "1",
]);
assert(
  missingCoverageProfile.includes("Profile input profile_coverage_strategy is required"),
  "issuer discovery profile input should require coverage provenance",
);
const missingIssuerFieldTexts = runDiscoveryFailure([
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--profile-input",
  missingIssuerFieldTextsFixturePath,
  "--limit",
  "1",
]);
assert(
  missingIssuerFieldTexts.includes("profile input profiles[0].profile_field_texts is required for issuer_universe_discovery profiles"),
  "issuer discovery profile input should require field-level profile provenance",
);
const mismatchedFieldText = runDiscoveryFailure([
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--profile-input",
  mismatchedFieldTextFixturePath,
  "--limit",
  "1",
]);
assert(
  mismatchedFieldText.includes("profile input profiles[0].profile_field_texts.text is not represented in profile text"),
  "profile field text should be represented in the bounded profile text",
);

const duplicateKeywordRepoRoot = path.join(fixtureRoot, "duplicate-keyword-repo");
writeDuplicateKeywordRepo(duplicateKeywordRepoRoot);
const duplicateKeywordScan = runDiscoveryFailureInRepo(duplicateKeywordRepoRoot, [
  "--dry-run",
  "--json",
  "--input",
  fixturePath,
  "--limit",
  "1",
]);
assert(
  duplicateKeywordScan.includes("duplicates normalized keyword"),
  "lane validation should reject normalized duplicate screen/profile keywords",
);

console.log("ok discovery scan ranking, profile enrichment, false-positive flags, multi-lane matches, suppressed matches, recall diagnostics, fixture input, and active-only scope");

function runDiscovery(args) {
  return runDiscoveryInRepo(isolatedRepoRoot, args);
}

function runDiscoveryInRepo(cwd, args) {
  const result = spawnSync(
    "node",
    [path.join(repoRoot, "scripts/discover-universe.mjs"), ...args],
    {
      cwd,
      encoding: "utf8",
    },
  );
  if (result.status !== 0) {
    throw new Error(`discover-universe failed:\n${result.stdout}\n${result.stderr}`);
  }
  return JSON.parse(result.stdout);
}

function runDiscoveryFailure(args) {
  return runDiscoveryFailureInRepo(isolatedRepoRoot, args);
}

function runDiscoveryFailureInRepo(cwd, args) {
  const result = spawnSync(
    "node",
    [path.join(repoRoot, "scripts/discover-universe.mjs"), ...args],
    {
      cwd,
      encoding: "utf8",
    },
  );
  if (result.status === 0) {
    throw new Error(`discover-universe should have failed:\n${result.stdout}`);
  }
  return `${result.stdout}\n${result.stderr}`;
}

function readCsvRecords(filePath) {
  const rows = parseCsv(readFileSync(filePath, "utf8"));
  const header = rows[0] ?? [];
  return rows.slice(1).map((row) =>
    Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""])),
  );
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

function rowBySymbol(rows, symbol) {
  const row = rows.find((candidateRow) => candidateRow.symbol === symbol);
  assert(row !== undefined, `missing appended candidate ${symbol}`);
  return row;
}

function writeIsolatedRepoFixture(root) {
  mkdirSync(path.join(root, "research/discovery"), { recursive: true });
  mkdirSync(path.join(root, "data/market"), { recursive: true });
  writeFileSync(
    path.join(root, "research/discovery/lanes.yml"),
    `schema_version: 1
as_of: 2026-05-31
lanes:
  - id: space_infrastructure
    name: Space Infrastructure
    status: active
    screen_keywords:
      - satellite
      - space
      - launch
      - orbital
    current_public_proxies:
      - RKLB
      - GONE
  - id: direct_to_device_connectivity
    name: Direct-To-Device Connectivity
    status: active
    screen_keywords:
      - mobile satellite
      - direct-to-device
      - connectivity
      - spectrum
    current_public_proxies:
      - ASTS
    private_or_future_proxies:
      - SPACEX
  - id: ai_compute_infrastructure
    name: AI Compute Infrastructure
    status: active
    screen_keywords:
      - ai cloud
      - artificial intelligence
      - compute
      - gpu
    current_public_proxies: []
  - id: semiconductor_interconnect_and_memory
    name: Semiconductor Interconnect And Memory
    status: active
    screen_keywords:
      - HBM
      - retimer
    profile_keywords:
      - communications equipment
    current_public_proxies: []
  - id: ai_power_and_cooling
    name: AI Data-Center Power And Cooling
    status: active
    screen_keywords:
      - data center power
      - liquid cooling
      - thermal
    current_public_proxies:
      - VRT
  - id: quantum_computing_and_networking
    name: Quantum Computing And Networking
    status: active
    screen_keywords:
      - quantum
      - qubit
      - network
    current_public_proxies: []
  - id: unknown_future_bottlenecks
    name: Unknown Future Bottlenecks
    status: emerging
    screen_keywords:
      - mission critical
      - platform
    current_public_proxies: []
`,
  );
  writeFileSync(
    path.join(root, "research/watchlist.csv"),
    "symbol,status\nASTS,active_core_candidate\nRKLB,active_core_candidate\nVRT,research_only\n",
  );
  writeFileSync(
    path.join(root, "data/market/security_master.csv"),
    "symbol,tradability\n",
  );
  writeFileSync(
    path.join(root, "research/discovery/candidates.csv"),
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
    ].join(",") + "\n",
  );
}

function writeDuplicateKeywordRepo(root) {
  mkdirSync(path.join(root, "research/discovery"), { recursive: true });
  mkdirSync(path.join(root, "data/market"), { recursive: true });
  writeFileSync(
    path.join(root, "research/discovery/lanes.yml"),
    `schema_version: 1
as_of: 2026-05-31
lanes:
  - id: duplicate_keyword_lane
    name: Duplicate Keyword Lane
    status: active
    screen_keywords:
      - CXL
    profile_keywords:
      - cxl
    current_public_proxies: []
`,
  );
  writeFileSync(
    path.join(root, "research/watchlist.csv"),
    "symbol,status\n",
  );
  writeFileSync(
    path.join(root, "data/market/security_master.csv"),
    "symbol,tradability\n",
  );
  writeFileSync(
    path.join(root, "research/discovery/candidates.csv"),
    "symbol,status\n",
  );
}

function candidate(scan, symbol) {
  const found = scan.candidates.find((item) => item.symbol === symbol);
  assert(found !== undefined, `missing candidate ${symbol}`);
  return found;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
