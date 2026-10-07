import { readFileSync } from "node:fs";
import { researchPaydayGate, resolveResearchPayday } from "./research-payday-lib.mjs";

const options = { now: new Date().toISOString(), firstMonth: "2026-11", nominalDay: 4 };
let month;
for (let index = 2; index < process.argv.length; index += 1) {
  const name = process.argv[index];
  const value = process.argv[++index];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value`);
  if (name === "--at") options.now = value;
  else if (name === "--first-month") options.firstMonth = value;
  else if (name === "--day") options.nominalDay = Number(value);
  else if (name === "--completed-file") {
    const state = JSON.parse(readFileSync(value, "utf8"));
    if (!Array.isArray(state.completed_months)) throw new Error("Completion file requires completed_months");
    options.completedMonths = state.completed_months;
  } else if (name === "--month") month = value;
  else throw new Error(`Unknown argument ${name}`);
}
// Read-only scheduling scaffolding: no model, network, email, account or Git writes.
console.log(JSON.stringify(month ? resolveResearchPayday(month, options) : researchPaydayGate(options)));
