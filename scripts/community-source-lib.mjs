import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import {
  countBy,
  csvRecords,
  requireNextArg,
  sha256,
  strictDate,
} from "./semantic-discovery-lib.mjs";

export const communityScanSchemaVersion = 1;
export const defaultCommunitySourcesFile = "research/community-sources.yml";
export const defaultCommunityCacheDir = "research/cache/community";
export const defaultDiscoveryCandidatesFile = "research/discovery/candidates.csv";
export const defaultLaneMapFile = "research/discovery/lanes.yml";
export const defaultSecurityMasterFile = "data/market/security_master.csv";
export const defaultWatchlistFile = "research/watchlist.csv";

const defaultUserAgent = "winechord-invest/1.0 (public no-token community lead scan)";
const defaultMaxSampleUrls = 5;
const curlTimeoutSeconds = 20;
const communitySignalScoreSourceWeight = 3;
const communitySignalScoreTrendingWeight = 2;
const cashTagPattern = /(^|[^A-Z0-9])\$([A-Z][A-Z0-9]{0,5}(?:\.[A-Z])?)(?![A-Z0-9])/g;
const invalidSymbolSuffixes = [".X"];

export function parseCommunityScanArgs(args) {
  const parsed = {
    cacheDir: defaultCommunityCacheDir,
    config: defaultCommunitySourcesFile,
    discoveryCandidates: defaultDiscoveryCandidatesFile,
    json: false,
    laneMap: defaultLaneMapFile,
    maxSampleUrls: defaultMaxSampleUrls,
    securityMaster: defaultSecurityMasterFile,
    watchlist: defaultWatchlistFile,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
      index += 1;
    } else if (arg === "--cache-dir") {
      parsed.cacheDir = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--config") {
      parsed.config = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--discovery-candidates") {
      parsed.discoveryCandidates = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--json") {
      parsed.json = true;
    } else if (arg === "--lane-map") {
      parsed.laneMap = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--max-sample-urls") {
      parsed.maxSampleUrls = positiveInteger(requireNextArg(args, index, arg), "--max-sample-urls");
      index += 1;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--security-master") {
      parsed.securityMaster = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--watchlist") {
      parsed.watchlist = requireNextArg(args, index, arg);
      index += 1;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }

  return parsed;
}

export function loadCommunitySourceConfig(file) {
  const content = readFileSync(file, "utf8");
  const parsed = parseYaml(content);
  if (parsed?.schema_version !== 1) {
    throw new Error(`${file} schema_version must be 1`);
  }
  return {
    content,
    parsed,
    sha256: sha256(content),
  };
}

export function loadCommunityLaneMap(file) {
  const content = readFileSync(file, "utf8");
  const parsed = parseYaml(content);
  const lanes = Array.isArray(parsed?.lanes) ? parsed.lanes : [];
  const laneById = new Map();
  lanes.forEach((lane, index) => {
    const id = requiredNonEmptyString(lane?.id, `${file} lanes[${index}].id`);
    laneById.set(id, {
      id,
      name: String(lane.name ?? id),
      profileKeywords: stringArray(lane.profile_keywords),
      screenKeywords: stringArray(lane.screen_keywords),
      status: String(lane.status ?? ""),
    });
  });
  return {
    asOf: requiredNonEmptyString(parsed?.as_of, `${file} as_of`),
    content,
    laneById,
    lanes: [...laneById.values()],
    path: file,
    sha256: sha256(content),
  };
}

