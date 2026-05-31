# AI Cycle And Market Regime Review

monitor_date: 2026-05-31
week_covered: 2026-05-25 to 2026-05-31
policy_version: v1.1
retrieved_at: 2026-05-31
operator: Codex
related_monthly_decision: decisions/2026-05-31-monthly-decision.md
market_holidays_or_short_sessions: 2026-05-31 was a Sunday, so the latest committed regular-session market data is 2026-05-29.
unavailable_sources: live broker quotes, broker order preview, fractional-share support, SGOV broker eligibility, and post-weekend trading data.

## 1. Weekly Regime Judgment

Market regime: `strong_trend`

AI cycle analogy: `1999_narrative_and_valuation_acceleration`

Probability distribution:

| Regime or analogy | Probability | Why |
| --- | ---: | --- |
| strong_trend / narrative acceleration | 55% | Hyperscaler capex, data-center demand, AI networking, and power bottlenecks remain strong, but high valuations make entries fragile. |
| top_formation | 25% | Federal Reserve financial-stability evidence on high equity valuations and tight credit spreads supports caution. |
| early_downtrend | 15% | No broad source-backed demand rollover was found, but high-multiple suppliers are vulnerable if financing or capex sentiment weakens. |
| credit_stress | 5% | Current evidence points to tight spreads rather than active stress, but financing-sensitive companies need monitoring. |

One-sentence action bias: use staged, price-limited entries only; cash or SGOV remains a valid fallback when limits fail or broker execution facts are missing.

## 2. Five Material Events

| Event | Facts | Source and date | Why it matters | Direction | Changes account plan |
| --- | --- | --- | --- | --- | --- |
| Hyperscaler capex remains elevated | Microsoft and Meta materials point to continued AI infrastructure investment and capacity constraints. | Microsoft 2026-04-29, retrieved 2026-05-31; Meta 2026-04-29, retrieved 2026-05-31 | Supports AI infrastructure lanes but increases capex-cycle risk. | Positive for demand, cautious for entry | No CRDO/ALAB/VRT buy because valuation still blocks entry. |
| AI networking demand remains strong | NVIDIA and Broadcom reported strong data-center and AI networking revenue. | NVIDIA 2026-05-20, retrieved 2026-05-31; Broadcom 2026-03-04, retrieved 2026-05-31 | Supports semiconductor interconnect scarcity. | Positive | Keep CRDO and ALAB high on watch, not in buy-zone. |
| Data-center power remains a structural bottleneck | FERC large-load context points to grid-planning pressure from data-center loads. | FERC 2026-04-16, retrieved 2026-05-31 | Supports VRT/BE/OKLO/LEU/IREN monitoring. | Positive for lane | No immediate buy because entry and company risks remain unresolved. |
| Credit and valuation conditions are tight | Federal Reserve report noted high equity valuations and tight credit spreads. | Federal Reserve 2026-05-08, retrieved 2026-05-31 | Raises risk for long-duration, high-multiple candidates. | Negative for aggressiveness | Keep RKLB/ASTS sizing staged; do not chase. |
| Watchlist financing events reinforce caution | IREN, OKLO, RDW, CRCL, IONQ, and NBIS had financing, transaction, or token-related filings requiring review. | SEC filings 2026-05-01 through 2026-05-22, retrieved 2026-05-31 | Confirms no watch-only candidate should be promoted today. | Negative for promotion | Current buy comparison stays RKLB/ASTS versus cash/SGOV. |

## 3. Bubble Risk Score

