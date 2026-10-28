import type { Metadata } from "next";
import { LoginForm } from "../forms";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Bon retour</h1>
      <p className="mt-2 mb-8 text-ink-2">Connectez-vous pour retrouver vos courriers et vos échéances.</p>
      <LoginForm />
    </>
  );
}
