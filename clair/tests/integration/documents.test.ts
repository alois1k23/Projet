import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { normalizeAnalysis } from "@/lib/ai/schema";
import { mockAnalysis } from "@/lib/ai/mock";
import { analysesThisMonth, applyAnalysis, createSampleDocument, FREE_MONTHLY_ANALYSES, monthlyAllowance, storedAnalysis } from "@/lib/documents";
import { storage } from "@/lib/storage";

async function makeUser(email = "test@example.ch") {
  return db.user.create({ data: { email, passwordHash: "x", name: "Test" } });
}

beforeEach(async () => {
  await db.user.deleteMany();
});

afterAll(async () => {
  await db.user.deleteMany();
  await db.$disconnect();
});

describe("applyAnalysis", () => {
  it("enregistre l'analyse et crée les tâches correspondantes", async () => {
    const user = await makeUser();
    const doc = await db.document.create({ data: { userId: user.id, originalName: "a.png", mimeType: "image/png", sizeBytes: 10, title: "Nouveau courrier" } });
    const analysis = normalizeAnalysis(mockAnalysis("prime.png", new Date("2026-10-28T00:00:00Z")));
    await applyAnalysis(doc.id, user.id, analysis);

    const saved = await db.document.findUniqueOrThrow({ where: { id: doc.id }, include: { tasks: true } });
    expect(saved.status).toBe("ANALYZED");
    expect(saved.title).toBe(analysis.title);
    expect(saved.amount?.toNumber()).toBe(438.2);
    expect(saved.dueDate?.toISOString().slice(0, 10)).toBe("2026-11-27");
    expect(saved.tasks.map((t) => t.kind).sort()).toEqual(["CANCEL", "CHECK"]);
    expect(storedAnalysis(saved.analysis)?.warnings).toHaveLength(1);
  });

  it("remplace les tâches ouvertes lors d'une nouvelle analyse, sans toucher aux tâches faites", async () => {
    const user = await makeUser();
    const doc = await db.document.create({ data: { userId: user.id, originalName: "a.png", mimeType: "image/png", sizeBytes: 10, title: "x" } });
    const analysis = normalizeAnalysis(mockAnalysis("prime.png", new Date("2026-10-28T00:00:00Z")));
    await applyAnalysis(doc.id, user.id, analysis);
    const first = await db.task.findFirstOrThrow({ where: { documentId: doc.id } });
    await db.task.update({ where: { id: first.id }, data: { status: "DONE" } });
    await applyAnalysis(doc.id, user.id, analysis);
    const tasks = await db.task.findMany({ where: { documentId: doc.id } });
    expect(tasks).toHaveLength(3);
    expect(tasks.filter((t) => t.status === "DONE")).toHaveLength(1);
  });

  it("marque le document « à vérifier » quand la confiance est faible", async () => {
    const user = await makeUser();
    const doc = await db.document.create({ data: { userId: user.id, originalName: "flou.png", mimeType: "image/png", sizeBytes: 10, title: "x" } });
    await applyAnalysis(doc.id, user.id, normalizeAnalysis(mockAnalysis("flou.png", new Date())));
    expect((await db.document.findUniqueOrThrow({ where: { id: doc.id } })).status).toBe("NEEDS_REVIEW");
  });

  it("refuse de modifier le document d'un autre utilisateur", async () => {
    const owner = await makeUser("a@example.ch");
    const intruder = await makeUser("b@example.ch");
    const doc = await db.document.create({ data: { userId: owner.id, originalName: "a.png", mimeType: "image/png", sizeBytes: 10, title: "x" } });
    await expect(applyAnalysis(doc.id, intruder.id, normalizeAnalysis(mockAnalysis("a", new Date())))).rejects.toThrow();
    expect((await db.document.findUniqueOrThrow({ where: { id: doc.id } })).status).toBe("PENDING");
  });
});

describe("quota d'analyses", () => {
  it("compte uniquement les analyses de documents réels du mois en cours", async () => {
    const user = await makeUser();
    const now = new Date("2026-10-28T12:00:00Z");
    await db.document.createMany({
      data: [
        { userId: user.id, originalName: "a", mimeType: "image/png", sizeBytes: 1, title: "a", analyzedAt: new Date("2026-10-02T00:00:00Z") },
        { userId: user.id, originalName: "b", mimeType: "image/png", sizeBytes: 1, title: "b", analyzedAt: new Date("2026-09-30T00:00:00Z") },
        { userId: user.id, originalName: "c", mimeType: "text/plain", sizeBytes: 0, title: "c", source: "SAMPLE", analyzedAt: new Date("2026-10-10T00:00:00Z") },
        { userId: user.id, originalName: "d", mimeType: "image/png", sizeBytes: 1, title: "d" },
      ],
    });
    expect(await analysesThisMonth(user.id, now)).toBe(1);
    expect(monthlyAllowance("FREE")).toBe(FREE_MONTHLY_ANALYSES);
    expect(monthlyAllowance("PLUS")).toBe(Infinity);
  });
});

describe("courriers d'exemple", () => {
  it("crée un exemple analysé avec ses tâches", async () => {
    const user = await makeUser();
    const id = await createSampleDocument(user.id, "commandement");
    const doc = await db.document.findUniqueOrThrow({ where: { id: id! }, include: { tasks: true } });
    expect(doc.source).toBe("SAMPLE");
    expect(doc.category).toBe("poursuite");
    expect(doc.tasks).toHaveLength(2);
    expect(await createSampleDocument(user.id, "inexistant")).toBeNull();
  });
});

describe("suppression du compte", () => {
  it("supprime en cascade documents, tâches, lettres, sessions et fichiers", async () => {
    const user = await makeUser();
    const key = await storage().put(user.id, Buffer.from("%PDF-1.7 secret"));
    const doc = await db.document.create({
      data: { userId: user.id, originalName: "a.pdf", mimeType: "application/pdf", sizeBytes: 10, title: "x", files: { create: [{ position: 1, storageKey: key, mimeType: "application/pdf", sizeBytes: 10 }] } },
    });
    await db.task.create({ data: { userId: user.id, documentId: doc.id, title: "Payer" } });
    await db.letter.create({ data: { userId: user.id, documentId: doc.id, templateId: "delai-paiement", language: "fr", recipient: "x", subject: "y", body: "z" } });
    await db.session.create({ data: { id: "hash", userId: user.id, expiresAt: new Date(Date.now() + 1000) } });

    await storage().removeAllForUser(user.id);
    await db.user.delete({ where: { id: user.id } });

    expect(await db.document.count()).toBe(0);
    expect(await db.task.count()).toBe(0);
    expect(await db.letter.count()).toBe(0);
    expect(await db.session.count()).toBe(0);
    expect(await db.documentFile.count()).toBe(0);
    await expect(storage().get(key)).rejects.toThrow();
  });
});
