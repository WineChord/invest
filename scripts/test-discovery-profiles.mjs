import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = mkdtempSync(path.join(tmpdir(), "invest-discovery-profiles-"));
const fixtureRepo = path.join(fixtureRoot, "repo");
const outputPath = path.join(fixtureRoot, "profiles.json");
const issuerProfileCsvPath = path.join(fixtureRoot, "issuer-profiles.csv");
const issuerOutputPath = path.join(fixtureRoot, "issuer-profiles.json");
const secFilingAutoManifestPath = path.join(fixtureRoot, "sec-filing-auto-manifest.csv");
const secFilingAutoMetadataPath = path.join(fixtureRoot, "sec-filing-auto-manifest.metadata.json");
const secFilingAutoOutputPath = path.join(fixtureRoot, "sec-filing-auto-profiles.json");
const secFilingIndexPrefix = path.join(fixtureRoot, "sec-filing-index");
const secFilingCompleteManifestPath = path.join(fixtureRoot, "sec-filing-complete-manifest.csv");
const secFilingCompleteMetadataPath = path.join(fixtureRoot, "sec-filing-complete-manifest.metadata.json");
const secFilingLatestManifestPath = path.join(fixtureRoot, "sec-filing-latest-manifest.csv");
const secFilingLatestMetadataPath = path.join(fixtureRoot, "sec-filing-latest-manifest.metadata.json");
const secFilingProspectusFallbackManifestPath = path.join(fixtureRoot, "sec-filing-prospectus-fallback-manifest.csv");
const secFilingProspectusFallbackMetadataPath = path.join(fixtureRoot, "sec-filing-prospectus-fallback-manifest.metadata.json");
const secFilingTieBreakManifestPath = path.join(fixtureRoot, "sec-filing-tiebreak-manifest.csv");
const secFilingInvalidRetrievedManifestPath = path.join(fixtureRoot, "sec-filing-invalid-retrieved-manifest.csv");
const secFilingManifestPath = path.join(fixtureRoot, "sec-filing-manifest.csv");
const secFilingNoBusinessManifestPath = path.join(fixtureRoot, "sec-filing-no-business-manifest.csv");
const secFilingNoBusinessOutputPath = path.join(fixtureRoot, "sec-filing-no-business-profiles.json");
const secFilingSupplementOnlyManifestPath = path.join(fixtureRoot, "sec-filing-supplement-only-manifest.csv");
const secFilingSupplementOnlyOutputPath = path.join(fixtureRoot, "sec-filing-supplement-only-profiles.json");
const secFilingProspectusProfileManifestPath = path.join(fixtureRoot, "sec-filing-prospectus-profile-manifest.csv");
const secFilingProspectusProfileOutputPath = path.join(fixtureRoot, "sec-filing-prospectus-profile-profiles.json");
const secFilingS1FalseStartManifestPath = path.join(fixtureRoot, "sec-filing-s1-false-start-manifest.csv");
const secFilingS1FalseStartOutputPath = path.join(fixtureRoot, "sec-filing-s1-false-start-profiles.json");
const secFilingS1SentenceFragmentManifestPath = path.join(fixtureRoot, "sec-filing-s1-sentence-fragment-manifest.csv");
const secFilingS1SentenceFragmentOutputPath = path.join(fixtureRoot, "sec-filing-s1-sentence-fragment-profiles.json");
const secFilingProspectusSentenceFragmentManifestPath = path.join(fixtureRoot, "sec-filing-prospectus-sentence-fragment-manifest.csv");
const secFilingProspectusSentenceFragmentOutputPath = path.join(fixtureRoot, "sec-filing-prospectus-sentence-fragment-profiles.json");
const secFilingOutputPath = path.join(fixtureRoot, "sec-filing-profiles.json");
const secFilingTenKManifestPath = path.join(fixtureRoot, "sec-filing-10k-manifest.csv");
const secFilingTenKOutputPath = path.join(fixtureRoot, "sec-filing-10k-profiles.json");
const secFilingEightKManifestPath = path.join(fixtureRoot, "sec-filing-8k-manifest.csv");
const secFilingEightKAutoManifestPath = path.join(fixtureRoot, "sec-filing-8k-auto-manifest.csv");
const secFilingEightKAutoMetadataPath = path.join(fixtureRoot, "sec-filing-8k-auto-manifest.metadata.json");
const secFilingEightKOutputPath = path.join(fixtureRoot, "sec-filing-8k-profiles.json");
const secFilingSixKManifestPath = path.join(fixtureRoot, "sec-filing-6k-manifest.csv");
const secFilingSixKOutputPath = path.join(fixtureRoot, "sec-filing-6k-profiles.json");
const secFilingS4ManifestPath = path.join(fixtureRoot, "sec-filing-s4-manifest.csv");
const secFilingS4OutputPath = path.join(fixtureRoot, "sec-filing-s4-profiles.json");
const secFilingLocalDir = path.join(fixtureRoot, "sec-filings");
const secFutureSubmissionsDir = path.join(fixtureRoot, "sec-future-submissions");
const secMismatchedSubmissionsDir = path.join(fixtureRoot, "sec-mismatched-submissions");
const secTickerMismatchSubmissionsDir = path.join(fixtureRoot, "sec-ticker-mismatch-submissions");
const secStaleSubmissionsDir = path.join(fixtureRoot, "sec-stale-submissions");
const secFilingLocalPath = path.join(secFilingLocalDir, "CIK0000002001-000000200126000002-arcd-s1a.htm");
const secFilingNoBusinessPath = path.join(fixtureRoot, "arcadia-risk-only-s1.html");
const secFilingSupplementOnlyPath = path.join(fixtureRoot, "arcadia-supplement-only-424b5.html");
const secFilingProspectusProfilePath = path.join(fixtureRoot, "arcadia-prospectus-424b4.html");
const secFilingS1FalseStartPath = path.join(fixtureRoot, "arcadia-s1-false-start.html");
const secFilingS1SentenceFragmentPath = path.join(fixtureRoot, "arcadia-s1-sentence-fragment.html");
const secFilingProspectusSentenceFragmentPath = path.join(fixtureRoot, "arcadia-prospectus-sentence-fragment-424b4.html");
const secFilingTenKPath = path.join(fixtureRoot, "arcadia-10k.html");
const secFilingEightKPath = path.join(secFilingLocalDir, "ARCD-000000200126000003-arcd-8k.htm");
const secFilingSixKPath = path.join(secFilingLocalDir, "ARCD-000000200126000004-arcd-6k.htm");
const secFilingS4Path = path.join(secFilingLocalDir, "ARCD-000000200126000005-arcd-s4.htm");
const secFilingPath = path.join(fixtureRoot, "arcadia-s1.html");
const secSubmissionsDir = path.join(fixtureRoot, "sec-submissions");
const secIssuerCompleteOutputPath = path.join(fixtureRoot, "sec-issuer-complete-profiles.json");
const secIssuerOutputPath = path.join(fixtureRoot, "sec-issuer-profiles.json");
const secCompleteFixturePath = path.join(fixtureRoot, "sec-complete-company-tickers-exchange.json");
const secFixturePath = path.join(fixtureRoot, "sec-company-tickers-exchange.json");
const secTickerMismatchFixturePath = path.join(fixtureRoot, "sec-ticker-mismatch-company-tickers-exchange.json");
const secFixtureCurrentCacheTime = new Date("2026-06-01T00:00:00.000Z");

function touchJsonFilesInDir(dir, timestamp) {
  readdirSync(dir)
    .filter((fileName) => fileName.endsWith(".json"))
    .forEach((fileName) => utimesSync(path.join(dir, fileName), timestamp, timestamp));
}

