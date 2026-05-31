# AGENTS.md

This repository supports one long-term satellite investment account. Follow these instructions before making recommendations or changing repository state.

## Mission

The mission is to support a multi-decade satellite portfolio whose goal is asymmetric compounding: pursue outcomes that can plausibly become tens, hundreds, or thousands of times larger over a very long horizon, while avoiding avoidable ruin.

[CONSTITUTION.md](CONSTITUTION.md) is the compact constitutional anchor for this repository. It states the highest-order mission and operating principles in plain language. If `CONSTITUTION.md`, this file, `SPEC.md`, templates, or scripts appear to conflict, preserve the constitution's mission, truth, freshness, auditability, and avoidable-ruin controls, then fix the lower-level artifact.

This mission is the repository's highest objective. Every policy, template, source list, research lane, dashboard surface, self-evolution rule, meta-self-improvement change, cleanup decision, and validation check exists to improve the odds of that outcome without weakening broker-confirmation truth, source freshness, auditability, clone portability, or avoidable-ruin controls.

The primary discovery frame is bottleneck-map-first, not stock-list-first. Do not begin serious research by asking "which stocks look interesting?" Begin by asking which scarce resources, technical capabilities, distribution points, regulatory permissions, infrastructure constraints, or capital-formation changes could become system bottlenecks over the next decade or longer; which bottlenecks could create exceptional pricing power; which public companies are direct beneficiaries rather than weak proxies; and which candidates are small, early, awkward, or newly public enough that conventional screens may miss them.

This account is not the user's main Nasdaq technology allocation. Do not dilute the satellite objective by optimizing for broad-market benchmarking, low volatility, short-term comfort, or index-like diversification.

Default planned monthly contribution: USD 888. Treat this as planned cash only until the user confirms that money is available in the brokerage account.

Under policy `v1.1`, monthly contributions do not need to be fully deployed. A monthly decision may recommend no trade, holding cash, or parking idle cash in SGOV or a materially equivalent approved short-duration U.S. Treasury liquidity reserve when that best supports the long-term objective.

The reverse is also true: the latest USD 888 contribution is not a sizing cap. If a rare opportunity passes the mission, evidence, and entry gates strongly enough, evaluate total confirmed deployable liquidity, including confirmed cash and confirmed SGOV or equivalent reserve value available for sale.

## Immutable Rules

1. Never execute trades.
2. Never update cash, positions, cost basis, tax lots, or account balance from a recommendation, estimate, screenshot without execution details, inferred price, or unconfirmed statement.
3. Only update account records after the user confirms actual broker-side activity with the required fields in [templates/execution-confirmation.md](templates/execution-confirmation.md).
4. Every monthly decision must use fresh data retrieved during that decision cycle. Historical research in this repository is evidence, not current fact.
5. Every recommendation must cite source publication dates, retrieval dates, and a validity window.
6. If required fresh data cannot be obtained, the default action is no trade or hold cash.
7. Keep the repository clone-portable. Do not rely on hidden local state, uncommitted private files, local absolute paths in docs, or committed secrets.
8. Every decision must reference the policy version used.
9. Self-improvement may change templates, scoring, source lists, data providers, and research process, but must not weaken the mission, freshness rules, confirmation rules, audit trail, or no-auto-trading rule.
10. Do not add leverage, margin, options, short selling, crypto tokens, private shares, or non-US-listed instruments unless a later explicit policy version approved by the user allows them.
11. When adding or changing product behavior, data records, dashboard behavior, research workflow, or automation, evaluate whether `SPEC.md` and templates need to be updated in the same change. Update them when the behavior becomes part of the durable process.
12. Treat repository hygiene as part of the product. After meaningful decisions, research updates, dashboard work, or tooling changes, check whether the repository accumulated stale, duplicated, misleading, or low-signal material. Clean it up without weakening auditability.
13. Treat SGOV or an equivalent short-duration U.S. Treasury reserve as cash management only, never as a return-seeking satellite allocation. SGOV is an ETF, not cash; record confirmed SGOV buys and sells like any other broker-confirmed trade.

## Source Hierarchy

Use primary sources first:

1. Broker-confirmed account records for cash, trades, fees, and positions.
2. SEC filings, company investor relations releases, official presentations, exchange data, regulator pages, and government contract databases.
3. Reputable market data providers for prices, volume, market cap, and historical returns.
4. Established financial journalism and industry publications for context.
5. Community posts, social media, and unsourced commentary only as sentiment or lead-generation inputs, never as decisive evidence.

Every important claim must record:

- `source_published_at`: when the source itself was published or the market data was timestamped.
- `retrieved_at`: when it was accessed for this repository.
- `first_seen_at`: when this repository first recorded it.
- `source_url` or another durable source identifier.

A fact is new only when `source_published_at` is later than the prior decision. A source that is newly retrieved but old must not be described as new market information.

## Source Retention

Do not commit large raw SEC filings, PDFs, transcripts, presentations, market-data dumps, or scraped pages by default. Store source metadata, durable URLs, accession numbers, retrieved dates, structured metric extracts, analysis notes, and completed filing reviews instead.

Use ignored local scratch directories such as `research/cache/` or `research/downloads/` for temporary downloads during analysis. Commit a raw source file only when it is small, legally redistributable, uniquely important, and unlikely to remain available from the original source.

## Writing Format

Use natural wrapping for Markdown prose and documentation. Do not hard-wrap ordinary paragraphs at a fixed character count. Keep each paragraph, list item, or sentence group on the line that best matches the content and surrounding style. Preserve semantic line breaks for code blocks, tables, CSV headers and rows, YAML structures, command examples, and source code.

## Language Policy

Use idiomatic English as the repository-wide default language. Documentation, templates, source comments, UI text, accessibility labels, data notes, commit messages, and public dashboard copy should be written in clear native-quality English. Do not add Chinese documentation, Chinese UI strings, Chinese routes, or language-switching pages unless the user explicitly asks for a multilingual feature.

## Repo-Scoped Skills

This repository may include Codex repo-scoped skills under `.agents/skills/`. Use them as lightweight trigger and navigation layers for this repository's repeated workflows. They do not replace `AGENTS.md`, `SPEC.md`, policy files, templates, or committed data.

Repo-scoped skill rules:

