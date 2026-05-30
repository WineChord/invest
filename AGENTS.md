# AGENTS.md

This repository supports one long-term satellite investment account. Follow these instructions before making recommendations or changing repository state.

## Mission

The mission is to support a multi-decade satellite portfolio whose goal is asymmetric compounding: pursue investments that can plausibly return tens, hundreds, or thousands of times capital over decades.

This account is not the user's main Nasdaq technology allocation. Do not dilute the satellite objective by optimizing for broad-market benchmarking, low volatility, short-term comfort, or index-like diversification.

Default planned monthly contribution: USD 888. Treat this as planned cash only until the user confirms that money is available in the brokerage account.

Under policy `v1.1`, monthly contributions do not need to be fully deployed. A monthly decision may recommend no trade, holding cash, or parking idle cash in SGOV or a materially equivalent approved short-duration U.S. Treasury liquidity reserve when that best supports the long-term objective.

The reverse is also true: the latest USD 888 contribution is not a sizing cap. If a rare opportunity passes the mission, evidence, and entry gates strongly enough, evaluate total confirmed deployable liquidity, including confirmed cash and confirmed SGOV or equivalent reserve value available for sale.

## Immutable Rules

1. Never execute trades.
2. Never update cash, positions, cost basis, tax lots, or account balance from a recommendation, estimate, screenshot without execution details, inferred price, or unconfirmed statement.
3. Only update account records after the user confirms actual broker-side activity with the required fields in [templates/execution-confirmation.md](templates/execution-confirmation.md).
4. Every monthly decision must use fresh data retrieved during that decision cycle. Historical research in this repository is evidence, not current fact.
5. Every recommendation must cite source publication dates, retrieval dates, and a validity window.
6. If required fresh data cannot be obtained, the default action is no trade or hold cash.
7. Keep the repository clone-portable. Do not rely on hidden local state, uncommitted private files, local absolute paths in docs, or committed secrets.
8. Every decision must reference the policy version used.
9. Self-improvement may change templates, scoring, source lists, data providers, and research process, but must not weaken the mission, freshness rules, confirmation rules, audit trail, or no-auto-trading rule.
10. Do not add leverage, margin, options, short selling, crypto tokens, private shares, or non-US-listed instruments unless a later explicit policy version approved by the user allows them.
11. When adding or changing product behavior, data records, dashboard behavior, research workflow, or automation, evaluate whether `SPEC.md` and templates need to be updated in the same change. Update them when the behavior becomes part of the durable process.
12. Treat repository hygiene as part of the product. After meaningful decisions, research updates, dashboard work, or tooling changes, check whether the repository accumulated stale, duplicated, misleading, or low-signal material. Clean it up without weakening auditability.
13. Treat SGOV or an equivalent short-duration U.S. Treasury reserve as cash management only, never as a return-seeking satellite allocation. SGOV is an ETF, not cash; record confirmed SGOV buys and sells like any other broker-confirmed trade.

## Source Hierarchy

Use primary sources first:

1. Broker-confirmed account records for cash, trades, fees, and positions.
2. SEC filings, company investor relations releases, official presentations, exchange data, regulator pages, and government contract databases.
3. Reputable market data providers for prices, volume, market cap, and historical returns.
4. Established financial journalism and industry publications for context.
5. Community posts, social media, and unsourced commentary only as sentiment or lead-generation inputs, never as decisive evidence.

Every important claim must record:

- `source_published_at`: when the source itself was published or the market data was timestamped.
- `retrieved_at`: when it was accessed for this repository.
- `first_seen_at`: when this repository first recorded it.
- `source_url` or another durable source identifier.

A fact is new only when `source_published_at` is later than the prior decision. A source that is newly retrieved but old must not be described as new market information.

## Source Retention

Do not commit large raw SEC filings, PDFs, transcripts, presentations, market-data dumps, or scraped pages by default. Store source metadata, durable URLs, accession numbers, retrieved dates, structured metric extracts, analysis notes, and completed filing reviews instead.

Use ignored local scratch directories such as `research/cache/` or `research/downloads/` for temporary downloads during analysis. Commit a raw source file only when it is small, legally redistributable, uniquely important, and unlikely to remain available from the original source.

