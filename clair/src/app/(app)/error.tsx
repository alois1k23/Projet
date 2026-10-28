"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div role="alert" className="py-16 text-center">
      <h1 className="text-2xl font-extrabold">Quelque chose s’est mal passé</h1>
      <p className="mt-2 text-ink-2">Vos données ne sont pas perdues. Réessayez ; si le problème continue, revenez dans quelques minutes.</p>
      {error.digest ? <p className="mt-2 font-mono text-xs text-ink-3">Référence : {error.digest}</p> : null}
      <Button onClick={reset} className="mt-6">Réessayer</Button>
    </div>
  );
}
