import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";

/** Export complet des données personnelles (droit à la portabilité, nLPD art. 28 / RGPD art. 20). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Non autorisé", { status: 401 });
  const [documents, tasks, letters] = await Promise.all([
    db.document.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    db.task.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    db.letter.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
  ]);
  const files = await Promise.all(
    documents.map(async (d) => (d.storageKey ? { documentId: d.id, mimeType: d.mimeType, base64: (await storage().get(d.storageKey)).toString("base64") } : null)),
  );
  const payload = {
    exportedAt: new Date().toISOString(),
    format: "clair-export-v1",
    profile: { email: user.email, name: user.name, addressLine: user.addressLine, postalCode: user.postalCode, city: user.city, plan: user.plan, createdAt: user.createdAt },
    documents: documents.map(({ storageKey: _key, userId: _user, ...d }) => d),
    files: files.filter(Boolean),
    tasks: tasks.map(({ userId: _user, ...t }) => t),
    letters: letters.map(({ userId: _user, ...l }) => l),
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="clair-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
