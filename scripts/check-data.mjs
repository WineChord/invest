import { existsSync, readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";

const csvFiles = [
  "data/account/ledger.csv",
  "data/account/positions.csv",
  "data/account/equity_curve.csv",
  "data/market/watchlist_prices.csv",
  "research/watchlist.csv",
];

const yamlFiles = [
  "data/account/plan.yml",
  "data/account/state.yml",
  "research/company-analysis.yml",
  "research/sources.yml",
];

const companyAnalysisFile = "research/company-analysis.yml";
const watchlistFile = "research/watchlist.csv";
const requiredCompanyAnalysisFields = [
  "id",
  "symbol",
  "analyzed_at",
  "analysis_type",
  "policy_version",
  "title",
  "stance",
  "summary",
  "upside_path",
  "risk_watch",
  "next_check",
  "source_path",
];

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

const parsedCsvFiles = new Map();
const parsedYamlFiles = new Map();

for (const file of csvFiles) {
  const rows = parseCsv(readFileSync(file, "utf8"));
  parsedCsvFiles.set(file, rows);
  if (rows.length === 0) {
    throw new Error(`${file} has no header row`);
  }
  const headerWidth = rows[0].length;
  rows.slice(1).forEach((row, index) => {
    if (row.length !== headerWidth) {
      throw new Error(`${file} row ${index + 2} has ${row.length} columns, expected ${headerWidth}`);
    }
  });
  console.log(`ok ${file}`);
}

for (const file of yamlFiles) {
  parsedYamlFiles.set(file, parseYaml(readFileSync(file, "utf8")));
  console.log(`ok ${file}`);
}

validateCompanyAnalysis();

function validateCompanyAnalysis() {
  const watchlistRows = parsedCsvFiles.get(watchlistFile) ?? [];
  const watchlistSymbols = new Set(
    watchlistRows
      .slice(1)
      .map((row) => row[0])
      .filter((symbol) => symbol !== ""),
  );
  const parsed = parsedYamlFiles.get(companyAnalysisFile);
  const entries = Array.isArray(parsed?.entries) ? parsed.entries : null;
  if (entries === null) {
    throw new Error(`${companyAnalysisFile} must contain an entries array`);
  }

  const ids = new Set();
  entries.forEach((entry, index) => {
    const row = entry ?? {};
    requiredCompanyAnalysisFields.forEach((field) => {
      if (typeof row[field] !== "string" || row[field].trim() === "") {
        throw new Error(
          `${companyAnalysisFile} entry ${index + 1} is missing ${field}`,
        );
      }
    });

    if (ids.has(row.id)) {
      throw new Error(`${companyAnalysisFile} has duplicate id ${row.id}`);
    }
    ids.add(row.id);

    if (!watchlistSymbols.has(row.symbol)) {
      throw new Error(
        `${companyAnalysisFile} entry ${row.id} references unknown symbol ${row.symbol}`,
      );
    }

    if (!existsSync(row.source_path)) {
      throw new Error(
        `${companyAnalysisFile} entry ${row.id} references missing source ${row.source_path}`,
      );
    }
  });
  console.log(`ok ${companyAnalysisFile} semantic checks`);
}
