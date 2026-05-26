# Filing Review Template

Use this template when a candidate or holding publishes a material SEC filing or equivalent official report.

Save completed reviews under `research/filings/` using `YYYY-MM-DD-SYMBOL-FILINGTYPE-ACCESSION.md`, then link the related freshness event through `review_path`.

Required for:

- Form 10-K
- Form 10-Q
- Form 20-F or 6-K when the company is a foreign issuer
- Form S-1, F-1, 424B, or prospectus filings
- Form 8-K when it contains earnings, guidance, financing, major customer, contract, acquisition, auditor, governance, leadership, or risk-factor information

## Filing Identity

```yaml
symbol:
company:
filing_type:
accession_number:
filing_date:
period_end:
source_url:
retrieved_at:
policy_version:
related_prior_analysis:
```

## Executive Conclusion

State whether the filing strengthened, weakened, broke, or did not materially change the thesis.

## What Must Be Read

Do not rely only on headlines, summaries, quote APIs, or XBRL tables. Read the relevant primary filing sections:

- business update and management discussion;
- financial statements;
- footnotes;
- liquidity and capital resources;
- risk factors and changes to risk factors;
- segment information;
- customer concentration;
- debt, covenants, share issuance, warrants, convertibles, and stock-based compensation;
- backlog, remaining performance obligations, bookings, orders, launch cadence, production capacity, or equivalent operating metrics when applicable;
- subsequent events.

## Metric Extraction

Record the metrics that matter for this company and thesis. Use `N/A` only when the filing truly does not disclose the item.

```yaml
revenue_growth_yoy:
gross_margin:
operating_margin:
free_cash_flow:
cash_and_short_term_investments:
total_debt:
net_cash_or_net_debt:
shares_outstanding:
share_count_change_yoy:
stock_based_compensation:
customer_concentration:
backlog_or_rpo:
bookings_or_orders:
capex:
cash_runway:
guidance_change:
```

## Thesis Delta

Explain what changed against the latest stored thesis.

## Valuation Delta

Explain whether the current price and market capitalization became more attractive, fair, expensive, dislocated, or thesis-broken.

## Risk Delta

Discuss dilution, debt, liquidity, customer concentration, execution, regulation, technical milestones, governance, and accounting quality.

## Required Repository Updates

- Add the filing to `research/sources.yml`.
- Add or update a row in `research/freshness/events.csv`, including `reviewed_at` and `review_path` when the review is complete.
- Add or update a row in `research/valuation-states.csv` when valuation changed materially.
- Add a new `research/company-analysis.yml` entry only if the conclusion should appear in the public dashboard history.
- Do not update account ledger, positions, or cash from a filing.
