# Satellite Portfolio System Spec

## Purpose

This repository is the durable memory and operating manual for a long-term satellite investment account. A new computer should be able to clone the repository and continue the process without hidden local state.

The highest-order principles are stated in [CONSTITUTION.md](CONSTITUTION.md). This specification implements those principles as system design; it should evolve when doing so improves the constitutional mission without weakening truth, freshness, auditability, clone portability, or avoidable-ruin controls.

The account starts with no confirmed holdings and no confirmed cash balance. The default planned contribution is USD 888 per month, but future contributions may be higher. Actual account state changes only after the user confirms broker-side activity.

The portfolio's ultimate objective is not to look stable or diversified in a conventional sense. The objective is multi-decade asymmetric compounding: pursue outcomes that can plausibly become tens, hundreds, or thousands of times larger over a very long horizon, while avoiding avoidable ruin.

That objective is the system's root constraint. The repository should evolve its watchlist, discovery lanes, templates, validation, dashboard, source lists, and process rules only when the change improves the odds of finding and holding those rare outcomes without weakening broker-confirmation truth, freshness, auditability, clone portability, or survival controls.

The practical search starts with public companies that can plausibly become much larger over decades because they sit on structural bottlenecks: space infrastructure, direct-to-device connectivity, AI infrastructure, power, cooling, semiconductor interconnect, quantum technology, programmable money, and future categories that do not yet exist.

The core research frame is bottleneck-map-first. The system should not start with a stock list and ask what looks attractive. It should start with a map of future bottlenecks, ask which bottlenecks can create durable pricing power and extreme upside, identify direct public beneficiaries, reject weak proxies, and only then decide which companies deserve primary-source research.

The account is not required to stay fully invested. Monthly contributions can remain unspent when no candidate passes the mission, evidence, and entry gates. Under policy `v1.1`, idle liquidity may be parked in SGOV or a materially equivalent short-duration U.S. Treasury reserve instrument for cash management only.

Monthly contributions are cash-flow inputs, not sizing limits. When a rare high-conviction opportunity appears, the allocation decision should consider total confirmed deployable liquidity, including confirmed cash and confirmed SGOV or equivalent reserve value available for sale, subject to broker settlement rules and avoidable-ruin controls.

## Non-Goals

- Do not manage the user's large Nasdaq technology core allocation.
- Do not optimize for short-term gains, quarterly trading, or benchmark tracking.
- Do not create automatic trades.
- Do not treat monthly contribution planning as confirmed cash.
- Do not use options, margin, leverage, shorts, crypto tokens, OTC shares, or private-company proxies without a later user-approved policy.
- Do not treat SGOV or an equivalent Treasury reserve instrument as a return-seeking allocation. It is an ETF or money-market vehicle used for liquidity management, not cash itself and not a satellite thesis.

## Repository Layout

`CONSTITUTION.md`

Highest-order mission and operating principles.

`AGENTS.md`

Rules for every future agent.

`SPEC.md`

This system design.

`data/account/`

Confirmed ledger, positions, contribution plan, and current confirmed account state.

`data/policy/`

Versioned investment policy. Every decision cites one policy version.

`research/`

Company theses, source register, watchlist, and dated research baselines.

`decisions/`

Dated monthly recommendations and simulated analyses. These are proposals, not broker records.

`templates/`

Prompt and record templates for monthly decisions, execution confirmations, company research cards, and policy changes.

`.github/workflows/pages.yml`

GitHub Pages workflow that publishes the static dashboard to `https://www.wineandchord.com/invest/`.

`.agents/skills/`

Repo-scoped Codex skills that act as compact trigger and navigation layers for this repository. They do not replace `AGENTS.md`, `SPEC.md`, policy files, templates, scripts, or committed data.

`src/`

Astro and React source for the public dashboard.

## Operating System Model

This repository is the durable operating system for the satellite account. The files store policy, account state, research memory, workflow definitions, scripts, dashboard behavior, and audit history.

An agent conversation supplies active compute. When the user opens Codex in this repository and asks for work, the system is powered on and should execute every applicable workflow in a reasonable order. When no agent is active, the repository is mostly idle. Scheduled deterministic automation may refresh allowed market-data surfaces, validate, build, or deploy, but it must not perform qualitative research judgment, recommend orders, mutate broker-confirmed records, or trade.

The operating system model has two boundaries:

- Durable state belongs in the repository. Avoid hidden local state, private cache dependencies, uncommitted source-of-truth files, and undocumented manual steps.
- Active judgment belongs to user-triggered agent work or explicitly approved automation boundaries. Do not imply that the repository autonomously thinks, researches, or trades while unpowered.

## Truth Model

There are four levels of truth:

1. Confirmed broker facts: trade confirmations, account statements, settled cash, share quantity, fees, dividends, splits, and corrections.
2. Current market facts: prices, volume, market cap, and other data with a timestamp.
3. Company and regulatory facts: SEC filings, company IR releases, regulator decisions, government contract awards, and official presentations.
4. Analysis: interpretations, rankings, forecasts, and agent reasoning.

Only level 1 can mutate account records. Levels 2 to 4 can inform a proposed decision but cannot change the ledger.

## Data Model

Account state is stored in [data/account/state.yml](data/account/state.yml).

Required fields:

```yaml
schema_version:
as_of:
status:
base_currency:
confirmed_cash:
settled_cash:
buying_power:
positions_count:
last_confirmed_ledger_event_id:
last_reconciled_with_broker_at:
notes:
```

Confirmed transactions are append-only rows in [data/account/ledger.csv](data/account/ledger.csv).

Required columns:

```text
event_id,event_type,status,broker,account_alias,confirmation_id,trade_date,
settlement_date,symbol,side,quantity,average_price,fees,gross_amount,
net_cash_effect,currency,source,created_at,notes
```

Positions are derived from the ledger and stored in [data/account/positions.csv](data/account/positions.csv).

Required columns:

```text
symbol,asset_type,exchange,quantity,average_cost,cost_basis,currency,
first_trade_date,last_trade_date,notes
```

The default contribution plan is stored in [data/account/plan.yml](data/account/plan.yml). It is a plan, not confirmed cash.

SGOV and equivalent reserve instruments, if used, are recorded as confirmed positions and ledger events. They may be shown separately as liquidity reserve exposure in reporting, but they are still securities and must not be silently merged into confirmed cash.

Research sources are stored in [research/sources.yml](research/sources.yml).

Each source entry records:

```yaml
id:
title:
source_type:
url:
source_published_at:
retrieved_at:
first_seen_at:
related_symbols:
summary:
```

Portfolio performance snapshots are stored in [data/account/equity_curve.csv](data/account/equity_curve.csv).

Required columns:

```text
date,total_market_value,cash,total_equity,cumulative_deposits,
total_return_pct,period_return_pct,notes
```

The equity curve is a valuation snapshot series, not a trade ledger and not a broker statement. It can be updated from confirmed positions, confirmed cash, and timestamped market prices without changing broker-confirmed account records.

Snapshot cadence policy:

- Minimum cadence: add or refresh a portfolio-level valuation snapshot during each monthly decision cycle when confirmed cash or positions exist.
- Event cadence: add a snapshot for each confirmed deposit or execution date after the user confirms the broker-side event and positions are recalculated.
- Month-end cadence: when reliable historical close data is available, backfill month-end snapshots since the previous snapshot. This keeps the long-term chart smooth enough without pretending to have intraday precision.
- Optional higher cadence: weekly or daily snapshots may be added after the account has meaningful positions or an automation is introduced, but these remain market-derived valuation points and must cite the price dates used.
- Historical backfill must use historical prices for the exact valuation date. Never fill an old date with today's price.
- If price history for a required date is unavailable, leave the gap or mark the snapshot as estimated in `notes`; do not invent precision.

Daily close automation:

- `.github/workflows/daily-market-data.yml` runs on a weekday schedule after the regular US market close should normally be available from end-of-day data providers. It can also be run manually with an optional `as_of` date.
- The automation is deterministic code only. It must not call an LLM, agent, broker, or order-execution service.
- `scripts/refresh-market-data.mjs` fetches the latest available daily close up to the New York `as_of` date from Yahoo Finance chart data for symbols in `data/market/security_master.csv`, symbols already present in `data/market/watchlist_prices.csv`, and all confirmed position symbols. It uses Node `fetch` first and may fall back to `curl` for the Yahoo chart request when the provider rejects the Node request but still returns the same chart JSON to a standard HTTP client.
- Financial Modeling Prep may be used only as an optional quota-limited supplement when `FMP_API_KEY` is available through the local environment or a GitHub Actions secret. It must not replace broker facts, SEC filings, or the required freshness checks. FMP requests must be cache-aware, write ignored local usage records without logging the API key, respect a configurable per-day uncached call budget, and fall back to the SEC/Yahoo path when the key is missing, the budget is exhausted, the provider rate-limits, or an endpoint is unavailable. Scheduled automation should spend only a conservative fraction of the free quota by default and rely on `research/cache/fmp/` plus GitHub Actions cache restore/save for incremental enrichment rather than committing raw provider payloads. The workflow cache key must be unique per run with stable restore prefixes so newer FMP responses can be saved and reused instead of repeatedly starting from an immutable exact cache hit.
- `research/watchlist.csv` is the coordination point for public research coverage. When a new public ticker is added there, the market refresh must hydrate missing `data/market/security_master.csv` metadata from SEC ticker exchange data, confirm Yahoo chart availability, then create or refresh price history, latest close snapshots, technical snapshots, SEC-derived company metrics, dashboard cards, and per-symbol research pages without changing the GitHub Action.
- Daily automation must commit `data/market/security_master.csv` together with the generated market files when the refresh hydrates missing ticker metadata. A market-data commit that updates prices for a newly covered ticker but omits its security metadata is not clone-portable.
- Non-tradable future-watch names must remain explicit in `data/market/security_master.csv` with `tradability=not_tradable`; the market refresh skips them and must not invent prices.
- `npm run check:data` must fail if a watchlist row lacks matching security metadata or if a tradable watchlist symbol lacks supporting price history, technical snapshots, or company metrics after refresh. This keeps watchlist edits, dashboard surfaces, and automation state aligned.
- The script refreshes `data/market/watchlist_prices.csv` only when the provider supplies a newer close date or a corrected close for the same date. Weekends, holidays, and repeated provider data should produce no commit.
- The script adds or replaces one `data/account/equity_curve.csv` row for the valuation close date only when confirmed positions exist and `data/account/state.yml` has `confirmed_cash`. It must not fabricate equity when cash is unknown.
- Daily equity snapshots use confirmed position quantities, confirmed cash, and the latest available close for each held symbol. If any held-symbol price is missing, the automation fails instead of committing a partial valuation.
- Daily automation must not mutate `ledger.csv`, `positions.csv`, `state.yml`, research files, or decision files. Those remain user-confirmed or agent-researched records.
- Because commits made by `GITHUB_TOKEN` may not reliably trigger a second Pages workflow, the daily market data workflow builds and deploys the dashboard itself after committing a data change.

Market snapshots used for display and decision support are stored in `data/market/`. They do not mutate confirmed account records.

Research engine state is stored under `research/`.

`research/quality-metrics.yml` records whether the research engine itself is healthy enough to support a monthly allocation decision. It is a compact operational dashboard for coverage, staleness, open event risk, and unresolved research debt.

Required sections:

```yaml
schema_version:
as_of:
last_research_engine_run:
decision_readiness:
coverage:
discovery_process:
freshness:
quality_gates:
notes:
```

`research/discovery/lanes.yml` records the structural bottleneck lanes that guide universe discovery beyond the current watchlist. A lane is a search hypothesis, not a sector allocation target or proof that any company is buyable. The lane map is the first-class discovery interface.

Required top-level fields:

```yaml
schema_version:
as_of:
mission_anchor:
review_cadence:
framework_name:
framework_questions:
notes:
lanes:
```

Each lane records:

```yaml
id:
name:
status:
bottleneck_thesis:
why_asymmetric:
source_families:
screen_keywords:
current_public_proxies:
candidate_entry_points:
next_review_trigger:
invalidation_or_demote_signal:
```

Lane status values are `active`, `emerging`, `incubating`, `dormant`, and `retired`. Every full operating cycle and monthly decision must review the lane map and explicitly ask whether a new lane appeared. Use [templates/bottleneck-lane-review.md](templates/bottleneck-lane-review.md) when the lane review creates, retires, splits, merges, or materially changes a lane.

`research/discovery/candidates.csv` records potential new public candidates before they are promoted into the active watchlist.

Required columns:

```text
symbol,name,exchange,asset_type,discovered_at,discovery_source,source_url,
source_published_at,retrieved_at,first_seen_at,theme,why_it_might_matter,
status,next_action,notes
```

`research/discovery/candidate-readiness.yml` records machine-checkable readiness state for raw discovery candidates that remain open. It separates unfinished repository work from genuine external blockers and makes candidate readiness visible to `research/quality-metrics.yml`.

Each record includes:

```yaml
symbol:
material_to_current_allocation:
affected_lanes:
materiality_reason:
blocking_scope:
readiness_status:
dashboard_surface_status:
readiness_path:
blocker_type:
blocker_reason:
reachable_evidence_remaining:
last_readiness_reviewed_at:
next_action:
conclusion:
```

