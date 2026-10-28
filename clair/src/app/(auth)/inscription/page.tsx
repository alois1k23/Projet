import type { Metadata } from "next";
import { SignupForm } from "../forms";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Créer votre compte</h1>
      <p className="mt-2 mb-8 text-ink-2">Gratuit, sans carte de crédit. Vos documents sont chiffrés et vous pouvez tout supprimer à tout moment.</p>
      <SignupForm />
    </>
  );
}
