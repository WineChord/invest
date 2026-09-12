# 2026-09-11 Weekly Operating-Cycle Decision

## Execution Outcome

Historical decision; the account owner confirmed a completed GILT purchase of 29 shares at USD 9.66 on September 11 at 09:30 ET. Gross cost was USD 280.14, leaving USD 11167.73 confirmed cash. The fill exceeded this decision's original USD 9.60 ceiling by USD 0.06 per share; the ceiling below has not been rewritten. No unfilled proposal, repeat purchase or scale authorization survives. See [the execution confirmation](2026-09-11-gilt-execution-confirmation.md) for account math, settlement and release review.

The rest of this document preserves the original pretrade analysis and account snapshot. Action wording and unexecuted status below are historical statements, not current instructions. Personal historical research journal; not investment advice.

## Original Decision Snapshot

```yaml
request_type: scheduled_weekly_full_operating_cycle_decision
full_decision_operating_cycle_required: true
date: 2026-09-11
market_session_date: 2026-09-10
evidence_cutoff: 2026-09-11T17:45:00+08:00
policy_version: v1.3
mission_anchor: multi-decade asymmetric compounding with avoidable-ruin controls
constitutional_alignment: aligned
article1_preflight: PASS
article1_postflight: PASS
deposit_confirmed: true
deposit_confirmation_basis: active versioned standing authorization; canonical command applied the due 2026-09-04 and 2026-09-11 occurrences once
standing_contribution_latest_due_date: 2026-09-11
deposit_amount_each: 888
currency: USD
cash_available_for_trading: 11447.87
settled_cash: 11447.87
confirmed_liquidity_reserve_value: 0
liquidity_reserve_available_for_sale: false
liquidity_reserve_symbol: SGOV
confirmed_positions:
  - {symbol: ASTS, quantity: 11, average_cost: 78.65}
  - {symbol: IREN, quantity: 5, average_cost: 44.01}
  - {symbol: MDA, quantity: 9, average_cost: 34.41}
  - {symbol: RKLB, quantity: 17, average_cost: 100.08}
decision: recommend_one_bounded_trade_not_executed
recommended_action: buy GILT 29 shares with a maximum USD 9.60 day limit
valid_through: 2026-09-11 U.S. regular-session close
trade_executed: false
account_mutation_from_recommendation: false
```

## Decision

Recommend buying 29 GILT shares with a day limit no higher than USD 9.60, valid only for the September 11 U.S. regular session. Do not chase a price above the limit. Maximum cost is USD 278.40, or 2.0413 percent of the September 10 research NAV. This is a recommendation only: the repository does not place an order, infer a fill, or change cash, positions, cost basis or tax lots without later broker-confirmed execution evidence.

Hold ASTS 11, IREN 5, MDA 9 and RKLB 17; add zero and sell zero. Buy zero of every other security and make no SGOV transaction. If GILT is above USD 9.60 or adverse evidence appears, its quantity is zero and the recommendation expires at the session close.

Using September 10 adjusted closes, research NAV is USD 13,638.32: confirmed cash is 83.9390 percent and current return-seeking positions are 16.0610 percent. ASTS, MDA and RKLB are 14.4611 percent. At the maximum GILT cost, cash would remain 81.8977 percent and aggregate space-related exposure would be at most 16.5024 percent. The latest confirmed mission-relevant deployment remains the August 14 IREN buy unless a later GILT fill is separately confirmed; a recommendation does not reset the September 28 review clock.

## First-Principles Analysis

