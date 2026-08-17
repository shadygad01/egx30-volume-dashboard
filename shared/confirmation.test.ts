import { describe, expect, it } from "vitest";
import { confirmZoneAtSessions } from "./confirmation";

describe("zone confirmation", () => {
  const zone = { tradingDate: "2026-08-10T00:00:00.000Z", lowerPrice: 100, upperPrice: 110 };

  it("evaluates the first, third, and fifth persisted sessions", () => {
    const bars = [1, 2, 3, 4, 5].map((offset) => ({ tradingDate: `2026-08-${10 + offset}T00:00:00.000Z`, close: offset === 1 ? 112 : offset === 3 ? 105 : 108 }));
    const result = confirmZoneAtSessions(zone, bars);
    expect(result[1]?.status).toBe("Upward break");
    expect(result[3]?.status).toBe("Within zone");
    expect(result[5]?.status).toBe("Within zone");
  });

  it("returns explicit nulls when the required sessions are unavailable", () => {
    expect(confirmZoneAtSessions(zone, [{ tradingDate: "2026-08-11T00:00:00.000Z", close: 105 }])).toEqual({
      1: expect.objectContaining({ status: "Within zone" }),
      3: null,
      5: null,
    });
  });

  it("does not manufacture confirmation from bars before the zone", () => {
    expect(confirmZoneAtSessions(zone, [{ tradingDate: "2026-08-09T00:00:00.000Z", close: 120 }])).toEqual({ 1: null, 3: null, 5: null });
  });
});
