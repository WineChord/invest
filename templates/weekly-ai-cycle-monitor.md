# Weekly AI Cycle Monitor Template

Use this template for a weekly or major-event review of broad AI-cycle risk before it affects portfolio allocation. The monitor is a risk overlay, not an execution instruction. It must use fresh source-backed data and stay inside the current policy when proposing account actions.

```yaml
monitor_date:
week_covered:
policy_version:
retrieved_at:
operator:
related_monthly_decision:
market_holidays_or_short_sessions:
unavailable_sources:
```

## 1. Weekly Regime Judgment

Market regime:

Choose one primary label and explain uncertainty:

- `strong_trend`
- `top_formation`
- `early_downtrend`
- `bubble_break_initial`
- `credit_stress`
- `survivor_reset`

AI cycle analogy:

Use only as a rough map, not as proof:

- `1996-1998_early_diffusion`
- `1999_narrative_and_valuation_acceleration`
- `2000Q1_near_top`
- `2000H2_orders_and_capex_deterioration`
- `2001-2002_credit_risk_exposure`
- `2003_survivor_stage`

Probability distribution:

| Regime or analogy | Probability | Why |
| --- | ---: | --- |
|  |  |  |

One-sentence action bias:

State whether next week should be offensive, defensive, range-bound, or wait-only for this account.

## 2. Five Material Events

| Event | Facts | Source and date | Why it matters | Direction | Changes account plan |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

Facts must include source publication dates or market data timestamps, retrieval dates, and data scope. If an item cannot be verified, write `unverified`.

## 3. Bubble Risk Score

Score each dimension from 0 to 5.

| Dimension | Score | Prior score | Change | Evidence |
| --- | ---: | ---: | ---: | --- |
| Valuation excess |  |  |  |  |
| Capex overheating |  |  |  |  |
| Financing fragility |  |  |  |  |
| Real demand conversion |  |  |  |  |
| Supply glut risk |  |  |  |  |
| Leader earnings quality |  |  |  |  |
| Second-tier company fragility |  |  |  |  |
| Credit market stress |  |  |  |  |
| Breadth deterioration |  |  |  |  |
| Regulatory and geopolitical risk |  |  |  |  |
| Mega-IPO and private-market capital drain risk |  |  |  |  |

Total score:

Change from prior monitor:

Closest internet-bubble analogy:

Most important disconfirming condition:

## 4. Evidence Checklist

Record the latest verified facts. Write `unavailable` or `unverified` instead of estimating from memory.

| Area | Required checks | Current facts | Sources |
| --- | --- | --- | --- |
| Index tape | SPX, NDX, Nasdaq Composite, QQQ, SOX, SMH, IWM |  |  |
| Volatility and options | VIX, VVIX, put/call, unusual AI leader option activity if available |  |  |
| Rates and dollar | 2Y, 10Y, real yields if available, U.S. dollar index |  |  |
| Credit | HY OAS, IG OAS, CDX HY or equivalent |  |  |
| Breadth | Advancers/decliners, 52-week highs/lows, mega-cap and AI contribution |  |  |
| AI capex | Hyperscaler, AI cloud, and data-center capex updates |  |  |
| AI supply chain | NVIDIA, AMD, Broadcom, TSMC, ASML, SK Hynix, Micron, Arista, Dell, Super Micro |  |  |
| AI demand | Cloud AI revenue, AI software ARR, model API revenue, paid usage |  |  |
| AI unit economics | Inference cost, GPU rental prices, margins, depreciation |  |  |
| Financing and IPOs | SpaceX, OpenAI, Anthropic, CoreWeave, Nebius, xAI, data-center financing |  |  |
| Regulation and geopolitics | Export controls, antitrust, data regulation, energy permitting, conflicts |  |  |
| Structured macro layer | regime snapshot, watchlist sensitivity, financing fragility, shared risk matrix, event calendar |  | `research/macro/` |

## 5. Holdings and Watchlist Handling

Use this only for confirmed holdings and active watchlist names relevant to the monitor.

| Symbol | Current state | Weekly risk change | Account-permitted action | Trigger | Invalidation | Next focus |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |

Account-permitted actions under policy `v1.2` are buy eligible common stock, add, hold, trim, exit, wait, hold cash, or park idle liquidity in an approved short-duration U.S. Treasury reserve such as SGOV. Puts, shorts, leverage, margin, crypto tokens, private shares, and non-US-listed instruments are outside account policy unless a later approved policy changes this; they may appear only as research context or bottleneck-map intelligence.

## 6. Next-Week Scenarios

### Scenario 1: Continued Advance

Trigger conditions:

Account-permitted actions:

What not to do:

### Scenario 2: Top Formation or Range Trading

Trigger conditions:

Account-permitted actions:

What not to do:

### Scenario 3: Downtrend or Bubble Break

Trigger conditions:

Account-permitted actions:

What not to do:

## 7. Action List

List at most eight account-permitted actions. If there is no clear account-permitted trade, write `no clear account-permitted trade`.

| Action | Target | Reason | Trigger | Invalidation or stop | Time horizon |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## 8. Turn Points to Watch

List at most ten. Treat the list below as a starting checklist, not a permanent requirement. Replace obsolete indicators with better source-backed proxies when the active opportunity set changes.

- Hyperscaler capex changes.
- NVIDIA gross margin, inventory, and accounts receivable.
- GPU rental prices and AI cloud utilization.
- AI cloud revenue quality.
- AI software paid adoption and ARR.
- SpaceX, OpenAI, Anthropic, CoreWeave, Nebius, or xAI financing or IPO changes.
- AI data-center debt, lease, power, or project-finance stress.
- High-yield and investment-grade credit spreads.
- Nasdaq, SOX, and semiconductor leader trend breaks.
- Export controls, antitrust, energy permitting, launch, spectrum, or data-regulation changes.

## 9. Checklist Evolution Review

Use this section when an indicator has become stale or a new bottleneck has become important.

| Indicator or proxy | Keep, retire, or add | Reason | Replacement source family |
| --- | --- | --- | --- |
|  |  |  |  |

Do not remove an indicator merely because current data is inconvenient to collect. Retire it only when it no longer maps to the opportunity set, the source quality has degraded, or a better source-backed proxy exists.

## 9A. Structured Macro Records

Files checked or updated:

| File | Changed | Why |
| --- | --- | --- |
| `research/macro/regime-snapshots.csv` |  |  |
| `research/macro/watchlist-sensitivity.csv` |  |  |
| `research/macro/financing-runway-scores.csv` |  |  |
| `research/macro/watchlist-risk-matrix.csv` |  |  |
| `research/macro/event-calendar.csv` |  |  |

## 10. Fact, Inference, Scenario, and Action Separation

Facts:

Inferences:

Probability scenarios:

Proposed account actions:

Unverified or unavailable data:
