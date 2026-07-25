# RIOT Discovery Readiness — 2026-07-25

```yaml
symbol: RIOT
candidate_name: Riot Platforms Inc.
review_date: 2026-07-25
policy_version: v1.1
candidate_record: research/discovery/candidates.csv
material_to_current_allocation: true
affected_lanes: [ai_compute_infrastructure, ai_power_and_cooling]
materiality_reason: A power-ready campus with a ten-year AMD lease and expansion options materially expands the public comparison set for converting scarce grid-connected capacity into AI-infrastructure rent.
blocking_scope: ai_compute_lane_opportunity_cost_completeness
readiness_status: incubated_after_review
blocker_type: evidence_based
classification: incubate
dashboard_surface_status: complete
source_ids: [riot_q1_2026_10q, new_discovery_completed_closes_2026_07_24]
readiness_index_record: research/discovery/candidate-readiness.yml
```

## Bottleneck Fit

Riot historically monetizes power and computing equipment through bitcoin mining. It is now developing a data-center segment around its power-connected Rockdale site and a ten-year AMD lease. The direct bottleneck expression is commissioned power, construction and deployment speed; the equity remains a mixed bitcoin and AI-infrastructure exposure rather than a clean recurring-rent security.

```yaml
what_could_become_scarce: Grid-connected, permitted and deliverable high-density compute capacity with reliable power and cooling.
who_controls_or_removes_scarcity: Riot controls campuses and electrical infrastructure, while AMD and financing counterparties control much of the demand and buildout economics.
who_can_monetize_into_shareholder_value: Common shareholders benefit only if delivered capacity earns recurring rent and cash returns above capital cost without repeated equity issuance or bitcoin losses overwhelming it.
public_security_expression: Nasdaq common stock RIOT is active and policy-eligible.
early_small_misunderstood_or_newly_public: The AI-campus transition is new, but the issuer is already widely followed and valued in the multi-billion-dollar range.
direct_exposure_or_proxy_quality: Direct AMD campus exposure combined with dominant residual bitcoin-mining exposure.
disconfirming_evidence: Q1 data-center revenue was primarily initial leasing and tenant fit-out, recurring rent economics are not separately proved, and USD 500 million of ATM capacity remained unused.
```

## Evidence Gathered

The April 30 Form 10-Q reports USD 167.2 million of Q1 external revenue: USD 111.9 million bitcoin mining, USD 33.2 million data center and USD 22.2 million engineering. The company states that data-center revenue was primarily attributable to initial leasing and associated tenant fit-out. The April lease amendment added 25 MW, left a 50 MW reserved option and granted a conditional first-priority right for another 100 MW, which could bring AMD to 200 MW. As of March 31, all USD 500 million of the 2025 ATM remained available.

The completed July 24 IEX close was USD 22.53. The stock returned -5.65 percent over one session, +23.38 percent over five sessions, -17.92 percent over 21 sessions, +23.59 percent over 63 sessions and +31.99 percent over 126 sessions. Volatility and a one-day decline do not resolve buildout economics.

```yaml
security_metadata:
  exchange: Nasdaq
  asset_type: common_stock
  sec_cik: "0001167419"
  tradability: tradable
  market_data_symbol: RIOT
market_data:
  completed_close_as_of: 2026-07-24
  completed_close: 22.53
  indicated_market_cap: 8538382022.73
  source: SEC point-in-time shares and Alpaca IEX daily bars
filings_and_reports:
  latest_10q: riot_q1_2026_10q
  material_filings_requiring_review: reviewed for research-only readiness
same_lane_peers:
  peers: [IREN, WULF, CIFR]
  comparison_summary: RIOT adds AMD tenancy but has less clean recurring-rent evidence and more bitcoin exposure than an ideal infrastructure expression.
```

## Analysis

```yaml
facts_verified: AMD lease and expansion terms, Q1 segment revenue, fit-out attribution, cash, disclosed borrowings, point-in-time shares, ATM capacity and completed 2026 prices.
inferences: Power access can create value, but fit-out reimbursement is not equivalent to recurring rent and bitcoin economics can dominate consolidated cash generation and valuation.
thesis_delta: new_research_only_hypothesis
entry_delta: dislocated_but_too_uncertain
priority_delta: incubate_at_C_plus
dilution_or_balance_sheet_risk: Buildout requires capital, the ATM can transfer upside through new shares, and restricted cash plus bitcoin assets complicate enterprise-value comparisons.
execution_or_technical_risk: Construction, commissioning, power delivery, cooling, tenant acceptance, utilization and maintenance can delay returns.
customer_or_contract_quality: AMD is a high-quality counterparty, but concentration is extreme and recurring economics are not yet separately demonstrated.
valuation_and_entry_state: Current market value is already substantial relative to unproved recurring data-center earnings. No executable limit exists.
peer_comparison: IREN, WULF and CIFR already provide direct comparison; RIOT does not currently outrank them or cash.
policy_or_safety_blockers: Research-only status prohibits a buy without a fresh promotion review.
reachable_evidence_remaining: none
```

## Decision

RIOT enters C+ research-only coverage with quantity zero and no executable limit. Reopen promotion after AMD capacity is delivered and accepted, recurring rent and utilization are separated from fit-out reimbursement, project capex and financing are reconciled, bitcoin exposure and dilution are bounded, and consolidated cash returns support per-share value. A price decline alone is not sufficient.

```yaml
final_classification: incubate
dashboard_surface_status: complete
buy_or_no_buy_implication: Research-only; quantity zero and no executable limit.
required_durable_updates:
  watchlist_or_research_universe_record: research/watchlist.csv
  security_metadata: data/market/security_master.csv
  price_history: data/market/price_history.csv
  latest_price: data/market/watchlist_prices.csv
  technical_snapshot: data/market/technical_snapshots.csv
  company_metrics: data/market/company_metrics.csv
  valuation_state: research/valuation-states.csv
  freshness_or_filing_review: research/freshness/events.csv
  company_analysis_entry: research/company-analysis.yml
  per_symbol_dashboard_page: generated from the complete research-only data surface
next_action: Reopen only after accepted AMD capacity, separately proved recurring rent, reconciled capex and financing, bounded dilution and positive per-share cash economics.
conditions_to_change_view: Promotion requires a clean infrastructure return case that outranks existing compute and power candidates; volatility alone is insufficient.
```