export function loadCommunityRepoSymbols({
  discoveryCandidatesFile = defaultDiscoveryCandidatesFile,
  laneMap,
  securityMasterFile = defaultSecurityMasterFile,
  watchlistFile = defaultWatchlistFile,
}) {
  const symbols = new Map();
  csvRecords(securityMasterFile).forEach((row) => {
    upsertRepoSymbol(symbols, row.symbol, {
      exchange: row.exchange,
      name: row.name,
      source: "security_master",
      tradability: row.tradability,
    });
  });
  csvRecords(watchlistFile).forEach((row) => {
    upsertRepoSymbol(symbols, row.symbol, {
      name: row.name,
      source: "watchlist",
      status: row.status,
      theme: row.theme,
    });
  });
  csvRecords(discoveryCandidatesFile).forEach((row) => {
    upsertRepoSymbol(symbols, row.symbol, {
      exchange: row.exchange,
      name: row.name,
      source: "discovery_candidates",
      status: row.status,
      theme: row.theme,
    });
  });
  laneMap.lanes.forEach((lane) => {
    const parsed = parseYaml(laneMap.content);
    const sourceLane = (parsed?.lanes ?? []).find((entry) => entry?.id === lane.id) ?? {};
    stringArray(sourceLane.current_public_proxies).forEach((symbol) => {
      upsertRepoSymbol(symbols, symbol, {
        source: `lane_proxy:${lane.id}`,
        theme: lane.id,
      });
    });
  });
  return symbols;
}

export async function runCommunitySourceScan({
  asOf = currentDate(),
  config,
  configPath = defaultCommunitySourcesFile,
  configSha256 = "",
  fetchImpl = fetch,
  laneMap,
  maxSampleUrls = defaultMaxSampleUrls,
  repoSymbols = new Map(),
  retrievedAt = new Date().toISOString(),
} = {}) {
  const normalizedAsOf = strictDate(asOf, "--as-of");
  const sourceResults = [];
  const symbolSignals = new Map();
  const laneKeywordSignals = new Map();
  const stocktwitsTrendingSymbols = [];
  const caveats = [
    "Community discussion is a weak lead-generation input, not decisive evidence.",
    "This scan intentionally omits raw post bodies, author names, cookies, and tokens from output.",
    "Any material candidate found here still requires primary-source skim, security metadata, readiness review, and promotion gates before it can affect allocation.",
  ];
  const context = {
    config,
    fetchImpl,
    laneKeywordSignals,
    laneMap,
    maxSampleUrls,
    repoSymbols,
    retrievedAt,
    sourceResults,
    stocktwitsTrendingSymbols,
    symbolSignals,
  };

  await scanRedditRss(context);
  await scanGenericRss(context);
  await scanStocktwits(context);
  await scanHackerNews(context);

  const symbolRows = [...symbolSignals.values()].map((record) =>
    finalizeSymbolSignal(record, repoSymbols),
  ).sort(compareSymbolSignals);
  const laneKeywordRows = [...laneKeywordSignals.values()].map(finalizeLaneKeywordSignal)
    .sort((left, right) =>
      right.mention_count - left.mention_count
      || left.lane_id.localeCompare(right.lane_id)
      || left.keyword.localeCompare(right.keyword),
    );

  return {
    schema_version: communityScanSchemaVersion,
    source: "public_no_token_community_scan",
    generated_at: retrievedAt,
    as_of: normalizedAsOf,
    config_path: configPath,
    config_sha256: configSha256,
    lane_map_path: laneMap.path,
    lane_map_as_of: laneMap.asOf,
    lane_map_sha256: laneMap.sha256,
    retrieval_boundary: {
      requires_tokens_or_cookies: false,
      raw_user_content_retained_in_output: false,
      source_use: "sentiment_and_lead_generation_only",
      decisive_evidence_allowed: false,
    },
    source_counts_by_type: countBy(sourceResults, (source) => source.type),
    source_status_counts: countBy(sourceResults, (source) => source.status),
    sources_checked: sourceResults,
    symbol_signal_count: symbolRows.length,
    symbol_signals: symbolRows,
    lane_keyword_signal_count: laneKeywordRows.length,
    lane_keyword_signals: laneKeywordRows,
    stocktwits_trending_symbols: stocktwitsTrendingSymbols,
    caveats,
  };
}

async function scanRedditRss(context) {
  const section = context.config.reddit_rss;
  if (section?.enabled !== true) {
    return;
  }
  for (const feed of section.feeds ?? []) {
    await scanRssFeed({
      context,
      feed,
      type: "reddit_rss",
    });
  }
}

