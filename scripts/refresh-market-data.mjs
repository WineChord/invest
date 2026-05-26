import { readFileSync, writeFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";

const accountStateFile = "data/account/state.yml";
const equityCurveFile = "data/account/equity_curve.csv";
const ledgerFile = "data/account/ledger.csv";
const positionsFile = "data/account/positions.csv";
const watchlistPricesFile = "data/market/watchlist_prices.csv";
const defaultLookbackDays = 10;
const marketTimeZone = "America/New_York";
const priceSource = "Stooq";
const retrievedAt = new Date().toISOString();

const csvHeaders = {
  equityCurve: [
    "date",
    "total_market_value",
    "cash",
    "total_equity",
    "cumulative_deposits",
    "total_return_pct",
    "period_return_pct",
    "notes",
  ],
  prices: [
    "symbol",
    "price",
    "currency",
    "price_as_of",
    "source",
    "retrieved_at",
    "notes",
  ],
};

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const asOfDate =
  firstNonEmpty(options.asOf, process.env.MARKET_DATA_AS_OF) ??
  dateInTimeZone(marketTimeZone);
const lookbackDays = Number(
  firstNonEmpty(options.lookbackDays, process.env.MARKET_DATA_LOOKBACK_DAYS) ??
    defaultLookbackDays,
);

if (!isIsoDate(asOfDate)) {
  throw new Error(`Invalid as-of date: ${asOfDate}`);
}

if (!Number.isInteger(lookbackDays) || lookbackDays < 1 || lookbackDays > 45) {
  throw new Error("Lookback days must be an integer from 1 to 45");
}

const existingPrices = readCsvFile(watchlistPricesFile);
const positions = readCsvFile(positionsFile).filter((row) => toNumber(row.quantity) > 0);
const symbols = uniqueSymbols([
  ...existingPrices.map((row) => row.symbol),
  ...positions.map((row) => row.symbol),
]);

if (symbols.length === 0) {
  console.log("No tradable symbols found in price snapshots or positions.");
  process.exit(0);
}

const closeBySymbol = new Map();
const failures = [];

for (const symbol of symbols) {
  try {
    const close = await fetchLatestClose(symbol, asOfDate, lookbackDays);
    closeBySymbol.set(symbol, close);
    console.log(`ok ${symbol} ${close.date} ${formatDecimal(close.close, 4)}`);
  } catch (error) {
    failures.push(`${symbol}: ${error.message}`);
  }
}

const heldSymbols = new Set(positions.map((row) => row.symbol));
const failedHeldSymbols = failures.filter((failure) =>
  heldSymbols.has(failure.split(":")[0]),
);

if (failedHeldSymbols.length > 0) {
  throw new Error(
    `Missing close prices for held symbols:\n${failedHeldSymbols.join("\n")}`,
  );
}

if (failures.length > 0) {
  console.warn(`Skipped non-held symbols:\n${failures.join("\n")}`);
}

const nextPrices = refreshPriceRows(existingPrices, closeBySymbol, heldSymbols);
writeCsvFile(watchlistPricesFile, csvHeaders.prices, nextPrices, options.dryRun);

const equityUpdate = buildEquitySnapshot(positions, closeBySymbol);
if (equityUpdate === null) {
  console.log("Skipped equity snapshot: confirmed positions and cash are not both available.");
} else {
  const existingCurve = readCsvFile(equityCurveFile);
  const nextCurve = upsertByDate(existingCurve, equityUpdate);
  writeCsvFile(equityCurveFile, csvHeaders.equityCurve, nextCurve, options.dryRun);
  console.log(`ok equity ${equityUpdate.date} ${equityUpdate.total_equity}`);
}

if (options.dryRun) {
  console.log("Dry run completed; no files were written.");
}

function parseArgs(args) {
  const parsed = {
    asOf: null,
    dryRun: false,
    help: false,
    lookbackDays: null,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
    } else if (arg === "--dry-run") {
      parsed.dryRun = true;
    } else if (arg === "--as-of") {
      parsed.asOf = args[index + 1] ?? "";
      index += 1;
    } else if (arg.startsWith("--as-of=")) {
      parsed.asOf = arg.slice("--as-of=".length);
    } else if (arg === "--lookback-days") {
      parsed.lookbackDays = args[index + 1] ?? "";
      index += 1;
    } else if (arg.startsWith("--lookback-days=")) {
      parsed.lookbackDays = arg.slice("--lookback-days=".length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`Usage: node scripts/refresh-market-data.mjs [options]

Refresh latest available US daily close prices and, when confirmed holdings
and cash are available, update the portfolio equity curve.

Options:
  --as-of YYYY-MM-DD        Market date upper bound. Defaults to current New York date.
  --lookback-days N         Calendar-day historical lookback when STOOQ_API_KEY is set. Defaults to ${defaultLookbackDays}.
  --dry-run                 Fetch and calculate without writing files.
  --help                    Show this help.
`);
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }

  return null;
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

function readCsvFile(file) {
  const rows = parseCsv(readFileSync(file, "utf8"));
  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });
}