- Keep `SKILL.md` concise. It should point to canonical repository files rather than copying the full process.
- Do not include secrets, local-only paths, broker credentials, raw market-data dumps, or large source downloads.
- Update the relevant repo-scoped skill when a durable workflow trigger or execution order changes.
- Do not install repo-specific skills globally unless the user explicitly asks for cross-repository reuse.
- If a repo-scoped skill and `AGENTS.md` conflict, follow `AGENTS.md` and fix the skill.

Repo-scoped skill self-evolution:

- Create a new repo-scoped skill only when a repeated workflow needs stronger automatic triggering or navigation than `AGENTS.md`, `SPEC.md`, and templates provide.
- Update an existing repo-scoped skill when the trigger phrases, execution order, canonical files, safety boundaries, or validation commands change.
- Do not create skills for one-off research notes, individual stock theses, temporary experiments, raw source material, or broad process prose better kept in `SPEC.md`.
- During meta-self-improvement, explicitly check whether a durable process lesson should update `.agents/skills/`, and whether an existing skill has drifted from the canonical rules.
- Keep skills as entry points, not duplicate operating manuals. If a skill grows large, move details back into templates, `SPEC.md`, scripts, or references and keep the skill as a compact router.

## Operating Trigger Model

Treat this repository as an operating system for the satellite account, not as a pile of passive notes. When a user request touches the account, research process, dashboard, data records, or decision workflow, run every applicable repository capability in a reasonable order. Do not choose the smallest convenient subset when the request naturally calls for the broader system.

Operating-system model:

- The repository stores the durable operating system: state, policy, rules, templates, scripts, dashboard, research memory, and audit trail.
- Codex or a future agent supplies active compute. When the user starts a Codex conversation in this repository, the system is powered on and should run the applicable workflows.
- When no agent is active, the repository is mostly idle. Only deterministic automations such as GitHub Actions may run, and they must not make qualitative investment judgments or broker-side changes.
- This model does not permit automatic trading, invented account facts, unreviewed buy recommendations, or hidden local state. Agent judgment begins only when powered by an explicit user interaction or an approved automation boundary.

Trigger tiers:

1. Every repository interaction: read the relevant repository rules, inspect current state before changing files, preserve user changes, and decide whether the request reveals stale, duplicated, misleading, or low-signal material that should be cleaned up. After any meaningful change, run the relevant validation command and report what was checked.
2. Investment decision request: any request about new cash, monthly contribution, buying, selling, holding cash, using SGOV, allocation, portfolio action, or "what should I do" triggers the full decision operating cycle. The cycle includes bottleneck-map review, universe discovery, freshness, research, valuation, full watchlist-cycle review, allocation, meta-self-improvement, cleanup, and validation.
3. Full-cycle request: phrases such as "run the whole repo flow", "execute everything", "full refresh", "full monthly cycle", "全量执行", or similar language trigger every applicable workflow in this repository: account-state review, market-data refresh, bottleneck-map review, universe discovery, freshness monitoring, filing review, valuation review, full watchlist-cycle review, AI-cycle or market-regime review when relevant, allocation analysis, dashboard/data validation, meta-self-improvement, cleanup, and durable commits when repository state changes.

Full decision operating cycle:

1. Load `AGENTS.md`, `SPEC.md`, current policy, templates, confirmed account files, prior decisions, research state, market snapshots, and package scripts.
2. Reconstruct confirmed deployable liquidity from durable broker-confirmed records and any user-provided broker snapshot. Ask only for missing broker facts that cannot be inferred safely.
3. Run deterministic repository tooling that is applicable and safe, including market-data refresh, dry-run universe discovery, data checks, build checks, or dashboard checks when the request touches those surfaces.
4. Run bottleneck-map review before allocation judgment: review `research/discovery/lanes.yml` and [templates/bottleneck-lane-review.md](templates/bottleneck-lane-review.md), explicitly ask whether a new lane appeared, and only then scan existing discovery candidates, mission-relevant themes, newly public companies, spinoffs, IPOs, direct listings, and new public proxies. Add raw candidates to `research/discovery/candidates.csv` when they plausibly matter, and quickly reject or archive weak fits when the evidence supports doing so.
5. Run agentic discovery in addition to deterministic scans. Fixed code and keyword searches are scaffolding, not the full search. For material decisions and full-cycle runs, use independent fresh-context xhigh subagents to search broad current-world sources, reason from first principles about emerging bottlenecks, answer the first-layer bottleneck questions below before naming stocks, identify candidates that fixed screens may miss, and challenge whether the current lane map or watchlist is stale.
6. Use the subagent protocol below for material decisions and full-cycle runs when the tooling is available. At minimum, delegate xhigh discovery-lane/candidate triage and xhigh freshness/filing review before allocation, then delegate xhigh bull-case, bear-case, and allocation/risk review before proposing orders.
7. Run freshness monitoring for current holdings, active watchlist names, raw candidates that could affect allocation, and newly promoted candidates. Check SEC filings, company IR, earnings material, financing, dilution, debt, contracts, regulatory changes, management changes, and material price dislocations.
8. Run the full watchlist-cycle review for every non-removed row in `research/watchlist.csv`. For each symbol, explicitly record whether thesis, entry, priority, status, buy-zone, and next-review trigger changed or stayed unchanged. Save the current-cycle result in `research/watchlist-cycle-reviews.csv`; a monthly decision or full-cycle run is not repository-ready if any non-removed symbol lacks a current cycle review.
9. Run the self-evolution check: identify which existing watchlist theses strengthened, weakened, became stale, became newly buyable because price improved, or became less attractive because price outran evidence. Promote, demote, freeze, or reprioritize watchlist rows only when fresh evidence supports the change, and record the reason.
10. Complete or cite filing reviews for material filings before a buy recommendation. If a filing or event is immaterial, record the reason rather than leaving it ambiguous.
11. Refresh or recompute valuation and entry states for decision-relevant symbols. Separate strong companies from buyable entries and cheap-looking names from broken theses.
12. Run or cite the AI cycle and market-regime monitor whenever the decision depends on AI capex, financing, semiconductor supply chains, data-center power, credit conditions, space infrastructure, or broad bubble risk.
13. Compare all active candidates and holdings together. Do not anchor on the previous favorite if a new candidate, new industry, new filing, valuation change, thesis delta, or cleanup finding changes the opportunity set.
14. Produce a proposed decision only after the preceding steps are complete or explicitly marked unavailable. The output must include proposed orders, exact sizing, cash impact, source dates, retrieval dates, validity window, trigger conditions, invalidation conditions, and unavailable evidence.
15. Update durable research, market, source, decision, and dashboard-facing records when the run creates durable facts or conclusions. Never mutate broker-confirmed ledger, positions, cost basis, or cash without execution confirmation.
16. Run the meta-self-improvement check: identify whether the process, templates, source lists, scoring model, automation, dashboard, validation, or repository structure should be improved because this run exposed friction, stale assumptions, missing coverage, weak feedback loops, or avoidable noise.
17. Run repository hygiene cleanup before finishing: remove or demote stale/noisy material, update canonical docs or templates when behavior changes, keep demo/cache/generated artifacts out of durable state, and preserve auditability.
18. Validate the changed surfaces. For data/research changes, run `npm run check:data`; for dashboard or broad repository changes, run `npm run verify` when practical.
19. Commit and push coherent durable changes to the default remote when the repository's Git Rules call for it.

