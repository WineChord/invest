import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkDataScript = path.join(repoRoot, "scripts/check-data.mjs");
const fixtureRoot = mkdtempSync(path.join(tmpdir(), "invest-watchlist-cycle-gates-"));

const testCases = [
  {
    name: "rejects missing watchlist cycle review",
    mutate: (cwd) => {
      removeSymbolRow(cwd, "research/watchlist-cycle-reviews.csv", "FLY");
    },
    expected: "research/watchlist-cycle-reviews.csv is missing current cycle review for FLY",
  },
  {
    name: "rejects stale watchlist cycle review",
    mutate: (cwd) => {
      updateCsvSymbolRow(cwd, "research/watchlist-cycle-reviews.csv", "FLY", (row) => ({
        ...row,
        reviewed_at: "2026-05-30",
      }));
    },
    expected: "research/quality-metrics.yml watchlist_symbols_with_current_cycle_review is",
  },
  {
    name: "rejects watchlist trigger mismatch",
    mutate: (cwd) => {
      updateCsvSymbolRow(cwd, "research/watchlist-cycle-reviews.csv", "FLY", (row) => ({
        ...row,
        next_review_trigger: "different trigger",
      }));
    },
    expected: "latest review for FLY does not match research/watchlist.csv next_review_trigger",
  },
  {
    name: "rejects stale active buy-zone row",
    mutate: (cwd) => {
      updateCsvSymbolRow(cwd, "research/buy-zones.csv", "RKLB", (row) => ({
        ...row,
        as_of: "2026-05-30",
      }));
    },
    expected: "research/buy-zones.csv buy-zone row is not current for active symbol RKLB",
  },
  {
    name: "rejects watchlist missing next review trigger",
    mutate: (cwd) => {
      updateCsvSymbolRow(cwd, "research/watchlist.csv", "FLY", (row) => ({
        ...row,
        next_review_trigger: "",
      }));
    },
    expected: "next_review_trigger is required",
  },
  {
    name: "rejects stale active thesis count",
    mutate: (cwd) => {
      updateCsvSymbolRow(cwd, "research/watchlist.csv", "RKLB", (row) => ({
        ...row,
        latest_baseline_date: "2026-01-01",
      }));
    },
    expected: "research/quality-metrics.yml stale_theses_over_90_days is 0, expected 1",
  },
];

try {
  const baseline = makeFixture("baseline");
  const baselineRun = runCheckData(baseline);
  if (baselineRun.status !== 0) {
    throw new Error(`baseline check-data failed:\n${baselineRun.output}`);
  }
  console.log("ok baseline watchlist-cycle fixture passes");

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
