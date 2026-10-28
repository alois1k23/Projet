import { mkdtemp, readFile, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { decrypt, encrypt } from "@/lib/crypto";
import { EncryptedDiskStorage } from "@/lib/storage";
import { RateLimiter } from "@/lib/rate-limit";
import { checkUpload, safeFileName, sniffMime } from "@/lib/files";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const key = Buffer.alloc(32, 1);

describe("chiffrement AES-256-GCM", () => {
  it("restitue exactement le contenu d'origine", () => {
    const plain = Buffer.from("Avis de taxation 2025 – CHF 1'240.50");
    expect(decrypt(encrypt(plain, key), key).equals(plain)).toBe(true);
  });

  it("produit un chiffré différent à chaque fois (IV aléatoire)", () => {
    const plain = Buffer.from("même contenu");
    expect(encrypt(plain, key).equals(encrypt(plain, key))).toBe(false);
  });

  it("refuse un contenu altéré", () => {
    const payload = encrypt(Buffer.from("facture"), key);
    payload[payload.length - 1]! ^= 0xff;
    expect(() => decrypt(payload, key)).toThrow();
  });

  it("refuse une mauvaise clé", () => {
    const payload = encrypt(Buffer.from("facture"), key);
    expect(() => decrypt(payload, Buffer.alloc(32, 2))).toThrow();
  });

  it("refuse une clé de mauvaise taille", () => {
    expect(() => encrypt(Buffer.from("x"), Buffer.alloc(16))).toThrow(/32 octets/);
  });
});

describe("stockage chiffré sur disque", () => {
  it("écrit un fichier illisible en clair et le relit", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "clair-storage-"));
    const store = new EncryptedDiskStorage(root, key);
    const content = Buffer.from("%PDF-1.7 contenu confidentiel");
    const k = await store.put("user_1", content);
    const raw = await readFile(path.join(root, k));
    expect(raw.includes(Buffer.from("confidentiel"))).toBe(false);
    expect((await store.get(k)).equals(content)).toBe(true);
    await store.remove(k);
    await expect(store.get(k)).rejects.toThrow();
  });

  it("supprime tous les fichiers d'un utilisateur", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "clair-storage-"));
    const store = new EncryptedDiskStorage(root, key);
    await store.put("user_2", Buffer.from("a"));
    await store.put("user_2", Buffer.from("b"));
    await store.removeAllForUser("user_2");
    expect(await readdir(root)).toEqual([]);
  });

  it("rejette les clés qui tentent de sortir du dossier", async () => {
    const store = new EncryptedDiskStorage(os.tmpdir(), key);
    await expect(store.get("../etc/passwd")).rejects.toThrow();
    await expect(store.get("user/../../x.bin")).rejects.toThrow();
    await expect(store.put("../evil", Buffer.from("x"))).rejects.toThrow();
  });
});

describe("validation des fichiers téléversés", () => {
  const pad = (b: number[]) => Buffer.concat([Buffer.from(b), Buffer.alloc(16)]);
  it("reconnaît les formats par leur signature", () => {
    expect(sniffMime(Buffer.concat([Buffer.from("%PDF-1.7"), Buffer.alloc(16)]))).toBe("application/pdf");
    expect(sniffMime(pad([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffMime(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(sniffMime(Buffer.concat([Buffer.from("RIFF\0\0\0\0WEBP"), Buffer.alloc(8)]))).toBe("image/webp");
  });

  it("refuse un fichier déguisé (exécutable nommé .pdf)", () => {
    expect(sniffMime(pad([0x4d, 0x5a, 0x90, 0x00]))).toBeNull();
    const result = checkUpload(pad([0x4d, 0x5a]));
    expect(result.ok).toBe(false);
  });

  it("refuse les fichiers vides ou trop lourds", () => {
    expect(checkUpload(Buffer.alloc(0))).toMatchObject({ ok: false });
    expect(checkUpload(Buffer.concat([Buffer.from("%PDF-"), Buffer.alloc(11 * 1024 * 1024)]))).toMatchObject({ ok: false });
  });

  it("nettoie les noms de fichiers", () => {
    expect(safeFileName('../../facture "QR".pdf')).toBe(".._.._facture _QR_.pdf");
    expect(safeFileName("Décompte été.png")).toBe("Décompte été.png");
    expect(safeFileName("")).toBe("document");
  });
});

describe("mots de passe", () => {
  it("hache avec Argon2id et vérifie", async () => {
    const hashed = await hashPassword("une phrase secrète");
    expect(hashed.startsWith("$argon2id$")).toBe(true);
    expect(await verifyPassword(hashed, "une phrase secrète")).toBe(true);
    expect(await verifyPassword(hashed, "mauvais")).toBe(false);
    expect(await verifyPassword("pas-un-hash", "x")).toBe(false);
  });
});

describe("limiteur de tentatives", () => {
  it("bloque au-delà de la limite puis se réinitialise après la fenêtre", () => {
    let now = 0;
    const limiter = new RateLimiter(2, 1000, () => now);
    expect(limiter.attempt("a").allowed).toBe(true);
    expect(limiter.attempt("a").allowed).toBe(true);
    const blocked = limiter.attempt("a");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(1000);
    expect(limiter.attempt("b").allowed).toBe(true);
    now = 1001;
    expect(limiter.attempt("a").allowed).toBe(true);
  });
});
