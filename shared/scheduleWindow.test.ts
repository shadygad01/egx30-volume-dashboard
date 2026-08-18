import { describe, expect, it } from "vitest";
import { isWithinCairoCloseWindow } from "./scheduleWindow";

describe("Cairo close window", () => {
  it("accepts the scheduled close time and delayed callbacks through 15:59", () => {
    expect(isWithinCairoCloseWindow({ hour: 14, minute: 30 })).toBe(true);
    expect(isWithinCairoCloseWindow({ hour: 14, minute: 39 })).toBe(true);
    expect(isWithinCairoCloseWindow({ hour: 15, minute: 37 })).toBe(true);
  });

  it("rejects callbacks before the close window and after it", () => {
    expect(isWithinCairoCloseWindow({ hour: 14, minute: 29 })).toBe(false);
    expect(isWithinCairoCloseWindow({ hour: 16, minute: 0 })).toBe(false);
  });
});
