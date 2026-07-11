import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  currentSecUserAgent,
  defaultSecFetchRetries as sharedDefaultSecFetchRetries,
  defaultSecRetryDelayMs as sharedDefaultSecRetryDelayMs,
  fetchSecJsonWithRetry,
  fetchSecTextWithRetry,
  minCompleteUniverseRequestDelayMs as sharedMinCompleteUniverseRequestDelayMs,
} from "./sec-fetch-lib.mjs";

const secCompanyTickersExchangeUrl = "https://www.sec.gov/files/company_tickers_exchange.json";
const secSubmissionsBaseUrl = "https://data.sec.gov/submissions";
const secUserAgent = currentSecUserAgent();
const profileSchemaVersion = 1;
const profilePurpose = "issuer_universe_discovery";
const maxProfileTextLength = 4000;
const defaultLimit = 50;
const defaultMaxSubmissionsCacheAgeDays = 1;
const defaultSecFetchRetries = sharedDefaultSecFetchRetries;
const defaultSecRetryDelayMs = sharedDefaultSecRetryDelayMs;
const minCompleteUniverseRequestDelayMs = sharedMinCompleteUniverseRequestDelayMs;
const allowedDiscoveryExchanges = new Set(["Nasdaq", "NYSE", "NYSE American"]);
const sourcePublishedAtUnavailable = "not listed on SEC submissions metadata";
const submissionCikMismatch = "cik_mismatch";
const submissionTickerMismatch = "ticker_mismatch";
const submissionExchangeMismatch = "exchange_mismatch";
const secSubmissionIdentityConflictReasonPrefix = "sec_submission_identity_conflict";

const options = parseArgs(process.argv.slice(2));
const generatedAt = new Date().toISOString();
const retrievedAt = options.asOf ?? generatedAt.slice(0, 10);
const submissionsCacheStats = {
  hits: 0,
  misses: 0,
  writes: 0,
};
const submissionsLedger = [];
const companies = await loadCompanyList(options);
const selectedCompanies = selectCompanies(companies, options);
const samplingFrame = buildSamplingFrame({
  companies,
  options,
  selectedCompanies,
});
const profiles = [];
const skipped_symbols = [];
const seenSymbols = new Set();
const seenCiks = new Map();

for (const company of selectedCompanies) {
  const symbol = String(company.ticker ?? "").toUpperCase();
  const exchange = String(company.exchange ?? "");
  const cik = normalizeCik(company.cik);
  if (symbol === "" || cik === "0") {
    skipped_symbols.push({
      symbol,
      reason: "missing_symbol_or_cik",
    });
    continue;
  }
  if (!allowedDiscoveryExchanges.has(exchange)) {
    skipped_symbols.push({
      symbol,
      reason: `unsupported_exchange:${exchange}`,
    });
    continue;
  }
  if (seenSymbols.has(symbol)) {
    throw new Error(`Duplicate selected SEC symbol ${symbol}`);
  }
  const duplicateCikSymbol = seenCiks.get(cik);
  if (duplicateCikSymbol !== undefined) {
    skipped_symbols.push({
      symbol,
      reason: `duplicate_cik:${duplicateCikSymbol}`,
    });
    continue;
  }
  seenSymbols.add(symbol);
  seenCiks.set(cik, symbol);

  let submissionResult;
  try {
    submissionResult = await loadSubmission(company, options);
  } catch (error) {
    recordSubmissionLedger(failedSubmissionLedgerEntry({
      company,
      error,
    }), options);
    const skipReason = skippableSubmissionIdentitySkipReason(error, options);
    if (skipReason !== "") {
      skipped_symbols.push({
        symbol,
        reason: skipReason,
      });
      continue;
    }
    throw error;
  }
  recordSubmissionLedger(submissionResult.ledgerEntry, options);
  const submissions = submissionResult.submissions;
  const text = profileTextFromSubmission({
    company,
    submissions,
  });
  if (text.value === "") {
    skipped_symbols.push({
      symbol,
      reason: "missing_sec_submission_profile_text",
    });
    continue;
  }
  profiles.push({
    symbol,
    cik: padCik(cik),
    source_name: "SEC submissions metadata",
    source_url: secSubmissionUrl(cik),
    source_published_at: sourcePublishedAtUnavailable,
    retrieved_at: retrievedAt,
    text: text.value,
    profile_text_fields: text.fields,
    profile_field_texts: text.fieldTexts,
    profile_text_truncated: text.truncated,
  });
}

