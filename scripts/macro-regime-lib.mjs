import { existsSync, readFileSync, writeFileSync } from "node:fs";
import {
  csvRecords,
  ensureParentDir,
  requireNextArg,
  strictDate,
} from "./semantic-discovery-lib.mjs";

export const defaultMacroSnapshotFile = "research/macro/regime-snapshots.csv";
export const defaultFinancingScoresFile = "research/macro/financing-runway-scores.csv";
export const defaultCompanyMetricsFile = "data/market/company_metrics.csv";
export const defaultWatchlistFile = "research/watchlist.csv";
export const fredSourceId = "fred_public_macro_series";
export const yahooMacroSourceId = "yahoo_chart_macro_proxy";
export const macroRegimePolicyVersion = "v1.3";

const macroFetchTimeoutMs = 10_000;

export const macroSnapshotHeader = [
  "as_of",
  "retrieved_at",
  "policy_version",
  "source_ids",
  "regime_label",
  "action_bias",
  "two_year_yield_pct",
  "ten_year_yield_pct",
  "ten_two_spread_bp",
  "real_10y_yield_pct",
  "hy_oas_bp",
  "ig_oas_bp",
  "vix",
  "qqq_close",
  "qqq_63d_return_pct",
  "smh_close",
  "smh_63d_return_pct",
  "iwm_close",
  "iwm_63d_return_pct",
  "ai_capex_state",
  "credit_stress_score",
  "bubble_score_total",
  "valuation_excess_score",
  "capex_overheating_score",
  "financing_fragility_score",
  "real_demand_conversion_score",
  "supply_glut_risk_score",
  "leader_earnings_quality_score",
  "second_tier_fragility_score",
  "credit_market_stress_score",
  "breadth_deterioration_score",
  "regulatory_geopolitical_score",
  "mega_ipo_private_market_drain_score",
  "unavailable_indicators",
  "notes",
];

const fredSeries = [
  { field: "two_year_yield_pct", id: "DGS2", label: "2Y Treasury yield" },
  { field: "ten_year_yield_pct", id: "DGS10", label: "10Y Treasury yield" },
  { field: "real_10y_yield_pct", id: "DFII10", label: "10Y TIPS real yield" },
  { field: "hy_oas_bp", id: "BAMLH0A0HYM2", label: "High-yield OAS", multiplier: 100 },
  { field: "ig_oas_bp", id: "BAMLC0A0CM", label: "Investment-grade OAS", multiplier: 100 },
  { field: "vix", id: "VIXCLS", label: "VIX" },
];

const yahooProxies = [
  { field: "qqq", symbol: "QQQ" },
  { field: "smh", symbol: "SMH" },
  { field: "iwm", symbol: "IWM" },
];

export function parseMacroRegimeArgs(args) {
  const parsed = {
    asOf: optionalText(process.env.MACRO_DATA_AS_OF),
    companyMetrics: defaultCompanyMetricsFile,
    financingScores: defaultFinancingScoresFile,
    output: defaultMacroSnapshotFile,
    watchlist: defaultWatchlistFile,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
      index += 1;
    } else if (arg === "--company-metrics") {
      parsed.companyMetrics = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--dry-run") {
      parsed.dryRun = true;
    } else if (arg === "--financing-scores") {
      parsed.financingScores = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--help") {
      parsed.help = true;
    } else if (arg === "--json") {
      parsed.json = true;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--watchlist") {
      parsed.watchlist = requireNextArg(args, index, arg);
      index += 1;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }

  if (!parsed.help) {
    parsed.asOf = strictDate(parsed.asOf ?? currentDate(), "--as-of");
  }
  return parsed;
}

