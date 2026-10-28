import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getAnalyzer } from "@/lib/ai/analyzer";
import { analysesThisMonth, monthlyAllowance } from "@/lib/documents";
import { Notice, PageHeader } from "@/components/ui";
import { SamplePicker } from "@/components/sample-picker";
import { UploadForm } from "./upload-form";

export const metadata: Metadata = { title: "Ajouter un courrier" };

export default async function NewDocumentPage() {
  const user = await requireUser();
  const analyzer = getAnalyzer();
  const used = await analysesThisMonth(user.id);
  const allowance = monthlyAllowance(user.plan);
  const remaining = Math.max(0, allowance - used);

  return (
    <div className="mx-auto max-w-xl animate-rise">
      <PageHeader title="Ajouter un courrier" subtitle="Clair lit le courrier, l’explique en français et repère ce que vous devez faire." />
      <div className="space-y-4">
        {!analyzer ? (
          <Notice tone="warning" title="Analyse automatique indisponible">
            L’analyse par IA n’est pas configurée sur ce serveur. Votre courrier sera enregistré et chiffré, et vous saisirez vous-même le montant et l’échéance.
          </Notice>
        ) : Number.isFinite(allowance) ? (
          <p className="text-sm text-ink-2">
            <span className="tabular font-semibold text-ink">{remaining}</span> analyse{remaining > 1 ? "s" : ""} automatique{remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""} ce mois-ci avec l’offre gratuite.
          </p>
        ) : null}
        <UploadForm aiEnabled={!!analyzer && remaining > 0} />
        <p className="flex items-start gap-2 text-xs text-ink-3">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Le fichier est chiffré avant d’être stocké. Pour l’analyse, il est transmis au service d’IA d’Anthropic, qui ne l’utilise pas pour entraîner ses modèles. Détails dans la politique de confidentialité.
        </p>
        <div className="border-t border-line pt-6">
          <SamplePicker />
        </div>
      </div>
    </div>
  );
}