```yaml
first_principles_analysis:
  question_rebuilt_from_basics: Which current security can turn a scarce bottleneck into exceptional dilution-adjusted per-share value at a feasible weight and now beats cash, existing holdings and every material alternative?
  irreducible_facts:
    - Confirmed cash is USD 11447.87 and confirmed holdings are ASTS 11, IREN 5, MDA 9 and RKLB 17.
    - The 74-security universe contains 72 listed securities, 71 with a reliable September 10 close, plus OPENAI and ANTHROPIC as unlisted research references; XTND is listed but lacks a reliable completed close.
    - GILT closed at USD 9.54, down 29.6460 percent over three months, completed USD 100 million of convertible financing and disclosed a greater-than-USD 32 million U.S. defense order.
    - June 30 cash and short-term deposits were USD 159.155 million after the USD 10 million Comtech advance; the remaining base cash consideration is approximately USD 147.5 million.
    - Comtech Satellite and Space produced approximately USD 156 million of nine-month revenue, USD 7.3 million of GAAP operating income and USD 15.5 million of adjusted EBITDA; management projects combined revenue above USD 700 million and adjusted EBITDA near USD 80 million.
    - A 29-share maximum-cost position is 2.0413 percent of NAV; 28 shares are below the recorded 2 percent mission-consistent floor.
  binding_constraints:
    - Mission, evidence, entry, survival, promotion and opportunity-cost gates must pass before a nonzero quantity.
    - GILT's closing, working-capital, integration, customer-retention and normalized cash-conversion uncertainty prevents a larger initial position.
    - The USD 9.60 price limit and one-session validity are decision-critical.
  causal_chain: Resilient connectivity demand must convert into delivered ground systems and recurring service; Comtech must expand capability and customer access; combined cash earnings must exceed working-capital, integration and financing costs; bounded dilution must leave per-share reinvestment value; and later scale must be earned by evidence.
  inherited_assumptions_challenged:
    - A pending acquisition automatically requires zero exposure even when the financing, acquired operating profit and minimum size bound survival risk.
    - The 150 million authorized-share ceiling is current issued dilution rather than capacity.
    - A price decline or one large order alone justifies a trade or a full initial position.
  value_capture_or_mission_link: A 2.0413 percent starter can affect NAV in an exceptional outcome and creates a credible path toward a 6 to 12 percent fully underwritten position, while limiting permanent impairment before combined cash economics are known.
  disconfirming_evidence: Failed or repriced Comtech closing, adverse working-capital adjustment, persistent negative operating cash flow, unexpected issuance beyond the approximately 6.25 million note-conversion shares, customer loss, margin compression or a price above USD 9.60.
  decision_consequence: Recommend only the 29-share GILT starter under the stated limit and window; keep every other incremental quantity at zero and require fresh proof before scale.
```

## Nonzero Action — GILT

### From first principles

Gilat supplies satellite ground systems, mobility terminals, amplifiers and deployable multi-band defense communications. The bottleneck is reliable ground, gateway and mission communications equipment that can work across multiple networks and be moved or restored quickly. Value reaches shareholders only if Gilat converts that technical and customer position into repeat cash after the Comtech acquisition, working capital, interest and dilution.

Gilat reported USD 122.7 million of second-quarter revenue and USD 15.4 million of adjusted EBITDA. Its June 30 cash and short-term deposits of USD 159.155 million were already after the USD 10 million Comtech advance. Adding the USD 100 million notes and subtracting approximately USD 147.5 million of remaining base consideration leaves rough post-close cash near USD 111.7 million and debt near USD 102 million before fees and working-capital adjustments, not a modeled liquidity cliff.

Comtech Satellite and Space produced approximately USD 156 million of nine-month revenue, USD 7.3 million of GAAP operating income and USD 15.5 million of adjusted EBITDA. At the current USD 704.35 million equity value, the simplified post-deal enterprise value is approximately USD 695 million, or about 8.7 times management's near-USD-80-million pro-forma adjusted EBITDA. That is not audited free cash flow, but it is enough to bound entry for a two-percent starter.

- Mission gate: pass. Gilat is a direct, small public supplier to a scarce ground and defense communications layer, and successful platform expansion can plausibly create multi-decade per-share upside without merely duplicating the user's main Nasdaq technology allocation.
- Evidence gate: pass for a starter only. Current standalone operations, acquired-segment operating profit, completed financing and a current defense order are sufficient for a minimum position; closing, combined margins, working capital and normalized cash conversion remain scale gates.
- Entry gate: pass only at or below USD 9.60. Current equity value is approximately USD 704 million on 73.831 million basic shares. The note creates an approximately 80.081 million-share conversion stress basis; the 150 million authorized-share ceiling is issuance capacity, not an outstanding-share count.
- Survival gate: pass for a starter. The funded bridge and positive acquired-segment operating economics make remaining uncertainty a sizing constraint rather than a present survival veto.

