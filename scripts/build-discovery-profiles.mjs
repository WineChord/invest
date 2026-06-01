import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const companyAnalysisFile = "research/company-analysis.yml";
const securityMasterFile = "data/market/security_master.csv";
const profileSchemaVersion = 1;
const outputSourceName = "repo_company_analysis";
const profilePurpose = "repo_research_recall_calibration";
const maxProfileTextLength = 4000;
const commonStockAssetType = "common_stock";
const tradableStatus = "tradable";
const profileTextFields = ["summary", "upside_path"];
const allowedExchangeIds = new Set(["nasdaq", "nyse", "nyseamerican"]);

const options = parseArgs(process.argv.slice(2));
const generatedAt = new Date().toISOString();
const retrievedAt = options.asOf ?? generatedAt.slice(0, 10);
const securityBySymbol = loadSecurityMaster();
const secReferenceBySymbol = options.secInput === undefined ? undefined : loadSecReference(options.secInput);
const analysisEntries = latestAnalysisEntries();
const profiles = [];
const skipped_symbols = [];
const seenProfileCiks = new Map();

analysisEntries.forEach((entry) => {
  const symbol = requiredString(entry.symbol, `${companyAnalysisFile} entry.symbol`).toUpperCase();
  const security = securityBySymbol.get(symbol);
  if (security === undefined) {
    skipped_symbols.push({
      symbol,
      reason: "missing_security_master",
    });
    return;
  }
  const secCik = requiredSecurityField(security.sec_cik, symbol, "sec_cik");
  if (secCik === "") {
    skipped_symbols.push({
      symbol,
      reason: "missing_sec_cik",
    });
    return;
  }
  if (security.tradability !== tradableStatus) {
    skipped_symbols.push({
      symbol,
      reason: `not_tradable:${security.tradability}`,
    });
    return;
  }
  if (security.asset_type !== commonStockAssetType) {
    skipped_symbols.push({
      symbol,
      reason: `unsupported_asset_type:${security.asset_type}`,
    });
    return;
  }
  const normalizedExchange = normalizeExchange(security.exchange);
  if (!allowedExchangeIds.has(normalizedExchange)) {
    skipped_symbols.push({
      symbol,
      reason: `unsupported_exchange:${security.exchange}`,
    });
    return;
  }
  if (secReferenceBySymbol !== undefined) {
    const secReference = secReferenceBySymbol.get(symbol);
    if (secReference === undefined) {
      skipped_symbols.push({
        symbol,
        reason: "missing_sec_reference",
      });
      return;
    }
    validateSecReference(symbol, security, secReference);
  }
  const sourcePath = requiredRepoRelativeSourcePath(
    entry.source_path,
    `${companyAnalysisFile} ${symbol} source_path`,
  );
  const duplicateCikSymbol = seenProfileCiks.get(normalizeCik(secCik));
  if (duplicateCikSymbol !== undefined) {
    throw new Error(`CIK ${secCik} is used by both ${duplicateCikSymbol} and ${symbol}`);
  }
  seenProfileCiks.set(normalizeCik(secCik), symbol);

  const text = boundedProfileText(entry);
  profiles.push({
    symbol,
    cik: secCik,
    source_name: `${outputSourceName}:${entry.id}`,
    source_url: sourcePath,
    source_published_at: requiredString(entry.analyzed_at, `${companyAnalysisFile} ${symbol} analyzed_at`),
    retrieved_at: retrievedAt,
    text: text.value,
    profile_text_fields: profileTextFields,
    profile_field_texts: text.fieldTexts,
    profile_text_truncated: text.truncated,
  });
});

if (profiles.length === 0 && !options.allowEmpty) {
  throw new Error("No discovery profiles were emitted; pass --allow-empty only for explicit empty-artifact tests");
}

const result = {
  schema_version: profileSchemaVersion,
  generated_at: generatedAt,
  source: outputSourceName,
  profile_purpose: profilePurpose,
  profile_text_fields: profileTextFields,
  source_files: [
    companyAnalysisFile,
    securityMasterFile,
  ],
  profile_count: profiles.length,
  skipped_symbols,
  profiles,
};

