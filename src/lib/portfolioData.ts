import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

export interface AccountState {
  schemaVersion: number;
  asOf: string;
  status: string;
  baseCurrency: string;
  confirmedCash: number | null;
  settledCash: number | null;
  buyingPower: number | null;
  positionsCount: number;
  lastConfirmedLedgerEventId: string | null;
  lastReconciledWithBrokerAt: string | null;
}

export interface LedgerEvent {
  eventId: string;
  eventType: string;
  status: string;
  broker: string;
  accountAlias: string;
  confirmationId: string;
  tradeDate: string;
  settlementDate: string;
  symbol: string;
  side: string;
  quantity: number | null;
  averagePrice: number | null;
  fees: number | null;
  grossAmount: number | null;
  netCashEffect: number | null;
  currency: string;
  source: string;
  createdAt: string;
  notes: string;
}

export interface PositionRecord {
  symbol: string;
  assetType: string;
  exchange: string;
  quantity: number;
  averageCost: number | null;
  costBasis: number | null;
  currency: string;
  firstTradeDate: string;
  lastTradeDate: string;
  notes: string;
}

export interface EquityPoint {
  date: string;
  totalMarketValue: number | null;
  cash: number | null;
  totalEquity: number;
  cumulativeDeposits: number | null;
  totalReturnPct: number | null;
  periodReturnPct: number | null;
  notes: string;
}

export interface PriceSnapshot {
  symbol: string;
  price: number;
  currency: string;
  priceAsOf: string;
  source: string;
  retrievedAt: string;
  notes: string;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  theme: string;
  priority: string;
  status: string;
  initialRole: string;
  latestBaselineDate: string;
  nextReviewTrigger: string;
  notes: string;
  price: number | null;
  priceAsOf: string | null;
  analysisHistory: ResearchAnalysisEntry[];
}

export interface ResearchAnalysisEntry {
  id: string;
  symbol: string;
  analyzedAt: string;
  analysisType: string;
  policyVersion: string;
  title: string;
  stance: string;
  summary: string;
  upsidePath: string;
  riskWatch: string;
  nextCheck: string;
  sourcePath: string;
}

export interface PortfolioData {
  generatedAt: string;
  policyVersion: string;
  repositoryUrl: string;
  publicUrl: string;
  accountState: AccountState;
  ledger: LedgerEvent[];
  positions: PositionRecord[];
  equityCurve: EquityPoint[];
  watchlist: WatchlistItem[];
  prices: PriceSnapshot[];
  researchAnalysis: ResearchAnalysisEntry[];
}

const repositoryRoot = process.cwd();
const policyVersion = "v1.0";
const repositoryUrl = "https://github.com/WineChord/invest";
const publicUrl = "https://www.wineandchord.com/invest/";

function readRequiredFile(relativePath: string): string {
  const absolutePath = path.join(repositoryRoot, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
  return readFileSync(absolutePath, "utf8");
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
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

function readCsv(relativePath: string): Record<string, string>[] {
  const rows = parseCsv(readRequiredFile(relativePath));
  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });
}

function toNumber(value: unknown): number | null {
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

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value);
  return text === "" ? null : text;
}

function readAccountState(): AccountState {
  const state = parseYaml(readRequiredFile("data/account/state.yml")) as Record<string, unknown>;
  return {
    schemaVersion: Number(state.schema_version ?? 1),
    asOf: String(state.as_of ?? ""),
    status: String(state.status ?? ""),
    baseCurrency: String(state.base_currency ?? "USD"),
    confirmedCash: toNumber(state.confirmed_cash),
    settledCash: toNumber(state.settled_cash),
    buyingPower: toNumber(state.buying_power),
    positionsCount: Number(state.positions_count ?? 0),
    lastConfirmedLedgerEventId: toStringOrNull(state.last_confirmed_ledger_event_id),
    lastReconciledWithBrokerAt: toStringOrNull(state.last_reconciled_with_broker_at),
  };
}

function readLedger(): LedgerEvent[] {
  return readCsv("data/account/ledger.csv").map((row) => ({
    eventId: row.event_id,
    eventType: row.event_type,
    status: row.status,
    broker: row.broker,
    accountAlias: row.account_alias,
    confirmationId: row.confirmation_id,
    tradeDate: row.trade_date,
    settlementDate: row.settlement_date,
    symbol: row.symbol,
    side: row.side,
    quantity: toNumber(row.quantity),
    averagePrice: toNumber(row.average_price),
    fees: toNumber(row.fees),
    grossAmount: toNumber(row.gross_amount),
    netCashEffect: toNumber(row.net_cash_effect),
    currency: row.currency,
    source: row.source,
    createdAt: row.created_at,
    notes: row.notes,
  }));
}

