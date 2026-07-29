import { readFileSync } from "node:fs";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import {
  recordStandingContributionConflict,
  validateDateOnly,
} from "./standing-contribution-lib.mjs";
import {
  commitFileTransaction,
  gitControlPath,
  recoverFileTransaction,
  withAccountTransactionLock,
} from "./account-file-transaction.mjs";

const options = parseArgs(process.argv.slice(2));
if (options.asOf > shanghaiDate()) {
  throw new Error(`--as-of ${options.asOf} is in the future for Asia/Shanghai`);
}
const lockFile = gitControlPath("invest-account-transaction.lock");
const journalFile = gitControlPath("invest-account-transaction.json");
let summary;
withAccountTransactionLock(() => {
  const recoveredTransaction = recoverFileTransaction(journalFile, {
    allowedFiles: [options.planFile, options.ledgerFile, options.stateFile],
  });
  const planContent = readFileSync(options.planFile, "utf8");
  const ledgerContent = readFileSync(options.ledgerFile, "utf8");
  const stateContent = readFileSync(options.stateFile, "utf8");
  const result = recordStandingContributionConflict({
    plan: parseYaml(planContent),
    ledgerContent,
    state: parseYaml(stateContent),
    correctsEventId: options.correctsEventId,
    confirmationId: options.confirmationId,
    reason: options.reason,
    asOf: options.asOf,
    createdAt: options.createdAt ?? shanghaiTimestamp(),
  });
  if (!options.dryRun) {
    commitFileTransaction([
      {
        file: options.ledgerFile,
        before: ledgerContent,
        after: result.ledger_content,
      },
      {
        file: options.stateFile,
        before: stateContent,
        after: stringifyYaml(result.state),
      },
      {
        file: options.planFile,
        before: planContent,
        after: stringifyYaml(result.plan),
      },
    ], { journalFile });
  }
  summary = {
    ok: true,
    status: result.status,
    corrected_event_id: result.corrected_event_id,
    correction_event_id: result.correction_event_id,
    cash_before: result.cash_before,
    cash_after: result.cash_after,
    recovered_transaction: recoveredTransaction,
    dry_run: options.dryRun,
  };
}, { lockFile });

if (options.json) {
  process.stdout.write(`${JSON.stringify(summary)}\n`);
} else {
  process.stdout.write(
    `Standing contribution conflict recorded; ${summary.correction_event_id}; authorization paused.\n`,
  );
}

function parseArgs(args) {
  const parsed = {
    asOf: shanghaiDate(),
    planFile: "data/account/plan.yml",
    ledgerFile: "data/account/ledger.csv",
    stateFile: "data/account/state.yml",
    correctsEventId: undefined,
    confirmationId: undefined,
    reason: undefined,
    createdAt: undefined,
    dryRun: false,
    json: false,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const valueFlags = new Map([
      ["--as-of", "asOf"],
      ["--plan", "planFile"],
      ["--ledger", "ledgerFile"],
      ["--state", "stateFile"],
      ["--corrects-event-id", "correctsEventId"],
      ["--confirmation-id", "confirmationId"],
      ["--reason", "reason"],
      ["--created-at", "createdAt"],
    ]);
    if (valueFlags.has(arg)) {
      parsed[valueFlags.get(arg)] = requiredValue(args, index, arg);
      index += 1;
    } else if (arg === "--dry-run") {
      parsed.dryRun = true;
    } else if (arg === "--json") {
      parsed.json = true;
    } else {
      throw new Error(`unsupported argument ${arg}`);
    }
  }
  validateDateOnly(parsed.asOf, "--as-of");
  for (const [field, flag] of [
    ["correctsEventId", "--corrects-event-id"],
    ["confirmationId", "--confirmation-id"],
    ["reason", "--reason"],
  ]) {
    if (parsed[field] === undefined) {
      throw new Error(`${flag} is required`);
    }
  }
  return parsed;
}

function requiredValue(args, index, flag) {
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function shanghaiParts(date = new Date()) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );
}

function shanghaiDate() {
  const parts = shanghaiParts();
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function shanghaiTimestamp() {
  const parts = shanghaiParts();
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+08:00`;
}
