# Agentic Discovery And Readiness Sprint

review_date: 2026-05-31
operator: Codex
policy_version: v1.1
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment: The change strengthens bottleneck-map-first discovery by requiring open-ended, high-reasoning source search and by preventing publicly reachable evidence gaps from becoming lazy blockers.
trigger: The 2026-05-31 discovery run surfaced Firefly Aerospace only after advisory review, showing that deterministic keyword scans can produce useful leads but cannot be the whole discovery system.
related_files:
  - CONSTITUTION.md
  - AGENTS.md
  - SPEC.md
  - scripts/check-data.mjs
  - scripts/discover-universe.mjs
  - scripts/build-subagent-evidence-packet.mjs
  - templates/full-operating-cycle.md
  - templates/monthly-decision.md
  - templates/research-engine-run.md
  - templates/agentic-discovery-run.md
  - templates/discovery-readiness-sprint.md
  - research/discovery/candidate-readiness.yml
  - research/discovery/runs/2026-05-31-agentic-discovery.yml
  - research/discovery/runs/2026-05-31-subagent-evidence-packet.yml
  - research/discovery/readiness/2026-05-31-FLY-readiness.md
  - research/quality-metrics.yml
  - .agents/skills/invest-operating-cycle/SKILL.md
next_review_date: 2026-06-30

## Problem Observed

problem_type: discovery_quality
affected_workflow: full operating cycle, monthly decision, universe discovery, raw candidate triage, watchlist promotion, and allocation readiness
evidence: The deterministic universe discovery scan surfaced many noisy keyword matches and also surfaced Firefly Aerospace, a genuine same-lane space infrastructure lead. The lead became durable only because a discovery reviewer performed primary-source triage. The main process initially risked treating it as generic dry-run noise and then saying it was not buy-ready because market data, filing review, valuation state, peer comparison, and dashboard-facing records were missing.
impact_on_mission: A system that relies too heavily on fixed keyword code can miss rare public opportunities that are small, new, awkward, or described in language that the current lane keywords do not capture.
impact_on_decision_quality: A system that stops at "not buy-ready because data is missing" can preserve stale watchlist favorites instead of doing the research needed to compare a new candidate fairly.
frequency: recurring risk
severity: high

## Process Hypothesis

hypothesis: Discovery quality will improve if deterministic scans remain as auditable scaffolding while independent fresh-context xhigh subagents perform broad current-source exploration and answer the first-layer bottleneck questions before producing ticker lists. Candidate readiness will improve if plausible new candidates trigger an automatic readiness sprint that gathers all publicly reachable evidence before the system declares them unbuyable.
expected_benefit: Fewer missed candidates, better same-lane opportunity-cost comparison, less stale-watchlist anchoring, and fewer recommendations blocked by repository work the agent could have completed.
possible_harm: More latency, more source gathering, risk of over-researching marginal names, and repository noise if every weak lead receives a full review.
success_signal: Future full-cycle runs report which agentic discovery searches ran, which candidates were made research-ready, which candidates were rejected from evidence, and which blockers were genuinely external rather than caused by incomplete repository work.
rollback_condition: Narrow the readiness sprint trigger if it repeatedly wastes time on low-quality leads, adds noise, or delays allocation decisions without improving candidate quality.
mission_alignment_check: The change does not weaken no-trading, broker-confirmation truth, source freshness, source hierarchy, auditability, clone portability, or allowed-asset policy.

## Change Made

constitutional_change:
  - Added that deterministic screens and fixed keyword searches are only scaffolding.
  - Added that plausible new public candidates require reasonable best-effort evidence gathering before missing evidence can be treated as a blocker.
  - Added that discovery obligations must be satisfied by source-backed, auditable evidence rather than a prose claim that the step ran.
agent_rules:
  - Added agentic discovery as a required step for material full-cycle and decision runs.
  - Required discovery subagents to answer first-layer bottleneck questions before producing ticker lists.
  - Added a discovery readiness mandate with a concrete readiness sprint.
  - Required independent fresh-context xhigh discovery subagents for broad source search and first-principles candidate discovery when discovery can affect allocation.
  - Required structured agentic discovery artifacts and machine-checkable candidate readiness records for material discovery work.
spec_sections:
  - Updated the research data model, research engine implementation target, advisory subagent model, readiness semantics, operating-cycle trigger model, research funnel ruling, and discovery readiness sprint semantics.
