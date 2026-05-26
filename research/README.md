# Research

This directory stores durable research memory.

Use it to avoid repeating low-value searches, but never treat it as fresh market truth. Every monthly decision must refresh current prices, company disclosures, regulatory updates, and material news.

Files:

- `watchlist.csv`: current candidate universe and monitoring status.
- `discovery/candidates.csv`: potential new public candidates found by universe scans before they deserve watchlist promotion.
- `freshness/events.csv`: dated filing, IR, regulatory, contract, financing, dilution, price, and thesis-trigger events that require review.
- `valuation-states.csv`: latest valuation and entry-attractiveness state for researched symbols.
- `quality-metrics.yml`: compact health metrics for coverage, freshness, stale analysis, and open event risk.
- `filings/`: completed material filing reviews linked from freshness events.
- `company-analysis.yml`: structured company analysis index used by the public dashboard for quick briefs and historical drilldowns.
- `sources.yml`: durable source register.
- `2026-05-26-initial-baseline.md`: first baseline research snapshot.

Future company-specific files should follow [templates/company-research-card.md](templates/company-research-card.md).

Material SEC filings and official reports should be reviewed with [templates/filing-review.md](../templates/filing-review.md). A filing can update freshness events, valuation state, or dashboard-visible analysis, but it must not mutate broker-confirmed account records.

Use [templates/research-engine-run.md](../templates/research-engine-run.md) for each durable discovery, freshness, valuation, and cleanup run that changes the research engine state.
