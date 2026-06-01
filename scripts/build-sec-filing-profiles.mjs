import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  currentSecUserAgent,
  defaultSecFetchRetries as sharedDefaultSecFetchRetries,
  defaultSecRetryDelayMs as sharedDefaultSecRetryDelayMs,
  fetchSecJsonWithRetry,
  fetchSecTextWithRetry,
} from "./sec-fetch-lib.mjs";

const profileSchemaVersion = 1;
const profilePurpose = "issuer_universe_discovery";
const outputSourceName = "sec_filing_business_sections";
const filingCacheMetadataSchemaVersion = 1;
const maxProfileTextLength = 4000;
const minBusinessSectionLength = 40;
const defaultMaxFilingCacheAgeDays = 1;
const defaultSecFetchRetries = sharedDefaultSecFetchRetries;
const defaultSecRetryDelayMs = sharedDefaultSecRetryDelayMs;
const profileTextField = "business_description";
const supportedFilingTypes = new Set(["10-K", "20-F", "S-1", "F-1", "424B", "8-K", "6-K", "10-Q", "S-4", "F-4", "DEF14A"]);
const allowedDiscoveryExchanges = new Set(["Nasdaq", "NYSE", "NYSE American"]);
const secCompanyTickersExchangeUrl = "https://www.sec.gov/files/company_tickers_exchange.json";
const secUserAgent = currentSecUserAgent();
const millisecondsPerDay = 24 * 60 * 60 * 1000;

const options = parseArgs(process.argv.slice(2));
const generatedAt = new Date().toISOString();
const retrievedAt = options.asOf ?? generatedAt.slice(0, 10);
const filingCacheStats = {
  hits: 0,
  misses: 0,
  writes: 0,
};
const filingLedger = [];
const secReference = await loadSecReference(options.secInput);
const secReferenceBySymbol = secReference.bySymbol;
const rows = csvRecords(options.manifest);
const manifestCoverage = loadManifestCoverageMetadata({
  eligibleUniverseCount: secReference.eligibleUniverseCount,
  manifestPath: options.manifest,
  metadataPath: options.manifestMetadata,
  rows,
});
const profiles = [];
const skipped_symbols = [];
const seenSymbols = new Set();
const seenCiks = new Map();

