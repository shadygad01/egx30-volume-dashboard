export function filterAlertHistoryRows(rows: any[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return rows;
  return rows.filter((row) => [row.alertStatus, row.status, row.alertError, row.alertDetails].filter(Boolean).join(" ").toLowerCase().includes(normalized));
}

export function alertNavigationTarget(symbol: string) {
  return symbol.endsWith(".EGX") ? symbol : `${symbol}.EGX`;
}
