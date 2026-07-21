import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fetchSecTextWithRetry } from "./sec-fetch-lib.mjs";

const schemaVersion = 1;
const sourceName = "sec_registration_transaction_candidates";
const secArchivesBaseUrl = "https://www.sec.gov/Archives";
const defaultLimit = 500;
const defaultTargetFilingFamilies = new Set([
  "S-1",
  "F-1",
  "10-12B",
  "10-12G",
  "424B",
  "S-4",
  "F-4",
  "DEF14A",
  "425",
]);
const registrationFamilies = new Set(["S-1", "F-1", "10-12B", "10-12G", "424B"]);
const transactionFamilies = new Set(["S-4", "F-4", "DEF14A", "425"]);

const options = parseArgs(process.argv.slice(2));
const generatedAt = new Date().toISOString();
const retrievedAt = options.retrievedAt ?? options.asOf;
const dailyIndexes = await loadDailyIndexes(options);
const requestedDates = requestedCoverageDates(options);
const coveredDates = dailyIndexes.map((dailyIndex) => dailyIndex.asOf).sort();
const coveredDateSet = new Set(coveredDates);
const missingOrUnscannedDates = requestedDates.filter((date) => !coveredDateSet.has(date));
const rows = dailyIndexes.flatMap((dailyIndex) => parseMasterIndex(dailyIndex.content, dailyIndex.asOf));
const matchedRows = rows
  .filter((row) => targetFilingFamilies(options.filingFamilies).has(row.filing_family))
  .sort(compareRows)
  .slice(0, options.limit);

if (matchedRows.length === 0 && !options.allowEmpty) {
  throw new Error("No registration or transaction candidates were emitted; pass --allow-empty only for explicit empty-artifact tests");
}

const result = {
  schema_version: schemaVersion,
  source: sourceName,
  generated_at: generatedAt,
  as_of: options.asOf,
  retrieved_at: retrievedAt,
  source_published_at: options.sourcePublishedAt ?? options.asOf,
  coverage_start: options.startDate ?? options.asOf,
  coverage_end: options.endDate ?? options.asOf,
  covered_dates: coveredDates,
  missing_or_unscanned_dates: missingOrUnscannedDates,
  strict_date_coverage: options.strictDateCoverage === true,
  input_source: dailyIndexes.length === 1 ? dailyIndexes[0].inputSource : "local_sec_daily_master_index_range",
  daily_index_url: dailyIndexes.length === 1 ? dailyIndexes[0].url : "",
  daily_index_sha256: dailyIndexes.length === 1 ? sha256(dailyIndexes[0].content) : "",
  daily_indices: dailyIndexes.map((dailyIndex) => ({
    as_of: dailyIndex.asOf,
    input_source: dailyIndex.inputSource,
    path: dailyIndex.localPath === "" ? "" : path.basename(dailyIndex.localPath),
    url: dailyIndex.url,
    sha256: sha256(dailyIndex.content),
    row_count: parseMasterIndex(dailyIndex.content, dailyIndex.asOf).length,
  })),
  target_filing_families: Array.from(targetFilingFamilies(options.filingFamilies)).sort(),
  source_row_count: rows.length,
  provisional_candidate_count: matchedRows.length,
  provisional_candidates: matchedRows.map((row) => candidateRecord(row, retrievedAt)),
  caveats: [
    "This artifact is pre-ticker discovery scaffolding, not buy eligibility.",
    "A candidate is not tradable until security metadata confirms an eligible US-listed public equity under the active policy.",
    "The artifact only covers the supplied SEC daily master index scope.",
  ],
};