writeFixtureRepo(fixtureRepo);
writeFileSync(
  secFixturePath,
  `${JSON.stringify({
    fields: ["cik", "name", "ticker", "exchange"],
    data: [
      [1819994, "Rocket Lab Corp", "RKLB", "Nasdaq"],
      [1001, "Orbital Launch Systems Inc.", "OLSI", "Nasdaq"],
      [2001, "Arcadia Systems Inc.", "ARCD", "Nasdaq"],
      [2002, "Borealis Systems Inc.", "BRS", "Nasdaq"],
      [2002, "Borealis Systems Class A Inc.", "BRSA", "Nasdaq"],
      [2003, "Prospectus Systems Inc.", "PRSP", "Nasdaq"],
      [2004, "Supplement Systems Inc.", "SUPP", "Nasdaq"],
      [2005, "Tie Break Systems Inc.", "TIEB", "Nasdaq"],
      [2006, "Unknown Prospectus Systems Inc.", "UNKB", "Nasdaq"],
    ],
  })}\n`,
);
writeFileSync(
  secCompleteFixturePath,
  `${JSON.stringify({
    fields: ["cik", "name", "ticker", "exchange"],
    data: [
      [2001, "Arcadia Systems Inc.", "ARCD", "Nasdaq"],
      [2002, "Borealis Systems Inc.", "BRS", "Nasdaq"],
    ],
  })}\n`,
);
writeFileSync(
  secTickerMismatchFixturePath,
  `${JSON.stringify({
    fields: ["cik", "name", "ticker", "exchange"],
    data: [
      [2007, "Ticker Drift Systems Inc.", "DRFT", "Nasdaq"],
    ],
  })}\n`,
);
writeFileSync(
  issuerProfileCsvPath,
  [
    "symbol,cik,exchange,source_name,source_url,source_published_at,retrieved_at,text",
    "ARCD,0000002001,Nasdaq,issuer fixture,fixture://issuer/arcd,2026-05-30,2026-05-31,\"Arcadia builds CXL memory pooling, retimer, and rack-scale interconnect systems for AI clusters.\"",
  ].join("\n") + "\n",
);
writeFileSync(
  secFilingPath,
  [
    "<html><body>",
    "<nav>Table of Contents Business Risk Factors Management</nav>",
    "<h1>Our Business</h1>",
    "<p>Arcadia Systems builds CXL memory pooling fabrics, retimer modules, and rack-scale interconnect systems for AI clusters.</p>",
    "<h1>Risk Factors</h1>",
    "<p>Execution and customer concentration risks.</p>",
    "</body></html>",
  ].join("\n"),
);
mkdirSync(secFilingLocalDir, { recursive: true });
writeFileSync(
  secFilingLocalPath,
  [
    "<html><body>",
    "<h1>Item 1. Business</h1>",
    "<p>Arcadia Systems builds CXL memory pooling fabrics, retimer modules, and rack-scale interconnect systems for AI clusters.</p>",
    "<h1>Item 1A. Risk Factors</h1>",
    "<p>Execution and customer concentration risks.</p>",
    "</body></html>",
  ].join("\n"),
);
writeFileSync(
  secFilingNoBusinessPath,
  [
    "<html><body>",
    "<nav>Table of Contents Business CXL retimer Risk Factors Management</nav>",
    "<h1>Risk Factors</h1>",
    "<p>We may fail to develop CXL retimer systems or rack-scale interconnect products.</p>",
    "</body></html>",
  ].join("\n"),
);
writeFileSync(
  secFilingS1FalseStartPath,
  [
    "<html><body>",
    "<p>Forward-looking statements include statements about our business plans, anticipated demand, and market trends.</p>",
    "<h1>Our Business</h1>",
    "<p>Arcadia Systems builds CXL memory pooling fabrics, retimer modules, and rack-scale interconnect systems for AI clusters.</p>",
    "<h1>Risk Factors</h1>",
    "<p>Execution and customer concentration risks.</p>",
    "</body></html>",
  ].join("\n"),
);
writeFileSync(
  secFilingS1SentenceFragmentPath,
  [
    "<html><body>",
    "<p>Our business depends on customer adoption, supply availability, and market acceptance.</p>",
    "<h1>Our Business</h1>",
    "<p>Arcadia Systems builds CXL memory pooling fabrics, retimer modules, and rack-scale interconnect systems for AI clusters.</p>",
    "<h1>Risk Factors</h1>",
    "<p>Execution and customer concentration risks.</p>",
    "</body></html>",
  ].join("\n"),
);
writeFileSync(
  secFilingSupplementOnlyPath,
  [
    "<html><body>",
    "<p>This prospectus supplement includes forward-looking statements about our business plans and risk factors.</p>",
    "<p>We may fail to execute our financing plans.</p>",
    "</body></html>",
  ].join("\n"),
);
writeFileSync(
  secFilingProspectusProfilePath,
  [
    "<html><body>",
    "<h1>Prospectus Summary</h1>",
    "<h2>Our Company</h2>",
    "<p>Arcadia Systems provides CXL memory pooling fabrics, retimer modules, and rack-scale interconnect systems for AI clusters.</p>",
    "<h1>Risk Factors</h1>",
    "<p>Execution and customer concentration risks.</p>",
    "</body></html>",
  ].join("\n"),
);
writeFileSync(
  secFilingProspectusSentenceFragmentPath,
  [
    "<html><body>",
    "<p>Our company may not achieve market acceptance or sufficient financing.</p>",
    "<h1>Our Company</h1>",
    "<p>Arcadia Systems provides CXL memory pooling fabrics, retimer modules, and rack-scale interconnect systems for AI clusters.</p>",
    "<h1>Risk Factors</h1>",
    "<p>Execution and customer concentration risks.</p>",
    "</body></html>",
  ].join("\n"),
);
writeFileSync(
  secFilingTenKPath,
  [
    "<html><body>",
    "<p>Forward-looking statements include expectations about our business plans or objectives, market trends, liquidity, cash flows, and risk factors.</p>",
    "<nav>Table of Contents Item 1. Business Item 1A. Risk Factors Item 2. Properties</nav>",
    "<h1>Item 1. Business</h1>",
    "<p>Arcadia Systems designs CXL memory pooling fabrics, retimer modules, and rack-scale interconnect systems for AI clusters.</p>",
    "<h1>Item 1A. Risk Factors</h1>",
    "<p>Execution and customer concentration risks.</p>",
    "</body></html>",
  ].join("\n"),
);
writeFileSync(
  secFilingEightKPath,
  [
    "<html><body>",
    "<h1>Item 1.01 Entry into a Material Definitive Agreement</h1>",
    "<p>Arcadia Systems signed a data-center interconnect supply agreement for CXL memory pooling and retimer modules.</p>",
    "<h1>Item 9.01 Financial Statements and Exhibits</h1>",
    "<p>Exhibit index.</p>",
    "</body></html>",
  ].join("\n"),
);
writeFileSync(
  secFilingSixKPath,
  [
    "<html><body>",
    "<h1>Press Release</h1>",
    "<p>Arcadia Systems announced a sovereign data-center interconnect deployment using CXL memory pooling and retimer modules.</p>",
    "<h1>Signature</h1>",
    "<p>Authorized signature.</p>",
    "</body></html>",
  ].join("\n"),
);
writeFileSync(
  secFilingS4Path,
  [
    "<html><body>",
    "<h1>Transaction Summary</h1>",
    "<p>Arcadia Systems will combine with Helios Photonics to expand rack-scale optical interconnect manufacturing capacity.</p>",
    "<h1>Risk Factors</h1>",
    "<p>Transaction execution risks.</p>",
    "</body></html>",
  ].join("\n"),
);
writeFileSync(
  secFilingS1FalseStartManifestPath,
  [
    "symbol,cik,exchange,filing_type,sec_form,source_url,source_published_at,retrieved_at,filing_path,accession_or_document_id,accession_number,primary_document,sec_form_original,acceptance_datetime,report_date,sec_submission_url",
    `ARCD,0000002001,Nasdaq,S-1,S-1/A,fixture://sec/arcd-s1-false-start,2026-05-30,2026-05-31,${secFilingS1FalseStartPath},0000002001-26-000006/arcd-s1-false-start.htm,0000002001-26-000006,arcd-s1-false-start.htm,S-1/A,2026-05-30T18:10:00.000Z,2026-05-30,https://data.sec.gov/submissions/CIK0000002001.json`,
  ].join("\n") + "\n",
);
writeFileSync(
  secFilingS1SentenceFragmentManifestPath,
  [
    "symbol,cik,exchange,filing_type,sec_form,source_url,source_published_at,retrieved_at,filing_path,accession_or_document_id,accession_number,primary_document,sec_form_original,acceptance_datetime,report_date,sec_submission_url",
    `ARCD,0000002001,Nasdaq,S-1,S-1/A,fixture://sec/arcd-s1-sentence-fragment,2026-05-30,2026-05-31,${secFilingS1SentenceFragmentPath},0000002001-26-000009/arcd-s1-sentence-fragment.htm,0000002001-26-000009,arcd-s1-sentence-fragment.htm,S-1/A,2026-05-30T18:10:00.000Z,2026-05-30,https://data.sec.gov/submissions/CIK0000002001.json`,
  ].join("\n") + "\n",
);
writeFileSync(
  secFilingSupplementOnlyManifestPath,
  [
    "symbol,cik,exchange,filing_type,sec_form,source_url,source_published_at,retrieved_at,filing_path,accession_or_document_id,accession_number,primary_document,sec_form_original,acceptance_datetime,report_date,sec_submission_url",
    `ARCD,0000002001,Nasdaq,424B,424B5,fixture://sec/arcd-424b5-supplement-only,2026-05-30,2026-05-31,${secFilingSupplementOnlyPath},0000002001-26-000007/arcd-424b5.htm,0000002001-26-000007,arcd-424b5.htm,424B5,2026-05-30T18:10:00.000Z,2026-05-30,https://data.sec.gov/submissions/CIK0000002001.json`,
  ].join("\n") + "\n",
);
writeFileSync(
  secFilingProspectusProfileManifestPath,
  [
    "symbol,cik,exchange,filing_type,sec_form,source_url,source_published_at,retrieved_at,filing_path,accession_or_document_id,accession_number,primary_document,sec_form_original,acceptance_datetime,report_date,sec_submission_url",
    `ARCD,0000002001,Nasdaq,424B,424B4,fixture://sec/arcd-424b4-prospectus,2026-05-30,2026-05-31,${secFilingProspectusProfilePath},0000002001-26-000008/arcd-424b4.htm,0000002001-26-000008,arcd-424b4.htm,424B4,2026-05-30T18:10:00.000Z,2026-05-30,https://data.sec.gov/submissions/CIK0000002001.json`,
  ].join("\n") + "\n",
);
writeFileSync(
  secFilingProspectusSentenceFragmentManifestPath,
  [
    "symbol,cik,exchange,filing_type,sec_form,source_url,source_published_at,retrieved_at,filing_path,accession_or_document_id,accession_number,primary_document,sec_form_original,acceptance_datetime,report_date,sec_submission_url",
    `ARCD,0000002001,Nasdaq,424B,424B4,fixture://sec/arcd-424b4-sentence-fragment,2026-05-30,2026-05-31,${secFilingProspectusSentenceFragmentPath},0000002001-26-000010/arcd-424b4-sentence-fragment.htm,0000002001-26-000010,arcd-424b4-sentence-fragment.htm,424B4,2026-05-30T18:10:00.000Z,2026-05-30,https://data.sec.gov/submissions/CIK0000002001.json`,
  ].join("\n") + "\n",
);
writeFileSync(
  secFilingManifestPath,
  [
    "symbol,cik,exchange,filing_type,sec_form,source_url,source_published_at,retrieved_at,filing_path,accession_or_document_id,accession_number,primary_document,sec_form_original,acceptance_datetime,report_date,sec_submission_url",
    `ARCD,0000002001,Nasdaq,S-1,S-1/A,fixture://sec/arcd-s1,2026-05-30,2026-05-31,${secFilingPath},0000002001-26-000002/arcd-s1a.htm,0000002001-26-000002,arcd-s1a.htm,S-1/A,2026-05-30T18:10:00.000Z,2026-05-30,https://data.sec.gov/submissions/CIK0000002001.json`,
  ].join("\n") + "\n",
);
writeFileSync(
  secFilingInvalidRetrievedManifestPath,
  [
    "symbol,cik,exchange,filing_type,sec_form,source_url,source_published_at,retrieved_at,filing_path,accession_or_document_id,accession_number,primary_document,sec_form_original,acceptance_datetime,report_date,sec_submission_url",
    `ARCD,0000002001,Nasdaq,S-1,S-1/A,fixture://sec/arcd-s1,2026-05-30,not-a-date,${secFilingPath},0000002001-26-000002/arcd-s1a.htm,0000002001-26-000002,arcd-s1a.htm,S-1/A,2026-05-30T18:10:00.000Z,2026-05-30,https://data.sec.gov/submissions/CIK0000002001.json`,
  ].join("\n") + "\n",
);
writeFileSync(
  secFilingTenKManifestPath,
  [
    "symbol,cik,exchange,filing_type,sec_form,source_url,source_published_at,retrieved_at,filing_path,accession_or_document_id,accession_number,primary_document,sec_form_original,acceptance_datetime,report_date,sec_submission_url",
    `ARCD,0000002001,Nasdaq,10-K,10-K,fixture://sec/arcd-10k,2026-05-30,2026-05-31,${secFilingTenKPath},0000002001-26-000005/arcd-10k.htm,0000002001-26-000005,arcd-10k.htm,10-K,2026-05-30T18:10:00.000Z,2026-05-30,https://data.sec.gov/submissions/CIK0000002001.json`,
  ].join("\n") + "\n",
);
writeFileSync(
  secFilingEightKManifestPath,
  [
    "symbol,cik,exchange,filing_type,sec_form,source_url,source_published_at,retrieved_at,filing_path,accession_or_document_id,accession_number,primary_document,sec_form_original,acceptance_datetime,report_date,sec_submission_url",
    `ARCD,0000002001,Nasdaq,8-K,8-K,fixture://sec/arcd-8k,2026-05-31,2026-05-31,${secFilingEightKPath},0000002001-26-000003/arcd-8k.htm,0000002001-26-000003,arcd-8k.htm,8-K,2026-05-31T16:00:00.000Z,2026-05-31,https://data.sec.gov/submissions/CIK0000002001.json`,
  ].join("\n") + "\n",
);
writeFileSync(
  secFilingSixKManifestPath,
  [
    "symbol,cik,exchange,filing_type,sec_form,source_url,source_published_at,retrieved_at,filing_path,accession_or_document_id,accession_number,primary_document,sec_form_original,acceptance_datetime,report_date,sec_submission_url",
    `ARCD,0000002001,Nasdaq,6-K,6-K,fixture://sec/arcd-6k,2026-05-31,2026-05-31,${secFilingSixKPath},0000002001-26-000004/arcd-6k.htm,0000002001-26-000004,arcd-6k.htm,6-K,2026-05-31T17:00:00.000Z,2026-05-31,https://data.sec.gov/submissions/CIK0000002001.json`,
  ].join("\n") + "\n",
);
writeFileSync(
  secFilingS4ManifestPath,
  [
    "symbol,cik,exchange,filing_type,sec_form,source_url,source_published_at,retrieved_at,filing_path,accession_or_document_id,accession_number,primary_document,sec_form_original,acceptance_datetime,report_date,sec_submission_url",
    `ARCD,0000002001,Nasdaq,S-4,S-4,fixture://sec/arcd-s4,2026-05-31,2026-05-31,${secFilingS4Path},0000002001-26-000005/arcd-s4.htm,0000002001-26-000005,arcd-s4.htm,S-4,2026-05-31T18:00:00.000Z,2026-05-31,https://data.sec.gov/submissions/CIK0000002001.json`,
  ].join("\n") + "\n",
);
writeFileSync(
  secFilingNoBusinessManifestPath,
  [
    "symbol,cik,exchange,filing_type,source_url,source_published_at,retrieved_at,filing_path",
    `ARCD,0000002001,Nasdaq,S-1,fixture://sec/arcd-risk-only-s1,2026-05-30,2026-05-31,${secFilingNoBusinessPath}`,
  ].join("\n") + "\n",
);
mkdirSync(secSubmissionsDir, { recursive: true });
mkdirSync(secFutureSubmissionsDir, { recursive: true });
mkdirSync(secMismatchedSubmissionsDir, { recursive: true });
mkdirSync(secTickerMismatchSubmissionsDir, { recursive: true });
mkdirSync(secStaleSubmissionsDir, { recursive: true });
writeFileSync(
  path.join(secSubmissionsDir, "CIK0000002001.json"),
  `${JSON.stringify({
    cik: "0000002001",
    name: "Arcadia Systems Inc.",
    tickers: ["ARCD"],
    exchanges: ["Nasdaq"],
    filings: {
      recent: {
        accessionNumber: [
          "0000002001-26-000003",
          "0000002001-26-000004",
          "0000002001-26-000002",
          "0000002001-26-000001",
        ],
        acceptanceDateTime: [
          "2026-05-31T16:00:00.000Z",
          "2026-06-01T12:00:00.000Z",
          "2026-05-30T18:10:00.000Z",
          "2026-05-15T11:30:00.000Z",
        ],
        filingDate: [
          "2026-05-31",
          "2026-06-01",
          "2026-05-30",
          "2026-05-15",
        ],
        form: [
          "8-K",
          "424B5",
          "S-1/A",
          "S-1",
        ],
        primaryDocument: [
          "arcd-8k.htm",
          "arcd-424b5.htm",
          "arcd-s1a.htm",
          "arcd-s1.htm",
        ],
        reportDate: [
          "2026-05-31",
          "",
          "2026-05-30",
          "2026-05-15",
        ],
      },
    },
  })}\n`,
);
writeFileSync(
  path.join(secMismatchedSubmissionsDir, "CIK0000002001.json"),
  `${JSON.stringify({
    cik: "0000009999",
    name: "Wrong Cache Inc.",
    tickers: ["WRNG"],
    exchanges: ["NYSE"],
    filings: {
      recent: {
        accessionNumber: ["0000009999-26-000001"],
        filingDate: ["2026-05-31"],
        form: ["10-K"],
        primaryDocument: ["wrng-10k.htm"],
      },
    },
  })}\n`,
);
writeFileSync(
  path.join(secTickerMismatchSubmissionsDir, "CIK0000002007.json"),
  `${JSON.stringify({
    cik: "0000002007",
    name: "Ticker Drift Systems Inc.",
    tickers: ["OLD"],
    exchanges: ["Nasdaq"],
    sicDescription: "Computer Communications Equipment",
    category: "Non-accelerated filer",
    entityType: "operating",
    filings: {
      recent: {
        accessionNumber: ["0000002007-26-000001"],
        filingDate: ["2026-05-31"],
        form: ["10-K"],
        primaryDocument: ["drft-10k.htm"],
      },
    },
  })}\n`,
);
writeFileSync(
  path.join(secSubmissionsDir, "CIK0000002002.json"),
  `${JSON.stringify({
    cik: "0000002002",
    name: "Borealis Systems Inc.",
    tickers: ["BRS"],
    exchanges: ["Nasdaq"],
    sicDescription: "Computer Communications Equipment",
    category: "Non-accelerated filer",
    entityType: "operating",
    filings: {
      recent: {
        accessionNumber: ["0000002002-26-000001"],
        filingDate: ["2026-05-31"],
        form: ["8-K"],
        primaryDocument: ["brs-8k.htm"],
      },
    },
  })}\n`,
);
["CIK0000002001.json", "CIK0000002002.json"].forEach((fileName) => {
  const source = path.join(secSubmissionsDir, fileName);
  const staleTarget = path.join(secStaleSubmissionsDir, fileName);
  const futureTarget = path.join(secFutureSubmissionsDir, fileName);
  writeFileSync(staleTarget, readFileSync(source, "utf8"));
  writeFileSync(futureTarget, readFileSync(source, "utf8"));
  const staleTime = new Date("2026-05-01T00:00:00.000Z");
  const futureTime = new Date("2026-06-02T00:00:00.000Z");
  utimesSync(staleTarget, staleTime, staleTime);
  utimesSync(futureTarget, futureTime, futureTime);
});
writeFileSync(
  path.join(secSubmissionsDir, "CIK0000002003.json"),
  `${JSON.stringify({
    cik: "0000002003",
    name: "Prospectus Systems Inc.",
    tickers: ["PRSP"],
    exchanges: ["Nasdaq"],
    filings: {
      recent: {
        accessionNumber: [
          "0000002003-26-000002",
          "0000002003-26-000001",
        ],
        acceptanceDateTime: [
          "2026-06-01T12:00:00.000Z",
          "2026-05-15T11:30:00.000Z",
        ],
        filingDate: [
          "2026-06-01",
          "2026-05-15",
        ],
        form: [
          "424B5",
          "424B4",
        ],
        primaryDocument: [
          "prsp-424b5.htm",
          "prsp-424b4.htm",
        ],
        reportDate: [
          "",
          "",
        ],
      },
    },
  })}\n`,
);
writeFileSync(
  path.join(secSubmissionsDir, "CIK0000002004.json"),
  `${JSON.stringify({
    cik: "0000002004",
    name: "Supplement Systems Inc.",
    tickers: ["SUPP"],
    exchanges: ["Nasdaq"],
    filings: {
      recent: {
        accessionNumber: ["0000002004-26-000001"],
        acceptanceDateTime: ["2026-06-01T12:00:00.000Z"],
        filingDate: ["2026-06-01"],
        form: ["424B5"],
        primaryDocument: ["supp-424b5.htm"],
        reportDate: [""],
      },
    },
  })}\n`,
);
writeFileSync(
  path.join(secSubmissionsDir, "CIK0000002005.json"),
  `${JSON.stringify({
    cik: "0000002005",
    name: "Tie Break Systems Inc.",
    tickers: ["TIEB"],
    exchanges: ["Nasdaq"],
    filings: {
      recent: {
        accessionNumber: [
          "0000002005-26-000003",
          "0000002005-26-000002",
          "0000002005-26-000001",
        ],
        acceptanceDateTime: [
          "2026-06-01T12:00:00.000Z",
          "2026-06-01T12:00:00.000Z",
          "2026-06-01T12:00:00.000Z",
        ],
        filingDate: [
          "2026-06-01",
          "2026-06-01",
          "2026-06-01",
        ],
        form: [
          "424B1",
          "424B3/A",
          "424B4",
        ],
        primaryDocument: [
          "tieb-424b1.htm",
          "tieb-424b3a.htm",
          "tieb-424b4.htm",
        ],
        reportDate: [
          "",
          "",
          "",
        ],
      },
    },
  })}\n`,
);
writeFileSync(
  path.join(secSubmissionsDir, "CIK0000002006.json"),
  `${JSON.stringify({
    cik: "0000002006",
    name: "Unknown Prospectus Systems Inc.",
    tickers: ["UNKB"],
    exchanges: ["Nasdaq"],
    filings: {
      recent: {
        accessionNumber: ["0000002006-26-000001"],
        acceptanceDateTime: ["2026-06-01T12:00:00.000Z"],
        filingDate: ["2026-06-01"],
        form: ["424B8"],
        primaryDocument: ["unkb-424b8.htm"],
        reportDate: [""],
      },
    },
  })}\n`,
);
[secSubmissionsDir, secMismatchedSubmissionsDir, secTickerMismatchSubmissionsDir].forEach((dir) =>
  touchJsonFilesInDir(dir, secFixtureCurrentCacheTime),
);

