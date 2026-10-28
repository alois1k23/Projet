import type { Metadata } from "next";
import Link from "next/link";
import { mailEnabled } from "@/lib/mail";
import { Notice } from "@/components/ui";
import { LoginLinkForm } from "../../email-forms";

export const metadata: Metadata = { title: "Connexion par e-mail" };

export default function LoginLinkPage() {
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Connexion sans mot de passe</h1>
      <p className="mt-2 mb-8 text-ink-2">Recevez un lien par e-mail : un clic et vous êtes connecté. Pas encore de compte ? Il sera créé.</p>
      {mailEnabled() ? <LoginLinkForm /> : <Notice tone="warning">L’envoi d’e-mails n’est pas encore configuré sur ce serveur.</Notice>}
      <p className="mt-6 text-center text-sm text-ink-2">
        <Link href="/connexion" className="font-semibold text-primary hover:underline">
          Utiliser mon mot de passe
        </Link>
      </p>
    </>
  );
}
