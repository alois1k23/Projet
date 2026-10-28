import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, Check, PenLine } from "lucide-react";
import { Badge, ButtonLink, Card, cx } from "@/components/ui";
import { CopyButton } from "@/components/client";
import { DueBadge } from "@/components/task-row";
import { formatDate, formatIban, formatMoney, isValidIban } from "@/lib/format";
import type { TemplateId } from "@/lib/letters/templates";
import { getLocale, getT } from "@/i18n/server";

export interface FactsData {
  amount: number | null;
  currency: string | null;
  dueDate: Date | null;
  iban: string | null;
  paymentReference: string | null;
  references: { label: string; value: string }[];
  reviewAmount?: boolean;
  reviewDate?: boolean;
}

function Fact({ label, children, review }: { label: string; children: ReactNode; review?: string | false }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface-2 px-4 py-3">
      <dt className="flex items-center gap-2 text-xs font-semibold text-ink-3">
        {label}
        {review ? <Badge tone="warning">{review}</Badge> : null}
      </dt>
      <dd className="mt-1 min-w-0 font-bold break-words">{children}</dd>
    </div>
  );
}

function Copyable({ value }: { value: string }) {
  return (
    <span className="flex flex-wrap items-center justify-between gap-2">
      <span className="font-mono text-[15px] break-all">{value}</span>
      <CopyButton value={value.replace(/\s+/g, "")} />
    </span>
  );
}

/** Montant, échéance, IBAN et références, chacun copiable d'un geste. */
export async function KeyFacts({ data, today }: { data: FactsData; today: Date }) {
  const { amount, currency, dueDate, iban, paymentReference, references } = data;
  if (amount === null && !dueDate && !iban && !paymentReference && references.length === 0) return null;
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const a = t.analysis;
  return (
    <section aria-label={a.details}>
      <h2 className="mb-3 text-xs font-bold tracking-[0.08em] text-ink-3 uppercase">{a.details}</h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        {amount !== null ? (
          <Fact label={a.amount} review={data.reviewAmount && a.toCheck}>
            <span className="tabular text-xl">{formatMoney(amount, currency ?? "CHF")}</span>
          </Fact>
        ) : null}
        {dueDate ? (
          <Fact label={a.dueDate} review={data.reviewDate && a.toCheck}>
            <span className="tabular text-xl">{formatDate(dueDate, locale)}</span>
            <span className="mt-1.5 block">
              <DueBadge dueDate={dueDate} today={today} />
            </span>
          </Fact>
        ) : null}
        {iban ? (
          <Fact label={isValidIban(iban) ? a.iban : a.ibanInvalid} review={!isValidIban(iban) && a.toCheck}>
            <Copyable value={formatIban(iban)} />
          </Fact>
        ) : null}
        {paymentReference ? (
          <Fact label={a.paymentReference}>
            <Copyable value={paymentReference} />
          </Fact>
        ) : null}
        {references.map((r) => (
          <Fact key={`${r.label}-${r.value}`} label={r.label}>
            <Copyable value={r.value} />
          </Fact>
        ))}
      </dl>
    </section>
  );
}

export async function Warnings({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const a = (await getT()).analysis;
  return (
    <section aria-label={a.warnings} className="rounded-[var(--radius-card)] border border-mark/60 bg-mark-soft p-5">
      <h2 className="mb-2 flex items-center gap-2 font-bold">
        <AlertTriangle className="size-5 text-warning" aria-hidden="true" /> {a.warnings}
      </h2>
      <ul className="list-disc space-y-1.5 pl-5">
        {items.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </section>
  );
}

export interface NextStepData {
  title: string;
  kind: string;
  dueDate: Date | null;
  amount: number | null;
}

/**
 * La première chose à faire, mise en avant. `actions` contient les boutons propres au contexte
 * (marquer comme fait, copier l'IBAN, préparer la lettre, ou inviter à créer un compte en démonstration).
 */
export async function NextStep({ step, today, actions, remaining }: { step: NextStepData; today: Date; actions: ReactNode; remaining: number }) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const a = t.analysis;
  return (
    <section aria-label={a.nextStep}>
      <Card className="overflow-hidden border-primary/40">
        <div className="bg-primary-soft px-5 py-2.5 text-xs font-bold tracking-[0.08em] text-primary uppercase sm:px-6">
          {a.nextStep}
          {remaining > 0 ? a.then(remaining) : ""}
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-xl leading-snug font-bold text-balance">{step.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {step.dueDate ? (
              <>
                <DueBadge dueDate={step.dueDate} today={today} />
                <span className="text-ink-2">
                  {a.before} <span className="mark font-semibold text-ink">{formatDate(step.dueDate, locale)}</span>
                </span>
              </>
            ) : (
              <span className="text-ink-2">{a.noDeadline}</span>
            )}
            {step.amount !== null ? <span className="tabular font-bold">· {formatMoney(step.amount)}</span> : null}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">{actions}</div>
        </div>
      </Card>
    </section>
  );
}

export async function LetterSuggestions({ ids, hrefFor }: { ids: TemplateId[]; hrefFor: (id: TemplateId) => string }) {
  if (ids.length === 0) return null;
  const t = await getT();
  return (
    <section aria-label={t.analysis.reply}>
      <h2 className="mb-3 text-xs font-bold tracking-[0.08em] text-ink-3 uppercase">{t.analysis.reply}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {ids.map((id) => (
          <Link key={id} href={hrefFor(id)} className="group rounded-[var(--radius-card)] border border-line bg-surface p-4 transition-colors hover:border-primary">
            <span className="flex items-center gap-2 font-bold group-hover:text-primary">
              <PenLine className="size-4 shrink-0" aria-hidden="true" /> {t.templates[id]!.label}
            </span>
            <span className="mt-1 block text-sm text-ink-2">{t.templates[id]!.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Liste d'actions en lecture seule (démonstration). */
export async function StaticActions({ items, today }: { items: NextStepData[]; today: Date }) {
  if (items.length === 0) return null;
  const t = await getT();
  return (
    <section aria-label={t.analysis.everything}>
      <h2 className="mb-3 text-xs font-bold tracking-[0.08em] text-ink-3 uppercase">{t.analysis.everything}</h2>
      <Card>
        <ul className="divide-y divide-line">
          {items.map((a) => (
            <li key={a.title} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border-2 border-line-strong" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{a.title}</p>
                {a.dueDate ? (
                  <p className="mt-1.5">
                    <DueBadge dueDate={a.dueDate} today={today} />
                  </p>
                ) : null}
              </div>
              {a.amount !== null ? <p className="tabular font-bold whitespace-nowrap">{formatMoney(a.amount)}</p> : null}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

export function PrimaryAction({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" }) {
  return (
    <ButtonLink href={href} variant={variant}>
      {children}
      {variant === "primary" ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
    </ButtonLink>
  );
}

export function DoneIcon({ className }: { className?: string }) {
  return <Check className={cx("size-4", className)} aria-hidden="true" />;
}
