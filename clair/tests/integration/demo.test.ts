import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { createDemoAccount, DEMO_EMAIL_DOMAIN, DEMO_TTL_MS, purgeExpiredDemos } from "@/lib/demo";
import { sendDueReminders, type ReminderMessage } from "@/lib/reminders";

beforeEach(async () => {
  await db.user.deleteMany();
});
afterAll(async () => {
  await db.user.deleteMany();
  await db.$disconnect();
});

describe("mode démo", () => {
  it("crée un compte temporaire, sans vraie adresse, déjà rempli", async () => {
    const now = new Date("2026-10-28T10:00:00Z");
    const id = await createDemoAccount("fr", now);
    const user = await db.user.findUniqueOrThrow({ where: { id }, include: { documents: true, tasks: true } });
    expect(user.email.endsWith(`@${DEMO_EMAIL_DOMAIN}`)).toBe(true);
    expect(user.passwordHash).toBeNull();
    expect(user.demoExpiresAt?.getTime()).toBe(now.getTime() + DEMO_TTL_MS);
    expect(user.name).toBe("Sophie Martin");
    expect(user.documents).toHaveLength(3);
    expect(user.documents.every((d) => d.status === "ANALYZED" || d.status === "NEEDS_REVIEW")).toBe(true);
    expect(user.tasks.length).toBeGreaterThan(2);
  });

  it("remplit la démo dans la langue du visiteur", async () => {
    const id = await createDemoAccount("de");
    const docs = await db.document.findMany({ where: { userId: id } });
    expect(docs.some((d) => d.title?.includes("Zahlungsbefehl"))).toBe(true);
    expect((await db.user.findUniqueOrThrow({ where: { id } })).locale).toBe("de");
  });

  it("efface uniquement les démos expirées, avec leurs données", async () => {
    // La création d'une démo purge déjà les anciennes : on crée la récente en premier.
    const recent = await createDemoAccount("fr", new Date("2026-10-28T09:00:00Z"));
    const old = await createDemoAccount("fr", new Date("2026-10-01T10:00:00Z"));
    const real = await db.user.create({ data: { email: "vrai@example.ch" } });
    expect(await purgeExpiredDemos(new Date("2026-10-28T10:00:00Z"))).toBe(1);
    expect(await db.user.findUnique({ where: { id: old } })).toBeNull();
    expect(await db.document.count({ where: { userId: old } })).toBe(0);
    expect(await db.user.findUnique({ where: { id: recent } })).not.toBeNull();
    expect(await db.user.findUnique({ where: { id: real.id } })).not.toBeNull();
  });

  it("n'envoie jamais de rappel à un compte de démo", async () => {
    const id = await createDemoAccount("fr", new Date("2026-10-28T06:00:00Z"));
    await db.task.create({ data: { userId: id, title: "Demain", dueDate: new Date("2026-10-29T00:00:00Z") } });
    const sent: ReminderMessage[] = [];
    await sendDueReminders({ send: async (m) => void sent.push(m) }, "https://app.example", new Date("2026-10-28T07:00:00Z"));
    expect(sent).toHaveLength(0);
  });
});
