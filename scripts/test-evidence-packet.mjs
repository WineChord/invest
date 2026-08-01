import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";

const result = spawnSync(
  process.execPath,
  ["scripts/build-subagent-evidence-packet.mjs", "--as-of", "2026-07-31"],
  {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  },
);

if (result.status !== 0) {
  throw new Error(result.stderr || result.stdout || "Evidence-packet builder failed");
}

const packet = parseYaml(result.stdout);
const accountState = parseYaml(readFileSync("data/account/state.yml", "utf8"));
const positions = csvRecords("data/account/positions.csv");
const prices = new Map(csvRecords("data/market/watchlist_prices.csv").map((row) => [row.symbol, row]));
const confirmedCash = Number(accountState.confirmed_cash);
const expectedPositionValue = positions.reduce((sum, position) => {
  const price = Number(prices.get(position.symbol)?.price);
  return sum + Number(position.quantity) * price;
}, 0);
const expectedNav = confirmedCash + expectedPositionValue;

assert(closeEnough(packet.portfolio_snapshot.confirmed_cash, confirmedCash), "packet must use current confirmed cash");
assert(closeEnough(packet.portfolio_snapshot.current_position_value, expectedPositionValue), "packet must value current positions from latest completed closes");
assert(closeEnough(packet.portfolio_snapshot.research_nav, expectedNav), "packet NAV must equal current confirmed cash plus current position value");
assert(
  closeEnough(packet.portfolio_snapshot.cash_weight_pct, (confirmedCash / expectedNav) * 100),
  "packet cash weight must use current decision NAV",
);
assert(
  packet.portfolio_snapshot.account_state_as_of === accountState.as_of,
  "packet must disclose the current account-state date",
);
assert(
  typeof packet.portfolio_snapshot.basis_note === "string"
    && packet.portfolio_snapshot.basis_note.includes("not a same-timestamp broker valuation"),
  "packet must disclose its mixed-timestamp decision-snapshot basis",
);

for (const position of packet.current_positions) {
  const expectedPrice = Number(prices.get(position.symbol)?.price);
  const expectedMarketValue = Number(position.quantity) * expectedPrice;
  assert(closeEnough(position.latest_completed_close, expectedPrice), `${position.symbol} close must be current`);
  assert(closeEnough(position.market_value, expectedMarketValue), `${position.symbol} market value must be current`);
  assert(
    closeEnough(position.nav_weight_pct, (expectedMarketValue / expectedNav) * 100),
    `${position.symbol} weight must use current decision NAV`,
  );
  assert(position.price_source !== "", `${position.symbol} must disclose price source`);
  assert(position.price_retrieved_at !== "", `${position.symbol} must disclose price retrieval time`);
}

console.log("Evidence-packet decision snapshot regression checks passed.");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function closeEnough(actual, expected) {
  return Math.abs(Number(actual) - Number(expected)) < 1e-8;
}

function csvRecords(file) {
  const rows = parseCsv(readFileSync(file, "utf8"));
  const header = rows[0] ?? [];
  return rows.slice(1).map((row) =>
    Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""])),
  );
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
