import { db } from "@/lib/db";
import { shouldRemind, todayInZurich } from "@/lib/deadlines";
import { formatDate, formatMoney, toNumber } from "@/lib/format";
import type { Mailer } from "@/lib/mail";
import { reminderEmail } from "@/lib/mail/templates";
import { isLocale } from "@/i18n/config";

export interface ReminderMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/** Canal d'envoi des rappels. Seul le journal est implémenté : un fournisseur d'e-mail reste à brancher. */
export interface Notifier {
  send(message: ReminderMessage): Promise<void>;
}

/** Envoi des rappels par e-mail avec le service configuré (SMTP en production). */
export function mailNotifier(mailer: Mailer): Notifier {
  return { send: (m) => mailer.send({ to: m.to, subject: m.subject, text: m.text, html: m.html ?? m.text }) };
}

export const logNotifier: Notifier = {
  async send(message) {
    console.log(`[rappel] à ${message.to} : ${message.subject}\n${message.text}\n`);
  },
};

/** Envoie un rappel par utilisateur pour les échéances proches, puis les marque comme rappelées. */
export async function sendDueReminders(notifier: Notifier, appUrl: string, now = new Date()): Promise<number> {
  const today = todayInZurich(now);
  const horizon = new Date(today.getTime() + 3 * 86_400_000);
  const candidates = await db.task.findMany({
    where: { status: "OPEN", remindedAt: null, dueDate: { lte: horizon }, user: { demoExpiresAt: null } },
    include: { user: { select: { email: true, name: true, locale: true } } },
  });
  const due = candidates.filter((t) => shouldRemind(t, today));
  const byUser = new Map<string, typeof due>();
  for (const task of due) byUser.set(task.userId, [...(byUser.get(task.userId) ?? []), task]);

  for (const tasks of byUser.values()) {
    const user = tasks[0]!.user;
    const locale = isLocale(user.locale) ? user.locale : "fr";
    const lines = tasks.map((t) => `• ${t.title} – ${formatDate(t.dueDate, locale)}${toNumber(t.amount) !== null ? ` – ${formatMoney(toNumber(t.amount))}` : ""}`);
    const email = reminderEmail(user.name?.split(" ")[0] ?? null, lines, `${appUrl}/echeances`, tasks[0]!.title, tasks.length, locale);
    await notifier.send({ to: user.email, subject: email.subject, text: email.text, html: email.html });
    await db.task.updateMany({ where: { id: { in: tasks.map((t) => t.id) } }, data: { remindedAt: now } });
  }
  return due.length;
}
