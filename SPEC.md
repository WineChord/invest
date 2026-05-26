# Satellite Portfolio System Spec

## Purpose

This repository is the durable memory and operating manual for a long-term satellite investment account. A new computer should be able to clone the repository and continue the process without hidden local state.

The account starts with no confirmed holdings and no confirmed cash balance. The default planned contribution is USD 888 per month, but future contributions may be higher. Actual account state changes only after the user confirms broker-side activity.

The portfolio's ultimate objective is not to look stable or diversified in a conventional sense. The objective is to find and hold a small number of public companies that can plausibly become much larger over decades because they sit on structural bottlenecks: space infrastructure, direct-to-device connectivity, AI infrastructure, power, cooling, semiconductor interconnect, quantum technology, programmable money, and future categories that do not yet exist.

## Non-Goals

- Do not manage the user's large Nasdaq technology core allocation.
- Do not optimize for short-term gains, quarterly trading, or benchmark tracking.
- Do not create automatic trades.
- Do not treat monthly contribution planning as confirmed cash.
- Do not use options, margin, leverage, shorts, crypto tokens, OTC shares, or private-company proxies without a later user-approved policy.

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

Market snapshots used for display and decision support are stored in `data/market/`. They do not mutate confirmed account records.

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

## Monthly Decision Algorithm

1. Identify the policy version.
2. Load confirmed ledger, positions, contribution plan, and prior decisions.
3. Ask whether the user has confirmed a new deposit if the prompt is ambiguous.
4. Compute investable cash from confirmed cash and confirmed deposits only.
5. Retrieve fresh prices for current holdings and active candidates.
6. Retrieve fresh primary evidence for each active candidate.
7. Update the watchlist status mentally for the current decision: `core_candidate`, `watch`, `probation`, `frozen`, or `removed`.
8. Run the thesis check: `strengthened`, `unchanged`, `weakened`, or `broken`.
9. Run the risk check: concentration, liquidity, valuation, dilution, debt, customer concentration, execution, regulatory, and funding runway.
10. Decide one of: buy new position, add to existing position, hold cash, do nothing, trim, or exit.
11. Convert allocation into exact proposed share counts using the latest price basis, estimated fees, and whole-share or fractional-share assumptions.
12. State the validity window. If price moves materially, market closes, or new company-specific information appears, recompute.
13. Save the proposed decision in `decisions/` if the user asks to persist it.
14. Do not update `data/account/ledger.csv` until execution is confirmed.
15. If the recommendation produces new durable market snapshots, source records, or performance observations, update the relevant research or market-data files without changing confirmed account records.

## Position Sizing Policy

This is a satellite account, so concentration is allowed. Permanent impairment risk still matters.

Default sizing principles:

- Start new names in stages unless a fresh, unusually strong evidence update justifies a larger first allocation.
- Prefer adding to existing high-conviction names when fresh evidence confirms the thesis and valuation remains tolerable.
- Prefer withholding new cash from downgraded names before selling existing positions.
- Do not make forced rebalancing trades just because a position outperformed.
- Do not sell winners solely because they became large; sell only if the thesis breaks, risk becomes unacceptable, or opportunity cost becomes overwhelming.
- Newly public companies normally require extra caution until at least two public quarterly reports are available, unless there is unusually strong primary evidence.

Suggested guardrails for normal decisions:

- Keep a small cash buffer for price slippage and fees.
- Avoid deploying the full monthly contribution into a single unprofitable, pre-commercial company unless fresh evidence materially reduces execution risk.
- Track theme concentration, especially AI infrastructure and space infrastructure, because multiple tickers can depend on the same capital spending cycle.

The guardrails are not mechanical rules. The final recommendation must explain why the chosen sizing best serves the long-term asymmetric objective.

## Candidate Universe

Default allowed assets:

- common stocks or ADRs listed on major US exchanges;
- companies with sufficient liquidity for normal retail execution;
- companies whose thesis can be researched from public sources.

Default excluded assets:

- options;
- margin or leveraged ETFs;
- short positions;
- crypto tokens;
- private shares and secondary private markets;
- OTC securities;
- funds that simply duplicate the user's existing Nasdaq technology core.

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
- `research/watchlist.csv` for the research pool.

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
- active research/watchlist table;
- open-source repository link.

Dashboard evolution rules:

- Every dashboard surface must have a clear committed data source or an explicitly labeled browser-only demo source.
- Every major surface should explain its state through the data itself, a compact label, or an empty state. Avoid decorative complexity that does not help the user understand capital, risk, operations, performance, or research freshness.
- Interactive chart features should support both pointer and keyboard focus when practical, avoid mobile overflow, and expose the underlying operation or metric detail rather than only adding visual decoration.
- Demo fixtures should exercise real visual edge cases such as missing data, dense operations, buy and sell markers, stale prices, and empty account records. They must remain easy to remove or reset and must not leak into confirmed account files.
- When frontend work reveals a better reusable display pattern, fold it back into the spec or code structure so the dashboard keeps improving instead of accumulating one-off components.
- When a display surface becomes stale, redundant, too noisy, or disconnected from the investment mission, remove it or demote it before adding more surface area.

Metric definitions:

- Total equity is confirmed cash plus current market value when both are available, or the latest committed equity snapshot.
- Total return uses latest total equity compared with cumulative confirmed deposits when those values exist.
- Sharpe ratio is annualized from committed period return observations; display an empty state until enough observations exist.
- Maximum drawdown should be calculated from period return observations when available, because recurring deposits can hide drawdowns in raw account equity. Fall back to raw equity only when return observations are unavailable.
- Equity curve trade markers should group same-day buy and sell executions, distinguish buy and sell visually, and expose a hover, focus, or click tooltip with date, side, symbol, share quantity, average execution price, and cash impact. The tooltip must use confirmed ledger events in real-data mode and browser-only fixtures in demo mode.

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
