# invest

This repository is a portable operating system for a long-term satellite investment account.

The account objective is multi-decade asymmetric compounding: pursue outcomes that can plausibly become tens, hundreds, or thousands of times larger over a very long horizon, while avoiding avoidable ruin. The default planned monthly contribution is USD 888.

Public dashboard: [www.wineandchord.com/invest](https://www.wineandchord.com/invest/). It is built from this open-source repository and deployed as a static GitHub Pages project site.

Start here:

1. Read [AGENTS.md](AGENTS.md) for the rules every future agent must follow.
2. Read [SPEC.md](SPEC.md) for the full portfolio system design.
3. Read [policy-v1.1.md](data/policy/policy-v1.1.md) for the current investment policy.
4. Use [templates/monthly-decision.md](templates/monthly-decision.md) when asking for a monthly buy, sell, hold-cash, or SGOV liquidity-reserve plan.
5. Use [templates/execution-confirmation.md](templates/execution-confirmation.md) after trades or deposits are actually completed.
6. Use [templates/filing-review.md](templates/filing-review.md) when a material SEC filing or official report appears.
7. Use [templates/research-engine-run.md](templates/research-engine-run.md) when running the discovery, freshness, valuation, and cleanup loop.
8. Run `npm run dev` to preview the public dashboard locally.

Repository state:

- Confirmed positions: empty.
- Confirmed cash balance: unknown until the first broker-confirmed deposit or account snapshot is provided.
- Confirmed ledger events: none.
- Current policy: [policy-v1.1.md](data/policy/policy-v1.1.md), which allows SGOV or a materially equivalent short-duration U.S. Treasury reserve for cash management only.
- Initial research baseline: [research/2026-05-26-initial-baseline.md](research/2026-05-26-initial-baseline.md).
- Initial simulated decision: [decisions/2026-05-26-initial-simulation.md](decisions/2026-05-26-initial-simulation.md).

Research engine state:

- Potential new public candidates: [research/discovery/candidates.csv](research/discovery/candidates.csv).
- Material freshness events: [research/freshness/events.csv](research/freshness/events.csv).
- Valuation and entry states: [research/valuation-states.csv](research/valuation-states.csv).
- Research health metrics: [research/quality-metrics.yml](research/quality-metrics.yml).
- Completed filing reviews: [research/filings](research/filings).

## Dashboard

```bash
npm ci
npm run dev
```

Build and verify:

```bash
npm run verify
```

The dashboard defaults to committed real data. Because the account currently has no confirmed transactions, the real view intentionally shows empty holdings and empty performance. The "Demo data" control switches to browser-only demo data for testing charts, operation history, Sharpe ratio, drawdown, and holding tables. "Real data" switches back to committed repository data without changing files.

Daily market data refresh:

```bash
npm run refresh:market -- --dry-run
```

GitHub Actions runs the same close-price refresh on a weekday schedule. It updates `data/market/watchlist_prices.csv` from daily close data and updates `data/account/equity_curve.csv` only after confirmed positions and confirmed cash exist.
