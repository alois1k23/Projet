import type { Metadata } from "next";
import { SignupForm } from "../forms";
import { AltSignIn } from "@/components/alt-sign-in";
import { mailEnabled } from "@/lib/mail";
import { signInOptions } from "@/lib/auth/providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Créer votre compte</h1>
      <p className="mt-2 mb-8 text-ink-2">30 secondes, gratuit, sans carte de crédit. Vos documents sont chiffrés et vous pouvez tout supprimer à tout moment.</p>
      <div className="space-y-6">
        <SignupForm />
        <AltSignIn mail={mailEnabled()} {...signInOptions()} />
      </div>
    </>
  );
}
