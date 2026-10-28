import "server-only";
import { Prisma, type Plan, type TaskKind } from "@prisma/client";
import { db } from "@/lib/db";
import { parseIsoDate, type NormalizedAnalysis } from "@/lib/ai/schema";
import { normalizeAnalysis } from "@/lib/ai/schema";
import { getSample } from "@/lib/samples";
import { todayInZurich } from "@/lib/deadlines";

export const FREE_MONTHLY_ANALYSES = 5;

/** Nombre d’analyses automatiques utilisées ce mois-ci (les exemples ne comptent pas). */
export async function analysesThisMonth(userId: string, now = new Date()): Promise<number> {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return db.document.count({ where: { userId, source: "UPLOAD", analyzedAt: { gte: start } } });
}

export function monthlyAllowance(plan: Plan): number {
  return plan === "PLUS" ? Infinity : FREE_MONTHLY_ANALYSES;
}

/** Applique une analyse à un document et crée les tâches correspondantes, dans une transaction. */
export async function applyAnalysis(documentId: string, userId: string, analysis: NormalizedAnalysis): Promise<void> {
  const dueDate = parseIsoDate(analysis.dueDate);
  const actions = analysis.actions.length
    ? analysis.actions
    : dueDate
      ? [{ kind: "OTHER" as const, title: "Traiter ce courrier", dueDate: analysis.dueDate, amount: null }]
      : [];

  await db.$transaction([
    db.document.update({
      where: { id: documentId, userId },
      data: {
        status: analysis.needsReview ? "NEEDS_REVIEW" : "ANALYZED",
        title: analysis.title,
        sender: analysis.sender,
        category: analysis.documentType,
        language: analysis.language,
        summary: analysis.summary,
        analysis: analysis as unknown as Prisma.InputJsonValue,
        amount: analysis.amount,
        currency: analysis.currency,
        dueDate,
        confidence: analysis.confidence.overall,
        errorMessage: null,
        analyzedAt: new Date(),
      },
    }),
    db.task.deleteMany({ where: { documentId, userId, status: "OPEN" } }),
    db.task.createMany({
      data: actions.map((a) => ({
        userId,
        documentId,
        title: a.title,
        kind: a.kind as TaskKind,
        dueDate: parseIsoDate(a.dueDate),
        amount: a.amount,
      })),
    }),
  ]);
}

export async function createSampleDocument(userId: string, sampleId: string): Promise<string | null> {
  const sample = getSample(sampleId);
  if (!sample) return null;
  const today = todayInZurich();
  const doc = await db.document.create({
    data: {
      userId,
      originalName: `exemple:${sample.id}`,
      mimeType: "text/plain",
      sizeBytes: 0,
      source: "SAMPLE",
      status: "PENDING",
      title: sample.label,
    },
  });
  await applyAnalysis(doc.id, userId, normalizeAnalysis(sample.analysis(today)));
  return doc.id;
}

/** Vue sérialisable de l’analyse stockée. Retourne null si le contenu est absent ou corrompu. */
export function storedAnalysis(value: Prisma.JsonValue | null): NormalizedAnalysis | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (typeof v.summary !== "string" || !Array.isArray(v.actions)) return null;
  return value as unknown as NormalizedAnalysis;
}
