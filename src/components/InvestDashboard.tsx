import {
  Activity,
  BarChart3,
  Database,
  Github,
  LineChart,
  ListChecks,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
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

function formatNumber(value: number | null, digits = 2): string {
  if (value === null) {
    return "Not enough data";
  }
  return value.toFixed(digits);
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
      averageCost: 24,
      costBasis: 480,
      currency: "USD",
      firstTradeDate: "2026-03-07",
      lastTradeDate: "2026-03-07",
      notes: "demo lunar infrastructure position",
    },
    {
      symbol: "RDW",
      assetType: "common_stock",
      exchange: "NYSE",
      quantity: 30,
      averageCost: 12,
      costBasis: 360,
      currency: "USD",
      firstTradeDate: "2026-04-09",
      lastTradeDate: "2026-04-09",
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
      24,
      -480,
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
  ];

  return {
    ...realData,
    accountState: {
      ...realData.accountState,
      asOf: "2026-05-22",
      status: "demo_mode_not_accounting_truth",
      confirmedCash: 283.37,
      settledCash: 283.37,
      buyingPower: 283.37,
      positionsCount: demoPositions.length,
      lastConfirmedLedgerEventId: "demo-013",
      lastReconciledWithBrokerAt: "2026-05-22",
    },
    ledger: demoLedger,
    positions: demoPositions,
    equityCurve: [
      demoPoint("2026-01-31", 902, 888, 1.58, 1.58),
      demoPoint("2026-02-28", 1798, 1776, 1.24, 0.92),
      demoPoint("2026-03-31", 2740, 2664, 2.85, -2.6),
      demoPoint("2026-04-30", 3725, 3552, 4.87, 1.94),
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
  const activeData = useMemo(
    () => (mode === "demo" ? buildDemoData(data) : data),
    [data, mode],
  );
  const metrics = useMemo(() => calculateMetrics(activeData), [activeData]);
  const isDemo = mode === "demo";

  return (
    <div className="invest-shell">
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
            <h1>Long-Term Satellite Portfolio Dashboard</h1>
            <p className="hero-copy">
              Confirmed account records and research state come from the
              repository. Demo data exists only in the browser to test charts,
              operation flow, and metrics.
            </p>
          </div>
          <div className="status-stack">
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
            value={formatPercent(metrics.totalReturnPct)}
          />
          <MetricCard
            icon={<Activity size={20} />}
            label="Sharpe"
            value={formatNumber(metrics.sharpe)}
          />
          <MetricCard
            icon={<BarChart3 size={20} />}
            label="Max drawdown"
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
            <EquityChart points={activeData.equityCurve} />
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
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="metric-card">
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

function EquityChart({ points }: { points: EquityPoint[] }) {
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
  const xStep = (width - padding * 2) / (points.length - 1);
  const toX = (index: number) => padding + index * xStep;
  const toY = (value: number) =>
    height - padding - ((value - min) / range) * (height - padding * 2);
  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(point.totalEquity)}`,
    )
    .join(" ");
  const areaPath = `${path} L ${toX(points.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`;
  const gridValues = [0.25, 0.5, 0.75].map((ratio) => min + range * ratio);

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Portfolio equity curve"
      >
        <defs>
          <linearGradient id="equity-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#18a999" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#18a999" stopOpacity="0" />
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
              cx={toX(index)}
              cy={toY(point.totalEquity)}
              r="5"
            />
            <text
              className="chart-date"
              x={toX(index)}
              y={height - 8}
              textAnchor="middle"
            >
              {point.date.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
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

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Shares</th>
            <th>Avg Cost</th>
            <th>Last Price</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.positions.map((position) => {
            const price = priceForSymbol(data, position.symbol);
            const value = marketValueForPosition(data, position);
            return (
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
            <strong>{operationTitle(event)}</strong>
            <span>{operationDetail(event)}</span>
          </li>
        ))}
    </ol>
  );
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
