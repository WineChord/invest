---
name: invest-operating-cycle
description: Use when working in the WineChord invest repository on investment decisions, deposits, allocation, SGOV reserve use, full operating-cycle runs, watchlist reprioritization, research engine refreshes, meta-self-improvement, account execution updates, dashboard/data validation, or repository cleanup for the long-term satellite portfolio.
---

# Invest Operating Cycle

This repo-scoped skill is a compact router for the WineChord invest repository. It should point Codex to canonical files, not duplicate the full operating manual.

Root objective: multi-decade asymmetric compounding with avoidable-ruin controls. Article 1 is controlling. Use every workflow as a means to that objective, never as checklist ceremony or an inactivity optimizer.

## First Read

Read only the canonical files relevant to the request:

- `CONSTITUTION.md`: highest-order mission and operating principles.
- `PUBLICATION_POLICY.md`: required before public commits, pushes, deployments, dashboard copy, decision notes, execution records, performance displays, or external posts.
- `AGENTS.md`: mandatory agent behavior, trigger routing, safety boundaries, self-evolution, cleanup, and Git rules.
- `SPEC.md`: system design, data models, research engine, dashboard behavior, and audit requirements.
- `data/policy/policy-v1.3.md`: current investment policy.
- `docs/research-command-reference.md`: detailed discovery, macro-regime, community, SEC, semantic-discovery, FMP, and validation command notes.
- `docs/subagent-protocol-reference.md`: bounded subagent evidence-packet and minimum-output schemas.

Use the relevant template under `templates/`:

- `monthly-decision.md`: buy, sell, hold-cash, SGOV, or allocation requests.
- `full-operating-cycle.md`: full-cycle repository requests.
- `execution-confirmation.md`: broker-confirmed activity and the narrowly scoped standing recurring deposit.
- `publication-release-review.md`: public release of decision, trade, account, performance, or dashboard content.
- `research-engine-run.md`: discovery, freshness, valuation, priority, and cleanup runs.
- `bottleneck-lane-review.md`: bottleneck-map-first discovery review.
- `agentic-discovery-run.md`: structured xhigh discovery audit artifacts.
- `discovery-readiness-sprint.md`: plausible raw candidates that could affect allocation or lane completeness.
- `promotion-review.md`: moving a researched symbol toward active, core, or buy-zone status.
- `decision-retrospective.md`: post-decision and post-discovery review of missed candidates, source gaps, and process lessons.
- `meta-self-improvement.md`: process upgrades and methodology reviews.

## Article 1 Preflight and Postflight

- Run an Article 1 preflight at the start of every repository interaction: identify how the requested work can improve the probability of finding, funding, sizing, or holding rare qualifying outcomes, or which necessary truth, survival, human-control, audit, clone-portability, or public-safety boundary it preserves.
- Treat every policy, gate, template, score, validation, dashboard requirement, and process step as subordinate to Article 1. If a lower-level artifact conflicts with the mission, follow the constitution and revise that artifact during the same authorized work when practical.
- Run an Article 1 postflight before finishing: check whether the result advanced the mission or a necessary mission boundary rather than adding ceremony, conventional comfort, false certainty, or inactivity.
- Keep the check proportional. Narrow maintenance does not require a full investment operating cycle unless the request also triggers one.

## First-Principles Analysis

- Every material company, filing, discovery, valuation, promotion, opportunity-cost, allocation, macro-regime, retrospective, or process analysis must include the explicit `First-Principles Analysis` contract from `SPEC.md`.
- Begin with current primary facts and binding constraints. Rebuild the causal chain, challenge inherited assumptions, identify disconfirming evidence, and state the decision consequence before assigning or inheriting a rating, status, valuation, ranking, size, or action.
- For company or security work, carry the chain through dilution-adjusted per-share value and feasible portfolio impact. Treat prior ratings, watchlist status, consensus, comparable multiples, historical analogies, and price action as tests of the reconstruction, never as substitutes for it.
- Keep an unchanged conclusion concise but substantive. Do not satisfy the contract with empty fields, copied boilerplate, or a restatement of the prior decision.
- In a Chinese private decision report or self-email, use the visible heading `从第一性原理出发` and give every material company or decision block a concise, evidence-specific reconstruction. Do not replace the per-company work with one generic report-level slogan.

## Trigger Routing

