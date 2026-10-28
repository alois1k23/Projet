"use server";

import { revalidateAppPages } from "@/lib/revalidate";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { parseIsoDate } from "@/lib/ai/schema";
import type { FormState } from "./types";

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
  title: z.string().trim().min(1, "Décrivez la tâche.").max(140),
  dueDate: z
    .string()
    .trim()
    .refine((v) => v === "" || parseIsoDate(v) !== null, "Date invalide.")
    .optional(),
});

export async function createTask(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = TaskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: { [String(parsed.error.issues[0]?.path[0] ?? "title")]: parsed.error.issues[0]?.message ?? "Invalide." } };
  await db.task.create({
    data: { userId: user.id, title: parsed.data.title, dueDate: parsed.data.dueDate ? parseIsoDate(parsed.data.dueDate) : null },
  });
  revalidateAppPages();
  return { success: "Échéance ajoutée." };
}

export async function deleteTask(formData: FormData): Promise<void> {
  const user = await requireUser();
  await db.task.deleteMany({ where: { id: String(formData.get("taskId") ?? ""), userId: user.id } });
  revalidateAppPages();
}
