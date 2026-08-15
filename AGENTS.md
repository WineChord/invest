# AGENTS.md

This repository supports one long-term satellite investment account. Follow these instructions before making recommendations or changing repository state.

## Mission

The mission is to support a multi-decade satellite portfolio whose goal is asymmetric compounding: pursue outcomes that can plausibly become tens, hundreds, or thousands of times larger over a very long horizon, while avoiding avoidable ruin.

[CONSTITUTION.md](CONSTITUTION.md) is the compact constitutional anchor for this repository. It states the highest-order mission and operating principles in plain language. If `CONSTITUTION.md`, this file, `SPEC.md`, templates, or scripts appear to conflict, preserve the constitution's mission, truth, freshness, auditability, clone portability, public-release safety, and avoidable-ruin controls, then fix the lower-level artifact.

This mission is the repository's highest objective. Every policy, template, source list, research lane, dashboard surface, self-evolution rule, meta-self-improvement change, cleanup decision, publication rule, and validation check exists to improve the odds of that outcome without weakening account-fact truth, broker-evidence priority, source freshness, auditability, clone portability, public-release safety, or avoidable-ruin controls.

Article 1 is controlling, not one consideration among many. If a lower-level rule systematically favors inactivity, certainty, repository completeness, conventional diversification, or capital preservation beyond what is needed to prevent avoidable ruin, revise the lower-level rule. Cash, research coverage, validation, and process discipline are instruments of the mission; none is a substitute for obtaining meaningful exposure to rare qualifying opportunities.

First-principles analysis is mandatory for every material company, filing, discovery, valuation, promotion, opportunity-cost, allocation, macro-regime, retrospective, and process analysis. Each such artifact must contain an explicit `First-Principles Analysis` section with `question_rebuilt_from_basics`, `irreducible_facts`, `binding_constraints`, `causal_chain`, `inherited_assumptions_challenged`, `value_capture_or_mission_link`, `disconfirming_evidence`, and `decision_consequence`. Start from current primary evidence and confirmed account facts, not from a ticker, prior rating, watchlist status, consensus narrative, comparable multiple, historical analogy, or price chart. For a company or security, carry the causal chain through dilution-adjusted per-share value and feasible portfolio impact. Comparables, analogies, prior conclusions, and price action may test the reconstruction but may not replace it. In a Chinese private decision report or self-email, render the reader-visible heading as `从第一性原理出发` and include a specific concise reconstruction in each material company or decision block rather than one generic report-level slogan; durable repository artifacts otherwise keep the English heading under the repository language policy.

The primary discovery frame is bottleneck-map-first, not stock-list-first. Do not begin serious research by asking "which stocks look interesting?" Begin by asking which scarce resources, technical capabilities, distribution points, regulatory permissions, infrastructure constraints, or capital-formation changes could become system bottlenecks over the next decade or longer; which bottlenecks could create exceptional pricing power; which public companies are direct beneficiaries rather than weak proxies; and which candidates are small, early, awkward, or newly public enough that conventional screens may miss them.

This account is not the user's main Nasdaq technology allocation. Do not dilute the satellite objective by optimizing for broad-market benchmarking, low volatility, short-term comfort, or index-like diversification.

Default recurring contribution: USD 888 every Friday in `Asia/Shanghai`, effective 2026-07-31. The active versioned account-owner standing authorization in `data/account/plan.yml` confirms each exact occurrence after its due date without a second confirmation. This exception applies only to that fixed deposit and never counts as broker reconciliation.

Under policy `v1.3`, weekly contributions do not need to be fully deployed. A decision may recommend no trade, holding cash, or parking idle cash in SGOV or a materially equivalent approved short-duration U.S. Treasury liquidity reserve when that best supports the long-term objective. Repeated no-action decisions and prolonged high liquidity-option weight are mission-accountability triggers, not neutral end states.

The reverse is also true: the latest USD 888 contribution is not a sizing cap. If a rare opportunity passes the mission, evidence, and entry gates strongly enough, evaluate total confirmed deployable liquidity, including confirmed cash and confirmed SGOV or equivalent reserve value available for sale.

## Immutable Rules

