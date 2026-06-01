# Discovery Engine Hardening

```yaml
review_date: 2026-06-01
operator: codex
policy_version: v1.1
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment: improves bottleneck-map-first discovery coverage without changing broker-confirmed account records
trigger: user asked whether repository exploration capability was sufficient and requested continuous discovery-engine improvement
related_cycle: 2026-06-01 discovery-engine improvement loop
related_files:
  - scripts/discover-universe.mjs
  - scripts/build-discovery-profiles.mjs
  - scripts/build-issuer-profile-input.mjs
  - scripts/build-sec-issuer-profiles.mjs
  - scripts/build-sec-filing-manifest.mjs
  - scripts/build-sec-filing-profiles.mjs
  - scripts/sec-fetch-lib.mjs
  - scripts/fmp-fetch-lib.mjs
  - scripts/build-sec-registration-transaction-candidates.mjs
  - scripts/run-sec-filing-discovery-index.mjs
  - scripts/check-data.mjs
  - scripts/build-subagent-evidence-packet.mjs
  - scripts/build-discovery-artifact-index.mjs
  - scripts/test-discovery-profiles.mjs
  - scripts/test-discovery-artifact-index.mjs
  - scripts/test-discovery-scan.mjs
  - scripts/test-discovery-readiness-gates.mjs
  - scripts/test-sec-registration-transaction-candidates.mjs
  - research/discovery/runs/2026-06-01-improvement-baseline.json
  - research/discovery/runs/2026-06-01-profile-enriched-scan.json
  - research/discovery/runs/2026-06-01-sec-issuer-scan.json
  - research/discovery/runs/2026-06-01-sec-filing-scan.json
  - research/discovery/runs/2026-06-01-sec-filing-index-index.metadata.json
  - research/discovery/runs/2026-06-01-discovery-artifact-index.json
next_review_date: 2026-07-01
```

## Problem Observed

```yaml
problem_type: discovery recall, coverage auditability, and stale-confidence risk
affected_workflow: deterministic universe discovery and candidate triage
evidence:
  - name-only SEC issuer scans could miss companies whose bottleneck exposure is only visible in research notes, SIC metadata, or filing business sections
  - broad partial profile scans could be mistaken for complete universe evidence without explicit coverage metadata
  - complete-scope profile artifacts could overstate usable coverage if skipped issuers were counted as covered
  - the open-ended unknown future bottlenecks lane could pollute ordinary candidate output if treated like a normal named lane
  - full SEC universe builders needed cache identity validation, cache freshness checks, retry/backoff, and per-CIK audit trails before being safe to use at scale
  - SEC filing HTML fetches needed bounded retry, optional cache-only operation, and per-filing content ledgers before remote filing extraction could be used safely at scale
  - legacy or truncated scan JSON could still satisfy broad freshness gates if validation checked only date and file hash
  - local filing fixtures and mtime-only filing caches could make filing evidence look more durable than it was
  - filing manifests could previously include filings after the requested as-of date
  - targeted partial profile scans could be mistaken for broad universe freshness unless validation separated targeted evidence from broad scan evidence
impact_on_mission: missed early public bottleneck owners are a direct threat to extreme asymmetric compounding
impact_on_discovery_lanes: unknown_future_bottlenecks remains an exploratory lane-review trigger rather than a normal candidate source
impact_on_bottleneck_map_first_process: strengthens lane-first screening by making issuer descriptions and filings searchable without making them buy evidence
frequency: recurring
severity: high
```

## Process Hypothesis

```yaml
hypothesis: discovery quality improves when deterministic scans combine issuer names with source-attributed profile text, explicit coverage metadata, and validation gates that prevent partial evidence from being cited as broad universe coverage
expected_benefit: fewer silent misses, clearer auditability, and safer full-universe SEC discovery runs
possible_harm: larger artifacts and more test surface
success_signal: future discovery reviews can explain what was covered, what was omitted, and why cache or profile evidence is trustworthy
rollback_condition: if profile enrichment creates noisy candidates without improving recall, keep the audit metadata but narrow profile keywords and source families
mission_alignment_check: improves exploration while preserving no-auto-trading, freshness, auditability, and avoidable-ruin controls
review_date: 2026-07-01
```

## Change Made

