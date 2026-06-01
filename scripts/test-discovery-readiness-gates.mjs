import { createHash } from "node:crypto";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkDataScript = path.join(repoRoot, "scripts/check-data.mjs");
const fixtureRoot = mkdtempSync(path.join(tmpdir(), "invest-discovery-gates-"));

const positiveTestCases = [
  {
    name: "accepts targeted partial issuer profile scan evidence",
    mutate: (cwd) => {
      const outputSha256 = writePartialProfileScan(cwd);
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.source_coverage.deterministic_commands.push({
          command: "npm run discover:universe -- --dry-run --profile-input partial-profile-scan.json",
          dry_run: true,
          output_path: "research/discovery/runs/partial-profile-scan.json",
          output_sha256: outputSha256,
          retrieved_at: "2026-05-31",
          profile_coverage_scope: "partial_requested_symbols",
          profile_coverage_status: "targeted_partial",
          profile_requested_symbols: ["ARCD"],
          targeted_scope_acknowledged: true,
          targeted_scope_reason: "fixture intentionally exercises an explicit requested-symbol profile scan",
          result_summary: "Targeted profile scan is allowed as scoped supplementary evidence, not as the broad universe freshness command.",
        });
      });
    },
  },
];

const testCases = [
  {
    name: "rejects decision_readiness not_ready",
    mutate: (cwd) => {
      updateYaml(cwd, "research/quality-metrics.yml", (doc) => {
        doc.decision_readiness.status = "not_ready";
      });
    },
    expected: "unsupported value not_ready",
  },
  {
    name: "rejects wrong readiness scope",
    mutate: (cwd) => {
      updateYaml(cwd, "research/quality-metrics.yml", (doc) => {
        doc.decision_readiness.scope = "repository_and_broker_information";
      });
    },
    expected: "decision_readiness.scope must be repository_and_public_observable_information",
  },
  {
    name: "rejects transient candidate readiness",
    mutate: (cwd) => {
      updateCandidateReadiness(cwd, (record) => {
        record.readiness_status = "in_progress";
        record.blocker_type = "repo_work_remaining";
        record.reachable_evidence_remaining = "market data";
      });
    },
    expected: "has transient readiness_status in_progress",
  },
  {
    name: "rejects repo work remaining in terminal candidate readiness",
    mutate: (cwd) => {
      updateCandidateReadiness(cwd, (record) => {
        record.readiness_status = "incubated_after_review";
        record.blocker_type = "repo_work_remaining";
        record.reachable_evidence_remaining = "none";
      });
    },
    expected: "incubated_after_review must use blocker_type evidence_based",
  },
  {
    name: "rejects reachable evidence in terminal candidate readiness",
    mutate: (cwd) => {
      updateCandidateReadiness(cwd, (record) => {
        record.readiness_status = "incubated_after_review";
        record.blocker_type = "evidence_based";
        record.reachable_evidence_remaining = "full filing review";
      });
    },
    expected: "still has reachable evidence remaining after terminal readiness triage",
  },
  {
    name: "rejects incubating candidate without complete dashboard surface status",
    mutate: (cwd) => {
      updateCandidateReadiness(cwd, (record) => {
        record.readiness_status = "incubated_after_review";
        record.dashboard_surface_status = "not_required_rejected";
        record.blocker_type = "evidence_based";
        record.reachable_evidence_remaining = "none";
      });
    },
    expected: "incubated_after_review readiness must use dashboard_surface_status complete",
  },
  {
    name: "rejects not material status with wrong blocker",
    mutate: (cwd) => {
      updateCandidateReadiness(cwd, (record) => {
        record.material_to_current_allocation = false;
        record.readiness_status = "not_material_current_allocation";
        record.blocker_type = "evidence_based";
        record.reachable_evidence_remaining = "none";
      });
    },
    expected: "not_material_current_allocation readiness must use blocker_type not_material_current_allocation",
  },
  {
    name: "rejects hidden same-lane materiality",
    mutate: (cwd) => {
      updateCandidateReadiness(cwd, (record) => {
        record.material_to_current_allocation = false;
        record.readiness_status = "incubated_after_review";
        record.blocker_type = "evidence_based";
        record.reachable_evidence_remaining = "none";
      });
      syncFlyReadinessArtifacts(cwd);
    },
    expected: "is in allocation-relevant lane space_infrastructure but is not material",
  },
  {
    name: "rejects not material same-lane candidate without sprint note",
    mutate: (cwd) => {
      updateCandidateReadiness(cwd, (record) => {
        record.material_to_current_allocation = false;
        record.readiness_status = "not_material_current_allocation";
        record.dashboard_surface_status = "not_required_not_material";
        record.blocker_type = "not_material_current_allocation";
        record.readiness_path = "";
        record.reachable_evidence_remaining = "none";
      });
      syncFlyReadinessArtifacts(cwd);
    },
    expected: "allocation-relevant materiality readiness_path is required",
  },
  {
    name: "rejects material incubating candidate without dashboard analysis",
    mutate: (cwd) => {
      updateYaml(cwd, "research/company-analysis.yml", (doc) => {
        doc.entries = doc.entries.filter((entry) => entry.symbol !== "FLY");
      });
    },
    expected: "is missing research/company-analysis.yml dashboard company-analysis entry",
  },
  {
    name: "rejects material incubating candidate without research universe row",
    mutate: (cwd) => {
      removeSymbolRow(cwd, "research/watchlist.csv", "FLY");
      removeSymbolRow(cwd, "data/market/security_master.csv", "FLY");
      removeSymbolRow(cwd, "data/market/watchlist_prices.csv", "FLY");
      removeSymbolRow(cwd, "data/market/price_history.csv", "FLY");
      removeSymbolRow(cwd, "data/market/technical_snapshots.csv", "FLY");
      removeSymbolRow(cwd, "data/market/company_metrics.csv", "FLY");
      removeSymbolRow(cwd, "research/valuation-states.csv", "FLY");
      removeSymbolRow(cwd, "research/watchlist-cycle-reviews.csv", "FLY");
      updateYaml(cwd, "research/company-analysis.yml", (doc) => {
        doc.entries = doc.entries.filter((entry) => entry.symbol !== "FLY");
      });
      updateYaml(cwd, "research/quality-metrics.yml", (doc) => {
        doc.coverage.watchlist_symbols -= 1;
        doc.coverage.watchlist_symbols_with_current_cycle_review -= 1;
      });
    },
    expected: "current_public_proxies references unknown watchlist symbol FLY",
  },
  {
    name: "rejects material incubating candidate without latest price",
    mutate: (cwd) => {
      removeSymbolRow(cwd, "data/market/watchlist_prices.csv", "FLY");
    },
    expected: "data/market/watchlist_prices.csv is missing tradable symbol FLY",
  },
  {
    name: "rejects material incubating candidate with stale latest price",
    mutate: (cwd) => {
      updateCsvSymbolRow(cwd, "data/market/watchlist_prices.csv", "FLY", (row) => ({
        ...row,
        price_as_of: "1900-01-01",
      }));
    },
    expected: "latest price is older than discovery_scan_max_age_days",
  },
  {
    name: "rejects material incubating candidate without price history",
    mutate: (cwd) => {
      removeSymbolRow(cwd, "data/market/price_history.csv", "FLY");
    },
    expected: "lacks supporting price history for FLY",
  },
  {
    name: "rejects material incubating candidate without valuation state",
    mutate: (cwd) => {
      removeSymbolRow(cwd, "research/valuation-states.csv", "FLY");
    },
    expected: "valuation_states must match research/valuation-states.csv",
  },
  {
    name: "rejects self-reported active filing review coverage",
    mutate: (cwd) => {
      removeSymbolRows(cwd, "research/freshness/events.csv", "RKLB");
    },
    expected: "active_symbols_with_latest_filing_review is",
  },
  {
    name: "rejects newer active SEC filing without latest review",
    mutate: (cwd) => {
      appendCsvRow(cwd, "research/freshness/events.csv", {
        event_id: "2026-05-30-rklb-unreviewed-8k-fixture",
        symbol: "RKLB",
        event_date: "2026-05-30",
        event_type: "current_report",
        source_type: "sec_filing",
        source_url: "https://www.sec.gov/Archives/edgar/data/1819994/000181999426000099/rklb-20260530.htm",
        source_published_at: "2026-05-30",
        retrieved_at: "2026-05-31",
        first_seen_at: "2026-05-31",
        severity: "medium",
        status: "new",
        required_action: "review_latest_sec_filing_before_buy_eligibility",
        reviewed_at: "",
        review_path: "",
        immaterial_reason: "",
        notes: "Fixture latest SEC filing is not reviewed.",
      });
    },
    expected: "open_freshness_events must match research/freshness/events.csv",
  },
  {
    name: "rejects material incubating candidate without reviewed freshness event",
    mutate: (cwd) => {
      removeSymbolRow(cwd, "research/freshness/events.csv", "FLY");
    },
    expected: "is missing reviewed research/freshness/events.csv filing or freshness event",
  },
  {
    name: "rejects missing required discovery source family",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.source_coverage.source_families_checked = doc.source_coverage.source_families_checked
          .filter((family) => family.family_id !== "market_data");
      });
    },
    expected: "complete broad_current_world_search must include source family market_data",
  },
  {
    name: "rejects incomplete first layer discovery status",
    mutate: (cwd) => {
      updateYaml(cwd, "research/quality-metrics.yml", (doc) => {
        doc.discovery_process.first_layer_questions_status = "partial";
      });
    },
    expected: "discovery_process.first_layer_questions_status must be complete",
  },
  {
    name: "rejects missing discovery xhigh role",
    mutate: (cwd) => {
      updateYaml(cwd, "research/quality-metrics.yml", (doc) => {
        doc.discovery_process.completed_xhigh_roles = doc.discovery_process.completed_xhigh_roles
          .filter((role) => role !== "bear_case");
      });
    },
    expected: "discovery_process.resolved_xhigh_roles is missing required role bear_case",
  },
  {
    name: "rejects skipped buy-capable discovery xhigh role",
    mutate: (cwd) => {
      updateYaml(cwd, "research/quality-metrics.yml", (doc) => {
        doc.discovery_process.completed_xhigh_roles = doc.discovery_process.completed_xhigh_roles
          .filter((role) => role !== "bear_case");
        doc.discovery_process.skipped_xhigh_roles.push("bear_case");
      });
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        doc.quality_metrics.discovery_process.completed_xhigh_roles = doc.quality_metrics.discovery_process.completed_xhigh_roles
          .filter((role) => role !== "bear_case");
        doc.quality_metrics.discovery_process.skipped_xhigh_roles.push("bear_case");
      });
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        const role = doc.subagents.required_roles.find((entry) => entry.role === "bear_case");
        role.completed = false;
        role.skip_reason = "not_material_to_request";
      });
    },
    expected: "buy-capable discovery_process.completed_xhigh_roles is missing required role bear_case",
  },
  {
    name: "rejects unknown discovery source id",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.source_coverage.source_families_checked[0].source_ids.push("missing_source_id");
      });
    },
    expected: "references unknown source id missing_source_id",
  },
  {
    name: "rejects stale discovery source retrieval",
    mutate: (cwd) => {
      updateYaml(cwd, "research/sources.yml", (doc) => {
        const source = doc.sources.find((entry) => entry.id === "yss_q1_2026_10q");
        source.retrieved_at = "1900-01-01";
      });
    },
    expected: "retrieved_at is older than discovery_scan_max_age_days for the run",
  },
  {
    name: "rejects evidence packet stale source metadata",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        const source = doc.fresh_sources.find((entry) => entry.id === "yss_q1_2026_10q");
        source.retrieved_at = "1900-01-01";
      });
    },
    expected: "retrieved_at does not match research/sources.yml",
  },
  {
    name: "rejects empty discovery source ids",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.source_coverage.source_families_checked[0].source_ids = [];
      });
    },
    expected: "source_ids must contain at least one entry",
  },
  {
    name: "rejects empty first layer source ids",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.first_layer_bottleneck_questions.what_could_become_scarce.source_ids = [];
      });
    },
    expected: "first_layer_bottleneck_questions.what_could_become_scarce source_ids must contain at least one entry",
  },
  {
    name: "rejects empty subagent evidence list",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.subagents.required_roles[0].sources_checked = [];
      });
    },
    expected: "subagents.required_roles[0] sources_checked must contain at least one entry",
  },
  {
    name: "rejects missing material readiness sprint",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.readiness_sprints = doc.readiness_sprints.slice(1);
      });
    },
    expected: "readiness_sprints is missing material scoped readiness symbol",
  },
  {
    name: "rejects hollow readiness sprint note",
    mutate: (cwd) => {
      writeFileSync(
        path.join(cwd, "research/discovery/readiness/2026-05-31-FLY-readiness.md"),
        [
          "# FLY Discovery Readiness Sprint",
          "",
          "```yaml",
          "symbol: FLY",
          "review_date: 2026-05-31",
          "readiness_status: incubated_after_review",
          "blocker_type: evidence_based",
          "classification: incubate",
          "dashboard_surface_status: complete",
          "readiness_index_record: research/discovery/candidate-readiness.yml",
          "source_ids: []",
          "```",
          "",
          "## Bottleneck Fit",
          "## Evidence Gathered",
          "## Analysis",
          "## Decision",
          "reachable_evidence_remaining: none",
          "same_lane_peers:",
          "valuation_and_entry_state:",
          "required_durable_updates:",
        ].join("\n"),
      );
    },
    expected: "readiness metadata.source_ids must contain at least one entry",
  },
  {
    name: "rejects invalid alternate latest agentic discovery path",
    mutate: (cwd) => {
      cpSync(
        path.join(cwd, latestAgenticDiscoveryPath(cwd)),
        path.join(cwd, "research/discovery/runs/bad-agentic-discovery.yml"),
      );
      updateYaml(cwd, "research/discovery/runs/bad-agentic-discovery.yml", (doc) => {
        doc.source_coverage.source_families_checked = doc.source_coverage.source_families_checked
          .filter((family) => family.family_id !== "market_data");
      });
      updateYaml(cwd, "research/quality-metrics.yml", (doc) => {
        doc.discovery_process.latest_agentic_discovery_path = "research/discovery/runs/bad-agentic-discovery.yml";
      });
    },
    expected: "complete broad_current_world_search must include source family market_data",
  },
  {
    name: "rejects partial issuer profile scan used as broad evidence",
    mutate: (cwd) => {
      const outputSha256 = writePartialProfileScan(cwd);
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.source_coverage.deterministic_commands = [{
          command: "npm run discover:universe -- --dry-run --profile-input partial-profile-scan.json",
          dry_run: true,
          output_path: "research/discovery/runs/partial-profile-scan.json",
          output_sha256: outputSha256,
          retrieved_at: "2026-05-31",
          profile_coverage_scope: "partial_requested_symbols",
          profile_coverage_status: "targeted_partial",
          profile_requested_symbols: ["ARCD"],
          targeted_scope_acknowledged: true,
          targeted_scope_reason: "fixture intentionally tests the broad-evidence guard",
          result_summary: "Targeted profile scan must not satisfy broad universe freshness.",
        }];
      });
    },
    expected: "has no matching broad deterministic command output",
  },
  {
    name: "rejects legacy broad deterministic output without audit metadata",
    mutate: (cwd) => {
      const content = `${JSON.stringify({
        schema_version: 1,
        as_of: "2026-05-31",
        candidate_count: 1,
        candidates: [],
      }, null, 2)}\n`;
      writeFileSync(path.join(cwd, "research/discovery/runs/legacy-scan.json"), content);
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        Object.assign(doc.source_coverage.deterministic_commands[0], {
          output_path: "research/discovery/runs/legacy-scan.json",
          output_sha256: createHash("sha256").update(content).digest("hex"),
        });
      });
    },
    expected: "generated_at is required",
  },
  {
    name: "rejects truncated broad deterministic output as freshness evidence",
    mutate: (cwd) => {
      const outputSha256 = writeBroadScan(cwd, "truncated-scan.json", {
        omitted_candidate_count: 1,
        omitted_candidates: [{ symbol: "OMIT" }],
        truncated: true,
      });
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        Object.assign(doc.source_coverage.deterministic_commands[0], {
          output_path: "research/discovery/runs/truncated-scan.json",
          output_sha256: outputSha256,
        });
      });
    },
    expected: "broad universe freshness requires a non-truncated deterministic scan artifact",
  },
  {
    name: "rejects broad deterministic output with known proxy recall misses",
    mutate: (cwd) => {
      const outputSha256 = writeBroadScan(cwd, "recall-miss-scan.json", {
        recall_expected_proxy_miss_count: 1,
      });
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        Object.assign(doc.source_coverage.deterministic_commands[0], {
          output_path: "research/discovery/runs/recall-miss-scan.json",
          output_sha256: outputSha256,
        });
      });
    },
    expected: "broad universe freshness has known public proxy recall misses",
  },
  {
    name: "rejects unanchored discovery JSON artifact",
    mutate: (cwd) => {
      writeBroadScan(cwd, "unanchored-scan.json", {});
    },
    expected: "is not hash-anchored by an agentic run, evidence packet, SEC filing index, or discovery artifact index",
  },
  {
    name: "rejects discovery artifact index hash mismatch",
    mutate: (cwd) => {
      updateJson(cwd, "research/discovery/runs/2026-06-01-discovery-artifact-index.json", (doc) => {
        doc.artifacts[0].sha256 = "0".repeat(64);
      });
    },
    expected: "hash anchor does not match current artifact content",
  },
  {
    name: "rejects discovery artifact index csv hash mismatch",
    mutate: (cwd) => {
      writeFileSync(
        path.join(cwd, "research/discovery/runs/2026-06-01-sec-filing-manifest.csv"),
        "symbol,cik\nBROKEN,0000000000\n",
      );
    },
    expected: "hash anchor does not match current artifact content",
  },
  {
    name: "rejects discovery artifact index as-of mismatch",
    mutate: (cwd) => {
      updateJson(cwd, "research/discovery/runs/2026-06-01-discovery-artifact-index.json", (doc) => {
        doc.as_of = "2026-06-02";
      });
    },
    expected: "as_of must match filename date 2026-06-01",
  },
  {
    name: "rejects discovery artifact index path date mismatch",
    mutate: (cwd) => {
      updateJson(cwd, "research/discovery/runs/2026-06-01-discovery-artifact-index.json", (doc) => {
        doc.artifacts[0].path = "research/discovery/runs/2026-05-31-universe-scan.json";
      });
    },
    expected: "path must start with research/discovery/runs/2026-06-01-",
  },
  {
    name: "rejects discovery artifact index unsupported role",
    mutate: (cwd) => {
      updateJson(cwd, "research/discovery/runs/2026-06-01-discovery-artifact-index.json", (doc) => {
        doc.artifacts[0].role = "unsupported_role";
      });
    },
    expected: "has unsupported value unsupported_role",
  },
  {
    name: "rejects discovery artifact index wrong role",
    mutate: (cwd) => {
      updateJson(cwd, "research/discovery/runs/2026-06-01-discovery-artifact-index.json", (doc) => {
        const entry = doc.artifacts.find((artifact) => artifact.path.endsWith("2026-06-01-profile-enriched-scan.json"));
        entry.role = "generated_discovery_artifact";
      });
    },
    expected: "role must be profile_or_profile_scan_artifact",
  },
  {
    name: "rejects discovery artifact index internal as-of mismatch",
    mutate: (cwd) => {
      const target = "research/discovery/runs/2026-06-01-profile-enriched-scan.json";
      updateJson(cwd, target, (doc) => {
        doc.as_of = "1900-01-01";
      });
      const nextHash = createHash("sha256").update(readFileSync(path.join(cwd, target), "utf8")).digest("hex");
      updateJson(cwd, "research/discovery/runs/2026-06-01-discovery-artifact-index.json", (doc) => {
        const entry = doc.artifacts.find((artifact) => artifact.path === target);
        entry.sha256 = nextHash;
      });
    },
    expected: "JSON as_of must match index date 2026-06-01",
  },
  {
    name: "rejects rogue discovery artifact index name",
    mutate: (cwd) => {
      writeFileSync(
        path.join(cwd, "research/discovery/runs/fake-self-index.json"),
        `${JSON.stringify({
          schema_version: 1,
          source: "discovery_artifact_index",
          generated_at: "2026-06-01T00:00:00.000Z",
          as_of: "2026-06-01",
          artifacts: [],
        }, null, 2)}\n`,
      );
    },
    expected: "has source discovery_artifact_index but is not named YYYY-MM-DD-discovery-artifact-index.json",
  },
  {
    name: "rejects discovery artifact index self anchor",
    mutate: (cwd) => {
      updateJson(cwd, "research/discovery/runs/2026-06-01-discovery-artifact-index.json", (doc) => {
        doc.artifacts.push({
          path: "research/discovery/runs/2026-06-01-discovery-artifact-index.json",
          sha256: "0".repeat(64),
          role: "self_anchor",
        });
      });
    },
    expected: "must not anchor discovery artifact index files",
  },
  {
    name: "rejects discovery artifact index nested profile retrieved date mismatch",
    mutate: (cwd) => {
      const target = "research/discovery/runs/2026-06-01-profile-input.json";
      updateJson(cwd, target, (doc) => {
        doc.profiles[0].retrieved_at = "2026-05-31";
      });
      const nextHash = createHash("sha256").update(readFileSync(path.join(cwd, target), "utf8")).digest("hex");
      updateJson(cwd, "research/discovery/runs/2026-06-01-discovery-artifact-index.json", (doc) => {
        const entry = doc.artifacts.find((artifact) => artifact.path === target);
        entry.sha256 = nextHash;
      });
    },
    expected: "profiles[0] retrieved_at must match index date 2026-06-01",
  },
  {
    name: "rejects malformed registration transaction candidate artifact",
    mutate: (cwd) => {
      writeIndexedJsonArtifact(
        cwd,
        "research/discovery/runs/2026-06-01-registration-transaction-candidates.json",
        {
          schema_version: 1,
          source: "sec_registration_transaction_candidates",
          generated_at: "2026-06-01T00:00:00.000Z",
          as_of: "2026-06-01",
          retrieved_at: "2026-06-01",
          source_published_at: "2026-06-01",
        },
        "sec_registration_transaction_candidate_artifact",
      );
    },
    expected: "coverage_start is required",
  },
  {
    name: "rejects forged registration transaction coverage dates",
    mutate: (cwd) => {
      writeIndexedJsonArtifact(
        cwd,
        "research/discovery/runs/2026-06-01-registration-transaction-candidates.json",
        registrationTransactionArtifactFixture({
          covered_dates: ["2026-05-30"],
          daily_indices: [
            {
              as_of: "2026-05-30",
              input_source: "local_sec_daily_master_index",
              path: "master.2026-05-30.idx",
              url: "",
              sha256: "1".repeat(64),
              row_count: 1,
            },
            {
              as_of: "2026-05-31",
              input_source: "local_sec_daily_master_index",
              path: "master.2026-05-31.idx",
              url: "",
              sha256: "2".repeat(64),
              row_count: 1,
            },
          ],
        }),
        "sec_registration_transaction_candidate_artifact",
      );
    },
    expected: "covered_dates must match daily_indices as_of values",
  },
  {
    name: "rejects impossible registration transaction calendar date",
    mutate: (cwd) => {
      writeIndexedJsonArtifact(
        cwd,
        "research/discovery/runs/2026-06-01-registration-transaction-candidates.json",
        registrationTransactionArtifactFixture({
          coverage_end: "2026-02-31",
        }),
        "sec_registration_transaction_candidate_artifact",
      );
    },
    expected: "coverage_end must be a valid YYYY-MM-DD calendar date",
  },
  {
    name: "rejects impossible registration transaction generated timestamp date",
    mutate: (cwd) => {
      writeIndexedJsonArtifact(
        cwd,
        "research/discovery/runs/2026-06-01-registration-transaction-candidates.json",
        registrationTransactionArtifactFixture({
          generated_at: "2026-02-31T00:00:00.000Z",
        }),
        "sec_registration_transaction_candidate_artifact",
      );
    },
    expected: "generated_at date must be a valid YYYY-MM-DD calendar date",
  },
  {
    name: "rejects strict registration transaction artifact with missing dates",
    mutate: (cwd) => {
      writeIndexedJsonArtifact(
        cwd,
        "research/discovery/runs/2026-06-01-registration-transaction-candidates.json",
        registrationTransactionArtifactFixture({
          strict_date_coverage: true,
          covered_dates: ["2026-05-30"],
          missing_or_unscanned_dates: ["2026-05-31"],
          daily_index_sha256: "1".repeat(64),
          daily_indices: [
            {
              as_of: "2026-05-30",
              input_source: "local_sec_daily_master_index",
              path: "master.2026-05-30.idx",
              url: "",
              sha256: "1".repeat(64),
              row_count: 1,
            },
          ],
        }),
        "sec_registration_transaction_candidate_artifact",
      );
    },
    expected: "strict_date_coverage cannot have missing_or_unscanned_dates",
  },
  {
    name: "rejects forged complete issuer profile scan counts",
    mutate: (cwd) => {
      const outputSha256 = writeCompleteProfileScan(cwd, {
        profile_coverage_gap_count: 1,
        profile_coverage_ratio: 0.5,
        issuer_profile_semantic_gap_count: 1,
        issuer_profile_semantic_coverage_ratio: 0.5,
        profile_symbol_count: 1,
      });
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.source_coverage.deterministic_commands.push({
          command: "npm run discover:universe -- --dry-run --profile-input complete-profile-scan.json",
          dry_run: true,
          output_path: "research/discovery/runs/complete-profile-scan.json",
          output_sha256: outputSha256,
          retrieved_at: doc.run_date,
          profile_coverage_scope: "complete_sec_universe",
          profile_coverage_status: "complete",
          profile_requested_symbols: [],
          result_summary: "Fixture complete issuer profile scan with forged counts.",
        });
      });
    },
    expected: "complete issuer-universe profile coverage must have zero gap, full ratio, and matching selected/profile/eligible counts",
  },
  {
    name: "rejects forged complete issuer profile scan small universe",
    mutate: (cwd) => {
      const outputSha256 = writeCompleteProfileScan(cwd, {
        sec_input_sha256: "0".repeat(64),
      });
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.source_coverage.deterministic_commands.push({
          command: "npm run discover:universe -- --dry-run --profile-input complete-profile-scan.json",
          dry_run: true,
          output_path: "research/discovery/runs/complete-profile-scan.json",
          output_sha256: outputSha256,
          retrieved_at: doc.run_date,
          profile_coverage_scope: "complete_sec_universe",
          profile_coverage_status: "complete",
          profile_requested_symbols: [],
          result_summary: "Fixture complete issuer profile scan with forged SEC input binding.",
        });
      });
    },
    expected: "does not match broad universe SEC input binding",
  },
  {
    name: "rejects issuer profile scan output hash mismatch",
    mutate: (cwd) => {
      writePartialProfileScan(cwd);
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.source_coverage.deterministic_commands.push({
          command: "npm run discover:universe -- --dry-run --profile-input partial-profile-scan.json",
          dry_run: true,
          output_path: "research/discovery/runs/partial-profile-scan.json",
          output_sha256: "0".repeat(64),
          retrieved_at: doc.run_date,
          profile_coverage_scope: "partial_requested_symbols",
          profile_coverage_status: "targeted_partial",
          profile_requested_symbols: ["ARCD"],
          targeted_scope_acknowledged: true,
          targeted_scope_reason: "fixture intentionally tests output hash mismatch",
          result_summary: "Fixture targeted profile scan with forged output hash.",
        });
      });
    },
    expected: "output_sha256 does not match",
  },
  {
    name: "rejects broad deterministic output hash mismatch",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.source_coverage.deterministic_commands[0].output_sha256 = "0".repeat(64);
      });
    },
    expected: "output_sha256 does not match",
  },
  {
    name: "rejects missing unknown future review",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        delete doc.unknown_future_review;
      });
    },
    expected: "unknown_future_review.exploratory_match_count must be a finite number",
  },
  {
    name: "rejects unknown future review count mismatch",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.unknown_future_review.exploratory_match_count = 1;
      });
    },
    expected: "unknown_future_review.exploratory_match_count must match deterministic exploratory matches",
  },
  {
    name: "rejects missing derived allocation-relevant lane",
    mutate: (cwd) => {
      updateYaml(cwd, "research/quality-metrics.yml", (doc) => {
        doc.discovery_process.allocation_relevant_lanes = doc.discovery_process.allocation_relevant_lanes
          .filter((lane) => lane !== "direct_to_device_connectivity");
      });
    },
    expected: "allocation_relevant_lanes is missing derived allocation-relevant lane direct_to_device_connectivity",
  },
  {
    name: "rejects current buy-zone symbol missing from lane proxies",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/lanes.yml", (doc) => {
        const lane = doc.lanes.find((entry) => entry.id === "space_infrastructure");
        lane.current_public_proxies = lane.current_public_proxies.filter((symbol) => symbol !== "RKLB");
      });
    },
    expected: "current in-buy-zone symbol RKLB is missing from discovery lane current_public_proxies",
  },
  {
    name: "rejects discovery run evidence packet mismatch",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.subagent_evidence_packet_path = "research/discovery/runs/other-packet.yml";
      });
    },
    expected: "subagent_evidence_packet_path must match research/quality-metrics.yml discovery_process.latest_evidence_packet_path",
  },
  {
    name: "rejects missing subagent evidence packet",
    mutate: (cwd) => {
      updateYaml(cwd, "research/quality-metrics.yml", (doc) => {
        doc.discovery_process.latest_evidence_packet_path = "research/discovery/runs/missing-evidence-packet.yml";
      });
    },
    expected: "discovery_process.latest_evidence_packet_path does not exist",
  },
  {
    name: "rejects evidence packet readiness mismatch",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        doc.candidate_readiness[0].readiness_status = "completed";
      });
    },
    expected: "candidate_readiness[0] readiness_status does not match research/discovery/candidate-readiness.yml",
  },
  {
    name: "rejects missing evidence packet readiness record",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        doc.candidate_readiness = doc.candidate_readiness.filter((record) => record.symbol !== "FLY");
      });
    },
    expected: "candidate_readiness is missing scoped readiness symbol FLY",
  },
  {
    name: "rejects evidence packet missing open candidate",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        doc.candidate_set = [];
        doc.candidate_readiness = [];
      });
    },
    expected: "candidate_set must contain exactly the open discovery candidates",
  },
  {
    name: "rejects evidence packet missing scan payload summary",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        const output = firstDeterministicOutput(doc);
        output.scan_payload_summary = null;
      });
    },
    expected: "scan_payload_summary is required for discovery scan outputs",
  },
  {
    name: "rejects evidence packet mutated scan candidate summary",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        const output = firstDeterministicOutput(doc);
        output.scan_payload_summary.returned_candidates[0].deterministic_priority = "low";
      });
    },
    expected: "deterministic_priority must match deterministic output",
  },
  {
    name: "rejects evidence packet mutated recall diagnostic",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        const output = firstDeterministicOutput(doc);
        output.scan_payload_summary.recall_diagnostics[0].status = "missed_expected_lane";
      });
    },
    expected: "status must match deterministic output",
  },
  {
    name: "rejects evidence packet missing research-only watchlist row",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        doc.active_watchlist = doc.active_watchlist.filter((record) => record.symbol !== "RDW");
      });
    },
    expected: "active_watchlist RDW is missing non-removed watchlist symbol",
  },
  {
    name: "rejects forked subagent evidence packet default",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        doc.subagent_defaults.independent_context = false;
      });
    },
    expected: "subagent_defaults.independent_context must be true",
  },
  {
    name: "rejects evidence packet wrong readiness scope",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        doc.quality_metrics.decision_readiness.scope = "repository_and_broker_information";
      });
    },
    expected: "quality_metrics.decision_readiness must match deterministic output",
  },
  {
    name: "rejects evidence packet stale freshness window",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        doc.freshness_window.universe_scan_as_of = "1900-01-01";
      });
    },
    expected: "freshness_window.universe_scan_as_of does not match research/quality-metrics.yml",
  },
  {
    name: "rejects evidence packet stale quality metrics",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        doc.quality_metrics.coverage.watchlist_symbols += 1;
      });
    },
    expected: "quality_metrics.coverage must match deterministic output",
  },
  {
    name: "rejects evidence packet impossible generated timestamp",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        doc.generated_at = "2026-02-31T00:00:00.000Z";
      });
    },
    expected: "generated_at date must be a valid YYYY-MM-DD calendar date",
  },
  {
    name: "rejects evidence packet current date mismatch",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        doc.current_date = "1900-01-01";
      });
    },
    expected: "current_date must match research/quality-metrics.yml as_of",
  },
  {
    name: "rejects evidence packet missing fresh source",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        doc.fresh_sources = doc.fresh_sources.slice(1);
      });
    },
    expected: "fresh_sources must contain exactly research/sources.yml sources",
  },
  {
    name: "rejects evidence packet mutated valuation state",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        doc.valuation_states[0].valuation_state = "cheap";
      });
    },
    expected: "valuation_states must match research/valuation-states.csv",
  },
  {
    name: "rejects evidence packet missing discovery lane summary",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        doc.discovery_lane_summary = doc.discovery_lane_summary.slice(1);
      });
    },
    expected: "discovery_lane_summary must match research/discovery/lanes.yml",
  },
  {
    name: "rejects evidence packet extra open freshness event",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        doc.open_freshness_events.push({
          event_id: "fake-open-event",
          symbol: "RKLB",
          status: "new",
        });
      });
    },
    expected: "open_freshness_events must match research/freshness/events.csv",
  },
  {
    name: "rejects unanchored discovery subagent source id",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.subagents.required_roles[0].sources_checked = ["not_a_source_id"];
      });
    },
    expected: "sources_checked references unknown source id not_a_source_id",
  },
  {
    name: "rejects evidence packet mutated candidate security form",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        const output = firstDeterministicOutput(doc);
        output.scan_payload_summary.returned_candidates[0].security_form = "common_stock";
      });
    },
    expected: "security_form must match deterministic output",
  },
  {
    name: "rejects evidence packet mutated candidate matched fields",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
        const output = firstDeterministicOutput(doc);
        output.scan_payload_summary.returned_candidates[0].matched_fields = [];
      });
    },
    expected: "matched_fields must match deterministic output",
  },
];

