# Execution Confirmation Template

Use this only after the broker actually confirms a deposit, buy, sell, dividend,
fee, split, or correction.

## Deposit

```yaml
event_type: deposit
broker:
account_alias:
confirmation_id:
amount:
currency: USD
deposit_available_date:
created_at:
notes:
```

## Buy or Sell

```yaml
event_type: trade
broker:
account_alias:
confirmation_id:
side:
symbol:
quantity:
average_price:
fees:
currency: USD
trade_date:
settlement_date:
created_at:
notes:
```

## Dividend

```yaml
event_type: dividend
broker:
account_alias:
confirmation_id:
symbol:
amount:
currency: USD
pay_date:
created_at:
notes:
```

## Correction

```yaml
event_type: correction
broker:
account_alias:
confirmation_id:
corrects_event_id:
cash_delta:
symbol:
quantity_delta:
currency: USD
created_at:
reason:
notes:
```

If any required field is missing, the agent must ask for it before updating the
ledger.
