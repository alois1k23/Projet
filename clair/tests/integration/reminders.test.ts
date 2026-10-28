import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { sendDueReminders, type ReminderMessage } from "@/lib/reminders";

beforeEach(async () => {
  await db.user.deleteMany();
});
afterAll(async () => {
  await db.user.deleteMany();
  await db.$disconnect();
});

describe("rappels d'échéances", () => {
  it("regroupe les rappels par utilisateur et ne les envoie qu'une fois", async () => {
    const user = await db.user.create({ data: { email: "rappel@example.ch", passwordHash: "x", name: "Sophie Martin" } });
    const d = (s: string) => new Date(`${s}T00:00:00Z`);
    await db.task.createMany({
      data: [
        { userId: user.id, title: "Payer la facture", dueDate: d("2026-10-30"), amount: 186.45 },
        { userId: user.id, title: "Former opposition", dueDate: d("2026-10-29") },
        { userId: user.id, title: "Lointain", dueDate: d("2026-12-01") },
        { userId: user.id, title: "Déjà fait", dueDate: d("2026-10-29"), status: "DONE" },
      ],
    });
    const sent: ReminderMessage[] = [];
    const notifier = { send: async (m: ReminderMessage) => void sent.push(m) };
    const now = new Date("2026-10-28T06:00:00Z");

    expect(await sendDueReminders(notifier, "https://app.example", now)).toBe(2);
    expect(sent).toHaveLength(1);
    expect(sent[0]!.to).toBe("rappel@example.ch");
    expect(sent[0]!.subject).toBe("Rappel : 2 échéances approchent");
    expect(sent[0]!.text).toContain("Bonjour Sophie");
    expect(sent[0]!.text).toContain("CHF 186.45");
    expect(sent[0]!.text).toContain("https://app.example/echeances");

    expect(await sendDueReminders(notifier, "https://app.example", now)).toBe(0);
    expect(sent).toHaveLength(1);
  });
});