async function scanGenericRss(context) {
  const section = context.config.generic_rss;
  if (section?.enabled !== true) {
    return;
  }
  for (const feed of section.feeds ?? []) {
    await scanRssFeed({
      context,
      feed,
      type: "generic_rss",
    });
  }
}

async function scanRssFeed({
  context,
  feed,
  type,
}) {
  const id = requiredNonEmptyString(feed.id, `${type} feed id`);
  const url = requiredNonEmptyString(feed.url, `${type} ${id} url`);
  try {
    const response = await fetchPublicText(context.fetchImpl, url, {
      accept: "application/atom+xml,application/rss+xml,application/xml,text/xml,*/*",
    });
    const entries = parseXmlFeedItems(response.text).slice(0, positiveInteger(feed.max_items ?? 50, `${id} max_items`));
    entries.forEach((entry) => {
      scanCommunityText({
        context,
        publishedAt: entry.published_at,
        sourceId: id,
        sourceType: type,
        text: `${entry.title}\n${entry.summary}`,
        url: entry.url,
      });
    });
    context.sourceResults.push(sourceResult({
      id,
      itemCount: entries.length,
      status: "ok",
      type,
      url,
    }));
  } catch (error) {
    context.sourceResults.push(sourceResult({
      error,
      id,
      itemCount: 0,
      status: "error",
      type,
      url,
    }));
  }
}

async function scanStocktwits(context) {
  const section = context.config.stocktwits;
  if (section?.enabled !== true) {
    return;
  }
  await scanStocktwitsTrending(context, section);
  await scanStocktwitsSymbolStreams(context, section);
}

async function scanStocktwitsTrending(context, section) {
  const id = "stocktwits_trending_symbols";
  const url = requiredNonEmptyString(section.trending_url, "stocktwits.trending_url");
  try {
    const response = await fetchPublicJson(context.fetchImpl, url);
    const symbols = Array.isArray(response.json?.symbols) ? response.json.symbols : [];
    const allowedSymbols = symbols.filter((symbol) => stocktwitsSymbolAllowed(symbol, section));
    allowedSymbols.forEach((symbol, index) => {
      const row = stocktwitsSymbolRow(symbol, index + 1);
      context.stocktwitsTrendingSymbols.push(row);
      addSymbolSignal(context, row.symbol, {
        exchange: row.exchange,
        instrumentClass: row.instrument_class,
        name: row.name,
        publishedAt: row.summary_at,
        sampleUrl: row.source_url,
        sourceId: id,
        sourceType: "stocktwits_trending",
        stocktwitsRank: row.rank,
        stocktwitsTrendingScore: row.trending_score,
        stocktwitsWatchlistCount: row.watchlist_count,
        type: "stocktwits_trending",
      });
    });
    context.sourceResults.push(sourceResult({
      id,
      itemCount: allowedSymbols.length,
      skippedItemCount: symbols.length - allowedSymbols.length,
      status: "ok",
      type: "stocktwits_trending",
      url,
    }));
  } catch (error) {
    context.sourceResults.push(sourceResult({
      error,
      id,
      itemCount: 0,
      status: "error",
      type: "stocktwits_trending",
      url,
    }));
  }
}

