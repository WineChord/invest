import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";

const accountStateFile = "data/account/state.yml";
const companyMetricsFile = "data/market/company_metrics.csv";
const equityCurveFile = "data/account/equity_curve.csv";
const ledgerFile = "data/account/ledger.csv";
const positionsFile = "data/account/positions.csv";
const priceHistoryFile = "data/market/price_history.csv";
const securityMasterFile = "data/market/security_master.csv";
const technicalSnapshotsFile = "data/market/technical_snapshots.csv";
const watchlistPricesFile = "data/market/watchlist_prices.csv";

const defaultHistoryDays = 5 * 366;
const minHistoryDays = 30;
const maxHistoryDays = 5 * 366;
const marketTimeZone = "America/New_York";
const defaultCurrency = "USD";
const priceHistorySource = "Yahoo Finance chart";
const companyFactsSource = "SEC EDGAR companyfacts";
const userAgent =
  process.env.SEC_USER_AGENT ||
  "WineChordInvest/1.0 (public dashboard market data refresh)";
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
  "WeightedAverageNumberOfDilutedSharesOutstanding",
  "WeightedAverageNumberOfSharesOutstandingBasic",
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

const securityMaster = readCsvFile(securityMasterFile);
const existingCompanyMetrics = readCsvFile(companyMetricsFile);
const existingPriceHistory = readCsvFile(priceHistoryFile);
const existingTechnicalSnapshots = readCsvFile(technicalSnapshotsFile);
const existingPrices = readCsvFile(watchlistPricesFile);
const positions = readCsvFile(positionsFile).filter(
  (row) => toNumber(row.quantity) > 0,
);
const symbols = uniqueSymbols([
  ...securityMaster
    .filter((row) => row.tradability === "tradable")
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
  await buildCompanyMetricRows(symbols, securityBySymbol, historyBySymbol),
  existingCompanyMetrics,
  ["symbol"],
);
writeCsvFile(
  companyMetricsFile,
  csvHeaders.companyMetrics,
  companyMetricRows,
  options.dryRun,
);

const equityUpdate = buildEquitySnapshot(positions, historyBySymbol);
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
    historyDays: null,
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
  --dry-run                 Fetch and calculate without writing files.
  --help                    Show this help.
`);
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

  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from Yahoo chart`);
  }

  const payload = await response.json();
  const error = payload?.chart?.error;
  if (error !== null && error !== undefined) {
    throw new Error(error.description ?? "Yahoo chart error");
  }

  const result = payload?.chart?.result?.[0];
  const timestamps = Array.isArray(result?.timestamp) ? result.timestamp : [];
  const quote = result?.indicators?.quote?.[0] ?? {};
  const adjClose = result?.indicators?.adjclose?.[0]?.adjclose ?? [];

  const rows = timestamps
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
    .sort((left, right) => left.date.localeCompare(right.date));

  if (rows.length === 0) {
    throw new Error(`No daily bars found from ${startDate} to ${upperDate}`);
  }

  return rows;
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

  for (const symbol of heldSymbols) {
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
      notes: "Automated daily close refresh for confirmed holding.",
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

async function buildCompanyMetricRows(symbols, securityBySymbol, historyBySymbol) {
  const rows = [];

  for (const symbol of symbols) {
    const security = securityBySymbol.get(symbol) ?? {};
    const latest = historyBySymbol.get(symbol)?.at(-1);
    if (latest === undefined || security.sec_cik === "") {
      continue;
    }

    try {
      const facts = await fetchCompanyFacts(security.sec_cik);
      rows.push(buildCompanyMetricRow(symbol, latest, facts));
      console.log(`ok metrics ${symbol}`);
    } catch (error) {
      rows.push(emptyCompanyMetricRow(symbol, latest, `Metrics unavailable: ${error.message}`));
      console.warn(`Skipped metrics ${symbol}: ${error.message}`);
    }
  }

  return rows.sort((left, right) => left.symbol.localeCompare(right.symbol));
}

async function fetchCompanyFacts(cik) {
  const normalized = String(cik).padStart(10, "0");
  const url = `https://data.sec.gov/api/xbrl/companyfacts/CIK${normalized}.json`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from SEC companyfacts`);
  }

  return response.json();
}

function buildCompanyMetricRow(symbol, latestPrice, companyFacts) {
  const revenue = trailingTwelveMonthValue(companyFacts, revenueTags);
  const previousRevenue = previousTrailingTwelveMonthValue(companyFacts, revenueTags);
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
  const sharesOutstanding =
    latestInstantValue(companyFacts, sharesOutstandingTags, ["shares"]) ??
    latestPeriodValue(companyFacts, weightedAverageShareTags, ["shares"]);
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
    ? "SEC-derived metrics; market-cap multiples unavailable without shares outstanding."
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
  const facts = factValues(companyFacts, tagCandidates, unitCandidates)
    .filter((fact) => fact.end !== "" && fact.start === "")
    .sort(compareFactsByEndAndFiled);
  return facts.at(-1)?.value ?? null;
}

function latestPeriodValue(companyFacts, tagCandidates, unitCandidates = ["USD"]) {
  const facts = factValues(companyFacts, tagCandidates, unitCandidates)
    .filter((fact) => fact.end !== "")
    .sort(compareFactsByEndAndFiled);
  return facts.at(-1)?.value ?? null;
}

function trailingTwelveMonthValue(companyFacts, tagCandidates) {
  const periodFacts = normalizedPeriodFacts(companyFacts, tagCandidates);
  const quarterly = latestQuarterlyFacts(periodFacts, null);
  if (quarterly.length >= 4) {
    return sum(quarterly.slice(-4).map((fact) => fact.value));
  }

  const annual = periodFacts
    .filter((fact) => fact.fp === "FY" || durationDays(fact) > 300)
    .sort(compareFactsByEndAndFiled);
  return annual.at(-1)?.value ?? quarterly.at(-1)?.value ?? null;
}

function previousTrailingTwelveMonthValue(companyFacts, tagCandidates) {
  const periodFacts = normalizedPeriodFacts(companyFacts, tagCandidates);
  const latestQuarterly = latestQuarterlyFacts(periodFacts, null);
  if (latestQuarterly.length >= 8) {
    return sum(latestQuarterly.slice(-8, -4).map((fact) => fact.value));
  }

  const annual = periodFacts
    .filter((fact) => fact.fp === "FY" || durationDays(fact) > 300)
    .sort(compareFactsByEndAndFiled);
  return annual.length >= 2 ? annual.at(-2).value : null;
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

function latestQuarterlyFacts(periodFacts, endBefore) {
  const quarterlyByEnd = new Map();

  periodFacts
    .filter((fact) => fact.fp !== "FY")
    .filter((fact) => durationDays(fact) <= 115)
    .filter((fact) => endBefore === null || fact.end < endBefore)
    .forEach((fact) => {
      const existing = quarterlyByEnd.get(fact.end);
      if (existing === undefined || compareFactsByEndAndFiled(existing, fact) < 0) {
        quarterlyByEnd.set(fact.end, fact);
      }
    });

  return [...quarterlyByEnd.values()].sort(compareFactsByEndAndFiled);
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
