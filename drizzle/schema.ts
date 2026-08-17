import { double, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const userSettings = mysqlTable("user_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  encryptedApiKey: text("encryptedApiKey"),
  dataProvider: varchar("dataProvider", { length: 64 }).default("eodhd").notNull(),
  watchlist: text("watchlist").notNull(),
  scheduleTaskUid: varchar("scheduleTaskUid", { length: 65 }),
  lastRunStatus: mysqlEnum("lastRunStatus", ["never", "success", "failed"]).default("never").notNull(),
  lastRunError: text("lastRunError"),
  lastSuccessfulRunAt: timestamp("lastSuccessfulRunAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ scheduleTaskUidIdx: index("schedule_task_uid_idx").on(table.scheduleTaskUid) }));

export const instruments = mysqlTable("instruments", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  exchange: varchar("exchange", { length: 16 }).default("EGX").notNull(),
  isTracked: int("isTracked").default(1).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const dailyBars = mysqlTable("daily_bars", {
  id: int("id").autoincrement().primaryKey(),
  instrumentId: int("instrumentId").notNull(),
  tradingDate: timestamp("tradingDate").notNull(),
  open: double("open").notNull(),
  high: double("high").notNull(),
  low: double("low").notNull(),
  close: double("close").notNull(),
  adjustedClose: double("adjustedClose"),
  volume: double("volume").notNull(),
  turnover: double("turnover"),
  provider: varchar("provider", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ instrumentDateIdx: index("instrument_date_idx").on(table.instrumentId, table.tradingDate) }));

export const intervalBars = mysqlTable("interval_bars", {
  id: int("id").autoincrement().primaryKey(),
  dailyBarId: int("dailyBarId").notNull(),
  intervalStart: timestamp("intervalStart").notNull(),
  intervalEnd: timestamp("intervalEnd").notNull(),
  open: double("open").notNull(),
  high: double("high").notNull(),
  low: double("low").notNull(),
  close: double("close").notNull(),
  volume: double("volume").notNull(),
  volumeRatio: double("volumeRatio"),
  priceRangePct: double("priceRangePct"),
}, table => ({ dailyIntervalIdx: index("daily_interval_idx").on(table.dailyBarId, table.intervalStart) }));

export const accumulationZones = mysqlTable("accumulation_zones", {
  id: int("id").autoincrement().primaryKey(),
  instrumentId: int("instrumentId").notNull(),
  tradingDate: timestamp("tradingDate").notNull(),
  intervalStart: timestamp("intervalStart").notNull(),
  intervalEnd: timestamp("intervalEnd").notNull(),
  lowerPrice: double("lowerPrice").notNull(),
  upperPrice: double("upperPrice").notNull(),
  volumeRatio: double("volumeRatio").notNull(),
  acceptanceScore: double("acceptanceScore").notNull(),
  narrowRangeScore: double("narrowRangeScore").notNull(),
  totalScore: double("totalScore").notNull(),
  confidence: mysqlEnum("confidence", ["Low", "Medium", "High"]).notNull(),
  direction: mysqlEnum("direction", ["Potential Accumulation", "Potential Distribution", "Neutral"]).notNull().default("Neutral"),
  explanation: text("explanation").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ instrumentDateZoneIdx: index("instrument_date_zone_idx").on(table.instrumentId, table.tradingDate) }));

export const analysisRuns = mysqlTable("analysis_runs", {
  id: int("id").autoincrement().primaryKey(),
  runDate: timestamp("runDate").notNull(),
  status: mysqlEnum("status", ["running", "completed", "failed"]).notNull(),
  instrumentsProcessed: int("instrumentsProcessed").default(0).notNull(),
  errorMessage: text("errorMessage"),
  alertStatus: mysqlEnum("alertStatus", ["not_run", "skipped", "sent", "failed"]).default("not_run").notNull(),
  alertCount: int("alertCount").default(0).notNull(),
  alertError: text("alertError"),
  alertDetails: text("alertDetails"),
  alertSentAt: timestamp("alertSentAt"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Instrument = typeof instruments.$inferSelect;
export type DailyBar = typeof dailyBars.$inferSelect;
export type IntervalBar = typeof intervalBars.$inferSelect;
export type AccumulationZone = typeof accumulationZones.$inferSelect;