## Writing Format

Use natural wrapping for Markdown prose and documentation. Do not hard-wrap ordinary paragraphs at a fixed character count. Keep each paragraph, list item, or sentence group on the line that best matches the content and surrounding style. Preserve semantic line breaks for code blocks, tables, CSV headers and rows, YAML structures, command examples, and source code.

## Language Policy

Use idiomatic English as the repository-wide default language. Documentation, templates, source comments, UI text, accessibility labels, data notes, commit messages, and public dashboard copy should be written in clear native-quality English. Do not add Chinese documentation, Chinese UI strings, Chinese routes, or language-switching pages unless the user explicitly asks for a multilingual feature.

## Monthly Decision Workflow

This workflow is a hard trigger, not optional background reading. Treat any user request about a new deposit, monthly contribution, what to buy, what to sell, whether to deploy cash, whether to use SGOV, or how to allocate the account as a `monthly_decision` request even if the user does not name the template.

Before giving any proposed order, run a decision research preflight. Do not answer from the existing watchlist alone. The preflight is mandatory because the account's edge depends on continuously discovering and re-evaluating the best public companies for the mission, not repeatedly choosing from a stale static list.

Decision research preflight:

1. Start from the confirmed ledger and confirmed positions only.
2. Check whether the user confirmed a new deposit. If not confirmed, planned contribution cash is not investable cash.
3. Reconstruct total deployable liquidity from confirmed records, including cash, settled or tradeable proceeds, and any confirmed SGOV or equivalent reserve value available for sale, then reconcile with any broker account snapshot the user provides.
4. Determine the freshness window from the latest decision, latest research-engine run, latest market-data refresh, and current decision date.
5. Refresh deterministic market data with the repository tooling when available, then retrieve fresh prices and current market data for current holdings, active candidates, watchlist names, newly promoted candidates, and any raw discovery candidate that could plausibly affect the decision.
6. Run the research engine loop from `SPEC.md` before allocation judgment: review `research/discovery/candidates.csv`, scan for new public candidates in mission-relevant themes, check freshness events, detect new material filings or issuer events, review valuation states, and compare active watchlist names.
7. Retrieve fresh company data: SEC filings, IR releases, earnings transcripts, regulatory updates, contract news, dilution, debt, liquidity, and management changes.
8. When a new material filing exists, read the primary filing or official report before buying. Use [templates/filing-review.md](templates/filing-review.md) for 10-K, 10-Q, S-1, F-1, 424B, earnings 8-K, financing 8-K, and equivalent reports.
9. Update or cite the durable research state changed by the preflight: `research/discovery/candidates.csv`, `research/freshness/events.csv`, `research/valuation-states.csv`, `research/quality-metrics.yml`, filing reviews, and a dated research-engine run note when the run changes durable research state.
10. Check `research/quality-metrics.yml`. If critical events, stale valuation states, stale theses, missing filing reviews, or an incomplete preflight make the research engine not decision-ready, either refresh the evidence or recommend holding cash or the approved liquidity reserve.
11. In the final decision, include a concise preflight summary covering sources checked, discovery changes, freshness events, filing reviews, valuation-state changes, readiness status, unavailable data, and the exact validity window.
12. Compare new evidence against the stored thesis, kill criteria, prior decision notes, freshness events, and valuation state.
13. Use subagents when available for critical capital allocation decisions: one bull-case reviewer, one bear-case reviewer, and one allocation/risk reviewer. Use the highest reasoning level available, such as `xhigh`, for these reviews.
14. Decide whether the best account action is buy, add, trim, exit, hold cash, park idle cash in the approved liquidity reserve, sell reserve to fund a buy, or do nothing. Never force a trade just because a monthly contribution arrived, and never cap a strong opportunity at the latest contribution merely because older cash is parked in reserve.
15. Produce proposed orders with exact share counts, estimated dollar use, estimated remaining cash, the price basis used, and the order validity window.
16. Mark the output as a proposed decision only. Do not mutate the ledger.
17. When confirmed cash or positions exist, update the equity-curve valuation snapshot for the decision date from confirmed account state and fresh market prices. Backfill missing month-end snapshots only from historical close data, and never use today's price for an old valuation date.

