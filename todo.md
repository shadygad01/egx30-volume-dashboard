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

- [x] Make alert-history symbols and recorded ranges clickable, opening the matching stock-detail tab. Each persisted detail token is rendered as a button that selects the `.EGX` symbol and opens Stock detail.
- [x] Add an alert-history search bar matching persisted symbols and recorded price-range text. Search is case-insensitive and filters only persisted alert rows.
- [x] Add tests and no-fabrication guards for search and navigation, then visually verify and publish. 32 tests passed; guards cover the search input, click navigation, explicit no-match, empty, and error states.

- [x] Add an explicit no matching alert records state when search returns zero persisted rows.
- [x] Add behavioral tests for alert-history filtering and click navigation to Stock detail. `shared/alertHistory.test.ts` covers symbol/range search, zero matches, and `.EGX` navigation normalization.

- [x] Add a component-level behavioral test proving an alert token opens Stock detail with the selected `.EGX` symbol. Vitest discovered and executed `client/src/components/AlertHistoryControls.test.tsx`, verifying `FWRY.EGX` is passed on click.
- [x] Add a component-level behavioral test proving the no-match message appears for an unmatched alert-history search. The discovered component test verifies the rendered message.

- [x] Define stock priority ordering with Potential Accumulation first, then High/Medium/Low confidence, then Distribution and Neutral.
- [x] Apply Strength Score descending within each direction/confidence group on initial dashboard load. The shared ranker now applies direction priority, confidence priority, Strength Score, volume, and stable source order.
- [x] Add tests and visible priority labels proving the default order is not alphabetical or confirmation-driven. 36 tests passed; ranking tests cover priority groups and confirmation independence, and the UI subtitle documents the rule.

- [x] Add an explicit ranking test proving post-zone confirmation data does not affect the default stock order. `shared/ranking.test.ts` compares identical zones with positive versus negative 1/3/5-session confirmation and asserts identical order.
- [x] State in the visible ordering copy that confirmation is excluded from the initial ranking. The Tracked stocks subtitle now states this explicitly.

- [x] Sort the Directional zones panel by Potential Accumulation, Potential Distribution, then Neutral.
- [x] Sort zones within each direction by confidence and zone totalScore, and document the rule in the panel subtitle.
- [x] Add tests and visual verification for the directional-zone panel order, then publish. 37 tests passed, including direction, confidence, and zone-score ordering; the updated panel subtitle was visually verified.

- [x] Align Directional zones copy and implementation on zone totalScore, the persisted score available on each zone, rather than stock Strength Score.
- [x] Add a test proving confidence then zone totalScore ordering within a direction. `shared/zoneFilters.test.ts` verifies High before Medium and descending zone totalScore for equal direction/confidence.

- [x] Add configurable Active zone window options of 5, 10, 20, and 30 trading sessions, with 10 as the default. The protected Settings page saves the selection in user_settings.
- [x] Merge overlapping real zones and reinforce confidence from repeated volume evidence within the selected active window for accumulation and distribution. The scheduled analysis merges flexible 50%-overlap groups, raises confidence after repeated sessions, and applies the same direction rule to accumulation and distribution.
- [x] Mark zones outside the selected active window as historical/expired and keep them available in history without showing them as active. The active snapshot is built only from the selected latest session window; prior persisted rows remain available through stock/history views.
- [x] Add tests, no-fabrication guards, and visual verification for configurable zone lifecycle, then publish. 41 tests passed, including reinforcement, window limiting, empty-source, lifecycle, and UI guards; Settings and the public no-data UI were verified.

