# Research Command Reference

This is the cold-path command reference for market refresh, deterministic discovery, SEC filing discovery, semantic-discovery coordination, FMP supplemental data, and validation. The canonical behavior still lives in `SPEC.md`, `AGENTS.md`, templates, and scripts; this file keeps long operational command notes out of the repository entry point.

## Dashboard And Validation

```bash
npm ci
npm run dev
```

Build and verify:

```bash
npm run verify
```

`npm run verify` includes data validation, deterministic discovery-scan regression tests, discovery-readiness negative gate tests, promotion/watchlist-cycle gate tests, and the static dashboard build.

## Daily Market Data Refresh

```bash
npm run refresh:market -- --dry-run
```

GitHub Actions runs the same market-data refresh on a weekday schedule. It updates committed security metadata, daily price history, technical snapshots, SEC-derived company metrics, and latest close snapshots, then updates `data/account/equity_curve.csv` only after confirmed positions and confirmed cash exist. The research cards, right-side research detail, and per-symbol pages under `/research/<symbol>/` read those committed files, so the public display becomes richer as the refresh history grows.

`FMP_API_KEY` is an optional local or GitHub Actions secret for Financial Modeling Prep supplemental market and fundamentals data. The key must stay outside the repository: put it in the local shell environment for manual runs, and put it in the repository or environment secret named `FMP_API_KEY` for scheduled GitHub Actions runs. `scripts/refresh-market-data.mjs` treats FMP as a quota-limited supplement, not the primary source of truth: SEC companyfacts and Yahoo close data remain the default path, FMP is used only when `FMP_MARKET_DATA_MODE` is `missing` or `all`, responses are cached under ignored `research/cache/fmp/`, per-day usage is recorded under the same ignored cache tree without logging the API key, and failures, missing keys, exhausted budget, or rate limits fall back to the existing SEC/Yahoo-derived rows. The daily workflow restores the newest matching ignored FMP cache, saves each run under a unique cache key so new responses can be reused by later runs, and uses a default budget of 60 uncached FMP calls per as-of date, roughly a conservative fraction of a typical free daily quota. Increase the budget only when the provider plan and cache hit rate support it.

## Dry-Run Discovery Scan

```bash
npm run discover:universe -- --dry-run
```

The discovery scan is only a first-pass lead generator from the lane map and public issuer reference data. It does not replace primary-source research, create buy eligibility, or mutate account records. Use `--as-of YYYY-MM-DD --json --output research/discovery/runs/YYYY-MM-DD-scan.json` when the run should leave an audit artifact with SEC input hashes, lane-map hashes, truncation counts, known-symbol suppressions, matched fields, security-form warnings, false-positive flags, multi-lane matches, exploratory unknown-lane signals, and recall diagnostics. Lane `current_public_proxies` are also used as explicit recall probes; broad freshness cannot pass with known public proxy recall misses. `unknown_future_bottlenecks` matches are surfaced as `exploratory_matches` for lane review and are not appended as ordinary raw candidates until evidence supports a concrete named lane.

`npm run build:discovery-profiles -- --as-of YYYY-MM-DD --output research/discovery/runs/YYYY-MM-DD-profile-input.json` builds a repo-research recall-calibration profile artifact for known symbols; `npm run build:issuer-profiles -- --input issuer-profiles.csv --sec-input sec-company-tickers-exchange.json --output research/discovery/runs/YYYY-MM-DD-issuer-profile-input.json` normalizes a broader SEC-validated issuer profile set; and `npm run build:sec-issuer-profiles -- --symbols SYMBOL --output research/discovery/runs/YYYY-MM-DD-sec-profile-input.json` builds an SEC submissions metadata profile artifact.

## SEC Filing Profile Discovery

For SEC filing business sections, first run:

```bash
npm run build:sec-filing-manifest -- --symbols SYMBOL --output research/discovery/runs/YYYY-MM-DD-sec-filing-manifest.csv --metadata-output research/discovery/runs/YYYY-MM-DD-sec-filing-manifest.metadata.json
npm run build:sec-filing-profiles -- --manifest research/discovery/runs/YYYY-MM-DD-sec-filing-manifest.csv --manifest-metadata research/discovery/runs/YYYY-MM-DD-sec-filing-manifest.metadata.json --output research/discovery/runs/YYYY-MM-DD-sec-filing-profile-input.json
```