| Dimension | Score | Prior score | Change | Evidence |
| --- | ---: | ---: | ---: | --- |
| Valuation excess | 4 | N/A | N/A | Fed valuation caution and watchlist multiples. |
| Capex overheating | 4 | N/A | N/A | Hyperscaler capex remains elevated. |
| Financing fragility | 3 | N/A | N/A | IREN convertible notes, OKLO/RDW ATM programs, and tight credit spreads. |
| Real demand conversion | 3 | N/A | N/A | AI data-center and networking demand remain strong but conversion durability varies by supplier. |
| Supply glut risk | 2 | N/A | N/A | No current evidence of broad glut, but GPU/neocloud supply needs monitoring. |
| Leader earnings quality | 2 | N/A | N/A | NVIDIA and Broadcom evidence remains strong. |
| Second-tier company fragility | 4 | N/A | N/A | NBIS, CRWV, IREN, OKLO, RDW, and FLY remain financing or execution sensitive. |
| Credit market stress | 1 | N/A | N/A | Fed report points to tight spreads rather than stress. |
| Breadth deterioration | 2 | N/A | N/A | Not fully measured in this run. |
| Regulatory and geopolitical risk | 3 | N/A | N/A | Power, spectrum, launch, export, nuclear, and data-center permitting remain relevant. |
| Mega-IPO and private-market capital drain risk | 3 | N/A | N/A | SpaceX and other frontier platform watch names remain relevant but not tradable. |

Total score: 31/55

Change from prior monitor: N/A

Closest internet-bubble analogy: late-cycle narrative acceleration, not confirmed break.

Most important disconfirming condition: hyperscaler capex cuts, AI networking order rollover, widening credit spreads, or a failed major launch/regulatory event before order entry.

## 4. Evidence Checklist

| Area | Required checks | Current facts | Sources |
| --- | --- | --- | --- |
| Index tape | SPX, NDX, Nasdaq Composite, QQQ, SOX, SMH, IWM | Not fully measured in this run. | unavailable |
| Volatility and options | VIX, VVIX, put/call | Not fully measured in this run. | unavailable |
| Rates and dollar | 2Y, 10Y, real yields, dollar | Not fully measured in this run. | unavailable |
| Credit | HY and IG credit stress | Fed report says risk premiums remain tight rather than stressed. | `federal_reserve_financial_stability_2026_05_08` |
| Breadth | Advancers/decliners, highs/lows | Not fully measured in this run. | unavailable |
| AI capex | Hyperscaler capex | Still elevated and capacity-linked. | `microsoft_fy26_q3_ai_capex_2026_04_29`; `meta_q1_2026_ai_capex_2026_04_29` |
| AI supply chain | NVIDIA, Broadcom, Credo, Astera | AI networking and interconnect demand remain strong. | `nvidia_q1_fy2027_ai_networking_2026_05_20`; `broadcom_q1_fy2026_ai_revenue_2026_03_04`; `crdo_q3_fy2026`; `alab_q1_2026` |
| AI demand | Cloud and AI usage | Strong but not enough to override valuation. | company IR sources |
| AI unit economics | GPU rental, depreciation, utilization | Not fully measured in this run. | unavailable |
| Financing and IPOs | SpaceX, OpenAI, Anthropic, CoreWeave, Nebius, IREN | Financing and IPO watch remain important. | SEC filings in `research/freshness/events.csv` |
| Regulation and geopolitics | Power, energy, launch, spectrum | Large-load interconnection and power constraints remain important. | `ferc_large_load_docket_2026_04_16` |

## 5. Holdings and Watchlist Handling

| Symbol | Current state | Weekly risk change | Account-permitted action | Trigger | Invalidation | Next focus |
| --- | --- | --- | --- | --- | --- | --- |
| RKLB | active_core_candidate, staged buy-zone | Broad regime argues for smaller sizing, not removal | Buy only as staged limit order | Quote at or below buy-zone limit and no new adverse filing | Price above limit or new adverse launch/financing event | Neutron, ATM use, defense contract execution |
| ASTS | active_core_candidate, staged buy-zone | Binary risk remains high | Smaller staged limit order only | Quote at or below buy-zone limit and no new adverse filing | Price above limit or adverse launch/regulatory event | BlueBird deployment and MNO economics |
| CRDO | active_core_candidate, not in buy-zone | AI demand strong, valuation still blocks | Wait | Valuation compression or customer diversification | Customer concentration or growth rollover | Next quarterly report |
| ALAB | active_candidate, not in buy-zone | AI demand strong, valuation still blocks | Wait | Valuation reset or stronger durability evidence | Hyperscaler concentration or multiple compression | Next quarterly report |
| VRT | active_candidate, trigger-only | Power lane strong, asymmetry lower | Wait or trigger-only | Major dislocation or stronger upside evidence | Large-cap asymmetry remains insufficient | Orders, backlog, liquid cooling |
| Cash/SGOV | confirmed cash only, no reserve position | Valuable option value | Hold cash; SGOV only after broker eligibility and preview | Equity limits fail and broker ETF terms are clean | Immediate equity opportunity improves | Broker eligibility and settlement |

