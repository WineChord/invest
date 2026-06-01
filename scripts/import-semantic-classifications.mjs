import {
  allowedBottleneckExposure,
  allowedCompanyStage,
  allowedConfidence,
  allowedDirectness,
  allowedExtremeUpsideFit,
  allowedReasoningLevels,
  allowedSemanticEscalations,
  currentSemanticCacheRecords,
  fileSha256,
  readJson,
  readJsonl,
  relativePath,
  requireAllowed,
  requireBoolean,
  requireNextArg,
  requireString,
  requireStringArray,
  semanticCacheKey,
  semanticClassificationSchemaVersion,
  strictDate,
  writeJson,
  writeJsonl,
} from "./semantic-discovery-lib.mjs";

const options = parseArgs(process.argv.slice(2));
const importedAt = options.importedAt ?? new Date().toISOString();
const packetArtifact = readJson(options.packets);
const packets = packetArtifact.packets ?? [];
const packetBySymbol = new Map(packets.map((packet) => [packet.symbol, packet]));
const existingCache = options.cache === undefined ? [] : readJsonl(options.cache);
const results = readJsonl(options.results);
const imported = results.map((record, index) =>
  normalizeAndValidateResult({
    importedAt,
    packetArtifact,
    packetBySymbol,
    record,
    resultIndex: index,
  }),
);
const merged = mergeCacheRecords({
  existingCache,
  imported,
});
const cacheStatus = currentSemanticCacheRecords({
  laneMapSha256: packetArtifact.lane_map_sha256,
  packetBySymbol,
  records: merged,
});

writeJsonl(options.cacheOutput, merged);
const summary = {
  schema_version: 1,
  source: "semantic_classification_import",
  generated_at: importedAt,
  as_of: options.asOf,
  packet_artifact_path: relativePath(options.packets),
  packet_artifact_sha256: fileSha256(options.packets),
  result_path: relativePath(options.results),
  result_sha256: fileSha256(options.results),
  input_cache_path: options.cache === undefined ? "" : relativePath(options.cache),
  input_cache_sha256: options.cache === undefined ? "" : fileSha256(options.cache),
  cache_output_path: relativePath(options.cacheOutput),
  imported_count: imported.length,
  cache_record_count: merged.length,
  current_cache_count: cacheStatus.current.size,
  stale_cache_count: cacheStatus.stale.length,
  escalation_counts: escalationCounts(imported),
};
writeJson(options.output, summary);
console.log(`Imported ${imported.length} semantic classifications into ${options.cacheOutput}.`);

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
      index += 1;
    } else if (arg === "--imported-at") {
      parsed.importedAt = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--packets") {
      parsed.packets = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--results") {
      parsed.results = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--cache") {
      parsed.cache = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--cache-output") {
      parsed.cacheOutput = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }
  ["asOf", "packets", "results", "cacheOutput", "output"].forEach((field) => {
    if (parsed[field] === undefined) {
      throw new Error(`--${field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)} is required`);
    }
  });
  return parsed;
}

