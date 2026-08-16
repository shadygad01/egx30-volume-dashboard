import { describe, expect, it } from "vitest";
import { analyzeDaily, fetchFreeIntraday } from "./marketData";

describe("free daily market mode", () => {
  it("analyzes daily OHLCV without claiming two-hour bars", () => {
    const points = Array.from({ length: 5 }, (_, index) => ({
      timestamp: Date.UTC(2026, 0, index + 1),
      open: 100 + index,
      high: 101 + index,
      low: 99 + index,
      close: 100.5 + index,
      volume: index === 4 ? 5000 : 1000,
    }));
    const result = analyzeDaily(points);
    expect(result.intervals).toHaveLength(5);
    expect(result.intervals[0]?.intervalEnd - result.intervals[0]?.intervalStart).toBe(24 * 60 * 60 * 1000);
    expect(result.zones.every(zone => zone.intervalEnd - zone.intervalStart === 24 * 60 * 60 * 1000)).toBe(true);
  });

  it("returns no intraday data in free mode instead of fabricating it", async () => {
    await expect(fetchFreeIntraday()).resolves.toEqual([]);
  });
});
