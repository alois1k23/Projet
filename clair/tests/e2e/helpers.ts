import { randomBytes } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

let counter = 0;

export function uniqueEmail(prefix = "test") {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}@example.ch`;
}

export const PASSWORD = "une phrase secrète solide";

export async function signup(page: Page, email = uniqueEmail()) {
  await page.goto("/inscription");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Choisissez un mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Créer mon compte gratuit" }).click();
  await expect(page).toHaveURL(/\/accueil/);
  return email;
}

/** Échoue en cas de violation d'accessibilité grave ou critique (WCAG 2.1 A/AA). */
export async function expectAccessible(page: Page) {
  // Mesure l'état final, sans l'animation d'apparition qui réduit temporairement l'opacité.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
  const results = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]["page"] }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length} élément(s)) ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
}

/**
 * Compare la largeur du contenu à celle de l'écran configuré. En émulation mobile, un contenu trop large
 * agrandit la fenêtre de mise en page : comparer à `window.innerWidth` ne détecterait rien.
 */
export async function expectNoHorizontalScroll(page: Page) {
  const screenWidth = page.viewportSize()!.width;
  const contentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(contentWidth - screenWidth, `défilement horizontal sur ${page.url()}`).toBeLessThanOrEqual(0);
}

/** PNG de bruit aléatoire (incompressible), pour simuler une photo lourde. */
export function noisePng(width: number, height: number): Buffer {
  const table = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc32 = (buf: Buffer) => {
    let crc = 0xffffffff;
    for (const byte of buf) crc = table[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const rows: Buffer[] = [];
  for (let y = 0; y < height; y++) rows.push(Buffer.concat([Buffer.from([0]), randomBytes(width * 3)]));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(Buffer.concat(rows), { level: 1 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const OUTBOX = path.join(os.tmpdir(), "clair-e2e-storage", "outbox.jsonl");

/** Derniers e-mails « envoyés » à une adresse par le serveur de test (transport fichier). */
export function emailsTo(to: string): { subject: string; text: string; html: string }[] {
  if (!existsSync(OUTBOX)) return [];
  return readFileSync(OUTBOX, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .filter((m) => m.to === to);
}

export function linkIn(text: string): string {
  const match = text.match(/https?:\/\/\S+jeton=[A-Za-z0-9_-]+/);
  if (!match) throw new Error("Aucun lien dans l’e-mail");
  return match[0];
}
