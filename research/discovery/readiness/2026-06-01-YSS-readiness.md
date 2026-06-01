# YSS Discovery Readiness Sprint

```yaml
symbol: YSS
candidate_name: York Space Systems Inc.
review_date: 2026-06-01
policy_version: v1.1
candidate_record: research/discovery/candidates.csv
material_to_current_allocation: true
affected_lanes:
  - space_infrastructure
materiality_reason: YSS is a newly public direct defense-space spacecraft manufacturer and operations provider with material revenue and backlog, making it a same-lane opportunity-cost peer for current space candidates.
blocking_scope: current_space_allocation
readiness_status: incubated_after_review
blocker_type: evidence_based
classification: incubate
dashboard_surface_status: complete
source_ids:
  - yss_q1_2026_results
  - yss_q1_2026_10q
  - yss_ipo_prospectus_2026_01_28
  - yahoo_chart_yss_2026_05_29
  - sec_companyfacts_yss_2026_06_01
readiness_index_record: research/discovery/candidate-readiness.yml
```

## Bottleneck Fit

```yaml
what_could_become_scarce: Rapid, low-cost, flight-proven spacecraft production and operations for proliferated defense constellations could become a durable bottleneck.
who_controls_or_removes_scarcity: Suppliers with vertically integrated spacecraft hardware, software, mission operations, production capacity, government relationships, and backlog conversion can remove that scarcity.
who_can_monetize_into_shareholder_value: YSS can monetize if backlog converts into revenue and gross profit while defense-space architectures such as proliferated LEO and missile-defense constellations scale.
public_security_expression: YSS is an NYSE common-stock security and directly expresses York Space Systems.
early_small_misunderstood_or_newly_public: Newly public and specialized enough for asymmetric research coverage, but already multi-billion-dollar market cap.
direct_exposure_or_proxy_quality: Direct and stronger than most broad defense contractors for this lane.
disconfirming_evidence: Q1 losses, material weakness, contract-accounting estimation risk, customer concentration, acquisition integration, and controlled-company governance remain unresolved.
```

## Evidence Gathered

```yaml
security_metadata:
  exchange: NYSE
  asset_type: common_stock
  sec_cik: "0002086587"
  tradability: tradable
  market_data_symbol: YSS
  source_ids:
    - yss_q1_2026_10q
market_data:
  price_as_of: 2026-05-29
  price: 32.64
  market_cap: approximately USD 4.23 billion using SEC companyfacts shares
  liquidity: newly public but actively traded common stock
  source_ids:
    - yahoo_chart_yss_2026_05_29
filings_and_reports:
  latest_10k_or_20f: 2026-03-20 Form 10-K for fiscal 2025
  latest_10q_or_6k: 2026-05-15 Form 10-Q for Q1 2026
  registration_or_offering_filings: 2026-01-28 IPO prospectus and 2026 S-8
  earnings_material: 2026-05-14 Q1 2026 results release
  material_filings_requiring_review: Q1 2026 10-Q reviewed here
issuer_and_industry_context:
  issuer_ir_sources: Q1 2026 results release
  regulator_or_contract_sources: SEC filings
  industry_sources: same-lane comparison against RKLB, FLY, VOYG, LUNR, RDW, KTOS, and rejected MNTS
same_lane_peers:
  peers:
    - RKLB
    - FLY
    - VOYG
    - LUNR
    - RDW
    - KTOS
  comparison_summary: YSS is a stronger newly public same-lane peer than VOYG and FLY for current operating proof, but RKLB still has the stronger broad platform status for first allocation.
```

## Analysis

```yaml
facts_verified:
  - Q1 2026 revenue was about USD 116.3 million.
  - Remaining performance obligations were about USD 642.3 million.
  - March 31 2026 cash and cash equivalents were about USD 655.7 million.
  - March 31 2026 debt was about USD 147.9 million.
  - The Q1 filing disclosed a material weakness in internal control over financial reporting.
  - Q1 2026 net loss was material, with IPO and acquisition-related effects requiring follow-up.
inferences:
  - YSS is the highest-quality post-discovery space candidate among MNTS, VOYG, XNDU, and YSS.
  - Watch coverage is justified, but buy readiness is not.
thesis_delta: newly_reviewed
entry_delta: too_uncertain
priority_delta: add_watch
dilution_or_balance_sheet_risk: moderate; cash is strong after IPO, but acquisition integration and future growth capital need monitoring.
execution_or_technical_risk: high because defense spacecraft production, EAC estimates, and program execution are core.
customer_or_contract_quality: promising backlog but needs customer diversification and contract-quality proof.
valuation_and_entry_state: too_uncertain; not obviously more expensive than some space peers but short public history and control issues require caution.
peer_comparison: Stronger current operating proof than VOYG and FLY; lower platform breadth than RKLB.
policy_or_safety_blockers: none.
reachable_evidence_remaining: none
```

## Decision

```yaml
final_classification: incubate
dashboard_surface_status: complete
buy_or_no_buy_implication: Watchlist coverage only; no buy or allocation implication.
required_durable_updates:
  watchlist_or_research_universe_record: research/watchlist.csv watch row
  security_metadata: data/market/security_master.csv
  price_history: data/market/price_history.csv
  latest_price: data/market/watchlist_prices.csv
  technical_snapshot: data/market/technical_snapshots.csv
  company_metrics: data/market/company_metrics.csv
  valuation_state: research/valuation-states.csv
  freshness_or_filing_review: research/freshness/events.csv reviewed Q1 event
  company_analysis_entry: research/company-analysis.yml
  per_symbol_dashboard_page: generated by dashboard build from the watchlist surface
next_action: Monitor backlog conversion, major defense constellation awards, customer diversification, material weakness remediation, margins, and price dislocation.
conditions_to_change_view: Promote only if YSS wins and converts major defense constellation work with clean controls and margins; demote if backlog quality, accounting controls, or customer concentration deteriorate.
```
