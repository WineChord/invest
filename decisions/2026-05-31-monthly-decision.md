# Monthly Decision

Date: 2026-05-31

Policy version: `v1.1`

Status: simulation and proposed decision only. The user confirmed no actual buy or sell order was executed, and no broker-confirmed account record was updated.

Post-run discovery-gate addendum: this proposed order set is historical and should not be treated as an executable live instruction without a fresh rerun, broker cash confirmation, current prices, and issuer-event checks. The later 2026-05-31 discovery-design hardening made material raw-candidate readiness machine-checkable; `FLY` was then reviewed with publicly reachable SEC and market data and incubated from evidence rather than left as a missing-data blocker.

## Account State Used

- Confirmed cash: USD 888.00.
- Confirmed settled cash: USD 888.00.
- Confirmed buying power: USD 888.00.
- Confirmed security positions: none.
- Confirmed liquidity reserve value: none.
- Fractional share capability: unknown.
- Fees or commissions: unknown; use the broker order preview before submitting any order.

## Decision Operating Cycle

This decision used the full-cycle and monthly-decision workflows together because the user asked for a full repository run and a concrete buy decision.

Constitutional alignment: the recommendation uses broker-confirmed cash only, preserves the no-trading rule, keeps cash as an acceptable outcome, starts from bottleneck lanes rather than a static stock list, and separates proposed orders from broker records.

Sources and evidence checked:

- Account records: `data/account/state.yml`, `data/account/ledger.csv`, and `data/account/positions.csv`.
- Policy and workflow files: `CONSTITUTION.md`, `SPEC.md`, `data/policy/policy-v1.1.md`, `templates/monthly-decision.md`, `templates/full-operating-cycle.md`, and `templates/research-engine-run.md`.
- Bottleneck map and research state: `research/discovery/lanes.yml`, `research/discovery/candidates.csv`, `research/watchlist.csv`, `research/valuation-states.csv`, `research/quality-metrics.yml`, and `research/freshness/events.csv`.
- Deterministic commands: `npm run refresh:market -- --dry-run`, `npm run discover:universe -- --dry-run`, and `npm run check:data`.
- Current market basis: Yahoo Finance daily close through 2026-05-29, retrieved by repository tooling. No newer close exists because 2026-05-31 is a Sunday.
- SEC submissions check: active watchlist CIKs and SpaceX were checked on 2026-05-31; no filing on or after 2026-05-30 blocked a staged RKLB or ASTS order.
- Filing reviews: latest RKLB, ASTS, and active-watchlist filing reviews remain usable factual evidence under policy `v1.1`.
- New discovery source: Firefly Aerospace (`FLY`) Q1 2026 results and 2026-05-26 S-1 offering filing were skimmed and recorded as raw candidate evidence.

Discovery lane changes: no lane was added, split, merged, promoted, demoted, or retired. The `unknown_future_bottlenecks` lane remains active.

Discovery candidate changes: `FLY` was added to `research/discovery/candidates.csv` as a raw space infrastructure candidate. Under the later strengthened readiness gate, its linked sprint in `research/discovery/readiness/2026-05-31-FLY-readiness.md` was completed to an incubate classification with research-only dashboard visibility: direct exposure is real, but valuation, losses, runway, dilution risk, selling-holder risk, and short public record do not justify a buy or allocation promotion today.

Freshness events: no unresolved critical or high-severity freshness event blocks this decision. RKLB's USD 3.0 billion ATM capacity remains the main dilution overhang. ASTS remains exposed to launch, satellite production, regulatory, MNO economics, capex, debt, and dilution risk.

Valuation-state result: active valuation states are current to the 2026-05-29 close. RKLB and ASTS still pass the mission and evidence gates for a staged first allocation, but neither is cheap. CRDO, ALAB, and VRT remain high-quality alternatives but are less attractive for this first allocation because of valuation, scale, or lower asymmetry. Other watch names remain too uncertain, too expensive, less asymmetric, or not tradable.

Meta-self-improvement: later same-day process review found that a new template, candidate-readiness index, agentic discovery run artifact, and validation gate were needed. The cycle also exposed a future improvement opportunity: add a lightweight macro/credit and high-multiple heat check before decisions dominated by financing-sensitive, high-multiple companies.

