# Satellite Portfolio System Spec

## Purpose

This repository is the durable memory and operating manual for a long-term satellite investment account. A new computer should be able to clone the repository and continue the process without hidden local state.

The account starts with no confirmed holdings and no confirmed cash balance. The default planned contribution is USD 888 per month, but future contributions may be higher. Actual account state changes only after the user confirms broker-side activity.

The portfolio's ultimate objective is not to look stable or diversified in a conventional sense. The objective is to find and hold a small number of public companies that can plausibly become much larger over decades because they sit on structural bottlenecks: space infrastructure, direct-to-device connectivity, AI infrastructure, power, cooling, semiconductor interconnect, quantum technology, programmable money, and future categories that do not yet exist.

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

`src/`

Astro and React source for the public dashboard.

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
- `scripts/refresh-market-data.mjs` fetches the latest available daily close up to the New York `as_of` date from Yahoo Finance chart data for symbols in `data/market/security_master.csv`, symbols already present in `data/market/watchlist_prices.csv`, and all confirmed position symbols.
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
freshness:
quality_gates:
notes:
```

`research/discovery/candidates.csv` records potential new public candidates before they are promoted into the active watchlist.

Required columns:

```text
symbol,name,exchange,asset_type,discovered_at,discovery_source,source_url,
source_published_at,retrieved_at,first_seen_at,theme,why_it_might_matter,
status,next_action,notes
```

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

Entries are append-only by default and shown newest-first on the dashboard. If an analysis becomes stale or superseded, add a later entry that says so instead of rewriting the historical record.

## Research Engine

The repository must evolve from a static watchlist into a research engine. The engine has five loops: universe discovery, freshness monitoring, filing review, valuation and entry scoring, and monthly allocation.

Feasibility boundary:

- Deterministic automation can refresh prices, equity snapshots, source indexes, and simple staleness counters.
- Deterministic automation can identify that a filing, symbol, price move, or issuer event exists.
- Deterministic automation must not decide that a company is good, cheap, or buyable by itself.
- Agent or human research must interpret filings, management discussion, financial quality, competitive position, dilution, valuation, and thesis changes.
- A monthly allocation decision is allowed only when the relevant deterministic data has been refreshed and the material qualitative evidence has been reviewed or explicitly marked immaterial.

Implementation target:

- Use code for repeatable collection, validation, and stale-state detection.
- Use research templates for judgment-heavy work.
- Use committed files as the durable interface between automation, agent analysis, dashboard display, and future decisions.
- Track the health of the research process itself in `research/quality-metrics.yml`, so the system can say when it is not ready to make a buy recommendation.

Readiness semantics:

- `decision_readiness.status: ready` means the repository can support a live monthly allocation recommendation after fresh prices and broker cash are checked in the current decision cycle.
- `decision_readiness.status: not_ready` means the system must refresh missing research evidence or recommend holding cash.
- Header-only discovery, freshness, and valuation files are acceptable as an initial scaffold only when `decision_readiness.status` is explicitly `not_ready`.
- Validation must reject `ready` status when active symbols lack current valuation state, latest material filing review coverage, or unresolved critical events.

Research funnel ruling:

- Do not attempt full deep research on every listed company. That is not feasible and would make the system noisy, slow, and shallow.
- Do maintain broad but cheap awareness of the public universe through symbol directories, SEC issuer coverage, new listings, filings, price dislocations, and theme-specific news.
- Spend deep research only after a company passes a mission-shaped funnel: eligible instrument, relevant bottleneck theme, plausible multi-decade upside, sufficient public evidence, survivable balance sheet, and an entry setup that is not already fully priced for perfection.
- The correct posture is a funnel, not a map of the whole market: scan thousands cheaply, triage hundreds quickly, track dozens lightly, deeply understand a small active set, and allocate only to the few that pass mission, evidence, and entry gates.
- The system should prefer missing a marginal idea over filling the repository with low-conviction notes. Extreme compounding requires a small number of exceptional decisions, not superficial coverage of everything.

### Universe Discovery Loop

Purpose: find public companies that are not already in the watchlist but may fit the satellite mission.

Cadence:

- Run at least monthly before the allocation decision.
- Run ad hoc after major IPOs, spinoffs, direct listings, index additions, sector shocks, or policy changes.

Recommended source stack:

- SEC company ticker and exchange reference files for listed issuer coverage.
- Nasdaq Trader symbol directories for US-listed common stocks and ADRs.
- Exchange, issuer IR, and SEC sources for newly public companies.
- Reputable market data only for market cap, liquidity, and price metadata after the symbol is identified from durable public sources.

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

Discovery funnel stages:

1. Universe scan: identify eligible US-listed instruments and newly public names from durable symbol and filing sources.
2. Theme filter: keep only names connected to mission-relevant bottlenecks or emerging categories.
3. Cheap triage: use quick structured metrics and source checks to reject obvious weak fits.
4. Primary-source skim: read enough filings, IR material, and operating evidence to decide whether a full research card is justified.
5. Deep-dive queue: write or refresh full thesis, filing review, valuation state, and kill criteria only for the small set that could plausibly affect allocation.
6. Active set discipline: keep the buy-eligible universe narrow and demote stale, low-quality, or fully priced names.

Discovery output:

- Add raw candidates to `research/discovery/candidates.csv`, not directly to `research/watchlist.csv`.
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

The active decision universe is `active_core_candidate`, `active_candidate`, and `watch`. `research_only`, `not_tradable`, `probation`, `frozen`, and `removed` are excluded from buy recommendations unless a decision explicitly promotes them with fresh evidence.

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
4. Compute total deployable liquidity from confirmed cash, confirmed deposits, and confirmed liquidity reserve value available for sale. Do not limit sizing to the latest monthly contribution when a stronger opportunity justifies broader deployment.
5. Retrieve fresh prices for current holdings and active candidates.
6. Retrieve fresh primary evidence for each active candidate.
7. Run or cite the AI cycle and market regime monitor when the allocation depends on AI capex, AI financing, semiconductor supply chains, data-center power, credit conditions, or broad bubble risk.
8. Check `research/quality-metrics.yml` and resolve or explicitly disclose open critical events, missing filing reviews, stale valuation states, and stale theses.
9. Update the watchlist status mentally for the current decision using the watchlist status taxonomy: `active_core_candidate`, `active_candidate`, `watch`, `research_only`, `not_tradable`, `probation`, `frozen`, or `removed`.
10. Run the thesis check: `strengthened`, `unchanged`, `weakened`, or `broken`.
11. Run the risk check: concentration, liquidity, valuation, dilution, debt, customer concentration, execution, regulatory, funding runway, macro regime, credit stress, and AI-cycle crowding.
12. Decide one of: buy new position, add to existing position, park idle cash in the approved liquidity reserve, hold cash, do nothing, trim, or exit.
13. Convert allocation into exact proposed share counts using the latest price basis, estimated fees, and whole-share or fractional-share assumptions.
14. State the validity window. If price moves materially, market closes, or new company-specific information appears, recompute.
15. Save the proposed decision in `decisions/` if the user asks to persist it.
16. Do not update `data/account/ledger.csv` until execution is confirmed.
17. If the recommendation produces new durable market snapshots, source records, or performance observations, update the relevant research or market-data files without changing confirmed account records.
18. If confirmed cash or positions exist, refresh the portfolio-level valuation snapshot using fresh prices and append or update `data/account/equity_curve.csv` for the decision date. Backfill missing month-end snapshots only from historical close data.

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

The repository should improve over time, but improvement must not drift away from the mission.

Self-evolution has two equal duties:

- improve the system's ability to make fresh, critical, long-horizon allocation decisions;
- reduce accumulated noise so future agents can find the signal faster.

Allowed self-improvements:

- better research templates;
- better source lists;
- stricter freshness checks;
- clearer scoring definitions;
- better candidate universe filters;
- better decision and audit formatting;
- new tools that make the process more reliable;
- clearer dashboard interactions and visualizations;
- cleanup of stale, duplicated, misleading, or low-signal repository content.

Forbidden self-improvements:

- automatic trading;
- ledger updates without confirmed execution;
- weaker freshness requirements;
- deleting or rewriting audit history;
- hidden local state;
- weakening the long-term asymmetric objective;
- adding leverage, options, margin, shorts, crypto tokens, private shares, or OTC securities without explicit user approval.

Policy changes use [templates/policy-change-proposal.md](templates/policy-change-proposal.md). Approved changes create a new file in `data/policy/` and decisions after that point cite the new version.

Durable behavior changes also require documentation review. When adding a new data file, dashboard feature, decision step, automation, or public reporting surface, update `SPEC.md`, `AGENTS.md`, or templates in the same change when the behavior should persist for future agents.

Operational loop:

1. Observe what became slow, confusing, stale, duplicated, visually noisy, or error-prone during the current interaction.
2. Decide whether the lesson is durable. If it is one-off scratch work, do not encode it as process.
3. Encode durable lessons into the narrowest durable artifact: `AGENTS.md` for agent rules, `SPEC.md` for system design, templates for repeated workflows, data files for source-of-truth records, and source code for product behavior.
4. Clean the repository after the improvement. Remove obsolete scratch files, unused demo assumptions, dead UI states, stale generated artifacts, duplicate notes, and sources that no longer support active research.
5. Preserve audit history. Confirmed ledger events, policy versions, dated decisions, and past research baselines must remain reconstructable. If they are no longer current, mark them as historical, archived, superseded, or stale rather than presenting them as active evidence.
6. Verify that the public dashboard, decision workflow, and data model still use clear provenance boundaries between confirmed facts, current market facts, historical evidence, demo fixtures, and analysis.

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
- active research/watchlist workspace with company cards, committed price sparklines, recent 1D and 5D price moves with percent or dollar display, key technical and valuation metrics, hover or focus quick briefs, click or tap detail drilldown, and historical analysis timeline;
- per-symbol research pages under `/research/<symbol>/` with committed price charts, market/technical/fundamental metrics, analysis provenance, external links, and an optional live TradingView preview;
- open-source repository link.

The equity curve uses TradingView Lightweight Charts as a client-side chart engine. The engine supplies chart interaction only: time and price axes, crosshair behavior, viewport range controls, touch gestures, and ledger event markers. It must not be treated as a data provider. Real points still come from committed account files, and demo points still come only from browser-only fixtures. Keep TradingView attribution visible through either the built-in mark or a restrained public attribution link near the chart.

Company price charts use the same Lightweight Charts engine, but their data comes from committed `data/market/price_history.csv`. Research drilldowns and per-symbol pages include 1D and 5D chart ranges and recent-move chips derived from committed daily sessions. The optional TradingView widget is an external live preview only: it may help visual inspection, but it is not a repository source of truth and must not replace the committed price, technical, SEC, IR, filing, or news evidence required for decisions.

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
- Research cards may show compact sparklines and a few high-signal metrics, but they must remain scanning controls rather than miniature full dashboards. Dense charting, market facts, technical indicators, and external live previews belong in the detail panel or per-symbol page.
- Research-card hover previews must be app-rendered tooltips, not native browser `title` tooltips. They should appear quickly, avoid covering the trigger when possible, clamp inside the viewport, and stay disabled on touch-only mobile interaction where the detail panel is the primary path.
- Company research detail must show the current watchlist metadata, latest structured thesis, upside path, risk watch, next check, and every historical analysis entry with date, stance, analysis type, policy version, and source link.
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
