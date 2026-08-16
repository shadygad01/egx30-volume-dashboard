import { describe, expect, it } from "vitest";
import { rankStocks } from "./ranking";

const stock = (symbol: string, volume: number) => ({ instrument: { symbol: `${symbol}.EGX`, name: symbol }, bar: { volume, low: 1, high: 2 } });
const zone = (symbol: string, totalScore: number) => ({ instrument: { symbol: `${symbol}.EGX` }, zone: { totalScore } });

describe("rankStocks", () => {
  it("orders strongest composite score first rather than alphabetically", () => {
    const ranked = rankStocks([stock("ABUK", 100), stock("COMI", 50), stock("AMOC", 10)], [zone("COMI", 95), zone("ABUK", 45)]);
    expect(ranked.map((item) => item.instrument.symbol)).toEqual(["COMI.EGX", "ABUK.EGX", "AMOC.EGX"]);
    expect(ranked[0]?.strengthScore).toBeGreaterThan(ranked[1]?.strengthScore ?? 0);
  });

  it("uses volume as a real-data tie breaker and preserves source order for exact ties", () => {
    const volumeRanked = rankStocks([stock("ZZZ", 100), stock("AAA", 50)], []);
    expect(volumeRanked.map((item) => item.instrument.symbol)).toEqual(["ZZZ.EGX", "AAA.EGX"]);

    const exactTieRanked = rankStocks([stock("ZZZ", 100), stock("AAA", 100)], []);
    expect(exactTieRanked.map((item) => item.instrument.symbol)).toEqual(["ZZZ.EGX", "AAA.EGX"]);
  });
});
