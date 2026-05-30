# Investment Constitution Review

```yaml
review_date: 2026-05-30
operator: Codex
policy_version: v1.1
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment: Added a concise constitutional anchor to keep future workflows focused on the mission without turning the repository into legal prose.
trigger: User asked whether the repository should have a constitution-like Markdown file while preserving readability.
related_cycle: meta_self_improvement
related_files:
  - CONSTITUTION.md
  - AGENTS.md
  - SPEC.md
  - README.md
  - scripts/check-data.mjs
  - templates/full-operating-cycle.md
  - templates/monthly-decision.md
  - templates/research-engine-run.md
  - templates/meta-self-improvement.md
next_review_date: 2026-08-30
```

## Problem Observed

```yaml
problem_type: mission_anchor_readability_tradeoff
affected_workflow: all_research_and_decision_workflows
evidence: The mission was already repeated in several places, but there was no short single file that future agents and humans could read first as the highest-order decision anchor.
impact_on_mission: Without a compact anchor, detailed workflow files can drift into checklist execution instead of mission-driven judgment. Overdoing the anchor in legal language would make it harder to read and easier to ignore.
impact_on_discovery_lanes: The constitution reinforces bottleneck-map-first discovery as a top-level principle.
impact_on_bottleneck_map_first_process: The constitution frames stock lists as outputs of bottleneck review, not the discovery starting point.
frequency: recurring_risk
severity: medium
```

## Process Hypothesis

```yaml
hypothesis: A short, plain-language constitution will improve future alignment by giving agents and humans a fast way to resolve process conflicts against the mission.
expected_benefit: Stronger mission anchoring, fewer stale-watchlist decisions, clearer guardrails against avoidable ruin, and less temptation to add process ceremony that does not improve decision quality.
possible_harm: If treated as a legal document, it could become verbose or overly rigid.
success_signal: Future serious runs cite constitutional alignment briefly and use it to simplify or improve lower-level workflows when they drift.
rollback_condition: If the constitution becomes repetitive or legalistic, shorten it back to a one-page mission charter.
mission_alignment_check: The constitution exists only to improve the odds of multi-decade asymmetric compounding while preserving avoidable-ruin controls.
review_date: 2026-08-30
```

## Change Made

```yaml
agents_rules:
  - Added CONSTITUTION.md as the compact constitutional anchor in AGENTS.md.
spec_sections:
  - Added CONSTITUTION.md to purpose and repository layout in SPEC.md.
templates:
  - Added constitutional_alignment fields to high-frequency workflow templates.
data_files: []
source_code:
  - Extended scripts/check-data.mjs to require CONSTITUTION.md and core constitutional phrases.
repo_scoped_skills:
  - Added CONSTITUTION.md to the invest-operating-cycle first-read list.
dashboard: []
validation:
  - npm run verify
cleanup:
  - Kept the constitution plain-language and short instead of converting all docs into legal-style clauses.
mission_or_lane_map_effect: The mission now has one concise source of highest-order interpretation while detailed operational rules remain readable.
```

## Study Plan

```yaml
next_cycle_to_review: next full operating cycle or monthly decision
metric_or_signal: The cycle should include a short constitutional_alignment note without bloating the final decision.
decision_quality_question: Did the constitution help resolve a real tradeoff between opportunity seeking, evidence quality, and avoidable-ruin controls?
maintenance_cost_question: Does the constitution remain short enough that future agents actually read it first?
```
