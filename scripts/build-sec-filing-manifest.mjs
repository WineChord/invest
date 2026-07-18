import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  currentSecUserAgent,
  defaultSecFetchRetries as sharedDefaultSecFetchRetries,
  defaultSecRetryDelayMs as sharedDefaultSecRetryDelayMs,
  fetchSecTextWithRetry,
  minCompleteUniverseRequestDelayMs as sharedMinCompleteUniverseRequestDelayMs,
} from "./sec-fetch-lib.mjs";

const secCompanyTickersExchangeUrl = "https://www.sec.gov/files/company_tickers_exchange.json";
const secSubmissionsBaseUrl = "https://data.sec.gov/submissions";
const secArchivesBaseUrl = "https://www.sec.gov/Archives/edgar/data";
const secUserAgent = currentSecUserAgent();
const defaultLimit = 50;
const defaultMaxSubmissionsCacheAgeDays = 1;
const defaultSecFetchRetries = sharedDefaultSecFetchRetries;
const defaultSecRetryDelayMs = sharedDefaultSecRetryDelayMs;
const defaultFilingSelectionPolicy = "foundational-first";
const minCompleteUniverseRequestDelayMs = sharedMinCompleteUniverseRequestDelayMs;
const allowedDiscoveryExchanges = new Set(["Nasdaq", "NYSE", "NYSE American"]);
const defaultFilingTypes = new Set(["10-K", "20-F", "S-1", "F-1", "424B"]);
const eventFilingTypes = new Set(["8-K", "6-K", "10-Q"]);
const transactionFilingTypes = new Set(["S-4", "F-4", "DEF14A"]);
const supportedFilingTypes = new Set([
  ...defaultFilingTypes,
  ...eventFilingTypes,
  ...transactionFilingTypes,
]);
const foundationalFilingTypes = new Set(["10-K", "20-F", "S-1", "F-1"]);
const businessProspectus424BForms = new Set(["424B1", "424B3", "424B4"]);
const supplement424BForms = new Set(["424B2", "424B5", "424B7"]);
const secFormRanks = new Map([
  ["10-K", 0],
  ["20-F", 1],
  ["S-1", 2],
  ["F-1", 3],
  ["424B4", 10],
  ["424B3", 11],
  ["424B1", 12],
  ["424B5", 20],
  ["424B2", 21],
  ["424B7", 22],
  ["S-4", 30],
  ["F-4", 31],
  ["DEF14A", 32],
  ["8-K", 40],
  ["6-K", 41],
  ["10-Q", 42],
]);
const filingSelectionPolicies = new Set([defaultFilingSelectionPolicy, "latest-supported"]);
const manifestHeader = [
  "symbol",
  "cik",
  "exchange",
  "filing_type",
  "sec_form",
  "source_url",
  "source_published_at",
  "retrieved_at",
  "filing_path",
  "section_start",
  "section_end",
  "accession_or_document_id",
  "accession_number",
  "primary_document",
  "sec_form_original",
  "acceptance_datetime",
  "report_date",
  "sec_submission_url",
  "filing_selection_policy",
  "filing_selection_tier",
  "filing_selection_family",
  "selection_reason",
  "selected_sec_form_base",
  "newer_supported_filing_displaced_count",
  "newer_supported_filing_forms",
  "lower_tier_newer_filing_forms",
  "foundational_candidate_count",
  "business_prospectus_424b_candidate_count",
  "supplement_424b_candidate_count",
  "unknown_424b_candidate_count",
  "selection_warnings",
];

const options = parseArgs(process.argv.slice(2));
const generatedAt = new Date().toISOString();
const retrievedAt = options.asOf ?? generatedAt.slice(0, 10);
const submissionsCacheStats = {
  hits: 0,
  misses: 0,
  writes: 0,
};
const submissionsLedger = [];
const companyList = await loadCompanyList(options);
const companies = companyList.companies;
const selectedCompanies = selectCompanies(companies, options);
const samplingFrame = buildSamplingFrame({
  companies,
  options,
  selectedCompanies,
});
const manifestRows = [];
const skippedSymbols = [];
const seenSymbols = new Set();
const seenCiks = new Map();
let submissionsFetchedCount = 0;

