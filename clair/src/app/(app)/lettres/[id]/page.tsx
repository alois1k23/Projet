import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { placeAndDate, senderBlock, type LetterLanguage } from "@/lib/letters/templates";
import { deleteLetter } from "@/app/actions/letters";
import { Card, PageHeader, buttonClass } from "@/components/ui";
import { ConfirmSubmit, CopyButton } from "@/components/client";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).letters.title };
}

export default async function LetterPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const letter = await db.letter.findFirst({ where: { id, userId: user.id } });
  if (!letter) notFound();
  const sender = { name: user.name ?? "", addressLine: user.addressLine, postalCode: user.postalCode, city: user.city };
  const lang = letter.language as LetterLanguage;
  const L = (await getT()).letters;
  const fullText = [senderBlock(sender), "", letter.recipient, "", placeAndDate(sender, letter.createdAt, lang), "", letter.subject, "", letter.body, "", sender.name].join("\n");

  return (
    <div className="animate-rise">
      <Link href="/lettres" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> {L.title}
      </Link>
      <PageHeader
        title={L.readyTitle}
        subtitle={L.readySubtitle}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <a href={`/api/lettres/${letter.id}/pdf`} className={buttonClass("primary")}>
          <Download className="size-4" aria-hidden="true" /> {L.downloadPdf}
        </a>
        <CopyButton value={fullText} label={L.copyText} variant="secondary" />
      </div>
      <Card className="mx-auto max-w-2xl bg-white p-8 font-[Helvetica,Arial,sans-serif] text-[14px] leading-relaxed text-[#14181f] sm:p-12">
        <p className="whitespace-pre-line text-xs">{senderBlock(sender)}</p>
        <p className="mt-8 ml-auto w-1/2 whitespace-pre-line">{letter.recipient}</p>
        <p className="mt-8">{placeAndDate(sender, letter.createdAt, lang)}</p>
        <p className="mt-5 font-bold">{letter.subject}</p>
        <p className="mt-4 whitespace-pre-line">{letter.body}</p>
        <p className="mt-10">{sender.name}</p>
      </Card>
      <form action={deleteLetter} className="mt-6 flex justify-center">
        <input type="hidden" name="letterId" value={letter.id} />
        <ConfirmSubmit confirmLabel={L.confirmDelete}>
          <Trash2 className="size-4" aria-hidden="true" /> {L.deleteLetter}
        </ConfirmSubmit>
      </form>
    </div>
  );
}
