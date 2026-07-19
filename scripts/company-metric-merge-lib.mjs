export function preserveSameDateCuratedCompanyMetrics(
  generatedRows,
  existingRows,
  automatedSources,
) {
  const automatedSourceSet = new Set(automatedSources);
  const existingBySymbol = new Map(
    existingRows.map((row) => [String(row.symbol ?? ""), row]),
  );

  return generatedRows.map((generatedRow) => {
    const existingRow = existingBySymbol.get(String(generatedRow.symbol ?? ""));
    if (
      existingRow === undefined ||
      String(existingRow.as_of ?? "") !== String(generatedRow.as_of ?? "") ||
      automatedSourceSet.has(String(existingRow.source ?? ""))
    ) {
      return generatedRow;
    }
    return existingRow;
  });
}
