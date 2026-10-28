import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { buildCalendar } from "@/lib/ics";
import { formatMoney, toNumber } from "@/lib/format";

/** Exporte les échéances ouvertes au format iCalendar (.ics). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Non autorisé", { status: 401 });
  const tasks = await db.task.findMany({
    where: { userId: user.id, status: "OPEN", dueDate: { not: null } },
    include: { document: { select: { title: true, sender: true } } },
  });
  const body = buildCalendar(
    tasks.map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate!,
      description: [t.document ? `${t.document.sender ?? ""} – ${t.document.title}` : "", toNumber(t.amount) !== null ? formatMoney(toNumber(t.amount)) : ""].filter(Boolean).join("\n"),
    })),
  );
  return new Response(body, {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'attachment; filename="clair-echeances.ics"', "Cache-Control": "private, no-store" },
  });
}
