import { describe, expect, it } from "vitest";
import { aggregateTwoHourIntervals, cairoCloseCronUtc, classifyZoneDirection, scoreAccumulationZones, type IntervalSummary, type OhlcvPoint } from "./analysis";

describe("EGX volume analysis", () => {
  const base = Date.UTC(2026, 0, 2, 8, 0);
  const points: OhlcvPoint[] = Array.from({ length: 6 }, (_, index) => ({ timestamp: base + index * 60 * 60 * 1000, open: 100 + index * 0.1, high: 100.5 + index * 0.1, low: 99.8 + index * 0.1, close: 100.1 + index * 0.1, volume: index === 2 ? 5000 : 1000 }));

  it("aggregates hourly candles into two-hour buckets", () => {
    const result = aggregateTwoHourIntervals(points);
    expect(result.length).toBe(3);
    expect(result[0]?.volume).toBe(2000);
    expect(result[1]?.volume).toBe(6000);
  });

  it("returns only the allowed confidence tiers", () => {
    const zones = scoreAccumulationZones(aggregateTwoHourIntervals(points));
    expect(zones.every(zone => ["Low", "Medium", "High"].includes(zone.confidence))).toBe(true);
  });

  it("uses a dual UTC trigger to preserve 14:30 Cairo behavior across DST", () => {
    expect(cairoCloseCronUtc()).toBe("0 30 11,12 * * 1-5");
  });

  it("classifies high-close volume acceptance as potential accumulation", () => {
    const previous = { ...points[0], intervalStart: points[0].timestamp, intervalEnd: points[0].timestamp + 86_400_000, volumeRatio: 1, priceRangePct: 1 } as IntervalSummary;
    const current = { ...previous, timestamp: previous.timestamp + 86_400_000, intervalStart: previous.intervalStart + 86_400_000, intervalEnd: previous.intervalEnd + 86_400_000, open: 100, high: 110, low: 100, close: 108, volumeRatio: 1.5 };
    expect(classifyZoneDirection(current, previous)).toBe("Potential Accumulation");
  });

  it("classifies low-close volume acceptance as potential distribution", () => {
    const previous = { ...points[0], close: 103, intervalStart: points[0].timestamp, intervalEnd: points[0].timestamp + 86_400_000, volumeRatio: 1, priceRangePct: 1 } as IntervalSummary;
    const current = { ...previous, timestamp: previous.timestamp + 86_400_000, intervalStart: previous.intervalStart + 86_400_000, intervalEnd: previous.intervalEnd + 86_400_000, open: 100, high: 110, low: 100, close: 102, volumeRatio: 1.5 };
    expect(classifyZoneDirection(current, previous)).toBe("Potential Distribution");
  });

  it("keeps direction neutral when there is insufficient evidence", () => {
    const current = { ...points[0], intervalStart: points[0].timestamp, intervalEnd: points[0].timestamp + 86_400_000, volumeRatio: 1.5, priceRangePct: 1 } as IntervalSummary;
    expect(classifyZoneDirection(current)).toBe("Neutral");
  });
});
