# Account Data

This directory stores confirmed account records.

Rules:

- `ledger.csv` is append-only.
- `positions.csv` is derived from confirmed ledger events.
- `state.yml` summarizes the latest confirmed account state.
- `plan.yml` stores planned contributions and preferences, not actual cash.
- Recommendations in `decisions/` never mutate this directory.

Initial state on 2026-05-26:

- no confirmed ledger events;
- no confirmed positions;
- confirmed cash balance unknown;
- default planned monthly contribution USD 888.
