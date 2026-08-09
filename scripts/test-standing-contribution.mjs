import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  applyStandingContribution,
  csvRecords,
  recordStandingContributionConflict,
  standingAuthorizationForLedgerRow,
  validateRecurringContributionPlan,
} from "./standing-contribution-lib.mjs";
import {
  commitFileTransaction,
  recoverFileTransaction,
} from "./account-file-transaction.mjs";

const header = "event_id,event_type,status,broker,account_alias,confirmation_id,trade_date,settlement_date,symbol,side,quantity,average_price,fees,gross_amount,net_cash_effect,currency,source,created_at,notes\n";
const baseline = "2026-07-24-deposit-001,deposit,confirmed,Charles Schwab International,satellite,user-confirmed-2026-07-24-888-deposit,2026-07-24,2026-07-24,,,,,0.00,5761.58,5761.58,USD,user_confirmed_default_deposit,2026-07-24T10:35:24+08:00,Historical fixture.\n";
const plan = {
  schema_version: 2,
  recurring_contribution: {
    current_authorization_id: "owner-standing-weekly-888-2026-07-29-v1",
    authorizations: [{
      amount: 888,
      currency: "USD",
      cadence: "weekly",
      weekday: "friday",
      timezone: "Asia/Shanghai",
      authorized_on: "2026-07-29",
      effective_from: "2026-07-31",
      effective_until: null,
      status: "active_owner_standing_authorization",
      authorization_id: "owner-standing-weekly-888-2026-07-29-v1",
      broker: "Charles Schwab International",
      account_alias: "satellite",
      occurrence_confirmation_required: false,
      availability_semantics: "deposited_settled_and_available_for_trading",
      catch_up_missed_occurrences: true,
      max_catch_up_events_per_run: 8,
      backfill_before_effective_from: false,
    }],
  },
};
const state = {
  schema_version: 1,
  as_of: "2026-07-24",
  status: "funded_with_positions",
  base_currency: "USD",
  confirmed_cash: 5761.58,
  settled_cash: 5761.58,
  buying_power: 5761.58,
  positions_count: 2,
  last_confirmed_ledger_event_id: "2026-07-24-deposit-001",
  last_reconciled_with_broker_at: "2026-07-24",
};

assert.equal(validateRecurringContributionPlan(plan).effective_from, "2026-07-31");

const beforeFriday = applyStandingContribution({
  plan,
  ledgerContent: header + baseline,
  state,
  asOf: "2026-07-29",
  createdAt: "2026-07-29T20:00:00+08:00",
});
assert.equal(beforeFriday.status, "not_due");
assert.deepEqual(beforeFriday.applied_dates, []);
assert.equal(beforeFriday.cash_after, 5761.58);

const firstFriday = applyStandingContribution({
  plan,
  ledgerContent: header + baseline,
  state,
  asOf: "2026-07-31",
  createdAt: "2026-07-31T15:00:00+08:00",
});
assert.equal(firstFriday.status, "applied");
assert.deepEqual(firstFriday.applied_dates, ["2026-07-31"]);
assert.equal(firstFriday.cash_after, 6649.58);
assert.equal(firstFriday.state.settled_cash, 6649.58);
assert.equal(firstFriday.state.buying_power, 6649.58);
assert.equal(firstFriday.state.last_reconciled_with_broker_at, "2026-07-24");
assert.equal(firstFriday.state.last_standing_contribution_date, "2026-07-31");
assert.equal(csvRecords(firstFriday.ledger_content).length, 2);

const versionedPlan = structuredClone(plan);
versionedPlan.recurring_contribution.authorizations[0].status = "superseded";
versionedPlan.recurring_contribution.authorizations[0].effective_until = "2026-08-21";
const replacementAuthorization = structuredClone(
  versionedPlan.recurring_contribution.authorizations[0],
);
Object.assign(replacementAuthorization, {
  authorization_id: "owner-standing-weekly-888-2026-08-20-v2",
  authorized_on: "2026-08-20",
  effective_from: "2026-08-28",
  effective_until: null,
  status: "active_owner_standing_authorization",
});
versionedPlan.recurring_contribution.authorizations.push(replacementAuthorization);
versionedPlan.recurring_contribution.current_authorization_id = replacementAuthorization.authorization_id;
assert.equal(
  validateRecurringContributionPlan(versionedPlan).authorization_id,
  replacementAuthorization.authorization_id,
);
assert.equal(
  standingAuthorizationForLedgerRow(versionedPlan, csvRecords(firstFriday.ledger_content).at(-1)).authorization_id,
  "owner-standing-weekly-888-2026-07-29-v1",
);

