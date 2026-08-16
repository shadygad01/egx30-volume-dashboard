export type RankedStock = {
  instrument: { symbol: string; name: string };
  bar: { volume: number; low: number; high: number };
  bestZone?: { totalScore: number };
  strengthScore: number;
};

export function rankStocks(stocks: any[], zones: any[]): RankedStock[] {
  const maxVolume = Math.max(...stocks.map((item) => Number(item.bar.volume) || 0), 0);
  return stocks.map((item, sourceIndex) => {
    const symbol = item.instrument.symbol;
    const bestZone = zones.filter((entry) => entry.instrument.symbol === symbol).sort((a, b) => b.zone.totalScore - a.zone.totalScore)[0]?.zone;
    const zoneScore = Number(bestZone?.totalScore) || 0;
    const relativeVolumeScore = maxVolume > 0 ? ((Number(item.bar.volume) || 0) / maxVolume) * 100 : 0;
    const strengthScore = Math.round(zoneScore * 0.7 + relativeVolumeScore * 0.3);
    return { ...item, strengthScore, bestZone, sourceIndex };
  }).sort((a, b) => b.strengthScore - a.strengthScore || Number(b.bar.volume) - Number(a.bar.volume) || a.sourceIndex - b.sourceIndex).map(({ sourceIndex: _sourceIndex, ...item }) => item);
}
