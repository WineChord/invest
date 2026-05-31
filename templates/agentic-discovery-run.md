# Agentic Discovery Run Template

Use this template for every material monthly decision, full operating cycle, major discovery update, or watchlist reprioritization where discovery could affect allocation, opportunity cost, lane completeness, or candidate priority.

The artifact should be saved under `research/discovery/runs/YYYY-MM-DD-SCOPE.yml`. It is an audit record for the discovery process, not a raw subagent transcript and not a buy recommendation.

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

source_coverage:
  deterministic_commands:
    - command:
      dry_run: true
      output_path:
      retrieved_at:
      result_summary:
  source_families_checked:
    - family_id: primary_filings_regulatory | issuer_material | market_data | current_world_context
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

Discovery is not complete when the artifact merely names candidates. Plausible candidates that could affect allocation must link to a readiness sprint and `research/discovery/candidate-readiness.yml` record. The quality gate should not be left not ready as a final state; keep iterating until the sprint is completed, incubated with dashboard-facing coverage, rejected from evidence, archived from evidence, externally blocked, not tradable, or explicitly not material to the current allocation.
