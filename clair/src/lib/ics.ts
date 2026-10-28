export interface CalendarItem {
  id: string;
  title: string;
  dueDate: Date;
  description?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const dateValue = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Échappe le texte selon RFC 5545 (§ 3.3.11). */
export function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Coupe les lignes à 75 octets comme l’exige RFC 5545 (§ 3.1). */
export function foldLine(line: string): string {
  const out: string[] = [];
  let current = "";
  for (const char of line) {
    if (Buffer.byteLength(current + char, "utf8") > 75) {
      out.push(current);
      current = " " + char;
    } else current += char;
  }
  out.push(current);
  return out.join("\r\n");
}

/** Calendrier iCalendar d’événements « journée entière » avec une alarme 2 jours avant. */
export function buildCalendar(items: CalendarItem[], now = new Date()): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Clair//Echeances//FR", "CALSCALE:GREGORIAN", "X-WR-CALNAME:Clair – échéances"];
  for (const item of items) {
    const next = new Date(item.dueDate.getTime() + 86_400_000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${item.id}@clair.app`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART;VALUE=DATE:${dateValue(item.dueDate)}`,
      `DTEND;VALUE=DATE:${dateValue(next)}`,
      `SUMMARY:${escapeText(item.title)}`,
      ...(item.description ? [`DESCRIPTION:${escapeText(item.description)}`] : []),
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeText(item.title)}`,
      "TRIGGER:-P2D",
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
