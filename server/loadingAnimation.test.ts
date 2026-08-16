import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");

describe("loading animation accessibility", () => {
  it("provides reduced-motion fallback styles", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain(".loading-orbit, .loading-dots { animation: none; }");
  });
});
