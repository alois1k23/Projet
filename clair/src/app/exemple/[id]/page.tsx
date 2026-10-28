import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, Check, PenLine } from "lucide-react";
import { normalizeAnalysis, parseIsoDate } from "@/lib/ai/schema";
import { todayInZurich } from "@/lib/deadlines";
import { getSample } from "@/lib/samples";
import { TEMPLATES, type TemplateId } from "@/lib/letters/templates";
import { KeyFacts, LetterSuggestions, NextStep, StaticActions, Warnings } from "@/components/analysis";
import { Badge, ButtonLink, Card, SectionTitle } from "@/components/ui";
import { getLocale, getT } from "@/i18n/server";

// Les dates des exemples sont relatives au jour même.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const sample = getSample((await params).id);
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return { title: sample ? `${t.example.metaPrefix} : ${sample.label[locale]}` : t.example.metaPrefix };
}

/** Démonstration publique : le résultat d'un courrier fictif, sans compte ni base de données. */
export default async function ExamplePage({ params }: { params: Promise<{ id: string }> }) {
  const sample = getSample((await params).id);
  if (!sample) notFound();
  const today = todayInZurich();
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const a = normalizeAnalysis(sample.analysis(today, locale));
  const actions = a.actions.map((x) => ({ title: x.title, kind: x.kind, dueDate: parseIsoDate(x.dueDate), amount: x.amount }));
  const sorted = [...actions].sort((x, y) => (x.dueDate?.getTime() ?? Infinity) - (y.dueDate?.getTime() ?? Infinity));
  const next = sorted[0];
  const suggested = a.suggestedLetters.filter((t): t is TemplateId => t in TEMPLATES);

  return (
    <div className="animate-rise">
      <Link href="/exemple" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> {t.example.back}
      </Link>
      <p className="mb-4 rounded-xl bg-primary-soft px-4 py-2.5 text-sm font-semibold text-primary">
        {t.example.banner}
      </p>

      <header className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge>{t.documents.categories[a.documentType] ?? a.documentType}</Badge>
          {a.language !== locale ? <Badge tone="primary">{t.documents.originalIn[a.language] ?? t.documents.originalIn.autre}</Badge> : null}
        </div>
        <h1 className="text-[26px] leading-tight font-extrabold tracking-tight text-balance sm:text-3xl">{a.title}</h1>
        {a.sender ? <p className="mt-1 text-ink-2">{a.sender}</p> : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-6">
          <Card className="p-5 sm:p-6">
            <SectionTitle>{t.detail.summary}</SectionTitle>
            <p className="text-[17px] leading-relaxed">{a.summary}</p>
          </Card>

          {next ? (
            <NextStep
              step={next}
              today={today}
              remaining={actions.length - 1}
              actions={
                <>
                  <ButtonLink href="/inscription">
                    <Check className="size-4" aria-hidden="true" /> {t.example.follow}
                  </ButtonLink>
                  {suggested[0] ? (
                    <ButtonLink href="/inscription" variant="secondary">
                      <PenLine className="size-4" aria-hidden="true" /> {t.detail.prepareLetter}
                    </ButtonLink>
                  ) : null}
                </>
              }
            />
          ) : null}

          <Warnings items={a.warnings} />
          <KeyFacts
            today={today}
            data={{
              amount: a.amount,
              currency: a.currency,
              dueDate: parseIsoDate(a.dueDate),
              iban: a.payment?.iban ?? null,
              paymentReference: a.payment?.reference ?? null,
              references: a.references,
            }}
          />
          {actions.length > 1 ? <StaticActions items={sorted} today={today} /> : null}
          <LetterSuggestions ids={suggested} hrefFor={() => "/inscription"} />
        </div>

        <aside className="space-y-4" aria-label={t.detail.original}>
          <Card className="p-4">
            <SectionTitle>{t.example.received}</SectionTitle>
            <pre className="rounded-lg bg-surface-2 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink-2">{sample.text(today)}</pre>
          </Card>
        </aside>
      </div>

      <section className="mt-12 rounded-[var(--radius-card)] bg-ink p-6 text-bg sm:p-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-balance">{t.example.ctaTitle}</h2>
        <p className="mt-2 max-w-xl opacity-80">{t.example.ctaText}</p>
        <ButtonLink href="/inscription" variant="secondary" size="lg" className="mt-6">
          <Camera className="size-5" aria-hidden="true" /> {t.example.ctaButton}
        </ButtonLink>
      </section>
    </div>
  );
}
