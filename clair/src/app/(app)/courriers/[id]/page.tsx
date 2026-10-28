import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, FileText, PenLine, RefreshCw, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { storedAnalysis } from "@/lib/documents";
import { todayInZurich } from "@/lib/deadlines";
import { formatDate, toNumber } from "@/lib/format";
import { getSample } from "@/lib/samples";
import { TEMPLATES, type TemplateId } from "@/lib/letters/templates";
import type { TaskKind } from "@prisma/client";
import { REVIEW_THRESHOLD } from "@/lib/ai/schema";
import { deleteDocument, retryAnalysis } from "@/app/actions/documents";
import { toggleTask } from "@/app/actions/tasks";
import { Badge, ButtonLink, Card, Notice, SectionTitle, buttonClass } from "@/components/ui";
import { KeyFacts, LetterSuggestions, NextStep, Warnings } from "@/components/analysis";
import { ConfirmSubmit, CopyButton, SubmitButton } from "@/components/client";
import { TaskRow } from "@/components/task-row";
import { StatusBadge } from "@/components/document-card";
import { getLocale, getT } from "@/i18n/server";
import { messages } from "@/i18n/messages";
import { EditForm } from "./edit-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).detail.back };
}

const DEFAULT_TITLES = new Set(Object.values(messages).map((m) => m.documents.newDocument));

/** Modèle de lettre le plus utile pour une action donnée. */
function letterFor(kind: TaskKind, suggested: TemplateId[]): TemplateId | null {
  if (kind === "CANCEL") return suggested.find((t) => t.startsWith("resiliation")) ?? null;
  if (kind === "REPLY") return suggested.find((t) => !t.startsWith("resiliation")) ?? suggested[0] ?? null;
  return null;
}

