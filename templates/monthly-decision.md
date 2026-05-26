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
current_positions:
  - symbol:
    quantity:
    average_cost:
    market_value:
pending_orders:
constraints_or_preferences:
```

Minimum needed for exact share counts:

- confirmed available cash;
- whether fractional shares are allowed;
- current holdings if they differ from repository records;
- any fees or commissions.

The agent must refresh current market and company data before recommending any orders.
