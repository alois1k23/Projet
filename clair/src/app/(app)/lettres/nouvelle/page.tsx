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

export const metadata: Metadata = { title: "Nouvelle lettre" };

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
      values.policyNumber = find(/assur|police|versich/i);
      values.endDate = `${new Date().getUTCFullYear()}-12-31`;
      break;
    case "resiliation-contrat":
      values.contractNumber = find(/contrat|client|vertrag|kunde/i);
      break;
    case "contestation-facture":
      values.invoiceNumber = find(/facture|rechnung/i);
      values.amount = amount !== null ? amount.toFixed(2) : "";
      break;
    case "delai-paiement":
      values.reference = find(/facture|poursuite|référence|rechnung/i) || analysis?.payment?.reference || "";
      values.amount = amount !== null ? amount.toFixed(2) : "";
      break;
    case "reclamation-taxation":
      values.taxpayerNumber = find(/contribuable|steuer/i);
      break;
  }
  return values;
}

export default async function NewLetterPage({ searchParams }: { searchParams: Promise<{ modele?: string; courrier?: string }> }) {
  const user = await requireUser();
  const { modele, courrier } = await searchParams;
  const doc = courrier ? await db.document.findFirst({ where: { id: courrier, userId: user.id } }) : null;
  const template = modele ? getTemplate(modele) : null;

  if (!template) {
    return (
      <div className="animate-rise">
        <PageHeader title="Préparer une lettre" subtitle="Choisissez le type de lettre. Clair remplit ce qu’il peut à partir de votre courrier." />
        <ul className="grid gap-3 sm:grid-cols-2">
          {Object.values(TEMPLATES).map((t) => (
            <li key={t.id}>
              <Link
                href={`/lettres/nouvelle?modele=${t.id}${doc ? `&courrier=${doc.id}` : ""}`}
                className="group block h-full rounded-[var(--radius-card)] border border-line bg-surface p-5 transition-colors hover:border-primary"
              >
                <span className="flex items-center gap-2 font-bold group-hover:text-primary">
                  <PenLine className="size-4 shrink-0" aria-hidden="true" /> {t.label}
                </span>
                <span className="mt-1 block text-sm text-ink-2">{t.description}</span>
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
        <ArrowLeft className="size-4" aria-hidden="true" /> {doc ? "Retour au courrier" : "Tous les modèles"}
      </Link>
      <PageHeader title={template.label} subtitle={template.description} />
      <LetterForm
        templateId={template.id}
        documentId={doc?.id ?? null}
        initialValues={prefill(template.id, doc)}
        sender={{ name: user.name ?? user.email, addressLine: user.addressLine, postalCode: user.postalCode, city: user.city }}
      />
      <p className="mt-6 text-xs text-ink-3">
        Ce modèle est une aide à la rédaction, pas un conseil juridique. Relisez la lettre et vérifiez les délais avant de l’envoyer, de préférence en recommandé.
      </p>
    </div>
  );
}
