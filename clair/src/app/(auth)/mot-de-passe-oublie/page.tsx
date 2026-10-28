import type { Metadata } from "next";
import Link from "next/link";
import { mailEnabled } from "@/lib/mail";
import { Notice } from "@/components/ui";
import { ForgotPasswordForm } from "../email-forms";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Mot de passe oublié</h1>
      <p className="mt-2 mb-8 text-ink-2">Indiquez votre adresse : nous vous envoyons un lien pour en choisir un nouveau.</p>
      {mailEnabled() ? <ForgotPasswordForm /> : <Notice tone="warning">L’envoi d’e-mails n’est pas encore configuré sur ce serveur.</Notice>}
      <p className="mt-6 text-center text-sm text-ink-2">
        <Link href="/connexion" className="font-semibold text-primary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </>
  );
}