const output = `${JSON.stringify(result, null, 2)}\n`;
if (options.output === undefined) {
  process.stdout.write(output);
} else {
  writeFileSync(options.output, output);
  console.log(`Wrote discovery profile input to ${options.output}.`);
}

function latestAnalysisEntries() {
  const parsed = parseYaml(readFileSync(companyAnalysisFile, "utf8"));
  const entries = Array.isArray(parsed?.entries) ? parsed.entries : [];
  const latestBySymbol = new Map();
  entries.forEach((entry, index) => {
    const symbol = requiredString(entry?.symbol, `${companyAnalysisFile} entries[${index}].symbol`).toUpperCase();
    const analyzedAt = requiredString(entry?.analyzed_at, `${companyAnalysisFile} ${symbol} analyzed_at`);
    const current = latestBySymbol.get(symbol);
    if (current === undefined || analyzedAt >= current.analyzed_at) {
      latestBySymbol.set(symbol, entry);
    }
  });
  return [...latestBySymbol.values()].sort((left, right) =>
    String(left.symbol).localeCompare(String(right.symbol)),
  );
}

function boundedProfileText(entry) {
  const fieldTexts = {};
  const text = profileTextFields.map((field) => {
    const value = cleanProfileText(requiredString(entry[field], `${companyAnalysisFile} ${entry.symbol} ${field}`));
    fieldTexts[field] = value;
    return value;
  }).join("\n");
  const cleanedText = cleanProfileText(text);
  return {
    fieldTexts,
    value: cleanedText.slice(0, maxProfileTextLength),
    truncated: cleanedText.length > maxProfileTextLength,
  };
}

function cleanProfileText(text) {
  return text.replace(/\bsatellite[-\s]+(account|portfolio|allocation)\b/gi, "portfolio");
}

function parseArgs(args) {
  const parsed = {
    allowEmpty: false,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--as-of") {
      parsed.asOf = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--sec-input") {
      parsed.secInput = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--allow-empty") {
      parsed.allowEmpty = true;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
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

function requiredString(value, context) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${context} is required`);
  }
  return value.trim();
}

function requiredRepoRelativeSourcePath(value, context) {
  const sourcePath = requiredString(value, context);
  if (path.isAbsolute(sourcePath)) {
    throw new Error(`${context} must be repo-relative, not absolute`);
  }
  if (!existsSync(sourcePath)) {
    throw new Error(`${context} does not exist: ${sourcePath}`);
  }
  return sourcePath;
}

function requiredSecurityField(value, symbol, field) {
  if (value === undefined) {
    throw new Error(`${securityMasterFile} ${symbol} ${field} column is missing`);
  }
  return String(value).trim();
}

function loadSecurityMaster() {
  const securities = new Map();
  csvRecords(securityMasterFile).forEach((row, index) => {
    const context = `${securityMasterFile} row ${index + 2}`;
    const symbol = requiredString(row.symbol, `${context} symbol`).toUpperCase();
    if (securities.has(symbol)) {
      throw new Error(`${context} duplicates security master symbol ${symbol}`);
    }
    securities.set(symbol, row);
  });
  return securities;
}

function loadSecReference(file) {
  const body = JSON.parse(readFileSync(file, "utf8"));
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
  body.data.forEach((row, index) => {
    const record = Object.fromEntries(fields.map((field, fieldIndex) => [field, row[fieldIndex]]));
    const symbol = requiredString(record.ticker, `SEC reference row ${index} ticker`).toUpperCase();
    if (references.has(symbol)) {
      throw new Error(`SEC reference duplicates ticker ${symbol}`);
    }
    references.set(symbol, record);
  });
  return references;
}

function validateSecReference(symbol, security, secReference) {
  const securityCik = normalizeCik(security.sec_cik);
  const referenceCik = normalizeCik(secReference.cik);
  if (securityCik !== referenceCik) {
    throw new Error(`SEC reference CIK mismatch for ${symbol}: security_master=${security.sec_cik} sec=${secReference.cik}`);
  }
  const securityExchange = normalizeExchange(security.exchange);
  const referenceExchange = normalizeExchange(secReference.exchange);
  if (securityExchange !== referenceExchange) {
    throw new Error(`SEC reference exchange mismatch for ${symbol}: security_master=${security.exchange} sec=${secReference.exchange}`);
  }
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
