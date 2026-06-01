# Account Data

This directory stores confirmed account records.

Rules:

- `ledger.csv` is append-only.
- `positions.csv` is derived from confirmed ledger events.
- `state.yml` summarizes the latest confirmed account state.
- `plan.yml` stores planned contributions and preferences, not actual cash.
- `equity_curve.csv` stores derived performance snapshots for reporting.
- Recommendations in `decisions/` never mutate this directory.
- SGOV and equivalent liquidity-reserve instruments are securities, not cash. Record confirmed reserve buys and sells in `ledger.csv`; do not silently merge them into `confirmed_cash`.
- Public account records must be normalized and redacted under `PUBLICATION_POLICY.md`. Do not commit raw broker documents, screenshots, account numbers, full broker order IDs, full confirmation numbers, or tax/identity details. Use a stable redacted alias or non-reversible hash in `confirmation_id`.
- Same-day trade records and actionable execution details must not be committed, pushed, published, or deployed until the public release embargo has expired.

Equity curve cadence:

- Add a valuation snapshot during each monthly decision cycle once confirmed cash or positions exist.
- Add a valuation snapshot after each confirmed deposit or execution date when the required prices are available.
- Backfill month-end valuation snapshots from historical close data when possible.
- Daily close automation may add or refresh one valuation snapshot per available market close after confirmed positions and confirmed cash exist.
- Do not use today's price to fill an older valuation date.
- Automated valuation snapshots are market-derived reporting rows only. They do not change `ledger.csv`, `positions.csv`, or `state.yml`.

Current state after the 2026-05-30 confirmed deposit:

- one confirmed deposit ledger event;
- no confirmed positions;
- confirmed cash balance USD 888;
- default planned monthly contribution remains USD 888 for future months.
- policy `v1.1` allows SGOV or a materially equivalent short-duration U.S. Treasury reserve for cash management only after broker-confirmed execution.