Scenario prices are analytical stress points, not targets: USD 4.80 downside, USD 14 base, USD 28 upside and USD 60 exceptional. At the maximum starter cost, those imply approximate NAV effects of -1.0207, +0.9356, +3.9125 and +10.7160 percent. The exceptional case requires a durable multi-orbit ground and defense platform; it is not a forecast.

Why buy reasons now exceed no-buy reasons: financing covers the remaining base consideration without an evident liquidity cliff, the acquired segment has positive operating economics, a current defense order validates demand, and the roughly 30 percent three-month decline lowers the starting denominator. The 29-share size, USD 9.60 ceiling, one-session expiry and evidence-gated scale path absorb the remaining integration, working-capital, cash-conversion and dilution risks. Buying more would assume the evidence that is still missing.

## Why Not the Alternatives

### LEU — B+ active candidate — buy 0

Domestic HALEU scarcity can create extraordinary value only if protected contract economics and funding survive dilution. The September 9 Radiant contract strengthens demand, but the same-day provisional 424B5 leaves common-stock and warrant quantities, price and proceeds blank. Mission passes; evidence and entry fail because the immediate denominator and protected cash return are unknown. A smaller quantity cannot repair that blocker.

### STDN — B- R2 research-only — buy 0

TRISO scarcity reaches shareholders only through authorization, HALEU, protected firm orders, repeat industrial margin and cash conversion. The filed Q2 share count is 156,550,755; at USD 12.19, market value is approximately USD 1.908 billion and the security remains near 403 times trailing sales. The filing resolves process debt but not the evidence or entry gate.

### APLD — R2 research-only — buy 0

Powered AI campuses can be scarce, but parent common-equity value depends on tenant credit, limited-recourse financing, on-budget delivery and rent exceeding debt and capex. APLD's direct exposure is real, while project obligations, remaining capex, recourse and fully diluted value remain less bounded than GILT.

### IREN — held 5 — add 0 — sell 0

Powered sites and GPU capacity must produce cash after depreciation, leases, debt and capex. Fiscal 2026 scale and liquidity support holding the starter, but the USD 702.6 million loss, approximately USD 7.976 billion of debt and lease liabilities and USD 13.81 billion of commitments block an add. Holding preserves the right tail; another scale step would compound unproved project returns.

### Cash and SGOV

Cash is superior to every GILT share above 29 and to all other new exposures. It is inferior to the bounded 29-share starter because current evidence and entry now support a credible scale path. SGOV remains an optional cash-management instrument only; no SGOV transaction is needed for the one-session window.

## Confirmed Holdings

- **ASTS:** hold 11, add 0, sell 0. The September 10 close is USD 59.91. Direct-to-device network optionality supports holding; commercial beta economics, production cadence, financing, dilution and 4.8320 percent NAV weight keep an add behind GILT and cash.
- **IREN:** hold 5, add 0, sell 0. The close is USD 43.64 and position weight is 1.5999 percent. The annual filing strengthens scale evidence but enlarges the obligations and cash-return burden.
- **MDA:** hold 9, add 0, sell 0. The close is USD 28.88 and position weight is 1.9058 percent. Platform breadth supports ownership; acquisition leverage, integration and cash conversion keep an add inferior.
- **RKLB:** hold 17, add 0, sell 0. The close is USD 61.96 and position weight is 7.7232 percent. Platform and backlog optionality support holding; merger financing, dilution, Neutron execution, cash conversion and concentration block an add.

## Full 74-Security Action Register

