# XNDU Discovery Readiness Sprint

```yaml
symbol: XNDU
candidate_name: Xanadu Quantum Technologies Ltd
review_date: 2026-06-01
policy_version: v1.1
candidate_record: research/discovery/candidates.csv
material_to_current_allocation: true
affected_lanes:
  - quantum_computing_and_networking
materiality_reason: XNDU is a newly public pure-play photonic quantum computing issuer, so the quantum lane needs a comparable research-only surface rather than relying only on IONQ.
blocking_scope: quantum_lane_completeness
readiness_status: incubated_after_review
blocker_type: evidence_based
classification: incubate
dashboard_surface_status: complete
source_ids:
  - xndu_q1_2026_6k
  - xndu_f1_yorkville_2026_05_22
  - xndu_s8_2026_05_26
  - yahoo_chart_xndu_2026_05_29
  - sec_companyfacts_xndu_2026_06_01
readiness_index_record: research/discovery/candidate-readiness.yml
```

## Bottleneck Fit

```yaml
what_could_become_scarce: Utility-scale fault-tolerant quantum computing could make scalable logical qubits, low-overhead error correction, photonic chips, modular interconnects, and developer tooling scarce.
who_controls_or_removes_scarcity: A company that can build data-center-suitable photonic quantum systems, convert technical milestones into commercial systems, and sustain developer adoption can remove that scarcity.
who_can_monetize_into_shareholder_value: XNDU can monetize only if technical validation turns into recurring quantum computing, software, or dedicated-system revenue before dilution overwhelms shareholders.
public_security_expression: XNDU is a Nasdaq Class B subordinate voting share and directly expresses Xanadu's public equity, with weaker voting control than Class A holders.
early_small_misunderstood_or_newly_public: Newly public and technically differentiated, but corrected share count makes the valuation much larger than the simple weighted-average share count implies.
direct_exposure_or_proxy_quality: Direct pure-play quantum exposure.
disconfirming_evidence: Q1 revenue was tiny and professional-services-heavy, one customer dominated revenue, the company remains pre-commercial, and Yorkville/S-8 dilution risk is explicit.
```

## Evidence Gathered

```yaml
security_metadata:
  exchange: Nasdaq
  asset_type: common_stock
  sec_cik: "0002097163"
  tradability: tradable
  market_data_symbol: XNDU
  source_ids:
    - xndu_q1_2026_6k
market_data:
  price_as_of: 2026-05-29
  price: 16.17
  market_cap: approximately USD 4.83 billion using 298.5 million Class A and Class B shares outstanding from the 2026-05-22 F-1
  liquidity: newly public volatile quantum security
  source_ids:
    - yahoo_chart_xndu_2026_05_29
filings_and_reports:
  latest_10k_or_20f: 2026-04-09 Form 20-F
  latest_10q_or_6k: 2026-05-14 6-K Q1 2026 financial report
  registration_or_offering_filings: 2026-05-22 F-1 and 2026-05-26 S-8
  earnings_material: 2026-05-14 Q1 2026 release filed on 6-K
  material_filings_requiring_review: Q1 2026 6-K, F-1/Yorkville facility, and S-8 reviewed here
issuer_and_industry_context:
  issuer_ir_sources: Q1 2026 release filed on 6-K
  regulator_or_contract_sources: SEC filings
  industry_sources: quantum lane comparison against IONQ
same_lane_peers:
  peers:
    - IONQ
  comparison_summary: XNDU improves quantum-lane completeness as a photonic architecture alternative to IONQ, but current commercial proof is too early for promotion.
```

## Analysis

```yaml
facts_verified:
  - Q1 2026 revenue was about USD 2.8 million.
  - Q1 2026 net loss was about USD 20.6 million.
  - March 31 2026 cash and cash equivalents were about USD 272.5 million.
  - The F-1 disclosed 298.5 million shares outstanding as of 2026-05-14 and 346.0 million fully diluted shares.
  - The F-1 disclosed a USD 300 million Yorkville standby equity purchase agreement.
  - A May 2026 S-8 registered equity-plan shares.
inferences:
  - The photonic quantum bottleneck thesis is real and deserves tracking.
  - The economic valuation is much higher than the generic SEC companyfacts weighted-share output, so corrected valuation must override the simple automated metric.
thesis_delta: newly_reviewed
entry_delta: too_expensive
priority_delta: incubate_research_only
dilution_or_balance_sheet_risk: high because Yorkville and equity-plan capacity create an explicit dilution path while commercialization remains early.
execution_or_technical_risk: very high because useful commercial quantum computing is not yet proven.
customer_or_contract_quality: early and concentrated; Q1 revenue does not yet prove durable product demand.
valuation_and_entry_state: too_expensive relative to tiny revenue and pre-commercial evidence on corrected Class A/Class B share count.
peer_comparison: Useful quantum architecture peer to IONQ but not stronger than IONQ for current watch priority.
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
  company_metrics: data/market/company_metrics.csv with manual share-count override
  valuation_state: research/valuation-states.csv
  freshness_or_filing_review: research/freshness/events.csv reviewed Q1 and F-1 events
  company_analysis_entry: research/company-analysis.yml
  per_symbol_dashboard_page: generated by dashboard build from the research surface
next_action: Monitor customer revenue quality, system milestones, government funding, Yorkville draws, S-8 and other equity issuance, and valuation dislocation.
conditions_to_change_view: Promote only if technical milestones convert into recurring commercial revenue or non-dilutive validation; demote if Yorkville becomes primary runway funding or the roadmap slips.
```
