import type { SupportedMime } from "@/lib/ai/analyzer";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
/** Taille totale maximale d’un courrier, toutes pages confondues. */
export const MAX_TOTAL_BYTES = 25 * 1024 * 1024;

/**
 * Détermine le type réel d’un fichier à partir de ses premiers octets.
 * Le type déclaré par le navigateur n’est jamais utilisé seul.
 */
export function sniffMime(bytes: Buffer): SupportedMime | null {
  if (bytes.length < 12) return null;
  if (bytes.subarray(0, 5).toString("latin1") === "%PDF-") return "application/pdf";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (bytes.subarray(0, 4).toString("latin1") === "RIFF" && bytes.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  if (bytes.subarray(0, 6).toString("latin1") === "GIF87a" || bytes.subarray(0, 6).toString("latin1") === "GIF89a") return "image/gif";
  return null;
}

export type UploadError = "fileEmpty" | "fileOver10" | "fileFormat";
export type UploadCheck = { ok: true; mimeType: SupportedMime } | { ok: false; error: UploadError };

/** Vérifie un fichier téléversé. Les erreurs sont des clés de traduction (`upload.*`). */
export function checkUpload(bytes: Buffer): UploadCheck {
  if (bytes.length === 0) return { ok: false, error: "fileEmpty" };
  if (bytes.length > MAX_UPLOAD_BYTES) return { ok: false, error: "fileOver10" };
  const mimeType = sniffMime(bytes);
  if (!mimeType) return { ok: false, error: "fileFormat" };
  return { ok: true, mimeType };
}

/** Nettoie un nom de fichier pour l’affichage et l’en-tête Content-Disposition. */
export function safeFileName(name: string): string {
  const cleaned = name.normalize("NFC").replace(/[^\p{L}\p{N}._ -]+/gu, "_").trim();
  return (cleaned || "document").slice(0, 120);
}
