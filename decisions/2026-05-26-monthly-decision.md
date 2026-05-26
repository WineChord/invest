# Monthly Decision

Date: 2026-05-26

Policy version: `v1.0`

Status: proposed decision only. No trade was executed, and no account record was updated.

## Account State Used

- Repository confirmed cash: unknown.
- Repository confirmed settled cash: unknown.
- Repository confirmed holdings: none.
- User-stated new deposit for this decision: USD 888.
- Fractional share capability: unknown.
- Assumed commission: USD 0. If the broker charges commissions or fees, reduce the order size and recompute before execution.

Because the user stated that the USD 888 deposit was completed, this decision treats USD 888 as the available cash assumption for proposed orders only. The ledger still requires broker, account alias, confirmation ID, amount, currency, deposit available date, and created date before it can be updated.

## Freshness Report

- U.S. market schedule: May 25, 2026 was Memorial Day, so the latest official daily close available during this review was May 22, 2026.
- Latest official close basis from Stooq, retrieved 2026-05-26: RKLB $135.76, ASTS $105.86.
- Latest pre-market indication from StockAnalysis, retrieved 2026-05-26: RKLB about $143.00 at 5:56 AM EDT, ASTS about $113.07 at 5:59 AM EDT.
- RKLB Q1 2026 10-Q, Q1 release, May 20 equity distribution 8-K, and May 21 Space Force contract were reviewed.
- ASTS Q1 2026 10-Q, Q1 release, and the U.S. mobile-network-operator joint venture update were reviewed.
- Active watchlist names were compared. CRDO, ALAB, and VRT remain high-quality AI infrastructure candidates, but the first deposit should prioritize the account's differentiated space infrastructure objective and avoid duplicating the user's larger Nasdaq technology exposure. NBIS, CRCL, CBRS, BE, IONQ, and LUNR remain watch candidates rather than first-deposit buys. RDW remains research-only.

## Decision

Proposed action: staged first purchase in RKLB and ASTS only, with no sells.

Primary whole-share order plan:

| Side | Symbol | Quantity | Limit price | Max cash use |
| --- | --- | ---: | ---: | ---: |
| Buy | RKLB | 4 | $139.80 | $559.20 |
| Buy | ASTS | 3 | $109.00 | $327.00 |

Maximum total cash use: $886.20.

Estimated cash buffer at the stated limits: $1.80.

If both stocks remain near the 2026-05-26 pre-market indications of about $143.00 for RKLB and $113.07 for ASTS, do not chase these primary limits. In that case, the fallback whole-share plan is:

| Side | Symbol | Quantity | Reference price | Estimated cash use |
| --- | --- | ---: | ---: | ---: |
| Buy | RKLB | 4 | $143.00 | $572.00 |
| Buy | ASTS | 2 | $113.07 | $226.14 |

Estimated total cash use: $798.14.

Estimated cash buffer: $89.86.

Fractional-share alternative:

- Buy about $533 of RKLB.
- Buy about $311 of ASTS.
- Keep about $44 cash.

At the 2026-05-26 pre-market references, this would be approximately 3.73 RKLB shares and 2.75 ASTS shares.

## Rationale

RKLB receives the larger allocation because it has stronger current operating evidence: Q1 revenue grew 63% year over year to $200.3 million, gross margin reached 38.2%, backlog was $2.2 billion, and subsequent evidence included a $90 million U.S. Space Force GEO satellite contract. The May 20 equity distribution agreement creates dilution overhang, so the sizing is staged and price-limited rather than aggressive.

ASTS receives a smaller but meaningful allocation because it has higher direct-to-device optionality. Q1 showed FCC commercial authorization, a planned BlueBird 8-10 launch, BlueBird 11-33 production progress, roughly $3.5 billion of cash, and 2026 revenue guidance of $150 million to $200 million. The company is still pre-scale, capital intensive, and dilution-prone, so it should not receive the full first deposit.

No sells are recommended because there are no confirmed holdings.

## Validity Window

This proposed decision is valid only for 2026-05-26 regular-session trading, only if there is no new company-specific filing, launch failure, financing update, regulatory change, or broad market shock before execution, and only if the broker confirms USD 888 available for trading with no material fees.

Recompute if RKLB trades above $139.80 for the primary order, ASTS trades above $109.00 for the primary order, fractional share availability differs from the assumptions, or the broker cash balance is not exactly USD 888 available for trading.

## Confirmation Needed After Any Execution

Do not update the ledger until the broker-side activity is confirmed with broker, account alias, confirmation ID, side, symbol, quantity, average price, fees, currency, trade date, and settlement date.