const conflict = recordStandingContributionConflict({
  plan,
  ledgerContent: firstFriday.ledger_content,
  state: firstFriday.state,
  correctsEventId: "2026-07-31-deposit-weekly-888-001",
  confirmationId: "broker-evidence-redacted-2026-08-01-001",
  reason: "Broker evidence showed that the scheduled deposit did not post.",
  asOf: "2026-08-01",
  createdAt: "2026-08-01T09:00:00+08:00",
});
assert.equal(conflict.status, "corrected_and_paused");
assert.equal(conflict.cash_after, 5761.58);
assert.equal(conflict.state.settled_cash, 5761.58);
assert.equal(conflict.state.buying_power, 5761.58);
assert.equal(
  conflict.plan.recurring_contribution.authorizations[0].status,
  "paused_broker_conflict",
);
assert.equal(csvRecords(conflict.ledger_content).at(-1).net_cash_effect, "-888.00");
assert.match(csvRecords(conflict.ledger_content).at(-1).notes, /corrects_event_id=2026-07-31-deposit-weekly-888-001;/);
assert.throws(() => applyStandingContribution({
  plan: conflict.plan,
  ledgerContent: conflict.ledger_content,
  state: conflict.state,
  asOf: "2026-08-07",
  createdAt: "2026-08-07T15:00:00+08:00",
}), /is not active/);
assert.throws(() => recordStandingContributionConflict({
  plan,
  ledgerContent: conflict.ledger_content,
  state: conflict.state,
  correctsEventId: "2026-07-31-deposit-weekly-888-001",
  confirmationId: "broker-evidence-redacted-2026-08-01-002",
  reason: "Duplicate correction attempt.",
  asOf: "2026-08-01",
  createdAt: "2026-08-01T09:01:00+08:00",
}), /already has a linked correction/);

const idempotent = applyStandingContribution({
  plan,
  ledgerContent: firstFriday.ledger_content,
  state: firstFriday.state,
  asOf: "2026-07-31",
  createdAt: "2026-07-31T15:01:00+08:00",
});
assert.equal(idempotent.status, "already_recorded");
assert.deepEqual(idempotent.applied_dates, []);
assert.equal(csvRecords(idempotent.ledger_content).length, 2);
assert.equal(idempotent.cash_after, 6649.58);

const recoveredAfterInterruptedWrite = applyStandingContribution({
  plan,
  ledgerContent: firstFriday.ledger_content,
  state,
  asOf: "2026-07-31",
  createdAt: "2026-07-31T15:02:00+08:00",
});
assert.equal(recoveredAfterInterruptedWrite.status, "already_recorded");
assert.equal(recoveredAfterInterruptedWrite.state_reconciled, true);
assert.equal(recoveredAfterInterruptedWrite.state.confirmed_cash, 6649.58);
assert.equal(recoveredAfterInterruptedWrite.state.settled_cash, 6649.58);
assert.equal(recoveredAfterInterruptedWrite.state.buying_power, 6649.58);

assert.throws(() => applyStandingContribution({
  plan,
  ledgerContent: firstFriday.ledger_content,
  state,
  asOf: "2026-07-29",
  createdAt: "2026-07-29T15:00:00+08:00",
}), /later than --as-of/);

assert.throws(() => applyStandingContribution({
  plan,
  ledgerContent: header + baseline,
  state: { ...state, as_of: "2026-07-30" },
  asOf: "2026-07-29",
  createdAt: "2026-07-29T15:00:00+08:00",
}), /state as_of is later/);

assert.throws(() => applyStandingContribution({
  plan,
  ledgerContent: header + baseline,
  state: { ...state, settled_cash: 5000 },
  asOf: "2026-07-29",
  createdAt: "2026-07-29T15:00:00+08:00",
}), /settled cash and ledger differ/);

const catchUp = applyStandingContribution({
  plan,
  ledgerContent: firstFriday.ledger_content,
  state: firstFriday.state,
  asOf: "2026-08-14",
  createdAt: "2026-08-14T15:00:00+08:00",
});
assert.deepEqual(catchUp.applied_dates, ["2026-08-07", "2026-08-14"]);
assert.equal(catchUp.cash_after, 8425.58);
assert.equal(csvRecords(catchUp.ledger_content).length, 4);

