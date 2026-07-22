import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkDataScript = path.join(repoRoot, "scripts/check-data.mjs");
const fixtureRoot = mkdtempSync(path.join(tmpdir(), "invest-promotion-gates-"));

const testCases = [
  {
    name: "rejects missing active transition",
    mutate: (cwd) => {
      removeSymbolRow(cwd, "research/watchlist-transitions.csv", "RKLB");
    },
    expected: "research/watchlist-transitions.csv is missing current transition for active symbol RKLB",
  },
  {
    name: "rejects active transition status mismatch",
    mutate: (cwd) => {
      updateCsvSymbolRow(cwd, "research/watchlist-transitions.csv", "RKLB", (row) => ({
        ...row,
        to_status: "watch",
      }));
    },
    expected: "latest transition for RKLB does not match watchlist status active_core_candidate",
  },
  {
    name: "rejects missing core promotion xhigh role",
    mutate: (cwd) => {
      updateCsvSymbolRow(cwd, "research/watchlist-transitions.csv", "RKLB", (row) => ({
        ...row,
        xhigh_roles_completed: "evidence_freshness;valuation_entry;bear_case;opportunity_cost_allocation",
      }));
    },
    expected: "xhigh_roles_completed is missing required role bull_case",
  },
  {
    name: "rejects unresolved promotion conflict",
    mutate: (cwd) => {
      updateCsvSymbolRow(cwd, "research/watchlist-transitions.csv", "RKLB", (row) => ({
        ...row,
        unresolved_conflicts: "1",
      }));
    },
    expected: "unresolved_conflicts must be 0 for a current promotion record",
  },
  {
    name: "rejects missing active buy-zone row",
    mutate: (cwd) => {
      removeSymbolRow(cwd, "research/buy-zones.csv", "RKLB");
    },
    expected: "research/buy-zones.csv is missing buy-zone row for active symbol RKLB",
  },
  {
    name: "rejects unknown buy-zone source id",
    mutate: (cwd) => {
      updateCsvSymbolRow(cwd, "research/buy-zones.csv", "RKLB", (row) => ({
        ...row,
        source_ids: `${row.source_ids};missing_source_id`,
      }));
    },
    expected: "references unknown source id missing_source_id",
  },
  {
    name: "rejects in-buy-zone without staged entry price",
    mutate: (cwd) => {
      updateCsvSymbolRow(cwd, "research/buy-zones.csv", "RKLB", (row) => ({
        ...row,
        max_staged_entry_price: "",
      }));
    },
    expected: "max_staged_entry_price is required",
  },
  {
    name: "rejects in-buy-zone with open high event",
    mutate: (cwd) => {
      updateCsvSymbolRow(cwd, "research/freshness/events.csv", "RKLB", (row) => ({
        ...row,
        severity: "high",
        status: "new",
        reviewed_at: "",
        review_path: "",
        immaterial_reason: "",
      }));
    },
    expected: "cannot be in_buy_zone with open high or critical freshness events",
  },
];

try {
  const baseline = makeFixture("baseline");
  const baselineRun = runCheckData(baseline);
  if (baselineRun.status !== 0) {
    throw new Error(`baseline check-data failed:\n${baselineRun.output}`);
  }
  console.log("ok baseline promotion fixture passes");

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
    });
  }
  mkdirSync(path.join(target, "scripts"), { recursive: true });
  cpSync(
    path.join(repoRoot, "scripts/market-data-merge-lib.mjs"),
    path.join(target, "scripts/market-data-merge-lib.mjs"),
    { force: true },
  );
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

function removeSymbolRow(cwd, relativePath, symbol) {
  const records = readCsvFile(cwd, relativePath);
  records.rows = records.rows.filter((row) => row.symbol !== symbol);
  writeCsvFile(cwd, relativePath, records);
}

function updateCsvSymbolRow(cwd, relativePath, symbol, mutate) {
  const records = readCsvFile(cwd, relativePath);
  records.rows = records.rows.map((row) => (row.symbol === symbol ? mutate(row) : row));
  writeCsvFile(cwd, relativePath, records);
}

function readCsvFile(cwd, relativePath) {
  const content = readFileSync(path.join(cwd, relativePath), "utf8");
  const parsed = parseCsv(content);
  const header = parsed[0];
  return {
    header,
    rows: parsed.slice(1).map((row) =>
      Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""])),
    ),
  };
}

function writeCsvFile(cwd, relativePath, records) {
  const lines = [
    records.header.join(","),
    ...records.rows.map((row) => records.header.map((field) => csvEscape(row[field] ?? "")).join(",")),
  ];
  writeFileSync(path.join(cwd, relativePath), `${lines.join("\n")}\n`);
}

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];
    if (char === "\"") {
      if (quoted && next === "\"") {
        field += "\"";
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.trim() !== "")) {
      rows.push(row);
    }
  }
  return rows;
}

function csvEscape(value) {
  const text = String(value);
  if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
    return `"${text.replaceAll("\"", "\"\"")}"`;
  }
  return text;
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