`readiness_status` values are `completed`, `incubated_after_review`, `rejected_after_review`, `archived_after_review`, `not_material_current_allocation`, `external_blocked`, and `not_tradable` in a committed ready state. `not_started` and `in_progress` are scratch-only and must not pass validation. `dashboard_surface_status` values are `complete`, `not_required_rejected`, `not_required_archived`, `not_required_not_material`, `not_required_external`, and `not_required_not_tradable`.

Completed readiness sprint notes are stored under `research/discovery/readiness/` using [templates/discovery-readiness-sprint.md](templates/discovery-readiness-sprint.md). Material agentic discovery runs are stored under `research/discovery/runs/` using [templates/agentic-discovery-run.md](templates/agentic-discovery-run.md). These artifacts are not raw subagent transcripts; they are concise audit records that prove the discovery process answered the first-layer bottleneck questions, searched broad current sources, reconciled subagent conflicts, and classified candidate readiness.

For material candidates, `affected_lanes`, `materiality_reason`, and `blocking_scope` are required so the repository cannot hide a same-lane opportunity-cost issue by merely setting `material_to_current_allocation` incorrectly. The field name is intentionally conservative and should be read as material to the current powered-on research or decision cycle: allocation, opportunity cost, lane completeness, and watchlist priority all count. For complete agentic discovery runs, source coverage must be structured by source family, including primary filings or regulatory sources, issuer material, market data, and current-world context.

`research/quality-metrics.yml` records `discovery_process.allocation_relevant_lanes` for a live or historical decision cycle. The validation layer treats open raw candidates in those lanes as material by default unless their readiness record explicitly classifies them as `not_material_current_allocation` with evidence.

When a material candidate is completed or incubated rather than rejected, it must receive a dashboard-facing research surface before the repository can be considered ready. At minimum that means a `research/watchlist.csv` row, security metadata, price history, latest price snapshot, technical snapshot, company metrics when available, valuation state, reviewed freshness or filing records, a `research/company-analysis.yml` entry, and the generated per-symbol research page. The status can be `research_only`; this is not a buy promotion, it is the minimum surface needed to compare a new candidate fairly with existing research names. The readiness record must set `dashboard_surface_status: complete`; rejected, not-material, external-blocked, and not-tradable records use the matching `not_required_*` status.

`research/freshness/events.csv` records dated events that require review, including filings, earnings releases, guidance, contracts, financing, dilution, regulatory decisions, price dislocations, leadership changes, and thesis-breaking evidence.

Required columns:

```text
event_id,symbol,event_date,event_type,source_type,source_url,
source_published_at,retrieved_at,first_seen_at,severity,status,
required_action,reviewed_at,review_path,immaterial_reason,notes
```

`research/valuation-states.csv` records the latest valuation and entry-attractiveness state for researched symbols. It is an analytical state file, not a price history and not an order instruction.

Required columns:

```text
symbol,as_of,price,market_cap,enterprise_value,currency,valuation_state,
price_attractiveness,thesis_state,risk_state,expected_return_setup,
scenario_path,next_review_trigger,source_ids,notes
```

Completed filing reviews are stored in `research/filings/` using the naming convention `YYYY-MM-DD-SYMBOL-FILINGTYPE-ACCESSION.md`. A reviewed freshness event must either link `review_path` to a completed review file or explain the immateriality decision in `immaterial_reason`.

When `source_ids` stores multiple source references, use semicolon-separated IDs from `research/sources.yml`.

Raw source files and downloaded documents are not part of durable repository state by default. Use `research/cache/` or `research/downloads/` only as local ignored scratch space for temporary SEC, IR, transcript, or market-data downloads. Commit durable source metadata, extracted metrics, filing reviews, scenario notes, and links instead of large raw documents unless a file is legally redistributable, uniquely important, small, and unlikely to remain accessible from the original source.

The public research drilldown index is stored in [research/company-analysis.yml](research/company-analysis.yml). It is the structured bridge between dated research notes and the dashboard. Each entry represents one historical analysis event for one company, not a fresh market fact.

Each analysis entry records:

```yaml
id:
symbol:
analyzed_at:
analysis_type:
policy_version:
title:
stance:
summary:
upside_path:
risk_watch:
next_check:
source_path:
```

`research/promotion/` stores promotion reviews created from [templates/promotion-review.md](templates/promotion-review.md). A promotion review is required when a symbol moves into `active_candidate`, `active_core_candidate`, or current buy-zone consideration from a lower status, or when a candidate is demoted from those states because fresh evidence changed the ranking.

Promotion reviews are the bridge between discovery readiness and allocation. They must record the trigger, source IDs, retrieval window, mission/evidence/entry/survival/opportunity-cost gates, required xhigh reviewer conclusions, conflicts, final status, buy-zone status, kill criteria, and durable updates. They are not order tickets and must not update broker-confirmed account records.

`research/watchlist-cycle-reviews.csv` records the lightweight per-cycle stale-prevention review for every non-removed `research/watchlist.csv` row. Every full operating cycle and monthly decision must add or refresh a current row for each non-removed symbol, even when the result is `no_change`. The row records status and priority before and after, thesis delta, entry delta, priority delta, status delta, buy-zone delta, action required, next review trigger, source IDs, and reviewer roles. This file proves that the whole watchlist was re-evaluated; promotion reviews remain selective and run only when the cycle review or a fast-path event could change active/core status, allocation ranking, or buy-zone eligibility.

`research/watchlist-transitions.csv` is the machine-checkable index for status and priority changes. Every current `active_candidate` and `active_core_candidate` must have a latest transition record whose `to_status` and `to_priority` match `research/watchlist.csv`, whose source paths exist, whose required xhigh roles are recorded, and whose unresolved conflicts are zero.

`research/buy-zones.csv` records symbol-level current buy-zone state. Active and core candidates must have a current-cycle row, but only `buy_zone_status: in_buy_zone` can support a current proposed buy. `active_core_candidate` is a research ranking, not an automatic order instruction.

Entries are append-only by default and shown newest-first on the dashboard. If an analysis becomes stale or superseded, add a later entry that says so instead of rewriting the historical record.

## Research Engine

The repository must evolve from a static watchlist into a self-evolving research engine. The engine has eight loops: universe discovery, freshness monitoring, filing review, valuation and entry scoring, full watchlist-cycle review, selective promotion/reprioritization, monthly allocation, and meta-self-improvement. Each loop is subordinate to the same root objective: multi-decade asymmetric compounding with avoidable-ruin controls.

The watchlist is not the goal. It is a temporary working set for the mission. The bottleneck map comes first, the watchlist comes second, and individual stock research comes third. The system must be willing to promote, demote, freeze, remove, or incubate names as evidence, prices, technologies, industries, and opportunity costs change over months and years.

Feasibility boundary:

- Deterministic automation can refresh prices, equity snapshots, source indexes, and simple staleness counters.
- Deterministic automation can identify that a filing, symbol, price move, or issuer event exists.
- Deterministic automation must not decide that a company is good, cheap, or buyable by itself.
- Agent or human research must interpret filings, management discussion, financial quality, competitive position, dilution, valuation, and thesis changes.
- A monthly allocation decision is allowed only when the relevant deterministic data has been refreshed and the material qualitative evidence has been reviewed or explicitly marked immaterial.

Implementation target:

- Use code for repeatable collection, validation, and stale-state detection.
- Use `npm run discover:universe -- --dry-run` as a deterministic first-pass lane keyword scan. It can suggest raw candidates from public issuer data, but it is not research judgment and it does not create buy eligibility. The scan output must make truncation, suppressed known matches, multi-lane matches, matched fields, false-positive flags, deterministic priority, security-form warnings, and recall misses against known lane proxies visible so reviewers can tell whether the scanner is losing important candidates. Optional `--profile-input` enrichment may add bounded, source-attributed issuer profile text to improve recall for companies whose names do not expose their bottleneck or to surface unknown SEC-listed issuers from a broader validated profile set; profile enrichment remains deterministic triage and must not become buy evidence by itself. Repo-built recall artifacts must declare `profile_purpose: repo_research_recall_calibration`; broader issuer-profile artifacts must declare `profile_purpose: issuer_universe_discovery`. Profile artifacts must carry self-consistent root provenance, including `generated_at`, `source`, `source_files`, `profile_count`, explicit partial-or-complete coverage scope, sampling frame for SEC issuer-profile artifacts, and field-level text provenance for issuer-universe discovery inputs, and scan artifacts must echo the profile source and coverage metadata they used. SEC filing manifests must be generated from SEC submissions metadata when practical, preserve accession number, primary document, original SEC form, selected SEC form base, SEC Archives URL, SEC submissions URL, filing selection policy, filing selection tier, filing selection family, selection reason, displaced newer supported filing count and forms, lower-tier newer forms, foundational candidate count, 424B family counts, selection warnings, and sampling metadata. The default filing path covers 10-K, 20-F, S-1, F-1, and 424B business evidence; supplemental event-driven discovery must be available for explicitly requested 8-K, 6-K, 10-Q, S-4, F-4, and DEF 14A forms through `npm run discover:sec-event-filing-index`. First-N and requested-symbol selection must be labeled as partial coverage; `--all` or `--complete-sec-universe` is required before issuer-profile or filing-profile coverage can be labeled `complete_sec_universe`, and complete coverage requires selected symbol count to equal the eligible SEC issuer count. SEC submissions cache hits must validate CIK, ticker, exchange, and cache freshness against the selected issuer before use; complete-universe issuer-profile and filing-manifest artifacts must include a per-CIK submissions ledger with cache status, source URL, payload SHA-256, cache observed timestamp, cache age, validation status, retrieval timestamp, fetch timestamp when applicable, request attempts, request statuses, and SEC user-agent metadata. Remote SEC filing HTML fetches must support optional filing caches, cache-only operation, freshness validation from sidecar metadata rather than filesystem mtime, bounded retry/backoff, incremental filing ledgers, and per-profile filing content provenance. SEC live fetches must use the shared SEC request helper so `User-Agent`, accept, compression, `Retry-After`, transient 403 or throttling responses, bounded retries, exponential backoff, and request-status audit fields behave consistently across discovery, filing, semantic, registration, and market-refresh scripts. Live complete-universe SEC submissions fetches must use an enforced request delay of at least 100 ms unless the run is explicitly cache-only, bounded retry/backoff must be used for retryable SEC failures, and runs that pass `--submissions-ledger-output` must write incremental success or failure ledger entries so partial failures remain auditable and resumable. The scanner must emit profile coverage status, gap count, missing requested symbols, and loaded-profile-to-eligible ratio from actual usable profile count, not merely selected symbol count. Evidence packets must include exact candidate-level deterministic scan summaries for returned candidates, omitted candidates, exploratory unknown-lane matches, suppressed known matches, recall diagnostics, miss counts, and truncation state so independent subagents can audit leads without re-opening every raw artifact first. Evidence packets must also include exactly the open raw discovery candidates and all non-removed watchlist rows. `check:data` must bind profile coverage metadata to the current SEC input, require every saved deterministic JSON output in an agentic discovery artifact to carry a matching hash, require every discovery-run JSON and CSV artifact to be hash-anchored by an agentic run, evidence packet, SEC filing index, or discovery artifact index, require discovery artifact indexes to match filename dates, expected artifact roles, internal artifact dates when present, and only anchor same-date artifacts under `research/discovery/runs/`, require `coverage.universe_scan_as_of` to match a saved broad deterministic scan output date, derive allocation-relevant lanes from open candidates and current buy-zone lanes rather than trusting only a manual list, reject targeted partial scans as broad universe freshness, reject legacy or truncated broad deterministic outputs as freshness evidence, reject impossible future cache observation dates, reject malformed `--as-of` and manifest `retrieved_at` dates, reject filing profile rows whose `source_published_at` is after effective `retrieved_at`, reject local filing-path provenance as durable issuer-discovery evidence unless it is explicitly fixture-scoped, and accept `complete` issuer-profile evidence only when gap count is zero, coverage ratio is 1, selected/profile/eligible counts all match, and the SEC input hash/count binding matches the current non-profile broad scan. The default filing selection policy should prefer foundational business-description filings on or before the requested `--as-of`; when no foundational filing exists, it should prefer business-prospectus 424B variants such as 424B1, 424B3, and 424B4 over supplement-grade 424B variants such as 424B2, 424B5, or 424B7, and mark unknown later variants such as 424B8 with warnings, unless a run explicitly requests latest-supported filing selection. Durable scan artifacts written with `--json --output` must use an explicit valid `--as-of` calendar date and record SEC input row count, SEC eligible universe count, SEC input hash, lane-map date, and lane-map hash.
- Discovery lanes may define `profile_keywords` for terms that are useful only inside source-attributed issuer profile text, such as SEC SIC descriptions. These profile-only terms must not be matched against issuer names or tickers, so broad industry labels can improve profile discovery without polluting name-only scans.
- The open-ended `unknown_future_bottlenecks` lane is an exploratory lane-review trigger, not an ordinary raw-candidate source. Deterministic matches whose primary lane is `unknown_future_bottlenecks` must be preserved in scan artifacts as `exploratory_matches` with a lane-review next step, but they must not be appended to `research/discovery/candidates.csv` until source-backed evidence supports a concrete named lane or another direct candidate lane.
- Treat deterministic discovery as scaffolding, not the whole search. Serious discovery must also use independent fresh-context xhigh subagents for broad current-world source search, first-principles bottleneck reasoning, mandatory first-layer bottleneck-question review, newly public issuer discovery, and challenge review of stale lanes or missed candidates.
- Add cache-aware semantic discovery as a first-class engine behavior. Stable or expensive artifacts such as SEC submissions metadata, filing manifests, filing text extraction, complete-universe issuer profile dumps, issuer profile packets, semantic batch work orders, semantic batch classifications, historical price snapshots, prior rejection reasons, and prior lane mappings may be reused when their source hash, timestamp, scope, classifier version, and invalidation rule prove that reuse does not weaken freshness. Volatile surfaces such as new filings, current prices, market cap, financing, dilution, contracts, regulator actions, management changes, new listings, transaction filings, and material price dislocations must still be refreshed or revalidated during material cycles. Large cacheable discovery intermediates belong under ignored `research/cache/discovery/`; durable `research/discovery/runs/` files should be reviewable summaries, indexes, scans, source metadata, hashes, and final run artifacts. Validation must fail if ignored cache or download directories become tracked.
- Use a coarse-to-fine semantic funnel for large universes. Deterministic identity checks and keyword scans build the cheap base; low-reasoning batched subagents classify many issuer packets for plain-English business model, bottleneck lane fit, directness of exposure, small/early/awkward status, obvious rejection flags, and escalation need; medium-reasoning subagents compare candidates within a lane or reject false positives; xhigh subagents are reserved for material discovery conclusions, readiness sprint decisions, promotion reviews, valuation/entry work, allocation, and unresolved conflicts. The engine should record enough structured output from each layer to avoid re-running the same review when inputs have not changed.
- Partial issuer-profile scan artifacts may support targeted triage, but they must not be cited as broad universe-discovery evidence unless the run artifact explicitly acknowledges the targeted scope. Repository validation must reject partial issuer-universe profile coverage used as broad evidence without that acknowledgement.
- Use research templates for judgment-heavy work.
- Use advisory xhigh subagents for independent judgment-heavy review during material decisions, full-cycle runs, major discovery changes, material filing events, watchlist reprioritization, and substantial process changes when the tools are available.
- Use committed files as the durable interface between automation, agent analysis, dashboard display, and future decisions.
- Track the health of the research process itself in `research/quality-metrics.yml`, so the system can prove when repository and public-observable evidence is ready to support a decision.
- Track discovery-lane health in `research/discovery/lanes.yml` and `research/quality-metrics.yml`, so the system does not confuse the current watchlist with the full opportunity set.
- Track thesis, entry, priority, opportunity-cost, and theme deltas so the repository can notice when a former secondary idea becomes a better candidate, or when a new industry makes the current opportunity set stale.

