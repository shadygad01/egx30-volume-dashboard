import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type RankingEvidence = {
  source: string;
  latestDate: string;
  firstSix: Array<{ symbol: string; strengthScore: number; volume: number }>;
};

const evidence = JSON.parse(readFileSync(new URL("./ranking.snapshot.json", import.meta.url), "utf8")) as RankingEvidence;

describe("persisted dashboard ranking snapshot", () => {
  it("contains a real database-backed payload marker and the verified first-six order", () => {
    expect(evidence.source).toContain("persisted database rows");
    expect(evidence.latestDate).toBe("2026-08-13T07:00:00.000Z");
    expect(evidence.firstSix.map((item) => item.symbol)).toEqual([
      "OIH.EGX", "CCAP.EGX", "HELI.EGX", "TMGH.EGX", "ETEL.EGX", "GBCO.EGX",
    ]);
    expect(evidence.firstSix.map((item) => item.strengthScore)).toEqual([89, 78, 74, 71, 70, 68]);
    expect(evidence.firstSix.every((item) => item.volume > 0)).toBe(true);
  });
});