templates:
  - Updated full-cycle, monthly-decision, and research-engine-run templates.
  - Added agentic-discovery-run and discovery-readiness-sprint templates.
repo_scoped_skill:
  - Updated `.agents/skills/invest-operating-cycle/SKILL.md`.
data_files:
  - Added `research/discovery/candidate-readiness.yml`.
  - Added `research/discovery/runs/2026-05-31-agentic-discovery.yml`.
  - Added `research/discovery/readiness/2026-05-31-FLY-readiness.md`.
  - Updated `research/quality-metrics.yml` to reject ready status while a material candidate has reachable readiness work outstanding.
  - Completed the FLY readiness sprint with SEC submissions, SEC companyfacts, Q1 results, offering filing context, Yahoo chart data, filing-package review, valuation state, company-analysis entry, freshness events, and dashboard-facing research-only coverage, then reclassified FLY as evidence-based incubating rather than repository-work blocked.
  - Added explicit affected lanes, materiality reason, blocking scope, allocation-relevant lane validation, and structured source-family coverage so future runs cannot claim broad discovery from a single generic source bucket or hide same-lane raw candidates as immaterial.
  - Reframed `decision_readiness` as repository-public readiness only: user-only broker facts and execution instructions are execution prerequisites, while repository-reachable evidence gaps must be resolved before the main agent finishes.
  - After fresh-context xhigh red-team review, removed remaining template language that treated not-ready as a permissible final state, tightened the completion standard against time or public-data gaps, and made transient candidate readiness statuses fail validation.
  - Added a bounded subagent evidence packet artifact and linked it from quality metrics so independent xhigh subagents can be launched with fresh, explicit context rather than full conversation history.
source_code:
  - Updated `scripts/discover-universe.mjs` to include emerging and incubating lanes by default and emit optional JSON audit output.
  - Added `scripts/build-subagent-evidence-packet.mjs` to generate the bounded evidence packet from committed repository state.
  - Updated `scripts/check-data.mjs` to validate candidate readiness, discovery process metrics, unknown-future lane presence, scan freshness, structured source-family coverage, material-candidate lane scope, repository-public readiness scope, user-only execution prerequisites, and ready-state blockers.
  - Added `scripts/test-discovery-readiness-gates.mjs` to run negative fixture tests for the ready-only gate, candidate readiness terminal-state consistency, same-lane materiality, source-family coverage, and source-id resolution.
  - Added `npm run test:discovery-gates` and wired it into `npm run verify`.
  - After independent fresh-context validation audit, strengthened the gates again so allocation-relevant not-material classifications require sprint evidence, latest price rows must be present and fresh enough, agentic run and evidence-packet readiness records must reconcile back to `research/discovery/candidate-readiness.yml`, and archived material candidates have explicit `archived_after_review` / `not_required_archived` terminal semantics.
dashboard:
  - FLY must appear in the dashboard-facing research universe when it is material and incubating, with security metadata, price data, technical snapshot, metrics, valuation state, and analysis history.

## Validation Result

commands_run:
  - npm run build:evidence-packet -- --as-of 2026-05-31 --output research/discovery/runs/2026-05-31-subagent-evidence-packet.yml
  - npm run check:data
  - npm run test:discovery-gates
  - npm run verify
result: passed after adding the machine-checkable readiness gate, negative gate tests, and resolving FLY from missing-data blocker to evidence-based incubation.

## Study Plan

next_cycle_to_review: next full operating cycle or monthly decision with discovery output
candidate_quality_question: Did agentic discovery surface a candidate, lane, or disconfirming source that deterministic scans would likely miss?
readiness_question: Did the cycle make plausible candidates research-ready rather than leaving them blocked by missing public data?
noise_question: Did the sprint over-research marginal leads or add low-signal files?
allocation_question: Did same-lane candidate comparison improve the final buy, hold-cash, or reserve decision?

## Guardrails

Confirmed unchanged:

- no automatic trading;
- broker-confirmation-only account records;
- source freshness and hierarchy;
- auditability;
- clone portability;
- allowed-asset policy;
- no crypto tokens, leverage, margin, options, shorts, private shares, OTC securities, or non-US-listed instruments under policy v1.1;
- multi-decade asymmetric compounding with avoidable-ruin controls.
