import type { Metadata } from "next";
import { CalendarCheck, CalendarPlus } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { groupByUrgency, todayInZurich } from "@/lib/deadlines";
import { Card, EmptyState, PageHeader, SectionTitle, buttonClass } from "@/components/ui";
import { TaskRow } from "@/components/task-row";
import { NewTaskForm } from "./new-task-form";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).tasks.title };
}

export default async function DeadlinesPage() {
  const user = await requireUser();
  const today = todayInZurich();
  const t = await getT();
  const k = t.tasks;
  const include = { document: { select: { id: true, title: true, sender: true } } } as const;
  const [open, done] = await Promise.all([
    db.task.findMany({ where: { userId: user.id, status: "OPEN" }, include }),
    db.task.findMany({ where: { userId: user.id, status: "DONE" }, include, orderBy: { completedAt: "desc" }, take: 20 }),
  ]);
  const groups = groupByUrgency(open, today);

  return (
    <div className="animate-rise">
      <PageHeader
        title={k.title}
        subtitle={k.subtitle}
        action={
          open.some((task) => task.dueDate) ? (
            <a href="/api/agenda" className={buttonClass("secondary")}>
              <CalendarPlus className="size-4" aria-hidden="true" /> {k.addToCalendar}
            </a>
          ) : undefined
        }
      />
      <Card className="mb-8 p-5">
        <NewTaskForm />
      </Card>

      {open.length === 0 ? (
        <EmptyState icon={<CalendarCheck className="size-6" />} title={k.emptyTitle}>
          {k.emptyText}
        </EmptyState>
      ) : (
        <div className="grid gap-8">
          {([
            [t.home.overdue, groups.overdue],
            [k.week, groups.week],
            [t.home.later, groups.later],
            [t.home.undated, groups.undated],
          ] as const).map(([label, items]) =>
            items.length ? (
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
        </div>
      )}

      {done.length > 0 ? (
        <details className="mt-10">
          <summary className="cursor-pointer text-sm font-semibold text-ink-2">{k.doneRecently(done.length)}</summary>
          <Card className="mt-3">
            <ul className="divide-y divide-line">
              {done.map((task) => (
                <TaskRow key={task.id} task={task} today={today} />
              ))}
            </ul>
          </Card>
        </details>
      ) : null}
    </div>
  );
}
