# 2026-08-18 Price and Filing Trigger Review

Policy version: `v1.3`

Review date: 2026-08-18

Logical cycle key: `market_session_date=2026-08-17; run_kind=targeted_price_and_filing_review; evidence_cutoff=2026-08-18T15:13:09+08:00`

Validity window: until a newer completed regular-session close, a material issuer filing or release for a covered symbol, or 2026-08-22, whichever occurs first.

This is a personal historical research-journal record and not investment advice.

## Scope and Article 1 preflight

The August 17 completed close crossed tier-specific research thresholds for NBIS, HQ, LUNR, WYFI, CRWV, QBTS, CRDO, MU, IREN, and CBRS. A new WhiteFiber agreement was material enough for a fresh company-level re-underwriting, while new QBTS, CRWV, and CBRS filings required narrower review. The scope therefore covered the triggered companies, all confirmed holdings, and the strongest same-lane and cross-lane opportunity-cost comparators. QQQ, SMH, and IWM did not cross broad-index fallback thresholds.

This work advances Article 1 by testing whether a material site acquisition or an unusual price move changed the probability of dilution-adjusted per-share value at a feasible portfolio weight. It preserves the truth boundary by treating prices as research triggers, using issuer filings for company facts, and leaving broker-confirmed account records unchanged.

## First-Principles Analysis

```yaml
first_principles_analysis:
  question_rebuilt_from_basics: Did the August 17 price moves or post-cutoff filings change any covered company's ability to turn a scarce bottleneck into dilution-adjusted per-share value large enough to affect the satellite portfolio?
  irreducible_facts: Ten symbols crossed their tier-specific price triggers; WYFI agreed to pay USD 60 million for two properties with conditional initial gross power capacity of at least 60 MW; QBTS appointed an audit-qualified director; CRWV and CBRS disclosed small preplanned ownership-sale notices; no covered holding disclosed new adverse operating evidence.
  binding_constraints: Price alone creates no buy eligibility; physical sites require confirmed power, funding, construction, customers and cash returns; board credentials do not establish commercialization; proposed secondary sales do not add issuer cash; current valuations still require exceptional execution.
  causal_chain: New evidence can change bottleneck control, survival, financing, customer conversion, cash returns or dilution; those drivers must improve expected value per diluted share, and the resulting opportunity must beat current holdings, candidates and cash at a feasible scale before an allocation can change.
  inherited_assumptions_challenged: A large price move is not a thesis change, gross utility power is not billable IT load, a non-binding customer indication is not contracted revenue, and a property agreement is not a completed funded data-center project.
  value_capture_or_mission_link: The review asks whether any trigger creates a credible path from scarce infrastructure or technology to pricing power, reinvestment, diluted per-share value and a position capable of materially changing portfolio outcomes.
  disconfirming_evidence: WYFI disclosed no completed closing, binding customer economics, total development cost, project return or financing bridge; the other new filings supplied no operating, survival or cash-conversion improvement; most triggered price increases made entry less attractive.
  decision_consequence: Retain all grades and statuses, preserve the existing opportunity-cost boundary, make no new allocation decision and leave broker-confirmed account state untouched.
```

## Completed-close trigger map

The August 17 close comes from read-only Yahoo Finance chart metadata retrieved at `2026-08-18T15:13:09+08:00`, after the regular session had completed. The provider's daily series had not yet populated the August 17 candle, so one-day and five-day trigger returns use the metadata close against the previously committed adjusted-close series. The fallback is suitable for research routing but does not replace the next canonical market-data refresh.

| Symbol | Status / grade | August 17 close | 1D | 5D | Trigger interpretation |
| --- | --- | ---: | ---: | ---: | --- |
| NBIS | watch / B+ | USD 268.85 | -3.1799% | +46.0268% | The B+ five-day threshold crossed; no new issuer evidence improved cash conversion, financing or entry. |
| HQ | research-only / C+ | USD 16.80 | -1.1183% | +33.7580% | The research-only five-day threshold crossed without new paid-demand evidence. |
| LUNR | watch / B- | USD 20.38 | +7.2067% | +29.1508% | The five-day threshold crossed; the move adds no organic backlog, integration or cash-conversion proof. |
| WYFI | research-only / C+ | USD 30.35 | +2.8117% | +28.4928% | The five-day threshold crossed and the material property agreement required re-underwriting. |
| CRWV | watch / B+ | USD 106.00 | +0.7030% | +20.1950% | The B+ five-day threshold crossed; a small proposed-sale cluster added ownership-supply evidence only. |
| QBTS | research-only / C+ | USD 16.21 | -23.4294% | -19.7127% | The one-day threshold crossed, but the valuation denominator remains extreme and the new filing is governance-only. |
| CRDO | active-core-candidate / A- | USD 282.82 | +8.8188% | +17.8736% | Both A- thresholds crossed; the higher valuation worsened entry without new operating evidence. |
| MU | watch / B+ | USD 1,011.75 | +4.1259% | +17.5087% | The B+ five-day threshold crossed without a new HBM supply, margin or cash-return disclosure. |
| IREN | active-candidate / B+ | USD 44.90 | +1.9065% | +15.9009% | The B+ five-day threshold crossed; no new acceptance, GAAP margin, cash-conversion or capitalization evidence supported scaling. |
| CBRS | watch / B | USD 251.98 | +15.0699% | +9.5518% | The one-day threshold crossed; a small preplanned Form 144 did not satisfy the operating-history gate. |