## Subagent Protocol

The user authorizes using subagents whenever doing so is scientifically reasonable and improves the odds of serving the constitution. For critical investment decisions, full-cycle runs, major discovery updates, material filing reviews, material watchlist reprioritization, and substantial process changes, use the strongest available model and reasoning effort for judgment-heavy subagents, normally `xhigh`.

Default mandatory subagents for a monthly decision or full-cycle run with an allocation question:

- Discovery-lane and candidate triage reviewer: reviews `research/discovery/lanes.yml`, the `npm run discover:universe -- --dry-run` output, existing candidates, new listings, spinoffs, IPOs, and mission-relevant themes. It should identify true direct public beneficiaries, false positives, lane additions or changes, raw candidates worth writing, and candidates to reject or incubate.
- Freshness and filing reviewer: checks SEC submissions, IR releases, earnings material, financing, dilution, debt, contracts, regulatory changes, management changes, and price dislocations for holdings, active watchlist names, and decision-relevant candidates. It should classify material events, identify required filing reviews, and mark immaterial filings with reasons.
- Bull-case reviewer: argues for the strongest mission-aligned upside case and identifies which candidate could most improve long-term asymmetric compounding if current evidence is interpreted favorably.
- Bear-case reviewer: argues against the leading candidates, focusing on thesis breakage, valuation, dilution, balance-sheet survival, customer concentration, execution, regulation, and opportunity-cost risk.
- Allocation/risk reviewer: sizes proposed actions from confirmed deployable liquidity only, compares buy candidates against cash and the approved liquidity reserve, checks settlement and fee assumptions, and recommends exact sizing or no trade.

Mandatory first-layer discovery questions for discovery subagents:

- What could become scarce or strategically constrained over the next decade?
- Who controls, owns, enables, or can remove that scarcity?
- Who can convert the scarcity into pricing power, reinvestment paths, and shareholder value?
- Is there a public security that directly expresses that exposure under the current policy?
- Is the public company early, small, misunderstood, newly listed, awkward, or underfollowed enough to support extreme asymmetric upside?

Discovery subagents must answer these questions before producing ticker lists. Each answer should include sources checked, source publication dates, retrieval dates, key facts, inference, disconfirming evidence, and whether the answer creates a new lane, strengthens an existing lane, produces a candidate, or rejects the theme for now.

Optional subagents are encouraged when useful: source-quality reviewer, market-regime or AI-cycle reviewer, valuation specialist, dashboard/data reviewer, repo-hygiene reviewer, or process-red-team reviewer. Use them when the run exposes a specific uncertainty or when parallel review can catch a failure mode without creating noise.

Subagent boundaries:

- Deterministic commands remain the main agent's responsibility: market refresh, dry-run universe discovery, data checks, builds, git status, commits, pushes, and any command that mutates durable files.
- Prefer independent fresh-context subagents over full-history forks. The default pattern is to give each subagent a bounded evidence packet, explicit file paths, source links, deterministic outputs, safety boundaries, and a narrow question. Use a full-history fork only when the subagent truly needs conversational context or user-provided artifacts that cannot be reconstructed from repository files and the evidence packet; when doing so, state why.
- Discovery subagents are not limited to reviewing deterministic output. They should use broad, fresh source search and first-principles reasoning to answer the first-layer bottleneck questions, then find emerging bottlenecks, newly public candidates, spinoffs, S-1/F-1 issuers, regulatory or contract beneficiaries, and awkward public proxies that fixed keyword scans could miss.
- Subagents should normally be read-only reviewers for investment decisions. They may edit files only when the main agent assigns a narrow, disjoint write scope and the task is not a broker-record or account-state mutation.
- Subagents must not update `data/account/ledger.csv`, `data/account/positions.csv`, `data/account/state.yml`, cost basis, cash, or broker facts. Only broker-confirmed execution updates can change those records.
- Subagents must cite source dates, retrieval dates, file paths, and uncertainty. They should separate facts, inferences, and recommendations.
- Subagent disagreement is a signal, not a voting problem. The main agent must reconcile conflicts explicitly. If a disagreement affects buy eligibility, sizing, or a critical freshness event and cannot be resolved from primary evidence, default to no trade, hold cash, or the approved liquidity reserve.
- Do not run non-dry-run candidate writes merely because a discovery subagent found keyword matches. First require primary-source skim evidence that the company plausibly owns, controls, or directly monetizes a structural bottleneck.
- Do not save raw subagent transcripts by default. Persist the final synthesis, durable research changes, or a concise process review only when the reviews change the decision, evidence state, workflow behavior, or future interpretation.
- For material discovery, persist a structured agentic discovery artifact under `research/discovery/runs/` using [templates/agentic-discovery-run.md](templates/agentic-discovery-run.md). The artifact is the audit trail proving that first-layer questions, broad source search, subagent coverage, conflicts, lane deltas, candidate deltas, and readiness sprint status were considered.

Every subagent should receive the same bounded evidence packet when practical:

