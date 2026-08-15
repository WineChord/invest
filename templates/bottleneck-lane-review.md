# Bottleneck Lane Review Template

Use this before universe discovery in every full operating cycle and monthly decision. The purpose is to prevent stock-list-first thinking.

```yaml
review_date:
operator:
policy_version:
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment:
framework_name: bottleneck_map_first
related_cycle:
lane_map_as_of:
```

## First-Principles Analysis

Complete this before naming or ranking companies. Reduce the lane to current primary facts and the physical, technical, economic, regulatory, and capital constraints that could create scarcity. Existing lanes, tickers, sector labels, and historical analogies may test the reconstruction; they may not define it.

```yaml
first_principles_analysis:
  question_rebuilt_from_basics:
  irreducible_facts:
  binding_constraints:
  causal_chain:
  inherited_assumptions_challenged:
  value_capture_or_mission_link:
  disconfirming_evidence:
  decision_consequence:
```

## Frame

Do not start with "which stocks look interesting?" Start with the bottleneck map.

```yaml
root_question: Which future bottlenecks can become unavoidable, valuable, and publicly investable?
stock_list_status: output_of_lane_review
watchlist_status: temporary_working_set
```

## Bottleneck Questions

Answer these before naming or ranking companies:

```yaml
scarce_resources_or_capabilities:
pricing_power_sources:
direct_public_beneficiaries:
weak_or_indirect_proxies:
too_small_early_or_awkward_candidates:
traditional_screen_blind_spots:
primary_evidence_needed:
ruin_or_false_positive_risks:
```

## Lane Review

For each active, emerging, or incubating lane in `research/discovery/lanes.yml`, record the current state.

```yaml
lanes_reviewed:
  - lane_id:
    thesis_delta:
    evidence_delta:
    investability_delta:
    public_proxy_quality:
    direct_beneficiaries:
    weak_proxies_or_false_positives:
    candidates_to_add_or_skim:
    candidates_to_reject_or_archive:
    lane_action: no_change
    action_reason:
```

Allowed `lane_action` values:

- `no_change`
- `add_lane`
- `promote_lane`
- `split_lane`
- `merge_lane`
- `demote_lane`
- `retire_lane`
- `refresh_keywords`
- `refresh_source_families`

## Unknown Future Bottlenecks

This section is mandatory. The `unknown_future_bottlenecks` lane exists to force search outside the current map.

```yaml
outside_map_search_budget_pct:
new_lane_candidates:
  - lane_hypothesis:
    why_it_might_be_a_bottleneck:
    why_existing_lanes_do_not_cover_it:
    public_market_exposure:
    opportunity_denial_cost:
    minimum_evidence_to_start_now:
    source_families_to_monitor:
    initial_status:
    why_not_add_now:
```

## Output

```yaml
lane_map_change_required:
candidate_file_change_required:
watchlist_change_required:
freshness_event_required:
process_or_template_change_required:
no_change_reason:
next_review_trigger:
```

Lane review creates leads, not buy eligibility. A stock can move from a lane into `research/discovery/candidates.csv` only as a raw candidate. Promotion to `research/watchlist.csv` requires primary-source evidence, a concise thesis, and explicit mission/evidence/entry gate review.