async function scanStocktwitsSymbolStreams(context, section) {
  const template = String(section.symbol_stream_url_template ?? "").trim();
  if (template === "") {
    return;
  }
  const symbols = selectStocktwitsStreamSymbols(context.repoSymbols, section);
  for (const symbol of symbols) {
    const id = `stocktwits_symbol_${symbol.toLowerCase()}`;
    const url = template.replace("{symbol}", encodeURIComponent(symbol));
    try {
      const response = await fetchPublicJson(context.fetchImpl, url);
      const messages = (Array.isArray(response.json?.messages) ? response.json.messages : [])
        .slice(0, positiveInteger(section.max_messages_per_symbol ?? 30, "stocktwits.max_messages_per_symbol"));
      const stocktwitsSymbol = response.json?.symbol ?? {};
      if (stocktwitsSymbolAllowed(stocktwitsSymbol, section)) {
        addSymbolSignal(context, stocktwitsSymbol.symbol ?? symbol, {
          exchange: stocktwitsSymbol.exchange,
          instrumentClass: stocktwitsSymbol.instrument_class,
          name: stocktwitsSymbol.title,
          sampleUrl: stocktwitsSymbolUrl(stocktwitsSymbol.symbol ?? symbol),
          sourceId: id,
          sourceType: "stocktwits_symbol_stream",
          stocktwitsWatchlistCount: stocktwitsSymbol.watchlist_count,
          type: "stocktwits_symbol_stream",
        });
      }
      messages.forEach((message) => {
        const sampleUrl = stocktwitsMessageUrl(message.id);
        const publishedAt = String(message.created_at ?? "");
        const text = String(message.body ?? "");
        extractTokenizedCashTags(message).forEach((cashTag) => {
          addSymbolSignal(context, cashTag, {
            publishedAt,
            sampleUrl,
            sourceId: id,
            sourceType: "stocktwits_symbol_stream",
            type: "stocktwits_message_cashtag",
          });
        });
        scanCommunityText({
          context,
          publishedAt,
          scanCashTags: false,
          sourceId: id,
          sourceType: "stocktwits_symbol_stream",
          text,
          url: sampleUrl,
        });
      });
      context.sourceResults.push(sourceResult({
        id,
        itemCount: messages.length,
        status: "ok",
        type: "stocktwits_symbol_stream",
        url,
      }));
    } catch (error) {
      context.sourceResults.push(sourceResult({
        error,
        id,
        itemCount: 0,
        status: "error",
        type: "stocktwits_symbol_stream",
        url,
      }));
    }
  }
}

async function scanHackerNews(context) {
  const section = context.config.hacker_news;
  if (section?.enabled !== true) {
    return;
  }
  const baseUrl = requiredNonEmptyString(section.search_url, "hacker_news.search_url");
  for (const query of section.queries ?? []) {
    const id = requiredNonEmptyString(query.id, "hacker_news query id");
    const url = new URL(baseUrl);
    url.searchParams.set("query", requiredNonEmptyString(query.query, `${id} query`));
    if (String(query.tags ?? "").trim() !== "") {
      url.searchParams.set("tags", String(query.tags).trim());
    }
    url.searchParams.set("hitsPerPage", String(positiveInteger(query.hits_per_page ?? 20, `${id} hits_per_page`)));
    try {
      const response = await fetchPublicJson(context.fetchImpl, url.toString());
      const hits = Array.isArray(response.json?.hits) ? response.json.hits : [];
      hits.forEach((hit) => {
        const sampleUrl = hnItemUrl(hit);
        const text = [
          hit.title,
          hit.story_title,
          hit.comment_text,
        ].filter(Boolean).join("\n");
        scanCommunityText({
          context,
          publishedAt: hit.created_at,
          sourceId: id,
          sourceType: "hacker_news_algolia",
          text,
          url: sampleUrl,
        });
        const lane = context.laneMap.laneById.get(String(query.lane_id ?? ""));
        if (lane !== undefined) {
          addLaneKeywordSignal(context, lane, String(query.query), {
            publishedAt: hit.created_at,
            sampleUrl,
            sourceId: id,
            sourceType: "hacker_news_algolia",
          });
        }
      });
      context.sourceResults.push(sourceResult({
        id,
        itemCount: hits.length,
        status: "ok",
        type: "hacker_news_algolia",
        url: url.toString(),
      }));
    } catch (error) {
      context.sourceResults.push(sourceResult({
        error,
        id,
        itemCount: 0,
        status: "error",
        type: "hacker_news_algolia",
        url: url.toString(),
      }));
    }
  }
}

