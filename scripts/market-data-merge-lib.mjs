export function preserveRowsForUnrefreshedSymbols(
  nextRows,
  existingRows,
  refreshedSymbols,
) {
  const refreshed = new Set(
    [...refreshedSymbols].map((symbol) => String(symbol ?? "").trim().toUpperCase()),
  );
  const preservedRows = existingRows.filter(
    (row) => !refreshed.has(String(row.symbol ?? "").trim().toUpperCase()),
  );

  return [...nextRows, ...preservedRows].sort((left, right) => {
    const symbolComparison = String(left.symbol ?? "").localeCompare(
      String(right.symbol ?? ""),
    );
    if (symbolComparison !== 0) {
      return symbolComparison;
    }
    const leftDate = String(left.date ?? left.as_of ?? "");
    const rightDate = String(right.date ?? right.as_of ?? "");
    return leftDate.localeCompare(rightDate);
  });
}

export function detectHistoryDateRegression(
  nextRows,
  existingRows,
  symbol,
) {
  const normalizedSymbol = String(symbol ?? "").trim().toUpperCase();
  const nextLatestDate = latestDate(
    nextRows.filter(
      (row) =>
        String(row.symbol ?? normalizedSymbol).trim().toUpperCase() ===
        normalizedSymbol,
    ),
  );
  const existingLatestDate = latestDate(
    existingRows.filter(
      (row) =>
        String(row.symbol ?? "").trim().toUpperCase() === normalizedSymbol,
    ),
  );

  return {
    existingLatestDate,
    nextLatestDate,
    regressed:
      existingLatestDate !== "" &&
      (nextLatestDate === "" || nextLatestDate < existingLatestDate),
  };
}

function latestDate(rows) {
  return rows.reduce((latest, row) => {
    const date = String(row.date ?? row.as_of ?? "");
    return date > latest ? date : latest;
  }, "");
}
