import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { safeFileName } from "@/lib/files";
import { storage } from "@/lib/storage";

/** Sert une page déchiffrée d’un courrier, uniquement à son propriétaire. `?page=2` pour la deuxième page. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Non autorisé", { status: 401 });
  const { id } = await params;
  const position = Number(new URL(request.url).searchParams.get("page") ?? "1");
  if (!Number.isInteger(position) || position < 1) return new Response("Page invalide", { status: 400 });
  const file = await db.documentFile.findFirst({ where: { position, document: { id, userId: user.id } }, include: { document: { select: { originalName: true } } } });
  if (!file) return new Response("Introuvable", { status: 404 });
  const content = await storage().get(file.storageKey);
  const ext = file.mimeType === "application/pdf" ? "pdf" : file.mimeType.split("/")[1];
  const name = safeFileName(`${file.document.originalName.replace(/\.[^.]+$/, "")}-page-${position}.${ext}`);
  return new Response(new Uint8Array(content), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
