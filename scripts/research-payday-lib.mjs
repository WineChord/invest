import { readFileSync, readdirSync } from "node:fs";

const calendarDirectory = new URL("../data/calendar/", import.meta.url);

function dateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Expected YYYY-MM-DD");
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error("Invalid calendar date");
  return value;
}

export function validateCalendar(calendar) {
  if (calendar.schema_version !== 1 || !Number.isInteger(calendar.year)
      || calendar.timezone !== "Asia/Shanghai" || !calendar.calendar_id
      || !calendar.source_url?.startsWith("https://")
      || !Array.isArray(calendar.holiday_ranges) || !Array.isArray(calendar.makeup_workdays)) {
    throw new Error("Invalid sourced China workday calendar");
  }
  for (const key of ["source_published_at", "retrieved_at", "first_seen_at"]) dateOnly(calendar[key]);
  const inYear = value => {
    dateOnly(value);
    if (Number(value.slice(0, 4)) !== calendar.year) throw new Error("Calendar date outside source year");
  };
  let previousEnd = "";
  for (const range of calendar.holiday_ranges) {
    if (!Array.isArray(range) || range.length !== 2) throw new Error("Invalid holiday range");
    range.forEach(inYear);
    if (range[0] > range[1] || range[0] <= previousEnd) throw new Error("Overlapping or unsorted holiday ranges");
    previousEnd = range[1];
  }
  const seen = new Set();
  for (const day of calendar.makeup_workdays) {
    inYear(day);
    if (seen.has(day) || calendar.holiday_ranges.some(([start, end]) => day >= start && day <= end)) {
      throw new Error("Conflicting workday evidence");
    }
    seen.add(day);
  }
  return calendar;
}

export function loadCalendars() {
  return readdirSync(calendarDirectory).filter(name => /^china-workdays-\d{4}-v\d+\.json$/.test(name))
    .sort().map(name => validateCalendar(JSON.parse(readFileSync(new URL(name, calendarDirectory), "utf8"))));
}

function calendarForYear(calendars, year) {
  const matches = calendars.filter(calendar => calendar.year === year);
  if (matches.length !== 1) throw new Error(`Exactly one approved official workday calendar is required for ${year}`);
  return validateCalendar(matches[0]);
}

function isChinaWorkday(value, calendars) {
  const calendar = calendarForYear(calendars, Number(value.slice(0, 4)));
  if (calendar.makeup_workdays.includes(value)) return true;
  if (calendar.holiday_ranges.some(([start, end]) => value >= start && value <= end)) return false;
  const weekday = new Date(`${value}T00:00:00Z`).getUTCDay();
  return weekday !== 0 && weekday !== 6;
}

export function resolveResearchPayday(month, { calendars = loadCalendars(), nominalDay = 4 } = {}) {
  if (typeof month !== "string" || !/^\d{4}-\d{2}$/.test(month)) throw new Error("Expected YYYY-MM");
  if (!Number.isInteger(nominalDay) || nominalDay < 1 || nominalDay > 28) throw new Error("Unsupported nominal payday");
  const nominalDate = dateOnly(`${month}-${String(nominalDay).padStart(2, "0")}`);
  const nominalCalendar = calendarForYear(calendars, Number(month.slice(0, 4)));
  let dueDate = nominalDate;
  while (!isChinaWorkday(dueDate, calendars)) {
    dueDate = new Date(Date.parse(`${dueDate}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
  }
  const dueCalendar = calendarForYear(calendars, Number(dueDate.slice(0, 4)));
  return { month, nominal_date: nominalDate, due_date: dueDate, due_at: `${dueDate}T19:00:00+08:00`,
    calendar_ids: [...new Set([nominalCalendar.calendar_id, dueCalendar.calendar_id])],
    sources: [...new Set([nominalCalendar, dueCalendar])].map(calendar => ({
      source_url: calendar.source_url, source_published_at: calendar.source_published_at,
      retrieved_at: calendar.retrieved_at, first_seen_at: calendar.first_seen_at,
    })) };
}

export function researchPaydayGate({ now, completedMonths = [], firstMonth = "2026-11", nominalDay = 4,
  calendars = loadCalendars() }) {
  if (typeof now !== "string" || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(now)) {
    throw new Error("An explicit timezone is required");
  }
  const timestamp = Date.parse(now);
  if (!Number.isFinite(timestamp)) throw new Error("Invalid run time");
  dateOnly(now.slice(0, 10));
  dateOnly(`${firstMonth}-01`);
  if (!Array.isArray(completedMonths) || completedMonths.some(month => !/^\d{4}-\d{2}$/.test(month))) {
    throw new Error("completedMonths must contain YYYY-MM keys");
  }
  completedMonths.forEach(month => dateOnly(`${month}-01`));
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(timestamp)).map(part => [part.type, part.value]));
  const month = `${parts.year}-${parts.month}`;
  const occurrence = resolveResearchPayday(month, { calendars, nominalDay });
  const next = new Date(`${month}-01T00:00:00Z`);
  next.setUTCMonth(next.getUTCMonth() + 1);
  const nextMonth = next.toISOString().slice(0, 7);
  const nextYear = Number(nextMonth.slice(0, 4));
  const candidates = [occurrence];
  const nextCalendarAvailable = calendars.some(calendar => calendar.year === nextYear);
  if (nextCalendarAvailable) candidates.push(resolveResearchPayday(nextMonth, { calendars, nominalDay }));
  const authorized = candidates.filter(item => item.month >= firstMonth);
  const pending = authorized.filter(item => !completedMonths.includes(item.month));
  const due = pending.find(item => timestamp >= Date.parse(item.due_at));
  return {
    status: due ? "due" : pending.length ? "not_due" : authorized.length ? "already_completed" : "before_authorization",
    occurrence: due ?? pending[0] ?? occurrence,
    calendar_refresh_required_for_year: nextCalendarAvailable ? null : nextYear,
  };
}
