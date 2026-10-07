# Payday Research Schedule

Review date: 2026-10-07
Policy version: `v1.3`
Scope: monthly research scheduling and calendar scaffolding; no investment decision, trade, or change to account facts
Supersedes: the research-date convention in [monthly-cadence-amendment](2026-10-07-monthly-cadence-amendment.md), while preserving its contribution amendment and historical account records
Next review: after three completed new monthly cycles, or sooner after a missed instance, duplicate delivery, unavailable calendar or material research failure

## First-Principles Analysis

```yaml
first_principles_analysis:
  question_rebuilt_from_basics: How can one explicitly authorized monthly request reliably produce a fresh full investment review without duplicate funding, stale evidence, repeated messages or hidden host dependencies?
  irreducible_facts: The account owner requested monthly full research with a fresh session and private delivery. The earlier research convention was the first Saturday. The official 2026 calendar includes holidays and makeup working weekends. The existing contribution authorization independently covers the first day of the month.
  binding_constraints: Human trade execution, exact standing deposit authorization, broker-evidence priority, official calendar evidence, fresh primary research, independent challenge, private current recommendations and public-release review remain controlling.
  causal_chain: Resolve the nominal month from sourced working-day evidence; freeze its actual due date and unique identity; start a fresh persistent session; complete current research and independent reviews; deliver once with verifiable transport evidence. Reliable cadence increases the chance of finding and sizing qualifying opportunities.
  inherited_assumptions_challenged: All employers share one payday; Saturdays are always rest days; a payday stays in its nominal month; research dates can confirm deposits; a fresh session permits repeated email delivery; an unchanged month justifies a reduced review.
  value_capture_or_mission_link: Timely complete research preserves opportunity discovery while separate schedule, funding and publication boundaries prevent avoidable account and delivery errors.
  disconfirming_evidence: Missing official dates, an advanced payday skipped at a month boundary, repeated funding or mail, inherited evidence presented as fresh, incomplete independent review, or an unauthorized change to the schedule.
  decision_consequence: Use a nominal fourth-day convention at 19:00 Asia/Shanghai, the preceding official working day where necessary, a nominal-month identity and a fresh full-cycle session. Retain the existing contribution authorization. Runtime deployment and delivery must be verified separately from calendar tests.
```

## Calendar and Authorization

The fourth day is the account-owner scheduling convention, not a national or statistically established employer payday. The first new regular research instance is November 4, 2026, at 19:00 `Asia/Shanghai`. October's already completed cycle remains historical; do not manufacture a backdated instance.

The official 2026 notice was published on November 4, 2025, and retrieved on October 7, 2026: [State Council notice reproduced by the Beijing government](https://www.beijing.gov.cn/fuwu/bmfw/sy/jrts/202511/t20251104_4258838.html). Structured dates and source metadata are retained in `data/calendar/`; raw source pages are not committed.

Makeup working days override ordinary weekends. A holiday-adjusted date can cross into the preceding month: May's nominal fourth day resolves to April 30, and October's resolves to September 30. The gate considers the following nominal month where its calendar is available. A missing following-year calendar is reported for refresh without invalidating a known current-year instance; an unknown target-year calendar fails explicitly. Previously frozen scheduled dates must not be changed on retry.

The scheduled qualitative work is a bounded replay explicitly requested by the account owner under Constitution Article 10. It does not grant qualitative powers to deterministic daily data workflows or permission to execute trades. Each replay uses a new persistent project session and completes the full cycle even in a quiet month. The discovery, freshness, bull, bear and allocation/risk reviewers require independent contexts, using separate batches where concurrency is limited.

Research scheduling and contribution confirmation remain separate. No ledger, position, account-state, cost-basis, equity-curve or contribution-plan change is part of this amendment.

## Runtime and Delivery Boundaries

The committed gate is read-only scaffolding. It neither installs nor enables a scheduler. Deployment must separately establish the intended project, session persistence and visibility, unique nominal-month lock, crash and retry handling, and the authorized delivery route. Do not claim runtime completion from a passing date test.

Investment delivery retains the private report standard. Freeze the scheduled date and plan identity before any send; respect the actual transport's deduplication key across retries on later days. SMTP acceptance is distinct from inbox receipt. Preserve uncertain-send evidence and inspect it before another attempt. Current actionable reports stay private; public publication continues to require the existing embargo and review.

## Validation and Article 1 Postflight

Regression checks cover official makeup days, ordinary weekends, long holidays crossing months, timezone and 19:00 boundaries, replay suppression, malformed or duplicate calendars, and missing target-year evidence. The existing standing-contribution tests remain required to demonstrate funding behavior was not changed. Run the complete repository verification before release.

Validation on October 7: the focused payday suite, independent process review, Article 1 guard and complete `npm run verify` passed, including all existing account regression checks and the 99-page production build. The independent review led to a fixed source-year test fixture and synthetic cross-year coverage, so adding a future official calendar does not break the missing-year tests. Runtime deployment, project visibility, fresh-session execution and mail receipt remain separate prerequisites; they have not been established by this code review.

This change advances reliable opportunity review and preserves account truth, human control, auditability and private delivery. It does not extend evidence validity or delay material user-triggered research until the recurring date.
