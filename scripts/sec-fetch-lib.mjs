export const defaultSecFetchRetries = 2;
export const defaultSecRetryDelayMs = 1000;
export const minCompleteUniverseRequestDelayMs = 100;

const defaultSecUserAgent = "winechord-invest/1.0 (discovery research; set SEC_USER_AGENT with contact for live runs)";
const defaultSecAccept = "application/json,text/plain,text/html,*/*";
const retryableSecStatuses = new Set([403, 408, 425, 429, 500, 502, 503, 504]);

export function currentSecUserAgent() {
  const configured = String(process.env.SEC_USER_AGENT ?? "").trim();
  return configured === "" ? defaultSecUserAgent : configured;
}

export function secRequestHeaders({
  accept = defaultSecAccept,
} = {}) {
  return {
    "User-Agent": currentSecUserAgent(),
    "Accept": accept,
    "Accept-Encoding": "gzip, deflate, br",
  };
}

export async function fetchSecJsonWithRetry({
  accept = "application/json,*/*",
  context,
  requestDelayMs = 0,
  retries = defaultSecFetchRetries,
  retryDelayMs = defaultSecRetryDelayMs,
  sourceUrl,
}) {
  const result = await fetchSecTextWithRetry({
    accept,
    context,
    requestDelayMs,
    retries,
    retryDelayMs,
    sourceUrl,
  });
  return {
    ...result,
    json: JSON.parse(result.content),
  };
}

export async function fetchSecTextWithRetry({
  accept = defaultSecAccept,
  context,
  requestDelayMs = 0,
  retries = defaultSecFetchRetries,
  retryDelayMs = defaultSecRetryDelayMs,
  sourceUrl,
}) {
  const requestStatuses = [];
  const maxAttempts = retries + 1;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (requestDelayMs > 0) {
      await sleep(requestDelayMs);
    }
    try {
      const response = await fetch(sourceUrl, {
        headers: secRequestHeaders({ accept }),
      });
      requestStatuses.push(String(response.status));
      if (response.ok) {
        return {
          attemptCount: attempt,
          content: await response.text(),
          requestStatuses,
        };
      }
      if (!isRetryableSecStatus(response.status) || attempt === maxAttempts) {
        throw secFetchError({
          attempt,
          context,
          requestStatuses,
          response,
        });
      }
      await sleep(secRetryDelayMs(response, retryDelayMs, attempt));
    } catch (error) {
      if (error?.secFetchFinal === true) {
        throw error;
      }
      if (requestStatuses.length < attempt) {
        requestStatuses.push("network_error");
      }
      if (attempt === maxAttempts) {
        error.requestAttemptCount = attempt;
        error.requestStatuses = [...requestStatuses];
        throw error;
      }
      await sleep(retryDelayMsForAttempt(retryDelayMs, attempt));
    }
  }
  throw new Error(`${context}: retry loop exhausted`);
}

export function isRetryableSecStatus(status) {
  return retryableSecStatuses.has(status);
}

function secFetchError({
  attempt,
  context,
  requestStatuses,
  response,
}) {
  const error = new Error(`${context}: ${response.status} ${response.statusText}`);
  error.requestAttemptCount = attempt;
  error.requestStatuses = [...requestStatuses];
  error.secFetchFinal = true;
  return error;
}

function secRetryDelayMs(response, fallbackDelayMs, attempt) {
  const retryAfter = retryAfterMs(response.headers.get("retry-after"));
  if (retryAfter !== undefined) {
    return retryAfter;
  }
  return retryDelayMsForAttempt(fallbackDelayMs, attempt);
}

function retryAfterMs(value) {
  const text = String(value ?? "").trim();
  if (text === "") {
    return undefined;
  }
  const seconds = Number(text);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }
  const timestamp = Date.parse(text);
  if (Number.isNaN(timestamp)) {
    return undefined;
  }
  return Math.max(0, timestamp - Date.now());
}

function retryDelayMsForAttempt(baseDelayMs, attempt) {
  return baseDelayMs * Math.max(1, 2 ** (attempt - 1));
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