export async function buildMacroRegimeSnapshot({
  asOf = currentDate(),
  companyMetricsFile = defaultCompanyMetricsFile,
  fetchImpl = fetch,
  financingScoresFile = defaultFinancingScoresFile,
  retrievedAt = new Date().toISOString(),
  watchlistFile = defaultWatchlistFile,
} = {}) {
  const normalizedAsOf = strictDate(asOf, "asOf");
  const unavailable = [];
  const values = {};

  const fredResults = await Promise.all(fredSeries.map(async (series) => {
    try {
      return {
        observation: await fetchFredObservation(series.id, normalizedAsOf, fetchImpl),
        series,
      };
    } catch (error) {
      return {
        error,
        series,
      };
    }
  }));

  for (const result of fredResults) {
    if (result.error) {
      unavailable.push(`${result.series.field}:${result.error.message}`);
    } else if (result.observation === null) {
      unavailable.push(result.series.field);
    } else {
      values[result.series.field] = roundMetric(
        result.observation.value * (result.series.multiplier ?? 1),
        result.series.multiplier === 100 ? 1 : 2,
      );
    }
  }

  const yahooResults = await Promise.all(yahooProxies.map(async (proxy) => {
    try {
      return {
        proxy,
        snapshot: await fetchYahooProxy(proxy.symbol, normalizedAsOf, fetchImpl),
      };
    } catch (error) {
      return {
        error,
        proxy,
      };
    }
  }));

  for (const result of yahooResults) {
    if (result.error) {
      unavailable.push(`${result.proxy.field}:${result.error.message}`);
    } else if (result.snapshot === null) {
      unavailable.push(`${result.proxy.field}_close`);
      unavailable.push(`${result.proxy.field}_63d_return_pct`);
    } else {
      values[`${result.proxy.field}_close`] = roundMetric(result.snapshot.close, 2);
      values[`${result.proxy.field}_63d_return_pct`] = roundMetric(result.snapshot.return63dPct, 2);
    }
  }

  const tenYear = numberOrNull(values.ten_year_yield_pct);
  const twoYear = numberOrNull(values.two_year_yield_pct);
  if (tenYear !== null && twoYear !== null) {
    values.ten_two_spread_bp = roundMetric((tenYear - twoYear) * 100, 1);
  } else {
    unavailable.push("ten_two_spread_bp");
  }

  const valuationExcessScore = valuationExcessScoreFromFiles(watchlistFile, companyMetricsFile);
  const financingFragilityScore = averageFinancingFragilityScore(financingScoresFile);
  const creditStressScore = creditStressScoreForHyOas(numberOrNull(values.hy_oas_bp));
  const breadthDeteriorationScore = breadthDeteriorationScoreForReturns({
    iwmReturnPct: numberOrNull(values.iwm_63d_return_pct),
    qqqReturnPct: numberOrNull(values.qqq_63d_return_pct),
    smhReturnPct: numberOrNull(values.smh_63d_return_pct),
  });
  const capexOverheatingScore = capexOverheatingProxyScore({
    qqqReturnPct: numberOrNull(values.qqq_63d_return_pct),
    smhReturnPct: numberOrNull(values.smh_63d_return_pct),
    valuationExcessScore,
  });
  const secondTierFragilityScore = secondTierFragilityProxyScore(financingFragilityScore, valuationExcessScore);
  const leaderEarningsQualityScore = null;
  const realDemandConversionScore = null;
  const supplyGlutRiskScore = null;
  const regulatoryGeopoliticalScore = null;
  const megaIpoPrivateMarketDrainScore = null;

  const scoreFields = {
    valuation_excess_score: valuationExcessScore,
    capex_overheating_score: capexOverheatingScore,
    financing_fragility_score: financingFragilityScore,
    real_demand_conversion_score: realDemandConversionScore,
    supply_glut_risk_score: supplyGlutRiskScore,
    leader_earnings_quality_score: leaderEarningsQualityScore,
    second_tier_fragility_score: secondTierFragilityScore,
    credit_market_stress_score: creditStressScore,
    breadth_deterioration_score: breadthDeteriorationScore,
    regulatory_geopolitical_score: regulatoryGeopoliticalScore,
    mega_ipo_private_market_drain_score: megaIpoPrivateMarketDrainScore,
  };
  Object.entries(scoreFields).forEach(([field, value]) => {
    if (value === null) {
      unavailable.push(field);
    }
  });

  const bubbleScoreTotal = Object.values(scoreFields)
    .filter((value) => value !== null)
    .reduce((sum, value) => sum + value, 0);
  const regimeLabel = regimeLabelForSnapshot({
    breadthDeteriorationScore,
    creditStressScore,
    hasPublicTrendData: [
      values.iwm_63d_return_pct,
      values.qqq_63d_return_pct,
      values.smh_63d_return_pct,
    ].every((value) => numberOrNull(value) !== null),
    qqqReturnPct: numberOrNull(values.qqq_63d_return_pct),
    smhReturnPct: numberOrNull(values.smh_63d_return_pct),
    valuationExcessScore,
  });

  return normalizeMacroSnapshot({
    as_of: normalizedAsOf,
    retrieved_at: retrievedAt,
    policy_version: macroRegimePolicyVersion,
    source_ids: [fredSourceId, yahooMacroSourceId].join(";"),
    regime_label: regimeLabel,
    action_bias: actionBiasForRegime(regimeLabel, creditStressScore, valuationExcessScore),
    two_year_yield_pct: values.two_year_yield_pct,
    ten_year_yield_pct: values.ten_year_yield_pct,
    ten_two_spread_bp: values.ten_two_spread_bp,
    real_10y_yield_pct: values.real_10y_yield_pct,
    hy_oas_bp: values.hy_oas_bp,
    ig_oas_bp: values.ig_oas_bp,
    vix: values.vix,
    qqq_close: values.qqq_close,
    qqq_63d_return_pct: values.qqq_63d_return_pct,
    smh_close: values.smh_close,
    smh_63d_return_pct: values.smh_63d_return_pct,
    iwm_close: values.iwm_close,
    iwm_63d_return_pct: values.iwm_63d_return_pct,
    ai_capex_state: "requires_current_issuer_review",
    credit_stress_score: creditStressScore,
    bubble_score_total: bubbleScoreTotal,
    ...scoreFields,
    unavailable_indicators: [...new Set(unavailable)].join(";"),
    notes:
      "Macro regime is a risk overlay for entry, sizing, financing review, and cash-management priority only. It does not create buy eligibility or override company primary evidence.",
  });
}

