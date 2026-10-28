/**
 * Préparation des photos dans le navigateur, avant l'envoi :
 * - conversion des formats que le serveur n'accepte pas (HEIC des iPhone) en JPEG ;
 * - réduction des grandes photos (envoi plus rapide sur mobile, analyse moins coûteuse).
 * Les PDF et les images déjà légères sont envoyés tels quels.
 */

export const MAX_DIMENSION = 2400;
const RECOMPRESS_ABOVE_BYTES = 1.5 * 1024 * 1024;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp"]);

export function needsPreparation(file: { type: string; size: number; name: string }): boolean {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) return false;
  const isImage = file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name);
  if (!isImage) return false;
  return !ACCEPTED.has(file.type) || file.size > RECOMPRESS_ABOVE_BYTES;
}

/** Calcule les dimensions réduites en gardant les proportions. */
export function targetSize(width: number, height: number, max = MAX_DIMENSION): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export function jpegName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "") || "courrier";
  return `${base}.jpg`;
}

/** Retourne un fichier prêt à l'envoi, ou le fichier d'origine si le navigateur ne sait pas le décoder. */
export async function prepareImage(file: File): Promise<File> {
  if (!needsPreparation(file)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = targetSize(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) return file;
    return new File([blob], jpegName(file.name), { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}
