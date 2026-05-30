import {
  Activity,
  BarChart3,
  BookOpen,
  Database,
  ExternalLink,
  Github,
  History,
  LineChart,
  ListChecks,
  Palette,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  SquareArrowOutUpRight,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type {
  IChartApi,
  MouseEventParams,
  SeriesMarker,
  Time,
} from "lightweight-charts";
import type {
  CSSProperties,
  FocusEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  EquityPoint,
  LedgerEvent,
  PortfolioData,
  PositionRecord,
  PriceHistoryPoint,
  ResearchAnalysisEntry,
  WatchlistItem,
} from "../lib/portfolioData";
import {
  liveIntradayTradingViewCaption,
  liveIntradayTradingViewConfig,
} from "../lib/tradingView";
import {
  buildSymbolTradeMarkers,
  buildTradeMarkers,
  buildTradeSeriesMarkers,
  type TradeMarker,
} from "../lib/tradeMarkers";

interface Props {
  data: PortfolioData;
}

interface Metrics {
  totalEquity: number | null;
  cash: number | null;
  investedCapital: number | null;
  totalReturnPct: number | null;
  sharpe: number | null;
  maxDrawdownPct: number | null;
  positionsCount: number;
  operationsCount: number;
}

type DashboardMode = "real" | "demo";
type MarketColorScheme = "mainland" | "western";
type MovementDisplayMode = "percent" | "dollar";
type SparklineWindowKey = "1M" | "3M" | "6M" | "1Y" | "ALL" | "CUSTOM";
type ValueTone = "gain" | "loss" | "neutral";

interface ChartPoint {
  date: string;
  totalEquity: number;
  cumulativeDeposits: number | null;
  totalReturnPct: number | null;
  periodReturnPct: number | null;
}

interface StockChartPoint {
  date: string;
  close: number;
}

interface CrosshairDetail {
  date: string;
  left: number;
  top: number;
  placement: "left" | "right";
  totalEquity: number;
  cumulativeDeposits: number | null;
  totalReturnPct: number | null;
  periodReturnPct: number | null;
  marker: TradeMarker | null;
}

interface AccountStatusDisplay {
  badge: string;
  description: string;
  label: string;
  tone: "safe" | "warning" | "neutral";
}

interface LogoTrendPalette {
  start: string;
  mid: string;
  end: string;
  glow: string;
}

interface WatchPreviewState {
  left: number;
  symbol: string;
  top: number;
}

type ChartRange =
  | "1D"
  | "5D"
  | "1M"
  | "3M"
  | "6M"
  | "YTD"
  | "1Y"
  | "3Y"
  | "5Y"
  | "ALL";

interface PriceMovement {
  amount: number;
  percent: number;
}

interface SparklineWindowOption {
  key: Exclude<SparklineWindowKey, "CUSTOM">;
  label: string;
  sessions: number | null;
}

const WATCH_PREVIEW_MEDIA_QUERY =
  "(hover: hover) and (pointer: fine) and (min-width: 761px)";
const WATCH_PREVIEW_WIDTH = 380;
const WATCH_PREVIEW_HEIGHT = 220;
const WATCH_PREVIEW_GAP = 12;
const WATCH_PREVIEW_MARGIN = 12;
const sparklineSessionMin = 5;
const sparklineSessionMax = 756;
const defaultSparklineWindow: SparklineWindowKey = "3M";
const defaultCustomSparklineSessions = 80;
const sparklineWindowOptions: SparklineWindowOption[] = [
  { key: "1M", label: "1M", sessions: 21 },
  { key: "3M", label: "3M", sessions: 63 },
  { key: "6M", label: "6M", sessions: 126 },
  { key: "1Y", label: "1Y", sessions: 252 },
  { key: "ALL", label: "ALL", sessions: null },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 2,
  style: "currency",
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

const largeCurrencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 1,
  notation: "compact",
  style: "currency",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
  style: "percent",
});

const marketColorStorageKey = "winechord-invest-market-colors";
const defaultMarketColorScheme: MarketColorScheme = "mainland";
const chartRangeOptions: ChartRange[] = [
  "1M",
  "3M",
  "6M",
  "YTD",
  "1Y",
  "3Y",
  "5Y",
  "ALL",
];
const stockChartRangeOptions: ChartRange[] = [
  "1D",
  "5D",
  ...chartRangeOptions,
];
const compactPriceChartMinBarSpacing = 0.05;
const chartVisibleLeftPadding = 1.05;
const chartVisibleRightPadding = 0.25;
const chartAttributionUrl =
  "https://www.tradingview.com/?utm_source=winechord-invest";
const watchStatusLabels: Record<string, string> = {
  active_candidate: "Active candidate",
  active_core_candidate: "Core candidate",
  frozen: "Frozen",
  not_tradable: "Not tradable",
  probation: "Probation",
  removed: "Removed",
  research_only: "Research only",
  watch: "Watch",
  watch_future: "Future watch",
};
const watchPriorityLabels: Record<string, string> = {
  watch_future: "Future",
};

function readInitialMarketColorScheme(): MarketColorScheme {
  if (typeof window === "undefined") {
    return defaultMarketColorScheme;
  }

  try {
    const stored = window.localStorage.getItem(marketColorStorageKey);
    return stored === "western" || stored === "mainland"
      ? stored
      : defaultMarketColorScheme;
  } catch {
    return defaultMarketColorScheme;
  }
}

function persistMarketColorScheme(scheme: MarketColorScheme): void {
  try {
    window.localStorage.setItem(marketColorStorageKey, scheme);
  } catch {
    // The preference is cosmetic, so blocked browser storage should not break the dashboard.
  }
}

function clampSparklineSessions(value: number): number {
  return Math.min(
    Math.max(Math.round(value), sparklineSessionMin),
    sparklineSessionMax,
  );
}

function sessionsForSparklineWindow(
  windowKey: SparklineWindowKey,
  customSessions: number,
): number | null {
  if (windowKey === "CUSTOM") {
    return clampSparklineSessions(customSessions);
  }

  return (
    sparklineWindowOptions.find((option) => option.key === windowKey)
      ?.sessions ?? null
  );
}

function formatCurrency(value: number | null): string {
  return value === null
    ? "Pending confirmation"
    : currencyFormatter.format(value);
}

function formatCompactCurrency(value: number | null): string {
  return value === null ? "Pending" : compactCurrencyFormatter.format(value);
}

function formatLargeCurrency(value: number | null): string {
  return value === null ? "N/A" : largeCurrencyFormatter.format(value);
}

function formatPercent(value: number | null): string {
  return value === null
    ? "Not enough data"
    : percentFormatter.format(value / 100);
}

function formatSignedPercent(value: number | null): string {
  if (value === null) {
    return "Not enough data";
  }

  const formatted = percentFormatter.format(Math.abs(value) / 100);
  return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted;
}

function formatSignedCurrency(value: number | null): string {
  if (value === null) {
    return "Pending";
  }

  const formatted = currencyFormatter.format(Math.abs(value));
  return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted;
}

function formatNumber(value: number | null, digits = 2): string {
  if (value === null) {
    return "Not enough data";
  }
  return value.toFixed(digits);
}

function formatRatio(value: number | null): string {
  return value === null ? "N/M" : `${value.toFixed(value >= 100 ? 0 : 1)}x`;
}

function formatMetricPercent(value: number | null): string {
  return value === null ? "N/A" : formatSignedPercent(value);
}

function formatMovement(
  movement: PriceMovement | null,
  mode: MovementDisplayMode,
): string {
  if (movement === null) {
    return "N/A";
  }
  return mode === "percent"
    ? formatSignedPercent(movement.percent)
    : formatSignedCurrency(movement.amount);
}

function formatPlainPercent(value: number | null): string {
  return value === null ? "N/A" : percentFormatter.format(value / 100);
}

function toneForSignedValue(value: number | null): ValueTone {
  if (value === null || value === 0) {
    return "neutral";
  }
  return value > 0 ? "gain" : "loss";
}

function oppositeMarketColorScheme(
  scheme: MarketColorScheme,
): MarketColorScheme {
  return scheme === "mainland" ? "western" : "mainland";
}

function marketColorButtonLabel(scheme: MarketColorScheme): string {
  return scheme === "mainland" ? "CN colors" : "US colors";
}

function marketColorDescription(scheme: MarketColorScheme): string {
  return scheme === "mainland"
    ? "Gains red, losses green"
    : "Gains green, losses red";
}

function buildDemoData(realData: PortfolioData): PortfolioData {
  const demoPositions: PositionRecord[] = [
    {
      symbol: "ASTS",
      assetType: "common_stock",
      exchange: "NASDAQ",
      quantity: 10,
      averageCost: 74,
      costBasis: 740,
      currency: "USD",
      firstTradeDate: "2026-01-08",
      lastTradeDate: "2026-04-09",
      notes: "demo direct-to-device satellite position",
    },
    {
      symbol: "RKLB",
      assetType: "common_stock",
      exchange: "NASDAQ",
      quantity: 8,
      averageCost: 90,
      costBasis: 720,
      currency: "USD",
      firstTradeDate: "2026-01-08",
      lastTradeDate: "2026-03-07",
      notes: "demo space infrastructure position",
    },
    {
      symbol: "CRDO",
      assetType: "common_stock",
      exchange: "NASDAQ",
      quantity: 5,
      averageCost: 150,
      costBasis: 750,
      currency: "USD",
      firstTradeDate: "2026-02-06",
      lastTradeDate: "2026-05-08",
      notes: "demo AI connectivity position",
    },
    {
      symbol: "LUNR",
      assetType: "common_stock",
      exchange: "NASDAQ",
      quantity: 20,
      averageCost: 45,
      costBasis: 900,
      currency: "USD",
      firstTradeDate: "2026-03-07",
      lastTradeDate: "2026-03-07",
      notes: "demo lunar infrastructure position",
    },
    {
      symbol: "RDW",
      assetType: "common_stock",
      exchange: "NYSE",
      quantity: 25,
      averageCost: 12,
      costBasis: 300,
      currency: "USD",
      firstTradeDate: "2026-04-09",
      lastTradeDate: "2026-05-20",
      notes: "demo space defense position",
    },
  ];

  const demoLedger: LedgerEvent[] = [
    demoLedgerEvent(
      "demo-001",
      "deposit",
      "",
      "",
      null,
      null,
      888,
      "2026-01-05",
      "Initial demo contribution",
    ),
    demoLedgerEvent(
      "demo-002",
      "trade",
      "RKLB",
      "buy",
      4,
      72,
      -288,
      "2026-01-08",
      "Buy Rocket Lab",
    ),
    demoLedgerEvent(
      "demo-003",
      "trade",
      "ASTS",
      "buy",
      5,
      58,
      -290,
      "2026-01-08",
      "Buy AST SpaceMobile",
    ),
    demoLedgerEvent(
      "demo-004",
      "deposit",
      "",
      "",
      null,
      null,
      888,
      "2026-02-05",
      "Second demo contribution",
    ),
    demoLedgerEvent(
      "demo-005",
      "trade",
      "CRDO",
      "buy",
      3,
      132,
      -396,
      "2026-02-06",
      "Buy Credo",
    ),
    demoLedgerEvent(
      "demo-006",
      "deposit",
      "",
      "",
      null,
      null,
      888,
      "2026-03-05",
      "Third demo contribution",
    ),
    demoLedgerEvent(
      "demo-007",
      "trade",
      "RKLB",
      "buy",
      4,
      108,
      -432,
      "2026-03-07",
      "Add Rocket Lab",
    ),
    demoLedgerEvent(
      "demo-008",
      "trade",
      "LUNR",
      "buy",
      20,
      45,
      -900,
      "2026-03-07",
      "Buy Intuitive Machines",
    ),
    demoLedgerEvent(
      "demo-009",
      "deposit",
      "",
      "",
      null,
      null,
      888,
      "2026-04-05",
      "Fourth demo contribution",
    ),
    demoLedgerEvent(
      "demo-010",
      "trade",
      "ASTS",
      "buy",
      5,
      90,
      -450,
      "2026-04-09",
      "Add AST SpaceMobile",
    ),
    demoLedgerEvent(
      "demo-011",
      "trade",
      "RDW",
      "buy",
      30,
      12,
      -360,
      "2026-04-09",
      "Buy Redwire",
    ),
    demoLedgerEvent(
      "demo-012",
      "deposit",
      "",
      "",
      null,
      null,
      888,
      "2026-05-05",
      "Fifth demo contribution",
    ),
    demoLedgerEvent(
      "demo-013",
      "trade",
      "CRDO",
      "buy",
      2,
      177,
      -354,
      "2026-05-08",
      "Add Credo",
    ),
    demoLedgerEvent(
      "demo-014",
      "trade",
      "RDW",
      "sell",
      5,
      17,
      85,
      "2026-05-20",
      "Trim Redwire after a fast move",
    ),
  ];

  return {
    ...realData,
    accountState: {
      ...realData.accountState,
      asOf: "2026-05-22",
      status: "demo_mode_not_accounting_truth",
      confirmedCash: 368.37,
      settledCash: 368.37,
      buyingPower: 368.37,
      positionsCount: demoPositions.length,
      lastConfirmedLedgerEventId: "demo-014",
      lastReconciledWithBrokerAt: "2026-05-22",
    },
    ledger: demoLedger,
    positions: demoPositions,
    equityCurve: [
      demoPoint("2026-01-08", 888, 888, 0, 0),
      demoPoint("2026-01-31", 902, 888, 1.58, 1.58),
      demoPoint("2026-02-06", 1768, 1776, -0.45, -0.62),
      demoPoint("2026-02-28", 1798, 1776, 1.24, 0.92),
      demoPoint("2026-03-07", 2650, 2664, -0.53, -1.4),
      demoPoint("2026-03-31", 2740, 2664, 2.85, -2.6),
      demoPoint("2026-04-09", 3515, 3552, -1.04, -0.85),
      demoPoint("2026-04-30", 3725, 3552, 4.87, 1.94),
      demoPoint("2026-05-08", 4490, 4440, 1.13, 2.18),
      demoPoint("2026-05-20", 4625, 4440, 4.17, 1.05),
      demoPoint("2026-05-22", 4810, 4440, 8.33, 5.29),
    ],
  };
}