export function writeMacroSnapshot(file, snapshot) {
  const rows = existingMacroSnapshotRows(file)
    .filter((row) => row.as_of !== snapshot.as_of);
  rows.push(snapshot);
  rows.sort((left, right) => left.as_of.localeCompare(right.as_of));
  ensureParentDir(file);
  writeFileSync(file, formatCsv(macroSnapshotHeader, rows));
}

export function formatCsv(header, rows) {
  return `${header.join(",")}\n${rows.map((row) =>
    header.map((field) => csvEscape(row[field] ?? "")).join(","),
  ).join("\n")}${rows.length === 0 ? "" : "\n"}`;
}

export function creditStressScoreForHyOas(hyOasBp) {
  if (hyOasBp === null) {
    return null;
  }
  if (hyOasBp >= 1000) {
    return 5;
  }
  if (hyOasBp >= 700) {
    return 4;
  }
  if (hyOasBp >= 500) {
    return 3;
  }
  if (hyOasBp >= 350) {
    return 2;
  }
  return 1;
}

export function regimeLabelForSnapshot({
  breadthDeteriorationScore,
  creditStressScore,
  hasPublicTrendData = true,
  qqqReturnPct,
  smhReturnPct,
  valuationExcessScore,
}) {
  if (creditStressScore !== null && creditStressScore >= 4) {
    return "credit_stress";
  }
  if (!hasPublicTrendData) {
    return "macro_data_incomplete";
  }
  if (
    (qqqReturnPct !== null && qqqReturnPct <= -12)
    || (smhReturnPct !== null && smhReturnPct <= -15)
  ) {
    return "early_downtrend";
  }
  if (
    breadthDeteriorationScore !== null
    && breadthDeteriorationScore >= 4
    && valuationExcessScore >= 4
  ) {
    return "top_formation";
  }
  if (
    valuationExcessScore >= 4
    && qqqReturnPct !== null
    && qqqReturnPct > 8
  ) {
    return "top_formation";
  }
  return "strong_trend";
}

function actionBiasForRegime(regimeLabel, creditStressScore, valuationExcessScore) {
  if (regimeLabel === "credit_stress" || regimeLabel === "early_downtrend") {
    return "wait_or_reduce_financing_sensitive_risk";
  }
  if (regimeLabel === "macro_data_incomplete") {
    return "refresh_sources_before_macro_sensitive_decision";
  }
  if (valuationExcessScore >= 4 || (creditStressScore !== null && creditStressScore >= 3)) {
    return "price_disciplined_wait_or_staged_only";
  }
  return "company_evidence_first_with_normal_price_discipline";
}

function valuationExcessScoreFromFiles(watchlistFile, companyMetricsFile) {
  const watchlistSymbols = new Set(
    csvRecords(watchlistFile)
      .filter((row) => ["active_core_candidate", "active_candidate", "watch"].includes(row.status))
      .map((row) => row.symbol),
  );
  const ratios = csvRecords(companyMetricsFile)
    .filter((row) => watchlistSymbols.has(row.symbol))
    .map((row) => Number(row.price_to_sales))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (ratios.length === 0) {
    return 3;
  }
  const highMultipleShare = ratios.filter((value) => value >= 30).length / ratios.length;
  const veryHighMultipleShare = ratios.filter((value) => value >= 75).length / ratios.length;
  if (veryHighMultipleShare >= 0.25 || highMultipleShare >= 0.55) {
    return 5;
  }
  if (highMultipleShare >= 0.35) {
    return 4;
  }
  if (highMultipleShare >= 0.2) {
    return 3;
  }
  if (highMultipleShare > 0) {
    return 2;
  }
  return 1;
}

