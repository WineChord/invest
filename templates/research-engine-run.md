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

## First-Principles Analysis

Complete this before preserving or changing prior theses, statuses, rankings, valuation states, or lanes. Start from current primary evidence and confirmed account facts. For company or security work, carry the causal chain through dilution-adjusted per-share value and feasible portfolio impact.

```yaml
first_principles_analysis:
  question_rebuilt_from_basics:
  irreducible_facts:
  binding_constraints:
  causal_chain:
  inherited_assumptions_challenged:
  value_capture_or_mission_link:
  disconfirming_evidence:
  decision_consequence:
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
name_ticker_universe_coverage:
organic_recall:
hard_coded_proxy_only_recall:
outside_watchlist_effort_pct:
exploratory_sample_coverage_pct:
repeated_hit_max_age_days:
new_listing_to_r1_latency_days:
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
semantic_review_packet:
semantic_classifier_version:
semantic_batch_cache_status:
community_scan:
  command:
  output_path:
  output_sha256:
  retrieved_at:
  source_status_counts:
community_triage:
  command:
  output_path:
  output_sha256:
  previous_scan_status:
  high_priority_leads:
  medium_priority_leads:
  top_existing_priority_boosts:
  top_new_primary_source_queue:
  identity_confirmation_queue:
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
r0_lead_count:
r1_researchable_count:
r2_comparable_count:
r3_promotion_ready_count:
bounded_discovery_debt:
```

Do not deep-research every symbol found in the scan. Explain which theme filters and quick rejection criteria were used before any company entered the deep-dive queue. Serious discovery must answer the first-layer bottleneck questions before ticker lists become important. For candidates that could affect allocation, opportunity cost, lane completeness, or watchlist priority, do not stop at a shallow raw-candidate label. Run a readiness sprint and gather public market data, security metadata, primary filings, issuer reports, industry context, material filing review, valuation state, same-lane peer comparison, and dashboard-facing research coverage when available before concluding that the candidate is not buy-ready.

Use cache-aware coarse-to-fine discovery when the universe is large. Reuse source-backed unchanged issuer packets, filing extracts, semantic classifications, and prior rejection/incubation reasons when their hashes, dates, scope, classifier version, and invalidation rules remain valid. Refresh or invalidate caches for new filings, new listings, changed lane maps, classifier-logic changes, market-cap or price dislocations, financing/dilution updates, contracts, regulator actions, or any candidate that could affect allocation. Use low-reasoning batched or heuristic classification for broad semantic coverage, medium reasoning for lane comparison and false-positive rejection, and xhigh only for material readiness, promotion, valuation, allocation, or unresolved conflict. Large work-order artifacts such as complete-universe SEC issuer profiles, semantic issuer packets, semantic batch JSON, batch prompts, smoke artifacts, and validation artifacts must stay under ignored `research/cache/discovery/`; the committed run should keep only durable summaries, hashes, source metadata, review packets, and classification cache records that remain reviewable.

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
target_readiness:
opportunity_set_sufficiency:
repository_health:
bounded_discovery_debt:
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
mission_accountability:
  liquidity_option_weight_pct:
  high_liquidity_option_since:
  latest_confirmed_return_seeking_buy_date:
  latest_mission_relevant_deployment_date:
  days_since_latest_mission_relevant_deployment:
  status:
  strongest_counterfactual:
  smallest_prudent_exposure_considered:
  zero_vs_starter_result:
  cash_opportunity_cost:
  next_evidence_deadline:
  article1_red_team_status:
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

Report target readiness, opportunity-set sufficiency, bounded discovery debt, and repository health separately.

Do not call a target unready merely because unrelated repository work remains. Gather or bound every publicly reachable gap that can change the target or opportunity-cost ranking. R0-R2 candidates may remain open under a dated service-level agreement with stage-adjusted evidence, next source, due date, waiting cost, false-negative warning, and reopen-or-reject trigger. Only R3 requires promotion-grade and dashboard-equivalent completeness.

Repository health must still be reported and improved, but process debt is not a no-action reason. When confirmed deployable liquidity exists, complete the Article 1 offensive challenge before finalizing zero exposure.

## Repository Updates

List the files changed by this run.

## Cleanup

Record stale, duplicated, or misleading material removed, demoted, archived, or left for a future cleanup pass.
