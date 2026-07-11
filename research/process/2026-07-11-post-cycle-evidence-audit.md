# Post-Cycle Evidence and Valuation Audit — 2026-07-11

The 2026-07-11 full cycle was independently re-audited after commit `66b9e9b`. No tradable dashboard issuer filed a new SEC document after the commit cutoff, so the deterministic full cycle was not duplicated. The audit found pre-cutoff evidence and a market-data calculation defect that required targeted repair.

## Repairs

- The supplemental submissions audit now gives every tradable dashboard symbol an explicit latest-form or issuer-event disposition. Material additions include MDA financing, GILT defense orders, IQMX manager transactions, LUNR planned sales, NNE's NRC review kickoff, and QUBT's 13.5 million-share S-8.
- SEC Companyfacts TTM calculation now prefers a complete annual fact and rolls it forward with post-year-end quarters minus the comparable prior-year quarters. It no longer sums four non-contiguous quarter frames when a 10-K omits standalone Q4 data, and it cannot combine different taxonomy tags into one period.
- CRDO TTM revenue is corrected to USD 1.335116 billion and price-to-sales to about 36.01, rather than 46.53. ALAB TTM revenue is corrected to USD 1.001444 billion and price-to-sales to about 70.68, rather than 79.51. The correction lowers both multiples but does not clear their entry gates.
- CRCL TTM revenue is corrected to USD 2.862202 billion. Its stablecoin-holder reserves are removed from corporate cash and enterprise value, and the filing review now separates gross revenue from USD 1.722785 billion of TTM distribution and transaction costs. Final OCC approval is positive, but rate sensitivity, distributor leakage, ARC token capture, and dilution keep it watch-only.
- LEU's 8-K explicitly states that ACO would obtain title to the deployed enrichment capacity after completing the contract. This strengthens long-term shareholder value capture and changes the private allocation reconciliation. Exact unexpired share and price instructions remain outside the public repository under `PUBLICATION_POLICY.md`.
- MDA and GILT move from research-only to active-candidate monitoring. Both remain public trigger-only because MDA's offering and two acquisitions are not fully closed and GILT would add to already high space concentration before Comtech integration evidence exists.

## Publication boundary

This file records public-safe research corrections only. It does not contain an unexpired order, share count, or limit price. Any exact current action remains private until execution, cancellation, expiry, and the public release embargo conditions are satisfied.
