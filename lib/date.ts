const TIME_ZONE = "Asia/Seoul";

export function todayDateString(): string {
  return dateStringFor(new Date());
}

export function dateStringFor(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function formatTime(d: Date | null): string {
  if (!d) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function hoursBetween(start: Date | null, end: Date | null): number {
  if (!start || !end) return 0;
  return Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
}

export function formatDateHeading(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 3)); // noon-ish KST, avoids DST edge cases
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: TIME_ZONE,
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}
