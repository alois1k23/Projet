import Link from "next/link";
import type { Document } from "@prisma/client";
import { ChevronRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatMoney, formatShortDate, toNumber } from "@/lib/format";
import { getLocale, getT } from "@/i18n/server";

export async function StatusBadge({ doc }: { doc: Pick<Document, "status" | "source"> }) {
  const s = (await getT()).documents.status;
  if (doc.source === "SAMPLE") return <Badge tone="primary">{s.example}</Badge>;
  switch (doc.status) {
    case "NEEDS_REVIEW":
      return <Badge tone="warning">{s.review}</Badge>;
    case "FAILED":
      return <Badge tone="danger">{s.failed}</Badge>;
    case "MANUAL":
      return <Badge tone="neutral">{s.manual}</Badge>;
    case "PENDING":
      return <Badge tone="neutral">{s.pending}</Badge>;
    default:
      return null;
  }
}

export async function DocumentCard({ doc }: { doc: Document }) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
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
            <span className="truncate">{doc.sender ?? (doc.category ? t.documents.categories[doc.category] : t.documents.unknownSender)}</span>
            <span className="text-ink-3" aria-hidden="true">·</span>
            <span className="tabular text-ink-3">{formatShortDate(doc.createdAt, locale)}</span>
            <StatusBadge doc={doc} />
          </span>
        </span>
        {amount !== null ? <span className="tabular hidden font-bold whitespace-nowrap sm:block">{formatMoney(amount, doc.currency ?? "CHF")}</span> : null}
        <ChevronRight className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </li>
  );
}