run("scripts/build-discovery-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--sec-input",
  secFixturePath,
  "--output",
  outputPath,
], fixtureRepo);
const profiles = JSON.parse(readFileSync(outputPath, "utf8"));
assert(profiles.schema_version === 1, "profile artifact should use schema_version 1");
assert(profiles.profile_purpose === "repo_research_recall_calibration", "profile artifact should declare recall-calibration purpose");
assert(profiles.profile_text_fields.join(",") === "summary,upside_path", "profile artifact should declare positive profile fields");
assert(profiles.profile_count === 2, "profile artifact should include tradable CIK-backed symbols");
assert(profiles.skipped_symbols.some((entry) => entry.symbol === "PRIVATE" && entry.reason === "missing_sec_cik"), "profile artifact should skip missing CIK symbols");
assert(profiles.skipped_symbols.some((entry) => entry.symbol === "PREF" && entry.reason === "unsupported_asset_type:preferred_stock"), "profile artifact should skip non-common stock");
assert(profiles.profiles.map((profile) => profile.symbol).join(",") === "OLSI,RKLB", "profile artifact should sort profiles by symbol");

const rklb = profiles.profiles.find((profile) => profile.symbol === "RKLB");
assert(rklb !== undefined, "profile artifact should include RKLB");
assert(rklb.cik === "0001819994", "profile artifact should preserve security master CIK");
assert(rklb.source_url === "research/new-rklb.md", "profile artifact should use latest analysis source path");
assert(rklb.source_published_at === "2026-05-31", "profile artifact should use latest analysis date");
assert(rklb.retrieved_at === "2026-05-31", "profile artifact should use requested as-of as retrieved date");
assert(rklb.text.includes("launch and spacecraft"), "profile text should include latest summary");
assert(rklb.text.includes("orbital infrastructure"), "profile text should include upside path");
assert(!rklb.text.includes("Execution and dilution"), "profile text should not include risk_watch");
assert(!rklb.text.includes("satellite-account"), "profile text should clean portfolio-level satellite-account wording");
assert(!rklb.text.includes("old summary"), "profile text should ignore stale analysis entries");

const scan = runJson("scripts/discover-universe.mjs", [
  "--dry-run",
  "--json",
  "--input",
  secFixturePath,
  "--profile-input",
  outputPath,
  "--limit",
  "10",
], fixtureRepo);
const recoveredRklb = scan.suppressed_known_matches.find((item) => item.symbol === "RKLB");
assert(recoveredRklb !== undefined, "profile artifact should recover known RKLB as suppressed match");
assert(recoveredRklb.profile_enriched === true, "recovered RKLB should be profile enriched");
assert(recoveredRklb.primary_lane_id === "space_infrastructure", "recovered RKLB should match space lane");
const rklbRecall = scan.recall_diagnostics.find((item) => item.symbol === "RKLB");
assert(rklbRecall.status === "matched_expected_lane", "profile artifact should fix RKLB recall diagnostic");

run("scripts/build-issuer-profile-input.mjs", [
  "--as-of",
  "2026-05-31",
  "--input",
  issuerProfileCsvPath,
  "--sec-input",
  secFixturePath,
  "--output",
  issuerOutputPath,
], fixtureRepo);
const issuerProfiles = JSON.parse(readFileSync(issuerOutputPath, "utf8"));
assert(issuerProfiles.schema_version === 1, "issuer profile artifact should use schema_version 1");
assert(issuerProfiles.profile_purpose === "issuer_universe_discovery", "issuer profile artifact should declare discovery purpose");
assert(issuerProfiles.profile_count === 1, "issuer profile artifact should include unknown SEC-backed profile");
assert(issuerProfiles.profile_coverage_strategy === "manual_profile_input_csv", "issuer profile artifact should record manual profile coverage strategy");
assert(issuerProfiles.coverage_scope === "partial_manual_profile_input", "issuer profile artifact should mark manual profile coverage as partial");
assert(issuerProfiles.requested_symbols.join(",") === "ARCD", "issuer profile artifact should preserve requested symbols from CSV");
assert(issuerProfiles.selected_symbol_count === 1, "issuer profile artifact should record selected profile rows");
assert(issuerProfiles.eligible_universe_count === 9, "issuer profile artifact should record SEC reference eligible universe count");
assert(issuerProfiles.coverage_limit === 1, "issuer profile artifact should record profile coverage limit");
assert(issuerProfiles.profiles[0].symbol === "ARCD", "issuer profile artifact should preserve symbol");
assert(issuerProfiles.profiles[0].text.includes("CXL memory pooling"), "issuer profile artifact should preserve discovery text");

const issuerScan = runJson("scripts/discover-universe.mjs", [
  "--dry-run",
  "--json",
  "--input",
  secFixturePath,
  "--profile-input",
  issuerOutputPath,
  "--limit",
  "10",
], fixtureRepo);
const issuerCandidate = issuerScan.candidates.find((item) => item.symbol === "ARCD");
assert(issuerCandidate !== undefined, "issuer profile artifact should discover unknown profile-only candidate");
assert(issuerCandidate.profile_enriched === true, "issuer profile candidate should be profile enriched");
assert(issuerCandidate.matched_fields.join(",") === "profile_text", "issuer profile candidate should match profile text only");
assert(issuerScan.profile_unknown_symbol_count === 1, "issuer profile scan should count unknown profile symbols");
assert(issuerScan.profile_enriched_candidate_count === 1, "issuer profile scan should count profile-enriched candidates");
assert(issuerScan.profile_enriched_suppressed_match_count === 0, "issuer profile scan should not suppress unknown profile candidate");

run("scripts/build-sec-filing-manifest.mjs", [
  "--as-of",
  "2026-05-31",
  "--sec-input",
  secFixturePath,
  "--submissions-dir",
  secSubmissionsDir,
  "--filing-dir",
  secFilingLocalDir,
  "--symbols",
  "ARCD,BRS,BRSA",
  "--output",
  secFilingAutoManifestPath,
  "--metadata-output",
  secFilingAutoMetadataPath,
], fixtureRepo);
const autoManifestRows = csvRecords(secFilingAutoManifestPath);
assert(autoManifestRows.length === 1, "SEC filing manifest builder should emit only supported non-duplicate filing rows");
assert(autoManifestRows[0].symbol === "ARCD", "SEC filing manifest builder should preserve requested supported symbol");
assert(autoManifestRows[0].filing_selection_policy === "foundational-first", "SEC filing manifest builder should record default foundational-first selection policy");
assert(autoManifestRows[0].filing_selection_tier === "foundational_business_filing", "SEC filing manifest builder should prefer foundational business filings");
assert(autoManifestRows[0].filing_selection_family === "foundational_business_filing", "SEC filing manifest builder should record foundational selection family");
assert(autoManifestRows[0].selection_reason === "selected_newest_foundational_business_filing", "SEC filing manifest builder should ignore filings after the requested as-of date");
assert(autoManifestRows[0].selected_sec_form_base === "S-1", "SEC filing manifest builder should record selected base SEC form");
assert(autoManifestRows[0].newer_supported_filing_displaced_count === "0", "SEC filing manifest builder should not count future filings as displaced by policy");
assert(autoManifestRows[0].newer_supported_filing_forms === "", "SEC filing manifest builder should not record future forms as displaced by policy");
assert(autoManifestRows[0].lower_tier_newer_filing_forms === "", "SEC filing manifest builder should not record future lower-tier forms as displaced by policy");
assert(autoManifestRows[0].foundational_candidate_count === "2", "SEC filing manifest builder should count foundational candidates");
assert(autoManifestRows[0].business_prospectus_424b_candidate_count === "0", "SEC filing manifest builder should count business prospectus fallback candidates");
assert(autoManifestRows[0].supplement_424b_candidate_count === "0", "SEC filing manifest builder should ignore future supplement fallback candidates");
assert(autoManifestRows[0].unknown_424b_candidate_count === "0", "SEC filing manifest builder should count unknown 424B candidates");
assert(autoManifestRows[0].selection_warnings === "", "SEC filing manifest builder should not warn about filings after as-of");
assert(autoManifestRows.every((row) => row.source_published_at <= row.retrieved_at), "SEC filing manifest builder must not emit source_published_at after retrieved_at");
assert(autoManifestRows[0].filing_type === "S-1", "SEC filing manifest builder should normalize S-1 amendments for downstream extraction");
assert(autoManifestRows[0].sec_form_original === "S-1/A", "SEC filing manifest builder should retain original SEC form");
assert(autoManifestRows[0].accession_number === "0000002001-26-000002", "SEC filing manifest builder should preserve accession number");
assert(autoManifestRows[0].primary_document === "arcd-s1a.htm", "SEC filing manifest builder should preserve primary document");
assert(autoManifestRows[0].acceptance_datetime === "2026-05-30T18:10:00.000Z", "SEC filing manifest builder should preserve acceptance datetime");
assert(autoManifestRows[0].report_date === "2026-05-30", "SEC filing manifest builder should preserve report date");
assert(autoManifestRows[0].source_url === "https://www.sec.gov/Archives/edgar/data/2001/000000200126000002/arcd-s1a.htm", "SEC filing manifest builder should construct SEC Archives filing URL");
assert(autoManifestRows[0].sec_submission_url === "https://data.sec.gov/submissions/CIK0000002001.json", "SEC filing manifest builder should preserve SEC submissions URL");
assert(autoManifestRows[0].filing_path === secFilingLocalPath, "SEC filing manifest builder should map local filing fixture path");
const autoManifestMetadata = JSON.parse(readFileSync(secFilingAutoMetadataPath, "utf8"));
assert(autoManifestMetadata.source === "sec_submissions_recent_filings", "SEC filing manifest metadata should identify submissions source");
assert(autoManifestMetadata.filing_selection_policy === "foundational-first", "SEC filing manifest metadata should record default selection policy");
assert(autoManifestMetadata.manifest_selection_fields.includes("selection_reason"), "SEC filing manifest metadata should list selection audit fields");
assert(autoManifestMetadata.manifest_selection_fields.includes("filing_selection_family"), "SEC filing manifest metadata should list selection family field");
assert(autoManifestMetadata.manifest_selection_fields.includes("newer_supported_filing_displaced_count"), "SEC filing manifest metadata should list displaced filing count field");
assert(autoManifestMetadata.manifest_selection_fields.includes("business_prospectus_424b_candidate_count"), "SEC filing manifest metadata should list 424B family count fields");
assert(autoManifestMetadata.selection_strategy === "requested_symbols", "SEC filing manifest metadata should record requested-symbol sampling");
assert(autoManifestMetadata.requested_symbols.join(",") === "ARCD,BRS,BRSA", "SEC filing manifest metadata should preserve requested symbols");
assert(autoManifestMetadata.sec_company_input_row_count === 9, "SEC filing manifest metadata should record SEC company input row count");
assert(autoManifestMetadata.sec_company_input_sha256.length === 64, "SEC filing manifest metadata should record SEC company input hash");
assert(autoManifestMetadata.manifest_row_count === 1, "SEC filing manifest metadata should match emitted manifest row count");
assert(autoManifestMetadata.submissions_fetched_count === 2, "SEC filing manifest metadata should record fetched submissions before duplicate-CIK skips");
assert(autoManifestMetadata.skipped_symbols.some((entry) => entry.symbol === "BRS" && entry.reason === "no_supported_filing"), "SEC filing manifest metadata should explain no-supported-filing skips");
assert(autoManifestMetadata.skipped_symbols.some((entry) => entry.symbol === "BRSA" && entry.reason === "duplicate_cik:BRS"), "SEC filing manifest metadata should explain duplicate-CIK skips");

run("scripts/build-sec-filing-manifest.mjs", [
  "--as-of",
  "2026-05-31",
  "--sec-input",
  secFixturePath,
  "--submissions-dir",
  secSubmissionsDir,
  "--filing-dir",
  secFilingLocalDir,
  "--symbols",
  "ARCD",
  "--filing-types",
  "8-K",
  "--filing-selection-policy",
  "latest-supported",
  "--output",
  secFilingEightKAutoManifestPath,
  "--metadata-output",
  secFilingEightKAutoMetadataPath,
], fixtureRepo);
const eventManifestRows = csvRecords(secFilingEightKAutoManifestPath);
assert(eventManifestRows.length === 1, "SEC filing event manifest should emit supported 8-K rows when explicitly requested");
assert(eventManifestRows[0].filing_type === "8-K", "SEC filing event manifest should normalize 8-K for downstream extraction");
assert(eventManifestRows[0].filing_selection_tier === "material_event_or_periodic_filing", "SEC filing event manifest should tier 8-K as material event evidence");
assert(eventManifestRows[0].filing_selection_family === "material_event_or_periodic_filing", "SEC filing event manifest should family-classify 8-K material event evidence");
assert(eventManifestRows[0].selection_reason === "selected_latest_supported_filing", "SEC filing event manifest should preserve latest-supported event selection reason");
assert(eventManifestRows[0].filing_path === secFilingEightKPath, "SEC filing event manifest should map local 8-K fixture path");

await withRetryServer((baseUrl) => {
  const retryManifestPath = path.join(fixtureRoot, "sec-filing-retry-manifest.csv");
  const retryManifestMetadataPath = path.join(fixtureRoot, "sec-filing-retry-manifest.metadata.json");
  run("scripts/build-sec-filing-manifest.mjs", [
    "--as-of",
    "2026-05-31",
    "--sec-input",
    secFixturePath,
    "--sec-submissions-base-url",
    baseUrl,
    "--sec-fetch-retries",
    "1",
    "--sec-retry-delay-ms",
    "1",
    "--symbols",
    "ARCD",
    "--output",
    retryManifestPath,
    "--metadata-output",
    retryManifestMetadataPath,
  ], fixtureRepo);
  const retryMetadata = JSON.parse(readFileSync(retryManifestMetadataPath, "utf8"));
  assert(retryMetadata.submissions_ledger[0].request_attempt_count === 2, "SEC filing manifest builder should retry one transient submissions failure");
  assert(retryMetadata.submissions_ledger[0].request_statuses.join(",") === "503,200", "SEC filing manifest builder should audit retry statuses");
});

