# Full Operating Cycle Template

Use this when the user asks to run the whole repository flow, execute everything applicable, do a full refresh, or otherwise asks for the repository to use all of its capabilities for the satellite account.

```yaml
request_type: full_operating_cycle
date:
policy_version:
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

1. Load rules and state: `AGENTS.md`, `SPEC.md`, current policy, relevant templates, account files, market files, research files, package scripts, prior decisions, and current git state.
2. Protect confirmed broker truth: separate confirmed account facts from market data, research, analysis, user estimates, screenshots, and proposed orders.
3. Refresh deterministic data: run market-data refresh, data checks, and build/dashboard checks when the request touches those surfaces and tooling is available.
4. Run universe discovery: scan existing raw candidates, mission-relevant themes, newly public names, spinoffs, direct listings, IPOs, and new public proxies. Add, reject, archive, or incubate raw candidates when evidence supports doing so.
5. Run freshness monitoring: check SEC filings, company IR, earnings material, financing, dilution, debt, contracts, regulatory changes, management changes, and price dislocations for holdings, active watchlist symbols, and decision-relevant candidates.
6. Complete filing reviews: read primary filings or official reports for material events before any buy recommendation. Link reviews from freshness events or record immaterial reasons.
7. Refresh valuation and entry states: update or recompute stale states for active and decision-relevant symbols.
8. Run market-regime review when relevant: use the AI-cycle and macro/credit checklist when the active universe depends on AI infrastructure, power, space infrastructure, financing, or broad bubble risk.
9. Run allocation analysis when the user asks for a decision: compare all active candidates and holdings, test mission/evidence/entry gates, size proposed actions from confirmed deployable liquidity, and state trigger and invalidation conditions.
10. Update durable records: research notes, source register, freshness events, valuation states, company-analysis entries, decision notes, market snapshots, equity curve, dashboard-facing data, docs, and templates when the run creates durable facts or behavior.
11. Clean up repository noise: remove or demote stale, duplicated, misleading, generated, or low-signal material without weakening auditability.
12. Validate: run `npm run check:data` for data/research changes and `npm run verify` for dashboard or broad repository changes when practical.
13. Commit and push coherent durable changes when the repository's Git Rules call for it.

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
unavailable_evidence:
next_required_user_input:
```

Do not claim full-cycle completion when an applicable step was skipped because data, tools, time, or user-confirmed broker facts were missing. State the gap and use the conservative account action required by policy.
