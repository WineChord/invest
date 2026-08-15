# Periodic Allocation Decision Template

Use this when asking: "New cash is available. What should I buy or sell?" The filename remains stable for existing workflow links; the decision cadence is not tied to the contribution cadence.

```yaml
request_type: monthly_decision
full_decision_operating_cycle_required: true
date:
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment:
article1_preflight:
lower_level_conflicts_found:
lower_level_artifacts_revised:
article1_postflight:
deposit_confirmed:
deposit_confirmation_basis:
standing_contribution_due_date:
deposit_amount:
currency: USD
broker:
account_alias:
cash_available_for_trading:
settled_cash:
confirmed_liquidity_reserve_value:
liquidity_reserve_available_for_sale:
fractional_shares_allowed:
fees_or_commissions:
liquidity_reserve_enabled:
liquidity_reserve_symbol: SGOV
broker_settlement_constraints:
current_positions:
  - symbol:
    quantity:
    average_cost:
    market_value:
portfolio_snapshot:
  latest_reliable_research_nav:
  confirmed_cash:
  confirmed_liquidity_reserve_market_value:
  liquidity_option_weight_pct:
  high_liquidity_option_since:
  latest_confirmed_return_seeking_buy_date:
  latest_mission_relevant_deployment_date:
  days_since_latest_mission_relevant_deployment:
  mission_accountability_status:
  ticker_weights:
  theme_weights:
readiness:
  target_readiness:
  opportunity_set_sufficiency:
  repository_health:
  bounded_discovery_debt:
pending_orders:
constraints_or_preferences:
latest_ai_cycle_monitor:
publication_release_status:
public_release_earliest_at:
contains_actionable_trading_content:
sensitive_field_review_status:
```

## First-Principles Analysis

Complete this before relying on an inherited rating, status, narrative, comparable multiple, historical analogy, or price pattern. Start from current primary evidence and confirmed account facts. For company or security work, carry the causal chain through dilution-adjusted per-share value and feasible portfolio impact. Comparables and analogies may test the reconstruction; they may not replace it.

```yaml
first_principles_analysis:
  question_rebuilt_from_basics:
  irreducible_facts:
  binding_constraints:
  causal_chain:
  inherited_assumptions_challenged:
  value_capture_or_mission_link:
  disconfirming_evidence:
  decision_consequence:
```

Natural-language trigger:

Treat the request as `monthly_decision` when the user says they deposited cash, asks what to buy or sell, asks whether to deploy cash, asks whether to use SGOV, or asks for an allocation decision. The user does not need to paste this template for the full decision operating cycle to be mandatory.

If the user asks to run the whole repository flow, execute everything, do a full refresh, or use equivalent full-cycle language, use [full-operating-cycle.md](full-operating-cycle.md) in addition to this template.

Minimum needed for exact share counts:

- confirmed available cash;
- confirmed liquidity reserve value and whether it is available for sale;
- whether fractional shares are allowed;
- current holdings if they differ from repository records;
- any fees or commissions.
- whether the approved liquidity reserve is available and eligible in the user's broker account.

The agent must run the full decision operating cycle before recommending any orders. This is not just a price refresh; it is the required exploration, freshness, research, valuation, allocation, cleanup, and validation loop that keeps the repository from choosing from a stale watchlist.

The agent must also apply [PUBLICATION_POLICY.md](../PUBLICATION_POLICY.md). A decision that includes exact proposed orders, exact share counts, exact dollar order sizes, reserve-sale instructions, same-day trade intent, broker order previews, or confirmed same-day execution details is actionable trading content. It must remain local and unpublished until the public release embargo expires, unless the public artifact removes the actionable details or marks the decision as expired.

Full decision operating cycle before proposing orders:

