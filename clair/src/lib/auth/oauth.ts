import "server-only";
import { Apple, Google } from "arctic";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export type OAuthProvider = "google" | "apple";

export interface OAuthProfile {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
}

const ISSUERS: Record<OAuthProvider, string[]> = {
  google: ["https://accounts.google.com", "accounts.google.com"],
  apple: ["https://appleid.apple.com"],
};

export class OAuthError extends Error {}

/**
 * Le jeton d'identité est reçu directement du serveur du fournisseur (TLS, avec notre secret client) :
 * OpenID Connect autorise alors à ne pas vérifier sa signature, mais on contrôle émetteur, destinataire et expiration.
 */
export function profileFromIdToken(provider: OAuthProvider, claims: Record<string, unknown>, clientId: string, now = Date.now(), appleUser?: string | null): OAuthProfile {
  if (!ISSUERS[provider].includes(String(claims.iss))) throw new OAuthError("Émetteur inattendu");
  const aud = claims.aud;
  if (!(aud === clientId || (Array.isArray(aud) && aud.includes(clientId)))) throw new OAuthError("Destinataire inattendu");
  if (typeof claims.exp !== "number" || claims.exp * 1000 <= now) throw new OAuthError("Jeton expiré");
  if (typeof claims.sub !== "string" || !claims.sub) throw new OAuthError("Identifiant manquant");

  const email = typeof claims.email === "string" ? claims.email.trim().toLowerCase() : null;
  const verified = claims.email_verified === true || claims.email_verified === "true";
  let name = typeof claims.name === "string" ? claims.name : null;
  if (provider === "apple" && appleUser) {
    // Apple n'envoie le nom qu'à la première connexion, à part, dans le champ « user ».
    try {
      const parsed = JSON.parse(appleUser) as { name?: { firstName?: string; lastName?: string } };
      name = [parsed.name?.firstName, parsed.name?.lastName].filter(Boolean).join(" ") || name;
    } catch {
      /* champ facultatif */
    }
  }
  return { provider, providerAccountId: claims.sub, email, emailVerified: verified, name: name?.slice(0, 100) ?? null };
}

/**
 * Retrouve ou crée l'utilisateur. Un compte existant n'est rattaché que si le fournisseur a vérifié l'adresse e-mail.
 */
export async function signInWithOAuth(profile: OAuthProfile): Promise<{ userId: string; created: boolean }> {
  const linked = await db.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider: profile.provider, providerAccountId: profile.providerAccountId } },
  });
  if (linked) return { userId: linked.userId, created: false };
  if (!profile.email || !profile.emailVerified) throw new OAuthError("Adresse e-mail non vérifiée par le fournisseur");

  const existing = await db.user.findUnique({ where: { email: profile.email } });
  if (existing) {
    await db.oAuthAccount.create({ data: { provider: profile.provider, providerAccountId: profile.providerAccountId, userId: existing.id } });
    if (!existing.name && profile.name) await db.user.update({ where: { id: existing.id }, data: { name: profile.name } });
    return { userId: existing.id, created: false };
  }
  const user = await db.user.create({
    data: { email: profile.email, name: profile.name, oauthAccounts: { create: { provider: profile.provider, providerAccountId: profile.providerAccountId } } },
  });
  return { userId: user.id, created: true };
}

export function googleClient(): { client: Google; clientId: string } | null {
  const id = process.env.CLAIR_GOOGLE_CLIENT_ID;
  const secret = process.env.CLAIR_GOOGLE_CLIENT_SECRET;
  if (!id || !secret) return null;
  return { client: new Google(id, secret, `${env().CLAIR_APP_URL}/api/auth/google/callback`), clientId: id };
}

export function appleClient(): { client: Apple; clientId: string } | null {
  const e = process.env;
  if (!e.CLAIR_APPLE_CLIENT_ID || !e.CLAIR_APPLE_TEAM_ID || !e.CLAIR_APPLE_KEY_ID || !e.CLAIR_APPLE_PRIVATE_KEY) return null;
  // Clé privée .p8 (PKCS#8) au format PEM, les retours à la ligne pouvant être écrits « \n ».
  const pem = e.CLAIR_APPLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const der = Buffer.from(pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, ""), "base64");
  return {
    client: new Apple(e.CLAIR_APPLE_CLIENT_ID, e.CLAIR_APPLE_TEAM_ID, e.CLAIR_APPLE_KEY_ID, new Uint8Array(der), `${env().CLAIR_APP_URL}/api/auth/apple/callback`),
    clientId: e.CLAIR_APPLE_CLIENT_ID,
  };
}
