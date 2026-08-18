import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { userSettings } from "../drizzle/schema";
import { getDb } from "./db";
import { sdk } from "./_core/sdk";
import { runDailyAnalysis } from "./runAnalysis";
import { getCairoTimeParts, isWithinCairoCloseWindow } from "@shared/scheduleWindow";

export async function dailyAnalysisHandler(req: Request, res: Response) {
  const context = { url: req.originalUrl, timestamp: new Date().toISOString() };
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const cairoTime = getCairoTimeParts(new Date());
    if (!isWithinCairoCloseWindow(cairoTime)) return res.json({ ok: true, skipped: "outside-cairo-close-window" });
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const ownerSettings = await db.select().from(userSettings).where(eq(userSettings.scheduleTaskUid, user.taskUid)).limit(1);
    if (!ownerSettings[0]) return res.json({ ok: true, skipped: "orphan" });
    const result = await runDailyAnalysis(ownerSettings[0].userId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined, context });
  }
}
