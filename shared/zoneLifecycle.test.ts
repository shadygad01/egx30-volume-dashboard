import { describe, expect, it } from "vitest";
import { mergeZoneSessions } from "./zoneLifecycle";

const zone = (date: string, score: number, direction = "Potential Accumulation" as const) => ({
  tradingDate: new Date(date), intervalStart: new Date(date).getTime(), intervalEnd: new Date(date).getTime() + 86_400_000,
  lowerPrice: 10, upperPrice: 12, volumeRatio: 2, acceptanceScore: 1, narrowRangeScore: 1, totalScore: score,
  confidence: score >= 78 ? "High" as const : "Medium" as const, direction, explanation: "Verified OHLCV evidence",
});

describe("zone lifecycle", () => {
  it("reinforces overlapping sessions and raises confidence after repeated evidence", () => {
    const merged = mergeZoneSessions([zone("2026-08-10", 60), zone("2026-08-11", 62), zone("2026-08-12", 64)], 10);
    expect(merged).toHaveLength(1);
    expect(merged[0].reinforcementSessions).toBe(3);
    expect(merged[0].confidence).toBe("High");
    expect(merged[0].explanation).toContain("Reinforced across 3 verified sessions");
  });

  it("keeps distant price zones separate and limits analysis to the selected sessions", () => {
    const rows = [zone("2026-07-01", 90), zone("2026-08-10", 60), { ...zone("2026-08-11", 60), lowerPrice: 30, upperPrice: 32 }];
    const merged = mergeZoneSessions(rows, 5);
    expect(merged).toHaveLength(2);
    expect(merged.every((item) => item.activeWindowSessions === 5)).toBe(true);
    expect(merged.some((item) => item.reinforcementSessions === 1)).toBe(true);
  });

  it("does not create a zone from empty source data", () => {
    expect(mergeZoneSessions([], 10)).toEqual([]);
  });
});
