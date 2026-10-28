import Link from "next/link";
import { redirect } from "next/navigation";
import { BellRing, Camera, Languages, Lock, PenLine } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Logo } from "@/components/logo";
import { ButtonLink, Notice } from "@/components/ui";

const FEATURES = [
  { icon: Camera, title: "Comprendre", text: "Photographiez un courrier. Clair explique en français simple ce qu’il signifie, même s’il est en allemand." },
  { icon: BellRing, title: "Ne rien oublier", text: "Montants, échéances et délais sont repérés et rangés dans votre échéancier, avec export vers votre agenda." },
  { icon: PenLine, title: "Répondre", text: "Résiliation, contestation, demande de délai : la lettre est préparée, il ne reste qu’à la signer." },
];

export default async function LandingPage({ searchParams }: { searchParams: Promise<{ "compte-supprime"?: string }> }) {
  if (await getCurrentUser()) redirect("/accueil");
  const params = await searchParams;
  return (
    <div className="px-4 sm:px-6">
      <header className="mx-auto flex h-20 max-w-5xl items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/connexion" className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-2 hover:text-ink">
            Se connecter
          </Link>
          <ButtonLink href="/inscription" size="sm">
            Créer un compte
          </ButtonLink>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl">
        {params["compte-supprime"] ? (
          <div className="mt-4">
            <Notice tone="success">Votre compte et toutes vos données ont été supprimés.</Notice>
          </div>
        ) : null}
        <section className="grid items-center gap-10 py-12 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-4 text-sm font-bold tracking-[0.08em] text-primary uppercase">Pour les ménages en Suisse</p>
            <h1 className="text-[40px] leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
              Votre courrier administratif, <span className="mark">enfin clair</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-2">
              Photographiez un courrier : Clair vous dit ce qu’il signifie, ce que vous devez faire et avant quand. Puis il vous aide à le faire.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/inscription" size="lg">
                Essayer gratuitement
              </ButtonLink>
              <ButtonLink href="/connexion" size="lg" variant="secondary">
                J’ai déjà un compte
              </ButtonLink>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-ink-3">
              <Lock className="size-4" aria-hidden="true" /> Documents chiffrés · suppression à tout moment
            </p>
          </div>

          <div aria-hidden="true" className="relative mx-auto w-full max-w-sm">
            <div className="rotate-[-2deg] rounded-2xl border border-line bg-surface p-5 shadow-card">
              <p className="text-xs font-bold tracking-wider text-ink-3 uppercase">Krankenkasse Beispiel AG</p>
              <p className="mt-2 font-mono text-[11px] leading-relaxed text-ink-3">
                Ihre Prämie 2027 · Grundversicherung KVG
                <br />
                Monatliche Prämie ab 1. Januar: CHF 438.20
              </p>
            </div>
            <div className="relative -mt-4 ml-6 rounded-2xl border border-line bg-surface p-5 shadow-card">
              <p className="text-xs font-bold text-primary">En bref</p>
              <p className="mt-1 text-[15px] leading-snug font-semibold">Votre prime passe à CHF 438.20 par mois, soit CHF 289.20 de plus par an.</p>
              <p className="mt-3 text-sm">
                <span className="mark font-semibold">Pour changer de caisse : résiliation avant fin novembre.</span>
              </p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">Comparer les primes</span>
                <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-2">Lettre de résiliation</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-16 sm:grid-cols-3" aria-label="Ce que fait Clair">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
              <span className="mb-4 grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="mt-1.5 text-ink-2">{text}</p>
            </div>
          ))}
        </section>

        <section className="mb-16 flex flex-col items-start gap-4 rounded-[var(--radius-card)] bg-ink p-8 text-bg sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Languages className="mt-1 size-6 shrink-0" aria-hidden="true" />
            <p className="max-w-xl text-lg font-semibold">Courriers en français, allemand, italien ou anglais : l’explication est toujours en français.</p>
          </div>
          <ButtonLink href="/inscription" variant="secondary">
            Commencer
          </ButtonLink>
        </section>
      </main>

      <footer className="mx-auto flex max-w-5xl flex-wrap gap-x-6 gap-y-2 border-t border-line py-8 text-sm text-ink-3">
        <span>© {new Date().getFullYear()} Clair · version bêta</span>
        <Link href="/confidentialite" className="hover:text-ink">Confidentialité</Link>
        <Link href="/conditions" className="hover:text-ink">Conditions d’utilisation</Link>
      </footer>
    </div>
  );
}
