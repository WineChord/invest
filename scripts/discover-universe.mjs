import { readFileSync, writeFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";

const candidatesFile = "research/discovery/candidates.csv";
const discoveryLanesFile = "research/discovery/lanes.yml";
const secCompanyTickersExchangeUrl = "https://www.sec.gov/files/company_tickers_exchange.json";
const securityMasterFile = "data/market/security_master.csv";
const watchlistFile = "research/watchlist.csv";
const defaultLimit = 50;
const secUserAgent = "winechord-invest discovery research";
const allowedDiscoveryExchanges = new Set(["Nasdaq", "NYSE", "NYSE American"]);

const candidateColumns = [
  "symbol",
  "name",
  "exchange",
  "asset_type",
  "discovered_at",
  "discovery_source",
  "source_url",
  "source_published_at",
  "retrieved_at",
  "first_seen_at",
  "theme",
  "why_it_might_matter",
  "status",
  "next_action",
  "notes",
];

const options = parseArgs(process.argv.slice(2));
const discoveryDate = options.asOf ?? currentDate();
const discoveryLanes = loadDiscoveryLanes(options);
const knownSymbols = new Set([
  ...csvRecords(watchlistFile).map((row) => row.symbol.toUpperCase()),
  ...csvRecords(securityMasterFile).map((row) => row.symbol.toUpperCase()),
  ...csvRecords(candidatesFile).map((row) => row.symbol.toUpperCase()),
]);
const companies = await fetchSecCompanyList();
const candidates = findCandidates(companies, discoveryLanes, knownSymbols)
  .slice(0, options.limit);

if (candidates.length === 0) {
  console.log("No new keyword-matched discovery candidates found.");
} else {
  console.log(formatCandidates(candidates));
}

if (options.write && candidates.length > 0) {
  appendCandidates(candidates, discoveryDate);
  console.log(`Appended ${candidates.length} candidates to ${candidatesFile}.`);
} else {
  console.log("Dry run only. Pass --write to append candidates after reviewing the output.");
}

function parseArgs(args) {
  const parsed = {
    includeEmerging: false,
    limit: defaultLimit,
    write: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--write") {
      parsed.write = true;
    } else if (arg === "--dry-run") {
      parsed.write = false;
    } else if (arg === "--include-emerging") {
      parsed.includeEmerging = true;
    } else if (arg === "--as-of") {
      parsed.asOf = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--limit") {
      parsed.limit = Number(requireNextArg(args, index, arg));
      if (!Number.isInteger(parsed.limit) || parsed.limit <= 0) {
        throw new Error("--limit must be a positive integer");
      }
      index += 1;
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

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

function loadDiscoveryLanes({ includeEmerging }) {
  const parsed = parseYaml(readFileSync(discoveryLanesFile, "utf8"));
  const lanes = Array.isArray(parsed?.lanes) ? parsed.lanes : [];
  return lanes.filter((lane) => {
    if (lane.status === "active") {
      return true;
    }
    return includeEmerging && ["emerging", "incubating"].includes(lane.status);
  });
}

async function fetchSecCompanyList() {
  const response = await fetch(secCompanyTickersExchangeUrl, {
    headers: {
      "User-Agent": secUserAgent,
    },
  });
  if (!response.ok) {
    throw new Error(`SEC company ticker request failed: ${response.status} ${response.statusText}`);
  }
  const body = await response.json();
  const fields = body.fields ?? [];
  return (body.data ?? []).map((row) =>
    Object.fromEntries(fields.map((field, index) => [field, row[index]])),
  );
}

function findCandidates(companies, lanes, knownSymbols) {
  const matches = [];
  const secSymbols = new Set(
    companies.map((company) => String(company.ticker ?? "").toUpperCase()).filter(Boolean),
  );
  for (const company of companies) {
    const symbol = String(company.ticker ?? "").toUpperCase();
    const name = String(company.name ?? "");
    const exchange = String(company.exchange ?? "");
    if (
      symbol === ""
      || name === ""
      || !allowedDiscoveryExchanges.has(exchange)
      || !isLikelyCommonShare(symbol, secSymbols)
      || knownSymbols.has(symbol)
    ) {
      continue;
    }

    for (const lane of lanes) {
      const keywords = matchingKeywords(lane, name, symbol);
      if (keywords.length === 0) {
        continue;
      }
      matches.push({
        symbol,
        name,
        exchange,
        laneId: lane.id,
        laneName: lane.name,
        keywords,
      });
      break;
    }
  }

  return matches.sort((left, right) =>
    left.laneId.localeCompare(right.laneId)
      || left.symbol.localeCompare(right.symbol),
  );
}

function isLikelyCommonShare(symbol, secSymbols) {
  if (symbol.includes("-P")) {
    return false;
  }
  const derivativeSuffixes = ["WS", "WT", "W", "U", "R"];
  return derivativeSuffixes.every((suffix) => {
    if (!symbol.endsWith(suffix) || symbol.length <= suffix.length) {
      return true;
    }
    return !secSymbols.has(symbol.slice(0, -suffix.length));
  });
}

function matchingKeywords(lane, name, symbol) {
  const haystack = `${name} ${symbol}`.toLowerCase();
  return (lane.screen_keywords ?? [])
    .map((keyword) => String(keyword).trim())
    .filter((keyword) => keyword !== "")
    .filter((keyword) => haystack.includes(keyword.toLowerCase()));
}

function formatCandidates(candidates) {
  const rows = candidates.map((candidate) =>
    `${candidate.symbol}\t${candidate.exchange}\t${candidate.laneId}\t${candidate.keywords.join("; ")}\t${candidate.name}`,
  );
  return [
    "symbol\texchange\tlane\tmatched_keywords\tname",
    ...rows,
  ].join("\n");
}

function appendCandidates(candidates, discoveredAt) {
  const existing = readFileSync(candidatesFile, "utf8");
  const rows = candidates.map((candidate) => {
    const why = `Matched ${candidate.laneName} lane keywords: ${candidate.keywords.join("; ")}; requires primary-source skim before watchlist promotion.`;
    return csvLine({
      symbol: candidate.symbol,
      name: candidate.name,
      exchange: candidate.exchange,
      asset_type: "common_stock",
      discovered_at: discoveredAt,
      discovery_source: "SEC company_tickers_exchange lane keyword scan",
      source_url: secCompanyTickersExchangeUrl,
      source_published_at: "not listed on SEC reference file",
      retrieved_at: discoveredAt,
      first_seen_at: discoveredAt,
      theme: candidate.laneId,
      why_it_might_matter: why,
      status: "new",
      next_action: "primary_source_skim",
      notes: "Deterministic discovery candidate only; not a buy recommendation.",
    });
  });
  const separator = existing.endsWith("\n") ? "" : "\n";
  writeFileSync(candidatesFile, `${existing}${separator}${rows.join("\n")}\n`);
}

function csvLine(record) {
  return candidateColumns.map((column) => csvEscape(record[column] ?? "")).join(",");
}

function csvEscape(value) {
  const text = String(value);
  if (!/[",\n\r]/.test(text)) {
    return text;
  }
  return `"${text.replaceAll("\"", "\"\"")}"`;
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

function csvRecords(file) {
  const rows = parseCsv(readFileSync(file, "utf8"));
  const header = rows[0] ?? [];
  return rows.slice(1).map((row) =>
    Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""])),
  );
}
