# Account Data

This directory stores confirmed account records.

Rules:

- `ledger.csv` is append-only.
- `positions.csv` is derived from confirmed ledger events.
- `state.yml` summarizes the latest confirmed account state.
- `plan.yml` stores planned contributions and preferences, not actual cash.
- `equity_curve.csv` stores derived performance snapshots for reporting.
- Recommendations in `decisions/` never mutate this directory.

Equity curve cadence:

- Add a valuation snapshot during each monthly decision cycle once confirmed cash or positions exist.
- Add a valuation snapshot after each confirmed deposit or execution date when the required prices are available.
- Backfill month-end valuation snapshots from historical close data when possible.
- Do not use today's price to fill an older valuation date.

Initial state on 2026-05-26:

- no confirmed ledger events;
- no confirmed positions;
- confirmed cash balance unknown;
- default planned monthly contribution USD 888.
