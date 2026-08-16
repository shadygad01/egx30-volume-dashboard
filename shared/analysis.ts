export type OhlcvPoint = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type IntervalSummary = OhlcvPoint & {
  intervalStart: number;
  intervalEnd: number;
  volumeRatio: number;
  priceRangePct: number;
};

export type Confidence = "Low" | "Medium" | "High";

export type AccumulationZone = {
  intervalStart: number;
  intervalEnd: number;
  lowerPrice: number;
  upperPrice: number;
  volumeRatio: number;
  acceptanceScore: number;
  narrowRangeScore: number;
  totalScore: number;
  confidence: Confidence;
  explanation: string;
};

export function aggregateTwoHourIntervals(points: OhlcvPoint[], intervalMs = 2 * 60 * 60 * 1000): IntervalSummary[] {
  if (!points.length) return [];
  const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp);
  const buckets = new Map<number, OhlcvPoint[]>();
  for (const point of sorted) {
    const start = Math.floor(point.timestamp / intervalMs) * intervalMs;
    const bucket = buckets.get(start) ?? [];
    bucket.push(point);
    buckets.set(start, bucket);
  }
  const bucketValues = Array.from(buckets.values());
  const volumes = bucketValues.map((items: OhlcvPoint[]) => items.reduce((sum: number, item: OhlcvPoint) => sum + item.volume, 0));
  const baseline = volumes.reduce((sum, volume) => sum + volume, 0) / Math.max(volumes.length, 1);
  return Array.from(buckets.entries()).map(([intervalStart, items]: [number, OhlcvPoint[]]) => {
    const first = items[0];
    const last = items[items.length - 1];
    const high = Math.max(...items.map((item: OhlcvPoint) => item.high));
    const low = Math.min(...items.map((item: OhlcvPoint) => item.low));
    const volume = items.reduce((sum: number, item: OhlcvPoint) => sum + item.volume, 0);
    return {
      timestamp: last.timestamp,
      intervalStart,
      intervalEnd: intervalStart + intervalMs,
      open: first.open,
      high,
      low,
      close: last.close,
      volume,
      volumeRatio: baseline ? volume / baseline : 0,
      priceRangePct: first.close ? ((high - low) / first.close) * 100 : 0,
    };
  });
}

export function scoreAccumulationZones(intervals: IntervalSummary[]): AccumulationZone[] {
  if (!intervals.length) return [];
  const medianRange = [...intervals].sort((a, b) => a.priceRangePct - b.priceRangePct)[Math.floor(intervals.length / 2)]?.priceRangePct ?? 0;
  return intervals
    .map((item, index) => {
      const previous = intervals[index - 1];
      const acceptanceScore = previous && item.low <= previous.high && item.high >= previous.low ? 1 : 0.45;
      const narrowRangeScore = item.priceRangePct <= Math.max(medianRange * 1.15, 0.25) ? 1 : 0.35;
      const volumeScore = Math.min(item.volumeRatio / 2, 1);
      const totalScore = Math.round((volumeScore * 0.45 + acceptanceScore * 0.3 + narrowRangeScore * 0.25) * 100);
      const confidence: Confidence = totalScore >= 78 ? "High" : totalScore >= 58 ? "Medium" : "Low";
      return {
        intervalStart: item.intervalStart,
        intervalEnd: item.intervalEnd,
        lowerPrice: item.low,
        upperPrice: item.high,
        volumeRatio: Number(item.volumeRatio.toFixed(2)),
        acceptanceScore: Number(acceptanceScore.toFixed(2)),
        narrowRangeScore: Number(narrowRangeScore.toFixed(2)),
        totalScore,
        confidence,
        explanation: `Volume ${item.volumeRatio.toFixed(1)}x baseline; price acceptance ${(acceptanceScore * 100).toFixed(0)}%; range ${item.priceRangePct.toFixed(2)}%.`,
      };
    })
    .filter(zone => zone.volumeRatio >= 1.15 && zone.totalScore >= 45)
    .sort((a, b) => b.totalScore - a.totalScore);
}

export function cairoCloseCronUtc(): string {
  // Cairo alternates between UTC+2 and UTC+3. Trigger both UTC candidates;
  // the handler gates execution to exactly 14:30 Africa/Cairo.
  return "0 30 11,12 * * 1-5";
}