const unsettledTrade = "2026-08-06-buy-mda-001,trade,confirmed,Charles Schwab International,satellite,screenshot-2026-08-06-mda-001,2026-08-06,2026-08-07,MDA,buy,6,33.8555,0.00,203.13,-203.13,USD,user_confirmed_screenshot,2026-08-06T22:59:56+08:00,Historical fixture.\n";
const preSettlementState = {
  ...firstFriday.state,
  as_of: "2026-08-06",
  confirmed_cash: 6446.45,
  settled_cash: 6649.58,
  buying_power: 6446.45,
  last_confirmed_ledger_event_id: "2026-08-06-buy-mda-001",
};
const afterSettlementFriday = applyStandingContribution({
  plan,
  ledgerContent: firstFriday.ledger_content + unsettledTrade,
  state: preSettlementState,
  asOf: "2026-08-09",
  createdAt: "2026-08-09T09:00:00+08:00",
});
assert.deepEqual(afterSettlementFriday.applied_dates, ["2026-08-07"]);
assert.equal(afterSettlementFriday.state.confirmed_cash, 7334.45);
assert.equal(afterSettlementFriday.state.settled_cash, 7334.45);
assert.equal(afterSettlementFriday.state.buying_power, 7334.45);

const staleDerivedState = {
  ...afterSettlementFriday.state,
  settled_cash: 7537.58,
};
const recoveredDerivedState = applyStandingContribution({
  plan,
  ledgerContent: afterSettlementFriday.ledger_content,
  state: staleDerivedState,
  asOf: "2026-08-09",
  createdAt: "2026-08-09T09:01:00+08:00",
});
assert.equal(recoveredDerivedState.status, "already_recorded");
assert.equal(recoveredDerivedState.state_reconciled, true);
assert.equal(recoveredDerivedState.state.settled_cash, 7334.45);

const manualSameDay = `${header}${baseline}2026-07-31-deposit-001,deposit,confirmed,Charles Schwab International,satellite,user-confirmed-2026-07-31-888-deposit,2026-07-31,2026-07-31,,,,,0.00,888.00,888.00,USD,user_confirmed_default_deposit,2026-07-31T09:00:00+08:00,Manual same-day confirmation.\n`;
const manualState = { ...state, confirmed_cash: 6649.58, settled_cash: 6649.58, buying_power: 6649.58, as_of: "2026-07-31", last_confirmed_ledger_event_id: "2026-07-31-deposit-001" };
assert.throws(() => applyStandingContribution({
  plan,
  ledgerContent: manualSameDay,
  state: manualState,
  asOf: "2026-07-31",
  createdAt: "2026-07-31T15:00:00+08:00",
}), /ambiguous same-day/);

const explicitlyAdditional = manualSameDay
  .replaceAll("user_confirmed_default_deposit", "user_confirmed_additional_deposit");
const additionalApplied = applyStandingContribution({
  plan,
  ledgerContent: explicitlyAdditional,
  state: manualState,
  asOf: "2026-07-31",
  createdAt: "2026-07-31T15:00:00+08:00",
});
assert.equal(additionalApplied.status, "applied");
assert.equal(additionalApplied.cash_after, 7537.58);
assert.equal(csvRecords(additionalApplied.ledger_content).length, 3);

const invalidPlan = structuredClone(plan);
invalidPlan.recurring_contribution.authorizations[0].effective_from = "2026-07-30";
assert.throws(() => validateRecurringContributionPlan(invalidPlan), /must be a Friday/);

const invalidAmountPlan = structuredClone(plan);
invalidAmountPlan.recurring_contribution.authorizations[0].amount = -888;
assert.throws(() => validateRecurringContributionPlan(invalidAmountPlan), /must be exactly USD 888/);

const invalidTimezonePlan = structuredClone(plan);
invalidTimezonePlan.recurring_contribution.authorizations[0].timezone = "UTC";
assert.throws(() => validateRecurringContributionPlan(invalidTimezonePlan), /approved Friday/);

const cappedPlan = structuredClone(plan);
cappedPlan.recurring_contribution.authorizations[0].max_catch_up_events_per_run = 1;
const cappedCatchUp = applyStandingContribution({
  plan: cappedPlan,
  ledgerContent: firstFriday.ledger_content,
  state: firstFriday.state,
  asOf: "2026-08-14",
  createdAt: "2026-08-14T15:00:00+08:00",
});
assert.equal(cappedCatchUp.status, "partial_catch_up");
assert.deepEqual(cappedCatchUp.applied_dates, ["2026-08-07"]);
assert.deepEqual(cappedCatchUp.remaining_due_dates, ["2026-08-14"]);

