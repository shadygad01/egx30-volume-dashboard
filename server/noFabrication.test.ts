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

  it("does not fabricate a directional category when a zone has no direction", () => {
    expect(homeSource).toContain('return value ?? "No direction"');
    expect(homeSource).toContain('filteredZones.length ? filteredZones.slice(0, 5)');
    expect(homeSource).toContain('!snapshot.isError && zones.length > 0');
    expect(homeSource).not.toContain('entry.zone.direction ?? "Neutral"}</Badge>');
    expect(homeSource).not.toContain('zone.direction ?? "Neutral"}</Badge>');
  });

  it("keeps accumulation watch and confirmations explicit when later data is absent", () => {
    expect(homeSource).toContain('accumulationAlerts.length ?');
    expect(homeSource).toContain('No high-confidence potential accumulation zone is available');
    expect(homeSource).toContain('point ? point.status : "No data"');
    expect(homeSource).toContain('alertStatus = snapshot.data?.alertStatus ?? "not_run"');
  });
});
