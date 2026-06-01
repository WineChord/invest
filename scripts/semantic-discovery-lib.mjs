import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { fetchSecTextWithRetry } from "./sec-fetch-lib.mjs";

export const semanticPacketSchemaVersion = 1;
export const semanticClassificationSchemaVersion = 1;
export const semanticBatchSchemaVersion = 1;
export const semanticDiscoveryRunSchemaVersion = 1;
export const secCompanyTickersExchangeUrl = "https://www.sec.gov/files/company_tickers_exchange.json";
export const allowedDiscoveryExchanges = new Set(["Nasdaq", "NYSE", "NYSE American"]);
export const allowedReasoningLevels = new Set(["low", "medium", "high", "xhigh"]);
export const allowedBottleneckExposure = new Set(["none", "weak", "possible", "strong"]);
export const allowedDirectness = new Set(["none", "weak_proxy", "indirect", "direct", "unknown"]);
export const allowedCompanyStage = new Set(["too_large_mature", "mature", "growth", "early", "newly_public", "unknown"]);
export const allowedExtremeUpsideFit = new Set(["unlikely", "possible", "strong", "unknown"]);
export const allowedSemanticEscalations = new Set([
  "none",
  "reject_or_archive",
  "medium_lane_compare",
  "xhigh_readiness_candidate",
]);
export const allowedConfidence = new Set(["low", "medium", "high"]);

export function requireNextArg(args, index, flag) {
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

export function strictDate(value, context) {
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

export function requireIsoTimestamp(value, context) {
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

export function requireString(value, context) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${context} is required`);
  }
  return value.trim();
}

export function requireNumber(value, context) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${context} must be a finite number`);
  }
  return value;
}

export function requireBoolean(value, context) {
  if (typeof value !== "boolean") {
    throw new Error(`${context} must be boolean`);
  }
  return value;
}

export function requireStringArray(value, context) {
  if (!Array.isArray(value)) {
    throw new Error(`${context} must be an array`);
  }
  return value.map((item, index) => requireString(item, `${context}[${index}]`));
}

export function requireAllowed(value, allowed, context) {
  const text = requireString(value, context);
  if (!allowed.has(text)) {
    throw new Error(`${context} has unsupported value ${text}`);
  }
  return text;
}

export function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

export function fileSha256(file) {
  return sha256(readFileSync(file, "utf8"));
}

export function stableStringify(value) {
  return JSON.stringify(sortForStableStringify(value));
}

export function stableSha256(value) {
  return sha256(stableStringify(value));
}

function sortForStableStringify(value) {
  if (Array.isArray(value)) {
    return value.map(sortForStableStringify);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, sortForStableStringify(item)]),
    );
  }
  return value;
}

export function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  ensureParentDir(file);
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function readJsonl(file) {
  if (!existsSync(file)) {
    return [];
  }
  return readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`${file} line ${index + 1} is not valid JSON: ${error.message}`);
      }
    });
}

export function writeJsonl(file, records) {
  ensureParentDir(file);
  writeFileSync(file, records.map((record) => JSON.stringify(record)).join("\n") + (records.length === 0 ? "" : "\n"));
}

export function ensureParentDir(file) {
  const directory = path.dirname(file);
  if (directory !== "." && !existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
}

export function ensureDir(directory) {
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
}

export function relativePath(file, cwd = process.cwd()) {
  return path.relative(cwd, path.resolve(file)).split(path.sep).join("/");
}

export function normalizeCik(cik) {
  return String(cik ?? "").replace(/^0+/, "") || "0";
}

export function padCik(cik) {
  return normalizeCik(cik).padStart(10, "0");
}

export function isEligibleDiscoveryCompany(company) {
  const exchange = String(company.exchange ?? "");
  const symbol = String(company.ticker ?? company.symbol ?? "").trim().toUpperCase();
  const cik = normalizeCik(company.cik);
  return symbol !== "" && cik !== "0" && allowedDiscoveryExchanges.has(exchange);
}

export async function loadSecCompanyList(input) {
  const source = input ?? secCompanyTickersExchangeUrl;
  const content = await loadTextSource(source);
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed.fields) || !Array.isArray(parsed.data)) {
    throw new Error(`${source} must use SEC company_tickers_exchange JSON shape`);
  }
  const companies = parsed.data.map((row) =>
    Object.fromEntries(parsed.fields.map((field, index) => [field, row[index]])),
  );
  return {
    companies,
    rowCount: companies.length,
    sha256: sha256(content),
    source,
  };
}

