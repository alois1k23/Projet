"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTask } from "@/app/actions/tasks";
import { initialFormState } from "@/app/actions/types";
import { SubmitButton } from "@/components/client";
import { FieldError, Input, Label } from "@/components/ui";
import { useT } from "@/i18n/client";

export function NewTaskForm() {
  const [state, action] = useActionState(createTask, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const k = useT().tasks;
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);
  const e = state.fieldErrors ?? {};
  return (
    <form ref={formRef} action={action} className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end" noValidate>
      <div>
        <Label htmlFor="task-title">{k.newTask}</Label>
        <Input id="task-title" name="title" placeholder={k.newTaskPlaceholder} aria-invalid={!!e.title} aria-describedby="task-title-error" />
        <FieldError id="task-title-error" message={e.title} />
      </div>
      <div>
        <Label htmlFor="task-date">{k.date}</Label>
        <Input id="task-date" name="dueDate" type="date" aria-invalid={!!e.dueDate} aria-describedby="task-date-error" />
        <FieldError id="task-date-error" message={e.dueDate} />
      </div>
      <SubmitButton pendingLabel={k.adding}>{k.add}</SubmitButton>
      <p className="text-sm text-success sm:col-span-3" role="status" aria-live="polite">
        {state.success}
      </p>
    </form>
  );
}
