import type { Metadata } from "next";
import Link from "next/link";
import { Camera, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { groupByUrgency, todayInZurich, zurichHour } from "@/lib/deadlines";
import { formatMoney, toNumber } from "@/lib/format";
import { ButtonLink, Card, EmptyState, Notice, SectionTitle } from "@/components/ui";
import { TaskRow } from "@/components/task-row";
import { DocumentCard } from "@/components/document-card";
import { SamplePicker } from "@/components/sample-picker";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).nav.home };
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ bienvenue?: string; "mot-de-passe"?: string }> }) {
  const user = await requireUser();
  const { bienvenue, "mot-de-passe": passwordChanged } = await searchParams;
  const t = await getT();
  const h = t.home;
  const today = todayInZurich();
  const [tasks, recent, docCount] = await Promise.all([
    db.task.findMany({ where: { userId: user.id, status: "OPEN" }, include: { document: { select: { id: true, title: true, sender: true } } } }),
    db.document.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 4 }),
    db.document.count({ where: { userId: user.id } }),
  ]);
  const groups = groupByUrgency(tasks, today);
  const urgentCount = groups.overdue.length + groups.week.length;
  const toPay = tasks.filter((task) => task.kind === "PAY").reduce((sum, task) => sum + (toNumber(task.amount) ?? 0), 0);
  const firstName = user.name?.split(" ")[0] ?? "";

  return (
    <div className="animate-rise">
      <header className="mb-8">
        <h1 className="text-[28px] leading-tight font-extrabold tracking-tight sm:text-4xl">
          {zurichHour(new Date()) < 18 ? h.morning : h.evening}
          {firstName ? ` ${firstName}` : ""}.
        </h1>
        <p className="mt-2 text-lg text-ink-2">
          {tasks.length === 0 ? (
            h.nothing
          ) : urgentCount > 0 ? (
            <>
              <span className="mark font-semibold text-ink">
                {h.urgent(urgentCount)}
              </span>
              {toPay > 0 ? <> · {h.toPayTotal(formatMoney(toPay))}</> : null}
            </>
          ) : (
            h.notUrgent(tasks.length)
          )}
        </p>
      </header>

      {passwordChanged ? (
        <div className="mb-8">
          <Notice tone="success">{h.passwordChanged}</Notice>
        </div>
      ) : null}

      {bienvenue && docCount > 0 ? (
        <div className="mb-8">
          <Notice tone="mark" title={h.welcomeTitle}>
            {h.welcomeText}
          </Notice>
        </div>
      ) : null}

      {docCount === 0 ? (
        <Card className="p-6 sm:p-8">
          <h2 className="text-xl font-bold">{bienvenue ? h.firstTitleWelcome : h.firstTitle}</h2>
          <ol className="mt-4 grid gap-3 text-ink-2 sm:grid-cols-3">
            {h.steps.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <ButtonLink href="/courriers/nouveau" size="lg" className="mt-6 w-full sm:w-auto">
            <Camera className="size-5" aria-hidden="true" /> {h.photographCta}
          </ButtonLink>
          <div className="mt-8 border-t border-line pt-6">
            <SamplePicker />
          </div>
        </Card>
      ) : (
        <div className="grid gap-8">
          {tasks.length === 0 ? (
            <EmptyState icon={<CheckCircle2 className="size-6" />} title={h.allDone}>
              {h.allDoneText}
            </EmptyState>
          ) : (
            <>
              {([
                [h.overdue, groups.overdue],
                [h.week, groups.week],
                [h.later, groups.later],
                [h.undated, groups.undated],
              ] as const).map(([label, items]) =>
                items.length > 0 ? (
                  <section key={label} aria-label={label}>
                    <SectionTitle count={items.length}>{label}</SectionTitle>
                    <Card>
                      <ul className="divide-y divide-line">
                        {items.map((task) => (
                          <TaskRow key={task.id} task={task} today={today} />
                        ))}
                      </ul>
                    </Card>
                  </section>
                ) : null,
              )}
            </>
          )}

          <section aria-label={h.recent}>
            <div className="flex items-center justify-between">
              <SectionTitle>{h.recent}</SectionTitle>
              <Link href="/courriers" className="mb-3 text-sm font-semibold text-primary hover:underline">
                {h.seeAll}
              </Link>
            </div>
            <Card>
              <ul className="divide-y divide-line">
                {recent.map((d) => (
                  <DocumentCard key={d.id} doc={d} />
                ))}
              </ul>
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}
