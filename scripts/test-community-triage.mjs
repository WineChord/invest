import assert from "node:assert/strict";
import {
  runCommunityLeadTriage,
} from "./community-triage-lib.mjs";

const currentScan = {
  source: "public_no_token_community_scan",
  as_of: "2026-06-07",
  retrieval_boundary: {
    requires_tokens_or_cookies: false,
    raw_user_content_retained_in_output: false,
  },
  source_counts_by_type: {
    reddit_rss: 1,
    stocktwits_symbol_stream: 1,
    stocktwits_trending: 1,
  },
  source_status_counts: {
    ok: 3,
  },
  source_type_symbol_rankings: [{
    source_type: "stocktwits_symbol_stream",
    source_count: 1,
    source_ids: ["stocktwits_symbol_rklb"],
    symbol_count: 2,
    symbols: [{
      symbol: "RKLB",
      name: "Rocket Lab USA Inc",
      mention_count: 5,
      community_signal_score: 10,
      repo_status: "active_core_candidate",
      security_metadata_status: "known_repo_tradable_security",
      sample_urls: ["https://stocktwits.example/rklb"],
    }],
  }],
  source_symbol_rankings: [{
    source_id: "stocktwits_symbol_rklb",
    source_type: "stocktwits_symbol_stream",
    source_url: "https://stocktwits.example/RKLB.json",
    source_status: "ok",
    symbol_count: 2,
    symbols: [{
      symbol: "RKLB",
      name: "Rocket Lab USA Inc",
      mention_count: 5,
      community_signal_score: 10,
      repo_status: "active_core_candidate",
      security_metadata_status: "known_repo_tradable_security",
      sample_urls: ["https://stocktwits.example/rklb"],
    }],
  }],
  symbol_signals: [
    {
      symbol: "RKLB",
      name: "Rocket Lab USA Inc",
      community_signal_score: 70,
      mention_count: 40,
      source_count: 4,
      source_ids: ["stocktwits_symbol_rklb", "reddit_spaceinvestorsdaily_new"],
      source_types: ["stocktwits_symbol_stream", "reddit_rss"],
      signal_types: ["cash_tag"],
      reason_keywords: [{
        keyword: "space",
        lane_id: "space_infrastructure",
        mention_count: 12,
        source_types: ["stocktwits_symbol_stream"],
      }],
      known_repo_symbol: true,
      security_metadata_status: "known_repo_tradable_security",
      repo_status: "active_core_candidate",
      repo_tradability: "tradable",
      latest_source_published_at: "2026-06-07",
      sample_urls: ["https://stocktwits.example/rklb"],
    },
    {
      symbol: "NEWT",
      name: "New Test Corp",
      community_signal_score: 60,
      mention_count: 35,
      source_count: 3,
      source_ids: ["stocktwits_trending_symbols", "reddit_securityanalysis_new"],
      source_types: ["stocktwits_trending", "reddit_rss"],
      signal_types: ["stocktwits_trending", "cash_tag"],
      reason_keywords: [{
        keyword: "AI infrastructure",
        lane_id: "ai_compute_infrastructure",
        mention_count: 6,
        source_types: ["reddit_rss"],
      }],
      known_repo_symbol: false,
      security_metadata_status: "stocktwits_us_stock",
      repo_status: "",
      repo_tradability: "",
      latest_source_published_at: "2026-06-06",
      stocktwits_trending_score: 4,
      sample_urls: ["https://stocktwits.example/newt"],
    },
    {
      symbol: "BE",
      name: "Bloom Energy Corp",
      community_signal_score: 50,
      mention_count: 25,
      source_count: 2,
      source_ids: ["stocktwits_symbol_be"],
      source_types: ["stocktwits_symbol_stream"],
      signal_types: ["stocktwits_symbol_stream"],
      reason_keywords: [{
        keyword: "grid",
        lane_id: "ai_power_and_cooling",
        mention_count: 5,
        source_types: ["stocktwits_symbol_stream"],
      }],
      known_repo_symbol: true,
      security_metadata_status: "known_repo_tradable_security",
      repo_status: "watch",
      repo_tradability: "tradable",
      sample_urls: ["https://stocktwits.example/be"],
    },
    {
      symbol: "NVDA",
      name: "",
      community_signal_score: 55,
      mention_count: 30,
      source_count: 3,
      source_ids: ["stocktwits_symbol_rklb"],
      source_types: ["stocktwits_symbol_stream"],
      signal_types: ["stocktwits_message_cashtag"],
      reason_keywords: [{
        keyword: "GPU",
        lane_id: "ai_compute_infrastructure",
        mention_count: 5,
        source_types: ["stocktwits_symbol_stream"],
      }],
      known_repo_symbol: false,
      security_metadata_status: "unverified_public_symbol",
      repo_status: "",
      repo_tradability: "",
      sample_urls: ["https://stocktwits.example/nvda"],
    },
    {
      symbol: "OPEN",
      name: "",
      community_signal_score: 45,
      mention_count: 20,
      source_count: 2,
      source_ids: ["reddit_wallstreetbets_new"],
      source_types: ["reddit_rss"],
      signal_types: ["cash_tag"],
      reason_keywords: [],
      known_repo_symbol: false,
      security_metadata_status: "unverified_public_symbol",
      repo_status: "",
      repo_tradability: "",
      sample_urls: ["https://reddit.example/open"],
    },
  ],
};