profiles.sort((left, right) => left.symbol.localeCompare(right.symbol));

if (profiles.length === 0 && !options.allowEmpty) {
  throw new Error("No SEC issuer profiles were emitted; pass --allow-empty only for explicit empty-artifact tests");
}

const result = {
  schema_version: profileSchemaVersion,
  generated_at: generatedAt,
  source: "sec_submissions_metadata",
  profile_purpose: profilePurpose,
  profile_text_fields: [
    "sicDescription",
    "category",
    "entityType",
  ],
  source_files: [
    options.secInput ?? secCompanyTickersExchangeUrl,
    options.submissionsDir ?? options.secSubmissionsBaseUrl,
    ...(options.submissionsCacheDir === undefined ? [] : [options.submissionsCacheDir]),
  ],
  submissions_cache_dir: options.submissionsCacheDir ?? "",
  submissions_cache_hits: submissionsCacheStats.hits,
  submissions_cache_misses: submissionsCacheStats.misses,
  submissions_cache_writes: submissionsCacheStats.writes,
  submissions_cache_only: options.cacheOnly,
  submissions_ledger_output: options.submissionsLedgerOutput ?? "",
  submissions_ledger_count: submissionsLedger.length,
  submissions_ledger: submissionsLedger,
  max_submissions_cache_age_days: options.maxSubmissionsCacheAgeDays,
  sec_fetch_retries: options.secFetchRetries,
  sec_retry_delay_ms: options.secRetryDelayMs,
  sec_user_agent: secUserAgent,
  sec_min_complete_universe_request_delay_ms: minCompleteUniverseRequestDelayMs,
  sec_request_delay_ms: options.requestDelayMs,
  selection_strategy: samplingFrame.selectionStrategy,
  profile_coverage_strategy: samplingFrame.selectionStrategy,
  coverage_scope: samplingFrame.coverageScope,
  requested_symbols: samplingFrame.requestedSymbols,
  selected_symbol_count: samplingFrame.selectedSymbolCount,
  eligible_universe_count: samplingFrame.eligibleUniverseCount,
  coverage_limit: samplingFrame.coverageLimit,
  sampling_note: samplingFrame.samplingNote,
  profile_count: profiles.length,
  skipped_symbols,
  profiles,
};

const output = `${JSON.stringify(result, null, 2)}\n`;
if (options.output === undefined) {
  process.stdout.write(output);
} else {
  writeFileSync(options.output, output);
  console.log(`Wrote SEC issuer profile input to ${options.output}.`);
}

