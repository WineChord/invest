import assert from "node:assert/strict";
import { loadCalendars, researchPaydayGate, resolveResearchPayday, validateCalendar } from "./research-payday-lib.mjs";

// Fix the source-year fixture so adding a later official calendar cannot break missing-year tests.
const calendars = loadCalendars().filter(calendar => calendar.year === 2026);
for (const [month, expected] of [["2026-04", "2026-04-03"], ["2026-05", "2026-04-30"],
  ["2026-07", "2026-07-03"], ["2026-10", "2026-09-30"], ["2026-11", "2026-11-04"], ["2026-12", "2026-12-04"]]) {
  assert.equal(resolveResearchPayday(month, { calendars }).due_date, expected);
}
assert.equal(resolveResearchPayday("2026-02", { calendars, nominalDay: 15 }).due_date, "2026-02-14");
assert.throws(() => resolveResearchPayday("2027-01", { calendars }), /approved official workday calendar/);
assert.throws(() => resolveResearchPayday("2026-13", { calendars }), /Invalid calendar date/);
assert.throws(() => resolveResearchPayday("2026-11", { calendars, nominalDay: 31 }), /Unsupported/);
assert.throws(() => resolveResearchPayday("2026-11", { calendars: [...calendars, calendars[0]] }), /Exactly one/);
assert.throws(() => validateCalendar({ ...calendars[0], makeup_workdays: ["2026-02-15"] }), /Conflicting/);
assert.throws(() => researchPaydayGate({ now: "2026-11-04T19:00:00", calendars }), /timezone/);
assert.equal(researchPaydayGate({ now: "2026-11-04T18:59:59+08:00", calendars }).status, "not_due");
assert.equal(researchPaydayGate({ now: "2026-11-04T11:00:00Z", calendars }).status, "due");
assert.equal(researchPaydayGate({ now: "2026-11-05T19:00:00+08:00", calendars }).occurrence.month, "2026-11");
assert.equal(researchPaydayGate({ now: "2026-11-05T19:00:00+08:00", calendars,
  completedMonths: ["2026-11"] }).status, "not_due");
const advanced = researchPaydayGate({ now: "2026-09-30T19:00:00+08:00", calendars, firstMonth: "2026-10" });
assert.equal(advanced.status, "due");
assert.equal(advanced.occurrence.month, "2026-10");
assert.equal(researchPaydayGate({ now: "2026-09-30T18:59:59+08:00", calendars, firstMonth: "2026-10" }).status, "not_due");
assert.equal(researchPaydayGate({ now: "2026-09-30T19:00:00+08:00", calendars,
  firstMonth: "2026-10", completedMonths: ["2026-10"] }).status, "already_completed");
assert.equal(researchPaydayGate({ now: "2026-10-07T19:00:00+08:00", calendars }).status, "not_due");
const december = researchPaydayGate({ now: "2026-12-04T19:00:00+08:00", calendars });
assert.equal(december.status, "due");
assert.equal(december.calendar_refresh_required_for_year, 2027);
// Synthetic holiday evidence for the resolver only; this is not a 2027 holiday forecast.
const synthetic2027 = { ...calendars[0], year: 2027, calendar_id: "synthetic-test-2027",
  source_url: "https://example.invalid/synthetic-test-only", source_published_at: "2026-11-01",
  retrieved_at: "2026-11-01", first_seen_at: "2026-11-01",
  holiday_ranges: [["2027-01-01", "2027-01-04"]], makeup_workdays: [] };
const crossYearCalendars = [...calendars, synthetic2027];
assert.equal(resolveResearchPayday("2027-01", { calendars: crossYearCalendars }).due_date, "2026-12-31");
const crossYear = { calendars: crossYearCalendars, completedMonths: ["2026-12"] };
assert.equal(researchPaydayGate({ ...crossYear, now: "2026-12-31T18:59:59+08:00" }).status, "not_due");
const januaryAdvanced = researchPaydayGate({ ...crossYear, now: "2026-12-31T19:00:00+08:00" });
assert.equal(januaryAdvanced.status, "due");
assert.equal(januaryAdvanced.occurrence.month, "2027-01");
assert.equal(januaryAdvanced.occurrence.calendar_ids.length, 2);
assert.equal(researchPaydayGate({ ...crossYear, now: "2026-12-31T19:00:00+08:00",
  completedMonths: ["2026-12", "2027-01"] }).status, "already_completed");
assert.throws(() => researchPaydayGate({ now: "2026-02-30T19:00:00+08:00", calendars }), /Invalid calendar date/);
console.log("Research payday PASS: official holidays, makeup days, cross-month advancement, timezone, deduplication and missing-year controls");
