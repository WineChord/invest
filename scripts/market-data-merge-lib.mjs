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