try {
  const baseline = makeFixture("baseline");
  const baselineRun = runCheckData(baseline);
  if (baselineRun.status !== 0) {
    throw new Error(`baseline check-data failed:\n${baselineRun.output}`);
  }
  console.log("ok baseline ready fixture passes");

  for (const testCase of positiveTestCases) {
    const cwd = makeFixture(slug(testCase.name));
    testCase.mutate(cwd);
    const result = runCheckData(cwd);
    if (result.status !== 0) {
      throw new Error(`${testCase.name}: expected success, got failure:\n${result.output}`);
    }
    console.log(`ok ${testCase.name}`);
  }

  for (const testCase of testCases) {
    const cwd = makeFixture(slug(testCase.name));
    testCase.mutate(cwd);
    const result = runCheckData(cwd);
    if (result.status === 0) {
      throw new Error(`${testCase.name}: expected failure, got success`);
    }
    if (!result.output.includes(testCase.expected)) {
      throw new Error(`${testCase.name}: expected output to include ${JSON.stringify(testCase.expected)}, got:\n${result.output}`);
    }
    console.log(`ok ${testCase.name}`);
  }
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

function makeFixture(name) {
  const target = path.join(fixtureRoot, name);
  for (const entry of ["AGENTS.md", "CONSTITUTION.md", "PUBLICATION_POLICY.md", "SPEC.md", "data", "decisions", "research"]) {
    cpSync(path.join(repoRoot, entry), path.join(target, entry), {
      recursive: true,
      force: true,
      filter: (source) => !isIgnoredScratchPath(source),
    });
  }
  return target;
}

function isIgnoredScratchPath(source) {
  const relative = path.relative(repoRoot, source).split(path.sep).join("/");
  return relative === "research/cache"
    || relative.startsWith("research/cache/")
    || relative === "research/downloads"
    || relative.startsWith("research/downloads/");
}

function runCheckData(cwd) {
  const result = spawnSync(process.execPath, [checkDataScript], {
    cwd,
    encoding: "utf8",
  });
  return {
    status: result.status,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
  };
}

function updateCandidateReadiness(cwd, mutate) {
  updateYaml(cwd, "research/discovery/candidate-readiness.yml", (doc) => {
    mutate(doc.records[0]);
  });
}

function updateYaml(cwd, relativePath, mutate) {
  const filePath = path.join(cwd, resolveFixtureYamlPath(cwd, relativePath));
  const doc = parseYaml(readFileSync(filePath, "utf8"));
  mutate(doc);
  writeFileSync(filePath, stringifyYaml(doc));
}

function resolveFixtureYamlPath(cwd, relativePath) {
  if (relativePath === "research/discovery/runs/2026-05-31-agentic-discovery.yml") {
    return latestAgenticDiscoveryPath(cwd);
  }
  if (relativePath === "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml") {
    return latestEvidencePacketPath(cwd);
  }
  return relativePath;
}

function latestAgenticDiscoveryPath(cwd) {
  return latestDiscoveryProcessPath(cwd, "latest_agentic_discovery_path");
}

function latestEvidencePacketPath(cwd) {
  return latestDiscoveryProcessPath(cwd, "latest_evidence_packet_path");
}

function latestDiscoveryProcessPath(cwd, field) {
  const qualityMetrics = parseYaml(readFileSync(path.join(cwd, "research/quality-metrics.yml"), "utf8"));
  const value = qualityMetrics.discovery_process?.[field];
  if (typeof value !== "string" || value === "") {
    throw new Error(`Missing quality metrics discovery_process.${field}`);
  }
  return value;
}

function firstDeterministicOutput(doc) {
  const output = doc.deterministic_outputs?.find((entry) =>
    typeof entry?.output_path === "string"
      && entry.output_path.endsWith("universe-scan.json")
      && entry.scan_payload_summary !== undefined,
  );
  if (output === undefined) {
    throw new Error("Missing deterministic universe scan output in evidence packet fixture");
  }
  return output;
}

function updateJson(cwd, relativePath, mutate) {
  const filePath = path.join(cwd, relativePath);
  const doc = JSON.parse(readFileSync(filePath, "utf8"));
  mutate(doc);
  writeFileSync(filePath, `${JSON.stringify(doc, null, 2)}\n`);
}

function writeIndexedJsonArtifact(cwd, relativePath, payload, role) {
  const filePath = path.join(cwd, relativePath);
  const content = `${JSON.stringify(payload, null, 2)}\n`;
  writeFileSync(filePath, content);
  updateJson(cwd, "research/discovery/runs/2026-06-01-discovery-artifact-index.json", (doc) => {
    doc.artifacts.push({
      path: relativePath,
      sha256: createHash("sha256").update(content).digest("hex"),
      role,
    });
  });
}

function appendCsvRow(cwd, relativePath, row) {
  const filePath = path.join(cwd, relativePath);
  const content = readFileSync(filePath, "utf8");
  const lines = content.trimEnd().split("\n");
  const headers = lines[0].split(",");
  const nextLine = headers.map((header) => row[header] ?? "").join(",");
  writeFileSync(filePath, `${lines.join("\n")}\n${nextLine}\n`);
}

function registrationTransactionArtifactFixture(overrides) {
  return {
    schema_version: 1,
    source: "sec_registration_transaction_candidates",
    generated_at: "2026-06-01T00:00:00.000Z",
    as_of: "2026-06-01",
    retrieved_at: "2026-06-01",
    source_published_at: "2026-06-01",
    coverage_start: "2026-05-30",
    coverage_end: "2026-05-31",
    covered_dates: ["2026-05-30", "2026-05-31"],
    missing_or_unscanned_dates: [],
    strict_date_coverage: false,
    input_source: "local_sec_daily_master_index_range",
    daily_index_url: "",
    daily_index_sha256: "",
    daily_indices: [
      {
        as_of: "2026-05-30",
        input_source: "local_sec_daily_master_index",
        path: "master.2026-05-30.idx",
        url: "",
        sha256: "1".repeat(64),
        row_count: 1,
      },
      {
        as_of: "2026-05-31",
        input_source: "local_sec_daily_master_index",
        path: "master.2026-05-31.idx",
        url: "",
        sha256: "2".repeat(64),
        row_count: 1,
      },
    ],
    target_filing_families: ["F-1", "S-1"],
    source_row_count: 2,
    provisional_candidate_count: 0,
    provisional_candidates: [],
    caveats: ["Fixture artifact for schema validation."],
    ...overrides,
  };
}

function removeSymbolRow(cwd, relativePath, symbol) {
  const filePath = path.join(cwd, relativePath);
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const symbolColumnIndex = lines[0].split(",").indexOf("symbol");
  if (symbolColumnIndex === -1) {
    throw new Error(`${relativePath} does not have a symbol column`);
  }
  const filtered = lines.filter((line, index) => {
    if (index === 0 || line.trim() === "") {
      return true;
    }
    return line.split(",")[symbolColumnIndex] !== symbol;
  });
  writeFileSync(filePath, filtered.join("\n"));
}

function removeSymbolRows(cwd, relativePath, symbol) {
  const filePath = path.join(cwd, relativePath);
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const symbolColumnIndex = lines[0].split(",").indexOf("symbol");
  if (symbolColumnIndex === -1) {
    throw new Error(`${relativePath} does not have a symbol column`);
  }
  const filtered = lines.filter((line, index) => {
    if (index === 0 || line.trim() === "") {
      return true;
    }
    return line.split(",")[symbolColumnIndex] !== symbol;
  });
  writeFileSync(filePath, filtered.join("\n"));
}

function updateCsvSymbolRow(cwd, relativePath, symbol, mutate) {
  const filePath = path.join(cwd, relativePath);
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const headers = lines[0].split(",");
  const symbolColumnIndex = headers.indexOf("symbol");
  if (symbolColumnIndex === -1) {
    throw new Error(`${relativePath} does not have a symbol column`);
  }
  const updated = lines.map((line, index) => {
    if (index === 0 || line.trim() === "") {
      return line;
    }
    const values = line.split(",");
    if (values[symbolColumnIndex] !== symbol) {
      return line;
    }
    const row = Object.fromEntries(headers.map((header, columnIndex) => [header, values[columnIndex] ?? ""]));
    const next = mutate(row);
    return headers.map((header) => next[header] ?? "").join(",");
  });
  writeFileSync(filePath, updated.join("\n"));
}

function syncFlyReadinessArtifacts(cwd) {
  const readiness = parseYaml(readFileSync(path.join(cwd, "research/discovery/candidate-readiness.yml"), "utf8"));
  const record = readiness.records.find((entry) => entry.symbol === "FLY");
  if (record === undefined) {
    throw new Error("Missing FLY readiness record");
  }
  updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
    const sprint = doc.readiness_sprints.find((entry) => entry.symbol === "FLY");
    if (sprint !== undefined) {
      Object.assign(sprint, {
        material_to_current_allocation: record.material_to_current_allocation,
        readiness_status: record.readiness_status,
        dashboard_surface_status: record.dashboard_surface_status,
        readiness_path: record.readiness_path,
        blocker_type: record.blocker_type,
        reachable_evidence_remaining: record.reachable_evidence_remaining,
      });
    }
  });
  updateYaml(cwd, "research/discovery/runs/2026-05-31-subagent-evidence-packet.yml", (doc) => {
    const packetRecord = doc.candidate_readiness.find((entry) => entry.symbol === "FLY");
    Object.assign(packetRecord, {
      material_to_current_allocation: record.material_to_current_allocation,
      affected_lanes: record.affected_lanes,
      readiness_status: record.readiness_status,
      dashboard_surface_status: record.dashboard_surface_status,
      blocker_type: record.blocker_type,
      reachable_evidence_remaining: record.reachable_evidence_remaining,
      conclusion: record.conclusion,
    });
  });
}