function scanCommunityText({
  context,
  publishedAt = "",
  scanCashTags = true,
  sourceId,
  sourceType,
  text,
  url,
}) {
  if (scanCashTags) {
    extractCashTags(text).forEach((symbol) => {
      addSymbolSignal(context, symbol, {
        publishedAt,
        sampleUrl: url,
        sourceId,
        sourceType,
        type: "cash_tag",
      });
    });
  }
  const normalizedText = normalizeText(text);
  context.laneMap.lanes.forEach((lane) => {
    const keywords = [...lane.screenKeywords, ...lane.profileKeywords];
    keywords.forEach((keyword) => {
      if (normalizedText.includes(normalizeText(keyword))) {
        addLaneKeywordSignal(context, lane, keyword, {
          publishedAt,
          sampleUrl: url,
          sourceId,
          sourceType,
        });
      }
    });
  });
}

export function extractCashTags(text) {
  const symbols = new Set();
  const source = String(text ?? "");
  for (const match of source.matchAll(cashTagPattern)) {
    const symbol = normalizeSymbol(match[2]);
    if (symbol !== "" && !invalidSymbolSuffixes.some((suffix) => symbol.endsWith(suffix))) {
      symbols.add(symbol);
    }
  }
  return [...symbols].sort();
}

export function parseXmlFeedItems(xml) {
  const content = String(xml ?? "");
  const atomEntries = blocks(content, "entry").map((block) => atomEntry(block));
  if (atomEntries.length > 0) {
    return atomEntries;
  }
  return blocks(content, "item").map((block) => rssItem(block));
}

function atomEntry(block) {
  const title = cleanXmlText(tagContent(block, "title"));
  const summary = cleanXmlText(
    tagContent(block, "summary")
    || tagContent(block, "content")
    || "",
  );
  return {
    published_at: cleanXmlText(tagContent(block, "published") || tagContent(block, "updated")),
    summary,
    title,
    url: atomLink(block),
  };
}

function rssItem(block) {
  const title = cleanXmlText(tagContent(block, "title"));
  const description = cleanXmlText(tagContent(block, "description"));
  return {
    published_at: cleanXmlText(tagContent(block, "pubDate")),
    summary: description,
    title,
    url: cleanXmlText(tagContent(block, "link")),
  };
}

function blocks(content, tag) {
  const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  return [...content.matchAll(pattern)].map((match) => match[1]);
}

function tagContent(block, tag) {
  const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  return block.match(pattern)?.[1] ?? "";
}

function atomLink(block) {
  const href = block.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/i)?.[1] ?? "";
  if (href !== "") {
    return decodeXmlEntities(href);
  }
  return cleanXmlText(tagContent(block, "link"));
}

function cleanXmlText(value) {
  return stripHtml(decodeXmlEntities(String(value ?? ""))).replace(/\s+/g, " ").trim();
}