for (const company of selectedCompanies) {
  const symbol = String(company.ticker ?? "").trim().toUpperCase();
  const exchange = String(company.exchange ?? "").trim();
  const normalizedCik = normalizeCik(company.cik);
  const paddedCik = padCik(normalizedCik);
  if (symbol === "" || normalizedCik === "0") {
    skippedSymbols.push({
      symbol,
      reason: "missing_symbol_or_cik",
    });
    continue;
  }
  if (!allowedDiscoveryExchanges.has(exchange)) {
    skippedSymbols.push({
      symbol,
      reason: `unsupported_exchange:${exchange}`,
    });
    continue;
  }
  if (seenSymbols.has(symbol)) {
    throw new Error(`Duplicate selected SEC symbol ${symbol}`);
  }
  const duplicateCikSymbol = seenCiks.get(normalizedCik);
  if (duplicateCikSymbol !== undefined) {
    skippedSymbols.push({
      symbol,
      reason: `duplicate_cik:${duplicateCikSymbol}`,
    });
    continue;
  }
  seenSymbols.add(symbol);
  seenCiks.set(normalizedCik, symbol);

  let submissionResult;
  try {
    submissionResult = await loadSubmission(company, options);
  } catch (error) {
    recordSubmissionLedger(failedSubmissionLedgerEntry({
      company,
      error,
    }), options);
    throw error;
  }
  recordSubmissionLedger(submissionResult.ledgerEntry, options);
  submissionsFetchedCount += 1;
  const submissions = submissionResult.submissions;
  const filing = selectLatestSupportedFiling({
    allowedFilingTypes: options.filingTypes,
    filingSelectionPolicy: options.filingSelectionPolicy,
    submissions,
    symbol,
  });
  if (filing.skipped) {
    skippedSymbols.push({
      symbol,
      reason: filing.reason,
    });
    continue;
  }
  const filingPath = localFilingPath({
    accessionNumber: filing.accessionNumber,
    cik: paddedCik,
    filingDir: options.filingDir,
    primaryDocument: filing.primaryDocument,
    symbol,
  });
  if (options.requireLocalFilings && filingPath === "") {
    skippedSymbols.push({
      symbol,
      reason: "missing_local_filing",
    });
    continue;
  }
  manifestRows.push({
    accession_or_document_id: `${filing.accessionNumber}/${filing.primaryDocument}`,
    accession_number: filing.accessionNumber,
    acceptance_datetime: filing.acceptanceDateTime,
    cik: paddedCik,
    exchange,
    filing_path: filingPath,
    filing_type: filing.filingType,
    primary_document: filing.primaryDocument,
    retrieved_at: retrievedAt,
    report_date: filing.reportDate,
    sec_form: filing.secForm,
    sec_form_original: filing.secForm,
    section_end: "",
    section_start: "",
    source_published_at: filing.filingDate,
    source_url: secArchiveUrl({
      accessionNumber: filing.accessionNumber,
      cik: normalizedCik,
      primaryDocument: filing.primaryDocument,
    }),
    sec_submission_url: submissionResult.sourceUrl,
    filing_selection_policy: options.filingSelectionPolicy,
    filing_selection_tier: filing.selectionTier,
    filing_selection_family: filing.selectionFamily,
    selection_reason: filing.selectionReason,
    selected_sec_form_base: filing.secFormBase,
    newer_supported_filing_displaced_count: filing.newerSupportedFilingDisplacedCount,
    newer_supported_filing_forms: filing.newerSupportedFilingForms.join(";"),
    lower_tier_newer_filing_forms: filing.lowerTierNewerFilingForms.join(";"),
    foundational_candidate_count: filing.foundationalCandidateCount,
    business_prospectus_424b_candidate_count: filing.businessProspectus424BCandidateCount,
    supplement_424b_candidate_count: filing.supplement424BCandidateCount,
    unknown_424b_candidate_count: filing.unknown424BCandidateCount,
    selection_warnings: filing.selectionWarnings.join(";"),
    symbol,
  });
}

manifestRows.sort((left, right) => left.symbol.localeCompare(right.symbol));

if (manifestRows.length === 0 && !options.allowEmpty) {
  throw new Error("No SEC filing manifest rows were emitted; pass --allow-empty only for explicit empty-artifact tests");
}

