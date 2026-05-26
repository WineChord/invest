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

Do not blindly follow the user's initial candidate list. Treat it as a starting watchlist and independently challenge every company.

Sells should be rare. Prefer directing new contributions away from downgraded companies before selling existing long-term positions. Sell or trim only when fresh evidence shows thesis breakage, unacceptable permanent impairment risk, portfolio risk that conflicts with the mission, or a clearly superior opportunity after tax and execution costs.

## Git Rules

The user allows direct commits and pushes to `main` for this repository.

Commit after meaningful changes to policy, records, research, or decisions. Push to the default remote when the work is coherent. Use concise commit messages in the repository's style. Never commit secrets or local-only paths.