Advisory subagent model:

- Subagents reduce bias and improve coverage. They do not replace primary evidence, deterministic validation, policy gates, or the main agent's responsibility for final synthesis.
- The main agent owns account-state reconstruction, source retrieval, deterministic commands, durable file edits, validation, commits, pushes, and the final proposed decision.
- Match reasoning effort to decision risk and marginal value. Low-reasoning subagents are appropriate for broad, source-bounded semantic classification and obvious rejection triage; medium-reasoning subagents are appropriate for lane-level comparison, edge-case directness, and whether a candidate deserves readiness work; xhigh reviewers are appropriate when a conclusion can affect readiness, watchlist status, priority, valuation, buy-zone eligibility, allocation, or no-trade decisions. Do not spend xhigh review on unchanged low-signal issuers merely because they exist in the universe.
- Cache subagent outputs only as structured analytical artifacts, not as raw transcripts. A cached semantic classification must include the issuer packet hash, source identifiers, source publication dates when available, retrieval dates, classifier version, model or reasoning tier when recorded, classification scope, confidence, and invalidation triggers. If the issuer packet, lane map, classifier logic, relevant filing list, or material market state changes, rerun or escalate the classification before relying on it.
- For monthly decisions with any buy, add, sell, trim, SGOV sale, or cash-deployment possibility, use xhigh bull-case, bear-case, allocation/risk, and freshness/evidence review when available.
- For full operating cycles that change research readiness, discovery lanes, raw candidates, watchlist priority, valuation state, or filing-readiness conclusions, use xhigh discovery/freshness/research-quality review when available.
- Discovery subagents should usually run from independent fresh context with a bounded evidence packet. They should search current public sources, answer the first-layer bottleneck questions before naming stocks, and identify candidates, bottlenecks, and disconfirming evidence that deterministic scripts or the current watchlist may miss.
- For material filings, financing, dilution, liquidity, customer-loss, auditor, governance, or thesis-breaking events, use an xhigh filing or evidence reviewer and an xhigh bear-case reviewer when available.
- Subagents should receive the same dated evidence packet, including source publication dates, retrieval dates, validity windows, confirmed broker facts, policy constraints, open freshness events, valuation states, deterministic outputs with candidate-level scan summaries, every non-removed watchlist row, and the specific question they are answering.
- Use `npm run build:evidence-packet -- --as-of YYYY-MM-DD --deterministic-output research/discovery/runs/YYYY-MM-DD-scan.json --output research/discovery/runs/YYYY-MM-DD-subagent-evidence-packet.yml` to generate the bounded packet when practical, then reference it from `research/quality-metrics.yml`. Repeat `--deterministic-output` when a cycle needs to give subagents multiple saved scans, such as a name-only scan plus a filing-profile index scan.
- Subagent outputs must separate facts, inferences, missing evidence, disconfirming evidence, policy blockers, and recommendation impact.
- Required xhigh roles are considered resolved only when they are either completed or explicitly skipped with an allowed reason such as unavailable tooling, non-material scope, or primary evidence already resolving the question. A skipped role is not silent coverage; the run artifact must mark the role as skipped and explain why.
- Subagent agreement is not proof. If material reviews conflict, the main agent must resolve the conflict from primary evidence. If it cannot, the decision defaults to no trade, hold cash, or the approved liquidity reserve.
- Raw subagent transcripts are not durable research records by default. Commit only the final synthesis or concise process notes when the reviews create durable conclusions or workflow changes.
- Material discovery runs must leave a structured run artifact in `research/discovery/runs/`; otherwise a future agent cannot prove that broad source search, first-layer reasoning, independent xhigh coverage, conflict resolution, and candidate readiness work happened.

Readiness semantics:

- `decision_readiness.status: ready` means the repository-public research state can support the triggered allocation or research decision from repository records and public-observable evidence.
- `decision_readiness.scope` must be `repository_and_public_observable_information`. User-only broker cash, buying power, order-preview details, fractional-share support, and final execution instructions are execution prerequisites, not reasons to mark the repository not ready.
- The durable current state must not remain `not_ready`. If a run reveals missing research evidence, stale coverage, unresolved candidate readiness, unresolved subagent conflict, or other repository-reachable work, the agent must keep iterating until the evidence is gathered, the issue is marked immaterial from evidence, the candidate is rejected or incubated from evidence, or the blocker is genuinely external.
- Header-only discovery, freshness, and valuation files are acceptable only as early scaffolding before the repository is operational. They are not acceptable for a passing current `research/quality-metrics.yml`.
- Validation must reject the current state when active symbols lack current valuation state, latest material filing review coverage, unresolved critical events, unresolved subagent conflicts, a material open raw candidate without a readiness sprint, a material incubating candidate without dashboard-facing research coverage, a material open raw candidate whose blocker is unfinished repository work rather than analyzed evidence, or a `decision_readiness.status` other than `ready`.

Operating-cycle trigger model:

- A user request about a new deposit, monthly contribution, what to buy, what to sell, whether to deploy cash, whether to use SGOV, or how to allocate the account is a decision trigger. It must start the full decision operating cycle before any proposed order is produced.
- A user request to "run everything", "execute the full workflow", "refresh the whole repo", "full monthly cycle", "全量执行", or equivalent language is a full-cycle trigger. It must execute every applicable repository workflow in the safest useful order, including research, data refresh, validation, dashboard checks when relevant, cleanup, and durable commits when state changes.
- The operating cycle is the bridge between this specification and agent behavior. It prevents the system from answering from stale watchlist memory when the real objective is to keep finding the best current public opportunities for the mission.
- The operating cycle must run even when `research/quality-metrics.yml` was previously `ready`; previous readiness is historical evidence, not current-cycle readiness.
- At minimum, a decision cycle must refresh deterministic market data when tooling is available, determine the freshness window, review the discovery lane map, explicitly ask whether a new lane appeared, scan discovery candidates and mission-relevant new public names, check new SEC and IR evidence, review open freshness events, identify stale valuation states and theses, update or cite research quality metrics, run a current watchlist-cycle review for every non-removed watchlist symbol, selectively run promotion/reprioritization where evidence warrants it, and run repository hygiene cleanup before finishing. The cycle must never skip bottleneck-map review merely because the current watchlist already has plausible candidates.
- Full-cycle execution should cover all applicable repository capabilities: account-state reconstruction, market-data refresh, universe discovery, freshness monitoring, filing review, valuation and entry scoring, full watchlist-cycle review, selective watchlist reprioritization, AI-cycle or market-regime review when relevant, monthly allocation, equity-curve refresh when confirmed state exists, dashboard/data verification, source/register updates, research cleanup, meta-self-improvement, and commit/push when changes are coherent.
- Material full-cycle and decision runs should use the advisory subagent model after deterministic refresh has produced an auditable evidence packet. Subagents may help find, retrieve, and interpret missing primary evidence, but their reasoning is not a substitute for actually recording source-backed evidence, source dates, retrieval dates, and uncertainty.
- The cycle may add raw candidates to `research/discovery/candidates.csv` and material events to `research/freshness/events.csv`. It must not automatically promote a company to buy eligibility or make an allocation decision without agent or human judgment.
- If any applicable workflow cannot be completed, the agent must first make a reasonable best effort to complete it when the missing evidence is publicly reachable or available through repository tooling. The agent should not return to the user with the repository in a not-ready research state; it must either resolve the gap into ready evidence, an evidence-based reject/incubate/no-buy conclusion, an immaterial classification, or a genuine external blocker. User-only broker facts remain execution prerequisites and do not make the repository-public research state not ready.
- Every allocation recommendation must include a concise operating-cycle summary: retrieval dates, sources checked, discovery lane changes, discovery candidate changes, freshness events, filing-review status, valuation-state status, cleanup performed, validation run, readiness result, unavailable evidence, and validity window.

Research funnel ruling:

- Do not attempt full deep research on every listed company. That is not feasible and would make the system noisy, slow, and shallow.
- Do maintain broad but cheap awareness of the public universe through symbol directories, SEC issuer coverage, new listings, filings, price dislocations, and theme-specific news.
- Spend deep research only after a company passes a mission-shaped funnel: eligible instrument, relevant bottleneck theme, direct or high-quality exposure to the bottleneck, plausible multi-decade upside, sufficient public evidence, survivable balance sheet, and an entry setup that is not already fully priced for perfection.
- The correct posture is a funnel, not a map of the whole market: scan thousands cheaply, triage hundreds quickly, track dozens lightly, deeply understand a small active set, and allocate only to the few that pass mission, evidence, and entry gates.
- The system should prefer missing a marginal idea over filling the repository with low-conviction notes. Extreme compounding requires a small number of exceptional decisions, not superficial coverage of everything.

First-layer bottleneck-question review:

- Before producing ticker lists, serious discovery must answer the following questions using fresh source-backed research and independent high-reasoning review:
  - What could become scarce or strategically constrained over the next decade?
  - Who controls, owns, enables, or can remove that scarcity?
  - Who can convert the scarcity into pricing power, reinvestment paths, and shareholder value?
  - Is there a public security that directly expresses that exposure under the current policy?
  - Is the public company early, small, misunderstood, newly listed, awkward, or underfollowed enough to support extreme asymmetric upside?
- Each answer should separate facts, inference, uncertainty, disconfirming evidence, and investment implication.
- If the answers identify a new or changed bottleneck, update or propose an update to `research/discovery/lanes.yml`.
- If the answers identify public securities, route them through raw-candidate triage and the discovery readiness sprint before they influence allocation.

Discovery readiness sprint:

- Naming a plausible candidate is not enough. When a new candidate could affect allocation, opportunity cost, lane completeness, or watchlist priority, the system must try to make it research-ready during the powered-on cycle.
- Research-ready means the repository has, when available, security metadata, market data, SEC CIK, current price history, primary filings or issuer reports, source-backed industry context, filing review for material reports, valuation and entry state, same-lane peer comparison, risk and dilution analysis, dashboard-facing research coverage for material completed or incubated public stocks, and a durable classify/promote/incubate/reject decision.
- The sprint must update `research/discovery/candidate-readiness.yml`; material candidates should link a sprint note under `research/discovery/readiness/`.
- Materiality must be explicit: the readiness record should name affected lanes, explain why the candidate could affect allocation or opportunity cost, and state the blocking scope. If the candidate is same-lane with a proposed allocation, the default is material until evidence supports incubating, rejecting, archiving, not-tradable status, or non-material classification.
- An incubated material candidate must be visible, not buried. If it remains relevant enough to current allocation or lane completeness to keep incubating, route it into the research-only dashboard universe and hydrate the same supporting data files used by other public stocks. If it does not deserve that treatment, reject it, archive it, or mark it not material with evidence.
- Do not leave a candidate unbuyable merely because the repository has not yet gathered evidence it can reasonably gather. "Not buy-ready" is acceptable only after the reachable evidence has been exhausted or the remaining blocker is a user-only broker fact, unavailable source, legal access limit, market closure, missing quote, not-tradable status, or an evidence-based failure of the mission, evidence, entry, risk, or policy gates.

