import Link from "next/link";
import { LogOut } from "lucide-react";
import { BottomNav, SideNav } from "@/components/client";
import { Logo } from "@/components/logo";
import { requireUser } from "@/lib/auth/session";
import { getAnalyzer } from "@/lib/ai/analyzer";
import { logout } from "@/app/actions/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const analyzer = getAnalyzer();
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <a href="#contenu" className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Aller au contenu
      </a>
      <div className="hidden border-r border-line bg-surface lg:block">
        <aside className="sticky top-0 flex h-dvh flex-col px-4 py-6">
          <Link href="/accueil" className="mb-8 inline-flex rounded-lg px-2" aria-label="Clair, accueil">
            <Logo />
          </Link>
          <SideNav />
          <div className="mt-auto border-t border-line pt-4">
            {user.name ? <p className="truncate px-3 text-sm font-semibold">{user.name}</p> : null}
            <p className="truncate px-3 text-xs text-ink-3">{user.email}</p>
            <form action={logout} className="mt-2">
              <button type="submit" className="flex h-9 w-full items-center gap-2 rounded-xl px-3 text-sm font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink">
                <LogOut className="size-4" aria-hidden="true" /> Se déconnecter
              </button>
            </form>
          </div>
        </aside>
      </div>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur lg:hidden" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          <Link href="/accueil" aria-label="Clair, accueil" className="rounded-lg">
            <Logo className="[&_svg]:size-7 [&>span]:text-lg" />
          </Link>
        </header>
        {analyzer?.name === "mock" ? (
          <div className="border-b border-warning/30 bg-warning-soft px-4 py-2 text-center text-xs font-semibold text-warning" role="status">
            Mode test : les analyses sont simulées et ne lisent pas réellement vos documents.
          </div>
        ) : null}
        <main id="contenu" className="mx-auto w-full max-w-4xl px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