1. Never execute trades.
2. Never update cash, positions, cost basis, tax lots, or account balance from a recommendation, estimate, screenshot without required execution details, inferred price, or unconfirmed statement. The active versioned standing authorization is confirmation only for its exact recurring deposit after the due date.
3. Only update account records after the required confirmation in [templates/execution-confirmation.md](templates/execution-confirmation.md). Trades and all non-standing-deposit facts require occurrence-level confirmation; the fixed weekly deposit uses its active standing confirmation and must yield to later broker evidence.
4. Every monthly decision must use fresh data retrieved during that decision cycle. Historical research in this repository is evidence, not current fact.
5. Every recommendation must cite source publication dates, retrieval dates, and a validity window.
6. If decision-critical fresh data for a proposed target or its material opportunity-cost comparison cannot be obtained or bounded, the default action for that target is no trade or hold cash. Classify ordinary uncertainty as a sizing problem and unrelated repository incompleteness as process debt rather than silently treating every unavailable datum as a portfolio-wide veto.
7. Keep the repository clone-portable. Do not rely on hidden local state, uncommitted private files, local absolute paths in docs, or committed secrets.
8. Every decision must reference the policy version used.
9. Self-improvement may change templates, scoring, source lists, data providers, and research process, but must not weaken the mission, freshness rules, confirmation rules, audit trail, or no-auto-trading rule.
10. Do not propose leverage, margin, options, short selling, crypto tokens, private shares, OTC securities, or non-US-listed instruments as account actions unless a later explicit policy version approves them. They may be researched as bottleneck intelligence, competitors, suppliers, customers, transaction targets, or public-peer comparators without becoming account orders.
11. When adding or changing product behavior, data records, dashboard behavior, research workflow, or automation, evaluate whether `SPEC.md` and templates need to be updated in the same change. Update them when the behavior becomes part of the durable process.
12. Treat repository hygiene as part of the product. After meaningful decisions, research updates, dashboard work, or tooling changes, check whether the repository accumulated stale, duplicated, misleading, or low-signal material. Clean it up without weakening auditability.
13. Treat SGOV or an equivalent short-duration U.S. Treasury reserve as cash management only, never as a return-seeking satellite allocation. SGOV is an ETF, not cash; record confirmed SGOV buys and sells like any other broker-confirmed trade.
14. Follow [PUBLICATION_POLICY.md](PUBLICATION_POLICY.md) before any public commit, push, deployment, dashboard change, decision note, execution record, external post, or performance display.
15. Never publish personalized investment advice for public readers, copy-trading instructions, signal-service content, compensated endorsements, referral-driven recommendations, issuer promotions, or public answers that tell another person what they should buy, sell, hold, or size.
16. Never commit or publish raw broker documents, raw screenshots, account numbers, full broker order IDs, full confirmation numbers, tax identifiers, legal identity documents, secrets, cookies, tokens, local absolute paths, local-only cache payloads, or unlicensed raw market-data dumps.
17. Do not commit, push, publish, deploy, or externally post actionable trading content until the public release embargo in `PUBLICATION_POLICY.md` has expired. Same-day executed trades and any decision containing exact unexpired order sizing, live target weights, or live scale ladders must stay local and unpublished until broker execution, cancellation, expiry, or no-action decision is confirmed, the regular market close plus safety buffer has passed, and sensitive-field review is complete.
18. Every public-facing dashboard, README, decision surface, and per-symbol research page must make clear that the repository is a personal historical research journal and not investment advice.

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

Public release adds a stricter layer: do not commit raw broker artifacts, raw screenshots, unredacted confirmation identifiers, personal documents, secrets, local credential paths, private messages, or other sensitive material even when it would improve transparency. Normalize and redact broker-confirmed facts into repository schemas instead.

## Writing Format

Use natural wrapping for Markdown prose and documentation. Do not hard-wrap ordinary paragraphs at a fixed character count. Keep each paragraph, list item, or sentence group on the line that best matches the content and surrounding style. Preserve semantic line breaks for code blocks, tables, CSV headers and rows, YAML structures, command examples, and source code.

## Language Policy

Use idiomatic English as the repository-wide default language. Documentation, templates, source comments, UI text, accessibility labels, data notes, commit messages, and public dashboard copy should be written in clear native-quality English. Do not add Chinese documentation, Chinese UI strings, Chinese routes, or language-switching pages unless the user explicitly asks for a multilingual feature.

## Repo-Scoped Skills

