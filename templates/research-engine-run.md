# Research Engine Run Template

Use this template when running the discovery, freshness, valuation, and cleanup loop before a monthly allocation decision or after a major market event.

```yaml
run_date:
operator:
policy_version:
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment:
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
discovery_lanes_reviewed:
sec_filings_window:
company_ir_window:
market_data_window:
news_and_industry_window:
unavailable_sources:
```

## Universe Discovery

Summarize new public candidates, rejected candidates, and candidates that need incubation. Start from the bottleneck map, not from stock names.

```yaml
bottleneck_map_first_review:
themes_scanned:
lane_map_as_of:
new_lanes_considered:
lanes_added_or_revised:
unknown_future_bottlenecks_review:
dry_run_candidate_scan:
universe_sources_checked:
new_candidates_added:
promoted_to_watchlist:
rejected_or_archived:
open_candidate_count:
deep_dive_queue:
```

Do not deep-research every symbol found in the scan. Explain which theme filters and quick rejection criteria were used before any company entered the deep-dive queue.

## Self-Evolution And Priority

Record how the opportunity set changed. This section is required when the run changes or should have considered changing watchlist priority, watchlist status, valuation state, or active research focus.

```yaml
thesis_delta:
entry_delta:
priority_delta:
opportunity_cost_delta:
theme_delta:
lane_delta:
promoted_symbols:
demoted_symbols:
frozen_or_removed_symbols:
new_discovery_lanes:
retired_or_demoted_lanes:
no_change_reason:
```

Explain why the current priority order and discovery lane map still serve the mission, or why they changed. Do not preserve a prior favorite or prior lane map without fresh evidence.

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

## Advisory Subagent Reviews

Use this section when the run is material enough to affect research readiness, discovery lanes, raw candidates, watchlist priority, valuation states, or allocation.

```yaml
evidence_packet_built:
subagents_run:
  - role:
    reasoning_level:
    scope:
    key_findings:
    missing_or_stale_evidence:
    durable_updates_recommended:
subagents_skipped:
  - role:
    reason:
conflicts:
  - issue:
    resolution: accepted | rejected | unresolved
    reason:
unresolved_conflict_effect:
```

Do not save raw subagent transcripts by default. Persist only the reconciled conclusions and durable updates that improve future decisions.

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
active_discovery_lanes:
emerging_discovery_lanes:
open_critical_events:
open_high_events:
stale_valuation_states_over_45_days:
stale_theses_over_90_days:
```

## Meta-Self-Improvement

Record whether this research run exposed a durable process lesson.

```yaml
process_defects_found:
source_gaps:
template_gaps:
automation_opportunities:
validation_gaps:
dashboard_or_data_confusion:
repo_scoped_skill_changes:
subagent_protocol_result:
meta_improvement_record:
next_process_review:
```

Use [meta-self-improvement.md](meta-self-improvement.md) for substantial methodology changes or recurring defects.

## Allocation Readiness

State whether the next monthly decision can proceed. If not, list the missing evidence that must be gathered before recommending buys.

## Repository Updates

List the files changed by this run.

## Cleanup

Record stale, duplicated, or misleading material removed, demoted, archived, or left for a future cleanup pass.
