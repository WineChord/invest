import {
  writeJson,
} from "./semantic-discovery-lib.mjs";
import {
  defaultCommunityCacheDir,
} from "./community-source-lib.mjs";
import {
  defaultCommunityScanPath,
  defaultCommunityTriagePath,
  findPreviousCommunityScan,
  loadCommunityScanForTriage,
  parseCommunityTriageArgs,
  runCommunityLeadTriage,
} from "./community-triage-lib.mjs";

const options = parseCommunityTriageArgs(process.argv.slice(2));
const asOf = options.asOf ?? currentDate();
const scanPath = options.scan ?? defaultCommunityScanPath(
  asOf,
  options.cacheDir ?? defaultCommunityCacheDir,
);
const scanLoad = loadCommunityScanForTriage(scanPath);
const previousScanPath = options.previousScan ?? findPreviousCommunityScan({
  asOf,
  cacheDir: options.cacheDir ?? defaultCommunityCacheDir,
  scanPath,
});
const previousLoad = previousScanPath === undefined
  ? undefined
  : loadCommunityScanForTriage(previousScanPath);
const result = runCommunityLeadTriage({
  asOf,
  highScore: options.highScore,
  mediumScore: options.mediumScore,
  previousScan: previousLoad?.scan,
  previousScanPath: previousLoad?.file ?? "",
  previousScanSha256: previousLoad?.sha256 ?? "",
  scan: scanLoad.scan,
  scanPath: scanLoad.file,
  scanSha256: scanLoad.sha256,
  top: options.top,
});
const outputPath = options.output ?? defaultCommunityTriagePath(
  asOf,
  options.cacheDir ?? defaultCommunityCacheDir,
);

writeJson(outputPath, result);

if (options.json) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else {
  console.log(`Wrote public no-token community triage to ${outputPath}.`);
  console.log(`Leads: ${result.lead_count}. High: ${result.high_priority_leads}. Medium: ${result.medium_priority_leads}.`);
  console.log(`Previous scan: ${result.previous_scan_status}${result.previous_scan_path === "" ? "" : ` (${result.previous_scan_path})`}.`);
  if (result.top_leads.length > 0) {
    const top = result.top_leads
      .slice(0, 10)
      .map((lead) => `${lead.symbol}:${lead.analysis_priority_score}:${lead.triage_class}`)
      .join(", ");
    console.log(`Top community analysis priorities: ${top}`);
  }
  console.log("Community triage changes analysis priority only; it never creates buy eligibility or promotion eligibility.");
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}