- Buy 29 with a one-session maximum USD 9.60 limit — 1: GILT.
- Hold with no add or sale — 4: ASTS 11; IREN 5; MDA 9; RKLB 17.
- Buy 0, sell 0, no executable limit — 66: LEU; STDN; APLD; CRDO; ALAB; VRT; NBIS; MU; CRWV; CRCL; LITE; CBRS; OKLO; BE; GSAT; KTOS; IONQ; LUNR; RDW; FLY; YSS; VOYG; XNDU; FN; ETN; PWR; SPCX; IQMX; NNE; HQ; NUCL; QBTS; QUBT; RGTI; SMR; AAOI; INFQ; WYFI; WULF; IMSR; POET; CIFR; OCC; SEI; QTEX; ENRD; QSI; NWPX; RIOT; ASPI; VIP; ONDS; AXTI; ALMU; SATL; EOSE; MTSI; LASR; USAR; QNT; COHR; KEEL; FRMI; BRUN; ALOY; RCAT.
- Not currently actionable, quantity 0 — 3: OPENAI; ANTHROPIC; XTND.

No lower-status symbol enters buy eligibility. GILT remains active, rises from B to B+ and enters a one-session buy zone. XNDU, USAR, QNT and OCC advance to R2; XTND advances to R1 after listing; COHR remains comparator-only; KEEL and FRMI are rejected pending explicit reopen evidence. A new emerging `strategic_critical_materials` lane records the direct bottleneck without creating eligibility.

## Decision Operating Cycle

- Account truth: the canonical standing-contribution command applied only the due September 4 and September 11 USD 888 occurrences. Confirmed cash is USD 11,447.87. No trade, order, fill, fee or reserve position changed.
- Market data: all 54 canonical symbols use the completed September 10 adjusted close retrieved at 2026-09-11T07:10:15.035Z. All 17 supplemental R1/R2 symbols have Nasdaq raw-close windows retrieved September 11; adjusted-return treatment is not independently verified. XTND lacks a reliable completed close.
- Macro: the September 11 record is a sizing and entry overlay only and creates neither eligibility nor a portfolio-wide veto.
- Discovery: bottleneck-map-first review added the emerging strategic-critical-materials lane. XNDU, USAR, QNT and OCC advanced to R2; XTND advanced to R1; no lower-status name entered buy eligibility.
- Filings: the event selector covered 72 of 72 listed identifiers and the foundational-first selector covered 71 of 72, with XTND's missing supported foundational filing explicitly bounded. Material issuer deltas received primary-source dispositions.
- Watchlist: all 56 non-removed rows have a September 11 cycle review. All 23 active/core/watch symbols plus STDN have current valuation treatment.
- Reviewers: discovery/candidate triage completed after reconsideration and supports the bounded GILT starter. The bull review supports it; the bear review identified the risks that cap size. Freshness/filing, valuation/entry and allocation/risk retries returned `tool_unavailable`; primary filings and reconciled arithmetic control the decision.
- FMP: the private precheck reported configured availability. Missing-only calls supplied no usable decision-critical payload; SEC, issuer, Yahoo and Nasdaq evidence remain controlling.
- Validity: the GILT action expires at the September 11 U.S. regular close, on price above USD 9.60 or on adverse evidence. All other conclusions expire on a material event or September 18, whichever occurs first.

## Article 1 Postflight

The result advances the mission by funding the strongest currently bounded opportunity at the smallest mission-consistent size while preserving broker truth, a strict entry price, bounded loss, no-auto-trading, evidence-gated scale and public-release safety. It does not buy merely because cash is high, and it does not let unrelated research debt or ordinary integration uncertainty veto a ready staged opportunity.

## Publication Release

This decision contains an exact unexpired order size and price. It must remain local and unpublished until the September 11 regular market close plus the publication-policy safety buffer, no earlier than 2026-09-12 04:30 Asia/Shanghai, and until execution, cancellation, expiry or no-action outcome is known and sensitive-field review passes. The original research run made no public release. The later execution-confirmation update authorizes release of this closed historical record only after that time gate and the final sensitive-field review.

Personal historical research journal; not investment advice. The repository executed no trade; the account owner's later broker-confirmed execution is recorded separately above.
