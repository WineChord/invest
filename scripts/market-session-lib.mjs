export function filterCompletedDailyBars(
  rows,
  {
    currentTradingPeriod,
    marketTimeZone = "America/New_York",
    now = new Date(),
  } = {},
) {
  const nowDate = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(nowDate.getTime())) {
    throw new Error("Invalid market-session now value");
  }

  const currentMarketDate = dateInTimeZone(nowDate, marketTimeZone);
  const regularSessionEndValue = currentTradingPeriod?.regular?.end;
  const regularSessionEnd =
    regularSessionEndValue === null || regularSessionEndValue === undefined
      ? Number.NaN
      : Number(regularSessionEndValue);
  const regularSessionCompleted =
    Number.isFinite(regularSessionEnd) &&
    nowDate.getTime() >= regularSessionEnd * 1000;

  return rows.filter((row) => {
    if (row.date < currentMarketDate) {
      return true;
    }
    if (row.date > currentMarketDate) {
      return false;
    }
    return regularSessionCompleted;
  });
}

function dateInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}