The manifest builder defaults to `--filing-selection-policy foundational-first`, which prefers 10-K, 20-F, S-1, or F-1 business filings over newer 424B supplements, then prefers business-prospectus 424B variants such as 424B1, 424B3, and 424B4 over supplement-grade 424B variants such as 424B2, 424B5, or 424B7 when no foundational filing exists; unknown later 424B variants such as 424B8 are marked with warnings.

Use `npm run build:sec-registration-transaction-candidates -- --as-of YYYY-MM-DD --daily-index SEC_MASTER_IDX --output research/discovery/runs/YYYY-MM-DD-registration-transaction-candidates.json` to surface pre-ticker IPO, listing, spinoff, and transaction leads from SEC daily master indexes before `company_tickers_exchange` can see them; use `--daily-index-dir DIR --start-date YYYY-MM-DD --end-date YYYY-MM-DD` when a cycle needs interval coverage across multiple daily indexes. Interval artifacts record `covered_dates` and `missing_or_unscanned_dates`; pass `--strict-date-coverage` only when every calendar date in the requested range must have a local daily index. These leads remain not tradable until security metadata confirms an eligible US-listed public equity.

Use `npm run discover:sec-event-filing-index -- --as-of YYYY-MM-DD --symbols SYMBOL --output-prefix research/discovery/runs/YYYY-MM-DD-sec-event-filing-index` for supplemental event-driven discovery across explicit 8-K, 6-K, 10-Q, S-4, F-4, and DEF 14A forms.

The manifest builder ignores filings whose filing date is after the requested `--as-of`, and the filing profile builder rejects rows whose `source_published_at` is after effective `retrieved_at`. The filing profile builder anchors 10-K extraction on `Item 1. Business` rather than generic `our business` phrases, supports bounded event or transaction extraction for explicitly requested event forms, rejects generic `our business depends` or `our company may` sentence fragments as false starts, records the accepted start pattern, and keeps extraction markers, offsets, hashes, and warnings in profile metadata.

Manifest rows record selection reason, selected SEC form base, filing family, displaced newer supported filings, foundational candidate count, 424B family counts, and selection warnings, preserve accession and primary-document provenance, and can map local filing fixtures through `--filing-dir` plus explicit local-evidence flags for offline tests only. Use `--filing-selection-policy latest-supported` only when the newest supported filing is intentionally desired. Use `--all` only when intentionally selecting every eligible SEC issuer; otherwise requested-symbol and first-N runs are partial coverage.

SEC live requests use a shared request helper that records the active SEC user agent, sends explicit accept and compression headers, respects `Retry-After`, retries bounded transient access-control, throttling, network, and server responses, and uses exponential backoff between attempts; set `SEC_USER_AGENT` locally when a live run should include a specific contact identity.

The SEC submissions builders support `--submissions-cache-dir`, `--cache-only` or `--require-cached-submissions`, `--request-delay-ms`, `--max-submissions-cache-age-days`, bounded retry controls, and optional `--submissions-ledger-output`; live complete-universe runs require at least a 100 ms request delay unless they are cache-only. Cached submissions are validated against the SEC company list CIK, ticker, exchange, cache freshness, and non-future cache observation time before use, and complete artifacts record a per-CIK submissions ledger with cache status, source URL, payload SHA-256, cache observed timestamp, cache age, validation status, request attempts, retrieval timestamp, fetch timestamp when applicable, and SEC user-agent metadata. When `--submissions-ledger-output` is provided, the ledger is written incrementally so failed cache validation or failed fetches still leave a resumable audit artifact.

Remote filing HTML extraction supports `--filing-cache-dir`, `--cache-only` or `--require-cached-filings`, `--max-filing-cache-age-days`, bounded retry controls, and optional `--filing-ledger-output`; cache hits require sidecar metadata with source URL, fetch timestamp, retrieval date, payload SHA-256, and SEC user-agent, so copied cache files cannot become fresh by filesystem mtime alone. Profile artifacts record per-filing cache status, request attempts, request statuses, payload hashes, retrieval dates, and fetch timestamps so filing-content provenance remains auditable.

