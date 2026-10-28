"use client";

import { useActionState } from "react";
import { deleteAccount, updateProfile } from "@/app/actions/account";
import { initialFormState } from "@/app/actions/types";
import { SubmitButton } from "@/components/client";
import { FieldError, Input, Label } from "@/components/ui";

export function ProfileForm({ defaults }: { defaults: { name: string; addressLine: string; postalCode: string; city: string } }) {
  const [state, action] = useActionState(updateProfile, initialFormState);
  const e = state.fieldErrors ?? {};
  const v = { ...defaults, ...state.values };
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-[140px_1fr]" noValidate>
      <div className="sm:col-span-2">
        <Label htmlFor="name">Prénom et nom</Label>
        <Input id="name" name="name" autoComplete="name" defaultValue={v.name} aria-invalid={!!e.name} aria-describedby="name-error" />
        <FieldError id="name-error" message={e.name} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="addressLine">Rue et numéro</Label>
        <Input id="addressLine" name="addressLine" autoComplete="street-address" defaultValue={v.addressLine} />
      </div>
      <div>
        <Label htmlFor="postalCode">NPA</Label>
        <Input id="postalCode" name="postalCode" inputMode="numeric" autoComplete="postal-code" defaultValue={v.postalCode} aria-invalid={!!e.postalCode} aria-describedby="postalCode-error" />
        <FieldError id="postalCode-error" message={e.postalCode} />
      </div>
      <div>
        <Label htmlFor="city">Localité</Label>
        <Input id="city" name="city" autoComplete="address-level2" defaultValue={v.city} />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <SubmitButton pendingLabel="Enregistrement…">Enregistrer</SubmitButton>
        <p role="status" aria-live="polite" className="text-sm font-semibold text-success">
          {state.success}
        </p>
      </div>
    </form>
  );
}

export function DeleteAccountForm({ email }: { email: string }) {
  const [state, action] = useActionState(deleteAccount, initialFormState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-3" noValidate>
      <div>
        <Label htmlFor="confirmEmail" hint={`Pour confirmer, saisissez ${email}`}>
          Adresse e-mail du compte
        </Label>
        <Input id="confirmEmail" name="confirmEmail" type="email" autoComplete="off" aria-invalid={!!e.confirmEmail} aria-describedby="confirmEmail-error" />
        <FieldError id="confirmEmail-error" message={e.confirmEmail} />
      </div>
      <SubmitButton variant="danger" pendingLabel="Suppression…">
        Supprimer définitivement mon compte
      </SubmitButton>
    </form>
  );
}