```yaml
mission:
policy_version:
request_type:
current_date:
freshness_window:
confirmed_account_facts:
planned_but_unconfirmed_cash:
current_positions:
liquidity_reserve_status:
allowed_assets_and_exclusions:
candidate_set:
relevant_files:
fresh_sources:
deterministic_outputs:
open_freshness_events:
valuation_states:
quality_metrics:
specific_question:
safety_boundaries:
first_layer_discovery_questions:
  - what_becomes_scarce:
  - who_controls_or_removes_scarcity:
  - who_can_monetize_into_shareholder_value:
  - public_security_expression:
  - early_small_misunderstood_or_newly_public:
```

Minimum subagent output schema:

```yaml
role:
scope:
reasoning_level:
inputs_used:
sources_checked:
facts_verified:
stale_or_missing_evidence:
primary_source_conflicts:
key_findings:
thesis_delta:
entry_delta:
priority_or_lane_delta:
ruin_or_permanent_impairment_risks:
policy_or_safety_blockers:
recommended_durable_updates:
buy_or_no_buy_implication:
confidence:
conditions_to_change_view:
unresolved_questions:
conflicts_with_other_reviews:
```

## Self-Evolution Mandate

The repository must keep serving the mission as markets, technologies, industries, and valuations change. The current best ideas are not sacred. Every serious research or decision cycle must ask whether the opportunity set changed.

Self-evolution has two sides:

1. Internal reprioritization: existing watchlist names must move up or down when fresh evidence changes thesis strength, execution probability, balance-sheet survival, dilution risk, market structure, valuation, or entry attractiveness. A watchlist company can become more important because its thesis improved, because price dislocated while the thesis stayed intact, or because competing opportunities weakened. It can also be demoted, frozen, or removed when evidence deteriorates or valuation outruns realistic upside.
2. External discovery: the system must keep looking for new public companies, newly public pure plays, spinoffs, new industry bottlenecks, new regulatory regimes, and new technology platforms that could better satisfy the asymmetric multi-decade mission than the current watchlist.
3. Discovery-lane evolution: `research/discovery/lanes.yml` is a living map of structural bottleneck hypotheses. Every full operating cycle and monthly decision must review whether a lane should be added, split, promoted, demoted, merged, or retired. The open-ended `unknown_future_bottlenecks` lane must remain active as a reminder that the next true outlier may begin outside all current categories.

Stock names are outputs of the bottleneck map, not the starting point. A candidate should enter deep research because it may sit on, own, or directly monetize a structural bottleneck, not because it matched a generic financial screen or appeared in a stale favorite list.

During each decision cycle, explicitly review:

- thesis delta: strengthened, unchanged, weakened, broken, or stale;
- entry delta: more attractive, unchanged, less attractive, dislocated, or too uncertain;
- priority delta: promote, demote, freeze, remove, incubate, or no change;
- opportunity-cost delta: whether another current or new candidate now better serves the mission;
- theme delta: whether a new industry, supply bottleneck, regulatory shift, or technology platform deserves a new discovery lane.
- lane delta: whether any discovery lane strengthened, weakened, became too broad, became irrelevant, or failed to search where the mission now demands searching.

Every full operating cycle and monthly decision must also create or refresh a lightweight watchlist-cycle review row for every non-removed `research/watchlist.csv` symbol. This is the always-on stale-prevention pass. It asks, for each symbol, whether the current status, priority, next review trigger, thesis baseline, entry state, buy-zone state, and opportunity-cost role still serve the mission. "No change" is a valid conclusion only when it is written to `research/watchlist-cycle-reviews.csv` with current sources and a current review date.

Promotion review is the heavier escalation that follows from the cycle review. Do not run a full promotion review for every symbol every month. Run it when the watchlist-cycle review, a material filing, a price dislocation, a lane change, a competitor change, or a subagent disagreement could change active/core status, priority, allocation ranking, or buy-zone eligibility.

Durable outputs:

- Update `research/watchlist-cycle-reviews.csv` for every non-removed watchlist symbol during each full operating cycle and monthly decision.
- Update `research/watchlist.csv` priority, status, next review trigger, latest baseline date, or notes when the current cycle review or promotion review supports a durable change.
- Update `research/watchlist-transitions.csv` and `research/buy-zones.csv` when a symbol enters or leaves `active_candidate`, `active_core_candidate`, or current buy-zone eligibility.
- Update `research/valuation-states.csv` when entry attractiveness changes materially.
- Add or update `research/freshness/events.csv` when new evidence requires review.
- Update `research/discovery/lanes.yml` when the lane map changes or when the full-cycle review exposes a missing lane.
- Add raw names to `research/discovery/candidates.csv` before watchlist promotion.
- Add a dated research-engine run note when the cycle changes discovery, priority, valuation, freshness, or cleanup state.

Do not preserve a stale priority order just because prior work favored a name. The long-term goal controls the watchlist, not the watchlist controlling the long-term goal.

## Discovery Readiness Mandate

Discovery is not complete when a plausible candidate is merely named. If a candidate could plausibly affect allocation, opportunity cost, a lane's completeness, or watchlist priority, the agent must move it through a readiness sprint before ending the cycle unless primary evidence already rejects it, the instrument is not eligible, the candidate is explicitly not material, or the remaining blocker is genuinely external. "We have not researched it yet" is never a terminal readiness state.

Readiness sprint:

- add or update the raw candidate record with source dates, retrieval dates, first-seen date, theme, why it might matter, and next action;
- add or update `research/discovery/candidate-readiness.yml` and, when the candidate could affect allocation or lane completeness, a sprint note under `research/discovery/readiness/` using [templates/discovery-readiness-sprint.md](templates/discovery-readiness-sprint.md);
- record affected lanes, the materiality reason, and the blocking scope for every material candidate so the same-lane opportunity-cost question is explicit and machine-checkable;
- retrieve current market data, security metadata, SEC CIK, exchange, tradability, and price history when available;
- retrieve primary filings, company IR, investor presentations, earnings material, contract or regulator sources, and credible industry context;
- complete or create the required filing review when the filing is material to buy eligibility;
- produce or update valuation and entry state, including market cap, enterprise value when available, dilution, liquidity, debt, revenue quality, margin profile, and scenario path;
- compare the candidate against same-lane watchlist names and current allocation candidates;
- classify the result as promote, incubate, reject, archive, or not tradable, with evidence-based reasons;
- update durable sources, freshness events, quality metrics, research notes, and dashboard-facing records when the candidate changes durable state.

