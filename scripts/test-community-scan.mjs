import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  extractCashTags,
  loadCommunityLaneMap,
  loadCommunityRepoSymbols,
  parseXmlFeedItems,
  runCommunitySourceScan,
} from "./community-source-lib.mjs";

const fixtureRoot = mkdtempSync(path.join(tmpdir(), "invest-community-scan-"));
const laneMapPath = path.join(fixtureRoot, "lanes.yml");
const securityMasterPath = path.join(fixtureRoot, "security_master.csv");
const watchlistPath = path.join(fixtureRoot, "watchlist.csv");
const candidatesPath = path.join(fixtureRoot, "candidates.csv");

writeFileSync(
  laneMapPath,
  [
    "schema_version: 1",
    "as_of: 2026-06-07",
    "lanes:",
    "  - id: space_infrastructure",
    "    name: Space Infrastructure",
    "    status: active",
    "    screen_keywords:",
    "      - satellite",
    "      - launch",
    "    current_public_proxies:",
    "      - RKLB",
    "  - id: ai_power_and_cooling",
    "    name: AI Power And Cooling",
    "    status: active",
    "    screen_keywords:",
    "      - data center power",
  ].join("\n") + "\n",
);
writeFileSync(
  securityMasterPath,
  [
    "symbol,name,exchange,asset_type,tradability,market_data_symbol,sec_cik,tradingview_symbol,tradingview_url,stockanalysis_url,notes",
    "RKLB,Rocket Lab,NASDAQ,common_stock,tradable,RKLB,0001819994,NASDAQ:RKLB,,,fixture",
    "VRT,Vertiv,NYSE,common_stock,tradable,VRT,0001674101,NYSE:VRT,,,fixture",
  ].join("\n") + "\n",
);
writeFileSync(
  watchlistPath,
  [
    "symbol,name,theme,priority,status,initial_role,latest_baseline_date,next_review_trigger,notes",
    "RKLB,Rocket Lab,space,A,active_core_candidate,space,2026-06-01,next,fixture",
    "VRT,Vertiv,power,A-,active_candidate,power,2026-06-01,next,fixture",
  ].join("\n") + "\n",
);
writeFileSync(
  candidatesPath,
  [
    "symbol,name,exchange,asset_type,discovered_at,discovery_source,source_url,source_published_at,retrieved_at,first_seen_at,theme,why_it_might_matter,status,next_action,notes",
  ].join("\n") + "\n",
);

const atom = [
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
  "<feed>",
  "<entry>",
  "<title>$RKLB satellite launch momentum</title>",
  "<link href=\"https://reddit.example/rklb\" />",
  "<updated>2026-06-07T01:00:00Z</updated>",
  "<content>discussion about data center power and $VRT</content>",
  "</entry>",
  "</feed>",
].join("");
const parsedFeed = parseXmlFeedItems(atom);
assert.equal(parsedFeed.length, 1);
assert.equal(parsedFeed[0].title, "$RKLB satellite launch momentum");
assert.deepEqual(extractCashTags("$RKLB $VRT $PENGU.X $10"), ["RKLB", "VRT"]);

const config = {
  schema_version: 1,
  reddit_rss: {
    enabled: true,
    feeds: [{
      id: "fixture_reddit",
      max_items: 10,
      url: "fixture://reddit/rss",
    }],
  },
  generic_rss: {
    enabled: true,
    feeds: [{
      id: "fixture_generic",
      max_items: 10,
      url: "fixture://generic/rss",
    }],
  },
  stocktwits: {
    allowed_exchanges: ["NASDAQ", "NYSE"],
    allowed_instrument_classes: ["Stock"],
    allowed_regions: ["US"],
    enabled: true,
    max_messages_per_symbol: 2,
    max_symbol_streams: 2,
    symbol_stream_symbols: ["RKLB"],
    symbol_stream_url_template: "fixture://stocktwits/symbol/{symbol}",
    trending_url: "fixture://stocktwits/trending",
  },
  hacker_news: {
    enabled: true,
    queries: [{
      hits_per_page: 2,
      id: "fixture_hn_power",
      lane_id: "ai_power_and_cooling",
      query: "data center power",
      tags: "story,comment",
    }],
    search_url: "fixture://hn/search_by_date",
  },
};

const laneMap = loadCommunityLaneMap(laneMapPath);
const repoSymbols = loadCommunityRepoSymbols({
  discoveryCandidatesFile: candidatesPath,
  laneMap,
  securityMasterFile: securityMasterPath,
  watchlistFile: watchlistPath,
});
const result = await runCommunitySourceScan({
  asOf: "2026-06-07",
  config,
  fetchImpl: fixtureFetch,
  laneMap,
  repoSymbols,
  retrievedAt: "2026-06-07T12:00:00.000Z",
});

