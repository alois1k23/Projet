import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth/session";
import { getT } from "@/i18n/server";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect("/accueil");
  const t = await getT();
  return (
    <div className="flex min-h-dvh flex-col px-4 py-8 sm:py-14">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-10 inline-flex rounded-lg" aria-label={t.common.backHomeAria}>
          <Logo />
        </Link>
        {children}
      </div>
      <footer className="mx-auto mt-auto flex w-full max-w-md flex-wrap items-center gap-4 pt-10 text-sm text-ink-3">
        <Link href="/confidentialite" className="hover:text-ink">{t.common.privacy}</Link>
        <Link href="/conditions" className="hover:text-ink">{t.common.terms}</Link>
        <LanguageSwitcher className="ml-auto" />
      </footer>
    </div>
  );
}