Candidate ready surface:

- `research/discovery/candidates.csv` records the raw candidate, source dates, retrieval date, first-seen date, lane, thesis hook, and next action.
- `research/discovery/candidate-readiness.yml` records terminal readiness status, `dashboard_surface_status`, affected lanes, materiality reason, blocking scope, blocker type, reachable evidence remaining, conclusion, and next action.
- A material candidate has a sprint note under `research/discovery/readiness/` that answers the first-layer bottleneck questions, records source families, separates facts from inferences, compares same-lane peers, analyzes valuation, dilution, balance-sheet, contract/customer, execution, and policy risks, and states conditions that would change the view.
- Source-backed durable evidence is registered in `research/sources.yml`, relevant freshness or filing events are reviewed in `research/freshness/events.csv`, and material filings have a review note when they affect buy eligibility.
- Dashboard-facing public-stock coverage includes a `research/watchlist.csv` row, security metadata, current and historical market data, latest price, technical snapshot, company metrics when available, valuation state, `research/company-analysis.yml` entry, and a generated per-symbol research page.

Rejected and archived material candidates are still terminal research conclusions, not shortcuts around readiness. Use `rejected_after_review` or `archived_after_review` with the matching `not_required_*` dashboard status and source-backed sprint evidence when a candidate was material enough to enter the readiness process.

Material incubating candidates must not remain hidden in discovery-only files. If a candidate is material to the current allocation, opportunity cost, lane completeness, or watchlist priority and is not rejected, archived, explicitly not material, externally blocked, or not tradable, give it the same downstream research surface as other research-only stocks. The label may be `research_only`; the point is visibility and comparable evidence, not buy promotion. If it does not deserve that surface, reject it, archive it, or mark it not material with evidence.

Do not end with "not buy-ready because data is missing" when the missing evidence can reasonably be gathered from public sources or repository tooling during the current powered-on cycle. Exhaust the reachable evidence first. Remaining blockers should be limited to genuinely unavailable sources, user-only broker facts, broker eligibility, market closure or no current quote, legal access limits, or analysis results showing that the candidate fails the mission, evidence, entry, risk, or policy gates.

Agentic discovery source coverage must be structured, not just asserted. A complete material run should record source families for primary filings or regulatory data, issuer material, market data, and current-world context, with source IDs that resolve in `research/sources.yml`.

When a decision depends on a lane, record that lane in `research/quality-metrics.yml` as allocation-relevant. Open raw candidates in allocation-relevant lanes must be treated as material unless the readiness sprint explicitly classifies them as `not_material_current_allocation` with evidence.

No final not-ready state: `decision_readiness.status` measures repository and public-observable research readiness only. Before the main agent returns a result to the user after material investment, discovery, or process work, it must drive `research/quality-metrics.yml` to `ready` and run the relevant validation. Missing user-only broker cash, buying power, order-preview details, fractional-share support, or final execution instructions must be recorded as execution prerequisites, not as repository not-readiness.

Quality gate: a passing repository state must not contain a material open raw candidate whose blocker is unfinished repository work. If public evidence is reachable, complete the sprint, reject or incubate the candidate based on analyzed evidence, mark it genuinely externally blocked or not tradable, or classify it as not material to the current allocation with evidence. Do not finish with `not_ready`; keep iterating until the repository-public state is ready or the strict agent-level blocked-audit rules outside this repository are satisfied.

## Promotion And Core-Buy Zone

Discovery readiness is not the same as promotion. Promotion is the process that moves a researched symbol up the decision ladder:

1. `raw discovery`: named lead only; cannot be bought.
2. `research_only`: dashboard-visible research memory; cannot be bought without a fresh promotion review.
3. `watch`: active monitoring candidate; can influence opportunity cost but still needs current gates before buying.
4. `active_candidate`: live allocation contender when evidence and entry may plausibly support near-term capital.
5. `active_core_candidate`: top-tier long-horizon candidate comparable to RKLB or ASTS; still not an automatic buy.
6. `buy_zone`: current decision-cycle state where mission, evidence, entry, opportunity cost, and allocation/risk gates support a proposed order.

The full watchlist-cycle review executes before promotion judgment in every full operating cycle and monthly decision. It is a per-symbol stale-prevention sweep over all non-removed watchlist rows. It can conclude `no_change`, `refresh_evidence`, `promotion_review_required`, `demotion_review_required`, `freeze_required`, `remove_required`, or `not_tradable_monitor`. Any conclusion that could alter active/core status, priority, allocation ranking, or buy-zone eligibility must escalate to a promotion review before proposed orders use that symbol.

Use [templates/promotion-review.md](templates/promotion-review.md) when a symbol may move from `research_only` or `watch` to `active_candidate`, from `active_candidate` to `active_core_candidate`, or from any non-active status into buy-zone consideration. A durable promotion review is required whenever the change would alter `research/watchlist.csv` status or priority, displace an existing core candidate, affect proposed allocation ranking, or make a previously non-buyable symbol eligible for proposed orders.

Promotion triggers:

- thesis strengthening from primary filings, issuer evidence, customer adoption, contracts, regulatory progress, launches, deliveries, margins, backlog, cash flow, or balance-sheet improvement;
- entry improvement from price dislocation, valuation compression, reduced dilution risk, improved liquidity, or a better risk/reward setup;
- opportunity-cost change because current core candidates weakened, valuation outran evidence, or a same-lane challenger now compares better;
- lane or market-structure change showing a bottleneck became more important, more scarce, more monetizable, or newly publicly investable;
- fast material events such as financing, offering, customer win/loss, launch success/failure, regulatory decision, earnings surprise, management change, or severe price move.

Mandatory promotion gates:

- Mission gate: the symbol directly owns, controls, enables, or monetizes a structural bottleneck and remains aligned with the satellite mission rather than duplicating the user's broad Nasdaq technology core.
- Evidence gate: current primary evidence and material filings are reviewed; source publication dates, retrieval dates, conflicts, and uncertainty are recorded.
- Entry gate: valuation, price, dilution, balance-sheet survival, cash runway, liquidity, and opportunity cost leave enough plausible upside for the requested status.
- Survival gate: financing, debt, burn, customer concentration, execution, regulation, and governance risks do not create avoidable permanent-impairment risk.
- Opportunity-cost gate: the candidate is compared against current core candidates, same-lane peers, cash, and the approved liquidity reserve.