if (options.output !== undefined) {
  mkdirSync(path.dirname(options.output), { recursive: true });
  writeFileSync(options.output, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`Wrote SEC registration/transaction candidates to ${options.output}.`);
} else {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

function parseArgs(args) {
  const parsed = {
    allowEmpty: false,
    limit: defaultLimit,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
      index += 1;
    } else if (arg === "--retrieved-at") {
      parsed.retrievedAt = strictDate(requireNextArg(args, index, arg), "--retrieved-at");
      index += 1;
    } else if (arg === "--source-published-at") {
      parsed.sourcePublishedAt = strictDate(requireNextArg(args, index, arg), "--source-published-at");
      index += 1;
    } else if (arg === "--daily-index") {
      parsed.dailyIndex = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--daily-index-dir") {
      parsed.dailyIndexDir = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--daily-index-url") {
      parsed.dailyIndexUrl = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--start-date") {
      parsed.startDate = strictDate(requireNextArg(args, index, arg), "--start-date");
      index += 1;
    } else if (arg === "--end-date") {
      parsed.endDate = strictDate(requireNextArg(args, index, arg), "--end-date");
      index += 1;
    } else if (arg === "--filing-families") {
      parsed.filingFamilies = requireNextArg(args, index, arg)
        .split(",")
        .map((value) => filingFamily(value))
        .filter(Boolean);
      index += 1;
    } else if (arg === "--limit") {
      parsed.limit = positiveInteger(requireNextArg(args, index, arg), "--limit");
      index += 1;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--allow-empty") {
      parsed.allowEmpty = true;
    } else if (arg === "--strict-date-coverage") {
      parsed.strictDateCoverage = true;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }
  if (parsed.asOf === undefined) {
    throw new Error("--as-of is required");
  }
  const inputModeCount = [
    parsed.dailyIndex !== undefined,
    parsed.dailyIndexDir !== undefined,
    parsed.dailyIndexUrl !== undefined,
  ].filter(Boolean).length;
  if (inputModeCount !== 1) {
    throw new Error("Provide exactly one of --daily-index, --daily-index-dir, or --daily-index-url");
  }
  if (parsed.dailyIndexDir !== undefined) {
    if (parsed.startDate === undefined || parsed.endDate === undefined) {
      throw new Error("--daily-index-dir requires --start-date and --end-date");
    }
    if (parsed.startDate > parsed.endDate) {
      throw new Error("--start-date must be on or before --end-date");
    }
  }
  return parsed;
}

async function loadDailyIndexes(options) {
  if (options.dailyIndex !== undefined) {
    if (!existsSync(options.dailyIndex)) {
      throw new Error(`--daily-index does not exist: ${options.dailyIndex}`);
    }
    return [{
      asOf: options.asOf,
      content: readFileSync(options.dailyIndex, "utf8"),
      inputSource: "local_sec_daily_master_index",
      localPath: options.dailyIndex,
      url: "",
    }];
  }
  if (options.dailyIndexDir !== undefined) {
    if (!existsSync(options.dailyIndexDir)) {
      throw new Error(`--daily-index-dir does not exist: ${options.dailyIndexDir}`);
    }
    const filesByDate = dailyIndexFilesByDate(options.dailyIndexDir);
    const indexes = datesBetween(options.startDate, options.endDate).flatMap((date) => {
      const file = filesByDate.get(date);
      if (file === undefined) {
        if (options.strictDateCoverage) {
          throw new Error(`Missing SEC daily master index for ${date} in --daily-index-dir`);
        }
        return [];
      }
      return [{
        asOf: date,
        content: readFileSync(file, "utf8"),
        inputSource: "local_sec_daily_master_index",
        localPath: file,
        url: "",
      }];
    });
    if (indexes.length === 0) {
      throw new Error("--daily-index-dir did not contain any SEC daily master indexes in the requested date range");
    }
    return indexes;
  }
  const response = await fetchSecTextWithRetry({
    accept: "text/plain,*/*",
    context: `Failed to fetch ${options.dailyIndexUrl}`,
    sourceUrl: options.dailyIndexUrl,
  });
  return [{
    asOf: options.asOf,
    content: response.content,
    inputSource: "remote_sec_daily_master_index",
    localPath: "",
    url: options.dailyIndexUrl,
  }];
}

function requestedCoverageDates(options) {
  if (options.dailyIndexDir !== undefined) {
    return datesBetween(options.startDate, options.endDate);
  }
  return [options.asOf];
}

function parseMasterIndex(content, fallbackDate) {
  const rows = [];
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === "" || !/^\d+\|/.test(trimmed)) {
      continue;
    }
    const columns = trimmed.split("|");
    if (columns.length < 5) {
      continue;
    }
    const [cik, companyName, formType, dateFiled, filename] = columns;
    const filingDate = strictDate(
      normalizeSecMasterIndexDate(dateFiled || fallbackDate),
      `SEC master index filing date for CIK ${cik}`,
    );
    const filingType = normalizeForm(formType);
    const family = filingFamily(filingType);
    rows.push({
      cik: normalizeCik(cik),
      company_name: companyName.trim(),
      filing_date: filingDate,
      filing_family: family,
      filing_type: filingType,
      filename: filename.trim(),
    });
  }
  return rows;
}

