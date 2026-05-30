# Xhigh Advisory Subagent Protocol

review_date: 2026-05-30
operator: Codex
policy_version: v1.1
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment: The change improves the odds of finding and evaluating rare asymmetric opportunities without weakening broker-confirmation truth, freshness, auditability, clone portability, or allowed-asset limits.
trigger: The user explicitly authorized arbitrary scientifically reasonable subagent use and asked that key judgment-heavy steps use the strongest available model and reasoning level, such as xhigh, when doing so helps the constitutional objective.
related_cycle: 2026-05-30 simulated monthly decision follow-up
related_files:
  - AGENTS.md
  - SPEC.md
  - templates/monthly-decision.md
  - templates/full-operating-cycle.md
  - templates/research-engine-run.md
  - templates/meta-self-improvement.md
  - .agents/skills/invest-operating-cycle/SKILL.md
next_review_date: 2026-06-30

## Problem Observed

problem_type: process_quality
affected_workflow: full operating cycle, monthly decision, discovery, freshness, valuation, allocation, and meta-self-improvement
evidence: The prior workflow required bull-case, bear-case, and allocation/risk review for critical allocation decisions, but did not specify discovery/freshness subagents, evidence-packet boundaries, reconciliation rules, or transcript persistence rules. The 2026-05-30 simulated decision showed that deterministic keyword discovery can produce many false positives and that an independent freshness review can catch material details such as the IREN Dell GPU purchase agreement.
impact_on_mission: Without a stronger review protocol, the system can under-search outside the existing watchlist, miss material filings, or become too anchored on the main agent's interpretation.
impact_on_discovery_lanes: Discovery-lane changes and raw-candidate writes need independent challenge before they alter the durable bottleneck map or candidate file.
impact_on_bottleneck_map_first_process: Xhigh discovery review should make it harder for the process to drift back into stock-list-first thinking or to write noisy keyword matches as candidates.
frequency: recurring
severity: high

## Learning Sources Checked

external_sources: []
internal_sources:
  - User authorization and process instruction on 2026-05-30.
  - Xhigh advisory subagent protocol proposal, retrieved in-thread on 2026-05-30.
  - Xhigh red-team review of subagent failure modes, retrieved in-thread on 2026-05-30.
  - AGENTS.md
  - SPEC.md
  - templates/monthly-decision.md
  - templates/full-operating-cycle.md
  - templates/research-engine-run.md
  - templates/meta-self-improvement.md
  - .agents/skills/invest-operating-cycle/SKILL.md
unavailable_sources: []

## Process Hypothesis

hypothesis: Adding a compact advisory subagent protocol will improve future decision quality by splitting independent judgment-heavy review across discovery, freshness, bull case, bear case, and allocation/risk while keeping deterministic commands, account-state truth, file edits, validation, and final synthesis under the main agent.
expected_benefit: Better candidate discovery, fewer missed material filings, stronger adversarial review, clearer handling of conflicting evidence, and more disciplined decisions when cash is available but evidence is incomplete.
possible_harm: More latency, duplicated reading, false confidence from apparent multi-agent agreement, and extra process prose that could obscure the core investment judgment.
success_signal: Future full-cycle and monthly decisions report which xhigh subagents ran, what they found, what they disagreed on, and how the main agent resolved the disagreement; raw candidate writes and buy decisions become better supported by primary evidence.
rollback_condition: Narrow or remove mandatory subagent triggers if future cycles show repeated duplication, low-signal outputs, excessive cost or latency, stale evidence hidden behind consensus, or no improvement in discovery/freshness quality.
mission_alignment_check: The protocol does not allow automatic trading, broker-record mutation, hidden local state, policy-ineligible instruments, or buy recommendations from stale or unresolved evidence.
review_date: 2026-06-30

## Premortem

This could fail if subagents all receive the same incomplete evidence packet and create false confidence. It could slow decisions without better evidence if every routine refresh triggers xhigh review. It could create repository noise if raw transcripts are committed or if every disagreement becomes a long process artifact. It could also overfit the 2026-05-30 IREN example by treating every minor filing as a reason for expensive review.

The guardrail is to use xhigh subagents for material judgment-heavy steps, not deterministic refreshes, and to persist only reconciled conclusions or process lessons.

## Change Made

agents_rules:
  - Added a subagent protocol to AGENTS.md.
spec_sections:
  - Added advisory subagent model language to SPEC.md research-engine and monthly-decision sections.
templates:
  - Updated monthly-decision, full-operating-cycle, research-engine-run, and meta-self-improvement templates.
data_files: []
source_code: []
repo_scoped_skills:
  - Updated .agents/skills/invest-operating-cycle/SKILL.md.
dashboard: []
validation:
  - npm run check:data
cleanup:
  - Raw subagent transcripts are not committed by default.
mission_or_lane_map_effect: No discovery lane changed. The process for reviewing future lane changes became stricter.
subagent_protocol_effect: Material decisions now default to xhigh advisory review for discovery/freshness and allocation-critical reasoning when tools are available.

## Study Plan

next_cycle_to_review: next monthly decision or full operating cycle
metric_or_signal: The final decision should include subagents run, skipped roles, key disagreements, conflict resolution, and whether unresolved evidence forced a conservative action.
decision_quality_question: Did xhigh advisory review catch any candidate, filing, risk, valuation issue, or opportunity-cost issue the main flow would likely have missed?
maintenance_cost_question: Did the protocol materially slow the cycle or add low-signal text without improving evidence quality?
subagent_quality_question: Did each subagent answer a distinct question with source-grounded findings rather than duplicating another role?

## Outcome Review

reviewed_at:
kept:
revised:
reverted:
evidence:
lesson:
follow_up:

## Guardrails

Confirmed unchanged:

- no automatic trading;
- broker-confirmation-only account records;
- source freshness and hierarchy;
- auditability;
- clone portability;
- allowed-asset policy;
- multi-decade asymmetric compounding with avoidable-ruin controls;
- repository noise hygiene.

## Repo-Scoped Skill Check

new_skill_needed: false
existing_skill_to_update: invest-operating-cycle
skill_path: .agents/skills/invest-operating-cycle/SKILL.md
trigger_change: Material monthly decisions, full-cycle runs, discovery/freshness gaps, watchlist reprioritization, valuation changes, allocation decisions, and substantial process changes should use xhigh advisory subagents when available.
canonical_files_changed:
  - AGENTS.md
  - SPEC.md
  - templates/monthly-decision.md
  - templates/full-operating-cycle.md
  - templates/research-engine-run.md
  - templates/meta-self-improvement.md
validation_or_command_change: none
why_not_just_agents_or_spec: The repo-scoped skill is the fast trigger/navigation layer for future agents and should point them to the new protocol.
drift_risk: The skill could understate mandatory subagent review if AGENTS.md evolves further.
review_date: 2026-06-30
