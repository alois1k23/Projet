"use client";

import { useActionState } from "react";
import { updateDocument } from "@/app/actions/documents";
import { initialFormState } from "@/app/actions/types";
import { SubmitButton } from "@/components/client";
import { FieldError, Input, Label, Notice, Select, Textarea } from "@/components/ui";

export interface EditDefaults {
  documentId: string;
  title: string;
  sender: string;
  category: string;
  amount: string;
  dueDate: string;
  summary: string;
}

export function EditForm({ defaults, categories }: { defaults: EditDefaults; categories: { value: string; label: string }[] }) {
  const [state, action] = useActionState(updateDocument, initialFormState);
  const e = state.fieldErrors ?? {};
  const v = { ...defaults, ...state.values };
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2" noValidate>
      <input type="hidden" name="documentId" value={defaults.documentId} />
      {state.error ? (
        <div className="sm:col-span-2">
          <Notice tone="danger">{state.error}</Notice>
        </div>
      ) : null}
      <div className="sm:col-span-2">
        <Label htmlFor="title">Titre</Label>
        <Input id="title" name="title" defaultValue={v.title} required aria-invalid={!!e.title} aria-describedby="title-error" />
        <FieldError id="title-error" message={e.title} />
      </div>
      <div>
        <Label htmlFor="sender">Expéditeur</Label>
        <Input id="sender" name="sender" defaultValue={v.sender} />
      </div>
      <div>
        <Label htmlFor="category">Type de courrier</Label>
        <Select id="category" name="category" defaultValue={v.category}>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="amount" hint="En CHF, par exemple 186.45">Montant</Label>
        <Input id="amount" name="amount" inputMode="decimal" defaultValue={v.amount} aria-invalid={!!e.amount} aria-describedby="amount-error" />
        <FieldError id="amount-error" message={e.amount} />
      </div>
      <div>
        <Label htmlFor="dueDate" hint="Date limite indiquée sur le courrier">Échéance</Label>
        <Input id="dueDate" name="dueDate" type="date" defaultValue={v.dueDate} aria-invalid={!!e.dueDate} aria-describedby="dueDate-error" />
        <FieldError id="dueDate-error" message={e.dueDate} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="summary">Notes</Label>
        <Textarea id="summary" name="summary" defaultValue={v.summary} placeholder="Ce que dit le courrier, ce qu’il faut faire" />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton pendingLabel="Enregistrement…">Enregistrer</SubmitButton>
      </div>
    </form>
  );
}
