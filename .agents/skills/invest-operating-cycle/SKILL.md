---
name: invest-operating-cycle
description: Use when working in the WineChord invest repository on investment decisions, deposits, allocation, SGOV reserve use, full operating-cycle runs, watchlist reprioritization, research engine refreshes, meta-self-improvement, account execution updates, dashboard/data validation, or repository cleanup for the long-term satellite portfolio.
---

# Invest Operating Cycle

This is a repo-scoped skill for the WineChord invest repository. It should guide Codex into the repository's durable operating system without duplicating the full rules.

The root objective is multi-decade asymmetric compounding: pursue outcomes that can plausibly become tens, hundreds, or thousands of times larger over a very long horizon, while avoiding avoidable ruin. Use every workflow below as a means to that objective, not as a checklist for its own sake.

## First Read

Before making recommendations or changing state, read the relevant canonical files:

- `CONSTITUTION.md` for the highest-order mission and operating principles.
- `AGENTS.md` for mandatory agent behavior, immutable rules, operating triggers, self-evolution, and Git rules.
- `SPEC.md` for system design, data models, research engine, dashboard behavior, and audit requirements.
- `data/policy/policy-v1.1.md` for the current investment policy.
- `research/discovery/lanes.yml` for the current structural bottleneck lane map before judging whether the watchlist is complete.
- `templates/bottleneck-lane-review.md` when a full cycle, monthly decision, or discovery run needs to review lanes before naming stocks.
- The relevant template under `templates/`:
  - `monthly-decision.md` for buy, sell, hold-cash, SGOV, or allocation requests.
  - `full-operating-cycle.md` for full-cycle repository requests.
  - `bottleneck-lane-review.md` for bottleneck-map-first discovery review.
  - `agentic-discovery-run.md` for structured xhigh discovery audit artifacts.
  - `discovery-readiness-sprint.md` for plausible raw candidates that could affect allocation or lane completeness.
  - `promotion-review.md` for moving a researched symbol toward active, core, or buy-zone status.
  - `execution-confirmation.md` for broker-confirmed trades or deposits.
  - `research-engine-run.md` for discovery, freshness, valuation, priority, and cleanup runs.
  - `meta-self-improvement.md` for process upgrades and methodology reviews.

## Trigger Behavior

