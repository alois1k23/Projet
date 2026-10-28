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
  const draft = useMemo(() => buildLetter(template, values, language), [template, values, language]);
  const e = state.fieldErrors ?? {};
  const missingAddress = !sender.addressLine || !sender.city;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={action} className="space-y-4" noValidate>
        <input type="hidden" name="templateId" value={template.id} />
        {documentId ? <input type="hidden" name="documentId" value={documentId} /> : null}
        {state.error ? <Notice tone="danger">{state.error}</Notice> : null}
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
        {missingAddress ? (
          <div className="mb-3">
            <Notice tone="warning">
              Ajoutez votre adresse dans les <a className="font-semibold underline" href="/reglages">réglages</a> pour qu’elle figure en en-tête.
            </Notice>
          </div>
        ) : null}
        <Card className="bg-white p-6 font-[Helvetica,Arial,sans-serif] text-[13px] leading-relaxed text-[#14181f] dark:border-line">
          <p className="whitespace-pre-line text-xs">{senderBlock(sender)}</p>
          <p className="mt-6 ml-auto w-1/2 whitespace-pre-line">{draft.recipient || "Destinataire"}</p>
          <p className="mt-6">{placeAndDate(sender, new Date(), language)}</p>
          <p className="mt-4 font-bold">{draft.subject}</p>
          <p className="mt-3 whitespace-pre-line">{draft.body}</p>
          <p className="mt-8">{sender.name}</p>
        </Card>
      </div>
    </div>
  );
}
