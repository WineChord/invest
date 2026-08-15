# Agentic Discovery Run Template

Use this template for every material monthly decision, full operating cycle, major discovery update, or watchlist reprioritization where discovery could affect allocation, opportunity cost, lane completeness, or candidate priority.

The artifact should be saved under `research/discovery/runs/YYYY-MM-DD-SCOPE.yml`. It is an audit record for the discovery process, not a raw subagent transcript and not a buy recommendation.

## First-Principles Analysis

Complete the common block before ticker ranking. Start with current primary facts and binding constraints, reconstruct the path from scarcity to shareholder value and portfolio consequence, challenge inherited lane and watchlist assumptions, and state the evidence that would disconfirm the chain.

```yaml
schema_version: 1
run_id:
run_date:
request_type:
policy_version:
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
operator:
validity_window:
linked_decision_or_research_note:
subagent_evidence_packet_path:

first_principles_analysis:
  question_rebuilt_from_basics:
  irreducible_facts:
  binding_constraints:
  causal_chain:
  inherited_assumptions_challenged:
  value_capture_or_mission_link:
  disconfirming_evidence:
  decision_consequence:

source_coverage:
  deterministic_commands:
    - command:
      dry_run: true
      output_path:
      output_sha256:
      retrieved_at:
      profile_coverage_scope:
      profile_coverage_status:
      profile_requested_symbols:
      targeted_scope_acknowledged: false
      targeted_scope_reason:
      candidate_payload_summary:
        returned_candidates:
        omitted_candidates:
        exploratory_unknown_lane_matches:
        suppressed_known_matches:
        recall_diagnostics:
        miss_counts:
      result_summary:
  community_attention:
    scan_command:
    scan_output_path:
    scan_output_sha256:
    triage_command:
    triage_output_path:
    triage_output_sha256:
    previous_scan_status:
    top_existing_priority_boosts:
    top_new_primary_source_queue:
    identity_confirmation_queue:
    policy_boundary: analysis_priority_only_not_buy_or_promotion_evidence
  source_families_checked:
    - family_id: primary_filings_regulatory | issuer_material | market_data | current_world_context | new_listings_ipo_spinoff_transactions | lane_evolution_current_world_search
      family:
      sources_or_queries:
      source_ids:
      retrieved_at:
      material_findings:
      unavailable_or_skipped_reason:
  broad_current_world_search:
    status: complete | not_required | blocked
    retrieval_window:
    notes:
  search_quality:
    name_ticker_coverage_pct:
    issuer_profile_semantic_coverage_pct:
    organic_recall_count:
    hard_coded_proxy_only_recall_count:
    outside_watchlist_effort_pct:
    new_listing_to_r1_latency_days:
  unknown_future_review:
    exploratory_match_count:
    exploratory_denominator:
    stratified_sample_count:
    stratified_sample_pct:
    unsampled_reason:
    repeated_hit_max_age_days:
    top_clusters:
    sampled_symbols:
    false_positive_patterns:
    lane_decisions:
    disposition:

first_layer_bottleneck_questions:
  what_could_become_scarce:
    facts:
    inferences:
    disconfirming_evidence:
    source_ids:
    investment_implication:
  who_controls_or_removes_scarcity:
    facts:
    inferences:
    disconfirming_evidence:
    source_ids:
    investment_implication:
  who_can_monetize_into_shareholder_value:
    facts:
    inferences:
    disconfirming_evidence:
    source_ids:
    investment_implication:
  public_security_expression:
    facts:
    inferences:
    disconfirming_evidence:
    source_ids:
    investment_implication:
  early_small_misunderstood_or_newly_public:
    facts:
    inferences:
    disconfirming_evidence:
    source_ids:
    investment_implication:

subagents:
  required_roles:
    - role:
      reasoning_level: xhigh
      independent_context: true
      completed: true
      skip_reason:
      inputs_used:
      sources_checked:
      facts_verified:
      stale_or_missing_evidence:
      confidence:
      key_findings:
      conflicts:
  unresolved_conflicts: 0
  conflict_resolution:

lane_delta:
  lanes_added:
  lanes_revised:
  lanes_demoted_or_retired:
  unknown_future_bottlenecks_result:
  no_change_reason:

candidate_delta:
  candidates_added:
  candidates_rejected_or_archived:
  candidates_promoted:
  r0_leads:
  r1_researchable:
  r2_comparable:
  r3_promotion_ready:
  no_action_challenger:
  candidates_incubated:
  false_positive_patterns:

readiness_sprints:
  - symbol:
    material_to_current_allocation:
    readiness_status:
    dashboard_surface_status:
    readiness_path:
    readiness_index_record:
    blocker_type:
    reachable_evidence_remaining:
    final_classification:

quality_gate_implication:
  decision_readiness_status:
  can_recommend_buys:
  reason:
```

Allowed subagent skip reasons are `tool_unavailable`, `not_material_to_request`, or `already_resolved_by_primary_evidence`. Do not use time pressure, convenience, or omitted context as a skip reason for a buy recommendation.

For every saved deterministic JSON output, record `output_sha256` from the saved file. For issuer-profile discovery outputs, also record `profile_coverage_scope`, `profile_coverage_status`, and `profile_requested_symbols` from the saved JSON output. Partial issuer-profile scans must set `targeted_scope_acknowledged: true` with a concrete `targeted_scope_reason`, but they remain targeted evidence and must not satisfy broad `coverage.universe_scan_as_of` freshness. Only outputs with zero gap, full coverage ratio, matching selected/profile/eligible counts, and eligible-universe counts tied to the current SEC input may be treated as `complete` universe evidence. Broad universe freshness must not have unresolved known public proxy recall misses. If any deterministic output surfaces `exploratory_matches`, fill `unknown_future_review` so the open-ended lane cannot silently become passive.

Discovery is not complete when the artifact merely names candidates. Plausible candidates that could affect allocation must link to a readiness sprint and `research/discovery/candidate-readiness.yml` record. The quality gate should not be left not ready as a final state; keep iterating until the sprint is completed, incubated with dashboard-facing coverage, rejected from evidence, archived from evidence, externally blocked, not tradable, or explicitly not material to the current allocation.
