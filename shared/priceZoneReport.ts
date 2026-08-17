export type PriceZoneEntry = {
  zone: {
    lowerPrice: number;
    upperPrice: number;
    totalScore?: number;
    confidence?: string;
    direction?: string;
    lifecycleStatus?: string;
    tradingDate?: string | Date;
  };
  instrument: { symbol: string };
};

export type PriceZoneReportRow = {
  lowerPrice: number;
  upperPrice: number;
  direction: string;
  confidence: string;
  symbols: string[];
  zoneCount: number;
  strongestScore: number;
  tradingDate?: string | Date;
};

const confidenceRank: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

export function buildPriceZoneReport(entries: PriceZoneEntry[], limit = 12): PriceZoneReportRow[] {
  const source = entries
    .filter((entry) => entry.zone.lifecycleStatus !== "historical")
    .filter((entry) => Number.isFinite(Number(entry.zone.lowerPrice)) && Number.isFinite(Number(entry.zone.upperPrice)))
    .map((entry) => ({
      lowerPrice: Math.min(Number(entry.zone.lowerPrice), Number(entry.zone.upperPrice)),
      upperPrice: Math.max(Number(entry.zone.lowerPrice), Number(entry.zone.upperPrice)),
      direction: entry.zone.direction ?? "Neutral",
      confidence: entry.zone.confidence ?? "Low",
      symbol: entry.instrument.symbol,
      totalScore: Number(entry.zone.totalScore) || 0,
      tradingDate: entry.zone.tradingDate,
    }));

  const rows: PriceZoneReportRow[] = [];
  for (const direction of ["Potential Accumulation", "Potential Distribution", "Neutral"]) {
    const candidates = source.filter((entry) => entry.direction === direction).sort((a, b) => a.lowerPrice - b.lowerPrice || a.upperPrice - b.upperPrice || b.totalScore - a.totalScore);
    for (const entry of candidates) {
      const current = rows.find((row) => row.direction === direction && entry.lowerPrice <= row.upperPrice);
      if (!current) {
        rows.push({ lowerPrice: entry.lowerPrice, upperPrice: entry.upperPrice, direction, confidence: entry.confidence, symbols: [entry.symbol], zoneCount: 1, strongestScore: entry.totalScore, tradingDate: entry.tradingDate });
        continue;
      }
      current.upperPrice = Math.max(current.upperPrice, entry.upperPrice);
      current.lowerPrice = Math.min(current.lowerPrice, entry.lowerPrice);
      current.zoneCount += 1;
      current.strongestScore = Math.max(current.strongestScore, entry.totalScore);
      if (!current.symbols.includes(entry.symbol)) current.symbols.push(entry.symbol);
      if ((confidenceRank[entry.confidence] ?? 2) < (confidenceRank[current.confidence] ?? 2)) current.confidence = entry.confidence;
    }
  }

  const directionRank: Record<string, number> = { "Potential Accumulation": 0, "Potential Distribution": 1, Neutral: 2 };
  const perDirection = Math.max(1, Math.floor(limit / 3));
  const ordered = ["Potential Accumulation", "Potential Distribution", "Neutral"].flatMap((direction) => rows
    .filter((row) => row.direction === direction)
    .sort((a, b) => b.strongestScore - a.strongestScore || a.lowerPrice - b.lowerPrice)
    .slice(0, perDirection));
  return ordered
    .sort((a, b) => (directionRank[a.direction] ?? 2) - (directionRank[b.direction] ?? 2) || b.strongestScore - a.strongestScore || a.lowerPrice - b.lowerPrice)
    .slice(0, limit)
    .map((row) => ({ ...row, symbols: row.symbols.sort() }));
}
