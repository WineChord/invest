# Meta-Self-Improvement Template

Use this when improving the repository's process, not a single company thesis. Examples include methodology upgrades, recurring research defects, missed-candidate or missed-bottleneck postmortems, source-list changes, scoring changes, dashboard workflow changes, automation opportunities, validation gaps, and cleanup rules.

```yaml
review_date:
operator:
policy_version:
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment:
trigger:
related_cycle:
related_files:
next_review_date:
```

## Problem Observed

State what became slow, ambiguous, stale, noisy, fragile, biased, or error-prone. Separate symptoms from root-cause hypotheses.

```yaml
problem_type:
affected_workflow:
evidence:
impact_on_mission:
impact_on_discovery_lanes:
impact_on_bottleneck_map_first_process:
frequency:
severity:
```

## Learning Sources Checked

List external or internal sources used to improve the process. Include publication dates and retrieval dates when the source is important to the change.

```yaml
external_sources:
internal_sources:
unavailable_sources:
```

## Process Hypothesis

State the smallest process change expected to improve future decisions.

```yaml
hypothesis:
expected_benefit:
possible_harm:
success_signal:
rollback_condition:
mission_alignment_check:
review_date:
```

## Premortem

Before changing the process, state how this improvement could fail.

- How could it make decisions slower without improving quality?
- How could it create false confidence?
- How could it overfit the last mistake?
- How could it weaken freshness, auditability, source quality, or mission fit?
- If subagents are involved, how could they duplicate work, hide stale inputs behind apparent consensus, create unresolved conflicts, or add repository noise?

## Change Made

List the durable artifacts changed.

```yaml
agents_rules:
spec_sections:
templates:
data_files:
source_code:
repo_scoped_skills:
dashboard:
validation:
cleanup:
mission_or_lane_map_effect:
subagent_protocol_effect:
```

## Study Plan

Define how the change will be reviewed after future use.

```yaml
next_cycle_to_review:
metric_or_signal:
decision_quality_question:
maintenance_cost_question:
subagent_quality_question:
```

After any cycle using subagents, record whether they improved decision quality enough to justify cost and latency. Narrow or roll back the trigger if they mostly duplicate work, add noise, create false confidence, or fail to catch material evidence gaps.

## Outcome Review

Fill this after the next relevant cycle.

```yaml
reviewed_at:
kept:
revised:
reverted:
evidence:
lesson:
follow_up:
```

## Guardrails

Confirm the change did not weaken:

- no automatic trading;
- broker-confirmation-only account records;
- source freshness and hierarchy;
- auditability;
- clone portability;
- allowed-asset policy;
- multi-decade asymmetric compounding with avoidable-ruin controls;
- repository noise hygiene.

## Repo-Scoped Skill Check

Answer this whenever a process change affects repeated agent behavior.

```yaml
new_skill_needed:
existing_skill_to_update:
skill_path:
trigger_change:
canonical_files_changed:
validation_or_command_change:
why_not_just_agents_or_spec:
drift_risk:
review_date:
```

Create or update a repo-scoped skill only when it improves automatic triggering or workflow navigation. Keep canonical rules in `AGENTS.md`, `SPEC.md`, templates, scripts, and committed data.