```yaml
agents_rules: no change
spec_sections:
  - deterministic discovery scan requirements
  - recommended source stack
templates:
  - templates/agentic-discovery-run.md
data_files:
  - research/discovery/lanes.yml
source_code:
  - added profile builders for repo research, manual issuer profiles, SEC issuer metadata, SEC filing manifests, and SEC filing business sections
  - added a repeatable SEC filing discovery index orchestrator that writes manifest, profile, scan, and index metadata artifacts
  - extended discovery scan output with profile coverage metadata, profile-only keyword scope, multi-lane matches, exploratory unknown-lane matches, and recall diagnostics
  - added partial-profile evidence gates to check-data
  - added SEC submissions cache identity validation, cache freshness checks, request-delay guardrails, retry/backoff, and per-CIK submissions ledgers
  - added a shared SEC request helper for discovery, filing, semantic, registration, and market-refresh scripts so SEC live fetches use consistent user-agent handling, accept and compression headers, bounded retry/backoff, `Retry-After`, transient access-control and throttling retries, and request-status audit fields
  - added optional Financial Modeling Prep market-data supplementation with environment-only secrets, ignored local response cache, ignored per-day usage records, conservative daily call budget support, and SEC/Yahoo fallback behavior when the key, quota, or endpoint is unavailable
  - changed issuer-profile coverage status to use actual loaded profile count rather than selected issuer count
  - bound issuer-profile coverage metadata to the current SEC input before the scanner can accept it
  - made SEC submissions caches fail when their observed timestamp is after the requested as-of date
  - made SEC filing profile extraction reject invalid as-of and manifest retrieved_at dates
  - made check-data require deterministic scan output dates to match quality-metrics universe_scan_as_of
  - made check-data require issuer-profile scan output hashes and reject forged complete coverage counts
  - made subagent evidence packets derive deterministic output paths from the current quality-metrics agentic run by default and accept explicit saved deterministic output paths when needed
  - made all saved deterministic JSON outputs require matching hashes in agentic discovery artifacts
  - made broad universe freshness require a broad scan or truly complete profile scan, not merely a targeted partial scan
  - made SEC filing manifests ignore filings after the requested as-of date and made filing profiles reject source dates after retrieved dates
  - made complete issuer-profile validation compare the represented issuer set against the eligible SEC issuer set
  - added SEC filing HTML cache support, cache-only mode, bounded retry/backoff, incremental filing ledger output, and per-profile filing content fetch provenance
  - changed broad freshness validation to require non-truncated scan artifacts with SEC input hashes, lane-map hashes, full omitted-candidate audit fields, and current lane-map binding
  - changed complete issuer-profile validation to bind SEC input hash and counts to the current broad non-profile scan instead of accepting internally self-consistent counts alone
  - changed filing HTML cache validation to use sidecar metadata with source URL, fetch timestamp, retrieval date, payload SHA-256, and SEC user-agent instead of filesystem mtime
  - made local filing paths explicit fixture-only evidence and prevented local-path filing provenance from becoming durable issuer-discovery evidence by default
  - added a discovery artifact index and validation gate so standalone generated discovery JSON and CSV artifacts must be hash-anchored by an agentic run, evidence packet, SEC filing index, or discovery artifact index
  - made discovery artifact indexes reject mismatched filename dates, same-date path violations, unsupported roles, self-anchors, and stale CSV hashes
  - made subagent evidence packets include all non-removed watchlist rows plus candidate-level scan summaries for returned candidates, omitted candidates, exploratory unknown-lane matches, suppressed known matches, recall diagnostics, miss counts, and truncation state
  - made subagent evidence packets validate exact open raw candidate scope and exact candidate-level scan summary fields against the saved deterministic output
  - made allocation-relevant lanes derive from open candidates and current buy-zone lanes so a manually omitted lane cannot hide a material candidate
  - added explicit SEC event-filing discovery support for 8-K, 6-K, 10-Q, S-4, F-4, and DEF 14A supplemental scans
  - added SEC daily master-index registration and transaction candidate extraction for pre-ticker IPO, listing, spinoff, de-SPAC, merger, and transaction leads that are not yet visible in listed-ticker references
  - made broad freshness fail when known public proxy recall misses remain unresolved
  - made `unknown_future_bottlenecks` exploratory matches require an explicit `unknown_future_review`
  - made subagent evidence packets deep-compare embedded quality metrics and candidate-level scan fields against current canonical files and saved deterministic outputs
  - made discovery artifact indexes validate nested profile retrieval dates
  - made active-symbol filing review coverage derive from each active or watch symbol's latest SEC filing event instead of trusting any recent reviewed filing or self-reported quality-metrics counts
  - made buy-capable discovery readiness reject skipped mandatory xhigh roles
  - made discovery source-family validation parse canonical source dates, reject stale source retrieval, and compare evidence-packet source metadata to `research/sources.yml`
  - made readiness sprint notes parse their YAML metadata block and match candidate-readiness records and source IDs instead of passing on substring presence alone
  - added interval support to SEC registration/transaction candidate extraction through `--daily-index-dir`, `--start-date`, and `--end-date`, with `covered_dates`, `missing_or_unscanned_dates`, and optional `--strict-date-coverage`
  - made `check:data` validate the schema, policy-boundary fields, and internally derived coverage-date consistency of saved SEC registration/transaction candidate artifacts instead of only checking their hash anchor
  - normalized SEC MEF form variants such as S-1MEF back to their registration or transaction filing family so pre-ticker discovery does not silently drop common IPO and transaction follow-on registration variants
  - tightened shared date and timestamp validation to reject impossible calendar dates instead of accepting JavaScript date normalization
  - tightened discovery artifact index generation and SEC filing cache timestamp validation with the same impossible-date rejection used by `check:data`
  - split ticker-only known-proxy recall from organic expected-lane recall and added plural keyword variant matching with matched-variant audit output
validation:
  - npm run check:data
  - npm run test:discovery-profiles
  - npm run test:discovery-scan
  - npm run test:discovery-artifact-index
  - npm run test:discovery-gates
  - npm run test:sec-registration-transaction-candidates
  - npm run verify
cleanup: generated current 2026-06-01 discovery artifacts and SEC filing index artifacts under research/discovery/runs
mission_or_lane_map_effect: strengthens exploration coverage; no watchlist or allocation change
subagent_protocol_effect: independent reviewers found coverage and cache-audit gaps that were converted into tests and implementation
```

