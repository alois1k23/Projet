import { createHash, randomBytes } from "node:crypto";
import type { AuthTokenPurpose } from "@prisma/client";
import { db } from "@/lib/db";

export const TOKEN_TTL_MINUTES: Record<AuthTokenPurpose, number> = { LOGIN: 15, PASSWORD_RESET: 60 };

const hash = (raw: string) => createHash("sha256").update(raw).digest("hex");

/** Crée un jeton à usage unique et retourne sa valeur en clair (à envoyer par e-mail, jamais stockée). */
export async function createAuthToken(email: string, purpose: AuthTokenPurpose, now = new Date()): Promise<string> {
  const raw = randomBytes(32).toString("base64url");
  await db.authToken.create({
    data: { id: hash(raw), email, purpose, expiresAt: new Date(now.getTime() + TOKEN_TTL_MINUTES[purpose] * 60_000) },
  });
  return raw;
}

/** Vérifie un jeton sans le consommer (affichage de la page de confirmation). */
export async function peekAuthToken(raw: string, purpose: AuthTokenPurpose, now = new Date()): Promise<string | null> {
  if (!raw || raw.length > 100) return null;
  const token = await db.authToken.findUnique({ where: { id: hash(raw) } });
  if (!token || token.purpose !== purpose || token.usedAt || token.expiresAt <= now) return null;
  return token.email;
}

/** Consomme un jeton de façon atomique : un même lien ne peut servir qu'une fois, même en cas de double clic. */
export async function consumeAuthToken(raw: string, purpose: AuthTokenPurpose, now = new Date()): Promise<string | null> {
  if (!raw || raw.length > 100) return null;
  const id = hash(raw);
  const { count } = await db.authToken.updateMany({ where: { id, purpose, usedAt: null, expiresAt: { gt: now } }, data: { usedAt: now } });
  if (count !== 1) return null;
  const token = await db.authToken.findUniqueOrThrow({ where: { id } });
  return token.email;
}

/** Nettoyage des jetons expirés (appelé par la tâche quotidienne). */
export async function purgeExpiredTokens(now = new Date()): Promise<number> {
  const { count } = await db.authToken.deleteMany({ where: { expiresAt: { lt: new Date(now.getTime() - 24 * 3600_000) } } });
  return count;
}