### Self-Evolution Loop

Purpose: keep the repository aligned with the mission when old theses improve or deteriorate, prices change, new evidence arrives, or new industries appear.

Cadence:

- Run during every monthly allocation decision.
- Run during every full-cycle repository request.
- Run ad hoc after a major filing, major price dislocation, major industry event, new listing wave, policy change, or market-regime shift.
- Run at least quarterly even when no cash is being deployed, because priority drift and new opportunity discovery matter over multi-year horizons.

Required checks:

- Thesis delta: mark decision-relevant names as `strengthened`, `unchanged`, `weakened`, `broken`, or `stale` based on fresh evidence.
- Entry delta: mark whether the current price and valuation state became `more_attractive`, `unchanged`, `less_attractive`, `dislocated`, or `too_uncertain`.
- Priority delta: decide whether a symbol should be promoted, demoted, frozen, removed, incubated, or left unchanged.
- Opportunity-cost delta: compare the improved or deteriorated name against current holdings, active candidates, cash, and the approved liquidity reserve.
- Theme delta: decide whether a new technology platform, industry bottleneck, regulation, supply-chain constraint, or market structure change deserves a new discovery lane.
- Lane delta: decide whether each active or emerging lane still helps the mission, should be promoted, split, merged, demoted, retired, or expanded because a new bottleneck appeared.

Full watchlist-cycle review:

- Cover every non-removed row in `research/watchlist.csv` during each full operating cycle and monthly decision, including `research_only`, `watch`, `active_candidate`, `active_core_candidate`, `probation`, `frozen`, and `not_tradable`.
- Save one current row per symbol in `research/watchlist-cycle-reviews.csv` with `reviewed_at` equal to the current cycle date.
- Treat `no_change` as an active conclusion, not as skipped work. It must cite current sources and restate the next review trigger.
- Escalate to a promotion review only when the cycle review or a fast-path event could change status, priority, active/core ranking, allocation ranking, or buy-zone eligibility.
- The repository is not ready for a monthly decision or full-cycle completion if any non-removed symbol lacks a current cycle review, if an active/core buy-zone row is stale, or if `research/quality-metrics.yml` reports stale active theses, stale valuation states, open high/critical events, or unresolved watchlist-review conflicts.

Priority-change triggers:

- Promote when fresh evidence strengthens the thesis, removes a key risk, confirms operating leverage, extends runway, improves customer or regulatory proof, or when price dislocates without thesis damage.
- Demote when evidence weakens the thesis, valuation outruns plausible upside, dilution or debt risk increases, customer concentration worsens, execution slips, or a better candidate now dominates the risk/reward.
- Freeze when evidence is unresolved enough that new buying would be premature.
- Remove only when the company no longer fits the mission, becomes ineligible under policy, or the thesis is broken enough that keeping it active creates noise.
- Incubate when a candidate is promising but needs more public evidence, more trading history, more filings, or a clearer entry setup.

Durable outputs:

- Update `research/watchlist-cycle-reviews.csv` for every non-removed watchlist symbol during every monthly decision and full operating cycle.
- Update `research/watchlist.csv` priority, status, next review trigger, and notes when priority changes.
- Update `research/watchlist-transitions.csv` and `research/buy-zones.csv` when active/core status or current buy-zone eligibility changes.
- Update `research/discovery/lanes.yml` when the lane map changes or when the `unknown_future_bottlenecks` review identifies a concrete new lane.
- Update `research/valuation-states.csv` when entry attractiveness changes materially.
- Update `research/freshness/events.csv` when a priority change depends on a material event.
- Add raw names to `research/discovery/candidates.csv` before promotion.
- Add a dated research-engine run note when the run changes discovery, priority, valuation, freshness, or cleanup state.

Guardrails:

- Do not promote a name merely because its price rose or because market sentiment improved.
- Do not call a drawdown attractive unless the thesis is still intact and the balance sheet can survive.
- Do not keep the active set large just to feel comprehensive. A self-evolving engine should also delete, demote, and archive.
- Do not let the initial watchlist, prior favorite names, or old thesis language override fresh evidence and current opportunity cost.

### Universe Discovery Loop

Purpose: find public companies that are not already in the watchlist but may fit the satellite mission.

Cadence:

- Run at least monthly before the allocation decision.
- Run ad hoc after major IPOs, spinoffs, direct listings, index additions, sector shocks, or policy changes.

Recommended source stack:

- SEC company ticker and exchange reference files for listed issuer coverage.
- `scripts/discover-universe.mjs` for a dry-run-first keyword scan across the lane map, SEC listed issuer reference data, and optional source-attributed profile input.
- `scripts/build-discovery-profiles.mjs` for building a repo-research recall-calibration profile input from `research/company-analysis.yml` and `data/market/security_master.csv`. The builder must emit only tradable US-listed common stocks with CIKs, use positive exposure fields rather than risk text, keep source paths repo-relative, and mark skipped private or unsupported securities.
- `scripts/build-issuer-profile-input.mjs` for normalizing externally collected issuer profile text into an SEC-validated `issuer_universe_discovery` profile artifact. This path may include symbols not yet present in `data/market/security_master.csv`; the scanner must count profile-enriched candidates separately from profile-enriched suppressed known matches.
- `scripts/build-sec-issuer-profiles.mjs` for building an `issuer_universe_discovery` artifact from SEC submissions metadata such as SIC description, category, and entity type. This provides a repeatable public-source profile path for SEC-present issuers whose company names and tickers do not expose their bottleneck, supports complete SEC universe selection through `--all`, supports resumable SEC submissions reuse through `--submissions-cache-dir` and `--cache-only`, validates cached submissions against the selected CIK, ticker, exchange, and freshness window, records a per-CIK submissions ledger, can write an incremental `--submissions-ledger-output` for failed or interrupted runs, uses bounded retry/backoff for retryable SEC failures, enforces a complete-universe live-fetch request delay, and must label requested-symbol or first-N profile runs as partial coverage.
- `scripts/build-sec-filing-manifest.mjs` for building an auditable SEC filing manifest from SEC submissions recent-filing metadata before extracting filing business sections. It should select supported 10-K, 20-F, S-1, F-1, or 424B filings deterministically, normalize amendment and 424B variants for downstream extraction while preserving the original SEC form, ignore filings after the requested `--as-of`, default to foundational-first selection so 10-K, 20-F, S-1, or F-1 business descriptions are preferred over newer 424B supplements, rank business-prospectus 424B variants ahead of supplement-grade 424B variants when 424B fallback is required, use explicit form rank plus accession and primary-document tie-breaks within a tier, skip duplicate-CIK share classes, support local filing fixtures for offline validation, support complete SEC universe selection through `--all`, support resumable SEC submissions reuse through `--submissions-cache-dir` and `--cache-only`, validate cached submissions against the selected CIK, ticker, exchange, and freshness window, write an incremental `--submissions-ledger-output` when requested, use bounded retry/backoff for retryable SEC failures, enforce a complete-universe live-fetch request delay, and emit metadata for selection strategy, coverage scope, selection policy, selection family, selection reason, selected SEC form base, displaced newer supported filings, lower-tier newer forms, foundational candidate count, 424B family counts, selection warnings, input hash, row counts, fetched submissions, emitted rows, skipped symbols, SEC user-agent identity, and the per-CIK submissions ledger.
- `scripts/build-sec-filing-profiles.mjs` for building an `issuer_universe_discovery` artifact from SEC filing business sections in 10-K, 20-F, S-1, F-1, or 424B sources. This path should be used for newly public, obscure, renamed, or awkward issuers whose official business description exposes a bottleneck that company-name, ticker, and SIC metadata do not capture. Filing profile artifacts must ingest manifest metadata when available, preserve profile coverage strategy and scope, reject rows whose `source_published_at` is after effective `retrieved_at`, record filing identity when supplied, filing-content hash, extraction method, selected markers, accepted start pattern, offsets, section length, and extraction warnings; automatic extraction should use filing-type-aware business-section headings, anchor 10-K extraction on `Item 1. Business` rather than generic `our business` phrases, skip table-of-contents-only, sentence-fragment, or risk-factor-only text, and record skipped false starts. Remote filing HTML fetches must support optional `--filing-cache-dir`, `--cache-only` or `--require-cached-filings`, cache freshness validation from sidecar metadata, bounded retry/backoff, incremental `--filing-ledger-output`, and per-profile filing content provenance so failed or interrupted extraction runs remain auditable. Local `filing_path` content requires an explicit local-fixture flag and must not become durable issuer-discovery evidence for SEC URLs.
- `scripts/run-sec-filing-discovery-index.mjs` for running the SEC filing manifest, SEC filing profile, and profile-enriched universe scan as one repeatable discovery index. It must write manifest, manifest metadata, profile, scan, and index metadata artifacts; the index metadata must include scope, requested symbols, artifact paths, artifact hashes, command records, coverage counts, and scan counts. Requested-symbol indexes are targeted evidence only; complete SEC universe indexes require `--all` and inherit the upstream SEC submissions guardrails.
- `scripts/build-discovery-artifact-index.mjs` for hash-anchoring standalone generated discovery JSON and CSV artifacts for a date. It must exclude artifact-index files themselves, emit repo-relative paths, classify artifact roles, and produce a `discovery_artifact_index` artifact that `check:data` can use to detect unanchored or changed discovery-run JSON outputs. It must also exclude cache-only discovery intermediates such as semantic issuer packets, semantic batch work orders, semantic smoke or validation artifacts, and full complete-universe SEC issuer-profile dumps, because those belong under ignored `research/cache/discovery/` with durable hashes and summaries committed separately.
- `scripts/build-semantic-issuer-packets.mjs` for building source-backed issuer packets from SEC identity data plus optional issuer or filing profile inputs. The packet is the standard work order substrate for subagents: identity, CIK, exchange, bounded source text blocks, source hashes, market/research context, lane-map hash, packet hash, and invalidation triggers. Scripts prepare the packet; they do not make investment judgments. Complete-universe or otherwise large packet artifacts should be written under ignored `research/cache/discovery/YYYY-MM-DD/`, not committed under `research/discovery/runs/`.
- `scripts/build-semantic-batches.mjs` for splitting issuer packets into bounded subagent work orders and prompt files. It must skip packets that already have current semantic cache records unless explicitly told to include cached packets. Current cache validity must include packet hash, lane-map hash, semantic schema version, classifier version, and `cache_valid=true`. The generated prompt is a coordination artifact for the main agent to use with subagents; the script itself must not call an LLM. Batch JSON and prompt files are cache-only work orders and should stay under ignored `research/cache/discovery/YYYY-MM-DD/`.
- `scripts/classify-semantic-heuristic.mjs` for complete-universe low-cost coarse classification when subagent work should focus on the harder cases. The heuristic classifier is a recall layer, not research judgment; it should prefer cacheable triage, avoid ticker/name collisions, and write JSONL results under ignored `research/cache/discovery/YYYY-MM-DD/`.
- `scripts/import-semantic-classifications.mjs` for importing subagent or heuristic JSONL output into a structured semantic cache. It validates classifier version, schema version, symbol, CIK, packet hash, lane-map hash, reasoning tier, bottleneck exposure, directness, stage, upside fit, escalation, confidence, and evidence references before updating the cache, and it replaces superseded rows for the same issuer packet scope.
- `scripts/build-semantic-discovery-run.mjs` for summarizing the current semantic cache against the current packet artifact. It reports classifier version, classification coverage, stale cache count, unclassified symbols, lane counts, medium-review queue, xhigh-readiness queue, rejection/archive queue, a no-escalation sample, and required next steps. This summary is triage, not buy eligibility.
- `scripts/build-semantic-review-packet.mjs` for creating a bounded subagent review packet from the semantic discovery run. It must carry the semantic run path and hash, semantic cache path and hash, packet artifact path and hash, summary counts, review queues, and review questions so independent reviewers can audit the run without opening the full cache artifacts.
- `scripts/fmp-fetch-lib.mjs` for optional Financial Modeling Prep access. It must read keys only from environment variables, sanitize usage records so API keys are never logged, use ignored cache and usage files under `research/cache/fmp/`, enforce a per-day uncached call budget, and return structured unavailable states so callers can fall back instead of failing an operating cycle merely because the optional provider is unavailable.
- Nasdaq Trader symbol directories for US-listed common stocks and ADRs.
- Exchange, issuer IR, and SEC sources for newly public companies.
- Reputable market data only for market cap, liquidity, and price metadata after the symbol is identified from durable public sources.

Discovery lane map:

- `research/discovery/lanes.yml` is the first stop for universe discovery. It stores the current structural bottleneck hypotheses, source families, screen keywords, public proxies, and review triggers.
- The framework question is not "which stocks are worth watching?" The framework question is "which future bottlenecks can become unavoidable, valuable, and publicly investable?"
- Every full operating cycle must ask: did a new lane appear, did an existing lane become too broad, did a lane stop serving the mission, or did an old rejected lane become investable because public evidence changed?
- A new lane should begin as `emerging` or `incubating` unless there is enough source-backed evidence to make it `active` immediately.
- Keep `unknown_future_bottlenecks` as an explicit open lane. Its job is to force the system to search outside existing categories instead of treating today's watchlist and themes as permanent.
- Lane changes must improve the search for multi-decade asymmetric compounding with avoidable-ruin controls. Do not add a lane merely because a sector is fashionable.

