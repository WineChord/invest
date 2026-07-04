# invest

This repository is a portable operating system for a long-term satellite investment account.

The account objective is multi-decade asymmetric compounding: pursue outcomes that can plausibly become tens, hundreds, or thousands of times larger over a very long horizon, while avoiding avoidable ruin. Planned contributions are treated as available only after brokerage-side confirmation.

Public dashboard: [www.wineandchord.com/invest](https://www.wineandchord.com/invest/). It is built from this open-source repository and deployed as a static GitHub Pages project site.

Not investment advice, legal advice, tax advice, or accounting advice. This repository and dashboard are a personal historical research journal and account audit trail, not a recommendation that any public reader buy, sell, hold, copy, mirror, or size any security. Public records are delayed, normalized, redacted, and source-backed; raw broker documents, sensitive identifiers, secrets, and unexpired actionable trading content must not be published.

Public readers should treat every dashboard surface as historical context for this repository only. Browser-only demo data is simulated and exists solely to test charts and UI behavior. Confirmed account records, when shown, are delayed and redacted historical records for this repository, not trading instructions, model-portfolio signals, or evidence that any other person should take the same action.

Operating model: the repository stores the durable operating system. Codex or a future agent supplies active compute when the user starts a conversation in this workspace. When no agent is active, only deterministic automation such as GitHub Actions may run; qualitative research judgment, allocation recommendations, broker-record changes, and trades require user-triggered agent work and the repository's confirmation rules.

## Start Here

1. Read [CONSTITUTION.md](CONSTITUTION.md) for the highest-order mission and operating principles.
2. Read [PUBLICATION_POLICY.md](PUBLICATION_POLICY.md) before publishing decisions, trades, account records, performance, dashboard copy, or external posts.
3. Read [AGENTS.md](AGENTS.md) for mandatory agent rules, trigger routing, safety boundaries, and repository hygiene rules.
4. Read [SPEC.md](SPEC.md) for the full system design, data model, research engine, dashboard behavior, and audit requirements.
5. Read [policy-v1.1.md](data/policy/policy-v1.1.md) for the current investment policy.
6. Use the relevant template under [templates](templates) for repeated workflows instead of copying process prose into new notes.
7. Use [docs/research-command-reference.md](docs/research-command-reference.md) for detailed discovery, SEC, semantic-discovery, FMP, and validation command notes.

## Workflow Entry Points

- Monthly decision, cash deployment, buy, sell, hold-cash, SGOV, or allocation request: use [templates/monthly-decision.md](templates/monthly-decision.md).
- Full repository refresh or "execute everything" request: use [templates/full-operating-cycle.md](templates/full-operating-cycle.md).
- Broker-confirmed trade or deposit update: use [templates/execution-confirmation.md](templates/execution-confirmation.md).
- Public release review: use [templates/publication-release-review.md](templates/publication-release-review.md).
- Material SEC filing or official report: use [templates/filing-review.md](templates/filing-review.md).
- Bottleneck-map review before naming stocks: use [templates/bottleneck-lane-review.md](templates/bottleneck-lane-review.md).
- Discovery, freshness, valuation, and cleanup loop: use [templates/research-engine-run.md](templates/research-engine-run.md).
- Process improvement: use [templates/meta-self-improvement.md](templates/meta-self-improvement.md).

Decision requests are full operating-cycle triggers. When the user reports new cash or asks what to buy, sell, hold, use as SGOV reserve, or allocate, future agents must run the full decision operating cycle before proposing orders. Full-cycle requests go further and must run every applicable repository capability in a safe order; skipped applicable steps must be explained, and the agent must not claim full-cycle completion when reachable repository or public-evidence work remains unfinished.

## Publication Boundary

- Public account displays must be delayed, normalized, redacted, and source-backed.
- Browser-only demo data is simulated and must never mutate account files.
- Confirmed account records are historical audit records only, not public recommendations or copy-trading signals.
- Same-day or unexpired actionable order details must stay unpublished until the public release embargo in [PUBLICATION_POLICY.md](PUBLICATION_POLICY.md) has cleared.
- Current policy: [policy-v1.1.md](data/policy/policy-v1.1.md), which allows SGOV or a materially equivalent short-duration U.S. Treasury reserve for cash management only.
- Initial research baseline: [research/2026-05-26-initial-baseline.md](research/2026-05-26-initial-baseline.md).
- Initial simulated decision: [decisions/2026-05-26-initial-simulation.md](decisions/2026-05-26-initial-simulation.md).
- Latest ready-state refresh: [research/2026-05-30-ready-state-refresh.md](research/2026-05-30-ready-state-refresh.md).

## Research State

- Discovery lane map: [research/discovery/lanes.yml](research/discovery/lanes.yml).
- Potential new public candidates: [research/discovery/candidates.csv](research/discovery/candidates.csv).
- Material freshness events: [research/freshness/events.csv](research/freshness/events.csv).
- Valuation and entry states: [research/valuation-states.csv](research/valuation-states.csv).
- Macro risk-overlay records: [research/macro](research/macro).
- Full-cycle operating run index: [research/operating-runs.csv](research/operating-runs.csv).
- Public community source configuration: [research/community-sources.yml](research/community-sources.yml).
- Research health metrics: [research/quality-metrics.yml](research/quality-metrics.yml).
- Completed filing reviews: [research/filings](research/filings).
- Process reviews: [research/process](research/process).

## Dashboard

```bash
npm ci
npm run dev
```

Build and verify:

```bash
npm run verify
```

The dashboard defaults to committed repository data. The "Demo data" control switches to browser-only simulated data for testing charts, operation history, Sharpe ratio, drawdown, and holding tables. "Real data" switches back to delayed committed repository records without changing files. Neither mode is investment advice; demo mode is UI-only simulation, and real mode is a delayed historical journal for this repository rather than a public trading signal.

Daily market-data, macro-regime, public community, discovery, SEC filing, semantic-discovery, FMP, and validation command details live in [docs/research-command-reference.md](docs/research-command-reference.md).

## Repo-Scoped Skill

[invest-operating-cycle](.agents/skills/invest-operating-cycle/SKILL.md) is a lightweight Codex skill for this repository's repeated workflows. It should point agents back to `AGENTS.md`, `SPEC.md`, policy files, templates, command references, and validation commands rather than duplicating the full operating manual.
