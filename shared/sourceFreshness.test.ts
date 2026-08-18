import { describe, expect, it } from "vitest";
import { getSourceFreshness } from "./sourceFreshness";

describe("source freshness", () => {
  const now = new Date("2026-08-18T12:00:00.000Z");

  it("treats a recent verified close as current", () => {
    expect(getSourceFreshness(new Date("2026-08-16T12:00:00.000Z"), now)).toBe("current");
  });

  it("marks an older close as stale without changing it", () => {
    expect(getSourceFreshness(new Date("2026-08-13T12:00:00.000Z"), now)).toBe("stale");
  });

  it("returns no-data when no close exists", () => {
    expect(getSourceFreshness(null, now)).toBe("no-data");
  });
});
