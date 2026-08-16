import { describe, expect, it } from "vitest";
import { aggregateTwoHourIntervals, cairoCloseCronUtc, scoreAccumulationZones, type OhlcvPoint } from "./analysis";

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
});
