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
import type { FormState } from "./types";

const Email = z.string().trim().toLowerCase().pipe(z.email("Adresse e-mail invalide."));
const NewPassword = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`)
  .max(128, "Le mot de passe est trop long.");

/** Même réponse que l'adresse existe ou non : on ne révèle jamais qui a un compte. */
const SENT = "C’est envoyé. Ouvrez l’e-mail et cliquez sur le lien (pensez à regarder dans les indésirables).";

async function canSend(email: string): Promise<boolean> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return mailLimiter.attempt(`mail:${email}`).allowed && mailLimiter.attempt(`ip:${ip}`).allowed;
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = Email.safeParse(formData.get("email"));
  if (!parsed.success) return { fieldErrors: { email: "Adresse e-mail invalide." }, values: { email: String(formData.get("email") ?? "") } };
  const mailer = getMailer();
  if (!mailer) return { error: "L’envoi d’e-mails n’est pas encore disponible. Contactez-nous pour récupérer votre compte." };
  if (!(await canSend(parsed.data))) return { error: "Trop de demandes. Réessayez dans une heure." };

  const user = await db.user.findUnique({ where: { email: parsed.data }, select: { id: true } });
  if (user) {
    const token = await createAuthToken(parsed.data, "PASSWORD_RESET");
    await mailer.send({ to: parsed.data, ...passwordResetEmail(`${env().CLAIR_APP_URL}/reinitialiser?jeton=${token}`) });
  }
  return { success: SENT };
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = NewPassword.safeParse(formData.get("password"));
  if (!password.success) return { fieldErrors: { password: password.error.issues[0]!.message } };
  const email = await consumeAuthToken(String(formData.get("token") ?? ""), "PASSWORD_RESET");
  if (!email) return { error: "Ce lien n’est plus valable. Demandez-en un nouveau." };
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { error: "Ce lien n’est plus valable. Demandez-en un nouveau." };

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
  const parsed = Email.safeParse(formData.get("email"));
  if (!parsed.success) return { fieldErrors: { email: "Adresse e-mail invalide." }, values: { email: String(formData.get("email") ?? "") } };
  const mailer = getMailer();
  if (!mailer) return { error: "L’envoi d’e-mails n’est pas encore disponible. Utilisez votre mot de passe." };
  if (!(await canSend(parsed.data))) return { error: "Trop de demandes. Réessayez dans une heure." };

  const exists = (await db.user.count({ where: { email: parsed.data } })) > 0;
  const token = await createAuthToken(parsed.data, "LOGIN");
  await mailer.send({ to: parsed.data, ...loginLinkEmail(`${env().CLAIR_APP_URL}/connexion/verifier?jeton=${token}`, !exists) });
  return { success: SENT };
}

/** Confirmation explicite (bouton) : les antivirus de messagerie qui ouvrent les liens ne consomment pas le jeton. */
export async function confirmLoginLink(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = await consumeAuthToken(String(formData.get("token") ?? ""), "LOGIN");
  if (!email) return { error: "Ce lien n’est plus valable. Demandez-en un nouveau." };
  let user = await db.user.findUnique({ where: { email } });
  const created = !user;
  if (!user) user = await db.user.create({ data: { email } });
  await createSession(user.id);
  redirect(created ? "/accueil?bienvenue=1" : "/accueil");
}

/** Définir (compte sans mot de passe) ou changer son mot de passe depuis les réglages. */
export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  const next = NewPassword.safeParse(formData.get("newPassword"));
  if (!next.success) return { fieldErrors: { newPassword: next.error.issues[0]!.message } };
  if (user.passwordHash && !(await verifyPassword(user.passwordHash, String(formData.get("currentPassword") ?? "")))) {
    return { fieldErrors: { currentPassword: "Mot de passe actuel incorrect." } };
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next.data) } });
  return { success: user.passwordHash ? "Mot de passe modifié." : "Mot de passe enregistré. Vous pouvez maintenant l’utiliser pour vous connecter." };
}
