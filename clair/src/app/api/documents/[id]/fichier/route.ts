import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { safeFileName } from "@/lib/files";
import { storage } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Non autorisé", { status: 401 });
  const { id } = await params;
  const doc = await db.document.findFirst({ where: { id, userId: user.id }, select: { storageKey: true, mimeType: true, originalName: true } });
  if (!doc?.storageKey) return new Response("Introuvable", { status: 404 });
  const content = await storage().get(doc.storageKey);
  return new Response(new Uint8Array(content), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(safeFileName(doc.originalName))}`,
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