Repo-scoped Codex skills under `.agents/skills/` are lightweight trigger and navigation layers for repeated workflows. They do not replace `AGENTS.md`, `SPEC.md`, policy files, templates, scripts, or committed data.

- Keep `SKILL.md` concise. It should point to canonical repository files rather than copying the full process.
- Do not include secrets, local-only paths, broker credentials, raw market-data dumps, or large source downloads.
- Update the relevant repo-scoped skill when a durable workflow trigger or execution order changes.
- Do not install repo-specific skills globally unless the user explicitly asks for cross-repository reuse.
- If a repo-scoped skill and `AGENTS.md` conflict, follow `AGENTS.md` and fix the skill.
- Create a new repo-scoped skill only when a repeated workflow needs stronger automatic triggering or navigation than `AGENTS.md`, `SPEC.md`, and templates provide.
- Do not create skills for one-off research notes, individual stock theses, temporary experiments, raw source material, or broad process prose better kept in `SPEC.md`.
- During meta-self-improvement, explicitly check whether a durable process lesson should update `.agents/skills/`, and whether an existing skill has drifted from canonical rules.

## Workflow Router

Treat this repository as an operating system for the satellite account. The repository stores durable state, policy, templates, scripts, dashboard behavior, research memory, and audit history; Codex or a future agent supplies active compute only when the user starts work in this repository. Scheduled deterministic automation may refresh allowed market-data surfaces, validate, build, deploy, and apply the exact due deposit covered by the active standing authorization. It must not perform qualitative research judgment, recommend orders, mutate any other account fact, or trade.

`AGENTS.md` defines mandatory safety and routing. Detailed step-by-step workflow belongs in `SPEC.md`, templates, [docs/research-command-reference.md](docs/research-command-reference.md), [docs/subagent-protocol-reference.md](docs/subagent-protocol-reference.md), and scripts. For token efficiency, load the specific template and `SPEC.md` section needed for the request instead of rereading the entire operating manual when a narrow canonical surface is enough.

Trigger tiers:

1. Every repository interaction: run the proportional Article 1 preflight, read the relevant rules, inspect current state before changing files, preserve user changes, decide whether stale, duplicated, misleading, or low-signal material should be cleaned up, run the relevant validation after meaningful changes, and complete the Article 1 postflight before the final conclusion. A narrow maintenance task does not require a full investment cycle solely to satisfy this invariant.
2. Investment decision request: any request about new cash, a contribution, buying, selling, holding cash, using SGOV, allocation, portfolio action, or "what should I do" triggers the full decision operating cycle before any proposed order. Use [templates/monthly-decision.md](templates/monthly-decision.md).
3. Full-cycle request: phrases such as "run the whole repo flow", "execute everything", "full refresh", "full monthly cycle", "全量执行", or similar language trigger every applicable repository workflow in safe order, including market data, macro-regime refresh, community lead triage, research readiness, validation, and dashboard checks when applicable. Use [templates/full-operating-cycle.md](templates/full-operating-cycle.md), and use the monthly template too when allocation is requested.
4. Execution-confirmation update: when the user says trades or non-standing deposits were actually completed, use [templates/execution-confirmation.md](templates/execution-confirmation.md) and update account files only from the required confirmed fields. Due fixed weekly deposits follow the deterministic standing-contribution branch in that template.
5. Research, discovery, freshness, valuation, promotion, or cleanup run: use [templates/research-engine-run.md](templates/research-engine-run.md), [templates/bottleneck-lane-review.md](templates/bottleneck-lane-review.md), [templates/agentic-discovery-run.md](templates/agentic-discovery-run.md), [templates/discovery-readiness-sprint.md](templates/discovery-readiness-sprint.md), and [templates/promotion-review.md](templates/promotion-review.md) as applicable.
6. Dashboard or product work: use the Public Dashboard section of `SPEC.md`, `PUBLICATION_POLICY.md`, committed data files, and the relevant frontend source. Inspect desktop and mobile behavior after visual changes when practical.
7. Public release or external posting: use [templates/publication-release-review.md](templates/publication-release-review.md) and `PUBLICATION_POLICY.md`.
8. Process improvement: use [templates/meta-self-improvement.md](templates/meta-self-improvement.md) for substantial methodology upgrades, recurring defects, postmortems, premortems, or changes that introduce new scoring, source, automation, or dashboard behavior.

Mandatory workflow invariants:

- Run the Article 1 preflight for every repository interaction. Ask whether the proposed action or conclusion improves the probability of finding, funding, sizing, or holding rare qualifying outcomes, or preserves a truth, survival, human-control, audit, clone-portability, or public-safety boundary needed to prevent avoidable ruin. If neither is true, simplify, redirect, or omit the work.
- Rebuild every material analysis from first principles before assigning or inheriting a rating, status, valuation, rank, size, or action. Record the common `First-Principles Analysis` fields, cite the facts behind the causal chain, challenge inherited premises, and make the decision consequence explicit. A lightweight continuity check may be concise, but it must not present an inherited conclusion as fresh analysis.
- Run the Article 1 postflight before every final conclusion or meaningful repository change. State internally whether the result advanced the mission, preserved a necessary mission boundary, or merely added ceremony, certainty-seeking, conventional comfort, or inactivity. Revise the conflicting lower-level artifact during the same authorized work when practical; otherwise record the conflict and next corrective action.
- At the beginning and end of every powered-on automated repository run, and before any commit or push, run `npm run check:article-one`. Treat `PASS` as permission to continue, `WARN` as a dated review trigger, and `BLOCK` as a stop on automated commit, push, deployment, account mutation, and decision completion. A guard failure is not permission to trade or a portfolio-wide veto when the defect is unrelated to target or opportunity-cost evidence.
- Never implement Article 1 cleanup as silent deletion or self-authorized rewriting of protected surfaces. Automated runs must not rewrite `CONSTITUTION.md`, immutable broker-truth and human-control rules, the active policy, `PUBLICATION_POLICY.md`, Article 1 validators or tests, or their own automation configuration to make a failure disappear. Repair an unambiguous lower-level conflict narrowly when authorized and safe; otherwise preserve the evidence, mark the artifact superseded or blocked, and request review.
- Start from confirmed account facts only. Broker evidence controls; the active standing authorization confirms only its exact due deposit. Recommendations, screenshots without required execution details, inferred prices, and user estimates cannot mutate account records.
- Serious research starts from the bottleneck map, not from a static stock list.
- Monthly decisions require fresh data retrieved during that cycle and must cite source publication dates, retrieval dates, validity windows, trigger conditions, invalidation conditions, and unavailable evidence.
- Deterministic discovery scripts are scaffolding and first-pass lead generators. They do not create buy eligibility or replace primary-source research.
- Macro-regime files and public community scans are risk-overlay and lead-generation inputs. They may raise analysis priority, tighten entry discipline, or trigger freshness review, but they do not create buy eligibility, promotion eligibility, raw-candidate records, security metadata, or allocation evidence by themselves.
- Every full operating cycle and monthly decision must record a current watchlist-cycle review row for every non-removed `research/watchlist.csv` symbol, even when the result is `no_change`. Coverage does not imply equal research depth: use lightweight source-backed continuity checks for low-signal names and concentrate judgment on holdings, active/core names, event-triggered symbols, and genuine challengers.
- Plausible material raw candidates must move through discovery readiness before they can affect allocation, unless primary evidence rejects them, the instrument is ineligible, they are explicitly not material, or the remaining blocker is genuinely external.
- Promotion is separate from discovery readiness. A lower-status symbol cannot enter `active_candidate`, `active_core_candidate`, buy-zone ranking, or proposed orders without a fresh promotion review.
- Do not finish material investment or discovery work with decision-critical target or opportunity-cost evidence still in `not_ready` when the missing evidence is publicly reachable. Bounded discovery and unrelated process debt must remain visible with scope and a dated next action, but it cannot veto a decision-ready rare opportunity. User-only broker facts, broker order previews, and final execution instructions are execution prerequisites, not repository-readiness blockers.
- Compare all active candidates and holdings together before allocation. Do not anchor on prior favorites when new evidence, valuation, lane changes, or opportunity cost changes the set.
- Treat Article 1 mission accountability as a required decision surface. Record liquidity-option weight, days since the latest mission-relevant deployment, the latest confirmed return-seeking buy separately, the strongest counterfactual candidate, portfolio-impact math, the path from starter to mission-relevant size, and any 45-day, 90-day, or 180-day review trigger under policy `v1.3`. A symbolic or immaterial trade does not reset the mission-relevant deployment clock.
- Before finalizing zero new exposure while confirmed deployable liquidity exists, compare zero with the smallest mission-consistent staged exposure to the strongest candidate. Record the concrete decision-critical blocker, why size cannot bound it, cash opportunity cost, conjunctive evidence-and-price trigger, and next evidence deadline. Volatility, concentration, youth, non-profitability, or bounded uncertainty alone are not sufficient vetoes.
- Separate target investment readiness and opportunity-set sufficiency from whole-repository health. Material evidence debt that can change the target or ranking remains blocking; unrelated dashboard, formatting, or low-priority research debt must be completed and disclosed but cannot veto a decision-ready rare opportunity.
- Run repository cleanup and applicable validation before finishing meaningful work. Use `npm run check:data` for data or research changes and `npm run verify` for dashboard or broad repository changes when practical.

