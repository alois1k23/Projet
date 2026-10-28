import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, Check, PenLine } from "lucide-react";
import { Badge, ButtonLink, Card, cx } from "@/components/ui";
import { CopyButton } from "@/components/client";
import { DueBadge } from "@/components/task-row";
import { formatDate, formatIban, formatMoney, isValidIban } from "@/lib/format";
import { TEMPLATES, type TemplateId } from "@/lib/letters/templates";

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

function Fact({ label, children, review }: { label: string; children: ReactNode; review?: boolean }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface-2 px-4 py-3">
      <dt className="flex items-center gap-2 text-xs font-semibold text-ink-3">
        {label}
        {review ? <Badge tone="warning">À vérifier</Badge> : null}
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
export function KeyFacts({ data, today }: { data: FactsData; today: Date }) {
  const { amount, currency, dueDate, iban, paymentReference, references } = data;
  if (amount === null && !dueDate && !iban && !paymentReference && references.length === 0) return null;
  return (
    <section aria-label="Détails">
      <h2 className="mb-3 text-xs font-bold tracking-[0.08em] text-ink-3 uppercase">Détails</h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        {amount !== null ? (
          <Fact label="Montant" review={data.reviewAmount}>
            <span className="tabular text-xl">{formatMoney(amount, currency ?? "CHF")}</span>
          </Fact>
        ) : null}
        {dueDate ? (
          <Fact label="Échéance" review={data.reviewDate}>
            <span className="tabular text-xl">{formatDate(dueDate)}</span>
            <span className="mt-1.5 block">
              <DueBadge dueDate={dueDate} today={today} />
            </span>
          </Fact>
        ) : null}
        {iban ? (
          <Fact label={isValidIban(iban) ? "IBAN" : "IBAN (contrôle échoué, vérifiez)"} review={!isValidIban(iban)}>
            <Copyable value={formatIban(iban)} />
          </Fact>
        ) : null}
        {paymentReference ? (
          <Fact label="Référence de paiement">
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

export function Warnings({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-label="Points d’attention" className="rounded-[var(--radius-card)] border border-mark/60 bg-mark-soft p-5">
      <h2 className="mb-2 flex items-center gap-2 font-bold">
        <AlertTriangle className="size-5 text-warning" aria-hidden="true" /> Points d’attention
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
export function NextStep({ step, today, actions, remaining }: { step: NextStepData; today: Date; actions: ReactNode; remaining: number }) {
  return (
    <section aria-label="Prochaine étape">
      <Card className="overflow-hidden border-primary/40">
        <div className="bg-primary-soft px-5 py-2.5 text-xs font-bold tracking-[0.08em] text-primary uppercase sm:px-6">
          Prochaine étape{remaining > 0 ? ` · puis ${remaining} autre${remaining > 1 ? "s" : ""}` : ""}
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-xl leading-snug font-bold text-balance">{step.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {step.dueDate ? (
              <>
                <DueBadge dueDate={step.dueDate} today={today} />
                <span className="text-ink-2">
                  avant le <span className="mark font-semibold text-ink">{formatDate(step.dueDate)}</span>
                </span>
              </>
            ) : (
              <span className="text-ink-2">Pas de date limite indiquée</span>
            )}
            {step.amount !== null ? <span className="tabular font-bold">· {formatMoney(step.amount)}</span> : null}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">{actions}</div>
        </div>
      </Card>
    </section>
  );
}

export function LetterSuggestions({ ids, hrefFor }: { ids: TemplateId[]; hrefFor: (id: TemplateId) => string }) {
  if (ids.length === 0) return null;
  return (
    <section aria-label="Répondre">
      <h2 className="mb-3 text-xs font-bold tracking-[0.08em] text-ink-3 uppercase">Répondre</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {ids.map((t) => (
          <Link key={t} href={hrefFor(t)} className="group rounded-[var(--radius-card)] border border-line bg-surface p-4 transition-colors hover:border-primary">
            <span className="flex items-center gap-2 font-bold group-hover:text-primary">
              <PenLine className="size-4 shrink-0" aria-hidden="true" /> {TEMPLATES[t].label}
            </span>
            <span className="mt-1 block text-sm text-ink-2">{TEMPLATES[t].description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Liste d'actions en lecture seule (démonstration). */
export function StaticActions({ items, today }: { items: NextStepData[]; today: Date }) {
  if (items.length === 0) return null;
  return (
    <section aria-label="À faire">
      <h2 className="mb-3 text-xs font-bold tracking-[0.08em] text-ink-3 uppercase">Tout ce qu’il y a à faire</h2>
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