for (let index = 0; index < rows.length; index += 1) {
  const row = rows[index];
  const context = `${options.manifest} row ${index + 2}`;
  const symbol = requiredString(row.symbol, `${context} symbol`).toUpperCase();
  const secReference = secReferenceBySymbol.get(symbol);
  if (secReference === undefined) {
    skipped_symbols.push({
      symbol,
      reason: "missing_sec_reference",
    });
    continue;
  }
  const cik = requiredString(row.cik, `${context} cik`);
  const normalizedCik = normalizeCik(cik);
  if (normalizeCik(secReference.cik) !== normalizedCik) {
    throw new Error(`${context} CIK mismatch for ${symbol}: profile=${cik} sec=${secReference.cik}`);
  }
  const exchange = requiredString(row.exchange, `${context} exchange`);
  if (normalizeExchange(exchange) !== normalizeExchange(secReference.exchange)) {
    throw new Error(`${context} exchange mismatch for ${symbol}: profile=${exchange} sec=${secReference.exchange}`);
  }
  const filingType = normalizedFilingType(requiredString(row.filing_type, `${context} filing_type`));
  if (!supportedFilingTypes.has(filingType)) {
    throw new Error(`${context} unsupported filing_type ${filingType}`);
  }
  if (seenSymbols.has(symbol)) {
    throw new Error(`${context} duplicates filing profile symbol ${symbol}`);
  }
  const duplicateCikSymbol = seenCiks.get(normalizedCik);
  if (duplicateCikSymbol !== undefined) {
    throw new Error(`${context} CIK ${cik} is used by both ${duplicateCikSymbol} and ${symbol}`);
  }
  seenSymbols.add(symbol);
  seenCiks.set(normalizedCik, symbol);

  const sourceUrl = requiredString(row.source_url, `${context} source_url`);
  const sourcePublishedAt = strictDate(requiredString(row.source_published_at, `${context} source_published_at`), `${context} source_published_at`);
  let filingContentResult;
  try {
    filingContentResult = await loadFilingContent({
      cik,
      context,
      row,
      sourceUrl,
      symbol,
    });
  } catch (error) {
    recordFilingLedger(failedFilingLedgerEntry({
      cik,
      error,
      sourceUrl,
      symbol,
    }), options);
    throw error;
  }
  recordFilingLedger(filingContentResult.ledgerEntry, options);
  const filingContent = filingContentResult.content;
  const extracted = safeExtractBusinessSection({
    context,
    content: filingContent,
    endMarker: optionalString(row.section_end),
    filingType,
    startMarker: optionalString(row.section_start),
    symbol,
  });
  if (extracted.skipped) {
    skipped_symbols.push({
      symbol,
      reason: extracted.reason,
    });
    continue;
  }
  if (extracted.value === "") {
    skipped_symbols.push({
      symbol,
      reason: "missing_business_section_text",
    });
    continue;
  }
  const rowRetrievedAt = optionalString(row.retrieved_at);
  if (rowRetrievedAt !== "") {
    strictDate(rowRetrievedAt, `${context} retrieved_at`);
  }
  const effectiveRetrievedAt = rowRetrievedAt || retrievedAt;
  if (sourcePublishedAt > effectiveRetrievedAt) {
    throw new Error(`${context} source_published_at must not be after retrieved_at`);
  }
  profiles.push({
    symbol,
    cik,
    filing_type: filingType,
    source_name: `${outputSourceName}:${filingType}`,
    source_url: sourceUrl,
    source_published_at: sourcePublishedAt,
    retrieved_at: effectiveRetrievedAt,
    text: extracted.value,
    profile_text_fields: [profileTextField],
    profile_field_texts: {
      [profileTextField]: extracted.value,
    },
    profile_text_truncated: extracted.truncated,
    filing_accession_or_document_id: optionalString(row.accession_or_document_id),
    filing_accession_number: optionalString(row.accession_number),
    filing_acceptance_datetime: optionalString(row.acceptance_datetime),
    filing_content_sha256: sha256(filingContent),
    filing_content_cache_status: filingContentResult.ledgerEntry.cache_status,
    filing_content_request_attempt_count: filingContentResult.ledgerEntry.request_attempt_count,
    filing_content_request_statuses: filingContentResult.ledgerEntry.request_statuses,
    filing_primary_document: optionalString(row.primary_document),
    filing_report_date: optionalString(row.report_date),
    filing_sec_form_original: optionalString(row.sec_form_original) || optionalString(row.sec_form),
    filing_business_prospectus_424b_candidate_count: optionalString(row.business_prospectus_424b_candidate_count),
    filing_foundational_candidate_count: optionalString(row.foundational_candidate_count),
    filing_lower_tier_newer_filing_forms: optionalString(row.lower_tier_newer_filing_forms),
    filing_newer_supported_filing_displaced_count: optionalString(row.newer_supported_filing_displaced_count),
    filing_newer_supported_filing_forms: optionalString(row.newer_supported_filing_forms),
    filing_selected_sec_form_base: optionalString(row.selected_sec_form_base),
    filing_selection_family: optionalString(row.filing_selection_family),
    filing_selection_policy: optionalString(row.filing_selection_policy),
    filing_selection_reason: optionalString(row.selection_reason),
    filing_selection_tier: optionalString(row.filing_selection_tier),
    filing_selection_warnings: optionalString(row.selection_warnings),
    filing_submission_url: optionalString(row.sec_submission_url),
    filing_supplement_424b_candidate_count: optionalString(row.supplement_424b_candidate_count),
    filing_unknown_424b_candidate_count: optionalString(row.unknown_424b_candidate_count),
    extraction_method: extracted.method,
    extraction_start_marker: extracted.startMarker,
    extraction_end_marker: extracted.endMarker,
    extraction_start_offset: extracted.startOffset,
    extraction_end_offset: extracted.endOffset,
    extraction_section_length: extracted.sectionLength,
    extraction_start_pattern: extracted.startPattern,
    extraction_start_pattern_label: extracted.startPatternLabel,
    extraction_warnings: extracted.warnings,
  });
}

profiles.sort((left, right) => left.symbol.localeCompare(right.symbol));

if (profiles.length === 0 && !options.allowEmpty) {
  throw new Error("No SEC filing profiles were emitted; pass --allow-empty only for explicit empty-artifact tests");
}

const result = {
  schema_version: profileSchemaVersion,
  generated_at: generatedAt,
  source: outputSourceName,
  profile_purpose: profilePurpose,
  profile_text_fields: [profileTextField],
  source_files: [
    options.manifest,
    options.secInput ?? secCompanyTickersExchangeUrl,
    ...(manifestCoverage.metadataPath === "" ? [] : [manifestCoverage.metadataPath]),
    ...(options.filingCacheDir === undefined ? [] : [options.filingCacheDir]),
  ],
  filing_cache_dir: options.filingCacheDir ?? "",
  filing_cache_hits: filingCacheStats.hits,
  filing_cache_misses: filingCacheStats.misses,
  filing_cache_writes: filingCacheStats.writes,
  filing_cache_only: options.cacheOnly,
  filing_ledger_output: options.filingLedgerOutput ?? "",
  filing_ledger_count: filingLedger.length,
  filing_ledger: filingLedger,
  max_filing_cache_age_days: options.maxFilingCacheAgeDays,
  sec_fetch_retries: options.secFetchRetries,
  sec_retry_delay_ms: options.secRetryDelayMs,
  sec_user_agent: secUserAgent,
  sec_request_delay_ms: options.requestDelayMs,
  selection_strategy: "manifest_filing_sections",
  manifest_selection_strategy: manifestCoverage.coverageStrategy,
  profile_coverage_strategy: manifestCoverage.coverageStrategy,
  coverage_scope: manifestCoverage.coverageScope,
  requested_symbols: manifestCoverage.requestedSymbols,
  selected_symbol_count: manifestCoverage.selectedSymbolCount,
  eligible_universe_count: manifestCoverage.eligibleUniverseCount,
  coverage_limit: manifestCoverage.coverageLimit,
  sampling_note: manifestCoverage.samplingNote,
  manifest_metadata_path: manifestCoverage.metadataPath,
  manifest_row_count: rows.length,
  profile_count: profiles.length,
  skipped_symbols,
  profiles,
};