run("scripts/build-sec-filing-manifest.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secCompleteFixturePath,
  "--submissions-cache-dir",
  secSubmissionsDir,
  "--cache-only",
  "--all",
  "--output",
  secFilingCompleteManifestPath,
  "--metadata-output",
  secFilingCompleteMetadataPath,
], fixtureRepo);
const completeManifestRows = csvRecords(secFilingCompleteManifestPath);
assert(completeManifestRows.length === 1, "SEC filing complete-universe manifest should emit supported filing rows after full eligible selection");
const completeManifestMetadata = JSON.parse(readFileSync(secFilingCompleteMetadataPath, "utf8"));
assert(completeManifestMetadata.selection_strategy === "complete_sec_universe", "SEC filing manifest --all should record complete SEC universe selection strategy");
assert(completeManifestMetadata.coverage_scope === "complete_sec_universe", "SEC filing manifest --all should record complete SEC universe coverage scope");
assert(completeManifestMetadata.selected_symbol_count === 2, "SEC filing manifest --all should select every eligible SEC issuer");
assert(completeManifestMetadata.eligible_universe_count === 2, "SEC filing manifest --all should match selected count to eligible count");
assert(completeManifestMetadata.coverage_limit === 2, "SEC filing manifest --all should record complete coverage limit");
assert(completeManifestMetadata.requested_symbols.length === 0, "SEC filing manifest --all should not pretend a requested-symbol list is complete coverage");
assert(completeManifestMetadata.submissions_cache_hits === 2, "SEC filing manifest cache-only run should count cached submissions");
assert(completeManifestMetadata.submissions_cache_misses === 0, "SEC filing manifest cache-only run should not miss cached submissions");
assert(completeManifestMetadata.submissions_cache_writes === 0, "SEC filing manifest cache-only run should not write cached submissions");
assert(completeManifestMetadata.submissions_cache_only === true, "SEC filing manifest cache-only run should record cache-only mode");
assert(completeManifestMetadata.submissions_ledger_count === 2, "SEC filing manifest cache-only run should record one ledger entry per selected unique CIK");
assert(completeManifestMetadata.submissions_ledger.length === 2, "SEC filing manifest cache-only run should emit submissions ledger entries");
assert(completeManifestMetadata.submissions_ledger.every((entry) => entry.cache_status === "cache_hit"), "SEC filing manifest cache-only ledger should mark cache hits");
assert(completeManifestMetadata.submissions_ledger.every((entry) => entry.validation_status === "validated"), "SEC filing manifest cache-only ledger should mark validated submissions");
assert(completeManifestMetadata.submissions_ledger.every((entry) => entry.payload_sha256.length === 64), "SEC filing manifest cache-only ledger should hash every submission payload");
assert(completeManifestMetadata.submissions_ledger.map((entry) => entry.symbol).join(",") === "ARCD,BRS", "SEC filing manifest cache-only ledger should preserve selected CIK order");
assert(completeManifestRows.length + completeManifestMetadata.skipped_symbols.length === completeManifestMetadata.selected_symbol_count, "SEC filing manifest cache-only run should reconcile emitted rows and skipped symbols to selected coverage");
assert(completeManifestMetadata.sec_user_agent.includes("winechord-invest"), "SEC filing manifest metadata should record SEC user agent identity");
assert(completeManifestMetadata.sec_min_complete_universe_request_delay_ms === 100, "SEC filing manifest metadata should record complete-universe SEC rate guard");
runExpectFailure("scripts/build-sec-filing-manifest.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secCompleteFixturePath,
  "--submissions-cache-dir",
  path.join(fixtureRoot, "missing-filing-cache"),
  "--cache-only",
  "--symbols",
  "ARCD",
  "--output",
  path.join(fixtureRoot, "missing-cache-manifest.csv"),
], fixtureRepo, "Missing cached SEC submissions file");
runExpectFailure("scripts/build-sec-filing-manifest.mjs", [
  "--as-of",
  "2026-99-99",
  "--sec-input",
  secCompleteFixturePath,
  "--submissions-cache-dir",
  secSubmissionsDir,
  "--cache-only",
  "--all",
  "--output",
  path.join(fixtureRoot, "invalid-date-manifest.csv"),
], fixtureRepo, "--as-of must be a valid calendar date");
runExpectFailure("scripts/build-sec-filing-manifest.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secCompleteFixturePath,
  "--submissions-cache-dir",
  secStaleSubmissionsDir,
  "--cache-only",
  "--all",
  "--output",
  path.join(fixtureRoot, "stale-cache-manifest.csv"),
], fixtureRepo, "is stale for 2026-06-01");
runExpectFailure("scripts/build-sec-filing-manifest.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secCompleteFixturePath,
  "--submissions-cache-dir",
  secFutureSubmissionsDir,
  "--cache-only",
  "--all",
  "--output",
  path.join(fixtureRoot, "future-cache-manifest.csv"),
], fixtureRepo, "is after requested as-of 2026-06-01");
const mismatchedCacheManifestPath = path.join(fixtureRoot, "mismatched-cache-manifest.csv");
const mismatchedCacheManifestLedgerPath = path.join(fixtureRoot, "mismatched-cache-manifest-ledger.json");
runExpectFailure("scripts/build-sec-filing-manifest.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secCompleteFixturePath,
  "--submissions-cache-dir",
  secMismatchedSubmissionsDir,
  "--cache-only",
  "--all",
  "--submissions-ledger-output",
  mismatchedCacheManifestLedgerPath,
  "--output",
  mismatchedCacheManifestPath,
], fixtureRepo, "SEC submissions CIK mismatch for ARCD");
assert(!existsSync(mismatchedCacheManifestPath), "SEC filing manifest builder should not emit a fresh complete artifact after cache identity failure");
const failedManifestLedger = JSON.parse(readFileSync(mismatchedCacheManifestLedgerPath, "utf8"));
assert(failedManifestLedger.submissions_ledger_count === 1, "SEC filing manifest failure ledger should record failed CIK");
assert(failedManifestLedger.submissions_ledger[0].symbol === "ARCD", "SEC filing manifest failure ledger should name failed symbol");
assert(failedManifestLedger.submissions_ledger[0].validation_status === "failed", "SEC filing manifest failure ledger should mark validation failure");
assert(failedManifestLedger.submissions_ledger[0].error.includes("SEC submissions CIK mismatch"), "SEC filing manifest failure ledger should preserve failure reason");
runExpectFailure("scripts/build-sec-filing-manifest.mjs", [
  "--as-of",
  "2026-05-31",
  "--sec-input",
  secCompleteFixturePath,
  "--all",
  "--output",
  path.join(fixtureRoot, "unsafe-live-all-manifest.csv"),
], fixtureRepo, "Live --all SEC submissions fetches require --request-delay-ms >= 100 or --cache-only");

run("scripts/build-sec-filing-manifest.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secFixturePath,
  "--submissions-dir",
  secSubmissionsDir,
  "--symbols",
  "ARCD",
  "--filing-selection-policy",
  "latest-supported",
  "--output",
  secFilingLatestManifestPath,
  "--metadata-output",
  secFilingLatestMetadataPath,
], fixtureRepo);
const latestManifestRows = csvRecords(secFilingLatestManifestPath);
assert(latestManifestRows.length === 1, "SEC filing latest-supported policy should emit one row");
assert(latestManifestRows[0].filing_selection_policy === "latest-supported", "SEC filing manifest builder should record latest-supported policy");
assert(latestManifestRows[0].filing_type === "424B", "SEC filing latest-supported policy should select newer 424B filing");
assert(latestManifestRows[0].sec_form_original === "424B5", "SEC filing latest-supported policy should preserve original 424B form");
assert(latestManifestRows[0].filing_selection_tier === "prospectus_supplement_fallback", "SEC filing latest-supported policy should reveal 424B selection tier");
assert(latestManifestRows[0].filing_selection_family === "supplement_424b", "SEC filing latest-supported policy should reveal 424B selection family");
assert(latestManifestRows[0].selected_sec_form_base === "424B5", "SEC filing latest-supported policy should preserve selected SEC base form");
assert(latestManifestRows[0].selection_reason === "selected_latest_supported_filing", "SEC filing latest-supported policy should explain latest filing selection");
assert(latestManifestRows[0].newer_supported_filing_displaced_count === "0", "SEC filing latest-supported policy should not displace newer filings");
assert(latestManifestRows[0].foundational_candidate_count === "2", "SEC filing latest-supported policy should still count foundational candidates");
assert(latestManifestRows[0].accession_number === "0000002001-26-000004", "SEC filing latest-supported policy should preserve selected 424B accession");
const latestManifestMetadata = JSON.parse(readFileSync(secFilingLatestMetadataPath, "utf8"));
assert(latestManifestMetadata.filing_selection_policy === "latest-supported", "SEC filing latest metadata should record explicit selection policy");

run("scripts/build-sec-filing-manifest.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secFixturePath,
  "--submissions-dir",
  secSubmissionsDir,
  "--symbols",
  "PRSP,SUPP",
  "--output",
  secFilingProspectusFallbackManifestPath,
  "--metadata-output",
  secFilingProspectusFallbackMetadataPath,
], fixtureRepo);
const prospectusFallbackRows = csvRecords(secFilingProspectusFallbackManifestPath);
const prospectusBusinessRow = prospectusFallbackRows.find((row) => row.symbol === "PRSP");
const prospectusSupplementRow = prospectusFallbackRows.find((row) => row.symbol === "SUPP");
assert(prospectusBusinessRow !== undefined, "SEC filing manifest builder should emit 424B business prospectus fallback row");
assert(prospectusBusinessRow.filing_type === "424B", "SEC filing manifest builder should normalize 424B4 fallback");
assert(prospectusBusinessRow.sec_form_original === "424B4", "SEC filing manifest builder should retain 424B4 original form");
assert(prospectusBusinessRow.filing_selection_tier === "business_prospectus_fallback", "SEC filing manifest builder should tier 424B4 as business prospectus fallback");
assert(prospectusBusinessRow.filing_selection_family === "business_prospectus_424b", "SEC filing manifest builder should family-classify 424B4 as business prospectus");
assert(prospectusBusinessRow.selected_sec_form_base === "424B4", "SEC filing manifest builder should record selected 424B4 base form");
assert(prospectusBusinessRow.selection_reason === "selected_business_prospectus_over_newer_supplement", "SEC filing manifest builder should explain older 424B4 beating newer supplement");
assert(prospectusBusinessRow.newer_supported_filing_displaced_count === "1", "SEC filing manifest builder should count newer supplement displaced by 424B4");
assert(prospectusBusinessRow.newer_supported_filing_forms === "424B5", "SEC filing manifest builder should record newer supplement form displaced by 424B4");
assert(prospectusBusinessRow.lower_tier_newer_filing_forms === "424B5", "SEC filing manifest builder should record lower-tier newer supplement displaced by 424B4");
assert(prospectusBusinessRow.business_prospectus_424b_candidate_count === "1", "SEC filing manifest builder should count business prospectus 424B candidates");
assert(prospectusBusinessRow.supplement_424b_candidate_count === "1", "SEC filing manifest builder should count supplement 424B candidates");
assert(prospectusBusinessRow.unknown_424b_candidate_count === "0", "SEC filing manifest builder should count unknown 424B candidates");
assert(prospectusBusinessRow.selection_warnings === "newer_supported_filing_displaced_by_policy;no_foundational_business_filing_available", "SEC filing manifest builder should warn when 424B4 fallback has no foundational filing");
assert(prospectusSupplementRow !== undefined, "SEC filing manifest builder should emit supplement-only fallback row");
assert(prospectusSupplementRow.sec_form_original === "424B5", "SEC filing manifest builder should retain supplement original form");
assert(prospectusSupplementRow.filing_selection_tier === "prospectus_supplement_fallback", "SEC filing manifest builder should tier 424B5 as supplement fallback");
assert(prospectusSupplementRow.filing_selection_family === "supplement_424b", "SEC filing manifest builder should family-classify 424B5 as supplement");
assert(prospectusSupplementRow.selection_reason === "selected_supplement_prospectus_fallback_no_foundational_filing", "SEC filing manifest builder should explain supplement-only fallback");
assert(prospectusSupplementRow.selection_warnings === "no_foundational_business_filing_available;selected_supplement_grade_424b;no_business_prospectus_424b_available", "SEC filing manifest builder should warn when only supplement-grade 424B is available");
const prospectusFallbackMetadata = JSON.parse(readFileSync(secFilingProspectusFallbackMetadataPath, "utf8"));
assert(prospectusFallbackMetadata.manifest_row_count === 2, "SEC filing prospectus fallback metadata should match emitted row count");

run("scripts/build-sec-filing-manifest.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secFixturePath,
  "--submissions-dir",
  secSubmissionsDir,
  "--symbols",
  "TIEB,UNKB",
  "--output",
  secFilingTieBreakManifestPath,
], fixtureRepo);
const tieBreakRows = csvRecords(secFilingTieBreakManifestPath);
const tieBreakRow = tieBreakRows.find((row) => row.symbol === "TIEB");
const unknown424BRow = tieBreakRows.find((row) => row.symbol === "UNKB");
assert(tieBreakRow !== undefined, "SEC filing manifest builder should emit tie-break fixture row");
assert(tieBreakRow.sec_form_original === "424B4", "SEC filing manifest builder should use explicit 424B form rank after timestamp ties");
assert(tieBreakRow.selected_sec_form_base === "424B4", "SEC filing manifest builder should strip amendment suffix before 424B ranking");
assert(tieBreakRow.business_prospectus_424b_candidate_count === "3", "SEC filing manifest builder should count 424B1/424B3/424B4 as business prospectus candidates");
assert(tieBreakRow.selection_reason === "selected_business_prospectus_fallback_no_foundational_filing", "SEC filing manifest builder should explain 424B business fallback after tie-break");
assert(unknown424BRow !== undefined, "SEC filing manifest builder should emit unknown 424B fallback row");
assert(unknown424BRow.sec_form_original === "424B8", "SEC filing manifest builder should retain unknown 424B original form");
assert(unknown424BRow.filing_selection_tier === "prospectus_unknown_or_late_fallback", "SEC filing manifest builder should tier 424B8 as unknown or late fallback");
assert(unknown424BRow.filing_selection_family === "unknown_or_late_424b", "SEC filing manifest builder should family-classify unknown 424B forms");
assert(unknown424BRow.unknown_424b_candidate_count === "1", "SEC filing manifest builder should count unknown 424B candidates");
assert(unknown424BRow.selection_reason === "selected_unknown_or_late_424b_fallback_no_foundational_filing", "SEC filing manifest builder should explain unknown 424B fallback");
assert(unknown424BRow.selection_warnings === "selected_unknown_or_late_424b;unknown_or_late_424b_candidates_present", "SEC filing manifest builder should warn when unknown 424B is selected");

runExpectFailure("scripts/build-sec-filing-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--manifest",
  secFilingAutoManifestPath,
  "--manifest-metadata",
  secFilingAutoMetadataPath,
  "--sec-input",
  secFixturePath,
  "--output",
  path.join(fixtureRoot, "sec-filing-auto-local-path-without-allow.json"),
], fixtureRepo, "filing_path requires --allow-local-filing-paths");

