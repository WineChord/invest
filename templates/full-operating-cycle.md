# Full Operating Cycle Template

Use this when the user asks to run the whole repository flow, execute everything applicable, do a full refresh, or otherwise asks for the repository to use all of its capabilities for the satellite account.

```yaml
request_type: full_operating_cycle
date:
policy_version:
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment:
cycle_scope:
user_goal:
decision_requested:
account_update_requested:
dashboard_update_requested:
research_refresh_requested:
commit_and_push_allowed:
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

1. Load rules and state: `CONSTITUTION.md`, `AGENTS.md`, `SPEC.md`, current policy, relevant templates, account files, market files, research files, package scripts, prior decisions, and current git state.
2. Protect confirmed broker truth: separate confirmed account facts from market data, research, analysis, user estimates, screenshots, and proposed orders.
3. Refresh deterministic data: run market-data refresh, data checks, and build/dashboard checks when the request touches those surfaces and tooling is available.
4. Run bottleneck-lane review: read `research/discovery/lanes.yml`, use [bottleneck-lane-review.md](bottleneck-lane-review.md) when the review is material, ask which future bottlenecks can become unavoidable, valuable, and publicly investable, ask whether a new lane appeared, decide whether existing lanes should be promoted, split, merged, demoted, retired, or left unchanged, and record the lane delta.
5. Run universe discovery: use `npm run discover:universe -- --dry-run` when network access is available, scan existing raw candidates, mission-relevant themes, newly public names, spinoffs, direct listings, IPOs, and new public proxies. Use SEC registration or transaction discovery when pre-ticker IPO, spinoff, de-SPAC, merger, or transaction filings could reveal a candidate before listed-ticker references catch up. Treat deterministic scans as scaffolding only. Use cache-aware coarse-to-fine semantic discovery when the universe is large: build semantic issuer packets, build batch prompts, have the main agent spawn low-reasoning subagents from those prompts, import their JSONL results into the semantic cache, and build a semantic discovery run summary. Reuse unchanged source-backed issuer packets, filing extracts, and semantic classifications; invalidate them when source hashes, filing lists, lane maps, market state, or material events change; use low-reasoning batched subagents for broad business-model and bottleneck classification; use medium reasoning for lane-level comparison; reserve xhigh for material readiness, promotion, valuation, allocation, and unresolved conflicts. Also use independent fresh-context xhigh discovery subagents for broad source search and first-principles bottleneck reasoning when discovery could affect the decision. These subagents must answer the first-layer bottleneck questions before producing ticker lists: what could become scarce, who controls or can remove the scarcity, who can monetize it into shareholder value, whether a public security directly expresses the exposure, and whether the company is early, small, misunderstood, newly listed, awkward, or underfollowed enough for extreme asymmetry. Add, reject, archive, or incubate raw candidates when evidence supports doing so.
6. Run freshness monitoring: check SEC filings, company IR, earnings material, financing, dilution, debt, contracts, regulatory changes, management changes, and price dislocations for holdings, active watchlist symbols, and decision-relevant candidates.
7. Build a dated evidence packet for advisory subagents after deterministic refresh and freshness checks, using `npm run build:evidence-packet -- --as-of YYYY-MM-DD --deterministic-output research/discovery/runs/YYYY-MM-DD-scan.json --output research/discovery/runs/YYYY-MM-DD-subagent-evidence-packet.yml` when practical. Repeat `--deterministic-output` when subagents need multiple saved scans. Use xhigh subagents when available for material discovery, freshness, research-readiness, priority, valuation, allocation, or process conclusions. Subagents may help find and interpret missing primary evidence, but their reasoning does not replace recording source-backed facts and uncertainty.
8. Run the full watchlist-cycle review: for every non-removed `research/watchlist.csv` symbol, record a current row in `research/watchlist-cycle-reviews.csv` covering thesis delta, entry delta, priority delta, status delta, buy-zone delta, action required, next review trigger, sources, and reviewer roles. `no_change` is valid only when recorded with current evidence.
9. Run self-evolution and reprioritization: promote, demote, freeze, remove, or incubate names when fresh evidence supports the change. Use [promotion-review.md](promotion-review.md) before a symbol moves into `active_candidate`, `active_core_candidate`, or buy-zone consideration from a lower status, and use independent fresh-context xhigh promotion reviewers when the change can affect allocation.
10. Run discovery readiness sprints for plausible new candidates that could affect allocation, opportunity cost, lane completeness, or watchlist priority. Retrieve public market data, security metadata, SEC filings, issuer reports, industry context, filing review, valuation state, same-lane peer comparison, and dashboard-facing research coverage when available before leaving the candidate as not buy-ready. Save material sprint notes under `research/discovery/readiness/`, update `research/discovery/candidate-readiness.yml`, and save the agentic discovery run artifact under `research/discovery/runs/`. A material incubating candidate must either be rejected/archived/not-material from evidence or appear as a research-only public stock with security, price, price history, technical, metrics, valuation, filing/freshness, company-analysis, and per-symbol page coverage.
11. Complete filing reviews: read primary filings or official reports for material events before any buy recommendation. Link reviews from freshness events or record immaterial reasons.
12. Refresh valuation and entry states: update or recompute stale states for active and decision-relevant symbols.
13. Run market-regime review when relevant: use the AI-cycle and macro/credit checklist when the active universe depends on AI infrastructure, power, space infrastructure, financing, or broad bubble risk.
14. Run allocation analysis when the user asks for a decision: compare all active candidates and holdings, test mission/evidence/entry/survival/opportunity-cost gates, reconcile xhigh evidence/freshness, valuation/entry, bull-case, bear-case, and allocation/risk reviews, size proposed actions from confirmed deployable liquidity, and state trigger and invalidation conditions. If a non-active symbol now appears superior because of fresh evidence or price dislocation, run a fast-path promotion review before including it in proposed orders.
15. Run meta-self-improvement: identify process defects, missed-lane risk, source gaps, weak templates, scoring ambiguity, automation opportunities, validation gaps, dashboard confusion, repo-scoped skill updates, or cleanup rules exposed by the run. Use [meta-self-improvement.md](meta-self-improvement.md) for substantial changes.
16. Update durable records: research notes, source register, discovery lanes, discovery candidates, freshness events, valuation states, watchlist-cycle reviews, watchlist priority/status, watchlist transitions, buy-zone rows, company-analysis entries, decision notes, market snapshots, equity curve, dashboard-facing data, docs, templates, and process reviews when the run creates durable facts or behavior.
17. Clean up repository noise: remove or demote stale, duplicated, misleading, generated, or low-signal material without weakening auditability.
18. Validate: run `npm run check:data` for data/research changes and `npm run verify` for dashboard or broad repository changes when practical. A material run is not complete until `research/quality-metrics.yml` is ready for repository and public-observable evidence. Missing user-only broker facts should be reported as execution prerequisites, not as repository not-readiness.
19. Commit and push coherent durable changes when the repository's Git Rules call for it.

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
decision_readiness:
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
meta_self_improvement:
unavailable_evidence:
next_required_user_input:
```

Do not claim full-cycle completion when an applicable repository or public-evidence step was skipped. Continue until the repository-public research state is ready, or until the only remaining items are genuine external blockers or user-only execution prerequisites such as broker cash confirmation, broker order preview, or final user instruction.