function writeCsvFile(file, headers, records, dryRun) {
  const content = [
    headers.join(","),
    ...records.map((record) =>
      headers.map((header) => csvEscape(record[header] ?? "")).join(","),
    ),
  ].join("\n");
  const nextContent = `${content}\n`;

  if (dryRun) {
    console.log(`dry-run would write ${file}`);
    return;
  }

  writeFileSync(file, nextContent);
}

function csvEscape(value) {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function uniqueSymbols(symbols) {
  const seen = new Set();
  const unique = [];
  for (const symbol of symbols) {
    const normalized = String(symbol ?? "").trim().toUpperCase();
    if (normalized !== "" && !seen.has(normalized)) {
      seen.add(normalized);
      unique.push(normalized);
    }
  }
  return unique;
}

async function fetchLatestClose(symbol, upperDate, days) {
  if (process.env.STOOQ_API_KEY) {
    return fetchHistoricalClose(symbol, upperDate, days, process.env.STOOQ_API_KEY);
  }

  return fetchLatestQuoteClose(symbol, upperDate);
}

async function fetchLatestQuoteClose(symbol, upperDate) {
  const stooqSymbol = stooqSymbolFor(symbol);
  const url = new URL("https://stooq.com/q/l/");
  url.searchParams.set("s", stooqSymbol);
  url.searchParams.set("f", "sd2t2ohlcv");
  url.searchParams.set("h", "");
  url.searchParams.set("e", "csv");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "WineChordInvest/1.0 daily close refresher",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }

  const rows = parseCsv(await response.text());
  const header = rows[0] ?? [];
  const quote = rows[1] ?? [];
  const dateIndex = header.indexOf("Date");
  const closeIndex = header.indexOf("Close");

  if (dateIndex === -1 || closeIndex === -1) {
    throw new Error("Stooq quote response is missing Date or Close columns");
  }

  const date = quote[dateIndex];
  const close = toNumber(quote[closeIndex]);
  if (!isIsoDate(date) || close === null || close <= 0) {
    throw new Error("No latest daily close found in Stooq quote response");
  }
  if (date > upperDate) {
    throw new Error(`Latest close ${date} is after as-of date ${upperDate}`);
  }

  return { close, date };
}

async function fetchHistoricalClose(symbol, upperDate, days, apiKey) {
  const startDate = addDays(upperDate, -days);
  const stooqSymbol = stooqSymbolFor(symbol);
  const url = new URL("https://stooq.com/q/d/l/");
  url.searchParams.set("s", stooqSymbol);
  url.searchParams.set("i", "d");
  url.searchParams.set("d1", compactDate(startDate));
  url.searchParams.set("d2", compactDate(upperDate));
  url.searchParams.set("apikey", apiKey);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "WineChordInvest/1.0 daily close refresher",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }

  const text = await response.text();
  const rows = parseCsv(text);
  const header = rows[0] ?? [];
  const dateIndex = header.indexOf("Date");
  const closeIndex = header.indexOf("Close");

  if (dateIndex === -1 || closeIndex === -1) {
    throw new Error("Stooq historical response is missing Date or Close columns");
  }

  const closes = rows
    .slice(1)
    .map((row) => ({
      close: toNumber(row[closeIndex]),
      date: row[dateIndex],
    }))
    .filter((row) => isIsoDate(row.date) && row.close > 0 && row.date <= upperDate)
    .sort((left, right) => left.date.localeCompare(right.date));

  const latest = closes.at(-1);
  if (latest === undefined) {
    throw new Error(`No daily close found from ${startDate} to ${upperDate}`);
  }

  return latest;
}

function stooqSymbolFor(symbol) {
  return `${symbol.toLowerCase().replaceAll(".", "-")}.us`;
}

