# GILT Execution Confirmation — 2026-09-11

Personal historical research journal; not investment advice. This records the account owner's completed broker trade. The repository did not place an order.

```yaml
record_type: execution_confirmation
policy_version: v1.3
trade_date: 2026-09-11
recorded_at: 2026-09-12T00:35:40.348+08:00
confirmed_ledger_event_id: 2026-09-11-buy-gilt-001
confirmation_id: screenshot-2026-09-11-gilt-001
order_status: filled
symbol: GILT
side: buy
quantity: 29
average_price: 9.66
gross_amount: 280.14
fees: 0.00
currency: USD
fill_time: 2026-09-11T09:30:00-04:00
settlement_date: 2026-09-14
original_recommendation_max_price: 9.60
price_variance_per_share: 0.06
cost_variance_from_recommendation_ceiling: 1.74
remaining_proposed_quantity: 0
```

The broker screenshot visibly supplied filled status, side, symbol, quantity, average fill price and trade date. The existing Charles Schwab International satellite account, USD currency, zero fee, redacted alias and standard T+1 settlement are the defaults authorized by [the execution template](../templates/execution-confirmation.md). The screenshot's limit and market quotes are not the execution price. The raw screenshot and full broker identifiers remain outside the repository.

The original [September 11 decision](2026-09-11-weekly-operating-cycle.md) capped its recommendation at USD 9.60. The actual USD 9.66 fill was above that ceiling. Recording broker truth does not retroactively raise the recommendation's limit, prove that the original entry gate was met, or authorize another purchase. The 29-share starter has been completed and no unfilled recommendation survives.

## Account Reconciliation

| Field | Confirmed or derived result |
| --- | ---: |
| GILT quantity | 29 shares |
| GILT cost basis | USD 280.14 |
| GILT average cost | USD 9.66 |
| Confirmed cash and buying power | USD 11,167.73 |
| Settled cash before September 14 settlement | USD 11,447.87 |
| Unsettled purchase obligation | USD 280.14 |
| Positions | ASTS 11; GILT 29; IREN 5; MDA 9; RKLB 17 |

The account files reconcile to the append-only ledger. The September 4 and September 11 standing USD 888 deposits were already recorded and were not applied again. Broker reconciliation here covers the visible execution; the screenshot is not a complete broker balance statement.

Historical September 4–10 equity-curve rows are recalculated from their existing completed-close security values and the September 4 standing deposit that was recorded during the later catch-up. This corrects derived cash, deposits and equity without changing a historical ledger event or inventing a market price. A September 11 completed-close equity-curve row is unavailable at confirmation time and is deliberately left absent for the regular market refresh.

For mission monitoring only, marking the now-confirmed positions at the already recorded September 10 closes gives a mixed-time reference NAV of USD 13,634.84 and cash weight of 81.9058%. This is neither a September 11 close nor a broker account balance. The actual purchase cost is 2.0541% of the original USD 13,638.32 pretrade research reference. Its source-backed ground and defense communications thesis and documented evidence-dependent path to scale make the position mission-relevant rather than symbolic; the fill variance remains a separate execution-discipline exception. The latest confirmed return-seeking buy and mission-relevant deployment date become September 11. The 45-day monitoring date becomes October 26; the nearer company-evidence review remains September 18.

## First-Principles Analysis

```yaml
first_principles_analysis:
  question_rebuilt_from_basics: What account facts and workflow states follow from this filled broker trade without converting an old recommendation into execution evidence or fresh investment advice?
  irreducible_facts:
    - The broker reports a filled purchase of 29 GILT shares at USD 9.66 on September 11 at 09:30 ET.
    - The existing confirmed ledger gives USD 11447.87 before this USD 280.14 purchase and contains both due standing deposits.
    - The historical recommendation ceiling was USD 9.60; the broker fill is USD 0.06 per share higher.
    - September 11 completed-close prices are not yet available; prior closes remain historical market evidence.
  binding_constraints: Broker facts control; administrative defaults are narrow; old ledger events remain unchanged; trade settlement is T+1; publication waits until the regular close plus at least 30 minutes.
  causal_chain: Filled quantity times actual fill price determines cost; confirmed cash falls by cost; GILT ownership rises by 29; the unsettled cash obligation remains visible; the proposed starter closes; historical research and actual execution remain distinguishable.
  inherited_assumptions_challenged: A recommendation price is not a fill price, a screenshot quote is not a fill price, and a completed starter does not authorize its repetition or a later scale step.
  value_capture_or_mission_link: Accurate ownership and cash preserve the ability to hold and fund rare outcomes; actual cost exceeds the documented two-percent starter floor and the existing primary-source thesis supplies a credible evidence-dependent scale path, without excusing the entry-price variance.
  disconfirming_evidence: A later broker fee, corrected fill, changed settlement date, account discrepancy or transaction reversal overrides these defaults through an append-only correction; a reliable current close replaces the marked research reference.
  decision_consequence: Append the confirmed execution, rebuild account state, close the one-session proposal, correct derived history, preserve the original price ceiling and release only the reviewed historical record after the embargo.
```

## Sources and Validity

