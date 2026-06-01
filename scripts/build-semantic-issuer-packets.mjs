import { existsSync, readFileSync } from "node:fs";
import {
  csvRecords,
  fileSha256,
  loadLaneMapMetadata,
  loadSecCompanyList,
  padCik,
  relativePath,
  requireNextArg,
  selectCompanies,
  semanticPacketSchemaVersion,
  stableSha256,
  strictDate,
  writeJson,
} from "./semantic-discovery-lib.mjs";

const defaultLimit = 50;
const defaultLaneMap = "research/discovery/lanes.yml";
const defaultSecurityMaster = "data/market/security_master.csv";
const defaultWatchlist = "research/watchlist.csv";
const defaultDiscoveryCandidates = "research/discovery/candidates.csv";
const defaultCompanyMetrics = "data/market/company_metrics.csv";
const maxTextBlockLength = 2400;

const options = parseArgs(process.argv.slice(2));
const generatedAt = options.generatedAt ?? new Date().toISOString();
const secInput = await loadSecCompanyList(options.secInput);
const laneMap = loadLaneMapMetadata(options.laneMap);
const selectedCompanies = selectCompanies(secInput.companies, options);
const profileInputs = loadProfileInputs(options.profileInputs);
const securityBySymbol = rowsBySymbol(options.securityMaster);
const watchlistBySymbol = rowsBySymbol(options.watchlist);
const discoveryBySymbol = rowsBySymbol(options.discoveryCandidates);
const metricsBySymbol = latestRowsBySymbol(csvRecords(options.companyMetrics), "as_of");
const packets = selectedCompanies.map((company) =>
  issuerPacket({
    company,
    discoveryBySymbol,
    laneMap,
    metricsBySymbol,
    profileInputs,
    securityBySymbol,
    watchlistBySymbol,
  }),
);

const result = {
  schema_version: 1,
  source: "semantic_issuer_packets",
  generated_at: generatedAt,
  as_of: options.asOf,
  packet_schema_version: semanticPacketSchemaVersion,
  sec_input_source: secInput.source,
  sec_input_row_count: secInput.rowCount,
  sec_input_sha256: secInput.sha256,
  eligible_universe_count: secInput.companies.filter((company) =>
    selectedCompanyEligible(company),
  ).length,
  selection_strategy: selectionStrategy(options),
  requested_symbols: options.symbols ?? [],
  selected_symbol_count: selectedCompanies.length,
  packet_count: packets.length,
  packet_hash_algorithm: "sha256_stable_json_without_issuer_packet_hash",
  lane_map_path: laneMap.path,
  lane_map_as_of: laneMap.asOf,
  lane_map_sha256: laneMap.sha256,
  lane_map_lane_ids: laneMap.ids,
  profile_input_files: profileInputs.map((input) => ({
    path: input.path,
    sha256: input.sha256,
    source: input.source,
    profile_purpose: input.profile_purpose,
    profile_count: input.profile_count,
  })),
  market_context_files: marketContextFiles(options),
  cache_invalidation_policy: [
    "issuer_identity_hash_change",
    "issuer_packet_hash_change",
    "lane_map_sha256_change",
    "new_material_filing_or_event",
    "material_price_or_market_cap_change",
    "classification_schema_version_change",
    "classifier_version_change",
  ],
  packets,
};

writeJson(options.output, result);
console.log(`Wrote semantic issuer packets to ${options.output}.`);

function parseArgs(args) {
  const parsed = {
    all: false,
    companyMetrics: defaultCompanyMetrics,
    discoveryCandidates: defaultDiscoveryCandidates,
    laneMap: defaultLaneMap,
    limit: defaultLimit,
    profileInputs: [],
    securityMaster: defaultSecurityMaster,
    watchlist: defaultWatchlist,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
      index += 1;
    } else if (arg === "--generated-at") {
      parsed.generatedAt = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--sec-input") {
      parsed.secInput = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--profile-input") {
      parsed.profileInputs.push(requireNextArg(args, index, arg));
      index += 1;
    } else if (arg === "--lane-map") {
      parsed.laneMap = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--security-master") {
      parsed.securityMaster = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--watchlist") {
      parsed.watchlist = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--discovery-candidates") {
      parsed.discoveryCandidates = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--company-metrics") {
      parsed.companyMetrics = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--symbols") {
      parsed.symbols = requireNextArg(args, index, arg)
        .split(",")
        .map((symbol) => symbol.trim().toUpperCase())
        .filter(Boolean);
      index += 1;
    } else if (arg === "--all") {
      parsed.all = true;
    } else if (arg === "--limit") {
      parsed.limit = Number(requireNextArg(args, index, arg));
      if (!Number.isInteger(parsed.limit) || parsed.limit <= 0) {
        throw new Error("--limit must be a positive integer");
      }
      index += 1;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }
  if (parsed.asOf === undefined) {
    throw new Error("--as-of is required");
  }
  if (parsed.output === undefined) {
    throw new Error("--output is required");
  }
  if (parsed.all && parsed.symbols !== undefined) {
    throw new Error("--all cannot be combined with --symbols");
  }
  return parsed;
}

