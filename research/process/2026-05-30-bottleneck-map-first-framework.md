# Bottleneck-Map-First Framework Review

```yaml
review_date: 2026-05-30
operator: Codex
policy_version: v1.1
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
trigger: User emphasized that the bottleneck-map-first framework is central and should be strongly reinforced across the repository.
related_cycle: meta_self_improvement
related_files:
  - AGENTS.md
  - SPEC.md
  - README.md
  - research/discovery/lanes.yml
  - templates/bottleneck-lane-review.md
  - templates/full-operating-cycle.md
  - templates/monthly-decision.md
  - templates/research-engine-run.md
  - scripts/discover-universe.mjs
next_review_date: 2026-08-30
```

## Problem Observed

```yaml
problem_type: framework_anchor_risk
affected_workflow: discovery_and_monthly_decision
evidence: The repository had a lane map, but future agents could still treat it as a supporting file and start from the watchlist or a generic stock screen.
impact_on_mission: The real 100x-plus opportunities are more likely to emerge from a structural bottleneck becoming unexpectedly important than from a conventional financial screen. Starting from stocks risks missing the reason the stock could matter.
impact_on_discovery_lanes: Lane review needed a dedicated template and stronger validation as a first-class step.
impact_on_bottleneck_map_first_process: The process needed explicit "stocks are outputs, not inputs" language.
frequency: recurring_risk
severity: high
```

## Process Hypothesis

```yaml
hypothesis: Making bottleneck-map-first a named, validated framework with a dedicated template will make future cycles more likely to discover new lanes before anchoring on existing stocks.
expected_benefit: Better search discipline, fewer stale-watchlist decisions, and a clearer path from structural bottleneck to public-company candidate.
possible_harm: The template could become repetitive if agents fill it mechanically without real source checks.
success_signal: Future full cycles and monthly decisions explicitly report bottleneck questions, new-lane/no-change reasoning, direct beneficiaries, weak proxies, and candidates that deserve primary-source skims.
rollback_condition: If the template creates noise without better candidate discovery, collapse it back into the research-engine template while keeping the bottleneck-map-first rule.
mission_alignment_check: The framework exists to improve the odds of finding outcomes that can become tens, hundreds, or thousands of times larger while avoiding avoidable ruin.
review_date: 2026-08-30
```

## Change Made

```yaml
agents_rules:
  - Added bottleneck-map-first as the primary discovery frame.
  - Required full-cycle and monthly-decision runs to start from bottlenecks before stocks.
spec_sections:
  - Added bottleneck-map-first framing to Purpose, Research Engine, and Universe Discovery.
templates:
  - Added templates/bottleneck-lane-review.md.
  - Wired the framework into full-operating-cycle, monthly-decision, research-engine-run, meta-self-improvement, and company-research-card templates.
data_files:
  - Added framework_name and framework_questions to research/discovery/lanes.yml.
source_code:
  - Made scripts/discover-universe.mjs state that it is a bottleneck-map-first dry run.
repo_scoped_skills:
  - Updated invest-operating-cycle skill to load the bottleneck review template and reject stock-list-first discovery.
dashboard: []
validation:
  - Extended scripts/check-data.mjs to require framework_name and framework_questions in the lane map.
cleanup:
  - Replaced README language that implied watchlist-first expansion.
mission_or_lane_map_effect: Bottleneck-map-first is now present in canonical docs, templates, lane state, validation, and the repo-scoped skill.
```

## Study Plan

```yaml
next_cycle_to_review: next full operating cycle or monthly decision
metric_or_signal: The run should begin with bottleneck questions before naming stocks and should explicitly classify direct beneficiaries versus weak proxies.
decision_quality_question: Did starting from bottlenecks surface any candidate, lane, or rejection that a stock-list-first process would likely miss?
maintenance_cost_question: Did the dedicated template improve thinking enough to justify the extra step?
```

## Guardrails

This change does not weaken:

- no automatic trading;
- broker-confirmation-only account records;
- source freshness and hierarchy;
- auditability;
- clone portability;
- allowed-asset policy;
- multi-decade asymmetric compounding with avoidable-ruin controls;
- repository noise hygiene.
