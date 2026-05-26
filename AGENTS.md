# AGENTS.md

This repository supports one long-term satellite investment account. Follow these instructions before making recommendations or changing repository state.

## Mission

The mission is to support a multi-decade satellite portfolio whose goal is asymmetric compounding: pursue investments that can plausibly return tens, hundreds, or thousands of times capital over decades.

This account is not the user's main Nasdaq technology allocation. Do not dilute the satellite objective by optimizing for broad-market benchmarking, low volatility, short-term comfort, or index-like diversification.

Default planned monthly contribution: USD 888. Treat this as planned cash only until the user confirms that money is available in the brokerage account.

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

## Writing Format

Use natural wrapping for Markdown prose and documentation. Do not hard-wrap ordinary paragraphs at a fixed character count. Keep each paragraph, list item, or sentence group on the line that best matches the content and surrounding style. Preserve semantic line breaks for code blocks, tables, CSV headers and rows, YAML structures, command examples, and source code.

## Language Policy

Use idiomatic English as the repository-wide default language. Documentation, templates, source comments, UI text, accessibility labels, data notes, commit messages, and public dashboard copy should be written in clear native-quality English. Do not add Chinese documentation, Chinese UI strings, Chinese routes, or language-switching pages unless the user explicitly asks for a multilingual feature.

## Monthly Decision Workflow

When the user asks what to buy or sell today:

1. Start from the confirmed ledger and confirmed positions only.
2. Check whether the user confirmed a new deposit. If not confirmed, planned contribution cash is not investable cash.
3. Reconstruct available cash from confirmed records, then reconcile with any broker account snapshot the user provides.
4. Retrieve fresh prices and current market data for all current holdings and active candidates.
5. Retrieve fresh company data: SEC filings, IR releases, earnings transcripts, regulatory updates, contract news, dilution, debt, liquidity, and management changes.
6. Compare new evidence against the stored thesis, kill criteria, and prior decision notes.
7. Use subagents when available for critical capital allocation decisions: one bull-case reviewer, one bear-case reviewer, and one allocation/risk reviewer. Use the highest reasoning level available, such as `xhigh`, for these reviews.
8. Produce proposed orders with exact share counts, estimated dollar use, estimated remaining cash, the price basis used, and the order validity window.
9. Mark the output as a proposed decision only. Do not mutate the ledger.

## Execution Update Workflow

When the user says trades or deposits were actually completed:

1. Check that all required fields are present: broker/account alias, confirmation ID or equivalent evidence, side, symbol, quantity, average price, fees, currency, trade date, and settlement date.
2. If fields are missing, ask for the missing fields. Do not use current market prices as substitutes.
3. Append a new event to [data/account/ledger.csv](data/account/ledger.csv).
4. Recalculate [data/account/positions.csv](data/account/positions.csv) and [data/account/state.yml](data/account/state.yml) from confirmed events.
5. Never silently edit old ledger rows. Use a `correction` event if a past record was wrong.

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

When adding a durable company analysis that should appear on the public dashboard, add or append a structured entry in [research/company-analysis.yml](research/company-analysis.yml) and link it to the dated source note. Do not parse long-form Markdown as the dashboard database when a structured index can carry the needed summary and provenance.

Do not blindly follow the user's initial candidate list. Treat it as a starting watchlist and independently challenge every company.

Sells should be rare. Prefer directing new contributions away from downgraded companies before selling existing long-term positions. Sell or trim only when fresh evidence shows thesis breakage, unacceptable permanent impairment risk, portfolio risk that conflicts with the mission, or a clearly superior opportunity after tax and execution costs.

## Git Rules

The user allows direct commits and pushes to `main` for this repository.

Commit after meaningful changes to policy, records, research, or decisions. Push to the default remote when the work is coherent. Use concise commit messages in the repository's style. Never commit secrets or local-only paths.