function targetFilingFamilies(configuredFamilies) {
  if (configuredFamilies === undefined || configuredFamilies.length === 0) {
    return defaultTargetFilingFamilies;
  }
  return new Set(configuredFamilies);
}

function normalizeSecMasterIndexDate(value) {
  const text = String(value ?? "").trim();
  if (/^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  }
  return text;
}

function candidateRecord(row, retrievedAt) {
  const accessionOrDocumentId = path.basename(row.filename, path.extname(row.filename));
  const listingPath = archivesPath(row.filename);
  const familyType = registrationFamilies.has(row.filing_family)
    ? "registration"
    : transactionFamilies.has(row.filing_family)
      ? "transaction"
      : "other";
  return {
    cik: padCik(row.cik),
    company_name: row.company_name,
    filing_type: row.filing_type,
    filing_family: row.filing_family,
    filing_family_type: familyType,
    filing_date: row.filing_date,
    source_published_at: row.filing_date,
    retrieved_at: retrievedAt,
    accession_or_document_id: accessionOrDocumentId,
    source_url: `${secArchivesBaseUrl}/${listingPath}`,
    candidate_status: "pre_listing_or_transaction_candidate",
    tradability_status: "not_tradable_until_security_metadata_confirms_policy_eligible_listing",
    security_metadata_dependency: "requires_exchange_ticker_confirmation",
    why_it_might_matter: "SEC registration and transaction filings can surface a new public proxy before the listed-ticker reference catches it.",
    required_next_step: "triage_registration_transaction_filing_and_confirm_public_security_metadata",
    policy_boundary: "Do not promote to buy eligibility until US-listed public-equity metadata is confirmed under the active policy.",
  };
}

function compareRows(left, right) {
  return right.filing_date.localeCompare(left.filing_date)
    || left.company_name.localeCompare(right.company_name)
    || left.filing_type.localeCompare(right.filing_type)
    || left.filename.localeCompare(right.filename);
}

function archivesPath(filename) {
  return filename
    .replace(/^\/+/, "")
    .replace(/^Archives\//i, "");
}

function dailyIndexFilesByDate(directory) {
  const filesByDate = new Map();
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }
    const match = entry.name.match(/(\d{4})-?(\d{2})-?(\d{2})/);
    if (match === null) {
      continue;
    }
    const date = strictDate(`${match[1]}-${match[2]}-${match[3]}`, `SEC daily index filename ${entry.name}`);
    filesByDate.set(date, path.join(directory, entry.name));
  }
  return filesByDate;
}

function datesBetween(startDate, endDate) {
  const dates = [];
  let cursor = Date.parse(`${startDate}T00:00:00.000Z`);
  const end = Date.parse(`${endDate}T00:00:00.000Z`);
  while (cursor <= end) {
    dates.push(new Date(cursor).toISOString().slice(0, 10));
    cursor += 24 * 60 * 60 * 1000;
  }
  return dates;
}

function normalizeForm(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function filingFamily(value) {
  const normalized = normalizeForm(value).replace(/^DEF 14A$/, "DEF14A");
  if (/^424B\d*/.test(normalized)) {
    return "424B";
  }
  const mefMatch = normalized.match(/^(.+)MEF$/);
  if (mefMatch !== null && defaultTargetFilingFamilies.has(mefMatch[1])) {
    return mefMatch[1];
  }
  for (const family of defaultTargetFilingFamilies) {
    if (normalized === family || normalized.startsWith(`${family}/`)) {
      return family;
    }
  }
  return normalized;
}

function normalizeCik(value) {
  return String(value ?? "").trim().replace(/^0+/, "") || "0";
}

function padCik(value) {
  return normalizeCik(value).padStart(10, "0");
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

function positiveInteger(value, context) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${context} must be a positive integer`);
  }
  return number;
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}
