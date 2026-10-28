import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getAnalyzer } from "@/lib/ai/analyzer";
import { analysesThisMonth, monthlyAllowance } from "@/lib/documents";
import { Notice, PageHeader } from "@/components/ui";
import { SamplePicker } from "@/components/sample-picker";
import { UploadForm } from "./upload-form";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).upload.title };
}

export default async function NewDocumentPage() {
  const user = await requireUser();
  const analyzer = getAnalyzer();
  const used = await analysesThisMonth(user.id);
  const allowance = monthlyAllowance(user.plan);
  const remaining = Math.max(0, allowance - used);
  const t = await getT();
  const u = t.upload;

  return (
    <div className="mx-auto max-w-xl animate-rise">
      <PageHeader title={u.title} subtitle={u.intro} />
      <div className="space-y-4">
        {!analyzer ? (
          <Notice tone="warning" title={u.aiUnavailableTitle}>
            {u.aiUnavailable}
          </Notice>
        ) : Number.isFinite(allowance) ? (
          <p className="text-sm text-ink-2">
            {u.remaining(remaining)}
          </p>
        ) : null}
        <UploadForm aiEnabled={!!analyzer && remaining > 0} />
        <p className="flex items-start gap-2 text-xs text-ink-3">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {analyzer?.name === "mock" ? t.demo.privacySimulated : u.privacy}
        </p>
        <div className="border-t border-line pt-6">
          <SamplePicker />
        </div>
      </div>
    </div>
  );
}
