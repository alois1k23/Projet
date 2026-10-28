import type { Metadata } from "next";
import { peekAuthToken } from "@/lib/auth/tokens";
import { ButtonLink, Notice } from "@/components/ui";
import { ConfirmLoginForm } from "../../email-forms";

export const metadata: Metadata = { title: "Confirmer la connexion" };

export default async function VerifyLoginPage({ searchParams }: { searchParams: Promise<{ jeton?: string }> }) {
  const { jeton = "" } = await searchParams;
  const email = await peekAuthToken(jeton, "LOGIN");
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Connexion à Clair</h1>
      {email ? (
        <>
          <p className="mt-2 mb-8 text-ink-2">Vous allez vous connecter avec {email}.</p>
          <ConfirmLoginForm token={jeton} />
        </>
      ) : (
        <div className="mt-6 space-y-5">
          <Notice tone="warning">Ce lien n’est plus valable : il a déjà servi ou il a expiré (15 minutes).</Notice>
          <ButtonLink href="/connexion/lien">Recevoir un nouveau lien</ButtonLink>
        </div>
      )}
    </>
  );
}
