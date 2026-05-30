import type { SeriesMarker, Time } from "lightweight-charts";
import type { LedgerEvent } from "./portfolioData";

export type TradeMarkerTone = "buy" | "sell" | "mixed";

export interface TradeMarker {
  id: string;
  date: string;
  tone: TradeMarkerTone;
  label: string;
  trades: LedgerEvent[];
}

interface TradeMarkerColors {
  buy: string;
  mixed: string;
  sell: string;
}

export function isTradeEvent(event: LedgerEvent): boolean {
  return (
    event.eventType === "trade" &&
    (event.side === "buy" || event.side === "sell") &&
    event.symbol !== "" &&
    event.quantity !== null &&
    event.averagePrice !== null
  );
}

export function buildTradeMarkers(events: LedgerEvent[]): TradeMarker[] {
  const tradesByDate = new Map<string, LedgerEvent[]>();
  events.filter(isTradeEvent).forEach((event) => {
    const date = event.tradeDate;
    if (date === "") {
      return;
    }

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
      return {
        date,
        id: `trade-${date}`,
        label,
        tone,
        trades,
      };
    });
}

export function buildSymbolTradeMarkers(
  events: LedgerEvent[],
  symbol: string,
): TradeMarker[] {
  const normalizedSymbol = symbol.trim().toUpperCase();
  return buildTradeMarkers(
    events.filter(
      (event) => event.symbol.trim().toUpperCase() === normalizedSymbol,
    ),
  );
}

export function buildTradeSeriesMarkers(
  markers: TradeMarker[],
  colors: TradeMarkerColors,
): SeriesMarker<Time>[] {
  return markers.map((marker) => ({
    color:
      marker.tone === "buy"
        ? colors.buy
        : marker.tone === "sell"
          ? colors.sell
          : colors.mixed,
    id: marker.id,
    position: marker.tone === "sell" ? "aboveBar" : "belowBar",
    shape:
      marker.tone === "buy"
        ? "arrowUp"
        : marker.tone === "sell"
          ? "arrowDown"
          : "circle",
    size: 1,
    text: marker.label,
    time: marker.date as Time,
  }));
}
