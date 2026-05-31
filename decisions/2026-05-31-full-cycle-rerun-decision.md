# Full-Cycle Rerun Decision

Date: 2026-05-31

Policy version: `v1.1`

Status: proposed decision only. No trade was executed, and no broker-confirmed account record was updated.

## Account State Used

- Confirmed cash: USD 888.00.
- Confirmed settled cash: USD 888.00.
- Confirmed buying power: USD 888.00.
- Confirmed security positions: none.
- Confirmed liquidity reserve value: none.
- Fractional share capability: unknown.
- Fees or commissions: unknown; use the broker order preview before submitting any order.

## Decision Operating Cycle

This rerun used the repository full-cycle and monthly-decision workflows because the user requested a literal full repository run plus concrete proposed orders.

Sources and workflows checked:

- Confirmed account files: `data/account/state.yml`, `data/account/ledger.csv`, and `data/account/positions.csv`.
- Current policy and operating rules: `CONSTITUTION.md`, `AGENTS.md`, `SPEC.md`, and `data/policy/policy-v1.1.md`.
- Deterministic tooling: `npm run refresh:market`, `npm run discover:universe -- --dry-run`, `npm run discover:universe -- --dry-run --limit 20 --json --output research/discovery/runs/2026-05-31-universe-scan.json`, `npm run build:evidence-packet -- --as-of 2026-05-31 --output research/discovery/runs/2026-05-31-subagent-evidence-packet.yml`, and `npm run check:data`.
- Current price basis: committed Yahoo Finance daily closes through 2026-05-29. The run happened on Sunday 2026-05-31, so no newer U.S. regular-session close was available.
- Freshness and filing review: active buy-zone names were checked for post-review filings; watch and research-only names were checked for unreviewed high-severity events.
- Discovery review: deterministic universe scan plus xhigh discovery review confirmed no new lane today. `FLY` remains incubating research-only, and `NNE` is a future nuclear-lane readiness backlog item rather than a current space allocation blocker.
- AI-cycle and market-regime review: AI capex, interconnect, and power/cooling lanes strengthened, but tight valuation and credit conditions argue for staged sizing rather than chasing AI names.

## Subagent Reviews

Six advisory subagents ran:

- Discovery and candidate triage: no lane change; FLY readiness is complete; NNE belongs in a future nuclear readiness backlog.
- Freshness and filing review: RKLB/ASTS staged buys are not blocked, but IREN, OKLO, CRCL, RDW, IONQ, and NBIS required durable freshness updates before the full-cycle state was clean.
- Bull case: supported RKLB as the strongest first starter and ASTS as a smaller convexity position.
- Bear case: recommended no stock buy, or at most one RKLB share, because both RKLB and ASTS are high-multiple, loss-making, financing-sensitive equities.
- Allocation/risk: supported the older 4 RKLB and 2 ASTS limit plan as a maximum staged allocation.
- AI-cycle/market-regime: supported small staged RKLB/ASTS exposure if limits hold, but not CRDO, ALAB, or VRT at current prices.

Main synthesis: the bear-case valuation objection is material. The final proposed order is therefore smaller than the old 4 RKLB and 2 ASTS historical plan.

## Proposed Orders

Use good-for-day limit orders only during the next U.S. regular trading session, expected 2026-06-01. Do not use market orders. Do not chase unfilled orders.

| Side | Symbol | Quantity | Limit price | Max cash use |
| --- | --- | ---: | ---: | ---: |
| Buy | RKLB | 3 | USD 143.50 | USD 430.50 |
| Buy | ASTS | 1 | USD 113.50 | USD 113.50 |

Maximum total cash use: USD 544.00 before fees.

Estimated retained cash before fees: USD 344.00.

At the latest committed closes, estimated cash use would be USD 543.85, leaving USD 344.15 before fees.

No SGOV purchase is recommended in this order set because broker ETF eligibility, commissions, settlement treatment, and fractional handling are still unknown. Holding the residual cash is acceptable under policy `v1.1`.

## Rationale

RKLB receives the larger allocation because it remains the strongest execution-led space infrastructure candidate: current revenue, backlog, liquidity, space-systems execution, and defense contract evidence support the core thesis. The position is capped because the valuation is not cheap, Neutron execution remains ahead, and both the USD 3.0 billion ATM capacity and the 2026-05-29 director Form 144 reinforce dilution and sentiment discipline.

ASTS receives a smaller allocation because it has rarer direct-to-device convexity but materially higher execution, launch, regulatory, production, financing, and dilution risk. A one-share starter keeps exposure without treating the network economics as already proven.

CRDO, ALAB, and VRT are not recommended for this first deployment. AI-cycle evidence strengthened their lanes, but current valuations and concentration/scale risks keep them outside buy-zone.

IREN, OKLO, CRCL, RDW, IONQ, NBIS, FLY, and the remaining watch/research-only names are not recommended. Fresh financing, ATM, token, transaction, acquisition, or readiness reviews either reinforce watch-only status or leave promotion gates unmet.

## Trigger And Invalidation Conditions

Proceed only if:

- the broker still shows at least USD 888.00 available for trading;
- the broker order preview shows total cost including fees within available cash;
- RKLB can be entered at or below USD 143.50;
- ASTS can be entered at or below USD 113.50;
- no new adverse RKLB or ASTS filing, financing update, launch/regulatory issue, or broad market shock appears before entry.

Invalidate and rerun if:

- RKLB would require an execution price above USD 143.50;
- ASTS would require an execution price above USD 113.50;
- available cash differs from the confirmed USD 888.00;
- fees make the order set unaffordable;
- the user wants fractional shares;
- the broker cannot enter good-for-day limit orders;
- new material issuer or market evidence appears before execution.

Validity window: next U.S. regular trading session only, expected 2026-06-01. After that, rerun price and freshness checks.

## Confirmation Needed After Execution

If the user executes any order, update repository account records only after receiving broker/account alias, confirmation ID or equivalent evidence, side, symbol, quantity, average price, fees, currency, trade date, and settlement date.