- Load `CONSTITUTION.md`, `AGENTS.md`, `SPEC.md`, `PUBLICATION_POLICY.md`, current policy, account files, prior decisions, package scripts, research state, and dashboard/data surfaces relevant to the request.
- Determine the freshness window from the latest decision, latest research-engine run, latest market-data refresh, and the decision date.
- Refresh deterministic market data with repository tooling when available.
- Review `research/discovery/lanes.yml` and use [bottleneck-lane-review.md](bottleneck-lane-review.md) when material. Start from the bottleneck map, explicitly ask whether a new lane appeared, and record whether existing lanes should be promoted, split, merged, demoted, retired, or left unchanged.
- Run `npm run discover:universe -- --dry-run` when network access is available, and treat results as raw leads that require primary-source skims before promotion.
- Run `npm run scan:community -- --as-of YYYY-MM-DD` and `npm run triage:community -- --as-of YYYY-MM-DD` when public network access is available. Treat community output as an attention and analysis-priority layer only: it can raise watchlist-cycle review priority or send unknown symbols to security-type confirmation plus primary-source skim, but it cannot create raw candidate records, promotion eligibility, buy eligibility, or allocation evidence by itself. If community triage affects a durable discovery, readiness, watchlist, or allocation conclusion, rerun the triage command with a sanitized committed output path under `research/discovery/runs/` and record its hash; ignored cache output is not enough for durable audit.
- Use cache-aware coarse-to-fine semantic discovery when broad universe work is needed. Build semantic issuer packets, build batch prompts, let the main agent spawn low-reasoning subagents from those prompts, import their JSONL results into the semantic cache, and build a semantic discovery run summary. Reuse unchanged, source-backed issuer packets, filing extracts, semantic classifications, and prior rejection/incubation reasons only when hashes, dates, scope, and invalidation rules remain valid. Refresh volatile surfaces such as new filings, current prices, market cap, financing, dilution, contracts, regulator actions, management changes, new listings, and price dislocations. Use low-reasoning batched subagents for broad semantic classification, medium reasoning for lane comparison and false-positive rejection, and xhigh only where a conclusion can affect discovery readiness, watchlist status, valuation, buy-zone eligibility, allocation, or unresolved conflicts.
- Use independent fresh-context xhigh discovery subagents when discovery could affect allocation. They should search broad current public sources, think from first principles about emerging bottlenecks, answer the first-layer bottleneck questions before producing ticker lists, identify candidates fixed keyword scans may miss, and challenge stale lane or watchlist assumptions. The first-layer questions are: what could become scarce, who controls or can remove the scarcity, who can monetize it into shareholder value, whether a public security directly expresses the exposure, and whether the company is early, small, misunderstood, newly listed, awkward, or underfollowed enough for extreme asymmetry.
- Review `research/discovery/candidates.csv` for any candidate that should be promoted, rejected, or kept incubating.
- Scan mission-relevant themes for newly public companies, major spinoffs, IPOs, direct listings, pre-ticker registration or transaction filings, and new public proxies that might deserve raw discovery status.
- For any plausible new candidate that could affect allocation, opportunity cost, lane completeness, or watchlist priority, advance it through the R0-R3 discovery funnel using stage-adjusted evidence. R1 and R2 may remain open under a dated service-level agreement with a next source, due date, waiting cost, false-negative warning, and reopen-or-reject trigger. R3 carries the complete promotion and dashboard burden.
- Save material discovery evidence in `research/discovery/runs/`, update `research/discovery/candidate-readiness.yml`, and link material sprint notes under `research/discovery/readiness/`. A buy recommendation cannot rely on a prose claim that discovery ran when these structured artifacts are missing for material discovery work.
- Review `research/freshness/events.csv` for open `high` or `critical` events.
- Review `research/valuation-states.csv` for stale or changed entry states.
- Review `research/quality-metrics.yml` for stale research coverage, open critical events, stale valuation states, stale theses, and filing-review gaps.
- Check for new SEC filings, IR releases, earnings materials, financing updates, dilution, debt, contract wins or losses, regulatory changes, and management changes since the last decision.
- Build a dated evidence packet for advisory reviewers, using `npm run build:evidence-packet -- --as-of YYYY-MM-DD --deterministic-output research/discovery/runs/YYYY-MM-DD-scan.json --output research/discovery/runs/YYYY-MM-DD-subagent-evidence-packet.yml` when practical. Repeat `--deterministic-output` when reviewers need multiple saved scans. The packet should include policy version, confirmed account facts, freshness window, the exact open raw candidate set with source trail, every non-removed watchlist row, source publication dates, retrieval dates, exact candidate-level deterministic scan summaries, open freshness events, valuation states, quality metrics, allowed assets, and specific questions.
- Run xhigh advisory subagents when available. For any decision that may buy, add, trim, exit, sell a reserve, deploy cash, or deliberately hold cash while cash is available, use at least evidence/freshness, bull-case, bear-case, and allocation/risk reviewers. For major discovery changes, also use a discovery-lane/candidate triage reviewer.
- Run the full watchlist-cycle review: every non-removed `research/watchlist.csv` symbol needs a current `research/watchlist-cycle-reviews.csv` row. Record thesis delta, entry delta, priority delta, status delta, buy-zone delta, action required, next review trigger, sources, and reviewer roles. Do this even when the conclusion is `no_change`.
- Run the self-evolution check: identify which watchlist theses strengthened or weakened, which entries became more or less attractive, which names deserve priority/status changes, and whether a new theme, industry, bottleneck, or market-structure change deserves a discovery lane.
- Run a promotion review using [promotion-review.md](promotion-review.md) before a `research_only`, `watch`, `probation`, or `frozen` symbol can enter `active_candidate`, `active_core_candidate`, or current buy-zone consideration. This review must compare the symbol against current core candidates, cash, and the approved liquidity reserve, and it must use independent fresh-context xhigh evidence/freshness, valuation/entry, bull-case, bear-case, and opportunity-cost/allocation reviewers when tooling is available.
- Apply the fast-path promotion rule when a material filing, contract, regulatory event, financing event, launch result, customer update, competitor weakening, or price dislocation could change buy-zone ranking. Do not wait for the next monthly cadence; refresh evidence and either promote, demote, incubate, reject, or record the event as immaterial.
- Run or cite [weekly-ai-cycle-monitor.md](weekly-ai-cycle-monitor.md) when the decision depends on AI capex, AI financing, semiconductor supply chains, data-center power, credit conditions, or broad bubble risk. Refresh or cite the structured macro layer under `research/macro/`: `regime-snapshots.csv`, `watchlist-sensitivity.csv`, `financing-runway-scores.csv`, `watchlist-risk-matrix.csv`, and `event-calendar.csv`. Use macro only as an entry, sizing, financing-risk, research-priority, cash/SGOV, and event-timing overlay; do not use it to bypass promotion, buy-zone, or primary-evidence gates.
- If a material filing exists, complete or cite a filing review using [filing-review.md](filing-review.md) before buying that symbol.
- Report target readiness, opportunity-set sufficiency, and repository health separately. Resolve decision-critical target and opportunity-cost gaps before proposing an order. Keep bounded R0-R2 discovery debt and unrelated repository-health debt visible and dated, but do not use them as a portfolio-wide veto.
- If a material raw candidate has `repo_work_remaining`, complete the readiness sprint before finishing, or convert it to an evidence-based incubate/reject/not-tradable/not-material/genuinely-external conclusion. A material incubating candidate is not complete until it is visible in the research-only dashboard universe with the same supporting market, filing, valuation, and company-analysis surfaces as other research stocks.
- Reconcile subagent findings explicitly. Do not vote or average. Unresolved truth, tradability, survival, permanent-impairment, material valuation-bound, filing, or broker-fact uncertainty blocks the affected target. Normal probability, timing, or starting-size disagreement should be bounded through scenarios, staging, milestones, and shorter validity.
- State when a company is good but not attractively priced, or when a price looks cheap but the thesis may be broken.
- State when no stock passes the gates and the best action is no trade, hold cash, or park idle cash in the approved liquidity reserve.
- State when a stock passes the gates strongly enough to justify using total confirmed deployable liquidity, including SGOV or equivalent reserve sales, instead of limiting the order to the latest weekly contribution.
- Run the Article 1 offensive challenge before finalizing zero exposure: compare zero, the smallest mission-consistent staged exposure, and a fully underwritten range for the strongest contender. Record why zero or nonzero wins, cash opportunity cost, and the next evidence deadline.
- Confirm the target passes the mission gate, evidence gate, and entry gate from `AGENTS.md`.
- Run the meta-self-improvement check: note whether the cycle exposed a durable process defect, missed-lane risk, source gap, weak template, automation opportunity, validation gap, scoring ambiguity, or dashboard/data problem.
- Run repository cleanup before finishing: demote stale research, remove or ignore scratch/generated noise, update canonical docs or templates when behavior changes, and preserve auditability.
- Update `research/operating-runs.csv` when the allocation decision also ran the full operating cycle. The row should summarize the analysis and decision in public-safe language, link the decision note and run artifacts, record validation and publication status, and link only confirmed ledger event IDs with their recorded confirmation source.
- Run the publication release checklist before any commit, push, deployment, or external post. Delay or redact actionable trading content, raw broker identifiers, raw screenshots, local paths, private cache payloads, secrets, and compensated or personalized language.
- Run applicable validation. Use `npm run check:data` for data/research changes and `npm run verify` for dashboard or broad repository changes when practical.
- Do not finish with a decision-critical target or opportunity-set gap that is publicly reachable and unbounded. Repository-health and bounded discovery debt may remain only with explicit scope, owner or next source, due date, and evidence that it cannot change the current allocation conclusion. User-only broker facts, broker order previews, and final execution instructions are execution prerequisites, not repository-readiness blockers.
- If a decision-critical target or opportunity-cost step cannot be completed, do not give a buy recommendation for the affected target unless the missing item is explicitly reviewed, bounded by evidence and sizing, marked immaterial, genuinely unavailable, user-only, broker-specific, legally inaccessible, caused by market closure or missing quote, or already resolved by evidence showing the candidate fails a gate. Unrelated dashboard, formatting, low-priority research, or other process debt must remain visible and dated but cannot veto a decision-ready rare opportunity.

