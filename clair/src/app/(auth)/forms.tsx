"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import { initialFormState } from "@/app/actions/types";
import { SubmitButton } from "@/components/client";
import { PasswordInput } from "@/components/password-input";
import { FieldError, Input, Label, Notice } from "@/components/ui";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/constants";

export function LoginForm() {
  const [state, action] = useActionState(login, initialFormState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error ? <Notice tone="danger">{state.error}</Notice> : null}
      <div>
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" required defaultValue={state.values?.email} aria-invalid={!!e.email} aria-describedby="email-error" />
        <FieldError id="email-error" message={e.email} />
      </div>
      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <PasswordInput id="password" name="password" autoComplete="current-password" required aria-invalid={!!e.password} aria-describedby="password-error" />
        <FieldError id="password-error" message={e.password} />
      </div>
      <SubmitButton className="w-full" size="lg" pendingLabel="Connexion…">
        Se connecter
      </SubmitButton>
      <p className="text-center text-sm text-ink-2">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-primary hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}

/** Inscription réduite à l'essentiel : e-mail et mot de passe. Le nom est demandé plus tard, seulement si une lettre en a besoin. */
export function SignupForm() {
  const [state, action] = useActionState(signup, initialFormState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error ? <Notice tone="danger">{state.error}</Notice> : null}
      <div>
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" required defaultValue={state.values?.email} aria-invalid={!!e.email} aria-describedby="email-error" />
        <FieldError id="email-error" message={e.email} />
      </div>
      <div>
        <Label htmlFor="password" hint={`Au moins ${PASSWORD_MIN_LENGTH} caractères. Une petite phrase est plus facile à retenir.`}>
          Choisissez un mot de passe
        </Label>
        <PasswordInput id="password" name="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required aria-invalid={!!e.password} aria-describedby="password-error" />
        <FieldError id="password-error" message={e.password} />
      </div>
      <SubmitButton className="w-full" size="lg" pendingLabel="Création du compte…">
        Créer mon compte gratuit
      </SubmitButton>
      <p className="text-center text-xs text-ink-3">
        En créant un compte, vous acceptez les{" "}
        <Link href="/conditions" className="font-semibold underline hover:text-ink">
          conditions d’utilisation
        </Link>{" "}
        et la{" "}
        <Link href="/confidentialite" className="font-semibold underline hover:text-ink">
          politique de confidentialité
        </Link>
        .
      </p>
      <p className="text-center text-sm text-ink-2">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-semibold text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
