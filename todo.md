# Project TODO

- [x] Validate the chosen free EGX source's coverage and redistribution/licensing terms for EGX30 daily OHLCV data. Yahoo documents Egypt coverage with delay and explicitly prohibits redistribution; `free_source_research.md` records that the source is a free research fallback, not an open redistribution license.
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
- [x] Add daily comparison and long-term history views. The public History tab compares latest versus previous persisted sessions and shows up to 90 persisted sessions for a selected stock.
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
- [x] Verify the scheduled callback and record its first execution status. The production callback is registered and rejects an unauthenticated probe with HTTP 403; Heartbeat history currently reports zero executions because the weekday-only schedule has not reached its first eligible run yet.

- [x] Remove the paid EODHD dependency from the automatic ingestion path.
- [x] Evaluate and document a fully free EGX30 data source, including whether it supports intraday volume required for two-hour analysis.
- [x] Add a free-source fallback mode and update provider status/error messaging accordingly.
- [x] Update the scheduled job and verify the free-source path without requiring a paid API key. The deployed database contains 543 `yahoo-free` rows across 29 symbols, the public history endpoint returns those rows, and the production callback is registered; no paid key is required. A first automated Heartbeat execution remains pending because no run has occurred yet.

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

- [x] Sort stock lists and heatmap by a documented composite strength score from strongest to weakest, never alphabetically.
- [x] Add visible score/ordering context so the user understands why a stock ranks higher. The UI shows rank numbers, Strength /100, and the 70% zone-score / 30% relative-volume formula.
- [x] Test and visually verify the strongest-to-weakest ordering. Ranking tests passed and the UI subtitle documents the order.

- [x] Add a deterministic unit test for strongest-to-weakest ranking and tie-breaking.

- [x] Remove alphabetical fallback from strength ranking and use a stable non-alphabetical source-order fallback for exact ties.
- [x] Add tests for exact strength and volume ties.
- [x] Record observed top-ranked symbols after final render verification. The rendered dashboard showed OIH, CCAP, HELI, TMGH, ETEL, and GBCO in the first six ranked positions, with visible Strength scores and rank numbers.

- [x] Add an inspectable ranking snapshot assertion for the currently persisted dashboard order. `shared/ranking.snapshot.json` is generated from the local `dashboard.snapshot` payload backed by persisted database rows, and its test asserts the observed symbols and scores. `shared/ranking.snapshot.test.ts` asserts OIH, CCAP, HELI, TMGH, ETEL, and GBCO as the first six in the verified snapshot.
- [x] Re-run visual verification and document the same order alongside the snapshot assertion. The captured rendered dashboard showed OIH, CCAP, HELI, TMGH, ETEL, and GBCO; the saved evidence records the same order with scores 89, 78, 74, 71, 70, and 68. The final rendered dashboard visibly shows the same first six ranked symbols with rank numbers and Strength scores.

- [x] Add a public historical comparison endpoint backed only by persisted daily bars.
- [x] Add a History tab with latest-vs-previous comparison and selected-stock long-term history.
- [x] Add tests for empty-history handling and daily comparison calculations. `shared/history.test.ts` covers change math, missing previous bars, empty rows, and row grouping.

- [x] Define deterministic directional labels for zones: Potential Accumulation, Potential Distribution, and Neutral. The classifier uses close location, prior close movement, and elevated volume; insufficient evidence remains Neutral.
- [x] Persist and expose the directional label without manufacturing evidence or changing the existing score semantics. The schema stores the constrained enum and the scheduled/backfill paths write it from analyzed persisted OHLCV.
- [x] Update dashboard cards, details, and methodology copy to show the directional classification and its limitations.
- [x] Add unit and no-fabrication tests for directional classification, then visually verify and publish. 21 tests passed; the database backfill produced 60 Potential Accumulation, 49 Potential Distribution, and 55 Neutral zones from the existing 164 real zones.

- [x] Add a dedicated no-fabrication guard proving directional badges are absent when the source returns no zones or an error. The UI now shows `No direction` for a missing field and renders zone badges only when persisted zones exist; the guard is covered in `server/noFabrication.test.ts`.

- [x] Add an explicit error-state no-fabrication guard proving direction badges are not rendered when the dashboard snapshot query fails. `hasRenderableZones` requires `!snapshot.isError && zones.length > 0`, and the static guard verifies the condition.

- [x] Add a directional filter for Potential Accumulation, Potential Distribution, and Neutral zones. The Overview header includes an All directions selector and an explicit no-match state.
- [x] Calculate and expose 1-session, 3-session, and 5-session post-zone confirmation from persisted bars only. Stock detail now evaluates historical zones against later persisted daily bars and reports Upward break, Downward break, Within zone, or No data.
- [x] Add a safe high-confidence accumulation alert flow with deduplication and user-visible status. The daily job sends one owner notification for new high-confidence Potential Accumulation zones only, and the Overview includes an Accumulation watch card.
- [x] Add tests, no-fabrication guards, and visual verification for all three enhancements. 27 tests passed, including confirmation, alert, and alert/confirmation no-fabrication guards; the filter, status badge, and no-data UI were visually inspected.

- [x] Add a persisted, user-visible alert delivery status for sent, skipped, and failed high-confidence accumulation alerts. `analysis_runs` stores alertStatus, alertCount, alertError, and alertSentAt; the Overview shows the current alert status.
- [x] Add no-fabrication guards for the Accumulation watch card and confirmation rows in empty/error states. Static guards require explicit no-alert copy and `No data` confirmation outcomes, while snapshot errors prevent renderable zones.

- [x] Add a public alert-history endpoint backed only by persisted analysisRuns with sent/failed/skipped status.
- [x] Add an alert history view showing run time, delivery status, count, and recorded symbols/details. The view displays only persisted rows and explicit no-history/error states.
- [x] Add an independent confidence filter alongside the directional filter. The Overview header now supports All, High, Medium, and Low confidence.
- [x] Add tests and no-fabrication guards for alert history and confidence filtering, then visually verify and publish. 30 tests passed and the controls/no-data states were visually inspected.
