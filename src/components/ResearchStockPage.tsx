import { BookOpen, ExternalLink, Home, LineChart, SquareArrowOutUpRight } from "lucide-react";
import type { IChartApi, Time } from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ResearchAnalysisEntry, WatchlistItem } from "../lib/portfolioData";

interface Props {
  item: WatchlistItem;
  publicUrl: string;
  repositoryUrl: string;
}

type ChartRange = "1M" | "3M" | "6M" | "YTD" | "1Y" | "3Y" | "5Y" | "ALL";
type ValueTone = "gain" | "loss" | "neutral";

interface StockChartPoint {
  date: string;
  close: number;
}

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
const chartVisibleLeftPadding = 1.05;
const chartVisibleRightPadding = 0.25;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 2,
  style: "currency",
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 1,
  notation: "compact",
  style: "currency",
});

const roundedCurrencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  notation: "compact",
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
  style: "percent",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export default function ResearchStockPage({ item, publicUrl, repositoryUrl }: Props) {
  const latest = item.analysisHistory[0] ?? null;
  const tradingViewUrl = item.security?.tradingViewUrl ?? "";
  const stockAnalysisUrl = item.security?.stockAnalysisUrl ?? "";

  return (
    <div className="invest-shell research-page-shell" data-market-colors="mainland">
      <main className="research-page">
        <nav className="research-page-nav" aria-label="Research page navigation">
          <a href={publicUrl}>
            <Home size={16} />
            <span>Dashboard</span>
          </a>
          <a href={repositoryUrl} rel="noreferrer" target="_blank">
            <ExternalLink size={16} />
            <span>Repository</span>
          </a>
          {tradingViewUrl === "" ? null : (
            <a href={tradingViewUrl} rel="noreferrer" target="_blank">
              <SquareArrowOutUpRight size={16} />
              <span>TradingView</span>
            </a>
          )}
          {stockAnalysisUrl === "" ? null : (
            <a href={stockAnalysisUrl} rel="noreferrer" target="_blank">
              <ExternalLink size={16} />
              <span>StockAnalysis</span>
            </a>
          )}
        </nav>

        <header className="research-page-hero">
          <div>
            <p className="eyebrow">Research brief</p>
            <h1>{item.symbol}</h1>
            <p>{item.name}</p>
          </div>
          <div className="research-page-price">
            <span>Latest committed close</span>
            <strong>{formatCurrency(item.price)}</strong>
            <small>{item.priceAsOf ?? "No dated price"}</small>
          </div>
        </header>

        <section className="research-page-grid">
          <article className="research-page-main">
            <StockPageChart item={item} />
            <TradingViewPreview item={item} />
          </article>

          <aside className="research-page-side">
            <MarketFacts item={item} />
            <ResearchSnapshot item={item} latest={latest} />
          </aside>
        </section>

        <section className="research-page-history">
          <div className="analysis-history-heading">
            <BookOpen size={16} />
            <span>Analysis history</span>
          </div>
          {item.analysisHistory.length === 0 ? (
            <p>No structured analysis entries yet.</p>
          ) : (
            <ol className="analysis-timeline">
              {item.analysisHistory.map((entry) => (
                <li key={entry.id}>
                  <span className="analysis-date">{entry.analyzedAt}</span>
                  <strong>{entry.title}</strong>
                  <span className="analysis-meta">
                    {entry.stance} · {readableStatusLabel(entry.analysisType)} ·{" "}
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
        </section>
      </main>
    </div>
  );
}

function StockPageChart({ item }: { item: WatchlistItem }) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartApiRef = useRef<IChartApi | null>(null);
  const activeRangeRef = useRef<ChartRange>("1Y");
  const [chartReady, setChartReady] = useState(false);
  const [activeRange, setActiveRange] = useState<ChartRange>("1Y");
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
          height: 420,
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
              bottom: 0.14,
              top: 0.12,
            },
            visible: true,
          },
          timeScale: {
            borderColor: chartColors.border,
            fixLeftEdge: true,
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
          topColor: transparentize(chartColors.tone, 0.2),
        });

        areaSeries.setData(
          chartPoints.map((point) => ({
            time: point.date as Time,
            value: point.close,
          })),
        );

        createSeriesMarkers(
          areaSeries,
          buildAnalysisMarkers(item.analysisHistory, chartPoints, chartColors),
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
        console.error(`Failed to render ${item.symbol} research chart`, error);
      }
    });

    return () => {
      disposed = true;
      cleanupChart?.();
      container.replaceChildren();
    };
  }, [chartPoints, chartTone, hasPriceHistory, item.analysisHistory, item.symbol]);

  if (!hasPriceHistory || firstPoint === null || lastPoint === null) {
    return (
      <div className="research-page-chart-empty">
        <LineChart size={32} />
        <strong>Price history pending</strong>
      </div>
    );
  }

  return (
    <section className={`research-page-chart chart-wrap-${chartTone}`}>
      <div className="research-page-chart-heading">
        <div>
          <p className="eyebrow">Committed price history</p>
          <h2>{item.symbol} daily close</h2>
          <span>
            {formatShortDate(firstPoint.date)} - {formatShortDate(lastPoint.date)}
          </span>
        </div>
        <div className="research-page-chart-latest">
          <span>Latest</span>
          <strong>{formatCurrency(lastPoint.close)}</strong>
          <small className={`signed-value signed-value-${chartTone}`}>
            {formatSignedPercent(rangeReturnPct)}
          </small>
        </div>
      </div>
      <div className="chart-range-toolbar" aria-label={`${item.symbol} chart range`}>
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
      <div className="research-page-chart-canvas-shell">
        <div
          ref={chartContainerRef}
          className="research-page-chart-canvas"
          role="img"
          aria-label={`${item.symbol} interactive committed daily close price chart`}
        />
        {chartReady ? null : (
          <div className="stock-chart-loading" aria-hidden="true">
            Loading chart
          </div>
        )}
      </div>
    </section>
  );
}