const manifestOutput = formatCsv(manifestRows);
if (options.output === undefined) {
  process.stdout.write(manifestOutput);
} else {
  writeFileSync(options.output, manifestOutput);
  console.log(`Wrote SEC filing manifest to ${options.output}.`);
}

if (options.metadataOutput !== undefined) {
  const metadata = {
    schema_version: 1,
    generated_at: generatedAt,
    source: "sec_submissions_recent_filings",
    source_files: [
      companyList.source,
      submissionSourceName(options),
      ...(options.submissionsCacheDir === undefined ? [] : [options.submissionsCacheDir]),
      ...(options.filingDir === undefined ? [] : [options.filingDir]),
    ],
    sec_company_input_row_count: companies.length,
    sec_company_input_sha256: companyList.sha256,
    submissions_source: submissionSourceName(options),
    submissions_fetched_count: submissionsFetchedCount,
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
    coverage_scope: samplingFrame.coverageScope,
    requested_symbols: samplingFrame.requestedSymbols,
    selected_symbol_count: samplingFrame.selectedSymbolCount,
    eligible_universe_count: samplingFrame.eligibleUniverseCount,
    coverage_limit: samplingFrame.coverageLimit,
    filing_types: [...options.filingTypes],
    filing_selection_policy: options.filingSelectionPolicy,
    manifest_selection_fields: [
      "filing_selection_policy",
      "filing_selection_tier",
      "filing_selection_family",
      "selection_reason",
      "selected_sec_form_base",
      "newer_supported_filing_displaced_count",
      "newer_supported_filing_forms",
      "lower_tier_newer_filing_forms",
      "foundational_candidate_count",
      "business_prospectus_424b_candidate_count",
      "supplement_424b_candidate_count",
      "unknown_424b_candidate_count",
      "selection_warnings",
    ],
    retrieved_at: retrievedAt,
    manifest_row_count: manifestRows.length,
    skipped_symbols: skippedSymbols,
    sampling_note: samplingFrame.samplingNote,
  };
  writeFileSync(options.metadataOutput, `${JSON.stringify(metadata, null, 2)}\n`);
  console.log(`Wrote SEC filing manifest metadata to ${options.metadataOutput}.`);
}