Mandatory xhigh promotion reviewers when tooling is available:

- evidence/freshness reviewer;
- valuation/entry reviewer;
- bull-case reviewer;
- bear-case reviewer;
- opportunity-cost and allocation/risk reviewer;
- source-quality or process-red-team reviewer when the promotion depends on new, noisy, or conflicting evidence.

Promotion is not a vote. The main agent must reconcile conflicts. If unresolved disagreement affects status, buy eligibility, sizing, or whether the candidate displaces a current core name, default to no promotion, no buy, hold cash, or the approved liquidity reserve until primary evidence resolves the conflict.

Fast-path sensitivity: do not wait for a monthly cycle when a material event or price dislocation could change promotion status or buy-zone ranking. During the current powered-on session, or an approved monitoring wakeup, refresh public evidence, run the promotion review, update durable state, and either promote, demote, reject, incubate, or record why the event is immaterial. Fast-path review still cannot execute trades and cannot mutate broker-confirmed account records.

Core status is earned by evidence and opportunity cost, not by age in the repository. A newly discovered company may move quickly if the evidence is unusually strong and entry is dislocated; an old favorite must be demoted when fresh evidence or valuation no longer supports its status.

## Meta-Self-Improvement Mandate

The process itself must evolve. The repository should not only discover better stocks; it should discover better ways to discover, evaluate, monitor, decide, record, validate, and clean up.

Use a learning loop for process changes:

1. Observe: identify friction, missed candidates, false positives, stale sources, weak templates, manual repetition, dashboard confusion, validation gaps, bad defaults, or decision-quality problems.
2. Orient: decide whether the problem is one-off noise or a durable process defect. Check whether the issue weakens the mission, freshness, auditability, clone portability, or decision quality.
3. Plan: write the smallest process-improvement hypothesis that could fix the defect. Include expected benefit, possible harm, success signal, rollback condition, and next review date.
4. Do: change the narrowest durable artifact: rules in `AGENTS.md`, system behavior in `SPEC.md`, repeated workflow in `templates/`, source-of-truth data in committed data files, product behavior in source code, or process notes in `research/process/`.
5. Study: after the next relevant cycle, compare the result against the stated success signal. Look for Goodharting, process bloat, false confidence, overfitting to the last mistake, and hidden maintenance cost.
6. Act: keep, revise, broaden, or revert the process change. Capture the lesson and remove any obsolete scaffolding.

Meta-improvement triggers:

- A decision was blocked by missing data, unclear templates, stale valuation states, weak source coverage, or ambiguous priority rules.
- A candidate was missed, promoted too late, researched too shallowly, or kept active too long.
- A thesis review relied on old narratives, weak source hierarchy, or uncalibrated probabilities.
- A repeated manual step could become deterministic tooling or validation.
- Dashboard or data presentation made the account state, research freshness, or opportunity set harder to understand.
- Cleanup found duplicated rules, outdated notes, misleading labels, dead scripts, unused fixtures, or hidden local assumptions.

Process-quality outputs:

- Use [templates/meta-self-improvement.md](templates/meta-self-improvement.md) for substantial process changes, recurring problems, postmortems, premortems, or methodology upgrades.
- Store durable process reviews under `research/process/` when they are more than a tiny inline doc change.
- Record forecasts, assumptions, and review dates when a process change depends on a prediction about improved decision quality.
- Prefer small reversible experiments over large framework changes unless the current process clearly fails the mission.

Guardrails:

- Do not improve the process by weakening the no-trading rule, confirmation rule, source freshness, source hierarchy, audit trail, or allowed-asset policy.
- Do not add process ceremony that makes the next decision slower without improving signal, safety, or auditability.
- Do not optimize for looking systematic at the expense of finding rare asymmetric opportunities, and do not let meta-process become a substitute for searching outside the current watchlist.
- Do not let a benchmark, metric, template, or dashboard surface become the objective. The objective remains long-term asymmetric compounding with avoidable-ruin controls.

Completion standard:

- The final response must say which operating-cycle steps ran, which were skipped, why they were skipped, which files changed, which validations passed or failed, whether any meta-self-improvement was captured, and whether any follow-up evidence is still required.
- Do not claim the full cycle is complete if any applicable repository or public-evidence workflow was skipped. Time pressure is not a valid reason to return with publicly reachable research work unfinished. Only genuine external blockers and user-only execution prerequisites may remain, and they must be recorded separately from repository readiness.
- The workflow remains bounded by the immutable rules: no automatic trades, no invented broker facts, no policy-violating instruments, no hidden local state, and no weakening of freshness or auditability.

## Monthly Decision Workflow

This workflow is a hard trigger, not optional background reading. Treat any user request about a new deposit, monthly contribution, what to buy, what to sell, whether to deploy cash, whether to use SGOV, or how to allocate the account as a `monthly_decision` request even if the user does not name the template.

Before giving any proposed order, run the full decision operating cycle. Do not answer from the existing watchlist alone. The cycle is mandatory because the account's edge depends on continuously discovering and re-evaluating the best public companies for the mission, not repeatedly choosing from a stale static list. The first discovery question is always bottleneck-map-first: what future constraint matters, who directly benefits, and what evidence would prove it investable?

Decision operating-cycle execution:

