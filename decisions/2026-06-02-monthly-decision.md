# Monthly Decision Simulation Rerun

Date: 2026-06-02

Policy version: `v1.1`

Status: expired simulation and no-action research record. The user later confirmed this was only a research decision simulation; no trade was executed, no order was submitted, and no broker-confirmed account record was updated.

## Account State Used

- Confirmed cash: USD 888.00.
- Confirmed settled cash: USD 888.00.
- Confirmed buying power: USD 888.00.
- Confirmed security positions: none.
- Confirmed liquidity reserve value: none.
- Fractional share capability: unknown.
- Fees or commissions: unknown. A broker order preview would have been required for any real order, but this run did not proceed to execution.

## Decision Operating Cycle

This rerun was triggered by the user's request to re-analyze the full price decision after the prior staged order window expired. It is now recorded as a simulation because the user confirmed no actual trade was placed.

Sources and workflows checked:

- Confirmed account files: `data/account/state.yml`, `data/account/ledger.csv`, and `data/account/positions.csv`.
- Current policy and operating rules: `CONSTITUTION.md`, `AGENTS.md`, `SPEC.md`, `PUBLICATION_POLICY.md`, and `data/policy/policy-v1.1.md`.
- Deterministic tooling: `npm run refresh:market`, `npm run discover:universe -- --dry-run --json --as-of 2026-06-02 --output research/discovery/runs/2026-06-02-universe-scan.json`, `npm run discover:sec-event-filing-index -- --as-of 2026-06-02 --symbols ... --output-prefix research/discovery/runs/2026-06-02-sec-event-filing-index`, and `npm run build:evidence-packet -- --as-of 2026-06-02 --deterministic-output research/discovery/runs/2026-06-02-universe-scan.json --deterministic-output research/discovery/runs/2026-06-02-sec-event-filing-index-scan.json --output research/discovery/runs/2026-06-02-subagent-evidence-packet.yml`.
- Current price basis: Yahoo Finance daily closes through 2026-06-01, retrieved by the repository market refresh on 2026-06-02.
- Freshness and filing review: SEC submissions for RKLB and ASTS were checked through 2026-06-02. No new RKLB or ASTS 8-K, 10-Q, S-4/F-4, DEF 14A, launch/regulatory, or financing filing blocked the decision.
- Insider-sale review: RKLB filed four Form 4s on 2026-06-01 for 2026-05-28 sales totaling about 124,164 shares. The forms include sales under 10b5-1 plans for two officers and director-related sales. This is a sentiment, valuation, and overhang update, not a thesis break at roughly 0.02% of the Q1 weighted-average share count.
- Discovery review: the 2026-06-02 deterministic scans returned 43 raw leads. Most were name-level keyword matches. No new candidate displaced RKLB or ASTS in the simulation comparison. MDA is a future space-lane readiness sprint priority, but it is not yet a durable raw candidate because it still needs a primary-source skim.
- Watchlist-cycle review: all 28 non-removed watchlist rows received a 2026-06-02 cycle review. RKLB and ASTS research buy-zone rows were refreshed for the simulation audit; other rows kept prior status and priority.

## Subagent Reviews

Five independent xhigh reviewers ran:

- Discovery-lane and candidate triage: no lane change; no raw 2026-06-02 lead blocks RKLB/ASTS; MDA should be prioritized for a future readiness sprint.
- Freshness and filing review: no blocking RKLB/ASTS filing or issuer update; RKLB Form 4 cluster should be mentioned but does not break the simulated staged setup.
- Bull case: strongest support is RKLB, with ASTS as a smaller convexity sleeve; the lower 2026-06-01 close improves entry but does not justify full deployment.
- Bear case: no-buy is defensible because both names remain high-multiple, execution-heavy, and dilution-sensitive; the prior 3% stale threshold required a real rerun rather than mechanical reuse.
- Allocation and risk: after the rerun, the simulation supported the same small RKLB-led staged setup with a smaller ASTS sleeve, did not expand it, and held residual cash rather than modeling an SGOV purchase.

Main synthesis: the bear-case objection was valid because the old decision had expired and the price move exceeded the stale threshold. The rerun resolved that research blocker by refreshing price, SEC filings, issuer news, insider-sale evidence, discovery, watchlist-cycle status, and allocation math. The Form 4 cluster and high multiples argued against expanding. No trade was executed after this simulation.