function writePartialProfileScan(cwd) {
  return writeProfileScan(cwd, "partial-profile-scan.json", {
    profile_purpose: "issuer_universe_discovery",
    profile_coverage_status: "targeted_partial",
    profile_coverage_scope: "partial_requested_symbols",
    profile_requested_symbols: ["ARCD"],
    profile_coverage_gap_count: 7574,
    profile_coverage_ratio: 0.000132,
    issuer_profile_coverage_status: "targeted_partial",
    issuer_profile_semantic_gap_count: 7574,
    issuer_profile_semantic_coverage_ratio: 0.000132,
    profile_selected_symbol_count: 1,
    profile_symbol_count: 1,
  });
}

function writeCompleteProfileScan(cwd, overrides) {
  return writeProfileScan(cwd, "complete-profile-scan.json", {
    profile_purpose: "issuer_universe_discovery",
    profile_coverage_status: "complete",
    profile_coverage_scope: "complete_sec_universe",
    profile_requested_symbols: [],
    profile_coverage_gap_count: 0,
    profile_coverage_ratio: 1,
    issuer_profile_coverage_status: "complete",
    issuer_profile_semantic_gap_count: 0,
    issuer_profile_semantic_coverage_ratio: 1,
    ...overrides,
  });
}

function writeProfileScan(cwd, fileName, payload) {
  const baseline = JSON.parse(readFileSync(path.join(cwd, baselineUniverseScanPath(cwd)), "utf8"));
  const completeCount = baseline.sec_input_eligible_universe_count;
  const content = `${JSON.stringify({
    ...broadScanPayload(cwd),
    profile_selected_symbol_count: completeCount,
    profile_eligible_universe_count: completeCount,
    profile_symbol_count: completeCount,
    ...payload,
  }, null, 2)}\n`;
  writeFileSync(
    path.join(cwd, "research/discovery/runs", fileName),
    content,
  );
  return createHash("sha256").update(content).digest("hex");
}

