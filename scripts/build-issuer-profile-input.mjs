import { readFileSync, writeFileSync } from "node:fs";

const profileSchemaVersion = 1;
const profilePurpose = "issuer_universe_discovery";
const maxProfileTextLength = 4000;
const manualProfileInputSelectionStrategy = "manual_profile_input_csv";
const manualProfileInputCoverageScope = "partial_manual_profile_input";
const allowedDiscoveryExchanges = new Set(["Nasdaq", "NYSE", "NYSE American"]);

const options = parseArgs(process.argv.slice(2));
const generatedAt = new Date().toISOString();
const retrievedAt = options.asOf ?? generatedAt.slice(0, 10);
const secReferenceBySymbol = loadSecReference(options.secInput);
const rows = csvRecords(options.input);
const requestedSymbols = rows
  .map((row) => optionalString(row.symbol).toUpperCase())
  .filter(Boolean);
const profiles = [];
const skipped_symbols = [];
const seenSymbols = new Set();
const seenCiks = new Map();

rows.forEach((row, index) => {
  const context = `${options.input} row ${index + 2}`;
  const symbol = requiredString(row.symbol, `${context} symbol`).toUpperCase();
  const secReference = secReferenceBySymbol.get(symbol);
  if (secReference === undefined) {
    skipped_symbols.push({
      symbol,
      reason: "missing_sec_reference",
    });
    return;
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
  if (seenSymbols.has(symbol)) {
    throw new Error(`${context} duplicates profile symbol ${symbol}`);
  }
  const duplicateCikSymbol = seenCiks.get(normalizedCik);
  if (duplicateCikSymbol !== undefined) {
    throw new Error(`${context} CIK ${cik} is used by both ${duplicateCikSymbol} and ${symbol}`);
  }
  seenSymbols.add(symbol);
  seenCiks.set(normalizedCik, symbol);

  const text = boundedProfileText(requiredString(row.text, `${context} text`));
  profiles.push({
    symbol,
    cik,
    source_name: optionalString(row.source_name),
    source_url: requiredString(row.source_url, `${context} source_url`),
    source_published_at: requiredString(row.source_published_at, `${context} source_published_at`),
    retrieved_at: optionalString(row.retrieved_at) || retrievedAt,
    text: text.value,
    profile_text_fields: ["text"],
    profile_field_texts: {
      text: text.value,
    },
    profile_text_truncated: text.truncated,
  });
});

profiles.sort((left, right) => left.symbol.localeCompare(right.symbol));

if (profiles.length === 0 && !options.allowEmpty) {
  throw new Error("No issuer profiles were emitted; pass --allow-empty only for explicit empty-artifact tests");
}

const result = {
  schema_version: profileSchemaVersion,
  generated_at: generatedAt,
  source: "issuer_profile_input_csv",
  profile_purpose: profilePurpose,
  profile_text_fields: ["text"],
  source_files: [
    options.input,
    options.secInput,
  ],
  selection_strategy: manualProfileInputSelectionStrategy,
  profile_coverage_strategy: manualProfileInputSelectionStrategy,
  coverage_scope: manualProfileInputCoverageScope,
  requested_symbols: requestedSymbols,
  selected_symbol_count: rows.length,
  eligible_universe_count: [...secReferenceBySymbol.values()].filter((record) =>
    allowedDiscoveryExchanges.has(String(record.exchange ?? "")),
  ).length,
  coverage_limit: rows.length,
  sampling_note: "Manual issuer profile CSV supplied by the caller; coverage claims are limited to the supplied rows.",
  profile_count: profiles.length,
  skipped_symbols,
  profiles,
};

const output = `${JSON.stringify(result, null, 2)}\n`;
if (options.output === undefined) {
  process.stdout.write(output);
} else {
  writeFileSync(options.output, output);
  console.log(`Wrote issuer profile input to ${options.output}.`);
}

function boundedProfileText(text) {
  const cleanedText = text.trim();
  return {
    value: cleanedText.slice(0, maxProfileTextLength),
    truncated: cleanedText.length > maxProfileTextLength,
  };
}

function parseArgs(args) {
  const parsed = {
    allowEmpty: false,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--input") {
      parsed.input = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--sec-input") {
      parsed.secInput = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--as-of") {
      parsed.asOf = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--allow-empty") {
      parsed.allowEmpty = true;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }
  if (parsed.input === undefined) {
    throw new Error("--input is required");
  }
  if (parsed.secInput === undefined) {
    throw new Error("--sec-input is required");
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

function optionalString(value) {
  return typeof value === "string" ? value.trim() : "";
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