function normalizeAndValidateResult({
  importedAt,
  packetArtifact,
  packetBySymbol,
  record,
  resultIndex,
}) {
  const context = `${options.results} line ${resultIndex + 1}`;
  const symbol = requireString(record.symbol, `${context} symbol`).toUpperCase();
  const packet = packetBySymbol.get(symbol);
  if (packet === undefined) {
    throw new Error(`${context} symbol ${symbol} is not present in packet artifact`);
  }
  if (requireString(record.cik, `${context} cik`) !== packet.cik) {
    throw new Error(`${context} cik must match packet ${packet.cik}`);
  }
  if (requireString(record.issuer_packet_hash, `${context} issuer_packet_hash`) !== packet.issuer_packet_hash) {
    throw new Error(`${context} issuer_packet_hash must match packet artifact`);
  }
  if (requireString(record.lane_map_sha256, `${context} lane_map_sha256`) !== packetArtifact.lane_map_sha256) {
    throw new Error(`${context} lane_map_sha256 must match packet artifact`);
  }
  if (record.classification_schema_version !== semanticClassificationSchemaVersion) {
    throw new Error(`${context} classification_schema_version must be ${semanticClassificationSchemaVersion}`);
  }
  const matchedLaneIds = requireStringArray(record.matched_lane_ids ?? [], `${context} matched_lane_ids`);
  matchedLaneIds.forEach((laneId) => {
    if (!packetArtifact.lane_map_lane_ids?.includes(laneId) && Array.isArray(packetArtifact.lane_map_lane_ids)) {
      throw new Error(`${context} matched_lane_ids contains unknown lane ${laneId}`);
    }
  });
  const evidenceRefs = validateEvidenceRefs(record.evidence_refs ?? [], packet, `${context} evidence_refs`);
  const normalized = {
    schema_version: 1,
    source: "semantic_classification_cache",
    imported_at: importedAt,
    as_of: options.asOf,
    cache_valid: true,
    classification_schema_version: semanticClassificationSchemaVersion,
    reasoning_level: requireAllowed(record.reasoning_level, allowedReasoningLevels, `${context} reasoning_level`),
    symbol,
    cik: packet.cik,
    name: packet.name,
    exchange: packet.exchange,
    issuer_packet_hash: packet.issuer_packet_hash,
    lane_map_sha256: packetArtifact.lane_map_sha256,
    business_plain_english: requireString(record.business_plain_english, `${context} business_plain_english`),
    bottleneck_exposure: requireAllowed(record.bottleneck_exposure, allowedBottleneckExposure, `${context} bottleneck_exposure`),
    matched_lane_ids: matchedLaneIds,
    directness: requireAllowed(record.directness, allowedDirectness, `${context} directness`),
    company_stage: requireAllowed(record.company_stage, allowedCompanyStage, `${context} company_stage`),
    extreme_upside_fit: requireAllowed(record.extreme_upside_fit, allowedExtremeUpsideFit, `${context} extreme_upside_fit`),
    obvious_rejection_flags: requireStringArray(record.obvious_rejection_flags ?? [], `${context} obvious_rejection_flags`),
    escalation: requireAllowed(record.escalation, allowedSemanticEscalations, `${context} escalation`),
    confidence: requireAllowed(record.confidence, allowedConfidence, `${context} confidence`),
    evidence_refs: evidenceRefs,
    notes: String(record.notes ?? "").trim(),
    invalidation_triggers: packet.invalidation_triggers,
  };
  if (normalized.bottleneck_exposure === "none" && normalized.escalation === "xhigh_readiness_candidate") {
    throw new Error(`${context} cannot escalate to xhigh_readiness_candidate with bottleneck_exposure none`);
  }
  requireBoolean(normalized.cache_valid, `${context} cache_valid`);
  return normalized;
}

function validateEvidenceRefs(refs, packet, context) {
  if (!Array.isArray(refs) || refs.length === 0) {
    throw new Error(`${context} must contain at least one source reference`);
  }
  const blockIds = new Set((packet.source_blocks ?? []).map((block) => block.block_id));
  return refs.map((ref, index) => {
    const itemContext = `${context}[${index}]`;
    const packetTextBlockId = requireString(ref.packet_text_block_id, `${itemContext} packet_text_block_id`);
    if (!blockIds.has(packetTextBlockId)) {
      throw new Error(`${itemContext} packet_text_block_id ${packetTextBlockId} is not in packet`);
    }
    return {
      packet_text_block_id: packetTextBlockId,
      retrieved_at: String(ref.retrieved_at ?? ""),
      source_published_at: String(ref.source_published_at ?? ""),
      source_url: String(ref.source_url ?? ""),
    };
  });
}

function mergeCacheRecords({
  existingCache,
  imported,
}) {
  const byKey = new Map();
  existingCache.forEach((record) => {
    byKey.set(semanticCacheKey(record), record);
  });
  imported.forEach((record) => {
    byKey.set(semanticCacheKey(record), record);
  });
  return [...byKey.values()].sort((left, right) => {
    const leftKey = semanticCacheKey(left);
    const rightKey = semanticCacheKey(right);
    return leftKey.localeCompare(rightKey);
  });
}

function escalationCounts(records) {
  const counts = {};
  records.forEach((record) => {
    counts[record.escalation] = (counts[record.escalation] ?? 0) + 1;
  });
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
}

