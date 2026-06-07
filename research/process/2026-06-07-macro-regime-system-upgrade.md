# Macro Regime System Upgrade

review_date: 2026-06-07
policy_version: v1.1
process_area: macro_regime_risk_overlay

## Problem

The repository already required AI-cycle and market-regime review when a decision depends on AI capex, financing, power, credit, or broad bubble risk, but the output was mostly prose. That made it harder to reuse macro evidence across decisions, compare changes from one cycle to the next, display the state on the dashboard, or validate that every company has an explicit sensitivity view.

## Durable Changes

- Added `research/macro/regime-snapshots.csv` as the machine-readable macro and credit regime surface.
- Added `research/macro/watchlist-sensitivity.csv` so every non-removed tradable watchlist company has explicit rate, credit, AI capex, financing, dilution, regulatory, energy, and customer-concentration sensitivity scores.
- Added `research/macro/financing-runway-scores.csv` so financing, runway, ATM, convertible, project-finance, and customer-concentration risk can affect entry and priority without becoming a standalone buy signal.
- Added `research/macro/watchlist-risk-matrix.csv` to show common risk factors across companies that may look diversified by theme but share the same stress source.
- Added `research/macro/event-calendar.csv` as the durable event and refresh calendar for macro, AI-cycle, community, and financing reviews.
- Added `research/process/decision-retrospectives.csv` and `templates/decision-retrospective.md` so missed candidates, unskimmed community leads, overly tight entry discipline, and overly loose entry discipline are reviewed after enough evidence has elapsed.
- Added `scripts/refresh-macro-regime.mjs` to collect public no-token macro inputs and write a structured regime snapshot without inventing unavailable fields.
- Extended community triage scoring with source-recency decay and cross-scan persistence while preserving the rule that community heat only changes analysis priority.

## Boundary

The macro regime layer is a risk overlay, not a trading system. It can tighten or loosen entry discipline, change research priority, raise financing-review urgency, and support cash or SGOV optionality. It cannot create buy eligibility, promotion eligibility, security metadata, or allocation evidence without primary company evidence and the normal gates.

## Validation

`npm run check:data` now validates the macro risk-overlay files, source references, symbol coverage, score ranges, and retrospective records. `npm run test:macro-regime` checks regime scoring helpers. `npm run verify` includes both.
