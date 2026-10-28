import { db } from "@/lib/db";
import { shouldRemind, todayInZurich } from "@/lib/deadlines";
import { formatDate, formatMoney, toNumber } from "@/lib/format";

export interface ReminderMessage {
  to: string;
  subject: string;
  text: string;
}

/** Canal d'envoi des rappels. Seul le journal est implémenté : un fournisseur d'e-mail reste à brancher. */
export interface Notifier {
  send(message: ReminderMessage): Promise<void>;
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
    where: { status: "OPEN", remindedAt: null, dueDate: { lte: horizon } },
    include: { user: { select: { email: true, name: true } } },
  });
  const due = candidates.filter((t) => shouldRemind(t, today));
  const byUser = new Map<string, typeof due>();
  for (const task of due) byUser.set(task.userId, [...(byUser.get(task.userId) ?? []), task]);

  for (const tasks of byUser.values()) {
    const user = tasks[0]!.user;
    const lines = tasks.map((t) => `• ${t.title} – ${formatDate(t.dueDate)}${toNumber(t.amount) !== null ? ` – ${formatMoney(toNumber(t.amount))}` : ""}`);
    await notifier.send({
      to: user.email,
      subject: tasks.length === 1 ? `Rappel : ${tasks[0]!.title}` : `Rappel : ${tasks.length} échéances approchent`,
      text: `Bonjour${user.name ? ` ${user.name.split(" ")[0]}` : ""},\n\n${lines.join("\n")}\n\nVoir dans Clair : ${appUrl}/echeances`,
    });
    await db.task.updateMany({ where: { id: { in: tasks.map((t) => t.id) } }, data: { remindedAt: now } });
  }
  return due.length;
}
