import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import {
  createFmpClient,
  defaultFmpCacheDir,
  defaultFmpDailyCallBudget,
  defaultFmpMaxCacheAgeDays,
  firstFmpRecord,
} from "./fmp-fetch-lib.mjs";
import { fetchSecJsonWithRetry } from "./sec-fetch-lib.mjs";
import {
  selectFreshShareCountFact,
  selectPreferredInstantFact,
  selectTrailingTwelveMonthPeriod,
} from "./sec-ttm-lib.mjs";
import { filterCompletedDailyBars } from "./market-session-lib.mjs";

const accountStateFile = "data/account/state.yml";
const companyMetricsFile = "data/market/company_metrics.csv";
const equityCurveFile = "data/account/equity_curve.csv";
const ledgerFile = "data/account/ledger.csv";
const positionsFile = "data/account/positions.csv";
const priceHistoryFile = "data/market/price_history.csv";
const securityMasterFile = "data/market/security_master.csv";
const shareCountOverridesFile = "data/market/share-count-overrides.csv";
const technicalSnapshotsFile = "data/market/technical_snapshots.csv";
const watchlistPricesFile = "data/market/watchlist_prices.csv";
const watchlistFile = "research/watchlist.csv";

const defaultHistoryDays = 60 * 366;
const minHistoryDays = 30;
const maxHistoryDays = 60 * 366;
const marketTimeZone = "America/New_York";
const defaultCurrency = "USD";
const priceHistorySource = "Yahoo Finance chart";
const companyFactsSource = "SEC EDGAR companyfacts";
const fmpSource = "Financial Modeling Prep stable API";
const fmpCombinedSource = `${companyFactsSource}; ${fmpSource}`;
const defaultFmpMode = "missing";
const allowedFmpModes = new Set(["off", "missing", "all"]);
const marketDataUserAgent =
  process.env.MARKET_DATA_USER_AGENT ||
  "Mozilla/5.0 (compatible; WineChordInvest/1.0; market data refresh)";
const yahooForbiddenStatus = 403;
const retrievedAt = new Date().toISOString();

