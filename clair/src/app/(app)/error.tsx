"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";
import { useT } from "@/i18n/client";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT().errors;
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div role="alert" className="py-16 text-center">
      <h1 className="text-2xl font-extrabold">{t.errorTitle}</h1>
      <p className="mt-2 text-ink-2">{t.errorText}</p>
      {error.digest ? <p className="mt-2 font-mono text-xs text-ink-3">{t.reference} : {error.digest}</p> : null}
      <Button onClick={reset} className="mt-6">{t.retry}</Button>
    </div>
  );
}
