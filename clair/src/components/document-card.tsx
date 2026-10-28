import Link from "next/link";
import type { Document } from "@prisma/client";
import { ChevronRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatMoney, formatShortDate, toNumber } from "@/lib/format";

export const CATEGORY_LABELS: Record<string, string> = {
  facture: "Facture",
  rappel: "Rappel",
  poursuite: "Poursuite",
  prime_assurance: "Prime d’assurance",
  decompte_assurance: "Décompte d’assurance",
  impots: "Impôts",
  bail: "Logement",
  commune: "Commune",
  salaire: "Salaire",
  banque: "Banque",
  contrat: "Contrat",
  autre: "Autre",
};

export const LANGUAGE_LABELS: Record<string, string> = { fr: "Français", de: "Allemand", it: "Italien", en: "Anglais", autre: "Autre langue" };

export function StatusBadge({ doc }: { doc: Pick<Document, "status" | "source"> }) {
  if (doc.source === "SAMPLE") return <Badge tone="primary">Exemple</Badge>;
  switch (doc.status) {
    case "NEEDS_REVIEW":
      return <Badge tone="warning">À vérifier</Badge>;
    case "FAILED":
      return <Badge tone="danger">Analyse échouée</Badge>;
    case "MANUAL":
      return <Badge tone="neutral">Saisie manuelle</Badge>;
    case "PENDING":
      return <Badge tone="neutral">En cours</Badge>;
    default:
      return null;
  }
}

export function DocumentCard({ doc }: { doc: Document }) {
  const amount = toNumber(doc.amount);
  return (
    <li>
      <Link href={`/courriers/${doc.id}`} className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2 sm:px-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-2" aria-hidden="true">
          <FileText className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{doc.title}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-2">
            <span className="truncate">{doc.sender ?? (doc.category ? CATEGORY_LABELS[doc.category] : "Expéditeur inconnu")}</span>
            <span className="text-ink-3" aria-hidden="true">·</span>
            <span className="tabular text-ink-3">{formatShortDate(doc.createdAt)}</span>
            <StatusBadge doc={doc} />
          </span>
        </span>
        {amount !== null ? <span className="tabular hidden font-bold whitespace-nowrap sm:block">{formatMoney(amount, doc.currency ?? "CHF")}</span> : null}
        <ChevronRight className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </li>
  );
}
