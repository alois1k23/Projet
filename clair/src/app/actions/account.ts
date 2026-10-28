"use server";

import { revalidateAppPages } from "@/lib/revalidate";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { destroySession, requireUser } from "@/lib/auth/session";
import { storage } from "@/lib/storage";
import type { FormState } from "./types";

const ProfileSchema = z.object({
  name: z.string().trim().max(100),
  addressLine: z.string().trim().max(120),
  postalCode: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4,5}$/.test(v), "NPA invalide (4 chiffres en Suisse)."),
  city: z.string().trim().max(80),
});

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = ProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { fieldErrors, values: Object.fromEntries([...formData].map(([k, v]) => [k, String(v)])) };
  }
  const { name, addressLine, postalCode, city } = parsed.data;
  await db.user.update({ where: { id: user.id }, data: { name: name || null, addressLine: addressLine || null, postalCode: postalCode || null, city: city || null } });
  revalidateAppPages();
  return { success: "Profil enregistré." };
}

/** Supprime définitivement le compte, les documents chiffrés et toutes les données associées. */
export async function deleteAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const confirmation = String(formData.get("confirmEmail") ?? "").trim().toLowerCase();
  if (confirmation !== user.email) return { fieldErrors: { confirmEmail: "Saisissez exactement l’adresse e-mail de votre compte." } };

  await storage().removeAllForUser(user.id);
  await db.user.delete({ where: { id: user.id } });
  await destroySession();
  redirect("/?compte-supprime=1");
}
