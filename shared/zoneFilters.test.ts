import { describe, expect, it } from "vitest";
import { filterZones, sortDirectionalZones } from "./zoneFilters";

describe("zone filters", () => {
  const zones = [
    { zone: { direction: "Potential Accumulation", confidence: "High" } },
    { zone: { direction: "Potential Accumulation", confidence: "Medium" } },
    { zone: { direction: "Potential Distribution", confidence: "High" } },
  ];

  it("filters by direction and confidence independently", () => {
    expect(filterZones(zones, "Potential Accumulation", "High")).toEqual([zones[0]]);
    expect(filterZones(zones, "All", "High")).toEqual([zones[0], zones[2]]);
    expect(filterZones(zones, "Potential Accumulation", "All")).toEqual([zones[0], zones[1]]);
  });

  it("orders zones as accumulation, distribution, then neutral", () => {
    const entries = [
      { zone: { direction: "Neutral", confidence: "High", totalScore: 99 }, id: "neutral" },
      { zone: { direction: "Potential Distribution", confidence: "High", totalScore: 30 }, id: "dist-low-score" },
      { zone: { direction: "Potential Distribution", confidence: "High", totalScore: 80 }, id: "dist-high-score" },
      { zone: { direction: "Potential Accumulation", confidence: "Medium", totalScore: 40 }, id: "acc-medium" },
      { zone: { direction: "Potential Accumulation", confidence: "High", totalScore: 20 }, id: "acc-high" },
    ];
    expect(sortDirectionalZones(entries).map((entry) => entry.id)).toEqual(["acc-high", "acc-medium", "dist-high-score", "dist-low-score", "neutral"]);
  });

  it("returns no rows when no persisted zone matches", () => {
    expect(filterZones([], "Neutral", "Low")).toEqual([]);
  });
});
