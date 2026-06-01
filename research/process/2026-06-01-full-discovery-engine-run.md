# Full Discovery Engine Run

```yaml
run_date: 2026-06-01
operator: codex
policy_version: v1.1
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment: improves complete-universe discovery recall, cache discipline, and automation auditability without changing broker-confirmed account records
run_type: full_discovery_engine_and_market_automation_validation
market_data_as_of: 2026-06-01
decision_scope: research_engine_process_only
buy_recommendation_scope: none
```

## Executive Summary

The run completed a full semantic discovery pass across the SEC-listed NYSE, Nasdaq, and NYSE American universe, using cached complete-universe issuer packets, a low-cost classifier, a fixed worker-pool audit plan, and advisory subagent review. It did not create buy eligibility, order sizing, or account-state changes. It improved the engine where the run exposed real process defects: GitHub Actions market-data cache reuse, durable security metadata commits, semantic cache invalidation, ticker-suffix false positives, review-packet validation, cache-only artifact guards, fixed-pool subagent orchestration, and generic-keyword noise control.

The durable semantic run now records full current coverage for 7,575 issuer packets under `semantic_triage_v5`. Final triage counts are 24 `xhigh_readiness_candidate`, 49 `medium_lane_compare`, 62 `reject_or_archive`, and 7,440 `none`. The committed run artifact keeps summary and review queues; complete issuer packets, full SEC issuer profiles, classifier JSONL results, and batch work orders remain under ignored cache.

## Source Coverage

```yaml
listed_universe_sources:
  - SEC company_tickers_exchange snapshot under research/cache/company_tickers_exchange-2026-06-01.json
  - SEC submissions metadata profile input under research/cache/discovery/2026-06-01/2026-06-01-full-sec-issuer-profiles.json
discovery_lanes_reviewed: research/discovery/lanes.yml
semantic_profile_coverage:
  eligible_issuer_packets: 7575
  current_classifications: 7575
  stale_cache_count: 0
  classifier_version: semantic_triage_v5
optional_market_data_providers:
  fmp_api_key_available: true
  fmp_mode: missing
  fmp_daily_call_budget: 60
  fmp_uncached_calls_used_in_action_validation: 2
  fmp_cache_status: restored_and_saved_through_unique_github_actions_cache_keys
cache_inputs_reused:
  - SEC submissions metadata cache
  - ignored semantic issuer packet cache
  - ignored semantic classifier result cache
cache_inputs_invalidated:
  - semantic classification rows without classifier_version
  - classifier output affected by ticker-suffix rejection bug
unavailable_sources: []
```

## Universe Discovery

```yaml
bottleneck_map_first_review: completed
lane_map_as_of: 2026-06-01
coarse_to_fine_semantic_pass: completed_full_sec_listed_universe
semantic_packet_artifact: research/cache/discovery/2026-06-01/2026-06-01-semantic-packets.json
semantic_classification_import: research/discovery/runs/2026-06-01-semantic-import.json
semantic_discovery_run: research/discovery/runs/2026-06-01-semantic-discovery-run.json
semantic_review_packet: research/discovery/runs/2026-06-01-semantic-review-packet.json
semantic_classifier_version: semantic_triage_v5
semantic_batch_cache_status: no_uncached_packets_remaining_for_current_packet_and_lane_hash
semantic_worker_pool_status:
  cache_first_full_universe:
    eligible_issuer_packets: 7575
    skipped_current_cache_count: 7575
    pending_low_reasoning_worker_assignments: 0
  forced_quality_audit:
    first_escalated_audit_pool: 277 symbols reviewed across 4 low-reasoning worker slots
    post_rule_update_audit_pool: 78 symbols reviewed or sampled across 4 low-reasoning worker slots
    final_escalated_review_pool: 73 symbols after v5 triage
cache_only_intermediates:
  - research/cache/discovery/2026-06-01/2026-06-01-full-sec-issuer-profiles.json
  - research/cache/discovery/2026-06-01/2026-06-01-semantic-packets.json
  - research/cache/discovery/2026-06-01/semantic-heuristic-results.jsonl
durable_semantic_summary:
  packet_count: 7575
  classified_current_count: 7575
  classification_coverage_ratio: 1
  xhigh_readiness_candidate: 24
  medium_lane_compare: 49
  reject_or_archive: 62
  no_escalation: 7440
agentic_discovery_subagents:
  - xhigh candidate triage reviewer
  - medium lane and false-negative reviewer
  - discovery process/cache red-team
  - GitHub Action/data-refresh reviewer
new_candidates_added: []
promoted_to_watchlist: []
rejected_or_archived: []
deep_dive_queue:
  direct_readiness_attention:
    - VOYG
    - MNTS
    - YSS
  source_backed_medium_review_before_readiness:
    - AIP
    - ARQQ
    - FNUC
    - GILT
    - HQ
    - JAGU
    - MDA
    - NNE
    - NUCL
    - POET
    - BZAI
    - SKYT
    - UEC
    - UROY
    - QUBT
```

