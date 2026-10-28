import Link from "next/link";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui";

export default function ExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="Clair, accueil" className="rounded-lg">
            <Logo className="[&_svg]:size-7 [&>span]:text-lg" />
          </Link>
          <ButtonLink href="/inscription" size="sm">
            Créer un compte gratuit
          </ButtonLink>
        </div>
      </header>
      <main id="contenu" className="mx-auto max-w-4xl px-4 pt-6 pb-16 sm:px-6 lg:pt-10">
        {children}
      </main>
    </div>
  );
}
