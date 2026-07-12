import {
  buildMacroRegimeSnapshot,
  parseMacroRegimeArgs,
  writeMacroSnapshot,
} from "./macro-regime-lib.mjs";

const options = parseMacroRegimeArgs(process.argv.slice(2));
if (options.help) {
  printHelp();
  process.exit(0);
}

const snapshot = await buildMacroRegimeSnapshot({
  asOf: options.asOf,
  companyMetricsFile: options.companyMetrics,
  financingScoresFile: options.financingScores,
  watchlistFile: options.watchlist,
});

if (!options.dryRun) {
  writeMacroSnapshot(options.output, snapshot);
}

if (options.json) {
  process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
} else if (options.dryRun) {
  console.log(`Built macro regime snapshot for ${snapshot.as_of} without writing.`);
} else {
  console.log(`Wrote macro regime snapshot for ${snapshot.as_of} to ${options.output}.`);
}

function printHelp() {
  console.log(`Usage: node scripts/refresh-macro-regime.mjs [options]

Refresh the public macro and market-regime risk overlay.

Options:
  --as-of YYYY-MM-DD        Snapshot date. Defaults to the current date.
  --company-metrics PATH    Company metrics CSV input.
  --financing-scores PATH   Financing-runway scores CSV input.
  --watchlist PATH          Watchlist CSV input.
  --output PATH             Output CSV path.
  --dry-run                 Build without writing files.
  --json                    Print the snapshot as JSON.
  --help                    Show this help.`);
}