const longCatchUp = applyStandingContribution({
  plan,
  ledgerContent: header + baseline,
  state,
  asOf: "2026-10-09",
  createdAt: "2026-10-09T15:00:00+08:00",
});
assert.equal(longCatchUp.status, "partial_catch_up");
assert.equal(longCatchUp.applied_dates.length, 8);
assert.deepEqual(longCatchUp.applied_dates, [
  "2026-07-31",
  "2026-08-07",
  "2026-08-14",
  "2026-08-21",
  "2026-08-28",
  "2026-09-04",
  "2026-09-11",
  "2026-09-18",
]);
assert.deepEqual(longCatchUp.remaining_due_dates, ["2026-09-25", "2026-10-02", "2026-10-09"]);

const identityCollisionLedger = `${header}${baseline}2026-07-31-other-001,deposit,confirmed,Charles Schwab International,satellite,owner-standing-weekly-888-2026-07-29-v1-2026-07-31,2026-07-31,2026-07-31,,,,,0.00,777.00,777.00,USD,user_confirmed_default_deposit,2026-07-31T09:00:00+08:00,Conflicting fixture.\n`;
const identityCollisionState = {
  ...state,
  as_of: "2026-07-31",
  confirmed_cash: 6538.58,
  settled_cash: 6538.58,
  buying_power: 6538.58,
  last_confirmed_ledger_event_id: "2026-07-31-other-001",
};
assert.throws(() => applyStandingContribution({
  plan,
  ledgerContent: identityCollisionLedger,
  state: identityCollisionState,
  asOf: "2026-07-31",
  createdAt: "2026-07-31T15:00:00+08:00",
}), /identity collision/);

const inactivePlan = structuredClone(plan);
inactivePlan.recurring_contribution.authorizations[0].status = "paused_broker_conflict";
inactivePlan.recurring_contribution.authorizations[0].paused_on = "2026-08-01";
inactivePlan.recurring_contribution.authorizations[0].broker_conflict_correction_event_id = "2026-08-01-correction-standing-001";
assert.equal(validateRecurringContributionPlan(inactivePlan).status, "paused_broker_conflict");
assert.throws(() => applyStandingContribution({
  plan: inactivePlan,
  ledgerContent: header + baseline,
  state,
  asOf: "2026-07-31",
  createdAt: "2026-07-31T15:00:00+08:00",
}), /is not active/);

assert.throws(() => applyStandingContribution({
  plan,
  ledgerContent: header + baseline,
  state,
  asOf: "2026-07-31",
  createdAt: "not-a-real-timestamp",
}), /ISO timestamp/);

assert.throws(() => applyStandingContribution({
  plan,
  ledgerContent: header + baseline,
  state,
  asOf: "2026-07-31",
  createdAt: "2026-08-01T00:01:00+08:00",
}), /must fall on the --as-of date/);

const transactionDirectory = mkdtempSync(path.join(os.tmpdir(), "invest-account-transaction-"));
try {
  const ledgerFixture = path.join(transactionDirectory, "ledger.csv");
  const stateFixture = path.join(transactionDirectory, "state.yml");
  const journalFixture = path.join(transactionDirectory, "journal.json");
  writeFileSync(ledgerFixture, "ledger-before\n");
  writeFileSync(stateFixture, "state-before\n");
  assert.throws(() => commitFileTransaction([
    { file: ledgerFixture, before: "ledger-before\n", after: "ledger-after\n" },
    { file: stateFixture, before: "state-before\n", after: "state-after\n" },
  ], {
    journalFile: journalFixture,
    failAfterUpdateIndex: 0,
  }), /injected account transaction failure/);
  assert.equal(readFileSync(ledgerFixture, "utf8"), "ledger-after\n");
  assert.equal(readFileSync(stateFixture, "utf8"), "state-before\n");
  assert.equal(recoverFileTransaction(journalFixture, {
    allowedFiles: [ledgerFixture, stateFixture],
  }), true);
  assert.equal(readFileSync(ledgerFixture, "utf8"), "ledger-after\n");
  assert.equal(readFileSync(stateFixture, "utf8"), "state-after\n");
  assert.equal(recoverFileTransaction(journalFixture, {
    allowedFiles: [ledgerFixture, stateFixture],
  }), false);
} finally {
  rmSync(transactionDirectory, { recursive: true, force: true });
}

const futureCli = spawnSync(process.execPath, [
  "scripts/apply-standing-contribution.mjs",
  "--as-of",
  "2099-12-31",
  "--dry-run",
  "--json",
], { encoding: "utf8" });
assert.notEqual(futureCli.status, 0);
assert.match(futureCli.stderr, /is in the future/);

console.log("standing contribution tests passed");
