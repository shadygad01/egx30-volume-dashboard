export type CairoTimeParts = { hour: number; minute: number };

export function isWithinCairoCloseWindow({ hour, minute }: CairoTimeParts): boolean {
  return (hour === 14 && minute >= 30) || hour === 15;
}

export function getCairoTimeParts(date: Date): CairoTimeParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? NaN);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? NaN);
  return { hour, minute };
}