const csvHeaders = {
  companyMetrics: [
    "symbol",
    "as_of",
    "source_published_at",
    "retrieved_at",
    "currency",
    "market_cap",
    "enterprise_value",
    "ttm_revenue",
    "revenue_growth_yoy",
    "gross_margin_ttm",
    "operating_margin_ttm",
    "net_income_ttm",
    "cash_and_equivalents",
    "total_debt",
    "shares_outstanding",
    "price_to_sales",
    "enterprise_value_to_sales",
    "pe_ratio",
    "source",
    "notes",
  ],
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
  priceHistory: [
    "symbol",
    "date",
    "open",
    "high",
    "low",
    "close",
    "adj_close",
    "volume",
    "currency",
    "source",
    "retrieved_at",
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
  securityMaster: [
    "symbol",
    "name",
    "exchange",
    "asset_type",
    "tradability",
    "market_data_symbol",
    "sec_cik",
    "tradingview_symbol",
    "tradingview_url",
    "stockanalysis_url",
    "notes",
  ],
  technicalSnapshots: [
    "symbol",
    "as_of",
    "close",
    "one_day_return_pct",
    "one_month_return_pct",
    "three_month_return_pct",
    "ytd_return_pct",
    "one_year_return_pct",
    "fifty_two_week_high",
    "fifty_two_week_low",
    "position_in_52w_range_pct",
    "sma_50",
    "sma_200",
    "rsi_14",
    "volume",
    "average_volume_30d",
    "source",
    "retrieved_at",
    "notes",
  ],
};

const revenueTags = [
  "RevenueFromContractWithCustomerExcludingAssessedTax",
  "Revenues",
  "SalesRevenueNet",
];
const grossProfitTags = ["GrossProfit"];
const operatingIncomeTags = ["OperatingIncomeLoss"];
const netIncomeTags = [
  "NetIncomeLoss",
  "ProfitLoss",
  "NetIncomeLossAvailableToCommonStockholdersBasic",
];
const cashTags = [
  "CashAndCashEquivalentsAtCarryingValue",
  "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents",
  "Cash",
];
const currentDebtTags = [
  "ShortTermBorrowings",
  "ShortTermDebt",
  "LongTermDebtCurrent",
  "DebtCurrent",
  "LongTermDebtAndFinanceLeaseObligationsCurrent",
];
const noncurrentDebtTags = [
  "LongTermDebtNoncurrent",
  "DebtNoncurrent",
  "LongTermDebtAndFinanceLeaseObligationsNoncurrent",
];
const totalDebtTags = [
  "DebtAndFinanceLeaseObligations",
  "LongTermDebtAndFinanceLeaseObligations",
  "LongTermDebt",
];
const sharesOutstandingTags = [
  "EntityCommonStockSharesOutstanding",
  "CommonStocksIncludingAdditionalPaidInCapital",
];
const weightedAverageShareTags = [
  "WeightedAverageNumberOfSharesOutstandingBasic",
  "WeightedAverageNumberOfDilutedSharesOutstanding",
];

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const asOfDate =
  firstNonEmpty(options.asOf, process.env.MARKET_DATA_AS_OF) ??
  dateInTimeZone(marketTimeZone);
const historyDays = Number(
  firstNonEmpty(options.historyDays, process.env.MARKET_DATA_HISTORY_DAYS) ??
    defaultHistoryDays,
);
const fmpMode = normalizedFmpMode(
  firstNonEmpty(options.fmpMode, process.env.FMP_MARKET_DATA_MODE) ??
    defaultFmpMode,
);
const fmpClient = createFmpClient({
  asOfDate,
  cacheDir: firstNonEmpty(options.fmpCacheDir, process.env.FMP_CACHE_DIR) ?? defaultFmpCacheDir,
  dailyCallBudget: nonNegativeIntegerOrDefault(
    firstNonEmpty(options.fmpDailyCallBudget, process.env.FMP_DAILY_CALL_BUDGET),
    defaultFmpDailyCallBudget,
  ),
  enabled: fmpMode !== "off" && (!options.dryRun || options.allowFmpInDryRun),
  maxCacheAgeDays: nonNegativeIntegerOrDefault(
    firstNonEmpty(options.fmpMaxCacheAgeDays, process.env.FMP_MAX_CACHE_AGE_DAYS),
    defaultFmpMaxCacheAgeDays,
  ),
  retrievedAt,
});

if (!isIsoDate(asOfDate)) {
  throw new Error(`Invalid as-of date: ${asOfDate}`);
}

if (
  !Number.isInteger(historyDays) ||
  historyDays < minHistoryDays ||
  historyDays > maxHistoryDays
) {
  throw new Error(
    `History days must be an integer from ${minHistoryDays} to ${maxHistoryDays}`,
  );
}

const watchlistRows = readCsvFile(watchlistFile);
const securityMaster = await syncSecurityMaster(
  readCsvFile(securityMasterFile),
  watchlistRows,
  options.dryRun,
);
const existingCompanyMetrics = readCsvFile(companyMetricsFile);
const existingPriceHistory = readCsvFile(priceHistoryFile);
const existingTechnicalSnapshots = readCsvFile(technicalSnapshotsFile);
const existingPrices = readCsvFile(watchlistPricesFile);
const shareCountOverrides = new Map(
  readCsvFile(shareCountOverridesFile).map((row) => [row.symbol, row]),
);
const positions = readCsvFile(positionsFile).filter(
  (row) => toNumber(row.quantity) > 0,
);
const symbols = uniqueSymbols([
  ...securityMaster
    .filter((row) => row.tradability === "tradable")
    .map((row) => row.symbol),
  ...watchlistRows
    .filter((row) => row.status !== "not_tradable")
    .map((row) => row.symbol),
  ...existingPrices.map((row) => row.symbol),
  ...positions.map((row) => row.symbol),
]);

if (symbols.length === 0) {
  console.log("No tradable symbols found in security master, price snapshots, or positions.");
  process.exit(0);
}

const securityBySymbol = new Map(
  securityMaster.map((row) => [row.symbol, row]),
);
const heldSymbols = new Set(positions.map((row) => row.symbol));
const historyBySymbol = new Map();
const historyFailures = [];

for (const symbol of symbols) {
  try {
    const history = await fetchPriceHistory(symbol, asOfDate, historyDays);
    historyBySymbol.set(symbol, history);
    const latest = history.at(-1);
    console.log(`ok history ${symbol} ${history.length} rows through ${latest.date}`);
  } catch (error) {
    historyFailures.push(`${symbol}: ${error.message}`);
  }
}

const failedHeldSymbols = historyFailures.filter((failure) =>
  heldSymbols.has(failure.split(":")[0]),
);

if (failedHeldSymbols.length > 0) {
  throw new Error(
    `Missing price history for held symbols:\n${failedHeldSymbols.join("\n")}`,
  );
}

if (historyFailures.length > 0) {
  console.warn(`Skipped non-held symbols:\n${historyFailures.join("\n")}`);
}

const priceHistoryRows = preserveRetrievedAt(
  [...historyBySymbol.entries()]
    .flatMap(([symbol, history]) =>
      history.map((point) => ({
        symbol,
        date: point.date,
        open: formatDecimal(point.open, 4),
        high: formatDecimal(point.high, 4),
        low: formatDecimal(point.low, 4),
        close: formatDecimal(point.close, 4),
        adj_close:
          point.adjClose === null ? "" : formatDecimal(point.adjClose, 4),
        volume: point.volume === null ? "" : String(Math.round(point.volume)),
        currency: defaultCurrency,
        source: priceHistorySource,
        retrieved_at: retrievedAt,
      })),
    )
    .sort((left, right) =>
      left.symbol === right.symbol
        ? left.date.localeCompare(right.date)
        : left.symbol.localeCompare(right.symbol),
    ),
  existingPriceHistory,
  ["symbol", "date"],
);

writeCsvFile(
  priceHistoryFile,
  csvHeaders.priceHistory,
  priceHistoryRows,
  options.dryRun,
);

const nextPrices = refreshPriceRows(existingPrices, historyBySymbol, heldSymbols);
writeCsvFile(watchlistPricesFile, csvHeaders.prices, nextPrices, options.dryRun);

const technicalRows = preserveRetrievedAt(
  buildTechnicalSnapshotRows(historyBySymbol),
  existingTechnicalSnapshots,
  ["symbol"],
);
writeCsvFile(
  technicalSnapshotsFile,
  csvHeaders.technicalSnapshots,
  technicalRows,
  options.dryRun,
);

const companyMetricRows = preserveRetrievedAt(
  await buildCompanyMetricRows(symbols, securityBySymbol, historyBySymbol, {
    fmpClient,
    fmpMode,
    shareCountOverrides,
  }),
  existingCompanyMetrics,
  ["symbol"],
);
writeCsvFile(
  companyMetricsFile,
  csvHeaders.companyMetrics,
  companyMetricRows,
  options.dryRun,
);

const equityResult = buildEquitySnapshot(positions, historyBySymbol);
if (equityResult.snapshot === null) {
  console.log(`Skipped equity snapshot: ${equityResult.reason}.`);
} else {
  const equityUpdate = equityResult.snapshot;
  const existingCurve = readCsvFile(equityCurveFile);
  const nextCurve = upsertByDate(existingCurve, equityUpdate);
  writeCsvFile(equityCurveFile, csvHeaders.equityCurve, nextCurve, options.dryRun);
  console.log(`ok equity ${equityUpdate.date} ${equityUpdate.total_equity}`);
}

if (options.dryRun) {
  console.log("Dry run completed; no files were written.");
}
console.log(`FMP summary ${JSON.stringify(fmpClient.summary())}`);

function parseArgs(args) {
  const parsed = {
    asOf: null,
    allowFmpInDryRun: false,
    dryRun: false,
    fmpCacheDir: null,
    fmpDailyCallBudget: null,
    fmpMaxCacheAgeDays: null,
    fmpMode: null,
    help: false,
    historyDays: null,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
    } else if (arg === "--dry-run") {
      parsed.dryRun = true;
    } else if (arg === "--allow-fmp-in-dry-run") {
      parsed.allowFmpInDryRun = true;
    } else if (arg === "--no-fmp") {
      parsed.fmpMode = "off";
    } else if (arg === "--fmp-mode") {
      parsed.fmpMode = args[index + 1] ?? "";
      index += 1;
    } else if (arg.startsWith("--fmp-mode=")) {
      parsed.fmpMode = arg.slice("--fmp-mode=".length);
    } else if (arg === "--fmp-cache-dir") {
      parsed.fmpCacheDir = args[index + 1] ?? "";
      index += 1;
    } else if (arg.startsWith("--fmp-cache-dir=")) {
      parsed.fmpCacheDir = arg.slice("--fmp-cache-dir=".length);
    } else if (arg === "--fmp-daily-call-budget") {
      parsed.fmpDailyCallBudget = args[index + 1] ?? "";
      index += 1;
    } else if (arg.startsWith("--fmp-daily-call-budget=")) {
      parsed.fmpDailyCallBudget = arg.slice("--fmp-daily-call-budget=".length);
    } else if (arg === "--fmp-max-cache-age-days") {
      parsed.fmpMaxCacheAgeDays = args[index + 1] ?? "";
      index += 1;
    } else if (arg.startsWith("--fmp-max-cache-age-days=")) {
      parsed.fmpMaxCacheAgeDays = arg.slice("--fmp-max-cache-age-days=".length);
    } else if (arg === "--as-of") {
      parsed.asOf = args[index + 1] ?? "";
      index += 1;
    } else if (arg.startsWith("--as-of=")) {
      parsed.asOf = arg.slice("--as-of=".length);
    } else if (arg === "--history-days") {
      parsed.historyDays = args[index + 1] ?? "";
      index += 1;
    } else if (arg.startsWith("--history-days=")) {
      parsed.historyDays = arg.slice("--history-days=".length);
    } else if (arg === "--lookback-days") {
      parsed.historyDays = args[index + 1] ?? "";
      index += 1;
    } else if (arg.startsWith("--lookback-days=")) {
      parsed.historyDays = arg.slice("--lookback-days=".length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`Usage: node scripts/refresh-market-data.mjs [options]

Refresh US daily OHLCV history, current close snapshots, technical snapshots,
SEC-derived company metrics, and the equity curve when confirmed account data
is available.

Options:
  --as-of YYYY-MM-DD        Market date upper bound. Defaults to current New York date.
  --history-days N          Calendar-day price-history window. Defaults to ${defaultHistoryDays}.
  --fmp-mode MODE           Optional FMP supplemental fundamentals: off, missing, or all. Defaults to ${defaultFmpMode}.
  --fmp-daily-call-budget N Maximum uncached FMP calls per as-of date. Defaults to ${defaultFmpDailyCallBudget}.
  --fmp-max-cache-age-days N Reuse FMP cache for this many days. Defaults to ${defaultFmpMaxCacheAgeDays}.
  --fmp-cache-dir DIR       Local ignored FMP cache and usage directory. Defaults to ${defaultFmpCacheDir}.
  --allow-fmp-in-dry-run    Permit dry-run to spend FMP API quota and write ignored cache/usage files.
  --no-fmp                  Disable optional FMP calls even when FMP_API_KEY is configured.
  --dry-run                 Fetch and calculate without writing files.
  --help                    Show this help.
`);
}

async function syncSecurityMaster(existingRows, watchlistRows, dryRun) {
  const existingBySymbol = new Map(
    existingRows.map((row) => [row.symbol.toUpperCase(), row]),
  );
  const missingRows = watchlistRows.filter(
    (row) => !existingBySymbol.has(row.symbol.toUpperCase()),
  );

  if (missingRows.length === 0) {
    return existingRows;
  }

  const nextRows = existingRows.slice();
  let secTickerMap = null;

  for (const row of missingRows) {
    const symbol = row.symbol.toUpperCase();
    if (row.status === "not_tradable") {
      nextRows.push(nonTradableSecurityRow(row));
      console.log(`ok security ${symbol} not_tradable`);
      continue;
    }

    secTickerMap ??= await fetchSecTickerMap();
    const metadata = await fetchPublicSecurityMetadata(symbol, secTickerMap);
    nextRows.push(publicSecurityRow(row, metadata));
    console.log(`ok security ${symbol} ${metadata.exchange} ${metadata.secCik}`);
  }

  const sortedRows = nextRows.sort((left, right) =>
    left.symbol.localeCompare(right.symbol),
  );
  writeCsvFile(
    securityMasterFile,
    csvHeaders.securityMaster,
    sortedRows,
    dryRun,
  );
  return sortedRows;
}

function nonTradableSecurityRow(row) {
  return {
    symbol: row.symbol.toUpperCase(),
    name: row.name,
    exchange: "private",
    asset_type: "private_company",
    tradability: "not_tradable",
    market_data_symbol: "",
    sec_cik: "",
    tradingview_symbol: "",
    tradingview_url: "",
    stockanalysis_url: "",
    notes: "Auto-created from watchlist non-tradable status; market refresh skips this symbol.",
  };
}

function publicSecurityRow(watchlistRow, metadata) {
  const symbol = watchlistRow.symbol.toUpperCase();
  const tradingViewSymbol = `${metadata.exchange}:${metadata.marketDataSymbol}`;
  return {
    symbol,
    name: watchlistRow.name || metadata.name,
    exchange: metadata.exchange,
    asset_type: "common_stock",
    tradability: "tradable",
    market_data_symbol: metadata.marketDataSymbol,
    sec_cik: metadata.secCik,
    tradingview_symbol: tradingViewSymbol,
    tradingview_url: `https://www.tradingview.com/symbols/${metadata.exchange}-${metadata.marketDataSymbol}/`,
    stockanalysis_url: `https://stockanalysis.com/stocks/${symbol.toLowerCase()}/`,
    notes: "Auto-created from watchlist using SEC ticker metadata and Yahoo chart availability.",
  };
}

function normalizedFmpMode(value) {
  const mode = String(value ?? "").trim().toLowerCase();
  if (!allowedFmpModes.has(mode)) {
    throw new Error(`FMP mode must be one of: ${[...allowedFmpModes].join(", ")}`);
  }
  return mode;
}

function nonNegativeIntegerOrDefault(value, fallback) {
  const text = String(value ?? "").trim();
  if (text === "") {
    return fallback;
  }
  const parsed = Number(text);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Expected non-negative integer, got ${text}`);
  }
  return parsed;
}

async function fetchPublicSecurityMetadata(symbol, secTickerMap) {
  const secRow = secTickerMap.get(symbol);
  if (secRow === undefined) {
    throw new Error(`Missing SEC ticker metadata for watchlist symbol ${symbol}`);
  }

  const history = await fetchPriceHistory(symbol, asOfDate, minHistoryDays);
  if (history.length === 0) {
    throw new Error(`Missing Yahoo chart data for watchlist symbol ${symbol}`);
  }

  return {
    exchange: normalizeExchange(secRow.exchange),
    marketDataSymbol: symbol,
    name: titleCaseCompanyName(secRow.name),
    secCik: String(secRow.cik).padStart(10, "0"),
  };
}

async function fetchSecTickerMap() {
  const response = await fetchSecJsonWithRetry({
    context: "SEC ticker metadata request failed",
    sourceUrl: "https://www.sec.gov/files/company_tickers_exchange.json",
  });
  const payload = response.json;
  const fields = Array.isArray(payload.fields) ? payload.fields : [];
  const data = Array.isArray(payload.data) ? payload.data : [];
  return new Map(
    data
      .map((row) =>
        Object.fromEntries(fields.map((field, index) => [field, row[index]])),
      )
      .map((row) => [String(row.ticker ?? "").toUpperCase(), row]),
  );
}

function normalizeExchange(exchange) {
  const text = String(exchange ?? "").toLowerCase();
  if (text.includes("nasdaq")) {
    return "NASDAQ";
  }
  if (text.includes("nyse american")) {
    return "AMEX";
  }
  if (text.includes("nyse")) {
    return "NYSE";
  }
  return String(exchange ?? "").toUpperCase().replaceAll(" ", "");
}

function titleCaseCompanyName(name) {
  return String(name ?? "")
    .toLowerCase()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase())
    .replace(/\bInc\b/g, "Inc.")
    .replace(/\bCorp\b/g, "Corp.")
    .replace(/\bLtd\b/g, "Ltd.")
    .replace(/\bLlc\b/g, "LLC")
    .replace(/\bLp\b/g, "LP")
    .replaceAll("..", ".");
}

async function fetchPriceHistory(symbol, upperDate, days) {
  const startDate = addDays(upperDate, -days);
  const period1 = unixSeconds(startDate);
  const period2 = unixSeconds(addDays(upperDate, 1));
  const yahooSymbol = yahooSymbolFor(symbol);
  const url = new URL(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`,
  );
  url.searchParams.set("period1", String(period1));
  url.searchParams.set("period2", String(period2));
  url.searchParams.set("interval", "1d");
  url.searchParams.set("events", "history");
  url.searchParams.set("includeAdjustedClose", "true");

  const payload = await fetchYahooJson(url);
  const error = payload?.chart?.error;
  if (error !== null && error !== undefined) {
    throw new Error(error.description ?? "Yahoo chart error");
  }

  const result = payload?.chart?.result?.[0];
  const timestamps = Array.isArray(result?.timestamp) ? result.timestamp : [];
  const quote = result?.indicators?.quote?.[0] ?? {};
  const adjClose = result?.indicators?.adjclose?.[0]?.adjclose ?? [];

  const rows = filterCompletedDailyBars(
    timestamps
      .map((timestamp, index) => {
        const date = isoDateFromUnixSeconds(timestamp);
        const close = finiteNumber(quote.close?.[index]);
        return {
          adjClose: finiteNumber(adjClose[index]),
          close,
          date,
          high: finiteNumber(quote.high?.[index]),
          low: finiteNumber(quote.low?.[index]),
          open: finiteNumber(quote.open?.[index]),
          volume: finiteNumber(quote.volume?.[index]),
        };
      })
      .filter(
        (row) =>
          isIsoDate(row.date) &&
          row.date <= upperDate &&
          row.close !== null &&
          row.open !== null &&
          row.high !== null &&
          row.low !== null,
      )
      .sort((left, right) => left.date.localeCompare(right.date)),
    {
      currentTradingPeriod: result?.meta?.currentTradingPeriod,
      marketTimeZone,
      now: new Date(retrievedAt),
    },
  );

  if (rows.length === 0) {
    throw new Error(`No daily bars found from ${startDate} to ${upperDate}`);
  }

  return rows;
}

async function fetchYahooJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": marketDataUserAgent,
    },
  });

  if (response.ok) {
    return response.json();
  }

  if (response.status !== yahooForbiddenStatus) {
    throw new Error(`HTTP ${response.status} from Yahoo chart`);
  }

  try {
    const payload = execFileSync(
      "curl",
      ["-fsSL", "-A", marketDataUserAgent, url.toString()],
      { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
    );
    return JSON.parse(payload);
  } catch (error) {
    throw new Error(
      `HTTP ${response.status} from Yahoo chart; curl fallback failed: ${error.message}`,
    );
  }
}

