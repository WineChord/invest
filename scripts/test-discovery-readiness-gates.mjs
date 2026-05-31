import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkDataScript = path.join(repoRoot, "scripts/check-data.mjs");
const fixtureRoot = mkdtempSync(path.join(tmpdir(), "invest-discovery-gates-"));

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
      updateYaml(cwd, "research/discovery/lanes.yml", (doc) => {
        doc.lanes.forEach((lane) => {
          if (Array.isArray(lane.current_public_proxies)) {
            lane.current_public_proxies = lane.current_public_proxies.filter((symbol) => symbol !== "FLY");
          }
        });
      });
    },
    expected: "is missing research/watchlist.csv research universe row",
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
    expected: "is missing research/valuation-states.csv valuation state",
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
    name: "rejects unknown discovery source id",
    mutate: (cwd) => {
      updateYaml(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml", (doc) => {
        doc.source_coverage.source_families_checked[0].source_ids.push("missing_source_id");
      });
    },
    expected: "references unknown source id missing_source_id",
  },
  {
    name: "rejects invalid alternate latest agentic discovery path",
    mutate: (cwd) => {
      cpSync(
        path.join(cwd, "research/discovery/runs/2026-05-31-agentic-discovery.yml"),
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
    expected: "quality_metrics.decision_readiness.scope must be repository_and_public_observable_information",
  },
];

try {
  const baseline = makeFixture("baseline");
  const baselineRun = runCheckData(baseline);
  if (baselineRun.status !== 0) {
    throw new Error(`baseline check-data failed:\n${baselineRun.output}`);
  }
  console.log("ok baseline ready fixture passes");

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
  for (const entry of ["AGENTS.md", "CONSTITUTION.md", "SPEC.md", "data", "decisions", "research"]) {
    cpSync(path.join(repoRoot, entry), path.join(target, entry), {
      recursive: true,
      force: true,
    });
  }
  return target;
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
  const filePath = path.join(cwd, relativePath);
  const doc = parseYaml(readFileSync(filePath, "utf8"));
  mutate(doc);
  writeFileSync(filePath, stringifyYaml(doc));
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
    Object.assign(sprint, {
      material_to_current_allocation: record.material_to_current_allocation,
      readiness_status: record.readiness_status,
      dashboard_surface_status: record.dashboard_surface_status,
      readiness_path: record.readiness_path,
      blocker_type: record.blocker_type,
      reachable_evidence_remaining: record.reachable_evidence_remaining,
    });
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

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
