# Monthly Decision Request Template

Use this when asking: "I deposited money today. What should I buy or sell?"

```yaml
request_type: monthly_decision
date:
deposit_confirmed:
deposit_amount:
currency: USD
broker:
account_alias:
cash_available_for_trading:
settled_cash:
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

Minimum needed for exact share counts:

- confirmed available cash;
- whether fractional shares are allowed;
- current holdings if they differ from repository records;
- any fees or commissions.
- whether the approved liquidity reserve is available and eligible in the user's broker account.

The agent must refresh current market and company data before recommending any orders.

Research engine checklist before proposing orders:

- Review `research/discovery/candidates.csv` for any candidate that should be promoted, rejected, or kept incubating.
- Review `research/freshness/events.csv` for open `high` or `critical` events.
- Review `research/valuation-states.csv` for stale or changed entry states.
- Review `research/quality-metrics.yml` for stale research coverage, open critical events, stale valuation states, stale theses, and filing-review gaps.
- Check for new SEC filings, IR releases, earnings materials, financing updates, dilution, debt, contract wins or losses, regulatory changes, and management changes since the last decision.
- Run or cite [weekly-ai-cycle-monitor.md](weekly-ai-cycle-monitor.md) when the decision depends on AI capex, AI financing, semiconductor supply chains, data-center power, credit conditions, or broad bubble risk.
- If a material filing exists, complete or cite a filing review using [filing-review.md](filing-review.md) before buying that symbol.
- If `research/quality-metrics.yml` says `decision_readiness.status: not_ready`, refresh the missing evidence or recommend holding cash.
- State when a company is good but not attractively priced, or when a price looks cheap but the thesis may be broken.
- State when no stock passes the gates and the best action is no trade, hold cash, or park idle cash in the approved liquidity reserve.
- Confirm the target passes the mission gate, evidence gate, and entry gate from `AGENTS.md`.

Output discipline:

- Separate facts, inferences, probability scenarios, and proposed account actions.
- Mark unavailable or unverifiable data explicitly.
- Keep proposed account actions inside the current policy. Under policy `v1.1`, SGOV or a materially equivalent short-duration U.S. Treasury reserve can be used only for cash management. Do not convert puts, shorts, leverage, margin, crypto tokens, private shares, or non-US-listed instruments into account orders.
- Every action needs a trigger condition, invalidation condition, and time horizon.
- SGOV and equivalent reserve buys and sells still require broker execution confirmation before ledger updates.
