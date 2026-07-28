# Public Release Policy

This repository is a personal open-source research journal and account audit trail for one individual's own satellite portfolio. It is not investment advice, not legal advice, not tax advice, not accounting advice, not a broker service, not an investment adviser service, not a paid newsletter, and not a signal or copy-trading service.

No public reader should treat any repository content, dashboard view, research note, decision memo, source list, watchlist, valuation state, or historical trade record as a recommendation that they buy, sell, hold, or size any security. Public readers must make their own decisions or consult their own qualified professionals.

No disclaimer removes every legal, privacy, security, or relationship risk. The control objective is to make this repository a delayed, source-backed, non-personalized publication with strict anti-signal, anti-compensation, privacy, and secret-handling boundaries.

## Operating Boundary

- Publish general research, source-backed reasoning, policy rules, templates, code, validation logic, and delayed confirmed account records.
- Do not publish personalized advice for any reader other than the account owner.
- Do not answer public-reader questions with individualized buy, sell, hold, allocation, timing, tax, or suitability guidance.
- Do not operate a paid group, paid newsletter, paid model portfolio, copy-trading channel, referral funnel, affiliate offer, broker-introduction funnel, issuer promotion, sponsored research product, or compensated endorsement from this repository.
- Do not accept compensation, gifts, rebates, referrals, advertising, sponsorships, issuer payments, platform payments, or other material benefits tied to securities, brokers, financial platforms, or reader trading. If any material connection exists or is proposed, stop public release of decision and trade content until this policy is updated, the connection is prominently disclosed, and qualified legal review says the operating model remains allowed.
- Do not use public copy that promises returns, implies others should follow, markets a transformation target, or creates urgency. Aspirational mission language must stay framed as an account objective, not a public offer or performance promise.
- Do not target a jurisdiction, group, or person with solicitations. The public surface is a passive historical publication.

## Public Release Embargo

Actionable trading content is any unexpired or same-day content that includes a proposed order, exact share count, exact dollar order, exact live target weight, live scale ladder, unexpired portfolio-allocation plan, buy or sell instruction, reserve sale instruction, target execution timing, time-sensitive price trigger, order preview, or broker execution detail.

Actionable trading content must not be committed, pushed, published, deployed, posted, or otherwise made public until all of the following are true:

- the order was broker-confirmed as executed, cancelled, or expired, or the user explicitly decided to take no action;
- the regular market close for the security's primary listing on the relevant trade date has passed, plus at least a 30-minute safety buffer;
- any execution confirmation has been converted into a redacted repository record rather than a raw broker artifact;
- the sensitive-field review below has passed;
- the public text clearly presents the record as historical account activity or a historical decision, not as a current instruction for readers.

If market-close timing, holiday status, halt status, primary listing venue, or time zone is uncertain, wait until the next regular trading day before public release. When a decision remains unexecuted but still within its validity window, keep the actionable decision local and unpublished unless all exact order, timing, and sizing fields are removed or the decision is marked expired.

Research-only notes may be published before market close only when they do not contain actionable order sizing, same-day trading intent, or time-sensitive instructions.

## Sensitive-Field Review

Never commit or publish:

- raw broker screenshots, PDFs, statements, tax forms, order tickets, account statements, account numbers, full order IDs, full confirmation numbers, routing numbers, tax identifiers, addresses, phone numbers, email addresses, legal identity documents, or broker message-center content;
- API keys, tokens, cookies, passwords, private keys, environment dumps, browser profiles, `.env` files, local credential paths, local cache payloads, or raw provider responses containing credentials;
- personal communications that were not meant to be public;
- unlicensed raw market-data dumps, scraped articles, full filings, transcripts, paywalled content, or large raw source files unless repository source-retention rules explicitly allow the file;
- local absolute paths, machine names, or private workflow details in public docs, decision notes, PR text, commit messages, or dashboard copy.

Allowed public account records must be normalized, delayed, and redacted. A broker `confirmation_id` in repository data should be a stable redacted alias or non-reversible hash, not the raw broker confirmation number or order ID. `account_alias` must remain generic.

## Public Dashboard Requirements

- Every public dashboard and per-symbol research page must show a visible disclaimer that the page is not investment advice and that records are historical, delayed, source-backed repository data.
- The dashboard must clearly separate confirmed broker records, market snapshots, research analysis, simulated/demo data, and external live previews.
- Confirmed buy and sell markers may be shown only from delayed committed ledger events. They must not be inferred from recommendations or unconfirmed user statements.
- The dashboard must not include broker login, broker credential storage, order tickets, alert-signup forms, copy-trade actions, reader portfolio inputs, or execution controls.
- Historical performance must be shown with enough context to avoid implying a guarantee, benchmark service, or model-portfolio advertisement.

## Public Interaction Rules

If someone says they followed, copied, or wants to copy the account:

- do not give personalized guidance;
- do not tell them whether to buy, sell, hold, or how much to allocate;
- do not discuss their suitability, tax position, risk tolerance, brokerage constraints, or timing;
- state that the repository is a personal historical research journal, not investment advice;
- direct them to their own independent research or a qualified professional;
- keep any response general, educational, and non-actionable.

## Release Checklist

Before any public commit, push, deployment, or external post involving decisions, trades, account records, performance, or dashboard copy, verify:

- `PUBLICATION_POLICY.md` was followed;
- no actionable trading content is being published before the public release embargo expires;
- no raw broker documents or sensitive identifiers are present;
- no secrets, local paths, private cache payloads, or credentials are present;
- no compensation, referral, sponsorship, or material connection exists, or it is handled under an updated policy and qualified legal review;
- public copy says `Not investment advice` where readers are likely to see the content;
- proposed or completed orders are framed as the account owner's historical process only;
- validation was run for the changed surfaces.

## Reference Basis

This policy is based on a conservative reading of public regulatory and platform guidance. It is not a legal opinion.

- SEC and Investor.gov materials on investment advisers, social-media investment fraud, and public investor alerts.
- FTC Endorsement Guides on material connections and endorsements.
- GitHub documentation on secret scanning and remediation of leaked credentials.
- Repository-specific truth, freshness, auditability, clone-portability, no-auto-trading, and source-retention rules.
