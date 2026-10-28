"use client";

import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { joinWaitlist } from "@/app/actions/waitlist";
import { initialFormState } from "@/app/actions/types";
import { SubmitButton } from "@/components/client";
import { FieldError, Input, Label, Notice } from "@/components/ui";

export function WaitlistForm({ labels }: { labels: { email: string; submit: string; sending: string } }) {
  const [state, action] = useActionState(joinWaitlist, initialFormState);
  if (state.success) {
    return (
      <p role="status" className="flex items-start gap-2 rounded-xl bg-success-soft p-4 font-semibold text-success">
        <MailCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> {state.success}
      </p>
    );
  }
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-3" noValidate>
      <input type="hidden" name="interest" value="plus" />
      {state.error ? <Notice tone="danger">{state.error}</Notice> : null}
      <div>
        <Label htmlFor="waitlist-email">{labels.email}</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input id="waitlist-email" name="email" type="email" inputMode="email" autoComplete="email" required defaultValue={state.values?.email} aria-invalid={!!e.email} aria-describedby="waitlist-email-error" className="sm:flex-1" />
          <SubmitButton pendingLabel={labels.sending}>{labels.submit}</SubmitButton>
        </div>
        <FieldError id="waitlist-email-error" message={e.email} />
      </div>
    </form>
  );
}