Bottleneck-map-first review questions:

- Which scarce resources, technical capabilities, distribution points, regulatory permissions, infrastructure constraints, or capital-formation changes could become system bottlenecks over the next decade or longer?
- Which bottlenecks can create exceptional pricing power, survival advantage, or compounding reinvestment paths?
- Which public companies directly own, control, or monetize the bottleneck rather than merely referencing the theme?
- Which companies are too small, too early, too recently listed, too awkward, or too difficult for traditional screens to notice?
- What primary evidence would distinguish a real bottleneck owner from a promotional proxy?
- What would make the lane dangerous enough to avoid despite its upside narrative?

Default filters:

- US-listed common stock or ADR under the current policy.
- Directly tradable for a normal retail brokerage account.
- Public filings or equivalent official reporting are available.
- Minimum practical liquidity for retail execution.
- Fits at least one asymmetric satellite theme, or introduces a new theme with a plausible multi-decade bottleneck.
- Avoids pure index duplication of the user's large Nasdaq technology core.

Theme-scoped discovery:

- Start from themes where the satellite objective is structurally plausible, such as space infrastructure, direct-to-device connectivity, AI compute and connectivity bottlenecks, power and cooling, advanced manufacturing, defense autonomy, quantum, programmable money, and future categories created by new regulation or technical breakthroughs.
- For each theme, maintain a finite investable map: public pure plays, public picks-and-shovels suppliers, newly public companies, spinoffs, critical infrastructure vendors, and companies whose market capitalization is still small enough for extreme upside.
- Use screens only as triage, not as proof. Useful first-pass signals include market capitalization range, revenue growth, gross margin, free cash flow trajectory, cash runway, dilution rate, backlog/RPO growth, customer concentration, insider ownership or selling, recent IPO/spinoff status, and sharp price dislocation after non-thesis-breaking events.
- Penalize companies that are merely adjacent to the theme but whose economics are too commodity-like, too levered, too dilutive, too promotional, or too dependent on one binary event.
- Promote only a few names per theme into active monitoring. When a new candidate enters, remove, archive, or demote weaker candidates so the active research set stays small enough to understand.

New-lane test:

- Is there a structural bottleneck, network, regulatory shift, supply constraint, technical platform, or capital-formation change that could create unusually large long-horizon outcomes?
- Is there or will there plausibly be public-market exposure under the current allowed-asset policy?
- Would the lane find candidates not already found by the current lanes and watchlist?
- Can the lane be monitored with durable source families rather than hype?
- What would prove the lane too broad, too promotional, too uninvestable, or too ruin-prone?

Discovery funnel stages:

1. Universe scan: identify eligible US-listed instruments and newly public names from durable symbol and filing sources. Registration and transaction discovery must also scan SEC daily master-index evidence for pre-ticker IPO, listing, spinoff, and transaction leads; interval runs should record coverage start and end dates plus covered and missing-or-unscanned dates so weekend, holiday, or unavailable daily-index gaps are visible. Strict date coverage is optional and should be used only when every requested calendar date must be present. Those leads are not tradable until security metadata confirms an eligible US-listed public equity.
2. Semantic packet build: create cacheable issuer packets from identity data, source-attributed profile or filing text, market context, watchlist/candidate state, lane-map hash, and invalidation triggers.
3. Low-reasoning batch classification: the main agent sends generated batch prompts to lightweight subagents, then imports JSONL results into the semantic cache. This stage asks what the company does and whether it has direct bottleneck exposure; it does not decide buyability.
4. Theme filter: keep only names connected to mission-relevant bottlenecks or emerging categories.
5. Medium lane comparison: compare same-lane semantic hits, reject weak proxies, and decide which candidates deserve readiness work.
6. Cheap triage: use quick structured metrics and source checks to reject obvious weak fits.
7. Primary-source skim: read enough filings, IR material, and operating evidence to decide whether a full research card is justified.
8. Xhigh readiness and promotion review: reserve strongest reasoning for candidates that can affect readiness, watchlist priority, valuation, buy-zone eligibility, allocation, or unresolved conflicts.
9. Deep-dive queue: write or refresh full thesis, filing review, valuation state, and kill criteria only for the small set that could plausibly affect allocation.
10. Active set discipline: keep the buy-eligible universe narrow and demote stale, low-quality, or fully priced names.

Discovery output:

- Add raw candidates to `research/discovery/candidates.csv`, not directly to `research/watchlist.csv`.
- Dry-run scan artifacts should preserve the full match count, returned count, omitted count, every omitted candidate, exploratory unknown-lane match count, every exploratory unknown-lane match, known-symbol suppressions, per-candidate lane matches, matched fields, matched keyword variants, profile source and coverage metadata when used, profile text field ids for profile-only matches when available, security-form warning fields, false-positive flags, priority, review-depth recommendation, and recall diagnostics for known lane proxies. Recall diagnostics should use `current_public_proxies` as explicit recall probes, separate lane-level misses from unique-proxy all-lane misses, explicitly mark lane proxies that are missing from the SEC input, report ticker-only versus organic expected-lane recall, and report private or future proxies outside the SEC-listed recall denominator, so private watch names do not look like silent scanner drops. Broad freshness must fail when a known public proxy recall miss remains unresolved. Profile-enriched unknown candidates, profile-enriched exploratory matches, profile-enriched suppressed matches, profile-known-symbol counts, profile-unknown-symbol counts, and whether profile coverage was requested-symbol, first-N smoke-test, manual, manifest-only, or complete universe must be separate in the scan artifact. A limited table is acceptable for humans only when the JSON artifact keeps enough data to audit what was omitted.
- Promote a candidate to `research/watchlist.csv` only after a human or agent writes a concise thesis, identifies the evidence needed next, and records at least one primary source.
- Reject or archive candidates quickly when the theme is weak, the instrument is not eligible, the public evidence is too thin, the company is a low-quality proxy, or the upside path is already fully dependent on heroic assumptions.
- Summarize each discovery run with [templates/research-engine-run.md](templates/research-engine-run.md) when the run changes durable candidates, valuation states, freshness events, or cleanup state.

Discovery status values are `new`, `incubating`, `promoted`, `rejected`, and `archived`.

Watchlist status taxonomy:

- `active_core_candidate`: highest-priority tradable candidate for regular allocation comparison.
- `active_candidate`: tradable candidate that can receive capital if evidence and valuation are favorable.
- `watch`: tradable or near-tradable candidate requiring active monitoring but more evidence or a better entry.
- `research_only`: not allocation-ready; preserve research memory but do not buy without promotion.
- `not_tradable`: future watch item that is not directly tradable under current policy.
- `probation`: thesis or risk has deteriorated; do not add until the probation trigger is resolved.
- `frozen`: no new buying due to unresolved evidence, policy, liquidity, or operational issue.
- `removed`: no longer part of the active research universe, retained only for audit history.

The comparison universe is `active_core_candidate`, `active_candidate`, and `watch`. The buy-eligible universe is narrower: only `active_core_candidate` and `active_candidate` rows with a current `research/buy-zones.csv` row may receive proposed orders, and only `in_buy_zone` symbols may receive current buy recommendations. `watch`, `research_only`, `not_tradable`, `probation`, `frozen`, and `removed` are excluded from buy recommendations unless a decision explicitly promotes them with fresh evidence, records the transition, and updates buy-zone status.

### Freshness Monitor Loop

Purpose: detect evidence changes between monthly decisions, so the system does not wait for the user to ask before realizing that the facts changed.

Monitor at minimum:

- SEC filings: 10-K, 10-Q, 20-F, 6-K, 8-K, S-1, F-1, 424B, DEF 14A, 13D, 13G, Form 4 when relevant, and material amendments.
- Company IR: earnings releases, shareholder letters, presentations, transcripts when available, guidance, product launches, investor days, and press releases.
- Capital structure: share issuance, warrants, convertibles, debt, covenants, shelf registrations, ATM programs, insider selling, and stock-based compensation.
- Operating evidence: revenue growth, gross margin, operating margin, free cash flow, backlog, RPO, bookings, customer concentration, retention, capacity, launch cadence, production milestones, regulatory approvals, and contract awards.
- Risk events: auditor change, internal controls, restatements, litigation, regulatory blocks, customer loss, technical failure, leadership departure, financing stress, or thesis-critical delays.
- Market events: major price drawdown, valuation compression, unusual gap up, liquidity deterioration, or market cap crossing a threshold that changes expected return.

Freshness output:

- Add every material event to `research/freshness/events.csv`.
- Set `severity` as `low`, `medium`, `high`, or `critical`.
- Set `status` as `new`, `reviewed`, `stale`, `superseded`, or `ignored_with_reason`.
- Critical events must be reviewed before buying. If a critical event cannot be understood, default to no trade or hold cash.
- Update `research/quality-metrics.yml` with open critical/high events and stale valuation or thesis counts after each material research run.

### Filing Review Protocol

When a material filing appears, use [templates/filing-review.md](templates/filing-review.md). This applies especially to 10-K, 10-Q, S-1, F-1, 424B, earnings 8-K, financing 8-K, and any filing that changes dilution, debt, liquidity, guidance, customer concentration, or risk factors.

Scientific filing review rules:

- Read the primary filing or official shareholder letter. Do not rely only on news summaries, social media, quote APIs, or extracted metric tables.
- Use XBRL/company-facts data as a structured index, but the filing text, footnotes, MD&A, liquidity section, risk factors, and subsequent events control the interpretation.
- Compare against the latest stored thesis and the previous comparable period. A filing is useful only if it changes evidence, risk, valuation, or timing.
- Separate accounting facts from analytical conclusions. The filing can say revenue grew; the analysis must decide whether quality, durability, margins, cash conversion, and dilution support the thesis.
- Record source publication date, retrieval date, accession number or filing URL, and the exact filing period.
- Update `research/freshness/events.csv` and `research/valuation-states.csv` when applicable. Add a new `research/company-analysis.yml` entry only when the conclusion should be shown as historical analysis on the dashboard.
- Save completed material filing reviews under `research/filings/` and link the freshness event through `review_path`. If the filing is deliberately treated as immaterial, leave an auditable reason in `immaterial_reason`.

### Valuation and Entry Loop

Purpose: decide whether a good company is also buyable at a price that can plausibly serve the multi-decade asymmetric objective.

The system must not reduce valuation to one ratio. Use a multi-lens state:

- `broken_thesis`: price is irrelevant because evidence no longer supports the thesis.
- `too_expensive`: strong company, but expected future return no longer fits the mission.
- `fair`: reasonable but not unusually attractive versus current holdings and cash.
- `attractive`: thesis intact and price offers a favorable long-term entry.
- `dislocated`: thesis intact while market price appears unusually depressed by temporary or misunderstood factors.
- `too_uncertain`: evidence is insufficient to distinguish cheap from broken.

Required valuation considerations:

- Market capitalization and enterprise value versus the plausible future profit pool.
- Revenue growth, gross margin, operating leverage, and cash conversion quality.
- Dilution-adjusted upside, including stock-based compensation, warrants, convertibles, ATM programs, and likely future financing.
- Balance sheet survival: cash, debt, burn, runway, covenant risk, and financing access.
- Unit economics and backlog/RPO quality when the business reports them.
- Customer concentration and dependency on one budget cycle, launch provider, hyperscaler, regulator, or government program.
- Historical drawdown and valuation compression, but only as context. A large drop is not enough; the thesis must remain intact.
- Opportunity cost versus existing holdings and other active candidates.
- What evidence would make the position a buy, add, hold, probation, trim, or sell.

Valuation output:

- Maintain `research/valuation-states.csv` for active and near-active candidates.
- `price_attractiveness` should be a concise label such as `too_expensive`, `fair`, `attractive`, `dislocated`, `too_uncertain`, or `broken_thesis`.
- Monthly decisions must cite the current valuation state or explain why it is stale and recomputed in the decision.
- Use `scenario_path` when the valuation state depends on a detailed downside/base/upside scenario, dilution bridge, or other longer calculation that should remain auditable outside the CSV row.

### Research Quality Gates and Metrics

The system should measure whether it is ready to make a decision, not only whether it has many notes. A research process that cannot quantify freshness, coverage, and unresolved evidence should default to caution.

Hard gates before a buy recommendation:

- No open `critical` freshness event for the target symbol.
- No open unreviewed material filing for the target symbol unless the decision explicitly explains why it is immaterial.
- A current valuation state exists for the target symbol or is recomputed in the decision.
- The latest thesis has not expired under the quality gates in `research/quality-metrics.yml`, or the decision refreshes it.
- The recommendation can state why the company is both thesis-worthy and entry-worthy at the price basis used.
- Cash, position sizing, and execution assumptions are derived from confirmed account files or explicitly provided broker information.

Research engine health metrics:

