import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export const defaultFmpBaseUrl = "https://financialmodelingprep.com/stable";
export const defaultFmpCacheDir = "research/cache/fmp";
export const defaultFmpDailyCallBudget = 60;
export const defaultFmpMaxCacheAgeDays = 7;

const fmpSourceName = "Financial Modeling Prep stable API";
const usageSchemaVersion = 1;

export function createFmpClient({
  apiKey = process.env.FMP_API_KEY,
  asOfDate,
  baseUrl = process.env.FMP_BASE_URL || defaultFmpBaseUrl,
  cacheDir = process.env.FMP_CACHE_DIR || defaultFmpCacheDir,
  dailyCallBudget = integerFromEnv(process.env.FMP_DAILY_CALL_BUDGET, defaultFmpDailyCallBudget),
  enabled = true,
  fetchImpl = fetch,
  maxCacheAgeDays = integerFromEnv(process.env.FMP_MAX_CACHE_AGE_DAYS, defaultFmpMaxCacheAgeDays),
  retrievedAt = new Date().toISOString(),
} = {}) {
  const normalizedApiKey = String(apiKey ?? "").trim();
  const usageDate = strictDate(asOfDate ?? retrievedAt.slice(0, 10), "FMP usage date");
  const state = {
    apiKey: normalizedApiKey,
    apiKeyConfigured: normalizedApiKey !== "",
    baseUrl: String(baseUrl).replace(/\/$/, ""),
    cacheDir,
    dailyCallBudget,
    enabled,
    fetchImpl,
    maxCacheAgeDays,
    networkCalls: 0,
    retrievedAt,
    usageDate,
  };
  return {
    async getJson({
      endpoint,
      params = {},
      symbol = "",
    }) {
      return await getFmpJson({
        endpoint,
        params,
        state,
        symbol,
      });
    },
    summary() {
      return {
        api_key_configured: state.apiKeyConfigured,
        cache_dir: cacheDir,
        daily_call_budget: dailyCallBudget,
        enabled,
        max_cache_age_days: maxCacheAgeDays,
        network_calls_this_process: state.networkCalls,
        source: fmpSourceName,
        usage_date: usageDate,
        usage_file: usageFile(state),
        usage_file_network_calls: usageNetworkCallCount(state),
      };
    },
  };
}

export function firstFmpRecord(value) {
  if (Array.isArray(value)) {
    return value[0] ?? {};
  }
  return value && typeof value === "object" ? value : {};
}

async function getFmpJson({
  endpoint,
  params,
  state,
  symbol,
}) {
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  const sanitizedParams = sanitizedQueryParams(params);
  if (!state.enabled) {
    return skippedFmpResult("disabled");
  }
  if (!state.apiKeyConfigured) {
    return skippedFmpResult("missing_api_key");
  }
  const cacheFile = cachePath({
    endpoint: normalizedEndpoint,
    params: sanitizedParams,
    state,
  });
  const cacheResult = readFreshCache({
    cacheFile,
    state,
  });
  if (cacheResult.ok) {
    appendUsage({
      cacheStatus: "cache_hit",
      endpoint: normalizedEndpoint,
      error: "",
      httpStatus: "",
      ok: true,
      params: sanitizedParams,
      state,
      symbol,
    });
    return {
      cache_status: "cache_hit",
      data: cacheResult.data,
      ok: true,
      source: fmpSourceName,
      status: "",
    };
  }
  const usedCalls = usageNetworkCallCount(state);
  if (usedCalls >= state.dailyCallBudget) {
    return skippedFmpResult("daily_call_budget_exhausted");
  }

  const url = fmpUrl({
    endpoint: normalizedEndpoint,
    params: sanitizedParams,
    state,
  });
  try {
    const response = await state.fetchImpl(url);
    state.networkCalls += 1;
    const httpStatus = String(response.status ?? "");
    if (!response.ok) {
      appendUsage({
        cacheStatus: "network_fetch",
        endpoint: normalizedEndpoint,
        error: `HTTP ${httpStatus}`,
        httpStatus,
        ok: false,
        params: sanitizedParams,
        state,
        symbol,
      });
      return {
        cache_status: "network_fetch",
        data: null,
        error: `FMP ${normalizedEndpoint} returned HTTP ${httpStatus}`,
        ok: false,
        source: fmpSourceName,
        status: httpStatus,
      };
    }
    const data = await response.json();
    writeCache({
      cacheFile,
      data,
      endpoint: normalizedEndpoint,
      params: sanitizedParams,
      state,
    });
    appendUsage({
      cacheStatus: "network_fetch",
      endpoint: normalizedEndpoint,
      error: "",
      httpStatus,
      ok: true,
      params: sanitizedParams,
      state,
      symbol,
    });
    return {
      cache_status: "network_fetch",
      data,
      ok: true,
      source: fmpSourceName,
      status: httpStatus,
    };
  } catch (error) {
    state.networkCalls += 1;
    appendUsage({
      cacheStatus: "network_fetch",
      endpoint: normalizedEndpoint,
      error: error instanceof Error ? error.message : String(error),
      httpStatus: "network_error",
      ok: false,
      params: sanitizedParams,
      state,
      symbol,
    });
    return {
      cache_status: "network_fetch",
      data: null,
      error: `FMP ${normalizedEndpoint} network error`,
      ok: false,
      source: fmpSourceName,
      status: "network_error",
    };
  }
}