const previousScan = {
  source: "public_no_token_community_scan",
  as_of: "2026-06-06",
  symbol_signals: [{
    symbol: "RKLB",
    mention_count: 10,
    community_signal_score: 30,
  }],
};

const result = runCommunityLeadTriage({
  asOf: "2026-06-07",
  generatedAt: "2026-06-07T12:00:00.000Z",
  previousScan,
  previousScanPath: "research/cache/community/2026-06-06/2026-06-06-public-community-scan.json",
  previousScanSha256: "previous",
  scan: currentScan,
  scanPath: "research/cache/community/2026-06-07/2026-06-07-public-community-scan.json",
  scanSha256: "current",
  top: 10,
});

assert.equal(result.source, "public_no_token_community_lead_triage");
assert.equal(result.policy_boundary.creates_buy_eligibility, false);
assert.equal(result.policy_boundary.creates_promotion_eligibility, false);
assert.equal(result.previous_scan_status, "loaded");

const rklb = result.top_leads.find((lead) => lead.symbol === "RKLB");
assert(rklb, "known active symbol should remain in triage output");
assert.equal(rklb.triage_class, "existing_active_monitor");
assert.equal(rklb.recommended_next_action, "freshness_check_and_watchlist_cycle_priority_review");
assert.equal(rklb.previous_scan.mention_delta, 30);
assert.equal(rklb.buy_eligibility_effect, "none_community_signal_only");
assert.equal(rklb.score_components.cross_scan_persistence_component, 5);
assert(rklb.score_components.source_recency_decay_component > 0);

const newt = result.top_leads.find((lead) => lead.symbol === "NEWT");
assert(newt, "unknown but high-signal stock should be surfaced");
assert.equal(newt.triage_class, "new_symbol_primary_source_skim");
assert.equal(newt.recommended_next_action, "confirm_security_type_then_primary_source_skim_before_raw_candidate");
assert.equal(newt.score_components.cross_scan_persistence_component, 0);

const open = result.top_leads.find((lead) => lead.symbol === "OPEN");
assert(open, "ambiguous symbols should still be visible");
assert.equal(open.triage_class, "symbol_identity_confirmation");
assert(open.score_components.ambiguity_penalty > 0);

const be = result.top_leads.find((lead) => lead.symbol === "BE");
assert(be, "known repo symbols should not be sent to identity confirmation only because their ticker is an English word");
assert.equal(be.triage_class, "existing_research_priority_boost");
assert.equal(be.score_components.ambiguity_penalty, 0);

const nvda = result.top_leads.find((lead) => lead.symbol === "NVDA");
assert(nvda, "broad-market symbols should remain visible as context");
assert.equal(nvda.triage_class, "broad_market_context_only");
assert(nvda.score_components.broad_market_or_mega_cap_penalty > 0);

assert(result.existing_symbol_priority_boosts.some((lead) => lead.symbol === "RKLB"));
assert(result.new_symbol_primary_source_queue.some((lead) => lead.symbol === "NEWT"));
assert(result.identity_confirmation_queue.some((lead) => lead.symbol === "OPEN"));
assert(!result.new_symbol_primary_source_queue.some((lead) => lead.symbol === "NVDA"));
assert(result.source_type_leaderboards.some((ranking) => ranking.source_type === "stocktwits_symbol_stream"));

console.log("community triage tests passed");