function demoLedgerEvent(
  eventId: string,
  eventType: string,
  symbol: string,
  side: string,
  quantity: number | null,
  averagePrice: number | null,
  netCashEffect: number,
  date: string,
  notes: string,
): LedgerEvent {
  return {
    eventId,
    eventType,
    status: "confirmed_demo",
    broker: "demo",
    accountAlias: "demo",
    confirmationId: eventId,
    tradeDate: date,
    settlementDate: date,
    symbol,
    side,
    quantity,
    averagePrice,
    fees: 0,
    grossAmount: Math.abs(netCashEffect),
    netCashEffect,
    currency: "USD",
    source: "browser_demo",
    createdAt: date,
    notes,
  };
}

function demoPoint(
  date: string,
  equity: number,
  deposits: number,
  totalReturnPct: number,
  periodReturnPct: number,
): EquityPoint {
  return {
    date,
    totalMarketValue: equity,
    cash: null,
    totalEquity: equity,
    cumulativeDeposits: deposits,
    totalReturnPct,
    periodReturnPct,
    notes: "demo point",
  };
}

function priceForSymbol(data: PortfolioData, symbol: string): number | null {
  return data.prices.find((price) => price.symbol === symbol)?.price ?? null;
}

function marketValueForPosition(
  data: PortfolioData,
  position: PositionRecord,
): number | null {
  const price = priceForSymbol(data, position.symbol);
  return price === null ? position.costBasis : position.quantity * price;
}

function costBasisForPosition(position: PositionRecord): number | null {
  if (position.costBasis !== null) {
    return position.costBasis;
  }
  if (position.averageCost !== null) {
    return position.averageCost * position.quantity;
  }
  return null;
}

function calculateMetrics(data: PortfolioData): Metrics {
  const cash = data.accountState.confirmedCash;
  const marketValue = data.positions.reduce((sum, position) => {
    const value = marketValueForPosition(data, position);
    return sum + (value ?? 0);
  }, 0);
  const totalEquity =
    data.equityCurve.at(-1)?.totalEquity ??
    (cash === null && data.positions.length === 0
      ? null
      : (cash ?? 0) + marketValue);
  const investedCapital =
    data.equityCurve.at(-1)?.cumulativeDeposits ??
    depositsFromLedger(data.ledger);
  const totalReturnPct =
    data.equityCurve.at(-1)?.totalReturnPct ??
    (totalEquity !== null && investedCapital !== null && investedCapital > 0
      ? ((totalEquity - investedCapital) / investedCapital) * 100
      : null);

  return {
    totalEquity,
    cash,
    investedCapital,
    totalReturnPct,
    sharpe: annualizedSharpe(data.equityCurve),
    maxDrawdownPct: maxDrawdown(data.equityCurve),
    positionsCount: data.positions.length,
    operationsCount: data.ledger.length,
  };
}

function depositsFromLedger(events: LedgerEvent[]): number | null {
  const deposits = events
    .filter((event) => event.eventType === "deposit")
    .reduce((sum, event) => sum + Math.abs(event.netCashEffect ?? 0), 0);
  return deposits > 0 ? deposits : null;
}

function annualizedSharpe(points: EquityPoint[]): number | null {
  const returns = points
    .map((point) => point.periodReturnPct)
    .filter((value): value is number => value !== null);
  if (returns.length < 2) {
    return null;
  }

  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance =
    returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    (returns.length - 1);
  const standardDeviation = Math.sqrt(variance);
  return standardDeviation === 0
    ? null
    : (mean / standardDeviation) * Math.sqrt(12);
}

function maxDrawdown(points: EquityPoint[]): number | null {
  if (points.length < 2) {
    return null;
  }

  const returnObservations = points
    .map((point) => point.periodReturnPct)
    .filter((value): value is number => value !== null);
  if (returnObservations.length >= 2) {
    let nav = 1;
    let peak = 1;
    let worst = 0;
    returnObservations.forEach((periodReturnPct) => {
      nav *= 1 + periodReturnPct / 100;
      peak = Math.max(peak, nav);
      const drawdown = peak === 0 ? 0 : ((nav - peak) / peak) * 100;
      worst = Math.min(worst, drawdown);
    });
    return Math.abs(worst);
  }

  let peak = points[0].totalEquity;
  let worst = 0;
  points.forEach((point) => {
    peak = Math.max(peak, point.totalEquity);
    const drawdown = peak === 0 ? 0 : ((point.totalEquity - peak) / peak) * 100;
    worst = Math.min(worst, drawdown);
  });

  return Math.abs(worst);
}

