# Policy v1.1

Effective date: 2026-05-27

Supersedes: [policy-v1.0.md](policy-v1.0.md)

Approved proposal: [2026-05-27-policy-v1.1-proposal.md](2026-05-27-policy-v1.1-proposal.md)

## Objective

Build and maintain a long-term satellite portfolio that pursues asymmetric multi-decade returns. The account should pursue outcomes that can plausibly become tens, hundreds, or thousands of times larger over a very long horizon, while avoiding avoidable ruin, hidden leverage, unverified records, and process drift.

This account is not optimized to stay fully invested every month. Cash and liquidity are tools for waiting until evidence and price create an unusually attractive entry.

## Contribution Plan

Default planned monthly contribution: USD 888.

The planned contribution is not confirmed cash. It becomes investable only when the user confirms that the deposit is available in the brokerage account and, for ledger updates, provides the required broker-side confirmation fields.

Monthly contributions do not need to be fully deployed. A monthly decision may recommend no trade, holding cash, parking idle cash in an approved liquidity reserve, or buying fewer shares than the available cash could afford.

Monthly contributions are not position-sizing buckets. When a rare high-conviction opportunity passes the mission, evidence, and entry gates, the decision should evaluate total confirmed deployable liquidity, not only the latest USD 888 contribution. Total deployable liquidity can include confirmed cash and confirmed SGOV or equivalent reserve value available for sale, after preserving any needed buffer for fees, settlement, taxes, account restrictions, and avoidable-ruin risk.

## Allowed Return-Seeking Assets

Default return-seeking assets are U.S.-listed common stocks and ADRs with public disclosures and normal retail liquidity.

These assets must pass the mission gate, evidence gate, and entry gate before receiving new capital.

## Liquidity Reserve

SGOV or a materially equivalent short-duration U.S. Treasury ETF or Treasury money-market vehicle may be used only as a liquidity reserve and cash-management instrument.

The liquidity reserve is not a return-seeking satellite allocation, not a benchmark, and not a reason to weaken the account's upside objective. It exists to preserve optionality while waiting for rare high-conviction opportunities.

Reserve instruments must have:

- U.S. Treasury or Treasury-repo exposure as the dominant risk;
- short effective duration;
- normal retail liquidity;
- source-backed fund information;
- broker eligibility for the user's account;
- no leverage, inverse exposure, credit-risk reach, or long-duration rate bet.

SGOV and equivalent reserve instruments are not cash. They may have market price movement, distributions, bid/ask spreads, fund expenses, tracking error, tax effects, settlement timing, and broker-specific restrictions.

When a target common stock becomes attractive, the account may sell reserve instruments first and then buy the target stock after the broker shows sufficient funds available to trade. If unsettled sale proceeds are used in a cash account, do not sell the newly purchased stock before the reserve sale settles unless the broker confirms that doing so will not create a settlement violation.

The reserve is available capital, not a permanent separate sleeve. A strong enough return-seeking opportunity may justify selling some or all of the reserve and deploying more than the current month's contribution, as long as the recommendation explains the evidence strength, opportunity cost, liquidity effect, settlement constraints, and remaining risk buffer.

## Excluded Assets

Excluded unless a future approved policy says otherwise:

- options;
- margin;
- leveraged ETFs;
- inverse ETFs;
- short selling;
- crypto tokens;
- private-company secondary shares;
- OTC securities;
- broad funds that duplicate the user's core Nasdaq technology exposure;
- bond funds used as yield-seeking or duration-seeking investments rather than liquidity reserves.

## Decision Standard

A return-seeking buy recommendation needs all of the following:

- fresh price data;
- fresh primary-source company check;
- total confirmed deployable liquidity, including confirmed cash and any confirmed liquidity reserve available for sale;
- clear thesis;
- clear risk and kill criteria;
- exact proposed share count;
- validity window.

A reserve purchase recommendation needs all of the following:

- confirmed idle cash;
- source-backed reserve instrument information;
- broker eligibility and expected settlement treatment when available;
- exact proposed share count or dollar amount;
- explanation that the reserve is cash management, not return-seeking allocation;
- validity window.

A sell recommendation for a return-seeking holding needs fresh evidence that the thesis has broken, risk has become unacceptable, or opportunity cost overwhelms the long-term case.

A sell recommendation for SGOV or an equivalent reserve may be made when cash is needed for an approved return-seeking purchase, when the reserve instrument no longer qualifies, or when broker, tax, settlement, or liquidity conditions make holding it unattractive.

If no opportunity passes the mission, evidence, and entry gates, the preferred action can be no trade, hold cash, or maintain the liquidity reserve.

## Record Standard

Recommendations do not update account records. Only broker-confirmed activity updates account records.

Deposits, SGOV buys, SGOV sells, common-stock buys, common-stock sells, dividends, distributions, fees, and corrections must be recorded through append-only ledger events after broker confirmation.

Ledger entries are append-only. Corrections are separate events.

## Research Standard

Primary sources are preferred. Historical repository research is used as memory, not as proof that facts remain current.

Critical decisions should use the strongest reasoning available and, when tools allow, separate bull-case, bear-case, and risk-allocation reviews.

Research should preserve the difference between:

- return-seeking company evidence;
- market and cycle risk;
- liquidity reserve mechanics;
- confirmed broker facts.