Validation after durable edits: run `npm run check:data` and `npm run verify`.

## Subagent Reviews

Five advisory reviewers ran.

Discovery-lane review found no new lane but identified `FLY` as the strongest dry-run lead. It recommended raw-candidate promotion, not same-day buying.

Freshness/filing review found no new SEC or company event after the 2026-05-30 run that blocks a staged RKLB or ASTS order.

Bull-case review preferred a more ASTS-heavy two-name allocation because ASTS supplies the strongest direct-to-device convexity and RKLB supplies the stronger execution base.

Bear-case review recommended no buy, or at most one RKLB share, because both RKLB and ASTS trade at extreme multiples after large runups and the account is not required to be invested.

Allocation/risk review supported the prior 4 RKLB and 2 ASTS good-for-day limit plan, keeping a USD 87 cash buffer and avoiding SGOV for the small residual cash.

Original resolution before the strengthened readiness gate: the bear case was valid on valuation heat, so the decision stayed staged, used tight limit prices, gave RKLB the larger weight, kept ASTS smaller, and did not chase unfilled orders. Current status: this historical resolution is not executable without a fresh rerun, but the later FLY sprint no longer leaves a repository-work or dashboard-surface blocker.

## Historical Proposed Orders

These simulated orders were the original proposed output before the strengthened readiness gate. They are not actual trades and are not currently actionable without a fresh rerun, broker cash confirmation, current prices, and issuer-event checks. If either stock opens or trades above the stated limit and the order does not fill, do not chase; leave the unfilled cash idle and recompute with fresh prices.

| Side | Symbol | Quantity | Limit price | Max cash use |
| --- | --- | ---: | ---: | ---: |
| Buy | RKLB | 4 | $143.50 | $574.00 |
| Buy | ASTS | 2 | $113.50 | $227.00 |

Maximum total cash use: USD 801.00.

Estimated retained cash before fees: USD 87.00.

Price basis: 2026-05-29 regular-session closes of RKLB USD 143.48 and ASTS USD 113.41 from the committed Yahoo Finance chart snapshot retrieved 2026-05-30 and rechecked on 2026-05-31.

## Rationale

RKLB receives the larger allocation because it remains the strongest execution-led public space infrastructure platform in the repository universe. The evidence base includes Q1 2026 operating progress, backlog, space systems growth, and government contract momentum. The position is capped because the price already discounts substantial future success, Neutron execution is still ahead, and the ATM program creates dilution overhang.

ASTS receives a smaller allocation because it offers rarer direct-to-device satellite upside but remains more binary. The account should have some exposure to that convexity, but not size it as though launch cadence, satellite production, commercial economics, regulatory approvals, and future financing are already solved.

No SGOV purchase is recommended for the residual cash because the retained buffer is below one typical SGOV whole-share purchase and fees are unknown. Holding the residual cash is acceptable under policy `v1.1`.

No sells are recommended because there are no confirmed holdings.

## Trigger And Invalidation Conditions

Proceed only if the broker still shows at least USD 888.00 available for trading, the order preview shows total cost including fees within USD 888.00, and no new RKLB or ASTS filing, financing update, launch failure, regulatory issue, or broad market shock appears before execution.

Invalidate and recompute if RKLB would require an execution price above USD 143.50, ASTS would require an execution price above USD 113.50, the broker cash balance differs from the repository-confirmed USD 888.00, fractional-share execution is preferred, or either order cannot be entered as a limit order.

Validity window: next U.S. regular trading session only, expected 2026-06-01. After that, rerun price and freshness checks before placing any order.

## Follow-Up Research

Before any future allocation decision where FLY could matter, complete a full FLY filing review covering Q1 2026 results, 10-Q, S-1, 424B3, EFFECT, Form 144 selling-holder context, runway, dilution, and same-lane peer comparison.

## Confirmation Needed After Execution

If the user executes any order, update the repository only after receiving the broker/account alias, confirmation ID or equivalent evidence, side, symbol, quantity, average price, fees, currency, trade date, and settlement date.
