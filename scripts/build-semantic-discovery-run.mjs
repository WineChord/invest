import {
  countBy,
  currentSemanticCacheRecords,
  fileSha256,
  readJson,
  readJsonl,
  relativePath,
  requireNextArg,
  semanticDiscoveryRunSchemaVersion,
  strictDate,
  writeJson,
} from "./semantic-discovery-lib.mjs";

const options = parseArgs(process.argv.slice(2));
const generatedAt = options.generatedAt ?? new Date().toISOString();
const packetArtifact = readJson(options.packets);
const packets = packetArtifact.packets ?? [];
const packetBySymbol = new Map(packets.map((packet) => [packet.symbol, packet]));
const cacheRecords = readJsonl(options.cache);
const cacheStatus = currentSemanticCacheRecords({
  laneMapSha256: packetArtifact.lane_map_sha256,
  packetBySymbol,
  records: cacheRecords,
});
const currentRecords = [...cacheStatus.current.values()].sort((left, right) => left.symbol.localeCompare(right.symbol));
const currentSymbols = new Set(currentRecords.map((record) => record.symbol));
const unclassifiedPackets = packets.filter((packet) => !currentSymbols.has(packet.symbol));
const escalationBuckets = bucketByEscalation(currentRecords);
const laneCounts = countBy(
  currentRecords.flatMap((record) => record.matched_lane_ids),
  (laneId) => laneId,
);
const result = {
  schema_version: semanticDiscoveryRunSchemaVersion,
  source: "semantic_discovery_run",
  generated_at: generatedAt,
  as_of: options.asOf,
  packet_artifact_path: relativePath(options.packets),
  packet_artifact_sha256: fileSha256(options.packets),
  packet_artifact_metadata: packetArtifactMetadata(packetArtifact),
  cache_path: relativePath(options.cache),
  cache_sha256: fileSha256(options.cache),
  packet_count: packets.length,
  classified_current_count: currentRecords.length,
  unclassified_count: unclassifiedPackets.length,
  stale_cache_count: cacheStatus.stale.length,
  classification_coverage_ratio: packets.length === 0
    ? 0
    : Number((currentRecords.length / packets.length).toFixed(6)),
  escalation_counts: countBy(currentRecords, (record) => record.escalation),
  bottleneck_exposure_counts: countBy(currentRecords, (record) => record.bottleneck_exposure),
  directness_counts: countBy(currentRecords, (record) => record.directness),
  lane_counts: laneCounts,
  medium_lane_compare: compactRecords(escalationBuckets.medium_lane_compare ?? []),
  xhigh_readiness_candidates: compactRecords(escalationBuckets.xhigh_readiness_candidate ?? []),
  reject_or_archive: compactRecords(escalationBuckets.reject_or_archive ?? []),
  no_escalation: compactRecords(escalationBuckets.none ?? []),
  unclassified_symbols: unclassifiedPackets.map((packet) => packet.symbol),
  required_next_steps: nextSteps({
    currentRecords,
    unclassifiedPackets,
  }),
  caveats: [
    "Semantic classifications are triage signals, not buy recommendations.",
    "The main agent must spawn subagents and reconcile outputs; scripts only prepare, validate, cache, and summarize artifacts.",
    "Material candidates still require source-backed readiness sprint, valuation, promotion, and allocation review before buy consideration.",
  ],
};

writeJson(options.output, result);
console.log(`Wrote semantic discovery run to ${options.output}.`);

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
      index += 1;
    } else if (arg === "--generated-at") {
      parsed.generatedAt = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--packets") {
      parsed.packets = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--cache") {
      parsed.cache = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }
  ["asOf", "packets", "cache", "output"].forEach((field) => {
    if (parsed[field] === undefined) {
      throw new Error(`--${field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)} is required`);
    }
  });
  return parsed;
}

function bucketByEscalation(records) {
  const buckets = {};
  records.forEach((record) => {
    if (buckets[record.escalation] === undefined) {
      buckets[record.escalation] = [];
    }
    buckets[record.escalation].push(record);
  });
  return buckets;
}

function packetArtifactMetadata(packetArtifact) {
  return {
    cache_invalidation_policy: packetArtifact.cache_invalidation_policy ?? [],
    eligible_universe_count: packetArtifact.eligible_universe_count,
    lane_map_as_of: packetArtifact.lane_map_as_of,
    lane_map_lane_ids: packetArtifact.lane_map_lane_ids ?? [],
    lane_map_path: packetArtifact.lane_map_path,
    lane_map_sha256: packetArtifact.lane_map_sha256,
    market_context_files: packetArtifact.market_context_files ?? [],
    packet_count: packetArtifact.packet_count,
    packet_schema_version: packetArtifact.packet_schema_version,
    profile_input_files: packetArtifact.profile_input_files ?? [],
    requested_symbols: packetArtifact.requested_symbols ?? [],
    sec_input_row_count: packetArtifact.sec_input_row_count,
    sec_input_sha256: packetArtifact.sec_input_sha256,
    sec_input_source: packetArtifact.sec_input_source,
    selected_symbol_count: packetArtifact.selected_symbol_count,
    selection_strategy: packetArtifact.selection_strategy,
    source: packetArtifact.source,
  };
}

function compactRecords(records) {
  return records.map((record) => ({
    symbol: record.symbol,
    name: record.name,
    business_plain_english: record.business_plain_english,
    bottleneck_exposure: record.bottleneck_exposure,
    matched_lane_ids: record.matched_lane_ids,
    directness: record.directness,
    company_stage: record.company_stage,
    extreme_upside_fit: record.extreme_upside_fit,
    confidence: record.confidence,
    notes: record.notes,
  }));
}

function nextSteps({
  currentRecords,
  unclassifiedPackets,
}) {
  const steps = [];
  if (unclassifiedPackets.length > 0) {
    steps.push("Run low-reasoning semantic batches for unclassified issuer packets.");
  }
  if (currentRecords.some((record) => record.escalation === "medium_lane_compare")) {
    steps.push("Run medium-reasoning lane comparison for medium_lane_compare symbols.");
  }
  if (currentRecords.some((record) => record.escalation === "xhigh_readiness_candidate")) {
    steps.push("Run xhigh readiness review before promoting any xhigh_readiness_candidate.");
  }
  if (steps.length === 0) {
    steps.push("No semantic escalation from the current packet set; refresh only when source hashes, lane map, or material market state changes.");
  }
  return steps;
}