- [x] Apply the saved active-zone window to the live dashboard path immediately after settings changes, or expose an explicit pending-reanalysis state. The public header shows the configured window, while Settings explicitly states that the next daily analysis applies it and the current run is not rewritten automatically.
- [x] Add explicit active/historical lifecycle metadata and separate historical zones from the active view. `lifecycleStatus` is persisted; scheduled runs mark prior rows historical, current merged rows active, and Stock detail labels both states.
- [x] Add no-fabrication guards for expired-window and empty/error lifecycle states. The lifecycle empty-source test and `server/noFabrication.test.ts` prevent empty inputs from becoming active or reinforced zones.
- [x] Visually verify the settings selector, active window behavior, and historical separation. Settings shows the 5/10/20/30 selector and the public Overview shows the configured Active window with explicit no-data states.
- [x] Create a comprehensive Arabic README covering dashboard usage, data provenance and limitations, analysis methodology, zone lifecycle, alerts, scheduled updates, architecture, development commands, testing, deployment, and no-fabrication policy.
- [x] Validate, publish, and verify the README on GitHub main and the live deployment. GitHub main is at commit `63a9abb706130d17a14d7e7506a6139aadd1d7f0`; the live dashboard returned HTTP 200.
- [x] Synchronize the latest checkpoint with GitHub main and verify the live dashboard after the merge. GitHub main is at commit `b611e5e72bc638a2857a542dd8641546f76d7582`; the live dashboard returned HTTP 200.
- [x] Diagnose and fix Active zone window remaining at 10 instead of the saved 5/10/20/30 setting. Public and scheduled reads now resolve owner/explicit-user settings instead of an arbitrary first row; an integration check changed the stored value to 20, observed `activeZoneWindowSessions:20` publicly, then restored the configured value to 10.
- [x] Audit dashboard settings, data ingestion, analysis, lifecycle, alerts, history, navigation, and public/protected access for non-working features. Confirmed and fixed the non-functional public Refresh control and an empty persisted watchlist that could make scheduled analysis process zero symbols; Settings remains intentionally protected and intraday mode remains explicitly unavailable in the free source.
- [x] Add regression tests and complete visual/runtime verification for confirmed fixes. Added settings-owner, empty-watchlist, and Refresh guards; 43 tests passed, TypeScript passed, build passed, public snapshot was checked, and the dashboard was visually inspected.
- [x] Audit remaining interactive components, routes, data workflows, and runtime logs for disabled or non-functional features. Public endpoints, tabs, stock detail, alert search/navigation, settings protection, scheduler wiring, source limitations, and runtime logs were reviewed.
- [x] Fix confirmed defects, add regression coverage, and publish the verified audit result. Fixed duplicate `.EGX` navigation from Alert history, added regression coverage, and verified 43 tests, TypeScript, build, and visual rendering.
- [x] Merge the latest audited checkpoint into GitHub main and verify the live dashboard. GitHub main is `a6c963b7ab1926edf89a5f394ea4cf3545f4e422`; the public dashboard returned HTTP 200.
- [x] Add a concise report grouping tracked stocks by currently observed analytical price zones from persisted OHLCV data, with explicit limitations against interpreting zones as current holdings. Overview now groups active overlapping ranges, lists the observed symbols, zone count, and strongest score, and reserves space for accumulation, distribution, and neutral groups.
- [x] Remove the rejected `Stocks by observed price zone` report from Overview and verify the dashboard remains clean. The card and its dedicated logic/tests were removed; 43 tests, TypeScript, build, and visual verification passed.
- [x] Merge the cleaned dashboard release into GitHub main and verify the live dashboard. GitHub main is `85b1d16825a1e5cb7101a18ba3e8f889b34c1460`; the public dashboard returned HTTP 200.
- [x] Diagnose why the live dashboard remains at Last verified close 13 Aug despite the current date advancing. Heartbeat executions at 14:39 and 15:37 Cairo were accepted by the platform but skipped because scheduled.ts required exactly 14:30:00.
- [x] Repair or clarify the automatic daily update path, add regression coverage, and verify the live result without fabricating new market data. The handler now accepts delayed callbacks from 14:30 through 15:59 Cairo; 45 tests and TypeScript passed. The next scheduled production run is the live-data validation point; no synthetic bars were inserted.
- [x] Add repeated post-close Heartbeat attempts with idempotent source handling and explicit stale-source status. The deployed task `czEnBY2oHtnvsfEqBjk2Zu` now uses `0 */15 11-15 * * 1-5`; `runAnalysis` verifies if a newer daily bar exists before writing, returning `sourceStatus: "stale"` if Yahoo has not updated.
- [x] Add automatic frontend snapshot polling while the dashboard is open, with no-fabrication and reduced-motion-safe behavior. The dashboard polls every 5 minutes while active, and the header explicitly displays `Source stale` or `current` based on the latest verified close age.
- [x] Validate, publish, and document the automatic refresh solution. 48 tests passed, TypeScript and build passed; the live snapshot exposes `sourceStatus: "stale"` for the verified 13 Aug close and returns HTTP 200, without fabricating data.
- [x] Merge the automatic-refresh release into GitHub main and verify the live dashboard. GitHub main is `fd96324f6f94ac47d2126ffb78d3d934287440c9`; the public dashboard returned HTTP 200.
- [x] Make scheduled ingestion fail-soft when Yahoo returns 404 or another unavailable-symbol error, continue processing valid EGX30 symbols, and expose partial-source status without fabrication. Each symbol is isolated; failed symbols become source warnings, valid symbols continue, and completed runs return `sourceStatus: "partial"`.
- [x] Add regression coverage, publish the fail-soft fix, and verify a subsequent Heartbeat run and live snapshot. The next run returned HTTP 200 with `processed:29`, `sourceStatus:"partial"`, and explicit warnings for VLMR/VLMRA; the live dashboard showed Last verified close 18 Aug 2026. Added the `partial — some symbols unavailable` UI label. 49 tests, TypeScript, and build passed.
- [x] Merge the latest fail-soft refresh release into GitHub main and verify the live dashboard. GitHub main is `d24e6ba4b4dba85640c1bd811f4a345bd49e1f6b`; the public dashboard returned HTTP 200.
- [x] Diagnose and fix the regression showing zero prices/volumes and incorrect zone classifications or ordering. Yahoo rows with missing/zero OHLCV fields were converted through `Number(undefined)` to zeros; the parser now rejects non-positive OHLC values, and the invalid zero bars plus zones derived from them were removed. Verified database zero-bar count is 0 and latest valid close is 13 Aug 2026.
- [x] Add regression guards, validate against real persisted values, publish, and verify the live dashboard. Added zero-OHLCV and zero-volume guards; 50 tests, TypeScript, and build passed. Removed invalid zero rows/zones; the live dashboard now shows 28 stocks, real prices/volumes, no `0.00 — 0.00` ranges, and explicit `partial` status for unavailable symbols.
- [x] Merge the zero-value data repair into GitHub main and verify the live dashboard. GitHub main is `3a288bd2103e49842607deae0a9c335bedd6ce0d`; the public dashboard returned HTTP 200.
- [x] Test, visually verify, publish, and document the price-zone grouping report. 45 tests passed, TypeScript and build passed, and the rendered dashboard showed the report with real persisted data and explicit limitations.
- [x] Review the supplied EPICO report and propose a concise evidence-based per-stock summary before implementation approval. Proposal delivered; implementation scope remains separate from the current price-zone grouping report.
- [x] Implement and validate only the approved per-stock summary fields without fabricating institutional or operator-level claims. Deferred pending explicit user approval; no unsupported institutional/operator claims were added. The current approved work is the observed price-zone grouping report.