function readPositions(): PositionRecord[] {
  return readCsv("data/account/positions.csv").map((row) => ({
    symbol: row.symbol,
    assetType: row.asset_type,
    exchange: row.exchange,
    quantity: toNumber(row.quantity) ?? 0,
    averageCost: toNumber(row.average_cost),
    costBasis: toNumber(row.cost_basis),
    currency: row.currency,
    firstTradeDate: row.first_trade_date,
    lastTradeDate: row.last_trade_date,
    notes: row.notes,
  }));
}

function readEquityCurve(): EquityPoint[] {
  return readCsv("data/account/equity_curve.csv").map((row) => ({
    date: row.date,
    totalMarketValue: toNumber(row.total_market_value),
    cash: toNumber(row.cash),
    totalEquity: toNumber(row.total_equity) ?? 0,
    cumulativeDeposits: toNumber(row.cumulative_deposits),
    totalReturnPct: toNumber(row.total_return_pct),
    periodReturnPct: toNumber(row.period_return_pct),
    notes: row.notes,
  }));
}

function readPrices(): PriceSnapshot[] {
  return readCsv("data/market/watchlist_prices.csv").map((row) => ({
    symbol: row.symbol,
    price: toNumber(row.price) ?? 0,
    currency: row.currency,
    priceAsOf: row.price_as_of,
    source: row.source,
    retrievedAt: row.retrieved_at,
    notes: row.notes,
  }));
}

function readResearchAnalysis(): ResearchAnalysisEntry[] {
  const parsed = parseYaml(readRequiredFile("research/company-analysis.yml")) as Record<string, unknown>;
  const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
  return entries
    .map((entry) => {
      const row = entry as Record<string, unknown>;
      return {
        id: String(row.id ?? ""),
        symbol: String(row.symbol ?? ""),
        analyzedAt: String(row.analyzed_at ?? ""),
        analysisType: String(row.analysis_type ?? ""),
        policyVersion: String(row.policy_version ?? ""),
        title: String(row.title ?? ""),
        stance: String(row.stance ?? ""),
        summary: String(row.summary ?? ""),
        upsidePath: String(row.upside_path ?? ""),
        riskWatch: String(row.risk_watch ?? ""),
        nextCheck: String(row.next_check ?? ""),
        sourcePath: String(row.source_path ?? ""),
      };
    })
    .filter((entry) => entry.id !== "" && entry.symbol !== "");
}

function readWatchlist(
  prices: PriceSnapshot[],
  researchAnalysis: ResearchAnalysisEntry[],
): WatchlistItem[] {
  const priceBySymbol = new Map(prices.map((price) => [price.symbol, price]));
  const analysisBySymbol = new Map<string, ResearchAnalysisEntry[]>();
  researchAnalysis.forEach((entry) => {
    const history = analysisBySymbol.get(entry.symbol) ?? [];
    history.push(entry);
    analysisBySymbol.set(entry.symbol, history);
  });

  analysisBySymbol.forEach((history) => {
    history.sort((left, right) => right.analyzedAt.localeCompare(left.analyzedAt));
  });

  return readCsv("research/watchlist.csv").map((row) => {
    const price = priceBySymbol.get(row.symbol);
    return {
      symbol: row.symbol,
      name: row.name,
      theme: row.theme,
      priority: row.priority,
      status: row.status,
      initialRole: row.initial_role,
      latestBaselineDate: row.latest_baseline_date,
      nextReviewTrigger: row.next_review_trigger,
      notes: row.notes,
      price: price?.price ?? null,
      priceAsOf: price?.priceAsOf ?? null,
      analysisHistory: analysisBySymbol.get(row.symbol) ?? [],
    };
  });
}

export function loadPortfolioData(): PortfolioData {
  const prices = readPrices();
  const researchAnalysis = readResearchAnalysis();
  return {
    generatedAt: new Date().toISOString(),
    policyVersion,
    repositoryUrl,
    publicUrl,
    accountState: readAccountState(),
    ledger: readLedger(),
    positions: readPositions(),
    equityCurve: readEquityCurve(),
    watchlist: readWatchlist(prices, researchAnalysis),
    prices,
    researchAnalysis,
  };
}
