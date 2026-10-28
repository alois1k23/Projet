import type { Metadata } from "next";
import Link from "next/link";
import { peekAuthToken } from "@/lib/auth/tokens";
import { ButtonLink, Notice } from "@/components/ui";
import { ResetPasswordForm } from "../email-forms";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ jeton?: string }> }) {
  const { jeton = "" } = await searchParams;
  const email = await peekAuthToken(jeton, "PASSWORD_RESET");
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Nouveau mot de passe</h1>
      {email ? (
        <>
          <p className="mt-2 mb-8 text-ink-2">Pour le compte {email}.</p>
          <ResetPasswordForm token={jeton} />
        </>
      ) : (
        <div className="mt-6 space-y-5">
          <Notice tone="warning">Ce lien n’est plus valable : il a déjà servi ou il a expiré (une heure).</Notice>
          <ButtonLink href="/mot-de-passe-oublie">Recevoir un nouveau lien</ButtonLink>
          <p className="text-sm">
            <Link href="/connexion" className="font-semibold text-primary hover:underline">Retour à la connexion</Link>
          </p>
        </div>
      )}
    </>
  );
}
