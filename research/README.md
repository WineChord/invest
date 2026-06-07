# Research

This directory stores durable research memory.

Use it to avoid repeating low-value searches, but never treat it as fresh market truth. Every monthly decision must refresh current prices, company disclosures, regulatory updates, and material news.

The research process is a funnel serving the root mission: multi-decade asymmetric compounding with outcomes that can plausibly become tens, hundreds, or thousands of times larger over a very long horizon, while avoiding avoidable ruin. It starts from the bottleneck map, scans broadly and cheaply, filters by mission-relevant discovery lanes, rejects weak fits quickly, and reserves deep filing work for a small active set that could affect allocation.

Files:

- `watchlist.csv`: current candidate universe and monitoring status.
- `discovery/lanes.yml`: structural bottleneck lane map used to search beyond the current watchlist.
- `discovery/candidates.csv`: potential new public candidates found by universe scans before they deserve watchlist promotion.
- `discovery/candidate-readiness.yml`: machine-checkable readiness status for open raw candidates.
- `discovery/runs/`: structured agentic discovery run artifacts, deterministic discovery audit outputs, and bounded subagent evidence packets.
- `discovery/readiness/`: per-candidate readiness sprint notes.
- `community-sources.yml`: public no-token community source configuration for weak sentiment and lead-generation scans.
- `freshness/events.csv`: dated filing, IR, regulatory, contract, financing, dilution, price, and thesis-trigger events that require review.
- `valuation-states.csv`: latest valuation and entry-attractiveness state for researched symbols.
- `watchlist-cycle-reviews.csv`: per-cycle stale-prevention review rows for every non-removed watchlist symbol during full-cycle and monthly-decision runs.
- `watchlist-transitions.csv`: machine-checkable status and priority transition records.
- `buy-zones.csv`: symbol-level buy-zone status, trigger, entry condition, and sizing role.
- `quality-metrics.yml`: compact health metrics for coverage, freshness, stale analysis, and open event risk.
- `filings/`: completed material filing reviews linked from freshness events.
- `promotion/`: promotion reviews for moving a symbol toward `active_candidate`, `active_core_candidate`, buy-zone consideration, demotion, freeze, or removal.
- `company-analysis.yml`: structured company analysis index used by the public dashboard for quick briefs and historical drilldowns.
- `sources.yml`: durable source register.
- `2026-05-26-initial-baseline.md`: first baseline research snapshot.

Material incubating public candidates should not remain hidden in discovery-only files. If they are not rejected, archived, not material, externally blocked, or not tradable, they should also appear in the dashboard-facing research universe with watchlist/research-only status, security metadata, latest price, price history, technical snapshot, company metrics when available, valuation state, filing or freshness review, a `company-analysis.yml` entry, and `dashboard_surface_status: complete` in `discovery/candidate-readiness.yml`.

Discovery readiness does not make a symbol buyable. A `research_only` or `watch` symbol needs a promotion review before it can move into active/core status or buy-zone consideration. Promotion reviews should compare the symbol against current core candidates, cash, and the approved liquidity reserve, and should use independent xhigh evidence, valuation, bull, bear, and opportunity-cost reviews when the change could affect allocation.

Every full operating cycle and monthly decision must refresh `watchlist-cycle-reviews.csv` for all non-removed watchlist rows. This is the lightweight review that keeps priority, status, next-review triggers, thesis freshness, and buy-zone state from going stale. It may conclude `no_change`, but it cannot be skipped.

Future company-specific files should follow [templates/company-research-card.md](templates/company-research-card.md).

Material SEC filings and official reports should be reviewed with [templates/filing-review.md](../templates/filing-review.md). A filing can update freshness events, valuation state, or dashboard-visible analysis, but it must not mutate broker-confirmed account records.

Use [templates/research-engine-run.md](../templates/research-engine-run.md) for each durable discovery, freshness, valuation, and cleanup run that changes the research engine state.

Use `npm run scan:community` for a no-token public community scan across configured Reddit RSS, Stocktwits public endpoints, Hacker News Algolia search, and generic RSS feeds, then use `npm run triage:community` to turn the aggregate scan into an analysis-priority queue. The default outputs are ignored aggregate caches under `research/cache/community/`; they record source counts, symbol mentions, per-source leaderboards, lane keyword mentions, reason-keyword co-mentions, sample URLs, retrieval metadata, and triage actions, not raw post bodies or author names. These signals are weak discovery leads only and require primary-source review before any durable candidate, watchlist, readiness, promotion, or allocation change.

Do not commit large raw source downloads by default. Use ignored local scratch paths such as `research/cache/` or `research/downloads/` during analysis, then commit source metadata, metric extracts, filing reviews, and conclusions.
