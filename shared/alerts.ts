export type AlertZone = { symbol: string; lowerPrice: number; upperPrice: number; totalScore: number; confidence: string; direction: string };

export function selectAccumulationAlerts(zones: AlertZone[]) {
  const seen = new Set<string>();
  return zones.filter((zone) => {
    if (zone.confidence !== "High" || zone.direction !== "Potential Accumulation") return false;
    const key = `${zone.symbol}|${zone.lowerPrice}|${zone.upperPrice}|${zone.totalScore}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => b.totalScore - a.totalScore).slice(0, 3);
}
