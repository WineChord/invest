import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const defaultDiscoverLimit = 50;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const options = parseArgs(process.argv.slice(2));
const generatedAt = new Date().toISOString();
const asOf = options.asOf ?? generatedAt.slice(0, 10);
const outputPrefix = options.outputPrefix ?? `research/discovery/runs/${asOf}-sec-filing-index`;
mkdirSync(path.dirname(outputPrefix), { recursive: true });

const manifestPath = `${outputPrefix}-manifest.csv`;
const manifestMetadataPath = `${outputPrefix}-manifest.metadata.json`;
const profilePath = `${outputPrefix}-profiles.json`;
const scanPath = `${outputPrefix}-scan.json`;
const indexMetadataPath = `${outputPrefix}-index.metadata.json`;

const manifestCommand = [
  scriptPath("scripts/build-sec-filing-manifest.mjs"),
  "--as-of",
  asOf,
  "--output",
  manifestPath,
  "--metadata-output",
  manifestMetadataPath,
  ...optionalArg("--sec-input", options.secInput),
  ...optionalArg("--symbols", options.symbols?.join(",")),
  ...(options.all ? ["--all"] : []),
  ...optionalArg("--submissions-dir", options.submissionsDir),
  ...optionalArg("--submissions-cache-dir", options.submissionsCacheDir),
  ...(options.cacheOnly ? ["--cache-only"] : []),
  ...optionalArg("--max-submissions-cache-age-days", options.maxSubmissionsCacheAgeDays),
  ...optionalArg("--sec-submissions-base-url", options.secSubmissionsBaseUrl),
  ...optionalArg("--sec-fetch-retries", options.secFetchRetries),
  ...optionalArg("--sec-retry-delay-ms", options.secRetryDelayMs),
  ...optionalArg("--request-delay-ms", options.requestDelayMs),
  ...optionalArg("--submissions-ledger-output", options.submissionsLedgerOutput),
  ...optionalArg("--filing-dir", options.filingDir),
  ...(options.requireLocalFilings ? ["--require-local-filings"] : []),
  ...optionalArg("--filing-selection-policy", options.filingSelectionPolicy),
  ...optionalArg("--filing-types", options.filingTypes),
  ...(options.allowEmpty ? ["--allow-empty"] : []),
];
runNode(manifestCommand);

const profileCommand = [
  scriptPath("scripts/build-sec-filing-profiles.mjs"),
  "--as-of",
  asOf,
  "--manifest",
  manifestPath,
  "--manifest-metadata",
  manifestMetadataPath,
  "--output",
  profilePath,
  ...optionalArg("--sec-input", options.secInput),
  ...optionalArg("--filing-cache-dir", options.filingCacheDir),
  ...(options.cacheOnly ? ["--cache-only"] : []),
  ...optionalArg("--max-filing-cache-age-days", options.maxFilingCacheAgeDays),
  ...optionalArg("--sec-fetch-retries", options.secFetchRetries),
  ...optionalArg("--sec-retry-delay-ms", options.secRetryDelayMs),
  ...optionalArg("--request-delay-ms", options.requestDelayMs),
  ...optionalArg("--filing-ledger-output", options.filingLedgerOutput),
  ...(options.allowLocalFilingPaths ? ["--allow-local-filing-paths"] : []),
  ...(options.allowEmpty ? ["--allow-empty"] : []),
];
runNode(profileCommand);

const scanCommand = [
  scriptPath("scripts/discover-universe.mjs"),
  "--dry-run",
  "--json",
  "--as-of",
  asOf,
  "--profile-input",
  profilePath,
  "--output",
  scanPath,
  "--limit",
  String(options.discoverLimit),
  ...(options.allowLocalFilingPaths ? ["--allow-local-profile-evidence"] : []),
  ...optionalArg("--input", options.secInput),
];
runNode(scanCommand);

const manifestMetadata = readJson(manifestMetadataPath);
const profileOutput = readJson(profilePath);
const scanOutput = readJson(scanPath);
const indexScope = options.all && scanOutput.profile_coverage_status === "complete"
  ? "complete_sec_universe"
  : options.all
    ? "complete_scope_incomplete_profiles"
    : "targeted_symbols";
const indexMetadata = {
  schema_version: 1,
  generated_at: generatedAt,
  as_of: asOf,
  source: "sec_filing_discovery_index",
  index_scope: indexScope,
  requested_symbols: options.symbols ?? [],
  output_prefix: outputPrefix,
  manifest_path: manifestPath,
  manifest_metadata_path: manifestMetadataPath,
  profile_path: profilePath,
  scan_path: scanPath,
  manifest_sha256: fileSha256(manifestPath),
  manifest_metadata_sha256: fileSha256(manifestMetadataPath),
  profile_sha256: fileSha256(profilePath),
  scan_sha256: fileSha256(scanPath),
  commands: [
    commandRecord(manifestCommand),
    commandRecord(profileCommand),
    commandRecord(scanCommand),
  ],
  coverage: {
    selection_strategy: manifestMetadata.selection_strategy,
    coverage_scope: manifestMetadata.coverage_scope,
    selected_symbol_count: manifestMetadata.selected_symbol_count,
    eligible_universe_count: manifestMetadata.eligible_universe_count,
    manifest_row_count: manifestMetadata.manifest_row_count,
    profile_count: profileOutput.profile_count,
    profile_coverage_status: scanOutput.profile_coverage_status,
    profile_coverage_gap_count: scanOutput.profile_coverage_gap_count,
    profile_coverage_ratio: scanOutput.profile_coverage_ratio,
    candidate_count: scanOutput.candidate_count,
    total_match_count: scanOutput.total_match_count,
  },
  caveats: [
    "This index is deterministic discovery scaffolding, not buy eligibility.",
    "Targeted-symbol indexes answer only the requested scope and must not be cited as complete SEC universe coverage.",
    "Complete SEC universe indexes require --all and the upstream SEC submissions guardrails.",
  ],
};
writeFileSync(indexMetadataPath, `${JSON.stringify(indexMetadata, null, 2)}\n`);
console.log(`Wrote SEC filing discovery index metadata to ${indexMetadataPath}.`);

