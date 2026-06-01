import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = mkdtempSync(path.join(tmpdir(), "invest-discovery-artifact-index-"));
const runsDir = path.join(fixtureRoot, "runs");
const outputPath = path.join(runsDir, "2026-06-01-discovery-artifact-index.json");

try {
  mkdirSync(runsDir, { recursive: true });
  writeFileSync(path.join(runsDir, "2026-06-01-scan.json"), `${JSON.stringify({
    schema_version: 1,
    as_of: "2026-06-01",
    candidate_count: 0,
  }, null, 2)}\n`);
  writeFileSync(path.join(runsDir, "2026-06-01-profile-input.json"), `${JSON.stringify({
    schema_version: 1,
    source: "fixture_profile_input",
  }, null, 2)}\n`);
  writeFileSync(path.join(runsDir, "2026-06-01-profile-enriched-scan.json"), `${JSON.stringify({
    schema_version: 1,
    source: "fixture_profile_scan",
  }, null, 2)}\n`);
  writeFileSync(path.join(runsDir, "2026-06-01-registration-transaction-candidates.json"), `${JSON.stringify({
    schema_version: 1,
    source: "sec_registration_transaction_candidates",
  }, null, 2)}\n`);
  writeFileSync(path.join(runsDir, "2026-06-01-sec-filing-manifest.csv"), "symbol,cik\nARCD,0000002001\n");
  writeFileSync(path.join(runsDir, "2026-06-01-semantic-packets.json"), "{}\n");
  writeFileSync(path.join(runsDir, "2026-06-01-semantic-batch-manifest.json"), "{}\n");
  mkdirSync(path.join(runsDir, "2026-06-01-semantic-batches"), { recursive: true });
  writeFileSync(path.join(runsDir, "2026-06-01-semantic-batches", "2026-06-01-semantic-0001.json"), "{}\n");
  writeFileSync(path.join(runsDir, "2026-05-31-old-scan.json"), "{}\n");
  writeFileSync(outputPath, "{\"source\":\"old index should be ignored\"}\n");

  run("scripts/build-discovery-artifact-index.mjs", [
    "--as-of",
    "2026-06-01",
    "--runs-dir",
    runsDir,
    "--output",
    outputPath,
    "--generated-at",
    "2026-06-01T00:00:00.000Z",
  ]);

  const index = JSON.parse(readFileSync(outputPath, "utf8"));
  assert(index.schema_version === 1, "artifact index should declare schema version");
  assert(index.source === "discovery_artifact_index", "artifact index should declare source");
  assert(index.as_of === "2026-06-01", "artifact index should preserve as-of date");
  assert(index.generated_at === "2026-06-01T00:00:00.000Z", "artifact index should preserve generated-at timestamp");
  assert(index.artifacts.length === 5, "artifact index should include only matching non-index artifacts");
  assert(!index.artifacts.some((artifact) => artifact.path.endsWith("-discovery-artifact-index.json")), "artifact index should not include itself");
  assert(!index.artifacts.some((artifact) => artifact.path.includes("2026-05-31")), "artifact index should not include other dates");
  assert(!index.artifacts.some((artifact) => artifact.path.endsWith("-semantic-packets.json")), "artifact index should not include cache-only semantic packet artifacts");
  assert(!index.artifacts.some((artifact) => artifact.path.includes("-semantic-batches/")), "artifact index should not include cache-only semantic batch artifacts");
  const scan = index.artifacts.find((artifact) => artifact.path.endsWith("2026-06-01-scan.json"));
  assert(scan !== undefined, "artifact index should include scan artifact");
  assert(scan.role === "deterministic_scan_artifact", "artifact index should classify scan artifacts");
  assert(scan.sha256 === fileSha256(path.join(runsDir, "2026-06-01-scan.json")), "artifact index should hash scan artifact");
  const profileScan = index.artifacts.find((artifact) => artifact.path.endsWith("2026-06-01-profile-enriched-scan.json"));
  assert(profileScan !== undefined, "artifact index should include profile-enriched scan artifact");
  assert(profileScan.role === "profile_or_profile_scan_artifact", "artifact index should classify profile-enriched scan artifacts before generic scans");
  const registrationTransaction = index.artifacts.find((artifact) => artifact.path.endsWith("2026-06-01-registration-transaction-candidates.json"));
  assert(registrationTransaction !== undefined, "artifact index should include registration/transaction candidate artifacts");
  assert(registrationTransaction.role === "sec_registration_transaction_candidate_artifact", "artifact index should classify registration/transaction artifacts");

  runExpectFailure("scripts/build-discovery-artifact-index.mjs", [
    "--as-of",
    "not-a-date",
    "--runs-dir",
    runsDir,
  ], "--as-of must use YYYY-MM-DD");

  runExpectFailure("scripts/build-discovery-artifact-index.mjs", [
    "--as-of",
    "2026-06-01",
    "--runs-dir",
    runsDir,
    "--output",
    path.join(runsDir, "2026-06-02-discovery-artifact-index.json"),
  ], "--output must be named 2026-06-01-discovery-artifact-index.json");

  runExpectFailure("scripts/build-discovery-artifact-index.mjs", [
    "--as-of",
    "2026-06-01",
    "--runs-dir",
    runsDir,
    "--generated-at",
    "2026-02-31T00:00:00.000Z",
  ], "--generated-at date must be a valid calendar date");

  const emptyDir = path.join(fixtureRoot, "empty-runs");
  mkdirSync(emptyDir, { recursive: true });
  runExpectFailure("scripts/build-discovery-artifact-index.mjs", [
    "--as-of",
    "2026-06-01",
    "--runs-dir",
    emptyDir,
  ], "No discovery artifacts found");

  console.log("ok discovery artifact index builder");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

function run(script, args) {
  const result = spawnSync(process.execPath, [path.join(repoRoot, script), ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`${script} failed:\n${result.stdout}\n${result.stderr}`);
  }
  return result;
}

function runExpectFailure(script, args, expectedMessage) {
  const result = spawnSync(process.execPath, [path.join(repoRoot, script), ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (result.status === 0) {
    throw new Error(`${script} unexpectedly passed`);
  }
  const output = `${result.stdout}\n${result.stderr}`;
  assert(output.includes(expectedMessage), `${script} failure should include ${expectedMessage}`);
}

function fileSha256(file) {
  return createHash("sha256").update(readFileSync(file, "utf8")).digest("hex");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