function parseArgs(args) {
  const parsed = {
    allowEmpty: false,
    all: false,
    cacheOnly: false,
    filingSelectionPolicy: defaultFilingSelectionPolicy,
    filingTypes: new Set(defaultFilingTypes),
    limit: defaultLimit,
    maxSubmissionsCacheAgeDays: defaultMaxSubmissionsCacheAgeDays,
    requestDelayMs: 0,
    requireLocalFilings: false,
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
    } else if (arg === "--filing-dir") {
      parsed.filingDir = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--symbols") {
      parsed.symbols = requireNextArg(args, index, arg)
        .split(",")
        .map((symbol) => symbol.trim().toUpperCase())
        .filter(Boolean);
      index += 1;
    } else if (arg === "--all" || arg === "--complete-sec-universe") {
      parsed.all = true;
    } else if (arg === "--filing-types") {
      parsed.filingTypes = new Set(
        requireNextArg(args, index, arg)
          .split(",")
          .map((filingType) => normalizedManifestFilingType(filingType))
          .filter(Boolean),
      );
      for (const filingType of parsed.filingTypes) {
        if (!supportedFilingTypes.has(filingType)) {
          throw new Error(`Unsupported --filing-types value ${filingType}`);
        }
      }
      index += 1;
    } else if (arg === "--filing-selection-policy") {
      parsed.filingSelectionPolicy = requireNextArg(args, index, arg).trim().toLowerCase();
      if (!filingSelectionPolicies.has(parsed.filingSelectionPolicy)) {
        throw new Error(`Unsupported --filing-selection-policy value ${parsed.filingSelectionPolicy}`);
      }
      index += 1;
    } else if (arg === "--limit") {
      parsed.limit = Number(requireNextArg(args, index, arg));
      if (!Number.isInteger(parsed.limit) || parsed.limit <= 0) {
        throw new Error("--limit must be a positive integer");
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
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--metadata-output") {
      parsed.metadataOutput = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
      index += 1;
    } else if (arg === "--allow-empty") {
      parsed.allowEmpty = true;
    } else if (arg === "--require-local-filings") {
      parsed.requireLocalFilings = true;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }
  if (parsed.filingTypes.size === 0) {
    throw new Error("--filing-types must include at least one supported filing type");
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
    const content = readFileSync(secInput, "utf8");
    return {
      companies: parseSecCompanyList(JSON.parse(content)),
      sha256: sha256(content),
      source: secInput,
    };
  }
  const response = await fetchSecTextWithRetry({
    accept: "application/json,*/*",
    context: "SEC company ticker exchange request failed",
    sourceUrl: secCompanyTickersExchangeUrl,
  });
  const content = response.content;
  return {
    companies: parseSecCompanyList(JSON.parse(content)),
    sha256: sha256(content),
    source: secCompanyTickersExchangeUrl,
  };
}

function parseSecCompanyList(body) {
  const fields = body.fields ?? [];
  if (!Array.isArray(fields) || !Array.isArray(body.data)) {
    throw new Error("SEC company list input must contain fields and data arrays");
  }
  ["cik", "ticker", "exchange"].forEach((field) => {
    if (!fields.includes(field)) {
      throw new Error(`SEC company list input is missing required field ${field}`);
    }
  });
  return body.data.map((row) =>
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
      samplingNote: "All eligible SEC issuers from the input were selected; skipped symbols still record filing availability and extraction limits.",
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
      sourceUrl,
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
        sourceUrl,
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
  const submissions = parseAndValidateSubmission({
    company,
    content: responseContent,
    sourceLabel: sourceUrl,
  });
  const cacheContent = `${JSON.stringify(submissions, null, 2)}\n`;
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
    sourceUrl,
    submissions,
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
    throw new Error(`SEC submissions CIK mismatch for ${symbol}: expected ${padCik(expectedCik)}, got ${padCik(actualCik)} in ${sourceLabel}`);
  }
  if (!Array.isArray(submissions.tickers) || !submissions.tickers.some((ticker) => String(ticker ?? "").trim().toUpperCase() === symbol)) {
    throw new Error(`SEC submissions ticker mismatch for ${symbol}: expected ticker in ${sourceLabel}`);
  }
  const expectedExchange = normalizeExchangeLabel(company.exchange);
  if (
    !Array.isArray(submissions.exchanges) ||
    !submissions.exchanges.some((exchange) => normalizeExchangeLabel(exchange) === expectedExchange)
  ) {
    throw new Error(`SEC submissions exchange mismatch for ${symbol}: expected ${company.exchange} in ${sourceLabel}`);
  }
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
    source: "sec_submissions_recent_filings",
    retrieved_at: retrievedAt,
    max_submissions_cache_age_days: options.maxSubmissionsCacheAgeDays,
    sec_fetch_retries: options.secFetchRetries,
    sec_retry_delay_ms: options.secRetryDelayMs,
    submissions_ledger_count: submissionsLedger.length,
    submissions_ledger: submissionsLedger,
  };
}