function parseArgs(args) {
  const parsed = {
    allowLocalFilingPaths: false,
    allowEmpty: false,
    all: false,
    cacheOnly: false,
    discoverLimit: defaultDiscoverLimit,
    requireLocalFilings: false,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
      index += 1;
    } else if (arg === "--output-prefix") {
      parsed.outputPrefix = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--sec-input") {
      parsed.secInput = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--symbols") {
      parsed.symbols = requireNextArg(args, index, arg)
        .split(",")
        .map((symbol) => symbol.trim().toUpperCase())
        .filter(Boolean);
      index += 1;
    } else if (arg === "--all" || arg === "--complete-sec-universe") {
      parsed.all = true;
    } else if (arg === "--discover-limit") {
      parsed.discoverLimit = positiveInteger(requireNextArg(args, index, arg), "--discover-limit");
      index += 1;
    } else if (arg === "--submissions-dir") {
      parsed.submissionsDir = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--submissions-cache-dir") {
      parsed.submissionsCacheDir = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--cache-only" || arg === "--require-cached-submissions") {
      parsed.cacheOnly = true;
    } else if (arg === "--max-submissions-cache-age-days") {
      parsed.maxSubmissionsCacheAgeDays = nonNegativeInteger(requireNextArg(args, index, arg), "--max-submissions-cache-age-days");
      index += 1;
    } else if (arg === "--sec-submissions-base-url") {
      parsed.secSubmissionsBaseUrl = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--sec-fetch-retries") {
      parsed.secFetchRetries = nonNegativeInteger(requireNextArg(args, index, arg), "--sec-fetch-retries");
      index += 1;
    } else if (arg === "--sec-retry-delay-ms") {
      parsed.secRetryDelayMs = nonNegativeInteger(requireNextArg(args, index, arg), "--sec-retry-delay-ms");
      index += 1;
    } else if (arg === "--request-delay-ms") {
      parsed.requestDelayMs = nonNegativeInteger(requireNextArg(args, index, arg), "--request-delay-ms");
      index += 1;
    } else if (arg === "--submissions-ledger-output") {
      parsed.submissionsLedgerOutput = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--filing-cache-dir") {
      parsed.filingCacheDir = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--filing-ledger-output") {
      parsed.filingLedgerOutput = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--max-filing-cache-age-days") {
      parsed.maxFilingCacheAgeDays = nonNegativeInteger(requireNextArg(args, index, arg), "--max-filing-cache-age-days");
      index += 1;
    } else if (arg === "--filing-dir") {
      parsed.filingDir = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--require-local-filings") {
      parsed.requireLocalFilings = true;
      parsed.allowLocalFilingPaths = true;
    } else if (arg === "--allow-local-filing-paths") {
      parsed.allowLocalFilingPaths = true;
    } else if (arg === "--filing-selection-policy") {
      parsed.filingSelectionPolicy = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--filing-types") {
      parsed.filingTypes = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--allow-empty") {
      parsed.allowEmpty = true;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }
  if (parsed.all && parsed.symbols !== undefined) {
    throw new Error("--all cannot be combined with --symbols");
  }
  if (!parsed.all && (parsed.symbols === undefined || parsed.symbols.length === 0)) {
    throw new Error("--symbols is required unless --all is supplied");
  }
  return parsed;
}

function runNode(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: node ${args.join(" ")}\n${result.stdout ?? ""}\n${result.stderr ?? ""}`);
  }
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
}

function commandRecord(args) {
  return {
    command: `node ${args.map(displayArg).join(" ")}`,
    output_checked: true,
  };
}

function scriptPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function displayArg(value) {
  return String(value).startsWith(repoRoot)
    ? path.relative(repoRoot, value)
    : String(value);
}

function optionalArg(flag, value) {
  if (value === undefined || value === "") {
    return [];
  }
  return [flag, String(value)];
}

function requireNextArg(args, index, flag) {
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function positiveInteger(value, context) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${context} must be a positive integer`);
  }
  return parsed;
}

function nonNegativeInteger(value, context) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${context} must be a non-negative integer`);
  }
  return parsed;
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

function readJson(file) {
  if (!existsSync(file)) {
    throw new Error(`Expected output file does not exist: ${file}`);
  }
  return JSON.parse(readFileSync(file, "utf8"));
}

function fileSha256(file) {
  return createHash("sha256").update(readFileSync(file, "utf8")).digest("hex");
}
