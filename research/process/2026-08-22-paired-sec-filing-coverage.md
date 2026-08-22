# Paired SEC Filing Coverage Review

```yaml
review_date: 2026-08-22
operator: Codex
policy_version: v1.3
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment: aligned
article1_preflight: A material full-cycle filing check must discover both current events and the latest foundational business evidence; otherwise a reachable filing can remain falsely classified as future evidence and weaken opportunity-cost comparison.
lower_level_conflicts_found: The full-cycle routing named the event index but did not explicitly require a same-scope foundational-first companion and accession reconciliation.
lower_level_artifacts_revised: SPEC.md, docs/research-command-reference.md, templates/full-operating-cycle.md, and .agents/skills/invest-operating-cycle/SKILL.md.
article1_postflight: The narrow change repairs evidence freshness without weakening mission exposure, broker truth, human control, auditability, portability, or publication safety.
trigger: material_filing_miss_and_stale_readiness_source
related_cycle: research/discovery/runs/2026-08-22-weekly-full-operating-cycle.yml
related_files:
  - research/discovery/readiness/2026-08-22-APLD-readiness.md
  - research/discovery/candidate-readiness.yml
  - research/discovery/runs/2026-08-22-sec-event-filing-index-profiles.json
  - research/discovery/runs/2026-08-22-sec-foundational-filing-index-profiles.json
next_review_date: 2026-09-19
```

## First-Principles Analysis

```yaml
first_principles_analysis:
  question_rebuilt_from_basics: What is the smallest repeated filing check that prevents a current event view from hiding the latest business and capital-structure baseline?
  irreducible_facts:
    - The event selector intentionally favors the newest supported event forms in its configured set.
    - The foundational-first selector intentionally favors 10-K, 20-F, S-1, F-1, or a business prospectus.
    - APLD filed its fiscal 2026 Form 10-K on 2026-07-29, but the event pass retained a 2026-07-27 Form 8-K and candidate readiness still described the 10-K as a future source.
    - The filed 10-K was publicly reachable and materially changed the debt, capital-expenditure, restricted-cash, concentration, guarantee, and dilution bridge.
  binding_constraints:
    - Full cycles need current event detection and current business-baseline evidence.
    - The repair must not reinterpret deterministic selection as investment judgment or create buy eligibility.
    - Targeted cycles may remain proportional but must disclose partial scope.
  causal_chain: Paired same-scope selectors expose both changes and foundational economics; accession reconciliation surfaces mismatches; primary review then converts a false future gap into an evidence-based readiness and entry conclusion; future allocation comparisons become fresher and less biased by stale blockers.
  inherited_assumptions_challenged:
    - A successful event index proves the latest business filing was reviewed.
    - The newest selected event document can substitute for a periodic or registration baseline.
  value_capture_or_mission_link: Earlier access to debt, capex, recourse, concentration, and dilution evidence reduces false positives while preventing an administrative gap from becoming a false reason for indefinite inaction.
  disconfirming_evidence: The next four material cycles show no distinct evidence from the foundational companion while runtime or SEC load grows materially, or paired selectors still miss a newer periodic filing.
  decision_consequence: Require paired event and foundational-first coverage plus accession reconciliation in every full cycle and material decision; keep both selectors because they answer different questions.
```

## Problem Observed

The symptom was a stale APLD readiness record naming an already-filed Form 10-K as a future source. The root cause was not absence of the filing or a defective foundational selector: the full-cycle path relied on an event-oriented `latest-supported` result without an explicit requirement to compare it with the default foundational-first result over the same universe. The missed annual baseline was material because it supplied the capital-stack facts that determine whether long leases leave residual value for common equity.

## Process Hypothesis

Running both existing selectors over the same applicable listed-security scope and reconciling selected accessions is the narrowest durable repair. Success means a later foundational filing is visible in the same cycle even when a different event filing remains the right source for change detection. The change should be rolled back or narrowed if four material cycles show no incremental evidence while SEC runtime or rate pressure becomes disproportionate; targeted cycles may use a disclosed partial paired scope.

## Premortem

The paired pass could duplicate downloads, create false confidence from two deterministic outputs, or make every event appear material. It could also overfit APLD and add process work that delays exposure. The guard is to reuse validated caches, keep deterministic outputs as triage only, reconcile accessions before reading only the material differences, and never let unrelated filing-process debt veto a decision-ready target.

## Change Made

```yaml
agents_rules: unchanged
spec_sections: SEC discovery implementation now requires paired same-scope event and foundational-first selection for full cycles and material decisions.
templates: templates/full-operating-cycle.md now names the paired-accession reconciliation step.
data_files: APLD readiness, candidates, source register, company analysis, filing review, and current cycle review now use the filed 2026-07-29 Form 10-K.
source_code: unchanged; both canonical selectors and their regression tests already existed.
repo_scoped_skills: invest-operating-cycle routing now points agents to the paired evidence surfaces.
dashboard: no behavior change.
validation: existing discovery-profile tests cover foundational-first and latest-supported selection independently; full repository validation will exercise the durable data links.
cleanup: the stale future-source claim was superseded by a dated R2 readiness artifact rather than silently deleted from history.
mission_or_lane_map_effect: no lane or buy-zone change; APLD advances to R2 comparison but remains ineligible for a buy.
subagent_protocol_effect: independent reviewers receive both profile artifacts when the distinction is material.
```

## Study Plan

```yaml
next_cycle_to_review: the next four material operating cycles or 2026-09-19, whichever comes first
metric_or_signal: later periodic filings found only by the foundational companion; accession mismatches; added SEC requests; runtime; stale future-source claims
decision_quality_question: Did paired coverage change a readiness, valuation, survival, dilution, or opportunity-cost conclusion that an event-only pass would have missed?
maintenance_cost_question: Can the same safety be preserved with cache reuse and material-difference review rather than duplicate full-text work?
subagent_quality_question: Did reviewers use the additional foundational evidence to resolve a real conflict rather than merely duplicate the main analysis?
```

## Guardrails

The change does not authorize trades, mutate account facts, weaken primary-source freshness, or broaden allowed assets. It keeps event and foundational evidence distinct, preserves the original selector artifacts and stale-record audit trail, commits no raw filing payload, and leaves publication and broker-confirmation rules unchanged.

## Repo-Scoped Skill Check

```yaml
new_skill_needed: false
existing_skill_to_update: true
skill_path: .agents/skills/invest-operating-cycle/SKILL.md
trigger_change: full-cycle and material-decision filing review now navigates to paired event and foundational-first coverage.
canonical_files_changed: SPEC.md; docs/research-command-reference.md; templates/full-operating-cycle.md
validation_or_command_change: no new command; use the two existing canonical selectors over the same applicable scope and reconcile accessions.
why_not_just_agents_or_spec: The skill is the repeated workflow entry point, while the canonical rule and command semantics remain in SPEC.md, the template, and command reference.
drift_risk: low; the skill contains only the trigger and navigation rule.
review_date: 2026-09-19
```
