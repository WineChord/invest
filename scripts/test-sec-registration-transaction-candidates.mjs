import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptPath = path.join(repoRoot, "scripts/build-sec-registration-transaction-candidates.mjs");
const fixtureRoot = mkdtempSync(path.join(tmpdir(), "invest-sec-registration-transaction-"));
const dailyIndexPath = path.join(fixtureRoot, "master.idx");
const outputPath = path.join(fixtureRoot, "registration-transaction-candidates.json");
const dailyIndexDir = path.join(fixtureRoot, "daily-indexes");
const weekendGapDir = path.join(fixtureRoot, "weekend-gap-indexes");

writeFileSync(
  dailyIndexPath,
  [
    "Description:           Daily Index of EDGAR Dissemination Feed",
    "Last Data Received:    May 31, 2026",
    "Comments: webmaster@sec.gov",
    "",
    "CIK|Company Name|Form Type|Date Filed|Filename",
    "1001|Arcadia Space Systems Inc.|S-1/A|2026-05-31|edgar/data/1001/000100126000001.txt",
    "1002|Borealis SpinCo Inc.|10-12B|2026-05-31|edgar/data/1002/000100226000001.txt",
    "1003|Merger Target Corp.|DEF 14A|2026-05-31|edgar/data/1003/000100326000001.txt",
    "1004|Quantum Transaction Inc.|425|2026-05-31|edgar/data/1004/000100426000001.txt",
    "1005|Ordinary Annual Report Inc.|10-K|2026-05-31|edgar/data/1005/000100526000001.txt",
    "1006|Prospectus Systems Inc.|424B5|2026-05-31|edgar/data/1006/000100626000001.txt",
    "1007|MEF IPO Corp.|S-1MEF|2026-05-31|edgar/data/1007/000100726000001.txt",
  ].join("\n") + "\n",
);
mkdirSync(dailyIndexDir, { recursive: true });
mkdirSync(weekendGapDir, { recursive: true });
writeFileSync(
  path.join(dailyIndexDir, "master.2026-05-30.idx"),
  [
    "CIK|Company Name|Form Type|Date Filed|Filename",
    "2001|Earlier SpinCo Inc.|10-12G|2026-05-30|edgar/data/2001/000200126000001.txt",
  ].join("\n") + "\n",
);
writeFileSync(
  path.join(dailyIndexDir, "master.2026-05-31.idx"),
  [
    "CIK|Company Name|Form Type|Date Filed|Filename",
    "2002|Later IPO Corp.|F-1|2026-05-31|edgar/data/2002/000200226000001.txt",
  ].join("\n") + "\n",
);
writeFileSync(
  path.join(weekendGapDir, "master.2026-05-29.idx"),
  [
    "CIK|Company Name|Form Type|Date Filed|Filename",
    "3001|Friday IPO Corp.|S-1|2026-05-29|edgar/data/3001/000300126000001.txt",
  ].join("\n") + "\n",
);

