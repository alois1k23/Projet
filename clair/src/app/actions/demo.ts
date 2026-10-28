"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth/session";
import { createDemoAccount, demoEnabled } from "@/lib/demo";
import { demoLimiter } from "@/lib/rate-limit";
import { storage } from "@/lib/storage";
import { getLocale } from "@/i18n/server";

/** Ouvre un compte de démonstration pré-rempli, sans e-mail ni mot de passe. */
export async function startDemo(): Promise<void> {
  if (!demoEnabled()) redirect("/?demo=indisponible");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!demoLimiter.attempt(`demo:${ip}`).allowed) redirect("/?demo=limite");
  const current = await getCurrentUser();
  if (current?.demoExpiresAt) redirect("/accueil");
  const userId = await createDemoAccount(await getLocale());
  await createSession(userId);
  redirect("/accueil");
}

/** Quitte la démo : le compte temporaire est effacé, puis on propose de créer un vrai compte. */
export async function endDemo(): Promise<void> {
  const user = await getCurrentUser();
  if (user?.demoExpiresAt) {
    await destroySession();
    await storage().removeAllForUser(user.id);
    await db.user.delete({ where: { id: user.id } });
  }
  redirect("/inscription");
}
