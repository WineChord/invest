# Research Engine Run Template

Use this template when running the discovery, freshness, valuation, and cleanup loop before a monthly allocation decision or after a major market event.

```yaml
run_date:
operator:
policy_version:
run_type: monthly
previous_run:
market_data_as_of:
```

## Executive Summary

State what changed, what did not change, and whether the system is ready for an allocation decision.

## Source Coverage

Record the source families checked and the exact retrieval window.

```yaml
listed_universe_sources:
sec_filings_window:
company_ir_window:
market_data_window:
news_and_industry_window:
unavailable_sources:
```

## Universe Discovery

Summarize new public candidates, rejected candidates, and candidates that need incubation.

```yaml
themes_scanned:
universe_sources_checked:
new_candidates_added:
promoted_to_watchlist:
rejected_or_archived:
open_candidate_count:
deep_dive_queue:
```

Do not deep-research every symbol found in the scan. Explain which theme filters and quick rejection criteria were used before any company entered the deep-dive queue.

## Freshness Monitor

List material events found since the previous run and whether each event is reviewed.

```yaml
critical_events_open:
high_events_open:
filings_requiring_review:
financing_or_dilution_events:
price_dislocations:
regulatory_or_contract_events:
```

## Filing Reviews

For each material filing, either link to a completed filing review or explain why the filing is immaterial to the current allocation decision.

## Valuation and Entry States

For every active candidate and current holding, record whether the valuation state is current, stale, or updated in this run.

```yaml
symbols_updated:
symbols_stale:
attractive_or_dislocated_setups:
good_company_but_not_buyable:
cheap_but_thesis_uncertain:
```

## Research Quality Metrics

Update or cite `research/quality-metrics.yml`.

```yaml
decision_readiness_status:
can_recommend_buys:
decision_readiness_reason:
active_symbols_with_current_valuation_state:
active_symbols_missing_valuation_state:
active_symbols_with_latest_filing_review:
active_symbols_missing_latest_filing_review:
open_critical_events:
open_high_events:
stale_valuation_states_over_45_days:
stale_theses_over_90_days:
```

## Allocation Readiness

State whether the next monthly decision can proceed. If not, list the missing evidence that must be gathered before recommending buys.

## Repository Updates

List the files changed by this run.

## Cleanup

Record stale, duplicated, or misleading material removed, demoted, archived, or left for a future cleanup pass.