run("scripts/build-sec-filing-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--manifest",
  secFilingAutoManifestPath,
  "--manifest-metadata",
  secFilingAutoMetadataPath,
  "--sec-input",
  secFixturePath,
  "--allow-local-filing-paths",
  "--output",
  secFilingAutoOutputPath,
], fixtureRepo);
const autoSecFilingProfiles = JSON.parse(readFileSync(secFilingAutoOutputPath, "utf8"));
assert(autoSecFilingProfiles.profile_count === 1, "SEC filing manifest output should feed filing profile builder");
assert(autoSecFilingProfiles.manifest_selection_strategy === "requested_symbols", "SEC filing profile artifact should preserve manifest sampling strategy");
assert(autoSecFilingProfiles.profile_coverage_strategy === "requested_symbols", "SEC filing profile artifact should expose profile coverage strategy");
assert(autoSecFilingProfiles.coverage_scope === "partial_requested_symbols", "SEC filing profile artifact should mark requested-symbol coverage as partial");
assert(autoSecFilingProfiles.requested_symbols.join(",") === "ARCD,BRS,BRSA", "SEC filing profile artifact should preserve manifest requested symbols");
assert(autoSecFilingProfiles.selected_symbol_count === 3, "SEC filing profile artifact should preserve manifest selected-symbol count");
assert(autoSecFilingProfiles.eligible_universe_count === 9, "SEC filing profile artifact should preserve manifest eligible-universe count");
assert(autoSecFilingProfiles.coverage_limit === 3, "SEC filing profile artifact should preserve manifest coverage limit");
assert(autoSecFilingProfiles.sampling_note.includes("coverage claims are limited to requested symbols"), "SEC filing profile artifact should preserve manifest sampling warning");
assert(autoSecFilingProfiles.profiles[0].filing_accession_or_document_id === "0000002001-26-000002/arcd-s1a.htm", "SEC filing profile should preserve generated manifest filing identity");
assert(autoSecFilingProfiles.profiles[0].filing_sec_form_original === "S-1/A", "SEC filing profile should preserve generated manifest original SEC form");
assert(autoSecFilingProfiles.profiles[0].filing_primary_document === "arcd-s1a.htm", "SEC filing profile should preserve generated manifest primary document");
assert(autoSecFilingProfiles.profiles[0].filing_business_prospectus_424b_candidate_count === "0", "SEC filing profile should preserve business prospectus 424B candidate count");
assert(autoSecFilingProfiles.profiles[0].filing_foundational_candidate_count === "2", "SEC filing profile should preserve generated manifest foundational candidate count");
assert(autoSecFilingProfiles.profiles[0].filing_lower_tier_newer_filing_forms === "", "SEC filing profile should not preserve future lower-tier filing forms");
assert(autoSecFilingProfiles.profiles[0].filing_newer_supported_filing_displaced_count === "0", "SEC filing profile should not count future filings as displaced");
assert(autoSecFilingProfiles.profiles[0].filing_newer_supported_filing_forms === "", "SEC filing profile should not preserve future displaced forms");
assert(autoSecFilingProfiles.profiles[0].filing_selected_sec_form_base === "S-1", "SEC filing profile should preserve selected base SEC form");
assert(autoSecFilingProfiles.profiles[0].filing_selection_family === "foundational_business_filing", "SEC filing profile should preserve generated manifest selection family");
assert(autoSecFilingProfiles.profiles[0].filing_selection_policy === "foundational-first", "SEC filing profile should preserve generated manifest selection policy");
assert(autoSecFilingProfiles.profiles[0].filing_selection_reason === "selected_newest_foundational_business_filing", "SEC filing profile should preserve generated manifest selection reason");
assert(autoSecFilingProfiles.profiles[0].filing_selection_tier === "foundational_business_filing", "SEC filing profile should preserve generated manifest selection tier");
assert(autoSecFilingProfiles.profiles[0].filing_selection_warnings === "", "SEC filing profile should not preserve warnings for future filings");
assert(autoSecFilingProfiles.profiles[0].filing_supplement_424b_candidate_count === "0", "SEC filing profile should not count future supplement 424B candidates");
assert(autoSecFilingProfiles.profiles[0].filing_unknown_424b_candidate_count === "0", "SEC filing profile should preserve unknown 424B candidate count");
assert(autoSecFilingProfiles.profiles[0].source_url === autoManifestRows[0].source_url, "SEC filing profile should preserve generated manifest source URL");
assert(autoSecFilingProfiles.profiles[0].text.includes("CXL memory pooling"), "SEC filing profile should extract text from generated manifest local filing path");

const autoSecFilingScan = runJson("scripts/discover-universe.mjs", [
  "--dry-run",
  "--json",
  "--input",
  secFixturePath,
  "--profile-input",
  secFilingAutoOutputPath,
  "--allow-local-profile-evidence",
  "--limit",
  "10",
], fixtureRepo);
const autoSecFilingCandidate = autoSecFilingScan.candidates.find((item) => item.symbol === "ARCD");
assert(autoSecFilingCandidate !== undefined, "SEC filing auto manifest profile should discover business-section-only candidate");
assert(autoSecFilingScan.profile_coverage_strategy === "requested_symbols", "SEC filing scan should echo profile coverage strategy");
assert(autoSecFilingScan.profile_coverage_scope === "partial_requested_symbols", "SEC filing scan should echo partial requested-symbol coverage");
assert(autoSecFilingScan.profile_requested_symbols.join(",") === "ARCD,BRS,BRSA", "SEC filing scan should echo requested symbols");
assert(autoSecFilingCandidate.profile_metadata.filing_selection_policy === "foundational-first", "SEC filing scan candidate should echo manifest selection policy");
assert(autoSecFilingCandidate.profile_metadata.filing_selection_family === "foundational_business_filing", "SEC filing scan candidate should echo manifest selection family");
assert(autoSecFilingCandidate.profile_metadata.filing_selection_reason === "selected_newest_foundational_business_filing", "SEC filing scan candidate should echo manifest selection reason");
assert(autoSecFilingCandidate.profile_metadata.filing_selection_tier === "foundational_business_filing", "SEC filing scan candidate should echo manifest selection tier");
assert(autoSecFilingCandidate.profile_metadata.filing_newer_supported_filing_displaced_count === "0", "SEC filing scan candidate should echo displaced filing count");
assert(autoSecFilingCandidate.profile_metadata.filing_business_prospectus_424b_candidate_count === "0", "SEC filing scan candidate should echo business prospectus 424B count");

runExpectFailure("scripts/build-sec-filing-profiles.mjs", [
  "--as-of",
  "not-a-date",
  "--manifest",
  secFilingManifestPath,
  "--sec-input",
  secFixturePath,
  "--output",
  path.join(fixtureRoot, "invalid-as-of-sec-filing-profiles.json"),
], fixtureRepo, "--as-of must use YYYY-MM-DD");
runExpectFailure("scripts/build-sec-filing-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--manifest",
  secFilingInvalidRetrievedManifestPath,
  "--sec-input",
  secFixturePath,
  "--output",
  path.join(fixtureRoot, "invalid-retrieved-sec-filing-profiles.json"),
], fixtureRepo, "retrieved_at must use YYYY-MM-DD");

run("scripts/build-sec-filing-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--manifest",
  secFilingManifestPath,
  "--sec-input",
  secFixturePath,
  "--output",
  secFilingOutputPath,
], fixtureRepo);
const secFilingProfiles = JSON.parse(readFileSync(secFilingOutputPath, "utf8"));
assert(secFilingProfiles.source === "sec_filing_business_sections", "SEC filing profile artifact should declare filing-section source");
assert(secFilingProfiles.profile_purpose === "issuer_universe_discovery", "SEC filing profile artifact should declare discovery purpose");
assert(secFilingProfiles.selection_strategy === "manifest_filing_sections", "SEC filing profile artifact should record manifest selection strategy");
assert(secFilingProfiles.manifest_row_count === 1, "SEC filing profile artifact should record manifest row count");
assert(secFilingProfiles.profile_text_fields.join(",") === "business_description", "SEC filing profile artifact should declare business description field");
assert(secFilingProfiles.profiles[0].filing_type === "S-1", "SEC filing profile artifact should preserve filing type");
assert(secFilingProfiles.profiles[0].text.includes("CXL memory pooling"), "SEC filing profile artifact should extract business section text");
assert(!secFilingProfiles.profiles[0].text.includes("Table of Contents"), "SEC filing profile artifact should not use table-of-contents business text");
assert(!secFilingProfiles.profiles[0].text.includes("Risk Factors Management"), "SEC filing profile artifact should not use table-of-contents headings as business text");
assert(!secFilingProfiles.profiles[0].text.includes("Execution and customer concentration"), "SEC filing profile artifact should stop before risk factors");
assert(secFilingProfiles.profiles[0].profile_field_texts.business_description.includes("retimer modules"), "SEC filing profile artifact should preserve field-level business text");
assert(secFilingProfiles.profiles[0].filing_content_sha256.length === 64, "SEC filing profile artifact should preserve filing content hash");
assert(secFilingProfiles.filing_cache_hits === 0, "SEC filing profile artifact should count no local-path cache hits");
assert(secFilingProfiles.filing_cache_misses === 0, "SEC filing profile artifact should count no local-path cache misses");
assert(secFilingProfiles.filing_cache_writes === 0, "SEC filing profile artifact should count no local-path cache writes");
assert(secFilingProfiles.filing_ledger_count === 1, "SEC filing profile artifact should ledger local filing content loads");
assert(secFilingProfiles.filing_ledger[0].cache_status === "local_path", "SEC filing profile ledger should mark local filing content");
assert(secFilingProfiles.filing_ledger[0].payload_sha256 === secFilingProfiles.profiles[0].filing_content_sha256, "SEC filing profile ledger should hash the same content used for extraction");
assert(secFilingProfiles.profiles[0].filing_content_cache_status === "local_path", "SEC filing profile should preserve filing content source status");
assert(secFilingProfiles.profiles[0].filing_content_request_attempt_count === 0, "SEC filing profile should not record network attempts for local filing content");
assert(secFilingProfiles.profiles[0].filing_content_request_statuses.length === 0, "SEC filing profile should not record network statuses for local filing content");
assert(secFilingProfiles.profiles[0].filing_accession_number === "0000002001-26-000002", "SEC filing profile artifact should preserve accession number");
assert(secFilingProfiles.profiles[0].filing_primary_document === "arcd-s1a.htm", "SEC filing profile artifact should preserve primary document");
assert(secFilingProfiles.profiles[0].filing_sec_form_original === "S-1/A", "SEC filing profile artifact should preserve original SEC form");
assert(secFilingProfiles.profiles[0].filing_acceptance_datetime === "2026-05-30T18:10:00.000Z", "SEC filing profile artifact should preserve acceptance datetime");
assert(secFilingProfiles.profiles[0].filing_selection_policy === "", "manual SEC filing profile artifact should leave selection policy blank when manifest omitted it");
assert(secFilingProfiles.profiles[0].filing_submission_url.endsWith("CIK0000002001.json"), "SEC filing profile artifact should preserve submissions URL");
assert(secFilingProfiles.profiles[0].extraction_method === "auto_s-1_business_section", "SEC filing profile artifact should record extraction method");
assert(Number.isInteger(secFilingProfiles.profiles[0].extraction_start_offset), "SEC filing profile artifact should record extraction start offset");
assert(Number.isInteger(secFilingProfiles.profiles[0].extraction_end_offset), "SEC filing profile artifact should record extraction end offset");
assert(secFilingProfiles.profiles[0].extraction_section_length >= 40, "SEC filing profile artifact should record extracted section length");

const secFilingScan = runJson("scripts/discover-universe.mjs", [
  "--dry-run",
  "--json",
  "--input",
  secFixturePath,
  "--profile-input",
  secFilingOutputPath,
  "--limit",
  "10",
], fixtureRepo);
const secFilingCandidate = secFilingScan.candidates.find((item) => item.symbol === "ARCD");
assert(secFilingCandidate !== undefined, "SEC filing profile artifact should discover business-section-only candidate");
assert(secFilingCandidate.profile_enriched === true, "SEC filing profile candidate should be profile enriched");
assert(secFilingCandidate.matched_fields.join(",") === "profile_text", "SEC filing profile candidate should match profile text only");
assert(secFilingCandidate.profile_text_fields.join(",") === "business_description", "SEC filing profile candidate should audit business description field");
assert(secFilingCandidate.matched_profile_snippets[0].profile_text_field_ids.join(",") === "business_description", "SEC filing profile candidate should audit exact filing field");
assert(secFilingCandidate.profile_metadata.filing_content_sha256.length === 64, "SEC filing scan candidate should echo filing content hash");
assert(secFilingCandidate.profile_metadata.filing_accession_number === "0000002001-26-000002", "SEC filing scan candidate should echo accession number");
assert(secFilingCandidate.profile_metadata.filing_primary_document === "arcd-s1a.htm", "SEC filing scan candidate should echo primary document");
assert(secFilingCandidate.profile_metadata.filing_sec_form_original === "S-1/A", "SEC filing scan candidate should echo original SEC form");
assert(secFilingCandidate.profile_metadata.extraction_method === "auto_s-1_business_section", "SEC filing scan candidate should echo extraction method");

