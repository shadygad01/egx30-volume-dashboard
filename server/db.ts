import { eq, desc, and, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { accumulationZones, analysisRuns, dailyBars, instruments, intervalBars, userSettings, users, type InsertUser } from "../drizzle/schema";
import { ENV } from './_core/env';
import { defaultEgx30Watchlist } from "@shared/universe";
import { confirmZoneAtSessions } from "@shared/confirmation";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date(); updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined || user.openId === ENV.ownerOpenId) { values.role = user.role ?? "admin"; updateSet.role = values.role; }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return rows[0];
}

export async function getOrCreateSettings(userId: number) {
  const db = await getDb(); if (!db) return undefined;
  const existing = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  if (existing[0]) return existing[0];
  const [created] = await db.insert(userSettings).values({ userId, dataProvider: "yahoo-free", watchlist: JSON.stringify(defaultEgx30Watchlist) });
  return { id: Number(created.insertId), userId, encryptedApiKey: null, dataProvider: "yahoo-free", watchlist: JSON.stringify(defaultEgx30Watchlist), scheduleTaskUid: null, lastRunStatus: "never" as const, lastRunError: null, lastSuccessfulRunAt: null };
}

export async function setScheduleTaskUid(userId: number, scheduleTaskUid: string) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.update(userSettings).set({ scheduleTaskUid }).where(eq(userSettings.userId, userId));
}

export async function saveSettings(userId: number, values: { encryptedApiKey?: string | null; dataProvider?: string; watchlist: string }) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.insert(userSettings).values({ userId, encryptedApiKey: values.encryptedApiKey ?? null, dataProvider: values.dataProvider ?? "yahoo-free", watchlist: values.watchlist }).onDuplicateKeyUpdate({ set: { encryptedApiKey: values.encryptedApiKey ?? null, dataProvider: values.dataProvider ?? "yahoo-free", watchlist: values.watchlist } });
  return getOrCreateSettings(userId);
}

export async function getDashboardSnapshot() {
  const db = await getDb();   if (!db) return { latestDate: null, stocks: [], zones: [], alertStatus: "not_run" as const, alertCount: 0, alertError: null };
  const latestRun = await db.select({ alertStatus: analysisRuns.alertStatus, alertCount: analysisRuns.alertCount, alertError: analysisRuns.alertError, alertSentAt: analysisRuns.alertSentAt }).from(analysisRuns).orderBy(desc(analysisRuns.startedAt)).limit(1);
  const alertMeta = latestRun[0] ?? { alertStatus: "not_run" as const, alertCount: 0, alertError: null, alertSentAt: null };
  const latest = await db.select({ tradingDate: dailyBars.tradingDate }).from(dailyBars).orderBy(desc(dailyBars.tradingDate)).limit(1);
  if (!latest[0]) return { latestDate: null, stocks: [], zones: [], ...alertMeta };
  const date = latest[0].tradingDate;
  const stocks = await db.select({ instrument: instruments, bar: dailyBars }).from(dailyBars).innerJoin(instruments, eq(dailyBars.instrumentId, instruments.id)).where(eq(dailyBars.tradingDate, date));
  const zones = await db.select({ zone: accumulationZones, instrument: instruments }).from(accumulationZones).innerJoin(instruments, eq(accumulationZones.instrumentId, instruments.id)).where(eq(accumulationZones.tradingDate, date)).orderBy(desc(accumulationZones.totalScore));
  return { latestDate: date, stocks, zones, ...alertMeta };
}

export async function getDashboardHistory() {
  const db = await getDb(); if (!db) return { latestDate: null, previousDate: null, rows: [] };
  const dates = await db.select({ tradingDate: dailyBars.tradingDate }).from(dailyBars).groupBy(dailyBars.tradingDate).orderBy(desc(dailyBars.tradingDate)).limit(90);
  const latestDate = dates[0]?.tradingDate ?? null;
  const previousDate = dates[1]?.tradingDate ?? null;
  if (!latestDate) return { latestDate: null, previousDate: null, rows: [] };
  const rows = await db.select({ instrument: instruments, bar: dailyBars }).from(dailyBars).innerJoin(instruments, eq(dailyBars.instrumentId, instruments.id)).where(inArray(dailyBars.tradingDate, dates.map((item) => item.tradingDate))).orderBy(desc(dailyBars.tradingDate));
  return { latestDate, previousDate, rows };
}

export async function getStockDetail(symbol: string) {
  const db = await getDb(); if (!db) return null;
  const instrument = (await db.select().from(instruments).where(eq(instruments.symbol, symbol)).limit(1))[0];
  if (!instrument) return null;
  const bars = await db.select().from(dailyBars).where(eq(dailyBars.instrumentId, instrument.id)).orderBy(desc(dailyBars.tradingDate)).limit(90);
  const latest = bars[0];
  const intervals = latest ? await db.select().from(intervalBars).where(eq(intervalBars.dailyBarId, latest.id)).orderBy(intervalBars.intervalStart) : [];
  const chronologicalBars = [...bars].reverse();
  const zoneDates = bars.map((bar) => bar.tradingDate);
  const zones = zoneDates.length ? await db.select().from(accumulationZones).where(and(eq(accumulationZones.instrumentId, instrument.id), inArray(accumulationZones.tradingDate, zoneDates))).orderBy(desc(accumulationZones.tradingDate), desc(accumulationZones.totalScore)) : [];
  const zonesWithConfirmation = zones.map((zone) => ({ ...zone, confirmation: confirmZoneAtSessions(zone, chronologicalBars) }));
  return { instrument, bars: chronologicalBars, intervals, zones: zonesWithConfirmation };
}

export async function recordAnalysisRun(runDate: Date, status: "running" | "completed" | "failed", instrumentsProcessed = 0, errorMessage?: string) {
  const db = await getDb(); if (!db) return;
  await db.insert(analysisRuns).values({ runDate, status, instrumentsProcessed, errorMessage: errorMessage ?? null, completedAt: status === "completed" || status === "failed" ? new Date() : null });
}
