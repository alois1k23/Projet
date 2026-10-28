import type { Metadata } from "next";
import { SignupForm } from "../forms";
import { AltSignIn } from "@/components/alt-sign-in";
import { mailEnabled } from "@/lib/mail";
import { signInOptions } from "@/lib/auth/providers";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).auth.createAccount };
}

export default async function SignupPage() {
  const a = (await getT()).auth;
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">{a.signupTitle}</h1>
      <p className="mt-2 mb-8 text-ink-2">{a.signupIntro}</p>
      <div className="space-y-6">
        <SignupForm />
        <AltSignIn mail={mailEnabled()} {...signInOptions()} />
      </div>
    </>
  );
}
