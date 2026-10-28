import { Sparkles } from "lucide-react";
import { startDemo } from "@/app/actions/demo";
import { SubmitButton } from "@/components/client";
import { demoEnabled } from "@/lib/demo";
import { getT } from "@/i18n/server";

/** Bouton « Essayer la démo ». N'apparaît que si le mode démo est activé sur le serveur. */
export async function DemoButton({ size = "lg", variant = "primary", hint = true, className }: { size?: "md" | "lg"; variant?: "primary" | "secondary"; hint?: boolean; className?: string }) {
  if (!demoEnabled()) return null;
  const d = (await getT()).demo;
  return (
    <form action={startDemo} className={className}>
      <SubmitButton size={size} variant={variant} pendingLabel={d.starting} className="w-full sm:w-auto">
        <Sparkles className="size-5" aria-hidden="true" /> {d.start}
      </SubmitButton>
      {hint ? <p className="mt-2 max-w-md text-sm text-ink-3">{d.hint}</p> : null}
    </form>
  );
}
