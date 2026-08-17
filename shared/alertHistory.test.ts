import { describe, expect, it } from "vitest";
import { alertNavigationTarget, filterAlertHistoryRows } from "./alertHistory";

describe("alert history interactions", () => {
  const rows = [
    { id: 1, alertStatus: "sent", status: "completed", alertDetails: '["FWRY 18.85–19.19 (score 91)"]' },
    { id: 2, alertStatus: "skipped", status: "completed", alertDetails: "[]" },
  ];

  it("searches persisted symbols and range text case-insensitively", () => {
    expect(filterAlertHistoryRows(rows, "fwry")).toEqual([rows[0]]);
    expect(filterAlertHistoryRows(rows, "18.85")).toEqual([rows[0]]);
    expect(filterAlertHistoryRows(rows, "not-present")).toEqual([]);
  });

  it("normalizes clicked symbols to stock-detail identifiers", () => {
    expect(alertNavigationTarget("FWRY")).toBe("FWRY.EGX");
    expect(alertNavigationTarget("FWRY.EGX")).toBe("FWRY.EGX");
  });
});
