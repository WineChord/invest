import {
  Activity,
  BarChart3,
  Database,
  Github,
  LineChart,
  ListChecks,
  Palette,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type {
  EquityPoint,
  LedgerEvent,
  PortfolioData,
  PositionRecord,
  WatchlistItem,
} from "../lib/portfolioData";

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
type ValueTone = "gain" | "loss" | "neutral";

interface TradeMarker {
  id: string;
  date: string;
  left: number;
  top: number;
  tone: "buy" | "sell" | "mixed";
  label: string;
  trades: LedgerEvent[];
}

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

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
  style: "percent",
});

const marketColorStorageKey = "winechord-invest-market-colors";
const defaultMarketColorScheme: MarketColorScheme = "mainland";

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

function formatCurrency(value: number | null): string {
  return value === null
    ? "Pending confirmation"
    : currencyFormatter.format(value);
}

function formatCompactCurrency(value: number | null): string {
  return value === null ? "Pending" : compactCurrencyFormatter.format(value);
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

  return (
    <div className="invest-shell" data-market-colors={marketColorScheme}>
      <header className="invest-topbar">
        <a
          className="brand"
          href={activeData.publicUrl}
          aria-label="WineChord Invest home"
        >
          <span className="brand-mark">W</span>
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
            title="GitHub repository"
          >
            <Github size={18} />
            <span>Open source</span>
          </a>
          <button
            className="mode-button preference-button"
            type="button"
            onClick={() => setMarketColorScheme(nextMarketColorScheme)}
            title={`Switch to ${marketColorDescription(nextMarketColorScheme)}`}
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
            title="Restore committed repository data"
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
            title="Inject browser-only demo data"
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
              <BalanceRow
                label="Status"
                value={activeData.accountState.status}
              />
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
          <WatchlistTable items={activeData.watchlist} />
        </Panel>
      </main>
    </div>
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

function EquityChart({
  points,
  events,
}: {
  points: EquityPoint[];
  events: LedgerEvent[];
}) {
  if (points.length < 2) {
    return (
      <div className="empty-chart">
        <LineChart size={40} />
        <strong>Waiting for the first equity curve</strong>
        <span>
          After confirmed deposits and executions, the real curve will appear
          here.
        </span>
      </div>
    );
  }

  const width = 760;
  const height = 280;
  const padding = 32;
  const values = points.map((point) => point.totalEquity);
  const min = Math.min(...values) * 0.96;
  const max = Math.max(...values) * 1.04;
  const range = Math.max(max - min, 1);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const chartReturnPct =
    lastPoint.cumulativeDeposits !== null && lastPoint.cumulativeDeposits > 0
      ? ((lastPoint.totalEquity - lastPoint.cumulativeDeposits) /
          lastPoint.cumulativeDeposits) *
        100
      : lastPoint.totalEquity === firstPoint.totalEquity
        ? 0
        : ((lastPoint.totalEquity - firstPoint.totalEquity) /
            firstPoint.totalEquity) *
          100;
  const chartTone = toneForSignedValue(chartReturnPct);
  const tradeEvents = events.filter(isTradeEvent);
  const pointTimes = points.map((point) => Date.parse(point.date));
  const tradeTimes = tradeEvents
    .map((event) => Date.parse(event.tradeDate || event.createdAt))
    .filter(Number.isFinite);
  const minTime = Math.min(...pointTimes, ...tradeTimes);
  const maxTime = Math.max(...pointTimes, ...tradeTimes);
  const timeRange = Math.max(maxTime - minTime, 1);
  const toX = (date: string) =>
    padding +
    ((Date.parse(date) - minTime) / timeRange) * (width - padding * 2);
  const toY = (value: number) =>
    height - padding - ((value - min) / range) * (height - padding * 2);
  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${toX(point.date)} ${toY(point.totalEquity)}`,
    )
    .join(" ");
  const areaPath = `${path} L ${toX(lastPoint.date)} ${height - padding} L ${toX(firstPoint.date)} ${height - padding} Z`;
  const gridValues = [0.25, 0.5, 0.75].map((ratio) => min + range * ratio);
  const dateLabelIndexes = buildDateLabelIndexes(points, toX);
  const markers = buildTradeMarkers({
    events: tradeEvents,
    height,
    points,
    toX,
    toY,
    width,
  });

  return (
    <div className={`chart-wrap chart-wrap-${chartTone}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Portfolio equity curve"
      >
        <defs>
          <linearGradient id="equity-fill" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--chart-tone)"
              stopOpacity="0.24"
            />
            <stop offset="100%" stopColor="var(--chart-tone)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridValues.map((value) => (
          <g key={value}>
            <line
              className="chart-grid"
              x1={padding}
              x2={width - padding}
              y1={toY(value)}
              y2={toY(value)}
            />
            <text className="chart-label" x={padding} y={toY(value) - 6}>
              {compactCurrencyFormatter.format(value)}
            </text>
          </g>
        ))}
        <path className="chart-area" d={areaPath} />
        <path className="chart-line" d={path} />
        {points.map((point, index) => (
          <g key={point.date}>
            <circle
              className="chart-dot"
              cx={toX(point.date)}
              cy={toY(point.totalEquity)}
              r="5"
            />
            {dateLabelIndexes.has(index) ? (
              <text
                className="chart-date"
                x={toX(point.date)}
                y={height - 8}
                textAnchor="middle"
              >
                {point.date.slice(5)}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      <div className="chart-summary" aria-label="Equity curve summary">
        <span>
          Latest <strong>{formatCurrency(lastPoint.totalEquity)}</strong>
        </span>
        <span className={`signed-value signed-value-${chartTone}`}>
          {formatSignedPercent(chartReturnPct)}
        </span>
      </div>
      {markers.map((marker) => {
        const markerStyle = {
          "--marker-left": `${marker.left}%`,
          "--marker-top": `${marker.top}%`,
        } as CSSProperties;

        return (
          <button
            aria-label={tradeMarkerAriaLabel(marker)}
            className={`trade-marker trade-marker-${marker.tone} ${tradeMarkerPlacementClasses(marker)}`}
            key={marker.id}
            style={markerStyle}
            type="button"
          >
            <span className="trade-marker-label">{marker.label}</span>
            <TradeTooltip marker={marker} />
          </button>
        );
      })}
    </div>
  );
}

function isTradeEvent(event: LedgerEvent): boolean {
  return (
    event.eventType === "trade" &&
    (event.side === "buy" || event.side === "sell") &&
    event.symbol !== "" &&
    event.quantity !== null &&
    event.averagePrice !== null
  );
}

function buildTradeMarkers({
  events,
  height,
  points,
  toX,
  toY,
  width,
}: {
  events: LedgerEvent[];
  height: number;
  points: EquityPoint[];
  toX: (date: string) => number;
  toY: (value: number) => number;
  width: number;
}): TradeMarker[] {
  const tradesByDate = new Map<string, LedgerEvent[]>();
  events.forEach((event) => {
    const date = event.tradeDate || event.createdAt;
    const trades = tradesByDate.get(date) ?? [];
    trades.push(event);
    tradesByDate.set(date, trades);
  });

  return [...tradesByDate.entries()]
    .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
    .map(([date, trades]) => {
      const sides = new Set(trades.map((trade) => trade.side));
      const tone =
        sides.size > 1 ? "mixed" : sides.has("sell") ? "sell" : "buy";
      const label = tone === "mixed" ? "T" : tone === "sell" ? "S" : "B";
      const x = toX(date);
      const y = toY(interpolateEquity(points, date));
      return {
        date,
        id: `trade-${date}`,
        label,
        left: clamp((x / width) * 100, 5, 95),
        tone,
        top: clamp((y / height) * 100 - 8, 8, 82),
        trades,
      };
    });
}

function interpolateEquity(points: EquityPoint[], date: string): number {
  const targetTime = Date.parse(date);
  const sortedPoints = points
    .slice()
    .sort((left, right) => left.date.localeCompare(right.date));

  if (targetTime <= Date.parse(sortedPoints[0].date)) {
    return sortedPoints[0].totalEquity;
  }

  const lastPoint = sortedPoints[sortedPoints.length - 1];
  if (targetTime >= Date.parse(lastPoint.date)) {
    return lastPoint.totalEquity;
  }

  for (let index = 1; index < sortedPoints.length; index += 1) {
    const previous = sortedPoints[index - 1];
    const next = sortedPoints[index];
    const previousTime = Date.parse(previous.date);
    const nextTime = Date.parse(next.date);
    if (targetTime <= nextTime) {
      const progress = (targetTime - previousTime) / (nextTime - previousTime);
      return (
        previous.totalEquity +
        (next.totalEquity - previous.totalEquity) * progress
      );
    }
  }

  return lastPoint.totalEquity;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function tradeMarkerAriaLabel(marker: TradeMarker): string {
  const summary = marker.trades
    .map(
      (trade) =>
        `${trade.side.toUpperCase()} ${trade.quantity} ${trade.symbol} at ${formatCurrency(trade.averagePrice)}`,
    )
    .join(", ");
  return `${marker.date}: ${summary}`;
}

function buildDateLabelIndexes(
  points: EquityPoint[],
  toX: (date: string) => number,
): Set<number> {
  const minimumGap = 78;
  const indexes: number[] = [0];

  if (points.length <= 6) {
    for (let index = 1; index < points.length; index += 1) {
      const previousIndex = indexes[indexes.length - 1];
      if (
        toX(points[index].date) - toX(points[previousIndex].date) >=
        minimumGap
      ) {
        indexes.push(index);
      }
    }
    return new Set(indexes);
  }

  const interiorCount = points.length - 2;
  const interval = Math.max(1, Math.ceil(interiorCount / 4));
  for (let index = interval; index < points.length - 1; index += interval) {
    const previousIndex = indexes[indexes.length - 1];
    if (
      toX(points[index].date) - toX(points[previousIndex].date) >=
      minimumGap
    ) {
      indexes.push(index);
    }
  }

  const lastIndex = points.length - 1;
  while (
    indexes.length > 1 &&
    toX(points[lastIndex].date) -
      toX(points[indexes[indexes.length - 1]].date) <
      minimumGap
  ) {
    indexes.pop();
  }
  indexes.push(lastIndex);

  return new Set(indexes);
}

function tradeMarkerPlacementClasses(marker: TradeMarker): string {
  const classes: string[] = [];

  if (marker.left < 30) {
    classes.push("trade-marker-edge-left");
  } else if (marker.left > 70) {
    classes.push("trade-marker-edge-right");
  }

  if (marker.top < 26) {
    classes.push("trade-marker-tooltip-below");
  }

  return classes.join(" ");
}

function TradeTooltip({ marker }: { marker: TradeMarker }) {
  return (
    <span className="trade-tooltip">
      <span className="trade-tooltip-heading">
        <span>{marker.date}</span>
        <strong>{tradeGroupLabel(marker)}</strong>
      </span>
      <span className="trade-tooltip-list">
        {marker.trades.map((trade) => (
          <span className="trade-tooltip-row" key={trade.eventId}>
            <span className={`trade-side trade-side-${trade.side}`}>
              {trade.side.toUpperCase()}
            </span>
            <strong>{trade.symbol}</strong>
            <span>{formatTradeQuantity(trade.quantity)} shares</span>
            <span>@ {formatCurrency(trade.averagePrice)}</span>
            <span>{formatCurrency(Math.abs(trade.netCashEffect ?? 0))}</span>
          </span>
        ))}
      </span>
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
            <div className="operation-row">
              <span className="operation-date">
                {event.tradeDate || event.createdAt}
              </span>
              <span
                className={`operation-badge operation-badge-${operationTone(event)}`}
              >
                {operationBadgeLabel(event)}
              </span>
            </div>
            <strong>{operationTitle(event)}</strong>
            <span>{operationDetail(event)}</span>
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

function WatchlistTable({ items }: { items: WatchlistItem[] }) {
  return (
    <div className="watchlist-grid">
      {items.map((item) => (
        <article className="watch-card" key={item.symbol}>
          <div>
            <strong>{item.symbol}</strong>
            <span>{item.name}</span>
          </div>
          <p>{item.theme}</p>
          <footer>
            <span className="rank">{item.priority}</span>
            <span>{item.status.replaceAll("_", " ")}</span>
            <span>
              {item.price === null
                ? "No price"
                : `${formatCurrency(item.price)} - ${item.priceAsOf}`}
            </span>
          </footer>
        </article>
      ))}
    </div>
  );
}
