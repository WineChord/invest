# Mission-Driven Discovery Lane Review

```yaml
review_date: 2026-05-30
operator: Codex
policy_version: v1.1
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
trigger: User emphasized that every full cycle must ask whether a new discovery lane appeared and that self-evolution and meta-self-improvement should serve the ultimate mission.
related_cycle: meta_self_improvement
related_files:
  - AGENTS.md
  - SPEC.md
  - research/discovery/lanes.yml
  - research/quality-metrics.yml
  - templates/full-operating-cycle.md
  - templates/monthly-decision.md
  - templates/research-engine-run.md
  - templates/meta-self-improvement.md
  - .agents/skills/invest-operating-cycle/SKILL.md
next_review_date: 2026-08-30
```

## Problem Observed

```yaml
problem_type: missed_lane_risk
affected_workflow: full_operating_cycle_and_monthly_decision
evidence: The repository had watchlist and candidate files, but no first-class lane map or validation rule forcing full cycles to ask whether the search space itself changed.
impact_on_mission: A watchlist-centered process can become stale even when each watched company is reviewed carefully, causing the system to miss the kind of new structural bottleneck that can drive multi-decade asymmetric compounding.
impact_on_discovery_lanes: Discovery lanes were implicit in prose rather than durable state.
frequency: recurring_risk
severity: high
```

## Learning Sources Checked

```yaml
external_sources: []
internal_sources:
  - AGENTS.md
  - SPEC.md
  - research/watchlist.csv
  - research/discovery/candidates.csv
  - research/quality-metrics.yml
  - templates/full-operating-cycle.md
  - templates/research-engine-run.md
unavailable_sources: []
```

## Process Hypothesis

```yaml
hypothesis: Adding a validated discovery lane map, requiring lane deltas in full cycles, and adding a dry-run-first universe scan will make future agents less likely to confuse the current watchlist with the full opportunity set.
expected_benefit: Better long-horizon discovery coverage, clearer self-evolution prompts, and a more auditable answer to why a full cycle did or did not find a new lane.
possible_harm: Keyword scans can create noisy false positives, and a lane map can create false completeness if future agents treat it as permanent.
success_signal: Future full cycles report discovery lane changes or no-change reasons, use `unknown_future_bottlenecks` to search outside current categories, and update or retire lanes when evidence warrants it.
rollback_condition: If the lane map creates noise without surfacing useful candidates, simplify the lanes, tighten source families and keywords, or keep the lane review manual while retiring the broad keyword scan.
mission_alignment_check: The change exists only to improve the search for outcomes that can become tens, hundreds, or thousands of times larger while avoiding avoidable ruin.
review_date: 2026-08-30
```

## Premortem

- Future agents might add fashionable lanes without durable source families or plausible public exposure.
- The deterministic keyword scan might surface weak names that waste attention.
- The lane map might become stale and make the process look systematic while narrowing curiosity.
- A new lane could be treated as buy eligibility even though it should only guide raw discovery until primary evidence supports a candidate.

## Change Made

```yaml
agents_rules:
  - Added explicit discovery-lane review and lane-delta duties to full-cycle, monthly-decision, self-evolution, and research-pipeline rules.
spec_sections:
  - Added `research/discovery/lanes.yml` to the data model.
  - Added discovery lane map, new-lane test, and lane health metrics to the research engine.
templates:
  - Added mission anchors and lane-review fields to full-cycle, monthly-decision, research-engine-run, and meta-self-improvement templates.
data_files:
  - Added research/discovery/lanes.yml.
  - Added discovery lane coverage metrics to research/quality-metrics.yml.
source_code:
  - Added scripts/discover-universe.mjs as a dry-run-first SEC listed-issuer keyword scan.
repo_scoped_skills:
  - Updated .agents/skills/invest-operating-cycle/SKILL.md to load the lane map and ask the new-lane question.
dashboard: []
validation:
  - Added discovery lane semantic checks to scripts/check-data.mjs.
cleanup:
  - Updated research/README.md so future agents can find the lane map.
mission_or_lane_map_effect: The mission is now represented in canonical rules, templates, data state, validation, and the repo-scoped skill.
```

## Study Plan

```yaml
next_cycle_to_review: next full operating cycle or monthly decision
metric_or_signal: The cycle should explicitly state whether discovery lanes changed, whether `unknown_future_bottlenecks` produced a concrete lane, and whether the dry-run candidate scan found anything worth primary-source skimming.
decision_quality_question: Did the lane map expand the opportunity set without diluting attention away from the highest-upside candidates?
maintenance_cost_question: Did lane review add useful signal, or did it create repetitive process text and noisy candidate rows?
```

## Outcome Review

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

The change does not weaken:

- no automatic trading;
- broker-confirmation-only account records;
- source freshness and hierarchy;
- auditability;
- clone portability;
- allowed-asset policy;
- multi-decade asymmetric compounding with avoidable-ruin controls;
- repository noise hygiene.

## Repo-Scoped Skill Check

```yaml
new_skill_needed: false
existing_skill_to_update: invest-operating-cycle
skill_path: .agents/skills/invest-operating-cycle/SKILL.md
trigger_change: Full-cycle and monthly-decision triggers now require explicit discovery-lane review.
canonical_files_changed:
  - AGENTS.md
  - SPEC.md
  - templates/full-operating-cycle.md
  - templates/monthly-decision.md
  - templates/research-engine-run.md
validation_or_command_change:
  - npm run discover:universe -- --dry-run
  - npm run check:data
why_not_just_agents_or_spec: The skill helps future agents load the lane map early without duplicating canonical rules.
drift_risk: The skill must stay concise and point back to AGENTS.md, SPEC.md, templates, and committed data.
review_date: 2026-08-30
```
