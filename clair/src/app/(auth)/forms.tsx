"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import { initialFormState } from "@/app/actions/types";
import { SubmitButton } from "@/components/client";
import { PasswordInput } from "@/components/password-input";
import { FieldError, Input, Label, Notice } from "@/components/ui";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/constants";
import { useT } from "@/i18n/client";

export function LoginForm({ mail }: { mail: boolean }) {
  const [state, action] = useActionState(login, initialFormState);
  const a = useT().auth;
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error ? <Notice tone="danger">{state.error}</Notice> : null}
      <div>
        <Label htmlFor="email">{a.email}</Label>
        <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" required defaultValue={state.values?.email} aria-invalid={!!e.email} aria-describedby="email-error" />
        <FieldError id="email-error" message={e.email} />
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor="password">{a.password}</Label>
          {mail ? (
            <Link href="/mot-de-passe-oublie" className="text-sm font-semibold text-primary hover:underline">
              {a.forgot}
            </Link>
          ) : null}
        </div>
        <PasswordInput id="password" name="password" autoComplete="current-password" required aria-invalid={!!e.password} aria-describedby="password-error" />
        <FieldError id="password-error" message={e.password} />
      </div>
      <SubmitButton className="w-full" size="lg" pendingLabel={a.loggingIn}>
        {a.login}
      </SubmitButton>
      <p className="text-center text-sm text-ink-2">
        {a.noAccount}{" "}
        <Link href="/inscription" className="font-semibold text-primary hover:underline">
          {a.createAccount}
        </Link>
      </p>
    </form>
  );
}

/** Inscription réduite à l'essentiel : e-mail et mot de passe. Le nom est demandé plus tard, seulement si une lettre en a besoin. */
export function SignupForm() {
  const [state, action] = useActionState(signup, initialFormState);
  const a = useT().auth;
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error ? <Notice tone="danger">{state.error}</Notice> : null}
      <div>
        <Label htmlFor="email">{a.email}</Label>
        <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" required defaultValue={state.values?.email} aria-invalid={!!e.email} aria-describedby="email-error" />
        <FieldError id="email-error" message={e.email} />
      </div>
      <div>
        <Label htmlFor="password" hint={a.passwordHint(PASSWORD_MIN_LENGTH)}>
          {a.choosePassword}
        </Label>
        <PasswordInput id="password" name="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required aria-invalid={!!e.password} aria-describedby="password-error" />
        <FieldError id="password-error" message={e.password} />
      </div>
      <SubmitButton className="w-full" size="lg" pendingLabel={a.creating}>
        {a.signupSubmit}
      </SubmitButton>
      <p className="text-center text-xs text-ink-3">
        {a.consent.before}{" "}
        <Link href="/conditions" className="font-semibold underline hover:text-ink">
          {a.consent.terms}
        </Link>{" "}
        {a.consent.and}{" "}
        <Link href="/confidentialite" className="font-semibold underline hover:text-ink">
          {a.consent.privacy}
        </Link>
        .
      </p>
      <p className="text-center text-sm text-ink-2">
        {a.alreadyAccount}{" "}
        <Link href="/connexion" className="font-semibold text-primary hover:underline">
          {a.login}
        </Link>
      </p>
    </form>
  );
}