await withFilingRetryServer((filingUrl) => {
  const remoteManifestPath = path.join(fixtureRoot, "sec-filing-remote-manifest.csv");
  const remoteOutputPath = path.join(fixtureRoot, "sec-filing-remote-profiles.json");
  const remoteCacheOnlyOutputPath = path.join(fixtureRoot, "sec-filing-remote-cache-only-profiles.json");
  const remoteLedgerOutputPath = path.join(fixtureRoot, "sec-filing-remote-ledger.json");
  const remoteCacheDir = path.join(fixtureRoot, "sec-filing-remote-cache");
  writeFileSync(
    remoteManifestPath,
    [
      "symbol,cik,exchange,filing_type,sec_form,source_url,source_published_at,retrieved_at,filing_path,accession_or_document_id,accession_number,primary_document,sec_form_original,acceptance_datetime,report_date,sec_submission_url",
      `ARCD,0000002001,Nasdaq,S-1,S-1/A,${filingUrl},2026-05-30,2026-06-01,,0000002001-26-000002/arcd-s1a.htm,0000002001-26-000002,arcd-s1a.htm,S-1/A,2026-05-30T18:10:00.000Z,2026-05-30,https://data.sec.gov/submissions/CIK0000002001.json`,
    ].join("\n") + "\n",
  );
  run("scripts/build-sec-filing-profiles.mjs", [
    "--as-of",
    "2026-06-01",
    "--manifest",
    remoteManifestPath,
    "--sec-input",
    secFixturePath,
    "--filing-cache-dir",
    remoteCacheDir,
    "--filing-ledger-output",
    remoteLedgerOutputPath,
    "--sec-fetch-retries",
    "1",
    "--sec-retry-delay-ms",
    "1",
    "--output",
    remoteOutputPath,
  ], fixtureRepo);
  const remoteProfiles = JSON.parse(readFileSync(remoteOutputPath, "utf8"));
  const remoteLedger = JSON.parse(readFileSync(remoteLedgerOutputPath, "utf8"));
  assert(remoteProfiles.profile_count === 1, "SEC filing profile builder should emit profiles from fetched filing HTML");
  assert(remoteProfiles.filing_cache_hits === 0, "SEC filing profile builder should not count cache hits on first remote fetch");
  assert(remoteProfiles.filing_cache_misses === 1, "SEC filing profile builder should count cache miss before remote filing fetch");
  assert(remoteProfiles.filing_cache_writes === 1, "SEC filing profile builder should write fetched filing HTML to cache");
  assert(remoteProfiles.filing_ledger[0].cache_status === "cache_miss_fetched", "SEC filing profile ledger should mark fetched cache miss");
  assert(remoteProfiles.filing_ledger[0].request_attempt_count === 2, "SEC filing profile builder should retry one transient filing failure");
  assert(remoteProfiles.filing_ledger[0].request_statuses.join(",") === "503,200", "SEC filing profile ledger should audit filing retry statuses");
  assert(remoteProfiles.profiles[0].filing_content_cache_status === "cache_miss_fetched", "SEC filing profile should preserve fetched cache status");
  assert(remoteProfiles.profiles[0].filing_content_request_statuses.join(",") === "503,200", "SEC filing profile should preserve filing request statuses");
  assert(remoteLedger.filing_ledger_count === 1, "SEC filing profile ledger output should persist remote fetch entries");
  const cacheFiles = readdirSync(remoteCacheDir).filter((file) => file.endsWith(".html"));
  assert(cacheFiles.length === 1, "SEC filing profile builder should write one filing cache file");
  const cachePath = path.join(remoteCacheDir, cacheFiles[0]);
  const cacheMetadataPath = `${cachePath}.metadata.json`;
  assert(existsSync(cacheMetadataPath), "SEC filing profile builder should write filing cache metadata");
  const cacheTime = new Date("2026-06-01T00:00:00.000Z");
  utimesSync(cachePath, cacheTime, cacheTime);
  const cacheMetadata = JSON.parse(readFileSync(cacheMetadataPath, "utf8"));
  cacheMetadata.fetched_at = cacheTime.toISOString();
  cacheMetadata.retrieved_at = cacheTime.toISOString().slice(0, 10);
  writeFileSync(cacheMetadataPath, `${JSON.stringify(cacheMetadata, null, 2)}\n`);
  run("scripts/build-sec-filing-profiles.mjs", [
    "--as-of",
    "2026-06-01",
    "--manifest",
    remoteManifestPath,
    "--sec-input",
    secFixturePath,
    "--filing-cache-dir",
    remoteCacheDir,
    "--cache-only",
    "--output",
    remoteCacheOnlyOutputPath,
  ], fixtureRepo);
  const cacheOnlyProfiles = JSON.parse(readFileSync(remoteCacheOnlyOutputPath, "utf8"));
  assert(cacheOnlyProfiles.filing_cache_hits === 1, "SEC filing profile cache-only run should count cached filing HTML");
  assert(cacheOnlyProfiles.filing_cache_misses === 0, "SEC filing profile cache-only run should not miss cached filing HTML");
  assert(cacheOnlyProfiles.filing_cache_writes === 0, "SEC filing profile cache-only run should not write cached filing HTML");
  assert(cacheOnlyProfiles.filing_cache_only === true, "SEC filing profile cache-only run should record cache-only mode");
  assert(cacheOnlyProfiles.filing_ledger[0].cache_status === "cache_hit", "SEC filing profile cache-only ledger should mark cache hits");
  assert(cacheOnlyProfiles.filing_ledger[0].request_attempt_count === 0, "SEC filing profile cache-only ledger should not record network attempts");
  assert(cacheOnlyProfiles.profiles[0].filing_content_cache_status === "cache_hit", "SEC filing profile should preserve cache hit status");
  const staleMetadata = JSON.parse(readFileSync(cacheMetadataPath, "utf8"));
  writeFileSync(cacheMetadataPath, `${JSON.stringify({
    ...staleMetadata,
    fetched_at: "2026-05-01T00:00:00.000Z",
  }, null, 2)}\n`);
	  runExpectFailure("scripts/build-sec-filing-profiles.mjs", [
	    "--as-of",
	    "2026-06-01",
    "--manifest",
    remoteManifestPath,
    "--sec-input",
    secFixturePath,
    "--filing-cache-dir",
    remoteCacheDir,
    "--cache-only",
    "--output",
    path.join(fixtureRoot, "sec-filing-remote-stale-cache-profiles.json"),
  ], fixtureRepo, "is stale for 2026-06-01");
  const staleRefetchOutputPath = path.join(fixtureRoot, "sec-filing-remote-stale-refetch-profiles.json");
  run("scripts/build-sec-filing-profiles.mjs", [
    "--as-of",
    "2026-06-01",
    "--manifest",
    remoteManifestPath,
    "--sec-input",
    secFixturePath,
    "--filing-cache-dir",
    remoteCacheDir,
    "--sec-fetch-retries",
    "1",
    "--sec-retry-delay-ms",
    "1",
    "--output",
    staleRefetchOutputPath,
  ], fixtureRepo);
  const staleRefetchProfiles = JSON.parse(readFileSync(staleRefetchOutputPath, "utf8"));
  assert(staleRefetchProfiles.filing_cache_hits === 0, "SEC filing profile builder should not count a stale cache as a hit");
  assert(staleRefetchProfiles.filing_cache_misses === 1, "SEC filing profile builder should count a stale cache as a refetch miss");
  assert(staleRefetchProfiles.filing_cache_writes === 1, "SEC filing profile builder should replace stale filing cache content after refetch");
  assert(staleRefetchProfiles.filing_ledger[0].cache_status === "stale_cache_refetched", "SEC filing profile ledger should distinguish a stale-cache refetch from a first fetch");
  writeFileSync(cacheMetadataPath, `${JSON.stringify({
    ...staleMetadata,
    fetched_at: "2026-06-02T00:00:00.000Z",
  }, null, 2)}\n`);
  runExpectFailure("scripts/build-sec-filing-profiles.mjs", [
    "--as-of",
    "2026-06-01",
    "--manifest",
    remoteManifestPath,
    "--sec-input",
    secFixturePath,
    "--filing-cache-dir",
    remoteCacheDir,
    "--cache-only",
    "--output",
	    path.join(fixtureRoot, "sec-filing-remote-future-cache-profiles.json"),
	  ], fixtureRepo, "is after requested as-of 2026-06-01");
	  writeFileSync(cacheMetadataPath, `${JSON.stringify({
	    ...staleMetadata,
	    fetched_at: "2026-02-31T00:00:00.000Z",
	  }, null, 2)}\n`);
	  runExpectFailure("scripts/build-sec-filing-profiles.mjs", [
	    "--as-of",
	    "2026-06-01",
	    "--manifest",
	    remoteManifestPath,
	    "--sec-input",
	    secFixturePath,
	    "--filing-cache-dir",
	    remoteCacheDir,
	    "--cache-only",
	    "--output",
	    path.join(fixtureRoot, "sec-filing-remote-invalid-timestamp-cache-profiles.json"),
	  ], fixtureRepo, "fetched_at date must be a valid calendar date");
	  writeFileSync(cacheMetadataPath, `${JSON.stringify(staleMetadata, null, 2)}\n`);
  const missingManifestPath = path.join(fixtureRoot, "sec-filing-remote-missing-manifest.csv");
  const missingLedgerOutputPath = path.join(fixtureRoot, "sec-filing-remote-missing-ledger.json");
  writeFileSync(
    missingManifestPath,
    [
      "symbol,cik,exchange,filing_type,sec_form,source_url,source_published_at,retrieved_at,filing_path,accession_or_document_id,accession_number,primary_document,sec_form_original,acceptance_datetime,report_date,sec_submission_url",
      `ARCD,0000002001,Nasdaq,S-1,S-1/A,${filingUrl.replace("arcd-s1a.htm", "missing.htm")},2026-05-30,2026-06-01,,0000002001-26-000002/missing.htm,0000002001-26-000002,missing.htm,S-1/A,2026-05-30T18:10:00.000Z,2026-05-30,https://data.sec.gov/submissions/CIK0000002001.json`,
    ].join("\n") + "\n",
  );
  runExpectFailure("scripts/build-sec-filing-profiles.mjs", [
    "--as-of",
    "2026-06-01",
    "--manifest",
    missingManifestPath,
    "--sec-input",
    secFixturePath,
    "--filing-ledger-output",
    missingLedgerOutputPath,
    "--sec-fetch-retries",
    "1",
    "--sec-retry-delay-ms",
    "1",
    "--output",
    path.join(fixtureRoot, "sec-filing-remote-missing-profiles.json"),
  ], fixtureRepo, "filing fetch failed: 404");
  const failedRemoteLedger = JSON.parse(readFileSync(missingLedgerOutputPath, "utf8"));
  assert(failedRemoteLedger.filing_ledger_count === 1, "SEC filing profile failure ledger should record failed filing");
  assert(failedRemoteLedger.filing_ledger[0].validation_status === "failed", "SEC filing profile failure ledger should mark validation failure");
  assert(failedRemoteLedger.filing_ledger[0].request_attempt_count === 1, "SEC filing profile failure ledger should record nonretryable attempt count");
  assert(failedRemoteLedger.filing_ledger[0].request_statuses.join(",") === "404", "SEC filing profile failure ledger should preserve nonretryable status");
});

run("scripts/run-sec-filing-discovery-index.mjs", [
  "--as-of",
  "2026-05-31",
  "--sec-input",
  secFixturePath,
  "--submissions-dir",
  secSubmissionsDir,
  "--filing-dir",
  secFilingLocalDir,
  "--require-local-filings",
  "--symbols",
  "ARCD",
  "--output-prefix",
  secFilingIndexPrefix,
], fixtureRepo);
const secFilingIndexMetadata = JSON.parse(readFileSync(`${secFilingIndexPrefix}-index.metadata.json`, "utf8"));
const secFilingIndexScan = JSON.parse(readFileSync(`${secFilingIndexPrefix}-scan.json`, "utf8"));
assert(secFilingIndexMetadata.index_scope === "targeted_symbols", "SEC filing discovery index should label requested-symbol scope");
assert(secFilingIndexMetadata.coverage.profile_count === 1, "SEC filing discovery index should summarize profile count");
assert(secFilingIndexMetadata.coverage.profile_coverage_status === "targeted_partial", "SEC filing discovery index should preserve partial coverage status");
assert(secFilingIndexMetadata.profile_sha256.length === 64, "SEC filing discovery index should hash the profile artifact");
assert(secFilingIndexScan.candidates.some((item) => item.symbol === "ARCD"), "SEC filing discovery index should run the profile-enriched scan");

run("scripts/build-sec-filing-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--manifest",
  secFilingTenKManifestPath,
  "--sec-input",
  secFixturePath,
  "--output",
  secFilingTenKOutputPath,
], fixtureRepo);
const secFilingTenKProfiles = JSON.parse(readFileSync(secFilingTenKOutputPath, "utf8"));
assert(secFilingTenKProfiles.profile_count === 1, "SEC filing profile artifact should emit 10-K business section profile");
assert(secFilingTenKProfiles.profiles[0].extraction_method === "auto_10-k_business_section", "SEC filing profile artifact should use 10-K item-based extraction");
assert(secFilingTenKProfiles.profiles[0].extraction_warnings.includes("skipped_auto_false_start_count:1"), "SEC filing profile artifact should audit skipped 10-K false starts");
assert(secFilingTenKProfiles.profiles[0].text.includes("Arcadia Systems designs CXL memory pooling"), "SEC filing profile artifact should extract actual 10-K Item 1 business text");
assert(!secFilingTenKProfiles.profiles[0].text.includes("our business plans or objectives"), "SEC filing profile artifact should skip forward-looking generic our-business text");
assert(!secFilingTenKProfiles.profiles[0].text.includes("Table of Contents"), "SEC filing profile artifact should skip table-of-contents Item 1 text");
assert(!secFilingTenKProfiles.profiles[0].text.includes("Execution and customer concentration"), "SEC filing profile artifact should stop 10-K extraction before Item 1A risk factors");

run("scripts/build-sec-filing-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--manifest",
  secFilingEightKManifestPath,
  "--sec-input",
  secFixturePath,
  "--output",
  secFilingEightKOutputPath,
], fixtureRepo);
const secFilingEightKProfiles = JSON.parse(readFileSync(secFilingEightKOutputPath, "utf8"));
assert(secFilingEightKProfiles.profile_count === 1, "SEC filing profile artifact should emit explicitly requested 8-K material-event profile");
assert(secFilingEightKProfiles.profiles[0].extraction_method === "auto_8-k_business_section", "SEC filing profile artifact should use 8-K event extraction");
assert(secFilingEightKProfiles.profiles[0].text.includes("data-center interconnect supply agreement"), "SEC filing profile artifact should extract 8-K material agreement text");
assert(!secFilingEightKProfiles.profiles[0].text.includes("Exhibit index"), "SEC filing profile artifact should stop 8-K extraction before Item 9.01");

run("scripts/build-sec-filing-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--manifest",
  secFilingSixKManifestPath,
  "--sec-input",
  secFixturePath,
  "--output",
  secFilingSixKOutputPath,
], fixtureRepo);
const secFilingSixKProfiles = JSON.parse(readFileSync(secFilingSixKOutputPath, "utf8"));
assert(secFilingSixKProfiles.profile_count === 1, "SEC filing profile artifact should emit explicitly requested 6-K material-event profile");
assert(secFilingSixKProfiles.profiles[0].extraction_method === "auto_6-k_business_section", "SEC filing profile artifact should use 6-K event extraction");
assert(secFilingSixKProfiles.profiles[0].text.includes("sovereign data-center interconnect deployment"), "SEC filing profile artifact should extract 6-K press release text");
assert(!secFilingSixKProfiles.profiles[0].text.includes("Authorized signature"), "SEC filing profile artifact should stop 6-K extraction before signature");

run("scripts/build-sec-filing-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--manifest",
  secFilingS4ManifestPath,
  "--sec-input",
  secFixturePath,
  "--output",
  secFilingS4OutputPath,
], fixtureRepo);
const secFilingS4Profiles = JSON.parse(readFileSync(secFilingS4OutputPath, "utf8"));
assert(secFilingS4Profiles.profile_count === 1, "SEC filing profile artifact should emit explicitly requested S-4 transaction profile");
assert(secFilingS4Profiles.profiles[0].extraction_method === "auto_s-4_business_section", "SEC filing profile artifact should use S-4 transaction extraction");
assert(secFilingS4Profiles.profiles[0].text.includes("rack-scale optical interconnect manufacturing capacity"), "SEC filing profile artifact should extract S-4 transaction summary text");
assert(!secFilingS4Profiles.profiles[0].text.includes("Transaction execution risks"), "SEC filing profile artifact should stop S-4 extraction before risk factors");

run("scripts/build-sec-filing-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--manifest",
  secFilingS1FalseStartManifestPath,
  "--sec-input",
  secFixturePath,
  "--output",
  secFilingS1FalseStartOutputPath,
], fixtureRepo);
const secFilingS1FalseStartProfiles = JSON.parse(readFileSync(secFilingS1FalseStartOutputPath, "utf8"));
assert(secFilingS1FalseStartProfiles.profile_count === 1, "SEC filing profile artifact should emit S-1 business section after skipping false start");
assert(secFilingS1FalseStartProfiles.profiles[0].extraction_warnings.includes("skipped_auto_false_start_count:1"), "SEC filing profile artifact should audit skipped S-1 false starts");
assert(secFilingS1FalseStartProfiles.profiles[0].text.includes("Arcadia Systems builds CXL memory pooling"), "SEC filing profile artifact should extract real S-1 Our Business heading");
assert(!secFilingS1FalseStartProfiles.profiles[0].text.includes("Forward-looking statements"), "SEC filing profile artifact should skip S-1 forward-looking false start");

run("scripts/build-sec-filing-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--manifest",
  secFilingS1SentenceFragmentManifestPath,
  "--sec-input",
  secFixturePath,
  "--output",
  secFilingS1SentenceFragmentOutputPath,
], fixtureRepo);
const secFilingS1SentenceFragmentProfiles = JSON.parse(readFileSync(secFilingS1SentenceFragmentOutputPath, "utf8"));
assert(secFilingS1SentenceFragmentProfiles.profile_count === 1, "SEC filing profile artifact should emit S-1 business section after skipping generic sentence fragments");
assert(secFilingS1SentenceFragmentProfiles.profiles[0].extraction_warnings.includes("skipped_auto_false_start_count:1"), "SEC filing profile artifact should count skipped S-1 sentence-fragment starts");
assert(secFilingS1SentenceFragmentProfiles.profiles[0].extraction_warnings.some((warning) => warning.includes("generic_heading_sentence_fragment")), "SEC filing profile artifact should explain skipped S-1 sentence-fragment starts");
assert(secFilingS1SentenceFragmentProfiles.profiles[0].extraction_start_pattern === "our_business", "SEC filing profile artifact should audit the accepted S-1 start pattern");
assert(secFilingS1SentenceFragmentProfiles.profiles[0].text.includes("Arcadia Systems builds CXL memory pooling"), "SEC filing profile artifact should extract real S-1 business heading after generic sentence fragment");
assert(!secFilingS1SentenceFragmentProfiles.profiles[0].text.includes("Our business depends"), "SEC filing profile artifact should skip generic S-1 our-business sentence fragments");

run("scripts/build-sec-filing-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--manifest",
  secFilingProspectusProfileManifestPath,
  "--sec-input",
  secFixturePath,
  "--output",
  secFilingProspectusProfileOutputPath,
], fixtureRepo);
const secFilingProspectusProfileProfiles = JSON.parse(readFileSync(secFilingProspectusProfileOutputPath, "utf8"));
assert(secFilingProspectusProfileProfiles.profile_count === 1, "SEC filing profile artifact should emit business-rich 424B4 prospectus profile");
assert(secFilingProspectusProfileProfiles.profiles[0].text.includes("Arcadia Systems provides CXL memory pooling"), "SEC filing profile artifact should extract 424B4 prospectus company text");
assert(!secFilingProspectusProfileProfiles.profiles[0].text.includes("Execution and customer concentration"), "SEC filing profile artifact should stop 424B4 extraction before risk factors");