function selectLatestSupportedFiling({
  allowedFilingTypes,
  filingSelectionPolicy,
  submissions,
  symbol,
}) {
  const recent = submissions.filings?.recent;
  if (recent === undefined || typeof recent !== "object") {
    return {
      reason: "missing_recent_filings",
      skipped: true,
    };
  }
  const forms = recent.form;
  const accessionNumbers = recent.accessionNumber;
  const filingDates = recent.filingDate;
  const primaryDocuments = recent.primaryDocument;
  const acceptanceDateTimes = Array.isArray(recent.acceptanceDateTime) ? recent.acceptanceDateTime : [];
  const reportDates = Array.isArray(recent.reportDate) ? recent.reportDate : [];
  if (
    !Array.isArray(forms) ||
    !Array.isArray(accessionNumbers) ||
    !Array.isArray(filingDates) ||
    !Array.isArray(primaryDocuments)
  ) {
    return {
      reason: "malformed_recent_filings",
      skipped: true,
    };
  }
  const candidates = [];
  for (let index = 0; index < forms.length; index += 1) {
    const normalized = normalizeSecForm(forms[index]);
    if (normalized === undefined || !allowedFilingTypes.has(normalized.filingType)) {
      continue;
    }
    const accessionNumber = requiredRecentString(accessionNumbers[index]);
    const filingDate = requiredRecentString(filingDates[index]);
    const primaryDocument = requiredRecentString(primaryDocuments[index]);
    if (accessionNumber === "" || filingDate === "" || primaryDocument === "") {
      continue;
    }
    strictDate(filingDate, `${symbol} SEC filingDate`);
    if (filingDate > retrievedAt) {
      continue;
    }
    candidates.push({
      accessionNumber,
      acceptanceDateTime: requiredRecentString(acceptanceDateTimes[index]),
      filingDate,
      filingType: normalized.filingType,
      primaryDocument,
      reportDate: requiredRecentString(reportDates[index]),
      secFormBase: normalized.secFormBase,
      selectionFamily: filingSelectionFamily(normalized.filingType, normalized.secFormBase),
      secForm: normalized.secForm,
      selectionTier: filingSelectionTier(normalized.filingType, normalized.secFormBase),
    });
  }
  if (candidates.length === 0) {
    return {
      reason: "no_supported_filing",
      skipped: true,
    };
  }
  candidates.sort((left, right) => compareFilingsForSelection(left, right, filingSelectionPolicy));
  const latestCandidate = candidates[0];
  const sameDayOriginal = latestCandidate.secForm.endsWith("/A")
    ? candidates.find((candidate) =>
      candidate.filingDate === latestCandidate.filingDate &&
      candidate.secFormBase === latestCandidate.secFormBase &&
      !candidate.secForm.endsWith("/A"),
    )
    : undefined;
  const selected = sameDayOriginal ?? latestCandidate;
  const selectedOriginalOverSameDayAmendment = sameDayOriginal !== undefined;
  const newerSupportedFilings = candidates.filter((candidate) =>
    isNewerFiling(candidate, selected),
  );
  const newerSupportedFilingForms = [...new Set(
    newerSupportedFilings.map((candidate) => candidate.secForm),
  )].sort();
  const foundationalCandidateCount = candidates.filter((candidate) =>
    candidate.selectionTier === "foundational_business_filing",
  ).length;
  const businessProspectus424BCandidateCount = candidates.filter((candidate) =>
    candidate.selectionTier === "business_prospectus_fallback",
  ).length;
  const supplement424BCandidateCount = candidates.filter((candidate) =>
    candidate.selectionTier === "prospectus_supplement_fallback",
  ).length;
  const unknown424BCandidateCount = candidates.filter((candidate) =>
    candidate.selectionTier === "prospectus_unknown_or_late_fallback",
  ).length;
  const lowerTierNewerFilingForms = [...new Set(
    newerSupportedFilings
      .filter((candidate) => filingTierRank(candidate.selectionTier) > filingTierRank(selected.selectionTier))
      .map((candidate) => candidate.secForm),
  )].sort();
  const selectionWarnings = selectionWarningsFor({
    businessProspectus424BCandidateCount,
    foundationalCandidateCount,
    newerSupportedFilingDisplacedCount: newerSupportedFilings.length,
    selected,
    supplement424BCandidateCount,
    unknown424BCandidateCount,
  });
  if (selectedOriginalOverSameDayAmendment) {
    selectionWarnings.push(`selected_original_over_same_day_amendment:${latestCandidate.secForm}`);
  }
  return {
    ...selected,
    businessProspectus424BCandidateCount,
    foundationalCandidateCount,
    lowerTierNewerFilingForms,
    newerSupportedFilingDisplacedCount: newerSupportedFilings.length,
    newerSupportedFilingForms,
    supplement424BCandidateCount,
    selectionReason: selectedOriginalOverSameDayAmendment
      ? "selected_original_over_same_day_amendment"
      : selectionReasonFor({
        filingSelectionPolicy,
        foundationalCandidateCount,
        newerSupportedFilingDisplacedCount: newerSupportedFilings.length,
        selected,
      }),
    selectionWarnings,
    unknown424BCandidateCount,
    skipped: false,
  };
}