QQQ closed at USD 729.87 with -0.1641% one-day and +1.2485% five-day returns; SMH closed at USD 594.07 with +1.0632% and +4.3308%; IWM closed at USD 304.06 with -0.3376% and +1.3601%. None crossed its broad-index fallback threshold.

## WYFI — site optionality improves, but financing and value capture weaken

Filing identity:

```yaml
symbol: WYFI
company: WhiteFiber, Inc.
filing_type: Form 8-K and furnished issuer release
accession_number: 0001213900-26-090492
agreement_date: 2026-08-16
source_published_at: 2026-08-17T12:00:16Z
retrieved_at: 2026-08-18
source_urls:
  - https://www.sec.gov/Archives/edgar/data/2042022/000121390026090492/ea0302334-8k_whitefiber.htm
  - https://www.sec.gov/Archives/edgar/data/2042022/000121390026090492/ea030233401ex99-1.htm
```

### First-Principles Analysis — WYFI

```yaml
first_principles_analysis:
  question_rebuilt_from_basics: Can conditional control of two industrial sites become dilution-adjusted per-share cash flow after power, retrofit, financing, customer and commissioning constraints?
  irreducible_facts: A WhiteFiber subsidiary agreed to pay USD 60 million in cash for two North Carolina properties, deposited USD 2.25 million, and described at least 30 MW of potential gross capacity at each site; potential expansion to 198 MW over seven years remains conditional; closing follows an inspection period and depends on power, approvals, separation and occupancy arrangements.
  binding_constraints: The company must close, confirm deliverable power and interconnection economics, fund the purchase and retrofit, convert gross utility capacity into billable IT load, sign binding creditworthy customers, commission the facilities and generate cash returns above financing and depreciation costs.
  causal_chain: Close the acquisition, confirm power, fund development, secure binding customers, energize capacity, collect revenue, cover debt and depreciation, and retain the residual value for diluted common shares; the filing establishes only the first conditional step.
  inherited_assumptions_challenged: A definitive agreement is not a closed asset, gross megawatts are not IT load, non-binding letters of intent are not backlog, and retrofit-first development is not proven capital efficiency.
  value_capture_or_mission_link: Confirmed low-cost powered sites could strengthen direct control of a scarce AI-infrastructure bottleneck, but mission relevance requires project returns and a financing structure that preserve exceptional value per diluted share.
  disconfirming_evidence: The filing gives no total development cost, binding customer economics, project return, funding source or fully diluted capitalization bridge; the seller reported that the transferred property's net book value was below USD 5 million, making appraisal, utility value and retrofit economics especially important.
  decision_consequence: Physical-site optionality strengthens modestly, but survival and entry evidence weaken; retain C+ research-only, no promotion, no buy-zone eligibility and no portfolio action.
```

The purchase price is approximately 107% of the latest committed USD 56.056 million cash balance before retrofit, equipment, interconnection, working capital and contingency spending. The June 30 Form 10-Q reports USD 222.594 million of convertible debt plus USD 83.206 million of term debt, a USD 28.6 million working-capital deficit and USD 344.712 million of six-month property-and-equipment purchases and deposits. It also reports a 50.6% effective interest rate on one short-term related-party facility and states that existing capital may be insufficient for both the development pipeline and near-term debt maturities without additional debt, equity-linked or project-level financing.

At the August 17 close, the approximately 38.848 million basic-share denominator implies a basic market capitalization of about USD 1.179 billion. Using only the committed USD 222.594 million debt field gives an enterprise value of about USD 1.346 billion and approximately 14.24 times trailing sales; including the separately reported June term debt mechanically raises the bridge to about USD 1.429 billion and 15.12 times trailing sales before subsequent financing adjustments. This is not a fully diluted valuation, but it shows why financing terms, customer contracts and project returns are decision-critical.

Re-underwriting should reopen at the September 15 inspection deadline or extension; at a completed closing; when the utility study confirms deliverable capacity, timing and cost; when binding customer contracts disclose contracted load and payment protection; when purchase-plus-development financing and fully diluted capitalization are known; or when project-level revenue, margin and cash-return evidence becomes available. Those are future evidence requirements, not reasons to leave the current no-promotion conclusion unresolved.

## QBTS — the price reset does not cure the denominator

Filing identity:

```yaml
symbol: QBTS
company: D-Wave Quantum Inc.
filing_type: Form 8-K
accession_number: 0001907982-26-000132
event_date: 2026-08-13
source_published_at: 2026-08-17T11:01:00Z
retrieved_at: 2026-08-18
source_url: https://www.sec.gov/Archives/edgar/data/1907982/000190798226000132/qbts-20260813.htm
```

### First-Principles Analysis — QBTS