## 6. Next-Week Scenarios

### Scenario 1: Continued Advance

Trigger conditions: RKLB and ASTS remain at or below limits, no adverse filings, and broker preview confirms affordability.

Account-permitted actions: staged RKLB/ASTS starter only.

What not to do: do not chase AI names or increase ASTS size without new evidence.

### Scenario 2: Top Formation or Range Trading

Trigger conditions: prices trade around current levels but volatility or filings add uncertainty.

Account-permitted actions: reduce size, use only one RKLB share, or hold cash.

What not to do: do not force full deployment.

### Scenario 3: Downtrend or Bubble Break

Trigger conditions: major gap down, credit spread widening, failed catalyst, or adverse filing.

Account-permitted actions: hold cash or use SGOV reserve after broker preview.

What not to do: do not average down automatically.

## 7. Action List

| Action | Target | Reason | Trigger | Invalidation or stop | Time horizon |
| --- | --- | --- | --- | --- | --- |
| Buy staged starter | RKLB | Strongest execution-led space infrastructure candidate | Current quote at or below USD 143.50 | Price above limit or new adverse filing | Next U.S. regular session only |
| Buy smaller staged starter | ASTS | Rare direct-to-device convexity | Current quote at or below USD 113.50 | Price above limit or new adverse filing | Next U.S. regular session only |
| Hold cash | USD residual or full cash if limits fail | Preserve option value | Limits fail or broker preview not clean | Better fresh entry appears | Until next decision cycle |
| Consider SGOV reserve | Idle cash | Cash management only | Broker confirms ETF eligibility, fees, and settlement | Strong equity opportunity appears | Short-duration reserve only |

## 8. Turn Points to Watch

- Hyperscaler capex guide cuts.
- NVIDIA/Broadcom/CRDO/ALAB networking order rollover.
- VRT backlog or liquid-cooling order quality deterioration.
- AI cloud debt, utilization, or GPU rental price stress.
- RKLB ATM usage or Neutron delay.
- ASTS BlueBird launch/deployment failure or MNO economics disappointment.
- IREN post-note deployment and customer revenue proof.
- OKLO licensing or ATM use.
- High-yield and speculative-grade technology credit spread widening.
- Federal or grid policy changes affecting large-load interconnection.

## 9. Checklist Evolution Review

| Indicator or proxy | Keep, retire, or add | Reason | Replacement source family |
| --- | --- | --- | --- |
| AI capex | Keep | Still central to AI infrastructure lanes. | Hyperscaler IR and filings |
| Credit spread and valuation heat | Add | Bear-case disagreement depends on financing and multiple risk. | Fed stability report and credit market data |
| GPU rental/utilization | Add | Needed for neocloud and IREN/CRWV/NBIS comparisons. | Company filings and market data providers |

## 10. Fact, Inference, Scenario, And Action Separation

Facts: AI capex and AI networking demand remain strong; several watch-only candidates have financing, dilution, or transaction filings; confirmed deployable cash remains USD 888 with no positions.

Inferences: The AI infrastructure lane is stronger, but entries in CRDO/ALAB/VRT are still unattractive. Broad valuation risk supports strict limits for RKLB and ASTS.

Probability scenarios: strong trend remains most likely, with meaningful top-formation risk.

Proposed account actions: staged RKLB/ASTS only if limits and broker prerequisites hold; otherwise cash or SGOV reserve after broker preview.

Unverified or unavailable data: live quote, broker fees, fractional-share support, SGOV eligibility, complete breadth/volatility/rates dashboard, and GPU rental/utilization data.
