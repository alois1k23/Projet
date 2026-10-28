import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, ExternalLink, FileText, PenLine, RefreshCw, Trash2 } from "lucide-react";
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
import { CATEGORY_LABELS, LANGUAGE_LABELS, StatusBadge } from "@/components/document-card";
import { EditForm } from "./edit-form";

export const metadata: Metadata = { title: "Courrier" };

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
    include: { tasks: { orderBy: [{ status: "asc" }, { dueDate: "asc" }] }, letters: { orderBy: { createdAt: "desc" } } },
  });
  if (!doc) notFound();

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
        <ArrowLeft className="size-4" aria-hidden="true" /> Courriers
      </Link>

      <header className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {doc.category ? <Badge>{CATEGORY_LABELS[doc.category] ?? doc.category}</Badge> : null}
          {doc.language && doc.language !== "fr" ? <Badge tone="primary">Original en {LANGUAGE_LABELS[doc.language]?.toLowerCase()}</Badge> : null}
          <StatusBadge doc={doc} />
        </div>
        <h1 className="text-[26px] leading-tight font-extrabold tracking-tight text-balance sm:text-3xl">{doc.title}</h1>
        {doc.sender ? <p className="mt-1 text-ink-2">{doc.sender}</p> : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-6">
          {doc.status === "FAILED" ? (
            <Notice tone="danger" title="L’analyse n’a pas abouti">
              <p>{doc.errorMessage ?? "Une erreur est survenue."}</p>
              {doc.storageKey ? (
                <form action={retryAnalysis} className="mt-3">
                  <input type="hidden" name="documentId" value={doc.id} />
                  <SubmitButton variant="secondary" size="sm" pendingLabel="Nouvelle analyse…">
                    <RefreshCw className="size-4" aria-hidden="true" /> Réessayer l’analyse
                  </SubmitButton>
                </form>
              ) : null}
            </Notice>
          ) : null}
          {doc.status === "MANUAL" && doc.errorMessage ? <Notice tone="warning">{doc.errorMessage}</Notice> : null}
          {doc.status === "NEEDS_REVIEW" ? (
            <Notice tone="warning" title="Vérifiez les informations signalées">
              Clair n’est pas certain de tout ce qu’il a lu. Comparez avec le courrier original et corrigez si besoin.
            </Notice>
          ) : null}

          {doc.summary ? (
            <Card className="p-5 sm:p-6">
              <SectionTitle>En bref</SectionTitle>
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
                    <SubmitButton pendingLabel="Enregistrement…">
                      <Check className="size-4" aria-hidden="true" /> C’est fait
                    </SubmitButton>
                  </form>
                  {next.kind === "PAY" && iban ? <CopyButton value={iban.replace(/\s+/g, "")} label="Copier l’IBAN" variant="secondary" /> : null}
                  {nextLetter ? (
                    <ButtonLink href={`/lettres/nouvelle?modele=${nextLetter}&courrier=${doc.id}`} variant="secondary">
                      <PenLine className="size-4" aria-hidden="true" /> Préparer la lettre
                    </ButtonLink>
                  ) : null}
                </>
              }
            />
          ) : doc.tasks.length > 0 ? (
            <Notice tone="success" title="Tout est fait pour ce courrier">Vous pouvez le garder ici pour le retrouver facilement.</Notice>
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
            <section aria-label="Toutes les actions">
              <SectionTitle count={openTasks.length}>Toutes les actions</SectionTitle>
              <Card>
                <ul className="divide-y divide-line">
                  {doc.tasks.map((t) => (
                    <TaskRow key={t.id} task={t} today={today} showDocument={false} />
                  ))}
                </ul>
              </Card>
            </section>
          ) : null}

          <LetterSuggestions ids={suggested} hrefFor={(t) => `/lettres/nouvelle?modele=${t}&courrier=${doc.id}`} />

          {doc.letters.length > 0 ? (
            <section aria-label="Lettres liées">
              <SectionTitle>Lettres préparées</SectionTitle>
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
              {doc.status === "MANUAL" || doc.status === "FAILED" ? "Saisir les informations" : "Corriger les informations"}
              <PenLine className="size-4 text-ink-3" aria-hidden="true" />
            </summary>
            <div className="border-t border-line p-5">
              <EditForm
                categories={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
                defaults={{
                  documentId: doc.id,
                  title: doc.title === "Nouveau courrier" ? "" : doc.title,
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

        <aside className="space-y-4" aria-label="Document original">
          <Card className="p-4">
            <SectionTitle>Original</SectionTitle>
            {sample ? (
              <pre className="rounded-lg bg-surface-2 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink-2">{sample.text(today)}</pre>
            ) : doc.storageKey ? (
              <>
                {doc.mimeType.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element -- fichier déchiffré servi par une route authentifiée
                  <img src={`/api/documents/${doc.id}/fichier`} alt={`Courrier original : ${doc.title}`} className="w-full rounded-lg border border-line" />
                ) : (
                  <div className="grid place-items-center rounded-lg bg-surface-2 py-8 text-ink-2">
                    <FileText className="size-8" aria-hidden="true" />
                    <span className="mt-2 text-sm">Document PDF</span>
                  </div>
                )}
                <a href={`/api/documents/${doc.id}/fichier`} target="_blank" rel="noopener" className={buttonClass("secondary", "sm", "mt-3 w-full")}>
                  <ExternalLink className="size-4" aria-hidden="true" /> Ouvrir l’original
                </a>
              </>
            ) : null}
            <p className="mt-3 text-xs text-ink-3">Ajouté le {formatDate(doc.createdAt)}</p>
          </Card>
          {suggested.length === 0 ? (
            <ButtonLink href={`/lettres/nouvelle?courrier=${doc.id}`} variant="secondary" className="w-full">
              <PenLine className="size-4" aria-hidden="true" /> Préparer une lettre
            </ButtonLink>
          ) : null}
          <form action={deleteDocument}>
            <input type="hidden" name="documentId" value={doc.id} />
            <ConfirmSubmit confirmLabel="Supprimer définitivement" className="w-full justify-center">
              <Trash2 className="size-4" aria-hidden="true" /> Supprimer ce courrier
            </ConfirmSubmit>
          </form>
        </aside>
      </div>
    </div>
  );
}
