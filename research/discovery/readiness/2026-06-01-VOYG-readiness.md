# VOYG Discovery Readiness Sprint

```yaml
symbol: VOYG
candidate_name: Voyager Technologies Inc.
review_date: 2026-06-01
policy_version: v1.1
candidate_record: research/discovery/candidates.csv
material_to_current_allocation: true
affected_lanes:
  - space_infrastructure
materiality_reason: VOYG is a newly public direct space and defense-space issuer with Starlab optionality, so same-lane opportunity-cost completeness requires research-only coverage.
blocking_scope: current_space_allocation
readiness_status: incubated_after_review
blocker_type: evidence_based
classification: incubate
dashboard_surface_status: complete
source_ids:
  - voyg_q1_2026_results
  - voyg_q1_2026_10q
  - voyg_ipo_prospectus_2025_06_10
  - yahoo_chart_voyg_2026_05_29
  - sec_companyfacts_voyg_2026_06_01
readiness_index_record: research/discovery/candidate-readiness.yml
```

## Bottleneck Fit

```yaml
what_could_become_scarce: Post-ISS commercial low-earth-orbit infrastructure, defense-space manufacturing, propulsion, optical systems, and mission hardware could become constrained if government and commercial demand accelerate.
who_controls_or_removes_scarcity: Companies with funded programs, proprietary space hardware, system integration, backlog conversion, and enough capital to fund Starlab-like programs can remove the scarcity.
who_can_monetize_into_shareholder_value: VOYG can monetize only if defense-space revenue scales with improving margins and Starlab is de-risked without overwhelming common shareholders.
public_security_expression: VOYG is an NYSE common-stock security and directly expresses Voyager Technologies.
early_small_misunderstood_or_newly_public: Newly public and under-followed enough for research coverage, but not tiny relative to current proof.
direct_exposure_or_proxy_quality: Direct but mixed-quality exposure because current revenue is defense and space technologies while Starlab is a future option.
disconfirming_evidence: Q1 2026 negative gross profit, continued losses, convertible notes, controlled-company governance, and Starlab no near-term revenue.
```

## Evidence Gathered

```yaml
security_metadata:
  exchange: NYSE
  asset_type: common_stock
  sec_cik: "0001788060"
  tradability: tradable
  market_data_symbol: VOYG
  source_ids:
    - voyg_q1_2026_10q
market_data:
  price_as_of: 2026-05-29
  price: 49.53
  market_cap: approximately USD 2.89 billion using SEC companyfacts weighted shares
  liquidity: tradable public common stock with active daily volume
  source_ids:
    - yahoo_chart_voyg_2026_05_29
filings_and_reports:
  latest_10k_or_20f: 2026-03-10 Form 10-K for fiscal 2025
  latest_10q_or_6k: 2026-05-05 Form 10-Q for Q1 2026
  registration_or_offering_filings: 2025 IPO prospectus and 2026 S-8
  earnings_material: 2026-05-05 Q1 2026 results release
  material_filings_requiring_review: Q1 2026 10-Q reviewed here
issuer_and_industry_context:
  issuer_ir_sources: Q1 2026 results release
  regulator_or_contract_sources: SEC filings
  industry_sources: same-lane comparison against RKLB, FLY, YSS, LUNR, RDW, KTOS, and rejected MNTS
same_lane_peers:
  peers:
    - RKLB
    - YSS
    - FLY
    - LUNR
    - RDW
    - KTOS
  comparison_summary: VOYG is direct enough for research-only coverage, but YSS has cleaner current revenue/backlog and RKLB remains a stronger execution-led space platform candidate.
```

## Analysis

```yaml
facts_verified:
  - Q1 2026 revenue was about USD 35.2 million.
  - Remaining performance obligations were about USD 153.2 million.
  - Cash and cash equivalents were about USD 429.4 million.
  - Q1 2026 gross profit was negative.
  - The Q1 filing disclosed USD 435.0 million of 2030 convertible senior secured notes.
  - Starlab generated no Q1 2026 revenue and remains a future option.
inferences:
  - VOYG is a legitimate space infrastructure candidate, not a semantic false positive.
  - Research-only coverage improves the space peer map, but the current evidence does not beat RKLB, ASTS-adjacent peers, or YSS for allocation priority.
thesis_delta: newly_reviewed
entry_delta: too_uncertain
priority_delta: incubate_research_only
dilution_or_balance_sheet_risk: material because Starlab and growth investments may need capital while convertible notes already exist.
execution_or_technical_risk: high because Starlab timing, defense-space backlog conversion, acquisition integration, and margins remain unproven.
customer_or_contract_quality: real but needs backlog conversion and customer concentration review.
valuation_and_entry_state: too_uncertain at roughly USD 2.9 billion market cap and about high-teens sales multiple on current SEC-derived sales.
peer_comparison: Below YSS for current defense-space operating proof and below RKLB for platform execution quality.
policy_or_safety_blockers: none.
reachable_evidence_remaining: none
```

## Decision

```yaml
final_classification: incubate
dashboard_surface_status: complete
buy_or_no_buy_implication: Research-only coverage; no buy or allocation implication.
required_durable_updates:
  watchlist_or_research_universe_record: research/watchlist.csv research_only row
  security_metadata: data/market/security_master.csv
  price_history: data/market/price_history.csv
  latest_price: data/market/watchlist_prices.csv
  technical_snapshot: data/market/technical_snapshots.csv
  company_metrics: data/market/company_metrics.csv
  valuation_state: research/valuation-states.csv
  freshness_or_filing_review: research/freshness/events.csv reviewed Q1 event
  company_analysis_entry: research/company-analysis.yml
  per_symbol_dashboard_page: generated by dashboard build from the research surface
next_action: Monitor the next quarterly report, backlog conversion, Starlab funding and milestones, customer concentration, debt terms, and price dislocation.
conditions_to_change_view: Promote only if backlog converts with improving margins and Starlab de-risks without uncontrolled dilution; demote if losses, debt, or Starlab funding needs worsen.
```
