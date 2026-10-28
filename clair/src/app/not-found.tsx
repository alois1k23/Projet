import { ButtonLink } from "@/components/ui";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <Logo className="mb-8 justify-center" />
        <h1 className="text-3xl font-extrabold tracking-tight">Page introuvable</h1>
        <p className="mt-2 text-ink-2">Ce lien n’existe pas ou ce courrier a été supprimé.</p>
        <ButtonLink href="/accueil" className="mt-6">Retour à l’accueil</ButtonLink>
      </div>
    </main>
  );
}
