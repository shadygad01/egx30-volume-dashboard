import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const alertControlsSource = readFileSync(new URL("../client/src/components/AlertHistoryControls.tsx", import.meta.url), "utf8");
const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const runAnalysisSource = readFileSync(new URL("./runAnalysis.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");

describe("no-fabrication UI guards", () => {
  it("does not use a synthetic tracked-universe count or default stock query", () => {
    expect(homeSource).not.toContain('stocks.length ? `${stocks.length}` : "30"');
    expect(homeSource).not.toContain('selectedSymbol ?? "COMI.EGX"');
  });

  it("contains explicit no-data and source-error copy", () => {
    expect(homeSource).toContain("no data");
    expect(homeSource).toContain("Unable to load the latest market snapshot");
  });

  it("does not fabricate a directional category when a zone has no direction", () => {
    expect(homeSource).toContain('return value ?? "No direction"');
    expect(homeSource).toContain('filteredZones.length ? filteredZones.slice(0, 5)');
    expect(homeSource).toContain('!snapshot.isError && zones.length > 0');
    expect(homeSource).not.toContain('entry.zone.direction ?? "Neutral"}</Badge>');
    expect(homeSource).not.toContain('zone.direction ?? "Neutral"}</Badge>');
  });

  it("keeps alert history and confidence filtering explicit when data is absent", () => {
    expect(homeSource).toContain('const navItems = ["Overview", "History", "Stock detail", "Alert history", "Methodology"]');
    expect(homeSource).toContain('No synthetic alert rows are shown');
    expect(homeSource).toContain('!rows?.length ? <EmptyState />');
    expect(homeSource).toContain('aria-label="Filter confidence levels"');
    expect(alertControlsSource).toContain('aria-label="Search alert history"');
    expect(alertControlsSource).toContain('Search symbol or price range');
    expect(alertControlsSource).toContain('onClick={() => onOpenSymbol(alertNavigationTarget(symbol))}');
    expect(homeSource).toContain('No alert details recorded');
  });

  it("keeps zone lifecycle explicit and does not fabricate active zones", () => {
    expect(homeSource).toContain('zone.lifecycleStatus === "historical"');
    expect(homeSource).toContain('zone.lifecycleStatus === "historical" ? "Historical" : "Active"');
    expect(homeSource).toContain('activeZoneWindowSessions ?? 10');
  });

  it("keeps accumulation watch and confirmations explicit when later data is absent", () => {
    expect(homeSource).toContain('accumulationAlerts.length ?');
    expect(homeSource).toContain('No high-confidence potential accumulation zone is available');
    expect(homeSource).toContain('point ? point.status : "No data"');
    expect(homeSource).toContain('alertStatus = snapshot.data?.alertStatus ?? "not_run"');
  });

  it("wires the visible Refresh control to all public data queries", () => {
    expect(homeSource).toContain("const refreshAll = () =>");
    expect(homeSource).toContain("void snapshot.refetch()");
    expect(homeSource).toContain("void history.refetch()");
    expect(homeSource).toContain("void alertHistory.refetch()");
    expect(homeSource).toContain('onClick={refreshAll}');
    expect(homeSource).toContain('setSelectedSymbol(alertNavigationTarget(symbol))');
  });

  it("resolves public and scheduled settings from the owner or explicit user", () => {
    expect(dbSource).toContain("export async function getProjectSettings(userId?: number)");
    expect(dbSource).toContain("eq(users.openId, ENV.ownerOpenId)");
    expect(runAnalysisSource).toContain("const setting = await getProjectSettings(userId)");
    expect(dbSource).not.toContain("const settingsRow = await db.select({ activeZoneWindowSessions: userSettings.activeZoneWindowSessions }).from(userSettings).limit(1)");
    expect(routerSource).toContain("Array.isArray(parsed) && parsed.length ? parsed : defaultWatchlist");
    expect(runAnalysisSource).toContain("if (Array.isArray(parsed) && parsed.length) watchlist = parsed");
  });
});
