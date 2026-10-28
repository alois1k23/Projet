import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PenLine } from "lucide-react";
import type { Document } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { storedAnalysis } from "@/lib/documents";
import { toNumber } from "@/lib/format";
import { getTemplate, TEMPLATES, type TemplateId } from "@/lib/letters/templates";
import { PageHeader } from "@/components/ui";
import { LetterForm } from "./letter-form";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).letters.new };
}

/** Pré-remplit les champs à partir du courrier analysé. */
function prefill(templateId: TemplateId, doc: Document | null): Record<string, string> {
  if (!doc) return {};
  const analysis = storedAnalysis(doc.analysis);
  const refs = analysis?.references ?? [];
  const find = (pattern: RegExp) => refs.find((r) => pattern.test(r.label))?.value ?? "";
  const amount = toNumber(doc.amount);
  const values: Record<string, string> = { recipientName: doc.sender ?? "" };
  switch (templateId) {
    case "resiliation-assurance":
      values.insuranceType = doc.category === "prime_assurance" || doc.category === "decompte_assurance" ? "base" : "";
      values.policyNumber = find(/assur|police|versich|insur|policy/i);
      values.endDate = `${new Date().getUTCFullYear()}-12-31`;
      break;
    case "resiliation-contrat":
      values.contractNumber = find(/contrat|client|vertrag|kunde|contract|customer/i);
      break;
    case "contestation-facture":
      values.invoiceNumber = find(/facture|rechnung|invoice/i);
      values.amount = amount !== null ? amount.toFixed(2) : "";
      break;
    case "delai-paiement":
      values.reference = find(/facture|poursuite|référence|rechnung|betreibung|invoice|debt|reference/i) || analysis?.payment?.reference || "";
      values.amount = amount !== null ? amount.toFixed(2) : "";
      break;
    case "reclamation-taxation":
      values.taxpayerNumber = find(/contribuable|steuer|taxpayer/i);
      break;
  }
  return values;
}

export default async function NewLetterPage({ searchParams }: { searchParams: Promise<{ modele?: string; courrier?: string }> }) {
  const user = await requireUser();
  const { modele, courrier } = await searchParams;
  const doc = courrier ? await db.document.findFirst({ where: { id: courrier, userId: user.id } }) : null;
  const template = modele ? getTemplate(modele) : null;
  const t = await getT();

  if (!template) {
    return (
      <div className="animate-rise">
        <PageHeader title={t.letters.chooseTitle} subtitle={t.letters.chooseIntro} />
        <ul className="grid gap-3 sm:grid-cols-2">
          {Object.values(TEMPLATES).map((tpl) => (
            <li key={tpl.id}>
              <Link
                href={`/lettres/nouvelle?modele=${tpl.id}${doc ? `&courrier=${doc.id}` : ""}`}
                className="group block h-full rounded-[var(--radius-card)] border border-line bg-surface p-5 transition-colors hover:border-primary"
              >
                <span className="flex items-center gap-2 font-bold group-hover:text-primary">
                  <PenLine className="size-4 shrink-0" aria-hidden="true" /> {t.templates[tpl.id]!.label}
                </span>
                <span className="mt-1 block text-sm text-ink-2">{t.templates[tpl.id]!.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <Link href={doc ? `/courriers/${doc.id}` : "/lettres/nouvelle"} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> {doc ? t.letters.backToDocument : t.letters.allTemplates}
      </Link>
      <PageHeader title={t.templates[template.id]!.label} subtitle={t.templates[template.id]!.description} />
      <LetterForm
        templateId={template.id}
        documentId={doc?.id ?? null}
        initialValues={prefill(template.id, doc)}
        sender={{ name: user.name ?? "", addressLine: user.addressLine, postalCode: user.postalCode, city: user.city }}
      />
      <p className="mt-6 text-xs text-ink-3">{t.letters.disclaimer}</p>
    </div>
  );
}