| Source | Publication or observation | Retrieved / first seen | Validity |
| --- | --- | --- | --- |
| Redacted broker reference `screenshot-2026-09-11-gilt-001` | Fill: September 11, 09:30 ET; order screen updated 12:26:13 ET | September 12, Asia/Shanghai | Execution fact until a later broker correction |
| [Nasdaq trading schedule](https://www.nasdaq.com/market-activity/stock-market-holiday-schedule) | Official 2026 calendar; page publication date not stated | September 11, UTC / September 12, Asia/Shanghai | September 11 regular-session close and September 14 business-day check |
| [NYSE holiday calendar](https://www.nyse.com/markets/hours-calendars) | Official 2026 calendar; page publication date not stated | September 11, UTC / September 12, Asia/Shanghai | Cross-check of the relevant U.S. business days |
| [GILT September 11 research review](../research/promotion/2026-09-11-GILT-buy-zone-review.md) | Source dates and retrieval times are retained in that historical review | September 11 | Historical mission/path-to-scale reference only; no renewed entry authorization |

## Publication Release Review

```yaml
review_date: 2026-09-12
operator: codex
policy_version: v1.3
publication_policy_version: PUBLICATION_POLICY.md
content_type: redacted_historical_execution_and_closed_decision
contains_actionable_trading_content: true
public_release_earliest_at: 2026-09-12T04:30:00+08:00
market_close_basis: Nasdaq regular close 2026-09-11T16:00:00-04:00 plus 30 minutes; September 11 is a regular session in the official calendar
order_status: broker_confirmed_filled
sensitive_field_review_status: passed
compensation_or_material_connection: none_disclosed
personalized_reader_guidance_present: false
public_disclaimer_present: true
release_decision: release_allowed_after_embargo
reason: Execution is confirmed and public copy is historical; the time gate must still pass at commit and push.
proposed_orders_present: false
exact_historical_share_counts_present: true
live_scale_ladders_present: false
unexpired_portfolio_allocation_present: false
raw_broker_artifacts_present: false
```

## Workflow Closure

This is an execution and publication update, not a new allocation cycle. New discovery, filing, bull, bear and allocation decision reviews are skipped as `not_material_to_request`; the earlier cycle's actual completed and unavailable reviewer roles remain separately recorded. An independent xhigh release/process reviewer identified inaccurate completed-role claims and brittle validation fixtures. The correction records actual completion and explicit permitted skips, and closes stale current-action text while preserving the original analysis.

The release will include the coherent earlier September 11 research work after validation. One-off local scheduling only delivers the reviewed release; it does not change recurring research cadence or confer trading authority. The existing skill's routing remains applicable, so no new skill or trigger is needed. The Article 1 postflight preserves broker truth, exposure tracking, auditability, human control and public-release safety.

## Validation

The confirmed ledger, positions, cash and settlement arithmetic reconcile. The complete `npm run verify` suite passed and built 96 pages; the final data check and build also passed after ordering the execution update after the pretrade analysis. Desktop at 1440 pixels and mobile at 390 pixels returned HTTP 200 for the dashboard, September 11 run and GILT page, with correct execution text, visible disclaimers, no horizontal overflow and no browser errors. The sensitive-field scan of all 60 release files found no raw broker artifacts, private identifiers, credentials, email addresses or local absolute paths.

The local delivery guard was tested for the embargo boundary, changed payloads, unexpected files, runner and remote identity changes, exact commit recovery and later branch advancement while monitoring Pages. The deferred task must repeat the Article 1 guard and full verification before release. No commit, push or public deployment occurred during this pre-embargo preparation.

## Release Resume and Completed-Close Reconciliation — 2026-09-12

The deferred attempts did not commit or push: the staged whitespace check rejected surplus blank lines in seven new readiness notes, and a later remote market refresh changed the reviewed base. The failed handoff was stopped for manual recovery. The surplus lines are removed, the remote update is integrated, and the exact staged release is checked again under the publication template. This update supersedes the pending-delivery language above while preserving the preparation-time record.

The September 11 completed closes are now available from the committed Yahoo Finance snapshots, retrieved on September 12 at 08:01 UTC: ASTS USD 59.86, GILT USD 9.89, IREN USD 43.83, MDA USD 28.97 and RKLB USD 62.95. Applying the confirmed quantities gives securities worth USD 2,495.30; adding confirmed cash of USD 11,167.73 gives a completed-close equity snapshot of USD 13,663.03 against cumulative deposits of USD 14,544.00. The earlier automated September 11 row used account state that lacked the purchase and catch-up deposits and is replaced with an explicitly documented reconciliation. The September 4–10 corrections and all ledger events are preserved. Equity-curve period changes follow the existing raw equity-change convention and include contributions; they are not cash-flow-adjusted investment returns.

The original USD 13,634.84 mixed-time reference remains the historical execution-monitoring calculation. The new close resolves the market-data gap without revising that reference, the original recommendation ceiling or any trade economics. An independent release reviewer checked the remote integration and date/provenance boundaries; this was not a new investment review.

Full `npm run verify` passed after remote integration and generated 96 pages. The 62-file staged release passed whitespace and sensitive-field review; the earlier preparation record's 60-file count predates the publication-template and skill updates.

```yaml
review_date: 2026-09-12
policy_version: v1.3
publication_policy_version: PUBLICATION_POLICY.md
release_decision: release_allowed
order_status: broker_confirmed_filled
public_release_earliest_at: 2026-09-12T04:30:00+08:00
regular_market_close_passed: true
safety_buffer_passed: true
raw_broker_artifacts_present: false
personalized_reader_guidance_present: false
public_disclaimer_present: true
release_scope: historical execution, closed September 11 research cycle, reconciled completed-close valuation and narrow workflow corrections
```
