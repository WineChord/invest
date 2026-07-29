# VIP Discovery Readiness — 2026-07-29

```yaml
symbol: VIP
candidate_name: Vulcan Infrastructure and Power
review_date: 2026-07-29
policy_version: v1.2
candidate_record: research/discovery/candidates.csv
material_to_current_allocation: true
affected_lanes: [ai_power_and_cooling, ai_compute_infrastructure]
materiality_reason: A renamed micro-cap power producer is attempting to convert already energized generation and owned land into AI and HPC infrastructure, a direct but highly fragile expression that static industry labels could miss.
blocking_scope: ai_power_lane_false_negative_hygiene
research_stage: R1_researchable
company_stage: distressed_pivot
readiness_status: researchable_open
blocker_type: evidence_based
classification: incubate
dashboard_surface_status: not_required_pre_promotion
next_evidence_source: Financing closing 8-K, the next Form 10-Q, or a binding AI/HPC customer agreement, whichever arrives first.
next_evidence_due: 2026-08-15
cost_of_waiting: A binding, creditworthy customer or completed recapitalization could rerate the small equity before R2 work is complete; the bounded two-week review window limits that false-negative cost.
false_negative_early_warning: Confirmed financing close, old-debt redemption, a binding customer contract, or independently verified powered-site capacity before the due date.
reopen_or_reject_trigger: Advance to R2 only after financing close, pro-forma fully diluted capitalization, site-level power and capex evidence, a binding customer contract, and at least 18 months of credible liquidity; reject if financing fails or going-concern risk persists without a funded customer.
source_ids: [vip_q1_2026_10q, vip_ai_hpc_pivot_2026_07_20, vip_completed_bars_2026_07_28]
readiness_index_record: research/discovery/candidate-readiness.yml
```

## Bottleneck Fit

```yaml
what_could_become_scarce: Energized, permitted land with dependable grid or behind-the-meter power that can host high-density AI and HPC infrastructure quickly.
who_controls_or_removes_scarcity: VIP owns an approximately 106 MW New York natural-gas generation facility and claims 104 MW of energized capacity plus a 654 MW owned-site development pipeline.
who_can_monetize_into_shareholder_value: Common holders benefit only if credible customers pay enough for power, hosting, land development or joint ventures to cover new capital and avoid repeated dilution.
public_security_expression: Nasdaq common stock VIP is policy-eligible; the legacy GREEL senior note is not the common-equity expression.
early_small_misunderstood_or_newly_public: The issuer is a tiny distressed pivot from bitcoin mining and generation whose July 24 name and ticker change can evade static screens.
direct_exposure_or_proxy_quality: Potentially direct powered-land exposure, but there is no disclosed binding AI/HPC customer or proven data-center revenue.
disconfirming_evidence: Going-concern doubt, negative operating cash flow, unclosed expensive financing, extreme potential dilution, no customer contract, and unverified pipeline economics.
```

## Evidence Gathered

The issuer is the same SEC registrant formerly known as Greenidge Generation Holdings Inc. and must be deduplicated by CIK `0001844971`; VIP is the current common-stock ticker. The March 31 Form 10-Q reports USD 7.1 million of cash, USD 39.2 million of current debt, negative USD 11.4 million of first-quarter operating cash flow, negative shareholders' equity, and substantial doubt about continuing as a going concern.

The July 20 Form 8-K describes proposed USD 39.4 million financing, old-debt redemption, a 10% payment-in-kind secured convertible note, common issuance, conversion shares, warrants, governance rights, and a 2.5 million-share equity-plan expansion. The financing was proposed rather than confirmed closed in the reviewed filing. Before older warrants and awards, the disclosed common, conversion, and warrant capacity could bring potential shares to roughly 2.4 times the pre-financing A and B common count.

The issuer release claims 104 MW of energized capacity, more than 100 MW of near-term commercialization potential, and a 654 MW owned-site pipeline. These are issuer claims without disclosed AI/HPC customers, contract economics, site-level interconnection proof, development budgets, timing, or project returns.

Alpaca IEX current-symbol daily bars show a USD 2.10 completed July 28 close, down 6.25% in one session and approximately 28.08% over five trading sessions. Only seven current-symbol rows were retrieved; 1M, 3M and 6M comparisons remain unavailable. The price decline does not resolve capitalization or survival.

