import { describe, expect, it } from "vitest";
import { buildPriceZoneReport } from "./priceZoneReport";

describe("price zone report", () => {
  it("groups overlapping active zones by direction and deduplicates symbols", () => {
    const rows = buildPriceZoneReport([
      { instrument: { symbol: "AAA.EGX" }, zone: { lowerPrice: 10, upperPrice: 12, direction: "Potential Accumulation", confidence: "Medium", totalScore: 70, lifecycleStatus: "active" } },
      { instrument: { symbol: "BBB.EGX" }, zone: { lowerPrice: 11.5, upperPrice: 14, direction: "Potential Accumulation", confidence: "High", totalScore: 90, lifecycleStatus: "active" } },
      { instrument: { symbol: "AAA.EGX" }, zone: { lowerPrice: 11, upperPrice: 13, direction: "Potential Accumulation", confidence: "High", totalScore: 80, lifecycleStatus: "active" } },
      { instrument: { symbol: "CCC.EGX" }, zone: { lowerPrice: 10, upperPrice: 12, direction: "Potential Distribution", confidence: "High", totalScore: 95, lifecycleStatus: "active" } },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ lowerPrice: 10, upperPrice: 14, direction: "Potential Accumulation", confidence: "High", zoneCount: 3, strongestScore: 90, symbols: ["AAA.EGX", "BBB.EGX"] });
    expect(rows[1]).toMatchObject({ direction: "Potential Distribution", symbols: ["CCC.EGX"] });
  });

  it("does not expose historical or invalid zones", () => {
    const rows = buildPriceZoneReport([
      { instrument: { symbol: "OLD.EGX" }, zone: { lowerPrice: 1, upperPrice: 2, direction: "Potential Accumulation", lifecycleStatus: "historical" } },
      { instrument: { symbol: "BAD.EGX" }, zone: { lowerPrice: Number.NaN, upperPrice: 2, direction: "Potential Accumulation", lifecycleStatus: "active" } },
    ]);
    expect(rows).toEqual([]);
  });
});