## Execution Update Workflow

When the user says trades or deposits were actually completed:

1. Check that all required fields are present: broker/account alias, confirmation ID or equivalent evidence, side, symbol, quantity, average price, fees, currency, trade date, and settlement date.
2. If fields are missing, ask for the missing fields. Do not use current market prices as substitutes.
3. Append a new event to [data/account/ledger.csv](data/account/ledger.csv).
4. Recalculate [data/account/positions.csv](data/account/positions.csv) and [data/account/state.yml](data/account/state.yml) from confirmed events.
5. Add or refresh the equity-curve valuation snapshot for the confirmed event date when prices for that date are available. If price data is unavailable, leave the valuation gap rather than inventing a price.
6. Never silently edit old ledger rows. Use a `correction` event if a past record was wrong.

## Public Dashboard Workflow

The public dashboard lives at `https://www.wineandchord.com/invest/` and is served from this open-source repository as a static GitHub Pages project site.

Dashboard rules:

1. The real-data view must be built from committed repository files.
2. Demo or fake data may exist only as browser-only testing state or clearly labeled fixture data. It must never mutate `data/account/ledger.csv`, `data/account/positions.csv`, or `data/account/state.yml`.
3. The dashboard must clearly distinguish confirmed broker records from market snapshots, research records, and simulated data.
4. It should display holdings, cash, ledger operations, performance curve, total return, Sharpe ratio, drawdown, research pool, and source freshness whenever enough data exists.
5. When confirmed account data is missing, show a useful empty state rather than inventing real balances.
6. After frontend changes, run the local build and inspect the page locally across desktop and mobile widths before committing when practical.
7. Keep the page usable under `/invest/`; do not hard-code local filesystem paths or root-relative assumptions that break GitHub Pages project hosting.
8. Treat the dashboard as a living product surface. When a visualization, metric, table, interaction, empty state, demo fixture, or public copy becomes confusing, stale, visually noisy, or no longer aligned with the process, simplify or replace it and update `SPEC.md` when the behavior should persist.
9. Every public display surface should have a clear data source, provenance boundary, freshness cue when relevant, empty/demo fallback, desktop and mobile behavior, and no hidden dependency on local state.
10. Market movement colors must use a browser-remembered convention toggle. The default convention is Mainland China style: gains are red and losses are green. The alternative convention is Western style: gains are green and losses are red. UI copy remains English-only, and browser-only display preferences must never mutate committed account records, research files, or market snapshots.
11. Keep market movement colors separate from operation colors. Buy and sell markers may use their own semantic colors so they are not confused with gain and loss.
12. Treat the equity chart as a broker-grade analytical surface, with TradingView as the quality benchmark. Chart work should prioritize accurate axes, crosshair detail, range controls, touch and mouse interaction, confirmed-operation markers, and low-noise layout before decorative styling. The chart is display-only and must never imply broker connection, order entry, or automatic execution.
13. Treat the research universe as an interactive research workspace, not a static table. Company cards should support compact scanning, hover and keyboard-focus latest-analysis previews, click or tap detail drilldowns, and historical analysis timelines sourced from committed research records.
14. Research drilldowns must preserve provenance. Show analysis dates, stances, policy versions, analysis types, and source links when available, and make clear through dated labels that historical analysis is memory rather than fresh market truth.

## Continuous Improvement and Noise Hygiene

This repository should become more useful, more reliable, and easier to operate after each serious interaction. Improvement is not only adding features. It also means deleting clutter, reducing ambiguity, tightening stale rules, and making the next decision cycle cheaper without lowering decision quality.

Use this loop when a change reveals a durable lesson:

