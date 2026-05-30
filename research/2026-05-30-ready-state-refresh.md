# Ready-State Research Refresh

Date: 2026-05-30
Policy version: v1.1
Purpose: refresh the active watchlist enough for the repository to support a live monthly allocation decision after broker cash and current prices are checked.

## Inputs

- Confirmed account state: USD 888 cash, no broker-confirmed security positions, one append-only deposit ledger event.
- Market data: Yahoo Finance chart daily close through 2026-05-29, retrieved 2026-05-30.
- Company data: SEC submissions and SEC companyfacts for each active watchlist symbol, retrieved 2026-05-30.
- Filing coverage: latest material 10-Q, 6-K, or IPO prospectus review for every active watchlist symbol.

## Readiness Result

The repository is ready for a monthly allocation recommendation cycle. Ready does not mean buy. It means the active universe now has current market snapshots, current valuation states, and latest filing-review coverage, with no open critical or high-severity freshness event left unresolved.

The current account posture is funded but uninvested. Any trade remains a proposed decision only until the user executes it at the broker and provides confirmation fields.

## Active Universe

| Symbol | Status | 2026-05-29 close | Valuation state | Entry read | Decision posture |
| --- | --- | ---: | --- | --- | --- |
| RKLB | active_core_candidate | 143.48 | fair | fair | strongest space platform, but staged only |
| ASTS | active_core_candidate | 113.41 | fair | fair | extreme upside, high execution and dilution risk |
| CRDO | active_core_candidate | 236.03 | fair | too_expensive | high-quality AI interconnect, valuation demanding |
| ALAB | active_candidate | 342.85 | too_expensive | too_expensive | excellent AI fabric exposure, little margin of safety |
| VRT | active_candidate | 315.71 | fair | fair | mature AI power and cooling beneficiary |
| NBIS | watch | 231.09 | too_uncertain | too_uncertain | AI cloud upside offset by leverage and utilization risk |
| MU | watch | 971.00 | too_expensive | too_expensive | HBM exposure, but enormous and cyclical |
| CRWV | watch | 109.53 | too_uncertain | too_uncertain | direct AI cloud capacity with heavy debt |
| CRCL | watch | 113.00 | too_uncertain | too_uncertain | programmable money infrastructure, reserve economics unresolved |
| CBRS | watch | 236.99 | too_uncertain | too_uncertain | recent IPO, insufficient public operating history |
| IREN | watch | 63.54 | too_uncertain | too_uncertain | power-backed compute option with bitcoin and financing risk |
| OKLO | watch | 66.88 | too_uncertain | too_uncertain | advanced nuclear option, pre-commercial |
| BE | watch | 285.00 | too_expensive | too_expensive | power scarcity thesis, valuation and service economics risk |
| LEU | watch | 182.47 | fair | too_uncertain | distinct HALEU bottleneck, policy and execution dependency |
| GSAT | watch | 84.21 | too_uncertain | too_uncertain | spectrum-backed D2D option, partner concentration risk |
| KTOS | watch | 64.13 | fair | fair | defense and space supplier, lower asymmetry than core names |
| IONQ | watch | 72.07 | too_uncertain | too_uncertain | quantum option value, commercial proof still early |
| LUNR | watch | 43.83 | too_uncertain | too_uncertain | lunar and space infrastructure upside, mission risk high |

## Capital Allocation Implication

The confirmed USD 888 is deployable liquidity, but the repository is not forcing deployment. The next monthly decision should compare RKLB, ASTS, CRDO, and the best watch candidates against holding cash or using the approved SGOV liquidity reserve. Several names remain valuable watchlist ideas but fail the entry gate at current prices.

## Cleanup

- Converted the account from empty/unconfirmed to funded/no-positions using confirmed cash only.
- Added fresh filing-review coverage for active watchlist names that lacked it.
- Refreshed valuation states to the 2026-05-29 close.
- Kept RDW, SpaceX, OpenAI, and Anthropic out of buy eligibility under current policy.
