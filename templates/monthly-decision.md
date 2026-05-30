# Monthly Decision Request Template

Use this when asking: "I deposited money today. What should I buy or sell?"

```yaml
request_type: monthly_decision
full_decision_operating_cycle_required: true
date:
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
deposit_confirmed:
deposit_amount:
currency: USD
broker:
account_alias:
cash_available_for_trading:
settled_cash:
confirmed_liquidity_reserve_value:
liquidity_reserve_available_for_sale:
fractional_shares_allowed:
fees_or_commissions:
liquidity_reserve_enabled:
liquidity_reserve_symbol: SGOV
broker_settlement_constraints:
current_positions:
  - symbol:
    quantity:
    average_cost:
    market_value:
pending_orders:
constraints_or_preferences:
latest_ai_cycle_monitor:
```

Natural-language trigger:

Treat the request as `monthly_decision` when the user says they deposited cash, asks what to buy or sell, asks whether to deploy cash, asks whether to use SGOV, or asks for an allocation decision. The user does not need to paste this template for the full decision operating cycle to be mandatory.

If the user asks to run the whole repository flow, execute everything, do a full refresh, or use equivalent full-cycle language, use [full-operating-cycle.md](full-operating-cycle.md) in addition to this template.

Minimum needed for exact share counts:

- confirmed available cash;
- confirmed liquidity reserve value and whether it is available for sale;
- whether fractional shares are allowed;
- current holdings if they differ from repository records;
- any fees or commissions.
- whether the approved liquidity reserve is available and eligible in the user's broker account.

The agent must run the full decision operating cycle before recommending any orders. This is not just a price refresh; it is the required exploration, freshness, research, valuation, allocation, cleanup, and validation loop that keeps the repository from choosing from a stale watchlist.

Full decision operating cycle before proposing orders:

- Load `AGENTS.md`, `SPEC.md`, current policy, account files, prior decisions, package scripts, research state, and dashboard/data surfaces relevant to the request.
- Determine the freshness window from the latest decision, latest research-engine run, latest market-data refresh, and the decision date.
- Refresh deterministic market data with repository tooling when available.
- Review `research/discovery/lanes.yml` and use [bottleneck-lane-review.md](bottleneck-lane-review.md) when material. Start from the bottleneck map, explicitly ask whether a new lane appeared, and record whether existing lanes should be promoted, split, merged, demoted, retired, or left unchanged.
- Run `npm run discover:universe -- --dry-run` when network access is available, and treat results as raw leads that require primary-source skims before promotion.
- Review `research/discovery/candidates.csv` for any candidate that should be promoted, rejected, or kept incubating.
- Scan mission-relevant themes for newly public companies, major spinoffs, IPOs, direct listings, and new public proxies that might deserve raw discovery status.
- Review `research/freshness/events.csv` for open `high` or `critical` events.
- Review `research/valuation-states.csv` for stale or changed entry states.
- Review `research/quality-metrics.yml` for stale research coverage, open critical events, stale valuation states, stale theses, and filing-review gaps.
- Check for new SEC filings, IR releases, earnings materials, financing updates, dilution, debt, contract wins or losses, regulatory changes, and management changes since the last decision.
- Run the self-evolution check: identify which watchlist theses strengthened or weakened, which entries became more or less attractive, which names deserve priority/status changes, and whether a new theme, industry, bottleneck, or market-structure change deserves a discovery lane.
- Run or cite [weekly-ai-cycle-monitor.md](weekly-ai-cycle-monitor.md) when the decision depends on AI capex, AI financing, semiconductor supply chains, data-center power, credit conditions, or broad bubble risk.
- If a material filing exists, complete or cite a filing review using [filing-review.md](filing-review.md) before buying that symbol.
- If `research/quality-metrics.yml` says `decision_readiness.status: not_ready`, refresh the missing evidence or recommend holding cash.
- State when a company is good but not attractively priced, or when a price looks cheap but the thesis may be broken.
- State when no stock passes the gates and the best action is no trade, hold cash, or park idle cash in the approved liquidity reserve.
- State when a stock passes the gates strongly enough to justify using total confirmed deployable liquidity, including SGOV or equivalent reserve sales, instead of limiting the order to the latest monthly contribution.
- Confirm the target passes the mission gate, evidence gate, and entry gate from `AGENTS.md`.
- Run the meta-self-improvement check: note whether the cycle exposed a durable process defect, missed-lane risk, source gap, weak template, automation opportunity, validation gap, scoring ambiguity, or dashboard/data problem.
- Run repository cleanup before finishing: demote stale research, remove or ignore scratch/generated noise, update canonical docs or templates when behavior changes, and preserve auditability.
- Run applicable validation. Use `npm run check:data` for data/research changes and `npm run verify` for dashboard or broad repository changes when practical.
- If any applicable operating-cycle step cannot be completed, do not give a buy recommendation unless the missing item is explicitly reviewed or marked immaterial.

Output discipline:

- Include a `Decision operating cycle` section with sources checked, discovery lane changes, discovery candidate changes, watchlist priority changes, thesis/entry deltas, freshness events, filing-review status, valuation-state status, meta-self-improvement findings, cleanup performed, validations run, readiness result, unavailable evidence, and validity window.
- Separate facts, inferences, probability scenarios, and proposed account actions.
- Mark unavailable or unverifiable data explicitly.
- Keep proposed account actions inside the current policy. Under policy `v1.1`, SGOV or a materially equivalent short-duration U.S. Treasury reserve can be used only for cash management. Do not convert puts, shorts, leverage, margin, crypto tokens, private shares, or non-US-listed instruments into account orders.
- Every action needs a trigger condition, invalidation condition, and time horizon.
- SGOV and equivalent reserve buys and sells still require broker execution confirmation before ledger updates.
- Sizing must disclose the total deployable-liquidity basis: confirmed cash, reserve value planned for sale, expected retained buffer, and any settlement constraint.
