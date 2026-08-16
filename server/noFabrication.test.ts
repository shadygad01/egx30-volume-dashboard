import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");

describe("no-fabrication UI guards", () => {
  it("does not use a synthetic tracked-universe count or default stock query", () => {
    expect(homeSource).not.toContain('stocks.length ? `${stocks.length}` : "30"');
    expect(homeSource).not.toContain('selectedSymbol ?? "COMI.EGX"');
  });

  it("contains explicit no-data and source-error copy", () => {
    expect(homeSource).toContain("no data");
    expect(homeSource).toContain("Unable to load the latest market snapshot");
  });
});
