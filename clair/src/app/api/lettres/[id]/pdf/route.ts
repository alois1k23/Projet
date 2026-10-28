import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { renderLetterPdf } from "@/lib/letters/pdf";
import { placeAndDate, senderBlock, type LetterLanguage } from "@/lib/letters/templates";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Non autorisé", { status: 401 });
  const { id } = await params;
  const letter = await db.letter.findFirst({ where: { id, userId: user.id } });
  if (!letter) return new Response("Introuvable", { status: 404 });
  const sender = { name: user.name ?? user.email, addressLine: user.addressLine, postalCode: user.postalCode, city: user.city };
  const pdf = await renderLetterPdf({
    sender: senderBlock(sender),
    recipient: letter.recipient,
    placeAndDate: placeAndDate(sender, letter.createdAt, letter.language as LetterLanguage),
    subject: letter.subject,
    body: letter.body,
    signatureName: sender.name,
  });
  const name = `lettre-${letter.createdAt.toISOString().slice(0, 10)}.pdf`;
  return new Response(new Uint8Array(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "private, no-store" },
  });
}
