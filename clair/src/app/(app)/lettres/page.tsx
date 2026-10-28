import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileText, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { formatShortDate } from "@/lib/format";
import { ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import { getLocale, getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).letters.title };
}

export default async function LettersPage() {
  const user = await requireUser();
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const L = t.letters;
  const letters = await db.letter.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="animate-rise">
      <PageHeader
        title={L.title}
        subtitle={L.subtitle}
        action={
          <ButtonLink href="/lettres/nouvelle">
            <Plus className="size-4" aria-hidden="true" /> {L.new}
          </ButtonLink>
        }
      />
      {letters.length === 0 ? (
        <EmptyState icon={<FileText className="size-6" />} title={L.emptyTitle}>
          {L.emptyText}
        </EmptyState>
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {letters.map((l) => (
              <li key={l.id}>
                <Link href={`/lettres/${l.id}`} className="group flex items-center gap-3 px-5 py-4 hover:bg-surface-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{l.subject}</span>
                    <span className="mt-0.5 block truncate text-sm text-ink-2">
                      {l.recipient.split("\n")[0]} · <span className="tabular">{formatShortDate(l.createdAt, locale)}</span>
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-ink-3" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