const output = `${JSON.stringify(result, null, 2)}\n`;
if (options.output === undefined) {
  process.stdout.write(output);
} else {
  writeFileSync(options.output, output);
  console.log(`Wrote SEC filing profile input to ${options.output}.`);
}

function parseArgs(args) {
  const parsed = {
    allowLocalFilingPaths: false,
    allowEmpty: false,
    cacheOnly: false,
    maxFilingCacheAgeDays: defaultMaxFilingCacheAgeDays,
    requestDelayMs: 0,
    secFetchRetries: defaultSecFetchRetries,
    secRetryDelayMs: defaultSecRetryDelayMs,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--manifest") {
      parsed.manifest = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--sec-input") {
      parsed.secInput = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--manifest-metadata") {
      parsed.manifestMetadata = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--filing-cache-dir") {
      parsed.filingCacheDir = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--filing-ledger-output") {
      parsed.filingLedgerOutput = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--cache-only" || arg === "--require-cached-filings") {
      parsed.cacheOnly = true;
    } else if (arg === "--max-filing-cache-age-days") {
      parsed.maxFilingCacheAgeDays = Number(requireNextArg(args, index, arg));
      if (!Number.isInteger(parsed.maxFilingCacheAgeDays) || parsed.maxFilingCacheAgeDays < 0) {
        throw new Error("--max-filing-cache-age-days must be a non-negative integer");
      }
      index += 1;
    } else if (arg === "--request-delay-ms") {
      parsed.requestDelayMs = Number(requireNextArg(args, index, arg));
      if (!Number.isInteger(parsed.requestDelayMs) || parsed.requestDelayMs < 0) {
        throw new Error("--request-delay-ms must be a non-negative integer");
      }
      index += 1;
    } else if (arg === "--sec-fetch-retries") {
      parsed.secFetchRetries = Number(requireNextArg(args, index, arg));
      if (!Number.isInteger(parsed.secFetchRetries) || parsed.secFetchRetries < 0) {
        throw new Error("--sec-fetch-retries must be a non-negative integer");
      }
      index += 1;
    } else if (arg === "--sec-retry-delay-ms") {
      parsed.secRetryDelayMs = Number(requireNextArg(args, index, arg));
      if (!Number.isInteger(parsed.secRetryDelayMs) || parsed.secRetryDelayMs < 0) {
        throw new Error("--sec-retry-delay-ms must be a non-negative integer");
      }
      index += 1;
    } else if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
      index += 1;
    } else if (arg === "--allow-empty") {
      parsed.allowEmpty = true;
    } else if (arg === "--allow-local-filing-paths") {
      parsed.allowLocalFilingPaths = true;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }
  if (parsed.manifest === undefined) {
    throw new Error("--manifest is required");
  }
  return parsed;
}

function loadManifestCoverageMetadata({
  eligibleUniverseCount,
  manifestPath,
  metadataPath,
  rows,
}) {
  if (metadataPath === undefined) {
    const requestedSymbols = rows
      .map((row) => optionalString(row.symbol).toUpperCase())
      .filter(Boolean);
    return {
      coverageLimit: rows.length,
      coverageScope: "partial_manifest_rows_only",
      coverageStrategy: "manifest_rows_without_sampling_metadata",
      eligibleUniverseCount,
      metadataPath: "",
      requestedSymbols,
      samplingNote: "Manifest metadata was not supplied; coverage claims are limited to emitted manifest rows and must not be treated as broader SEC universe coverage.",
      selectedSymbolCount: rows.length,
    };
  }
  const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
  const manifestRowCount = requiredInteger(metadata.manifest_row_count, `${metadataPath} manifest_row_count`);
  if (manifestRowCount !== rows.length) {
    throw new Error(`${metadataPath} manifest_row_count ${manifestRowCount} does not match ${manifestPath} rows ${rows.length}`);
  }
  const coverageStrategy = requiredString(metadata.selection_strategy, `${metadataPath} selection_strategy`);
  const metadataEligibleUniverseCount = requiredInteger(metadata.eligible_universe_count, `${metadataPath} eligible_universe_count`);
  if (metadataEligibleUniverseCount !== eligibleUniverseCount) {
    throw new Error(`${metadataPath} eligible_universe_count ${metadataEligibleUniverseCount} does not match current SEC input eligible universe count ${eligibleUniverseCount}`);
  }
  return {
    coverageLimit: requiredInteger(metadata.coverage_limit, `${metadataPath} coverage_limit`),
    coverageScope: optionalString(metadata.coverage_scope) || coverageScopeForStrategy(coverageStrategy),
    coverageStrategy,
    eligibleUniverseCount: metadataEligibleUniverseCount,
    metadataPath,
    requestedSymbols: requiredStringArray(metadata.requested_symbols, `${metadataPath} requested_symbols`),
    samplingNote: requiredString(metadata.sampling_note, `${metadataPath} sampling_note`),
    selectedSymbolCount: requiredInteger(metadata.selected_symbol_count, `${metadataPath} selected_symbol_count`),
  };
}

