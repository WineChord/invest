const tradingViewIntradayInterval = "1";
const tradingViewIntradayRange = "1D";
const tradingViewSessionId = "extended";
const preMarketBackground = "rgba(73, 91, 210, 0.06)";
const postMarketBackground = "rgba(203, 75, 54, 0.06)";

export const liveIntradayTradingViewCaption =
  "Extended hours when available · exchange time";

interface LiveIntradayTradingViewConfigOptions {
  compact: boolean;
  symbol: string;
}

export function liveIntradayTradingViewConfig({
  compact,
  symbol,
}: LiveIntradayTradingViewConfigOptions) {
  return {
    allow_symbol_change: false,
    autosize: true,
    calendar: false,
    details: !compact,
    enabled_features: ["pre_post_market_sessions"],
    hide_legend: compact,
    hide_side_toolbar: compact,
    hide_top_toolbar: compact,
    hide_volume: false,
    interval: tradingViewIntradayInterval,
    locale: "en",
    overrides: {
      "backgrounds.postMarket.color": postMarketBackground,
      "backgrounds.preMarket.color": preMarketBackground,
      "mainSeriesProperties.sessionId": tradingViewSessionId,
    },
    range: tradingViewIntradayRange,
    save_image: false,
    style: "1",
    symbol,
    theme: "light",
    timezone: "exchange",
    withdateranges: !compact,
  };
}
