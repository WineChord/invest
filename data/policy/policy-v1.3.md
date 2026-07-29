# Policy v1.3

Effective date: 2026-07-29

Supersedes: [policy-v1.2.md](policy-v1.2.md)

Approved proposal: [2026-07-29-policy-v1.3-proposal.md](2026-07-29-policy-v1.3-proposal.md)

Except for the recurring-contribution amendments stated in this policy, every control and implementation detail in [policy-v1.2.md](policy-v1.2.md) continues in full force. This includes the complete position-construction fields, the absence of a universal sizing ladder, liquidity-reserve eligibility and settlement controls, buy, no-action, reserve, and sell recommendation standards, allowed-asset boundaries, publication restrictions, and research requirements. If a condensed section below omits one of those unchanged details, `v1.2` supplies it rather than weakening it.

## Supreme Objective

Build and maintain a long-term satellite portfolio that pursues asymmetric multi-decade returns. The account should pursue outcomes that can plausibly become tens, hundreds, or thousands of times larger over a very long horizon, while avoiding avoidable ruin, hidden leverage, unverified records, and process drift.

Article 1 of [CONSTITUTION.md](../../CONSTITUTION.md) controls every lower-level rule. Cash discipline, evidence gates, position sizing, discovery breadth, workflow completeness, validation, and public release exist to improve the probability of achieving the mission. They are not independent objectives.

Every application of this policy begins with an Article 1 preflight and ends with an Article 1 postflight. The preflight identifies how the decision or maintenance work serves asymmetric compounding or preserves a necessary mission boundary. The postflight checks that the result did not turn a lower-level rule into an independent objective. A conflicting lower-level artifact must yield and be revised; narrow maintenance remains proportional and does not trigger a full decision cycle by itself.

Truth, source freshness, auditability, clone portability, human trade execution, public-release safety, broker-evidence priority, and protection against avoidable permanent impairment remain binding because they protect the mission.

## Recurring Contribution

The default contribution is USD 888 every Friday in `Asia/Shanghai`.

The account owner's standing authorization recorded in `data/account/plan.yml` confirms each fixed contribution once its scheduled date arrives. The first new occurrence is 2026-07-31. No occurrence before that date may be inferred or backfilled from this policy.

The standing authorization:

- applies only to the fixed USD 888 deposit for the named broker and account alias;
- is revocable and may be paused before a future occurrence;
- does not require a separate confirmation for each occurrence;
- confirms that exact deposit as deposited, settled, and available for trading, but does not confirm a trade, position, fee, unrelated balance adjustment, cost basis, tax lot, broker reconciliation, or any other account fact;
- never advances the broker-reconciliation timestamp;
- yields to later broker evidence.

Each due occurrence is a separate append-only ledger event. A missed scheduled run catches up each due Friday separately rather than combining deposits. One run applies at most the earliest eight missing events and reports the remaining dates for a later run; it never skips or merges them. The application must be idempotent, crash-recoverable across account files, and fail closed on ambiguity or state drift.

If broker evidence later contradicts a recorded occurrence, preserve the original event, append a machine-linked correction, and pause future automatic occurrences in the same recoverable account transaction until the conflict is resolved. Calendar time without the active versioned standing authorization is not account confirmation.

## Capital Deployment

Weekly contributions do not need to be fully deployed. Calendar time and confirmed cash alone do not create a stock order. A decision may recommend no trade, holding cash, parking idle cash in an approved liquidity reserve, or buying fewer shares than available cash could afford.

Cash and an approved liquidity reserve are temporary option value, not target allocations or success metrics. Define `liquidity_option_weight` as confirmed cash plus the latest reliable confirmed liquidity-reserve market value, divided by the latest reliable research NAV. When this weight is at least 60%, the following periods since the latest mission-relevant deployment trigger escalating Article 1 reviews:

- 45 days: mission-pressure review of gate design, top candidates, uncertainty classification, executable entry conditions, and position construction;
- 90 days: opportunity-set reset covering new bottleneck lanes, newly public companies, ignored or rejected candidates, valuation assumptions, and same-lane opportunity cost;
- 180 days: strategy-feasibility review asking whether the current public-equity universe, allowed assets, research method, and sizing architecture can plausibly satisfy the mission.

These thresholds trigger research and policy review, not a mandatory trade. A purchase still requires target-level mission, evidence, entry, survival, and opportunity-cost support.

A mission-relevant deployment must lower liquidity-option weight by a material amount or establish a source-backed, mission-relevant position with a credible path to scale. A symbolic, activity-seeking, or immaterial purchase does not reset the clock.

Weekly contributions are not position-sizing buckets. When a rare opportunity passes the gates strongly enough, evaluate total confirmed deployable liquidity, including confirmed cash and confirmed SGOV or equivalent reserve value available for sale, after preserving any needed buffer for fees, settlement, taxes, account restrictions, and avoidable-ruin risk.

## Mission, Evidence, and Entry Standard

A return-seeking candidate must show:

