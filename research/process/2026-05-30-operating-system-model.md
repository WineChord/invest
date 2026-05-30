# Operating System Model And Skill Evolution Review

```yaml
review_date: 2026-05-30
operator: Codex
policy_version: v1.1
trigger: User clarified that the repository should behave like an operating system powered by agent conversations, and asked whether repo skills should self-evolve.
related_cycle: meta_self_improvement
related_files:
  - AGENTS.md
  - SPEC.md
  - README.md
  - .agents/skills/invest-operating-cycle/SKILL.md
  - templates/meta-self-improvement.md
next_review_date: 2026-08-30
```

## Problem Observed

```yaml
problem_type: conceptual_boundary_and_skill_evolution_gap
affected_workflow: operating_trigger_model_and_repo_scoped_skills
evidence: The repository already described full operating cycles and repo-scoped skills, but did not explicitly state when skills should be created or updated, nor did it state the boundary between dormant repository state and active agent-powered judgment.
impact_on_mission: Without this boundary, future agents might either underuse repo-scoped skills or overstate what the repository can do while no agent is active.
frequency: recurring_risk
severity: medium
```

## Process Hypothesis

```yaml
hypothesis: Explicitly modeling the repository as durable operating-system state and Codex as active compute will make future agents run complete workflows when powered on while preserving the no-autonomous-trading and no-hidden-state boundaries.
expected_benefit: Clearer trigger semantics, better repo-scoped skill maintenance, and fewer assumptions that the repository autonomously thinks or trades while no agent is active.
possible_harm: The metaphor could be over-read as permission for unattended qualitative judgment.
success_signal: Future agents explain that deterministic automation may run while idle, but qualitative research, allocation, and broker-record mutation require user-triggered agent work and confirmation rules.
rollback_condition: If the metaphor creates confusion, replace it with a more literal "durable state plus user-triggered execution" description.
review_date: 2026-08-30
```

## Premortem

- Future agents might use "operating system" too literally and imply autonomous behavior outside approved automation.
- Repo-scoped skills might grow into duplicate operating manuals and drift from `AGENTS.md`.
- Skill self-evolution could create too many small skills instead of improving the canonical docs or scripts.

## Change Made

```yaml
agents_rules:
  - Added operating-system model boundaries.
  - Added repo-scoped skill self-evolution rules.
spec_sections:
  - Added Operating System Model.
  - Added `.agents/skills/` to repository layout.
  - Added repo-scoped skill evolution to Self-Evolution Mechanism.
templates:
  - Added repo-scoped skill checks to meta-self-improvement and research-engine-run templates.
repo_scoped_skills:
  - Updated .agents/skills/invest-operating-cycle/SKILL.md to check for skill drift during meta-self-improvement.
data_files: []
source_code: []
dashboard: []
validation:
  - npm run verify
cleanup: []
```

## Study Plan

```yaml
next_cycle_to_review: next full operating cycle or skill-affecting process change
metric_or_signal: Future runs should update repo-scoped skills only when trigger/navigation behavior changes and should keep skills concise.
decision_quality_question: Did the operating-system model cause agents to execute the full cycle more reliably without overstating unattended autonomy?
maintenance_cost_question: Are repo-scoped skills still lightweight routers rather than duplicate manuals?
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