function writeBroadScan(cwd, fileName, overrides) {
  const content = `${JSON.stringify({
    ...broadScanPayload(cwd),
    ...overrides,
  }, null, 2)}\n`;
  writeFileSync(
    path.join(cwd, "research/discovery/runs", fileName),
    content,
  );
  return createHash("sha256").update(content).digest("hex");
}

function broadScanPayload(cwd) {
  const baseline = JSON.parse(readFileSync(path.join(cwd, baselineUniverseScanPath(cwd)), "utf8"));
  return {
    schema_version: 1,
    generated_at: `${baseline.as_of}T12:00:00.000Z`,
    as_of: baseline.as_of,
    discovery_scope: "active_emerging_incubating",
    source_url: baseline.source_url,
    sec_input_source: baseline.sec_input_source,
    sec_input_fetched_at: baseline.sec_input_fetched_at,
    sec_input_row_count: baseline.sec_input_row_count,
    sec_input_eligible_universe_count: baseline.sec_input_eligible_universe_count,
    sec_input_sha256: baseline.sec_input_sha256,
    input_path: "",
    lane_map_path: "research/discovery/lanes.yml",
    lane_map_as_of: baseline.lane_map_as_of,
    lane_map_sha256: createHash("sha256").update(readFileSync(path.join(cwd, "research/discovery/lanes.yml"), "utf8")).digest("hex"),
    profile_coverage_status: "not_applicable_no_profile_input",
    profile_coverage_gap_count: 0,
    profile_coverage_ratio: 0,
    issuer_profile_coverage_status: "absent_name_ticker_only",
    issuer_profile_semantic_gap_count: baseline.sec_input_eligible_universe_count,
    issuer_profile_semantic_coverage_ratio: 0,
    profile_purpose: "",
    deterministic_limit: 1000,
    known_symbol_count: 0,
    lanes_scanned: [{ id: "space_infrastructure", name: "Space infrastructure", status: "active" }],
    ranking_method: ["fixture"],
    candidates: [{ symbol: "ARCD" }],
    candidate_count: 1,
    returned_candidate_count: 1,
    total_match_count: 1,
    omitted_candidate_count: 0,
    omitted_candidates: [],
    suppressed_known_match_count: 0,
    suppressed_known_matches: [],
    exploratory_match_count: 0,
    exploratory_matches: [],
    recall_diagnostics: [],
    recall_expected_lane_miss_count: 0,
    recall_expected_proxy_miss_count: 0,
    recall_organic_expected_proxy_count: 0,
    recall_organic_expected_proxy_miss_count: 0,
    recall_organic_expected_proxy_status: "not_applicable_no_expected_public_proxies",
    recall_ticker_only_expected_proxy_count: 0,
    recall_ticker_only_expected_proxy_symbols: [],
    truncated: false,
  };
}

function baselineUniverseScanPath(cwd) {
  const qualityMetrics = parseYaml(readFileSync(path.join(cwd, "research/quality-metrics.yml"), "utf8"));
  const asOf = qualityMetrics.coverage?.universe_scan_as_of;
  if (typeof asOf !== "string" || asOf === "") {
    throw new Error("Missing quality metrics coverage.universe_scan_as_of");
  }
  const scanPath = `research/discovery/runs/${asOf}-universe-scan.json`;
  if (!readFileSync(path.join(cwd, scanPath), "utf8")) {
    throw new Error(`Missing baseline universe scan fixture ${scanPath}`);
  }
  return scanPath;
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