## Subagent Protocol

The user authorizes using subagents whenever doing so is scientifically reasonable and improves the odds of serving the constitution. For critical investment decisions, full-cycle runs, major discovery updates, material filing reviews, material watchlist reprioritization, promotion reviews, and substantial process changes, use the strongest available model and reasoning effort for judgment-heavy reviewers when tooling is available, normally `xhigh`.

Required material monthly-decision or full-cycle allocation reviewers, when tooling is available unless explicitly skipped with an allowed reason:

- discovery-lane and candidate triage;
- freshness and filing;
- bull case;
- bear case;
- allocation/risk.

Required material promotion reviewers, when tooling is available unless explicitly skipped with an allowed reason:

- evidence/freshness;
- valuation/entry;
- bull case;
- bear case;
- opportunity-cost and allocation/risk;
- source-quality or process red-team when evidence is noisy or conflicting.

Allowed skip reasons for required material reviewers are `tool_unavailable`, `not_material_to_request`, or `already_resolved_by_primary_evidence`; skipped required roles must be stated explicitly in the run artifact or final response.

Discovery subagents must answer the first-layer bottleneck questions before producing ticker lists:

- What could become scarce or strategically constrained over the next decade?
- Who controls, owns, enables, or can remove that scarcity?
- Who can convert the scarcity into pricing power, reinvestment paths, and shareholder value?
- Is there a public security that directly expresses that exposure under the current policy?
- Is the public company early, small, misunderstood, newly listed, awkward, or underfollowed enough to support extreme asymmetric upside?

Subagent boundaries:

- Deterministic commands, durable file edits, account-state reconstruction, validation, commits, pushes, and final synthesis remain the main agent's responsibility.
- Prefer independent fresh-context subagents with bounded evidence packets, explicit file paths, source links, deterministic outputs, safety boundaries, and narrow questions. Use [docs/subagent-protocol-reference.md](docs/subagent-protocol-reference.md) for the cold-path evidence-packet and minimum-output schemas.
- Subagents should normally be read-only reviewers for investment decisions. They may edit files only when the main agent assigns a narrow, disjoint write scope and the task is not a broker-record or account-state mutation.
- Subagents must not update `data/account/ledger.csv`, `data/account/positions.csv`, `data/account/state.yml`, cost basis, cash, or broker facts.
- Subagents must cite source dates, retrieval dates, file paths, and uncertainty. They should separate facts, inferences, and recommendations.
- Subagent disagreement is a signal, not a voting problem. The main agent must reconcile conflicts from primary evidence. If a disagreement is decision-critical and affects buy eligibility, survival, valuation bounds, sizing, promotion, or a critical freshness event and cannot be resolved, default to no trade for that target, no promotion, hold cash, or the approved liquidity reserve. Non-critical disagreement should reduce size, tighten triggers, or shorten validity rather than automatically veto the whole opportunity set.
- Do not save raw subagent transcripts by default. Persist the final synthesis, durable research changes, or a concise process review only when the reviews change the decision, evidence state, workflow behavior, or future interpretation.
- For material discovery, persist a structured agentic discovery artifact under `research/discovery/runs/` using [templates/agentic-discovery-run.md](templates/agentic-discovery-run.md).

Use cache-aware coarse-to-fine discovery. Stable, source-backed, auditable intermediate work may be reused when source hash, timestamp, scope, classifier version, and invalidation rule prove reuse does not weaken freshness. Volatile surfaces such as current prices, market cap, new filings, financing, dilution, contracts, regulator actions, management changes, new listings, and material price dislocations must be refreshed or revalidated during material decisions and full cycles. Reserve xhigh review for conclusions that can change readiness, watchlist status, valuation, buy-zone eligibility, allocation, or unresolved conflicts.