function TradingViewPreview({ item }: { item: WatchlistItem }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
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
    script.text = JSON.stringify({
      allow_symbol_change: false,
      autosize: true,
      calendar: false,
      details: true,
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      interval: "D",
      locale: "en",
      save_image: false,
      style: "1",
      symbol: tradingViewSymbol,
      theme: "light",
      timezone: "Etc/UTC",
      withdateranges: true,
    });
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
      className="research-page-tradingview"
      onToggle={(event) => setExpanded(event.currentTarget.open)}
    >
      <summary>
        <SquareArrowOutUpRight size={16} />
        <span>Live TradingView preview</span>
      </summary>
      <div ref={containerRef} className="tradingview-widget-container" />
    </details>
  );
}

function MarketFacts({ item }: { item: WatchlistItem }) {
  const metrics = item.metrics;
  const technical = item.technical;

  return (
    <section className="research-page-card">
      <p className="eyebrow">Market facts</p>
      <div className="research-page-facts">
        <Fact label="Market cap" value={formatCompactCurrency(metrics?.marketCap ?? null)} />
        <Fact label="Enterprise value" value={formatCompactCurrency(metrics?.enterpriseValue ?? null)} />
        <Fact label="TTM revenue" value={formatCompactCurrency(metrics?.ttmRevenue ?? null)} />
        <Fact label="Revenue growth" value={formatSignedPercent(metrics?.revenueGrowthYoy ?? null)} />
        <Fact label="Gross margin" value={formatPlainPercent(metrics?.grossMarginTtm ?? null)} />
        <Fact label="Operating margin" value={formatPlainPercent(metrics?.operatingMarginTtm ?? null)} />
        <Fact label="P/S" value={formatRatio(metrics?.priceToSales ?? null)} />
        <Fact label="EV/S" value={formatRatio(metrics?.enterpriseValueToSales ?? null)} />
        <Fact label="P/E" value={formatRatio(metrics?.peRatio ?? null)} />
        <Fact label="SMA 50" value={formatRoundedCurrency(technical?.sma50 ?? null)} />
        <Fact label="SMA 200" value={formatRoundedCurrency(technical?.sma200 ?? null)} />
        <Fact label="RSI 14" value={formatPlainNumber(technical?.rsi14 ?? null, 1)} />
        <Fact label="52w high" value={formatRoundedCurrency(technical?.fiftyTwoWeekHigh ?? null)} />
        <Fact label="52w low" value={formatRoundedCurrency(technical?.fiftyTwoWeekLow ?? null)} />
        <Fact label="52w position" value={formatPlainPercent(technical?.positionIn52WeekRangePct ?? null)} />
        <Fact label="Volume" value={formatCompactNumber(technical?.volume ?? null)} />
      </div>
      <p className="research-page-source-note">
        Market data: {technical?.source ?? "pending"}. Fundamentals:{" "}
        {metrics?.source ?? "pending"} as of {metrics?.sourcePublishedAt ?? "pending"}.
      </p>
    </section>
  );
}

function ResearchSnapshot({
  item,
  latest,
}: {
  item: WatchlistItem;
  latest: ResearchAnalysisEntry | null;
}) {
  return (
    <section className="research-page-card">
      <p className="eyebrow">Research state</p>
      <div className="research-page-snapshot">
        <Fact label="Status" value={readableStatusLabel(item.status)} />
        <Fact label="Priority" value={item.priority} />
        <Fact label="Baseline" value={item.latestBaselineDate || "Pending"} />
        <Fact label="Next check" value={latest?.nextCheck ?? item.nextReviewTrigger} />
      </div>
      <ResearchBlock label="Thesis" value={latest?.summary ?? item.notes} />
      <ResearchBlock label="Upside path" value={latest?.upsidePath ?? item.initialRole} />
      <ResearchBlock label="Risk watch" value={latest?.riskWatch ?? "No structured risk note yet."} />
    </section>
  );
}

function ResearchBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="research-page-block">
      <h3>{label}</h3>
      <p>{value}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function buildAnalysisMarkers(
  entries: ResearchAnalysisEntry[],
  points: StockChartPoint[],
  colors: ChartColors,
) {
  const usedDates = new Set<string>();
  return entries
    .map((entry) => nearestStockPointOnOrBefore(points, entry.analyzedAt))
    .filter((point): point is StockChartPoint => point !== null)
    .filter((point) => {
      if (usedDates.has(point.date)) {
        return false;
      }
      usedDates.add(point.date);
      return true;
    })
    .map((point) => ({
      color: colors.mixed,
      position: "aboveBar" as const,
      shape: "circle" as const,
      size: 1,
      text: "A",
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

interface ChartColors {
  background: string;
  border: string;
  crosshair: string;
  grid: string;
  ink: string;
  mixed: string;
  muted: string;
  surface: string;
  tone: string;
}

function readChartColors(element: HTMLElement, chartTone: ValueTone): ChartColors {
  const gain = readCssVariable(element, "--gain", "#c94431");
  const loss = readCssVariable(element, "--loss", "#237a48");
  const neutralTone = readCssVariable(element, "--muted", "#63716b");

  return {
    background: readCssVariable(element, "--surface", "#ffffff"),
    border: readCssVariable(element, "--border", "#d8e3df"),
    crosshair: "rgba(23, 32, 29, 0.42)",
    grid: "rgba(99, 113, 107, 0.16)",
    ink: readCssVariable(element, "--ink", "#17201d"),
    mixed: readCssVariable(element, "--indigo", "#4f57c8"),
    muted: readCssVariable(element, "--muted", "#63716b"),
    surface: readCssVariable(element, "--surface", "#ffffff"),
    tone:
      chartTone === "gain" ? gain : chartTone === "loss" ? loss : neutralTone,
  };
}

function readCssVariable(element: HTMLElement, name: string, fallback: string): string {
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

  const lastPoint = points[points.length - 1];
  const cutoff = chartRangeCutoff(lastPoint.date, range);
  const firstVisibleIndex = points.findIndex(
    (point) => Date.parse(point.date) >= cutoff,
  );
  return firstVisibleIndex === -1 ? 0 : firstVisibleIndex;
}

function chartRangeCutoff(
  lastDate: string,
  range: Exclude<ChartRange, "ALL">,
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

function returnForStockChartPoints(
  firstPoint: StockChartPoint,
  lastPoint: StockChartPoint,
): number | null {
  return firstPoint.close > 0
    ? ((lastPoint.close - firstPoint.close) / firstPoint.close) * 100
    : null;
}

function toneForSignedValue(value: number | null): ValueTone {
  if (value === null || value === 0) {
    return "neutral";
  }
  return value > 0 ? "gain" : "loss";
}

function formatCurrency(value: number | null): string {
  return value === null ? "N/A" : currencyFormatter.format(value);
}

function formatCompactCurrency(value: number | null): string {
  return value === null ? "N/A" : compactCurrencyFormatter.format(value);
}

function formatRoundedCurrency(value: number | null): string {
  return value === null ? "N/A" : roundedCurrencyFormatter.format(value);
}

function formatCompactNumber(value: number | null): string {
  return value === null ? "N/A" : compactNumberFormatter.format(value);
}

function formatRatio(value: number | null): string {
  return value === null ? "N/M" : `${value.toFixed(value >= 100 ? 0 : 1)}x`;
}

function formatPlainNumber(value: number | null, digits = 2): string {
  return value === null ? "N/A" : value.toFixed(digits);
}

function formatPlainPercent(value: number | null): string {
  return value === null ? "N/A" : percentFormatter.format(value / 100);
}

function formatSignedPercent(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  const formatted = percentFormatter.format(Math.abs(value) / 100);
  return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted;
}

function formatShortDate(date: string): string {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  return Number.isNaN(timestamp) ? date : shortDateFormatter.format(timestamp);
}

function readableStatusLabel(status: string): string {
  return status
    .split("_")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function repositoryFileUrl(repositoryUrl: string, filePath: string): string {
  return `${repositoryUrl}/blob/main/${filePath}`;
}

function sourceLinkLabel(path: string): string {
  return path.split("/").at(-1) ?? path;
}
