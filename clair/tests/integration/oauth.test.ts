import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { OAuthError, profileFromIdToken, signInWithOAuth } from "@/lib/auth/oauth";

const now = Date.parse("2026-10-28T10:00:00Z");
const exp = now / 1000 + 600;
const google = (extra: Record<string, unknown> = {}) => ({ iss: "https://accounts.google.com", aud: "client-g", sub: "g-123", email: "Sophie@Example.ch", email_verified: true, name: "Sophie Martin", exp, ...extra });

beforeEach(async () => {
  await db.user.deleteMany();
});
afterAll(async () => {
  await db.user.deleteMany();
  await db.$disconnect();
});

describe("jeton d’identité", () => {
  it("accepte un jeton Google valide et normalise l’adresse", () => {
    expect(profileFromIdToken("google", google(), "client-g", now)).toEqual({
      provider: "google",
      providerAccountId: "g-123",
      email: "sophie@example.ch",
      emailVerified: true,
      name: "Sophie Martin",
    });
  });

  it("refuse un mauvais émetteur, un autre destinataire ou un jeton expiré", () => {
    expect(() => profileFromIdToken("google", google({ iss: "https://evil.example" }), "client-g", now)).toThrow(OAuthError);
    expect(() => profileFromIdToken("google", google({ aud: "autre-app" }), "client-g", now)).toThrow(OAuthError);
    expect(() => profileFromIdToken("google", google({ exp: now / 1000 - 1 }), "client-g", now)).toThrow(OAuthError);
    expect(() => profileFromIdToken("apple", google(), "client-g", now)).toThrow(OAuthError);
  });

  it("lit le nom envoyé à part par Apple à la première connexion", () => {
    const claims = { iss: "https://appleid.apple.com", aud: "ch.clair.web", sub: "a-1", email: "x@privaterelay.appleid.com", email_verified: "true", exp };
    const profile = profileFromIdToken("apple", claims, "ch.clair.web", now, JSON.stringify({ name: { firstName: "Marco", lastName: "Rossi" } }));
    expect(profile).toMatchObject({ emailVerified: true, name: "Marco Rossi" });
    expect(profileFromIdToken("apple", claims, "ch.clair.web", now, "{pas du json").name).toBeNull();
  });
});

describe("connexion par fournisseur", () => {
  const profile = { provider: "google" as const, providerAccountId: "g-1", email: "a@example.ch", emailVerified: true, name: "Anna" };

  it("crée un compte, puis le retrouve à la connexion suivante", async () => {
    const first = await signInWithOAuth(profile);
    expect(first.created).toBe(true);
    const again = await signInWithOAuth({ ...profile, email: "nouvelle@example.ch" });
    expect(again).toEqual({ userId: first.userId, created: false });
    expect((await db.user.findUniqueOrThrow({ where: { id: first.userId } })).passwordHash).toBeNull();
  });

  it("rattache un compte existant si l’adresse est vérifiée", async () => {
    const user = await db.user.create({ data: { email: "a@example.ch", passwordHash: "x" } });
    const result = await signInWithOAuth(profile);
    expect(result).toEqual({ userId: user.id, created: false });
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).name).toBe("Anna");
  });

  it("refuse une adresse non vérifiée par le fournisseur (pas de prise de contrôle de compte)", async () => {
    await db.user.create({ data: { email: "a@example.ch", passwordHash: "x" } });
    await expect(signInWithOAuth({ ...profile, emailVerified: false })).rejects.toThrow(OAuthError);
    expect(await db.oAuthAccount.count()).toBe(0);
  });
});
