# Satellite Portfolio System Spec

## Purpose

This repository is the durable memory and operating manual for a long-term
satellite investment account. A new computer should be able to clone the
repository and continue the process without hidden local state.

The account starts with no confirmed holdings and no confirmed cash balance.
The default planned contribution is USD 888 per month, but future contributions
may be higher. Actual account state changes only after the user confirms
broker-side activity.

The portfolio's ultimate objective is not to look stable or diversified in a
conventional sense. The objective is to find and hold a small number of public
companies that can plausibly become much larger over decades because they sit
on structural bottlenecks: space infrastructure, direct-to-device connectivity,
AI infrastructure, power, cooling, semiconductor interconnect, quantum
technology, programmable money, and future categories that do not yet exist.

## Non-Goals

- Do not manage the user's large Nasdaq technology core allocation.
- Do not optimize for short-term gains, quarterly trading, or benchmark
  tracking.
- Do not create automatic trades.
- Do not treat monthly contribution planning as confirmed cash.
- Do not use options, margin, leverage, shorts, crypto tokens, OTC shares, or
  private-company proxies without a later user-approved policy.

## Repository Layout

`AGENTS.md`

Rules for every future agent.

`SPEC.md`

This system design.

`data/account/`

Confirmed ledger, positions, contribution plan, and current confirmed account
state.

`data/policy/`

Versioned investment policy. Every decision cites one policy version.

`research/`

Company theses, source register, watchlist, and dated research baselines.

`decisions/`

Dated monthly recommendations and simulated analyses. These are proposals, not
broker records.

`templates/`

Prompt and record templates for monthly decisions, execution confirmations,
company research cards, and policy changes.

## Truth Model

There are four levels of truth:

1. Confirmed broker facts: trade confirmations, account statements, settled cash,
   share quantity, fees, dividends, splits, and corrections.
2. Current market facts: prices, volume, market cap, and other data with a
   timestamp.
3. Company and regulatory facts: SEC filings, company IR releases, regulator
   decisions, government contract awards, and official presentations.
4. Analysis: interpretations, rankings, forecasts, and agent reasoning.

Only level 1 can mutate account records. Levels 2 to 4 can inform a proposed
decision but cannot change the ledger.

## Data Model

Account state is stored in
[data/account/state.yml](data/account/state.yml).

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

Confirmed transactions are append-only rows in
[data/account/ledger.csv](data/account/ledger.csv).

Required columns:

```text
event_id,event_type,status,broker,account_alias,confirmation_id,trade_date,
settlement_date,symbol,side,quantity,average_price,fees,gross_amount,
net_cash_effect,currency,source,created_at,notes
```

Positions are derived from the ledger and stored in
[data/account/positions.csv](data/account/positions.csv).

Required columns:

```text
symbol,asset_type,exchange,quantity,average_cost,cost_basis,currency,
first_trade_date,last_trade_date,notes
```

The default contribution plan is stored in
[data/account/plan.yml](data/account/plan.yml).
It is a plan, not confirmed cash.

Research sources are stored in
[research/sources.yml](research/sources.yml).

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

## Freshness Rules

Every monthly decision must include a freshness report covering:

- confirmed cash and positions;
- latest market prices;
- company SEC filings since the previous decision;
- company IR releases since the previous decision;
- material regulatory, contract, financing, dilution, and leadership updates;
- macro context relevant to the thesis, especially rates, AI capex, power
  availability, launch cadence, defense budgets, and stablecoin regulation.

Freshness defaults:

- Broker cash and positions: current decision cycle, or explicitly marked
  unavailable.
- Market prices: same trading day when available; otherwise latest available
  official close with the exact market date.
- SEC and IR checks: must search after the previous decision date.
- News and industry checks: must search after the previous decision date.
- Existing thesis: must be re-read and marked as confirmed, weakened, broken, or
  unchanged.

If a critical freshness check fails, the decision must default to no trade or
hold cash.

## Monthly Decision Algorithm

1. Identify the policy version.
2. Load confirmed ledger, positions, contribution plan, and prior decisions.
3. Ask whether the user has confirmed a new deposit if the prompt is ambiguous.
4. Compute investable cash from confirmed cash and confirmed deposits only.
5. Retrieve fresh prices for current holdings and active candidates.
6. Retrieve fresh primary evidence for each active candidate.
7. Update the watchlist status mentally for the current decision:
   `core_candidate`, `watch`, `probation`, `frozen`, or `removed`.
8. Run the thesis check:
   `strengthened`, `unchanged`, `weakened`, or `broken`.
9. Run the risk check:
   concentration, liquidity, valuation, dilution, debt, customer concentration,
   execution, regulatory, and funding runway.
10. Decide one of: buy new position, add to existing position, hold cash, do
    nothing, trim, or exit.
11. Convert allocation into exact proposed share counts using the latest price
    basis, estimated fees, and whole-share or fractional-share assumptions.
12. State the validity window. If price moves materially, market closes, or new
    company-specific information appears, recompute.