- `universe_scan_as_of`: latest date the public issuer universe was checked.
- `discovery_lane_map_as_of`: latest date the discovery lane map was reviewed.
- `watchlist_symbols`: non-removed watchlist rows that require a current cycle review.
- `watchlist_symbols_with_current_cycle_review` and `watchlist_symbols_missing_current_cycle_review`: proof that each non-removed watchlist symbol was reviewed during the current quality-metrics date.
- `active_discovery_lanes` and `emerging_discovery_lanes`: current lane-map breadth, used to catch accidental lane-map drift.
- `active_symbols_with_current_valuation_state`: active watchlist or holding symbols with a non-stale valuation state.
- `active_symbols_with_latest_filing_review`: active symbols whose latest material filing has been reviewed or marked immaterial.
- `raw_discovery_candidates_open`: candidates still waiting for promote/reject/incubate action.
- `open_critical_events` and `open_high_events`: unresolved material event risk.
- `oldest_open_event_date`: oldest unresolved freshness event.
- `stale_valuation_states_over_45_days`: valuation states older than the default review window.
- `stale_theses_over_90_days`: company theses older than the default review window.

Company quality indicators:

- addressable profit pool and why the company can capture it;
- bottleneck ownership, scarcity, network effects, technical edge, licenses, manufacturing capacity, or distribution leverage;
- revenue growth, growth durability, gross margin, operating margin, and operating leverage;
- cash conversion, free cash flow trajectory, burn, cash runway, debt, covenants, and financing access;
- dilution, share count growth, stock-based compensation, warrants, convertibles, ATM programs, and shelf capacity;
- backlog, RPO, bookings, orders, launch cadence, capacity, utilization, or equivalent operating indicators when relevant;
- customer concentration, partner dependency, regulatory dependency, government budget dependency, and supplier dependency;
- management execution quality, guidance credibility, governance, internal controls, auditor risk, and capital allocation behavior;
- competitive intensity, substitute risk, technology roadmap risk, product-market fit, retention, and pricing power;
- kill criteria that would prove the thesis is wrong.

Entry quality indicators:

- current market capitalization and enterprise value versus plausible long-term revenue, gross profit, operating profit, and free cash flow outcomes;
- dilution-adjusted upside rather than headline market-cap upside;
- price versus the latest evidence, not price versus an old narrative;
- drawdown, volatility, 52-week range, all-time high, and valuation compression as context only;
- scenario analysis with downside, base, and upside paths when enough evidence exists;
- explicit distinction between `good company but too expensive`, `cheap because misunderstood`, and `cheap because broken`.

Process quality indicators:

- material-event detection latency;
- time from material filing to completed filing review;
- percentage of active symbols with current valuation state;
- percentage of active symbols with current filing review;
- candidate funnel quality: discovered, rejected, incubated, promoted, and later removed;
- reasons for missed opportunities or false positives after postmortem;
- amount of stale or duplicate research removed or archived during cleanup.

### Monthly Allocation Loop

The monthly decision compares all active candidates and holdings together. It must not simply buy the top-ranked name from a static watchlist.

Allocation inputs:

- confirmed cash and positions;
- confirmed liquidity reserve value available for sale;
- fresh prices and daily close snapshots;
- open freshness events;
- latest filing reviews;
- latest valuation states;
- current portfolio concentration by ticker and theme;
- thesis strength, thesis delta, valuation state, risk state, and available cash;
- whether new candidates deserve promotion, incubation, or rejection.

Allocation outputs:

- proposed exact share counts and estimated cash use;
- total deployable-liquidity basis used for sizing, including cash, reserve-sale proceeds, and retained buffer;
- a validity window tied to price and evidence freshness;
- rationale for why new cash goes to the selected name or stays in cash;
- rationale for why idle cash should or should not be parked in the approved liquidity reserve;
- explicit statement when a name is good but not buyable at the current price;
- explicit statement when a name is cheap but evidence is too weak or the thesis may be broken.

## Freshness Rules

Every monthly decision must include a freshness report covering:

- confirmed cash and positions;
- latest market prices;
- company SEC filings since the previous decision;
- company IR releases since the previous decision;
- material regulatory, contract, financing, dilution, and leadership updates;
- macro context relevant to the thesis, especially rates, AI capex, power availability, launch cadence, defense budgets, and stablecoin regulation.

Freshness defaults:

- Broker cash and positions: current decision cycle, or explicitly marked unavailable.
- Market prices: same trading day when available; otherwise latest available official close with the exact market date.
- SEC and IR checks: must search after the previous decision date.
- News and industry checks: must search after the previous decision date.
- Existing thesis: must be re-read and marked as confirmed, weakened, broken, or unchanged.

If a critical freshness check fails, the decision must default to no trade or hold cash.

## AI Cycle and Market Regime Monitor

The AI cycle monitor is a risk overlay for monthly allocation and major-event reviews. It is not a standalone trading system, and it does not override the allowed-asset policy. Under policy `v1.1`, the monitor may recommend buying eligible common stocks, holding cash, parking idle liquidity in an approved short-duration U.S. Treasury reserve, reducing or exiting confirmed return-seeking positions, or waiting. It must not recommend options, shorts, leverage, margin, crypto tokens, private shares, or non-US-listed instruments as account actions unless a later approved policy allows them. If a market-regime review discusses puts, hedges, or shorts as general market context, the output must label them as outside the account policy rather than converting them into proposed orders.

Purpose:

- identify whether the broad AI infrastructure cycle is strengthening, topping, deteriorating, or entering credit stress;
- separate company-specific thesis changes from market-wide multiple compression, capex risk, financing risk, and liquidity risk;
- keep the satellite portfolio from adding capital into a broad bubble unwind merely because an individual company thesis still sounds strong;
- avoid forcing defensive sales during ordinary volatility when credit, earnings quality, and primary evidence remain healthy.

Cadence:

- Run before any monthly allocation decision when the active universe has material AI infrastructure, space infrastructure, power, cooling, or financing-cycle exposure.
- Run after major market events such as a sharp Nasdaq or SOX drawdown, a major AI financing failure, a hyperscaler capex shock, a credit spread break, a semiconductor supply-chain warning, or a material regulatory/geopolitical event.
- A weekly Saturday review can be automated later, but automation may only collect and structure evidence. Allocation judgment still requires agent or human review.

Required coverage:

- Index and factor tape: SPX, NDX, Nasdaq Composite, QQQ, SOX, SMH, IWM, and relevant equal-weight or breadth measures when available.
- Volatility and options context: VIX, VVIX when available, put/call measures when available, and unusual option activity in AI leaders only when sourced from a reputable data provider.
- Rates, dollar, and credit: 2-year Treasury yield, 10-year Treasury yield, real yields when available, U.S. dollar index, high-yield OAS, investment-grade OAS, and CDX HY or equivalent credit stress measures when available.
- Market breadth: advancing and declining issues, 52-week highs and lows, concentration in mega-cap leaders, and whether AI leaders are masking broad weakness.
- AI capex: Microsoft, Alphabet, Amazon, Meta, Oracle, Tesla, CoreWeave, Nebius, xAI, OpenAI, Anthropic, and other relevant infrastructure buyers when source-backed data exists.
- AI supply chain: NVIDIA, AMD, Broadcom, TSMC, ASML, SK Hynix, Micron, Arista, Dell, Super Micro, power, cooling, and data-center infrastructure suppliers.
- AI demand and unit economics: cloud AI revenue, enterprise AI paid adoption, AI software ARR, model API revenue, inference cost, GPU rental pricing, gross margin, depreciation, cloud margin, and AI service margin when source-backed data exists.
- Financing and IPO pressure: public offerings, convertible debt, private funding rounds, secondary-market valuation changes, IPO filings, lockups, and data-center financing terms for relevant AI and space infrastructure companies.
- Regulation and geopolitics: chip export controls, antitrust, data regulation, energy permitting, power-grid constraints, defense budgets, launch regulation, spectrum regulation, and major geopolitical shocks.
- Market calendar: U.S. market holidays and shortened sessions must be stated explicitly when they affect weekly data.

The required coverage list is a 2026 starting checklist, not a permanent list of sacred indicators. The durable questions are broader: where is capital being over-allocated, where are bottlenecks real, where are unit economics improving or deteriorating, where is financing becoming fragile, and where is market structure hiding risk. Future reviews should replace obsolete tickers, data series, cycle analogies, and source families when technology, market plumbing, or the account policy changes. Keep the economic question; update the proxy.

Indicator evolution rules:

- If an indicator stops mapping to the active opportunity set, mark it stale and replace it rather than collecting it by habit.
- If a new bottleneck becomes central to the portfolio, add source-backed indicators for that bottleneck before it affects allocation.
- If a historical analogy stops clarifying the current cycle, demote it to context and use a better source-backed framework.
- When changing the checklist, preserve auditability by noting what changed, why the old proxy became weak, and what source family will replace it.
- Do not weaken freshness, source, policy, or no-auto-trading requirements while updating indicators.

Output requirements:

- Separate `facts`, `inferences`, `probability scenarios`, and `account actions`.
- State what could not be verified instead of filling gaps with memory or estimates.
- Provide source publication dates, data timestamps, retrieval dates, and data scope for every important market, company, and credit claim.
- Use probability-weighted regime labels rather than a single false certainty. Allowed regime labels are `strong_trend`, `top_formation`, `early_downtrend`, `bubble_break_initial`, `credit_stress`, and `survivor_reset`.
- Internet-bubble analogies may be used only as a rough cycle map, not as proof. Allowed analogy labels are `1996-1998_early_diffusion`, `1999_narrative_and_valuation_acceleration`, `2000Q1_near_top`, `2000H2_orders_and_capex_deterioration`, `2001-2002_credit_risk_exposure`, and `2003_survivor_stage`.
- Score bubble risk dimensions from 0 to 5 and explain the change from the prior monitor if a prior monitor exists.
- Convert the regime view into account-permitted actions with trigger conditions, invalidation conditions, and a time horizon.
- If there is no clear account-permitted trade, say `no clear account-permitted trade`.

Bubble risk dimensions:

- valuation excess;
- capex overheating;
- financing fragility;
- real demand conversion;
- supply glut risk;
- leader earnings quality;
- second-tier company fragility;
- credit market stress;
- breadth deterioration;
- regulatory and geopolitical risk;
- mega-IPO and private-market capital drain risk.

## Monthly Decision Algorithm

1. Identify the policy version.
2. Load confirmed ledger, positions, contribution plan, and prior decisions.
3. Ask whether the user has confirmed a new deposit if the prompt is ambiguous.
4. Run the full decision operating cycle through discovery-lane review, universe discovery, freshness, filing, valuation, risk, allocation, cleanup, and validation stages. This is mandatory and must not be skipped because the user phrased the request casually.
5. Compute total deployable liquidity from confirmed cash, confirmed deposits, and confirmed liquidity reserve value available for sale. Do not limit sizing to the latest monthly contribution when a stronger opportunity justifies broader deployment.
6. Retrieve fresh prices for current holdings, active candidates, and any newly promoted or decision-relevant discovery candidate.
7. Retrieve fresh primary evidence for each active candidate and any newly decision-relevant candidate.
8. Run discovery readiness sprints for plausible new candidates that could affect allocation, opportunity cost, lane completeness, or watchlist priority. Do the reachable public research before declaring the candidate not buy-ready because of missing repository data.
9. Run or cite the AI cycle and market regime monitor when the allocation depends on AI capex, AI financing, semiconductor supply chains, data-center power, credit conditions, or broad bubble risk.
10. Check `research/quality-metrics.yml` and resolve open critical events, missing filing reviews, stale valuation states, stale theses, and any incomplete operating-cycle item. Explicit disclosure is not enough when the missing evidence can be gathered during the cycle.
11. Run xhigh advisory subagents when available. For any decision that could deploy cash, sell a reserve, add, trim, exit, or hold despite available deployable liquidity, use at least freshness/evidence, bull-case, bear-case, and allocation/risk reviewers.
12. Update watchlist status durably when the evidence supports a change. Do not merely update status mentally when the change affects active/core standing, buy-zone eligibility, or allocation ranking; record the transition and buy-zone state.
13. Run the thesis check: `strengthened`, `unchanged`, `weakened`, or `broken`.
14. Run the risk check: concentration, liquidity, valuation, dilution, debt, customer concentration, execution, regulatory, funding runway, macro regime, credit stress, and AI-cycle crowding.
15. Reconcile subagent findings explicitly. Bear-case blockers and critical missing evidence must be answered before buy/add recommendations. Unresolved material conflicts default to no trade, hold cash, or the approved liquidity reserve.
16. Decide one of: buy new position, add to existing position, park idle cash in the approved liquidity reserve, hold cash, do nothing, trim, or exit.
17. Convert allocation into exact proposed share counts using the latest price basis, estimated fees, and whole-share or fractional-share assumptions.
18. State the operating-cycle result and validity window. If price moves materially, market closes, new company-specific information appears, or the operating-cycle evidence becomes stale, recompute.
19. Save the proposed decision in `decisions/` if the user asks to persist it.
20. Do not update `data/account/ledger.csv` until execution is confirmed.
21. If the recommendation produces new durable market snapshots, source records, or performance observations, update the relevant research or market-data files without changing confirmed account records.
22. If confirmed cash or positions exist, refresh the portfolio-level valuation snapshot using fresh prices and append or update `data/account/equity_curve.csv` for the decision date. Backfill missing month-end snapshots only from historical close data.

## Position Sizing Policy

This is a satellite account, so concentration is allowed. Permanent impairment risk still matters.

Default sizing principles:

