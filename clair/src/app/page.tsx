import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BellRing, Camera, Check, FileStack, Languages, Lock, PenLine, Search, ShieldCheck, Trash2, EyeOff, Eye, Receipt, Clock, Globe2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { ButtonLink, Notice, cx } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/site/chrome";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { getLocale } from "@/i18n/server";
import { siteMessages } from "@/i18n/site";
import { env } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  const s = siteMessages[await getLocale()];
  return { title: { absolute: s.metaTitle }, description: s.metaDescription, alternates: { canonical: "/" } };
}

const FEATURE_ICONS = [Languages, Receipt, BellRing, PenLine, FileStack, Search];
const PROBLEM_ICONS = [EyeOff, Clock, Globe2];
const SECURITY_ICONS = [Lock, ShieldCheck, Trash2, Eye];

export default async function LandingPage({ searchParams }: { searchParams: Promise<{ "compte-supprime"?: string }> }) {
  if (await getCurrentUser()) redirect("/accueil");
  const params = await searchParams;
  const locale = await getLocale();
  const s = siteMessages[locale];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Clair",
        url: env().CLAIR_APP_URL,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        inLanguage: ["fr-CH", "de-CH"],
        description: s.metaDescription,
        offers: { "@type": "Offer", price: "0", priceCurrency: "CHF" },
      },
      {
        "@type": "FAQPage",
        mainEntity: s.faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <main id="contenu" className="mx-auto max-w-5xl px-4 sm:px-6">
        {params["compte-supprime"] ? (
          <div className="mt-6">
            <Notice tone="success">{s.accountDeleted}</Notice>
          </div>
        ) : null}

        {/* Accroche */}
        <section className="grid items-center gap-10 py-12 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-4 text-sm font-bold tracking-[0.08em] text-primary uppercase">{s.hero.eyebrow}</p>
            <h1 className="text-[40px] leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
              {s.hero.titleBefore} <span className="mark">{s.hero.titleMark}</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-2">{s.hero.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/inscription" size="lg">{s.hero.cta}</ButtonLink>
              <ButtonLink href="/exemple" size="lg" variant="secondary">{s.hero.demo}</ButtonLink>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-ink-3">
              <Lock className="size-4 shrink-0" aria-hidden="true" /> {s.hero.reassurance}
            </p>
          </div>

          <div aria-hidden="true" className="relative mx-auto w-full max-w-sm">
            <div className="rotate-[-2deg] rounded-2xl border border-line bg-surface p-5 shadow-card">
              <p className="text-xs font-bold tracking-wider text-ink-3 uppercase">{s.card.sender}</p>
              <p className="mt-2 font-mono text-[11px] leading-relaxed text-ink-3">
                {s.card.original[0]}
                <br />
                {s.card.original[1]}
              </p>
            </div>
            <div className="relative -mt-4 ml-6 rounded-2xl border border-line bg-surface p-5 shadow-card">
              <p className="text-xs font-bold text-primary">{s.card.summaryLabel}</p>
              <p className="mt-1 text-[15px] leading-snug font-semibold">{s.card.summary}</p>
              <p className="mt-3 text-sm">
                <span className="mark font-semibold">{s.card.action}</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">{s.card.chips[0]}</span>
                <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-2">{s.card.chips[1]}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Problème */}
        <section className="pb-16" aria-labelledby="probleme">
          <h2 id="probleme" className="mb-6 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">{s.problem.title}</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {s.problem.items.map((item, i) => {
              const Icon = PROBLEM_ICONS[i] ?? EyeOff;
              return (
                <li key={item.title} className="rounded-[var(--radius-card)] bg-surface-2 p-5">
                  <Icon className="mb-3 size-5 text-ink-2" aria-hidden="true" />
                  <p className="font-bold">{item.title}</p>
                  <p className="mt-1 text-ink-2">{item.text}</p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Comment ça marche */}
        <section className="scroll-mt-20 pb-16" id="comment" aria-labelledby="comment-titre">
          <h2 id="comment-titre" className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">{s.how.title}</h2>
          <ol className="grid gap-6 sm:grid-cols-3">
            {s.how.steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-sm font-extrabold text-bg">{i + 1}</span>
                <span>
                  <span className="block font-bold">{step.title}</span>
                  <span className="mt-1 block text-ink-2">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-8">
            <Link href="/exemple" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
              <Camera className="size-4" aria-hidden="true" /> {s.hero.demo}
            </Link>
          </p>
        </section>

        {/* Fonctions */}
        <section className="scroll-mt-20 pb-16" id="fonctions" aria-labelledby="fonctions-titre">
          <h2 id="fonctions-titre" className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">{s.features.title}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.features.items.map((f, i) => {
              const Icon = FEATURE_ICONS[i] ?? Check;
              return (
                <li key={f.title} className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
                  <span className="mb-4 grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-ink-2">{f.text}</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-card)] bg-ink p-6 text-bg sm:p-8">
            <Languages className="mt-1 size-6 shrink-0" aria-hidden="true" />
            <p className="max-w-2xl text-lg font-semibold">{s.languages}</p>
          </div>
        </section>

        {/* Sécurité */}
        <section className="scroll-mt-20 pb-16" id="securite" aria-labelledby="securite-titre">
          <h2 id="securite-titre" className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">{s.security.title}</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {s.security.items.map((item, i) => {
              const Icon = SECURITY_ICONS[i] ?? ShieldCheck;
              return (
                <li key={item.title} className="flex gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-5">
                  <Icon className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                  <span>
                    <span className="block font-bold">{item.title}</span>
                    <span className="mt-1 block text-ink-2">{item.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-ink-3">{s.security.note}</p>
          <p className="mt-2 text-sm">
            <Link href="/confidentialite" className="font-semibold text-primary hover:underline">{s.security.policy}</Link>
          </p>
        </section>

        {/* Tarifs */}
        <section className="scroll-mt-20 pb-16" id="tarifs" aria-labelledby="tarifs-titre">
          <h2 id="tarifs-titre" className="text-2xl font-extrabold tracking-tight sm:text-3xl">{s.pricing.title}</h2>
          <p className="mt-2 mb-6 text-ink-2">{s.pricing.subtitle}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {([s.pricing.free, s.pricing.plus] as const).map((plan, i) => (
              <div key={plan.name} className={cx("flex flex-col rounded-[var(--radius-card)] border bg-surface p-6 sm:p-8", i === 0 ? "border-primary/50 shadow-card" : "border-line")}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {"badge" in plan ? <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-2">{plan.badge}</span> : null}
                </div>
                <p className="mt-3">
                  <span className="tabular text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className="ml-2 text-sm text-ink-3">{plan.period}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.items.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" /> {item}
                    </li>
                  ))}
                </ul>
                {i === 0 ? (
                  <ButtonLink href="/inscription" className="mt-8 w-full">{plan.cta}</ButtonLink>
                ) : (
                  <ButtonLink href="#liste-attente" variant="secondary" className="mt-8 w-full">{plan.cta}</ButtonLink>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="scroll-mt-20 pb-16" id="questions" aria-labelledby="questions-titre">
          <h2 id="questions-titre" className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">{s.faq.title}</h2>
          <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-surface">
            {s.faq.items.map((f) => (
              <details key={f.q} className="group px-5 py-4 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                  {f.q}
                  <span className="text-xl leading-none text-ink-3 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Liste d'attente */}
        <section className="scroll-mt-20 pb-16" id="liste-attente" aria-labelledby="attente-titre">
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
            <h2 id="attente-titre" className="text-xl font-extrabold tracking-tight">{s.waitlist.title}</h2>
            <p className="mt-1 mb-5 text-ink-2">{s.waitlist.text}</p>
            <WaitlistForm labels={{ email: s.waitlist.email, submit: s.waitlist.submit, sending: s.waitlist.sending }} />
          </div>
        </section>

        {/* Appel final */}
        <section className="mb-16 flex flex-col items-start gap-4 rounded-[var(--radius-card)] bg-primary p-8 text-on-primary sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-2xl font-extrabold tracking-tight text-balance">{s.finalCta.title}</p>
            <p className="mt-1 opacity-90">{s.finalCta.text}</p>
          </div>
          <ButtonLink href="/inscription" variant="secondary" size="lg">{s.finalCta.button}</ButtonLink>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