async function loadTextSource(source) {
  if (existsSync(source)) {
    return readFileSync(source, "utf8");
  }
  const response = await fetchSecTextWithRetry({
    accept: "application/json,text/plain,*/*",
    context: `Failed to fetch ${source}`,
    sourceUrl: source,
  });
  return response.content;
}

export function selectCompanies(companies, {
  all,
  limit,
  symbols,
}) {
  const requested = symbols === undefined
    ? undefined
    : new Set(symbols.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean));
  const eligible = companies
    .filter(isEligibleDiscoveryCompany)
    .map((company) => ({
      ...company,
      ticker: String(company.ticker ?? "").trim().toUpperCase(),
      cik: padCik(company.cik),
    }))
    .sort((left, right) => left.ticker.localeCompare(right.ticker));
  if (requested !== undefined) {
    return eligible.filter((company) => requested.has(company.ticker));
  }
  if (all) {
    return eligible;
  }
  return eligible.slice(0, limit);
}

export function loadLaneMapMetadata(file) {
  const content = readFileSync(file, "utf8");
  const parsed = parseYaml(content);
  return {
    asOf: String(parsed?.as_of ?? ""),
    ids: Array.isArray(parsed?.lanes)
      ? parsed.lanes.map((lane) => lane?.id).filter(Boolean)
      : [],
    path: relativePath(file),
    sha256: sha256(content),
  };
}

export function parseCsv(content) {
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

export function csvRecords(file) {
  if (!existsSync(file)) {
    return [];
  }
  const rows = parseCsv(readFileSync(file, "utf8"));
  const header = rows[0] ?? [];
  return rows.slice(1).map((row) =>
    Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""])),
  );
}

export function countBy(values, keyFn) {
  const counts = {};
  values.forEach((value) => {
    const key = keyFn(value);
    counts[key] = (counts[key] ?? 0) + 1;
  });
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
}

export function currentSemanticCacheRecords({
  classificationSchemaVersion = semanticClassificationSchemaVersion,
  laneMapSha256,
  packetBySymbol,
  records,
}) {
  const current = new Map();
  const stale = [];
  records.forEach((record) => {
    const symbol = String(record.symbol ?? "").toUpperCase();
    const packet = packetBySymbol.get(symbol);
    const key = semanticCacheKey(record);
    if (
      packet !== undefined &&
      record.classification_schema_version === classificationSchemaVersion &&
      record.issuer_packet_hash === packet.issuer_packet_hash &&
      record.lane_map_sha256 === laneMapSha256 &&
      record.cache_valid === true
    ) {
      current.set(key, record);
    } else {
      stale.push(record);
    }
  });
  return { current, stale };
}

export function semanticCacheKey(record) {
  return [
    String(record.symbol ?? "").toUpperCase(),
    String(record.cik ?? ""),
    String(record.issuer_packet_hash ?? ""),
    String(record.lane_map_sha256 ?? ""),
    String(record.classification_schema_version ?? ""),
  ].join("|");
}

export function semanticCacheKeyForPacket(packet, laneMapSha256) {
  return semanticCacheKey({
    cik: packet.cik,
    classification_schema_version: semanticClassificationSchemaVersion,
    issuer_packet_hash: packet.issuer_packet_hash,
    lane_map_sha256: laneMapSha256,
    symbol: packet.symbol,
  });
}
