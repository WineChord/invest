import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = mkdtempSync(path.join(tmpdir(), "invest-semantic-discovery-"));
const laneMapPath = path.join(fixtureRoot, "lanes.yml");
const secInputPath = path.join(fixtureRoot, "sec-company-tickers-exchange.json");
const profileInputPath = path.join(fixtureRoot, "profiles.json");
const packetPath = path.join(fixtureRoot, "semantic-packets.json");
const batchDir = path.join(fixtureRoot, "batches");
const batchManifestPath = path.join(fixtureRoot, "batch-manifest.json");
const heuristicResultPath = path.join(fixtureRoot, "semantic-heuristic-results.jsonl");
const heuristicCachePath = path.join(fixtureRoot, "semantic-heuristic-cache.jsonl");
const heuristicImportSummaryPath = path.join(fixtureRoot, "semantic-heuristic-import.json");
const resultPath = path.join(fixtureRoot, "semantic-results.jsonl");
const invalidResultPath = path.join(fixtureRoot, "semantic-results-invalid.jsonl");
const cachePath = path.join(fixtureRoot, "semantic-cache.jsonl");
const importSummaryPath = path.join(fixtureRoot, "semantic-import.json");
const secondBatchManifestPath = path.join(fixtureRoot, "batch-manifest-after-cache.json");
const runPath = path.join(fixtureRoot, "semantic-run.json");
const reviewPacketPath = path.join(fixtureRoot, "semantic-review-packet.json");

writeFileSync(
  laneMapPath,
  [
    "schema_version: 1",
    "as_of: 2026-06-01",
    "lanes:",
    "  - id: ai_compute_infrastructure",
    "    name: AI Compute Infrastructure",
    "    screen_keywords:",
    "      - AI cloud",
    "      - data center",
    "  - id: space_infrastructure",
    "    name: Space Infrastructure",
    "    screen_keywords:",
    "      - spacecraft",
    "      - space",
    "    current_public_proxies:",
    "      - LUNR",
  ].join("\n") + "\n",
);
writeFileSync(
  secInputPath,
  `${JSON.stringify({
    fields: ["cik", "name", "ticker", "exchange"],
    data: [
      [2001, "Arcadia Systems Inc.", "ARCD", "Nasdaq"],
      [1674101, "Vertiv Holdings Co", "VRT", "NYSE"],
      [1844452, "Intuitive Machines, Inc.", "LUNR", "Nasdaq"],
      [9999, "Unsupported OTC Systems", "UOTC", "OTC"],
    ],
  })}\n`,
);
writeFileSync(
  profileInputPath,
  `${JSON.stringify({
    schema_version: 1,
    generated_at: "2026-06-01T00:00:00.000Z",
    source: "profile_fixture",
    profile_purpose: "issuer_universe_discovery",
    profile_text_fields: ["text"],
    source_files: ["fixture://profiles"],
    selection_strategy: "manual_profile_input_csv",
    profile_coverage_strategy: "manual_profile_input_csv",
    coverage_scope: "partial_manual_profile_input",
    requested_symbols: ["ARCD", "VRT", "LUNR"],
    selected_symbol_count: 3,
    eligible_universe_count: 3,
    coverage_limit: 3,
    sampling_note: "fixture",
    profile_count: 3,
    profiles: [
      {
        symbol: "ARCD",
        cik: "0000002001",
        source_name: "fixture",
        source_url: "fixture://profiles/arcd",
        source_published_at: "2026-05-30",
        retrieved_at: "2026-06-01",
        text: "Arcadia builds CXL memory pooling fabrics and rack-scale interconnect systems for AI clusters.",
      },
      {
        symbol: "VRT",
        cik: "0001674101",
        source_name: "fixture",
        source_url: "fixture://profiles/vrt",
        source_published_at: "2026-05-30",
        retrieved_at: "2026-06-01",
        text: "Vertiv provides data-center power and thermal management infrastructure for AI deployments.",
      },
      {
        symbol: "LUNR",
        cik: "0001844452",
        source_name: "fixture",
        source_url: "fixture://profiles/lunr",
        source_published_at: "2026-05-30",
        retrieved_at: "2026-06-01",
        text: "Intuitive Machines provides spacecraft and lunar infrastructure systems.",
      },
    ],
  }, null, 2)}\n`,
);

