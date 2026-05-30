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
5. Run universe discovery: use `npm run discover:universe -- --dry-run` when network access is available, scan existing raw candidates, mission-relevant themes, newly public names, spinoffs, direct listings, IPOs, and new public proxies. Add, reject, archive, or incubate raw candidates when evidence supports doing so.
6. Run freshness monitoring: check SEC filings, company IR, earnings material, financing, dilution, debt, contracts, regulatory changes, management changes, and price dislocations for holdings, active watchlist symbols, and decision-relevant candidates.
7. Run self-evolution and reprioritization: identify thesis delta, entry delta, priority delta, opportunity-cost delta, theme delta, and lane delta. Promote, demote, freeze, remove, or incubate names when fresh evidence supports the change.
8. Complete filing reviews: read primary filings or official reports for material events before any buy recommendation. Link reviews from freshness events or record immaterial reasons.
9. Refresh valuation and entry states: update or recompute stale states for active and decision-relevant symbols.
10. Run market-regime review when relevant: use the AI-cycle and macro/credit checklist when the active universe depends on AI infrastructure, power, space infrastructure, financing, or broad bubble risk.
11. Run allocation analysis when the user asks for a decision: compare all active candidates and holdings, test mission/evidence/entry gates, size proposed actions from confirmed deployable liquidity, and state trigger and invalidation conditions.
12. Run meta-self-improvement: identify process defects, missed-lane risk, source gaps, weak templates, scoring ambiguity, automation opportunities, validation gaps, dashboard confusion, repo-scoped skill updates, or cleanup rules exposed by the run. Use [meta-self-improvement.md](meta-self-improvement.md) for substantial changes.
13. Update durable records: research notes, source register, discovery lanes, discovery candidates, freshness events, valuation states, watchlist priority/status, company-analysis entries, decision notes, market snapshots, equity curve, dashboard-facing data, docs, templates, and process reviews when the run creates durable facts or behavior.
14. Clean up repository noise: remove or demote stale, duplicated, misleading, generated, or low-signal material without weakening auditability.
15. Validate: run `npm run check:data` for data/research changes and `npm run verify` for dashboard or broad repository changes when practical.
16. Commit and push coherent durable changes when the repository's Git Rules call for it.

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
watchlist_priority_changes:
discovery_lane_changes:
new_or_emerging_themes:
meta_self_improvement:
unavailable_evidence:
next_required_user_input:
```

Do not claim full-cycle completion when an applicable step was skipped because data, tools, time, or user-confirmed broker facts were missing. State the gap and use the conservative account action required by policy.
