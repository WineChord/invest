import {
  buildMacroRegimeSnapshot,
  parseMacroRegimeArgs,
  writeMacroSnapshot,
} from "./macro-regime-lib.mjs";

const options = parseMacroRegimeArgs(process.argv.slice(2));
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
