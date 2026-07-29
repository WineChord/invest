import {
  readFileSync,
} from "node:fs";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import {
  applyStandingContribution,
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
  const plan = parseYaml(readFileSync(options.planFile, "utf8"));
  const ledgerContent = readFileSync(options.ledgerFile, "utf8");
  const stateContent = readFileSync(options.stateFile, "utf8");
  const state = parseYaml(stateContent);
  const createdAt = options.createdAt ?? shanghaiTimestamp();
  const result = applyStandingContribution({
    plan,
    ledgerContent,
    state,
    asOf: options.asOf,
    createdAt,
  });

  if (!options.dryRun && (result.applied_dates.length > 0 || result.state_reconciled)) {
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
    ], { journalFile });
  }
  summary = {
    ok: true,
    status: result.status,
    as_of: result.as_of,
    due_dates: result.due_dates,
    applied_dates: result.applied_dates,
    remaining_due_dates: result.remaining_due_dates,
    existing_dates: result.existing_dates,
    cash_before: result.cash_before,
    cash_after: result.cash_after,
    state_reconciled: result.state_reconciled,
    recovered_transaction: recoveredTransaction,
    dry_run: options.dryRun,
  };
}, { lockFile });

if (options.json) {
  process.stdout.write(`${JSON.stringify(summary)}\n`);
} else {
  process.stdout.write(
    `Standing contribution ${summary.status}; applied ${summary.applied_dates.length}; confirmed cash ${summary.cash_after.toFixed(2)} USD.\n`,
  );
}

function parseArgs(args) {
  const parsed = {
    asOf: shanghaiDate(),
    planFile: "data/account/plan.yml",
    ledgerFile: "data/account/ledger.csv",
    stateFile: "data/account/state.yml",
    createdAt: undefined,
    dryRun: false,
    json: false,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--as-of") {
      parsed.asOf = requiredValue(args, index, arg);
      index += 1;
    } else if (arg === "--plan") {
      parsed.planFile = requiredValue(args, index, arg);
      index += 1;
    } else if (arg === "--ledger") {
      parsed.ledgerFile = requiredValue(args, index, arg);
      index += 1;
    } else if (arg === "--state") {
      parsed.stateFile = requiredValue(args, index, arg);
      index += 1;
    } else if (arg === "--created-at") {
      parsed.createdAt = requiredValue(args, index, arg);
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
