import { readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { consumeAuthToken, createAuthToken, peekAuthToken, purgeExpiredTokens } from "@/lib/auth/tokens";
import { FileMailer } from "@/lib/mail";
import { layout, loginLinkEmail, passwordResetEmail } from "@/lib/mail/templates";

beforeEach(async () => {
  await db.authToken.deleteMany();
});
afterAll(async () => {
  await db.authToken.deleteMany();
  await db.$disconnect();
});

describe("jetons à usage unique", () => {
  it("ne stocke que le hachage et ne sert qu’une fois", async () => {
    const raw = await createAuthToken("a@example.ch", "LOGIN");
    const stored = await db.authToken.findFirstOrThrow();
    expect(stored.id).not.toBe(raw);
    expect(stored.id).toMatch(/^[a-f0-9]{64}$/);
    expect(await peekAuthToken(raw, "LOGIN")).toBe("a@example.ch");
    expect(await peekAuthToken(raw, "LOGIN")).toBe("a@example.ch");
    expect(await consumeAuthToken(raw, "LOGIN")).toBe("a@example.ch");
    expect(await consumeAuthToken(raw, "LOGIN")).toBeNull();
    expect(await peekAuthToken(raw, "LOGIN")).toBeNull();
  });

  it("refuse un jeton expiré, d’un autre usage ou inventé", async () => {
    const past = new Date(Date.now() - 2 * 3600_000);
    const expired = await createAuthToken("b@example.ch", "PASSWORD_RESET", past);
    expect(await consumeAuthToken(expired, "PASSWORD_RESET")).toBeNull();
    const reset = await createAuthToken("b@example.ch", "PASSWORD_RESET");
    expect(await consumeAuthToken(reset, "LOGIN")).toBeNull();
    expect(await consumeAuthToken(reset, "PASSWORD_RESET")).toBe("b@example.ch");
    expect(await consumeAuthToken("inventé", "LOGIN")).toBeNull();
    expect(await consumeAuthToken("x".repeat(500), "LOGIN")).toBeNull();
  });

  it("deux consommations simultanées : une seule réussit", async () => {
    const raw = await createAuthToken("c@example.ch", "LOGIN");
    const results = await Promise.all([consumeAuthToken(raw, "LOGIN"), consumeAuthToken(raw, "LOGIN"), consumeAuthToken(raw, "LOGIN")]);
    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it("purge les jetons expirés depuis plus d’un jour", async () => {
    await createAuthToken("d@example.ch", "LOGIN", new Date(Date.now() - 3 * 24 * 3600_000));
    await createAuthToken("d@example.ch", "LOGIN");
    expect(await purgeExpiredTokens()).toBe(1);
    expect(await db.authToken.count()).toBe(1);
  });
});

describe("e-mails", () => {
  it("le transport fichier écrit une ligne JSON par e-mail", async () => {
    const file = path.join(os.tmpdir(), `clair-outbox-${process.pid}.jsonl`);
    await rm(file, { force: true });
    const mailer = new FileMailer(file);
    await mailer.send({ to: "x@example.ch", ...loginLinkEmail("https://app.example/connexion/verifier?jeton=abc", true) });
    await mailer.send({ to: "y@example.ch", ...passwordResetEmail("https://app.example/reinitialiser?jeton=def") });
    const lines = (await readFile(file, "utf8")).trim().split("\n").map((l) => JSON.parse(l));
    expect(lines).toHaveLength(2);
    expect(lines[0].subject).toBe("Bienvenue dans Clair");
    expect(lines[0].text).toContain("https://app.example/connexion/verifier?jeton=abc");
    expect(lines[1].html).toContain("Choisir un nouveau mot de passe");
  });

  it("échappe le HTML des contenus", () => {
    const mail = layout({ title: "<script>", intro: ["a & b"], button: { label: "Go", url: "https://x.example/?a=1&b=\"2\"" } });
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).toContain("&lt;script&gt;");
    expect(mail.html).toContain("a &amp; b");
    expect(mail.html).toContain("&quot;2&quot;");
  });
});