function compareFilingsForSelection(left, right, filingSelectionPolicy) {
  if (filingSelectionPolicy === defaultFilingSelectionPolicy) {
    const tierCompare = filingTierRank(left.selectionTier) - filingTierRank(right.selectionTier);
    if (tierCompare !== 0) {
      return tierCompare;
    }
  }
  const dateCompare = right.filingDate.localeCompare(left.filingDate);
  if (dateCompare !== 0) {
    return dateCompare;
  }
  const acceptanceCompare = right.acceptanceDateTime.localeCompare(left.acceptanceDateTime);
  if (acceptanceCompare !== 0) {
    return acceptanceCompare;
  }
  const formCompare = secFormRank(left.secFormBase) - secFormRank(right.secFormBase);
  if (formCompare !== 0) {
    return formCompare;
  }
  const filingTypeCompare = filingTypeRank(left.filingType) - filingTypeRank(right.filingType);
  if (filingTypeCompare !== 0) {
    return filingTypeCompare;
  }
  const accessionCompare = left.accessionNumber.localeCompare(right.accessionNumber);
  if (accessionCompare !== 0) {
    return accessionCompare;
  }
  return left.primaryDocument.localeCompare(right.primaryDocument);
}

function normalizeSecForm(value) {
  const secForm = String(value ?? "").trim().toUpperCase().replace(/\s+/g, "");
  if (secForm === "") {
    return undefined;
  }
  const baseForm = secForm.endsWith("/A") ? secForm.slice(0, -2) : secForm;
  if (/^424B\d*$/.test(baseForm)) {
    return {
      filingType: "424B",
      secForm,
      secFormBase: baseForm,
    };
  }
  const filingType = normalizedManifestFilingType(baseForm);
  if (!supportedFilingTypes.has(filingType)) {
    return undefined;
  }
  return {
    filingType,
    secForm,
    secFormBase: baseForm,
  };
}

function normalizedManifestFilingType(value) {
  const filingType = String(value ?? "").trim().toUpperCase().replace(/\s+/g, "");
  if (/^424B\d*$/.test(filingType)) {
    return "424B";
  }
  return filingType;
}

function filingTypeRank(filingType) {
  return [...supportedFilingTypes].indexOf(filingType);
}

function filingSelectionTier(filingType, secFormBase) {
  if (foundationalFilingTypes.has(filingType)) {
    return "foundational_business_filing";
  }
  if (transactionFilingTypes.has(filingType)) {
    return "transaction_or_proxy_filing";
  }
  if (eventFilingTypes.has(filingType)) {
    return "material_event_or_periodic_filing";
  }
  if (filingType === "424B" && businessProspectus424BForms.has(secFormBase)) {
    return "business_prospectus_fallback";
  }
  if (filingType === "424B" && supplement424BForms.has(secFormBase)) {
    return "prospectus_supplement_fallback";
  }
  return "prospectus_unknown_or_late_fallback";
}

function filingTierRank(selectionTier) {
  if (selectionTier === "foundational_business_filing") {
    return 0;
  }
  if (selectionTier === "business_prospectus_fallback") {
    return 1;
  }
  if (selectionTier === "prospectus_supplement_fallback") {
    return 2;
  }
  if (selectionTier === "transaction_or_proxy_filing") {
    return 3;
  }
  if (selectionTier === "material_event_or_periodic_filing") {
    return 4;
  }
  return 5;
}

function filingSelectionFamily(filingType, secFormBase) {
  if (foundationalFilingTypes.has(filingType)) {
    return "foundational_business_filing";
  }
  if (transactionFilingTypes.has(filingType)) {
    return "transaction_or_proxy_filing";
  }
  if (eventFilingTypes.has(filingType)) {
    return "material_event_or_periodic_filing";
  }
  if (businessProspectus424BForms.has(secFormBase)) {
    return "business_prospectus_424b";
  }
  if (supplement424BForms.has(secFormBase)) {
    return "supplement_424b";
  }
  if (filingType === "424B") {
    return "unknown_or_late_424b";
  }
  return "unknown_supported_filing";
}

function secFormRank(secFormBase) {
  return secFormRanks.get(secFormBase) ?? 1000;
}

function isNewerFiling(candidate, selected) {
  const dateCompare = candidate.filingDate.localeCompare(selected.filingDate);
  if (dateCompare !== 0) {
    return dateCompare > 0;
  }
  return candidate.acceptanceDateTime.localeCompare(selected.acceptanceDateTime) > 0;
}

