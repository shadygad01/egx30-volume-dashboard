export type ConfirmationStatus = "Upward break" | "Downward break" | "Within zone";

export type ConfirmationPoint = {
  sessions: 1 | 3 | 5;
  tradingDate: Date | string;
  close: number;
  changeFromZoneMidPct: number;
  status: ConfirmationStatus;
};

export type ConfirmableZone = {
  tradingDate: Date | string;
  lowerPrice: number;
  upperPrice: number;
};

export function confirmZoneAtSessions(zone: ConfirmableZone, bars: Array<{ tradingDate: Date | string; close: number }>) {
  const zoneTime = new Date(zone.tradingDate).getTime();
  const futureBars = bars
    .filter((bar) => new Date(bar.tradingDate).getTime() > zoneTime)
    .sort((a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime());
  const midpoint = (zone.lowerPrice + zone.upperPrice) / 2;
  if (!Number.isFinite(midpoint) || midpoint <= 0) return { 1: null, 3: null, 5: null } as const;
  const buildPoint = (sessions: 1 | 3 | 5): ConfirmationPoint | null => {
    const bar = futureBars[sessions - 1];
    if (!bar || !Number.isFinite(Number(bar.close))) return null;
    const close = Number(bar.close);
    const status: ConfirmationStatus = close > zone.upperPrice ? "Upward break" : close < zone.lowerPrice ? "Downward break" : "Within zone";
    return { sessions, tradingDate: bar.tradingDate, close, changeFromZoneMidPct: Number((((close - midpoint) / midpoint) * 100).toFixed(2)), status };
  };
  return { 1: buildPoint(1), 3: buildPoint(3), 5: buildPoint(5) } as const;
}
