import { z } from "zod";
import { parse as parseCookie } from "cookie";
import { createHeartbeatJob } from "./_core/heartbeat";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDashboardSnapshot, getOrCreateSettings, getStockDetail, saveSettings, setScheduleTaskUid } from "./db";
import { encryptSecret } from "./crypto";
import { defaultEgx30Watchlist } from "@shared/universe";

const defaultWatchlist = defaultEgx30Watchlist;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  dashboard: router({
    snapshot: publicProcedure.query(() => getDashboardSnapshot()),
    stock: publicProcedure.input(z.object({ symbol: z.string().min(1).max(32) })).query(({ input }) => getStockDetail(input.symbol)),
  }),
  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const settings = await getOrCreateSettings(ctx.user.id);
      if (!settings) return { dataProvider: "yahoo-free", watchlist: defaultWatchlist, hasApiKey: false };
      let watchlist: string[] = [];
      try { watchlist = JSON.parse(settings.watchlist); } catch { watchlist = defaultWatchlist; }
      return { dataProvider: settings.dataProvider, watchlist, hasApiKey: Boolean(settings.encryptedApiKey), scheduleTaskUid: settings.scheduleTaskUid, lastRunStatus: settings.lastRunStatus, lastRunError: settings.lastRunError, lastSuccessfulRunAt: settings.lastSuccessfulRunAt };
    }),
    enableDailySchedule: protectedProcedure.mutation(async ({ ctx }) => {
      const cookie = parseCookie(ctx.req.headers.cookie ?? "");
      const sessionToken = cookie[COOKIE_NAME] ?? "";
      const job = await createHeartbeatJob({ name: `egx30-daily-analysis-${ctx.user.id}`, cron: "0 30 11,12 * * 1-5", path: "/api/scheduled/daily-egx-analysis", description: "Daily EGX30 volume-zone analysis at 14:30 Cairo time" }, sessionToken);
      await setScheduleTaskUid(ctx.user.id, job.taskUid);
      return job;
    }),
    save: protectedProcedure.input(z.object({ apiKey: z.string().trim().max(256).optional(), dataProvider: z.string().default("yahoo-free"), watchlist: z.array(z.string().trim().min(1).max(32)).min(1).max(60) })).mutation(async ({ ctx, input }) => {
      const current = await getOrCreateSettings(ctx.user.id);
      return saveSettings(ctx.user.id, { encryptedApiKey: input.apiKey ? encryptSecret(input.apiKey) : current?.encryptedApiKey, dataProvider: input.dataProvider, watchlist: JSON.stringify(input.watchlist) });
    }),
  }),
});

export type AppRouter = typeof appRouter;