function selectedCompanyEligible(company) {
  const exchange = String(company.exchange ?? "");
  const symbol = String(company.ticker ?? "").trim();
  const cik = String(company.cik ?? "").replace(/^0+/, "") || "0";
  return symbol !== "" && cik !== "0" && ["Nasdaq", "NYSE", "NYSE American"].includes(exchange);
}

function selectionStrategy(options) {
  if (options.symbols !== undefined) {
    return "requested_symbols";
  }
  if (options.all) {
    return "complete_sec_universe";
  }
  return "first_n";
}

function marketContextFiles(options) {
  return [
    options.securityMaster,
    options.watchlist,
    options.discoveryCandidates,
    options.companyMetrics,
  ]
    .filter((file) => existsSync(file))
    .map((file) => ({
      path: relativePath(file),
      sha256: fileSha256(file),
    }));
}

function loadProfileInputs(files) {
  return files.map((file) => {
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    if (!Array.isArray(parsed.profiles)) {
      throw new Error(`${file} must contain profiles array`);
    }
    return {
      path: relativePath(file),
      sha256: fileSha256(file),
      source: String(parsed.source ?? ""),
      profile_purpose: String(parsed.profile_purpose ?? ""),
      profile_count: parsed.profile_count ?? parsed.profiles.length,
      profiles: parsed.profiles,
    };
  });
}

function rowsBySymbol(file) {
  return new Map(csvRecords(file).map((row) => [String(row.symbol ?? "").toUpperCase(), row]));
}

function latestRowsBySymbol(rows, dateField) {
  const latest = new Map();
  rows.forEach((row) => {
    const symbol = String(row.symbol ?? "").toUpperCase();
    if (symbol === "") {
      return;
    }
    const current = latest.get(symbol);
    if (current === undefined || String(row[dateField] ?? "") >= String(current[dateField] ?? "")) {
      latest.set(symbol, row);
    }
  });
  return latest;
}

function issuerPacket({
  company,
  discoveryBySymbol,
  laneMap,
  metricsBySymbol,
  profileInputs,
  securityBySymbol,
  watchlistBySymbol,
}) {
  const symbol = String(company.ticker ?? "").trim().toUpperCase();
  const cik = padCik(company.cik);
  const identity = {
    cik,
    exchange: String(company.exchange ?? "").trim(),
    name: String(company.name ?? "").trim(),
    symbol,
  };
  const textBlocks = [
    {
      block_id: "sec_reference_name",
      source_name: "SEC company ticker exchange reference",
      source_url: "",
      source_published_at: "not listed on SEC reference file",
      retrieved_at: "",
      text: identity.name,
      text_sha256: stableSha256(identity.name),
    },
  ];
  profileInputs.forEach((input) => {
    input.profiles
      .filter((profile) =>
        String(profile.symbol ?? "").toUpperCase() === symbol &&
        padCik(profile.cik) === cik,
      )
      .forEach((profile, index) => {
        const text = boundedText(String(profile.text ?? profile.profile_text ?? ""));
        if (text === "") {
          return;
        }
        textBlocks.push({
          block_id: `${input.source || "profile"}_${index + 1}`,
          source_name: String(profile.source_name ?? input.source ?? "profile_input"),
          source_url: String(profile.source_url ?? ""),
          source_published_at: String(profile.source_published_at ?? ""),
          retrieved_at: String(profile.retrieved_at ?? ""),
          text,
          text_sha256: stableSha256(text),
        });
      });
  });
  const security = securityBySymbol.get(symbol) ?? {};
  const watchlist = watchlistBySymbol.get(symbol) ?? {};
  const discoveryCandidate = discoveryBySymbol.get(symbol) ?? {};
  const metrics = metricsBySymbol.get(symbol) ?? {};
  const packetBase = {
    cik,
    discovery_candidate_status: discoveryCandidate.status ?? "",
    exchange: identity.exchange,
    identity_hash: stableSha256(identity),
    lane_map_sha256: laneMap.sha256,
    market_context: {
      market_cap: metrics.market_cap ?? "",
      market_data_symbol: security.market_data_symbol ?? "",
      price_to_sales: metrics.price_to_sales ?? "",
      tradability: security.tradability ?? "",
    },
    name: identity.name,
    packet_schema_version: semanticPacketSchemaVersion,
    source_blocks: textBlocks,
    symbol,
    watchlist_status: watchlist.status ?? "",
  };
  return {
    ...packetBase,
    issuer_packet_hash: stableSha256(packetBase),
    invalidation_triggers: [
      "issuer_identity_hash_change",
      "source_block_hash_change",
      "lane_map_sha256_change",
      "new_material_filing_or_event",
      "material_price_or_market_cap_change",
      "classification_schema_version_change",
      "classifier_version_change",
    ],
  };
}

function boundedText(text) {
  return text.trim().replace(/\s+/g, " ").slice(0, maxTextBlockLength);
}