Profile artifacts are validated for source metadata, declared counts, sampling frame, coverage scope, eligible issuer set, and field-level provenance when used for issuer discovery; the scanner emits coverage status from actual loaded profile count, gap count, missing requested symbols, and coverage ratio, and `check:data` requires every saved deterministic JSON output in an agentic discovery artifact to carry a matching hash. Partial issuer-profile scans may be acknowledged as targeted evidence, but they cannot satisfy broad `coverage.universe_scan_as_of` freshness. `check:data` also rejects legacy or truncated broad scan artifacts, broad scan artifacts with known public proxy recall misses, malformed registration or transaction candidate artifacts, forged complete issuer-profile evidence unless the saved output has zero gap, full coverage ratio, matching selected/profile/eligible counts, and an SEC input binding that matches the current broad scan, and validates saved SEC filing index hashes. Issuer profile paths can surface unknown profile-enriched candidates, but they remain deterministic triage and do not replace fresh primary-source evidence.

For a repeatable filing-profile pass, `npm run discover:sec-filing-index -- --as-of YYYY-MM-DD --symbols SYMBOL --output-prefix research/discovery/runs/YYYY-MM-DD-sec-filing-index` runs the manifest builder, filing-profile builder, and profile-enriched universe scan in sequence, then writes an index metadata file with artifact paths, hashes, command records, scope, coverage counts, and scan counts. Use `--all` only for complete SEC universe indexes; targeted indexes remain requested-symbol evidence.

## Artifact Anchoring And Semantic Discovery

After generating standalone discovery artifacts, run `npm run build:discovery-artifact-index -- --as-of YYYY-MM-DD` to hash-anchor the generated JSON and CSV files for that date. `check:data` requires discovery-run JSON and CSV artifacts to be anchored by an agentic run, evidence packet, SEC filing index, or discovery artifact index.

Large semantic-discovery work orders are different: write issuer packets, semantic batch files, smoke artifacts, validation artifacts, and full complete-universe SEC issuer-profile dumps under ignored `research/cache/discovery/YYYY-MM-DD/`, then commit only durable summaries, hashes, source metadata, and classification cache records that are small enough to remain reviewable. Semantic cache freshness is tied to packet hash, lane-map hash, schema version, classifier version, and explicit cache validity; changing classifier logic should invalidate old rows instead of silently reusing them. `check:data` rejects cache-only intermediates if they are left under `research/discovery/runs/`, validates semantic review packets against the semantic run they summarize, and fails if ignored `research/cache/` or `research/downloads/` files become tracked.

Useful semantic-discovery coordination commands:

```bash
npm run build:semantic-issuer-packets -- --as-of YYYY-MM-DD --profile-input PROFILE.json --output research/cache/discovery/YYYY-MM-DD/semantic-packets.json
npm run build:semantic-batches -- --as-of YYYY-MM-DD --packets research/cache/discovery/YYYY-MM-DD/semantic-packets.json --cache research/discovery/semantic-cache.jsonl --output-dir research/cache/discovery/YYYY-MM-DD/semantic-batches --output research/cache/discovery/YYYY-MM-DD/semantic-batch-manifest.json
npm run classify:semantic-heuristic -- --as-of YYYY-MM-DD --packets research/cache/discovery/YYYY-MM-DD/semantic-packets.json --cache research/discovery/semantic-cache.jsonl --output research/cache/discovery/YYYY-MM-DD/semantic-heuristic-results.jsonl
npm run import:semantic-classifications -- --as-of YYYY-MM-DD --packets research/cache/discovery/YYYY-MM-DD/semantic-packets.json --results research/cache/discovery/YYYY-MM-DD/semantic-results.jsonl --cache research/discovery/semantic-cache.jsonl --cache-output research/discovery/semantic-cache.jsonl --output research/discovery/runs/YYYY-MM-DD-semantic-import.json
npm run build:semantic-discovery-run -- --as-of YYYY-MM-DD --packets research/cache/discovery/YYYY-MM-DD/semantic-packets.json --cache research/discovery/semantic-cache.jsonl --output research/discovery/runs/YYYY-MM-DD-semantic-discovery-run.json
npm run build:semantic-review-packet -- --as-of YYYY-MM-DD --semantic-run research/discovery/runs/YYYY-MM-DD-semantic-discovery-run.json --output research/discovery/runs/YYYY-MM-DD-semantic-review-packet.json
npm run build:evidence-packet -- --as-of YYYY-MM-DD --deterministic-output research/discovery/runs/YYYY-MM-DD-scan.json --output research/discovery/runs/YYYY-MM-DD-subagent-evidence-packet.yml
```

Use `npm run build:evidence-packet` before spawning independent xhigh subagents for material discovery or allocation work.

## Public Community Scan

```bash
npm run scan:community
npm run triage:community
```