run("scripts/build-sec-filing-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--manifest",
  secFilingProspectusSentenceFragmentManifestPath,
  "--sec-input",
  secFixturePath,
  "--output",
  secFilingProspectusSentenceFragmentOutputPath,
], fixtureRepo);
const secFilingProspectusSentenceFragmentProfiles = JSON.parse(readFileSync(secFilingProspectusSentenceFragmentOutputPath, "utf8"));
assert(secFilingProspectusSentenceFragmentProfiles.profile_count === 1, "SEC filing profile artifact should emit 424B profile after skipping generic our-company sentence fragments");
assert(secFilingProspectusSentenceFragmentProfiles.profiles[0].extraction_warnings.includes("skipped_auto_false_start_count:1"), "SEC filing profile artifact should count skipped 424B sentence-fragment starts");
assert(secFilingProspectusSentenceFragmentProfiles.profiles[0].extraction_warnings.some((warning) => warning.includes("generic_heading_sentence_fragment")), "SEC filing profile artifact should explain skipped 424B sentence-fragment starts");
assert(secFilingProspectusSentenceFragmentProfiles.profiles[0].extraction_start_pattern === "our_company", "SEC filing profile artifact should audit the accepted 424B start pattern");
assert(secFilingProspectusSentenceFragmentProfiles.profiles[0].text.includes("Arcadia Systems provides CXL memory pooling"), "SEC filing profile artifact should extract real 424B company heading after generic sentence fragment");
assert(!secFilingProspectusSentenceFragmentProfiles.profiles[0].text.includes("Our company may not"), "SEC filing profile artifact should skip generic 424B our-company sentence fragments");

run("scripts/build-sec-filing-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--manifest",
  secFilingSupplementOnlyManifestPath,
  "--sec-input",
  secFixturePath,
  "--allow-empty",
  "--output",
  secFilingSupplementOnlyOutputPath,
], fixtureRepo);
const secFilingSupplementOnlyProfiles = JSON.parse(readFileSync(secFilingSupplementOnlyOutputPath, "utf8"));
assert(secFilingSupplementOnlyProfiles.profile_count === 0, "SEC filing profile artifact should not emit supplement-only 424B5 profiles");
assert(secFilingSupplementOnlyProfiles.skipped_symbols.some((entry) => entry.symbol === "ARCD" && entry.reason === "business_section_too_short"), "SEC filing profile artifact should explain supplement-only 424B5 skips");

run("scripts/build-sec-filing-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--manifest",
  secFilingNoBusinessManifestPath,
  "--sec-input",
  secFixturePath,
  "--allow-empty",
  "--output",
  secFilingNoBusinessOutputPath,
], fixtureRepo);
const noBusinessProfiles = JSON.parse(readFileSync(secFilingNoBusinessOutputPath, "utf8"));
assert(noBusinessProfiles.profile_count === 0, "SEC filing profile artifact should not emit TOC-or-risk-only profiles");
assert(noBusinessProfiles.skipped_symbols.some((entry) => entry.symbol === "ARCD" && entry.reason === "missing_business_section_start"), "SEC filing profile artifact should explain missing business-section starts");

run("scripts/build-sec-issuer-profiles.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secFixturePath,
  "--submissions-dir",
  secSubmissionsDir,
  "--symbols",
  "BRS,BRSA",
  "--output",
  secIssuerOutputPath,
], fixtureRepo);
const secIssuerProfiles = JSON.parse(readFileSync(secIssuerOutputPath, "utf8"));
assert(secIssuerProfiles.profile_purpose === "issuer_universe_discovery", "SEC issuer profile artifact should declare discovery purpose");
assert(secIssuerProfiles.source === "sec_submissions_metadata", "SEC issuer profile artifact should declare SEC submissions source");
assert(secIssuerProfiles.selection_strategy === "requested_symbols", "SEC issuer profile artifact should record explicit symbol sampling strategy");
assert(secIssuerProfiles.profile_coverage_strategy === "requested_symbols", "SEC issuer profile artifact should record coverage strategy");
assert(secIssuerProfiles.coverage_scope === "partial_requested_symbols", "SEC issuer profile artifact should mark requested-symbol profile coverage as partial");
assert(secIssuerProfiles.requested_symbols.join(",") === "BRS,BRSA", "SEC issuer profile artifact should preserve requested symbols");
assert(secIssuerProfiles.selected_symbol_count === 2, "SEC issuer profile artifact should record selected symbol count before duplicate-CIK skips");
assert(secIssuerProfiles.eligible_universe_count === 9, "SEC issuer profile artifact should record eligible SEC universe count for the fixture");
assert(secIssuerProfiles.coverage_limit === 2, "SEC issuer profile artifact should record coverage limit");
assert(secIssuerProfiles.profile_count === 1, "SEC issuer profile artifact should include selected SEC symbol");
assert(secIssuerProfiles.skipped_symbols.some((entry) => entry.symbol === "BRSA" && entry.reason === "duplicate_cik:BRS"), "SEC issuer profile artifact should skip duplicate CIK share classes");
assert(secIssuerProfiles.profiles[0].symbol === "BRS", "SEC issuer profile artifact should preserve selected symbol");
assert(!secIssuerProfiles.profiles[0].text.includes("Borealis Systems"), "SEC issuer profile text should exclude issuer name from profile-keyword surface");
assert(secIssuerProfiles.profiles[0].text.includes("Computer Communications Equipment"), "SEC issuer profile artifact should include SIC description");
assert(secIssuerProfiles.profiles[0].text.includes("Non-accelerated filer"), "SEC issuer profile artifact should include category text without relying on it for lane matching");
assert(secIssuerProfiles.profiles[0].profile_field_texts.sicDescription === "Computer Communications Equipment", "SEC issuer profile artifact should preserve field-level SIC text");
assert(secIssuerProfiles.profiles[0].profile_field_texts.category === "Non-accelerated filer", "SEC issuer profile artifact should preserve field-level category text");

const secIssuerScan = runJson("scripts/discover-universe.mjs", [
  "--dry-run",
  "--json",
  "--input",
  secFixturePath,
  "--profile-input",
  secIssuerOutputPath,
  "--limit",
  "10",
], fixtureRepo);
const secIssuerCandidate = secIssuerScan.candidates.find((item) => item.symbol === "BRS");
assert(secIssuerCandidate !== undefined, "SEC issuer profile artifact should discover unknown SEC metadata candidate");
assert(secIssuerCandidate.profile_enriched === true, "SEC issuer profile candidate should be profile enriched");
assert(secIssuerCandidate.matched_fields.join(",") === "profile_text", "SEC issuer profile candidate should match profile text only");
assert(secIssuerCandidate.matched_keywords.includes("communications equipment"), "SEC issuer profile candidate should match profile-only lane keyword");
assert(secIssuerCandidate.matched_keyword_scopes["communications equipment"] === "profile_keywords", "SEC issuer profile candidate should audit profile-only keyword scope");
assert(secIssuerCandidate.profile_text_fields.join(",") === "sicDescription,category,entityType", "SEC issuer profile candidate should audit profile text fields");
assert(secIssuerCandidate.matched_profile_snippets[0].profile_text_field_ids.join(",") === "sicDescription", "SEC issuer profile candidate should audit exact matched profile field");
assert(secIssuerScan.profile_unknown_symbol_count === 1, "SEC issuer profile scan should count unknown profile symbols");
assert(secIssuerScan.profile_enriched_candidate_count === 1, "SEC issuer profile scan should count profile-enriched candidates");

await withRetryServer((baseUrl) => {
  const retryIssuerOutputPath = path.join(fixtureRoot, "sec-issuer-retry-profiles.json");
  run("scripts/build-sec-issuer-profiles.mjs", [
    "--as-of",
    "2026-05-31",
    "--sec-input",
    secFixturePath,
    "--sec-submissions-base-url",
    baseUrl,
    "--sec-fetch-retries",
    "1",
    "--sec-retry-delay-ms",
    "1",
    "--symbols",
    "ARCD",
    "--output",
    retryIssuerOutputPath,
  ], fixtureRepo);
  const retryIssuerProfiles = JSON.parse(readFileSync(retryIssuerOutputPath, "utf8"));
  assert(retryIssuerProfiles.submissions_ledger[0].request_attempt_count === 2, "SEC issuer profile builder should retry one transient submissions failure");
  assert(retryIssuerProfiles.submissions_ledger[0].request_statuses.join(",") === "503,200", "SEC issuer profile builder should audit retry statuses");
});

await withRetryServer((baseUrl) => {
  const retryIssuerOutputPath = path.join(fixtureRoot, "sec-issuer-403-retry-profiles.json");
  run("scripts/build-sec-issuer-profiles.mjs", [
    "--as-of",
    "2026-05-31",
    "--sec-input",
    secFixturePath,
    "--sec-submissions-base-url",
    baseUrl,
    "--sec-fetch-retries",
    "1",
    "--sec-retry-delay-ms",
    "1",
    "--symbols",
    "ARCD",
    "--output",
    retryIssuerOutputPath,
  ], fixtureRepo);
  const retryIssuerProfiles = JSON.parse(readFileSync(retryIssuerOutputPath, "utf8"));
  assert(retryIssuerProfiles.submissions_ledger[0].request_attempt_count === 2, "SEC issuer profile builder should retry one SEC access-control response");
  assert(retryIssuerProfiles.submissions_ledger[0].request_statuses.join(",") === "403,200", "SEC issuer profile builder should audit 403 retry statuses");
}, {
  firstStatus: 403,
  requireSecHeaders: true,
});

run("scripts/build-sec-issuer-profiles.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secCompleteFixturePath,
  "--submissions-cache-dir",
  secSubmissionsDir,
  "--cache-only",
  "--all",
  "--output",
  secIssuerCompleteOutputPath,
], fixtureRepo);
const secIssuerCompleteProfiles = JSON.parse(readFileSync(secIssuerCompleteOutputPath, "utf8"));
assert(secIssuerCompleteProfiles.selection_strategy === "complete_sec_universe", "SEC issuer profile --all should record complete SEC universe selection strategy");
assert(secIssuerCompleteProfiles.profile_coverage_strategy === "complete_sec_universe", "SEC issuer profile --all should record complete SEC universe coverage strategy");
assert(secIssuerCompleteProfiles.coverage_scope === "complete_sec_universe", "SEC issuer profile --all should record complete SEC universe coverage scope");
assert(secIssuerCompleteProfiles.selected_symbol_count === 2, "SEC issuer profile --all should select every eligible SEC issuer");
assert(secIssuerCompleteProfiles.eligible_universe_count === 2, "SEC issuer profile --all should match selected count to eligible count");
assert(secIssuerCompleteProfiles.coverage_limit === 2, "SEC issuer profile --all should record complete coverage limit");
assert(secIssuerCompleteProfiles.requested_symbols.length === 0, "SEC issuer profile --all should not pretend a requested-symbol list is complete coverage");
assert(secIssuerCompleteProfiles.submissions_cache_hits === 2, "SEC issuer profile cache-only run should count cached submissions");
assert(secIssuerCompleteProfiles.submissions_cache_misses === 0, "SEC issuer profile cache-only run should not miss cached submissions");
assert(secIssuerCompleteProfiles.submissions_cache_writes === 0, "SEC issuer profile cache-only run should not write cached submissions");
assert(secIssuerCompleteProfiles.submissions_cache_only === true, "SEC issuer profile cache-only run should record cache-only mode");
assert(secIssuerCompleteProfiles.submissions_ledger_count === 2, "SEC issuer profile cache-only run should record one ledger entry per selected unique CIK");
assert(secIssuerCompleteProfiles.submissions_ledger.length === 2, "SEC issuer profile cache-only run should emit submissions ledger entries");
assert(secIssuerCompleteProfiles.submissions_ledger.every((entry) => entry.cache_status === "cache_hit"), "SEC issuer profile cache-only ledger should mark cache hits");
assert(secIssuerCompleteProfiles.submissions_ledger.every((entry) => entry.validation_status === "validated"), "SEC issuer profile cache-only ledger should mark validated submissions");
assert(secIssuerCompleteProfiles.submissions_ledger.every((entry) => entry.payload_sha256.length === 64), "SEC issuer profile cache-only ledger should hash every submission payload");
assert(secIssuerCompleteProfiles.submissions_ledger.map((entry) => entry.symbol).join(",") === "ARCD,BRS", "SEC issuer profile cache-only ledger should preserve selected CIK order");
assert(secIssuerCompleteProfiles.profiles.length + secIssuerCompleteProfiles.skipped_symbols.length === secIssuerCompleteProfiles.selected_symbol_count, "SEC issuer profile cache-only run should reconcile emitted profiles and skipped symbols to selected coverage");
assert(secIssuerCompleteProfiles.sec_user_agent.includes("winechord-invest"), "SEC issuer profile metadata should record SEC user agent identity");
assert(secIssuerCompleteProfiles.sec_min_complete_universe_request_delay_ms === 100, "SEC issuer profile metadata should record complete-universe SEC rate guard");
const tickerMismatchIssuerPath = path.join(fixtureRoot, "ticker-mismatch-issuer-profiles.json");
const tickerMismatchIssuerLedgerPath = path.join(fixtureRoot, "ticker-mismatch-issuer-ledger.json");
run("scripts/build-sec-issuer-profiles.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secTickerMismatchFixturePath,
  "--submissions-cache-dir",
  secTickerMismatchSubmissionsDir,
  "--cache-only",
  "--all",
  "--allow-empty",
  "--submissions-ledger-output",
  tickerMismatchIssuerLedgerPath,
  "--output",
  tickerMismatchIssuerPath,
], fixtureRepo);
const tickerMismatchIssuerProfiles = JSON.parse(readFileSync(tickerMismatchIssuerPath, "utf8"));
assert(tickerMismatchIssuerProfiles.profile_count === 0, "SEC issuer profile complete run should skip ticker-drifted submissions instead of failing");
assert(tickerMismatchIssuerProfiles.skipped_symbols.some((entry) => entry.symbol === "DRFT" && entry.reason === "sec_submission_identity_conflict:ticker_mismatch"), "SEC issuer profile complete run should explain ticker-drifted submission skips");
const tickerMismatchIssuerLedger = JSON.parse(readFileSync(tickerMismatchIssuerLedgerPath, "utf8"));
assert(tickerMismatchIssuerLedger.submissions_ledger_count === 1, "SEC issuer profile ticker mismatch ledger should record the skipped CIK");
assert(tickerMismatchIssuerLedger.submissions_ledger[0].validation_status === "failed", "SEC issuer profile ticker mismatch ledger should preserve validation failure status");
assert(tickerMismatchIssuerLedger.submissions_ledger[0].error.includes("SEC submissions ticker mismatch"), "SEC issuer profile ticker mismatch ledger should preserve failure reason");
const tickerMismatchIssuerScan = runJson("scripts/discover-universe.mjs", [
  "--dry-run",
  "--json",
  "--input",
  secTickerMismatchFixturePath,
  "--profile-input",
  tickerMismatchIssuerPath,
  "--limit",
  "10",
], fixtureRepo);
assert(tickerMismatchIssuerScan.profile_coverage_status === "complete", "SEC issuer complete profile skips should still count as audited discovery coverage");
assert(tickerMismatchIssuerScan.profile_coverage_gap_count === 0, "SEC issuer complete profile skips should not leave unaudited coverage gaps");
assert(tickerMismatchIssuerScan.issuer_profile_coverage_status === "complete_scope_with_profile_skips", "SEC issuer semantic coverage should still show profile-text skips");
assert(tickerMismatchIssuerScan.issuer_profile_semantic_gap_count === 1, "SEC issuer semantic coverage should count skipped profile text gaps");
runExpectFailure("scripts/build-sec-issuer-profiles.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secTickerMismatchFixturePath,
  "--submissions-cache-dir",
  secTickerMismatchSubmissionsDir,
  "--cache-only",
  "--symbols",
  "DRFT",
  "--output",
  path.join(fixtureRoot, "requested-ticker-mismatch-issuer-profiles.json"),
], fixtureRepo, "SEC submissions ticker mismatch for DRFT");
runExpectFailure("scripts/build-sec-issuer-profiles.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secCompleteFixturePath,
  "--submissions-cache-dir",
  path.join(fixtureRoot, "missing-issuer-cache"),
  "--cache-only",
  "--symbols",
  "ARCD",
  "--output",
  path.join(fixtureRoot, "missing-cache-issuer-profiles.json"),
], fixtureRepo, "Missing cached SEC submissions file");
runExpectFailure("scripts/build-sec-issuer-profiles.mjs", [
  "--as-of",
  "not-a-date",
  "--sec-input",
  secCompleteFixturePath,
  "--submissions-cache-dir",
  secSubmissionsDir,
  "--cache-only",
  "--all",
  "--output",
  path.join(fixtureRoot, "invalid-date-issuer-profiles.json"),
], fixtureRepo, "--as-of must use YYYY-MM-DD");
runExpectFailure("scripts/build-sec-issuer-profiles.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secCompleteFixturePath,
  "--submissions-cache-dir",
  secStaleSubmissionsDir,
  "--cache-only",
  "--all",
  "--output",
  path.join(fixtureRoot, "stale-cache-issuer-profiles.json"),
], fixtureRepo, "is stale for 2026-06-01");
runExpectFailure("scripts/build-sec-issuer-profiles.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secCompleteFixturePath,
  "--submissions-cache-dir",
  secFutureSubmissionsDir,
  "--cache-only",
  "--all",
  "--output",
  path.join(fixtureRoot, "future-cache-issuer-profiles.json"),
], fixtureRepo, "is after requested as-of 2026-06-01");
const mismatchedCacheIssuerPath = path.join(fixtureRoot, "mismatched-cache-issuer-profiles.json");
const mismatchedCacheIssuerLedgerPath = path.join(fixtureRoot, "mismatched-cache-issuer-ledger.json");
runExpectFailure("scripts/build-sec-issuer-profiles.mjs", [
  "--as-of",
  "2026-06-01",
  "--sec-input",
  secCompleteFixturePath,
  "--submissions-cache-dir",
  secMismatchedSubmissionsDir,
  "--cache-only",
  "--all",
  "--submissions-ledger-output",
  mismatchedCacheIssuerLedgerPath,
  "--output",
  mismatchedCacheIssuerPath,
], fixtureRepo, "SEC submissions CIK mismatch for ARCD");
assert(!existsSync(mismatchedCacheIssuerPath), "SEC issuer profile builder should not emit a fresh complete artifact after cache identity failure");
const failedIssuerLedger = JSON.parse(readFileSync(mismatchedCacheIssuerLedgerPath, "utf8"));
assert(failedIssuerLedger.submissions_ledger_count === 1, "SEC issuer profile failure ledger should record failed CIK");
assert(failedIssuerLedger.submissions_ledger[0].symbol === "ARCD", "SEC issuer profile failure ledger should name failed symbol");
assert(failedIssuerLedger.submissions_ledger[0].validation_status === "failed", "SEC issuer profile failure ledger should mark validation failure");
assert(failedIssuerLedger.submissions_ledger[0].error.includes("SEC submissions CIK mismatch"), "SEC issuer profile failure ledger should preserve failure reason");
runExpectFailure("scripts/build-sec-issuer-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--sec-input",
  secCompleteFixturePath,
  "--all",
  "--output",
  path.join(fixtureRoot, "unsafe-live-all-issuer-profiles.json"),
], fixtureRepo, "Live --all SEC submissions fetches require --request-delay-ms >= 100 or --cache-only");

