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

export const metadata: Metadata = { title: "Accueil" };

function greeting(now = new Date()) {
  return zurichHour(now) < 18 ? "Bonjour" : "Bonsoir";
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ bienvenue?: string }> }) {
  const user = await requireUser();
  const { bienvenue } = await searchParams;
  const today = todayInZurich();
  const [tasks, recent, docCount] = await Promise.all([
    db.task.findMany({ where: { userId: user.id, status: "OPEN" }, include: { document: { select: { id: true, title: true, sender: true } } } }),
    db.document.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 4 }),
    db.document.count({ where: { userId: user.id } }),
  ]);
  const groups = groupByUrgency(tasks, today);
  const urgentCount = groups.overdue.length + groups.week.length;
  const toPay = tasks.filter((t) => t.kind === "PAY").reduce((sum, t) => sum + (toNumber(t.amount) ?? 0), 0);
  const firstName = user.name?.split(" ")[0] ?? "";

  return (
    <div className="animate-rise">
      <header className="mb-8">
        <h1 className="text-[28px] leading-tight font-extrabold tracking-tight sm:text-4xl">
          {greeting()}
          {firstName ? ` ${firstName}` : ""}.
        </h1>
        <p className="mt-2 text-lg text-ink-2">
          {tasks.length === 0 ? (
            "Rien à faire pour le moment."
          ) : urgentCount > 0 ? (
            <>
              <span className="mark font-semibold text-ink">
                {urgentCount} chose{urgentCount > 1 ? "s" : ""} à faire cette semaine
              </span>
              {toPay > 0 ? <> · {formatMoney(toPay)} à payer au total</> : null}
            </>
          ) : (
            <>
              {tasks.length} chose{tasks.length > 1 ? "s" : ""} à faire, rien d’urgent cette semaine.
            </>
          )}
        </p>
      </header>

      {bienvenue && docCount > 0 ? (
        <div className="mb-8">
          <Notice tone="mark" title="Bienvenue dans Clair">
            Photographiez votre prochain courrier administratif : Clair vous dira ce qu’il signifie et ce que vous devez faire.
          </Notice>
        </div>
      ) : null}

      {docCount === 0 ? (
        <Card className="p-6 sm:p-8">
          <h2 className="text-xl font-bold">{bienvenue ? "Bienvenue ! Commencez par votre premier courrier" : "Commencez par votre premier courrier"}</h2>
          <ol className="mt-4 grid gap-3 text-ink-2 sm:grid-cols-3">
            {["Photographiez une facture, un avis d’impôt ou un courrier de votre caisse.", "Clair l’explique et surligne ce qu’il faut faire.", "Cochez quand c’est fait. Clair garde tout le reste."].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
          <ButtonLink href="/courriers/nouveau" size="lg" className="mt-6 w-full sm:w-auto">
            <Camera className="size-5" aria-hidden="true" /> Photographier un courrier
          </ButtonLink>
          <div className="mt-8 border-t border-line pt-6">
            <SamplePicker />
          </div>
        </Card>
      ) : (
        <div className="grid gap-8">
          {tasks.length === 0 ? (
            <EmptyState icon={<CheckCircle2 className="size-6" />} title="Tout est à jour">
              Aucune échéance ouverte. Ajoutez un courrier dès qu’il arrive.
            </EmptyState>
          ) : (
            <>
              {([
                ["En retard", groups.overdue],
                ["Cette semaine", groups.week],
                ["Plus tard", groups.later],
                ["Sans date", groups.undated],
              ] as const).map(([label, items]) =>
                items.length > 0 ? (
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
            </>
          )}

          <section aria-label="Derniers courriers">
            <div className="flex items-center justify-between">
              <SectionTitle>Derniers courriers</SectionTitle>
              <Link href="/courriers" className="mb-3 text-sm font-semibold text-primary hover:underline">
                Tout voir
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