Output discipline:

- Include a `Decision operating cycle` section with constitutional alignment, sources checked, discovery lane changes, discovery candidate changes, watchlist-cycle review result, watchlist priority changes, thesis/entry deltas, freshness events, filing-review status, valuation-state status, meta-self-improvement findings, cleanup performed, validations run, readiness result, unavailable evidence, and validity window.
- Include a `Publication release` section with whether the content is actionable, the earliest public release time, embargo status, redaction status, sensitive-field review result, and any reason a commit, push, or deployment must wait.
- Include a `Subagent reviews` section when subagents ran or should have run. State which reviewers ran, which were skipped and why, the major disagreements, how the main agent resolved them, and whether any unresolved conflict forced no trade, hold cash, or the approved liquidity reserve.
- Separate facts, inferences, probability scenarios, and proposed account actions.
- Mark unavailable or unverifiable data explicitly.
- Keep proposed account actions inside the current policy. Under policy `v1.3`, SGOV or a materially equivalent short-duration U.S. Treasury reserve can be used only for cash management. Do not convert puts, shorts, leverage, margin, crypto tokens, private shares, or non-US-listed instruments into account orders.
- Every action needs a trigger condition, invalidation condition, and time horizon.
- SGOV and equivalent reserve buys and sells still require broker execution confirmation before ledger updates.
- Sizing must disclose the total deployable-liquidity basis: confirmed cash, reserve value planned for sale, expected retained buffer, and any settlement constraint.

For every proposed return-seeking position, include:

```yaml
position_construction:
  initial_weight_range_pct:
  fully_underwritten_weight_range_pct:
  current_stage:
  adverse_permanent_impairment_pct:
  max_nav_impairment_pct:
  downside_portfolio_result:
  base_portfolio_result:
  upside_portfolio_result:
  exceptional_portfolio_result:
  contribution_dilution_check:
  scale_milestones:
  hold_milestones:
  reduce_or_exit_milestones:
  stage_review_by:
```

For every no-action allocation with confirmed deployable liquidity, include:

```yaml
no_action_accountability:
  strongest_counterfactual:
  smallest_prudent_exposure_considered:
  zero_vs_starter_result:
  zero_exposure_reason_code:
  decision_critical_missing_evidence:
  why_risk_sizing_cannot_absorb_uncertainty:
  cash_opportunity_cost:
  conjunctive_evidence_and_price_trigger:
  next_evidence_deadline:
  no_action_streak:
  article1_red_team_status:
```