function refreshPriceRows(existingRows, snapshots, heldSymbols) {
  const existingSymbols = new Set(existingRows.map((row) => row.symbol));
  const refreshed = existingRows.map((row) => {
    const snapshot = snapshots.get(row.symbol);
    if (snapshot === undefined) {
      return row;
    }

    const nextPrice = formatDecimal(snapshot.close, 4);
    if (row.price_as_of === snapshot.date && row.price === nextPrice) {
      return row;
    }

    return {
      ...row,
      price: nextPrice,
      currency: row.currency || "USD",
      price_as_of: snapshot.date,
      source: priceSource,
      retrieved_at: retrievedAt,
      notes: heldSymbols.has(row.symbol)
        ? "Automated daily close refresh for confirmed holding."
        : "Automated daily close refresh.",
    };
  });

  for (const symbol of heldSymbols) {
    if (existingSymbols.has(symbol)) {
      continue;
    }

    const snapshot = snapshots.get(symbol);
    if (snapshot === undefined) {
      continue;
    }

    refreshed.push({
      symbol,
      price: formatDecimal(snapshot.close, 4),
      currency: "USD",
      price_as_of: snapshot.date,
      source: priceSource,
      retrieved_at: retrievedAt,
      notes: "Automated daily close refresh for confirmed holding.",
    });
  }

  return refreshed;
}

function buildEquitySnapshot(positions, snapshots) {
  if (positions.length === 0) {
    return null;
  }

  const accountState = parseYaml(readFileSync(accountStateFile, "utf8"));
  const cash = toNumber(accountState.confirmed_cash);
  if (cash === null) {
    return null;
  }

  const marketValues = positions.map((position) => {
    const symbol = position.symbol;
    const quantity = toNumber(position.quantity);
    const snapshot = snapshots.get(symbol);
    if (snapshot === undefined) {
      throw new Error(`Missing close snapshot for held symbol ${symbol}`);
    }
    return {
      closeDate: snapshot.date,
      marketValue: quantity * snapshot.close,
      symbol,
    };
  });

  const valuationDate = marketValues
    .map((row) => row.closeDate)
    .sort((left, right) => right.localeCompare(left))[0];
  const totalMarketValue = sum(marketValues.map((row) => row.marketValue));
  const totalEquity = totalMarketValue + cash;
  const cumulativeDeposits = depositsFromLedger();
  const equityCurve = readCsvFile(equityCurveFile);
  const previousPoint = equityCurve
    .filter((row) => row.date !== valuationDate)
    .sort((left, right) => left.date.localeCompare(right.date))
    .at(-1);
  const previousEquity = toNumber(previousPoint?.total_equity);
  const totalReturnPct =
    cumulativeDeposits !== null && cumulativeDeposits > 0
      ? ((totalEquity - cumulativeDeposits) / cumulativeDeposits) * 100
      : null;
  const periodReturnPct =
    previousEquity !== null && previousEquity > 0
      ? ((totalEquity - previousEquity) / previousEquity) * 100
      : null;
  const staleSymbols = marketValues
    .filter((row) => row.closeDate !== valuationDate)
    .map((row) => `${row.symbol}:${row.closeDate}`);
  const notes =
    staleSymbols.length === 0
      ? `Automated daily close valuation from ${priceSource}.`
      : `Automated daily close valuation from ${priceSource}; stale closes ${staleSymbols.join(" ")}.`;

  return {
    date: valuationDate,
    total_market_value: formatDecimal(totalMarketValue, 2),
    cash: formatDecimal(cash, 2),
    total_equity: formatDecimal(totalEquity, 2),
    cumulative_deposits:
      cumulativeDeposits === null ? "" : formatDecimal(cumulativeDeposits, 2),
    total_return_pct:
      totalReturnPct === null ? "" : formatDecimal(totalReturnPct, 4),
    period_return_pct:
      periodReturnPct === null ? "" : formatDecimal(periodReturnPct, 4),
    notes,
  };
}

function depositsFromLedger() {
  const ledger = readCsvFile(ledgerFile);
  const deposits = ledger
    .filter((row) => row.event_type === "deposit")
    .map((row) => Math.abs(toNumber(row.net_cash_effect) ?? 0));
  const total = sum(deposits);
  return total > 0 ? total : null;
}

function upsertByDate(rows, nextRow) {
  const withoutDate = rows.filter((row) => row.date !== nextRow.date);
  return [...withoutDate, nextRow].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  const number = Number(trimmed);
  return Number.isFinite(number) ? number : null;
}

function formatDecimal(value, digits) {
  return value.toFixed(digits).replace(/\.?0+$/, "");
}

function dateInTimeZone(timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(new Date());
  const partByType = new Map(parts.map((part) => [part.type, part.value]));
  return `${partByType.get("year")}-${partByType.get("month")}-${partByType.get("day")}`;
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ""));
}

function addDays(date, days) {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function compactDate(date) {
  return date.replaceAll("-", "");
}
