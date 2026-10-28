"use server";

import { revalidateAppPages } from "@/lib/revalidate";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { storage } from "@/lib/storage";
import { checkUpload, safeFileName } from "@/lib/files";
import { AnalysisError, getAnalyzer, type SupportedMime } from "@/lib/ai/analyzer";
import { DOCUMENT_TYPES, parseIsoDate } from "@/lib/ai/schema";
import { analysesThisMonth, applyAnalysis, createSampleDocument, monthlyAllowance } from "@/lib/documents";
import { analysisLimiter } from "@/lib/rate-limit";
import type { FormState } from "./types";

type AnalyzeOutcome = "analyzed" | "manual" | "failed";

/** Lance l’analyse d’un document déjà enregistré et met à jour son statut. */
async function analyzeDocument(documentId: string, userId: string, content: Buffer, mimeType: SupportedMime, fileName: string): Promise<AnalyzeOutcome> {
  const analyzer = getAnalyzer();
  if (!analyzer) {
    await db.document.update({ where: { id: documentId }, data: { status: "MANUAL" } });
    return "manual";
  }
  const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { plan: true } });
  if ((await analysesThisMonth(userId)) >= monthlyAllowance(user.plan)) {
    await db.document.update({
      where: { id: documentId },
      data: { status: "MANUAL", errorMessage: "Vous avez utilisé vos analyses automatiques de ce mois. Le courrier est enregistré : complétez les informations vous-même." },
    });
    return "manual";
  }
  if (!analysisLimiter.attempt(userId).allowed) {
    await db.document.update({ where: { id: documentId }, data: { status: "FAILED", errorMessage: "Trop d’analyses en peu de temps. Réessayez dans une heure." } });
    return "failed";
  }
  try {
    const analysis = await analyzer.analyze({ content, mimeType, fileName });
    await applyAnalysis(documentId, userId, analysis);
    return "analyzed";
  } catch (error) {
    const message = error instanceof AnalysisError ? error.message : "L’analyse a échoué de façon inattendue.";
    if (!(error instanceof AnalysisError)) console.error("Analyse impossible", error);
    await db.document.update({ where: { id: documentId }, data: { status: "FAILED", errorMessage: message } });
    return "failed";
  }
}

export async function uploadDocument(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choisissez une photo ou un PDF de votre courrier." };

  const bytes = Buffer.from(await file.arrayBuffer());
  const check = checkUpload(bytes);
  if (!check.ok) return { error: check.error };

  const key = await storage().put(user.id, bytes);
  const name = safeFileName(file.name || "courrier");
  const doc = await db.document.create({
    data: { userId: user.id, originalName: name, mimeType: check.mimeType, sizeBytes: bytes.length, storageKey: key, title: "Nouveau courrier" },
  });

  const outcome = await analyzeDocument(doc.id, user.id, bytes, check.mimeType, name);
  revalidateAppPages();
  redirect(outcome === "manual" ? `/courriers/${doc.id}?saisie=1` : `/courriers/${doc.id}`);
}

export async function retryAnalysis(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("documentId") ?? "");
  const doc = await db.document.findFirst({ where: { id, userId: user.id } });
  if (!doc || !doc.storageKey) redirect("/courriers");
  const content = await storage().get(doc.storageKey);
  await db.document.update({ where: { id: doc.id }, data: { status: "PENDING", errorMessage: null } });
  await analyzeDocument(doc.id, user.id, content, doc.mimeType as SupportedMime, doc.originalName);
  revalidateAppPages();
  redirect(`/courriers/${doc.id}`);
}

export async function addSample(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = await createSampleDocument(user.id, String(formData.get("sampleId") ?? ""));
  revalidateAppPages();
  redirect(id ? `/courriers/${id}` : "/courriers");
}

const UpdateSchema = z.object({
  documentId: z.string().min(1),
  title: z.string().trim().min(1, "Donnez un titre au courrier.").max(120),
  sender: z.string().trim().max(120).optional(),
  category: z.enum(DOCUMENT_TYPES).optional(),
  amount: z
    .string()
    .trim()
    .transform((v) => v.replace(/['’\s]/g, "").replace(",", "."))
    .refine((v) => v === "" || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) <= 10_000_000), "Montant invalide (exemple : 186.45).")
    .optional(),
  dueDate: z
    .string()
    .trim()
    .refine((v) => v === "" || parseIsoDate(v) !== null, "Date invalide.")
    .optional(),
  summary: z.string().trim().max(1200).optional(),
});

/** Saisie manuelle ou correction des informations extraites. */
export async function updateDocument(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = UpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { fieldErrors, values: Object.fromEntries([...formData].map(([k, v]) => [k, String(v)])) };
  }
  const d = parsed.data;
  const doc = await db.document.findFirst({ where: { id: d.documentId, userId: user.id }, include: { tasks: true } });
  if (!doc) return { error: "Courrier introuvable." };

  const amount = d.amount ? Number(d.amount) : null;
  const dueDate = d.dueDate ? parseIsoDate(d.dueDate) : null;
  await db.$transaction(async (tx) => {
    await tx.document.update({
      where: { id: doc.id },
      data: {
        title: d.title,
        sender: d.sender || null,
        category: d.category ?? doc.category,
        amount,
        currency: amount !== null ? (doc.currency ?? "CHF") : null,
        dueDate,
        summary: d.summary || doc.summary,
        status: doc.analysis ? "ANALYZED" : "MANUAL",
        errorMessage: null,
      },
    });
    if (dueDate && doc.tasks.length === 0) {
      await tx.task.create({ data: { userId: user.id, documentId: doc.id, title: amount ? "Payer ce courrier" : "Traiter ce courrier", kind: amount ? "PAY" : "OTHER", dueDate, amount } });
    }
  });
  revalidateAppPages();
  redirect(`/courriers/${doc.id}`);
}

export async function deleteDocument(formData: FormData): Promise<void> {
  const user = await requireUser();
  const doc = await db.document.findFirst({ where: { id: String(formData.get("documentId") ?? ""), userId: user.id } });
  if (doc) {
    await db.document.delete({ where: { id: doc.id } });
    if (doc.storageKey) await storage().remove(doc.storageKey);
  }
  revalidateAppPages();
  redirect("/courriers?supprime=1");
}
