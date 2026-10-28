"use client";

import { useActionState, useMemo, useState } from "react";
import { createLetter } from "@/app/actions/letters";
import { initialFormState } from "@/app/actions/types";
import { SubmitButton } from "@/components/client";
import { Card, FieldError, Input, Label, Notice, Select, Textarea } from "@/components/ui";
import { buildLetter, placeAndDate, senderBlock, TEMPLATES, type LetterLanguage, type Sender, type TemplateId } from "@/lib/letters/templates";

export function LetterForm({
  templateId,
  documentId,
  initialValues,
  sender,
}: {
  templateId: TemplateId;
  documentId: string | null;
  initialValues: Record<string, string>;
  sender: Sender;
}) {
  const template = TEMPLATES[templateId];
  const [state, action] = useActionState(createLetter, initialFormState);
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [language, setLanguage] = useState<LetterLanguage>("fr");
  const [me, setMe] = useState<Sender>(sender);
  const draft = useMemo(() => buildLetter(template, values, language), [template, values, language]);
  const e = state.fieldErrors ?? {};
  // Les coordonnées ne sont demandées que si elles manquent, puis enregistrées dans le profil.
  const [askSender] = useState(() => !sender.name || !sender.addressLine || !sender.postalCode || !sender.city);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={action} className="space-y-4" noValidate>
        <input type="hidden" name="templateId" value={template.id} />
        {documentId ? <input type="hidden" name="documentId" value={documentId} /> : null}
        {state.error ? <Notice tone="danger">{state.error}</Notice> : null}
        {askSender ? (
          <fieldset className="space-y-3 rounded-xl border border-line bg-surface-2/60 p-4">
            <legend className="px-1 text-sm font-bold">Vos coordonnées</legend>
            <p className="text-xs text-ink-3">Elles figurent en haut de la lettre. Nous les gardons pour les prochaines.</p>
            {(
              [
                ["senderName", "Prénom et nom", "name", "name"],
                ["senderAddressLine", "Rue et numéro", "addressLine", "street-address"],
                ["senderPostalCode", "NPA", "postalCode", "postal-code"],
                ["senderCity", "Localité", "city", "address-level2"],
              ] as const
            ).map(([name, label, key, auto]) => (
              <div key={name}>
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  name={name}
                  autoComplete={auto}
                  inputMode={key === "postalCode" ? "numeric" : undefined}
                  value={me[key] ?? ""}
                  onChange={(ev) => setMe((prev) => ({ ...prev, [key]: ev.target.value }))}
                  aria-invalid={!!e[name]}
                  aria-describedby={`${name}-error`}
                />
                <FieldError id={`${name}-error`} message={e[name]} />
              </div>
            ))}
          </fieldset>
        ) : null}
        <div>
          <Label htmlFor="language" hint="Écrivez dans la langue du destinataire">Langue de la lettre</Label>
          <Select id="language" name="language" value={language} onChange={(ev) => setLanguage(ev.target.value === "de" ? "de" : "fr")}>
            <option value="fr">Français</option>
            <option value="de">Allemand</option>
          </Select>
        </div>
        {template.fields.map((field) => {
          const common = {
            id: field.key,
            name: field.key,
            value: values[field.key] ?? "",
            "aria-invalid": !!e[field.key],
            "aria-describedby": `${field.key}-error`,
          };
          const update = (value: string) => setValues((prev) => ({ ...prev, [field.key]: value }));
          return (
            <div key={field.key}>
              <Label htmlFor={field.key} hint={field.hint}>
                {field.label}
                {field.required ? null : <span className="font-normal text-ink-3"> (facultatif)</span>}
              </Label>
              {field.type === "textarea" ? (
                <Textarea {...common} onChange={(ev) => update(ev.target.value)} rows={3} />
              ) : field.type === "select" ? (
                <Select {...common} onChange={(ev) => update(ev.target.value)}>
                  <option value="">Choisir…</option>
                  {field.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input {...common} type={field.type === "date" ? "date" : "text"} onChange={(ev) => update(ev.target.value)} />
              )}
              <FieldError id={`${field.key}-error`} message={e[field.key]} />
            </div>
          );
        })}
        <SubmitButton size="lg" className="w-full" pendingLabel="Préparation…">
          Préparer la lettre
        </SubmitButton>
      </form>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-xs font-bold tracking-[0.08em] text-ink-3 uppercase">Aperçu</p>
        <Card className="bg-white p-6 font-[Helvetica,Arial,sans-serif] text-[13px] leading-relaxed text-[#14181f] dark:border-line">
          <p className="whitespace-pre-line text-xs">{senderBlock({ ...me, name: me.name || "Vos nom et adresse" })}</p>
          <p className="mt-6 ml-auto w-1/2 whitespace-pre-line">{draft.recipient || "Destinataire"}</p>
          <p className="mt-6">{placeAndDate(me, new Date(), language)}</p>
          <p className="mt-4 font-bold">{draft.subject}</p>
          <p className="mt-3 whitespace-pre-line">{draft.body}</p>
          <p className="mt-8">{me.name}</p>
        </Card>
      </div>
    </div>
  );
}
