"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Camera, FileText, FileUp, ImagePlus, Plus, X } from "lucide-react";
import { uploadDocument } from "@/app/actions/documents";
import { initialFormState } from "@/app/actions/types";
import { Notice, buttonClass, cx } from "@/components/ui";
import { prepareImage } from "@/lib/prepare-image";
import { useT } from "@/i18n/client";

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf";
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_PAGES = 10;

interface Page {
  file: File;
  preview: string | null;
}

function Thumb({ page, size = "md" }: { page: Page; size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-36 w-26" : "h-24 w-18";
  return page.preview ? (
    // eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), non optimisable
    <img src={page.preview} alt="" className={cx(box, "shrink-0 rounded-lg border border-line object-cover")} />
  ) : (
    <span className={cx(box, "grid shrink-0 place-items-center rounded-lg bg-surface-2 text-ink-2")}>
      <FileText className="size-6" aria-hidden="true" />
    </span>
  );
}

function Progress({ aiEnabled, pages }: { aiEnabled: boolean; pages: Page[] }) {
  const u = useT().upload;
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, 3)), 4000);
    return () => clearInterval(id);
  }, []);
  const steps = aiEnabled ? u.steps : u.steps.slice(0, 1);
  return (
    <div className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-4" role="status" aria-live="polite">
      {pages[0] ? <Thumb page={pages[0]} /> : null}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink-3">{pages.length > 1 ? u.pages(pages.length) : (pages[0]?.file.name ?? "")}</p>
        <p className="mt-1 flex items-center gap-2 font-semibold text-primary">
          <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
          {steps[Math.min(step, steps.length - 1)]}
        </p>
        {aiEnabled ? <p className="mt-1 text-xs text-ink-3">{u.duration}</p> : null}
      </div>
    </div>
  );
}

/**
 * Choisir des fichiers lance l’analyse tout de suite.
 * Avec l’appareil photo, on voit les pages prises et on peut en ajouter avant d’analyser.
 */
export function UploadForm({ aiEnabled }: { aiEnabled: boolean }) {
  const [state, action, pending] = useActionState(uploadDocument, initialFormState);
  const u = useT().upload;
  const [preparing, startPreparing] = useTransition();
  const [pages, setPages] = useState<Page[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = pending || preparing;
  const reviewing = pages.length > 0 && !pending;

  useEffect(() => () => pages.forEach((p) => p.preview && URL.revokeObjectURL(p.preview)), [pages]);

  function submit(all: Page[]) {
    const dt = new DataTransfer();
    all.forEach((p) => dt.items.add(p.file));
    if (inputRef.current) inputRef.current.files = dt.files;
    formRef.current?.requestSubmit();
  }

  /** Prépare les fichiers ; `autoSubmit` envoie directement s’ils viennent d’un choix de fichiers. */
  function add(list: FileList | File[] | null, autoSubmit: boolean) {
    setLocalError(null);
    const originals = Array.from(list ?? []);
    if (originals.length === 0) return;
    startPreparing(async () => {
      const prepared: Page[] = [];
      for (const original of originals) {
        const file = await prepareImage(original);
        if (file.size > MAX_BYTES) {
          setLocalError(u.tooBigLocal);
          return;
        }
        prepared.push({ file, preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null });
      }
      const all = [...pages, ...prepared];
      if (all.length > MAX_PAGES) {
        setLocalError(u.tooManyPages(MAX_PAGES));
        return;
      }
      setPages(all);
      if (autoSubmit && pages.length === 0) submit(all);
    });
  }

  const error = localError ?? (busy ? null : state.error);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {error ? <Notice tone="danger">{error}</Notice> : null}
      <input ref={inputRef} id="file" name="file" type="file" multiple accept={ACCEPT} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => add(e.currentTarget.files, true)} />

      {pending ? (
        <Progress aiEnabled={aiEnabled} pages={pages} />
      ) : reviewing ? (
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-5">
          <p className="font-bold">
            {u.pagesReady(pages.length)}
          </p>
          <p className="mt-0.5 text-sm text-ink-2">{u.anotherPage}</p>
          <ol className="mt-4 flex flex-wrap gap-3" aria-label={u.pagesLabel}>
            {pages.map((p, i) => (
              <li key={p.preview ?? `${p.file.name}-${i}`} className="relative">
                <Thumb page={p} size="lg" />
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-ink/80 px-1.5 py-0.5 text-xs font-bold text-bg">{i + 1}</span>
                <button
                  type="button"
                  onClick={() => setPages(pages.filter((_, j) => j !== i))}
                  aria-label={u.removePage(i + 1)}
                  className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-card hover:text-danger"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
            {pages.length < MAX_PAGES ? (
              <li>
                <label className="grid h-36 w-26 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-line-strong text-center text-xs font-semibold text-ink-2 hover:border-primary hover:text-primary">
                  <span>
                    <Plus className="mx-auto mb-1 size-5" aria-hidden="true" />
                    {u.addPage}
                  </span>
                  <input type="file" accept="image/*" capture="environment" className="sr-only" disabled={busy} onChange={(e) => add(e.currentTarget.files, false)} />
                </label>
              </li>
            ) : null}
          </ol>
          <button type="button" disabled={busy} onClick={() => submit(pages)} className={buttonClass("primary", "lg", "mt-5 w-full")}>
            {u.submit(aiEnabled, pages.length)}
          </button>
        </div>
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
            add(e.dataTransfer.files, true);
          }}
          className={cx(
            "flex flex-col items-center rounded-[var(--radius-card)] border-2 border-dashed bg-surface px-6 py-10 text-center transition-colors",
            dragging ? "border-primary bg-primary-soft" : "border-line-strong",
          )}
        >
          <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary" aria-hidden="true">
            <Camera className="size-7" />
          </span>
          <p className="text-lg font-bold">{u.dropTitle}</p>
          <p className="mt-1 max-w-sm text-sm text-ink-2">{u.dropHint}</p>
          <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <label className={buttonClass("primary", "lg", "cursor-pointer sm:hidden")}>
              <Camera className="size-5" aria-hidden="true" /> {u.takePhoto}
              <input type="file" accept="image/*" capture="environment" className="sr-only" disabled={busy} onChange={(e) => add(e.currentTarget.files, false)} />
            </label>
            <label className={buttonClass("secondary", "lg", "cursor-pointer sm:hidden")}>
              <ImagePlus className="size-5" aria-hidden="true" /> {u.choosePhotos}
              <input type="file" multiple accept={ACCEPT} className="sr-only" disabled={busy} onChange={(e) => add(e.currentTarget.files, true)} />
            </label>
            <label className={buttonClass("primary", "lg", "cursor-pointer max-sm:hidden")}>
              <FileUp className="size-5" aria-hidden="true" /> {u.chooseFiles}
              <input data-testid="desktop-file" type="file" multiple accept={ACCEPT} className="sr-only" disabled={busy} onChange={(e) => add(e.currentTarget.files, true)} />
            </label>
          </div>
          <p className="mt-4 hidden text-xs text-ink-3 sm:block">{u.dragHint}</p>
          {preparing ? <p className="mt-3 text-sm font-semibold text-primary" role="status">{u.preparing}</p> : null}
        </div>
      )}
    </form>
  );
}
