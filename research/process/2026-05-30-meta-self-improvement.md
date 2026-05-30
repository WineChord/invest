# Meta-Self-Improvement Baseline

```yaml
review_date: 2026-05-30
operator: Codex
policy_version: v1.1
trigger: User clarified that the repository should improve its own methods, not only its watchlist and decisions.
related_cycle: full_operating_cycle_definition
related_files:
  - AGENTS.md
  - SPEC.md
  - README.md
  - templates/full-operating-cycle.md
  - templates/monthly-decision.md
  - templates/research-engine-run.md
  - templates/meta-self-improvement.md
next_review_date: 2026-08-30
```

## Problem Observed

```yaml
problem_type: process_capability_gap
affected_workflow: research_engine_and_monthly_decision
evidence: The repository had explicit rules for discovery, freshness, valuation, cleanup, and watchlist self-evolution, but it did not clearly require the process itself to be reviewed, tested, and improved after durable lessons.
impact_on_mission: Without meta-self-improvement, the system could keep better records while still using stale methods, weak source coverage, ambiguous templates, or insufficient automation.
frequency: recurring_risk
severity: high
```

The mission requires multi-decade adaptation. That means the repository must notice not only better stocks and better entry points, but also better research methods, better source families, better validation, better dashboards, and better cleanup rules.

## Learning Sources Checked

```yaml
external_sources:
  - title: The Deming Institute PDSA Cycle
    url: https://deming.org/explore/pdsa/
    source_published_at: not listed on page
    retrieved_at: 2026-05-30
    lesson: Treat improvement as a plan-do-study-act learning cycle rather than a one-time rule change.
  - title: NASA Lessons Learned Information System
    url: https://www.nasa.gov/nasa-lessons-learned/
    source_published_at: 2023-07-26
    retrieved_at: 2026-05-30
    lesson: Durable lessons should be captured in a retrievable system so future work can reuse them.
  - title: Gary Klein, Performing a Project Premortem
    url: https://hbr.org/2007/09/performing-a-project-premortem
    source_published_at: 2007-09-01
    retrieved_at: 2026-05-30
    lesson: Before adopting a process change, explicitly ask how it could fail.
  - title: CFA Institute, Improving the Investment Decision Process: Behavioral Alpha
    url: https://rpc.cfainstitute.org/research/multimedia/2018/improving-invest-decision-process-behavioral-alpha
    source_published_at: 2018-07-24
    retrieved_at: 2026-05-30
    lesson: Investment process quality should include bias awareness and structured decision discipline.
  - title: Good Judgment Open FAQ
    url: https://www.gjopen.com/faq
    source_published_at: not listed on page
    retrieved_at: 2026-05-30
    lesson: Forecasting processes benefit from explicit predictions, later scoring, and calibration feedback.
internal_sources:
  - AGENTS.md
  - SPEC.md
  - templates/full-operating-cycle.md
  - templates/monthly-decision.md
unavailable_sources:
  - Some source pages do not expose stable publication dates; record retrieval date and avoid treating them as market evidence.
```

## Process Hypothesis

```yaml
hypothesis: Adding a mandatory meta-self-improvement loop and template will make future agents more likely to improve sources, templates, scoring, automation, dashboard surfaces, validation, and cleanup when a cycle exposes a durable process defect.
expected_benefit: Better long-run adaptability to new industries, new data sources, process failures, and research bottlenecks.
possible_harm: Extra ceremony could slow simple changes or encourage process bloat.
success_signal: Future full operating cycles explicitly report meta-self-improvement findings and create concise process reviews only when there is a durable lesson.
rollback_condition: If the new loop produces repetitive low-signal process notes or slows decisions without improving quality, simplify it back into the cleanup section.
review_date: 2026-08-30
```

## Premortem

- The loop could become checklist theater if agents always write "no process issues" without actually looking for process defects.
- The template could create too much documentation if every tiny edit becomes a process review.
- A process change could overfit the most recent user concern and make future decisions slower.
- Meta-improvement could accidentally weaken the mission if it optimizes for neatness, benchmark-like coverage, or easy-to-measure metrics instead of rare asymmetric opportunities.

## Change Made

```yaml
agents_rules:
  - Added Meta-Self-Improvement Mandate to AGENTS.md.
  - Added meta-self-improvement to investment decision and full-cycle triggers.
spec_sections:
  - Expanded Research Engine to include meta-self-improvement as a seventh loop.
  - Expanded Self-Evolution Mechanism with an observe-orient-plan-do-study-act style process.
templates:
  - Added templates/meta-self-improvement.md.
  - Updated full-operating-cycle, monthly-decision, and research-engine-run templates.
data_files: []
source_code: []
dashboard: []
validation:
  - npm run verify
cleanup:
  - Added research/process/README.md as the canonical home for durable process reviews.
```

## Study Plan

```yaml
next_cycle_to_review: next full operating cycle or monthly decision after 2026-05-30
metric_or_signal: The decision output should state whether meta-self-improvement found a durable lesson, and should avoid creating process notes when there is no durable lesson.
decision_quality_question: Did the loop improve source coverage, discovery quality, freshness, valuation quality, dashboard clarity, or cleanup discipline?
maintenance_cost_question: Did the loop add useful structure without slowing the decision cycle unnecessarily?
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

The change must not weaken:

- no automatic trading;
- broker-confirmation-only account records;
- source freshness and hierarchy;
- auditability;
- clone portability;
- allowed-asset policy;
- long-term asymmetric mission;
- repository noise hygiene.