function decodeXmlEntities(value) {
  return String(value ?? "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#32;/g, " ");
}

function stripHtml(value) {
  return String(value ?? "").replace(/<[^>]*>/g, " ");
}

async function fetchPublicJson(fetchImpl, url) {
  const response = await fetchPublicText(fetchImpl, url, {
    accept: "application/json,text/plain,*/*",
  });
  try {
    return {
      ...response,
      json: JSON.parse(response.text),
    };
  } catch (error) {
    throw new Error(`${url} did not return valid JSON`);
  }
}

async function fetchPublicText(fetchImpl, url, {
  accept,
}) {
  const response = await fetchImpl(url, {
    headers: {
      "Accept": accept,
      "Accept-Encoding": "gzip, deflate, br",
      "User-Agent": defaultUserAgent,
    },
  });
  const status = Number(response.status ?? 200);
  if (response.ok === false || status < 200 || status >= 300) {
    if (fetchImpl === fetch && isCurlFallbackStatus(status)) {
      return fetchPublicTextWithCurl(url, accept);
    }
    throw new Error(`${url} returned HTTP ${status}`);
  }
  return {
    status,
    text: await response.text(),
  };
}

function fetchPublicTextWithCurl(url, accept) {
  try {
    const text = execFileSync(
      "curl",
      [
        "-L",
        "--compressed",
        "--silent",
        "--show-error",
        "--fail",
        "--max-time",
        String(curlTimeoutSeconds),
        "-H",
        `Accept: ${accept}`,
        "-H",
        `User-Agent: ${defaultUserAgent}`,
        String(url),
      ],
      {
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      },
    );
    return {
      status: 200,
      text,
    };
  } catch (error) {
    throw new Error(`${url} failed with fetch and curl fallback: ${error.message}`);
  }
}

function isCurlFallbackStatus(status) {
  return status === 403 || status === 429;
}

function addSymbolSignal(context, rawSymbol, detail) {
  const symbol = normalizeSymbol(rawSymbol);
  if (symbol === "" || invalidSymbolSuffixes.some((suffix) => symbol.endsWith(suffix))) {
    return;
  }
  const record = getOrCreate(context.symbolSignals, symbol, () => ({
    exchanges: new Set(),
    instrumentClasses: new Set(),
    latestPublishedAt: "",
    mentionCount: 0,
    names: new Set(),
    sampleUrls: [],
    signalTypes: new Set(),
    sourceIds: new Set(),
    sourceTypes: new Set(),
    stocktwitsRanks: [],
    stocktwitsTrendingScore: undefined,
    stocktwitsWatchlistCount: undefined,
    symbol,
  }));
  record.mentionCount += 1;
  addIfText(record.exchanges, detail.exchange);
  addIfText(record.instrumentClasses, detail.instrumentClass);
  addIfText(record.names, detail.name);
  addIfText(record.signalTypes, detail.type);
  addIfText(record.sourceIds, detail.sourceId);
  addIfText(record.sourceTypes, detail.sourceType);
  addSampleUrl(record.sampleUrls, detail.sampleUrl, context.maxSampleUrls);
  record.latestPublishedAt = latestTimestamp(record.latestPublishedAt, detail.publishedAt);
  if (Number.isFinite(Number(detail.stocktwitsTrendingScore))) {
    record.stocktwitsTrendingScore = Math.max(
      Number(record.stocktwitsTrendingScore ?? 0),
      Number(detail.stocktwitsTrendingScore),
    );
  }
  if (Number.isFinite(Number(detail.stocktwitsWatchlistCount))) {
    record.stocktwitsWatchlistCount = Math.max(
      Number(record.stocktwitsWatchlistCount ?? 0),
      Number(detail.stocktwitsWatchlistCount),
    );
  }
  if (Number.isFinite(Number(detail.stocktwitsRank))) {
    record.stocktwitsRanks.push(Number(detail.stocktwitsRank));
  }
}

function addLaneKeywordSignal(context, lane, keyword, detail) {
  const normalizedKeyword = normalizeText(keyword);
  if (normalizedKeyword === "") {
    return;
  }
  const key = `${lane.id}|${normalizedKeyword}`;
  const record = getOrCreate(context.laneKeywordSignals, key, () => ({
    keyword: String(keyword),
    laneId: lane.id,
    laneName: lane.name,
    latestPublishedAt: "",
    mentionCount: 0,
    sampleUrls: [],
    sourceIds: new Set(),
    sourceTypes: new Set(),
  }));
  record.mentionCount += 1;
  addIfText(record.sourceIds, detail.sourceId);
  addIfText(record.sourceTypes, detail.sourceType);
  addSampleUrl(record.sampleUrls, detail.sampleUrl, context.maxSampleUrls);
  record.latestPublishedAt = latestTimestamp(record.latestPublishedAt, detail.publishedAt);
}

function finalizeSymbolSignal(record, repoSymbols) {
  const repoSymbol = repoSymbols.get(record.symbol);
  const sourceCount = record.sourceIds.size;
  const trendingScore = Number(record.stocktwitsTrendingScore ?? 0);
  const communitySignalScore = record.mentionCount
    + sourceCount * communitySignalScoreSourceWeight
    + Math.max(0, trendingScore) * communitySignalScoreTrendingWeight;
  return {
    symbol: record.symbol,
    name: firstNonEmpty([...record.names]) || repoSymbol?.name || "",
    mention_count: record.mentionCount,
    source_count: sourceCount,
    source_ids: [...record.sourceIds].sort(),
    source_types: [...record.sourceTypes].sort(),
    signal_types: [...record.signalTypes].sort(),
    community_signal_score: Number(communitySignalScore.toFixed(3)),
    sample_urls: record.sampleUrls,
    latest_source_published_at: record.latestPublishedAt,
    known_repo_symbol: repoSymbol !== undefined,
    security_metadata_status: securityMetadataStatus(record, repoSymbol),
    repo_status: repoSymbol?.status ?? "",
    repo_tradability: repoSymbol?.tradability ?? "",
    exchanges: [...record.exchanges].sort(),
    instrument_classes: [...record.instrumentClasses].sort(),
    stocktwits_watchlist_count: record.stocktwitsWatchlistCount ?? null,
    stocktwits_trending_score: record.stocktwitsTrendingScore ?? null,
    stocktwits_best_rank: record.stocktwitsRanks.length === 0 ? null : Math.min(...record.stocktwitsRanks),
    required_next_step: "primary_source_skim_and_security_type_confirmation",
  };
}

function finalizeLaneKeywordSignal(record) {
  return {
    lane_id: record.laneId,
    lane_name: record.laneName,
    keyword: record.keyword,
    mention_count: record.mentionCount,
    source_count: record.sourceIds.size,
    source_ids: [...record.sourceIds].sort(),
    source_types: [...record.sourceTypes].sort(),
    sample_urls: record.sampleUrls,
    latest_source_published_at: record.latestPublishedAt,
    required_next_step: "bottleneck_lane_review_if_signal_is_material",
  };
}

function compareSymbolSignals(left, right) {
  return right.community_signal_score - left.community_signal_score
    || right.mention_count - left.mention_count
    || left.symbol.localeCompare(right.symbol);
}

function securityMetadataStatus(record, repoSymbol) {
  if (repoSymbol?.tradability === "tradable") {
    return "known_repo_tradable_security";
  }
  if (repoSymbol !== undefined) {
    return "known_repo_non_tradable_or_research_symbol";
  }
  if (record.instrumentClasses.has("Stock")) {
    return "stocktwits_us_stock";
  }
  return "unverified_public_symbol";
}

function stocktwitsSymbolAllowed(symbol, section) {
  const region = String(symbol.region ?? "").trim();
  const instrumentClass = String(symbol.instrument_class ?? "").trim();
  const exchange = String(symbol.exchange ?? "").trim();
  const allowedRegions = new Set(stringArray(section.allowed_regions));
  const allowedClasses = new Set(stringArray(section.allowed_instrument_classes));
  const allowedExchanges = new Set(stringArray(section.allowed_exchanges));
  if (allowedRegions.size > 0 && !allowedRegions.has(region)) {
    return false;
  }
  if (allowedClasses.size > 0 && !allowedClasses.has(instrumentClass)) {
    return false;
  }
  if (allowedExchanges.size > 0 && !allowedExchanges.has(exchange)) {
    return false;
  }
  return normalizeSymbol(symbol.symbol) !== "";
}

function stocktwitsSymbolRow(symbol, rank) {
  const normalizedSymbol = normalizeSymbol(symbol.symbol);
  return {
    symbol: normalizedSymbol,
    name: String(symbol.title ?? ""),
    exchange: String(symbol.exchange ?? ""),
    instrument_class: String(symbol.instrument_class ?? ""),
    region: String(symbol.region ?? ""),
    rank,
    source_url: stocktwitsSymbolUrl(normalizedSymbol),
    summary_at: String(symbol.trends?.summary_at ?? ""),
    trending_score: finiteNumberOrNull(symbol.trending_score),
    watchlist_count: finiteNumberOrNull(symbol.watchlist_count),
  };
}

function selectStocktwitsStreamSymbols(repoSymbols, section) {
  const explicit = stringArray(section.symbol_stream_symbols);
  const maxCount = positiveInteger(section.max_symbol_streams ?? 30, "stocktwits.max_symbol_streams");
  if (explicit.length > 0) {
    return explicit.map(normalizeSymbol).filter(Boolean).slice(0, maxCount);
  }
  return [...repoSymbols.values()]
    .filter((row) => row.tradability === "tradable" || String(row.source ?? "").startsWith("lane_proxy:"))
    .map((row) => normalizeSymbol(row.symbol))
    .filter(Boolean)
    .sort()
    .slice(0, maxCount);
}

function extractTokenizedCashTags(message) {
  const tags = new Set();
  (message.tokenized_body ?? []).forEach((token) => {
    if (token?.type === "cashTag") {
      tags.add(normalizeSymbol(token.data?.symbol ?? token.data?.symbol_display ?? token.data?.text));
    }
  });
  return [...tags].filter(Boolean).sort();
}

function sourceResult({
  error,
  id,
  itemCount,
  skippedItemCount = 0,
  status,
  type,
  url,
}) {
  return {
    id,
    type,
    url,
    status,
    item_count: itemCount,
    skipped_item_count: skippedItemCount,
    error: error === undefined ? "" : String(error.message ?? error),
  };
}

function hnItemUrl(hit) {
  if (String(hit.url ?? "").trim() !== "") {
    return String(hit.url).trim();
  }
  const id = String(hit.objectID ?? hit.story_id ?? "").trim();
  return id === "" ? "" : `https://news.ycombinator.com/item?id=${encodeURIComponent(id)}`;
}

function stocktwitsSymbolUrl(symbol) {
  return `https://stocktwits.com/symbol/${encodeURIComponent(normalizeSymbol(symbol))}`;
}

function stocktwitsMessageUrl(id) {
  const text = String(id ?? "").trim();
  return text === "" ? "" : `https://stocktwits.com/message/${encodeURIComponent(text)}`;
}

function upsertRepoSymbol(symbols, rawSymbol, updates) {
  const symbol = normalizeSymbol(rawSymbol);
  if (symbol === "") {
    return;
  }
  const existing = symbols.get(symbol) ?? { symbol };
  symbols.set(symbol, {
    ...existing,
    ...Object.fromEntries(Object.entries(updates).filter(([, value]) => String(value ?? "").trim() !== "")),
    symbol,
  });
}

function normalizeSymbol(value) {
  return String(value ?? "").replace(/^\$/, "").trim().toUpperCase();
}

function normalizeText(value) {
  return String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function addIfText(set, value) {
  const text = String(value ?? "").trim();
  if (text !== "") {
    set.add(text);
  }
}

function addSampleUrl(urls, value, maxSampleUrls) {
  const text = String(value ?? "").trim();
  if (text !== "" && !urls.includes(text) && urls.length < maxSampleUrls) {
    urls.push(text);
  }
}

function latestTimestamp(left, right) {
  const leftText = String(left ?? "").trim();
  const rightText = String(right ?? "").trim();
  if (rightText === "") {
    return leftText;
  }
  if (leftText === "") {
    return rightText;
  }
  const leftTime = Date.parse(leftText);
  const rightTime = Date.parse(rightText);
  if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
    return rightText > leftText ? rightText : leftText;
  }
  return rightTime > leftTime ? rightText : leftText;
}

function getOrCreate(map, key, createValue) {
  const existing = map.get(key);
  if (existing !== undefined) {
    return existing;
  }
  const created = createValue();
  map.set(key, created);
  return created;
}

function stringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function firstNonEmpty(values) {
  return values.find((value) => String(value ?? "").trim() !== "") ?? "";
}

function finiteNumberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function requiredNonEmptyString(value, context) {
  const text = String(value ?? "").trim();
  if (text === "") {
    throw new Error(`${context} is required`);
  }
  return text;
}

function positiveInteger(value, context) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${context} must be a positive integer`);
  }
  return number;
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}
