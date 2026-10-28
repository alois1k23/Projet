"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, PASSWORD_MIN_LENGTH, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { loginLimiter } from "@/lib/rate-limit";
import type { FormState } from "./types";
import { getLocale, getT } from "@/i18n/server";
import { fieldErrorsFrom } from "@/i18n/issues";

const email = z.string().trim().toLowerCase().pipe(z.email("invalidEmail"));

const SignupSchema = z.object({
  email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, "passwordMin")
    .max(128, "passwordMax"),
});

const LoginSchema = z.object({ email, password: z.string().min(1, "enterPassword").max(128) });

async function clientKey(emailValue: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return `${ip}:${emailValue}`;
}

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { email: String(formData.get("email") ?? "") };
  const t = await getT();
  const parsed = SignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues, t), values };
  const { email: address, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email: address }, select: { id: true } });
  if (existing) return { fieldErrors: { email: t.auth.accountExists }, values };

  const user = await db.user.create({ data: { email: address, passwordHash: await hashPassword(password), locale: await getLocale() } });
  await createSession(user.id);
  redirect("/accueil?bienvenue=1");
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { email: String(formData.get("email") ?? "") };
  const t = await getT();
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues, t), values };
  const { email: address, password } = parsed.data;

  const key = await clientKey(address);
  const limit = loginLimiter.attempt(key);
  if (!limit.allowed) {
    return { error: t.auth.tooManyAttempts(Math.ceil(limit.retryAfterMs / 60_000)), values };
  }

  const user = await db.user.findUnique({ where: { email: address } });
  // Même message dans les deux cas pour ne pas révéler l’existence d’un compte.
  if (!user || !user.passwordHash || !(await verifyPassword(user.passwordHash, password))) {
    return { error: t.auth.wrongCredentials, values };
  }
  loginLimiter.reset(key);
  await createSession(user.id);
  redirect("/accueil");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/connexion");
}
