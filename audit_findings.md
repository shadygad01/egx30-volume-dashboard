
## Remaining component audit — 2026-08-17

- Public `dashboard.snapshot`, `dashboard.history`, `dashboard.alertHistory`, and `dashboard.stock(FWRY.EGX)` all returned HTTP 200 with valid payloads.
- Browser verification loaded the real snapshot after the initial loading state: 29 stocks, 164 zones, 86 high-confidence zones, ranked stock buttons, filters, and all five public tabs were present.
- History, Stock detail, Alert history, and Methodology are wired through `Home.tsx`; the stock list buttons set the selected symbol and detail query is enabled only when a symbol exists.
- Alert history search is wired to persisted rows; symbol/zone detail buttons navigate to Stock detail. Empty alert history is intentionally explicit because no analysis-run alert rows currently exist.
- The free intraday adapter intentionally returns no data; this is a source limitation and no fabricated two-hour bars are shown.
- `ComponentShowcase.tsx` contains demo-only controls and is not registered in `App.tsx`, so it is not part of the production dashboard route.
- Browser visual capture showed the production Overview with real data and a functional Refresh button; no public browser-console errors were observed in the captured runtime logs.

## Confirmed defect fixed

The Alert history navigation path could append `.EGX` twice. `AlertHistoryControls` already normalized a symbol through `alertNavigationTarget`, while `Home.tsx` appended `.EGX` again in its callback. This could make a click target such as `FWRY.EGX.EGX` and return no stock detail. The callback now uses `alertNavigationTarget` directly, with a regression assertion added.

The remaining interactive elements inspected are intentionally wired: public filters and tabs update local state, stock rows and history selectors drive the detail query, Settings uses protected mutations, ErrorBoundary and NotFound provide recovery navigation, and the demo-only ComponentShowcase route is not registered in production.
