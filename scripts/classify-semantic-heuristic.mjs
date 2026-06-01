import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import {
  currentSemanticCacheRecords,
  readJson,
  readJsonl,
  requireNextArg,
  semanticCacheKeyForPacket,
  semanticClassifierVersion,
  semanticClassificationSchemaVersion,
  strictDate,
  writeJsonl,
} from "./semantic-discovery-lib.mjs";

const defaultLaneMap = "research/discovery/lanes.yml";
const megaCapSymbols = new Set([
  "AAPL",
  "ADBE",
  "AMAT",
  "AMD",
  "AMZN",
  "AVGO",
  "CSCO",
  "GOOG",
  "GOOGL",
  "IBM",
  "INTC",
  "META",
  "MSFT",
  "NFLX",
  "NVDA",
  "ORCL",
  "QCOM",
  "TSLA",
]);

const securityRejectionPatterns = [
  ["blank_check_or_spac", /\b(acquisition\b.*\bcorp|acquisition corporation|blank check|spac)\b/i],
  ["fund_or_etf", /\b(fund|etf|closed[- ]end|investment trust|income trust|portfolio)\b/i],
  ["preferred_or_depositary_share", /\b(preferred|depositary share|series [a-z])\b/i],
  ["unit_or_warrant_or_right", /\b(unit|warrant|right)\b/i],
  ["biotech_or_healthcare_name_collision", /\b(pharma|pharmaceutical|biopharma|biotechnology|therapeutics|biomedical|clinical|medical|healthcare)\b/i],
  ["green_fuel_name_collision", /\b(green fuel|fuel green|hydrogen fuel)\b/i],
];
const genericLaneKeywords = new Set([
  "artificial intelligence",
  "computer processing",
  "compute",
  "connectivity",
  "data preparation",
  "electronic computers",
  "grid",
  "infrastructure",
  "mission critical",
  "network",
  "platform",
  "semiconductors & related devices",
]);
const highSpecificityPatterns = [
  /\bai cloud\b/i,
  /\bapplied digital\b/i,
  /\bastera\b/i,
  /\bcerebras\b/i,
  /\bcoreweave\b/i,
  /\bdata[ -]?center\b/i,
  /\bdirect[- ]to[- ]device\b/i,
  /\bgpu\b/i,
  /\bhaleu\b/i,
  /\bhbm\b/i,
  /\binterconnect\b/i,
  /\bionq\b/i,
  /\bliquid cooling\b/i,
  /\bmobile satellite\b/i,
  /\bnebius\b/i,
  /\bnuclear\b/i,
  /\boklo\b/i,
  /\borbital\b/i,
  /\bpost[- ]quantum\b/i,
  /\bquantum\b/i,
  /\bqubit\b/i,
  /\bretimer\b/i,
  /\brocket\b/i,
  /\bsatellite\b/i,
  /\bspacecraft\b/i,
  /\bstablecoin\b/i,
  /\busdc\b/i,
];

const options = parseArgs(process.argv.slice(2));
const packetArtifact = readJson(options.packets);
const packets = packetArtifact.packets ?? [];
const packetBySymbol = new Map(packets.map((packet) => [packet.symbol, packet]));
const existingRecords = options.cache === undefined ? [] : readJsonl(options.cache);
const currentCache = currentSemanticCacheRecords({
  laneMapSha256: packetArtifact.lane_map_sha256,
  packetBySymbol,
  records: existingRecords,
}).current;
const lanes = loadLanes(options.laneMap);
const results = packets
  .filter((packet) => options.includeCached || !currentCache.has(semanticCacheKeyForPacket(packet, packetArtifact.lane_map_sha256)))
  .map((packet) =>
    classifyPacket({
      laneMapSha256: packetArtifact.lane_map_sha256,
      lanes,
      packet,
    }),
  );

writeJsonl(options.output, results);
console.log(`Wrote ${results.length} heuristic semantic classifications to ${options.output}.`);

function parseArgs(args) {
  const parsed = {
    includeCached: false,
    laneMap: defaultLaneMap,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
      index += 1;
    } else if (arg === "--packets") {
      parsed.packets = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--cache") {
      parsed.cache = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--lane-map") {
      parsed.laneMap = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--include-cached") {
      parsed.includeCached = true;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }
  ["asOf", "packets", "output"].forEach((field) => {
    if (parsed[field] === undefined) {
      throw new Error(`--${field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)} is required`);
    }
  });
  return parsed;
}

function loadLanes(file) {
  const parsed = parseYaml(readFileSync(file, "utf8"));
  return (parsed.lanes ?? []).map((lane) => ({
    id: String(lane.id ?? ""),
    currentPublicProxies: new Set((lane.current_public_proxies ?? []).map((symbol) => String(symbol).toUpperCase())),
    profileKeywords: (lane.profile_keywords ?? []).map((keyword) => String(keyword).toLowerCase()),
    screenKeywords: (lane.screen_keywords ?? []).map((keyword) => String(keyword).toLowerCase()),
    status: String(lane.status ?? ""),
  })).filter((lane) => lane.id !== "");
}