function skippedFmpResult(reason) {
  return {
    cache_status: "skipped",
    data: null,
    error: reason,
    ok: false,
    source: fmpSourceName,
    status: reason,
  };
}

function fmpUrl({
  endpoint,
  params,
  state,
}) {
  const url = new URL(`${state.baseUrl}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  url.searchParams.set("apikey", state.apiKey);
  return url;
}

function readFreshCache({
  cacheFile,
  state,
}) {
  if (!existsSync(cacheFile)) {
    return {
      ok: false,
    };
  }
  try {
    const parsed = JSON.parse(readFileSync(cacheFile, "utf8"));
    if (parsed.schema_version !== 1 || parsed.source !== fmpSourceName) {
      return {
        ok: false,
      };
    }
    if (cacheAgeDays(parsed.fetched_at, state.usageDate) > state.maxCacheAgeDays) {
      return {
        ok: false,
      };
    }
    if (parsed.payload_sha256 !== sha256(JSON.stringify(parsed.data))) {
      return {
        ok: false,
      };
    }
    return {
      data: parsed.data,
      ok: true,
    };
  } catch {
    return {
      ok: false,
    };
  }
}

function writeCache({
  cacheFile,
  data,
  endpoint,
  params,
  state,
}) {
  mkdirSync(path.dirname(cacheFile), { recursive: true });
  writeFileSync(cacheFile, `${JSON.stringify({
    schema_version: 1,
    source: fmpSourceName,
    endpoint,
    params,
    fetched_at: state.retrievedAt,
    retrieved_at: state.usageDate,
    payload_sha256: sha256(JSON.stringify(data)),
    data,
  }, null, 2)}\n`);
}

function appendUsage({
  cacheStatus,
  endpoint,
  error,
  httpStatus,
  ok,
  params,
  state,
  symbol,
}) {
  mkdirSync(path.dirname(usageFile(state)), { recursive: true });
  const line = JSON.stringify({
    schema_version: usageSchemaVersion,
    at: state.retrievedAt,
    source: fmpSourceName,
    endpoint,
    params,
    symbol,
    cache_status: cacheStatus,
    http_status: httpStatus,
    ok,
    error,
  });
  const current = existsSync(usageFile(state)) ? readFileSync(usageFile(state), "utf8") : "";
  writeFileSync(usageFile(state), `${current}${line}\n`);
}

function usageNetworkCallCount(state) {
  const file = usageFile(state);
  if (!existsSync(file)) {
    return 0;
  }
  return readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return {};
      }
    })
    .filter((record) => record.cache_status === "network_fetch")
    .length;
}

function usageFile(state) {
  return path.join(state.cacheDir, "usage", `${state.usageDate}.jsonl`);
}

function cachePath({
  endpoint,
  params,
  state,
}) {
  const cacheKey = sha256(JSON.stringify({
    endpoint,
    params,
  }));
  return path.join(state.cacheDir, "responses", endpoint, `${cacheKey}.json`);
}

function sanitizedQueryParams(params) {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([key]) => key !== "apikey")
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

function normalizeEndpoint(value) {
  const endpoint = String(value ?? "").trim().replace(/^\/+|\/+$/g, "");
  if (endpoint === "" || endpoint.includes("..")) {
    throw new Error("FMP endpoint must be a non-empty relative endpoint");
  }
  return endpoint;
}

function integerFromEnv(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : fallback;
}

function cacheAgeDays(fetchedAt, asOfDate) {
  const fetchedDate = strictDate(String(fetchedAt ?? "").slice(0, 10), "FMP cache fetched date");
  const asOf = strictDate(asOfDate, "FMP as-of date");
  const age = Date.parse(`${asOf}T00:00:00.000Z`) - Date.parse(`${fetchedDate}T00:00:00.000Z`);
  if (age < 0) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.floor(age / (24 * 60 * 60 * 1000));
}

function strictDate(value, context) {
  const text = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error(`${context} must use YYYY-MM-DD`);
  }
  const parsed = new Date(`${text}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
    throw new Error(`${context} must be a valid calendar date`);
  }
  return text;
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}
