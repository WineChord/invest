# OCC Fast-Path Promotion Review — 2026-09-11

```yaml
symbol: OCC
company: Optical Cable Corporation
review_date: 2026-09-11
policy_version: v1.3
current_status: research_only
proposed_status: no_change
current_priority: C+
proposed_priority: C+
promotion_type: research_only_to_watch
trigger_type: filing_update
trigger_source_ids: [occ_q3_fy2026_10q, completed_close_universe_2026_09_10]
retrieval_window: 2026-09-11
validity_window: Until a material customer, liquidity, financing or quarterly update, or 2026-09-25, whichever occurs first.
```

## First-Principles Analysis

```yaml
first_principles_analysis:
  question_rebuilt_from_basics: Does OCC's Q3 operating inflection prove that a scarce optical-connectivity capability can create durable, dilution-adjusted value large enough to earn watch status and later funding?
  irreducible_facts: Q3 sales were USD 24.297 million, gross profit USD 9.095 million, net income USD 1.858 million and forward sales load USD 13.5 million; nine-month operating cash flow was only USD 0.148 million, cash USD 0.297 million and revolver borrowings USD 6.329 million. The September 10 close was USD 14.28 and basic market value approximately USD 126.3 million.
  binding_constraints: Customer and data-center mix, pricing power, working-capital conversion, revolver capacity, cyclicality and the fully diluted denominator must support survival and repeat per-share cash generation.
  causal_chain: Fiber demand must become defensible customer wins; orders must convert at sustained margins; receivables and inventory must convert to cash faster than working capital consumes it; retained cash must reduce financing dependence; and the small denominator must remain intact.
  inherited_assumptions_challenged: A low sales multiple is not an entry thesis, one profitable quarter is not normalized cash conversion, and AI-related demand language does not prove a bottleneck moat.
  value_capture_or_mission_link: OCC's small equity base could make repeat cash compounding material to the portfolio, but the current liquidity structure makes failure or dilution equally material.
  disconfirming_evidence: Another quarter of positive operating cash flow, sustained margin and backlog conversion, quantified data-center wins, ample revolver headroom and stable shares could support promotion; renewed losses, inventory stress or covenant pressure would reject it.
  decision_consequence: Advance OCC to R2 comparable, retain C+ research-only status, open no buy zone and set quantity zero.
```

## Evidence gates

```yaml
mission_gate:
  result: uncertain
  evidence: A very small direct optical-cable manufacturer can matter if connectivity demand becomes scarce and repeatable, but current disclosure does not establish differentiated bottleneck control.
evidence_gate:
  result: fail
  primary_sources: [occ_q3_fy2026_10q]
  material_filings_reviewed: [2026-09-09 Form 10-Q]
  source_conflicts: none
entry_gate:
  result: fail
  price_as_of: 2026-09-10 at USD 14.28
  valuation_state: too_uncertain
  price_attractiveness: superficially_low_sales_multiple_but_unbounded_cash_conversion
  dilution_or_balance_sheet_state: USD 0.297 million cash and USD 6.329 million revolver create financing sensitivity
  expected_return_setup: Right-tail upside exists, but a defensible base case cannot yet be separated from cyclical working-capital recovery.
survival_gate:
  result: uncertain
  runway: current liquidity is thin despite positive earnings
  debt_and_refinancing: secured revolver dependence remains material
  customer_or_contract_quality: forward load improved but customer mix and enforceability are not sufficiently disclosed
mission_impact_gate:
  result: uncertain
  initial_weight_range_pct: [2, 3]
  fully_underwritten_weight_range_pct: [5, 8]
  adverse_permanent_impairment_pct: 100
  max_nav_impairment_pct: 3
  downside_portfolio_result: A 2 percent starter could be impaired by working-capital stress or refinancing before the operating inflection becomes durable.
  base_portfolio_result: One profitable quarter without cash conversion would not materially compound the portfolio.
  upside_portfolio_result: Repeat margin and cash conversion at a small denominator could support meaningful appreciation.
  exceptional_portfolio_result: Durable pricing power in specialized fiber connectivity could become a scarce infrastructure supplier, but evidence is not yet sufficient.
  contribution_dilution_check: Twenty shares at USD 14.28 would cost USD 285.60 or 2.094 percent of research NAV; size caps loss but does not repair uncertain survival and value capture.
uncertainty_classification:
  decision_critical: customer mix and moat, repeat cash conversion, working-capital needs, revolver headroom and fully diluted per-share value
  sizing: ordinary demand and price volatility after the decision-critical evidence is resolved
  process_debt: supplemental R1/R2 price-provider gaps unrelated to OCC
```

## Required reviews and reconciliation

The evidence/freshness and main-agent reviews verified the filing arithmetic. The bull case is the unusually small denominator, improving sales, margin and backlog; the bear case is that profits have not yet converted into cash and liquidity is thin. Valuation and allocation reviews treat 20 shares as the smallest mission-consistent reference, not an order. OCC ranks behind LEU, GILT, STDN and the held IREN add because each has a stronger direct bottleneck or evidence base. Any unavailable independent reviewer is recorded as `tool_unavailable` in the full run artifact and does not change the primary-evidence result.

## Status decision

```yaml
final_status: research_only
final_priority: C+
buy_zone_status: no_buy_until_new_evidence
buy_zone_reason: One profitable quarter and a small denominator do not outweigh weak cash conversion, thin cash, revolver dependence, unquantified customer mix and uncertain moat.
ranking_vs_current_core: below LEU_GILT_STDN_and_held_IREN_add
candidate_to_displace_or_reduce: none
cash_or_reserve_comparison: Cash preserves optionality and avoids financing and working-capital impairment; SGOV is unnecessary for the current decision and remains quantity zero.
zero_vs_smallest_staged_exposure: Zero beats a 20-share reference because size cannot repair a potentially adverse liquidity and cash-conversion path.
current_stage: R2_comparable
scale_milestones: [two quarters of positive operating cash flow, sustained gross margin, quantified data-center wins, lower revolver dependence, stable diluted shares]
hold_milestones: [backlog conversion, positive earnings, adequate covenant headroom]
reduce_or_exit_milestones: [negative cash conversion, covenant stress, major customer loss, material dilution]
stage_review_by: 2026-09-25
kill_criteria: Liquidity failure, persistent working-capital absorption or evidence that demand lacks defensible pricing power.
next_review_trigger: Next quarterly filing, material customer award, revolver amendment or major price dislocation.
conditions_to_promote_further: Repeat cash conversion, customer and data-center mix disclosure, defensible moat, ample liquidity and an attractive dilution-adjusted scenario.
conditions_to_demote: Backlog contraction, renewed losses, revolver stress or dilutive financing.
```

Source: [OCC Form 10-Q](https://www.sec.gov/Archives/edgar/data/1000230/000143774926029950/occ20260731_10q.htm), published 2026-09-09 and retrieved 2026-09-11; Yahoo Finance adjusted close dated 2026-09-10 and retrieved 2026-09-11.
