import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { SAMPLES } from "@/lib/samples";
import { Card } from "@/components/ui";
import { getLocale, getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.example.metaTitle, description: t.example.metaDescription };
}

export default async function ExamplesPage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return (
    <div className="animate-rise">
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">{t.example.title}</h1>
      <p className="mt-3 max-w-xl text-lg text-ink-2">{t.example.intro}</p>
      <Card className="mt-8">
        <ul className="divide-y divide-line">
          {SAMPLES.map((s) => (
            <li key={s.id}>
              <Link href={`/exemple/${s.id}`} className="group flex items-center gap-4 px-5 py-5 hover:bg-surface-2">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary" aria-hidden="true">
                  <FileText className="size-5" />
                </span>
                <span className="min-w-0 flex-1 text-lg font-semibold">{s.label[locale]}</span>
                <ChevronRight className="size-5 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