function selectionReasonFor({
  filingSelectionPolicy,
  foundationalCandidateCount,
  newerSupportedFilingDisplacedCount,
  selected,
}) {
  if (filingSelectionPolicy === "latest-supported") {
    return "selected_latest_supported_filing";
  }
  if (selected.selectionTier === "foundational_business_filing") {
    if (newerSupportedFilingDisplacedCount > 0) {
      return "selected_foundational_business_filing_over_newer_supported_filing";
    }
    return "selected_newest_foundational_business_filing";
  }
  if (selected.selectionTier === "business_prospectus_fallback") {
    if (newerSupportedFilingDisplacedCount > 0) {
      return "selected_business_prospectus_over_newer_supplement";
    }
    return "selected_business_prospectus_fallback_no_foundational_filing";
  }
  if (selected.selectionTier === "prospectus_unknown_or_late_fallback") {
    return "selected_unknown_or_late_424b_fallback_no_foundational_filing";
  }
  if (selected.selectionTier === "transaction_or_proxy_filing") {
    return "selected_transaction_or_proxy_filing";
  }
  if (selected.selectionTier === "material_event_or_periodic_filing") {
    return "selected_material_event_or_periodic_filing";
  }
  if (foundationalCandidateCount === 0) {
    return "selected_supplement_prospectus_fallback_no_foundational_filing";
  }
  return "selected_prospectus_supplement_fallback";
}

function selectionWarningsFor({
  businessProspectus424BCandidateCount,
  foundationalCandidateCount,
  newerSupportedFilingDisplacedCount,
  selected,
  supplement424BCandidateCount,
  unknown424BCandidateCount,
}) {
  const warnings = [];
  if (newerSupportedFilingDisplacedCount > 0) {
    warnings.push("newer_supported_filing_displaced_by_policy");
  }
  if (selected.selectionTier === "prospectus_supplement_fallback" && foundationalCandidateCount === 0) {
    warnings.push("no_foundational_business_filing_available");
    warnings.push("selected_supplement_grade_424b");
  }
  if (selected.selectionTier === "business_prospectus_fallback" && foundationalCandidateCount === 0) {
    warnings.push("no_foundational_business_filing_available");
  }
  if (selected.selectionTier === "prospectus_unknown_or_late_fallback") {
    warnings.push("selected_unknown_or_late_424b");
  }
  if (unknown424BCandidateCount > 0) {
    warnings.push("unknown_or_late_424b_candidates_present");
  }
  if (
    selected.selectionTier === "prospectus_supplement_fallback" &&
    businessProspectus424BCandidateCount === 0 &&
    supplement424BCandidateCount > 0
  ) {
    warnings.push("no_business_prospectus_424b_available");
  }
  return warnings;
}

function requiredRecentString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function localFilingPath({
  accessionNumber,
  cik,
  filingDir,
  primaryDocument,
  symbol,
}) {
  if (filingDir === undefined) {
    return "";
  }
  const accessionWithoutDashes = accessionNumber.replace(/-/g, "");
  const safePrimaryDocument = path.basename(primaryDocument);
  const candidates = [
    `${symbol}-${accessionWithoutDashes}-${safePrimaryDocument}`,
    `CIK${cik}-${accessionWithoutDashes}-${safePrimaryDocument}`,
    `${accessionWithoutDashes}-${safePrimaryDocument}`,
    safePrimaryDocument,
  ].map((fileName) => path.join(filingDir, fileName));
  const match = candidates.find((file) => existsSync(file));
  return match ?? "";
}

function secArchiveUrl({
  accessionNumber,
  cik,
  primaryDocument,
}) {
  const accessionWithoutDashes = accessionNumber.replace(/-/g, "");
  return `${secArchivesBaseUrl}/${normalizeCik(cik)}/${accessionWithoutDashes}/${path.basename(primaryDocument)}`;
}

function secSubmissionUrl(cik) {
  return `${options.secSubmissionsBaseUrl}/CIK${padCik(cik)}.json`;
}

function submissionSourceName({ secSubmissionsBaseUrl, submissionsDir }) {
  return submissionsDir ?? secSubmissionsBaseUrl;
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function formatCsv(records) {
  const rows = [manifestHeader];
  for (const record of records) {
    rows.push(manifestHeader.map((field) => record[field] ?? ""));
  }
  return rows.map((row) => row.map(csvValue).join(",")).join("\n") + "\n";
}

function csvValue(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
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