```yaml
security_metadata:
  exchange: Nasdaq
  asset_type: common_stock
  sec_cik: "0001844971"
  tradability: tradable
  market_data_symbol: VIP
  source_ids: [vip_q1_2026_10q, vip_ai_hpc_pivot_2026_07_20]
market_data:
  price_as_of: 2026-07-28
  price: 2.10
  market_cap: N/A — the financing has not closed and a reliable pro-forma fully diluted denominator is unavailable
  liquidity: very thin IEX activity; this increases execution and valuation uncertainty
  source_ids: [vip_completed_bars_2026_07_28]
filings_and_reports:
  latest_10q: vip_q1_2026_10q
  material_filings_requiring_review: vip_ai_hpc_pivot_2026_07_20
same_lane_peers:
  peers: [IREN, SEI, WULF, CIFR, RIOT]
  comparison_summary: VIP is smaller and more awkward but materially weaker on survival, customer proof, capitalization and delivered recurring economics than every current lane comparator.
```

## Analysis

```yaml
facts_verified: Current identity, exchange, power-plant ownership, issuer-stated capacity, Q1 liquidity, debt, cash burn, going-concern disclosure, proposed financing terms, potential share issuances, and completed current-symbol prices.
inferences: Existing energized power could become valuable to AI/HPC customers, but the common equity may capture little or none of that value after secured financing, conversion, warrants, project incentives and future construction capital.
thesis_delta: new_direct_but_distressed_power_bottleneck_hypothesis
entry_delta: price_dislocated_but_not_underwritable
priority_delta: retain_at_R1_only
dilution_or_balance_sheet_risk: Extreme and decision-critical; the recapitalization is unclosed and potential shares already approach 2.4 times the pre-financing count before older claims.
execution_or_technical_risk: Site power, interconnection, permitting, cooling, construction, delivery and customer acceptance are unproved at data-center scale.
customer_or_contract_quality: No binding AI/HPC customer, price, term, minimum commitment, credit support or project return is disclosed.
valuation_and_entry_state: N/A pending a completed financing and reconciled fully diluted capitalization; no executable limit exists.
peer_comparison: Does not challenge IREN, SEI, WULF, CIFR or RIOT and does not change the first-five opportunity-cost order.
policy_or_safety_blockers: R1 status is not buy-zone eligible.
reachable_evidence_remaining: Financing close, capitalization, site proof, customer contract and survival runway are public-filing questions due under the bounded SLA.
stage_adjusted_minimum_evidence: Identity, eligibility, one primary operating filing, directness, survival red flags and a rough diluted-capitalization warning are complete for R1.
irreducible_uncertainty: Future customer demand and project execution remain uncertain even after the reachable evidence is gathered.
next_evidence_source: Financing closing 8-K, next Form 10-Q, or binding AI/HPC customer filing.
next_evidence_due: 2026-08-15
cost_of_waiting: A real recapitalization and customer could rerate a micro-cap quickly, but buying before those facts risks funding a distressed dilution structure with no proved customer.
false_negative_early_warning: Confirmed financing, old-debt redemption, binding customer, or independently verified site capacity.
```

## Decision

```yaml
final_classification: incubate_at_R1
dashboard_surface_status: not_required_pre_promotion
buy_or_no_buy_implication: Researchable lead only; quantity zero and no executable limit.
required_durable_updates:
  watchlist_or_research_universe_record: research/discovery/candidates.csv
  security_metadata: deferred until R3; identity is retained in this R1 note
  price_history: bounded current-symbol bars are source-backed in this R1 note and remain outside canonical watchlist market data until R3
  latest_price: bounded current-symbol close is source-backed in this R1 note and remains outside canonical watchlist market data until R3
  technical_snapshot: not required before R3
  company_metrics: not required before R3
  valuation_state: not underwritable until recapitalization closes
  freshness_or_filing_review: this readiness note and durable source records
  company_analysis_entry: not required before R3
  per_symbol_dashboard_page: not required before R3
next_action: Complete a bounded R2 decision by 2026-08-15 or earlier on a financing, customer, or quarterly filing.
conditions_to_change_view: Advance only after confirmed financing, a reconciled diluted denominator, verified site power and capex, a binding customer, and credible survival runway; otherwise reject.
```
