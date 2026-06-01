import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const schemaVersion = 1;
const indexSource = "discovery_artifact_index";
const defaultRunsDir = "research/discovery/runs";

const options = parseArgs(process.argv.slice(2));
const outputPath = options.output ?? path.join(options.runsDir, `${options.asOf}-discovery-artifact-index.json`);
const generatedAt = options.generatedAt ?? new Date().toISOString();
validateOutputPath({
  asOf: options.asOf,
  outputPath,
  runsDir: options.runsDir,
});
const artifacts = discoveryArtifacts({
  asOf: options.asOf,
  outputPath,
  runsDir: options.runsDir,
});

if (artifacts.length === 0) {
  throw new Error(`No discovery artifacts found for ${options.asOf} in ${options.runsDir}`);
}

const result = {
  schema_version: schemaVersion,
  source: indexSource,
  generated_at: generatedAt,
  as_of: options.asOf,
  purpose: `Hash-anchor generated discovery artifacts from ${options.asOf}.`,
  artifacts,
};

writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Wrote discovery artifact index to ${outputPath}.`);

function parseArgs(args) {
  const parsed = {
    runsDir: defaultRunsDir,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
      index += 1;
    } else if (arg === "--runs-dir") {
      parsed.runsDir = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--generated-at") {
      parsed.generatedAt = requireIsoTimestamp(requireNextArg(args, index, arg), "--generated-at");
      index += 1;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }
  if (parsed.asOf === undefined) {
    throw new Error("--as-of is required");
  }
  if (!existsSync(parsed.runsDir)) {
    throw new Error(`--runs-dir does not exist: ${parsed.runsDir}`);
  }
  return parsed;
}

function discoveryArtifacts({
  asOf,
  outputPath,
  runsDir,
}) {
  const outputRelativePath = relativePath(outputPath);
  return discoveryArtifactFiles(runsDir)
    .filter((file) => {
      const name = path.basename(file);
      const relativeToRunsDir = path.relative(path.resolve(runsDir), path.resolve(file)).split(path.sep).join("/");
      const relative = relativePath(file);
      return relativeToRunsDir.startsWith(`${asOf}-`)
        && /\.(csv|json)$/.test(name)
        && !name.endsWith("-discovery-artifact-index.json")
        && !isCacheOnlyDiscoveryIntermediate(relativeToRunsDir)
        && relative !== outputRelativePath;
    })
    .sort()
    .map((file) => ({
      path: relativePath(file),
      sha256: sha256(readFileSync(file, "utf8")),
      role: artifactRole(file),
    }));
}

function discoveryArtifactFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return discoveryArtifactFiles(file);
    }
    if (entry.isFile()) {
      return [file];
    }
    return [];
  });
}

function isCacheOnlyDiscoveryIntermediate(relativeToRunsDir) {
  const name = path.basename(relativeToRunsDir);
  return name.endsWith("-semantic-packets.json")
    || name.endsWith("-semantic-batch-manifest.json")
    || name.endsWith("-full-sec-issuer-profiles.json")
    || name.includes("-semantic-smoke-")
    || name.includes("-semantic-validation-")
    || relativeToRunsDir.includes("-semantic-batches/");
}

function artifactRole(file) {
  const name = path.basename(file);
  if (name.endsWith("-index.metadata.json")) {
    return "sec_filing_index_metadata";
  }
  if (name.endsWith(".metadata.json")) {
    return "metadata_artifact";
  }
  if (
    name.endsWith("-profile-input.json") ||
    name.endsWith("-profiles.json") ||
    name.endsWith("-profile-enriched-scan.json")
  ) {
    return "profile_or_profile_scan_artifact";
  }
  if (name.endsWith("-registration-transaction-candidates.json")) {
    return "sec_registration_transaction_candidate_artifact";
  }
  if (name.endsWith("-semantic-packets.json")) {
    return "semantic_issuer_packet_artifact";
  }
  if (name.endsWith("-semantic-batch-manifest.json")) {
    return "semantic_batch_manifest_artifact";
  }
  if (name.endsWith("-semantic-import.json")) {
    return "semantic_classification_import_artifact";
  }
  if (name.endsWith("-semantic-discovery-run.json")) {
    return "semantic_discovery_run_artifact";
  }
  if (name.endsWith("-semantic-review-packet.json")) {
    return "semantic_review_packet_artifact";
  }
  if (name.endsWith("-scan.json")) {
    return "deterministic_scan_artifact";
  }
  if (name.endsWith(".csv")) {
    return "generated_csv_artifact";
  }
  return "generated_discovery_artifact";
}

function validateOutputPath({
  asOf,
  outputPath,
  runsDir,
}) {
  const expectedName = `${asOf}-discovery-artifact-index.json`;
  if (path.basename(outputPath) !== expectedName) {
    throw new Error(`--output must be named ${expectedName}`);
  }
  if (path.resolve(path.dirname(outputPath)) !== path.resolve(runsDir)) {
    throw new Error("--output must be written inside --runs-dir");
  }
}

function relativePath(file) {
  return path.relative(process.cwd(), path.resolve(file)).split(path.sep).join("/");
}

function requireNextArg(args, index, flag) {
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
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

function requireIsoTimestamp(value, context) {
  const text = String(value ?? "").trim();
  const match = text.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/);
  if (match === null) {
    throw new Error(`${context} must be an ISO timestamp with timezone`);
  }
  strictDate(match[1], `${context} date`);
  const [, , hour, minute, second] = match;
  if (Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) {
    throw new Error(`${context} must contain a valid time`);
  }
  const time = Date.parse(text);
  if (Number.isNaN(time)) {
    throw new Error(`${context} must be a valid ISO timestamp`);
  }
  return new Date(time).toISOString();
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}