- Start new names in stages unless a fresh, unusually strong evidence update justifies a larger first allocation.
- Prefer adding to existing high-conviction names when fresh evidence confirms the thesis and valuation remains tolerable.
- Prefer holding cash or liquidity reserve over forcing deployment when evidence or valuation is not strong enough.
- When evidence and entry quality are unusually strong, consider using total confirmed deployable liquidity, including SGOV or equivalent reserve sales, rather than only the latest monthly contribution.
- Prefer withholding new cash from downgraded names before selling existing positions.
- Do not make forced rebalancing trades just because a position outperformed.
- Do not sell winners solely because they became large; sell only if the thesis breaks, risk becomes unacceptable, or opportunity cost becomes overwhelming.
- Newly public companies normally require extra caution until at least two public quarterly reports are available, unless there is unusually strong primary evidence.

Suggested guardrails for normal decisions:

- Keep a small cash buffer for price slippage and fees.
- Avoid deploying the full monthly contribution into a single unprofitable, pre-commercial company unless fresh evidence materially reduces execution risk.
- Do not deploy the full monthly contribution merely to avoid idle cash. Cash and the liquidity reserve preserve option value.
- Do not preserve the liquidity reserve mechanically when a rare opportunity passes all gates strongly enough to justify deployment. Explain why the opportunity deserves reserve capital and what buffer remains.
- Track theme concentration, especially AI infrastructure and space infrastructure, because multiple tickers can depend on the same capital spending cycle.

The guardrails are not mechanical rules. The final recommendation must explain why the chosen sizing best serves the long-term asymmetric objective.

## Candidate Universe

Default allowed assets:

- common stocks or ADRs listed on major US exchanges;
- companies with sufficient liquidity for normal retail execution;
- companies whose thesis can be researched from public sources.
- SGOV or a materially equivalent short-duration U.S. Treasury ETF or Treasury money-market vehicle, for liquidity reserve use only under policy `v1.1`.

Default excluded assets:

- options;
- margin or leveraged ETFs;
- inverse ETFs;
- short positions;
- crypto tokens;
- private shares and secondary private markets;
- OTC securities;
- funds that simply duplicate the user's existing Nasdaq technology core.
- bond funds used as yield-seeking or duration-seeking allocations rather than liquidity reserves.

Future IPO watch items such as SpaceX, OpenAI, and Anthropic are research-only until they become directly tradable under the allowed asset rules.

## Research Scorecard

Each candidate is assessed on these dimensions:

- Extreme upside path: how the company could plausibly become much larger.
- Bottleneck ownership: whether the company controls a scarce capability, network, license, distribution point, manufacturing base, or technical standard.
- Evidence quality: revenue, backlog, regulatory approval, customer adoption, launches, deliveries, margins, and cash flow.
- Business quality: gross margin, operating leverage, recurring revenue, switching costs, ecosystem leverage, and customer diversity.
- Balance sheet: cash, debt, burn, dilution, financing access, and runway.
- Execution risk: engineering, production, launch, regulatory, integration, supply chain, and management credibility.
- Valuation risk: whether the market has already priced in too much of the successful future.
- Kill criteria: specific facts that would force downgrade or removal.

Use letter tiers for readability:

- `A`: active core candidate.
- `A-`: near-core candidate with one major unresolved risk.
- `B+`: attractive watch candidate, not yet strong enough for core status.
- `B`: watch candidate needing more evidence or a better entry setup.
- `B-`: highly speculative option-like candidate.
- `C+` or below: research-only unless evidence changes materially.

Status ladder:

- `research_only`: dashboard-visible but not buyable without a fresh promotion review.
- `watch`: monitored and eligible to affect opportunity-cost comparison, but not automatically buyable.
- `active_candidate`: a live allocation contender that has current evidence, current valuation state, reviewed material filings, and a plausible entry setup.
- `active_core_candidate`: a top-tier candidate whose mission fit, direct bottleneck control, evidence quality, long-term upside, survival profile, and opportunity-cost ranking are strong enough to be compared with RKLB and ASTS.
- `buy_zone`: not a watchlist status; it is the current decision-cycle conclusion that a symbol passes mission, evidence, entry, survival, opportunity-cost, and allocation/risk gates strongly enough to support a proposed order.

Promotion triggers include thesis strengthening, material filing or event updates, price dislocations, valuation compression, balance-sheet improvement, customer or contract evidence, regulatory progress, lane reprioritization, core-candidate weakening, or a superior same-lane opportunity. The system should be agile: material events and severe price dislocations should trigger a fast-path promotion review during the current powered-on session or the next approved monitoring wakeup, not wait passively for a monthly cadence.

Required promotion evidence:

- primary-source freshness and material filing review;
- source-backed bottleneck ownership and public-security expression;
- valuation and entry state;
- dilution, debt, runway, customer concentration, execution, regulatory, and governance risk review;
- same-lane peer comparison and opportunity-cost ranking versus current core candidates, cash, and the approved liquidity reserve;
- independent fresh-context xhigh evidence/freshness, valuation/entry, bull-case, bear-case, and opportunity-cost/allocation reviews when tooling is available;
- explicit kill criteria, next review trigger, conditions to promote further, and conditions to demote.

Do not promote merely because a symbol has been watched for a long time, and do not block promotion merely because a symbol is newly discovered. Fresh evidence controls status.

## Sell and Downgrade Policy

Sell or trim only after fresh evidence shows at least one of:

- thesis broken;
- fraud, accounting, audit, or governance risk becomes material;
- financing risk threatens survival or creates unacceptable dilution;
- major customer, regulator, or technical milestone fails in a way that changes the long-term path;
- valuation becomes so extreme that expected future returns no longer match the mission;
- a superior opportunity exists and cash cannot be raised from contributions alone.

Do not sell because:

- a stock is volatile;
- the market is temporarily fearful;
- a position is up a lot but the thesis strengthened;
- a position is down but the thesis is intact and liquidity is sufficient.

## Execution Confirmation and Ledger Updates

A proposed order becomes a ledger event only after the user confirms execution.

Minimum required confirmation fields:

```yaml
broker:
account_alias:
confirmation_id:
event_type:
side:
symbol:
quantity:
average_price:
fees:
currency:
trade_date:
settlement_date:
```

For deposits, required fields:

```yaml
broker:
account_alias:
confirmation_id:
amount:
currency:
deposit_available_date:
created_at:
```

If any required field is missing, ask for it. Do not fill missing fields from market data.

Ledger math:

- Deposit increases cash by confirmed amount.
- Buy decreases cash by `quantity * average_price + fees`.
- Sell increases cash by `quantity * average_price - fees`.
- SGOV or equivalent reserve buys and sells use normal buy and sell ledger events. They are securities transactions, not cash ledger shortcuts.
- Fees are recorded explicitly.
- Splits, dividends, and corrections use separate event rows.

Corrections are append-only. Never silently rewrite history.

## Self-Evolution Mechanism

The repository should improve over time, but improvement must not drift away from the mission: multi-decade asymmetric compounding with outcomes that can plausibly become tens, hundreds, or thousands of times larger over a very long horizon, while avoiding avoidable ruin. Self-evolution applies at two levels:

- research self-evolution: better candidates, better watchlist priorities, better thesis and valuation updates;
- meta-self-improvement: better ways to discover, research, score, decide, validate, visualize, document, and clean up.

Self-evolution has two equal duties:

- improve the system's ability to make fresh, critical, long-horizon allocation decisions;
- improve the system's ability to notice new discovery lanes before the current watchlist becomes stale;
- reduce accumulated noise so future agents can find the signal faster.

Meta-self-improvement is a disciplined learning loop, not open-ended refactoring. Use it when the work exposes a durable process defect, such as a missed candidate class, stale source family, weak filing workflow, noisy dashboard surface, ambiguous scoring label, repeated manual step, validation gap, or decision-quality failure.

Method:

1. Observe: record what failed, slowed the run, created ambiguity, or reduced decision quality.
2. Orient: decide whether the issue is a one-off artifact or a durable process defect. Check whether it affects mission fit, freshness, auditability, clone portability, user trust, or avoidable-ruin controls.
3. Plan: state a process-improvement hypothesis with expected benefit, possible harm, success signal, rollback condition, and review date.
4. Do: change the smallest durable artifact that solves the problem.
5. Study: revisit the change after the next relevant research or decision cycle and compare against the success signal.
6. Act: keep, revise, broaden, or revert the change and remove obsolete scaffolding.

Allowed self-improvements:

- better research templates;
- better repo-scoped skills for repeated workflow triggering and navigation;
- better source lists;
- stricter freshness checks;
- clearer scoring definitions;
- better candidate universe filters;
- better discovery-lane maps and lane-review triggers;
- better decision and audit formatting;
- new tools that make the process more reliable;
- clearer dashboard interactions and visualizations;
- cleanup of stale, duplicated, misleading, or low-signal repository content.
- process-quality scorekeeping, decision journals, premortems, postmortems, calibration reviews, and process experiments that improve future allocation decisions.

Forbidden self-improvements:

- automatic trading;
- ledger updates without confirmed execution;
- weaker freshness requirements;
- deleting or rewriting audit history;
- hidden local state;
- weakening the long-term asymmetric objective;
- making the process look systematic while narrowing search away from future asymmetric lanes;
- adding leverage, options, margin, shorts, crypto tokens, private shares, or OTC securities without explicit user approval.

Policy changes use [templates/policy-change-proposal.md](templates/policy-change-proposal.md). Approved changes create a new file in `data/policy/` and decisions after that point cite the new version.

Durable behavior changes also require documentation review. When adding a new data file, dashboard feature, decision step, automation, or public reporting surface, update `SPEC.md`, `AGENTS.md`, or templates in the same change when the behavior should persist for future agents.

Use [templates/meta-self-improvement.md](templates/meta-self-improvement.md) for substantial methodology upgrades, repeated process defects, major postmortems, premortems before large workflow changes, or changes that introduce new scoring, source, automation, or dashboard behavior. Store durable process reviews under `research/process/` when they are more than a tiny inline cleanup note.

Operational loop:

1. Observe what became slow, confusing, stale, duplicated, visually noisy, or error-prone during the current interaction.
2. Decide whether the lesson is durable. If it is one-off scratch work, do not encode it as process.
3. Encode durable lessons into the narrowest durable artifact: `AGENTS.md` for agent rules, `SPEC.md` for system design, templates for repeated workflows, `research/discovery/lanes.yml` for lane-map changes, data files for source-of-truth records, and source code for product behavior.
4. Clean the repository after the improvement. Remove obsolete scratch files, unused demo assumptions, dead UI states, stale generated artifacts, duplicate notes, and sources that no longer support active research.
5. Preserve audit history. Confirmed ledger events, policy versions, dated decisions, and past research baselines must remain reconstructable. If they are no longer current, mark them as historical, archived, superseded, or stale rather than presenting them as active evidence.
6. Verify that the public dashboard, decision workflow, and data model still use clear provenance boundaries between confirmed facts, current market facts, historical evidence, demo fixtures, and analysis.

Meta-learning controls:

- Prefer small reversible process experiments over broad rewrites.
- Attach review dates to process changes that make predictions about better decision quality.
- Do not let one recent miss overfit the whole process.
- Do not add ceremony unless it improves freshness, signal quality, auditability, speed, or error prevention.
- Treat source lists, templates, quality metrics, dashboards, and scripts as improvable tools, not as sacred artifacts.
- Treat repo-scoped skills as improvable trigger layers, not canonical source-of-truth documents.
- Periodically ask whether a better public source, data provider, validation check, discovery lane, or visualization would make the next decision materially better.

Repo-scoped skill evolution:

- Create a repo-scoped skill when a repeated repository workflow needs stronger automatic trigger metadata or navigation than the normal docs provide.
- Update a repo-scoped skill when canonical workflow triggers, execution order, safety boundaries, validation commands, or template names change.
- Remove or simplify a repo-scoped skill when it duplicates canonical docs, drifts from `AGENTS.md`, triggers too broadly, or adds context cost without improving execution.
- Do not put raw research, individual stock theses, broker/account facts, secrets, or large source material in skills.

Noise control rules:

- Prefer one canonical record for each durable concept. Link to that record instead of repeating similar instructions across many files.
- Keep temporary screenshots, local logs, generated caches, browser test artifacts, exploratory scratch notes, and one-off fake data out of committed state unless they are intentional fixtures.
- Move candidates out of the active research universe when the thesis is stale, broken, no longer directly tradable, no longer aligned with the satellite mission, or not worth fresh research time. Keep a short reason and date for the downgrade.
- Mark old sources as historical evidence when their publication date is no longer current. A newly retrieved old source is not fresh market information.
- Keep dashboard surfaces sparse and decision-useful. Remove metrics, cards, labels, or interactions that look impressive but do not improve understanding of confirmed state, current performance, account activity, source freshness, or the research universe.
- Whenever a cleanup removes or demotes material that future decisions might otherwise expect, note the reason in the commit or a dated decision/research note.

## Public Dashboard

The public dashboard is deployed at `https://www.wineandchord.com/invest/`. It is a static Astro site using `base: "/invest"` so it works as a GitHub Pages project site under the shared `www.wineandchord.com` domain.

The dashboard is English-only by default. It should not provide a Chinese page, locale switcher, or Chinese UI copy unless a future explicit requirement adds multilingual support.

The dashboard's real-data view is built from committed repository files:

