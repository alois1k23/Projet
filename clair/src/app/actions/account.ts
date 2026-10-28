"use server";

import { revalidateAppPages } from "@/lib/revalidate";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { destroySession, requireUser } from "@/lib/auth/session";
import { storage } from "@/lib/storage";
import type { FormState } from "./types";
import { getT } from "@/i18n/server";
import { fieldErrorsFrom } from "@/i18n/issues";

const ProfileSchema = z.object({
  name: z.string().trim().max(100),
  addressLine: z.string().trim().max(120),
  postalCode: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4,5}$/.test(v), "npa"),
  city: z.string().trim().max(80),
});

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const t = await getT();
  const parsed = ProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues, t), values: Object.fromEntries([...formData].map(([k, v]) => [k, String(v)])) };
  }
  const { name, addressLine, postalCode, city } = parsed.data;
  await db.user.update({ where: { id: user.id }, data: { name: name || null, addressLine: addressLine || null, postalCode: postalCode || null, city: city || null } });
  revalidateAppPages();
  return { success: t.settings.saved };
}

/** Supprime définitivement le compte, les documents chiffrés et toutes les données associées. */
export async function deleteAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const confirmation = String(formData.get("confirmEmail") ?? "").trim().toLowerCase();
  if (confirmation !== user.email) return { fieldErrors: { confirmEmail: (await getT()).settings.confirmMismatch } };

  await storage().removeAllForUser(user.id);
  await db.user.delete({ where: { id: user.id } });
  await destroySession();
  redirect("/?compte-supprime=1");
}
