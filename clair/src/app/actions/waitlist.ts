"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { mailLimiter } from "@/lib/rate-limit";
import { getLocale } from "@/i18n/server";
import { siteMessages } from "@/i18n/site";
import type { FormState } from "./types";

const Email = z.string().trim().toLowerCase().max(254).pipe(z.email());
const INTERESTS = ["plus", "news"] as const;

/** Liste d'attente Clair Plus. Aucun e-mail n'est envoyé à l'inscription ; l'adresse sert uniquement à annoncer le lancement. */
export async function joinWaitlist(_prev: FormState, formData: FormData): Promise<FormState> {
  const locale = await getLocale();
  const w = siteMessages[locale].waitlist;
  const raw = String(formData.get("email") ?? "");
  const parsed = Email.safeParse(raw);
  if (!parsed.success) return { fieldErrors: { email: w.invalid }, values: { email: raw } };
  const interest = INTERESTS.find((i) => i === formData.get("interest")) ?? "plus";
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!mailLimiter.attempt(`waitlist:${ip}`).allowed) return { error: w.tooMany, values: { email: raw } };
  await db.waitlistEntry.upsert({
    where: { email_interest: { email: parsed.data, interest } },
    create: { email: parsed.data, interest, locale },
    update: { locale },
  });
  // Même réponse que l'adresse soit nouvelle ou déjà inscrite.
  return { success: w.done };
}