## Study Plan

```yaml
next_cycle_to_review: next monthly or full discovery cycle
metric_or_signal: profile-enriched candidates that survive primary-source triage, recall diagnostics for known proxies, and any partial-coverage gate failures
decision_quality_question: did the profile and filing paths surface at least one candidate or rejection that name-only scans would have missed?
maintenance_cost_question: are the artifacts and tests still useful, or are they becoming noisy?
subagent_quality_question: did independent review catch material coverage or audit risks that the main agent missed?
```

## Value Assessment And Stop Rule

```yaml
high_value_improvements:
  - separated ticker-seeded known-proxy recall from organic rediscovery so the scanner can no longer claim broad recall merely because a lane already named RKLB, ASTS, VRT, or another known proxy
  - made field-level issuer and filing profile text searchable so a candidate whose bottleneck evidence appears after a bounded aggregate-text slice is less likely to be silently missed
  - added SEC filing, issuer-profile, event-filing, and pre-ticker registration or transaction discovery paths that can surface names not visible from SEC issuer names alone
  - made evidence packets and generated artifacts harder to forge by binding deterministic outputs, source metadata, freshness events, valuation states, lane summaries, dates, and hashes back to canonical repository files
lower_value_if_continued_blindly:
  - adding more validation fields without running real discovery recall and precision reviews
  - broadening keyword lists without primary-source triage of the candidates produced
  - continuing infrastructure work after reviewers find only style or ergonomics issues rather than candidate-loss, false-confidence, or audit-integrity risks
next_highest_value_use:
  - run a real discovery evaluation cycle that measures organic recall, profile-enriched candidates, pre-ticker candidates, false positives rejected after primary-source skim, and same-lane opportunity-cost changes versus RKLB and ASTS
  - ask independent reviewers to judge whether the engine found or rejected any candidate that a name-only scan would have missed
stop_hardening_condition:
  - stop general engine hardening when `check:data`, focused discovery tests, and full verification pass and the remaining reviewer findings do not materially affect recall, precision, source truth, freshness, auditability, or candidate readiness
resume_hardening_condition:
  - resume only when a real discovery run misses a plausible bottleneck owner, admits stale or partial evidence as broad coverage, produces high-noise candidates from avoidable false positives, or leaves a material candidate without reachable-evidence triage
```

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

```yaml
new_skill_needed: false
existing_skill_to_update: true
skill_path: .agents/skills/invest-operating-cycle/SKILL.md
trigger_change: Added SEC registration/transaction candidate discovery and its regression test to useful commands.
canonical_files_changed:
  - SPEC.md
  - README.md
  - templates/agentic-discovery-run.md
validation_or_command_change: npm run verify now covers discovery artifact index tests, profile tests, scan tests, readiness gates, SEC registration/transaction candidate tests, promotion/watchlist gates, and build checks
why_not_just_agents_or_spec: current skill already routes discovery-engine and meta-self-improvement work to canonical files
drift_risk: medium
review_date: 2026-07-01
```
