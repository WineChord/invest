# Subagent Protocol Reference

This is the cold-path reference for bounded subagent inputs and minimum reviewer outputs. The mandatory subagent routing, safety boundaries, and conflict-resolution rules live in `AGENTS.md`; material discovery artifacts use `templates/agentic-discovery-run.md`.

Every subagent should receive the same bounded evidence packet when practical:

```yaml
mission:
policy_version:
request_type:
current_date:
freshness_window:
confirmed_account_facts:
planned_but_unconfirmed_cash:
current_positions:
liquidity_reserve_status:
allowed_assets_and_exclusions:
candidate_set:
relevant_files:
fresh_sources:
deterministic_outputs:
open_freshness_events:
valuation_states:
quality_metrics:
specific_question:
safety_boundaries:
first_layer_discovery_questions:
  - what_becomes_scarce:
  - who_controls_or_removes_scarcity:
  - who_can_monetize_into_shareholder_value:
  - public_security_expression:
  - early_small_misunderstood_or_newly_public:
```

Minimum subagent output schema:

```yaml
role:
scope:
reasoning_level:
inputs_used:
sources_checked:
facts_verified:
stale_or_missing_evidence:
primary_source_conflicts:
key_findings:
thesis_delta:
entry_delta:
priority_or_lane_delta:
ruin_or_permanent_impairment_risks:
policy_or_safety_blockers:
recommended_durable_updates:
buy_or_no_buy_implication:
confidence:
conditions_to_change_view:
unresolved_questions:
conflicts_with_other_reviews:
```

For material discovery, do not save raw subagent transcripts by default. Persist the final synthesis, durable research changes, or a concise process review only when the reviews change the decision, evidence state, workflow behavior, or future interpretation.