## Expired Simulation Scenario

The table below records the private simulation scenario considered during the rerun. It is expired, was never submitted to a broker, and is not a current instruction. Any real action would require a fresh decision cycle, fresh prices, fresh issuer-event checks, broker preview, and explicit execution confirmation.

| Side | Symbol | Quantity | Limit price | Max cash use |
| --- | --- | ---: | ---: | ---: |
| Buy | RKLB | 3 | USD 143.50 | USD 430.50 |
| Buy | ASTS | 1 | USD 113.50 | USD 113.50 |

Maximum total cash use: USD 544.00 before fees.

Estimated retained cash before fees at the limit prices: USD 344.00.

At the 2026-06-01 closes, estimated cash use would be USD 472.82 before fees:

- RKLB: 3 shares x USD 122.39 = USD 367.17.
- ASTS: 1 share x USD 105.65 = USD 105.65.
- Estimated retained cash before fees at those closes: USD 415.18.

The simulation did not include an SGOV purchase because broker ETF eligibility, commissions, settlement treatment, and fractional handling were unknown. No SGOV transaction occurred.

## Rationale

RKLB remains the leading first-deployment research candidate because it has the strongest combination of mission fit, operating evidence, backlog, liquidity, launch and space-systems breadth, and defense-space platform optionality. The 2026-06-01 close was substantially below the prior staged limit, so the simulated entry was more attractive than the 2026-05-31 basis. Simulated sizing remained small because valuation was still high, Neutron execution remained ahead, the USD 3.0 billion ATM capacity was a real dilution overhang, and the 2026-06-01 Form 4 cluster reinforced price discipline.

ASTS remains a smaller convexity research candidate. The direct-to-device thesis is more binary and can compound dramatically if launch cadence, regulation, carrier economics, and network deployment align, but it is still pre-scale relative to market value. The simulation kept exposure smaller without treating the network economics as proven.

CRDO, ALAB, and VRT remain strong research candidates but not current first-deposit buys. CRDO's 2026-06-01 results filing keeps the AI interconnect lane important, but valuation and customer-concentration risk keep it outside buy-zone. ALAB remains too expensive. VRT has stronger operating evidence but lower extreme-upside asymmetry at current size.

LITE, YSS, FLY, VOYG, XNDU, FN, and the remaining watch or research-only names do not replace RKLB/ASTS today. Their current blockers are valuation, dilution, capital-structure complexity, customer concentration, short public history, incomplete commercial proof, or lower asymmetry.

## Historical Conditions Considered

At the time of the simulation, any real order would have required:

- the broker still shows at least USD 888.00 available for trading;
- a broker order preview showing total cost including fees within available cash;
- RKLB can be entered at or below USD 143.50;
- ASTS can be entered at or below USD 113.50;
- no new adverse RKLB or ASTS filing, financing update, launch/regulatory issue, or broad market shock appears before entry.

The simulation would have required a rerun if:

- RKLB would require an execution price above USD 143.50;
- ASTS would require an execution price above USD 113.50;
- available cash differs from the confirmed USD 888.00;
- fees make the order set unaffordable;
- the user wants fractional shares;
- the broker could not enter good-for-day limit orders;
- new material issuer or market evidence appeared before execution.

Historical validity window: next U.S. regular trading session only, expected 2026-06-02. The window is now treated as expired/no-action for publication and audit purposes because the user confirmed no actual trade was executed.

## Publication Release

This memo is recorded as an expired simulation and no-action historical research note, not a current trading instruction. The user explicitly confirmed no actual trade was executed. Any future account action requires a fresh decision cycle and broker confirmation before repository account records can change.

No raw broker documents, screenshots, account identifiers, order IDs, confirmation numbers, local credential paths, secrets, or private cache payloads were added.

## No Execution Confirmation Exists

No execution confirmation exists for this simulation. Do not update repository account records from this memo. If the user later executes any order in a separate real decision, update account records only after receiving broker/account alias, confirmation ID or equivalent evidence, side, symbol, quantity, average price, fees, currency, trade date, and settlement date.
