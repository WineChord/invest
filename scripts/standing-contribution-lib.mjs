const ledgerColumns = Object.freeze([
  "event_id",
  "event_type",
  "status",
  "broker",
  "account_alias",
  "confirmation_id",
  "trade_date",
  "settlement_date",
  "symbol",
  "side",
  "quantity",
  "average_price",
  "fees",
  "gross_amount",
  "net_cash_effect",
  "currency",
  "source",
  "created_at",
  "notes",
]);

const millisecondsPerDay = 86_400_000;

export function parseCsv(content) {
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
      if (row.some((value) => value !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (quoted) {
    throw new Error("ledger CSV contains an unterminated quoted field");
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((value) => value !== "")) {
      rows.push(row);
    }
  }
  return rows;
}

export function csvRecords(content) {
  const rows = parseCsv(content);
  if (rows.length === 0) {
    throw new Error("ledger CSV is empty");
  }
  const header = rows[0];
  if (header.join(",") !== ledgerColumns.join(",")) {
    throw new Error("ledger CSV header does not match the canonical account schema");
  }
  return rows.slice(1).map((row, index) => {
    if (row.length !== header.length) {
      throw new Error(`ledger CSV row ${index + 2} has ${row.length} columns; expected ${header.length}`);
    }
    return Object.fromEntries(header.map((key, columnIndex) => [key, row[columnIndex] ?? ""]));
  });
}

export function stringifyCsv(records) {
  const escapeField = (value) => {
    const text = String(value ?? "");
    return /[",\r\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
  };
  return [
    ledgerColumns.join(","),
    ...records.map((record) => ledgerColumns.map((column) => escapeField(record[column])).join(",")),
  ].join("\n") + "\n";
}

export function validateDateOnly(value, context) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${context} must be a YYYY-MM-DD date`);
  }
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) {
    throw new Error(`${context} must be a real calendar date`);
  }
  return value;
}

function weekday(value) {
  return new Date(`${value}T00:00:00.000Z`).getUTCDay();
}

function addDays(value, days) {
  const timestamp = Date.parse(`${value}T00:00:00.000Z`) + days * millisecondsPerDay;
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function recurringContributionRegistry(plan) {
  if (plan?.schema_version !== 2) {
    throw new Error("data/account/plan.yml schema_version must be 2");
  }
  const registry = plan.recurring_contribution;
  if (registry === null || typeof registry !== "object" || Array.isArray(registry)) {
    throw new Error("recurring_contribution must be an object");
  }
  if (
    typeof registry.current_authorization_id !== "string"
    || registry.current_authorization_id.trim() === ""
  ) {
    throw new Error("recurring_contribution.current_authorization_id is required");
  }
  if (!Array.isArray(registry.authorizations) || registry.authorizations.length === 0) {
    throw new Error("recurring_contribution.authorizations must be a non-empty array");
  }
  const seenIds = new Set();
  for (const contribution of registry.authorizations) {
    validateAuthorization(contribution);
    if (seenIds.has(contribution.authorization_id)) {
      throw new Error(`recurring contribution duplicates authorization_id ${contribution.authorization_id}`);
    }
    seenIds.add(contribution.authorization_id);
  }
  const current = registry.authorizations.find(
    (contribution) => contribution.authorization_id === registry.current_authorization_id,
  );
  if (current === undefined) {
    throw new Error("recurring_contribution.current_authorization_id does not identify an authorization");
  }
  if (!new Set(["active_owner_standing_authorization", "paused_broker_conflict"]).has(current.status)) {
    throw new Error("the current recurring contribution authorization must be active or conflict-paused");
  }
  const byEffectiveDate = [...registry.authorizations].sort(
    (left, right) => left.effective_from.localeCompare(right.effective_from),
  );
  for (let index = 1; index < byEffectiveDate.length; index += 1) {
    const previous = byEffectiveDate[index - 1];
    const next = byEffectiveDate[index];
    if (
      previous.broker === next.broker
      && previous.account_alias === next.account_alias
      && (previous.effective_until === null || previous.effective_until >= next.effective_from)
    ) {
      throw new Error(
        `recurring contribution authorization periods overlap: ${previous.authorization_id} and ${next.authorization_id}`,
      );
    }
  }
  return {
    current,
    authorizations: registry.authorizations,
    by_id: new Map(registry.authorizations.map((contribution) => [contribution.authorization_id, contribution])),
  };
}

export function validateRecurringContributionPlan(plan) {
  return recurringContributionRegistry(plan).current;
}

function validateAuthorization(contribution) {
  if (contribution === null || typeof contribution !== "object" || Array.isArray(contribution)) {
    throw new Error("recurring contribution authorization must be an object");
  }
  if (!new Set(["active_owner_standing_authorization", "paused_broker_conflict"]).has(contribution.status)) {
    if (!new Set(["superseded", "revoked"]).has(contribution.status)) {
      throw new Error("recurring contribution authorization has an unsupported status");
    }
  }
  if (contribution.amount !== 888 || contribution.currency !== "USD") {
    throw new Error("recurring contribution authorization must be exactly USD 888");
  }
  if (
    contribution.cadence !== "weekly"
    || contribution.weekday !== "friday"
    || contribution.timezone !== "Asia/Shanghai"
  ) {
    throw new Error("recurring contribution authorization must use the approved Friday Asia/Shanghai cadence");
  }
  if (contribution.occurrence_confirmation_required !== false) {
    throw new Error("recurring contribution occurrence confirmation must be disabled");
  }
  if (contribution.catch_up_missed_occurrences !== true || contribution.backfill_before_effective_from !== false) {
    throw new Error("recurring contribution catch-up and backfill controls do not match policy");
  }
  if (
    !Number.isInteger(contribution.max_catch_up_events_per_run)
    || contribution.max_catch_up_events_per_run < 1
  ) {
    throw new Error("recurring contribution max_catch_up_events_per_run must be a positive integer");
  }
  validateDateOnly(contribution.authorized_on, "recurring contribution authorized_on");
  validateDateOnly(contribution.effective_from, "recurring contribution effective_from");
  if (contribution.effective_from < contribution.authorized_on || weekday(contribution.effective_from) !== 5) {
    throw new Error("recurring contribution effective_from must be a Friday on or after authorization");
  }
  if (contribution.effective_until !== null) {
    validateDateOnly(contribution.effective_until, "recurring contribution effective_until");
    if (contribution.effective_until < contribution.effective_from) {
      throw new Error("recurring contribution effective_until precedes effective_from");
    }
  }
  for (const field of ["authorization_id", "broker", "account_alias", "availability_semantics"]) {
    if (typeof contribution[field] !== "string" || contribution[field].trim() === "") {
      throw new Error(`recurring contribution ${field} is required`);
    }
  }
  if (contribution.availability_semantics !== "deposited_settled_and_available_for_trading") {
    throw new Error("recurring contribution availability semantics must cover deposited, settled, and available cash");
  }
  if (contribution.status === "paused_broker_conflict") {
    validateDateOnly(contribution.paused_on, "recurring contribution paused_on");
    if (
      typeof contribution.broker_conflict_correction_event_id !== "string"
      || contribution.broker_conflict_correction_event_id.trim() === ""
    ) {
      throw new Error("conflict-paused recurring contribution must reference its correction event");
    }
  }
  return contribution;
}

export function dueContributionDates(contribution, asOf) {
  validateDateOnly(asOf, "--as-of");
  const end = contribution.effective_until === null || contribution.effective_until > asOf
    ? asOf
    : contribution.effective_until;
  if (end < contribution.effective_from) {
    return [];
  }
  const dates = [];
  for (let cursor = contribution.effective_from; cursor <= end; cursor = addDays(cursor, 7)) {
    dates.push(cursor);
  }
  return dates;
}

function amountEquals(value, expected) {
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number - expected) < 0.005;
}

function isCanonicalStandingRow(row, contribution, date) {
  const canonicalConfirmationId = `${contribution.authorization_id}-${date}`;
  return row.event_type === "deposit"
    && row.status === "confirmed"
    && row.broker === contribution.broker
    && row.account_alias === contribution.account_alias
    && row.trade_date === date
    && row.settlement_date === date
    && row.currency === contribution.currency
    && row.confirmation_id === canonicalConfirmationId
    && row.source === "owner_standing_contribution"
    && amountEquals(row.gross_amount, contribution.amount)
    && amountEquals(row.net_cash_effect, contribution.amount)
    && amountEquals(row.fees, 0)
    && row.symbol === ""
    && row.side === ""
    && row.quantity === ""
    && row.average_price === "";
}

function sameDayCompetingRows(records, contribution, date) {
  return records.filter((row) =>
    row.event_type === "deposit"
    && row.status === "confirmed"
    && row.broker === contribution.broker
    && row.account_alias === contribution.account_alias
    && row.trade_date === date
    && row.currency === contribution.currency
    && amountEquals(row.net_cash_effect, contribution.amount)
    && row.source !== "user_confirmed_additional_deposit");
}

function matchingOccurrenceRows(records, contribution, date) {
  const canonical = records.filter((row) => isCanonicalStandingRow(row, contribution, date));
  const competitors = sameDayCompetingRows(records, contribution, date)
    .filter((row) => !canonical.includes(row));
  if (competitors.length > 0) {
    throw new Error(
      `ambiguous same-day USD 888 deposit for standing contribution due ${date}; link it to the authorization or mark it as an additional deposit`,
    );
  }
  return canonical;
}

export function standingAuthorizationForLedgerRow(plan, row) {
  const registry = recurringContributionRegistry(plan);
  const matches = registry.authorizations.filter((contribution) =>
    row.confirmation_id === `${contribution.authorization_id}-${row.trade_date}`);
  if (matches.length !== 1) {
    throw new Error(`standing event ${row.event_id} does not identify exactly one authorization version`);
  }
  const contribution = matches[0];
  if (!isCanonicalStandingRow(row, contribution, row.trade_date)) {
    throw new Error(`standing event ${row.event_id} does not match authorization ${contribution.authorization_id}`);
  }
  if (
    row.trade_date < contribution.effective_from
    || (contribution.effective_until !== null && row.trade_date > contribution.effective_until)
    || weekday(row.trade_date) !== 5
  ) {
    throw new Error(`standing event ${row.event_id} falls outside its authorization period`);
  }
  return contribution;
}

function canonicalEvent(contribution, date, createdAt) {
  return {
    event_id: `${date}-deposit-weekly-888-001`,
    event_type: "deposit",
    status: "confirmed",
    broker: contribution.broker,
    account_alias: contribution.account_alias,
    confirmation_id: `${contribution.authorization_id}-${date}`,
    trade_date: date,
    settlement_date: date,
    symbol: "",
    side: "",
    quantity: "",
    average_price: "",
    fees: "0.00",
    gross_amount: contribution.amount.toFixed(2),
    net_cash_effect: contribution.amount.toFixed(2),
    currency: contribution.currency,
    source: "owner_standing_contribution",
    created_at: createdAt,
    notes: `Weekly USD 888 contribution recorded under the active account-owner standing authorization effective ${contribution.effective_from}.`,
  };
}

function confirmedLedgerCash(records, currency) {
  return records
    .filter((row) => row.status === "confirmed" && row.currency === currency)
    .reduce((total, row) => {
      const value = Number(row.net_cash_effect);
      if (!Number.isFinite(value)) {
        throw new Error(`ledger event ${row.event_id} has invalid net_cash_effect`);
      }
      return total + value;
    }, 0);
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function recoverableStateGap(plan, records, state, difference, asOf) {
  if (Math.abs(difference) < 0.005) {
    return true;
  }
  const lastIndex = records.findIndex((row) => row.event_id === state.last_confirmed_ledger_event_id);
  if (lastIndex === -1) {
    return false;
  }
  const later = records.slice(lastIndex + 1).filter((row) => row.status === "confirmed");
  return later.length > 0
    && later.every((row) => {
      if (row.source !== "owner_standing_contribution" || row.trade_date > asOf) {
        return false;
      }
      try {
        standingAuthorizationForLedgerRow(plan, row);
        return true;
      } catch {
        return false;
      }
    })
    && Math.abs(later.reduce((total, row) => total + Number(row.net_cash_effect), 0) - difference) < 0.005;
}

function timestampDateInShanghai(value) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new Error("createdAt must be a real ISO timestamp");
  }
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(timestamp))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function applyStandingContribution({
  plan,
  ledgerContent,
  state,
  asOf,
  createdAt,
}) {
  const contribution = validateRecurringContributionPlan(plan);
  if (contribution.status !== "active_owner_standing_authorization") {
    throw new Error("recurring_contribution is not active");
  }
  validateDateOnly(asOf, "--as-of");
  if (
    typeof createdAt !== "string"
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(createdAt)
  ) {
    throw new Error("createdAt must be an ISO timestamp with timezone");
  }
  if (timestampDateInShanghai(createdAt) !== asOf) {
    throw new Error("createdAt must fall on the --as-of date in Asia/Shanghai");
  }

  const originalRecords = csvRecords(ledgerContent);
  const seenEventIds = new Set();
  for (const row of originalRecords) {
    if (seenEventIds.has(row.event_id)) {
      throw new Error(`ledger duplicates event_id ${row.event_id}`);
    }
    seenEventIds.add(row.event_id);
    if (row.status === "confirmed" && row.trade_date > asOf) {
      throw new Error(`ledger event ${row.event_id} is later than --as-of ${asOf}`);
    }
  }
  const originalCash = confirmedLedgerCash(originalRecords, contribution.currency);
  if (state?.base_currency !== contribution.currency) {
    throw new Error("account state base_currency does not match the standing contribution");
  }
  validateDateOnly(state?.as_of, "account state as_of");
  if (state.as_of > asOf) {
    throw new Error("account state as_of is later than --as-of");
  }
  const stateCash = Number(state.confirmed_cash);
  const stateSettledCash = Number(state.settled_cash);
  const stateBuyingPower = Number(state.buying_power);
  if (![stateCash, stateSettledCash, stateBuyingPower].every(Number.isFinite)) {
    throw new Error("account state cash fields must be numeric");
  }
  const originalGap = roundCurrency(originalCash - stateCash);
  if (!recoverableStateGap(plan, originalRecords, state, originalGap, asOf)) {
    throw new Error(
      `account state and ledger differ by ${originalGap.toFixed(2)} outside a recoverable standing-contribution update`,
    );
  }
  const settledLedgerCashAtStateDate = roundCurrency(
    originalRecords
      .filter((row) =>
        row.status === "confirmed"
        && row.currency === contribution.currency
        && (row.settlement_date || row.trade_date) <= state.as_of)
      .reduce((total, row) => total + Number(row.net_cash_effect), 0),
  );
  if (Math.abs(settledLedgerCashAtStateDate - stateSettledCash) >= 0.005) {
    throw new Error("account settled cash and ledger differ before standing-contribution application");
  }
  const lastConfirmedEventId = originalRecords.filter((row) => row.status === "confirmed").at(-1)?.event_id;
  if (Math.abs(originalGap) < 0.005 && lastConfirmedEventId !== state.last_confirmed_ledger_event_id) {
    throw new Error("account state last confirmed event does not match the ledger");
  }

  const dueDates = dueContributionDates(contribution, asOf);
  const existingDates = [];
  const missingDates = [];
  const records = [...originalRecords];
  for (const date of dueDates) {
    const matches = matchingOccurrenceRows(records, contribution, date);
    if (matches.length > 1) {
      throw new Error(`multiple ledger deposits match the standing contribution due ${date}`);
    }
    if (matches.length === 1) {
      existingDates.push(date);
      continue;
    }
    missingDates.push(date);
  }
  const appliedDates = missingDates.slice(0, contribution.max_catch_up_events_per_run);
  const remainingDueDates = missingDates.slice(contribution.max_catch_up_events_per_run);
  for (const date of appliedDates) {
    const event = canonicalEvent(contribution, date, createdAt);
    if (records.some((row) => row.event_id === event.event_id || row.confirmation_id === event.confirmation_id)) {
      throw new Error(`standing contribution identity collision for ${date}`);
    }
    records.push(event);
  }

  const ledgerCash = roundCurrency(confirmedLedgerCash(records, contribution.currency));
  const stateDelta = roundCurrency(ledgerCash - stateCash);
  const latestStandingDate = [...existingDates, ...appliedDates].sort().at(-1);
  const shouldReconcileState = Math.abs(stateDelta) >= 0.005;
  const nextState = shouldReconcileState
    ? {
        ...state,
        as_of: [state.as_of, latestStandingDate].filter(Boolean).sort().at(-1),
        confirmed_cash: ledgerCash,
        settled_cash: roundCurrency(stateSettledCash + stateDelta),
        buying_power: roundCurrency(stateBuyingPower + stateDelta),
        last_confirmed_ledger_event_id: records.filter((row) => row.status === "confirmed").at(-1)?.event_id,
        last_standing_contribution_date: latestStandingDate,
      }
    : state;

  let status = "not_due";
  if (remainingDueDates.length > 0) {
    status = "partial_catch_up";
  } else if (appliedDates.length > 0) {
    status = "applied";
  } else if (dueDates.length > 0) {
    status = "already_recorded";
  }
  return {
    status,
    as_of: asOf,
    due_dates: dueDates,
    applied_dates: appliedDates,
    remaining_due_dates: remainingDueDates,
    existing_dates: existingDates,
    cash_before: roundCurrency(stateCash),
    cash_after: ledgerCash,
    state_reconciled: shouldReconcileState,
    ledger_content: stringifyCsv(records),
    state: nextState,
  };
}

export function recordStandingContributionConflict({
  plan,
  ledgerContent,
  state,
  correctsEventId,
  confirmationId,
  reason,
  asOf,
  createdAt,
}) {
  const registry = recurringContributionRegistry(plan);
  const contribution = registry.current;
  if (contribution.status !== "active_owner_standing_authorization") {
    throw new Error("the current recurring contribution authorization is not active");
  }
  validateDateOnly(asOf, "--as-of");
  validateDateOnly(state?.as_of, "account state as_of");
  if (state.as_of > asOf) {
    throw new Error("account state as_of is later than --as-of");
  }
  if (
    typeof createdAt !== "string"
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(createdAt)
    || timestampDateInShanghai(createdAt) !== asOf
  ) {
    throw new Error("createdAt must be a real ISO timestamp on the --as-of date in Asia/Shanghai");
  }
  for (const [value, context] of [
    [correctsEventId, "correctsEventId"],
    [confirmationId, "confirmationId"],
    [reason, "reason"],
  ]) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`${context} is required`);
    }
  }
  if (/[\r\n]/.test(confirmationId)) {
    throw new Error("confirmationId must be a single-line redacted alias");
  }

  const records = csvRecords(ledgerContent);
  if (state?.base_currency !== contribution.currency) {
    throw new Error("account state base_currency does not match the standing contribution");
  }
  const seenEventIds = new Set();
  for (const row of records) {
    if (seenEventIds.has(row.event_id)) {
      throw new Error(`ledger duplicates event_id ${row.event_id}`);
    }
    seenEventIds.add(row.event_id);
    if (row.status === "confirmed" && row.trade_date > asOf) {
      throw new Error(`ledger event ${row.event_id} is later than --as-of ${asOf}`);
    }
  }
  const confirmedRecords = records.filter((row) => row.status === "confirmed");
  if (confirmedRecords.at(-1)?.event_id !== state.last_confirmed_ledger_event_id) {
    throw new Error("account state last confirmed event does not match the ledger");
  }
  if (records.some((row) =>
    row.source === "broker_confirmed_standing_correction"
    && row.notes.includes(`corrects_event_id=${correctsEventId};`))) {
    throw new Error(`standing event ${correctsEventId} already has a linked correction`);
  }
  const corrected = records.find((row) => row.event_id === correctsEventId);
  if (corrected === undefined || corrected.source !== "owner_standing_contribution") {
    throw new Error("correctsEventId must identify a confirmed standing contribution");
  }
  const correctedAuthorization = standingAuthorizationForLedgerRow(plan, corrected);
  if (correctedAuthorization.authorization_id !== contribution.authorization_id) {
    throw new Error("the corrected standing event is not under the current authorization");
  }
  if (corrected.trade_date > asOf) {
    throw new Error("the correction date cannot precede the standing event");
  }
  if (records.some((row) =>
    row.broker === contribution.broker
    && row.account_alias === contribution.account_alias
    && row.confirmation_id === confirmationId)) {
    throw new Error("confirmationId already exists for this broker account");
  }
  const stateCash = Number(state.confirmed_cash);
  const stateSettledCash = Number(state.settled_cash);
  const stateBuyingPower = Number(state.buying_power);
  if (![stateCash, stateSettledCash, stateBuyingPower].every(Number.isFinite)) {
    throw new Error("account state cash fields must be numeric");
  }
  const ledgerCash = roundCurrency(confirmedLedgerCash(records, contribution.currency));
  if (Math.abs(ledgerCash - stateCash) >= 0.005) {
    throw new Error("account state and ledger must agree before recording a standing conflict");
  }
  const settledLedgerCash = roundCurrency(
    confirmedRecords
      .filter((row) =>
        row.currency === contribution.currency
        && (row.settlement_date || row.trade_date) <= state.as_of)
      .reduce((total, row) => total + Number(row.net_cash_effect), 0),
  );
  if (Math.abs(settledLedgerCash - stateSettledCash) >= 0.005) {
    throw new Error("account settled cash and ledger must agree before recording a standing conflict");
  }

  const sequence = nextCorrectionSequence(records, asOf);
  const correctionEventId = `${asOf}-correction-standing-${String(sequence).padStart(3, "0")}`;
  const cashDelta = -Number(corrected.net_cash_effect);
  const correction = {
    event_id: correctionEventId,
    event_type: "correction",
    status: "confirmed",
    broker: contribution.broker,
    account_alias: contribution.account_alias,
    confirmation_id: confirmationId,
    trade_date: asOf,
    settlement_date: asOf,
    symbol: "",
    side: "",
    quantity: "",
    average_price: "",
    fees: "0.00",
    gross_amount: cashDelta.toFixed(2),
    net_cash_effect: cashDelta.toFixed(2),
    currency: contribution.currency,
    source: "broker_confirmed_standing_correction",
    created_at: createdAt,
    notes: `corrects_event_id=${correctsEventId}; ${reason.trim()}`,
  };
  records.push(correction);

  const nextPlan = structuredClone(plan);
  const nextAuthorization = nextPlan.recurring_contribution.authorizations.find(
    (authorization) => authorization.authorization_id === contribution.authorization_id,
  );
  nextAuthorization.status = "paused_broker_conflict";
  nextAuthorization.paused_on = asOf;
  nextAuthorization.broker_conflict_correction_event_id = correctionEventId;

  const nextState = {
    ...state,
    as_of: asOf,
    confirmed_cash: roundCurrency(stateCash + cashDelta),
    settled_cash: roundCurrency(stateSettledCash + cashDelta),
    buying_power: roundCurrency(stateBuyingPower + cashDelta),
    last_confirmed_ledger_event_id: correctionEventId,
  };
  recurringContributionRegistry(nextPlan);
  return {
    status: "corrected_and_paused",
    corrected_event_id: correctsEventId,
    correction_event_id: correctionEventId,
    cash_before: roundCurrency(stateCash),
    cash_after: nextState.confirmed_cash,
    ledger_content: stringifyCsv(records),
    state: nextState,
    plan: nextPlan,
  };
}

function nextCorrectionSequence(records, asOf) {
  const prefix = `${asOf}-correction-standing-`;
  const sequences = records
    .map((row) => row.event_id)
    .filter((eventId) => eventId.startsWith(prefix))
    .map((eventId) => Number(eventId.slice(prefix.length)))
    .filter(Number.isInteger);
  return Math.max(0, ...sequences) + 1;
}
