# Full Operating Cycle

Date: 2026-05-31
Policy version: v1.1
Request type: full_operating_cycle and simulated monthly_decision

## Scope

This run powered on the repository operating cycle after the user asked to run the full repository and produce a concrete investment decision. It is recorded as a simulation because the user confirmed no actual buy or sell order was executed. It covered confirmed account state, deterministic market refresh, bottleneck-lane review, universe discovery, freshness monitoring, xhigh advisory review, allocation analysis, meta-self-improvement, cleanup, and validation.

It did not execute trades and did not mutate broker-confirmed account records.

Post-run discovery-gate addendum: the later 2026-05-31 discovery-design hardening made material raw-candidate readiness machine-checkable. `FLY` was then reviewed with publicly reachable SEC, market data, filing-package, valuation, peer, and dashboard-facing records, incubated from evidence, and no longer remains a repository-work blocker. The original order set remains historical and requires a fresh rerun before use.

## Confirmed Account State

Confirmed broker facts remain unchanged:

- Confirmed cash: USD 888.00.
- Settled cash: USD 888.00.
- Buying power: USD 888.00.
- Broker-confirmed security positions: none.
- Confirmed liquidity reserve: none.
- Latest confirmed ledger event: `2026-05-30-deposit-001`.

## Deterministic Refresh

`npm run refresh:market -- --dry-run` checked tradable watchlist market data and found no newer daily close than 2026-05-29 because this run occurred on a Sunday. It would rewrite market data files in dry-run mode only; no files were written by that command.

`npm run discover:universe -- --dry-run` produced raw keyword leads across existing lanes. Most were false positives, ETFs, SPAC-like vehicles, mature suppliers, crypto-adjacent names, or companies that did not directly beat existing watchlist proxies for today's allocation.

`npm run check:data` passed before durable edits.

## Discovery Review

No new discovery lane was added, split, merged, promoted, demoted, or retired. The current lane map still covers the decision-relevant bottlenecks, and `unknown_future_bottlenecks` remains active as the open-ended search lane.

The material discovery update is Firefly Aerospace (`FLY`). It is a direct public space and defense infrastructure lead with Q1 2026 primary-source results and a 2026-05-26 S-1 offering filing. `FLY` was added to `research/discovery/candidates.csv` as a raw candidate, not as a watchlist name and not as a buy candidate.

`FLY` was not ready to replace RKLB or ASTS in the original allocation. The later readiness sprint gathered security metadata, current market data, SEC companyfacts, Q1 results context, recent offering filing context, and same-lane comparison. It classified FLY as incubating, not promoted: direct exposure is real, but rough valuation, material losses, runway and dilution risk, recent selling-holder filings, and shorter public history keep it below RKLB and ASTS for the current allocation.

## Freshness Review

Current SEC submissions were checked for active watchlist symbols and SpaceX. No filing on or after 2026-05-30 was found that blocks a staged RKLB or ASTS order.

Freshness review also checked RKLB and ASTS company-update channels. RKLB had pre-run official updates covering Motiv Space Systems completion and SDA Tranche 3 milestone progress; ASTS had pre-run official updates covering BlueBird shipment and a speed-test milestone. These strengthened or confirmed the existing thesis but did not remove the major valuation, execution, launch, dilution, or commercialization risks.

SpaceX remains not tradable under policy v1.1 until registration is effective, shares trade publicly, a price and valuation exist, and broker eligibility is confirmed.

## Advisory Subagents

Five advisory reviewers ran:

- Discovery-lane and raw-candidate triage: no new lane; add `FLY` as raw candidate; no dry-run lead is buy-ready today.
- Freshness and filing review: no post-run SEC or company event blocks a staged RKLB/ASTS order.
- Bull-case review: favors a two-name RKLB/ASTS starter allocation, with RKLB as execution base and ASTS as convex direct-to-device option.
- Bear-case review: recommends no buy or at most one RKLB share because both RKLB and ASTS are high-multiple names after large runups.
- Allocation/risk review: supports the prior 4 RKLB and 2 ASTS good-for-day limit plan with a USD 87 buffer and no SGOV purchase.

The main conflict was entry discipline. The bear reviewer argued that valuation heat should override mission fit; the bull and allocation reviewers argued that staged sizing and tight limits are acceptable for a first satellite position. The resolved decision keeps a staged buy, does not deploy the full cash balance, gives RKLB the larger weight, limits ASTS to a smaller option-like position, and refuses to chase above the stated limits.

## Self-Evolution And Priority

Thesis delta:

- RKLB: unchanged to slightly strengthened, with execution evidence intact and dilution/valuation risks still active.
- ASTS: unchanged to slightly strengthened, with direct-to-device optionality intact and scaled economics still unproven.
- FLY: incubating raw discovery candidate with research-only dashboard visibility after filing-package, valuation, and peer review; not buy-ready and not an allocation promotion.

Entry delta:

- RKLB and ASTS remain fair, not cheap. The recommendation is staged and price-limited.
- CRDO, ALAB, VRT, and other watch names remain valid comparisons but do not beat the RKLB/ASTS staged first allocation under the mission and current evidence.

Priority delta:

- No active watchlist priority changed.
- `FLY` creates future comparison pressure inside the space infrastructure lane but does not change today's buy list after first-pass readiness review.

## Allocation Readiness

Original run conclusion: the repository was treated as ready to support a staged proposed decision from confirmed cash, subject to broker preview, fees, fractional-share support, current prices, and issuer-event checks.

Current strengthened-gate conclusion: after the FLY readiness sprint, the repository no longer has a material raw-candidate blocker caused by reachable public data left ungathered. The original proposed orders should still be treated as historical, not currently actionable, because live orders require a fresh rerun, broker cash confirmation, current prices, and issuer-event checks.

## Meta-Self-Improvement

The main process lesson is that raw keyword discovery needs a first-pass primary-source triage before the account assumes the lane map is complete. Later same-day process review found that prose rules were not enough: the repository now needs structured agentic discovery artifacts, a candidate-readiness index, and a validation gate so future cycles cannot leave reachable readiness work as a hidden blocker.

The run also reinforces a future process need: add a lightweight macro/credit and high-multiple heat check before decisions dominated by financing-sensitive, high-multiple companies. This was noted but not implemented in this cycle because the current account has only USD 888 cash and the order remains staged.

## Validation

Validation to run after durable edits:

- `npm run check:data`
- `npm run verify`