## Research Engine Gates

The repository must evolve from a static watchlist into a self-evolving research engine. The bottleneck map comes first, the watchlist comes second, and individual stock research comes third.

Every serious research or decision cycle must review:

- thesis delta: strengthened, unchanged, weakened, broken, or stale;
- entry delta: more attractive, unchanged, less attractive, dislocated, or too uncertain;
- priority delta: promote, demote, freeze, remove, incubate, or no change;
- opportunity-cost delta: whether another current or new candidate now better serves the mission;
- theme or lane delta: whether a new industry, supply bottleneck, regulatory shift, market structure change, or technology platform deserves a discovery lane, and whether existing lanes should be added, split, promoted, demoted, merged, retired, or left unchanged.
- mission-contribution delta: whether dilution-adjusted upside at a feasible initial and scaled weight can materially change the portfolio, and whether the current path to scale remains credible.

Discovery readiness is required for plausible material raw candidates. Use [templates/discovery-readiness-sprint.md](templates/discovery-readiness-sprint.md) and update `research/discovery/candidate-readiness.yml` when a candidate could affect allocation, opportunity cost, lane completeness, or watchlist priority. Do not end with "not buy-ready because data is missing" when the missing evidence can reasonably be gathered from public sources or repository tooling.

Use a stage-adjusted readiness funnel so keeping an early lead is not more expensive than rejecting it:

- `R0 lead`: identity and a source-backed bottleneck hypothesis;
- `R1 researchable`: security eligibility, one primary source, directness, survival red flags, and a rough dilution-aware capitalization basis;
- `R2 comparable`: stage-adjusted thesis, same-lane peers, scenario valuation, waiting cost, and disconfirming evidence;
- `R3 promotion_ready`: complete target evidence, filing and valuation work, independent review, dashboard coverage, and promotion eligibility.

R1 and R2 candidates may remain open under a dated service-level agreement without blocking an otherwise ready allocation. Only R3 requires full dashboard-equivalent coverage. Material candidates may not disappear silently: every open R1 or R2 name needs a next evidence source, due date, waiting-cost statement, and reopen or rejection trigger. `research_only` names may challenge the opportunity-cost ranking, but they still cannot receive an order until a fresh promotion review moves them into buy-zone eligibility.

Promotion is the process that moves a researched symbol toward `active_candidate`, `active_core_candidate`, and buy-zone consideration. Use [templates/promotion-review.md](templates/promotion-review.md) whenever a status or priority change would affect active/core standing, allocation ranking, or buy-zone eligibility.

Before recommending a buy, confirm three gates:

- Mission gate: the company still has a plausible dilution-adjusted multi-decade asymmetric upside path, the feasible position can materially affect the portfolio if successful, a source-backed path to scale exists, and the company does not merely duplicate the user's large Nasdaq technology core.
- Evidence gate: current primary evidence supports the thesis, material filings are reviewed, and no critical freshness event is unresolved.
- Entry gate: current price, valuation, dilution, balance-sheet survival, and opportunity cost still leave enough expected upside for the satellite objective.

Before converting a gate result into zero quantity, classify the unresolved item as `decision_critical`, `sizing`, or `process_debt` under policy `v1.3`. Only decision-critical uncertainty is an automatic target veto. Normal uncertainty must be tested against staging, position size, evidence milestones, invalidation, and a shorter validity window. Zero remains valid when the smallest feasible trade cannot be mission-relevant or loses on evidence, entry, survival, portfolio impact, or opportunity cost.

Rows marked `research_only`, `watch`, `not_tradable`, `probation`, `frozen`, or `removed` cannot receive new buy recommendations unless the decision first runs a fresh promotion review, updates durable transition records, and moves the symbol into buy-zone eligibility. When fresh evidence supports a rare opportunity, complete this fast-path process in the same powered-on session; the status machinery must not impose an artificial waiting period. Sells should be rare; prefer directing new contributions away from downgraded companies before selling existing long-term positions. Liquidity reserve sales are cash-management steps, not thesis-driven exits.

## Execution Update Workflow

When the user says trades or non-standing deposits were actually completed, or when a standing contribution becomes due:

1. Select the confirmation branch in [templates/execution-confirmation.md](templates/execution-confirmation.md). Trades and non-standing deposits require their occurrence-level facts. The fixed weekly deposit instead requires the active canonical standing authorization, a due local Friday on or after its effective date, and a conflict-free idempotency check.
2. Treat a broker order-status screenshot as a complete trade evidence packet when it visibly shows those non-defaultable facts. Do not ask the user to separately confirm the filled status or restate defaultable fields merely because the evidence arrived as a screenshot.
3. If the user does not indicate a broker/account change, use the defaulting rule in [templates/execution-confirmation.md](templates/execution-confirmation.md) instead of asking the user to restate repetitive broker/account, currency, redacted confirmation alias, standard settlement, zero-fee, or timestamp fields.
4. If non-defaultable fields are missing, ask one compact question for only those missing fields. Do not use current market prices as substitutes for trade economics. Do not ask for a second confirmation for a valid due standing contribution.
5. Convert broker evidence into normalized, redacted repository fields. Never commit raw broker screenshots, PDFs, statements, account numbers, full broker order IDs, or full confirmation numbers.
6. Append a new event to [data/account/ledger.csv](data/account/ledger.csv). For standing contributions, use the deterministic script and preserve one row per due Friday. Only the canonical authorization identity satisfies the scheduled occurrence; mark a truly separate same-day deposit with the explicit `user_confirmed_additional_deposit` source or stop on ambiguity.
7. Recalculate [data/account/positions.csv](data/account/positions.csv) and [data/account/state.yml](data/account/state.yml) from confirmed events. A deposit cannot change positions, and a standing contribution cannot advance `last_reconciled_with_broker_at`.
8. Add or refresh the equity-curve valuation snapshot for the confirmed event date when prices for that date are available. If price data is unavailable, leave the valuation gap rather than inventing a price.
9. Never silently edit old ledger rows. Use a `correction` event if a past record was wrong.
10. Do not commit, push, publish, or deploy same-day trade details until the `PUBLICATION_POLICY.md` public release embargo has expired. If market-close timing is uncertain, wait until the next regular trading day.
11. If broker evidence contradicts a standing contribution, use the canonical conflict command to append a machine-linked correction and pause the current authorization as `paused_broker_conflict` in one recoverable transaction. Require conflict resolution before applying later occurrences.

## Public Dashboard Workflow

The public dashboard lives at `https://www.wineandchord.com/invest/` and is served from this open-source repository as a static GitHub Pages project site.

Dashboard work must follow the Public Dashboard section of `SPEC.md` and `PUBLICATION_POLICY.md`. In particular:

- The real-data view must be built from committed repository files.
- Demo or fake data may exist only as browser-only testing state or clearly labeled fixture data. It must never mutate confirmed account files.
- The dashboard must clearly distinguish confirmed broker records from market snapshots, research records, and simulated data.
- When confirmed account data is missing, show a useful empty state rather than inventing real balances.
- Keep the page usable under `/invest/`; do not hard-code local filesystem paths or root-relative assumptions that break GitHub Pages project hosting.
- Every public display surface should have a clear data source, provenance boundary, freshness cue when relevant, empty/demo fallback, desktop and mobile behavior, visible `Not investment advice` copy, and no hidden dependency on local state.
- The dashboard must not expose raw broker artifacts, full confirmation identifiers, broker login flows, order tickets, alert-signup forms, copy-trade controls, reader portfolio intake, or execution controls.
- After frontend changes, run the local build and inspect the page locally across desktop and mobile widths before committing when practical.

## Continuous Improvement and Noise Hygiene

This repository should become more useful, more reliable, and easier to operate after each serious interaction. Improvement is not only adding features. It also means deleting clutter, reducing ambiguity, tightening stale rules, and making the next decision cycle cheaper without lowering decision quality.

