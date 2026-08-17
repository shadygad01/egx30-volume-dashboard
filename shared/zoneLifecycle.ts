import type { AccumulationZone, ZoneDirection } from "./analysis";

export const ACTIVE_ZONE_WINDOWS = [5, 10, 20, 30] as const;
export type ActiveZoneWindow = (typeof ACTIVE_ZONE_WINDOWS)[number];

export type SessionZone = AccumulationZone & { tradingDate: Date | string | number };
export type LifecycleZone = AccumulationZone & { tradingDate: Date; reinforcementSessions: number; lastReinforcedDate: Date; activeWindowSessions: ActiveZoneWindow };

type ZoneGroup = { zone: LifecycleZone; sessions: Set<string> };

function dateKey(value: Date | string | number) {
  return new Date(value).toISOString().slice(0, 10);
}

function rangeOverlap(a: AccumulationZone, b: AccumulationZone) {
  const intersection = Math.max(0, Math.min(a.upperPrice, b.upperPrice) - Math.max(a.lowerPrice, b.lowerPrice));
  const smallerRange = Math.max(Math.min(a.upperPrice - a.lowerPrice, b.upperPrice - b.lowerPrice), 0.000001);
  return intersection / smallerRange >= 0.5;
}

function confidenceFor(score: number, sessions: number): AccumulationZone["confidence"] {
  if (score >= 78 || sessions >= 3) return "High";
  if (score >= 58 || sessions >= 2) return "Medium";
  return "Low";
}

function reinforce(group: ZoneGroup, incoming: SessionZone, window: ActiveZoneWindow): ZoneGroup {
  const previous = group.zone;
  const incomingDate = new Date(incoming.tradingDate);
  const sessions = new Set(group.sessions);
  sessions.add(dateKey(incomingDate));
  const sessionCount = sessions.size;
  const score = Math.min(100, Math.max(previous.totalScore, incoming.totalScore) + Math.min(15, Math.max(0, sessionCount - 1) * 5));
  const lowerPrice = Math.min(previous.lowerPrice, incoming.lowerPrice);
  const upperPrice = Math.max(previous.upperPrice, incoming.upperPrice);
  const volumeRatio = Number(((previous.volumeRatio * (sessionCount - 1) + incoming.volumeRatio) / sessionCount).toFixed(2));
  const lastReinforcedDate = incomingDate > previous.lastReinforcedDate ? incomingDate : previous.lastReinforcedDate;
  const direction: ZoneDirection = previous.direction === incoming.direction ? previous.direction : "Neutral";
  const confidence = confidenceFor(score, sessionCount);
  return {
    zone: {
      ...previous,
      tradingDate: new Date(Math.max(previous.tradingDate.getTime(), incomingDate.getTime())),
      intervalStart: Math.min(previous.intervalStart, incoming.intervalStart),
      intervalEnd: Math.max(previous.intervalEnd, incoming.intervalEnd),
      lowerPrice,
      upperPrice,
      volumeRatio,
      totalScore: score,
      confidence,
      direction,
      explanation: `${incoming.explanation} Reinforced across ${sessionCount} verified session${sessionCount === 1 ? "" : "s"}; last reinforced ${dateKey(lastReinforcedDate)}; active window ${window} sessions.`,
      reinforcementSessions: sessionCount,
      lastReinforcedDate,
      activeWindowSessions: window,
    },
    sessions,
  };
}

export function mergeZoneSessions(input: SessionZone[], requestedWindow: number): LifecycleZone[] {
  const window = ACTIVE_ZONE_WINDOWS.includes(requestedWindow as ActiveZoneWindow) ? requestedWindow as ActiveZoneWindow : 10;
  const ordered = [...input].sort((a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime() || b.totalScore - a.totalScore);
  const activeDates = Array.from(new Set(ordered.map(zone => dateKey(zone.tradingDate)))).sort().slice(-window);
  const activeDateSet = new Set(activeDates);
  const groups: ZoneGroup[] = [];
  for (const zone of ordered.filter(item => activeDateSet.has(dateKey(item.tradingDate)))) {
    const matching = groups.find(group => group.zone.direction === zone.direction && rangeOverlap(group.zone, zone));
    if (matching) {
      const reinforced = reinforce(matching, zone, window);
      matching.zone = reinforced.zone;
      matching.sessions = reinforced.sessions;
    } else {
      const date = new Date(zone.tradingDate);
      groups.push({
        zone: {
          ...zone,
          tradingDate: date,
          reinforcementSessions: 1,
          lastReinforcedDate: date,
          activeWindowSessions: window,
          explanation: `${zone.explanation} Active window ${window} sessions; one verified session observed.`,
        },
        sessions: new Set([dateKey(date)]),
      });
    }
  }
  return groups.map(group => group.zone).sort((a, b) => b.totalScore - a.totalScore);
}

export function isActiveZoneWindow(value: number): value is ActiveZoneWindow {
  return ACTIVE_ZONE_WINDOWS.includes(value as ActiveZoneWindow);
}
