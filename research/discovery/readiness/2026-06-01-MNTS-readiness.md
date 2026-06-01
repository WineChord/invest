# MNTS Discovery Readiness Sprint

```yaml
symbol: MNTS
candidate_name: Momentus Inc.
review_date: 2026-06-01
policy_version: v1.1
candidate_record: research/discovery/candidates.csv
material_to_current_allocation: true
affected_lanes:
  - space_infrastructure
materiality_reason: MNTS surfaced in the same space_infrastructure lane as current space candidates, so the discovery engine needed evidence-backed triage rather than a silent skip.
blocking_scope: current_space_allocation
readiness_status: rejected_after_review
blocker_type: evidence_based
classification: reject
dashboard_surface_status: not_required_rejected
source_ids:
  - mnts_q1_2026_10q
  - mnts_private_placement_8k_2026_05_29
  - yahoo_chart_mnts_2026_05_29
readiness_index_record: research/discovery/candidate-readiness.yml
```

## Bottleneck Fit

```yaml
what_could_become_scarce: Low-cost spacecraft buses, hosted payload capacity, and orbital logistics could become scarce if launch cadence and national-security space demand scale faster than reliable small-space infrastructure suppliers.
who_controls_or_removes_scarcity: Companies that own reliable buses, mission operations, customer relationships, and capital access can remove scarcity; companies that depend on repeated dilutive financing may not survive long enough to control it.
who_can_monetize_into_shareholder_value: A provider can monetize only if contracts convert into durable revenue, gross profit, and reinvestable cash flow before dilution overwhelms common shareholders.
public_security_expression: MNTS is a Nasdaq common-stock security and directly expresses Momentus's space-services exposure.
early_small_misunderstood_or_newly_public: MNTS is small and volatile, but the evidence reads more like a fragile financing turnaround than an underfollowed bottleneck owner.
direct_exposure_or_proxy_quality: Direct but weak-quality exposure.
disconfirming_evidence: Q1 2026 revenue was only about USD 3.2 million, net loss remained material, recent liquidity depended on ATM and private-placement financing, and dilution risk dominated the thesis.
```

## Evidence Gathered

```yaml
security_metadata:
  exchange: Nasdaq
  asset_type: common_stock
  sec_cik: "0001781162"
  tradability: tradable
  market_data_symbol: MNTS
  source_ids:
    - mnts_q1_2026_10q
market_data:
  price_as_of: 2026-05-29
  price: 16.85
  market_cap: approximately USD 168 million using SEC companyfacts shares before later placement effects
  liquidity: high volatility microcap trading
  source_ids:
    - yahoo_chart_mnts_2026_05_29
filings_and_reports:
  latest_10k_or_20f: 2026-03-31 Form 10-K for fiscal 2025
  latest_10q_or_6k: 2026-05-13 Form 10-Q for Q1 2026
  registration_or_offering_filings: May 2026 S-3, ATM activity, and May 2026 private-placement 8-K
  earnings_material: Q1 2026 filing and May 2026 shareholder-letter exhibit
  material_filings_requiring_review: Q1 2026 10-Q and May 2026 private-placement 8-K reviewed here
issuer_and_industry_context:
  issuer_ir_sources: shareholder-letter exhibit filed on Form 8-K
  regulator_or_contract_sources: SEC filings
  industry_sources: same-lane comparison against RKLB, FLY, YSS, VOYG, LUNR, RDW, and KTOS
same_lane_peers:
  peers:
    - RKLB
    - FLY
    - YSS
    - VOYG
    - LUNR
    - RDW
    - KTOS
  comparison_summary: MNTS is far smaller but lower quality than the peer set because financing survival and dilution dominate the current evidence.
```

## Analysis

```yaml
facts_verified:
  - Q1 2026 service revenue was about USD 3.2 million.
  - Q1 2026 net loss was about USD 9.5 million.
  - March 31 2026 cash and cash equivalents were about USD 23.5 million.
  - The company raised financing cash in Q1 2026 and disclosed additional May 2026 financing activity.
  - Management stated prior going-concern doubt no longer existed after financings, which makes capital access central to the current view.
inferences:
  - The discovery hit was real, not a ticker-name collision.
  - The common equity looks like a survival and dilution option rather than a durable bottleneck-control candidate.
thesis_delta: rejected_after_review
entry_delta: no_entry_work_required
priority_delta: reject
dilution_or_balance_sheet_risk: severe because recent financing is central to survival and future runway.
execution_or_technical_risk: high because revenue conversion, mission execution, and contract quality remain unproven at scale.
customer_or_contract_quality: too thin to support dashboard coverage today.
valuation_and_entry_state: too_uncertain; apparent small market cap does not compensate for dilution and survival risk.
peer_comparison: Lower-quality than RKLB, FLY, YSS, VOYG, LUNR, RDW, and KTOS for the space infrastructure lane.
policy_or_safety_blockers: none; the security is tradable, but evidence blocks durable coverage.
reachable_evidence_remaining: none
```

## Decision

```yaml
final_classification: reject
dashboard_surface_status: not_required_rejected
buy_or_no_buy_implication: No buy implication; not a dashboard research candidate today.
required_durable_updates:
  watchlist_or_research_universe_record: not_required_rejected
  security_metadata: not_required_rejected
  price_history: not_required_rejected
  latest_price: not_required_rejected
  technical_snapshot: not_required_rejected
  company_metrics: not_required_rejected
  valuation_state: not_required_rejected
  freshness_or_filing_review: this sprint note reviews the material Q1 and financing evidence.
  company_analysis_entry: not_required_rejected
  per_symbol_dashboard_page: not_required_rejected
next_action: Reopen only if multiple quarters show real revenue/backlog conversion, reduced dilution cadence, successful mission execution, and stronger evidence of bottleneck control.
conditions_to_change_view: Upgrade to incubate only if MNTS proves durable contract conversion and reduces equity financing dependence; otherwise keep it rejected as a space microcap false-positive pattern.
```
