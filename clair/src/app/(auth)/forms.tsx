"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import { initialFormState } from "@/app/actions/types";
import { SubmitButton } from "@/components/client";
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
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} aria-invalid={!!e.email} aria-describedby="email-error" />
        <FieldError id="email-error" message={e.email} />
      </div>
      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={!!e.password} aria-describedby="password-error" />
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

export function SignupForm() {
  const [state, action] = useActionState(signup, initialFormState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error ? <Notice tone="danger">{state.error}</Notice> : null}
      <div>
        <Label htmlFor="name">Prénom et nom</Label>
        <Input id="name" name="name" autoComplete="name" required defaultValue={state.values?.name} aria-invalid={!!e.name} aria-describedby="name-error" />
        <FieldError id="name-error" message={e.name} />
      </div>
      <div>
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} aria-invalid={!!e.email} aria-describedby="email-error" />
        <FieldError id="email-error" message={e.email} />
      </div>
      <div>
        <Label htmlFor="password" hint={`Au moins ${PASSWORD_MIN_LENGTH} caractères. Une phrase facile à retenir fonctionne très bien.`}>
          Mot de passe
        </Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required aria-invalid={!!e.password} aria-describedby="password-error" />
        <FieldError id="password-error" message={e.password} />
      </div>
      <div>
        <label className="flex items-start gap-3 text-sm text-ink-2">
          <input type="checkbox" name="consent" className="mt-0.5 size-5 shrink-0 accent-[var(--primary)]" aria-invalid={!!e.consent} aria-describedby="consent-error" />
          <span>
            J’accepte les{" "}
            <Link href="/conditions" className="font-semibold text-primary hover:underline" target="_blank">
              conditions d’utilisation
            </Link>{" "}
            et la{" "}
            <Link href="/confidentialite" className="font-semibold text-primary hover:underline" target="_blank">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
        <FieldError id="consent-error" message={e.consent} />
      </div>
      <SubmitButton className="w-full" size="lg" pendingLabel="Création du compte…">
        Créer mon compte
      </SubmitButton>
      <p className="text-center text-sm text-ink-2">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-semibold text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