1. Start from the confirmed ledger and confirmed positions only.
2. Check whether the user confirmed a new deposit. If not confirmed, planned contribution cash is not investable cash.
3. Reconstruct total deployable liquidity from confirmed records, including cash, settled or tradeable proceeds, and any confirmed SGOV or equivalent reserve value available for sale, then reconcile with any broker account snapshot the user provides.
4. Determine the freshness window from the latest decision, latest research-engine run, latest market-data refresh, and current decision date.
5. Refresh deterministic market data with the repository tooling when available, then retrieve fresh prices and current market data for current holdings, active candidates, watchlist names, newly promoted candidates, and any raw discovery candidate that could plausibly affect the decision.
6. Run the research engine loop from `SPEC.md` before allocation judgment: review `research/discovery/lanes.yml`, explicitly ask whether a new lane appeared, use [templates/bottleneck-lane-review.md](templates/bottleneck-lane-review.md) when the lane decision is material, review `research/discovery/candidates.csv`, scan for new public candidates in mission-relevant themes, check freshness events, detect new material filings or issuer events, review valuation states, and compare active watchlist names.
7. Use independent fresh-context xhigh discovery subagents for open-ended exploration when discovery could affect allocation. Their job is not only to review the deterministic scan, but to search current public sources, reason about emerging bottlenecks, find missed candidates, and identify source-backed themes or candidates that fixed code may miss.
8. For every plausible new candidate that could affect the decision, run the discovery readiness sprint unless the candidate is clearly immaterial, ineligible, or rejected from primary evidence. Do not stop at "missing market data", "missing filing review", or "missing valuation state" if those items can be gathered during the cycle.
9. Retrieve fresh company data: SEC filings, IR releases, earnings transcripts, regulatory updates, contract news, dilution, debt, liquidity, and management changes.
10. When a new material filing exists, read the primary filing or official report before buying. Use [templates/filing-review.md](templates/filing-review.md) for 10-K, 10-Q, S-1, F-1, 424B, earnings 8-K, financing 8-K, and equivalent reports.
11. Run and record the full watchlist-cycle review for every non-removed `research/watchlist.csv` row. Update `research/watchlist-cycle-reviews.csv` even when the conclusion is no change, and update `research/watchlist.csv`, `research/watchlist-transitions.csv`, or `research/buy-zones.csv` when fresh evidence supports a durable status, priority, trigger, or buy-zone change.
12. Update or cite the durable research state changed by the operating cycle: `research/discovery/candidates.csv`, `research/freshness/events.csv`, `research/valuation-states.csv`, `research/watchlist-cycle-reviews.csv`, `research/quality-metrics.yml`, filing reviews, and a dated research-engine run note when the run changes durable research state.
13. Check `research/quality-metrics.yml`. If critical events, stale valuation states, stale theses, missing watchlist-cycle reviews, missing filing reviews, or an incomplete operating-cycle step make the repository-public research state fail readiness, keep refreshing and analyzing evidence until it is ready. User-only broker facts, broker previews, and final user instructions should be recorded as execution prerequisites rather than readiness failures.
14. In the final decision, include a concise operating-cycle summary covering sources checked, discovery changes, freshness events, filing reviews, watchlist-cycle review result, valuation-state changes, cleanup performed, validation run, readiness status, unavailable data, and the exact validity window.
15. Compare new evidence against the stored thesis, kill criteria, prior decision notes, freshness events, and valuation state.
16. Use the subagent protocol when available for critical capital allocation decisions: evidence/freshness, bull-case, bear-case, and allocation/risk reviewers at the highest useful reasoning level, normally `xhigh`; add discovery-lane/candidate triage when discovery output could affect the decision.
17. Run the meta-self-improvement check from this file and `SPEC.md`; record durable process lessons when the cycle exposes one.
18. Decide whether the best account action is buy, add, trim, exit, hold cash, park idle cash in the approved liquidity reserve, sell reserve to fund a buy, or do nothing. Never force a trade just because a monthly contribution arrived, and never cap a strong opportunity at the latest contribution merely because older cash is parked in reserve.
19. Produce proposed orders with exact share counts, estimated dollar use, estimated remaining cash, the price basis used, and the order validity window.
20. Mark the output as a proposed decision only. Do not mutate the ledger.
21. When confirmed cash or positions exist, update the equity-curve valuation snapshot for the decision date from confirmed account state and fresh market prices. Backfill missing month-end snapshots only from historical close data, and never use today's price for an old valuation date.

## Execution Update Workflow

When the user says trades or deposits were actually completed:

1. Check that all required fields are present: broker/account alias, confirmation ID or equivalent evidence, side, symbol, quantity, average price, fees, currency, trade date, and settlement date.
2. If fields are missing, ask for the missing fields. Do not use current market prices as substitutes.
3. Append a new event to [data/account/ledger.csv](data/account/ledger.csv).
4. Recalculate [data/account/positions.csv](data/account/positions.csv) and [data/account/state.yml](data/account/state.yml) from confirmed events.
5. Add or refresh the equity-curve valuation snapshot for the confirmed event date when prices for that date are available. If price data is unavailable, leave the valuation gap rather than inventing a price.
6. Never silently edit old ledger rows. Use a `correction` event if a past record was wrong.

## Public Dashboard Workflow

The public dashboard lives at `https://www.wineandchord.com/invest/` and is served from this open-source repository as a static GitHub Pages project site.

Dashboard rules:

1. The real-data view must be built from committed repository files.
2. Demo or fake data may exist only as browser-only testing state or clearly labeled fixture data. It must never mutate `data/account/ledger.csv`, `data/account/positions.csv`, or `data/account/state.yml`.
3. The dashboard must clearly distinguish confirmed broker records from market snapshots, research records, and simulated data.
4. It should display holdings, cash, ledger operations, performance curve, total return, Sharpe ratio, drawdown, research pool, and source freshness whenever enough data exists.
5. When confirmed account data is missing, show a useful empty state rather than inventing real balances.
6. After frontend changes, run the local build and inspect the page locally across desktop and mobile widths before committing when practical.
7. Keep the page usable under `/invest/`; do not hard-code local filesystem paths or root-relative assumptions that break GitHub Pages project hosting.
8. Treat the dashboard as a living product surface. When a visualization, metric, table, interaction, empty state, demo fixture, or public copy becomes confusing, stale, visually noisy, or no longer aligned with the process, simplify or replace it and update `SPEC.md` when the behavior should persist.
9. Every public display surface should have a clear data source, provenance boundary, freshness cue when relevant, empty/demo fallback, desktop and mobile behavior, and no hidden dependency on local state.
10. Market movement colors must use a browser-remembered convention toggle. The default convention is Mainland China style: gains are red and losses are green. The alternative convention is Western style: gains are green and losses are red. UI copy remains English-only, and browser-only display preferences must never mutate committed account records, research files, or market snapshots.
11. Keep market movement colors separate from operation colors. Buy and sell markers may use their own semantic colors so they are not confused with gain and loss.
12. Treat the equity chart as a broker-grade analytical surface, with TradingView as the quality benchmark. Chart work should prioritize accurate axes, crosshair detail, range controls, touch and mouse interaction, confirmed-operation markers, and low-noise layout before decorative styling. The chart is display-only and must never imply broker connection, order entry, or automatic execution.
13. Treat the research universe as an interactive research workspace, not a static table. Company cards should support compact scanning, hover and keyboard-focus latest-analysis previews, click or tap detail drilldowns, and historical analysis timelines sourced from committed research records.
14. Research drilldowns must preserve provenance. Show analysis dates, stances, policy versions, analysis types, and source links when available, and make clear through dated labels that historical analysis is memory rather than fresh market truth.

