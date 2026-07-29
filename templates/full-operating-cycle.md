# Full Operating Cycle Template

Use this when the user asks to run the whole repository flow, execute everything applicable, do a full refresh, or otherwise asks for the repository to use all of its capabilities for the satellite account.

```yaml
request_type: full_operating_cycle
date:
policy_version:
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment:
article1_preflight:
lower_level_conflicts_found:
lower_level_artifacts_revised:
article1_postflight:
cycle_scope:
user_goal:
decision_requested:
account_update_requested:
dashboard_update_requested:
research_refresh_requested:
commit_and_push_allowed:
publication_release_status:
public_release_earliest_at:
contains_actionable_trading_content:
sensitive_field_review_status:
```

## Trigger Interpretation

State which trigger fired:

- routine repository interaction;
- investment decision request;
- full-cycle repository request;
- execution-confirmation update;
- dashboard/product work;
- research-only refresh.

If the user asked for a decision, this template must be used together with [monthly-decision.md](monthly-decision.md).

## Execution Order

Run every applicable item in this order. If an item is not applicable, say why.

1. Run the Article 1 preflight, then load rules and state: `CONSTITUTION.md`, `AGENTS.md`, `SPEC.md`, `PUBLICATION_POLICY.md`, current policy, relevant templates, account files, market files, research files, package scripts, prior decisions, and current git state. Apply any due standing contribution with the deterministic account command before using liquidity in a decision. Identify any lower-level artifact that conflicts with the mission and revise it during the same authorized work when practical.
2. Protect confirmed broker truth: separate confirmed account facts from market data, research, analysis, user estimates, screenshots, and proposed orders.
3. Refresh deterministic data: run market-data refresh, data checks, and build/dashboard checks when the request touches those surfaces and tooling is available.
4. Run bottleneck-lane review: read `research/discovery/lanes.yml`, use [bottleneck-lane-review.md](bottleneck-lane-review.md) when the review is material, ask which future bottlenecks can become unavoidable, valuable, and publicly investable, ask whether a new lane appeared, decide whether existing lanes should be promoted, split, merged, demoted, retired, or left unchanged, and record the lane delta.
5. Run universe discovery: use `npm run discover:universe -- --dry-run` when network access is available, scan existing raw candidates, mission-relevant themes, newly public names, spinoffs, direct listings, IPOs, and new public proxies. Run `npm run scan:community -- --as-of YYYY-MM-DD` and then `npm run triage:community -- --as-of YYYY-MM-DD` as the no-token community attention layer; community triage may raise analysis priority, watchlist-cycle priority, or primary-source skim priority, but it must not create buy eligibility, promotion eligibility, security metadata, or candidate records by itself. If community triage affects a durable candidate, readiness, watchlist, or discovery-run conclusion, rerun it with a durable sanitized output path under `research/discovery/runs/` and record its hash; default ignored cache output is only scratch evidence. Use SEC registration or transaction discovery when pre-ticker IPO, spinoff, de-SPAC, merger, or transaction filings could reveal a candidate before listed-ticker references catch up. Treat deterministic scans as scaffolding only. Use cache-aware coarse-to-fine semantic discovery when the universe is large: build semantic issuer packets, build batch prompts, have the main agent spawn low-reasoning subagents from those prompts, import their JSONL results into the semantic cache, and build a semantic discovery run summary. Reuse unchanged source-backed issuer packets, filing extracts, and semantic classifications; invalidate them when source hashes, filing lists, lane maps, market state, or material events change; use low-reasoning batched subagents for broad business-model and bottleneck classification; use medium reasoning for lane-level comparison; reserve xhigh for material readiness, promotion, valuation, allocation, and unresolved conflicts. Also use independent fresh-context xhigh discovery subagents for broad source search and first-principles bottleneck reasoning when discovery could affect the decision. These subagents must answer the first-layer bottleneck questions before producing ticker lists: what could become scarce, who controls or can remove the scarcity, who can monetize it into shareholder value, whether a public security directly expresses the exposure, and whether the company is early, small, misunderstood, newly listed, awkward, or underfollowed enough for extreme asymmetry. Add, reject, archive, or incubate raw candidates only when primary-source evidence supports doing so; community heat can move a symbol into the skim queue but cannot skip the normal gates.
6. Run freshness monitoring: check SEC filings, company IR, earnings material, financing, dilution, debt, contracts, regulatory changes, management changes, and price dislocations for holdings, active watchlist symbols, and decision-relevant candidates.
7. Build a dated evidence packet for advisory subagents after deterministic refresh and freshness checks, using `npm run build:evidence-packet -- --as-of YYYY-MM-DD --deterministic-output research/discovery/runs/YYYY-MM-DD-scan.json --output research/discovery/runs/YYYY-MM-DD-subagent-evidence-packet.yml` when practical. Repeat `--deterministic-output` when subagents need multiple saved scans or community triage artifacts. Use xhigh subagents when available for material discovery, freshness, research-readiness, priority, valuation, allocation, or process conclusions. Subagents may help find and interpret missing primary evidence, but their reasoning does not replace recording source-backed facts and uncertainty.
8. Run the full watchlist-cycle review: for every non-removed `research/watchlist.csv` symbol, record a current row in `research/watchlist-cycle-reviews.csv` covering thesis delta, entry delta, priority delta, status delta, buy-zone delta, action required, next review trigger, sources, and reviewer roles. `no_change` is valid only when recorded with current evidence. Coverage does not require equal depth: use lightweight continuity checks for low-signal names and concentrate deep judgment on holdings, active/core names, event-triggered symbols, and genuine challengers.
9. Run self-evolution and reprioritization: promote, demote, freeze, remove, or incubate names when fresh evidence supports the change. Use [promotion-review.md](promotion-review.md) before a symbol moves into `active_candidate`, `active_core_candidate`, or buy-zone consideration from a lower status, and use independent fresh-context xhigh promotion reviewers when the change can affect allocation.
10. Advance plausible new candidates through the R0-R3 discovery funnel with stage-adjusted evidence. R1 and R2 candidates may stay open under a dated service-level agreement that records the next source, due date, waiting cost, false-negative early warning, and reopen-or-reject trigger. R3 carries the full filing, valuation, independent-review, and dashboard-equivalent burden. Save material sprint notes under `research/discovery/readiness/`, update `research/discovery/candidate-readiness.yml`, and save the agentic discovery run artifact under `research/discovery/runs/`.
11. Complete filing reviews: read primary filings or official reports for material events before any buy recommendation. Link reviews from freshness events or record immaterial reasons.
12. Refresh valuation and entry states: update or recompute stale states for active and decision-relevant symbols.
13. Run market-regime review when relevant: use the AI-cycle and macro/credit checklist when the active universe depends on AI infrastructure, power, space infrastructure, financing, or broad bubble risk. Refresh or cite `research/macro/regime-snapshots.csv`, `research/macro/watchlist-sensitivity.csv`, `research/macro/financing-runway-scores.csv`, `research/macro/watchlist-risk-matrix.csv`, and `research/macro/event-calendar.csv`. Macro can change research priority, entry caps, sizing, cash/SGOV preference, and financing-review urgency, but it must not create buy eligibility or bypass company primary evidence gates.
14. Run allocation analysis when the user asks for a decision: compare holdings, active candidates, material R2/R3 challengers, cash, and reserve; test mission/evidence/entry/survival/opportunity-cost gates; and reconcile xhigh evidence/freshness, valuation/entry, bull-case, bear-case, and allocation/risk reviews. Compute liquidity-option weight and the mission-accountability clock. For each top contender compare zero, the smallest mission-consistent staged exposure, and a fully underwritten weight range; record maximum permanent impairment, portfolio scenario impact, waiting cost, scale or exit milestones, and the next evidence deadline. If a non-active symbol now appears superior because of fresh evidence or price dislocation, run a fast-path promotion review before including it in proposed orders.
15. Run meta-self-improvement: identify process defects, missed-lane risk, source gaps, weak templates, scoring ambiguity, automation opportunities, validation gaps, dashboard confusion, repo-scoped skill updates, or cleanup rules exposed by the run. Use [meta-self-improvement.md](meta-self-improvement.md) for substantial changes. When enough time has elapsed to judge a prior decision or discovery pass, append a row to `research/process/decision-retrospectives.csv` using [decision-retrospective.md](decision-retrospective.md).
16. Update durable records: research notes, source register, discovery lanes, discovery candidates, freshness events, valuation states, watchlist-cycle reviews, watchlist priority/status, watchlist transitions, buy-zone rows, position-construction records, company-analysis entries, decision notes, market snapshots, equity curve, dashboard-facing data, docs, templates, and process reviews when the run creates durable facts or behavior. For every full operating-cycle or monthly-decision full-cycle run, append or refresh a public-safe row in `research/operating-runs.csv` linking the decision note, structured run artifact when available, evidence packet, validation summary, publication status, primary symbols, and confirmed ledger event IDs with their recorded confirmation source. The SEC step must supplement the standard event index with a submissions-delta review of ownership, compensation, financing, and private-offering forms such as Form 3/4/144, Schedule 13D/13G amendments, Form D, DEFA14A, and S-8.
17. Run the publication release checklist from `PUBLICATION_POLICY.md`: identify actionable trading content, public release earliest time, embargo status, redaction status, sensitive-field review result, compensation or material-connection issues, and whether commit, push, deployment, or external posting must wait.
18. Clean up repository noise: remove or demote stale, duplicated, misleading, generated, or low-signal material without weakening auditability.
19. Validate and run the Article 1 postflight: run `npm run check:data` for data/research changes and `npm run verify` for dashboard or broad repository changes when practical. Report target readiness, opportunity-set sufficiency, bounded discovery debt, and repository health separately. A material run cannot propose an order with an unresolved decision-critical target or opportunity-cost gap; unrelated process debt does not become a portfolio-wide veto. Missing user-only broker facts are execution prerequisites, not repository not-readiness. Confirm that the result advanced the mission or preserved a necessary mission boundary rather than adding ceremony or inactivity.
20. Commit and push coherent durable changes only when the repository's Git Rules and the public release embargo allow it.

## Completion Report

The final response must include:

```yaml
operating_cycle_status:
steps_executed:
steps_skipped_with_reasons:
files_changed:
validations_run:
validation_result:
committed:
pushed:
target_readiness:
opportunity_set_sufficiency:
bounded_discovery_debt:
repository_health:
mission_accountability:
article1_offensive_challenge:
article1_preflight:
article1_postflight:
constitutional_alignment:
subagents_run:
subagents_skipped_with_reasons:
subagent_conflicts_and_resolution:
watchlist_priority_changes:
watchlist_cycle_review:
promotion_reviews:
buy_zone_changes:
discovery_lane_changes:
new_or_emerging_themes:
agentic_discovery_run_path:
subagent_evidence_packet_path:
candidate_readiness_blockers:
operating_run_index_path:
meta_self_improvement:
unavailable_evidence:
next_required_user_input:
publication_release:
```

Do not claim a decision-ready target when decision-critical target or opportunity-cost work was skipped. Keep bounded discovery and repository-health debt visible with due dates and scope, but do not confuse it with allocation evidence. User-only execution prerequisites such as broker cash confirmation, broker order preview, or final user instruction remain separate.