- Capture durable lessons in the smallest durable place: `AGENTS.md` for agent behavior, `SPEC.md` for system behavior, templates for repeated workflows, data files for durable records, source files for product behavior, and `research/process/` for substantial process reviews.
- Remove or demote noise created by the work: obsolete demo assumptions, duplicate research notes, unused UI states, dead scripts, stale screenshots, outdated candidate labels, irrelevant sources, misleading comments, generated artifacts, local logs, and exploratory scratch files.
- Preserve audit history. Do not delete confirmed ledger events, policy versions, or dated decisions just because they are old. If historical material remains useful only as history, mark it historical, archived, superseded, or stale instead of presenting it as current evidence.
- Prefer concise canonical records over sprawling parallel notes. If two files describe the same durable rule, keep one authoritative version and link to it from the other.
- During every monthly decision, explicitly separate current evidence, historical evidence, stale evidence, and analysis. Do not let old narratives keep influencing allocation after their evidence window expires.
- When cleaning up, keep changes reviewable: explain the cleanup in the commit message or decision note when it affects future interpretation.
- Do not add process ceremony that makes the next decision slower without improving signal, safety, or auditability.

## Research Discipline

Each active company thesis must include a one-sentence thesis, why it can plausibly produce extreme multi-decade upside, dilution-adjusted downside/base/upside/exceptional paths when supportable, portfolio impact at a feasible initial and scaled position, the evidence path to scale or exit, key evidence needed next, disconfirming evidence and kill criteria, balance sheet and dilution risk, customer concentration and dependency risk, regulatory, technical, execution, and valuation risk, and next review date.

Research is organized as a pipeline:

1. `research/discovery/lanes.yml` for structural bottleneck lanes that guide search beyond the current watchlist.
2. `research/discovery/candidates.csv` for raw potential public candidates found by universe scans.
3. `research/discovery/candidate-readiness.yml` for readiness status of open raw candidates.
4. `research/freshness/events.csv` for material filings, IR releases, contracts, financing, dilution, regulatory events, price dislocations, and thesis triggers.
5. `research/valuation-states.csv` for current valuation and entry-attractiveness state.
6. `research/macro/` for macro-regime snapshots, per-symbol macro sensitivity, financing fragility, shared risk factors, and event-calendar triggers.
7. `research/community-sources.yml` and sanitized community triage artifacts for public no-token attention shifts and lead-generation inputs.
8. `research/operating-runs.csv` for public-safe full-cycle dashboard summaries, source links, validation state, publication status, and confirmed ledger event links.
9. `research/quality-metrics.yml` for coverage, freshness, lane-map health, macro-process health, stale analysis, and open-event health checks.
10. `research/filings/` for completed material filing reviews linked from freshness events.
11. `research/promotion/` for promotion reviews.
12. `research/watchlist.csv` for candidates that deserve ongoing active monitoring.
13. `research/watchlist-cycle-reviews.csv` for the per-cycle review row that every non-removed watchlist symbol must receive during full-cycle and monthly-decision runs.
14. `research/watchlist-transitions.csv` for machine-checkable status and priority changes.
15. `research/buy-zones.csv` for symbol-level current buy-zone state.
16. `research/position-construction.yml` for portfolio-impact, permanent-impairment, stage, and path-to-scale analysis without unexpired public execution sizing.
17. `research/company-analysis.yml` for dashboard-visible historical analysis.
18. `research/process/decision-retrospectives.csv` for post-decision and post-discovery process review loops.
19. `research/sources.yml` for durable source metadata.

When adding a durable company analysis that should appear on the public dashboard, add or append a structured entry in [research/company-analysis.yml](research/company-analysis.yml) and link it to the dated source note. Do not parse long-form Markdown as the dashboard database when a structured index can carry the needed summary and provenance.

When a candidate or holding publishes a material filing, do not make a buy recommendation until the filing has been reviewed or the decision explicitly says why the filing is immaterial. Financial statement review must consider revenue growth, gross margin, operating margin, cash flow, cash, debt, dilution, share count, stock-based compensation, backlog or RPO when relevant, customer concentration, guidance, risk-factor changes, and liquidity. Completed material filing reviews must be saved under `research/filings/` and linked from `research/freshness/events.csv` through `review_path`; immaterial events need an `immaterial_reason`.

Do not blindly follow the user's initial candidate list. Treat it as a starting watchlist and independently challenge every company.

## Git Rules

The user allows direct commits and pushes to `main` for this repository.

Commit after meaningful changes to policy, records, research, or decisions when the public release embargo allows the changed content to become public. Push to the default remote when the work is coherent and `PUBLICATION_POLICY.md` has been satisfied. Use concise commit messages in the repository's style. Never commit secrets, raw broker artifacts, unredacted broker identifiers, actionable pre-close trading content, or local-only paths.
