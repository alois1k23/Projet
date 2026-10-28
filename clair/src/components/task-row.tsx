import Link from "next/link";
import type { Task } from "@prisma/client";
import { AutoSubmitCheckbox } from "@/components/client";
import { Badge, cx } from "@/components/ui";
import { toggleTask } from "@/app/actions/tasks";
import { formatMoney, formatShortDate, toNumber } from "@/lib/format";
import { relativeLabel, urgencyOf } from "@/lib/deadlines";

type TaskWithDoc = Task & { document?: { id: string; title: string; sender: string | null } | null };

const URGENCY_TONE = { overdue: "danger", today: "mark", soon: "mark", later: "neutral", none: "neutral" } as const;

export function DueBadge({ dueDate, today }: { dueDate: Date | null; today: Date }) {
  const u = urgencyOf(dueDate, today);
  return (
    <Badge tone={URGENCY_TONE[u]}>
      <span className="tabular">{relativeLabel(dueDate, today)}</span>
    </Badge>
  );
}

export function TaskRow({ task, today, showDocument = true }: { task: TaskWithDoc; today: Date; showDocument?: boolean }) {
  const done = task.status === "DONE";
  const amount = toNumber(task.amount);
  return (
    <li className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
      <form action={toggleTask} className="pt-0.5">
        <input type="hidden" name="taskId" value={task.id} />
        <AutoSubmitCheckbox name="done" defaultChecked={done} label={done ? `Rouvrir : ${task.title}` : `Marquer comme fait : ${task.title}`} />
      </form>
      <div className="min-w-0 flex-1">
        <p className={cx("font-semibold leading-snug", done && "text-ink-3 line-through")}>{task.title}</p>
        {showDocument && task.document ? (
          <Link href={`/courriers/${task.document.id}`} className="mt-0.5 block truncate text-sm text-ink-2 hover:text-primary">
            {task.document.sender ?? task.document.title}
          </Link>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          {!done ? <DueBadge dueDate={task.dueDate} today={today} /> : null}
          {task.dueDate ? <span className="tabular text-ink-3">{formatShortDate(task.dueDate)}</span> : null}
        </div>
      </div>
      {amount !== null ? <p className={cx("tabular pt-0.5 text-right font-bold whitespace-nowrap", done && "text-ink-3")}>{formatMoney(amount)}</p> : null}
    </li>
  );
}
