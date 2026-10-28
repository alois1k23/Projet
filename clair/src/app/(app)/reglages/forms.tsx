"use client";

import { useActionState } from "react";
import { deleteAccount, updateProfile } from "@/app/actions/account";
import { changePassword } from "@/app/actions/email-auth";
import { PasswordInput } from "@/components/password-input";
import { initialFormState } from "@/app/actions/types";
import { SubmitButton } from "@/components/client";
import { FieldError, Input, Label } from "@/components/ui";
import { useT } from "@/i18n/client";

export function ProfileForm({ defaults }: { defaults: { name: string; addressLine: string; postalCode: string; city: string } }) {
  const [state, action] = useActionState(updateProfile, initialFormState);
  const t = useT();
  const e = state.fieldErrors ?? {};
  const v = { ...defaults, ...state.values };
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-[140px_1fr]" noValidate>
      <div className="sm:col-span-2">
        <Label htmlFor="name">{t.letters.fullName}</Label>
        <Input id="name" name="name" autoComplete="name" defaultValue={v.name} aria-invalid={!!e.name} aria-describedby="name-error" />
        <FieldError id="name-error" message={e.name} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="addressLine">{t.letters.street}</Label>
        <Input id="addressLine" name="addressLine" autoComplete="street-address" defaultValue={v.addressLine} />
      </div>
      <div>
        <Label htmlFor="postalCode">{t.letters.postalCode}</Label>
        <Input id="postalCode" name="postalCode" inputMode="numeric" autoComplete="postal-code" defaultValue={v.postalCode} aria-invalid={!!e.postalCode} aria-describedby="postalCode-error" />
        <FieldError id="postalCode-error" message={e.postalCode} />
      </div>
      <div>
        <Label htmlFor="city">{t.letters.city}</Label>
        <Input id="city" name="city" autoComplete="address-level2" defaultValue={v.city} />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <SubmitButton pendingLabel={t.common.saving}>{t.common.save}</SubmitButton>
        <p role="status" aria-live="polite" className="text-sm font-semibold text-success">
          {state.success}
        </p>
      </div>
    </form>
  );
}

export function DeleteAccountForm({ email }: { email: string }) {
  const [state, action] = useActionState(deleteAccount, initialFormState);
  const t = useT();
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-3" noValidate>
      <div>
        <Label htmlFor="confirmEmail" hint={t.settings.confirmEmailHint(email)}>
          {t.settings.confirmEmail}
        </Label>
        <Input id="confirmEmail" name="confirmEmail" type="email" autoComplete="off" aria-invalid={!!e.confirmEmail} aria-describedby="confirmEmail-error" />
        <FieldError id="confirmEmail-error" message={e.confirmEmail} />
      </div>
      <SubmitButton variant="danger" pendingLabel={t.common.deleting}>
        {t.settings.deleteForever}
      </SubmitButton>
    </form>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action] = useActionState(changePassword, initialFormState);
  const t = useT();
  const s = t.settings;
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      {hasPassword ? (
        <div>
          <Label htmlFor="currentPassword">{s.currentPassword}</Label>
          <PasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" aria-invalid={!!e.currentPassword} aria-describedby="currentPassword-error" />
          <FieldError id="currentPassword-error" message={e.currentPassword} />
        </div>
      ) : null}
      <div>
        <Label htmlFor="newPassword">{hasPassword ? s.newPassword : s.password}</Label>
        <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" aria-invalid={!!e.newPassword} aria-describedby="newPassword-error" />
        <FieldError id="newPassword-error" message={e.newPassword} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel={t.common.saving}>{hasPassword ? s.changePassword : s.definePassword}</SubmitButton>
        <p role="status" aria-live="polite" className="text-sm font-semibold text-success">
          {state.success}
        </p>
      </div>
    </form>
  );
}
