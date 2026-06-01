# Public Release Risk Controls

```yaml
review_date: 2026-06-01
operator: Codex
policy_version: v1.1
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment: Added publication safety as an avoidable-ruin control so open-source transparency does not turn the repository into an advice, signal, privacy-leak, or promotional platform.
trigger: User asked to open-source the full invest system and all operations while avoiding legal, privacy, security, and relationship risk.
related_cycle: meta_self_improvement
related_files:
  - CONSTITUTION.md
  - PUBLICATION_POLICY.md
  - AGENTS.md
  - SPEC.md
  - README.md
  - data/policy/policy-v1.1.md
  - templates/monthly-decision.md
  - templates/execution-confirmation.md
  - templates/full-operating-cycle.md
  - templates/publication-release-review.md
  - src/components/InvestDashboard.tsx
  - src/components/ResearchStockPage.tsx
  - scripts/check-data.mjs
next_review_date: 2026-07-01
```

## Problem Observed

```yaml
problem_type: public_release_and_social_copy_risk
affected_workflow: decisions, execution updates, public dashboard, README, external posting, git commit/push
evidence: Publicly releasing every decision and operation can be misread as personalized investment advice, a real-time signal, copy-trading guidance, compensated promotion, or a performance advertisement. Raw broker artifacts and public repository history can also leak private account, identity, credential, or local-environment data.
impact_on_mission: A publication model that creates legal, privacy, security, social, or platform risk can permanently impair the project even when investment research is good.
impact_on_discovery_lanes: none
impact_on_bottleneck_map_first_process: none
frequency: recurring_risk
severity: high
```

## Learning Sources Checked

```yaml
external_sources:
  - title: SEC and Investor.gov public materials on investment advisers and social-media investment fraud
    source_published_at: not listed on source pages
    retrieved_at: 2026-06-01
    source_url: https://www.investor.gov/
    relevance: Public investment content can create adviser, fraud, or promotion concerns when it becomes compensated, personalized, misleading, or signal-like.
  - title: FTC Endorsement Guides
    source_published_at: not listed on source page
    retrieved_at: 2026-06-01
    source_url: https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides
    relevance: Material connections and endorsements require clear disclosure; repository policy should avoid compensation or promotional relationships by default.
  - title: GitHub Docs, About secret scanning
    source_published_at: not listed on source page
    retrieved_at: 2026-06-01
    source_url: https://docs.github.com/en/code-security/concepts/secret-security/about-secret-scanning
    relevance: Public repositories and historical repository surfaces can expose credentials; release controls must prohibit secrets and local credential artifacts.
internal_sources:
  - CONSTITUTION.md
  - AGENTS.md
  - SPEC.md
  - data/policy/policy-v1.1.md
  - templates/monthly-decision.md
  - templates/execution-confirmation.md
unavailable_sources:
  - Qualified legal advice for US, PRC, Hong Kong, broker-specific, employer-specific, and platform-specific publication obligations was not obtained.
```

## Process Hypothesis

```yaml
hypothesis: Treating public release as its own safety gate will preserve useful transparency while preventing the repository from publishing personalized advice, pre-close trade signals, raw broker records, secrets, or compensated promotional material.
expected_benefit: Lower legal, privacy, security, and relationship risk without weakening the investment operating cycle.
possible_harm: The embargo and redaction rules can slow public updates and make the public audit trail less real-time than the private workflow.
success_signal: Future decision and execution commits include only delayed, redacted, non-personalized records with visible public disclaimers.
rollback_condition: If the controls block harmless historical research, narrow the embargo definition while preserving anti-advice, privacy, secret, and compensation boundaries.
mission_alignment_check: Avoiding public-release ruin protects the repository's ability to serve the satellite account over decades.
review_date: 2026-07-01
```

## Premortem

- The repository could still be read as advice if public copy becomes urgent, personalized, or promotional.
- A visible disclaimer could create false confidence if exact actionable orders are still published before market close.
- Redaction could fail if raw screenshots or broker documents are attached outside the normal templates.
- Performance transparency could become marketing if it is separated from risk, source dates, and the personal-account context.
- Compensation or referral relationships would materially change the risk profile and require a new policy plus qualified legal review.

## Change Made

```yaml
agents_rules:
  - Added immutable public-release, anti-signal, anti-compensation, privacy, sensitive-field, and embargo rules.
spec_sections:
  - Added Publication Safety Model, ledger redaction rule, dashboard disclaimer requirements, and failure-mode controls.
templates:
  - Added publication fields and release gates to monthly decision, execution confirmation, and full operating cycle templates.
  - Added templates/publication-release-review.md.
data_files:
  - Added publication standard to policy v1.1.
source_code:
  - Added visible Not investment advice disclaimers to the main dashboard and per-symbol research pages.
  - Added validation that PUBLICATION_POLICY.md exists and contains the core safety phrases.
repo_scoped_skills:
  - Updated invest-operating-cycle to read PUBLICATION_POLICY.md and enforce embargo/redaction safety boundaries.
dashboard:
  - Added visible publication notice components and meta descriptions that frame the site as delayed personal research, not investment advice.
validation:
  - npm run check:data
cleanup:
  - No raw broker artifacts or private files were added.
mission_or_lane_map_effect: none
subagent_protocol_effect: none
```

## Study Plan

```yaml
next_cycle_to_review: next execution update or monthly decision that creates actionable trading content
metric_or_signal: The artifact should either remain unpublished until after the embargo or include a completed publication-release review showing redaction and release timing.
decision_quality_question: Did publication safety reduce public risk without weakening the private decision process?
maintenance_cost_question: Are the release checklist and dashboard disclaimers enough, or does the repo need a dedicated release script or automated secret scan command?
subagent_quality_question: not applicable
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

Confirmed unchanged:

- no automatic trading;
- broker-confirmation-only account records;
- source freshness and hierarchy;
- auditability;
- clone portability;
- allowed-asset policy;
- multi-decade asymmetric compounding with avoidable-ruin controls.

New guardrail:

- public-release safety, including no personalized public advice, no compensated promotion, delayed actionable trading content, visible disclaimers, and redacted broker records.

## Repo-Scoped Skill Check

```yaml
new_skill_needed: false
existing_skill_to_update: invest-operating-cycle
skill_path: .agents/skills/invest-operating-cycle/SKILL.md
trigger_change: Public release risk now applies to commits, pushes, deployments, decisions, execution updates, dashboard copy, and external posts.
canonical_files_changed:
  - CONSTITUTION.md
  - PUBLICATION_POLICY.md
  - AGENTS.md
  - SPEC.md
  - templates/publication-release-review.md
validation_or_command_change:
  - scripts/check-data.mjs now validates PUBLICATION_POLICY.md.
why_not_just_agents_or_spec: The workflow needs a short repo-scoped reminder because publication risk can arise during ordinary execution updates and dashboard work.
drift_risk: If PUBLICATION_POLICY.md changes, the skill should continue to point to it rather than duplicating the policy.
review_date: 2026-07-01
```