function averageFinancingFragilityScore(file) {
  if (!existsSync(file)) {
    return null;
  }
  const scores = csvRecords(file)
    .map((row) => Number(row.overall_financing_fragility_score))
    .filter((value) => Number.isFinite(value) && value >= 0);
  if (scores.length === 0) {
    return null;
  }
  return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
}

function breadthDeteriorationScoreForReturns({
  iwmReturnPct,
  qqqReturnPct,
  smhReturnPct,
}) {
  if (iwmReturnPct === null || qqqReturnPct === null || smhReturnPct === null) {
    return null;
  }
  const qqqIwmGap = qqqReturnPct - iwmReturnPct;
  if (iwmReturnPct < -8 && qqqReturnPct > 0) {
    return 5;
  }
  if (qqqIwmGap >= 12) {
    return 4;
  }
  if (qqqIwmGap >= 7) {
    return 3;
  }
  if (qqqIwmGap >= 3) {
    return 2;
  }
  return 1;
}

function capexOverheatingProxyScore({
  qqqReturnPct,
  smhReturnPct,
  valuationExcessScore,
}) {
  if (qqqReturnPct === null || smhReturnPct === null) {
    return null;
  }
  if (valuationExcessScore >= 4 && smhReturnPct >= 15) {
    return 5;
  }
  if (valuationExcessScore >= 4 && (smhReturnPct >= 8 || qqqReturnPct >= 8)) {
    return 4;
  }
  if (valuationExcessScore >= 3) {
    return 3;
  }
  return 2;
}

function secondTierFragilityProxyScore(financingFragilityScore, valuationExcessScore) {
  if (financingFragilityScore === null) {
    return null;
  }
  return Math.min(5, Math.max(1, Math.round((financingFragilityScore + valuationExcessScore) / 2)));
}

async function fetchFredObservation(seriesId, asOf, fetchImpl) {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(seriesId)}`;
  const response = await fetchWithTimeout(fetchImpl, url, {
    headers: { "user-agent": "winechord-invest/1.0 macro-regime-refresh" },
  });
  if (!response.ok) {
    throw new Error(`FRED ${seriesId} HTTP ${response.status}`);
  }
  const text = await response.text();
  const rows = parseSimpleCsv(text);
  const header = rows[0] ?? [];
  const dateIndex = header.indexOf("observation_date");
  const valueIndex = header.indexOf(seriesId);
  if (dateIndex < 0 || valueIndex < 0) {
    throw new Error(`FRED ${seriesId} CSV header mismatch`);
  }
  const observations = rows.slice(1)
    .map((row) => ({
      date: row[dateIndex],
      value: Number(row[valueIndex]),
    }))
    .filter((row) => row.date <= asOf && Number.isFinite(row.value));
  return observations.at(-1) ?? null;
}

async function fetchYahooProxy(symbol, asOf, fetchImpl) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=6mo&interval=1d`;
  const response = await fetchWithTimeout(fetchImpl, url, {
    headers: { "user-agent": "winechord-invest/1.0 macro-regime-refresh" },
  });
  if (!response.ok) {
    throw new Error(`Yahoo ${symbol} HTTP ${response.status}`);
  }
  const parsed = await response.json();
  const result = parsed?.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const quote = result?.indicators?.quote?.[0] ?? {};
  const closes = quote.close ?? [];
  const points = timestamps.map((timestamp, index) => ({
    close: Number(closes[index]),
    date: new Date(timestamp * 1000).toISOString().slice(0, 10),
  })).filter((point) =>
    point.date <= asOf
    && Number.isFinite(point.close)
    && point.close > 0,
  );
  if (points.length === 0) {
    return null;
  }
  const last = points.at(-1);
  const base = points.length > 63 ? points[points.length - 64] : points[0];
  return {
    close: last.close,
    return63dPct: ((last.close / base.close) - 1) * 100,
  };
}

async function fetchWithTimeout(fetchImpl, url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), macroFetchTimeoutMs);
  try {
    return await fetchImpl(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`request timed out after ${macroFetchTimeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function existingMacroSnapshotRows(file) {
  if (!existsSync(file)) {
    return [];
  }
  return csvRecords(file);
}

function normalizeMacroSnapshot(snapshot) {
  return Object.fromEntries(macroSnapshotHeader.map((field) => [
    field,
    snapshot[field] === null || snapshot[field] === undefined ? "" : String(snapshot[field]),
  ]));
}

function parseSimpleCsv(text) {
  return text.trim().split(/\r?\n/).map((line) => line.split(","));
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function roundMetric(value, digits) {
  return Number(value.toFixed(digits));
}

function numberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

function optionalText(value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return undefined;
  }

  return String(value).trim();
}