function classifyPacket({
  laneMapSha256,
  lanes,
  packet,
}) {
  const text = packetSearchText(packet);
  const matched = matchedLanes({
    lanes,
    packet,
    text,
  });
  const rejectionFlags = obviousRejectionFlags(packet, text);
  const exactProxyMatch = matched.some((match) => match.exactProxy);
  const specificKeywordMatch = matched.some((match) =>
    match.matchedKeywords.some((keyword) => !genericLaneKeywords.has(keyword)),
  ) || highSpecificityPatterns.some((pattern) => pattern.test(packetSearchText(packet)));
  const strongKeywordMatch = exactProxyMatch || specificKeywordMatch;
  const hasLaneMatch = matched.length > 0;
  const companyStage = classifyStage(packet, text);
  const tooLargeMature = companyStage === "too_large_mature";
  const exposure = bottleneckExposure({
    exactProxyMatch,
    hasLaneMatch,
    rejectionFlags,
    strongKeywordMatch,
    tooLargeMature,
  });
  const directness = directnessFor({
    exactProxyMatch,
    exposure,
    hasLaneMatch,
    rejectionFlags,
    strongKeywordMatch,
  });
  const escalation = escalationFor({
    companyStage,
    exactProxyMatch,
    exposure,
    hasLaneMatch,
    packet,
    rejectionFlags,
    specificKeywordMatch,
    strongKeywordMatch,
    tooLargeMature,
  });
  const fit = extremeUpsideFit({
    companyStage,
    directness,
    escalation,
    exposure,
    tooLargeMature,
  });
  const evidenceBlock = primaryEvidenceBlock(packet, matched);
  return {
    bottleneck_exposure: exposure,
    business_plain_english: businessPlainEnglish(packet, evidenceBlock),
    cik: packet.cik,
    classification_schema_version: semanticClassificationSchemaVersion,
    classifier_version: semanticClassifierVersion,
    company_stage: companyStage,
    confidence: confidenceFor({
      exactProxyMatch,
      exposure,
      matched,
      rejectionFlags,
    }),
    directness,
    escalation,
    evidence_refs: [
      {
        packet_text_block_id: evidenceBlock.block_id,
        retrieved_at: evidenceBlock.retrieved_at,
        source_published_at: evidenceBlock.source_published_at,
        source_url: evidenceBlock.source_url,
      },
    ],
    extreme_upside_fit: fit,
    issuer_packet_hash: packet.issuer_packet_hash,
    lane_map_sha256: laneMapSha256,
    matched_lane_ids: matched.map((match) => match.id),
    notes: notesFor({
      exactProxyMatch,
      exposure,
      matched,
      rejectionFlags,
      tooLargeMature,
    }),
    obvious_rejection_flags: rejectionFlags,
    reasoning_level: "low",
    symbol: packet.symbol,
  };
}

function packetSearchText(packet) {
  return [
    packet.symbol,
    packet.name,
    packet.watchlist_status,
    packet.discovery_candidate_status,
    ...(packet.source_blocks ?? []).map((block) => block.text),
  ].join(" ").toLowerCase();
}

function packetProfileText(packet) {
  return (packet.source_blocks ?? [])
    .map((block) => block.text)
    .join(" ")
    .toLowerCase();
}

function matchedLanes({
  lanes,
  packet,
  text,
}) {
  return lanes
    .map((lane) => {
      const exactProxy = lane.currentPublicProxies.has(packet.symbol);
      const matchedScreenKeywords = lane.screenKeywords.filter((keyword) => keyword !== "" && textMatchesKeyword(text, keyword));
      const profileText = packetProfileText(packet);
      const matchedProfileKeywords = lane.profileKeywords.filter((keyword) => keyword !== "" && textMatchesKeyword(profileText, keyword));
      const matchedKeywords = [...matchedScreenKeywords, ...matchedProfileKeywords];
      const profileKeywordHit = matchedKeywords.some((keyword) =>
        [
          "electronic computers",
          "computer processing",
          "data preparation",
          "semiconductors & related devices",
        ].includes(keyword),
      );
      return {
        exactProxy,
        id: lane.id,
        keywordCount: matchedKeywords.length,
        matchedKeywords,
        profileKeywordHit,
      };
    })
    .filter((match) => match.exactProxy || match.keywordCount > 0)
    .sort((left, right) => left.id.localeCompare(right.id));
}

