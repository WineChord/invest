import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkDataScript = path.join(repoRoot, "scripts/check-data.mjs");
const fixtureRoot = mkdtempSync(path.join(tmpdir(), "invest-promotion-gates-"));

const testCases = [
  ...["tool_unavailable", "not_material_to_request", "already_resolved_by_primary_evidence"].map((reason) => ({
    name: `accepts a bound structured promotion review with ${reason}`,
    mutate: (cwd) => installStructuredReviewerFixture(cwd, reason),
    expected: null,
  })),
  {
    name: "rejects a false completed reviewer claim",
    mutate: (cwd) => {
      installStructuredReviewerFixture(cwd);
      const records = readCsvFile(cwd, "research/watchlist-transitions.csv");
      records.rows.filter((row) => row.symbol === "RKLB").at(-1).xhigh_roles_completed += ";evidence_freshness";
      writeCsvFile(cwd, "research/watchlist-transitions.csv", records);
    },
    expected: "claimed completed reviewer freshness_filing_review is not completed in the linked run",
  },
  {
    name: "rejects a wrong promotion binding despite a full completed-role claim",
    mutate: (cwd) => {
      const file = installStructuredReviewerFixture(cwd);
      const review = parseYaml(readFileSync(file, "utf8"));
      review.promotion_reviews[0].symbol = "GILT";
      writeFileSync(file, stringifyYaml(review));
      const records = readCsvFile(cwd, "research/watchlist-transitions.csv");
      records.rows.filter((row) => row.symbol === "RKLB").at(-1).xhigh_roles_completed = "evidence_freshness;valuation_entry;bull_case;bear_case;opportunity_cost_allocation";
      writeCsvFile(cwd, "research/watchlist-transitions.csv", records);
    },
    expected: "structured promotion review must bind the same symbol and source_path with reviewer records",
  },
  {
    name: "rejects an unsupported structured reviewer skip reason",
    mutate: (cwd) => installStructuredReviewerFixture(cwd, "convenient_to_skip"),
    expected: "structured reviewer freshness_filing_review skip_reason",
  },
  {
    name: "rejects a structured review bound to another decision date",
    mutate: (cwd) => {
      const file = installStructuredReviewerFixture(cwd);
      const review = parseYaml(readFileSync(file, "utf8"));
      review.run_date = "1900-01-01";
      writeFileSync(file, stringifyYaml(review));
    },
    expected: "structured reviewer run_date must match decided_at",
  },
  {
    name: "rejects duplicate aliases for a structured reviewer role",
    mutate: (cwd) => {
      const file = installStructuredReviewerFixture(cwd);
      const review = parseYaml(readFileSync(file, "utf8"));
      review.subagents.required_roles.push({ ...review.subagents.required_roles[0], role: "evidence_freshness" });
      writeFileSync(file, stringifyYaml(review));
    },
    expected: "duplicate structured reviewer role freshness_filing_review",
  },
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
    if (testCase.expected === null) {
      if (result.status !== 0) {
        throw new Error(`${testCase.name}: expected success, got:\n${result.output}`);
      }
      console.log(`ok ${testCase.name}`);
      continue;
    }
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
  for (const entry of [".agents", ".github", "AGENTS.md", "CONSTITUTION.md", "PUBLICATION_POLICY.md", "SPEC.md", "package.json", "data", "decisions", "research", "templates"]) {
    cpSync(path.join(repoRoot, entry), path.join(target, entry), {
      recursive: true,
      force: true,
      filter: (source) => !/^research\/(cache|downloads)(\/|$)/.test(path.relative(repoRoot, source).split(path.sep).join("/")),
    });
  }
  mkdirSync(path.join(target, "scripts"), { recursive: true });
  for (const script of ["check-article-one.mjs", "market-data-merge-lib.mjs"]) {
    cpSync(
      path.join(repoRoot, "scripts", script),
      path.join(target, "scripts", script),
      { force: true },
    );
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

function installStructuredReviewerFixture(cwd, reason = "tool_unavailable") {
  const records = readCsvFile(cwd, "research/watchlist-transitions.csv");
  const row = records.rows.filter((entry) => entry.symbol === "RKLB").at(-1);
  row.xhigh_roles_completed = "bull_case;bear_case";
  row.subagent_review_path = "research/promotion/structured-reviewer-fixture.yml";
  writeCsvFile(cwd, "research/watchlist-transitions.csv", records);
  const file = path.join(cwd, row.subagent_review_path);
  writeFileSync(file, stringifyYaml({
    run_date: row.decided_at,
    promotion_reviews: [{ symbol: row.symbol, review_path: row.source_path }],
    subagents: {
      required_roles: ["freshness_filing_review", "valuation_entry", "allocation_risk", "bull_case", "bear_case"].map((role) => ({
        role,
        reasoning_level: "xhigh",
        independent_context: true,
        completed: role === "bull_case" || role === "bear_case",
        skip_reason: role === "bull_case" || role === "bear_case" ? null : reason,
      })),
    },
  }));
  return file;
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