- Treat questions about deposits, cash deployment, buying, selling, SGOV, allocation, or "what should I do" as full decision operating-cycle requests.
- Treat "run everything", "full refresh", "full monthly cycle", "全量执行", or equivalent language as full-cycle repository requests.
- During serious research or decision work, run self-evolution and meta-self-improvement checks before finishing.
- During every full-cycle or monthly decision, explicitly ask whether a new discovery lane appeared and whether existing lanes should be promoted, split, merged, demoted, retired, or left unchanged.
- Never start serious discovery from a stock list. Start from structural bottlenecks, then derive direct public beneficiaries and only then compare companies.
- Treat deterministic discovery scripts as scaffolding, not the full search. Use independent fresh-context xhigh discovery subagents when discovery could affect allocation, lane completeness, or watchlist priority; they should search broad current public sources and answer the first-layer bottleneck questions before producing ticker lists: what could become scarce, who controls or can remove the scarcity, who can monetize it into shareholder value, whether a public security directly expresses the exposure, and whether the company is early, small, misunderstood, newly listed, awkward, or underfollowed enough for extreme asymmetry.
- Use advisory xhigh subagents when available for material monthly decisions, full-cycle runs, discovery lane changes, freshness or filing gaps, watchlist reprioritization, valuation changes, allocation decisions, and substantial process changes. Default roles are discovery-lane/candidate triage, freshness/filing review, bull case, bear case, and allocation/risk.
- When a plausible new candidate appears, run the discovery readiness sprint before ending the cycle whenever public evidence can be gathered: market data, security metadata, filings, issuer reports, industry context, filing review, valuation state, same-lane peer comparison, and dashboard-facing research coverage. Do not leave "not buy-ready" as a mere missing-data status when the missing data is reachable.
- Candidate ready means terminal classification plus evidence surface, not a ticker mention. The ready surface includes the raw candidate record, candidate-readiness record with `dashboard_surface_status`, readiness note, durable sources, reviewed freshness or filing evidence, valuation state, same-lane comparison, company-analysis entry, and, for material completed or incubated public stocks, the research-only dashboard surface.
- Do not leave a material incubating public candidate hidden in discovery-only files. If it remains material enough to keep, it needs research-only dashboard visibility with security metadata, price history, latest price, technical snapshot, company metrics, valuation state, freshness or filing review, company-analysis entry, and generated per-symbol page. If it does not deserve that treatment, reject, archive, or classify it as not material with evidence.
- For material discovery work, leave a structured audit trail: an agentic discovery run under `research/discovery/runs/`, a candidate readiness record in `research/discovery/candidate-readiness.yml`, and a sprint note under `research/discovery/readiness/` when a raw candidate could affect allocation. The run should structure source coverage by primary filings or regulatory data, issuer material, market data, and current-world context. Candidate readiness should record affected lanes, materiality reason, and blocking scope. Quality metrics should record allocation-relevant lanes so same-lane candidates cannot be hidden as immaterial without evidence. A material open candidate with repository-reachable evidence outstanding is a validation failure that must be fixed before final response.
- Do not finish a material investment, discovery, or process turn with the repository in `not_ready`. `decision_readiness.status` is scoped to repository and public-observable evidence. User-only broker facts, broker order previews, and final execution instructions are execution prerequisites, not repository-readiness blockers. If repository or public evidence is missing, keep iterating until it is gathered, classified immaterial, rejected/incubated from evidence, or shown to be genuinely external.
- During every full-cycle or monthly decision run, perform the full watchlist-cycle review. Every non-removed `research/watchlist.csv` symbol needs a current `research/watchlist-cycle-reviews.csv` row covering thesis delta, entry delta, priority delta, status delta, buy-zone delta, action required, next review trigger, sources, and reviewer roles. `No change` still needs a row. Missing current rows, stale active theses, stale active valuation states, stale active/core buy-zone rows, or open high/critical events mean the repository is not ready.
- Treat promotion as a separate agentic gate after discovery readiness. A `research_only`, `watch`, `probation`, or `frozen` symbol cannot enter `active_candidate`, `active_core_candidate`, buy-zone ranking, or proposed orders until a fresh promotion review compares it against mission, evidence, entry, survival, opportunity cost, current core candidates, cash, and the approved liquidity reserve.
- Use independent fresh-context xhigh promotion reviewers when promotion could affect allocation: evidence/freshness, valuation/entry, bull case, bear case, and opportunity-cost/allocation. Fast material events or price dislocations should trigger a same-session or next-approved-wakeup promotion review; speed means promptly running the gates, not skipping them.
- Keep deterministic commands, durable file edits, account-state reconstruction, validation, commits, pushes, and final synthesis in the main agent. Treat unresolved material subagent disagreement as a reason to gather more evidence or default to no trade, hold cash, or the approved liquidity reserve.
- During meta-self-improvement, check whether this repo-scoped skill should be updated because workflow triggers, canonical files, safety boundaries, or validation commands changed.
- Never answer from the old watchlist alone. Re-check discovery lanes, discovery candidates, freshness, thesis delta, entry delta, priority delta, opportunity cost, and lane delta.

## Safety Boundaries

- Never execute trades.
- Never mutate broker-confirmed account records without the required execution confirmation fields.
- Do not infer broker cash, cost basis, positions, fees, or settlement dates from recommendations, screenshots, or market prices.
- Keep the repository clone-portable; do not commit secrets, local-only paths, caches, or generated scratch artifacts.
- Preserve audit history. Use corrections and dated notes instead of silent rewrites.

## Useful Commands

```bash
npm run refresh:market -- --dry-run
npm run discover:universe -- --dry-run
npm run build:evidence-packet -- --as-of YYYY-MM-DD --output research/discovery/runs/YYYY-MM-DD-subagent-evidence-packet.yml
npm run check:data
npm run test:discovery-gates
npm run test:watchlist-cycle-gates
npm run verify
```

Use `npm run build:evidence-packet` before spawning independent xhigh subagents for material discovery or allocation work. Use `npm run check:data` for data and research changes. Use `npm run test:discovery-gates` when changing discovery readiness rules or validation. Use `npm run test:watchlist-cycle-gates` when changing stale-prevention, priority/status refresh, or buy-zone currentness rules. Use `npm run verify` for dashboard, broad repository changes, or final validation when practical.

## Output Standard

Final responses for serious runs should state:

- which operating-cycle steps ran;
- which steps were skipped and why;
- whether watchlist priority or thesis/entry deltas changed;
- whether discovery lanes or raw discovery candidates changed;
- whether meta-self-improvement found a durable lesson;
- which xhigh subagents ran or were skipped and how material disagreements were resolved;
- files changed;
- validations run;
- whether changes were committed and pushed;
- any unavailable evidence or required user input.
