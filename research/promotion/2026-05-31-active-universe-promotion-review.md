# Active Universe Promotion Review

review_date: 2026-05-31
policy_version: v1.1
scope: active and core status confirmation for the 2026-05-31 monthly decision
source_decision: decisions/2026-05-31-monthly-decision.md
subagent_review_basis: evidence/freshness, bull-case, bear-case, and allocation/risk reviewers from the 2026-05-31 decision cycle

## Purpose

This review creates a durable transition record for the active symbols that were already in core or active status during the 2026-05-31 decision cycle. It is a migration bridge from the earlier watchlist-only model to the explicit promotion and buy-zone model. It should not be treated as a new order instruction.

## Review Result

RKLB and ASTS remained the only `in_buy_zone` symbols for the historical 2026-05-31 proposed first allocation, and only with staged entry limits, broker cash confirmation, and no new adverse issuer event. CRDO remained an `active_core_candidate` for research ranking but did not enter buy-zone because valuation was too demanding. ALAB and VRT remained `active_candidate` names but did not displace RKLB or ASTS.

## Gate Summary

| Symbol | Status result | Buy-zone status | Gate summary |
| --- | --- | --- | --- |
| RKLB | active core confirmed | in buy zone | Mission and evidence pass; entry is acceptable only for staged sizing because valuation and dilution risk remain material. |
| ASTS | active core confirmed | in buy zone | Mission and evidence pass; entry is acceptable only for small staged sizing because execution, launch, regulatory, financing, and dilution risks remain high. |
| CRDO | active core confirmed | not in buy zone | Strong AI interconnect evidence, but entry gate fails for current buying because valuation is too expensive. |
| ALAB | active confirmed | not in buy zone | High-quality AI connectivity exposure, but current valuation and customer concentration prevent buy-zone ranking. |
| VRT | active confirmed | trigger only | Strong infrastructure evidence, but large-cap scale and lower extreme-upside asymmetry keep it below the space core for this account. |

## Agentic Review Coverage

The 2026-05-31 decision used independent advisory review roles for discovery, freshness/filing, bull case, bear case, and allocation/risk. Under the newer promotion model, future status changes should record those roles directly in `research/watchlist-transitions.csv` or a replacement structured promotion index. This bridge review points to the decision note because that is where the reconciled subagent conclusions were recorded.

## Future Promotion Standard

Future movement into `active_candidate`, `active_core_candidate`, or `in_buy_zone` should not rely on this bridge format. Use `templates/promotion-review.md`, record source IDs and xhigh role coverage, update `research/watchlist-transitions.csv`, update `research/buy-zones.csv`, and rerun validation.