function yahooSymbolFor(symbol) {
  return symbol.replaceAll(".", "-");
}

function refreshPriceRows(existingRows, historyBySymbol, heldSymbols) {
  const existingSymbols = new Set(existingRows.map((row) => row.symbol));
  const refreshed = existingRows.map((row) => {
    const latest = historyBySymbol.get(row.symbol)?.at(-1);
    if (latest === undefined) {
      return row;
    }

    const nextPrice = formatDecimal(latest.close, 4);
    if (row.price_as_of === latest.date && row.price === nextPrice) {
      return row;
    }

    return {
      ...row,
      price: nextPrice,
      currency: row.currency || defaultCurrency,
      price_as_of: latest.date,
      source: priceHistorySource,
      retrieved_at: retrievedAt,
      notes: heldSymbols.has(row.symbol)
        ? "Automated daily close refresh for confirmed holding."
        : "Automated daily close refresh from committed price history.",
    };
  });

  for (const symbol of historyBySymbol.keys()) {
    if (existingSymbols.has(symbol)) {
      continue;
    }

    const latest = historyBySymbol.get(symbol)?.at(-1);
    if (latest === undefined) {
      continue;
    }

    refreshed.push({
      symbol,
      price: formatDecimal(latest.close, 4),
      currency: defaultCurrency,
      price_as_of: latest.date,
      source: priceHistorySource,
      retrieved_at: retrievedAt,
      notes: heldSymbols.has(symbol)
        ? "Automated daily close refresh for confirmed holding."
        : "Automated daily close refresh from committed price history.",
    });
  }

  return refreshed.sort((left, right) => left.symbol.localeCompare(right.symbol));
}