function parseArgs(args) {
  const parsed = {
    allowEmpty: false,
    all: false,
    cacheOnly: false,
    limit: defaultLimit,
    maxSubmissionsCacheAgeDays: defaultMaxSubmissionsCacheAgeDays,
    requestDelayMs: 0,
    secFetchRetries: defaultSecFetchRetries,
    secRetryDelayMs: defaultSecRetryDelayMs,
    secSubmissionsBaseUrl,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--sec-input") {
      parsed.secInput = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--sec-submissions-base-url") {
      parsed.secSubmissionsBaseUrl = requireNextArg(args, index, arg).replace(/\/$/, "");
      index += 1;
    } else if (arg === "--submissions-dir") {
      parsed.submissionsDir = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--submissions-cache-dir") {
      parsed.submissionsCacheDir = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--submissions-ledger-output") {
      parsed.submissionsLedgerOutput = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--cache-only" || arg === "--require-cached-submissions") {
      parsed.cacheOnly = true;
    } else if (arg === "--max-submissions-cache-age-days") {
      parsed.maxSubmissionsCacheAgeDays = Number(requireNextArg(args, index, arg));
      if (!Number.isInteger(parsed.maxSubmissionsCacheAgeDays) || parsed.maxSubmissionsCacheAgeDays < 0) {
        throw new Error("--max-submissions-cache-age-days must be a non-negative integer");
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
    } else if (arg === "--symbols") {
      parsed.symbols = requireNextArg(args, index, arg)
        .split(",")
        .map((symbol) => symbol.trim().toUpperCase())
        .filter(Boolean);
      index += 1;
    } else if (arg === "--all" || arg === "--complete-sec-universe") {
      parsed.all = true;
    } else if (arg === "--limit") {
      parsed.limit = Number(requireNextArg(args, index, arg));
      if (!Number.isInteger(parsed.limit) || parsed.limit <= 0) {
        throw new Error("--limit must be a positive integer");
      }
      index += 1;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
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
  if (parsed.cacheOnly && parsed.submissionsCacheDir === undefined && parsed.submissionsDir === undefined) {
    throw new Error("--cache-only requires --submissions-cache-dir or --submissions-dir");
  }
  if (
    parsed.all &&
    parsed.submissionsDir === undefined &&
    !parsed.cacheOnly &&
    parsed.requestDelayMs < minCompleteUniverseRequestDelayMs
  ) {
    throw new Error(`Live --all SEC submissions fetches require --request-delay-ms >= ${minCompleteUniverseRequestDelayMs} or --cache-only`);
  }
  return parsed;
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

async function loadCompanyList({ secInput }) {
  if (secInput !== undefined) {
    return parseSecCompanyList(JSON.parse(readFileSync(secInput, "utf8")));
  }
  const response = await fetchSecJsonWithRetry({
    context: "SEC company ticker exchange request failed",
    sourceUrl: secCompanyTickersExchangeUrl,
  });
  return parseSecCompanyList(response.json);
}

function parseSecCompanyList(body) {
  const fields = body.fields ?? [];
  if (!Array.isArray(fields) || !Array.isArray(body.data)) {
    throw new Error("SEC company list input must contain fields and data arrays");
  }
  ["cik", "name", "ticker", "exchange"].forEach((field) => {
    if (!fields.includes(field)) {
      throw new Error(`SEC company list input is missing required field ${field}`);
    }
  });
  return (body.data ?? []).map((row) =>
    Object.fromEntries(fields.map((field, index) => [field, row[index]])),
  );
}

function selectCompanies(companies, { all, symbols, limit }) {
  if (symbols !== undefined) {
    const companiesBySymbol = new Map(
      companies.map((company) => [String(company.ticker ?? "").toUpperCase(), company]),
    );
    return symbols.map((symbol) => {
      const company = companiesBySymbol.get(symbol);
      if (company === undefined) {
        throw new Error(`Requested symbol ${symbol} is not present in SEC company input`);
      }
      return company;
    });
  }
  if (all) {
    return companies.filter(isEligibleDiscoveryCompany);
  }
  return companies.slice(0, limit);
}

function buildSamplingFrame({
  companies,
  options,
  selectedCompanies,
}) {
  const eligibleUniverseCount = companies.filter(isEligibleDiscoveryCompany).length;
  if (options.all) {
    return {
      coverageLimit: eligibleUniverseCount,
      coverageScope: "complete_sec_universe",
      eligibleUniverseCount,
      requestedSymbols: [],
      selectedSymbolCount: selectedCompanies.length,
      selectionStrategy: "complete_sec_universe",
      samplingNote: "All eligible SEC issuers from the input were selected; skipped symbols still record per-issuer profile availability limits.",
    };
  }
  if (options.symbols !== undefined) {
    return {
      coverageLimit: options.symbols.length,
      coverageScope: "partial_requested_symbols",
      eligibleUniverseCount,
      requestedSymbols: options.symbols,
      selectedSymbolCount: selectedCompanies.length,
      selectionStrategy: "requested_symbols",
      samplingNote: "Explicit symbol list supplied by the caller; coverage claims are limited to requested symbols.",
    };
  }
  return {
    coverageLimit: options.limit,
    coverageScope: "partial_first_n_smoke_test",
    eligibleUniverseCount,
    requestedSymbols: [],
    selectedSymbolCount: selectedCompanies.length,
    selectionStrategy: "first_n_sec_rows_smoke_test",
    samplingNote: "First-N SEC rows are suitable only for smoke tests, not scientific universe coverage.",
  };
}

function isEligibleDiscoveryCompany(company) {
  const exchange = String(company.exchange ?? "");
  const symbol = String(company.ticker ?? "").toUpperCase();
  const cik = normalizeCik(company.cik);
  return symbol !== "" && cik !== "0" && allowedDiscoveryExchanges.has(exchange);
}

async function loadSubmission(company, options) {
  const cik = padCik(normalizeCik(company.cik));
  const sourceUrl = secSubmissionUrl(cik);
  const symbol = String(company.ticker ?? "").trim().toUpperCase();
  if (options.submissionsDir !== undefined) {
    const file = path.join(options.submissionsDir, `CIK${cik}.json`);
    if (!existsSync(file)) {
      throw new Error(`Missing SEC submissions fixture ${file}`);
    }
    const content = readFileSync(file, "utf8");
    const submissions = parseAndValidateSubmission({
      company,
      content,
      sourceLabel: file,
    });
    return {
      ledgerEntry: submissionLedgerEntry({
        cacheAgeDays: "",
        cacheObservedAt: statSync(file).mtime.toISOString(),
        cacheStatus: "fixture",
        cik,
        content,
        fetchedAt: "",
        sourceUrl,
        symbol,
      }),
      submissions,
    };
  }
  const cacheFile = path.join(options.submissionsCacheDir ?? "", `CIK${cik}.json`);
  let staleCache = false;
  if (options.submissionsCacheDir !== undefined && existsSync(cacheFile)) {
    const cacheFreshness = validateCacheFreshness(cacheFile, options);
    if (!cacheFreshness.stale) {
      submissionsCacheStats.hits += 1;
      const content = readFileSync(cacheFile, "utf8");
      const submissions = parseAndValidateSubmission({
        company,
        content,
        sourceLabel: cacheFile,
      });
      return {
        ledgerEntry: submissionLedgerEntry({
          cacheAgeDays: cacheFreshness.cacheAgeDays,
          cacheObservedAt: cacheFreshness.cacheObservedAt,
          cacheStatus: "cache_hit",
          cik,
          content,
          fetchedAt: "",
          sourceUrl,
          symbol,
        }),
        submissions,
      };
    }
    if (options.cacheOnly) {
      throw staleSubmissionsCacheError(cacheFile, cacheFreshness, options);
    }
    submissionsCacheStats.misses += 1;
    staleCache = true;
  }
  if (options.submissionsCacheDir !== undefined && !existsSync(cacheFile)) {
    submissionsCacheStats.misses += 1;
  }
  if (options.cacheOnly) {
    throw new Error(`Missing cached SEC submissions file ${cacheFile}`);
  }
  const fetchResult = await fetchTextWithRetry({
    company,
    options,
    sourceUrl,
  });
  const responseContent = fetchResult.content;
  const body = parseAndValidateSubmission({
    company,
    content: responseContent,
    sourceLabel: sourceUrl,
  });
  const cacheContent = `${JSON.stringify(body, null, 2)}\n`;
  const ledgerContent = options.submissionsCacheDir === undefined ? responseContent : cacheContent;
  if (options.submissionsCacheDir !== undefined) {
    mkdirSync(options.submissionsCacheDir, { recursive: true });
    writeFileSync(cacheFile, cacheContent);
    submissionsCacheStats.writes += 1;
  }
  return {
    ledgerEntry: submissionLedgerEntry({
      cacheAgeDays: 0,
      cacheObservedAt: generatedAt,
      cacheStatus: options.submissionsCacheDir === undefined
        ? "network_fetch"
        : staleCache
          ? "stale_cache_refetched"
          : "cache_miss_fetched",
      cik,
      content: ledgerContent,
      fetchedAt: generatedAt,
      requestStatuses: fetchResult.requestStatuses,
      attemptCount: fetchResult.attemptCount,
      sourceUrl,
      symbol,
    }),
    submissions: body,
  };
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function fetchTextWithRetry({
  company,
  options,
  sourceUrl,
}) {
  return await fetchSecTextWithRetry({
    accept: "application/json,*/*",
    context: `SEC submissions request failed for ${company.ticker}`,
    requestDelayMs: options.requestDelayMs,
    retries: options.secFetchRetries,
    retryDelayMs: options.secRetryDelayMs,
    sourceUrl,
  });
}

function parseAndValidateSubmission({
  company,
  content,
  sourceLabel,
}) {
  const submissions = JSON.parse(content);
  validateSubmissionIdentity({
    company,
    sourceLabel,
    submissions,
  });
  return submissions;
}

function validateSubmissionIdentity({
  company,
  sourceLabel,
  submissions,
}) {
  const symbol = String(company.ticker ?? "").trim().toUpperCase();
  const expectedCik = normalizeCik(company.cik);
  const actualCik = normalizeCik(submissions.cik);
  if (actualCik !== expectedCik) {
    throw submissionIdentityError(
      `SEC submissions CIK mismatch for ${symbol}: expected ${padCik(expectedCik)}, got ${padCik(actualCik)} in ${sourceLabel}`,
      submissionCikMismatch,
    );
  }
  if (!Array.isArray(submissions.tickers) || !submissions.tickers.some((ticker) => String(ticker ?? "").trim().toUpperCase() === symbol)) {
    throw submissionIdentityError(
      `SEC submissions ticker mismatch for ${symbol}: expected ticker in ${sourceLabel}`,
      submissionTickerMismatch,
    );
  }
  const expectedExchange = normalizeExchangeLabel(company.exchange);
  if (
    !Array.isArray(submissions.exchanges) ||
    !submissions.exchanges.some((exchange) => normalizeExchangeLabel(exchange) === expectedExchange)
  ) {
    throw submissionIdentityError(
      `SEC submissions exchange mismatch for ${symbol}: expected ${company.exchange} in ${sourceLabel}`,
      submissionExchangeMismatch,
    );
  }
}

function submissionIdentityError(message, mismatchType) {
  const error = new Error(message);
  error.submissionIdentityMismatch = mismatchType;
  return error;
}

function skippableSubmissionIdentitySkipReason(error, options) {
  if (!options.all || error?.submissionIdentityMismatch === undefined) {
    return "";
  }
  const mismatchType = String(error.submissionIdentityMismatch);
  if (mismatchType !== submissionTickerMismatch && mismatchType !== submissionExchangeMismatch) {
    return "";
  }
  return `${secSubmissionIdentityConflictReasonPrefix}:${mismatchType}`;
}

function validateCacheFreshness(file, options) {
  const cacheObservedAt = statSync(file).mtime.toISOString();
  const cacheAgeDays = cacheAgeDaysFor({
    cacheObservedAt,
    retrievedAt,
  });
  return {
    cacheAgeDays,
    cacheObservedAt,
    stale: cacheAgeDays > options.maxSubmissionsCacheAgeDays,
  };
}

function staleSubmissionsCacheError(file, cacheFreshness, options) {
  return new Error(`Cached SEC submissions file ${file} is stale for ${retrievedAt}: age ${cacheFreshness.cacheAgeDays} days exceeds max ${options.maxSubmissionsCacheAgeDays}`);
}

function cacheAgeDaysFor({
  cacheObservedAt,
  retrievedAt,
}) {
  const cacheDate = strictDate(cacheObservedAt.slice(0, 10), "cache observed date");
  const cacheTime = Date.parse(`${cacheDate}T00:00:00.000Z`);
  const retrievedTime = Date.parse(`${strictDate(retrievedAt, "retrieved_at")}T00:00:00.000Z`);
  if (cacheTime > retrievedTime) {
    throw new Error(`Cached SEC submissions observed date ${cacheDate} is after requested as-of ${retrievedAt}`);
  }
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((retrievedTime - cacheTime) / millisecondsPerDay);
}

function submissionLedgerEntry({
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
}) {
  return {
    symbol,
    cik,
    source_url: sourceUrl,
    cache_status: cacheStatus,
    cache_observed_at: cacheObservedAt,
    cache_age_days: cacheAgeDays,
    max_cache_age_days: options.maxSubmissionsCacheAgeDays,
    payload_sha256: sha256(content),
    validation_status: "validated",
    request_attempt_count: attemptCount,
    request_statuses: requestStatuses,
    retrieved_at: retrievedAt,
    fetched_at: fetchedAt,
  };
}

function failedSubmissionLedgerEntry({
  company,
  error,
}) {
  const cik = padCik(normalizeCik(company.cik));
  return {
    symbol: String(company.ticker ?? "").trim().toUpperCase(),
    cik,
    source_url: secSubmissionUrl(cik),
    cache_status: "failed",
    cache_observed_at: "",
    cache_age_days: "",
    max_cache_age_days: options.maxSubmissionsCacheAgeDays,
    payload_sha256: "",
    validation_status: "failed",
    request_attempt_count: Number.isInteger(error?.requestAttemptCount) ? error.requestAttemptCount : 0,
    request_statuses: Array.isArray(error?.requestStatuses) ? error.requestStatuses : [],
    retrieved_at: retrievedAt,
    fetched_at: "",
    error: error instanceof Error ? error.message : String(error),
  };
}

function recordSubmissionLedger(entry, options) {
  submissionsLedger.push(entry);
  if (options.submissionsLedgerOutput === undefined) {
    return;
  }
  mkdirSync(path.dirname(options.submissionsLedgerOutput), { recursive: true });
  writeFileSync(options.submissionsLedgerOutput, `${JSON.stringify(submissionsLedgerArtifact(), null, 2)}\n`);
}

function submissionsLedgerArtifact() {
  return {
    schema_version: 1,
    generated_at: generatedAt,
    source: "sec_submissions_metadata",
    profile_purpose: profilePurpose,
    retrieved_at: retrievedAt,
    max_submissions_cache_age_days: options.maxSubmissionsCacheAgeDays,
    sec_fetch_retries: options.secFetchRetries,
    sec_retry_delay_ms: options.secRetryDelayMs,
    submissions_ledger_count: submissionsLedger.length,
    submissions_ledger: submissionsLedger,
  };
}

function profileTextFromSubmission({
  submissions,
}) {
  const parts = [];
  const fields = [];
  const fieldTexts = {};
  addPart({
    fieldTexts,
    fields,
    id: "sicDescription",
    parts,
    value: submissions.sicDescription,
  });
  addPart({
    fieldTexts,
    fields,
    id: "category",
    parts,
    value: submissions.category,
  });
  addPart({
    fieldTexts,
    fields,
    id: "entityType",
    parts,
    value: submissions.entityType,
  });
  const text = parts.join("\n");
  return {
    fieldTexts,
    fields,
    value: text.slice(0, maxProfileTextLength),
    truncated: text.length > maxProfileTextLength,
  };
}

function addPart({
  fieldTexts,
  fields,
  id,
  parts,
  value,
}) {
  if (typeof value !== "string" || value.trim() === "") {
    return;
  }
  fields.push(id);
  const cleaned = value.trim();
  fieldTexts[id] = cleaned;
  parts.push(cleaned);
}

function normalizeCik(value) {
  const raw = String(value ?? "").trim();
  const digits = raw.replace(/^0+/, "");
  return digits === "" ? "0" : digits;
}

function padCik(value) {
  return normalizeCik(value).padStart(10, "0");
}

function normalizeExchangeLabel(value) {
  return String(value ?? "").trim().toUpperCase().replace(/\s+/g, " ");
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function secSubmissionUrl(cik) {
  return `${options.secSubmissionsBaseUrl}/CIK${padCik(cik)}.json`;
}
