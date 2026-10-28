"use server";

import { revalidateAppPages } from "@/lib/revalidate";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { parseIsoDate } from "@/lib/ai/schema";
import type { FormState } from "./types";
import { getT } from "@/i18n/server";

export async function toggleTask(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("taskId") ?? "");
  const done = formData.get("done") === "on";
  await db.task.updateMany({
    where: { id, userId: user.id },
    data: { status: done ? "DONE" : "OPEN", completedAt: done ? new Date() : null },
  });
  revalidateAppPages();
}

const TaskSchema = z.object({
  title: z.string().trim().min(1, "describe").max(140),
  dueDate: z
    .string()
    .trim()
    .refine((v) => v === "" || parseIsoDate(v) !== null, "invalidDate")
    .optional(),
});

export async function createTask(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const t = await getT();
  const parsed = TaskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const message = issue?.message === "describe" ? t.tasks.describe : issue?.message === "invalidDate" ? t.validation.invalidDate : t.validation.tooLong;
    return { fieldErrors: { [String(issue?.path[0] ?? "title")]: message } };
  }
  await db.task.create({
    data: { userId: user.id, title: parsed.data.title, dueDate: parsed.data.dueDate ? parseIsoDate(parsed.data.dueDate) : null },
  });
  revalidateAppPages();
  return { success: t.tasks.added };
}

export async function deleteTask(formData: FormData): Promise<void> {
  const user = await requireUser();
  await db.task.deleteMany({ where: { id: String(formData.get("taskId") ?? ""), userId: user.id } });
  revalidateAppPages();
}