function buildTechnicalSnapshotRows(historyBySymbol) {
  return [...historyBySymbol.entries()]
    .map(([symbol, history]) => buildTechnicalSnapshotRow(symbol, history))
    .filter((row) => row !== null)
    .sort((left, right) => left.symbol.localeCompare(right.symbol));
}

function buildTechnicalSnapshotRow(symbol, history) {
  const latest = history.at(-1);
  if (latest === undefined) {
    return null;
  }

  const closes = history.map((point) => point.close);
  const volumes = history
    .map((point) => point.volume)
    .filter((volume) => volume !== null);
  const yearAgoCutoff = addDays(latest.date, -366);
  const oneYearHistory = history.filter((point) => point.date >= yearAgoCutoff);
  const high52Week = max(oneYearHistory.map((point) => point.high));
  const low52Week = min(oneYearHistory.map((point) => point.low));
  const rangeWidth =
    high52Week !== null && low52Week !== null ? high52Week - low52Week : null;
  const positionInRange =
    rangeWidth !== null && rangeWidth > 0 && low52Week !== null
      ? ((latest.close - low52Week) / rangeWidth) * 100
      : null;

  return {
    symbol,
    as_of: latest.date,
    close: formatDecimal(latest.close, 4),
    one_day_return_pct: formatOptionalDecimal(
      returnSinceIndex(history, history.length - 2),
      4,
    ),
    one_month_return_pct: formatOptionalDecimal(
      returnSinceDate(history, addDays(latest.date, -31)),
      4,
    ),
    three_month_return_pct: formatOptionalDecimal(
      returnSinceDate(history, addDays(latest.date, -92)),
      4,
    ),
    ytd_return_pct: formatOptionalDecimal(
      returnSinceDate(history, `${latest.date.slice(0, 4)}-01-01`),
      4,
    ),
    one_year_return_pct: formatOptionalDecimal(
      returnSinceDate(history, yearAgoCutoff),
      4,
    ),
    fifty_two_week_high: formatOptionalDecimal(high52Week, 4),
    fifty_two_week_low: formatOptionalDecimal(low52Week, 4),
    position_in_52w_range_pct: formatOptionalDecimal(positionInRange, 4),
    sma_50: formatOptionalDecimal(simpleMovingAverage(closes, 50), 4),
    sma_200: formatOptionalDecimal(simpleMovingAverage(closes, 200), 4),
    rsi_14: formatOptionalDecimal(relativeStrengthIndex(closes, 14), 4),
    volume: latest.volume === null ? "" : String(Math.round(latest.volume)),
    average_volume_30d: formatOptionalDecimal(simpleMovingAverage(volumes, 30), 0),
    source: priceHistorySource,
    retrieved_at: retrievedAt,
    notes: "Derived from committed daily OHLCV history.",
  };
}

