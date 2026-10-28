"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, PASSWORD_MIN_LENGTH, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { loginLimiter } from "@/lib/rate-limit";
import type { FormState } from "./types";

const email = z.string().trim().toLowerCase().pipe(z.email("Adresse e-mail invalide."));

const SignupSchema = z.object({
  email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`)
    .max(128, "Le mot de passe est trop long."),
});

const LoginSchema = z.object({ email, password: z.string().min(1, "Saisissez votre mot de passe.").max(128) });

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

async function clientKey(emailValue: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return `${ip}:${emailValue}`;
}

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { email: String(formData.get("email") ?? "") };
  const parsed = SignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };
  const { email: address, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email: address }, select: { id: true } });
  if (existing) return { fieldErrors: { email: "Un compte existe déjà avec cette adresse. Connectez-vous." }, values };

  const user = await db.user.create({ data: { email: address, passwordHash: await hashPassword(password) } });
  await createSession(user.id);
  redirect("/accueil?bienvenue=1");
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { email: String(formData.get("email") ?? "") };
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };
  const { email: address, password } = parsed.data;

  const key = await clientKey(address);
  const limit = loginLimiter.attempt(key);
  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterMs / 60_000);
    return { error: `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`, values };
  }

  const user = await db.user.findUnique({ where: { email: address } });
  // Même message dans les deux cas pour ne pas révéler l’existence d’un compte.
  if (!user || !(await verifyPassword(user.passwordHash, password))) {
    return { error: "E-mail ou mot de passe incorrect.", values };
  }
  loginLimiter.reset(key);
  await createSession(user.id);
  redirect("/accueil");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/connexion");
}
