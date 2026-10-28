import type { Metadata } from "next";
import Link from "next/link";
import { Download, LogOut, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getAnalyzer } from "@/lib/ai/analyzer";
import { analysesThisMonth, monthlyAllowance } from "@/lib/documents";
import { logout } from "@/app/actions/auth";
import { Badge, Card, PageHeader, buttonClass } from "@/components/ui";
import { ThemeToggle } from "@/components/client";
import { DeleteAccountForm, ProfileForm } from "./forms";

export const metadata: Metadata = { title: "Réglages" };

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {description ? <p className="mt-1 mb-5 text-sm text-ink-2">{description}</p> : <div className="mb-5" />}
      {children}
    </Card>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();
  const used = await analysesThisMonth(user.id);
  const allowance = monthlyAllowance(user.plan);
  const analyzer = getAnalyzer();

  return (
    <div className="grid animate-rise gap-6">
      <PageHeader title="Réglages" />

      <Section title="Profil" description="Votre nom et votre adresse apparaissent en en-tête des lettres que Clair prépare.">
        <ProfileForm defaults={{ name: user.name ?? "", addressLine: user.addressLine ?? "", postalCode: user.postalCode ?? "", city: user.city ?? "" }} />
      </Section>

      <Section title="Offre">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={user.plan === "PLUS" ? "primary" : "neutral"}>{user.plan === "PLUS" ? "Clair Plus" : "Gratuit"}</Badge>
          {Number.isFinite(allowance) ? (
            <p className="text-sm text-ink-2">
              <span className="tabular font-semibold text-ink">
                {Math.min(used, allowance)} / {allowance}
              </span>{" "}
              analyses automatiques utilisées ce mois-ci. La saisie manuelle et les lettres restent illimitées.
            </p>
          ) : null}
        </div>
        <p className="mt-3 text-sm text-ink-2">Clair Plus (analyses illimitées, partage familial) arrive bientôt. Aucun paiement n’est demandé pendant la bêta.</p>
      </Section>

      <Section title="Apparence">
        <ThemeToggle />
      </Section>

      <Section title="Vos données" description="Vous gardez le contrôle : exportez ou supprimez tout, à tout moment.">
        <ul className="mb-5 space-y-2 text-sm text-ink-2">
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            Vos fichiers sont chiffrés (AES-256) avant d’être stockés.
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            {analyzer?.name === "anthropic"
              ? "Pour l’analyse, le courrier est transmis à Anthropic (Claude), qui ne l’utilise pas pour entraîner ses modèles."
              : "Aucun service d’analyse externe n’est configuré : vos documents ne quittent pas ce serveur."}
          </li>
        </ul>
        <a href="/api/export" className={buttonClass("secondary")}>
          <Download className="size-4" aria-hidden="true" /> Exporter toutes mes données
        </a>
        <p className="mt-2 text-xs text-ink-3">Fichier JSON contenant votre profil, vos courriers (fichiers inclus), vos échéances et vos lettres.</p>
        <p className="mt-4 text-sm">
          <Link href="/confidentialite" className="font-semibold text-primary hover:underline">
            Politique de confidentialité
          </Link>
        </p>
      </Section>

      <Section title="Session">
        <form action={logout}>
          <button type="submit" className={buttonClass("secondary")}>
            <LogOut className="size-4" aria-hidden="true" /> Se déconnecter
          </button>
        </form>
      </Section>

      <Card className="border-danger/30 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-danger">Supprimer mon compte</h2>
        <p className="mt-1 mb-5 text-sm text-ink-2">Votre compte, vos courriers, leurs fichiers, vos échéances et vos lettres seront supprimés immédiatement et définitivement.</p>
        <DeleteAccountForm email={user.email} />
      </Card>
    </div>
  );
}
