# 2026-08-01 Cadence and Audit-Integrity Review

Policy version: `v1.3`

Review date: 2026-08-01

This review covers the first-Saturday cadence check, the monthly research-engine review, and defects observed during the current full operating cycle.

## Article 1 conclusion

Keep the current weekday opportunity sentinel plus Saturday full-cycle cadence. It is frequent enough to detect material filings and price dislocations while concentrating expensive full-universe judgment into one predictable weekly cycle. Increasing the scheduled full-cycle frequency would add repeated zero decisions, source duplication, and compute cost without improving the probability of finding or funding a rare qualifying opportunity.

The cadence is not a license to wait. A weekday event must escalate to a full decision when it can change a holding, promotion, buy zone, top-five opportunity-cost ordering, or Article 1 conclusion. GILT, LEU and IONQ now share a hard 2026-08-05 adjudication; the current zero decision cannot roll forward after that evidence without a fresh comparison against mission-relevant staged exposure.

## Findings

### What worked

- The deterministic Friday contribution was already present and was not duplicated.
- The full 2026-07-31 completed-close universe and the latest SEC submissions delta exposed the relevant IONQ, ETN, RKLB, ENRD and IMSR changes.
- Independent bull and bear reviews forced a quantified starter-versus-zero comparison. The decision is therefore a short information wait, not generic risk aversion.
- The bottleneck-first scan dispositioned every returned candidate and created no low-evidence promotion.

### What failed or drifted

- Historical operating artifacts used `confirmed_ledger_event_ids` ambiguously. Some no-new-execution runs referenced the latest old account event, while the operating-run row represented current-run events. That could make an old deposit look newly confirmed.
- The pre-review evidence packet captured the prior mission-accountability snapshot before the current full-cycle conclusion. That is acceptable for independent review, but the final packet must be rebuilt after canonical records are updated.
- Filing discovery still lacks one machine-enforced row-per-accession disposition surface. The manual review found all twelve current deltas, but a future cycle should be able to prove that every material accession was classified.
- The initial opportunity-cost queue underweighted IONQ because the acquisition close arrived after the prior valuation state. The current valuation, review and decision now place IONQ fifth.

## Durable changes

- `confirmed_ledger_event_ids` now means only account events newly confirmed or applied by the current run. The structured run artifact and the operating-run index must contain the same exact set.
- Data validation now rejects unknown ledger IDs and rejects any mismatch between a structured run artifact and its operating-run index row.
- Position-construction records now exist for GILT, LEU, MDA, IREN and IONQ. They use public-safe analytical ranges, portfolio-impairment bounds and evidence milestones rather than unexpired exact share counts or live target weights.
- The top-five opportunity-cost queue is explicitly GILT, LEU, MDA, IREN and IONQ, with CRDO sixth, until new evidence changes it.

## Cadence decision

- Monday through Friday: retain the lightweight opportunity sentinel.
- Saturday: retain the full operating cycle.
- First Saturday of each month: retain the cadence and research-engine review.
- First Saturday of each quarter: retain the deeper bottleneck-lane and strategy-feasibility review.
- Temporary escalation: use only for validated issuer events, material price-plus-evidence dislocations, crisis regimes, stale hard deadlines or a changed top-five ranking. A weekly contribution, broad factor move or desire for more trades is not sufficient.
- De-escalation: after at most two weeks of added Tuesday full cycles or five consecutive crisis full cycles, recalibrate against actual decision changes, detection delay, email noise, runtime and account-level quota observations.

## Next improvement

Add a deterministic accession-disposition register that compares the submissions-delta manifest with durable filing reviews and fails a full cycle when a material accession has no explicit `material`, `immaterial`, `ownership_only`, `duplicate_or_amendment`, or `deferred_with_reason` disposition. The guard must not turn ordinary low-priority filing debt into a portfolio-wide no-buy veto.

No trading authority or broker-fact rule changed.
