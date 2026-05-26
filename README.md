# invest

This repository is a portable operating system for a long-term satellite
investment account.

The account objective is multi-decade asymmetric compounding: pursue outcomes
that can plausibly become tens, hundreds, or thousands of times larger over a
very long horizon, while avoiding avoidable ruin. The default planned monthly
contribution is USD 888.

Public dashboard: [www.wineandchord.com/invest](https://www.wineandchord.com/invest/).
It is built from this open-source repository and deployed as a static GitHub
Pages project site.

Start here:

1. Read [AGENTS.md](AGENTS.md) for the
   rules every future agent must follow.
2. Read [SPEC.md](SPEC.md) for the full
   portfolio system design.
3. Use [templates/monthly-decision.md](templates/monthly-decision.md)
   when asking for a monthly buy or sell plan.
4. Use [templates/execution-confirmation.md](templates/execution-confirmation.md)
   after trades or deposits are actually completed.
5. Run `npm run dev` to preview the public dashboard locally.

Repository state:

- Confirmed positions: empty.
- Confirmed cash balance: unknown until the first broker-confirmed deposit or
  account snapshot is provided.
- Confirmed ledger events: none.
- Initial research baseline:
  [research/2026-05-26-initial-baseline.md](research/2026-05-26-initial-baseline.md).
- Initial simulated decision:
  [decisions/2026-05-26-initial-simulation.md](decisions/2026-05-26-initial-simulation.md).

## Dashboard

```bash
npm ci
npm run dev
```

Build and verify:

```bash
npm run verify
```

The dashboard defaults to committed real data. Because the account currently has
no confirmed transactions, the real view intentionally shows empty holdings and
empty performance. The "注入模拟数据" control switches to browser-only demo data
for testing charts, operation history, Sharpe ratio, drawdown, and holding
tables. "恢复真实数据" switches back to committed repository data without changing
files.