function coverageScopeForStrategy(strategy) {
  if (strategy === "requested_symbols") {
    return "partial_requested_symbols";
  }
  if (strategy === "first_n_sec_rows_smoke_test") {
    return "partial_first_n_smoke_test";
  }
  if (strategy === "complete_sec_universe") {
    return "complete_sec_universe";
  }
  return "partial_unknown_sampling_strategy";
}

function requiredInteger(value, context) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${context} must be a non-negative integer`);
  }
  return value;
}

function requiredStringArray(value, context) {
  if (!Array.isArray(value)) {
    throw new Error(`${context} must be an array`);
  }
  return value.map((item, index) => requiredString(item, `${context}[${index}]`));
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

function requiredIsoTimestamp(value, context) {
  const text = requiredString(value, context);
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

async function loadFilingContent({
  cik,
  context,
  row,
  sourceUrl,
  symbol,
}) {
  const filingPath = optionalString(row.filing_path);
  if (filingPath !== "") {
    if (!options.allowLocalFilingPaths && !sourceUrl.startsWith("fixture://")) {
      throw new Error(`${context} filing_path requires --allow-local-filing-paths and must be used only for explicit fixtures`);
    }
    const resolvedPath = path.resolve(filingPath);
    if (!existsSync(resolvedPath)) {
      throw new Error(`${context} filing_path does not exist: ${filingPath}`);
    }
    const content = readFileSync(resolvedPath, "utf8");
    return {
      content,
      ledgerEntry: filingLedgerEntry({
        cacheAgeDays: "",
        cacheObservedAt: "",
        cacheStatus: "local_path",
        cik,
        content,
        fetchedAt: "",
        validationStatus: "local_fixture_only",
        sourceUrl,
        symbol,
      }),
    };
  }
  const cacheFile = filingCacheFile(sourceUrl);
  if (options.filingCacheDir !== undefined && existsSync(cacheFile)) {
    filingCacheStats.hits += 1;
    const content = readFileSync(cacheFile, "utf8");
    const cacheMetadata = validateFilingCacheMetadata({
      cacheFile,
      content,
      options,
      sourceUrl,
    });
    return {
      content,
      ledgerEntry: filingLedgerEntry({
        cacheAgeDays: cacheMetadata.cacheAgeDays,
        cacheObservedAt: cacheMetadata.fetchedAt,
        cacheStatus: "cache_hit",
        cik,
        content,
        fetchedAt: "",
        sourceUrl,
        symbol,
      }),
    };
  }
  if (options.filingCacheDir !== undefined) {
    filingCacheStats.misses += 1;
  }
  if (options.cacheOnly) {
    throw new Error(`${context} missing cached SEC filing content for ${symbol}: ${sourceUrl}`);
  }
  const fetchResult = await fetchFilingTextWithRetry({
    context,
    sourceUrl,
  });
  const content = fetchResult.content;
  if (options.filingCacheDir !== undefined) {
    mkdirSync(options.filingCacheDir, { recursive: true });
    writeFileSync(cacheFile, content);
    writeFileSync(cacheMetadataFile(cacheFile), `${JSON.stringify(filingCacheMetadata({
      content,
      sourceUrl,
    }), null, 2)}\n`);
    filingCacheStats.writes += 1;
  }
  return {
    content,
    ledgerEntry: filingLedgerEntry({
      cacheAgeDays: 0,
      cacheObservedAt: generatedAt,
      cacheStatus: options.filingCacheDir === undefined ? "network_fetch" : "cache_miss_fetched",
      cik,
      content,
      fetchedAt: generatedAt,
      requestStatuses: fetchResult.requestStatuses,
      attemptCount: fetchResult.attemptCount,
      sourceUrl,
      symbol,
    }),
  };
}

function filingCacheFile(sourceUrl) {
  return path.join(options.filingCacheDir ?? "", `${sha256(sourceUrl)}.html`);
}

function cacheMetadataFile(cacheFile) {
  return `${cacheFile}.metadata.json`;
}

function filingCacheMetadata({
  content,
  sourceUrl,
}) {
  return {
    schema_version: filingCacheMetadataSchemaVersion,
    source: outputSourceName,
    source_url: sourceUrl,
    fetched_at: generatedAt,
    retrieved_at: retrievedAt,
    payload_sha256: sha256(content),
    sec_user_agent: secUserAgent,
  };
}

function validateFilingCacheMetadata({
  cacheFile,
  content,
  options,
  sourceUrl,
}) {
  const metadataPath = cacheMetadataFile(cacheFile);
  if (!existsSync(metadataPath)) {
    throw new Error(`Cached SEC filing metadata file is missing for ${cacheFile}`);
  }
  const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
  if (metadata.schema_version !== filingCacheMetadataSchemaVersion) {
    throw new Error(`${metadataPath} schema_version must be ${filingCacheMetadataSchemaVersion}`);
  }
  if (metadata.source_url !== sourceUrl) {
    throw new Error(`${metadataPath} source_url does not match requested SEC filing URL`);
  }
  if (metadata.payload_sha256 !== sha256(content)) {
    throw new Error(`${metadataPath} payload_sha256 does not match cached SEC filing content`);
  }
  const fetchedAt = requiredIsoTimestamp(metadata.fetched_at, `${metadataPath} fetched_at`);
  strictDate(requiredString(metadata.retrieved_at, `${metadataPath} retrieved_at`), `${metadataPath} retrieved_at`);
  if (metadata.sec_user_agent !== secUserAgent) {
    throw new Error(`${metadataPath} sec_user_agent does not match current SEC user agent`);
  }
  const cacheAgeDays = cacheAgeDaysFor({
    cacheObservedAt: fetchedAt,
    retrievedAt,
  });
  if (cacheAgeDays > options.maxFilingCacheAgeDays) {
    throw new Error(`Cached SEC filing file ${cacheFile} is stale for ${retrievedAt}: age ${cacheAgeDays} days exceeds max ${options.maxFilingCacheAgeDays}`);
  }
  return {
    cacheAgeDays,
    fetchedAt,
  };
}

function cacheAgeDaysFor({
  cacheObservedAt,
  retrievedAt,
}) {
  const cacheDate = strictDate(cacheObservedAt.slice(0, 10), "cache observed date");
  const cacheTime = Date.parse(`${cacheDate}T00:00:00.000Z`);
  const retrievedTime = Date.parse(`${strictDate(retrievedAt, "retrieved_at")}T00:00:00.000Z`);
  if (cacheTime > retrievedTime) {
    throw new Error(`Cached SEC filing observed date ${cacheDate} is after requested as-of ${retrievedAt}`);
  }
  return Math.floor((retrievedTime - cacheTime) / millisecondsPerDay);
}

async function fetchFilingTextWithRetry({
  context,
  sourceUrl,
}) {
  return await fetchSecTextWithRetry({
    accept: "text/html,application/xhtml+xml,text/plain,*/*",
    context: `${context} filing fetch failed`,
    requestDelayMs: options.requestDelayMs,
    retries: options.secFetchRetries,
    retryDelayMs: options.secRetryDelayMs,
    sourceUrl,
  });
}

function filingLedgerEntry({
  attemptCount = 0,
  cacheAgeDays,
  cacheObservedAt,
  cacheStatus,
  cik,
  content,
  fetchedAt,
  requestStatuses = [],
  sourceUrl,
  symbol,
  validationStatus = "validated",
}) {
  return {
    symbol,
    cik,
    source_url: sourceUrl,
    cache_status: cacheStatus,
    cache_observed_at: cacheObservedAt,
    cache_age_days: cacheAgeDays,
    max_cache_age_days: options.maxFilingCacheAgeDays,
    payload_sha256: sha256(content),
    validation_status: validationStatus,
    request_attempt_count: attemptCount,
    request_statuses: requestStatuses,
    retrieved_at: retrievedAt,
    fetched_at: fetchedAt,
  };
}

function failedFilingLedgerEntry({
  cik,
  error,
  sourceUrl,
  symbol,
}) {
  return {
    symbol,
    cik,
    source_url: sourceUrl,
    cache_status: "failed",
    cache_observed_at: "",
    cache_age_days: "",
    max_cache_age_days: options.maxFilingCacheAgeDays,
    payload_sha256: "",
    validation_status: "failed",
    request_attempt_count: Number.isInteger(error?.requestAttemptCount) ? error.requestAttemptCount : 0,
    request_statuses: Array.isArray(error?.requestStatuses) ? error.requestStatuses : [],
    retrieved_at: retrievedAt,
    fetched_at: "",
    error: error instanceof Error ? error.message : String(error),
  };
}

function recordFilingLedger(entry, options) {
  filingLedger.push(entry);
  if (options.filingLedgerOutput === undefined) {
    return;
  }
  mkdirSync(path.dirname(options.filingLedgerOutput), { recursive: true });
  writeFileSync(options.filingLedgerOutput, `${JSON.stringify(filingLedgerArtifact(), null, 2)}\n`);
}

function filingLedgerArtifact() {
  return {
    schema_version: 1,
    generated_at: generatedAt,
    source: outputSourceName,
    retrieved_at: retrievedAt,
    max_filing_cache_age_days: options.maxFilingCacheAgeDays,
    sec_fetch_retries: options.secFetchRetries,
    sec_retry_delay_ms: options.secRetryDelayMs,
    filing_ledger_count: filingLedger.length,
    filing_ledger: filingLedger,
  };
}

function safeExtractBusinessSection({
  content,
  context,
  endMarker,
  filingType,
  startMarker,
  symbol,
}) {
  try {
    return extractBusinessSection({
      context,
      content,
      endMarker,
      filingType,
      startMarker,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("missing business section start marker")) {
      return {
        reason: "missing_business_section_start",
        skipped: true,
        symbol,
      };
    }
    if (error instanceof Error && error.message.includes("business section text is too short")) {
      return {
        reason: "business_section_too_short",
        skipped: true,
        symbol,
      };
    }
    throw error;
  }
}

function extractBusinessSection({
  context,
  content,
  endMarker,
  filingType,
  startMarker,
}) {
  const text = normalizeFilingText(content);
  const startCandidates = markerCandidates({
    fallbackPatterns: businessStartPatterns(filingType),
    marker: startMarker,
    text,
  });
  if (startCandidates.length === 0) {
    throw new Error(`${context} missing business section start marker`);
  }
  let falseStartCount = 0;
  const falseStartReasons = new Set();
  for (const start of startCandidates) {
    const startText = text.slice(start.index);
    const endRelative = markerIndex({
      fallbackPatterns: businessEndPatterns(filingType),
      marker: endMarker,
      text: startText.slice(20),
    });
    const endOffset = endRelative < 0
      ? text.length
      : start.index + endRelative + 20;
    const section = endRelative < 0
      ? startText
      : startText.slice(0, endRelative + 20);
    const cleaned = cleanBusinessSection(section);
    const falseStartReason = startMarker === ""
      ? autoExtractionFalseStartReason({
        filingType,
        section: cleaned,
        startCandidate: start,
      })
      : "";
    if (falseStartReason !== "") {
      falseStartCount += 1;
      falseStartReasons.add(falseStartReason);
      continue;
    }
    if (cleaned.length >= minBusinessSectionLength || startMarker !== "") {
      const warnings = [];
      if (endRelative < 0) {
        warnings.push("missing_auto_end_marker");
      }
      if (falseStartCount > 0) {
        warnings.push(`skipped_auto_false_start_count:${falseStartCount}`);
      }
      if (falseStartReasons.size > 0) {
        warnings.push(`skipped_auto_false_start_reasons:${[...falseStartReasons].sort().join("|")}`);
      }
      return {
        endMarker: endMarker || "auto",
        endOffset,
        method: startMarker === "" ? `auto_${filingType.toLowerCase()}_business_section` : "explicit_manifest_markers",
        sectionLength: cleaned.length,
        startMarker: startMarker || "auto",
        startOffset: start.index,
        startPattern: start.id,
        startPatternLabel: start.label,
        truncated: cleaned.length > maxProfileTextLength,
        value: cleaned.slice(0, maxProfileTextLength),
        warnings,
      };
    }
  }
  throw new Error(`${context} business section text is too short after extraction`);
}

function markerIndex({
  fallbackPatterns,
  marker,
  text,
}) {
  if (marker !== "") {
    return text.toLowerCase().indexOf(marker.toLowerCase());
  }
  const indexes = fallbackPatterns
    .map((pattern) => {
      const match = text.match(pattern);
      return match?.index ?? -1;
    })
    .filter((index) => index >= 0);
  return indexes.length === 0 ? -1 : Math.min(...indexes);
}

function markerCandidates({
  fallbackPatterns,
  marker,
  text,
}) {
  if (marker !== "") {
    const index = text.toLowerCase().indexOf(marker.toLowerCase());
    return index < 0
      ? []
      : [{
        id: "explicit_manifest_marker",
        index,
        label: marker,
      }];
  }
  const candidatesByIndex = new Map();
  fallbackPatterns.forEach((entry, rank) => {
    for (const match of text.matchAll(entry.pattern)) {
      const index = match.index;
      if (index < 0) {
        continue;
      }
      const current = candidatesByIndex.get(index);
      if (current === undefined || rank < current.rank) {
        candidatesByIndex.set(index, {
          id: entry.id,
          index,
          label: entry.label,
          rank,
        });
      }
    }
  });
  return [...candidatesByIndex.values()].sort((left, right) =>
    left.index - right.index || left.rank - right.rank,
  );
}

function businessStartPatterns(filingType) {
  if (filingType === "8-K") {
    return [
      startPattern("item_1_01_material_agreement", "Item 1.01 material definitive agreement", /\bitem\s+1\.?01\.?\s+entry into a material definitive agreement\b/gi),
      startPattern("item_2_01_acquisition_disposition", "Item 2.01 acquisition or disposition", /\bitem\s+2\.?01\.?\s+completion of acquisition or disposition\b/gi),
      startPattern("item_7_01_regulation_fd", "Item 7.01 regulation FD disclosure", /\bitem\s+7\.?01\.?\s+regulation fd disclosure\b/gi),
      startPattern("item_8_01_other_events", "Item 8.01 other events", /\bitem\s+8\.?01\.?\s+other events\b/gi),
      startPattern("explanatory_note", "Explanatory Note", /\bexplanatory note\b/gi),
      startPattern("business_update", "Business Update", /\bbusiness update\b/gi),
    ];
  }
  if (filingType === "6-K") {
    return [
      startPattern("explanatory_note", "Explanatory Note", /\bexplanatory note\b/gi),
      startPattern("other_information", "Other Information", /\bother information\b/gi),
      startPattern("press_release", "Press Release", /\bpress release\b/gi),
      startPattern("business_update", "Business Update", /\bbusiness update\b/gi),
    ];
  }
  if (filingType === "10-Q") {
    return [
      startPattern("item_2_mdna", "Item 2 management discussion", /\bitem\s+2\.?\s+management'?s discussion and analysis\b/gi),
      startPattern("business_update", "Business Update", /\bbusiness update\b/gi),
    ];
  }
  if (filingType === "S-4" || filingType === "F-4" || filingType === "DEF14A") {
    return [
      startPattern("prospectus_summary", "Prospectus Summary", /\bprospectus summary\b/gi),
      startPattern("transaction_summary", "Transaction Summary", /\btransaction summary\b/gi),
      startPattern("the_transaction", "The Transaction", /\bthe transaction\b/gi),
      startPattern("the_merger", "The Merger", /\bthe merger\b/gi),
      startPattern("business_combination", "Business Combination", /\bbusiness combination\b/gi),
      startPattern("our_business", "Our Business", /\bour business\b/gi),
      startPattern("business_overview", "Business Overview", /\bbusiness overview\b/gi),
    ];
  }
  if (filingType === "20-F") {
    return [
      startPattern("item_4_information_on_company", "Item 4 information on the company", /\bitem\s+4\.?\s+information on the company\b/gi),
      startPattern("item_4b_business_overview", "Item 4B business overview", /\bitem\s+4\.?b\.?\s+business overview\b/gi),
    ];
  }
  if (filingType === "10-K") {
    return [
      startPattern("item_1_business", "Item 1 Business", /\bitem\s+1\.?\s+business\b/gi),
    ];
  }
  if (filingType === "424B") {
    return [
      startPattern("prospectus_summary", "Prospectus Summary", /\bprospectus summary\b/gi),
      startPattern("our_company", "Our Company", /\bour company\b/gi),
      startPattern("company_overview", "Company Overview", /\bcompany overview\b/gi),
      startPattern("our_business", "Our Business", /\bour business\b/gi),
      startPattern("business_overview", "Business Overview", /\bbusiness overview\b/gi),
    ];
  }
  if (filingType === "S-1" || filingType === "F-1") {
    return [
      startPattern("item_1_business", "Item 1 Business", /\bitem\s+1\.?\s+business\b/gi),
      startPattern("prospectus_summary", "Prospectus Summary", /\bprospectus summary\b/gi),
      startPattern("our_company", "Our Company", /\bour company\b/gi),
      startPattern("company_overview", "Company Overview", /\bcompany overview\b/gi),
      startPattern("our_business", "Our Business", /\bour business\b/gi),
      startPattern("business_overview", "Business Overview", /\bbusiness overview\b/gi),
    ];
  }
  return [
    startPattern("business_overview", "Business Overview", /\bbusiness overview\b/gi),
  ];
}

function startPattern(id, label, pattern) {
  return {
    id,
    label,
    pattern,
  };
}

function businessEndPatterns(filingType) {
  if (filingType === "8-K") {
    return [
      /\bitem\s+9\.?01\.?\s+financial statements and exhibits\b/i,
      /\bsignature\b/i,
      /\bexhibit index\b/i,
    ];
  }
  if (filingType === "6-K") {
    return [
      /\bsignature\b/i,
      /\bexhibit index\b/i,
    ];
  }
  if (filingType === "10-Q") {
    return [
      /\bitem\s+3\.?\s+quantitative and qualitative disclosures\b/i,
      /\bitem\s+4\.?\s+controls and procedures\b/i,
      /\bpart ii\b/i,
    ];
  }
  if (filingType === "S-4" || filingType === "F-4" || filingType === "DEF14A") {
    return [
      /\brisk factors\b/i,
      /\bsummary risk factors\b/i,
      /\bquestions and answers\b/i,
      /\bthe special meeting\b/i,
    ];
  }
  if (filingType === "20-F") {
    return [
      /\bitem\s+5\.?\s+operating and financial review\b/i,
      /\bitem\s+5\.?\s+operating\b/i,
      /\brisk factors\b/i,
    ];
  }
  if (filingType === "424B") {
    return [
      /\brisk factors\b/i,
      /\bsummary risk factors\b/i,
      /\bthe offering\b/i,
    ];
  }
  return [
    /\bitem\s+1a\.?\s+risk factors\b/i,
    /\brisk factors\b/i,
    /\bitem\s+2\.?\s+properties\b/i,
    /\bproperties\b/i,
    /\bmanagement'?s discussion\b/i,
  ];
}

function normalizeFilingText(content) {
  return decodeEntities(String(content ?? ""))
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanBusinessSection(section) {
  return section
    .replace(/\btable of contents\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function autoExtractionFalseStartReason({
  filingType,
  section,
  startCandidate,
}) {
  const head = section.slice(0, 300).toLowerCase();
  if (filingType === "10-K" && !/^item\s+1\.?\s+business\b/.test(head)) {
    return "10k_non_item_1_business_start";
  }
  if (filingType === "S-1" || filingType === "F-1" || filingType === "424B") {
    if (genericBusinessFalseStartPattern().test(head)) {
      return "generic_forward_looking_or_risk_start";
    }
    if (genericHeadingSentenceFalseStartPattern(startCandidate.id).test(head)) {
      return "generic_heading_sentence_fragment";
    }
  }
  if (/^item\s+1\.?\s+business\s+item\s+1a\.?\s+risk factors\b/.test(head)) {
    return "toc_item_1_to_item_1a_start";
  }
  if (/^item\s+1\.?\s+business\s+item\s+1a\b/.test(head)) {
    return "toc_item_1_to_item_1a_start";
  }
  return "";
}

function genericBusinessFalseStartPattern() {
  return /\b(forward-looking statements|statements about|our business plans|our business and the markets|our expectations|anticipated|could adversely affect|risk factor summary|under the heading|risk factors)\b/;
}

function genericHeadingSentenceFalseStartPattern(startPatternId) {
  if (startPatternId === "our_business") {
    return /^our business\s+(depends|may|might|could|can|will|would|should|must|is|was|are|were|has|have|had|faces|relies|requires|expects|believes|intends|continues|remains)\b/;
  }
  if (startPatternId === "our_company") {
    return /^our company\s+(depends|may|might|could|can|will|would|should|must|is|was|are|were|has|have|had|faces|relies|requires|expects|believes|intends|continues|remains)\b/;
  }
  return /a^/;
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function normalizedFilingType(value) {
  return value.toUpperCase().replace(/\s+/g, "");
}

function requiredString(value, context) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${context} is required`);
  }
  return value.trim();
}

