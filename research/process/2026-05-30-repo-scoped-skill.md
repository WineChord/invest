# Repo-Scoped Skill Review

```yaml
review_date: 2026-05-30
operator: Codex
policy_version: v1.1
trigger: User asked whether repository-specific skills should be stored in the repo so agents can use them without global installation.
related_cycle: meta_self_improvement
related_files:
  - .agents/skills/invest-operating-cycle/SKILL.md
  - AGENTS.md
  - README.md
next_review_date: 2026-08-30
```

## Problem Observed

```yaml
problem_type: workflow_trigger_portability
affected_workflow: full_operating_cycle_and_monthly_decision
evidence: The repository had strong AGENTS and SPEC rules, but no repo-scoped Codex skill metadata that could help future agents discover the main operating-cycle workflow automatically.
impact_on_mission: Future agents might under-trigger the full operating cycle, self-evolution, or meta-self-improvement flow when asked casual decision questions.
frequency: recurring_risk
severity: medium
```

## Learning Sources Checked

```yaml
external_sources:
  - title: OpenAI Codex Skills
    url: https://developers.openai.com/codex/skills
    source_published_at: not listed on page
    retrieved_at: 2026-05-30
    lesson: Codex supports repo-scoped skills under `.agents/skills`, which can be discovered from the current workspace without installing them into `$CODEX_HOME/skills`.
  - title: OpenAI Create Custom Skills In Codex
    url: https://developers.openai.com/codex/skills/create-skill
    source_published_at: not listed on page
    retrieved_at: 2026-05-30
    lesson: Skills should be concise and use metadata plus progressive disclosure instead of copying large bodies of instructions.
internal_sources:
  - /Users/guoqizhou/.codex/skills/.system/skill-creator/SKILL.md
  - /Users/guoqizhou/.codex/skills/.system/skill-installer/SKILL.md
unavailable_sources: []
```

## Process Hypothesis

```yaml
hypothesis: A concise repo-scoped skill that points to canonical workflow files will improve automatic workflow triggering without creating global installation burden or duplicating repository rules.
expected_benefit: Future agents are more likely to load the investment operating-cycle workflow when working in this repo.
possible_harm: Duplicated instructions could drift from AGENTS.md if the skill becomes too detailed.
success_signal: Future decision or full-cycle requests mention and follow the invest-operating-cycle skill while still treating AGENTS.md and SPEC.md as canonical.
rollback_condition: If the skill drifts, duplicates too much, or conflicts with AGENTS.md, replace it with a shorter navigation-only skill or remove it.
review_date: 2026-08-30
```

## Premortem

- The skill could become stale if AGENTS/SPEC workflows change and the skill is not updated.
- The skill could add false confidence if agents treat it as complete and skip the canonical files.
- The skill could become too broad and trigger on unrelated repository work.
- The skill could encourage global installation even though it is repo-specific.

## Change Made

```yaml
agents_rules:
  - Added Repo-Scoped Skills rules to AGENTS.md.
spec_sections: []
templates: []
data_files: []
source_code: []
dashboard: []
validation:
  - npm run verify
cleanup:
  - Kept the skill concise and pointed it to canonical repository files.
```

## Study Plan

```yaml
next_cycle_to_review: next decision or full operating cycle after 2026-05-30
metric_or_signal: The agent should treat `.agents/skills/invest-operating-cycle/SKILL.md` as a trigger/navigation layer and still read AGENTS.md, SPEC.md, policy, and templates.
decision_quality_question: Did the repo-scoped skill reduce under-triggering of full-cycle, self-evolution, or meta-self-improvement workflows?
maintenance_cost_question: Does the skill stay short enough to avoid drift and context bloat?
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
