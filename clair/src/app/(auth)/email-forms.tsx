"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { confirmLoginLink, requestLoginLink, requestPasswordReset, resetPassword } from "@/app/actions/email-auth";
import { initialFormState, type FormState } from "@/app/actions/types";
import { SubmitButton } from "@/components/client";
import { PasswordInput } from "@/components/password-input";
import { FieldError, Input, Label, Notice } from "@/components/ui";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/constants";
import { useT } from "@/i18n/client";

function Sent({ message }: { message: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-success/30 bg-success-soft p-5" role="status">
      <MailCheck className="mb-2 size-6 text-success" aria-hidden="true" />
      <p className="font-semibold">{message}</p>
    </div>
  );
}

function EmailRequestForm({ action, submitLabel }: { action: (prev: FormState, data: FormData) => Promise<FormState>; submitLabel: string }) {
  const [state, formAction] = useActionState(action, initialFormState);
  const a = useT().auth;
  if (state.success) return <Sent message={state.success} />;
  const e = state.fieldErrors ?? {};
  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error ? <Notice tone="danger">{state.error}</Notice> : null}
      <div>
        <Label htmlFor="email">{a.email}</Label>
        <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" required defaultValue={state.values?.email} aria-invalid={!!e.email} aria-describedby="email-error" />
        <FieldError id="email-error" message={e.email} />
      </div>
      <SubmitButton className="w-full" size="lg" pendingLabel={a.sending}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  return <EmailRequestForm action={requestPasswordReset} submitLabel={useT().auth.sendResetLink} />;
}

export function LoginLinkForm() {
  return <EmailRequestForm action={requestLoginLink} submitLabel={useT().auth.sendLoginLink} />;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, initialFormState);
  const t = useT();
  const a = t.auth;
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error ? (
        <Notice tone="danger">
          {state.error}{" "}
          <Link href="/mot-de-passe-oublie" className="font-semibold underline">
            {a.newLink}
          </Link>
        </Notice>
      ) : null}
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="password" hint={a.newPasswordHint(PASSWORD_MIN_LENGTH)}>
          {a.newPassword}
        </Label>
        <PasswordInput id="password" name="password" autoComplete="new-password" required aria-invalid={!!e.password} aria-describedby="password-error" />
        <FieldError id="password-error" message={e.password} />
      </div>
      <SubmitButton className="w-full" size="lg" pendingLabel={t.common.saving}>
        {a.saveAndLogin}
      </SubmitButton>
    </form>
  );
}

export function ConfirmLoginForm({ token }: { token: string }) {
  const [state, action] = useActionState(confirmLoginLink, initialFormState);
  const a = useT().auth;
  return (
    <form action={action} className="space-y-5">
      {state.error ? <Notice tone="danger">{state.error}</Notice> : null}
      <input type="hidden" name="token" value={token} />
      <SubmitButton className="w-full" size="lg" pendingLabel={a.loggingIn}>
        {a.loginNow}
      </SubmitButton>
    </form>
  );
}