## Continuous Improvement and Noise Hygiene

This repository should become more useful, more reliable, and easier to operate after each serious interaction. Improvement is not only adding features. It also means deleting clutter, reducing ambiguity, tightening stale rules, and making the next decision cycle cheaper without lowering decision quality.

Use this loop when a change reveals a durable lesson:

1. Capture the lesson in the smallest durable place: `AGENTS.md` for agent behavior, `SPEC.md` for system behavior, templates for repeated workflows, data files for durable records, and source files for product behavior.
2. Remove or demote noise created by the work: obsolete demo assumptions, duplicate research notes, unused UI states, dead scripts, stale screenshots, outdated candidate labels, irrelevant sources, and misleading comments.
3. Preserve audit history. Do not delete confirmed ledger events, policy versions, or dated decisions just because they are old. If historical material remains useful only as history, mark it as historical, archived, superseded, or stale instead of presenting it as current evidence.
4. Prefer concise canonical records over sprawling parallel notes. If two files describe the same durable rule, keep one authoritative version and link to it from the other.
5. Keep demo data, generated artifacts, cache files, temporary screenshots, local logs, and exploratory scratch work out of committed durable state unless the file is intentionally part of the product or test fixture.
6. During every monthly decision, explicitly separate current evidence, historical evidence, stale evidence, and analysis. Do not let old narratives keep influencing allocation after their evidence window expires.
7. When cleaning up, keep changes reviewable: explain the cleanup in the commit message or decision note when it affects future interpretation.

## Research Discipline

Each active company thesis must include:

- one-sentence thesis;
- why it can plausibly produce extreme multi-decade upside;
- key evidence needed next;
- disconfirming evidence and kill criteria;
- balance sheet and dilution risk;
- customer concentration and dependency risk;
- regulatory, technical, execution, and valuation risk;
- next review date.

Research is organized as a pipeline:

1. `research/discovery/lanes.yml` for structural bottleneck lanes that guide search beyond the current watchlist.
2. `research/discovery/candidates.csv` for raw potential public candidates found by universe scans.
3. `research/freshness/events.csv` for material filings, IR releases, contracts, financing, dilution, regulatory events, price dislocations, and thesis triggers.
4. `research/valuation-states.csv` for current valuation and entry-attractiveness state.
5. `research/quality-metrics.yml` for coverage, freshness, lane-map health, stale analysis, and open-event health checks.
6. `research/filings/` for completed material filing reviews linked from freshness events.
7. `research/watchlist.csv` for candidates that deserve ongoing active monitoring.
8. `research/watchlist-cycle-reviews.csv` for the per-cycle review row that every non-removed watchlist symbol must receive during full-cycle and monthly-decision runs.
9. `research/watchlist-transitions.csv` for machine-checkable status and priority changes.
10. `research/buy-zones.csv` for symbol-level current buy-zone state.
11. `research/company-analysis.yml` for dashboard-visible historical analysis.

The comparison universe includes watchlist rows whose status is `active_core_candidate`, `active_candidate`, or `watch`. The buy-eligible universe is narrower: only `active_core_candidate` and `active_candidate` rows with a current `research/buy-zones.csv` row can receive proposed orders, and only symbols marked `in_buy_zone` can receive current buy recommendations. Rows marked `research_only`, `watch`, `not_tradable`, `probation`, `frozen`, or `removed` cannot receive new buy recommendations unless the decision first runs a fresh promotion review, updates durable transition records, and moves the symbol into buy-zone eligibility.

Do not deep-research every listed company. Use a research funnel: broad cheap universe awareness, theme-scoped filtering, quick rejection of weak fits, primary-source skims for plausible candidates, and deep research only for the small set that could realistically affect allocation. Keep the active set small enough to understand deeply.

Before recommending a buy, confirm the target passes three gates:

- Mission gate: the company still has a plausible multi-decade asymmetric upside path and does not merely duplicate the user's large Nasdaq technology core.
- Evidence gate: current primary evidence supports the thesis, material filings are reviewed, and no critical freshness event is unresolved.
- Entry gate: current price, valuation, dilution, balance sheet survival, and opportunity cost still leave enough expected upside for the satellite objective.

When adding a durable company analysis that should appear on the public dashboard, add or append a structured entry in [research/company-analysis.yml](research/company-analysis.yml) and link it to the dated source note. Do not parse long-form Markdown as the dashboard database when a structured index can carry the needed summary and provenance.

When a candidate or holding publishes a material filing, do not make a buy recommendation until the filing has been reviewed or the decision explicitly says why the filing is immaterial. Financial statement review must consider revenue growth, gross margin, operating margin, cash flow, cash, debt, dilution, share count, stock-based compensation, backlog or RPO when relevant, customer concentration, guidance, risk-factor changes, and liquidity.

Completed material filing reviews must be saved under `research/filings/` and linked from `research/freshness/events.csv` through `review_path`. If a material event is ignored as immaterial, `immaterial_reason` must explain why.

Do not blindly follow the user's initial candidate list. Treat it as a starting watchlist and independently challenge every company.

Sells should be rare. Prefer directing new contributions away from downgraded companies before selling existing long-term positions. Sell or trim only when fresh evidence shows thesis breakage, unacceptable permanent impairment risk, portfolio risk that conflicts with the mission, or a clearly superior opportunity after tax and execution costs.

Liquidity reserve sales are different from return-seeking position sales. Selling SGOV or an equivalent approved reserve to fund a researched common-stock buy is a cash-management step, not a thesis-driven exit.

## Git Rules

The user allows direct commits and pushes to `main` for this repository.

Commit after meaningful changes to policy, records, research, or decisions. Push to the default remote when the work is coherent. Use concise commit messages in the repository's style. Never commit secrets or local-only paths.
