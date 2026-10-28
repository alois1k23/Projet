"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale, LOCALE_COOKIE } from "@/i18n/config";
import { revalidateAppPages } from "@/lib/revalidate";

/** Change la langue : cookie pour tous les visiteurs, et profil pour les utilisateurs connectés (e-mails, rappels). */
export async function setLocale(formData: FormData): Promise<void> {
  const locale = formData.get("locale");
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true });
  const user = await getCurrentUser();
  if (user) await db.user.update({ where: { id: user.id }, data: { locale } });
  revalidateAppPages();
}
