# Project TODO

- [ ] Validate the chosen free EGX source's coverage and redistribution/licensing terms for EGX30 daily OHLCV data. EODHD was rejected for the free-only requirement; free-source findings and remaining licensing uncertainty are documented in free_source_research.md.
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
- [x] Perform public browser visual verification and record the result. The live public dashboard showed the persisted real data; Settings remains protected separately.

- [x] Create a new private GitHub repository and upload the current project snapshot.
- [x] Verify the uploaded repository URL and default branch.

- [x] Enable the deployed daily EGX30 data-ingestion and dashboard-update schedule at 14:30 Cairo time.
- [ ] Verify the scheduled callback and record its first execution status.

- [x] Remove the paid EODHD dependency from the automatic ingestion path.
- [x] Evaluate and document a fully free EGX30 data source, including whether it supports intraday volume required for two-hour analysis.
- [x] Add a free-source fallback mode and update provider status/error messaging accordingly.
- [ ] Update the scheduled job and verify the free-source path without requiring a paid API key. Code path is updated, but live Yahoo access timed out from the current environment and needs verification on the deployed run.

- [x] Replace paid-provider-required mode with a free daily OHLCV mode.
- [x] Remove any artificial two-hour interval claims and label intraday analysis unavailable when no real intraday data exists.
- [x] Update provider settings, schedule status, and dashboard copy for the free source and its limitations.
- [x] Run tests and save a new published checkpoint for the free-source mode.

- [x] Enforce a strict no-fabrication policy in data ingestion, analysis, UI fallback states, and displayed metrics.
- [x] Add tests proving missing or failed source data produces empty/error states rather than synthetic values or zones.

- [x] Add a rejected-request test for the free source and verify the error remains explicit.
- [x] Add a static UI guard test proving empty dashboard metrics do not fall back to a stock count or selected symbol.

- [x] Confirm or create the EGX30 repository under the user's shadygad01 GitHub account and verify the direct URL.

- [x] Investigate why the GitHub repository is not visible to the user under shadygad01 and verify the authenticated GitHub account/ownership. The repository exists under shadygad01 but is private; the public profile was viewed while signed out.
- [x] Correct repository ownership or provide the exact access action required, then verify visibility from the user's account. Repository is now public and returns HTTP 200 without login.

- [x] Change shadygad01/egx30-volume-dashboard visibility from Private to Public after explicit user approval and verify public access.

- [x] Allow anonymous read-only access to the EGX30 dashboard without exposing settings mutations or administrative actions.
- [x] Verify the public dashboard renders no-data and error states without login. Live URL showed the public dashboard and explicit no-data metrics without a login gate.
- [x] Publish and verify the anonymous dashboard URL. Public URL: https://egx30dash-pf4nqfnq.manus.space

- [x] Add animated loading states tied to real dashboard and stock-detail query states.
- [x] Preserve explicit no-data and error states without inserting placeholder market values.
- [x] Test and visually verify the loading animations, including reduced-motion behavior. Tests and TypeScript passed; CSS includes prefers-reduced-motion handling and the loading state was visually inspected.

- [x] Add a targeted test asserting the loading CSS includes a prefers-reduced-motion fallback.

- [x] Fetch and validate real OHLCV data for the latest 30 calendar days from the free source. Yahoo returned 21 daily points for 29 symbols over 2026-07-17 to 2026-08-16.
- [x] Insert only successfully fetched and validated bars into the project database. 543 `yahoo-free` daily bars were inserted.
- [x] Record unavailable symbols and source failures without creating substitute rows. VLMR and VLMRA were recorded as unavailable and excluded.
- [x] Run the analysis and verify the dashboard reflects only persisted real data. 29 instruments were processed, 164 zones inserted, and the live dashboard displayed the verified data.

- [x] Verify whether Yahoo's 16 August rows are complete trading-session OHLCV or delayed/current quote artifacts. The current quote page showed Aug 16, but the historical chart series was complete only through Aug 13; no Aug 16 OHLCV rows were accepted.
- [x] Correct the displayed last-close date only from verified session timestamps, without changing stored data based on assumption. The UI now shows Today 16 Aug 2026 and Last verified close 13 Aug 2026.
