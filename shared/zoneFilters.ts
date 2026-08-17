export type DirectionFilter = "All" | "Potential Accumulation" | "Potential Distribution" | "Neutral";
export type ConfidenceFilter = "All" | "High" | "Medium" | "Low";

const directionOrder: Record<string, number> = { "Potential Accumulation": 0, "Potential Distribution": 1, Neutral: 2 };
const confidenceOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

export function filterZones(zones: any[], direction: DirectionFilter, confidence: ConfidenceFilter) {
  return zones.filter((entry) => (direction === "All" || entry.zone?.direction === direction) && (confidence === "All" || entry.zone?.confidence === confidence));
}

export function sortDirectionalZones(zones: any[]) {
  return zones.map((entry, sourceIndex) => ({ entry, sourceIndex })).sort((a, b) => {
    const aZone = a.entry.zone ?? {};
    const bZone = b.entry.zone ?? {};
    return (directionOrder[aZone.direction] ?? 2) - (directionOrder[bZone.direction] ?? 2)
      || (confidenceOrder[aZone.confidence] ?? 2) - (confidenceOrder[bZone.confidence] ?? 2)
      || (Number(bZone.totalScore) || 0) - (Number(aZone.totalScore) || 0)
      || a.sourceIndex - b.sourceIndex;
  }).map(({ entry }) => entry);
}