async function buildCompanyMetricRows(symbols, securityBySymbol, historyBySymbol, {
  fmpClient,
  fmpMode,
  shareCountOverrides,
}) {
  const rows = [];

  for (const symbol of symbols) {
    const security = securityBySymbol.get(symbol) ?? {};
    const latest = historyBySymbol.get(symbol)?.at(-1);
    if (latest === undefined || security.sec_cik === "") {
      continue;
    }

    try {
      const facts = await fetchCompanyFacts(security.sec_cik);
      const row = buildCompanyMetricRow(
        symbol,
        latest,
        facts,
        shareCountOverrides.get(symbol),
      );
      rows.push(await maybeSupplementCompanyMetricRowWithFmp({
        fmpClient,
        fmpMode,
        row,
        symbol,
      }));
      console.log(`ok metrics ${symbol}`);
    } catch (error) {
      const row = emptyCompanyMetricRow(symbol, latest, `Metrics unavailable: ${error.message}`);
      rows.push(await maybeSupplementCompanyMetricRowWithFmp({
        fmpClient,
        fmpMode,
        row,
        symbol,
      }));
      console.warn(`Skipped metrics ${symbol}: ${error.message}`);
    }
  }

  return rows.sort((left, right) => left.symbol.localeCompare(right.symbol));
}

async function fetchCompanyFacts(cik) {
  const normalized = String(cik).padStart(10, "0");
  const url = `https://data.sec.gov/api/xbrl/companyfacts/CIK${normalized}.json`;
  const response = await fetchSecJsonWithRetry({
    context: `SEC companyfacts request failed for CIK${normalized}`,
    sourceUrl: url,
  });
  return response.json;
}

async function maybeSupplementCompanyMetricRowWithFmp({
  fmpClient,
  fmpMode,
  row,
  symbol,
}) {
  if (!shouldFetchFmpSupplement(row, fmpMode)) {
    return row;
  }
  const keyMetricsResult = await fmpClient.getJson({
    endpoint: "key-metrics-ttm",
    params: { symbol },
    symbol,
  });
  if (!keyMetricsResult.ok) {
    return row;
  }
  const ratiosResult = await fmpClient.getJson({
    endpoint: "ratios-ttm",
    params: { symbol },
    symbol,
  });
  const keyMetrics = firstFmpRecord(keyMetricsResult.data);
  const ratios = ratiosResult.ok ? firstFmpRecord(ratiosResult.data) : {};
  const supplemented = supplementMetricFieldsFromFmp({
    keyMetrics,
    ratios,
    row,
  });
  const supplementedFields = changedMetricFields(row, supplemented);
  if (supplementedFields.length === 0) {
    return row;
  }
  return {
    ...supplemented,
    source: row.source === companyFactsSource ? fmpCombinedSource : row.source,
    notes: appendNote(row.notes, `FMP supplemented ${supplementedFields.join("; ")} using cached quota-aware responses.`),
  };
}

