"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, getCurrentUser } from "@/lib/auth/session";
import { hashPassword, PASSWORD_MIN_LENGTH, verifyPassword } from "@/lib/auth/password";
import { consumeAuthToken, createAuthToken } from "@/lib/auth/tokens";
import { getMailer } from "@/lib/mail";
import { loginLinkEmail, passwordResetEmail } from "@/lib/mail/templates";
import { mailLimiter } from "@/lib/rate-limit";
import { env } from "@/lib/env";
import { isLocale } from "@/i18n/config";
import type { FormState } from "./types";
import { getLocale, getT } from "@/i18n/server";

const Email = z.string().trim().toLowerCase().pipe(z.email("invalidEmail"));
const NewPassword = z
  .string()
  .min(PASSWORD_MIN_LENGTH, "passwordMin")
  .max(128, "passwordMax");

function passwordError(code: string, t: Awaited<ReturnType<typeof getT>>): string {
  return code === "passwordMin" ? t.validation.passwordMin(PASSWORD_MIN_LENGTH) : t.validation.passwordMax;
}


async function canSend(email: string): Promise<boolean> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return mailLimiter.attempt(`mail:${email}`).allowed && mailLimiter.attempt(`ip:${ip}`).allowed;
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const t = await getT();
  const parsed = Email.safeParse(formData.get("email"));
  if (!parsed.success) return { fieldErrors: { email: t.validation.invalidEmail }, values: { email: String(formData.get("email") ?? "") } };
  const mailer = getMailer();
  if (!mailer) return { error: t.auth.mailUnavailableReset };
  if (!(await canSend(parsed.data))) return { error: t.auth.tooManyRequests };

  const user = await db.user.findUnique({ where: { email: parsed.data }, select: { id: true, locale: true } });
  if (user) {
    const token = await createAuthToken(parsed.data, "PASSWORD_RESET");
    const locale = isLocale(user.locale) ? user.locale : await getLocale();
    await mailer.send({ to: parsed.data, ...passwordResetEmail(`${env().CLAIR_APP_URL}/reinitialiser?jeton=${token}`, locale) });
  }
  // Même réponse que l'adresse existe ou non : on ne révèle jamais qui a un compte.
  return { success: t.auth.sent };
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const t = await getT();
  const password = NewPassword.safeParse(formData.get("password"));
  if (!password.success) return { fieldErrors: { password: passwordError(password.error.issues[0]!.message, t) } };
  const email = await consumeAuthToken(String(formData.get("token") ?? ""), "PASSWORD_RESET");
  if (!email) return { error: t.auth.linkInvalid };
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { error: t.auth.linkInvalid };

  // Un nouveau mot de passe déconnecte toutes les autres sessions.
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password.data) } }),
    db.session.deleteMany({ where: { userId: user.id } }),
  ]);
  await createSession(user.id);
  redirect("/accueil?mot-de-passe=1");
}

/** Lien de connexion sans mot de passe. Fonctionne aussi pour créer un compte. */
export async function requestLoginLink(_prev: FormState, formData: FormData): Promise<FormState> {
  const t = await getT();
  const parsed = Email.safeParse(formData.get("email"));
  if (!parsed.success) return { fieldErrors: { email: t.validation.invalidEmail }, values: { email: String(formData.get("email") ?? "") } };
  const mailer = getMailer();
  if (!mailer) return { error: t.auth.mailUnavailableLink };
  if (!(await canSend(parsed.data))) return { error: t.auth.tooManyRequests };

  const existing = await db.user.findUnique({ where: { email: parsed.data }, select: { locale: true } });
  const locale = existing && isLocale(existing.locale) ? existing.locale : await getLocale();
  const token = await createAuthToken(parsed.data, "LOGIN");
  await mailer.send({ to: parsed.data, ...loginLinkEmail(`${env().CLAIR_APP_URL}/connexion/verifier?jeton=${token}`, !existing, locale) });
  return { success: t.auth.sent };
}

/** Confirmation explicite (bouton) : les antivirus de messagerie qui ouvrent les liens ne consomment pas le jeton. */
export async function confirmLoginLink(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = await consumeAuthToken(String(formData.get("token") ?? ""), "LOGIN");
  if (!email) return { error: (await getT()).auth.linkInvalid };
  let user = await db.user.findUnique({ where: { email } });
  const created = !user;
  if (!user) user = await db.user.create({ data: { email, locale: await getLocale() } });
  await createSession(user.id);
  redirect(created ? "/accueil?bienvenue=1" : "/accueil");
}

/** Définir (compte sans mot de passe) ou changer son mot de passe depuis les réglages. */
export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  const t = await getT();
  const next = NewPassword.safeParse(formData.get("newPassword"));
  if (!next.success) return { fieldErrors: { newPassword: passwordError(next.error.issues[0]!.message, t) } };
  if (user.passwordHash && !(await verifyPassword(user.passwordHash, String(formData.get("currentPassword") ?? "")))) {
    return { fieldErrors: { currentPassword: t.settings.wrongCurrent } };
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next.data) } });
  return { success: user.passwordHash ? t.settings.passwordChanged : t.settings.passwordDefined };
}