13. Save the proposed decision in `decisions/` if the user asks to persist it.
14. Do not update `data/account/ledger.csv` until execution is confirmed.

## Position Sizing Policy

This is a satellite account, so concentration is allowed. Permanent impairment
risk still matters.

Default sizing principles:

- Start new names in stages unless a fresh, unusually strong evidence update
  justifies a larger first allocation.
- Prefer adding to existing high-conviction names when fresh evidence confirms
  the thesis and valuation remains tolerable.
- Prefer withholding new cash from downgraded names before selling existing
  positions.
- Do not make forced rebalancing trades just because a position outperformed.
- Do not sell winners solely because they became large; sell only if the thesis
  breaks, risk becomes unacceptable, or opportunity cost becomes overwhelming.
- Newly public companies normally require extra caution until at least two
  public quarterly reports are available, unless there is unusually strong
  primary evidence.

Suggested guardrails for normal decisions:

- Keep a small cash buffer for price slippage and fees.
- Avoid deploying the full monthly contribution into a single unprofitable,
  pre-commercial company unless fresh evidence materially reduces execution
  risk.
- Track theme concentration, especially AI infrastructure and space
  infrastructure, because multiple tickers can depend on the same capital
  spending cycle.

The guardrails are not mechanical rules. The final recommendation must explain
why the chosen sizing best serves the long-term asymmetric objective.

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

Future IPO watch items such as SpaceX, OpenAI, and Anthropic are research-only
until they become directly tradable under the allowed asset rules.

## Research Scorecard

Each candidate is assessed on these dimensions:

- Extreme upside path: how the company could plausibly become much larger.
- Bottleneck ownership: whether the company controls a scarce capability,
  network, license, distribution point, manufacturing base, or technical
  standard.
- Evidence quality: revenue, backlog, regulatory approval, customer adoption,
  launches, deliveries, margins, and cash flow.
- Business quality: gross margin, operating leverage, recurring revenue,
  switching costs, ecosystem leverage, and customer diversity.
- Balance sheet: cash, debt, burn, dilution, financing access, and runway.
- Execution risk: engineering, production, launch, regulatory, integration,
  supply chain, and management credibility.
- Valuation risk: whether the market has already priced in too much of the
  successful future.
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
- major customer, regulator, or technical milestone fails in a way that changes
  the long-term path;
- valuation becomes so extreme that expected future returns no longer match the
  mission;
- a superior opportunity exists and cash cannot be raised from contributions
  alone.

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

If any required field is missing, ask for it. Do not fill missing fields from
market data.

Ledger math:

- Deposit increases cash by confirmed amount.
- Buy decreases cash by `quantity * average_price + fees`.
- Sell increases cash by `quantity * average_price - fees`.
- Fees are recorded explicitly.
- Splits, dividends, and corrections use separate event rows.

Corrections are append-only. Never silently rewrite history.

## Self-Evolution Mechanism

The repository should improve over time, but improvement must not drift away
from the mission.

Allowed self-improvements:

- better research templates;
- better source lists;
- stricter freshness checks;
- clearer scoring definitions;
- better candidate universe filters;
- better decision and audit formatting;
- new tools that make the process more reliable.

Forbidden self-improvements:

- automatic trading;
- ledger updates without confirmed execution;
- weaker freshness requirements;
- deleting or rewriting audit history;
- hidden local state;
- weakening the long-term asymmetric objective;
- adding leverage, options, margin, shorts, crypto tokens, private shares, or
  OTC securities without explicit user approval.

Policy changes use
[templates/policy-change-proposal.md](templates/policy-change-proposal.md).
Approved changes create a new file in `data/policy/` and decisions after that
point cite the new version.

## Audit Requirements

Monthly:

- Confirm no ledger mutation occurred from recommendations alone.
- Confirm freshness checks were completed.
- Confirm each proposed order had a validity window.

Quarterly:

- Review each active thesis against its kill criteria.
- Check concentration by ticker and theme.
- Check dilution, cash runway, debt, customer concentration, and insider or
  governance changes.

Annually:

- Review whether the process still serves the satellite mission.
- Review whether the data model remains clone-portable.
- Review whether old decisions were recorded clearly enough for a new agent to
  understand.

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

- Track dilution, debt, cash runway, customer concentration, regulation, and
  execution milestones.

Model drift:

- Keep immutable rules in `AGENTS.md`.
- Cite policy version in every decision.

Clone failure:

- Commit all state.
- Commit no secrets.
- Avoid local-only absolute paths in repository content except clickable links
  in assistant responses.

## Initial State

As of 2026-05-26:

- confirmed holdings: none;
- confirmed cash: unknown;
- confirmed ledger events: none;
- default planned monthly contribution: USD 888;
- initial policy version: `v1.0`;
- initial baseline research:
  [research/2026-05-26-initial-baseline.md](research/2026-05-26-initial-baseline.md);
- initial simulated decision:
  [decisions/2026-05-26-initial-simulation.md](decisions/2026-05-26-initial-simulation.md).