const mismatchSecFixturePath = path.join(fixtureRoot, "sec-mismatch.json");
writeFileSync(
  mismatchSecFixturePath,
  `${JSON.stringify({
    fields: ["cik", "name", "ticker", "exchange"],
    data: [
      [1819994, "Rocket Lab Corp", "RKLB", "NYSE"],
      [1001, "Orbital Launch Systems Inc.", "OLSI", "Nasdaq"],
    ],
  })}\n`,
);
runExpectFailure("scripts/build-discovery-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--sec-input",
  mismatchSecFixturePath,
  "--output",
  path.join(fixtureRoot, "profiles-mismatch.json"),
], fixtureRepo, "SEC reference exchange mismatch");

const duplicateCikRepo = path.join(fixtureRoot, "duplicate-cik-repo");
writeDuplicateCikFixtureRepo(duplicateCikRepo);
runExpectFailure("scripts/build-discovery-profiles.mjs", [
  "--as-of",
  "2026-05-31",
  "--output",
  path.join(fixtureRoot, "profiles-duplicate-cik.json"),
], duplicateCikRepo, "CIK 0000001001 is used by both AAA and BBB");

const issuerMismatchCsvPath = path.join(fixtureRoot, "issuer-mismatch.csv");
writeFileSync(
  issuerMismatchCsvPath,
  [
    "symbol,cik,exchange,source_name,source_url,source_published_at,retrieved_at,text",
    "ARCD,0000009999,Nasdaq,issuer fixture,fixture://issuer/arcd,2026-05-30,2026-05-31,CXL retimer",
  ].join("\n") + "\n",
);
runExpectFailure("scripts/build-issuer-profile-input.mjs", [
  "--input",
  issuerMismatchCsvPath,
  "--sec-input",
  secFixturePath,
  "--output",
  path.join(fixtureRoot, "issuer-mismatch.json"),
], fixtureRepo, "CIK mismatch for ARCD");

console.log("ok discovery profile artifact builder and scanner integration");

function run(script, args, cwd) {
  const result = spawnSync(process.execPath, [path.join(repoRoot, script), ...args], {
    cwd,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`${script} failed:\n${result.stdout}\n${result.stderr}`);
  }
  return result;
}

function runJson(script, args, cwd) {
  const result = run(script, args, cwd);
  return JSON.parse(result.stdout);
}

function runExpectFailure(script, args, cwd, expectedMessage) {
  const result = spawnSync(process.execPath, [path.join(repoRoot, script), ...args], {
    cwd,
    encoding: "utf8",
  });
  if (result.status === 0) {
    throw new Error(`${script} unexpectedly passed`);
  }
  const output = `${result.stdout}\n${result.stderr}`;
  assert(output.includes(expectedMessage), `${script} failure should include ${expectedMessage}, got:\n${output}`);
}

async function withRetryServer(callback, {
  firstStatus = 503,
  requireSecHeaders = false,
} = {}) {
  const portFile = path.join(fixtureRoot, `retry-server-${Math.random().toString(16).slice(2)}.port`);
  const serverScript = path.join(fixtureRoot, `retry-server-${Math.random().toString(16).slice(2)}.mjs`);
  const submissionBody = {
    cik: "0000002001",
    name: "Arcadia Systems Inc.",
    tickers: ["ARCD"],
    exchanges: ["Nasdaq"],
    sicDescription: "Computer Communications Equipment",
    category: "Non-accelerated filer",
    entityType: "operating",
    filings: {
      recent: {
        accessionNumber: ["0000002001-26-000002"],
        acceptanceDateTime: ["2026-05-30T18:10:00.000Z"],
        filingDate: ["2026-05-30"],
        form: ["S-1/A"],
        primaryDocument: ["arcd-s1a.htm"],
        reportDate: ["2026-05-30"],
      },
    },
  };
  writeFileSync(
    serverScript,
    `import { createServer } from "node:http";
import { writeFileSync } from "node:fs";
let attempts = 0;
const body = ${JSON.stringify(JSON.stringify(submissionBody))};
const firstStatus = ${JSON.stringify(firstStatus)};
const requireSecHeaders = ${JSON.stringify(requireSecHeaders)};
const server = createServer((request, response) => {
  attempts += 1;
  if (!request.url.includes("CIK0000002001.json")) {
    response.writeHead(404);
    response.end("not found");
    return;
  }
  const userAgent = String(request.headers["user-agent"] || "");
  const accept = String(request.headers.accept || "");
  if (requireSecHeaders && (!userAgent.includes("winechord-invest") || !accept.includes("application/json"))) {
    response.writeHead(418);
    response.end("missing SEC headers");
    return;
  }
  if (attempts === 1) {
    response.writeHead(firstStatus, { "retry-after": "0" });
    response.end("temporary unavailable");
    return;
  }
  response.writeHead(200, { "content-type": "application/json" });
  response.end(body);
});
server.listen(0, "127.0.0.1", () => {
  writeFileSync(${JSON.stringify(portFile)}, String(server.address().port));
});
`,
  );
  const child = spawn(process.execPath, [serverScript], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  try {
    const port = await waitForPortFile(portFile);
    callback(`http://127.0.0.1:${port}`);
  } finally {
    child.kill();
  }
}

async function waitForPortFile(portFile) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (existsSync(portFile)) {
      return readFileSync(portFile, "utf8").trim();
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });
  }
  throw new Error("retry fixture server did not start");
}

async function withFilingRetryServer(callback) {
  const portFile = path.join(fixtureRoot, `filing-retry-server-${Math.random().toString(16).slice(2)}.port`);
  const serverScript = path.join(fixtureRoot, `filing-retry-server-${Math.random().toString(16).slice(2)}.mjs`);
  const filingBody = [
    "<html><body>",
    "<h1>Our Business</h1>",
    "<p>Arcadia Systems builds CXL memory pooling fabrics, retimer modules, and rack-scale interconnect systems for AI clusters.</p>",
    "<h1>Risk Factors</h1>",
    "<p>Execution and customer concentration risks.</p>",
    "</body></html>",
  ].join("\n");
  writeFileSync(
    serverScript,
    `import { createServer } from "node:http";
import { writeFileSync } from "node:fs";
let attempts = 0;
const body = ${JSON.stringify(filingBody)};
const server = createServer((request, response) => {
  attempts += 1;
  if (!request.url.includes("arcd-s1a.htm")) {
    response.writeHead(404);
    response.end("not found");
    return;
  }
  if (attempts === 1) {
    response.writeHead(503, { "retry-after": "0" });
    response.end("temporary unavailable");
    return;
  }
  response.writeHead(200, { "content-type": "text/html" });
  response.end(body);
});
server.listen(0, "127.0.0.1", () => {
  writeFileSync(${JSON.stringify(portFile)}, String(server.address().port));
});
`,
  );
  const child = spawn(process.execPath, [serverScript], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  try {
    const port = await waitForPortFile(portFile);
    callback(`http://127.0.0.1:${port}/arcd-s1a.htm`);
  } finally {
    child.kill();
  }
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

function writeFixtureRepo(root) {
  mkdirSync(path.join(root, "data/market"), { recursive: true });
  mkdirSync(path.join(root, "research/discovery"), { recursive: true });
  mkdirSync(path.join(root, "research"), { recursive: true });
  writeFileSync(
    path.join(root, "data/market/security_master.csv"),
    [
      "symbol,name,exchange,asset_type,tradability,market_data_symbol,sec_cik,tradingview_symbol,tradingview_url,stockanalysis_url,notes",
      "RKLB,Rocket Lab,NASDAQ,common_stock,tradable,RKLB,0001819994,,,,",
      "OLSI,Orbital Launch Systems Inc.,NASDAQ,common_stock,tradable,OLSI,0000001001,,,,",
      "PRIVATE,Private Candidate,private,private_company,not_tradable,,,,,,",
      "PREF,Preferred Candidate,NASDAQ,preferred_stock,tradable,PREF,0000002000,,,,",
    ].join("\n") + "\n",
  );
  [
    "research/old-rklb.md",
    "research/new-rklb.md",
    "research/olsi.md",
    "research/private.md",
    "research/pref.md",
  ].forEach((file) => writeFileSync(path.join(root, file), `${file}\n`));
  writeFileSync(
    path.join(root, "research/company-analysis.yml"),
    `entries:
  - id: old-rklb
    symbol: RKLB
    analyzed_at: "2026-05-01"
    summary: old summary
    upside_path: old upside
    risk_watch: old risk
    source_path: research/old-rklb.md
  - id: new-rklb
    symbol: RKLB
    analyzed_at: "2026-05-31"
    summary: Rocket Lab has launch and spacecraft infrastructure exposure.
    upside_path: Compound through orbital infrastructure and space systems despite satellite-account sizing limits.
    risk_watch: Execution and dilution.
    source_path: research/new-rklb.md
  - id: olsi
    symbol: OLSI
    analyzed_at: "2026-05-31"
    summary: Orbital Launch Systems is a launch candidate.
    upside_path: Build orbital launch services.
    risk_watch: Execution risk.
    source_path: research/olsi.md
  - id: private
    symbol: PRIVATE
    analyzed_at: "2026-05-31"
    summary: Private candidate.
    upside_path: No direct public security.
    risk_watch: Not tradable.
    source_path: research/private.md
  - id: pref
    symbol: PREF
    analyzed_at: "2026-05-31"
    summary: Preferred-share candidate.
    upside_path: Not a common stock.
    risk_watch: Unsupported security type.
    source_path: research/pref.md
`,
  );
  writeFileSync(
    path.join(root, "research/discovery/lanes.yml"),
    `schema_version: 1
as_of: 2026-05-31
lanes:
  - id: space_infrastructure
    name: Space Infrastructure
    status: active
    screen_keywords:
      - launch
      - spacecraft
      - orbital
    current_public_proxies:
      - RKLB
  - id: unknown_future_bottlenecks
    name: Unknown Future Bottlenecks
    status: emerging
    screen_keywords:
      - platform
    current_public_proxies: []
  - id: semiconductor_interconnect_and_memory
    name: Semiconductor Interconnect And Memory
    status: active
    screen_keywords:
      - CXL
      - retimer
      - interconnect
    profile_keywords:
      - communications equipment
    current_public_proxies: []
`,
  );
  writeFileSync(
    path.join(root, "research/watchlist.csv"),
    "symbol,status\nRKLB,active_core_candidate\n",
  );
  writeFileSync(
    path.join(root, "research/discovery/candidates.csv"),
    "symbol,status\n",
  );
}

function writeDuplicateCikFixtureRepo(root) {
  mkdirSync(path.join(root, "data/market"), { recursive: true });
  mkdirSync(path.join(root, "research"), { recursive: true });
  writeFileSync(
    path.join(root, "data/market/security_master.csv"),
    [
      "symbol,name,exchange,asset_type,tradability,market_data_symbol,sec_cik,tradingview_symbol,tradingview_url,stockanalysis_url,notes",
      "AAA,Aaa Inc,NASDAQ,common_stock,tradable,AAA,0000001001,,,,",
      "BBB,Bbb Inc,NASDAQ,common_stock,tradable,BBB,0000001001,,,,",
    ].join("\n") + "\n",
  );
  writeFileSync(path.join(root, "research/aaa.md"), "aaa\n");
  writeFileSync(path.join(root, "research/bbb.md"), "bbb\n");
  writeFileSync(
    path.join(root, "research/company-analysis.yml"),
    `entries:
  - id: aaa
    symbol: AAA
    analyzed_at: "2026-05-31"
    summary: Aaa launch infrastructure.
    upside_path: Aaa orbital path.
    risk_watch: Aaa risk.
    source_path: research/aaa.md
  - id: bbb
    symbol: BBB
    analyzed_at: "2026-05-31"
    summary: Bbb launch infrastructure.
    upside_path: Bbb orbital path.
    risk_watch: Bbb risk.
    source_path: research/bbb.md
`,
  );
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
