import { fr } from "@/i18n/fr";
import type { Messages } from "@/i18n/messages";

export type Urgency = "overdue" | "today" | "soon" | "later" | "none";

const DAY_MS = 86_400_000;

/** Début du jour (UTC) : les échéances sont des dates sans heure. */
export function startOfDayUtc(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Date du jour en Suisse, exprimée comme date UTC à minuit. */
export function todayInZurich(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return new Date(`${parts}T00:00:00.000Z`);
}

/** Heure actuelle (0–23) en Suisse. */
export function zurichHour(now = new Date()): number {
  const part = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "Europe/Zurich" }).formatToParts(now).find((p) => p.type === "hour");
  return Number(part?.value ?? 12);
}

export function daysUntil(due: Date, today: Date): number {
  return Math.round((startOfDayUtc(due).getTime() - startOfDayUtc(today).getTime()) / DAY_MS);
}

export function urgencyOf(due: Date | null, today: Date): Urgency {
  if (!due) return "none";
  const d = daysUntil(due, today);
  if (d < 0) return "overdue";
  if (d === 0) return "today";
  if (d <= 7) return "soon";
  return "later";
}

export function relativeLabel(due: Date | null, today: Date, r: Messages["relative"] = fr.relative): string {
  if (!due) return r.none;
  const d = daysUntil(due, today);
  if (d < -1) return r.overdueDays(-d);
  if (d === -1) return r.overdueOne;
  if (d === 0) return r.today;
  if (d === 1) return r.tomorrow;
  if (d <= 30) return r.inDays(d);
  return r.inWeeks(Math.round(d / 7));
}

export interface Dated {
  dueDate: Date | null;
}

export interface Grouped<T> {
  overdue: T[];
  week: T[];
  later: T[];
  undated: T[];
}

/** Regroupe et trie les tâches ouvertes pour l’écran d’accueil. */
export function groupByUrgency<T extends Dated>(items: T[], today: Date): Grouped<T> {
  const sorted = [...items].sort((a, b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity));
  const groups: Grouped<T> = { overdue: [], week: [], later: [], undated: [] };
  for (const item of sorted) {
    const u = urgencyOf(item.dueDate, today);
    if (u === "overdue") groups.overdue.push(item);
    else if (u === "today" || u === "soon") groups.week.push(item);
    else if (u === "later") groups.later.push(item);
    else groups.undated.push(item);
  }
  return groups;
}

/** Une tâche doit-elle faire l’objet d’un rappel aujourd’hui ? */
export function shouldRemind(task: { dueDate: Date | null; remindedAt: Date | null; status: string }, today: Date, leadDays = 3): boolean {
  if (task.status !== "OPEN" || !task.dueDate || task.remindedAt) return false;
  const d = daysUntil(task.dueDate, today);
  return d <= leadDays && d >= -1;
}