try {
  const result = run([
    "--as-of",
    "2026-05-31",
    "--retrieved-at",
    "2026-06-01",
    "--daily-index",
    dailyIndexPath,
    "--output",
    outputPath,
  ]);
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(readFileSync(outputPath, "utf8"));
  assert.equal(output.source, "sec_registration_transaction_candidates");
  assert.equal(output.as_of, "2026-05-31");
  assert.equal(output.retrieved_at, "2026-06-01");
  assert.equal(output.input_source, "local_sec_daily_master_index");
  assert.equal(output.coverage_start, "2026-05-31");
  assert.equal(output.coverage_end, "2026-05-31");
  assert.deepEqual(output.covered_dates, ["2026-05-31"]);
  assert.deepEqual(output.missing_or_unscanned_dates, []);
  assert.equal(output.strict_date_coverage, false);
  assert.equal(output.daily_indices.length, 1);
  assert.equal(output.source_row_count, 7);
  assert.equal(output.provisional_candidate_count, 6);
  assert.equal(output.daily_index_sha256.length, 64);
  assert(!JSON.stringify(output).includes(fixtureRoot), "output must not leak local fixture paths");

  const byCompany = new Map(output.provisional_candidates.map((candidate) => [candidate.company_name, candidate]));
  assert.equal(byCompany.get("Arcadia Space Systems Inc.").filing_family, "S-1");
  assert.equal(byCompany.get("Arcadia Space Systems Inc.").filing_type, "S-1/A");
  assert.equal(byCompany.get("Borealis SpinCo Inc.").filing_family, "10-12B");
  assert.equal(byCompany.get("Merger Target Corp.").filing_family, "DEF14A");
  assert.equal(byCompany.get("Quantum Transaction Inc.").filing_family_type, "transaction");
  assert.equal(byCompany.get("Prospectus Systems Inc.").filing_family, "424B");
  assert.equal(byCompany.get("MEF IPO Corp.").filing_family, "S-1");
  assert.equal(byCompany.get("MEF IPO Corp.").filing_type, "S-1MEF");
  assert.equal(
    byCompany.get("Arcadia Space Systems Inc.").tradability_status,
    "not_tradable_until_security_metadata_confirms_policy_eligible_listing",
  );
  assert.equal(
    byCompany.get("Arcadia Space Systems Inc.").required_next_step,
    "triage_registration_transaction_filing_and_confirm_public_security_metadata",
  );
  assert(byCompany.get("Arcadia Space Systems Inc.").source_url.startsWith("https://www.sec.gov/Archives/edgar/data/1001/"));
  assert(!byCompany.has("Ordinary Annual Report Inc."), "non-registration/non-transaction filings should be excluded");

  const rangeResult = run([
    "--as-of",
    "2026-05-31",
    "--daily-index-dir",
    dailyIndexDir,
    "--start-date",
    "2026-05-30",
    "--end-date",
    "2026-05-31",
  ]);
  assert.equal(rangeResult.status, 0, rangeResult.stderr);
  const rangeOutput = JSON.parse(rangeResult.stdout);
  assert.equal(rangeOutput.input_source, "local_sec_daily_master_index_range");
  assert.equal(rangeOutput.coverage_start, "2026-05-30");
  assert.equal(rangeOutput.coverage_end, "2026-05-31");
  assert.deepEqual(rangeOutput.covered_dates, ["2026-05-30", "2026-05-31"]);
  assert.deepEqual(rangeOutput.missing_or_unscanned_dates, []);
  assert.equal(rangeOutput.strict_date_coverage, false);
  assert.equal(rangeOutput.daily_indices.length, 2);
  assert.equal(rangeOutput.provisional_candidate_count, 2);
  assert(rangeOutput.provisional_candidates.some((candidate) => candidate.company_name === "Earlier SpinCo Inc."));
  assert(rangeOutput.provisional_candidates.some((candidate) => candidate.company_name === "Later IPO Corp."));

  const gapResult = run([
    "--as-of",
    "2026-06-01",
    "--daily-index-dir",
    dailyIndexDir,
    "--start-date",
    "2026-05-30",
    "--end-date",
    "2026-06-01",
  ]);
  assert.equal(gapResult.status, 0, gapResult.stderr);
  const gapOutput = JSON.parse(gapResult.stdout);
  assert.deepEqual(gapOutput.covered_dates, ["2026-05-30", "2026-05-31"]);
  assert.deepEqual(gapOutput.missing_or_unscanned_dates, ["2026-06-01"]);

  const weekendGapResult = run([
    "--as-of",
    "2026-05-31",
    "--daily-index-dir",
    weekendGapDir,
    "--start-date",
    "2026-05-29",
    "--end-date",
    "2026-05-31",
  ]);
  assert.equal(weekendGapResult.status, 0, weekendGapResult.stderr);
  const weekendGapOutput = JSON.parse(weekendGapResult.stdout);
  assert.deepEqual(weekendGapOutput.covered_dates, ["2026-05-29"]);
  assert.deepEqual(weekendGapOutput.missing_or_unscanned_dates, ["2026-05-30", "2026-05-31"]);

  const strictGapResult = run([
    "--as-of",
    "2026-05-31",
    "--daily-index-dir",
    weekendGapDir,
    "--start-date",
    "2026-05-29",
    "--end-date",
    "2026-05-31",
    "--strict-date-coverage",
  ]);
  assert.notEqual(strictGapResult.status, 0, "strict date coverage should reject missing dates");
  assert(strictGapResult.stderr.includes("Missing SEC daily master index for 2026-05-30"));

  const customFamilyResult = run([
    "--as-of",
    "2026-05-31",
    "--daily-index",
    dailyIndexPath,
    "--filing-families",
    "S-1",
  ]);
  assert.equal(customFamilyResult.status, 0, customFamilyResult.stderr);
  const customFamilyOutput = JSON.parse(customFamilyResult.stdout);
  assert.equal(customFamilyOutput.provisional_candidate_count, 2);
  assert.deepEqual(
    customFamilyOutput.provisional_candidates.map((candidate) => candidate.company_name).sort(),
    ["Arcadia Space Systems Inc.", "MEF IPO Corp."],
  );

  const emptyFailure = run([
    "--as-of",
    "2026-05-31",
    "--daily-index",
    dailyIndexPath,
    "--filing-families",
    "20-F",
  ]);
  assert.notEqual(emptyFailure.status, 0, "empty output should fail without --allow-empty");
  assert(emptyFailure.stderr.includes("No registration or transaction candidates were emitted"));
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log("SEC registration/transaction candidate tests passed.");

function run(args) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}