```yaml
first_principles_analysis:
  question_rebuilt_from_basics: Does the price decline or board appointment improve the probability that D-Wave can convert annealing demand into dilution-adjusted per-share cash value at an attractive entry?
  irreducible_facts: The board appointed Kevan Krysler as an independent Class I director and audit-committee member; the August 17 close fell 23.4294% in one session; the committed denominator remains approximately 369.264 million basic shares and USD 12.425 million of trailing revenue.
  binding_constraints: D-Wave still requires repeat system sales, bookings conversion, durable services growth, controlled cash burn and a valuation supported by commercial scale rather than distant optionality.
  causal_chain: Better audit governance can reduce reporting risk, but shareholder value requires paid adoption, revenue scale, margins, reinvestment and diluted per-share cash flow; the appointment does not establish any link after governance.
  inherited_assumptions_challenged: A sharp decline does not make a security cheap when the revenue denominator remains tiny, and director credentials are not commercialization evidence.
  value_capture_or_mission_link: Quantum computing could become a strategic capability, but a feasible portfolio position matters only if D-Wave can capture enough commercial economics to justify its diluted capitalization.
  disconfirming_evidence: At USD 16.21, the basic market capitalization remains approximately USD 5.986 billion, or about 481.8 times trailing sales; the filing contains no new revenue, booking, margin, cash or financing evidence.
  decision_consequence: Retain C+ research-only, no promotion, no buy-zone eligibility and no portfolio action.
```

## Lower-impact dispositions

- **CRWV:** Eight August 17 Forms 144 aggregate 256,397 proposed shares with approximately USD 27.0 million of stated market value, about 0.056% of the 458.9 million basic-share denominator. Two Form 4 filings reflect non-sale trust or gift transfers. The much smaller cluster does not add operating, financing or cash-conversion deterioration beyond the ownership-supply evidence already recorded on August 17. B+ watch remains unchanged.
- **CBRS:** Eric Vishria's trust proposed selling 68,268 shares with approximately USD 15.7 million of stated market value under a pre-existing Rule 10b5-1 instruction. The filing's 112.2 million outstanding-share reference makes the proposal approximately 0.061% of shares. It adds no operating evidence and does not satisfy the two-quarter public-history gate. B watch remains unchanged.
- **CRDO:** No new SEC operating filing accompanied the move. At USD 282.82 and the committed share denominator, basic market capitalization is approximately USD 52.7 billion, or about 39.5 times trailing sales. Entry is less attractive; A- active-core-candidate status remains unchanged and no buy-zone or allocation change follows.
- **IREN:** The five-day move supplies no Horizon 2-4 acceptance, GAAP AI-cloud margin, cash-conversion, project-debt, remaining-capex or dilution evidence. The bounded starter remains unchanged, and no scale step is supported.
- **NBIS, HQ, LUNR, and MU:** No new SEC issuer filing accompanied the trigger. The price moves alone do not improve financing, customer conversion, margin, cash return, mission-adjusted entry or buy eligibility. Existing grades and statuses remain unchanged.
- **Confirmed holdings and opportunity cost:** No confirmed holding received new adverse operating evidence. The targeted comparison did not displace the latest decision's leading alternatives or make the smallest mission-consistent staged exposure more attractive than the existing conclusion.

## Decision effect and Article 1 postflight

The new evidence changes local interpretation but not the portfolio decision. WYFI controls a more concrete path to potential powered sites, yet the acquisition increases the importance of financing, deliverable power, binding customers, project returns and dilution. QBTS added audit governance but no commercialization evidence; CRWV and CBRS added only small ownership-supply notices; the other price triggers either worsened entry or added no operating fact. None changes a holding action, promotion or buy-zone eligibility, the opportunity-cost boundary, or the smallest mission-consistent staged exposure.

This is a targeted evidence review, not a new complete allocation decision. No trade is executed or authorized, and no account fact is changed. The result advances the mission by preserving a potentially important WYFI bottleneck lead while refusing to count conditional megawatts as diluted per-share value before the financing and customer chain exists.

## Sources

- Yahoo Finance chart metadata, completed August 17 regular-session closes, published 2026-08-17 and retrieved 2026-08-18T15:13:09+08:00; prior adjusted closes stored in `data/market/price_history.csv` and related committed market-data surfaces.
- WhiteFiber Form 8-K and furnished release, accession 0001213900-26-090492, accepted 2026-08-17T12:00:16Z and retrieved 2026-08-18.
- WhiteFiber Form 10-Q, accession 0001213900-26-088026, accepted 2026-08-12 and retrieved 2026-08-18.
- Unifi Form 8-K, accession 0000100726-26-000008, accepted 2026-08-17 and retrieved 2026-08-18.
- D-Wave Quantum Form 8-K, accession 0001907982-26-000132, accepted 2026-08-17T11:01:00Z and retrieved 2026-08-18.
- CoreWeave Forms 144 and Forms 4, accepted 2026-08-17T20:29:25Z through 2026-08-17T23:16:49Z and retrieved 2026-08-18.
- Cerebras Systems Form 144, accession 0001974078-26-000308, accepted 2026-08-17T20:30:31Z and retrieved 2026-08-18.
