export type DirectionFilter = "All" | "Potential Accumulation" | "Potential Distribution" | "Neutral";
export type ConfidenceFilter = "All" | "High" | "Medium" | "Low";

export function filterZones(zones: any[], direction: DirectionFilter, confidence: ConfidenceFilter) {
  return zones.filter((entry) => (direction === "All" || entry.zone?.direction === direction) && (confidence === "All" || entry.zone?.confidence === confidence));
}
