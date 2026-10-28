import type { Metadata } from "next";
import { CalendarCheck, CalendarPlus } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { groupByUrgency, todayInZurich } from "@/lib/deadlines";
import { Card, EmptyState, PageHeader, SectionTitle, buttonClass } from "@/components/ui";
import { TaskRow } from "@/components/task-row";
import { NewTaskForm } from "./new-task-form";

export const metadata: Metadata = { title: "À faire" };

export default async function DeadlinesPage() {
  const user = await requireUser();
  const today = todayInZurich();
  const include = { document: { select: { id: true, title: true, sender: true } } } as const;
  const [open, done] = await Promise.all([
    db.task.findMany({ where: { userId: user.id, status: "OPEN" }, include }),
    db.task.findMany({ where: { userId: user.id, status: "DONE" }, include, orderBy: { completedAt: "desc" }, take: 20 }),
  ]);
  const groups = groupByUrgency(open, today);

  return (
    <div className="animate-rise">
      <PageHeader
        title="À faire"
        subtitle="Tout ce que vous devez faire, du plus urgent au plus lointain."
        action={
          open.some((t) => t.dueDate) ? (
            <a href="/api/agenda" className={buttonClass("secondary")}>
              <CalendarPlus className="size-4" aria-hidden="true" /> Ajouter à mon agenda
            </a>
          ) : undefined
        }
      />
      <Card className="mb-8 p-5">
        <NewTaskForm />
      </Card>

      {open.length === 0 ? (
        <EmptyState icon={<CalendarCheck className="size-6" />} title="Aucune échéance ouverte">
          Les échéances apparaissent automatiquement quand vous ajoutez un courrier.
        </EmptyState>
      ) : (
        <div className="grid gap-8">
          {([
            ["En retard", groups.overdue],
            ["Dans les 7 jours", groups.week],
            ["Plus tard", groups.later],
            ["Sans date", groups.undated],
          ] as const).map(([label, items]) =>
            items.length ? (
              <section key={label} aria-label={label}>
                <SectionTitle count={items.length}>{label}</SectionTitle>
                <Card>
                  <ul className="divide-y divide-line">
                    {items.map((t) => (
                      <TaskRow key={t.id} task={t} today={today} />
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
          <summary className="cursor-pointer text-sm font-semibold text-ink-2">Terminées récemment ({done.length})</summary>
          <Card className="mt-3">
            <ul className="divide-y divide-line">
              {done.map((t) => (
                <TaskRow key={t.id} task={t} today={today} />
              ))}
            </ul>
          </Card>
        </details>
      ) : null}
    </div>
  );
}
