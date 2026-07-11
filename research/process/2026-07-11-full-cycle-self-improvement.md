# Full-Cycle Self-Improvement Review — 2026-07-11

```yaml
review_date: 2026-07-11
operator: codex
policy_version: v1.1
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment: pass
trigger: full monthly cycle exposed freshness, valuation-date, discovery-lane, and dashboard defects
related_cycle: 2026-07-11-full-cycle-decision
next_review_date: 2026-08-11
```

## Problem Observed

Four durable defects appeared. First, a stale but valid SEC cache aborted an online run instead of being refetched. Second, the standard event selector omitted ownership, compensation, and private-offering forms that contained allocation-relevant RKLB, IREN, FLY, and YSS evidence. Third, a weekend deposit could have been combined with the previous market close in the equity curve. Fourth, research-stock chart range controls clipped and confirmed trade arrows lacked a readable activity rail. The candidate scan also showed that single broad space, nuclear, quantum, and interconnect lanes obscured materially different economics.

These defects could create false freshness, wrong account valuation timing, missed dilution/governance evidence, weak user auditability, and noisy peer comparison.

## Process Hypothesis and Premortem

The smallest durable changes are: refetch stale cache online while retaining cache-only failure; require a submissions-delta supplement for Form 3/4/144, Schedule 13D/13G amendments, Form D, DEFA14A, and S-8; prohibit equity snapshots whose account state is newer than the market close; expose confirmed stock-level activity beside chart markers; and preserve existing lane IDs while adding machine-readable sublanes and negative filters.

The changes could fail by adding repetitive filing review, hiding genuinely broken cache identity behind refetch, leaving equity-curve gaps too long, cluttering mobile pages, or overfitting lanes to this month's names. Guardrails are bounded form families, identity and future-date checks that still hard-fail, explicit valuation gaps rather than invented prices, responsive layout validation, and stable top-level lane IDs.

## Change Made

```yaml
agents_rules: unchanged
spec_sections:
  - equity snapshot date compatibility
  - supplemental SEC submissions-delta coverage
templates:
  - full operating cycle supplemental form scan
data_files:
  - lane submaps and false-positive filters
source_code:
  - online stale SEC cache refetch
  - company-share plausibility guard
  - weekend equity snapshot guard
dashboard:
  - research chart range toolbar width
  - confirmed historical activity rail
validation:
  - stale filing cache regression test
cleanup: committed only durable run artifacts and excluded raw cache payloads
mission_or_lane_map_effect: improves same-lane opportunity cost without changing the top-level audit keys
subagent_protocol_effect: freshness reviewers must not infer no event from the standard event index alone
```

## Study Plan

At the next full cycle, measure whether the supplemental form scan finds material events missed by the standard index, whether online stale caches complete without weakening cache-only validation, whether equity snapshots resume on the next same-date-or-later close, whether the new research activity rail remains readable at mobile and desktop widths, and whether sublanes improve candidate comparison without excessive ceremony.

## Guardrails and Skill Check

No automatic trading, broker-confirmation rules, source hierarchy, freshness, auditability, clone portability, public-release safety, allowed assets, or the asymmetric-compounding mission were weakened. No new repo-scoped skill is needed: the existing `invest-operating-cycle` router already points to the canonical `SPEC.md`, command reference, and templates changed here. Keeping the rule in those canonical files minimizes drift.
