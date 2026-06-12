# Execution Confirmation Template

Use this only after the broker actually confirms a deposit, buy, sell, dividend, fee, split, or correction.

Do not paste raw broker screenshots, statements, account numbers, full order IDs, full confirmation numbers, tax identifiers, legal identity documents, or broker message-center content into the repository. Convert broker evidence into normalized redacted fields. `confirmation_id` should be a stable redacted alias or non-reversible hash that lets the account owner reconcile records later without exposing the raw broker identifier.

If the event is a same-day trade or includes actionable trading content, do not commit, push, publish, or deploy the record until the [public release policy](../PUBLICATION_POLICY.md) embargo has expired.

## Deposit

Deposit confirmations may use repository defaults when the user explicitly confirms that a cash amount is deposited, posted, or available in the brokerage account and does not indicate a broker or account change. In that case:

- use the latest confirmed ledger `broker` and `account_alias`;
- use `user-confirmed-YYYY-MM-DD-AMOUNT-deposit` as the redacted `confirmation_id`, with the amount normalized without punctuation when needed;
- use the user-stated available date when present, otherwise the current decision or confirmation date as `deposit_available_date`;
- use `USD` unless the user states another currency;
- use the current local timestamp as `created_at`;
- mark notes to say default deposit fields were used.

Do not use these defaults for trades, dividends, corrections, fees, or broker/account changes.

```yaml
event_type: deposit
broker:
account_alias:
confirmation_id:
amount:
currency: USD
deposit_available_date:
created_at:
publication_release_earliest_at:
sensitive_field_review_status:
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
publication_release_earliest_at:
sensitive_field_review_status:
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
publication_release_earliest_at:
sensitive_field_review_status:
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
publication_release_earliest_at:
sensitive_field_review_status:
notes:
```

If any required non-defaultable field is missing, the agent must ask for it before updating the ledger. Deposit-only defaults above are allowed because they preserve a redacted audit trail without requiring repetitive broker/account restatement.