The public community scan is a no-token, no-cookie lead-generation layer. It reads the configured public sources in `research/community-sources.yml`, currently Reddit RSS/Atom feeds, Stocktwits public trending and symbol stream endpoints, Hacker News Algolia search, and generic RSS feeds. It deliberately excludes X because official X search requires API credentials and web scraping is not an acceptable repository workflow.

By default, the command writes an aggregate JSON file under ignored `research/cache/community/YYYY-MM-DD/`. The artifact stores source status, global symbol mention counts, per-source symbol rankings, per-source-type symbol rankings, lane keyword counts, symbol reason-keyword co-mentions, Stocktwits public trend metadata, sample URLs, retrieval timestamps, and caveats. It must not store raw post bodies, author names, cookies, tokens, or private payloads. Use `--output PATH` only when intentionally saving a durable aggregate artifact after checking publication safety.

Run `npm run triage:community` after the scan to convert the aggregate community artifact into an analysis-priority queue. The triage output compares the current scan with the latest prior scan when available, assigns `high`, `medium`, or `low` analysis priority, separates existing-watchlist priority boosts from unknown-symbol primary-source skim candidates, and sends ambiguous ticker strings to identity confirmation. It explicitly records that community signals do not create buy eligibility, promotion eligibility, security metadata, raw candidate records, or allocation evidence.

The default scan and triage outputs are ignored scratch artifacts. If a material discovery run relies on community triage for a durable candidate, readiness, watchlist, or discovery conclusion, rerun the triage command with a sanitized committed output path under `research/discovery/runs/` and record the output hash in the discovery run artifact.

Useful options:

```bash
npm run scan:community -- --as-of YYYY-MM-DD
npm run scan:community -- --json
npm run scan:community -- --output research/cache/community/YYYY-MM-DD/YYYY-MM-DD-public-community-scan.json
npm run triage:community -- --as-of YYYY-MM-DD
npm run triage:community -- --scan research/cache/community/YYYY-MM-DD/YYYY-MM-DD-public-community-scan.json
npm run triage:community -- --previous-scan research/cache/community/YYYY-MM-DD/YYYY-MM-DD-public-community-scan.json
npm run triage:community -- --output research/discovery/runs/YYYY-MM-DD-community-triage.json
```

Community output is never buy eligibility. A symbol surfaced by this scan can enter durable research only after security metadata confirmation, primary-source skim, and the normal discovery readiness or promotion gates when material.

## Research Expansion

Research expansion starts with `research/discovery/lanes.yml`, then raw candidates in `research/discovery/candidates.csv`, and only then `research/watchlist.csv` after primary-source evidence supports promotion. For a promoted public ticker, the market-data refresh hydrates missing security metadata, fetches committed price history, updates the latest close and derived metrics, and lets the dashboard generate the card and `/research/<symbol>/` page without changing the workflow. `npm run check:data` enforces that every watchlist row has matching security metadata and that every tradable watchlist symbol has market-data coverage after refresh.

## Focused Validation Commands

```bash
npm run check:data
npm run test:discovery-artifact-index
npm run test:discovery-profiles
npm run test:discovery-scan
npm run test:semantic-discovery
npm run test:fmp-fetch
npm run test:discovery-gates
npm run test:sec-registration-transaction-candidates
npm run test:promotion-gates
npm run test:watchlist-cycle-gates
npm run test:community-scan
npm run verify
```

Use `npm run check:data` for data and research changes. Use `npm run test:discovery-artifact-index` when changing artifact index generation or hash anchoring. Use `npm run test:discovery-profiles` when changing SEC or issuer profile generation. Use `npm run test:discovery-scan` when changing deterministic universe scan matching or scan output behavior. Use `npm run test:semantic-discovery` when changing semantic packet, batch, cache, import, or run-summary behavior. Use `npm run test:fmp-fetch` when changing optional FMP provider, cache, budget, or fallback behavior. Use `npm run test:discovery-gates` when changing discovery readiness rules or validation. Use `npm run test:sec-registration-transaction-candidates` when changing pre-ticker registration or transaction discovery. Use `npm run test:promotion-gates` when changing promotion-review or active/core/buy-zone gate validation. Use `npm run test:watchlist-cycle-gates` when changing stale-prevention, priority/status refresh, or buy-zone currentness rules. Use `npm run test:community-scan` when changing public no-token community source parsing, scoring, or privacy boundaries. Use `npm run verify` for dashboard, broad repository changes, or final validation when practical.
