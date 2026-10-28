import type { SupportedMime } from "@/lib/ai/analyzer";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

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

export type UploadCheck = { ok: true; mimeType: SupportedMime } | { ok: false; error: string };

export function checkUpload(bytes: Buffer): UploadCheck {
  if (bytes.length === 0) return { ok: false, error: "Le fichier est vide." };
  if (bytes.length > MAX_UPLOAD_BYTES) return { ok: false, error: "Le fichier dépasse 10 Mo. Réduisez la taille de la photo ou du PDF." };
  const mimeType = sniffMime(bytes);
  if (!mimeType) {
    return { ok: false, error: "Format non pris en charge. Utilisez une photo JPEG, PNG ou WebP, ou un PDF. Sur iPhone, réglez l’appareil photo sur « Le plus compatible »." };
  }
  return { ok: true, mimeType };
}

/** Nettoie un nom de fichier pour l’affichage et l’en-tête Content-Disposition. */
export function safeFileName(name: string): string {
  const cleaned = name.normalize("NFC").replace(/[^\p{L}\p{N}._ -]+/gu, "_").trim();
  return (cleaned || "document").slice(0, 120);
}
