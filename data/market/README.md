# Market Data

This directory stores market snapshots used by the public dashboard and dated research records.

Market snapshots can be refreshed without changing the confirmed account ledger. They are evidence for display and decision support, not broker-confirmed cash or position records.

Every market snapshot must include the market data timestamp and retrieval timestamp.

Daily automation:

- `npm run refresh:market` refreshes latest available daily close prices for current tradable snapshot symbols and confirmed holdings.
- The GitHub Actions workflow `.github/workflows/daily-market-data.yml` runs the same script on a weekday schedule and commits only when data actually changes.
- The current provider is Stooq daily close data. Prices are not realtime quotes.
- If a held symbol cannot be priced, the automation fails rather than committing a partial equity valuation.
