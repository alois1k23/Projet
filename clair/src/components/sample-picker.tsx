import { FileSearch } from "lucide-react";
import { SAMPLES } from "@/lib/samples";
import { addSample } from "@/app/actions/documents";
import { SubmitButton } from "@/components/client";
import { getLocale, getT } from "@/i18n/server";

/** Permet de découvrir Clair avec des courriers fictifs, sans téléverser de document personnel. */
export async function SamplePicker() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return (
    <div>
      <p className="mb-3 text-sm text-ink-2">{t.samples.tryLabel}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {SAMPLES.map((s) => (
          <form key={s.id} action={addSample}>
            <input type="hidden" name="sampleId" value={s.id} />
            <SubmitButton variant="secondary" size="sm" className="w-full justify-start sm:w-auto" pendingLabel={t.samples.opening}>
              <FileSearch className="size-4" aria-hidden="true" />
              {s.label[locale]}
            </SubmitButton>
          </form>
        ))}
      </div>
    </div>
  );
}
