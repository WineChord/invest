# Execution Confirmation Template

Use this after the broker actually confirms a deposit, buy, sell, dividend, fee, split, or correction. It also defines the separate standing-contribution branch for the exact recurring deposit authorized in `data/account/plan.yml`.

Do not paste raw broker screenshots, statements, account numbers, full order IDs, full confirmation numbers, tax identifiers, legal identity documents, or broker message-center content into the repository. Convert broker evidence into normalized redacted fields. `confirmation_id` should be a stable redacted alias or non-reversible hash that lets the account owner reconcile records later without exposing the raw broker identifier.

If the event is a same-day trade or includes actionable trading content, do not commit, push, publish, or deploy the record until the [public release policy](../PUBLICATION_POLICY.md) embargo has expired.

## Standing Recurring Deposit

The active versioned account-owner authorization in `data/account/plan.yml` is occurrence confirmation only for the fixed USD 888 Friday deposit once its `Asia/Shanghai` due date arrives. Do not request a second confirmation for a valid due occurrence.

Before applying it:

- resolve `current_authorization_id` against the immutable authorization-version array and verify that its status is `active_owner_standing_authorization`;
- verify that the due date is on or after `effective_from` and not after `effective_until` when one is present;
- verify the exact amount, currency, broker, account alias, cadence, timezone, and authorization identity;
- reject dates before the due date and never backfill before `effective_from`;
- deduplicate by broker, account alias, authorization identity, due date, amount, and currency;
- accept only the canonical authorization identity and complete event economics as the recurring occurrence;
- record a distinct same-day deposit with source `user_confirmed_additional_deposit`; otherwise treat the collision as ambiguous and stop;
- fail closed on an ambiguous duplicate, identity collision, account-state drift, inactive plan, or broker conflict.

Use `npm run account:apply-standing-contribution -- --as-of YYYY-MM-DD --json`. The command appends one row per missing due Friday, applies at most the earliest eight missing occurrences in one run, reports any remainder for the next run, and updates confirmed, settled, and available cash without changing positions, equity-curve values, or `last_reconciled_with_broker_at`. A private crash-recovery journal prevents an interrupted ledger/state write from becoming silent drift.

Standing deposit events use:

```yaml
event_type: deposit
status: confirmed
confirmation_id: AUTHORIZATION_ID-YYYY-MM-DD
amount: 888
currency: USD
deposit_available_date: YYYY-MM-DD
source: owner_standing_contribution
created_at: ACTUAL_WRITE_TIME
notes: Weekly USD 888 contribution recorded under the active account-owner standing authorization.
```

This source records account-owner confirmation that the due amount is deposited, settled, and available, not live broker API verification. If later broker evidence contradicts an occurrence, preserve the original event and run `npm run account:record-standing-conflict -- --corrects-event-id EVENT_ID --confirmation-id REDACTED_BROKER_ALIAS --reason "REDACTED_REASON" --as-of YYYY-MM-DD --json`. The reason must summarize the conflict without raw broker text, account identifiers, or private reference numbers. The command appends a machine-linked correction and pauses the current authorization in one recoverable account transaction. Do not apply later occurrences until the conflict is resolved.

## Deposit

Deposit confirmations may use repository defaults when the user explicitly confirms that a cash amount is deposited, posted, or available in the brokerage account and does not indicate a broker or account change. In that case:

- use the latest confirmed ledger `broker` and `account_alias`;
- use `user-confirmed-YYYY-MM-DD-AMOUNT-deposit` as the redacted `confirmation_id`, with the amount normalized without punctuation when needed;
- use the user-stated available date when present, otherwise the current decision or confirmation date as `deposit_available_date`;
- use `USD` unless the user states another currency;
- use the current local timestamp as `created_at`;
- mark notes to say default deposit fields were used.

Do not use these deposit defaults for dividends, corrections, broker/account changes, or missing trade economics.

When an explicitly confirmed deposit is additional to the standing Friday occurrence, use `source: user_confirmed_additional_deposit`. This machine-readable distinction is required when the amount, account, currency, and date would otherwise collide with the standing event.

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

Use streamlined trade defaulting when the user provides broker-confirmed execution evidence or a clear filled-trade statement and does not indicate a broker/account change. The goal is to finish the ledger update after one user-provided evidence packet instead of asking for repetitive administrative fields.

A broker order-status screenshot is sufficient broker-confirmed execution evidence when it visibly shows the non-defaultable trade facts below. In that case, do not ask the user to separately confirm that the order really filled or to restate defaultable administrative fields. Convert the screenshot evidence into normalized, redacted repository records and leave the raw screenshot outside the repository.

Non-defaultable trade facts:

- the trade was actually filled or completed;
- `side`;
- `symbol`;
- `quantity`;
- `average_price` or enough broker-reported fills to compute a weighted average;
- `trade_date` or a broker timestamp that clearly identifies the trade date.

Defaultable trade fields:

- `broker`: latest confirmed ledger broker;
- `account_alias`: latest confirmed ledger account alias;
- `confirmation_id`: stable redacted alias such as `screenshot-YYYY-MM-DD-SYMBOL-001` or `user-confirmed-YYYY-MM-DD-SYMBOL-trade-001`;
- `fees`: `0.00` for U.S.-listed stock or ETF trades in the established Charles Schwab International satellite account unless the user or broker evidence states a fee;
- `currency`: `USD` unless the evidence states another currency;
- `settlement_date`: the next standard U.S. equity/ETF settlement business day, currently T+1, unless the evidence states another settlement date;
- `created_at`: current local timestamp;
- `publication_release_earliest_at` and `sensitive_field_review_status`: derive from the public release policy and mark same-day trade details local/unpublished when applicable;
- `notes`: state which defaults were used and that raw screenshots, full order IDs, and full confirmation numbers are not committed.

If any non-defaultable trade fact is missing, ask one compact question listing only those missing facts. Do not ask for fields covered by the defaulting rule. Never use current market prices, bid/ask/last quotes, recommendation prices, or decision notes as substitutes for broker-reported execution economics.

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

If any required non-defaultable field is missing, the agent must ask for it before updating the ledger. Defaulting is allowed only for fields covered above because it preserves a redacted audit trail without requiring repetitive broker/account restatement.
