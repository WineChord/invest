# invest

This repository is a portable operating system for a long-term satellite investment account.

The account objective is multi-decade asymmetric compounding: pursue outcomes that can plausibly become tens, hundreds, or thousands of times larger over a very long horizon, while avoiding avoidable ruin. The default planned monthly contribution is USD 888.

Public dashboard: [www.wineandchord.com/invest](https://www.wineandchord.com/invest/). It is built from this open-source repository and deployed as a static GitHub Pages project site.

Operating model: the repository stores the durable operating system. Codex or a future agent supplies active compute when the user starts a conversation in this workspace. When no agent is active, only deterministic automation such as GitHub Actions may run; qualitative research judgment, allocation recommendations, broker-record changes, and trades require user-triggered agent work and the repository's confirmation rules.

Start here:

1. Read [CONSTITUTION.md](CONSTITUTION.md) for the highest-order mission and operating principles.
2. Read [AGENTS.md](AGENTS.md) for the rules every future agent must follow.
3. Read [SPEC.md](SPEC.md) for the full portfolio system design.
4. Read [policy-v1.1.md](data/policy/policy-v1.1.md) for the current investment policy.
5. Use [templates/monthly-decision.md](templates/monthly-decision.md) when asking for a monthly buy, sell, hold-cash, or SGOV liquidity-reserve plan.
6. Use [templates/execution-confirmation.md](templates/execution-confirmation.md) after trades or deposits are actually completed.
7. Use [templates/filing-review.md](templates/filing-review.md) when a material SEC filing or official report appears.
8. Use [templates/bottleneck-lane-review.md](templates/bottleneck-lane-review.md) when reviewing the bottleneck map before naming stocks.
9. Use [templates/research-engine-run.md](templates/research-engine-run.md) when running the discovery, freshness, valuation, and cleanup loop.
10. Use [templates/meta-self-improvement.md](templates/meta-self-improvement.md) when improving the repository's own process.
11. Use [templates/full-operating-cycle.md](templates/full-operating-cycle.md) when asking the agent to run the whole repository flow or execute every applicable workflow.
12. Run `npm run dev` to preview the public dashboard locally.

Repository state:

- Confirmed positions: empty.
- Confirmed cash balance: USD 888.
- Confirmed ledger events: one deposit event on 2026-05-30.
- Current policy: [policy-v1.1.md](data/policy/policy-v1.1.md), which allows SGOV or a materially equivalent short-duration U.S. Treasury reserve for cash management only.
- Initial research baseline: [research/2026-05-26-initial-baseline.md](research/2026-05-26-initial-baseline.md).
- Initial simulated decision: [decisions/2026-05-26-initial-simulation.md](decisions/2026-05-26-initial-simulation.md).
- Latest ready-state refresh: [research/2026-05-30-ready-state-refresh.md](research/2026-05-30-ready-state-refresh.md).

Research engine state:

- Discovery lane map: [research/discovery/lanes.yml](research/discovery/lanes.yml).
- Potential new public candidates: [research/discovery/candidates.csv](research/discovery/candidates.csv).
- Material freshness events: [research/freshness/events.csv](research/freshness/events.csv).
- Valuation and entry states: [research/valuation-states.csv](research/valuation-states.csv).
- Research health metrics: [research/quality-metrics.yml](research/quality-metrics.yml).
- Completed filing reviews: [research/filings](research/filings).
- Process reviews: [research/process](research/process).

Repo-scoped skill:

- [invest-operating-cycle](.agents/skills/invest-operating-cycle/SKILL.md) is a lightweight Codex skill for this repository's repeated workflows. It is stored under `.agents/skills` so Codex can discover it as repository context without installing it globally. It points agents back to `AGENTS.md`, `SPEC.md`, policy files, templates, and validation commands.
- Repo-scoped skills are part of meta-self-improvement. Add or update them when repeated workflows need better automatic triggering or navigation, but keep canonical rules in `AGENTS.md`, `SPEC.md`, templates, scripts, and committed data.

Decision requests are full operating-cycle triggers. When the user reports new cash or asks what to buy, sell, hold, use as SGOV reserve, or allocate, future agents must run the full decision operating cycle from [AGENTS.md](AGENTS.md), [SPEC.md](SPEC.md), and [templates/monthly-decision.md](templates/monthly-decision.md) before proposing orders. The cycle refreshes market data, reviews the bottleneck map, asks whether a new lane appeared, scans discovery candidates and mission-relevant new public names, checks SEC/IR freshness, reviews filing and valuation coverage, reprioritizes the watchlist when thesis or entry quality changes, runs applicable risk and regime checks, performs repository cleanup, validates changed surfaces, and reports decision readiness.

The research engine is self-evolving. Current favorite stocks are not permanent favorites, and current discovery lanes are not permanent boundaries. Each serious decision or full-cycle run must start from the bottleneck map, ask whether watchlist theses improved or deteriorated, whether price made a candidate newly attractive or unattractive, whether another candidate now has better opportunity cost, and whether a new industry or bottleneck deserves a discovery lane.

The process is also self-improving. Each serious run must ask whether the repository's methods, templates, sources, scoring labels, automation, validation, dashboard, or cleanup rules should be improved. Substantial process reviews live under [research/process](research/process) and use [templates/meta-self-improvement.md](templates/meta-self-improvement.md).

Full-cycle requests go further. When the user asks to run the whole repository flow, execute everything, do a full refresh, or uses equivalent language such as "全量执行", future agents must use [templates/full-operating-cycle.md](templates/full-operating-cycle.md) and run every applicable repository capability in a safe order. If something cannot be executed, the agent must say why and must not claim full-cycle completion.

## Dashboard

```bash
npm ci
npm run dev
```

Build and verify:

```bash
npm run verify
```

The dashboard defaults to committed real data. Because the account currently has confirmed cash but no confirmed security positions, the real view shows funded cash, empty holdings, and a deposit-only equity curve. The "Demo data" control switches to browser-only demo data for testing charts, operation history, Sharpe ratio, drawdown, and holding tables. "Real data" switches back to committed repository data without changing files.

Daily market data refresh:

```bash
npm run refresh:market -- --dry-run
```

Dry-run discovery scan:

```bash
npm run discover:universe -- --dry-run
```

The discovery scan is only a first-pass lead generator from the lane map and public issuer reference data. It does not replace primary-source research, create buy eligibility, or mutate account records. Use `--as-of YYYY-MM-DD --json --output research/discovery/runs/YYYY-MM-DD-scan.json` when the run should leave an audit artifact with SEC input hashes, lane-map hashes, truncation counts, known-symbol suppressions, matched fields, security-form warnings, false-positive flags, multi-lane matches, exploratory unknown-lane signals, and recall diagnostics. Lane `current_public_proxies` are also used as explicit recall probes; broad freshness cannot pass with known public proxy recall misses. `unknown_future_bottlenecks` matches are surfaced as `exploratory_matches` for lane review and are not appended as ordinary raw candidates until evidence supports a concrete named lane. `npm run build:discovery-profiles -- --as-of YYYY-MM-DD --output research/discovery/runs/YYYY-MM-DD-profile-input.json` builds a repo-research recall-calibration profile artifact for known symbols; `npm run build:issuer-profiles -- --input issuer-profiles.csv --sec-input sec-company-tickers-exchange.json --output research/discovery/runs/YYYY-MM-DD-issuer-profile-input.json` normalizes a broader SEC-validated issuer profile set; and `npm run build:sec-issuer-profiles -- --symbols SYMBOL --output research/discovery/runs/YYYY-MM-DD-sec-profile-input.json` builds an SEC submissions metadata profile artifact.

For SEC filing business sections, first run `npm run build:sec-filing-manifest -- --symbols SYMBOL --output research/discovery/runs/YYYY-MM-DD-sec-filing-manifest.csv --metadata-output research/discovery/runs/YYYY-MM-DD-sec-filing-manifest.metadata.json`, then run `npm run build:sec-filing-profiles -- --manifest research/discovery/runs/YYYY-MM-DD-sec-filing-manifest.csv --manifest-metadata research/discovery/runs/YYYY-MM-DD-sec-filing-manifest.metadata.json --output research/discovery/runs/YYYY-MM-DD-sec-filing-profile-input.json`. The manifest builder defaults to `--filing-selection-policy foundational-first`, which prefers 10-K, 20-F, S-1, or F-1 business filings over newer 424B supplements, then prefers business-prospectus 424B variants such as 424B1, 424B3, and 424B4 over supplement-grade 424B variants such as 424B2, 424B5, or 424B7 when no foundational filing exists; unknown later 424B variants such as 424B8 are marked with warnings. Use `npm run build:sec-registration-transaction-candidates -- --as-of YYYY-MM-DD --daily-index SEC_MASTER_IDX --output research/discovery/runs/YYYY-MM-DD-registration-transaction-candidates.json` to surface pre-ticker IPO, listing, spinoff, and transaction leads from SEC daily master indexes before `company_tickers_exchange` can see them; use `--daily-index-dir DIR --start-date YYYY-MM-DD --end-date YYYY-MM-DD` when a cycle needs interval coverage across multiple daily indexes. Interval artifacts record `covered_dates` and `missing_or_unscanned_dates`; pass `--strict-date-coverage` only when every calendar date in the requested range must have a local daily index. These leads remain not tradable until security metadata confirms an eligible US-listed public equity. Use `npm run discover:sec-event-filing-index -- --as-of YYYY-MM-DD --symbols SYMBOL --output-prefix research/discovery/runs/YYYY-MM-DD-sec-event-filing-index` for supplemental event-driven discovery across explicit 8-K, 6-K, 10-Q, S-4, F-4, and DEF 14A forms. The manifest builder ignores filings whose filing date is after the requested `--as-of`, and the filing profile builder rejects rows whose `source_published_at` is after effective `retrieved_at`. The filing profile builder anchors 10-K extraction on `Item 1. Business` rather than generic `our business` phrases, supports bounded event or transaction extraction for explicitly requested event forms, rejects generic `our business depends` or `our company may` sentence fragments as false starts, records the accepted start pattern, and keeps extraction markers, offsets, hashes, and warnings in profile metadata. Manifest rows record selection reason, selected SEC form base, filing family, displaced newer supported filings, foundational candidate count, 424B family counts, and selection warnings, preserve accession and primary-document provenance, and can map local filing fixtures through `--filing-dir` plus explicit local-evidence flags for offline tests only. Use `--filing-selection-policy latest-supported` only when the newest supported filing is intentionally desired. Use `--all` only when intentionally selecting every eligible SEC issuer; otherwise requested-symbol and first-N runs are partial coverage. SEC live requests use a shared request helper that records the active SEC user agent, sends explicit accept and compression headers, respects `Retry-After`, retries bounded transient access-control, throttling, network, and server responses, and uses exponential backoff between attempts; set `SEC_USER_AGENT` locally when a live run should include a specific contact identity. The SEC submissions builders support `--submissions-cache-dir`, `--cache-only` or `--require-cached-submissions`, `--request-delay-ms`, `--max-submissions-cache-age-days`, bounded retry controls, and optional `--submissions-ledger-output`; live complete-universe runs require at least a 100 ms request delay unless they are cache-only. Cached submissions are validated against the SEC company list CIK, ticker, exchange, cache freshness, and non-future cache observation time before use, and complete artifacts record a per-CIK submissions ledger with cache status, source URL, payload SHA-256, cache observed timestamp, cache age, validation status, request attempts, retrieval timestamp, fetch timestamp when applicable, and SEC user-agent metadata. When `--submissions-ledger-output` is provided, the ledger is written incrementally so failed cache validation or failed fetches still leave a resumable audit artifact. Remote filing HTML extraction supports `--filing-cache-dir`, `--cache-only` or `--require-cached-filings`, `--max-filing-cache-age-days`, bounded retry controls, and optional `--filing-ledger-output`; cache hits require sidecar metadata with source URL, fetch timestamp, retrieval date, payload SHA-256, and SEC user-agent, so copied cache files cannot become fresh by filesystem mtime alone. Profile artifacts record per-filing cache status, request attempts, request statuses, payload hashes, retrieval dates, and fetch timestamps so filing-content provenance remains auditable. Profile artifacts are validated for source metadata, declared counts, sampling frame, coverage scope, eligible issuer set, and field-level provenance when used for issuer discovery; the scanner emits coverage status from actual loaded profile count, gap count, missing requested symbols, and coverage ratio, and `check:data` requires every saved deterministic JSON output in an agentic discovery artifact to carry a matching hash. Partial issuer-profile scans may be acknowledged as targeted evidence, but they cannot satisfy broad `coverage.universe_scan_as_of` freshness. `check:data` also rejects legacy or truncated broad scan artifacts, broad scan artifacts with known public proxy recall misses, malformed registration or transaction candidate artifacts, forged complete issuer-profile evidence unless the saved output has zero gap, full coverage ratio, matching selected/profile/eligible counts, and an SEC input binding that matches the current broad scan, and validates saved SEC filing index hashes. Issuer profile paths can surface unknown profile-enriched candidates, but they remain deterministic triage and do not replace fresh primary-source evidence.

For a repeatable filing-profile pass, `npm run discover:sec-filing-index -- --as-of YYYY-MM-DD --symbols SYMBOL --output-prefix research/discovery/runs/YYYY-MM-DD-sec-filing-index` runs the manifest builder, filing-profile builder, and profile-enriched universe scan in sequence, then writes an index metadata file with artifact paths, hashes, command records, scope, coverage counts, and scan counts. Use `--all` only for complete SEC universe indexes; targeted indexes remain requested-symbol evidence.

After generating standalone discovery artifacts, run `npm run build:discovery-artifact-index -- --as-of YYYY-MM-DD` to hash-anchor the generated JSON and CSV files for that date. `check:data` requires discovery-run JSON and CSV artifacts to be anchored by an agentic run, evidence packet, SEC filing index, or discovery artifact index. Large semantic-discovery work orders are different: write issuer packets, semantic batch files, smoke artifacts, validation artifacts, and full complete-universe SEC issuer-profile dumps under ignored `research/cache/discovery/YYYY-MM-DD/`, then commit only durable summaries, hashes, source metadata, and classification cache records that are small enough to remain reviewable. Semantic cache freshness is tied to packet hash, lane-map hash, schema version, classifier version, and explicit cache validity; changing classifier logic should invalidate old rows instead of silently reusing them. `check:data` rejects cache-only intermediates if they are left under `research/discovery/runs/`, validates semantic review packets against the semantic run they summarize, and fails if ignored `research/cache/` or `research/downloads/` files become tracked.

GitHub Actions runs the same market-data refresh on a weekday schedule. It updates committed security metadata, daily price history, technical snapshots, SEC-derived company metrics, and latest close snapshots, then updates `data/account/equity_curve.csv` only after confirmed positions and confirmed cash exist. The research cards, right-side research detail, and per-symbol pages under `/research/<symbol>/` read those committed files, so the public display becomes richer as the refresh history grows.

`FMP_API_KEY` is an optional local or GitHub Actions secret for Financial Modeling Prep supplemental market and fundamentals data. The key must stay outside the repository: put it in the local shell environment for manual runs, and put it in the repository or environment secret named `FMP_API_KEY` for scheduled GitHub Actions runs. `scripts/refresh-market-data.mjs` treats FMP as a quota-limited supplement, not the primary source of truth: SEC companyfacts and Yahoo close data remain the default path, FMP is used only when `FMP_MARKET_DATA_MODE` is `missing` or `all`, responses are cached under ignored `research/cache/fmp/`, per-day usage is recorded under the same ignored cache tree without logging the API key, and failures, missing keys, exhausted budget, or rate limits fall back to the existing SEC/Yahoo-derived rows. The daily workflow restores the newest matching ignored FMP cache, saves each run under a unique cache key so new responses can be reused by later runs, and uses a default budget of 60 uncached FMP calls per as-of date, roughly a conservative fraction of a typical free daily quota. Increase the budget only when the provider plan and cache hit rate support it.

Research expansion starts with `research/discovery/lanes.yml`, then raw candidates in `research/discovery/candidates.csv`, and only then `research/watchlist.csv` after primary-source evidence supports promotion. For a promoted public ticker, the market-data refresh hydrates missing security metadata, fetches committed price history, updates the latest close and derived metrics, and lets the dashboard generate the card and `/research/<symbol>/` page without changing the workflow. `npm run check:data` enforces that every watchlist row has matching security metadata and that every tradable watchlist symbol has market-data coverage after refresh.