1. Capture the lesson in the smallest durable place: `AGENTS.md` for agent behavior, `SPEC.md` for system behavior, templates for repeated workflows, data files for durable records, and source files for product behavior.
2. Remove or demote noise created by the work: obsolete demo assumptions, duplicate research notes, unused UI states, dead scripts, stale screenshots, outdated candidate labels, irrelevant sources, and misleading comments.
3. Preserve audit history. Do not delete confirmed ledger events, policy versions, or dated decisions just because they are old. If historical material remains useful only as history, mark it as historical, archived, superseded, or stale instead of presenting it as current evidence.
4. Prefer concise canonical records over sprawling parallel notes. If two files describe the same durable rule, keep one authoritative version and link to it from the other.
5. Keep demo data, generated artifacts, cache files, temporary screenshots, local logs, and exploratory scratch work out of committed durable state unless the file is intentionally part of the product or test fixture.
6. During every monthly decision, explicitly separate current evidence, historical evidence, stale evidence, and analysis. Do not let old narratives keep influencing allocation after their evidence window expires.
7. When cleaning up, keep changes reviewable: explain the cleanup in the commit message or decision note when it affects future interpretation.

## Research Discipline

Each active company thesis must include:

- one-sentence thesis;
- why it can plausibly produce extreme multi-decade upside;
- key evidence needed next;
- disconfirming evidence and kill criteria;
- balance sheet and dilution risk;
- customer concentration and dependency risk;
- regulatory, technical, execution, and valuation risk;
- next review date.

Research is organized as a pipeline:

1. `research/discovery/candidates.csv` for raw potential public candidates found by universe scans.
2. `research/freshness/events.csv` for material filings, IR releases, contracts, financing, dilution, regulatory events, price dislocations, and thesis triggers.
3. `research/valuation-states.csv` for current valuation and entry-attractiveness state.
4. `research/quality-metrics.yml` for coverage, freshness, stale analysis, and open-event health checks.
5. `research/filings/` for completed material filing reviews linked from freshness events.
6. `research/watchlist.csv` for candidates that deserve ongoing active monitoring.
7. `research/company-analysis.yml` for dashboard-visible historical analysis.

The active decision universe is limited to watchlist rows whose status is `active_core_candidate`, `active_candidate`, or `watch`. Rows marked `research_only`, `not_tradable`, `probation`, `frozen`, or `removed` cannot receive new buy recommendations unless the decision first promotes them with fresh evidence and updates the durable records.

Do not deep-research every listed company. Use a research funnel: broad cheap universe awareness, theme-scoped filtering, quick rejection of weak fits, primary-source skims for plausible candidates, and deep research only for the small set that could realistically affect allocation. Keep the active set small enough to understand deeply.

Before recommending a buy, confirm the target passes three gates:

- Mission gate: the company still has a plausible multi-decade asymmetric upside path and does not merely duplicate the user's large Nasdaq technology core.
- Evidence gate: current primary evidence supports the thesis, material filings are reviewed, and no critical freshness event is unresolved.
- Entry gate: current price, valuation, dilution, balance sheet survival, and opportunity cost still leave enough expected upside for the satellite objective.

When adding a durable company analysis that should appear on the public dashboard, add or append a structured entry in [research/company-analysis.yml](research/company-analysis.yml) and link it to the dated source note. Do not parse long-form Markdown as the dashboard database when a structured index can carry the needed summary and provenance.

When a candidate or holding publishes a material filing, do not make a buy recommendation until the filing has been reviewed or the decision explicitly says why the filing is immaterial. Financial statement review must consider revenue growth, gross margin, operating margin, cash flow, cash, debt, dilution, share count, stock-based compensation, backlog or RPO when relevant, customer concentration, guidance, risk-factor changes, and liquidity.

Completed material filing reviews must be saved under `research/filings/` and linked from `research/freshness/events.csv` through `review_path`. If a material event is ignored as immaterial, `immaterial_reason` must explain why.

Do not blindly follow the user's initial candidate list. Treat it as a starting watchlist and independently challenge every company.

Sells should be rare. Prefer directing new contributions away from downgraded companies before selling existing long-term positions. Sell or trim only when fresh evidence shows thesis breakage, unacceptable permanent impairment risk, portfolio risk that conflicts with the mission, or a clearly superior opportunity after tax and execution costs.

Liquidity reserve sales are different from return-seeking position sales. Selling SGOV or an equivalent approved reserve to fund a researched common-stock buy is a cash-management step, not a thesis-driven exit.

## Git Rules

The user allows direct commits and pushes to `main` for this repository.

Commit after meaningful changes to policy, records, research, or decisions. Push to the default remote when the work is coherent. Use concise commit messages in the repository's style. Never commit secrets or local-only paths.