export default function InvestDashboard({ data }: Props) {
  const [mode, setMode] = useState<DashboardMode>("real");
  const [marketColorScheme, setMarketColorScheme] = useState<MarketColorScheme>(
    defaultMarketColorScheme,
  );
  const [marketColorPreferenceLoaded, setMarketColorPreferenceLoaded] =
    useState(false);
  const activeData = useMemo(
    () => (mode === "demo" ? buildDemoData(data) : data),
    [data, mode],
  );
  const metrics = useMemo(() => calculateMetrics(activeData), [activeData]);
  const isDemo = mode === "demo";
  const accountStatus = accountStatusDisplayFor(activeData, isDemo);
  const nextMarketColorScheme = oppositeMarketColorScheme(marketColorScheme);

  useEffect(() => {
    setMarketColorScheme(readInitialMarketColorScheme());
    setMarketColorPreferenceLoaded(true);
  }, []);

  useEffect(() => {
    if (!marketColorPreferenceLoaded) {
      return;
    }
    persistMarketColorScheme(marketColorScheme);
  }, [marketColorPreferenceLoaded, marketColorScheme]);

  useEffect(() => {
    updateFaviconForMarketColorScheme(marketColorScheme);
  }, [marketColorScheme]);

  return (
    <div className="invest-shell" data-market-colors={marketColorScheme}>
      <header className="invest-topbar">
        <a
          className="brand"
          href={activeData.publicUrl}
          aria-label="WineChord Invest home"
        >
          <BrandLogo marketColorScheme={marketColorScheme} />
          <span>
            <strong>WineChord Invest</strong>
            <small>Satellite Portfolio</small>
          </span>
        </a>
        <nav className="topbar-actions" aria-label="Dashboard actions">
          <a
            className="icon-link"
            href={activeData.repositoryUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Github size={18} />
            <span>Open source</span>
          </a>
          <button
            className="mode-button preference-button"
            type="button"
            onClick={() => setMarketColorScheme(nextMarketColorScheme)}
            aria-label={`Market color convention: ${marketColorDescription(marketColorScheme)}. Switch to ${marketColorDescription(nextMarketColorScheme)}.`}
          >
            <Palette size={17} />
            <span>{marketColorButtonLabel(marketColorScheme)}</span>
          </button>
          <button
            className={
              isDemo ? "mode-button" : "mode-button mode-button-active"
            }
            type="button"
            onClick={() => setMode("real")}
          >
            <RefreshCcw size={17} />
            <span>Real data</span>
          </button>
          <button
            className={
              isDemo ? "mode-button mode-button-active" : "mode-button"
            }
            type="button"
            onClick={() => setMode("demo")}
          >
            <Sparkles size={17} />
            <span>Demo data</span>
          </button>
        </nav>
      </header>

      <main className="dashboard">
        <section className="hero-band">
          <div>
            <p className="eyebrow">Policy {activeData.policyVersion}</p>
            <h1>Satellite Portfolio Dashboard</h1>
            <p className="hero-copy">
              Confirmed account records and research state come from the
              repository. Demo data exists only in the browser to test charts,
              operation flow, and metrics.
            </p>
          </div>
          <div className="status-stack">
            <StatusPill
              icon={<Palette size={16} />}
              label={marketColorDescription(marketColorScheme)}
              tone="neutral"
            />
            <StatusPill
              icon={<ShieldCheck size={16} />}
              label={isDemo ? "Demo only" : "Confirmed ledger"}
              tone={isDemo ? "warning" : "safe"}
            />
            <StatusPill
              icon={<Database size={16} />}
              label={`Snapshot ${activeData.accountState.asOf || "pending"}`}
              tone="neutral"
            />
          </div>
        </section>

        <section className="metric-grid" aria-label="Portfolio summary">
          <MetricCard
            icon={<Wallet size={20} />}
            label="Total equity"
            value={formatCompactCurrency(metrics.totalEquity)}
          />
          <MetricCard
            icon={<TrendingUp size={20} />}
            label="Total return"
            tone={toneForSignedValue(metrics.totalReturnPct)}
            value={formatSignedPercent(metrics.totalReturnPct)}
          />
          <MetricCard
            icon={<Activity size={20} />}
            label="Sharpe"
            value={formatNumber(metrics.sharpe)}
          />
          <MetricCard
            icon={<BarChart3 size={20} />}
            label="Max drawdown"
            tone={metrics.maxDrawdownPct === null ? "neutral" : "loss"}
            value={formatPercent(metrics.maxDrawdownPct)}
          />
          <MetricCard
            icon={<ListChecks size={20} />}
            label="Confirmed operations"
            value={`${metrics.operationsCount}`}
          />
          <MetricCard
            icon={<LineChart size={20} />}
            label="Positions"
            value={`${metrics.positionsCount}`}
          />
        </section>

        <section className="dashboard-grid">
          <Panel
            title="Equity curve"
            eyebrow={isDemo ? "browser demo" : "confirmed data"}
          >
            <EquityChart
              points={activeData.equityCurve}
              events={activeData.ledger}
              marketColorScheme={marketColorScheme}
            />
          </Panel>

          <Panel title="Account balance" eyebrow="cash and capital">
            <div className="balance-list">
              <BalanceRow
                label="Confirmed cash"
                value={formatCurrency(metrics.cash)}
              />
              <BalanceRow
                label="Cumulative deposits"
                value={formatCurrency(metrics.investedCapital)}
              />
              <BalanceRow
                label="Total equity"
                value={formatCurrency(metrics.totalEquity)}
              />
              <AccountStatusCard status={accountStatus} />
            </div>
          </Panel>
        </section>

        <section className="dashboard-grid dashboard-grid-wide-left">
          <Panel
            title="Holdings"
            eyebrow={isDemo ? "simulated positions" : "confirmed positions"}
          >
            <HoldingsTable data={activeData} />
          </Panel>

          <Panel title="Operation history" eyebrow="append-only ledger">
            <OperationsList events={activeData.ledger} />
          </Panel>
        </section>

        <Panel title="Research universe" eyebrow="active universe">
          <WatchlistTable
            events={activeData.ledger}
            items={activeData.watchlist}
            marketColorScheme={marketColorScheme}
            repositoryUrl={activeData.repositoryUrl}
          />
        </Panel>
      </main>
    </div>
  );
}

function updateFaviconForMarketColorScheme(scheme: MarketColorScheme): void {
  if (typeof document === "undefined") {
    return;
  }

  const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (icon === null) {
    return;
  }

  const fileName =
    scheme === "mainland" ? "favicon-cn.svg" : "favicon-western.svg";
  icon.href = new URL(fileName, icon.href).toString();
}

function logoTrendPalette(scheme: MarketColorScheme): LogoTrendPalette {
  if (scheme === "western") {
    return {
      end: "#f7fff3",
      glow: "#5ee4cb",
      mid: "#b9ffe4",
      start: "#25c49b",
    };
  }

  return {
    end: "#fff5ee",
    glow: "#ff6b5b",
    mid: "#ffb09b",
    start: "#d83a2e",
  };
}

function BrandLogo({
  marketColorScheme,
}: {
  marketColorScheme: MarketColorScheme;
}) {
  const trend = logoTrendPalette(marketColorScheme);

  return (
    <svg
      aria-hidden="true"
      className="brand-mark"
      focusable="false"
      viewBox="0 0 48 48"
    >
      <defs>
        <linearGradient id="brand-bg" x1="6" x2="43" y1="4" y2="44">
          <stop offset="0" stopColor="#17201d" />
          <stop offset="0.62" stopColor="#09110f" />
          <stop offset="1" stopColor="#030706" />
        </linearGradient>
        <linearGradient id="brand-w" x1="11" x2="37" y1="16" y2="34">
          <stop offset="0" stopColor={trend.start} />
          <stop offset="0.55" stopColor={trend.mid} />
          <stop offset="1" stopColor={trend.end} />
        </linearGradient>
        <linearGradient id="brand-orbit" x1="7" x2="42" y1="35" y2="16">
          <stop offset="0" stopColor="#8c7a5f" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#f8e6ae" />
          <stop offset="1" stopColor="#c5a46f" />
        </linearGradient>
      </defs>
      <rect
        fill="url(#brand-bg)"
        height="44"
        rx="12"
        stroke="rgba(255,255,255,0.14)"
        width="44"
        x="2"
        y="2"
      />
      <path
        d="M11.5 16.5 18.7 35 24 22.2 29.5 35 36.5 13.5"
        fill="none"
        stroke="url(#brand-w)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5.2"
      />
      <path
        d="M33.3 14.2 37 12.6l-.6 4"
        fill="none"
        stroke={trend.end}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <circle cx="36.4" cy="13.5" fill={trend.glow} opacity="0.95" r="1.35" />
      <path
        d="M7.2 34.1c7.1 5.8 25.7 1.4 34.2-13.7"
        fill="none"
        stroke="url(#brand-orbit)"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
      <path
        d="M35.4 13.6 41.1 8.8l-1.6 7.3"
        fill="none"
        stroke="#f8e6ae"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.55"
      />
      <g fill="#f8e6ae" transform="rotate(37 38.1 12.1)">
        <rect height="3.4" rx="0.7" width="5.2" x="35.5" y="10.4" />
        <rect height="1.3" rx="0.45" width="4.2" x="31.4" y="11.45" />
        <rect height="1.3" rx="0.45" width="4.2" x="40.6" y="11.45" />
      </g>
      <path
        d="M13.4 10.2 14.7 13l2.9 1.2-2.9 1.3-1.3 2.8-1.2-2.8-2.9-1.3 2.9-1.2Z"
        fill="#fff0bf"
      />
      <circle cx="24.8" cy="11.2" fill="#9dd6cd" opacity="0.9" r="1.25" />
      <circle cx="38.4" cy="31.8" fill="#9dd6cd" opacity="0.78" r="1.1" />
    </svg>
  );
}

function StatusPill({
  icon,
  label,
  tone,
}: {
  icon: ReactNode;
  label: string;
  tone: "safe" | "warning" | "neutral";
}) {
  return (
    <span className={`status-pill status-pill-${tone}`}>
      {icon}
      {label}
    </span>
  );
}

function MetricCard({
  icon,
  label,
  tone = "neutral",
  value,
}: {
  icon: ReactNode;
  label: string;
  tone?: ValueTone;
  value: string;
}) {
  return (
    <article className={`metric-card metric-card-${tone}`}>
      <div className="metric-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <p>{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function BalanceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="balance-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AccountStatusCard({ status }: { status: AccountStatusDisplay }) {
  return (
    <div className="account-status-card">
      <div>
        <span>Data state</span>
        <strong>{status.label}</strong>
        <small>{status.description}</small>
      </div>
      <span
        className={`account-status-badge account-status-badge-${status.tone}`}
      >
        {status.badge}
      </span>
    </div>
  );
}

function accountStatusDisplayFor(
  data: PortfolioData,
  isDemo: boolean,
): AccountStatusDisplay {
  if (isDemo) {
    return {
      badge: "Demo",
      description:
        "Browser-only fixture data. Confirmed account files are unchanged.",
      label: "Demo mode",
      tone: "warning",
    };
  }

  if (data.accountState.status === "initialized_empty_unconfirmed") {
    return {
      badge: "Pending",
      description:
        "No broker-confirmed cash or holdings have been recorded yet.",
      label: "Awaiting first confirmation",
      tone: "neutral",
    };
  }

  return {
    badge: "Confirmed",
    description:
      "Displayed balances come from committed account records and derived files.",
    label: readableStatusLabel(data.accountState.status),
    tone: "safe",
  };
}

function readableStatusLabel(status: string): string {
  return status
    .split("_")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function EquityChart({
  points,
  events,
  marketColorScheme,
}: {
  points: EquityPoint[];
  events: LedgerEvent[];
  marketColorScheme: MarketColorScheme;
}) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartApiRef = useRef<IChartApi | null>(null);
  const activeRangeRef = useRef<ChartRange>("ALL");
  const [chartReady, setChartReady] = useState(false);
  const [crosshairDetail, setCrosshairDetail] =
    useState<CrosshairDetail | null>(null);
  const [selectedTradeMarkerId, setSelectedTradeMarkerId] = useState<
    string | null
  >(null);
  const [activeRange, setActiveRange] = useState<ChartRange>("ALL");
  const hasEquityCurve = points.length >= 2;
  const hasSingleSnapshot = points.length === 1;
  const chartPoints = useMemo(() => buildChartPoints(points), [points]);
  const firstPoint = chartPoints[0] ?? null;
  const lastPoint = chartPoints.at(-1) ?? null;
  const chartReturnPct =
    firstPoint === null || lastPoint === null
      ? null
      : chartReturnForPoints(firstPoint, lastPoint);
  const visibleChartPoints = useMemo(
    () => chartPoints.slice(firstVisibleIndexForRange(chartPoints, activeRange)),
    [activeRange, chartPoints],
  );
  const visibleFirstPoint = visibleChartPoints[0] ?? firstPoint;
  const visibleLastPoint = visibleChartPoints.at(-1) ?? lastPoint;
  const rangeReturnPct =
    visibleChartPoints.length < 2 ||
    visibleFirstPoint === null ||
    visibleLastPoint === null
      ? chartReturnPct
      : rangeReturnForPoints(visibleChartPoints);
  const chartTone = toneForSignedValue(rangeReturnPct);
  const depositReferencePoints = useMemo(
    () =>
      chartPoints
        .filter(
          (point): point is ChartPoint & { cumulativeDeposits: number } =>
            point.cumulativeDeposits !== null,
        )
        .map((point) => ({
          time: point.date as Time,
          value: point.cumulativeDeposits,
        })),
    [chartPoints],
  );
  const hasDepositReference = depositReferencePoints.length >= 2;
  const pointByDate = useMemo(
    () => new Map(chartPoints.map((point) => [point.date, point])),
    [chartPoints],
  );
  const markers = useMemo(
    () => buildTradeMarkers(events),
    [events],
  );
  const plottedMarkers = useMemo(
    () => markers.filter((marker) => pointByDate.has(marker.date)),
    [markers, pointByDate],
  );
  const markerById = useMemo(
    () => new Map(markers.map((marker) => [marker.id, marker])),
    [markers],
  );
  const markerByDate = useMemo(
    () => new Map(markers.map((marker) => [marker.date, marker])),
    [markers],
  );
  const selectedTradeMarker =
    selectedTradeMarkerId === null
      ? null
      : (markerById.get(selectedTradeMarkerId) ?? null);
  const plottedVisibleTradeDayCount =
    visibleFirstPoint === null || visibleLastPoint === null
      ? 0
      : plottedMarkers.filter(
          (marker) =>
            marker.date >= visibleFirstPoint.date &&
            marker.date <= visibleLastPoint.date,
        ).length;

  useEffect(() => {
    activeRangeRef.current = activeRange;
    if (chartApiRef.current !== null) {
      applyChartRange(chartApiRef.current, chartPoints, activeRange);
    }
  }, [activeRange, chartPoints]);

  useEffect(() => {
    setSelectedTradeMarkerId((currentMarkerId) =>
      currentMarkerId !== null && markerById.has(currentMarkerId)
        ? currentMarkerId
        : null,
    );
  }, [markerById]);

  useEffect(() => {
    if (!hasEquityCurve) {
      chartApiRef.current = null;
      setChartReady(false);
      setCrosshairDetail(null);
      return;
    }

    const container = chartContainerRef.current;
    if (container === null) {
      return;
    }

    let disposed = false;
    let cleanupChart: (() => void) | null = null;
    setChartReady(false);
    setCrosshairDetail(null);
    container.replaceChildren();

    void import("lightweight-charts").then(
      ({
        AreaSeries,
        ColorType,
        CrosshairMode,
        LineSeries,
        LineStyle,
        createChart,
        createSeriesMarkers,
      }) => {
        if (disposed) {
          return;
        }

        const chartColors = readChartColors(container, chartTone);
        const chart = createChart(container, {
          autoSize: true,
          height: 360,
          layout: {
            attributionLogo: false,
            background: {
              color: chartColors.background,
              type: ColorType.Solid,
            },
            fontFamily:
              "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
            textColor: chartColors.muted,
          },
          grid: {
            horzLines: { color: chartColors.grid },
            vertLines: { color: chartColors.grid },
          },
          rightPriceScale: {
            autoScale: true,
            borderColor: chartColors.border,
            scaleMargins: {
              bottom: 0.14,
              top: 0.16,
            },
            visible: true,
          },
          timeScale: {
            borderColor: chartColors.border,
            fixLeftEdge: true,
            fixRightEdge: false,
            lockVisibleTimeRangeOnResize: true,
            rightOffset: 2,
            secondsVisible: false,
            timeVisible: false,
          },
          crosshair: {
            mode: CrosshairMode.Magnet,
            horzLine: {
              color: chartColors.crosshair,
              labelBackgroundColor: chartColors.ink,
              style: LineStyle.Dashed,
              width: 1,
            },
            vertLine: {
              color: chartColors.crosshair,
              labelBackgroundColor: chartColors.ink,
              style: LineStyle.Dashed,
              width: 1,
            },
          },
          handleScroll: {
            horzTouchDrag: true,
            mouseWheel: true,
            pressedMouseMove: true,
            vertTouchDrag: false,
          },
          handleScale: {
            axisDoubleClickReset: true,
            axisPressedMouseMove: true,
            mouseWheel: true,
            pinch: true,
          },
          localization: {
            locale: "en-US",
            priceFormatter: (value: number) =>
              compactCurrencyFormatter.format(value),
          },
        });

        const areaSeries = chart.addSeries(AreaSeries, {
          bottomColor: transparentize(chartColors.tone, 0),
          crosshairMarkerBorderColor: chartColors.surface,
          crosshairMarkerBorderWidth: 2,
          crosshairMarkerRadius: 5,
          crosshairMarkerVisible: true,
          crosshairMarkerBackgroundColor: chartColors.tone,
          lastValueVisible: true,
          lineColor: chartColors.tone,
          lineWidth: 3,
          priceFormat: {
            minMove: 0.01,
            precision: 2,
            type: "price",
          },
          priceLineColor: chartColors.tone,
          priceLineStyle: LineStyle.Dotted,
          priceLineVisible: true,
          topColor: transparentize(chartColors.tone, 0.22),
        });

        areaSeries.setData(
          chartPoints.map((point) => ({
            time: point.date as Time,
            value: point.totalEquity,
          })),
        );

        if (hasDepositReference) {
          const depositSeries = chart.addSeries(LineSeries, {
            color: chartColors.deposit,
            crosshairMarkerVisible: false,
            lastValueVisible: false,
            lineStyle: LineStyle.Dashed,
            lineWidth: 1,
            priceLineVisible: false,
          });
          depositSeries.setData(depositReferencePoints);
        }

        createSeriesMarkers(
          areaSeries,
          buildTradeSeriesMarkers(plottedMarkers, chartColors),
          {
            autoScale: false,
          },
        );

        const detailFromParams = (params: MouseEventParams<Time>) =>
          buildCrosshairDetail({
            markerByDate,
            markerById,
            params,
            pointByDate,
            seriesData: params.seriesData.get(areaSeries),
            viewportHeight: container.clientHeight,
            viewportWidth: container.clientWidth,
          });

        const handleCrosshairMove = (params: MouseEventParams<Time>) => {
          setCrosshairDetail(detailFromParams(params));
        };

        const handleClick = (params: MouseEventParams<Time>) => {
          const detail = detailFromParams(params);
          if (detail !== null) {
            setCrosshairDetail(detail);
          }

          const marker = markerFromParams(params, markerByDate, markerById);
          if (marker !== null) {
            setSelectedTradeMarkerId(marker.id);
          }
        };

        chartApiRef.current = chart;
        const applyCurrentRange = () =>
          applyChartRange(chart, chartPoints, activeRangeRef.current);
        applyCurrentRange();
        const rangeFrame = window.requestAnimationFrame(applyCurrentRange);
        const rangeTimer = window.setTimeout(applyCurrentRange, 160);

        chart.subscribeCrosshairMove(handleCrosshairMove);
        chart.subscribeClick(handleClick);
        setChartReady(true);

        cleanupChart = () => {
          window.cancelAnimationFrame(rangeFrame);
          window.clearTimeout(rangeTimer);
          chart.unsubscribeCrosshairMove(handleCrosshairMove);
          chart.unsubscribeClick(handleClick);
          if (chartApiRef.current === chart) {
            chartApiRef.current = null;
          }
          chart.remove();
        };
      },
    ).catch((error: unknown) => {
      if (!disposed) {
        console.error("Failed to render equity chart", error);
      }
    });

    return () => {
      disposed = true;
      cleanupChart?.();
      container.replaceChildren();
    };
  }, [
    chartPoints,
    chartTone,
    depositReferencePoints,
    hasDepositReference,
    hasEquityCurve,
    markerByDate,
    markerById,
    markers,
    marketColorScheme,
    plottedMarkers,
    pointByDate,
  ]);

  if (!hasEquityCurve || firstPoint === null || lastPoint === null) {
    return (
      <div className="empty-chart">
        <LineChart size={40} />
        <strong>
          {hasSingleSnapshot
            ? "First valuation snapshot recorded"
            : "Waiting for the first equity curve"}
        </strong>
        <span>
          {hasSingleSnapshot
            ? "A full curve needs at least two dated valuation snapshots."
            : "After confirmed deposits and executions, the real curve will appear here."}
        </span>
      </div>
    );
  }

  return (
    <div className={`chart-wrap chart-wrap-${chartTone}`}>
      <div className="chart-canvas-shell">
        <p className="sr-only" id="equity-chart-description">
          Portfolio equity curve from {firstPoint.date} to {lastPoint.date}.
          Latest equity is {formatCurrency(lastPoint.totalEquity)} and total
          return is {formatSignedPercent(chartReturnPct)}.
        </p>
        <div className="chart-control-layer">
          <div className="chart-summary" aria-label="Equity curve summary">
            <div className="chart-summary-main">
              <span className="chart-summary-title">Portfolio equity</span>
              <span className="chart-summary-value">
                <span>Latest</span>
                <strong>{formatCurrency(lastPoint.totalEquity)}</strong>
              </span>
              <span className={`signed-value signed-value-${chartTone}`}>
                Range {formatSignedPercent(rangeReturnPct)}
              </span>
              {activeRange === "ALL" ? null : (
                <span className="chart-summary-total">
                  Total {formatSignedPercent(chartReturnPct)}
                </span>
              )}
            </div>
            <div className="chart-view-context" aria-label="Visible chart view">
              <span>
                View {formatShortDate((visibleFirstPoint ?? firstPoint).date)} -{" "}
                {formatShortDate((visibleLastPoint ?? lastPoint).date)}
              </span>
              <span>{visibleChartPoints.length} points</span>
              <span>{plottedVisibleTradeDayCount} plotted event days</span>
              {hasDepositReference ? (
                <span className="chart-deposit-context">Dashed deposits</span>
              ) : null}
            </div>
          </div>
          <div className="chart-range-toolbar" aria-label="Chart time range">
            {chartRangeOptions.map((range) => (
              <button
                className={
                  activeRange === range
                    ? "chart-range-button chart-range-button-active"
                    : "chart-range-button"
                }
                key={range}
                onClick={() => setActiveRange(range)}
                type="button"
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div
          ref={chartContainerRef}
          className="chart-canvas"
          role="img"
          aria-describedby="equity-chart-description"
          aria-label="Interactive portfolio equity curve"
        />
        {chartReady ? null : (
          <div className="chart-loading" aria-hidden="true">
            Loading chart
          </div>
        )}
        {crosshairDetail === null ? null : (
          <CrosshairTooltip detail={crosshairDetail} />
        )}
      </div>

      <div className="chart-footer-row">
        {markers.length > 0 ? (
          <div
            className="trade-event-rail"
            aria-label="Equity chart trade events"
          >
            <span>Events</span>
            {markers.map((marker) => (
              <button
                aria-label={tradeMarkerAriaLabel(
                  marker,
                  pointByDate.has(marker.date),
                )}
                className={`trade-event-button trade-event-button-${marker.tone} ${
                  selectedTradeMarkerId === marker.id
                    ? "trade-event-button-active"
                    : ""
                } ${
                  pointByDate.has(marker.date)
                    ? ""
                    : "trade-event-button-unplotted"
                }`}
                key={marker.id}
                onClick={() =>
                  setSelectedTradeMarkerId((currentMarkerId) =>
                    currentMarkerId === marker.id ? null : marker.id,
                  )
                }
                type="button"
              >
                <span className="trade-marker-label">{marker.label}</span>
                <span>{marker.date.slice(5)}</span>
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <a
          className="chart-attribution"
          href={chartAttributionUrl}
          rel="noreferrer"
          target="_blank"
        >
          Charting by TradingView
        </a>
      </div>

      {selectedTradeMarker === null ? null : (
        <TradeDetailCard marker={selectedTradeMarker} />
      )}
    </div>
  );
}

function buildChartPoints(points: EquityPoint[]): ChartPoint[] {
  return points
    .slice()
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((point) => ({
      cumulativeDeposits: point.cumulativeDeposits,
      date: point.date,
      periodReturnPct: point.periodReturnPct,
      totalEquity: point.totalEquity,
      totalReturnPct: point.totalReturnPct,
    }));
}

function chartReturnForPoints(
  firstPoint: ChartPoint,
  lastPoint: ChartPoint,
): number | null {
  if (
    lastPoint.cumulativeDeposits !== null &&
    lastPoint.cumulativeDeposits > 0
  ) {
    return (
      ((lastPoint.totalEquity - lastPoint.cumulativeDeposits) /
        lastPoint.cumulativeDeposits) *
      100
    );
  }

  if (firstPoint.totalEquity === 0) {
    return null;
  }

  if (lastPoint.totalEquity === firstPoint.totalEquity) {
    return 0;
  }

  return (
    ((lastPoint.totalEquity - firstPoint.totalEquity) /
      firstPoint.totalEquity) *
    100
  );
}

function returnForPricePoints(
  firstPoint: PriceHistoryPoint,
  lastPoint: PriceHistoryPoint,
): number | null {
  return firstPoint.close > 0
    ? ((lastPoint.close - firstPoint.close) / firstPoint.close) * 100
    : null;
}

function returnForStockChartPoints(
  firstPoint: StockChartPoint,
  lastPoint: StockChartPoint,
): number | null {
  return firstPoint.close > 0
    ? ((lastPoint.close - firstPoint.close) / firstPoint.close) * 100
    : null;
}

function priceMovementForItem(
  item: WatchlistItem,
  sessionsBack: number,
): PriceMovement | null {
  return priceMovementForHistory(item.priceHistory, sessionsBack);
}

function priceMovementForHistory(
  history: PriceHistoryPoint[],
  sessionsBack: number,
): PriceMovement | null {
  if (history.length <= sessionsBack) {
    return null;
  }

  const sortedHistory = history
    .slice()
    .sort((left, right) => left.date.localeCompare(right.date));
  const latest = sortedHistory.at(-1);
  const base = sortedHistory[sortedHistory.length - 1 - sessionsBack];
  if (latest === undefined || base === undefined || base.close <= 0) {
    return null;
  }

  const amount = latest.close - base.close;
  return {
    amount,
    percent: (amount / base.close) * 100,
  };
}

function rangeReturnForPoints(points: ChartPoint[]): number | null {
  const periodReturns = points
    .slice(1)
    .map((point) => point.periodReturnPct)
    .filter((value): value is number => value !== null);

  if (periodReturns.length > 0) {
    const compounded = periodReturns.reduce(
      (nav, periodReturnPct) => nav * (1 + periodReturnPct / 100),
      1,
    );
    return (compounded - 1) * 100;
  }

  const firstPoint = points[0];
  const lastPoint = points.at(-1);
  if (firstPoint === undefined || lastPoint === undefined) {
    return null;
  }
  if (firstPoint.totalEquity === 0) {
    return null;
  }

  return (
    ((lastPoint.totalEquity - firstPoint.totalEquity) /
      firstPoint.totalEquity) *
    100
  );
}

function applyChartRange(
  chart: IChartApi,
  points: { date: string }[],
  range: ChartRange,
): void {
  if (range === "ALL" || points.length <= 2) {
    chart.timeScale().setVisibleLogicalRange({
      from: -chartVisibleLeftPadding,
      to: points.length - chartVisibleRightPadding,
    });
    return;
  }

  const from = firstVisibleIndexForRange(points, range);
  chart.timeScale().setVisibleLogicalRange({
    from: Math.max(-chartVisibleLeftPadding, from - chartVisibleLeftPadding),
    to: points.length - chartVisibleRightPadding,
  });
}

function firstVisibleIndexForRange(
  points: { date: string }[],
  range: ChartRange,
): number {
  if (range === "ALL" || points.length <= 2) {
    return 0;
  }

  if (range === "1D") {
    return Math.max(0, points.length - 2);
  }

  if (range === "5D") {
    return Math.max(0, points.length - 6);
  }

  const lastPoint = points[points.length - 1];
  const cutoff = chartRangeCutoff(lastPoint.date, range);
  const firstVisibleIndex = points.findIndex(
    (point) => Date.parse(point.date) >= cutoff,
  );
  return firstVisibleIndex === -1 ? 0 : firstVisibleIndex;
}

function chartRangeCutoff(
  lastDate: string,
  range: Exclude<ChartRange, "1D" | "5D" | "ALL">,
): number {
  const lastTime = Date.parse(lastDate);
  if (range === "YTD") {
    const year = new Date(lastTime).getUTCFullYear();
    return Date.UTC(year, 0, 1);
  }

  const dayCounts: Record<Exclude<ChartRange, "YTD" | "ALL">, number> = {
    "1M": 31,
    "3M": 92,
    "6M": 183,
    "1Y": 366,
    "3Y": 1096,
    "5Y": 1827,
  };
  return lastTime - dayCounts[range] * 24 * 60 * 60 * 1000;
}

function formatShortDate(date: string): string {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  return Number.isNaN(timestamp) ? date : shortDateFormatter.format(timestamp);
}

function formatFullDate(date: string): string {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  return Number.isNaN(timestamp) ? date : fullDateFormatter.format(timestamp);
}

function formatDateRange(firstDate: string, lastDate: string): string {
  const firstYear = firstDate.slice(0, 4);
  const lastYear = lastDate.slice(0, 4);
  if (firstYear !== "" && firstYear === lastYear) {
    return `${formatShortDate(firstDate)} - ${formatShortDate(lastDate)}`;
  }
  return `${formatFullDate(firstDate)} - ${formatFullDate(lastDate)}`;
}

interface ChartColors {
  background: string;
  border: string;
  buy: string;
  crosshair: string;
  deposit: string;
  grid: string;
  ink: string;
  mixed: string;
  muted: string;
  sell: string;
  surface: string;
  tone: string;
}

function readChartColors(
  element: HTMLElement,
  chartTone: ValueTone,
): ChartColors {
  const gain = readCssVariable(element, "--gain", "#c94431");
  const loss = readCssVariable(element, "--loss", "#237a48");
  const neutralTone = readCssVariable(element, "--muted", "#63716b");

  return {
    background: readCssVariable(element, "--surface", "#ffffff"),
    border: readCssVariable(element, "--border", "#d8e3df"),
    buy: readCssVariable(element, "--buy", "#2563eb"),
    crosshair: "rgba(23, 32, 29, 0.42)",
    deposit: "rgba(99, 113, 107, 0.62)",
    grid: "rgba(99, 113, 107, 0.16)",
    ink: readCssVariable(element, "--ink", "#17201d"),
    mixed: readCssVariable(element, "--indigo", "#4f57c8"),
    muted: readCssVariable(element, "--muted", "#63716b"),
    sell: readCssVariable(element, "--sell", "#b45309"),
    surface: readCssVariable(element, "--surface", "#ffffff"),
    tone:
      chartTone === "gain" ? gain : chartTone === "loss" ? loss : neutralTone,
  };
}

function readCssVariable(
  element: HTMLElement,
  name: string,
  fallback: string,
): string {
  return getComputedStyle(element).getPropertyValue(name).trim() || fallback;
}

function transparentize(color: string, alpha: number): string {
  const trimmed = color.trim();
  const hexMatch = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(trimmed);
  if (hexMatch !== null) {
    const hex = hexMatch[1];
    const normalized =
      hex.length === 3
        ? hex
            .split("")
            .map((character) => `${character}${character}`)
            .join("")
        : hex;
    const red = Number.parseInt(normalized.slice(0, 2), 16);
    const green = Number.parseInt(normalized.slice(2, 4), 16);
    const blue = Number.parseInt(normalized.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  const rgbMatch = /^rgb\((.+)\)$/i.exec(trimmed);
  if (rgbMatch !== null) {
    return `rgba(${rgbMatch[1]}, ${alpha})`;
  }

  return trimmed;
}

function buildAnalysisMarkers(
  entries: ResearchAnalysisEntry[],
  points: StockChartPoint[],
  colors: ChartColors,
  excludedDates: ReadonlySet<string> = new Set<string>(),
): SeriesMarker<Time>[] {
  const usedDates = new Set<string>();
  return entries
    .map((entry) => nearestStockPointOnOrBefore(points, entry.analyzedAt))
    .filter((point): point is StockChartPoint => point !== null)
    .filter((point) => {
      if (usedDates.has(point.date)) {
        return false;
      }
      if (excludedDates.has(point.date)) {
        return false;
      }
      usedDates.add(point.date);
      return true;
    })
    .map((point) => ({
      color: colors.mixed,
      position: "aboveBar",
      shape: "circle",
      size: 1,
      time: point.date as Time,
    }));
}

function nearestStockPointOnOrBefore(
  points: StockChartPoint[],
  date: string,
): StockChartPoint | null {
  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (points[index].date <= date) {
      return points[index];
    }
  }
  return null;
}

function buildCrosshairDetail({
  markerByDate,
  markerById,
  params,
  pointByDate,
  seriesData,
  viewportHeight,
  viewportWidth,
}: {
  markerByDate: Map<string, TradeMarker>;
  markerById: Map<string, TradeMarker>;
  params: MouseEventParams<Time>;
  pointByDate: Map<string, ChartPoint>;
  seriesData: unknown;
  viewportHeight: number;
  viewportWidth: number;
}): CrosshairDetail | null {
  if (params.point === undefined) {
    return null;
  }

  const date = chartTimeToDateString(params.time);
  if (date === null) {
    return null;
  }

  const point = pointByDate.get(date) ?? null;
  const totalEquity = valueFromSeriesData(seriesData) ?? point?.totalEquity;
  if (totalEquity === undefined) {
    return null;
  }

  return {
    cumulativeDeposits: point?.cumulativeDeposits ?? null,
    date,
    left: params.point.x,
    marker: markerFromParams(params, markerByDate, markerById),
    periodReturnPct: point?.periodReturnPct ?? null,
    placement: params.point.x > viewportWidth - 320 ? "right" : "left",
    top: Math.min(
      Math.max(params.point.y, 82),
      Math.max(82, viewportHeight - 76),
    ),
    totalEquity,
    totalReturnPct: point?.totalReturnPct ?? null,
  };
}

function valueFromSeriesData(seriesData: unknown): number | null {
  if (
    typeof seriesData === "object" &&
    seriesData !== null &&
    "value" in seriesData
  ) {
    const value = (seriesData as { value: unknown }).value;
    return typeof value === "number" ? value : null;
  }

  return null;
}

function markerFromParams(
  params: MouseEventParams<Time>,
  markerByDate: Map<string, TradeMarker>,
  markerById: Map<string, TradeMarker>,
): TradeMarker | null {
  const objectId = params.hoveredInfo?.objectId ?? params.hoveredObjectId;
  if (typeof objectId === "string") {
    const marker = markerById.get(objectId);
    if (marker !== undefined) {
      return marker;
    }
  }

  const date = chartTimeToDateString(params.time);
  return date === null ? null : (markerByDate.get(date) ?? null);
}

function chartTimeToDateString(time: Time | undefined): string | null {
  if (time === undefined) {
    return null;
  }

  if (typeof time === "string") {
    return time;
  }

  if (typeof time === "number") {
    return new Date(time * 1000).toISOString().slice(0, 10);
  }

  return `${time.year}-${String(time.month).padStart(2, "0")}-${String(
    time.day,
  ).padStart(2, "0")}`;
}

function tradeMarkerAriaLabel(marker: TradeMarker, isPlotted: boolean): string {
  const summary = marker.trades
    .map(
      (trade) =>
        `${trade.side.toUpperCase()} ${trade.quantity} ${trade.symbol} at ${formatCurrency(trade.averagePrice)}`,
    )
    .join(", ");
  const plotStatus = isPlotted
    ? ""
    : " Not plotted because no equity snapshot exists for this date.";
  return `${marker.date}: ${summary}.${plotStatus}`;
}

function CrosshairTooltip({ detail }: { detail: CrosshairDetail }) {
  const tooltipStyle = {
    "--tooltip-left": `${detail.left}px`,
    "--tooltip-top": `${detail.top}px`,
  } as CSSProperties;

  return (
    <div
      className={`chart-hover-card chart-hover-card-${detail.placement}`}
      role="tooltip"
      style={tooltipStyle}
    >
      <div className="chart-hover-topline">
        <span>{detail.date}</span>
        <strong>{formatCurrency(detail.totalEquity)}</strong>
      </div>
      <dl className="chart-hover-metrics">
        <div>
          <dt>Total return</dt>
          <dd
            className={`signed-value signed-value-${toneForSignedValue(
              detail.totalReturnPct,
            )}`}
          >
            {formatSignedPercent(detail.totalReturnPct)}
          </dd>
        </div>
        <div>
          <dt>Period</dt>
          <dd
            className={`signed-value signed-value-${toneForSignedValue(
              detail.periodReturnPct,
            )}`}
          >
            {formatSignedPercent(detail.periodReturnPct)}
          </dd>
        </div>
        <div>
          <dt>Deposits</dt>
          <dd>{formatCurrency(detail.cumulativeDeposits)}</dd>
        </div>
      </dl>
      {detail.marker === null ? null : (
        <div className="chart-hover-trades">
          <span
            className={`trade-tooltip-action trade-tooltip-action-${detail.marker.tone}`}
          >
            {tradeGroupLabel(detail.marker)}
          </span>
          <TradeRows marker={detail.marker} />
        </div>
      )}
    </div>
  );
}

function TradeDetailCard({ marker }: { marker: TradeMarker }) {
  return (
    <div className="trade-detail-card">
      <div className="trade-tooltip-topline">
        <span className="trade-tooltip-date">{marker.date}</span>
        <span
          className={`trade-tooltip-action trade-tooltip-action-${marker.tone}`}
        >
          {tradeGroupLabel(marker)}
        </span>
      </div>
      <TradeRows marker={marker} />
    </div>
  );
}

function TradeRows({ marker }: { marker: TradeMarker }) {
  return (
    <span className="trade-tooltip-list">
      {marker.trades.map((trade) => (
        <span className="trade-tooltip-row" key={trade.eventId}>
          <span className={`trade-side trade-side-${trade.side}`}>
            {trade.side.toUpperCase()}
          </span>
          <span className="trade-tooltip-main">
            <strong>{trade.symbol}</strong>
            <span>
              {formatTradeQuantity(trade.quantity)} shares @{" "}
              {formatCurrency(trade.averagePrice)}
            </span>
          </span>
          <span className="trade-tooltip-cash">
            {formatCurrency(Math.abs(trade.netCashEffect ?? 0))}
          </span>
        </span>
      ))}
    </span>
  );
}

function tradeGroupLabel(marker: TradeMarker): string {
  if (marker.trades.length === 1) {
    return marker.trades[0].side === "sell" ? "Sell" : "Buy";
  }

  const sides = new Set(marker.trades.map((trade) => trade.side));
  if (sides.size > 1) {
    return `${marker.trades.length} trades`;
  }

  return marker.trades[0].side === "sell"
    ? `${marker.trades.length} sells`
    : `${marker.trades.length} buys`;
}

function formatTradeQuantity(value: number | null): string {
  return value?.toLocaleString("en-US", { maximumFractionDigits: 4 }) ?? "-";
}

function HoldingsTable({ data }: { data: PortfolioData }) {
  if (data.positions.length === 0) {
    return (
      <div className="empty-state">
        <strong>No confirmed holdings yet</strong>
        <span>
          Holdings will be derived from the ledger after the first confirmed
          execution.
        </span>
      </div>
    );
  }

  const holdings = data.positions.map((position) => {
    const price = priceForSymbol(data, position.symbol);
    const value = marketValueForPosition(data, position);
    const costBasis = costBasisForPosition(position);
    const profitLoss =
      value !== null && costBasis !== null ? value - costBasis : null;
    const returnPct =
      profitLoss !== null && costBasis !== null && costBasis > 0
        ? (profitLoss / costBasis) * 100
        : null;
    const returnTone = toneForSignedValue(returnPct);
    return {
      position,
      price,
      profitLoss,
      returnPct,
      returnTone,
      value,
    };
  });

  return (
    <>
      <div className="table-wrap holdings-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Shares</th>
              <th>Avg Cost</th>
              <th>Last Price</th>
              <th>Value</th>
              <th>P/L</th>
              <th>Return</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map(
              ({
                position,
                price,
                profitLoss,
                returnPct,
                returnTone,
                value,
              }) => (
                <tr key={position.symbol}>
                  <td>
                    <strong>{position.symbol}</strong>
                    <span>{position.exchange}</span>
                  </td>
                  <td>
                    {position.quantity.toLocaleString("en-US", {
                      maximumFractionDigits: 4,
                    })}
                  </td>
                  <td>{formatCurrency(position.averageCost)}</td>
                  <td>{formatCurrency(price)}</td>
                  <td>{formatCurrency(value)}</td>
                  <td>
                    <span className={`signed-value signed-value-${returnTone}`}>
                      {formatSignedCurrency(profitLoss)}
                    </span>
                  </td>
                  <td>
                    <span className={`signed-value signed-value-${returnTone}`}>
                      {formatSignedPercent(returnPct)}
                    </span>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      <div className="holding-card-list">
        {holdings.map(
          ({ position, price, profitLoss, returnPct, returnTone, value }) => (
            <article className="holding-card" key={position.symbol}>
              <header>
                <span>
                  <strong>{position.symbol}</strong>
                  <small>{position.exchange}</small>
                </span>
                <span className={`signed-value signed-value-${returnTone}`}>
                  {formatSignedPercent(returnPct)}
                </span>
              </header>
              <dl>
                <div>
                  <dt>Shares</dt>
                  <dd>
                    {position.quantity.toLocaleString("en-US", {
                      maximumFractionDigits: 4,
                    })}
                  </dd>
                </div>
                <div>
                  <dt>Value</dt>
                  <dd>{formatCurrency(value)}</dd>
                </div>
                <div>
                  <dt>Avg cost</dt>
                  <dd>{formatCurrency(position.averageCost)}</dd>
                </div>
                <div>
                  <dt>Last price</dt>
                  <dd>{formatCurrency(price)}</dd>
                </div>
                <div>
                  <dt>P/L</dt>
                  <dd className={`signed-value signed-value-${returnTone}`}>
                    {formatSignedCurrency(profitLoss)}
                  </dd>
                </div>
              </dl>
            </article>
          ),
        )}
      </div>
    </>
  );
}

function OperationsList({ events }: { events: LedgerEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="empty-state">
        <strong>No confirmed operations yet</strong>
        <span>
          Deposits, buys, sells, dividends, and corrections will appear as
          append-only ledger events.
        </span>
      </div>
    );
  }

  return (
    <ol className="operation-list">
      {events
        .slice()
        .reverse()
        .map((event) => (
          <li key={event.eventId}>
            <span className="operation-date">
              {event.tradeDate || event.createdAt}
            </span>
            <span className="operation-main">
              <strong>{operationTitle(event)}</strong>
              <span>{operationDetail(event)}</span>
            </span>
            <span
              className={`operation-badge operation-badge-${operationTone(event)}`}
            >
              {operationBadgeLabel(event)}
            </span>
          </li>
        ))}
    </ol>
  );
}

function operationTone(event: LedgerEvent): string {
  if (event.eventType === "deposit") {
    return "deposit";
  }
  return event.side === "sell" ? "sell" : "buy";
}

function operationBadgeLabel(event: LedgerEvent): string {
  if (event.eventType === "deposit") {
    return "cash";
  }
  return event.side;
}

function operationTitle(event: LedgerEvent): string {
  if (event.eventType === "deposit") {
    return "Deposit";
  }
  return `${event.side.toUpperCase()} ${event.symbol}`;
}

function operationDetail(event: LedgerEvent): string {
  if (event.eventType === "deposit") {
    return `${formatCurrency(Math.abs(event.netCashEffect ?? 0))} ${event.notes}`;
  }
  const quantity =
    event.quantity?.toLocaleString("en-US", { maximumFractionDigits: 4 }) ??
    "-";
  return `${quantity} shares @ ${formatCurrency(event.averagePrice)} - ${event.notes}`;
}

function WatchlistTable({
  events,
  items,
  marketColorScheme,
  repositoryUrl,
}: {
  events: LedgerEvent[];
  items: WatchlistItem[];
  marketColorScheme: MarketColorScheme;
  repositoryUrl: string;
}) {
  const [selectedSymbol, setSelectedSymbol] = useState(items[0]?.symbol ?? "");
  const [movementDisplayMode, setMovementDisplayMode] =
    useState<MovementDisplayMode>("percent");
  const [sparklineWindow, setSparklineWindow] =
    useState<SparklineWindowKey>(defaultSparklineWindow);
  const [customSparklineSessionsInput, setCustomSparklineSessionsInput] =
    useState(String(defaultCustomSparklineSessions));
  const [previewState, setPreviewState] = useState<WatchPreviewState | null>(
    null,
  );
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const watchlistGridRef = useRef<HTMLDivElement | null>(null);
  const detailPanelRef = useRef<HTMLElement | null>(null);
  const selectedItem =
    items.find((item) => item.symbol === selectedSymbol) ?? items[0] ?? null;
  const previewItem =
    previewState === null
      ? null
      : (items.find((item) => item.symbol === previewState.symbol) ?? null);
  const previewEntry =
    previewItem === null ? null : latestAnalysisFor(previewItem);
  const customSparklineSessions = Number.parseInt(
    customSparklineSessionsInput,
    10,
  );
  const activeCustomSparklineSessions = Number.isFinite(customSparklineSessions)
    ? clampSparklineSessions(customSparklineSessions)
    : defaultCustomSparklineSessions;
  const sparklineSessions = sessionsForSparklineWindow(
    sparklineWindow,
    activeCustomSparklineSessions,
  );

  useEffect(() => {
    if (items.length === 0) {
      setSelectedSymbol("");
      setPreviewState(null);
      return;
    }

    if (!items.some((item) => item.symbol === selectedSymbol)) {
      setSelectedSymbol(items[0].symbol);
    }

    if (
      previewState !== null &&
      !items.some((item) => item.symbol === previewState.symbol)
    ) {
      setPreviewState(null);
    }
  }, [items, previewState?.symbol, selectedSymbol]);

  const setCustomSparklineSessions = (value: string) => {
    if (/^\d{0,4}$/.test(value)) {
      setCustomSparklineSessionsInput(value);
      setSparklineWindow("CUSTOM");
    }
  };

  const commitCustomSparklineSessions = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    const nextSessions = Number.isFinite(parsed)
      ? clampSparklineSessions(parsed)
      : defaultCustomSparklineSessions;
    setCustomSparklineSessionsInput(String(nextSessions));
    setSparklineWindow("CUSTOM");
  };

  useEffect(() => {
    const workspace = workspaceRef.current;
    const watchlistGrid = watchlistGridRef.current;
    if (workspace === null || watchlistGrid === null) {
      return;
    }

    let animationFrame = 0;
    const updateLeftColumnHeight = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const height = Math.ceil(watchlistGrid.getBoundingClientRect().height);
        workspace.style.setProperty(
          "--research-left-column-height",
          `${height}px`,
        );
      });
    };

    updateLeftColumnHeight();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateLeftColumnHeight);
    resizeObserver?.observe(watchlistGrid);
    window.addEventListener("resize", updateLeftColumnHeight);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateLeftColumnHeight);
    };
  }, [items.length, movementDisplayMode]);

  const selectItem = (symbol: string) => {
    setSelectedSymbol(symbol);
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 760px)").matches
    ) {
      window.requestAnimationFrame(() => {
        detailPanelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  };

  const showPreviewForElement = (
    symbol: string,
    element: HTMLButtonElement,
  ) => {
    if (typeof window === "undefined") {
      return;
    }
    if (!window.matchMedia(WATCH_PREVIEW_MEDIA_QUERY).matches) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const detailPanel = element
      .closest(".research-workspace")
      ?.querySelector<HTMLElement>(".research-detail-panel");
    const detailPanelRect = detailPanel?.getBoundingClientRect() ?? null;
    const maxLeft = Math.max(
      WATCH_PREVIEW_MARGIN,
      window.innerWidth - WATCH_PREVIEW_WIDTH - WATCH_PREVIEW_MARGIN,
    );
    const maxTop = Math.max(
      WATCH_PREVIEW_MARGIN,
      window.innerHeight - WATCH_PREVIEW_HEIGHT - WATCH_PREVIEW_MARGIN,
    );
    const clamp = (value: number, minimum: number, maximum: number) =>
      Math.min(Math.max(value, minimum), maximum);
    const alignedLeft = clamp(rect.left, WATCH_PREVIEW_MARGIN, maxLeft);
    const alignedTop = clamp(rect.top, WATCH_PREVIEW_MARGIN, maxTop);
    const candidates = [
      { left: rect.right + WATCH_PREVIEW_GAP, top: alignedTop },
      {
        left: rect.left - WATCH_PREVIEW_WIDTH - WATCH_PREVIEW_GAP,
        top: alignedTop,
      },
      { left: alignedLeft, top: rect.bottom + WATCH_PREVIEW_GAP },
      {
        left: alignedLeft,
        top: rect.top - WATCH_PREVIEW_HEIGHT - WATCH_PREVIEW_GAP,
      },
    ];
    const candidateFits = ({ left, top }: { left: number; top: number }) =>
      left >= WATCH_PREVIEW_MARGIN &&
      top >= WATCH_PREVIEW_MARGIN &&
      left + WATCH_PREVIEW_WIDTH <= window.innerWidth - WATCH_PREVIEW_MARGIN &&
      top + WATCH_PREVIEW_HEIGHT <= window.innerHeight - WATCH_PREVIEW_MARGIN;
    const candidateOverlaps = (
      { left, top }: { left: number; top: number },
      target: DOMRect | null,
    ) =>
      target !== null &&
      left + WATCH_PREVIEW_WIDTH > target.left &&
      left < target.right &&
      top + WATCH_PREVIEW_HEIGHT > target.top &&
      top < target.bottom;
    const next =
      candidates.find(
        (candidate) =>
          candidateFits(candidate) &&
          !candidateOverlaps(candidate, rect) &&
          !candidateOverlaps(candidate, detailPanelRect),
      ) ??
      candidates.find(
        (candidate) =>
          candidateFits(candidate) && !candidateOverlaps(candidate, rect),
      ) ??
      {
        left: alignedLeft,
        top: alignedTop,
      };

    setPreviewState({
      left: clamp(next.left, WATCH_PREVIEW_MARGIN, maxLeft),
      symbol,
      top: clamp(next.top, WATCH_PREVIEW_MARGIN, maxTop),
    });
  };

  const showPreviewFromPointer = (
    event: ReactPointerEvent<HTMLButtonElement>,
    symbol: string,
  ) => {
    if (event.pointerType === "touch") {
      return;
    }
    showPreviewForElement(symbol, event.currentTarget);
  };

  const showPreviewFromMouse = (
    event: ReactMouseEvent<HTMLButtonElement>,
    symbol: string,
  ) => {
    showPreviewForElement(symbol, event.currentTarget);
  };

  const showPreviewFromFocus = (
    event: FocusEvent<HTMLButtonElement>,
    symbol: string,
  ) => {
    showPreviewForElement(symbol, event.currentTarget);
  };

  const hidePreview = () => setPreviewState(null);

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <strong>No research candidates yet</strong>
        <span>
          The research universe will appear after watchlist records are added.
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        className="research-display-toolbar"
        aria-label="Research display controls"
      >
        <div className="research-display-control-group">
          <span>Sparkline window</span>
          <div
            className="research-display-toggle sparkline-window-toggle"
            role="group"
            aria-label="Sparkline window preset"
          >
            {sparklineWindowOptions.map((option) => (
              <button
                className={
                  sparklineWindow === option.key
                    ? "chart-range-button chart-range-button-active"
                    : "chart-range-button"
                }
                key={option.key}
                onClick={() => setSparklineWindow(option.key)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <label
            className={
              sparklineWindow === "CUSTOM"
                ? "sparkline-window-custom sparkline-window-custom-active"
                : "sparkline-window-custom"
            }
          >
            <input
              aria-label={`Custom sparkline window, ${sparklineSessionMin} to ${sparklineSessionMax} trading sessions`}
              inputMode="numeric"
              max={sparklineSessionMax}
              min={sparklineSessionMin}
              onBlur={(event) =>
                commitCustomSparklineSessions(event.currentTarget.value)
              }
              onChange={(event) =>
                setCustomSparklineSessions(event.currentTarget.value)
              }
              onFocus={() => setSparklineWindow("CUSTOM")}
              step={1}
              type="number"
              value={customSparklineSessionsInput}
            />
            <span>sessions</span>
          </label>
        </div>
        <div className="research-display-control-group">
          <span>Recent move</span>
          <div
            className="research-display-toggle"
            role="group"
            aria-label="Recent move display mode"
          >
            <button
              className={
                movementDisplayMode === "percent"
                  ? "chart-range-button chart-range-button-active"
                  : "chart-range-button"
              }
              onClick={() => setMovementDisplayMode("percent")}
              type="button"
            >
              %
            </button>
            <button
              className={
                movementDisplayMode === "dollar"
                  ? "chart-range-button chart-range-button-active"
                  : "chart-range-button"
              }
              onClick={() => setMovementDisplayMode("dollar")}
              type="button"
            >
              $
            </button>
          </div>
        </div>
      </div>
      <div className="research-workspace" ref={workspaceRef}>
        <div
          aria-label="Research candidates"
          className="watchlist-grid"
          ref={watchlistGridRef}
        >
          {items.map((item) => {
            const latest = latestAnalysisFor(item);
            const selected = item.symbol === selectedItem?.symbol;
            const previewId = `watch-preview-${item.symbol.toLowerCase()}`;

            return (
              <button
                aria-describedby={
                  latest !== null && previewState?.symbol === item.symbol
                    ? previewId
                    : undefined
                }
                aria-pressed={selected}
                className={
                  selected ? "watch-card watch-card-selected" : "watch-card"
                }
                key={item.symbol}
                onBlur={hidePreview}
                onClick={() => selectItem(item.symbol)}
                onFocus={(event) => {
                  if (latest !== null) {
                    showPreviewFromFocus(event, item.symbol);
                  }
                }}
                onMouseEnter={(event) => {
                  if (latest !== null) {
                    showPreviewFromMouse(event, item.symbol);
                  }
                }}
                onMouseLeave={hidePreview}
                onMouseMove={(event) => {
                  if (latest !== null) {
                    showPreviewFromMouse(event, item.symbol);
                  }
                }}
                onPointerEnter={(event) => {
                  if (latest !== null) {
                    showPreviewFromPointer(event, item.symbol);
                  }
                }}
                onPointerLeave={hidePreview}
                onPointerMove={(event) => {
                  if (latest !== null) {
                    showPreviewFromPointer(event, item.symbol);
                  }
                }}
                type="button"
              >
                <span className="watch-card-topline">
                  <span className="watch-card-symbol-row">
                    <strong>{item.symbol}</strong>
                    <span className="rank">
                      {watchPriorityLabel(item.priority)}
                    </span>
                  </span>
                  <span className="watch-card-name">{item.name}</span>
                </span>
                <span className="watch-card-theme">{item.theme}</span>
                <MiniSparkline
                  item={item}
                  windowSessions={sparklineSessions}
                />
                <span className="watch-card-metric-row">
                  <WatchCardMovementMetric
                    item={item}
                    label="1D"
                    mode={movementDisplayMode}
                    sessionsBack={1}
                  />
                  <WatchCardMovementMetric
                    item={item}
                    label="5D"
                    mode={movementDisplayMode}
                    sessionsBack={5}
                  />
                  <WatchCardPlainMetric
                    label="P/S"
                    value={formatRatio(item.metrics?.priceToSales ?? null)}
                  />
                </span>
                <span className="watch-card-meta">
                  <span>{watchStatusLabel(item.status)}</span>
                  <span>{formatWatchPrice(item)}</span>
                  <span>{analysisCountLabel(item.analysisHistory.length)}</span>
                </span>
              </button>
            );
          })}
        </div>
        {previewItem === null ||
        previewEntry === null ||
        previewState === null ? null : (
          <WatchAnalysisPreview
            entry={previewEntry}
            id={`watch-preview-${previewItem.symbol.toLowerCase()}`}
            item={previewItem}
            style={{
              left: `${previewState.left}px`,
              top: `${previewState.top}px`,
            }}
          />
        )}
        <ResearchDetailPanel
          events={events}
          item={selectedItem}
          marketColorScheme={marketColorScheme}
          movementDisplayMode={movementDisplayMode}
          panelRef={detailPanelRef}
          repositoryUrl={repositoryUrl}
        />
      </div>
    </>
  );
}

function WatchCardMovementMetric({
  item,
  label,
  mode,
  sessionsBack,
}: {
  item: WatchlistItem;
  label: string;
  mode: MovementDisplayMode;
  sessionsBack: number;
}) {
  const movement = priceMovementForItem(item, sessionsBack);
  const tone = toneForSignedValue(movement?.amount ?? null);

  return (
    <span className={`watch-card-metric watch-card-metric-${tone}`}>
      <b>{formatMovement(movement, mode)}</b>
      <small>{label}</small>
    </span>
  );
}

function WatchCardPlainMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <span className="watch-card-metric">
      <b>{value}</b>
      <small>{label}</small>
    </span>
  );
}

function MiniSparkline({
  item,
  windowSessions,
}: {
  item: WatchlistItem;
  windowSessions: number | null;
}) {
  const history =
    windowSessions === null
      ? item.priceHistory
      : item.priceHistory.slice(-windowSessions);
  if (history.length < 2) {
    return (
      <span className="mini-sparkline mini-sparkline-empty">
        Price history pending
      </span>
    );
  }

  const first = history[0];
  const last = history.at(-1) ?? first;
  const tone = toneForSignedValue(returnForPricePoints(first, last));
  const highs = history.map((point) => point.close);
  const high = Math.max(...highs);
  const low = Math.min(...highs);
  const width = 180;
  const height = 42;
  const range = high - low || 1;
  const xStep = width / (history.length - 1);
  const points = history
    .map((point, index) => {
      const x = index * xStep;
      const y = height - ((point.close - low) / range) * (height - 4) - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <span
      className={`mini-sparkline mini-sparkline-${tone}`}
      aria-label={`${item.symbol} daily close sparkline`}
    >
      <svg focusable="false" viewBox={`0 0 ${width} ${height}`}>
        <polyline points={points} />
      </svg>
    </span>
  );
}

function WatchAnalysisPreview({
  entry,
  id,
  item,
  style,
}: {
  entry: ResearchAnalysisEntry;
  id: string;
  item: WatchlistItem;
  style: CSSProperties;
}) {
  return (
    <span className="watch-preview" id={id} role="tooltip" style={style}>
      <span className="watch-preview-kicker">Latest analysis</span>
      <strong>
        {item.symbol} {analysisStanceLabel(entry.stance)} · {entry.analyzedAt}
      </strong>
      <span>{entry.summary}</span>
      <span>
        <b>Risk watch</b> {entry.riskWatch}
      </span>
    </span>
  );
}

function ResearchDetailPanel({
  events,
  item,
  marketColorScheme,
  movementDisplayMode,
  panelRef,
  repositoryUrl,
}: {
  events: LedgerEvent[];
  item: WatchlistItem | null;
  marketColorScheme: MarketColorScheme;
  movementDisplayMode: MovementDisplayMode;
  panelRef: RefObject<HTMLElement | null>;
  repositoryUrl: string;
}) {
  if (item === null) {
    return null;
  }

  const latest = latestAnalysisFor(item);
  const history = item.analysisHistory;

  return (
    <aside
      aria-label={`${item.symbol} research detail`}
      className="research-detail-panel"
      ref={panelRef}
    >
      <div className="research-detail-kicker">
        <BookOpen size={16} />
        <span>Research brief</span>
      </div>
      <div className="research-detail-title">
        <div>
          <span className="research-symbol">{item.symbol}</span>
          <h3>{item.name}</h3>
        </div>
        <span className="rank">{watchPriorityLabel(item.priority)}</span>
      </div>
      <p className="research-theme">{item.theme}</p>
      <dl className="research-meta-grid">
        <div>
          <dt>Status</dt>
          <dd>{watchStatusLabel(item.status)}</dd>
        </div>
        <div>
          <dt>Price</dt>
          <dd>{formatWatchPrice(item)}</dd>
        </div>
        <div>
          <dt>Baseline</dt>
          <dd>{item.latestBaselineDate || "Pending"}</dd>
        </div>
        <div>
          <dt>Latest stance</dt>
          <dd>{analysisStanceLabel(latest?.stance ?? item.priority)}</dd>
        </div>
      </dl>

      <div className="research-action-row">
        <a className="research-action-link" href={researchPagePath(item.symbol)}>
          <BookOpen size={14} />
          <span>Full brief</span>
        </a>
        {item.security?.tradingViewUrl ? (
          <a
            className="research-action-link"
            href={item.security.tradingViewUrl}
            rel="noreferrer"
            target="_blank"
          >
            <SquareArrowOutUpRight size={14} />
            <span>TradingView</span>
          </a>
        ) : null}
        {item.security?.stockAnalysisUrl ? (
          <a
            className="research-action-link"
            href={item.security.stockAnalysisUrl}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink size={14} />
            <span>StockAnalysis</span>
          </a>
        ) : null}
      </div>

      <MarketMetricStrip item={item} />

      <StockPriceChart
        events={events}
        item={item}
        marketColorScheme={marketColorScheme}
        movementDisplayMode={movementDisplayMode}
      />

      <TradingViewPreview item={item} />

      <div className="research-brief-stack">
        <ResearchBriefSection
          label="Thesis"
          value={latest?.summary ?? item.notes}
        />
        <ResearchBriefSection
          label="Upside path"
          value={latest?.upsidePath ?? item.initialRole}
        />
        <ResearchBriefSection
          label="Risk watch"
          value={latest?.riskWatch ?? "No structured risk note yet."}
        />
        <ResearchBriefSection
          label="Next check"
          value={latest?.nextCheck ?? item.nextReviewTrigger}
        />
      </div>

      <div className="analysis-history-block">
        <div className="analysis-history-heading">
          <History size={16} />
          <span>Analysis history</span>
        </div>
        {history.length === 0 ? (
          <p>No structured analysis entries yet.</p>
        ) : (
          <ol className="analysis-timeline">
            {history.map((entry) => (
              <li key={entry.id}>
                <span className="analysis-date">{entry.analyzedAt}</span>
                <strong>{entry.title}</strong>
                <span className="analysis-meta">
                  {analysisStanceLabel(entry.stance)} ·{" "}
                  {readableStatusLabel(entry.analysisType)} ·{" "}
                  {entry.policyVersion}
                </span>
                <p>{entry.summary}</p>
                {entry.sourcePath === "" ? null : (
                  <a
                    className="research-source-link"
                    href={repositoryFileUrl(repositoryUrl, entry.sourcePath)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink size={14} />
                    <span>{sourceLinkLabel(entry.sourcePath)}</span>
                  </a>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}

function MarketMetricStrip({ item }: { item: WatchlistItem }) {
  const technical = item.technical;
  const metrics = item.metrics;

  return (
    <div className="market-metric-strip" aria-label={`${item.symbol} market metrics`}>
      <MarketMetric label="Market cap" value={formatLargeCurrency(metrics?.marketCap ?? null)} />
      <MarketMetric label="EV/S" value={formatRatio(metrics?.enterpriseValueToSales ?? null)} />
      <MarketMetric label="P/E" value={formatRatio(metrics?.peRatio ?? null)} />
      <MarketMetric label="Revenue" value={formatLargeCurrency(metrics?.ttmRevenue ?? null)} />
      <MarketMetric label="Rev growth" value={formatMetricPercent(metrics?.revenueGrowthYoy ?? null)} />
      <MarketMetric label="Gross margin" value={formatPlainPercent(metrics?.grossMarginTtm ?? null)} />
      <MarketMetric label="RSI 14" value={formatNumber(technical?.rsi14 ?? null, 1)} />
      <MarketMetric label="52w pos" value={formatPlainPercent(technical?.positionIn52WeekRangePct ?? null)} />
    </div>
  );
}

function MarketMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="market-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StockPriceChart({
  events,
  item,
  marketColorScheme,
  movementDisplayMode,
}: {
  events: LedgerEvent[];
  item: WatchlistItem;
  marketColorScheme: MarketColorScheme;
  movementDisplayMode: MovementDisplayMode;
}) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartApiRef = useRef<IChartApi | null>(null);
  const activeRangeRef = useRef<ChartRange>("1M");
  const [chartReady, setChartReady] = useState(false);
  const [activeRange, setActiveRange] = useState<ChartRange>("1M");
  const chartPoints = useMemo(
    () =>
      item.priceHistory
        .map((point) => ({
          close: point.close,
          date: point.date,
        }))
        .sort((left, right) => left.date.localeCompare(right.date)),
    [item.priceHistory],
  );
  const hasPriceHistory = chartPoints.length >= 2;
  const firstPoint = chartPoints[0] ?? null;
  const lastPoint = chartPoints.at(-1) ?? null;
  const visibleChartPoints = useMemo(
    () => chartPoints.slice(firstVisibleIndexForRange(chartPoints, activeRange)),
    [activeRange, chartPoints],
  );
  const visibleFirstPoint = visibleChartPoints[0] ?? firstPoint;
  const visibleLastPoint = visibleChartPoints.at(-1) ?? lastPoint;
  const rangeReturnPct =
    visibleChartPoints.length < 2 ||
    visibleFirstPoint === null ||
    visibleLastPoint === null
      ? null
      : returnForStockChartPoints(visibleFirstPoint, visibleLastPoint);
  const chartTone = toneForSignedValue(rangeReturnPct);
  const chartDates = useMemo(
    () => new Set(chartPoints.map((point) => point.date)),
    [chartPoints],
  );
  const tradeMarkers = useMemo(
    () => buildSymbolTradeMarkers(events, item.symbol),
    [events, item.symbol],
  );
  const plottedTradeMarkers = useMemo(
    () => tradeMarkers.filter((marker) => chartDates.has(marker.date)),
    [chartDates, tradeMarkers],
  );
  const plottedTradeMarkerDates = useMemo(
    () => new Set(plottedTradeMarkers.map((marker) => marker.date)),
    [plottedTradeMarkers],
  );

  useEffect(() => {
    activeRangeRef.current = activeRange;
    if (chartApiRef.current !== null) {
      applyChartRange(chartApiRef.current, chartPoints, activeRange);
    }
  }, [activeRange, chartPoints]);

  useEffect(() => {
    if (!hasPriceHistory) {
      chartApiRef.current = null;
      setChartReady(false);
      return;
    }

    const container = chartContainerRef.current;
    if (container === null) {
      return;
    }

    let disposed = false;
    let cleanupChart: (() => void) | null = null;
    setChartReady(false);
    container.replaceChildren();

    void import("lightweight-charts").then(
      ({
        AreaSeries,
        ColorType,
        CrosshairMode,
        LineStyle,
        createChart,
        createSeriesMarkers,
      }) => {
        if (disposed) {
          return;
        }

        const chartColors = readChartColors(container, chartTone);
        const chart = createChart(container, {
          autoSize: true,
          height: 250,
          layout: {
            attributionLogo: false,
            background: {
              color: chartColors.background,
              type: ColorType.Solid,
            },
            fontFamily:
              "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
            textColor: chartColors.muted,
          },
          grid: {
            horzLines: { color: chartColors.grid },
            vertLines: { color: chartColors.grid },
          },
          rightPriceScale: {
            borderColor: chartColors.border,
            scaleMargins: {
              bottom: 0.16,
              top: 0.14,
            },
            visible: true,
          },
          timeScale: {
            borderColor: chartColors.border,
            fixLeftEdge: true,
            minBarSpacing: compactPriceChartMinBarSpacing,
            rightOffset: 2,
            secondsVisible: false,
            timeVisible: false,
          },
          crosshair: {
            mode: CrosshairMode.Magnet,
            horzLine: {
              color: chartColors.crosshair,
              labelBackgroundColor: chartColors.ink,
              style: LineStyle.Dashed,
              width: 1,
            },
            vertLine: {
              color: chartColors.crosshair,
              labelBackgroundColor: chartColors.ink,
              style: LineStyle.Dashed,
              width: 1,
            },
          },
          handleScroll: {
            horzTouchDrag: true,
            mouseWheel: true,
            pressedMouseMove: true,
            vertTouchDrag: false,
          },
          handleScale: {
            axisDoubleClickReset: true,
            axisPressedMouseMove: true,
            mouseWheel: true,
            pinch: true,
          },
          localization: {
            locale: "en-US",
            priceFormatter: (value: number) => currencyFormatter.format(value),
          },
        });

        const areaSeries = chart.addSeries(AreaSeries, {
          bottomColor: transparentize(chartColors.tone, 0),
          crosshairMarkerBorderColor: chartColors.surface,
          crosshairMarkerBorderWidth: 2,
          crosshairMarkerRadius: 4,
          crosshairMarkerVisible: true,
          crosshairMarkerBackgroundColor: chartColors.tone,
          lastValueVisible: true,
          lineColor: chartColors.tone,
          lineWidth: 2,
          priceFormat: {
            minMove: 0.01,
            precision: 2,
            type: "price",
          },
          priceLineColor: chartColors.tone,
          priceLineStyle: LineStyle.Dotted,
          priceLineVisible: true,
          topColor: transparentize(chartColors.tone, 0.18),
        });

        areaSeries.setData(
          chartPoints.map((point) => ({
            time: point.date as Time,
            value: point.close,
          })),
        );

        createSeriesMarkers(
          areaSeries,
          [
            ...buildAnalysisMarkers(
              item.analysisHistory,
              chartPoints,
              chartColors,
              plottedTradeMarkerDates,
            ),
            ...buildTradeSeriesMarkers(plottedTradeMarkers, chartColors),
          ],
          {
            autoScale: false,
          },
        );

        chartApiRef.current = chart;
        const applyCurrentRange = () =>
          applyChartRange(chart, chartPoints, activeRangeRef.current);
        applyCurrentRange();
        const rangeFrame = window.requestAnimationFrame(applyCurrentRange);
        const rangeTimer = window.setTimeout(applyCurrentRange, 160);
        setChartReady(true);

        cleanupChart = () => {
          window.cancelAnimationFrame(rangeFrame);
          window.clearTimeout(rangeTimer);
          if (chartApiRef.current === chart) {
            chartApiRef.current = null;
          }
          chart.remove();
        };
      },
    ).catch((error: unknown) => {
      if (!disposed) {
        console.error(`Failed to render ${item.symbol} price chart`, error);
      }
    });

    return () => {
      disposed = true;
      cleanupChart?.();
      container.replaceChildren();
    };
  }, [
    chartPoints,
    chartTone,
    hasPriceHistory,
    item.analysisHistory,
    item.symbol,
    marketColorScheme,
    plottedTradeMarkerDates,
    plottedTradeMarkers,
  ]);

  if (!hasPriceHistory || firstPoint === null || lastPoint === null) {
    return (
      <div className="stock-chart-empty">
        <LineChart size={24} />
        <span>Price history pending</span>
      </div>
    );
  }

  return (
    <div className={`stock-chart-wrap chart-wrap-${chartTone}`}>
      <div className="stock-chart-heading">
        <div>
          <span>Price chart</span>
          <strong>
            {formatCurrency(lastPoint.close)} · {lastPoint.date}
          </strong>
        </div>
        <span className={`signed-value signed-value-${chartTone}`}>
          {formatSignedPercent(rangeReturnPct)}
        </span>
      </div>
      <div className="stock-chart-move-row" aria-label={`${item.symbol} recent price moves`}>
        <StockChartMovementPill
          item={item}
          label="1D"
          mode={movementDisplayMode}
          sessionsBack={1}
        />
        <StockChartMovementPill
          item={item}
          label="5D"
          mode={movementDisplayMode}
          sessionsBack={5}
        />
      </div>
      <div className="stock-chart-range-toolbar" aria-label={`${item.symbol} price chart range`}>
        {stockChartRangeOptions.map((range) => (
          <button
            className={
              activeRange === range
                ? "chart-range-button chart-range-button-active"
                : "chart-range-button"
            }
            key={range}
            onClick={() => setActiveRange(range)}
            type="button"
          >
            {range}
          </button>
        ))}
      </div>
      <div className="stock-chart-canvas-shell">
        <div
          ref={chartContainerRef}
          className="stock-chart-canvas"
          role="img"
          aria-label={`${item.symbol} committed daily close price chart`}
        />
        {chartReady ? null : (
          <div className="stock-chart-loading" aria-hidden="true">
            Loading chart
          </div>
        )}
      </div>
      <div className="stock-chart-footer">
        <span>
          {formatDateRange(
            (visibleFirstPoint ?? firstPoint).date,
            (visibleLastPoint ?? lastPoint).date,
          )}
        </span>
        <span>{item.technical?.source ?? "Committed price history"}</span>
      </div>
    </div>
  );
}

function StockChartMovementPill({
  item,
  label,
  mode,
  sessionsBack,
}: {
  item: WatchlistItem;
  label: string;
  mode: MovementDisplayMode;
  sessionsBack: number;
}) {
  const movement = priceMovementForItem(item, sessionsBack);
  const tone = toneForSignedValue(movement?.amount ?? null);

  return (
    <span className={`stock-chart-move-pill stock-chart-move-pill-${tone}`}>
      <small>{label}</small>
      <strong>{formatMovement(movement, mode)}</strong>
    </span>
  );
}

function TradingViewPreview({ item }: { item: WatchlistItem }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(true);
  const tradingViewSymbol = item.security?.tradingViewSymbol ?? "";

  useEffect(() => {
    if (!expanded || tradingViewSymbol === "") {
      return;
    }
    const container = containerRef.current;
    if (container === null) {
      return;
    }

    container.replaceChildren();
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.text = JSON.stringify(
      liveIntradayTradingViewConfig({
        compact: true,
        symbol: tradingViewSymbol,
      }),
    );
    container.append(widget, script);

    return () => {
      container.replaceChildren();
    };
  }, [expanded, tradingViewSymbol]);

  if (tradingViewSymbol === "") {
    return null;
  }

  return (
    <details
      className="tradingview-preview"
      open={expanded}
      onToggle={(event) => setExpanded(event.currentTarget.open)}
    >
      <summary>
        <span className="tradingview-preview-title">
          <SquareArrowOutUpRight size={14} />
          <span>Live 1D TradingView</span>
        </span>
        <span className="tradingview-preview-caption">
          {liveIntradayTradingViewCaption}
        </span>
      </summary>
      <div
        ref={containerRef}
        className="tradingview-widget-container tradingview-widget-container-compact"
      />
    </details>
  );
}

function ResearchBriefSection({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <section className="research-brief-section">
      <h4>{label}</h4>
      <p>{value}</p>
    </section>
  );
}

function latestAnalysisFor(item: WatchlistItem): ResearchAnalysisEntry | null {
  return item.analysisHistory[0] ?? null;
}

function researchPagePath(symbol: string): string {
  return `research/${symbol.toLowerCase()}/`;
}

function watchStatusLabel(status: string): string {
  return watchStatusLabels[status] ?? readableStatusLabel(status);
}

function watchPriorityLabel(priority: string): string {
  return watchPriorityLabels[priority] ?? priority;
}

function analysisStanceLabel(stance: string): string {
  return watchPriorityLabels[stance] ?? watchStatusLabels[stance] ?? stance;
}

function formatWatchPrice(item: WatchlistItem): string {
  if (item.price === null) {
    return item.status === "watch_future" ? "Not tradable" : "No price";
  }

  return `${formatCurrency(item.price)} · ${item.priceAsOf ?? "undated"}`;
}

function analysisCountLabel(count: number): string {
  return count === 1 ? "1 analysis" : `${count} analyses`;
}

function repositoryFileUrl(repositoryUrl: string, sourcePath: string): string {
  const encodedPath = sourcePath.split("/").map(encodeURIComponent).join("/");
  return `${repositoryUrl.replace(/\/$/, "")}/blob/main/${encodedPath}`;
}

function sourceLinkLabel(sourcePath: string): string {
  return sourcePath.split("/").at(-1) ?? sourcePath;
}
