"use server";

import { revalidateAppPages } from "@/lib/revalidate";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { buildLetter, getTemplate, validateFields, type LetterLanguage } from "@/lib/letters/templates";
import type { FormState } from "./types";
import { z } from "zod";

const SenderSchema = z.object({
  name: z.string().trim().min(1, "Indiquez votre nom.").max(100),
  addressLine: z.string().trim().min(1, "Indiquez votre rue.").max(120),
  postalCode: z.string().trim().regex(/^\d{4,5}$/, "NPA invalide (4 chiffres en Suisse)."),
  city: z.string().trim().min(1, "Indiquez votre localité.").max(80),
});

export async function createLetter(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const template = getTemplate(String(formData.get("templateId") ?? ""));
  if (!template) return { error: "Modèle de lettre inconnu." };
  const language: LetterLanguage = formData.get("language") === "de" ? "de" : "fr";

  const values: Record<string, string> = {};
  for (const field of template.fields) values[field.key] = String(formData.get(field.key) ?? "");
  const errors = validateFields(template, values);
  if (Object.keys(errors).length > 0) return { fieldErrors: errors, error: "Complétez les champs signalés." };

  // Coordonnées saisies dans le formulaire de lettre : validées puis enregistrées dans le profil.
  if (formData.has("senderName")) {
    const sender = SenderSchema.safeParse({
      name: formData.get("senderName"),
      addressLine: formData.get("senderAddressLine"),
      postalCode: formData.get("senderPostalCode"),
      city: formData.get("senderCity"),
    });
    if (!sender.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of sender.error.issues) fieldErrors[`sender${String(issue.path[0]).replace(/^./, (c) => c.toUpperCase())}`] ??= issue.message;
      return { fieldErrors, error: "Complétez vos coordonnées." };
    }
    await db.user.update({ where: { id: user.id }, data: sender.data });
  }

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
