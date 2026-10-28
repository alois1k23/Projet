"use server";

import { revalidateAppPages } from "@/lib/revalidate";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { buildLetter, getTemplate, validateFields, type LetterLanguage } from "@/lib/letters/templates";
import type { FormState } from "./types";

export async function createLetter(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const template = getTemplate(String(formData.get("templateId") ?? ""));
  if (!template) return { error: "Modèle de lettre inconnu." };
  const language: LetterLanguage = formData.get("language") === "de" ? "de" : "fr";

  const values: Record<string, string> = {};
  for (const field of template.fields) values[field.key] = String(formData.get(field.key) ?? "");
  const errors = validateFields(template, values);
  if (Object.keys(errors).length > 0) return { fieldErrors: errors, error: "Complétez les champs signalés." };

  const documentId = String(formData.get("documentId") ?? "") || null;
  if (documentId) {
    const owned = await db.document.count({ where: { id: documentId, userId: user.id } });
    if (!owned) return { error: "Courrier introuvable." };
  }

  const draft = buildLetter(template, values, language);
  const letter = await db.letter.create({
    data: { userId: user.id, documentId, templateId: template.id, language, recipient: draft.recipient, subject: draft.subject, body: draft.body },
  });
  revalidateAppPages();
  redirect(`/lettres/${letter.id}`);
}

export async function deleteLetter(formData: FormData): Promise<void> {
  const user = await requireUser();
  await db.letter.deleteMany({ where: { id: String(formData.get("letterId") ?? ""), userId: user.id } });
  revalidateAppPages();
  redirect("/lettres");
}
