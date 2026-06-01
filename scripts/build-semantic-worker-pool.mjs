import { existsSync } from "node:fs";
import path from "node:path";
import {
  ensureDir,
  fileSha256,
  readJson,
  relativePath,
  requireNextArg,
  strictDate,
  writeJson,
} from "./semantic-discovery-lib.mjs";

const defaultWorkerCount = 4;
const manifestSource = "semantic_discovery_batch_manifest";
const poolSource = "semantic_worker_pool_manifest";
const pendingStatus = "pending_subagent";
const readyStatus = "result_ready_for_import";

const options = parseArgs(process.argv.slice(2));
const generatedAt = options.generatedAt ?? new Date().toISOString();
const batchManifest = readJson(options.batchManifest);
validateBatchManifest(batchManifest, options.batchManifest, options.asOf);
ensureDir(options.resultDir);

const workerIds = Array.from({ length: options.workerCount }, (_, index) => {
  return `worker_${String(index + 1).padStart(2, "0")}`;
});
const workerState = new Map(
  workerIds.map((workerId) => [
    workerId,
    {
      worker_id: workerId,
      assignment_count: 0,
      symbol_count: 0,
      pending_count: 0,
      result_ready_count: 0,
      assignments: [],
    },
  ]),
);
const assignments = batchManifest.batches.map((batch, index) => {
  const workerId = workerIds[index % workerIds.length];
  const state = workerState.get(workerId);
  const resultPath = path.join(options.resultDir, `${batch.batch_id}-classifications.jsonl`);
  const resultExists = existsSync(resultPath);
  const status = resultExists ? readyStatus : pendingStatus;
  const symbolCount = batch.symbols.length;
  const assignment = {
    worker_id: workerId,
    worker_sequence: state.assignment_count + 1,
    global_sequence: index + 1,
    batch_id: batch.batch_id,
    batch_path: batch.batch_path,
    batch_sha256: batch.batch_sha256,
    prompt_path: batch.prompt_path,
    prompt_sha256: batch.prompt_sha256,
    result_path: relativePath(resultPath),
    result_exists: resultExists,
    result_sha256: resultExists ? fileSha256(resultPath) : "",
    status,
    symbol_count: symbolCount,
    symbols: batch.symbols,
  };
  state.assignment_count += 1;
  state.symbol_count += symbolCount;
  state.assignments.push(batch.batch_id);
  if (status === readyStatus) {
    state.result_ready_count += 1;
  } else {
    state.pending_count += 1;
  }
  return assignment;
});

const counts = countAssignments(assignments);
const manifest = {
  schema_version: 1,
  source: poolSource,
  generated_at: generatedAt,
  as_of: options.asOf,
  worker_count: workerIds.length,
  worker_ids: workerIds,
  batch_manifest_path: relativePath(options.batchManifest),
  batch_manifest_sha256: fileSha256(options.batchManifest),
  result_dir: relativePath(options.resultDir),
  reasoning_level: batchManifest.reasoning_level,
  classification_schema_version: batchManifest.classification_schema_version,
  classifier_version: batchManifest.classifier_version,
  packet_artifact_path: batchManifest.packet_artifact_path,
  packet_artifact_sha256: batchManifest.packet_artifact_sha256,
  cache_path: batchManifest.cache_path,
  cache_sha256: batchManifest.cache_sha256,
  packet_count: batchManifest.packet_count,
  selected_packet_count: batchManifest.selected_packet_count,
  skipped_current_cache_count: batchManifest.skipped_current_cache_count,
  stale_cache_count: batchManifest.stale_cache_count,
  batch_count: batchManifest.batch_count,
  assigned_batch_count: assignments.length,
  assigned_symbol_count: assignments.reduce((total, assignment) => total + assignment.symbol_count, 0),
  pending_assignment_count: counts[pendingStatus] ?? 0,
  result_ready_assignment_count: counts[readyStatus] ?? 0,
  workers: Array.from(workerState.values()),
  assignments,
  orchestration_contract: {
    orchestrator: "main_agent",
    subagent_spawn_boundary:
      "Repository scripts only create deterministic work orders. The main agent opens prompt_path, delegates the batch to a subagent, saves returned JSONL to result_path, then imports it.",
    cache_first_rule:
      "If selected_packet_count is zero, the full current universe is already covered by current semantic cache records and no low-reasoning worker should be spawned.",
    reuse_rule:
      "Keep the fixed worker_count as a pool. When a worker finishes one assignment and the result imports cleanly, give that worker its next pending assignment.",
    failure_rule:
      "If a result is missing or fails import validation, leave the assignment pending and rerun only that batch; do not invalidate unrelated cache records.",
  },
};

writeJson(options.output, manifest);
console.log(`Wrote semantic worker pool manifest to ${options.output}.`);

function parseArgs(args) {
  const parsed = {
    workerCount: defaultWorkerCount,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
      index += 1;
    } else if (arg === "--generated-at") {
      parsed.generatedAt = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--batch-manifest") {
      parsed.batchManifest = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--worker-count") {
      parsed.workerCount = Number(requireNextArg(args, index, arg));
      if (!Number.isInteger(parsed.workerCount) || parsed.workerCount <= 0) {
        throw new Error("--worker-count must be a positive integer");
      }
      index += 1;
    } else if (arg === "--result-dir") {
      parsed.resultDir = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }
  ["asOf", "batchManifest", "resultDir", "output"].forEach((field) => {
    if (parsed[field] === undefined) {
      throw new Error(`--${field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)} is required`);
    }
  });
  return parsed;
}

function validateBatchManifest(manifest, file, asOf) {
  if (manifest.source !== manifestSource) {
    throw new Error(`${file} must be a ${manifestSource}`);
  }
  if (manifest.as_of !== asOf) {
    throw new Error(`${file} as_of ${manifest.as_of} does not match ${asOf}`);
  }
  if (!Array.isArray(manifest.batches)) {
    throw new Error(`${file} must contain batches`);
  }
  if (manifest.batch_count !== manifest.batches.length) {
    throw new Error(`${file} batch_count does not match batches length`);
  }
  const seen = new Set();
  for (const batch of manifest.batches) {
    if (typeof batch.batch_id !== "string" || batch.batch_id.trim() === "") {
      throw new Error(`${file} contains a batch without batch_id`);
    }
    if (seen.has(batch.batch_id)) {
      throw new Error(`${file} contains duplicate batch_id ${batch.batch_id}`);
    }
    seen.add(batch.batch_id);
    if (!Array.isArray(batch.symbols)) {
      throw new Error(`${file} batch ${batch.batch_id} must contain symbols`);
    }
    for (const requiredField of ["batch_path", "batch_sha256", "prompt_path", "prompt_sha256"]) {
      if (typeof batch[requiredField] !== "string" || batch[requiredField].trim() === "") {
        throw new Error(`${file} batch ${batch.batch_id} is missing ${requiredField}`);
      }
    }
  }
  const assignedSymbols = manifest.batches.reduce((total, batch) => total + batch.symbols.length, 0);
  if (assignedSymbols !== manifest.selected_packet_count) {
    throw new Error(`${file} selected_packet_count does not match assigned symbols`);
  }
}

function countAssignments(assignments) {
  return assignments.reduce((counts, assignment) => {
    counts[assignment.status] = (counts[assignment.status] ?? 0) + 1;
    return counts;
  }, {});
}
