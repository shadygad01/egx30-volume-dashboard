# Free-source research

The EGXLytics website could not be reached from the browser at the time of checking and returned ERR_CONNECTION_CLOSED, so its current API availability is unverified.

The public GitHub project https://github.com/M-Abdelmegeed/EGX-Data-MCP-Server describes an open-source MCP server for Egyptian Exchange stock tools. Its README documents local Python/uv installation but does not, from the reviewed page, establish a hosted public API, licensing terms for redistribution, or guaranteed intraday OHLCV/volume coverage. It may be useful as a source adapter only if its implementation is reviewed and can run within the project's hosting constraints.

The official EGX site provides market pages and constituent data, but automated access to intraday OHLCV data and redistribution rights remain unverified. Daily public pages or downloadable data may support end-of-day analysis, but they cannot by themselves create genuine two-hour intraday intervals.

Current conclusion: a completely free path is feasible only with an explicitly public/open source feed or a local scraper that the user is allowed to operate. Without intraday records, the two-hour accumulation analysis must be labeled unavailable rather than approximated from daily OHLCV.

Additional research: the open-source EGX-Data-MCP-Server implementation uses the `tradingview_ta` package with TradingView's EGX screener and only requests daily technical indicators (`Interval.INTERVAL_1_DAY`). It does not implement raw historical candles, intraday bars, or a hosted API. TradingView documentation confirms public chart/datafeed mechanisms and documents intraday history limits, but unofficial websocket extraction is not the same as a stable, redistributable public API. Therefore, TradingView can be considered a free fallback candidate for daily observations, not yet a verified production source for two-hour EGX volume bars.

Sources reviewed:
- https://github.com/M-Abdelmegeed/EGX-Data-MCP-Server
- https://www.tradingview.com/charting-library-docs/latest/tutorials/tutorials/implement_datafeed_tutorial/
- https://www.tradingview.com/support/solutions/43000480679-historical-intraday-data-bars-and-limits-explained/