function optionalString(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function loadSecReference(file) {
  if (file !== undefined) {
    return parseSecReference(JSON.parse(readFileSync(file, "utf8")));
  }
  const response = await fetchSecJsonWithRetry({
    context: "SEC company ticker exchange request failed",
    sourceUrl: secCompanyTickersExchangeUrl,
  });
  return parseSecReference(response.json);
}

function parseSecReference(body) {
  const fields = body.fields ?? [];
  if (!Array.isArray(fields) || !Array.isArray(body.data)) {
    throw new Error("SEC reference input must contain fields and data arrays");
  }
  ["cik", "ticker", "exchange"].forEach((field) => {
    if (!fields.includes(field)) {
      throw new Error(`SEC reference input is missing required field ${field}`);
    }
  });
  const references = new Map();
  let eligibleUniverseCount = 0;
  body.data.forEach((row, index) => {
    const record = Object.fromEntries(fields.map((field, fieldIndex) => [field, row[fieldIndex]]));
    const symbol = requiredString(record.ticker, `SEC reference row ${index} ticker`).toUpperCase();
    if (references.has(symbol)) {
      throw new Error(`SEC reference duplicates ticker ${symbol}`);
    }
    if (isEligibleDiscoveryCompany(record)) {
      eligibleUniverseCount += 1;
    }
    references.set(symbol, record);
  });
  return {
    bySymbol: references,
    eligibleUniverseCount,
  };
}

function isEligibleDiscoveryCompany(company) {
  const exchange = String(company.exchange ?? "");
  const symbol = String(company.ticker ?? "").toUpperCase();
  const cik = normalizeCik(company.cik);
  return symbol !== "" && cik !== "0" && allowedDiscoveryExchanges.has(exchange);
}

function normalizeCik(value) {
  const raw = String(value ?? "").trim();
  const digits = raw.replace(/^0+/, "");
  return digits === "" ? "0" : digits;
}

function normalizeExchange(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z]/g, "");
}

function csvRecords(file) {
  const rows = parseCsv(readFileSync(file, "utf8"));
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