function shouldFetchFmpSupplement(row, fmpMode) {
  if (fmpMode === "off") {
    return false;
  }
  if (fmpMode === "all") {
    return true;
  }
  return [
    "market_cap",
    "enterprise_value",
    "ttm_revenue",
    "price_to_sales",
    "enterprise_value_to_sales",
  ].some((field) => String(row[field] ?? "") === "");
}

function supplementMetricFieldsFromFmp({
  keyMetrics,
  ratios,
  row,
}) {
  const marketCap = finiteNumber(keyMetrics.marketCap);
  const enterpriseValue = finiteNumber(keyMetrics.enterpriseValueTTM);
  const evToSales = finiteNumber(keyMetrics.evToSalesTTM);
  const derivedRevenue =
    enterpriseValue !== null && evToSales !== null && evToSales > 0
      ? enterpriseValue / evToSales
      : null;
  const revenue = toNumber(row.ttm_revenue) ?? derivedRevenue;
  const next = {
    ...row,
    market_cap: keepOrFormat(row.market_cap, marketCap, 2),
    enterprise_value: keepOrFormat(row.enterprise_value, enterpriseValue, 2),
    ttm_revenue: keepOrFormat(row.ttm_revenue, derivedRevenue, 2),
    gross_margin_ttm: keepOrFormat(row.gross_margin_ttm, ratioToPercent(ratios.grossProfitMarginTTM), 4),
    operating_margin_ttm: keepOrFormat(row.operating_margin_ttm, ratioToPercent(ratios.operatingProfitMarginTTM), 4),
    price_to_sales: keepOrFormat(
      row.price_to_sales,
      marketCap !== null && revenue !== null && revenue > 0 ? marketCap / revenue : null,
      4,
    ),
    enterprise_value_to_sales: keepOrFormat(row.enterprise_value_to_sales, evToSales, 4),
  };
  const netMargin = ratioToPercent(ratios.netProfitMarginTTM);
  if (String(next.net_income_ttm ?? "") === "" && netMargin !== null && revenue !== null) {
    next.net_income_ttm = formatOptionalDecimal((netMargin / 100) * revenue, 2);
  }
  return next;
}

function keepOrFormat(currentValue, candidate, digits) {
  if (String(currentValue ?? "") !== "") {
    return currentValue;
  }
  return formatOptionalDecimal(candidate, digits);
}

function ratioToPercent(value) {
  const number = finiteNumber(value);
  return number === null ? null : number * 100;
}

function changedMetricFields(before, after) {
  return [
    "market_cap",
    "enterprise_value",
    "ttm_revenue",
    "gross_margin_ttm",
    "operating_margin_ttm",
    "net_income_ttm",
    "price_to_sales",
    "enterprise_value_to_sales",
  ].filter((field) =>
    String(before[field] ?? "") !== String(after[field] ?? "") &&
    String(after[field] ?? "") !== "",
  );
}

function appendNote(existing, note) {
  const base = String(existing ?? "").trim();
  const addition = String(note ?? "").trim();
  if (addition === "") {
    return base;
  }
  if (base === "") {
    return addition;
  }
  return `${base} ${addition}`;
}

function buildCompanyMetricRow(symbol, latestPrice, companyFacts, shareCountOverride) {
  const revenue = trailingTwelveMonthValue(companyFacts, revenueTags, true);
  const previousRevenue = previousTrailingTwelveMonthValue(
    companyFacts,
    revenueTags,
    true,
  );
  const grossProfit = trailingTwelveMonthValue(companyFacts, grossProfitTags);
  const operatingIncome = trailingTwelveMonthValue(companyFacts, operatingIncomeTags);
  const netIncome = trailingTwelveMonthValue(companyFacts, netIncomeTags);
  const cash = latestInstantValue(companyFacts, cashTags);
  const totalDebt =
    latestInstantValue(companyFacts, totalDebtTags) ??
    sumOptional([
      latestInstantValue(companyFacts, currentDebtTags),
      latestInstantValue(companyFacts, noncurrentDebtTags),
    ]);
  const shareCountFact = selectFreshShareCountFact({
    instantFacts: factValues(companyFacts, sharesOutstandingTags, ["shares"]),
    instantTagCandidates: sharesOutstandingTags,
    periodFacts: factValues(companyFacts, weightedAverageShareTags, ["shares"]),
    periodTagCandidates: weightedAverageShareTags,
  });
  const overrideShares = toNumber(shareCountOverride?.shares_outstanding);
  const overrideAsOf = String(shareCountOverride?.as_of ?? "");
  const useShareCountOverride =
    overrideShares !== null &&
    overrideShares >= 100_000 &&
    isIsoDate(overrideAsOf) &&
    (shareCountFact === null || overrideAsOf >= shareCountFact.end);
  const reportedSharesOutstanding = useShareCountOverride
    ? overrideShares
    : shareCountFact?.value ?? null;
  // SEC companyfacts for newly listed foreign issuers occasionally exposes a
  // nominal one-share value under a nonstandard tag. Treat values below a
  // conservative public-company plausibility floor as unavailable instead of
  // publishing a one-share market capitalization and meaningless multiples.
  const sharesOutstanding =
    reportedSharesOutstanding !== null && reportedSharesOutstanding >= 100_000
      ? reportedSharesOutstanding
      : null;
  const marketCap =
    sharesOutstanding === null ? null : latestPrice.close * sharesOutstanding;
  const enterpriseValue =
    marketCap === null ? null : marketCap + (totalDebt ?? 0) - (cash ?? 0);
  const revenueGrowth =
    revenue !== null && previousRevenue !== null && previousRevenue > 0
      ? ((revenue - previousRevenue) / previousRevenue) * 100
      : null;
  const grossMargin =
    revenue !== null && revenue > 0 && grossProfit !== null
      ? (grossProfit / revenue) * 100
      : null;
  const operatingMargin =
    revenue !== null && revenue > 0 && operatingIncome !== null
      ? (operatingIncome / revenue) * 100
      : null;
  const priceToSales =
    marketCap !== null && revenue !== null && revenue > 0 ? marketCap / revenue : null;
  const evToSales =
    enterpriseValue !== null && revenue !== null && revenue > 0
      ? enterpriseValue / revenue
      : null;
  const peRatio =
    marketCap !== null && netIncome !== null && netIncome > 0
      ? marketCap / netIncome
      : null;
  const publishedAt = latestFiledDate(companyFacts) ?? latestPrice.date;
  const notes = sharesOutstanding === null
    ? reportedSharesOutstanding !== null
      ? "SEC-derived metrics; market-cap multiples unavailable because reported shares outstanding failed the plausibility check."
      : "SEC-derived metrics; market-cap multiples unavailable without shares outstanding."
    : useShareCountOverride
      ? `SEC-derived fundamentals combined with latest committed close price; shares outstanding use a filing-cover override dated ${overrideAsOf} because companyfacts lacks a current instant fact.`
    : shareCountFact?.basis === "period_average_fallback"
      ? "SEC-derived fundamentals combined with latest committed close price; newer basic weighted-average shares replace a stale instant share-count tag."
      : "SEC-derived fundamentals combined with latest committed close price.";

  return {
    symbol,
    as_of: latestPrice.date,
    source_published_at: publishedAt,
    retrieved_at: retrievedAt,
    currency: defaultCurrency,
    market_cap: formatOptionalDecimal(marketCap, 2),
    enterprise_value: formatOptionalDecimal(enterpriseValue, 2),
    ttm_revenue: formatOptionalDecimal(revenue, 2),
    revenue_growth_yoy: formatOptionalDecimal(revenueGrowth, 4),
    gross_margin_ttm: formatOptionalDecimal(grossMargin, 4),
    operating_margin_ttm: formatOptionalDecimal(operatingMargin, 4),
    net_income_ttm: formatOptionalDecimal(netIncome, 2),
    cash_and_equivalents: formatOptionalDecimal(cash, 2),
    total_debt: formatOptionalDecimal(totalDebt, 2),
    shares_outstanding: formatOptionalDecimal(sharesOutstanding, 0),
    price_to_sales: formatOptionalDecimal(priceToSales, 4),
    enterprise_value_to_sales: formatOptionalDecimal(evToSales, 4),
    pe_ratio: formatOptionalDecimal(peRatio, 4),
    source: companyFactsSource,
    notes,
  };
}

