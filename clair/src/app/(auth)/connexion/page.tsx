import type { Metadata } from "next";
import { LoginForm } from "../forms";
import { Notice } from "@/components/ui";
import { AltSignIn } from "@/components/alt-sign-in";
import { mailEnabled } from "@/lib/mail";
import { signInOptions } from "@/lib/auth/providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Bon retour</h1>
      <p className="mt-2 mb-8 text-ink-2">Connectez-vous pour retrouver vos courriers et vos échéances.</p>
      <div className="space-y-6">
        {erreur === "google" || erreur === "apple" ? (
          <Notice tone="danger">La connexion avec {erreur === "google" ? "Google" : "Apple"} n’a pas abouti. Réessayez ou utilisez votre adresse e-mail.</Notice>
        ) : null}
        <LoginForm mail={mailEnabled()} />
        <AltSignIn mail={mailEnabled()} {...signInOptions()} />
      </div>
    </>
  );
}
