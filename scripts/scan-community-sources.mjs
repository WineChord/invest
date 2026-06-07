import path from "node:path";
import {
  writeJson,
} from "./semantic-discovery-lib.mjs";
import {
  defaultCommunityCacheDir,
  loadCommunityLaneMap,
  loadCommunityRepoSymbols,
  loadCommunitySourceConfig,
  parseCommunityScanArgs,
  runCommunitySourceScan,
} from "./community-source-lib.mjs";

const options = parseCommunityScanArgs(process.argv.slice(2));
const config = loadCommunitySourceConfig(options.config);
const laneMap = loadCommunityLaneMap(options.laneMap);
const repoSymbols = loadCommunityRepoSymbols({
  discoveryCandidatesFile: options.discoveryCandidates,
  laneMap,
  securityMasterFile: options.securityMaster,
  watchlistFile: options.watchlist,
});
const asOf = options.asOf ?? currentDate();
const result = await runCommunitySourceScan({
  asOf,
  config: config.parsed,
  configPath: options.config,
  configSha256: config.sha256,
  laneMap,
  maxSampleUrls: options.maxSampleUrls,
  repoSymbols,
});
const outputPath = options.output ?? path.join(
  options.cacheDir ?? defaultCommunityCacheDir,
  asOf,
  `${asOf}-public-community-scan.json`,
);

writeJson(outputPath, result);

if (options.json) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else {
  console.log(`Wrote public no-token community scan to ${outputPath}.`);
  console.log(`Sources checked: ${result.sources_checked.length}. Symbol signals: ${result.symbol_signal_count}. Lane keyword signals: ${result.lane_keyword_signal_count}.`);
  if (result.symbol_signals.length > 0) {
    const top = result.symbol_signals
      .slice(0, 10)
      .map((row) => `${row.symbol}:${row.mention_count}`)
      .join(", ");
    console.log(`Top symbol signals: ${top}`);
  }
  console.log("These are weak discovery leads only; run primary-source review before changing durable candidates or watchlist state.");
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}
