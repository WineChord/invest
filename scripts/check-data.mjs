import { readFileSync } from "node:fs";
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
  "research/sources.yml",
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

for (const file of csvFiles) {
  const rows = parseCsv(readFileSync(file, "utf8"));
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
  parseYaml(readFileSync(file, "utf8"));
  console.log(`ok ${file}`);
}