- direct ownership, control, enablement, or monetization of a structural bottleneck rather than weak thematic adjacency;
- a dilution-adjusted path to an exceptional long-term outcome from the current enterprise and equity value;
- a feasible position size whose success can make a material difference to the account;
- a credible path from initial exposure to a larger or smaller position as evidence changes;
- sufficient survival capacity to reach the next decision-relevant milestones;
- superiority or complementarity versus current holdings, the best alternative candidates, cash, and the approved liquidity reserve.

Before a buy recommendation, current primary evidence, material filings, valuation, dilution, balance-sheet survival, current price, and opportunity cost must leave enough expected upside for the satellite objective. Scenario analysis must use explicit ranges and include likely financing and dilution.

## Uncertainty Classification

Classify uncertainty before it affects action:

- `decision_critical`: unresolved truth, tradability, survival, permanent-impairment, material filing, capital-structure, or valuation uncertainty that prevents a bounded decision and can block a purchase;
- `sizing`: ordinary execution, adoption, timing, customer, margin, or scaling uncertainty that remains after current evidence is reviewed and should be tested through size, staging, tighter triggers, or shorter validity;
- `process_debt`: unrelated dashboard, formatting, low-priority candidate, or repository-completeness work that remains visible and time-bounded but cannot veto a decision-ready target.

Missing publicly reachable evidence must be gathered during the powered-on decision cycle when it can change the result. A generic statement that research is incomplete is not a valid no-buy reason.

## Target Readiness and Position Construction

Allocation readiness requires both current target readiness and a sufficient comparison against holdings, cash or reserve, same-lane alternatives, and the highest-priority cross-lane candidates. Unrelated repository health is not an investment veto.

Concentration is allowed when it serves the mission and avoidable permanent impairment remains bounded. Every proposed return-seeking position must state initial and fully underwritten ranges, maximum tolerable account impairment, downside through exceptional portfolio outcomes, evidence milestones for scaling, and evidence or price changes that require holding, reducing, or abandoning the position.

Staging is preferred when uncertainty is material but bounded. A starter is bounded-uncertainty optionality, not an evidence-acquisition mechanism or a substitute for a credible path to mission-relevant size.

## Allowed Assets and Liquidity Reserve

Default return-seeking account actions remain U.S.-listed common stocks and ADRs with public disclosures and normal retail liquidity.

SGOV or a materially equivalent short-duration U.S. Treasury ETF or Treasury money-market vehicle may be used only as a liquidity reserve and cash-management instrument. It is not a return-seeking satellite allocation and not cash. Confirmed reserve buys and sells remain broker-confirmed ledger events.

Excluded unless a later approved policy says otherwise:

- options;
- margin;
- leveraged or inverse ETFs;
- short selling;
- crypto tokens;
- private-company secondary shares;
- OTC securities;
- non-U.S.-listed instruments;
- broad funds that duplicate the account owner's core Nasdaq technology exposure;
- bond funds used as yield-seeking or duration-seeking investments rather than liquidity reserves.

## Decision Standard

A return-seeking buy recommendation needs fresh price data, a fresh primary-source company check, target readiness, opportunity-set sufficiency, total confirmed deployable liquidity, a dilution-adjusted exceptional-outcome path, portfolio-impact analysis, classified uncertainty, exact proposed quantity, triggers, invalidation conditions, and a validity window.

A no-action decision needs the strongest counterfactual candidate, the smallest mission-consistent staged exposure considered, concrete decision-critical blockers, why size cannot bound them, cash opportunity cost, conjunctive evidence-and-price re-underwriting triggers, mission-accountability status, and a dated next evidence deadline.

The weekly contribution cadence never creates a weekly trading quota. A return-seeking buy, reserve transaction, reduction, or sale remains a separate decision and is never executed by the repository.

## Record Standard

Recommendations do not update account records. Broker-confirmed activity updates account records, except for the narrow fixed deposit occurrences covered by the active versioned account-owner standing authorization.

Deposits, reserve buys and sells, common-stock buys and sells, dividends, distributions, fees, and corrections remain append-only ledger events. The standing authorization cannot be used to infer or mutate any event type other than its exact recurring deposit.

Corrections are separate events. Broker evidence overrides standing authorization. Public records use normalized and redacted fields; raw broker documents, screenshots, statements, account numbers, full order IDs, and full confirmation numbers are prohibited.

## Publication and Research Standard

Public transparency remains governed by [PUBLICATION_POLICY.md](../../PUBLICATION_POLICY.md). Public content must be delayed, non-personalized, uncompensated, and framed as the account owner's historical research process or account audit trail.

No proposed order, exact share count, exact dollar order, live target weight, live scale ladder, reserve-sale instruction, broker order preview, same-day trade intent, or confirmed same-day execution detail may be committed, pushed, published, or deployed until the public release embargo has expired.

Primary sources are preferred. Historical repository research is memory, not proof that facts remain current. Critical decisions should separate discovery, freshness, bull-case, bear-case, valuation, and allocation-risk review.
