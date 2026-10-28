import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";
import { Card } from "@/components/ui";
import { listGuides } from "@/content/guides";
import { getLocale } from "@/i18n/server";
import { siteMessages } from "@/i18n/site";

export async function generateMetadata(): Promise<Metadata> {
  const g = siteMessages[await getLocale()].guides;
  return { title: g.title, description: g.subtitle, alternates: { canonical: "/guides" } };
}

export default async function GuidesPage() {
  const locale = await getLocale();
  const g = siteMessages[locale].guides;
  return (
    <div className="animate-rise">
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight sm:text-4xl">{g.title}</h1>
      <p className="mt-3 text-lg text-ink-2">{g.subtitle}</p>
      <Card className="mt-8">
        <ul className="divide-y divide-line">
          {listGuides(locale).map((guide) => (
            <li key={guide.slug}>
              <Link href={`/guides/${guide.slug}`} className="group flex items-center gap-4 px-5 py-5 hover:bg-surface-2">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary" aria-hidden="true">
                  <BookOpen className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-semibold">{guide.title}</span>
                  <span className="mt-0.5 block text-sm text-ink-2">{guide.description}</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