export default async function DocumentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saisie?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { saisie } = await searchParams;
  const doc = await db.document.findFirst({
    where: { id, userId: user.id },
    include: { tasks: { orderBy: [{ status: "asc" }, { dueDate: "asc" }] }, letters: { orderBy: { createdAt: "desc" } }, files: { orderBy: { position: "asc" } } },
  });
  if (!doc) notFound();

  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const d = t.detail;
  const today = todayInZurich();
  const analysis = storedAnalysis(doc.analysis);
  const amount = toNumber(doc.amount);
  const sample = doc.source === "SAMPLE" ? getSample(doc.originalName.replace(/^exemple:/, "")) : null;
  const iban = analysis?.payment?.iban ?? null;
  const editing = saisie === "1" || doc.status === "MANUAL" || doc.status === "FAILED";
  const suggested = (analysis?.suggestedLetters ?? []).filter((t): t is TemplateId => t in TEMPLATES);
  const reviewing = doc.status === "NEEDS_REVIEW";
  const lowAmount = reviewing && analysis?.confidence.amount !== null && analysis?.confidence.amount !== undefined && analysis.confidence.amount < REVIEW_THRESHOLD;
  const openTasks = doc.tasks.filter((t) => t.status === "OPEN");
  const next = openTasks[0] ?? null;
  const nextLetter = next ? letterFor(next.kind, suggested) : null;
  const lowDate = reviewing && analysis?.confidence.dueDate !== null && analysis?.confidence.dueDate !== undefined && analysis.confidence.dueDate < REVIEW_THRESHOLD;

  return (
    <div className="animate-rise">
      <Link href="/courriers" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> {d.back}
      </Link>

      <header className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {doc.category ? <Badge>{t.documents.categories[doc.category] ?? doc.category}</Badge> : null}
          {doc.language && doc.language !== locale ? <Badge tone="primary">{t.documents.originalIn[doc.language] ?? t.documents.originalIn.autre}</Badge> : null}
          <StatusBadge doc={doc} />
        </div>
        <h1 className="text-[26px] leading-tight font-extrabold tracking-tight text-balance sm:text-3xl">{doc.title}</h1>
        {doc.sender ? <p className="mt-1 text-ink-2">{doc.sender}</p> : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-6">
          {doc.status === "FAILED" ? (
            <Notice tone="danger" title={d.failedTitle}>
              <p>{(doc.errorMessage && t.analysisErrors[doc.errorMessage]) ?? doc.errorMessage ?? d.failedDefault}</p>
              {doc.files.length > 0 ? (
                <form action={retryAnalysis} className="mt-3">
                  <input type="hidden" name="documentId" value={doc.id} />
                  <SubmitButton variant="secondary" size="sm" pendingLabel={d.retrying}>
                    <RefreshCw className="size-4" aria-hidden="true" /> {d.retry}
                  </SubmitButton>
                </form>
              ) : null}
            </Notice>
          ) : null}
          {doc.status === "MANUAL" && doc.errorMessage ? <Notice tone="warning">{t.analysisErrors[doc.errorMessage] ?? doc.errorMessage}</Notice> : null}
          {doc.status === "NEEDS_REVIEW" ? (
            <Notice tone="warning" title={d.reviewTitle}>
              {d.reviewText}
            </Notice>
          ) : null}

          {doc.summary ? (
            <Card className="p-5 sm:p-6">
              <SectionTitle>{d.summary}</SectionTitle>
              <p className="text-[17px] leading-relaxed">{doc.summary}</p>
            </Card>
          ) : null}

          {next ? (
            <NextStep
              step={{ title: next.title, kind: next.kind, dueDate: next.dueDate, amount: toNumber(next.amount) }}
              today={today}
              remaining={openTasks.length - 1}
              actions={
                <>
                  <form action={toggleTask}>
                    <input type="hidden" name="taskId" value={next.id} />
                    <input type="hidden" name="done" value="on" />
                    <SubmitButton pendingLabel={t.common.saving}>
                      <Check className="size-4" aria-hidden="true" /> {d.done}
                    </SubmitButton>
                  </form>
                  {next.kind === "PAY" && iban ? <CopyButton value={iban.replace(/\s+/g, "")} label={d.copyIban} variant="secondary" /> : null}
                  {nextLetter ? (
                    <ButtonLink href={`/lettres/nouvelle?modele=${nextLetter}&courrier=${doc.id}`} variant="secondary">
                      <PenLine className="size-4" aria-hidden="true" /> {d.prepareLetter}
                    </ButtonLink>
                  ) : null}
                </>
              }
            />
          ) : doc.tasks.length > 0 ? (
            <Notice tone="success" title={d.allDoneTitle}>{d.allDoneText}</Notice>
          ) : null}

          <Warnings items={analysis?.warnings ?? []} />

          <KeyFacts
            today={today}
            data={{
              amount,
              currency: doc.currency,
              dueDate: doc.dueDate,
              iban,
              paymentReference: analysis?.payment?.reference ?? null,
              references: analysis?.references ?? [],
              reviewAmount: lowAmount,
              reviewDate: lowDate,
            }}
          />

          {doc.tasks.length > 1 ? (
            <section aria-label={d.allActions}>
              <SectionTitle count={openTasks.length}>{d.allActions}</SectionTitle>
              <Card>
                <ul className="divide-y divide-line">
                  {doc.tasks.map((task) => (
                    <TaskRow key={task.id} task={task} today={today} showDocument={false} />
                  ))}
                </ul>
              </Card>
            </section>
          ) : null}

          <LetterSuggestions ids={suggested} hrefFor={(id) => `/lettres/nouvelle?modele=${id}&courrier=${doc.id}`} />

          {doc.letters.length > 0 ? (
            <section aria-label={d.lettersPrepared}>
              <SectionTitle>{d.lettersPrepared}</SectionTitle>
              <ul className="space-y-2">
                {doc.letters.map((l) => (
                  <li key={l.id}>
                    <Link href={`/lettres/${l.id}`} className="font-semibold text-primary hover:underline">
                      {l.subject}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <details className="group rounded-[var(--radius-card)] border border-line bg-surface" open={editing}>
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-bold">
              {doc.status === "MANUAL" || doc.status === "FAILED" ? d.enterInfo : d.correctInfo}
              <PenLine className="size-4 text-ink-3" aria-hidden="true" />
            </summary>
            <div className="border-t border-line p-5">
              <EditForm
                categories={Object.entries(t.documents.categories).map(([value, label]) => ({ value, label }))}
                defaults={{
                  documentId: doc.id,
                  title: DEFAULT_TITLES.has(doc.title) ? "" : doc.title,
                  sender: doc.sender ?? "",
                  category: doc.category ?? "autre",
                  amount: amount !== null ? amount.toFixed(2) : "",
                  dueDate: doc.dueDate ? doc.dueDate.toISOString().slice(0, 10) : "",
                  summary: doc.summary ?? "",
                }}
              />
            </div>
          </details>
        </div>

        <aside className="space-y-4" aria-label={d.original}>
          <Card className="p-4">
            <SectionTitle>{d.original}</SectionTitle>
            {sample ? (
              <pre className="rounded-lg bg-surface-2 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink-2">{sample.text(today)}</pre>
            ) : doc.files.length > 0 ? (
              <ol className="space-y-3">
                {doc.files.map((f) => {
                  const url = `/api/documents/${doc.id}/fichier?page=${f.position}`;
                  const alt = doc.files.length > 1 ? d.pageAlt(f.position, doc.title) : d.originalAlt(doc.title);
                  return (
                    <li key={f.id}>
                      {doc.files.length > 1 ? <p className="mb-1 text-xs font-semibold text-ink-3">{d.page(f.position)}</p> : null}
                      {f.mimeType.startsWith("image/") ? (
                        <a href={url} target="_blank" rel="noopener" className="block">
                          {/* eslint-disable-next-line @next/next/no-img-element -- fichier déchiffré servi par une route authentifiée */}
                          <img src={url} alt={alt} className="w-full rounded-lg border border-line" />
                        </a>
                      ) : (
                        <a href={url} target="_blank" rel="noopener" className={buttonClass("secondary", "sm", "w-full")}>
                          <FileText className="size-4" aria-hidden="true" /> {d.openPdf}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : null}
            <p className="mt-3 text-xs text-ink-3">{d.addedOn(formatDate(doc.createdAt, locale))}</p>
          </Card>
          {suggested.length === 0 ? (
            <ButtonLink href={`/lettres/nouvelle?courrier=${doc.id}`} variant="secondary" className="w-full">
              <PenLine className="size-4" aria-hidden="true" /> {t.letters.chooseTitle}
            </ButtonLink>
          ) : null}
          <form action={deleteDocument}>
            <input type="hidden" name="documentId" value={doc.id} />
            <ConfirmSubmit confirmLabel={d.deleteConfirm} className="w-full justify-center">
              <Trash2 className="size-4" aria-hidden="true" /> {d.deleteDocument}
            </ConfirmSubmit>
          </form>
        </aside>
      </div>
    </div>
  );
}
