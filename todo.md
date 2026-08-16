# Project TODO

- [ ] Validate the EODHD or equivalent data-source coverage and licensing for EGX30 daily OHLCV data.
- [x] Add API-key configuration with secure server-side storage and clear setup state.
- [x] Add customizable EGX30 watchlist settings with default constituents.
- [x] Add database tables for instruments, daily bars, two-hour intervals, analysis runs, and accumulation zones.
- [x] Add daily post-close data ingestion at 14:30 Cairo time, represented in UTC for the scheduler. The deployed schedule is active.
- [x] Add idempotent data ingestion and analysis execution with error logging.
- [x] Implement two-hour interval aggregation for OHLCV data.
- [x] Implement accumulation-zone scoring using relative volume, price acceptance, and narrow-range behavior.
- [x] Restrict confidence labels to exactly Low, Medium, and High.
- [x] Add explicit visible disclaimer that results are analytical and not an investment recommendation.
- [x] Build premium dashboard overview for all tracked EGX30 stocks.
- [x] Add per-stock detail view with candlestick chart, volume profile bands, and potential accumulation zones.
- [x] Add unified heat map for volume activity strength across tracked stocks.
- [ ] Add daily comparison and long-term history views.
- [x] Add loading, empty, error, and no-data states.
- [x] Add Vitest coverage for interval aggregation, accumulation scoring, confidence tiers, and scheduler conversion.
- [x] Run type checks, tests, and visual verification before delivery.

- [x] Create and persist the actual daily Heartbeat cron for 14:30 Cairo time and surface its status in Settings. Task UID czEnBY2oHtnvsfEqBjk2Zu is persisted for the owner.
- [x] Replace the starter watchlist with the full EGX30 default constituents or clearly label the list as provisional until validated.
- [x] Show explicit provider setup state: missing key, saved, last sync, and sync failure.
- [x] Replace the stock-detail area chart with a candlestick chart and volume profile bands.
- [x] Convert the overview bar chart into a true heat map.
- [x] Add explicit loading and error UI states for dashboard, detail, and settings queries.
- [x] Ensure analysis tests are discovered by Vitest and rerun them.
- [ ] Perform authenticated browser visual verification and record the result. Unauthenticated preview verified the sign-in gate; full dashboard view requires sign-in.

- [x] Create a new private GitHub repository and upload the current project snapshot.
- [x] Verify the uploaded repository URL and default branch.

- [ ] Enable the deployed daily EGX30 data-ingestion and dashboard-update schedule at 14:30 Cairo time.
- [ ] Verify the scheduled callback and record its first execution status.

- [x] Remove the paid EODHD dependency from the automatic ingestion path.
- [x] Evaluate and document a fully free EGX30 data source, including whether it supports intraday volume required for two-hour analysis.
- [x] Add a free-source fallback mode and update provider status/error messaging accordingly.
- [ ] Update the scheduled job and verify the free-source path without requiring a paid API key. Code path is updated, but live Yahoo access timed out from the current environment and needs verification on the deployed run.

- [x] Replace paid-provider-required mode with a free daily OHLCV mode.
- [x] Remove any artificial two-hour interval claims and label intraday analysis unavailable when no real intraday data exists.
- [x] Update provider settings, schedule status, and dashboard copy for the free source and its limitations.
- [x] Run tests and save a new published checkpoint for the free-source mode.
