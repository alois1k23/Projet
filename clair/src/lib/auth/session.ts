import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { User } from "@prisma/client";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "clair_session";
const SESSION_DAYS = 30;
const RENEW_BELOW_DAYS = 15;
const DAY_MS = 24 * 60 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * DAY_MS);
  await db.session.create({ data: { id: hashToken(token), userId, expiresAt } });
  await setCookie(token, expiresAt);
}

async function setCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && !process.env.CLAIR_INSECURE_COOKIES,
    path: "/",
    expires: expiresAt,
  });
}

/** Retourne l’utilisateur connecté, ou null. Mis en cache pour la durée d’une requête. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { id: hashToken(token) }, include: { user: true } });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  if (session.expiresAt.getTime() - Date.now() < RENEW_BELOW_DAYS * DAY_MS) {
    const expiresAt = new Date(Date.now() + SESSION_DAYS * DAY_MS);
    await db.session.update({ where: { id: session.id }, data: { expiresAt } });
    // Les cookies ne peuvent être modifiés que dans une action ou un gestionnaire de route.
    await setCookie(token, expiresAt).catch(() => undefined);
  }
  return session.user;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}
