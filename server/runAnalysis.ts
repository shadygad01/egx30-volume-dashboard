import { and, eq, lt } from "drizzle-orm";
import { accumulationZones, analysisRuns, dailyBars, instruments, userSettings } from "../drizzle/schema";
import { getDb, getProjectSettings } from "./db";
import { fetchFreeDaily, analyzeDaily } from "./marketData";
import { defaultEgx30Watchlist } from "@shared/universe";
import { notifyOwner } from "./_core/notification";
import { selectAccumulationAlerts } from "@shared/alerts";
import { mergeZoneSessions } from "@shared/zoneLifecycle";

const defaultWatchlist = defaultEgx30Watchlist;

export async function runDailyAnalysis(userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const setting = await getProjectSettings(userId);
  if (!setting) throw new Error("Project settings are not initialized");
  let watchlist: string[] = defaultWatchlist;
  try {
    const parsed = JSON.parse(setting.watchlist || "[]");
    if (Array.isArray(parsed) && parsed.length) watchlist = parsed;
  } catch {
    watchlist = defaultWatchlist;
  }
  const end = new Date();
  const start = new Date(end.getTime() - 1000 * 60 * 60 * 24 * 120);
  const from = start.toISOString().slice(0, 10);
  const to = end.toISOString().slice(0, 10);
  const runDate = new Date(`${to}T00:00:00.000Z`);
  const [run] = await db.insert(analysisRuns).values({ runDate, status: "running" });
  let processed = 0;
  const highConfidenceAccumulationAlerts: string[] = [];
  try {
    for (const symbol of watchlist) {
      const dailyPoints = await fetchFreeDaily(symbol, from, to);
      const latest = dailyPoints[dailyPoints.length - 1];
      if (!latest) continue;
      const existingInstrument = await db.select().from(instruments).where(eq(instruments.symbol, symbol)).limit(1);
      let instrumentId = existingInstrument[0]?.id;
      if (!instrumentId) {
        const [created] = await db.insert(instruments).values({ symbol, name: symbol.replace(".EGX", ""), isTracked: 1 });
        instrumentId = Number(created.insertId);
      }
      const existingBar = await db.select().from(dailyBars).where(and(eq(dailyBars.instrumentId, instrumentId), eq(dailyBars.tradingDate, runDate))).limit(1);
      const isNewDailyBar = !existingBar[0];
      let dailyBarId = existingBar[0]?.id;
      if (!dailyBarId) {
        const [createdBar] = await db.insert(dailyBars).values({ instrumentId, tradingDate: runDate, open: latest.open, high: latest.high, low: latest.low, close: latest.close, adjustedClose: latest.close, volume: latest.volume, provider: "yahoo-free" });
        dailyBarId = Number(createdBar.insertId);
      }
      const { zones } = analyzeDaily(dailyPoints);
      const sessionZones = zones.map(zone => ({ ...zone, tradingDate: new Date(zone.intervalStart) }));
      const activeZones = mergeZoneSessions(sessionZones, setting.activeZoneWindowSessions ?? 10);
      await db.update(accumulationZones).set({ lifecycleStatus: "historical" }).where(and(eq(accumulationZones.instrumentId, instrumentId), lt(accumulationZones.tradingDate, runDate)));
      await db.delete(accumulationZones).where(and(eq(accumulationZones.instrumentId, instrumentId), eq(accumulationZones.tradingDate, runDate)));
      if (activeZones.length) await db.insert(accumulationZones).values(activeZones.map(zone => ({ instrumentId: instrumentId!, tradingDate: runDate, intervalStart: new Date(zone.intervalStart), intervalEnd: new Date(zone.intervalEnd), lowerPrice: zone.lowerPrice, upperPrice: zone.upperPrice, volumeRatio: zone.volumeRatio, acceptanceScore: zone.acceptanceScore, narrowRangeScore: zone.narrowRangeScore, totalScore: zone.totalScore, confidence: zone.confidence, direction: zone.direction, lifecycleStatus: "active" as const, explanation: `${zone.explanation} Daily OHLCV mode; no genuine two-hour bars available.` })));
      if (isNewDailyBar) {
        selectAccumulationAlerts(activeZones.map(zone => ({ symbol, lowerPrice: zone.lowerPrice, upperPrice: zone.upperPrice, totalScore: zone.totalScore, confidence: zone.confidence, direction: zone.direction }))).forEach(zone => highConfidenceAccumulationAlerts.push(`${symbol.replace(".EGX", "")} ${zone.lowerPrice.toFixed(2)}–${zone.upperPrice.toFixed(2)} (score ${zone.totalScore})`));
      }
      processed += 1;
    }
    let notificationSent = false;
    let alertStatus: "skipped" | "sent" | "failed" = highConfidenceAccumulationAlerts.length ? "failed" : "skipped";
    let alertError: string | null = highConfidenceAccumulationAlerts.length ? "Notification not attempted" : null;
    if (highConfidenceAccumulationAlerts.length) {
      notificationSent = await notifyOwner({ title: "EGX30 potential accumulation alert", content: `High-confidence potential accumulation zones from the verified daily OHLCV run (${to}): ${highConfidenceAccumulationAlerts.join("; ")}. This is analytical monitoring, not an investment recommendation.` });
      alertStatus = notificationSent ? "sent" : "failed";
      alertError = notificationSent ? null : "Owner notification service returned false";
    }
    await db.update(analysisRuns).set({ status: "completed", instrumentsProcessed: processed, alertStatus, alertCount: highConfidenceAccumulationAlerts.length, alertError, alertDetails: JSON.stringify(highConfidenceAccumulationAlerts), alertSentAt: notificationSent ? new Date() : null, completedAt: new Date() }).where(eq(analysisRuns.id, Number(run.insertId)));
    await db.update(userSettings).set({ lastRunStatus: "success", lastRunError: null, lastSuccessfulRunAt: new Date() }).where(eq(userSettings.id, setting.id));
    return { ok: true, processed, mode: "free-daily" as const, notificationSent, alertStatus, alertCount: highConfidenceAccumulationAlerts.length };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await db.update(analysisRuns).set({ status: "failed", instrumentsProcessed: processed, errorMessage, alertStatus: "failed", alertError: errorMessage, completedAt: new Date() }).where(eq(analysisRuns.id, Number(run.insertId)));
    await db.update(userSettings).set({ lastRunStatus: "failed", lastRunError: errorMessage }).where(eq(userSettings.id, setting.id));
    throw error;
  }
}
