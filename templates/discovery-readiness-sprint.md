# Discovery Readiness Sprint Template

Use this template when a raw discovery candidate could affect allocation, opportunity cost, lane completeness, or watchlist priority. Save completed notes under `research/discovery/readiness/YYYY-MM-DD-SYMBOL-readiness.md`.

```yaml
symbol:
candidate_name:
review_date:
policy_version:
candidate_record:
material_to_current_allocation:
affected_lanes:
materiality_reason:
blocking_scope:
research_stage: R0_lead | R1_researchable | R2_comparable | R3_promotion_ready
company_stage:
readiness_status: lead_open | researchable_open | comparable_open | promotion_ready | completed | incubated_after_review | rejected_after_review | archived_after_review | not_material_current_allocation | external_blocked | not_tradable
blocker_type: none | evidence_based | not_material_current_allocation | external_unavailable | user_only_broker_fact | market_closed_or_missing_quote | legal_access_limit | policy_blocker | repo_work_remaining
classification: promote | incubate | reject | archive | not_material | not_tradable | external_blocked
dashboard_surface_status: complete | not_required_pre_promotion | not_required_rejected | not_required_archived | not_required_not_material | not_required_external | not_required_not_tradable
next_evidence_source:
next_evidence_due:
cost_of_waiting:
false_negative_early_warning:
reopen_or_reject_trigger:
source_ids:
readiness_index_record:
```

`not_started`, unbounded `in_progress`, and `continue_sprint` are scratch-only transient states or labels. A committed R0-R2 candidate may remain open only when the next source, due date, waiting cost, false-negative warning, and reopen-or-reject trigger are complete.

`dashboard_surface_status` is mandatory in both the sprint note and `research/discovery/candidate-readiness.yml`. Use `not_required_pre_promotion` for bounded R0-R2 records, and `complete` for R3, promoted, or completed material public-stock candidates. Do not use a not-required dashboard status as a shortcut for missing R3 work.

## Bottleneck Fit

Answer before discussing valuation.

```yaml
what_could_become_scarce:
who_controls_or_removes_scarcity:
who_can_monetize_into_shareholder_value:
public_security_expression:
early_small_misunderstood_or_newly_public:
direct_exposure_or_proxy_quality:
disconfirming_evidence:
```

## Evidence Gathered

```yaml
security_metadata:
  exchange:
  asset_type:
  sec_cik:
  tradability:
  market_data_symbol:
  source_ids:
market_data:
  price_as_of:
  price:
  market_cap:
  liquidity:
  source_ids:
filings_and_reports:
  latest_10k_or_20f:
  latest_10q_or_6k:
  registration_or_offering_filings:
  earnings_material:
  material_filings_requiring_review:
issuer_and_industry_context:
  issuer_ir_sources:
  regulator_or_contract_sources:
  industry_sources:
same_lane_peers:
  peers:
  comparison_summary:
```

## Analysis

Separate what is known from what is inferred.

```yaml
facts_verified:
inferences:
thesis_delta:
entry_delta:
priority_delta:
dilution_or_balance_sheet_risk:
execution_or_technical_risk:
customer_or_contract_quality:
valuation_and_entry_state:
peer_comparison:
policy_or_safety_blockers:
reachable_evidence_remaining:
stage_adjusted_minimum_evidence:
irreducible_uncertainty:
next_evidence_source:
next_evidence_due:
cost_of_waiting:
false_negative_early_warning:
```

## Decision

```yaml
final_classification:
dashboard_surface_status:
buy_or_no_buy_implication:
required_durable_updates:
  watchlist_or_research_universe_record:
  security_metadata:
  price_history:
  latest_price:
  technical_snapshot:
  company_metrics:
  valuation_state:
  freshness_or_filing_review:
  company_analysis_entry:
  per_symbol_dashboard_page:
next_action:
conditions_to_change_view:
```

Do not leave `repo_work_remaining` as an unbounded blocker. Decision-critical evidence for the current allocation must be gathered or bounded. Other R0-R2 work may remain under a dated service level and must not be misrepresented as promotion ready.

Do not hide a material R1 or R2 candidate. It must remain visible in the discovery bench with its due date, waiting cost, and false-negative trigger. Full research-only dashboard coverage is required at R3, not as an admission price for retaining an early lead.

Minimum promotion-ready surface for an R3, completed, or promoted material public stock:

- raw discovery candidate record;
- candidate-readiness record with terminal readiness and `dashboard_surface_status: complete`;
- sprint note under `research/discovery/readiness/`;
- durable source IDs in `research/sources.yml`;
- reviewed freshness or filing event and filing review when buy eligibility depends on the filing;
- `research/watchlist.csv` research-only or stronger row;
- security metadata, latest price, price history, technical snapshot, company metrics when available, and valuation state;
- `research/company-analysis.yml` entry;
- generated per-symbol dashboard page verified by `npm run verify` when practical.
