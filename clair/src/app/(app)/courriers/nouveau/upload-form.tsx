"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Camera, FileUp, ImagePlus } from "lucide-react";
import { uploadDocument } from "@/app/actions/documents";
import { initialFormState } from "@/app/actions/types";
import { Notice, buttonClass, cx } from "@/components/ui";
import { prepareImage } from "@/lib/prepare-image";

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf";
const MAX_BYTES = 10 * 1024 * 1024;

function Progress({ aiEnabled, preview, name }: { aiEnabled: boolean; preview: string | null; name: string }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, 3)), 4000);
    return () => clearInterval(id);
  }, []);
  const steps = aiEnabled
    ? ["Envoi sécurisé du document…", "Lecture du courrier…", "Recherche des montants et des échéances…", "Rédaction de l’explication…"]
    : ["Envoi sécurisé du document…"];
  return (
    <div className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-4" role="status" aria-live="polite">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), non optimisable
        <img src={preview} alt="" className="h-24 w-18 shrink-0 rounded-lg border border-line object-cover" />
      ) : (
        <span className="grid h-24 w-18 shrink-0 place-items-center rounded-lg bg-surface-2 text-xs font-bold text-ink-2">PDF</span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink-3">{name}</p>
        <p className="mt-1 flex items-center gap-2 font-semibold text-primary">
          <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
          {steps[Math.min(step, steps.length - 1)]}
        </p>
        {aiEnabled ? <p className="mt-1 text-xs text-ink-3">Cela prend en général de 10 à 30 secondes.</p> : null}
      </div>
    </div>
  );
}

/**
 * Un seul geste : dès qu'une photo est prise ou qu'un fichier est choisi, l'envoi et l'analyse démarrent.
 */
export function UploadForm({ aiEnabled }: { aiEnabled: boolean }) {
  const [state, action, pending] = useActionState(uploadDocument, initialFormState);
  const [preparing, startPreparing] = useTransition();
  const [current, setCurrent] = useState<{ name: string; preview: string | null } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = pending || preparing;

  useEffect(() => () => {
    if (current?.preview) URL.revokeObjectURL(current.preview);
  }, [current]);

  function select(original: File | null) {
    setLocalError(null);
    if (!original) return;
    startPreparing(async () => {
      const file = await prepareImage(original);
      if (file.size > MAX_BYTES) {
        setLocalError("Le fichier dépasse 10 Mo. Prenez une photo plutôt qu’un scan haute résolution, ou réduisez le PDF.");
        return;
      }
      setCurrent({ name: original.name, preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null });
      const dt = new DataTransfer();
      dt.items.add(file);
      if (inputRef.current) inputRef.current.files = dt.files;
      formRef.current?.requestSubmit();
    });
  }

  const error = localError ?? (busy ? null : state.error);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {error ? <Notice tone="danger">{error}</Notice> : null}

      <input ref={inputRef} id="file" name="file" type="file" accept={ACCEPT} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => select(e.currentTarget.files?.[0] ?? null)} />

      {busy && current ? (
        <Progress aiEnabled={aiEnabled} preview={current.preview} name={current.name} />
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            select(e.dataTransfer.files[0] ?? null);
          }}
          className={cx(
            "flex flex-col items-center rounded-[var(--radius-card)] border-2 border-dashed bg-surface px-6 py-10 text-center transition-colors",
            dragging ? "border-primary bg-primary-soft" : "border-line-strong",
          )}
        >
          <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary" aria-hidden="true">
            <Camera className="size-7" />
          </span>
          <p className="text-lg font-bold">Photographiez votre courrier</p>
          <p className="mt-1 max-w-sm text-sm text-ink-2">Posez la lettre à plat, dans un endroit éclairé, avec toute la page visible. L’analyse démarre toute seule.</p>
          <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <label className={buttonClass("primary", "lg", "cursor-pointer sm:hidden")}>
              <Camera className="size-5" aria-hidden="true" /> Prendre une photo
              <input type="file" accept="image/*" capture="environment" className="sr-only" disabled={busy} onChange={(e) => select(e.currentTarget.files?.[0] ?? null)} />
            </label>
            <label className={buttonClass("secondary", "lg", "cursor-pointer sm:hidden")}>
              <ImagePlus className="size-5" aria-hidden="true" /> Choisir une photo ou un PDF
              <input type="file" accept={ACCEPT} className="sr-only" disabled={busy} onChange={(e) => select(e.currentTarget.files?.[0] ?? null)} />
            </label>
            <label className={buttonClass("primary", "lg", "hidden cursor-pointer sm:inline-flex")}>
              <FileUp className="size-5" aria-hidden="true" /> Choisir un fichier
              <input data-testid="desktop-file" type="file" accept={ACCEPT} className="sr-only" disabled={busy} onChange={(e) => select(e.currentTarget.files?.[0] ?? null)} />
            </label>
          </div>
          <p className="mt-4 hidden text-xs text-ink-3 sm:block">ou glissez-déposez le fichier ici · photo ou PDF, 10 Mo au maximum</p>
        </div>
      )}
    </form>
  );
}
