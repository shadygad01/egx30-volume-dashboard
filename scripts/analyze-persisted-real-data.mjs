import { and, desc, eq } from "drizzle-orm";
import { accumulationZones, dailyBars, instruments } from "../drizzle/schema.ts";
import { getDb } from "../server/db.ts";
import { analyzeDaily } from "../server/marketData.ts";

const db = await getDb();
if (!db) throw new Error("Database unavailable");
const tracked = await db.select().from(instruments).where(eq(instruments.isTracked, 1));
let processed = 0;
let zonesInserted = 0;
for (const instrument of tracked) {
  const bars = await db.select().from(dailyBars).where(eq(dailyBars.instrumentId, instrument.id)).orderBy(dailyBars.tradingDate);
  if (!bars.length) continue;
  const points = bars.map((bar) => ({ timestamp: new Date(bar.tradingDate).getTime(), open: Number(bar.open), high: Number(bar.high), low: Number(bar.low), close: Number(bar.close), volume: Number(bar.volume) }));
  const { zones } = analyzeDaily(points);
  const latestDate = new Date(bars.at(-1).tradingDate);
  await db.delete(accumulationZones).where(and(eq(accumulationZones.instrumentId, instrument.id), eq(accumulationZones.tradingDate, latestDate)));
  if (zones.length) {
    await db.insert(accumulationZones).values(zones.map((zone) => ({ instrumentId: instrument.id, tradingDate: latestDate, intervalStart: new Date(zone.intervalStart), intervalEnd: new Date(zone.intervalEnd), lowerPrice: zone.lowerPrice, upperPrice: zone.upperPrice, volumeRatio: zone.volumeRatio, acceptanceScore: zone.acceptanceScore, narrowRangeScore: zone.narrowRangeScore, totalScore: zone.totalScore, confidence: zone.confidence, explanation: `${zone.explanation} Derived from verified daily OHLCV only; no two-hour bars are claimed.` })));
    zonesInserted += zones.length;
  }
  processed += 1;
}
console.log(JSON.stringify({ processed, zonesInserted, source: "persisted-yahoo-free-daily-ohlcv" }, null, 2));
