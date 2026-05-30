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
8. Use [templates/full-operating-cycle.md](templates/full-operating-cycle.md) when asking the agent to run the whole repository flow or execute every applicable workflow.
9. Run `npm run dev` to preview the public dashboard locally.

Repository state:

- Confirmed positions: empty.
- Confirmed cash balance: USD 888.
- Confirmed ledger events: one deposit event on 2026-05-30.
- Current policy: [policy-v1.1.md](data/policy/policy-v1.1.md), which allows SGOV or a materially equivalent short-duration U.S. Treasury reserve for cash management only.
- Initial research baseline: [research/2026-05-26-initial-baseline.md](research/2026-05-26-initial-baseline.md).
- Initial simulated decision: [decisions/2026-05-26-initial-simulation.md](decisions/2026-05-26-initial-simulation.md).
- Latest ready-state refresh: [research/2026-05-30-ready-state-refresh.md](research/2026-05-30-ready-state-refresh.md).

Research engine state:

- Potential new public candidates: [research/discovery/candidates.csv](research/discovery/candidates.csv).
- Material freshness events: [research/freshness/events.csv](research/freshness/events.csv).
- Valuation and entry states: [research/valuation-states.csv](research/valuation-states.csv).
- Research health metrics: [research/quality-metrics.yml](research/quality-metrics.yml).
- Completed filing reviews: [research/filings](research/filings).

Decision requests are full operating-cycle triggers. When the user reports new cash or asks what to buy, sell, hold, use as SGOV reserve, or allocate, future agents must run the full decision operating cycle from [AGENTS.md](AGENTS.md), [SPEC.md](SPEC.md), and [templates/monthly-decision.md](templates/monthly-decision.md) before proposing orders. The cycle refreshes market data, scans discovery candidates and mission-relevant new public names, checks SEC/IR freshness, reviews filing and valuation coverage, runs applicable risk and regime checks, performs repository cleanup, validates changed surfaces, and reports decision readiness.

Full-cycle requests go further. When the user asks to run the whole repository flow, execute everything, do a full refresh, or uses equivalent language such as "全量执行", future agents must use [templates/full-operating-cycle.md](templates/full-operating-cycle.md) and run every applicable repository capability in a safe order. If something cannot be executed, the agent must say why and must not claim full-cycle completion.

## Dashboard

```bash
npm ci
npm run dev
```

Build and verify:

```bash
npm run verify
```

The dashboard defaults to committed real data. Because the account currently has confirmed cash but no confirmed security positions, the real view shows funded cash, empty holdings, and a deposit-only equity curve. The "Demo data" control switches to browser-only demo data for testing charts, operation history, Sharpe ratio, drawdown, and holding tables. "Real data" switches back to committed repository data without changing files.

Daily market data refresh:

```bash
npm run refresh:market -- --dry-run
```

GitHub Actions runs the same market-data refresh on a weekday schedule. It updates committed daily price history, technical snapshots, SEC-derived company metrics, and latest close snapshots, then updates `data/account/equity_curve.csv` only after confirmed positions and confirmed cash exist. The research cards, right-side research detail, and per-symbol pages under `/research/<symbol>/` read those committed files, so the public display becomes richer as the refresh history grows.

Watchlist expansion should start with `research/watchlist.csv`. For a new public ticker, the market-data refresh hydrates missing security metadata, fetches committed price history, updates the latest close and derived metrics, and lets the dashboard generate the card and `/research/<symbol>/` page without changing the workflow. `npm run check:data` enforces that every watchlist row has matching security metadata and that every tradable watchlist symbol has market-data coverage after refresh.
