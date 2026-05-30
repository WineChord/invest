# Market Data

This directory stores market snapshots used by the public dashboard and dated research records.

Market snapshots can be refreshed without changing the confirmed account ledger. They are evidence for display and decision support, not broker-confirmed cash or position records.

Every market snapshot must include the market data timestamp and retrieval timestamp.

Committed files:

- `security_master.csv` maps research symbols to tradability, exchange, SEC CIK, and external chart/research URLs.
- `price_history.csv` stores committed daily OHLCV history for tradable watchlist names.
- `technical_snapshots.csv` stores derived display metrics such as 1M/YTD/1Y return, 52-week range, SMA, RSI, and volume.
- `company_metrics.csv` stores SEC-derived fundamentals combined with the latest committed close price for valuation ratios.
- `watchlist_prices.csv` stores the latest committed close snapshot used by compact dashboard surfaces.

Daily automation:

- `npm run refresh:market` refreshes latest available daily OHLCV history for current tradable research symbols and confirmed holdings, then derives latest close snapshots, technical snapshots, and SEC company metrics.
- The GitHub Actions workflow `.github/workflows/daily-market-data.yml` runs the same script on a weekday schedule and commits only when data actually changes.
- The current price-history provider is Yahoo Finance chart data. The refresh script uses Node `fetch` first and can fall back to `curl` when the provider rejects the Node request but serves the same chart JSON to a standard HTTP client. SEC company facts come from the SEC EDGAR companyfacts API. Prices are not realtime quotes.
- If a held symbol cannot be priced, the automation fails rather than committing a partial equity valuation.
