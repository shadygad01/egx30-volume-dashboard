import { describe, expect, it } from "vitest";
import { rankStocks } from "./ranking";

const stock = (symbol: string, volume: number) => ({ instrument: { symbol: `${symbol}.EGX`, name: symbol }, bar: { volume, low: 1, high: 2 } });
const zone = (symbol: string, totalScore: number, direction?: string, confidence?: string) => ({ instrument: { symbol: `${symbol}.EGX` }, zone: { totalScore, direction, confidence } });

describe("rankStocks", () => {
  it("orders strongest composite score first rather than alphabetically", () => {
    const ranked = rankStocks([stock("ABUK", 100), stock("COMI", 50), stock("AMOC", 10)], [zone("COMI", 95), zone("ABUK", 45)]);
    expect(ranked.map((item) => item.instrument.symbol)).toEqual(["COMI.EGX", "ABUK.EGX", "AMOC.EGX"]);
    expect(ranked[0]?.strengthScore).toBeGreaterThan(ranked[1]?.strengthScore ?? 0);
  });

  it("prioritizes accumulation, then confidence, then strength within each group", () => {
    const ranked = rankStocks(
      [stock("DIST", 100), stock("ACCLOW", 95), stock("ACCHIGH", 10), stock("ACCMED", 90), stock("NEUTRAL", 100)],
      [zone("DIST", 99, "Potential Distribution", "High"), zone("ACCLOW", 99, "Potential Accumulation", "Low"), zone("ACCHIGH", 50, "Potential Accumulation", "High"), zone("ACCMED", 95, "Potential Accumulation", "Medium")],
    );
    expect(ranked.map((item) => item.instrument.symbol)).toEqual(["ACCHIGH.EGX", "ACCMED.EGX", "ACCLOW.EGX", "DIST.EGX", "NEUTRAL.EGX"]);
  });

  it("does not use post-zone confirmation in the initial stock order", () => {
    const baseZones = [zone("ACCHIGH", 80, "Potential Accumulation", "High"), zone("ACCMED", 79, "Potential Accumulation", "Medium")];
    const withPositiveConfirmation = baseZones.map((entry) => ({ ...entry, zone: { ...entry.zone, confirmation: { 1: { status: "Upward break" }, 3: { status: "Upward break" }, 5: { status: "Upward break" } } } }));
    const withNegativeConfirmation = baseZones.map((entry) => ({ ...entry, zone: { ...entry.zone, confirmation: { 1: { status: "Downward break" }, 3: { status: "Downward break" }, 5: { status: "Downward break" } } } }));
    const stocks = [stock("ACCMED", 100), stock("ACCHIGH", 90)];
    expect(rankStocks(stocks, withPositiveConfirmation).map((item) => item.instrument.symbol)).toEqual(rankStocks(stocks, withNegativeConfirmation).map((item) => item.instrument.symbol));
  });

  it("uses volume as a real-data tie breaker and preserves source order for exact ties", () => {
    const volumeRanked = rankStocks([stock("ZZZ", 100), stock("AAA", 50)], []);
    expect(volumeRanked.map((item) => item.instrument.symbol)).toEqual(["ZZZ.EGX", "AAA.EGX"]);

    const exactTieRanked = rankStocks([stock("ZZZ", 100), stock("AAA", 100)], []);
    expect(exactTieRanked.map((item) => item.instrument.symbol)).toEqual(["ZZZ.EGX", "AAA.EGX"]);
  });
});
