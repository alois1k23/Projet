import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, ExternalLink } from "lucide-react";
import { ButtonLink, Notice } from "@/components/ui";
import { getGuide, GUIDES_CHECKED_AT } from "@/content/guides";
import { getLocale } from "@/i18n/server";
import { INTL_LOCALE } from "@/i18n/config";
import { siteMessages } from "@/i18n/site";
import { formatDate } from "@/lib/format";
import { parseIsoDate } from "@/lib/ai/schema";
import { appUrl } from "@/lib/env";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = getGuide((await params).slug, await getLocale());
  if (!guide) return {};
  return { title: guide.title, description: guide.description, alternates: { canonical: `/guides/${guide.slug}` }, openGraph: { title: guide.title, description: guide.description, type: "article" } };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getLocale();
  const guide = getGuide((await params).slug, locale);
  if (!guide) notFound();
  const g = siteMessages[locale].guides;
  const checked = formatDate(parseIsoDate(GUIDES_CHECKED_AT)!, locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    inLanguage: INTL_LOCALE[locale],
    dateModified: GUIDES_CHECKED_AT,
    mainEntityOfPage: `${appUrl()}/guides/${guide.slug}`,
    publisher: { "@type": "Organization", name: "Clair" },
  };

  return (
    <article className="animate-rise">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link href="/guides" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> {g.back}
      </Link>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">{guide.title}</h1>
      <p className="mt-2 text-sm text-ink-3">{g.updated(checked)}</p>
      <p className="mt-6 text-lg leading-relaxed">{guide.intro}</p>

      <div className="mt-8 space-y-8 leading-relaxed text-ink-2">
        {guide.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-3 text-xl font-bold text-ink">{section.heading}</h2>
            {section.paragraphs?.map((p) => (
              <p key={p} className="mb-3">{p}</p>
            ))}
            {section.list ? (
              <ul className="space-y-2">
                {section.list.map((item) => (
                  <li key={item} className="ml-5 list-disc">{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <div className="mt-8">
        <Notice tone="warning">{g.disclaimer}</Notice>
      </div>

      <section className="mt-8" aria-labelledby="sources">
        <h2 id="sources" className="mb-2 text-sm font-bold tracking-[0.08em] text-ink-3 uppercase">{g.sources}</h2>
        <ul className="space-y-1.5 text-sm">
          {guide.sources.map((src) => (
            <li key={src.url}>
              <a href={src.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-primary hover:underline">
                <ExternalLink className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> {src.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-[var(--radius-card)] bg-ink p-6 text-bg sm:p-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-balance">{g.ctaTitle}</h2>
        <p className="mt-2 max-w-xl opacity-80">{g.ctaText}</p>
        <ButtonLink href="/inscription" variant="secondary" size="lg" className="mt-6">
          <Camera className="size-5" aria-hidden="true" /> {g.ctaButton}
        </ButtonLink>
      </section>
    </article>
  );
}