function emptyCompanyMetricRow(symbol, latestPrice, notes) {
  return {
    symbol,
    as_of: latestPrice.date,
    source_published_at: latestPrice.date,
    retrieved_at: retrievedAt,
    currency: defaultCurrency,
    market_cap: "",
    enterprise_value: "",
    ttm_revenue: "",
    revenue_growth_yoy: "",
    gross_margin_ttm: "",
    operating_margin_ttm: "",
    net_income_ttm: "",
    cash_and_equivalents: "",
    total_debt: "",
    shares_outstanding: "",
    price_to_sales: "",
    enterprise_value_to_sales: "",
    pe_ratio: "",
    source: companyFactsSource,
    notes,
  };
}

function factValues(companyFacts, tagCandidates, unitCandidates = ["USD"]) {
  const factsByTaxonomy = Object.values(companyFacts?.facts ?? {});
  const rows = [];

  for (const taxonomyFacts of factsByTaxonomy) {
    for (const tag of tagCandidates) {
      const units = taxonomyFacts?.[tag]?.units ?? {};
      for (const unit of unitCandidates) {
        const values = units[unit];
        if (!Array.isArray(values)) {
          continue;
        }
        values.forEach((fact) => {
          const value = finiteNumber(fact.val);
          if (value === null) {
            return;
          }
          rows.push({
            accn: fact.accn ?? "",
            end: fact.end ?? "",
            filed: fact.filed ?? "",
            form: fact.form ?? "",
            frame: fact.frame ?? "",
            fp: fact.fp ?? "",
            start: fact.start ?? "",
            tag,
            unit,
            value,
          });
        });
      }
    }
  }

  return rows;
}

function latestInstantValue(companyFacts, tagCandidates, unitCandidates = ["USD"]) {
  const facts = factValues(companyFacts, tagCandidates, unitCandidates);
  return selectPreferredInstantFact(facts, tagCandidates)?.value ?? null;
}

function latestPeriodValue(companyFacts, tagCandidates, unitCandidates = ["USD"]) {
  const facts = factValues(companyFacts, tagCandidates, unitCandidates)
    .filter((fact) => fact.end !== "")
    .sort(compareFactsByEndAndFiled);
  return facts.at(-1)?.value ?? null;
}

function trailingTwelveMonthValue(
  companyFacts,
  tagCandidates,
  preferLargest = false,
) {
  const periodFacts = normalizedPeriodFacts(companyFacts, tagCandidates);
  return selectTrailingTwelveMonthPeriod(periodFacts, {
    preferLargest,
  })?.value ?? null;
}

function previousTrailingTwelveMonthValue(
  companyFacts,
  tagCandidates,
  preferLargest = false,
) {
  const periodFacts = normalizedPeriodFacts(companyFacts, tagCandidates);
  const latest = selectTrailingTwelveMonthPeriod(periodFacts, {
    preferLargest,
  });
  if (latest === null) {
    return null;
  }
  return selectTrailingTwelveMonthPeriod(periodFacts, {
    endBefore: addDays(latest.end, -300),
    preferLargest,
  })?.value ?? null;
}

