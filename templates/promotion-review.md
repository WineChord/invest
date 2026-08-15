# Promotion Review Template

Use this template when a symbol may move from raw discovery, `research_only`, `watch`, or `active_candidate` into a higher status, especially `active_candidate`, `active_core_candidate`, or buy-zone consideration. Save completed reviews under `research/promotion/YYYY-MM-DD-SYMBOL-promotion.md` when the promotion changes durable watchlist status, priority, allocation ranking, or buy eligibility.

This is the escalation template, not the normal per-symbol monthly review. Every full operating cycle and monthly decision first writes the lightweight current-cycle result to `research/watchlist-cycle-reviews.csv` for every non-removed watchlist row. Use this promotion review only when that cycle review or a fast-path event could change active/core status, priority, allocation ranking, or buy-zone eligibility.

```yaml
symbol:
company:
review_date:
policy_version:
current_status:
proposed_status: watch | active_candidate | active_core_candidate | no_change | demote | freeze | remove
current_priority:
proposed_priority:
promotion_type: discovery_to_watch | research_only_to_watch | watch_to_active | active_to_core | core_to_buy_zone | demotion_or_freeze
trigger_type: thesis_strengthening | entry_dislocation | material_event | filing_update | contract_or_regulatory_event | competitor_weakening | lane_reprioritization | opportunity_cost_change | periodic_review
trigger_source_ids:
retrieval_window:
validity_window:
```

## First-Principles Analysis

Complete this before inheriting the current status, priority, peer set, valuation, or promotion narrative. Start from current primary evidence and binding constraints. Carry the causal chain through dilution-adjusted per-share value and feasible portfolio impact before changing status or buy-zone eligibility.

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

## Promotion Thesis

State the actual reason to promote before discussing order sizing.

```yaml
scarcity_or_bottleneck:
direct_control_or_monetization:
why_now:
what_changed_since_last_review:
why_existing_status_is_no_longer_enough:
same_lane_peers_compared:
opportunity_cost_vs_current_core:
research_stage: R0_lead | R1_researchable | R2_comparable | R3_promotion_ready
stage_adjusted_evidence:
cost_of_waiting:
false_negative_early_warning:
```

## Evidence Gates

```yaml
mission_gate:
  result: pass | fail | uncertain
  evidence:
evidence_gate:
  result: pass | fail | uncertain
  primary_sources:
  material_filings_reviewed:
  source_conflicts:
entry_gate:
  result: pass | fail | uncertain
  price_as_of:
  valuation_state:
  price_attractiveness:
  dilution_or_balance_sheet_state:
  expected_return_setup:
survival_gate:
  result: pass | fail | uncertain
  runway:
  debt_and_refinancing:
  customer_or_contract_quality:
mission_impact_gate:
  result: pass | fail | uncertain
  initial_weight_range_pct:
  fully_underwritten_weight_range_pct:
  adverse_permanent_impairment_pct:
  max_nav_impairment_pct:
  downside_portfolio_result:
  base_portfolio_result:
  upside_portfolio_result:
  exceptional_portfolio_result:
  contribution_dilution_check:
uncertainty_classification:
  decision_critical:
  sizing:
  process_debt:
```

## Required Xhigh Reviews

Use independent fresh-context xhigh subagents whenever the promotion could affect allocation, active status, core status, or buy-zone ranking. Keep them read-only unless a narrow write scope is assigned.

```yaml
evidence_freshness_reviewer:
  completed:
  key_findings:
valuation_entry_reviewer:
  completed:
  key_findings:
bull_case_reviewer:
  completed:
  key_findings:
bear_case_reviewer:
  completed:
  key_findings:
opportunity_cost_and_allocation_reviewer:
  completed:
  key_findings:
process_or_source_quality_reviewer:
  completed:
  key_findings:
unresolved_conflicts:
conflict_resolution:
```

## Status Decision

```yaml
final_status:
final_priority:
buy_zone_status: in_buy_zone | not_in_buy_zone | trigger_only | no_buy_until_new_evidence
buy_zone_reason:
ranking_vs_current_core:
candidate_to_displace_or_reduce:
cash_or_reserve_comparison:
zero_vs_smallest_staged_exposure:
current_stage:
scale_milestones:
hold_milestones:
reduce_or_exit_milestones:
stage_review_by:
kill_criteria:
next_review_trigger:
conditions_to_promote_further:
conditions_to_demote:
durable_updates:
  watchlist:
  valuation_state:
  freshness_events:
  filing_reviews:
  company_analysis:
  discovery_candidate:
  quality_metrics:
```

## Fast-Path Rule

If the trigger is a material event or price dislocation, do not wait for the next monthly cycle. Run this promotion review during the current powered-on session or the next approved monitoring wakeup, refresh market and primary-source evidence, and then either promote, reject, incubate, or explicitly record why the event is immaterial.

Fast-path promotion still cannot execute trades. It may only update research state and, when the user asked for an allocation decision, produce proposed orders subject to broker confirmation and final user action.
