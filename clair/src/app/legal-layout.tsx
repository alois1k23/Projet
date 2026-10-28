import Link from "next/link";
import { Logo } from "@/components/logo";
import { Notice } from "@/components/ui";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-10 inline-flex rounded-lg" aria-label="Clair, retour à l’accueil">
          <Logo />
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-ink-3">Dernière mise à jour : {updated}</p>
        <div className="mt-6">
          <Notice tone="warning">Version de travail pour la bêta. Ce texte doit être relu par un juriste avant tout lancement public.</Notice>
        </div>
        <article className="mt-8 space-y-6 leading-relaxed text-ink-2 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
          {children}
        </article>
      </div>
    </div>
  );
}
