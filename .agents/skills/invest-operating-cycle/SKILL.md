---
name: invest-operating-cycle
description: Use when working in the WineChord invest repository on investment decisions, deposits, allocation, SGOV reserve use, full operating-cycle runs, watchlist reprioritization, research engine refreshes, meta-self-improvement, account execution updates, dashboard/data validation, or repository cleanup for the long-term satellite portfolio.
---

# Invest Operating Cycle

This repo-scoped skill is a compact router for the WineChord invest repository. It should point Codex to canonical files, not duplicate the full operating manual.

Root objective: multi-decade asymmetric compounding with avoidable-ruin controls. Use every workflow as a means to that objective, never as checklist ceremony.

## First Read

Read only the canonical files relevant to the request:

- `CONSTITUTION.md`: highest-order mission and operating principles.
- `PUBLICATION_POLICY.md`: required before public commits, pushes, deployments, dashboard copy, decision notes, execution records, performance displays, or external posts.
- `AGENTS.md`: mandatory agent behavior, trigger routing, safety boundaries, self-evolution, cleanup, and Git rules.
- `SPEC.md`: system design, data models, research engine, dashboard behavior, and audit requirements.
- `data/policy/policy-v1.1.md`: current investment policy.
- `docs/research-command-reference.md`: detailed discovery, macro-regime, community, SEC, semantic-discovery, FMP, and validation command notes.
- `docs/subagent-protocol-reference.md`: bounded subagent evidence-packet and minimum-output schemas.

Use the relevant template under `templates/`:

- `monthly-decision.md`: buy, sell, hold-cash, SGOV, or allocation requests.
- `full-operating-cycle.md`: full-cycle repository requests.
- `execution-confirmation.md`: broker-confirmed trades or deposits.
- `publication-release-review.md`: public release of decision, trade, account, performance, or dashboard content.
- `research-engine-run.md`: discovery, freshness, valuation, priority, and cleanup runs.
- `bottleneck-lane-review.md`: bottleneck-map-first discovery review.
- `agentic-discovery-run.md`: structured xhigh discovery audit artifacts.
- `discovery-readiness-sprint.md`: plausible raw candidates that could affect allocation or lane completeness.
- `promotion-review.md`: moving a researched symbol toward active, core, or buy-zone status.
- `decision-retrospective.md`: post-decision and post-discovery review of missed candidates, source gaps, and process lessons.
- `meta-self-improvement.md`: process upgrades and methodology reviews.

## Trigger Routing

- Questions about deposits, cash deployment, buying, selling, SGOV, allocation, or "what should I do" are full decision operating-cycle requests.
- "Run everything", "full refresh", "full monthly cycle", "全量执行", or equivalent language is a full-cycle repository request.
- Serious research or decision work must run self-evolution and meta-self-improvement checks before finishing.
- Full-cycle and monthly decision runs must start from the bottleneck map, ask whether a new lane appeared, run current discovery/freshness/valuation/watchlist review, and avoid answering from the old watchlist alone.
- Full-cycle and monthly decision runs should refresh or cite the structured macro overlay and public community triage when they can affect analysis priority, risk review, or entry discipline. These inputs do not create buy eligibility, promotion eligibility, or allocation evidence by themselves.
- Full-cycle and monthly decision runs should update `research/operating-runs.csv` with a public-safe summary so `/runs/` and `/runs/<run_id>/` can show decision context, validation, source links, publication status, and confirmed ledger-linked execution.
- Material discovery, promotion, valuation, allocation, or process conclusions require advisory xhigh subagents when tooling is available unless explicitly skipped with an allowed reason. The material-decision roles are discovery-lane/candidate triage, freshness/filing review, bull case, bear case, and allocation/risk.
- Plausible material raw candidates require discovery readiness work before the cycle ends unless primary evidence rejects them, they are ineligible or not material, or the remaining blocker is genuinely external.
- A material incubating public candidate must not remain hidden in discovery-only files; either give it research-only dashboard visibility with comparable evidence or reject, archive, mark not tradable, externally blocked, or not material with evidence.
- A `research_only`, `watch`, `probation`, or `frozen` symbol cannot enter `active_candidate`, `active_core_candidate`, buy-zone ranking, or proposed orders without a fresh promotion review.
- Do not finish material investment, discovery, or process work with repository-public evidence still in `not_ready` when the missing evidence is reachable.

## Safety Boundaries

- Never execute trades.
- Never mutate broker-confirmed account records without the required execution confirmation fields.
- Do not infer broker cash, cost basis, positions, fees, or settlement dates from recommendations, screenshots, or market prices.
- Keep deterministic commands, durable file edits, account-state reconstruction, validation, commits, pushes, and final synthesis in the main agent.
- Keep the repository clone-portable; do not commit secrets, local-only paths, caches, generated scratch artifacts, raw broker documents, screenshots, account numbers, full confirmation IDs, full order IDs, cookies, tokens, or private cache payloads.
- Never publicly release actionable trading content before the embargo in `PUBLICATION_POLICY.md` expires. Same-day trades, exact order sizes, order previews, and unexpired proposed orders must remain local and unpublished or be redacted.
- Preserve audit history. Use corrections and dated notes instead of silent rewrites.

## Validation

- Use `npm run check:data` for data or research changes.
- Use `npm run verify` for dashboard, broad repository changes, or final validation when practical.
- Use the focused validation commands in `docs/research-command-reference.md` when changing discovery, SEC, semantic-discovery, readiness, promotion, watchlist-cycle, or market-refresh behavior.

## Output Standard

Final responses for serious runs should state which operating-cycle steps ran or were skipped, subagents run or skipped, material disagreements and resolution, watchlist or discovery deltas, meta-self-improvement findings, publication-release status, files changed, validations run, whether changes were committed and pushed, and any unavailable evidence or required user input.
