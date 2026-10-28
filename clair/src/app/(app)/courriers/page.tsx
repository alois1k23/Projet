import type { Metadata } from "next";
import { Inbox, Plus, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { ButtonLink, Card, EmptyState, Input, Notice, PageHeader } from "@/components/ui";
import { DocumentCard } from "@/components/document-card";
import { SamplePicker } from "@/components/sample-picker";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).documents.title };
}

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ q?: string; supprime?: string }> }) {
  const user = await requireUser();
  const { q = "", supprime } = await searchParams;
  const query = q.trim().slice(0, 80);
  const t = await getT();
  const d = t.documents;
  const where: Prisma.DocumentWhereInput = {
    userId: user.id,
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { sender: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [docs, total] = await Promise.all([
    db.document.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 }),
    db.document.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="animate-rise">
      <PageHeader
        title={d.title}
        subtitle={total > 0 ? d.count(total) : undefined}
        action={
          <ButtonLink href="/courriers/nouveau" className="max-lg:hidden">
            <Plus className="size-4" aria-hidden="true" /> {t.nav.addShort}
          </ButtonLink>
        }
      />
      {supprime ? (
        <div className="mb-6">
          <Notice tone="success">{d.deleted}</Notice>
        </div>
      ) : null}

      {total === 0 ? (
        <EmptyState
          icon={<Inbox className="size-6" />}
          title={d.emptyTitle}
          action={<ButtonLink href="/courriers/nouveau">{t.nav.add}</ButtonLink>}
        >
          <div className="mt-4 text-left">
            <SamplePicker />
          </div>
        </EmptyState>
      ) : (
        <>
          <form role="search" className="relative mb-5" action="/courriers">
            <label htmlFor="q" className="sr-only">{d.searchLabel}</label>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
            <Input id="q" name="q" type="search" defaultValue={query} placeholder={d.searchPlaceholder} className="pl-10" />
          </form>
          {docs.length === 0 ? (
            <p className="py-10 text-center text-ink-2">{d.noMatch(query)}</p>
          ) : (
            <Card>
              <ul className="divide-y divide-line">
                {docs.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
