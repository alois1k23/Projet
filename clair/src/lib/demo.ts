import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { storage } from "@/lib/storage";
import { createSampleDocument } from "@/lib/documents";
import { SAMPLES } from "@/lib/samples";
import type { Locale } from "@/i18n/config";

/** Durée de vie d'un compte de démonstration. */
export const DEMO_TTL_MS = 24 * 60 * 60 * 1000;
/** Domaine réservé (RFC 2606) : aucune adresse de démo ne peut recevoir d'e-mail. */
export const DEMO_EMAIL_DOMAIN = "demo.clair.invalid";

export function demoEnabled(): boolean {
  return env().CLAIR_DEMO === "1";
}

const PROFILE: Record<Locale, { name: string; addressLine: string; postalCode: string; city: string }> = {
  fr: { name: "Sophie Martin", addressLine: "Rue du Lac 12", postalCode: "1003", city: "Lausanne" },
  de: { name: "Lukas Meier", addressLine: "Seestrasse 12", postalCode: "8002", city: "Zürich" },
};

/** Crée un compte éphémère déjà rempli avec les courriers d'exemple. */
export async function createDemoAccount(locale: Locale, now = new Date()): Promise<string> {
  await purgeExpiredDemos(now);
  const user = await db.user.create({
    data: {
      email: `demo-${randomBytes(8).toString("hex")}@${DEMO_EMAIL_DOMAIN}`,
      locale,
      demoExpiresAt: new Date(now.getTime() + DEMO_TTL_MS),
      ...PROFILE[locale],
    },
  });
  for (const sample of SAMPLES) await createSampleDocument(user.id, sample.id, locale);
  return user.id;
}

/** Supprime les comptes de démonstration expirés et leurs fichiers. */
export async function purgeExpiredDemos(now = new Date()): Promise<number> {
  const expired = await db.user.findMany({ where: { demoExpiresAt: { lt: now } }, select: { id: true } });
  for (const { id } of expired) {
    await storage().removeAllForUser(id);
    await db.user.delete({ where: { id } });
  }
  return expired.length;
}
