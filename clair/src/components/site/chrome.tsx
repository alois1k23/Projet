import Link from "next/link";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getLocale, getT } from "@/i18n/server";
import { siteMessages } from "@/i18n/site";

/** En-tête des pages publiques (présentation, guides, exemples, pages légales). */
export async function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const s = siteMessages[locale];
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" aria-label={t.common.backHomeAria} className="rounded-lg">
          <Logo className="[&_svg]:size-7 [&>span]:text-lg" />
        </Link>
        <nav aria-label={s.nav.menu} className="hidden items-center gap-1 text-sm font-semibold text-ink-2 md:flex">
          <Link href="/#comment" className="rounded-lg px-3 py-2 hover:text-ink">{s.nav.how}</Link>
          <Link href="/#tarifs" className="rounded-lg px-3 py-2 hover:text-ink">{s.nav.pricing}</Link>
          <Link href="/#questions" className="rounded-lg px-3 py-2 hover:text-ink">{s.nav.faq}</Link>
          <Link href="/guides" className="rounded-lg px-3 py-2 hover:text-ink">{s.nav.guides}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {signedIn ? (
            <ButtonLink href="/accueil" size="sm">{t.nav.home}</ButtonLink>
          ) : (
            <>
              <Link href="/connexion" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-ink-2 hover:text-ink sm:inline-flex">
                {s.nav.login}
              </Link>
              <ButtonLink href="/inscription" size="sm">{s.nav.signup}</ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const s = siteMessages[locale];
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 text-sm sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
        <div>
          <Logo />
          <p className="mt-3 text-ink-2">{s.footer.tagline}</p>
          <p className="mt-1 text-ink-3">{s.footer.madeIn} · {s.footer.beta}</p>
          <LanguageSwitcher className="mt-4" />
        </div>
        <div>
          <p className="mb-2 font-bold">{s.footer.product}</p>
          <ul className="space-y-1.5 text-ink-2">
            <li><Link href="/exemple" className="hover:text-ink">{s.hero.demo}</Link></li>
            <li><Link href="/#tarifs" className="hover:text-ink">{s.nav.pricing}</Link></li>
            <li><Link href="/guides" className="hover:text-ink">{s.nav.guides}</Link></li>
            <li><Link href="/connexion" className="hover:text-ink">{s.nav.login}</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-bold">{s.footer.legal}</p>
          <ul className="space-y-1.5 text-ink-2">
            <li><Link href="/confidentialite" className="hover:text-ink">{t.settings.privacyPolicy}</Link></li>
            <li><Link href="/conditions" className="hover:text-ink">{t.common.termsLong}</Link></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-5xl px-4 pb-8 text-xs text-ink-3 sm:px-6">© {new Date().getFullYear()} Clair</p>
    </footer>
  );
}
