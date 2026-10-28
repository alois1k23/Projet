"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Camera, FileUp, X } from "lucide-react";
import { uploadDocument } from "@/app/actions/documents";
import { initialFormState } from "@/app/actions/types";
import { Notice, buttonClass, cx } from "@/components/ui";

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
const MAX_BYTES = 10 * 1024 * 1024;

function Progress({ aiEnabled }: { aiEnabled: boolean }) {
  const { pending } = useFormStatus();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!pending) {
      setStep(0);
      return;
    }
    const id = setInterval(() => setStep((s) => Math.min(s + 1, 3)), 4000);
    return () => clearInterval(id);
  }, [pending]);
  if (!pending) return null;
  const steps = aiEnabled
    ? ["Envoi sécurisé du document…", "Lecture du courrier…", "Recherche des montants et des échéances…", "Rédaction de l’explication…"]
    : ["Envoi sécurisé du document…"];
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
      <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
      {steps[Math.min(step, steps.length - 1)]}
    </div>
  );
}

function Submit({ disabled, aiEnabled }: { disabled: boolean; aiEnabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={disabled || pending} className={buttonClass("primary", "lg", "w-full")}>
      {pending ? "Analyse en cours…" : aiEnabled ? "Analyser ce courrier" : "Enregistrer ce courrier"}
    </button>
  );
}

export function UploadForm({ aiEnabled }: { aiEnabled: boolean }) {
  const [state, action] = useActionState(uploadDocument, initialFormState);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function select(f: File | null) {
    setLocalError(null);
    if (f && f.size > MAX_BYTES) {
      setLocalError("Le fichier dépasse 10 Mo.");
      return;
    }
    setFile(f);
    if (f && inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(f);
      inputRef.current.files = dt.files;
    }
  }

  const error = localError ?? state.error;

  return (
    <form action={action} className="space-y-4">
      {error ? <Notice tone="danger">{error}</Notice> : null}

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
          "relative overflow-hidden rounded-[var(--radius-card)] border-2 border-dashed bg-surface transition-colors",
          dragging ? "border-primary bg-primary-soft" : "border-line-strong",
        )}
      >
        <input
          ref={inputRef}
          id="file"
          name="file"
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => select(e.currentTarget.files?.[0] ?? null)}
        />
        {file ? (
          <div className="flex items-center gap-4 p-4">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), non optimisable
              <img src={preview} alt="Aperçu du courrier" className="h-28 w-22 shrink-0 rounded-lg border border-line object-cover" />
            ) : (
              <span className="grid h-28 w-22 shrink-0 place-items-center rounded-lg bg-surface-2 text-xs font-bold text-ink-2">PDF</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{file.name}</p>
              <p className="tabular text-sm text-ink-3">{(file.size / 1024 / 1024).toFixed(1)} Mo</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className={buttonClass("ghost", "sm")}
              aria-label="Retirer ce fichier"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary" aria-hidden="true">
              <Camera className="size-7" />
            </span>
            <p className="text-lg font-bold">Photographiez ou importez votre courrier</p>
            <p className="mt-1 max-w-sm text-sm text-ink-2">Posez la lettre à plat, bien éclairée, toute la page visible. JPEG, PNG, WebP ou PDF, 10 Mo au maximum.</p>
            <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <label htmlFor="camera" className={buttonClass("primary", "md", "cursor-pointer sm:hidden")}>
                <Camera className="size-4" aria-hidden="true" /> Prendre une photo
              </label>
              <input
                id="camera"
                type="file"
                aria-label="Prendre une photo du courrier"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => select(e.currentTarget.files?.[0] ?? null)}
              />
              <label htmlFor="file" className={buttonClass("secondary", "md", "cursor-pointer")}>
                <FileUp className="size-4" aria-hidden="true" /> Choisir un fichier
              </label>
            </div>
            <p className="mt-4 hidden text-xs text-ink-3 sm:block">ou glissez-déposez le fichier ici</p>
          </div>
        )}
      </div>

      <Progress aiEnabled={aiEnabled} />
      <Submit disabled={!file} aiEnabled={aiEnabled} />
    </form>
  );
}