function normalizedPeriodFacts(companyFacts, tagCandidates) {
  const seen = new Set();
  return factValues(companyFacts, tagCandidates)
    .filter((fact) => fact.start !== "" && fact.end !== "")
    .filter((fact) => {
      const duration = durationDays(fact);
      return duration >= 70 && duration <= 380;
    })
    .sort(compareFactsByEndAndFiled)
    .filter((fact) => {
      const key = `${fact.tag}:${fact.start}:${fact.end}:${fact.value}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function latestFiledDate(companyFacts) {
  const filed = [];
  for (const taxonomyFacts of Object.values(companyFacts?.facts ?? {})) {
    for (const factDefinition of Object.values(taxonomyFacts ?? {})) {
      for (const values of Object.values(factDefinition?.units ?? {})) {
        if (Array.isArray(values)) {
          values.forEach((fact) => {
            if (isIsoDate(fact.filed)) {
              filed.push(fact.filed);
            }
          });
        }
      }
    }
  }
  return filed.sort().at(-1) ?? null;
}

function compareFactsByEndAndFiled(left, right) {
  const endOrder = left.end.localeCompare(right.end);
  if (endOrder !== 0) {
    return endOrder;
  }
  return left.filed.localeCompare(right.filed);
}

function durationDays(fact) {
  if (!isIsoDate(fact.start) || !isIsoDate(fact.end)) {
    return 0;
  }
  return Math.round(
    (Date.parse(`${fact.end}T00:00:00Z`) -
      Date.parse(`${fact.start}T00:00:00Z`)) /
      (24 * 60 * 60 * 1000),
  );
}

function buildEquitySnapshot(positions, historyBySymbol) {
  if (positions.length === 0) {
    return {
      reason: "no confirmed positions are available",
      snapshot: null,
    };
  }

  const accountState = parseYaml(readFileSync(accountStateFile, "utf8"));
  const marketValues = positions.map((position) => {
    const symbol = position.symbol;
    const quantity = toNumber(position.quantity);
    const latest = historyBySymbol.get(symbol)?.at(-1);
    if (latest === undefined) {
      throw new Error(`Missing close snapshot for held symbol ${symbol}`);
    }
    return {
      closeDate: latest.date,
      marketValue: quantity * latest.close,
      symbol,
    };
  });

  const valuationDate = marketValues
    .map((row) => row.closeDate)
    .sort((left, right) => right.localeCompare(left))[0];
  if (isIsoDate(accountState.as_of) && accountState.as_of > valuationDate) {
    return {
      reason: `confirmed account state ${accountState.as_of} is newer than latest market close ${valuationDate}`,
      snapshot: null,
    };
  }

  const cash = toNumber(accountState.confirmed_cash);
  if (cash === null) {
    return {
      reason: "confirmed cash is unavailable",
      snapshot: null,
    };
  }

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
      ? `Automated daily close valuation from ${priceHistorySource}.`
      : `Automated daily close valuation from ${priceHistorySource}; stale closes ${staleSymbols.join(" ")}.`;

  return {
    reason: null,
    snapshot: {
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
    },
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

function returnSinceIndex(history, index) {
  if (index < 0 || index >= history.length) {
    return null;
  }
  return returnFromBase(history[index].close, history.at(-1).close);
}

function returnSinceDate(history, date) {
  const base = nearestPointAtOrBefore(history, date);
  const latest = history.at(-1);
  if (base === null || latest === undefined) {
    return null;
  }
  return returnFromBase(base.close, latest.close);
}

function returnFromBase(base, latest) {
  return base > 0 ? ((latest - base) / base) * 100 : null;
}

function nearestPointAtOrBefore(history, date) {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index].date <= date) {
      return history[index];
    }
  }
  return history[0] ?? null;
}

function simpleMovingAverage(values, days) {
  const sample = values.slice(-days).filter((value) => value !== null);
  if (sample.length < days) {
    return null;
  }
  return sum(sample) / sample.length;
}

function relativeStrengthIndex(values, period) {
  if (values.length <= period) {
    return null;
  }

  const changes = values.slice(1).map((value, index) => value - values[index]);
  const sample = changes.slice(-period);
  const gains = sample.map((change) => Math.max(change, 0));
  const losses = sample.map((change) => Math.max(-change, 0));
  const averageGain = sum(gains) / period;
  const averageLoss = sum(losses) / period;
  if (averageLoss === 0) {
    return 100;
  }
  const relativeStrength = averageGain / averageLoss;
  return 100 - 100 / (1 + relativeStrength);
}

function readCsvFile(file) {
  if (!existsSync(file)) {
    return [];
  }

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

function preserveRetrievedAt(nextRows, existingRows, keyFields) {
  const existingByKey = new Map(
    existingRows.map((row) => [rowKey(row, keyFields), row]),
  );

  return nextRows.map((nextRow) => {
    const existing = existingByKey.get(rowKey(nextRow, keyFields));
    if (existing === undefined || existing.retrieved_at === "") {
      return nextRow;
    }
    if (!sameExceptRetrievedAt(nextRow, existing)) {
      return nextRow;
    }
    return {
      ...nextRow,
      retrieved_at: existing.retrieved_at,
    };
  });
}

function rowKey(row, keyFields) {
  return keyFields.map((field) => row[field] ?? "").join("\u0000");
}

function sameExceptRetrievedAt(left, right) {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  keys.delete("retrieved_at");
  for (const key of keys) {
    if (String(left[key] ?? "") !== String(right[key] ?? "")) {
      return false;
    }
  }
  return true;
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

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }

  return null;
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

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function sumOptional(values) {
  const present = values.filter((value) => value !== null);
  return present.length === 0 ? null : sum(present);
}

function min(values) {
  const present = values.filter((value) => value !== null);
  return present.length === 0 ? null : Math.min(...present);
}

function max(values) {
  const present = values.filter((value) => value !== null);
  return present.length === 0 ? null : Math.max(...present);
}

function formatDecimal(value, digits) {
  return Number(value).toFixed(digits);
}

function formatOptionalDecimal(value, digits) {
  return value === null || !Number.isFinite(value) ? "" : formatDecimal(value, digits);
}

function upsertByDate(rows, nextRow) {
  const withoutDate = rows.filter((row) => row.date !== nextRow.date);
  return [...withoutDate, nextRow].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function dateInTimeZone(timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(new Date());
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

function addDays(date, days) {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  const next = new Date(timestamp + days * 24 * 60 * 60 * 1000);
  return next.toISOString().slice(0, 10);
}

function unixSeconds(date) {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 1000);
}

function isoDateFromUnixSeconds(seconds) {
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}