runScript("scripts/build-semantic-issuer-packets.mjs", [
  "--as-of", "2026-06-01",
  "--sec-input", secInputPath,
  "--profile-input", profileInputPath,
  "--lane-map", laneMapPath,
  "--all",
  "--output", packetPath,
]);
const packetArtifact = JSON.parse(readFileSync(packetPath, "utf8"));
assert(packetArtifact.packet_count === 3, "packet builder should emit three eligible packets");
assert(packetArtifact.lane_map_lane_ids.includes("ai_compute_infrastructure"), "packet artifact should expose lane ids");
const packetsBySymbol = new Map(packetArtifact.packets.map((packet) => [packet.symbol, packet]));
assert(packetsBySymbol.get("ARCD")?.issuer_packet_hash, "ARCD packet should have hash");
assert(packetsBySymbol.get("VRT")?.source_blocks.length === 2, "VRT packet should include profile text block");

runScript("scripts/classify-semantic-heuristic.mjs", [
  "--as-of", "2026-06-01",
  "--packets", packetPath,
  "--lane-map", laneMapPath,
  "--output", heuristicResultPath,
]);
const heuristicResults = readFileSync(heuristicResultPath, "utf8").trim().split("\n").map((line) => JSON.parse(line));
assert(heuristicResults.length === 3, "heuristic classifier should emit one record per uncached packet");
assert(heuristicResults.every((record) => record.reasoning_level === "low"), "heuristic classifier should emit low reasoning records");
const lunrHeuristic = heuristicResults.find((record) => record.symbol === "LUNR");
assert(lunrHeuristic?.escalation === "xhigh_readiness_candidate", "heuristic classifier should escalate current public proxies");
assert(!lunrHeuristic.obvious_rejection_flags.includes("ticker_suffix_unit_warrant_or_right"), "heuristic classifier should not reject common-stock tickers ending in R, W, or U without a delimiter");
runScript("scripts/import-semantic-classifications.mjs", [
  "--as-of", "2026-06-01",
  "--packets", packetPath,
  "--results", heuristicResultPath,
  "--cache-output", heuristicCachePath,
  "--output", heuristicImportSummaryPath,
]);
const heuristicImportSummary = JSON.parse(readFileSync(heuristicImportSummaryPath, "utf8"));
assert(heuristicImportSummary.imported_count === 3, "importer should accept heuristic classifier output");

runScript("scripts/build-semantic-batches.mjs", [
  "--as-of", "2026-06-01",
  "--packets", packetPath,
  "--batch-size", "1",
  "--reasoning-level", "low",
  "--output-dir", batchDir,
  "--output", batchManifestPath,
]);
const batchManifest = JSON.parse(readFileSync(batchManifestPath, "utf8"));
assert(batchManifest.batch_count === 3, "batch builder should split three packets into three batches");
assert(batchManifest.batches[0].prompt_path.endsWith("-prompt.md"), "batch builder should write subagent prompt files");

writeFileSync(
  resultPath,
  [
    classificationLine({
      packet: packetsBySymbol.get("ARCD"),
      business: "Arcadia builds AI cluster interconnect and CXL memory pooling systems.",
      exposure: "strong",
      laneIds: ["ai_compute_infrastructure"],
      directness: "direct",
      escalation: "xhigh_readiness_candidate",
    }),
    classificationLine({
      packet: packetsBySymbol.get("VRT"),
      business: "Vertiv sells data-center power and thermal infrastructure.",
      exposure: "possible",
      laneIds: ["ai_compute_infrastructure"],
      directness: "direct",
      escalation: "medium_lane_compare",
    }),
    classificationLine({
      packet: packetsBySymbol.get("LUNR"),
      business: "Intuitive Machines provides lunar spacecraft and space infrastructure systems.",
      exposure: "strong",
      laneIds: ["space_infrastructure"],
      directness: "direct",
      escalation: "xhigh_readiness_candidate",
    }),
  ].join("\n") + "\n",
);
runScript("scripts/import-semantic-classifications.mjs", [
  "--as-of", "2026-06-01",
  "--packets", packetPath,
  "--results", resultPath,
  "--cache-output", cachePath,
  "--output", importSummaryPath,
]);
const importSummary = JSON.parse(readFileSync(importSummaryPath, "utf8"));
assert(importSummary.imported_count === 3, "importer should import three records");
assert(importSummary.current_cache_count === 3, "importer should mark all cache records current");

