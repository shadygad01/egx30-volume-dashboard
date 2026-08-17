import { describe, expect, it } from "vitest";
import { filterZones } from "./zoneFilters";

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

  it("returns no rows when no persisted zone matches", () => {
    expect(filterZones([], "Neutral", "Low")).toEqual([]);
  });
});
