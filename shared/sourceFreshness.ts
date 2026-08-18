export type SourceFreshness = "current" | "stale" | "no-data";

export function getSourceFreshness(latestDate: Date | null, now = new Date()): SourceFreshness {
  if (!latestDate) return "no-data";
  const ageDays = Math.floor((now.getTime() - latestDate.getTime()) / (24 * 60 * 60 * 1000));
  return ageDays <= 3 ? "current" : "stale";
}
