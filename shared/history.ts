export type HistoryBar = { close: number; volume: number };

export function compareBars(current?: HistoryBar, previous?: HistoryBar) {
  if (!current || !previous) return { closeChange: null, closeChangePct: null, volumeChangePct: null };
  const closeChange = current.close - previous.close;
  const closeChangePct = previous.close !== 0 ? (closeChange / previous.close) * 100 : null;
  const volumeChangePct = previous.volume !== 0 ? ((current.volume - previous.volume) / previous.volume) * 100 : null;
  return { closeChange, closeChangePct, volumeChangePct };
}

export function groupHistoryRows(rows: any[], latestDate: string | Date | null, previousDate: string | Date | null) {
  const latestKey = latestDate ? new Date(latestDate).toISOString() : null;
  const previousKey = previousDate ? new Date(previousDate).toISOString() : null;
  const grouped = new Map<string, { instrument: any; current?: any; previous?: any }>();
  for (const row of rows) {
    const symbol = row.instrument.symbol;
    const entry = grouped.get(symbol) ?? { instrument: row.instrument };
    const rowKey = new Date(row.bar.tradingDate).toISOString();
    if (rowKey === latestKey) entry.current = row.bar;
    if (rowKey === previousKey) entry.previous = row.bar;
    grouped.set(symbol, entry);
  }
  return Array.from(grouped.values()).map((entry) => ({ ...entry, comparison: compareBars(entry.current, entry.previous) }));
}