runScript("scripts/build-semantic-batches.mjs", [
  "--as-of", "2026-06-01",
  "--packets", packetPath,
  "--cache", cachePath,
  "--batch-size", "50",
  "--output-dir", path.join(fixtureRoot, "batches-after-cache"),
  "--output", secondBatchManifestPath,
]);
const secondBatchManifest = JSON.parse(readFileSync(secondBatchManifestPath, "utf8"));
assert(secondBatchManifest.selected_packet_count === 0, "current cache should skip already classified packets");

runScript("scripts/build-semantic-discovery-run.mjs", [
  "--as-of", "2026-06-01",
  "--packets", packetPath,
  "--cache", cachePath,
  "--output", runPath,
]);
const semanticRun = JSON.parse(readFileSync(runPath, "utf8"));
assert(semanticRun.classified_current_count === 3, "semantic run should count three current classifications");
assert(semanticRun.xhigh_readiness_candidates.length === 2, "semantic run should surface xhigh candidates");
assert(semanticRun.medium_lane_compare.length === 1, "semantic run should surface medium lane comparison");
assert(Array.isArray(semanticRun.no_escalation_sample), "semantic run should keep only a no-escalation sample");
assert(semanticRun.no_escalation === undefined, "semantic run should not persist full no-escalation rows");

runScript("scripts/build-semantic-review-packet.mjs", [
  "--as-of", "2026-06-01",
  "--semantic-run", runPath,
  "--output", reviewPacketPath,
]);
const reviewPacket = JSON.parse(readFileSync(reviewPacketPath, "utf8"));
assert(reviewPacket.summary.packet_count === 3, "review packet should include semantic run summary");
assert(reviewPacket.xhigh_readiness_candidates.length === 2, "review packet should include xhigh candidates");
assert(reviewPacket.medium_lane_compare.length === 1, "review packet should include medium candidates");

writeFileSync(
  invalidResultPath,
  classificationLine({
    packet: {
      ...packetsBySymbol.get("ARCD"),
      issuer_packet_hash: "bad",
    },
    business: "Invalid hash.",
    exposure: "strong",
    laneIds: ["ai_compute_infrastructure"],
    directness: "direct",
    escalation: "xhigh_readiness_candidate",
  }) + "\n",
);
const invalid = spawnScript("scripts/import-semantic-classifications.mjs", [
  "--as-of", "2026-06-01",
  "--packets", packetPath,
  "--results", invalidResultPath,
  "--cache-output", path.join(fixtureRoot, "bad-cache.jsonl"),
  "--output", path.join(fixtureRoot, "bad-import.json"),
]);
assert(invalid.status !== 0, "importer should reject mismatched packet hash");

console.log("semantic discovery tests passed");

function classificationLine({
  business,
  directness,
  escalation,
  exposure,
  laneIds,
  packet,
}) {
  return JSON.stringify({
    bottleneck_exposure: exposure,
    business_plain_english: business,
    cik: packet.cik,
    classification_schema_version: 1,
    company_stage: "growth",
    confidence: "medium",
    directness,
    escalation,
    evidence_refs: [
      {
        packet_text_block_id: "profile_fixture_1",
        retrieved_at: "2026-06-01",
        source_published_at: "2026-05-30",
        source_url: `fixture://profiles/${packet.symbol.toLowerCase()}`,
      },
    ],
    extreme_upside_fit: "possible",
    issuer_packet_hash: packet.issuer_packet_hash,
    lane_map_sha256: packetArtifact.lane_map_sha256,
    matched_lane_ids: laneIds,
    notes: "fixture classification",
    obvious_rejection_flags: [],
    reasoning_level: "low",
    symbol: packet.symbol,
  });
}

function runScript(script, args) {
  const result = spawnScript(script, args);
  if (result.status !== 0) {
    throw new Error(`${script} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  }
  return result;
}

function spawnScript(script, args) {
  return spawnSync("node", [script, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
