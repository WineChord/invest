---
name: invest-operating-cycle
description: Use when working in the WineChord invest repository on investment decisions, deposits, allocation, SGOV reserve use, full operating-cycle runs, watchlist reprioritization, research engine refreshes, meta-self-improvement, account execution updates, dashboard/data validation, or repository cleanup for the long-term satellite portfolio.
---

# Invest Operating Cycle

This is a repo-scoped skill for the WineChord invest repository. It should guide Codex into the repository's durable operating system without duplicating the full rules.

## First Read

Before making recommendations or changing state, read the relevant canonical files:

- `AGENTS.md` for mandatory agent behavior, immutable rules, operating triggers, self-evolution, and Git rules.
- `SPEC.md` for system design, data models, research engine, dashboard behavior, and audit requirements.
- `data/policy/policy-v1.1.md` for the current investment policy.
- The relevant template under `templates/`:
  - `monthly-decision.md` for buy, sell, hold-cash, SGOV, or allocation requests.
  - `full-operating-cycle.md` for full-cycle repository requests.
  - `execution-confirmation.md` for broker-confirmed trades or deposits.
  - `research-engine-run.md` for discovery, freshness, valuation, priority, and cleanup runs.
  - `meta-self-improvement.md` for process upgrades and methodology reviews.

## Trigger Behavior

- Treat questions about deposits, cash deployment, buying, selling, SGOV, allocation, or "what should I do" as full decision operating-cycle requests.
- Treat "run everything", "full refresh", "full monthly cycle", "全量执行", or equivalent language as full-cycle repository requests.
- During serious research or decision work, run self-evolution and meta-self-improvement checks before finishing.
- Never answer from the old watchlist alone. Re-check discovery, freshness, thesis delta, entry delta, priority delta, and opportunity cost.

## Safety Boundaries

- Never execute trades.
- Never mutate broker-confirmed account records without the required execution confirmation fields.
- Do not infer broker cash, cost basis, positions, fees, or settlement dates from recommendations, screenshots, or market prices.
- Keep the repository clone-portable; do not commit secrets, local-only paths, caches, or generated scratch artifacts.
- Preserve audit history. Use corrections and dated notes instead of silent rewrites.

## Useful Commands

```bash
npm run refresh:market -- --dry-run
npm run check:data
npm run verify
```

Use `npm run check:data` for data and research changes. Use `npm run verify` for dashboard or broad repository changes when practical.

## Output Standard

Final responses for serious runs should state:

- which operating-cycle steps ran;
- which steps were skipped and why;
- whether watchlist priority or thesis/entry deltas changed;
- whether meta-self-improvement found a durable lesson;
- files changed;
- validations run;
- whether changes were committed and pushed;
- any unavailable evidence or required user input.