The main run accepted the subagent finding that `VOYG` and `MNTS` are the most plausible newly surfaced direct readiness candidates from the high-priority space bucket. It also accepted that many medium hits are useful as a recall layer but too noisy for direct promotion, especially generic AI compute, broad semiconductor, and unknown-future-bottleneck matches. No watchlist promotion was made because this run was process and discovery execution, not a source-backed readiness sprint or allocation decision.

The later fixed-pool review also kept `YSS` in the direct readiness queue because both its name and SEC metadata point to space systems, while downgrading name-only or thin-evidence quantum, nuclear, uranium, satellite, and space hits to medium lane comparison instead of xhigh readiness.

## Durable Fixes

```yaml
github_action_fixes:
  - daily market-data workflow now commits data/market/security_master.csv when refresh hydrates ticker metadata
  - FMP GitHub Actions cache now uses a unique per-run key with stable restore prefixes so new cache entries can be saved and reused
semantic_cache_fixes:
  - semantic classifications now carry classifier_version
  - current cache validity requires classifier_version in addition to packet hash, lane-map hash, schema version, and cache_valid
  - importer replaces superseded rows for the same issuer scope instead of accumulating stale duplicates
classifier_precision_fixes:
  - common-stock tickers ending in R, U, or W are no longer rejected as rights, units, or warrants without a delimiter or explicit security-form evidence
  - profile keywords are matched against source-attributed profile blocks instead of the combined symbol/name/status text
  - paired no-delimiter warrant symbols such as ARQQW, BNAIW, NUCLW, QSIAW, RCKTW, and HQWWW are filtered by same-CIK common-equity linkage or missing market-data evidence
  - fund, trust, REIT, preferred, right, unit, duplicate-security, and obvious non-common-instrument noise is rejected before semantic escalation
  - generic SEC categories such as Services-Computer Processing & Data Preparation, Electronic Computers, and Semiconductors & Related Devices no longer create medium or xhigh escalation without stronger lane-specific evidence
  - solar, generic optical, spectrum-brand, HBM-symbol, quantum-name, and space-name collisions are guarded against
  - name-only quantum, nuclear, uranium, satellite, and space matches default to medium lane comparison unless a current proxy, watchlist state, discovery state, or stronger direct-readiness evidence supports xhigh
semantic_worker_pool_fixes:
  - scripts/build-semantic-worker-pool.mjs now turns batch manifests into fixed-size worker-pool work orders with deterministic result paths and cache-first no-work accounting
  - package.json exposes npm run build:semantic-worker-pool
  - semantic discovery tests cover worker-pool assignment, current-cache skipping, paired warrant filtering, and common-stock trailing-letter safety
durable_artifact_fixes:
  - semantic run keeps only a no-escalation sample rather than all 7,262 no-escalation rows
  - semantic review packet is generated by script and validated against the semantic run hash and summary counts
  - check-data rejects tracked files under research/cache/ or research/downloads in real git worktrees
  - discovery artifact index classifies semantic review packets explicitly
```

## Advisory Subagent Synthesis

```yaml
accepted_findings:
  - VOYG and MNTS deserve the next source-backed readiness attention from the high-priority space group
  - YSS deserves direct readiness attention after v5 because both name and SEC metadata point to space systems
  - GEMI, MSAI, OPTX, OPXS, QMCO, QSI, and many no-delimiter warrant symbols were high-priority false positives or weak proxies under earlier heuristic passes
  - UROY is better treated as medium uranium lane comparison rather than xhigh readiness because the packet indicates royalty or commodity exposure, not direct fuel-cycle control
  - LUNR, RDW, and LEU were wrongly demoted by the trailing-letter security-form heuristic and must remain high-priority current public proxies
  - the medium queue is useful for recall but should stay small enough for source-backed lane comparison; v5 reduced it to 49 symbols
  - FMP cache reuse and security_master commits needed workflow fixes
  - semantic cache needed classifier-version invalidation
unresolved_conflicts: []
allocation_effect: none
```

## Validation

```yaml
commands:
  - npm run check:data
  - npm run test:semantic-discovery
  - npm run test:discovery-artifact-index
  - npm run test:discovery-gates
  - npm run verify
result: passed
```

## Next Research Work

This run makes the discovery engine more complete and less wasteful, but it does not finish readiness research for any new ticker. The next high-value research step is a source-backed readiness sprint for `VOYG`, `MNTS`, and `YSS`, followed by medium-lane comparisons for the remaining 49 medium symbols. The medium queue should be enriched with business-description evidence before promotion decisions, not promoted from SIC or name tokens alone.
