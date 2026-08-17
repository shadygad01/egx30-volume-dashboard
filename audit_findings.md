# Audit Findings — 2026-08-17

## Confirmed defects

1. `server/db.ts` used `user_settings.limit(1)` for the public snapshot, so the dashboard could read an arbitrary first settings row instead of the project owner settings. `server/runAnalysis.ts` had the same first-row behavior. The fix adds `getProjectSettings(userId?)`, resolves the owner through `ENV.ownerOpenId` for public reads, and passes the scheduled row's `userId` into `runDailyAnalysis`.
2. The public Overview Refresh button had no `onClick`; it rendered as a non-functional control. The fix refetches snapshot, history, alert history, and selected stock detail, with a disabled/spinning state while fetching.
3. The persisted `user_settings.watchlist` row was `[]`, which caused the daily analysis loop to process zero symbols. The settings response and daily analysis now fall back to the validated default EGX30 watchlist when stored JSON is empty or invalid. No market values are fabricated.
4. The live public dashboard and `/settings` were checked. Public Overview returned real persisted data and displayed Active window 10. `/settings` correctly required authentication. Captured browser network logs showed `settings.get` but no `settings.save` request, so the protected settings save flow still requires an authenticated manual interaction to verify end to end.

## Verified implementation areas

- Direction and confidence filters are implemented.
- History, Stock detail, alert history search/navigation, lifecycle badges, confirmations, and no-data/error states are implemented in `Home.tsx` and shared/server helpers.
- Yahoo free mode is daily-only; `fetchFreeIntraday()` intentionally returns no data rather than synthesizing two-hour bars.
- Heartbeat endpoint is registered and the cron expression has six fields (`0 30 11,12 * * 1-5`).
- Regression suite passed after the fixes: 43 tests; TypeScript check passed; production build passed.