assert.equal(result.source, "public_no_token_community_scan");
assert.equal(result.retrieval_boundary.requires_tokens_or_cookies, false);
assert.equal(result.sources_checked.length, 5);
assert.equal(result.source_status_counts.ok, 5);

const rklb = result.symbol_signals.find((row) => row.symbol === "RKLB");
assert(rklb, "RKLB should be surfaced from Reddit and Stocktwits");
assert.equal(rklb.known_repo_symbol, true);
assert.equal(rklb.security_metadata_status, "known_repo_tradable_security");
assert(rklb.sample_urls.every((url) => !url.includes("body")), "sample URLs should not include raw content");
assert(
  rklb.reason_keywords.some((row) => row.keyword === "satellite"),
  "symbol rows should explain theme co-mentions without retaining raw text",
);

const unknown = result.symbol_signals.find((row) => row.symbol === "NEWT");
assert(unknown, "Stocktwits trending stock should be surfaced even if not in repo metadata");
assert.equal(unknown.security_metadata_status, "stocktwits_us_stock");

assert(!result.symbol_signals.some((row) => row.symbol === "PENGU.X"), "crypto symbols should be excluded by policy filters");
assert(result.lane_keyword_signals.some((row) => row.lane_id === "ai_power_and_cooling" && row.keyword === "data center power"));
assert(result.lane_keyword_signals.some((row) => row.lane_id === "space_infrastructure" && row.keyword === "satellite"));

const redditRanking = result.source_symbol_rankings.find((row) => row.source_id === "fixture_reddit");
assert(redditRanking, "scan should emit per-source symbol rankings");
assert(
  redditRanking.symbols.some((row) => row.symbol === "RKLB" && row.mention_count === 1),
  "per-source ranking should count Reddit cash tags",
);

const stocktwitsTypeRanking = result.source_type_symbol_rankings.find((row) => row.source_type === "stocktwits_symbol_stream");
assert(stocktwitsTypeRanking, "scan should emit per-source-type symbol rankings");
assert(
  stocktwitsTypeRanking.symbols.some((row) => row.symbol === "RKLB" && row.mention_count >= 2),
  "source-type ranking should aggregate Stocktwits stream mentions",
);

console.log("community scan tests passed");

async function fixtureFetch(url) {
  const textUrl = String(url);
  if (textUrl === "fixture://reddit/rss") {
    return textResponse(atom);
  }
  if (textUrl === "fixture://generic/rss") {
    return textResponse([
      "<rss><channel>",
      "<item>",
      "<title>Launch software for satellites</title>",
      "<link>https://generic.example/space</link>",
      "<pubDate>Sun, 07 Jun 2026 02:00:00 GMT</pubDate>",
      "<description>No ticker here.</description>",
      "</item>",
      "</channel></rss>",
    ].join(""));
  }
  if (textUrl === "fixture://stocktwits/trending") {
    return jsonResponse({
      symbols: [
        {
          exchange: "NASDAQ",
          instrument_class: "Stock",
          region: "US",
          symbol: "NEWT",
          title: "New Test Corp",
          trending_score: 4.5,
          trends: { summary_at: "2026-06-07T03:00:00Z" },
          watchlist_count: 1200,
        },
        {
          exchange: "CRYPTO",
          instrument_class: "CRYPTO",
          region: "X",
          symbol: "PENGU.X",
          title: "Pudgy Penguins",
          trending_score: 9,
          watchlist_count: 100,
        },
      ],
    });
  }
  if (textUrl === "fixture://stocktwits/symbol/RKLB") {
    return jsonResponse({
      messages: [
        {
          body: "$RKLB $VRT satellite and data center power",
          created_at: "2026-06-07T04:00:00Z",
          id: 1001,
          tokenized_body: [
            { type: "cashTag", data: { symbol: "RKLB" } },
            { type: "cashTag", data: { symbol: "VRT" } },
          ],
        },
      ],
      symbol: {
        exchange: "NASDAQ",
        instrument_class: "Stock",
        region: "US",
        symbol: "RKLB",
        title: "Rocket Lab USA Inc",
        watchlist_count: 60000,
      },
    });
  }
  if (textUrl.startsWith("fixture://hn/search_by_date")) {
    return jsonResponse({
      hits: [{
        comment_text: "Operators are bottlenecked by data center power",
        created_at: "2026-06-07T05:00:00Z",
        objectID: "42",
        story_title: "AI data centers",
      }],
    });
  }
  throw new Error(`unexpected fixture URL ${textUrl}`);
}

function textResponse(text) {
  return {
    ok: true,
    status: 200,
    async text() {
      return text;
    },
  };
}

function jsonResponse(value) {
  return textResponse(JSON.stringify(value));
}
