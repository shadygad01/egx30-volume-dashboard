import { describe, expect, it } from "vitest";
import { selectAccumulationAlerts } from "./alerts";

describe("accumulation alerts", () => {
  it("selects only high-confidence potential accumulation and deduplicates", () => {
    const zones = [
      { symbol: "AAA", lowerPrice: 10, upperPrice: 11, totalScore: 90, confidence: "High", direction: "Potential Accumulation" },
      { symbol: "AAA", lowerPrice: 10, upperPrice: 11, totalScore: 90, confidence: "High", direction: "Potential Accumulation" },
      { symbol: "BBB", lowerPrice: 20, upperPrice: 21, totalScore: 95, confidence: "High", direction: "Potential Distribution" },
      { symbol: "CCC", lowerPrice: 30, upperPrice: 31, totalScore: 70, confidence: "Medium", direction: "Potential Accumulation" },
    ];
    expect(selectAccumulationAlerts(zones)).toEqual([zones[0]]);
  });
});
