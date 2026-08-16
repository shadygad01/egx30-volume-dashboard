import { describe, expect, it } from "vitest";
import { compareBars, groupHistoryRows } from "./history";

describe("history comparison", () => {
  it("calculates close and volume changes from two real bars", () => {
    expect(compareBars({ close: 110, volume: 150 }, { close: 100, volume: 100 })).toEqual({ closeChange: 10, closeChangePct: 10, volumeChangePct: 50 });
  });

  it("returns explicit no-data values when a previous bar is unavailable", () => {
    expect(compareBars({ close: 110, volume: 150 }, undefined)).toEqual({ closeChange: null, closeChangePct: null, volumeChangePct: null });
  });

  it("returns an empty history result without manufacturing rows", () => {
    expect(groupHistoryRows([], "2026-08-13T07:00:00.000Z", "2026-08-12T07:00:00.000Z")).toEqual([]);
  });

  it("groups rows by instrument and identifies latest and previous sessions", () => {
    const rows = [
      { instrument: { symbol: "AAA.EGX" }, bar: { tradingDate: "2026-08-13T07:00:00.000Z", close: 110, volume: 150 } },
      { instrument: { symbol: "AAA.EGX" }, bar: { tradingDate: "2026-08-12T07:00:00.000Z", close: 100, volume: 100 } },
    ];
    const grouped = groupHistoryRows(rows, "2026-08-13T07:00:00.000Z", "2026-08-12T07:00:00.000Z");
    expect(grouped[0]?.comparison.closeChangePct).toBe(10);
    expect(grouped[0]?.comparison.volumeChangePct).toBe(50);
  });
});
