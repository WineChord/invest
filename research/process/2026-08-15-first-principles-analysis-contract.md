# First-Principles Analysis Contract Review

```yaml
review_date: 2026-08-15
operator: Codex
policy_version: v1.3
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment: aligned
article1_preflight: Material analyses could invoke first-principles reasoning in discovery while still inheriting conclusions in filing, valuation, allocation, macro, retrospective, or process work.
lower_level_conflicts_found: Analysis templates did not share one explicit reconstruction contract, and durable artifacts were not checked prospectively for that contract.
lower_level_artifacts_revised: Constitution, agent routing, specification, repository skill, material analysis templates, Article 1 guard, data validation, and regression tests.
article1_postflight: complete_after_full_validation_and_publication_review
trigger: recurring_methodology_gap
related_cycle: meta_self_improvement
related_files:
  - CONSTITUTION.md
  - AGENTS.md
  - SPEC.md
  - .agents/skills/invest-operating-cycle/SKILL.md
  - templates/
  - scripts/article-one-mission-lib.mjs
  - scripts/check-data.mjs
  - scripts/test-article-one-gates.mjs
next_review_date: 2026-09-12
```

## First-Principles Analysis

```yaml
first_principles_analysis:
  question_rebuilt_from_basics: What minimum durable method makes material analysis serve Article 1 without turning first-principles language into another slogan or checklist?
  irreducible_facts:
    - Article 1 requires the repository to improve the probability of finding, funding, sizing, and holding rare qualifying outcomes while preserving necessary truth and survival boundaries.
    - Before this change, explicit first-principles language was concentrated in discovery routing rather than required across material analysis templates.
    - A prior rating, status, multiple, analogy, or price path is a stored conclusion or comparison, not an irreducible fact.
  binding_constraints:
    - Current primary evidence and confirmed account facts remain the truth base.
    - No methodology may weaken no-trading, broker-evidence priority, freshness, auditability, clone portability, public-release safety, or avoidable-ruin controls.
    - Historical artifacts must remain reconstructable and should not be rewritten only to satisfy a new schema.
  causal_chain: A shared reconstruction schema forces the question back to current facts and constraints, exposes the causal path to shareholder and portfolio value, makes inherited assumptions and falsifiers visible, and therefore improves the quality of status, valuation, ranking, sizing, and action conclusions.
  inherited_assumptions_challenged:
    - Bottleneck-map-first language alone guarantees first-principles reasoning in later company and allocation analysis.
    - Using a template implies that the underlying causal chain was rebuilt.
    - Presence checks on constitutional prose are enough to prevent analytical drift.
  value_capture_or_mission_link: Better causal reconstruction should reduce both false positives driven by attractive narratives and false negatives driven by stale ratings, familiar peer sets, or inherited no-action logic. For securities, the chain must reach dilution-adjusted per-share value and feasible portfolio impact.
  disconfirming_evidence: Repeated completed analyses contain copied or empty blocks, the contract adds latency without changing challenged assumptions or decisions, or material conclusions continue to rely primarily on inherited ratings, analogies, multiples, or price action.
  decision_consequence: Make the contract explicit in the constitution and every material analysis template, protect those surfaces with the Article 1 guard, and reject new dated durable analysis artifacts that omit the common section or fields.
```

## Problem Observed

The repository already required bottleneck-map-first discovery and occasionally named first-principles reasoning, but the requirement did not continue consistently through company research, filing review, readiness, promotion, valuation, allocation, macro-regime analysis, retrospectives, and process changes. This left room for an analysis to preserve an inherited conclusion while appearing current because its sources or price were refreshed.

## Change Made

- Article 1 now names first-principles analysis as its required method, and Article 4 makes the relationship to bottleneck-map-first discovery explicit.
- `AGENTS.md`, `SPEC.md`, and the repository skill define one common field contract and make it mandatory for material analysis.
- Every material analysis template now contains an explicit `First-Principles Analysis` section.
- Chinese private decision reports and self-emails render the heading as `从第一性原理出发` and apply it to each material company or decision block rather than only at report level.
- The Article 1 guard protects the constitutional definition and all material templates against silent removal.
- Data validation applies prospectively to new dated durable analysis artifacts from 2026-08-15; historical records remain unchanged.
- Regression tests remove the contract from fixtures and canonical templates to prove that drift fails.

## Premortem

The main failure mode is mechanical compliance: repeating generic facts, constraints, and causal language without changing the analysis. Another is excessive duplication in quiet continuity checks. The contract therefore permits concise treatment when nothing changed but requires the current facts, challenged premise, falsifier, and decision consequence to be specific. Review should narrow the schema if it adds material cost without improving decisions, but it should not return to inherited-conclusion analysis.

## Study Plan

Review the next four completed material operating cycles or the state on 2026-09-12, whichever provides enough evidence first. Check whether the contract changed candidate discovery, thesis deltas, valuation bounds, opportunity-cost ranking, zero-versus-starter decisions, or process corrections; whether completed blocks were specific rather than copied; and whether the added maintenance cost was proportionate.

## Guardrails

This change does not authorize a trade, alter an account fact, change the allowed-asset policy, weaken fresh primary evidence, or override publication safety. It changes the reasoning burden below Article 1 and leaves every existing truth, survival, human-control, audit, portability, and public-release boundary intact.

## Validation

- `npm run verify` passed, including the Article 1 continuous guard across 22 protected surfaces, the prospective first-principles artifact check, the repository regression suite, and the production build.
- The production build generated 93 pages successfully.
- Publication review found no account mutation, actionable order content, broker identifiers, credentials, local paths, or embargoed execution details in this methodology change.