function textMatchesKeyword(text, keyword) {
  const normalizedKeyword = keyword.replace(/\s+/g, " ").trim();
  if (normalizedKeyword === "") {
    return false;
  }
  const escaped = escapeRegExp(normalizedKeyword);
  if (normalizedKeyword.includes(" ")) {
    return new RegExp(`(^|[^a-z0-9])${escaped.replace(/\\ /g, "\\s+")}([^a-z0-9]|$)`, "i").test(text);
  }
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function obviousRejectionFlags(packet, text) {
  const flags = securityRejectionPatterns
    .filter(([, pattern]) => pattern.test(text))
    .map(([flag]) => flag);
  if (/[-.](U|W|WS|WT|R)$/.test(packet.symbol) && packet.symbol.length > 2) {
    flags.push("ticker_suffix_unit_warrant_or_right");
  }
  if (/[-.]P[A-Z]$/.test(packet.symbol) && packet.symbol.length > 3) {
    flags.push("ticker_suffix_preferred_share");
  }
  return [...new Set(flags)].sort();
}

function classifyStage(packet, text) {
  if (megaCapSymbols.has(packet.symbol)) {
    return "too_large_mature";
  }
  if (text.includes("emerging growth company")) {
    return "newly_public";
  }
  if (text.includes("large accelerated filer")) {
    return "mature";
  }
  if (text.includes("non-accelerated filer") || text.includes("accelerated filer")) {
    return "growth";
  }
  return "unknown";
}

function bottleneckExposure({
  exactProxyMatch,
  hasLaneMatch,
  rejectionFlags,
  strongKeywordMatch,
  tooLargeMature,
}) {
  if (rejectionFlags.length > 0) {
    return hasLaneMatch ? "weak" : "none";
  }
  if (exactProxyMatch && !tooLargeMature) {
    return "strong";
  }
  if (strongKeywordMatch && !tooLargeMature) {
    return "possible";
  }
  if (hasLaneMatch) {
    return "weak";
  }
  return "none";
}

function directnessFor({
  exactProxyMatch,
  exposure,
  hasLaneMatch,
  rejectionFlags,
  strongKeywordMatch,
}) {
  if (rejectionFlags.length > 0 || exposure === "none") {
    return "none";
  }
  if (exactProxyMatch) {
    return "direct";
  }
  if (strongKeywordMatch) {
    return "indirect";
  }
  if (hasLaneMatch) {
    return "weak_proxy";
  }
  return "unknown";
}

function escalationFor({
  companyStage,
  exactProxyMatch,
  exposure,
  hasLaneMatch,
  packet,
  rejectionFlags,
  specificKeywordMatch,
  strongKeywordMatch,
  tooLargeMature,
}) {
  if (rejectionFlags.length > 0) {
    return hasLaneMatch ? "reject_or_archive" : "none";
  }
  if (tooLargeMature || exposure === "none") {
    return "none";
  }
  if (
    exactProxyMatch ||
    packet.watchlist_status !== "" ||
    packet.discovery_candidate_status !== "" ||
    (specificKeywordMatch && ["newly_public", "early", "growth", "unknown"].includes(companyStage))
  ) {
    return "xhigh_readiness_candidate";
  }
  if (hasLaneMatch) {
    return "medium_lane_compare";
  }
  return "none";
}

function extremeUpsideFit({
  companyStage,
  directness,
  escalation,
  exposure,
  tooLargeMature,
}) {
  if (tooLargeMature || exposure === "none") {
    return "unlikely";
  }
  if (escalation === "xhigh_readiness_candidate" && directness === "direct") {
    return "strong";
  }
  if (["newly_public", "growth", "unknown"].includes(companyStage) && exposure !== "none") {
    return "possible";
  }
  return "unknown";
}

function confidenceFor({
  exactProxyMatch,
  exposure,
  matched,
  rejectionFlags,
}) {
  if (exactProxyMatch || rejectionFlags.length > 0 || exposure === "none") {
    return "high";
  }
  if (matched.some((match) => match.keywordCount >= 2)) {
    return "medium";
  }
  return "low";
}

function primaryEvidenceBlock(packet, matched) {
  const blocks = packet.source_blocks ?? [];
  const keywordTexts = new Set(matched.flatMap((match) => match.matchedKeywords));
  return blocks.find((block) => {
    const text = String(block.text ?? "").toLowerCase();
    return [...keywordTexts].some((keyword) => text.includes(keyword));
  }) ?? blocks.find((block) => block.retrieved_at !== "") ?? blocks[0];
}

function businessPlainEnglish(packet, evidenceBlock) {
  const profileText = String(evidenceBlock.text ?? "")
    .replace(/<br>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (profileText !== "" && profileText.toUpperCase() !== packet.name.toUpperCase()) {
    return `${packet.name} is a SEC-listed issuer described by the packet as: ${profileText}.`;
  }
  return `${packet.name} is a SEC-listed issuer; the current packet contains only name-level business evidence.`;
}

function notesFor({
  exactProxyMatch,
  exposure,
  matched,
  rejectionFlags,
  tooLargeMature,
}) {
  if (rejectionFlags.length > 0) {
    return `Low-cost screen flagged security or issuer form risk: ${rejectionFlags.join("; ")}.`;
  }
  if (tooLargeMature) {
    return "Low-cost screen found at most a large mature issuer; this is unlikely to serve the satellite account's extreme asymmetry lane without a separate thesis.";
  }
  if (exactProxyMatch) {
    return "Low-cost screen matched a current public proxy; requires normal freshness, valuation, and readiness review before any action.";
  }
  if (exposure === "possible") {
    return `Low-cost screen matched lane keywords: ${matched.flatMap((match) => match.matchedKeywords).join("; ")}.`;
  }
  if (exposure === "weak") {
    return "Low-cost screen found only weak or generic lane evidence; keep cached unless fresher source evidence changes the packet.";
  }
  return "Low-cost screen found no current lane evidence in the bounded issuer packet.";
}
