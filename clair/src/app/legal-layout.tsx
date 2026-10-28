import { Notice } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/site/chrome";
import { getCurrentUser } from "@/lib/auth/session";
import { getLocale } from "@/i18n/server";

const TEXT = {
  fr: { updated: "Dernière mise à jour :", draft: "Version de travail pour la bêta. Ce texte doit être relu par un juriste avant tout lancement public." },
  en: {
    updated: "Last updated:",
    draft: "Working version for the beta. This text must be reviewed by a lawyer before any public launch. In case of discrepancy, the French version prevails.",
  },
  de: {
    updated: "Letzte Aktualisierung:",
    draft: "Arbeitsversion für die Beta. Dieser Text muss vor dem öffentlichen Start juristisch geprüft werden. Bei Abweichungen gilt die französische Fassung.",
  },
};

export async function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const t = TEXT[locale];
  return (
    <div className="min-h-dvh">
      <SiteHeader signedIn={!!user} />
      <main id="contenu" className="px-4 py-8 sm:px-6 lg:py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-ink-3">
            {t.updated} {updated}
          </p>
          <div className="mt-6">
            <Notice tone="warning">{t.draft}</Notice>
          </div>
          <article className="mt-8 space-y-6 leading-relaxed text-ink-2 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
            {children}
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
