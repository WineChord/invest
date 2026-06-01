import path from "node:path";
import { writeFileSync } from "node:fs";
import {
  allowedReasoningLevels,
  currentSemanticCacheRecords,
  ensureDir,
  ensureParentDir,
  fileSha256,
  readJson,
  readJsonl,
  relativePath,
  requireAllowed,
  requireNextArg,
  semanticBatchSchemaVersion,
  semanticCacheKeyForPacket,
  semanticClassificationSchemaVersion,
  sha256,
  strictDate,
  writeJson,
} from "./semantic-discovery-lib.mjs";

const defaultBatchSize = 50;

const options = parseArgs(process.argv.slice(2));
const generatedAt = options.generatedAt ?? new Date().toISOString();
const packetArtifact = readJson(options.packets);
const packets = packetArtifact.packets ?? [];
const packetBySymbol = new Map(packets.map((packet) => [packet.symbol, packet]));
const cacheRecords = options.cache === undefined ? [] : readJsonl(options.cache);
const cacheStatus = currentSemanticCacheRecords({
  laneMapSha256: packetArtifact.lane_map_sha256,
  packetBySymbol,
  records: cacheRecords,
});
const selectedPackets = packets.filter((packet) => {
  if (options.symbols !== undefined && !options.symbols.has(packet.symbol)) {
    return false;
  }
  if (options.includeCached) {
    return true;
  }
  return !cacheStatus.current.has(semanticCacheKeyForPacket(packet, packetArtifact.lane_map_sha256));
});

ensureDir(options.outputDir);
const batches = [];
for (let index = 0; index < selectedPackets.length; index += options.batchSize) {
  const batchPackets = selectedPackets.slice(index, index + options.batchSize);
  const batchNumber = Math.floor(index / options.batchSize) + 1;
  const batchId = `${options.asOf}-semantic-${String(batchNumber).padStart(4, "0")}`;
  const batchPayload = {
    schema_version: semanticBatchSchemaVersion,
    source: "semantic_discovery_batch",
    generated_at: generatedAt,
    as_of: options.asOf,
    batch_id: batchId,
    reasoning_level: options.reasoningLevel,
    classification_schema_version: semanticClassificationSchemaVersion,
    packet_artifact_path: relativePath(options.packets),
    packet_artifact_sha256: fileSha256(options.packets),
    lane_map_sha256: packetArtifact.lane_map_sha256,
    packet_count: batchPackets.length,
    packets: batchPackets,
  };
  const batchPath = path.join(options.outputDir, `${batchId}.json`);
  const promptPath = path.join(options.outputDir, `${batchId}-prompt.md`);
  writeJson(batchPath, batchPayload);
  const prompt = semanticPrompt(batchPayload);
  await writeText(promptPath, prompt);
  batches.push({
    batch_id: batchId,
    batch_path: relativePath(batchPath),
    batch_sha256: fileSha256(batchPath),
    prompt_path: relativePath(promptPath),
    prompt_sha256: fileSha256(promptPath),
    symbols: batchPackets.map((packet) => packet.symbol),
  });
}

const manifest = {
  schema_version: 1,
  source: "semantic_discovery_batch_manifest",
  generated_at: generatedAt,
  as_of: options.asOf,
  reasoning_level: options.reasoningLevel,
  classification_schema_version: semanticClassificationSchemaVersion,
  packet_artifact_path: relativePath(options.packets),
  packet_artifact_sha256: fileSha256(options.packets),
  packet_count: packets.length,
  selected_packet_count: selectedPackets.length,
  skipped_current_cache_count: packets.length - selectedPackets.length,
  stale_cache_count: cacheStatus.stale.length,
  cache_path: options.cache === undefined ? "" : relativePath(options.cache),
  cache_sha256: options.cache === undefined ? "" : fileSha256(options.cache),
  batch_size: options.batchSize,
  batch_count: batches.length,
  batches,
  subagent_boundary: "Scripts generate deterministic work orders only; the main agent spawns subagents and later imports JSONL results.",
};

writeJson(options.output, manifest);
console.log(`Wrote semantic batch manifest to ${options.output}.`);

function parseArgs(args) {
  const parsed = {
    batchSize: defaultBatchSize,
    includeCached: false,
    reasoningLevel: "low",
  };
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
    } else if (arg === "--include-cached") {
      parsed.includeCached = true;
    } else if (arg === "--symbols") {
      parsed.symbols = new Set(
        requireNextArg(args, index, arg)
          .split(",")
          .map((symbol) => symbol.trim().toUpperCase())
          .filter(Boolean),
      );
      index += 1;
    } else if (arg === "--batch-size") {
      parsed.batchSize = Number(requireNextArg(args, index, arg));
      if (!Number.isInteger(parsed.batchSize) || parsed.batchSize <= 0) {
        throw new Error("--batch-size must be a positive integer");
      }
      index += 1;
    } else if (arg === "--reasoning-level") {
      parsed.reasoningLevel = requireAllowed(requireNextArg(args, index, arg), allowedReasoningLevels, "--reasoning-level");
      index += 1;
    } else if (arg === "--output-dir") {
      parsed.outputDir = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }
  ["asOf", "packets", "outputDir", "output"].forEach((field) => {
    if (parsed[field] === undefined) {
      throw new Error(`--${field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)} is required`);
    }
  });
  return parsed;
}

function semanticPrompt(batch) {
  return [
    "# Semantic Discovery Batch",
    "",
    "You are a read-only discovery subagent. The main agent coordinates the investment workflow; your job is only to classify this bounded batch.",
    "",
    "Use only the issuer packets below. Do not browse unless the main agent explicitly attached fresh sources. Do not recommend buys. Output JSONL only, one JSON object per issuer, with no prose before or after.",
    "",
    "For each issuer, answer in plain business terms: what the company does, whether it touches a structural bottleneck, whether exposure is direct or a weak proxy, whether the company looks small/early/awkward enough to deserve deeper review, and whether to escalate.",
    "",
    "Required JSONL schema per issuer:",
    "```json",
    JSON.stringify({
      bottleneck_exposure: "none|weak|possible|strong",
      business_plain_english: "one sentence",
      cik: "10-digit CIK",
      classification_schema_version: semanticClassificationSchemaVersion,
      company_stage: "too_large_mature|mature|growth|early|newly_public|unknown",
      confidence: "low|medium|high",
      directness: "none|weak_proxy|indirect|direct|unknown",
      escalation: "none|reject_or_archive|medium_lane_compare|xhigh_readiness_candidate",
      evidence_refs: [
        {
          packet_text_block_id: "source block id",
          retrieved_at: "YYYY-MM-DD or blank",
          source_published_at: "YYYY-MM-DD or source value",
          source_url: "URL or durable identifier",
        },
      ],
      extreme_upside_fit: "unlikely|possible|strong|unknown",
      issuer_packet_hash: "packet hash copied exactly",
      lane_map_sha256: batch.lane_map_sha256,
      matched_lane_ids: ["lane id"],
      notes: "short caveat",
      obvious_rejection_flags: ["flag"],
      reasoning_level: batch.reasoning_level,
      symbol: "TICKER",
    }, null, 2),
    "```",
    "",
    "Issuer packets:",
    "```json",
    JSON.stringify(batch.packets, null, 2),
    "```",
    "",
  ].join("\n");
}

async function writeText(file, content) {
  ensureParentDir(file);
  writeFileSync(file, content);
}