- Questions about deposits, cash deployment, buying, selling, SGOV, allocation, or "what should I do" are full decision operating-cycle requests.
- Before sentinel or full-cycle routing, apply any due fixed weekly contribution through the deterministic account command. The active versioned standing authorization covers only that deposit, requires no second occurrence confirmation, and never authorizes a trade or another account mutation.
- "Run everything", "full refresh", "full monthly cycle", "全量执行", or equivalent language is a full-cycle repository request.
- Serious research or decision work must run self-evolution and meta-self-improvement checks before finishing.
- Full-cycle and monthly decision runs must start from the bottleneck map, ask whether a new lane appeared, run current discovery/freshness/valuation/watchlist review, and avoid answering from the old watchlist alone.
- Full-cycle and monthly decision runs should refresh or cite the structured macro overlay and public community triage when they can affect analysis priority, risk review, or entry discipline. These inputs do not create buy eligibility, promotion eligibility, or allocation evidence by themselves.
- Full-cycle and monthly decision runs should update `research/operating-runs.csv` with a public-safe summary so `/runs/` and `/runs/<run_id>/` can show decision context, validation, source links, publication status, and confirmed ledger-linked execution.
- Material discovery, promotion, valuation, allocation, or process conclusions require advisory xhigh subagents when tooling is available unless explicitly skipped with an allowed reason. The material-decision roles are discovery-lane/candidate triage, freshness/filing review, bull case, bear case, and allocation/risk.
- Plausible material raw candidates require stage-adjusted R0-R3 discovery readiness work. R1 and R2 may remain open under a dated evidence service level; only R3 requires promotion-grade and dashboard-equivalent completeness.
- Separate target readiness and opportunity-set sufficiency from repository health. Decision-critical debt blocks the affected target; bounded discovery or unrelated process debt remains visible but is not an allocation veto.
- Treat liquidity-option weight and prolonged mission-irrelevant deployment as Article 1 review triggers. Before zero exposure is final, compare zero with the smallest mission-consistent staged exposure and explain why zero wins.
- A `research_only`, `watch`, `probation`, or `frozen` symbol cannot enter `active_candidate`, `active_core_candidate`, buy-zone ranking, or proposed orders without a fresh promotion review.
- Do not finish material investment or discovery work with decision-critical target or opportunity-cost evidence still in `not_ready` when the missing evidence is publicly reachable. Keep bounded discovery and unrelated process debt visible and dated without turning it into an allocation veto.

## Safety Boundaries

- Never execute trades.
- Never mutate account records without the required confirmation. The only recurring exception is the exact due deposit covered by the active versioned standing authorization; broker evidence remains superior.
- Do not infer broker cash, cost basis, positions, or trade economics from recommendations, screenshots without filled execution details, or market prices.
- Treat a broker order-status screenshot with filled status, side, symbol, quantity, fill price, and trade date or broker timestamp as a complete trade evidence packet; do not ask for a second confirmation of defaultable fields.
- For standing deposits, other confirmed deposits, and filled U.S.-listed stock or ETF trades, use the applicable branch and streamlined defaults in `templates/execution-confirmation.md`. Do not request a second confirmation for a valid due standing occurrence.
- Keep deterministic commands, durable file edits, account-state reconstruction, validation, commits, pushes, and final synthesis in the main agent.
- Keep the repository clone-portable; do not commit secrets, local-only paths, caches, generated scratch artifacts, raw broker documents, screenshots, account numbers, full confirmation IDs, full order IDs, cookies, tokens, or private cache payloads.
- Never publicly release actionable trading content before the embargo in `PUBLICATION_POLICY.md` expires. Same-day trades, exact order sizes, live target weights, live scale ladders, order previews, and unexpired proposed orders must remain local and unpublished or be redacted.
- Preserve audit history. Use corrections and dated notes instead of silent rewrites.

## Validation

- Run `npm run check:article-one` before and after powered-on automated work and before commit or push. Use sentinel mode for scheduled triage and decision mode before completing a full allocation decision.
- `WARN` triggers a dated review and the narrowest safe lower-level repair. `BLOCK` stops automated commit, push, deployment, account mutation, and decision completion; it never authorizes silent deletion, weakening protected truth or human-control boundaries, validator self-editing, or automatic trading.
- Use `npm run check:data` for data or research changes.
- Use `npm run test:standing-contribution` when changing the recurring contribution plan, application, account-state reconciliation, or automation route.
- Use `npm run verify` for dashboard, broad repository changes, or final validation when practical.
- Use the focused validation commands in `docs/research-command-reference.md` when changing discovery, SEC, semantic-discovery, readiness, promotion, watchlist-cycle, or market-refresh behavior.

## Output Standard

Final responses for serious runs should state which operating-cycle steps ran or were skipped, subagents run or skipped, material disagreements and resolution, watchlist or discovery deltas, meta-self-improvement findings, publication-release status, files changed, validations run, whether changes were committed and pushed, and any unavailable evidence or required user input.