- `data/account/state.yml` for confirmed account status;
- `data/account/ledger.csv` for confirmed operations;
- `data/account/positions.csv` for derived confirmed holdings;
- `data/account/equity_curve.csv` for performance history;
- `data/market/watchlist_prices.csv` for dated market snapshots;
- `data/market/price_history.csv` for committed daily OHLCV history used by company price charts and sparklines;
- `data/market/technical_snapshots.csv` for derived return, 52-week range, moving-average, RSI, and volume display metrics;
- `data/market/company_metrics.csv` for SEC-derived fundamentals and valuation ratios combined with the latest committed close;
- `data/market/security_master.csv` for tradability, exchange, SEC CIK, and external research/chart links;
- `research/watchlist.csv` for the research pool.
- `research/company-analysis.yml` for structured company briefs and historical analysis drilldowns.

The dashboard may include browser-only demo data for testing visual logic while the real account has no records. Demo data must be clearly labeled and must not write files, update the ledger, or appear in committed account records.

Required dashboard surfaces:

- total equity;
- confirmed cash;
- cumulative deposits;
- total return;
- Sharpe ratio when enough return observations exist;
- maximum drawdown when enough equity observations exist;
- holdings table;
- append-only operation history;
- equity curve;
- buy and sell markers on the equity curve, sourced from the confirmed ledger when real data exists;
- active research/watchlist workspace with company cards, committed price sparklines with a global window control, recent 1D and 5D price moves with percent or dollar display, key technical and valuation metrics, hover or focus quick briefs, click or tap detail drilldown, symbol-specific confirmed trade markers on price charts, and historical analysis timeline;
- per-symbol research pages under `/research/<symbol>/` with committed price charts, symbol-specific confirmed trade markers, market/technical/fundamental metrics, analysis provenance, external links, and an optional live TradingView preview;
- open-source repository link.

The equity curve uses TradingView Lightweight Charts as a client-side chart engine. The engine supplies chart interaction only: time and price axes, crosshair behavior, viewport range controls, touch gestures, and ledger event markers. It must not be treated as a data provider. Real points still come from committed account files, and demo points still come only from browser-only fixtures. Keep TradingView attribution visible through either the built-in mark or a restrained public attribution link near the chart.

Company price charts use the same Lightweight Charts engine, but their price data comes from committed `data/market/price_history.csv`. Research drilldowns and per-symbol pages include 1D and 5D chart ranges and recent-move chips derived from committed daily sessions. They may overlay symbol-specific confirmed buy and sell markers from `data/account/ledger.csv`; those markers use operation colors and must not be inferred from recommendations, analysis notes, or unconfirmed broker activity. Each tradable company brief may also include a default-open external TradingView Advanced Chart widget configured as a 1D intraday preview that requests extended-hours sessions when TradingView supports them. That widget may help live visual inspection, including pre-market and after-hours context, but it is not a repository source of truth and must not replace the committed price, technical, SEC, IR, filing, or news evidence required for decisions.

TradingView-grade chart benchmark, captured on 2026-05-26 from official TradingView and Lightweight Charts documentation:

- Reference sources: TradingView Lightweight Charts customization guide (`https://tradingview.github.io/lightweight-charts/tutorials/customization/intro`), crosshair guide (`https://tradingview.github.io/lightweight-charts/tutorials/customization/crosshair`), series markers guide (`https://tradingview.github.io/lightweight-charts/tutorials/how_to/series-markers`), SeriesMarkersOptions API (`https://tradingview.github.io/lightweight-charts/docs/api/interfaces/SeriesMarkersOptions`), and TradingView product comparison explaining that Lightweight Charts contains no market data (`https://www.tradingview.com/charting-library-docs/latest/getting_started/product-comparison/`).
- Use a real financial chart engine for the plot area rather than hand-drawn SVG paths once the chart needs professional interaction.
- Preserve the canonical financial chart structure: bottom time scale, right price scale, visible latest value line when useful, subtle grid, readable axis labels, and a crosshair that exposes exact values.
- Keep the chart header, visible range controls, plot area, axes, and tooltips in non-overlapping zones. Header controls may sit directly above the plot, but they must not cover the data area or require horizontal page scrolling on mobile.
- Use crosshair behavior for exploration, not giant hover blocks. The crosshair detail card should stay compact, follow the pointer or tap target, and show date, equity, total return, period return, deposits, and same-day operation detail when available.
- Use series markers for dated ledger events. Markers attach to the time series by date and should auto-scale with the chart so they are not clipped at the plot edge.
- If a ledger event date does not have a matching equity snapshot, show that event in the operation rail as not plotted instead of implying that it appears on the chart. Add the missing valuation snapshot later when reliable price data is available.
- Event markers must not distort the portfolio value axis. If marker auto-scaling creates misleading price ranges, keep the price scale fit to equity values and expose operation detail through compact markers, event chips, and drill-down cards.
- Provide fast viewport controls for common horizons: `1M`, `3M`, `6M`, `YTD`, `1Y`, `3Y`, `5Y`, and `ALL`. Range changes should update the existing chart viewport instead of recreating the whole surface when practical.
- `ALL` must fit the full committed series even inside compact side panels. If the chart spans multiple calendar years, date range labels should include years so users do not confuse an all-history view with a short same-month window.
- The chart header should distinguish selected-range movement from all-time return. When a non-`ALL` range is selected, show range movement prominently and keep all-time return as secondary context.
- Show a muted dashed cumulative-deposit reference line when at least two deposit basis values exist. It is a capital basis guide, not a benchmark, and should disappear when the data is too sparse.
- Favor chart-first composition on the main performance row. The account balance panel should remain compact enough that the equity curve keeps most horizontal space on desktop while the layout still collapses cleanly on tablets and phones.
- Support mouse, trackpad, and touch exploration through pan, zoom, crosshair, and tap/click event selection. Mobile must not require horizontal page scrolling to inspect the chart.
- Keep operation drill-down separate from market movement color semantics. Buy, sell, and mixed-operation markers use operation colors; returns and profit/loss use the selected market color convention.
- Keep chart capability honest. This dashboard can show historical operations, performance, and research context, but it must not provide order tickets, broker login, broker credential storage, or execution controls.

Dashboard evolution rules:

- Every dashboard surface must have a clear committed data source or an explicitly labeled browser-only demo source.
- Every major surface should explain its state through the data itself, a compact label, or an empty state. Avoid decorative complexity that does not help the user understand capital, risk, operations, performance, or research freshness.
- Dashboard panels must maintain visible alignment discipline: headings use one consistent left-aligned structure, numeric table columns align right with tabular numerals, and ledger rows align date, content, and type badge on a predictable grid.
- Summary metric cards should stay compact. Use enough padding for legibility, but avoid oversized vertical whitespace that makes the top dashboard row feel heavier than the chart and account sections.
- Public-facing status fields should use human-readable labels and short explanations. Do not expose raw machine status strings such as internal enum names unless the surface is explicitly a debug or audit view.
- Company research cards should remain compact scanning controls. They should expose a short latest-analysis preview on hover and keyboard focus when a pointer/focus environment supports it, while click or tap opens a durable detail panel that works on mobile.
- Research cards may show compact sparklines and a few high-signal metrics, but they must remain scanning controls rather than miniature full dashboards. The sparkline window should be globally switchable with common presets and a bounded custom trading-session input. Dense charting, market facts, technical indicators, and external live previews belong in the detail panel or per-symbol page.
- Research-card hover previews must be app-rendered tooltips, not native browser `title` tooltips. They should appear quickly, avoid covering the trigger when possible, clamp inside the viewport, and stay disabled on touch-only mobile interaction where the detail panel is the primary path.
- Company research detail must show the current watchlist metadata, latest structured thesis, upside path, risk watch, next check, and every historical analysis entry with date, stance, analysis type, policy version, and source link.
- On desktop, the company research detail should behave like a sticky inspector while the research card grid scrolls. Its visible height should be bounded by the viewport and by the left card grid's bottom edge; when the detail content is longer, the panel scrolls internally instead of stretching the whole research workspace. On mobile, it remains in normal document flow.
- Company research detail and per-symbol pages should preserve provenance by separating committed market history, SEC-derived metrics, historical research analysis, and external live preview links. If a metric is unavailable or not meaningful, show `N/A` or `N/M` instead of manufacturing a value.
- Historical research UI must not imply freshness. Dated baseline entries are memory and provenance; monthly trade decisions still require fresh price, SEC, IR, regulatory, and news checks.
- Interactive chart features should support both pointer and keyboard focus when practical, avoid mobile overflow, and expose the underlying operation or metric detail rather than only adding visual decoration.
- Chart operation tooltips should be compact, light, and non-dominating. They must keep side badges horizontal, avoid large dark blocks over the chart, and preserve readable layout for one or many same-day trades.
- Market movement colors must be tokenized and user-switchable. The default browser convention is Mainland China style, where gains are red and losses are green. The alternate convention is Western style, where gains are green and losses are red. The selected convention should be remembered in browser storage and applied consistently to return metrics, chart direction, and profit/loss fields without changing the underlying data.
- Decorative and structural accents must not borrow `--gain` or `--loss` tokens. Keep movement colors reserved for investment return, chart direction, and profit/loss semantics.
- Brand elements that explicitly encode price movement, such as the logo's rising trend line and browser favicon, should follow the selected market color convention. The default Mainland China convention uses a red rising trend; the Western convention uses a green rising trend.
- Buy and sell operation colors are separate from market movement colors. A buy marker, sell marker, deposit badge, or operation type badge should not silently inherit gain/loss colors unless that UI element is explicitly communicating price movement or investment return.
- Demo fixtures should exercise real visual edge cases such as missing data, dense operations, buy and sell markers, stale prices, and empty account records. They must remain easy to remove or reset and must not leak into confirmed account files.
- When frontend work reveals a better reusable display pattern, fold it back into the spec or code structure so the dashboard keeps improving instead of accumulating one-off components.
- When a display surface becomes stale, redundant, too noisy, or disconnected from the investment mission, remove it or demote it before adding more surface area.

Metric definitions:

- Total equity is confirmed cash plus current market value when both are available, or the latest committed equity snapshot.
- Total return uses latest total equity compared with cumulative confirmed deposits when those values exist.
- Sharpe ratio is annualized from committed period return observations; display an empty state until enough observations exist.
- Maximum drawdown should be calculated from period return observations when available, because recurring deposits can hide drawdowns in raw account equity. Fall back to raw equity only when return observations are unavailable.
- Equity curve trade markers should group same-day buy and sell executions, distinguish buy and sell visually, and expose a hover, focus, or click tooltip with date, side, symbol, share quantity, average execution price, and cash impact. The tooltip must use confirmed ledger events in real-data mode and browser-only fixtures in demo mode.
- Position profit/loss and return fields use the selected market color convention. Positive values are gains, negative values are losses, and drawdown values are treated as losses even though they are displayed as positive magnitudes.

Fallback behavior:

- If there are no confirmed positions, show an empty holdings state.
- If there are fewer than two equity points, show an empty performance state.
- If cash is unknown, display it as unknown or pending confirmation.
- If a price is stale, show its `price_as_of` date and require refresh before real trading decisions.

Local verification:

```bash
npm run verify
```

`npm run verify` includes data validation, deterministic discovery-scan regression tests, discovery-readiness negative gate tests, promotion/watchlist-cycle gate tests, and the static dashboard build.

For visual changes, run the dev server and inspect the dashboard in desktop and mobile widths. Verify that the browser-only demo toggle and restore-real toggle work before committing.

## Audit Requirements

Monthly:

- Confirm no ledger mutation occurred from recommendations alone.
- Confirm freshness checks were completed.
- Confirm each proposed order had a validity window.
- Confirm the public dashboard still builds from committed data.

Quarterly:

- Review each active thesis against its kill criteria.
- Check concentration by ticker and theme.
- Check dilution, cash runway, debt, customer concentration, and insider or governance changes.

Annually:

- Review whether the process still serves the satellite mission.
- Review whether the data model remains clone-portable.
- Review whether old decisions were recorded clearly enough for a new agent to understand.
- Review whether market-regime and AI-cycle monitor indicators still map to the active opportunity set. Retire stale proxies and add new source-backed proxies when technology, market structure, or policy changes.

## Failure Modes and Controls

Old data mistaken for new data:

- Use `source_published_at`, `retrieved_at`, and `first_seen_at`.
- Mark old sources as historical evidence.

Ledger contaminated by recommendations:

- Keep decisions in `decisions/`.
- Keep confirmed broker facts in `data/account/`.

Narrative overconfidence:

- Require kill criteria and bear-case review for every core candidate.

Permanent capital impairment:

- Track dilution, debt, cash runway, customer concentration, regulation, and execution milestones.

Model drift:

- Keep immutable rules in `AGENTS.md`.
- Cite policy version in every decision.

Clone failure:

- Commit all state.
- Commit no secrets.
- Avoid local-only absolute paths in repository content except clickable links in assistant responses.

## Initial State

As of 2026-05-26:

- confirmed holdings: none;
- confirmed cash: unknown;
- confirmed ledger events: none;
- default planned monthly contribution: USD 888;
- initial policy version: `v1.0`;
- initial baseline research: [research/2026-05-26-initial-baseline.md](research/2026-05-26-initial-baseline.md);
- initial simulated decision: [decisions/2026-05-26-initial-simulation.md](decisions/2026-05-26-initial-simulation.md).
