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
optional_market_data_providers:
  fmp_api_key_available:
  fmp_mode:
  fmp_daily_call_budget:
  fmp_uncached_calls_used:
  fmp_cache_status:
  fmp_fallbacks:
news_and_industry_window:
cache_inputs_reused:
cache_inputs_invalidated:
semantic_profile_coverage:
unavailable_sources:
```

## Universe Discovery

Summarize new public candidates, rejected candidates, and candidates that need incubation. Start from the bottleneck map, not from stock names.

```yaml
bottleneck_map_first_review:
first_layer_bottleneck_questions:
  what_could_become_scarce:
  who_controls_or_removes_scarcity:
  who_can_monetize_into_shareholder_value:
  public_security_expression:
  early_small_misunderstood_or_newly_public:
themes_scanned:
lane_map_as_of:
new_lanes_considered:
lanes_added_or_revised:
unknown_future_bottlenecks_review:
dry_run_candidate_scan:
coarse_to_fine_semantic_pass:
semantic_packet_artifact:
semantic_batch_manifest:
semantic_classification_import:
semantic_discovery_run:
semantic_batch_cache_status:
cache_only_intermediates:
durable_semantic_summary:
agentic_discovery_subagents:
agentic_discovery_run_path:
subagent_evidence_packet_path:
universe_sources_checked:
new_candidates_added:
promoted_to_watchlist:
rejected_or_archived:
open_candidate_count:
deep_dive_queue:
readiness_sprints:
candidate_readiness_index:
```

Do not deep-research every symbol found in the scan. Explain which theme filters and quick rejection criteria were used before any company entered the deep-dive queue. Serious discovery must answer the first-layer bottleneck questions before ticker lists become important. For candidates that could affect allocation, opportunity cost, lane completeness, or watchlist priority, do not stop at a shallow raw-candidate label. Run a readiness sprint and gather public market data, security metadata, primary filings, issuer reports, industry context, material filing review, valuation state, same-lane peer comparison, and dashboard-facing research coverage when available before concluding that the candidate is not buy-ready.

Use cache-aware coarse-to-fine discovery when the universe is large. Reuse source-backed unchanged issuer packets, filing extracts, semantic classifications, and prior rejection/incubation reasons when their hashes, dates, scope, and invalidation rules remain valid. Refresh or invalidate caches for new filings, new listings, changed lane maps, market-cap or price dislocations, financing/dilution updates, contracts, regulator actions, or any candidate that could affect allocation. Use low-reasoning batched subagents for broad semantic classification, medium reasoning for lane comparison and false-positive rejection, and xhigh only for material readiness, promotion, valuation, allocation, or unresolved conflict. Large work-order artifacts such as complete-universe SEC issuer profiles, semantic issuer packets, semantic batch JSON, batch prompts, smoke artifacts, and validation artifacts must stay under ignored `research/cache/discovery/`; the committed run should keep only durable summaries, hashes, source metadata, and classification cache records that remain reviewable.

For material discovery, save a structured run artifact using [agentic-discovery-run.md](agentic-discovery-run.md). For material raw candidates, save or update [discovery-readiness-sprint.md](discovery-readiness-sprint.md) and `research/discovery/candidate-readiness.yml`.

## Self-Evolution And Priority

Record how the opportunity set changed. This section is required when the run changes or should have considered changing watchlist priority, watchlist status, valuation state, or active research focus.

```yaml
thesis_delta:
entry_delta:
priority_delta:
opportunity_cost_delta:
theme_delta:
lane_delta:
watchlist_cycle_review_path:
watchlist_symbols_reviewed:
watchlist_symbols_missing_current_cycle_review:
promoted_symbols:
demoted_symbols:
frozen_or_removed_symbols:
promotion_reviews:
fast_path_promotion_triggers:
buy_zone_candidates:
symbols_requiring_promotion_review_before_buy:
new_discovery_lanes:
retired_or_demoted_lanes:
no_change_reason:
```

Explain why the current priority order and discovery lane map still serve the mission, or why they changed. Do not preserve a prior favorite or prior lane map without fresh evidence. During a full-cycle or monthly decision run, every non-removed `research/watchlist.csv` symbol must receive a current row in `research/watchlist-cycle-reviews.csv`, including symbols that remain unchanged.

Use [promotion-review.md](promotion-review.md) before moving a symbol into `active_candidate`, `active_core_candidate`, or buy-zone consideration from a lower status. A promotion review should be full agentic when the change can affect allocation: build a bounded evidence packet, use independent fresh-context xhigh evidence/freshness, valuation/entry, bull-case, bear-case, and opportunity-cost/allocation reviewers, then reconcile conflicts in the main synthesis. Promotion is allowed to be fast when fresh evidence or price action is material; speed means running the review immediately, not skipping gates.

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
    cache_or_fresh_input:
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

If a material filing is missing and can be retrieved from public sources, retrieve and review it during the run rather than leaving the candidate blocked by missing repository work.

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
decision_readiness_scope: repository_and_public_observable_information
can_recommend_buys:
decision_readiness_reason:
user_only_execution_prerequisites:
active_symbols_with_current_valuation_state:
active_symbols_missing_valuation_state:
active_symbols_with_latest_filing_review:
active_symbols_missing_latest_filing_review:
watchlist_symbols:
watchlist_symbols_with_current_cycle_review:
watchlist_symbols_missing_current_cycle_review:
active_discovery_lanes:
emerging_discovery_lanes:
open_critical_events:
open_high_events:
stale_valuation_states_over_45_days:
stale_theses_over_90_days:
latest_discovery_run_path:
latest_watchlist_cycle_review_path:
open_candidates_without_readiness_sprint:
material_open_candidates_blocking_allocation:
unresolved_subagent_conflicts:
unresolved_watchlist_review_conflicts:
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

State whether the next monthly decision can proceed from repository and public-observable evidence. The current durable state should be `ready`; if it is not, continue the research run rather than ending with a missing-evidence list.

Do not call a candidate or decision not ready merely because the repository has not yet gathered data that is publicly reachable during the run. Either gather it, mark it genuinely unavailable or user-only, or reject/incubate the candidate based on analyzed evidence.

Do not leave the decision not ready when a material open candidate still has reachable repository work outstanding. That state should fail validation until `research/discovery/candidate-readiness.yml` and `research/quality-metrics.yml` are updated to a ready, evidence-based conclusion. If the conclusion is incubate rather than reject or not-material, the candidate also needs research-only dashboard visibility and the same supporting market, filing, valuation, and company-analysis surfaces as other public stocks.

## Repository Updates

List the files changed by this run.

## Cleanup

Record stale, duplicated, or misleading material removed, demoted, archived, or left for a future cleanup pass.
