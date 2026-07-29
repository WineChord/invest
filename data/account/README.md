# Account Data

This directory stores confirmed account records.

Rules:

- `ledger.csv` is append-only.
- `positions.csv` is derived from confirmed ledger events.
- `state.yml` summarizes the latest confirmed account state.
- `plan.yml` stores contribution and account preferences. It retains every standing-authorization version and points to the current one. The active version confirms only the exact fixed weekly deposit as deposited, settled, and available after each due date; other plans are not actual cash.
- `equity_curve.csv` stores derived performance snapshots for reporting.
- Recommendations in `decisions/` never mutate this directory.
- SGOV and equivalent liquidity-reserve instruments are securities, not cash. Record confirmed reserve buys and sells in `ledger.csv`; do not silently merge them into `confirmed_cash`.
- Public account records must be normalized and redacted under `PUBLICATION_POLICY.md`. Do not commit raw broker documents, screenshots, account numbers, full broker order IDs, full confirmation numbers, or tax/identity details. Use a stable redacted alias or non-reversible hash in `confirmation_id`.
- A broker screenshot can be used as source evidence when it shows the required filled-trade facts, but only normalized ledger fields and redacted aliases belong in committed files.
- Same-day trade records and actionable execution details must not be committed, pushed, published, or deployed until the public release embargo has expired.
- Apply due standing contributions with `npm run account:apply-standing-contribution -- --as-of YYYY-MM-DD --json`. The command is idempotent, records at most the earliest eight missing Fridays per run while reporting any remainder, uses a crash-recovery journal for ledger/state consistency, does not change positions or the equity curve, and does not claim broker reconciliation.
- If later broker evidence contradicts a standing occurrence, use `npm run account:record-standing-conflict` with a redacted broker-evidence alias. It appends a machine-linked correction and pauses the current authorization in one recoverable account transaction. Never edit the original row.

Equity curve cadence:

- Add a valuation snapshot during each periodic allocation decision cycle once confirmed cash or positions exist.
- Add a valuation snapshot after each confirmed deposit or execution date when the required prices are available.
- Backfill month-end valuation snapshots from historical close data when possible.
- Daily close automation may add or refresh one valuation snapshot per available market close after confirmed positions and confirmed cash exist.
- Do not use today's price to fill an older valuation date.
- Automated valuation snapshots are market-derived reporting rows only. They do not change `ledger.csv`, `positions.csv`, or `state.yml`.

State source of truth:

- `state.yml` is the current summary.
- `ledger.csv` is the append-only event source.
- `positions.csv` is derived from confirmed ledger events.
- `equity_curve.csv` is a market-derived reporting series and may lag when required historical close prices are unavailable.
